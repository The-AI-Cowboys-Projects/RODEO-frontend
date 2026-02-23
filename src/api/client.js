import axios from "axios";
import {
    showErrorToast,
    showWarningToast,
    showInfoToast,
} from "../components/ui/Toast";

// Use empty baseURL to let Vite proxy handle routing to backend
const API_URL = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 60000, // 60 second timeout
});

// CSRF token management
let csrfToken = null;
let csrfTokenExpiry = null;
let csrfTokenPromise = null;

const getCSRFToken = async () => {
    // Check if we have a valid cached token (with 5-min buffer before expiry)
    if (csrfToken && csrfTokenExpiry && Date.now() < csrfTokenExpiry) {
        return csrfToken;
    }

    // If a fetch is already in-flight, reuse it (prevents parallel fetches)
    if (csrfTokenPromise) {
        return csrfTokenPromise;
    }

    csrfTokenPromise = (async () => {
        try {
            const response = await axios.get("/auth/csrf-token");
            csrfToken = response.data.csrf_token;
            // Set expiry to 55 minutes (before server's 60-minute expiry)
            csrfTokenExpiry = Date.now() + 55 * 60 * 1000;
            return csrfToken;
        } catch (error) {
            console.error("Failed to fetch CSRF token:", error);
            return null;
        } finally {
            csrfTokenPromise = null;
        }
    })();

    return csrfTokenPromise;
};

const clearCSRFToken = () => {
    csrfToken = null;
    csrfTokenExpiry = null;
};

// Add JWT token and CSRF token to requests
apiClient.interceptors.request.use(async (config) => {
    // Add JWT bearer token
    const jwtToken = localStorage.getItem("rodeo_token");
    if (jwtToken) {
        config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    // Add CSRF token for state-changing requests
    if (
        ["post", "put", "delete", "patch"].includes(
            config.method?.toLowerCase(),
        )
    ) {
        const csrf = await getCSRFToken();
        if (csrf) {
            config.headers["X-CSRF-Token"] = csrf;
        }
    }

    return config;
});

// Handle response errors with user-friendly notifications
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Network errors (no response)
        if (!error.response) {
            if (
                error.code === "ECONNABORTED" ||
                error.message?.includes("timeout")
            ) {
                showErrorToast(
                    "Request timed out. Please check your connection and try again.",
                    {
                        title: "Connection Timeout",
                        duration: 6000,
                    },
                );
            } else if (error.code === "ERR_NETWORK") {
                showErrorToast(
                    "Unable to connect to the server. Please check if the backend is running.",
                    {
                        title: "Network Error",
                        duration: 8000,
                        action: {
                            label: "Retry",
                            onClick: () => window.location.reload(),
                        },
                    },
                );
            }
            return Promise.reject(error);
        }

        const status = error.response.status;
        const errorMessage =
            error.response?.data?.detail || error.response?.data?.message || "";

        switch (status) {
            case 401:
                // Unauthorized - clear token and redirect to login
                showInfoToast(
                    "Your session has expired. Please log in again.",
                    {
                        title: "Session Expired",
                        duration: 4000,
                    },
                );
                localStorage.removeItem("rodeo_token");
                // Small delay to let the toast show before redirect
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);
                break;

            case 403:
                // Forbidden - might be CSRF token issue or permission denied
                if (errorMessage.toLowerCase().includes("csrf")) {
                    // Use per-request retry flag to prevent infinite loops
                    if (!error.config._csrfRetried) {
                        console.warn(
                            "CSRF token validation failed, fetching fresh token and retrying",
                        );
                        clearCSRFToken();
                        const newToken = await getCSRFToken();
                        if (newToken) {
                            error.config._csrfRetried = true;
                            error.config.headers["X-CSRF-Token"] = newToken;
                            return apiClient.request(error.config);
                        }
                    }

                    // If retry also failed, show error
                    showWarningToast(
                        "Security token expired. Please try your action again.",
                        {
                            title: "Security Token Error",
                        },
                    );
                } else {
                    showErrorToast(
                        errorMessage ||
                            "You do not have permission to perform this action.",
                        {
                            title: "Access Denied",
                        },
                    );
                }
                break;

            case 404:
                // Only show toast for API calls, not for static resources
                if (error.config?.url?.startsWith("/api")) {
                    showErrorToast(
                        errorMessage || "The requested resource was not found.",
                        {
                            title: "Not Found",
                        },
                    );
                }
                break;

            case 422:
                // Validation error
                showErrorToast(
                    errorMessage || "Please check your input and try again.",
                    {
                        title: "Validation Error",
                    },
                );
                break;

            case 429:
                // Rate limited
                const retryAfter = error.response.headers["retry-after"];
                showWarningToast(
                    `Too many requests. ${retryAfter ? `Please wait ${retryAfter} seconds.` : "Please slow down."}`,
                    {
                        title: "Rate Limited",
                        duration: 8000,
                    },
                );
                break;

            case 500:
            case 502:
            case 503:
            case 504:
                showErrorToast(
                    "The server encountered an error. Our team has been notified.",
                    {
                        title: "Server Error",
                        duration: 6000,
                        action: {
                            label: "Report Issue",
                            onClick: () => {
                                // Could open a support dialog or email
                                console.log(
                                    "User wants to report issue:",
                                    error,
                                );
                            },
                        },
                    },
                );
                break;

            default:
                // Generic error for other status codes
                if (status >= 400) {
                    showErrorToast(
                        errorMessage || "An unexpected error occurred.",
                        {
                            title: `Error ${status}`,
                        },
                    );
                }
        }

        return Promise.reject(error);
    },
);

export const auth = {
    login: async (username, password) => {
        console.log("[AUTH] Login attempt for user:", username);
        console.log("[AUTH] Sending request to: /auth/login");

        try {
            const response = await apiClient.post("/auth/login", {
                username,
                password,
            });
            console.log("[AUTH] Login successful! Response:", response.data);
            return response.data;
        } catch (error) {
            console.error("[AUTH] Login failed!");
            console.error("[AUTH] Error status:", error.response?.status);
            console.error("[AUTH] Error data:", error.response?.data);
            console.error("[AUTH] Error headers:", error.response?.headers);
            console.error("[AUTH] Full error:", error);
            throw error;
        }
    },
};

export const samples = {
    list: async (limit = 100, offset = 0) => {
        const response = await apiClient.get(
            `/api/samples?limit=${limit}&offset=${offset}`,
        );
        return response.data;
    },
    getHighRisk: async (threshold = 0.7) => {
        const response = await apiClient.get(
            `/api/samples/high-risk?threshold=${threshold}`,
        );
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/samples/${id}`);
        return response.data;
    },
};

export const vulnerabilities = {
    list: async () => {
        const response = await apiClient.get("/api/vulnerabilities");
        return response.data;
    },
    getCritical: async () => {
        const response = await apiClient.get("/api/vulnerabilities/critical");
        return response.data;
    },
};

export const patches = {
    list: async () => {
        const response = await apiClient.get("/api/patches");
        return response.data;
    },
};

export const stats = {
    overview: async () => {
        const response = await apiClient.get("/api/stats/overview");
        return response.data;
    },
};

export const networkAnalytics = {
    status: async () => {
        const response = await apiClient.get("/api/network-analytics/status");
        return response.data;
    },
    metrics: async (timeRangeMinutes = 60) => {
        const response = await apiClient.get("/api/network-analytics/metrics", {
            params: { time_range_minutes: timeRangeMinutes },
        });
        return response.data;
    },
    alerts: async (timeRangeMinutes = 60, severity = null) => {
        const response = await apiClient.get("/api/network-analytics/alerts", {
            params: {
                time_range_minutes: timeRangeMinutes,
                ...(severity && { severity }),
            },
        });
        return response.data;
    },
    flows: async (timeRangeMinutes = 60, limit = 100) => {
        const response = await apiClient.get("/api/network-analytics/flows", {
            params: {
                time_range_minutes: timeRangeMinutes,
                limit,
            },
        });
        return response.data;
    },
    summary: async () => {
        const response = await apiClient.get("/api/network-analytics/summary");
        return response.data;
    },
    geoThreats: async (live = false) => {
        const response = await apiClient.get(
            "/api/network-analytics/geo-threats",
            {
                params: { live },
            },
        );
        return response.data;
    },
};

export const policy = {
    get: async () => {
        const response = await apiClient.get("/api/policy");
        return response.data;
    },
    reload: async () => {
        const response = await apiClient.post("/api/policy/reload");
        return response.data;
    },
};

export const autonomous = {
    getStatus: async () => {
        const response = await apiClient.get("/api/autonomous/agent/status");
        return response.data;
    },
    start: async () => {
        const response = await apiClient.post("/api/autonomous/agent/start");
        return response.data;
    },
    stop: async () => {
        const response = await apiClient.post("/api/autonomous/agent/stop");
        return response.data;
    },
    updateConfig: async (config) => {
        const response = await apiClient.put(
            "/api/autonomous/agent/config",
            config,
        );
        return response.data;
    },
    getPendingActions: async () => {
        const response = await apiClient.get("/api/autonomous/actions/pending");
        return response.data;
    },
    getActionHistory: async (limit = 100) => {
        const response = await apiClient.get(
            `/api/autonomous/actions/history?limit=${limit}`,
        );
        return response.data;
    },
    approveAction: async (actionId, approved, approvedBy) => {
        const response = await apiClient.post(
            "/api/autonomous/actions/approve",
            {
                action_id: actionId,
                approved,
                approved_by: approvedBy,
            },
        );
        return response.data;
    },
    getStatistics: async () => {
        const response = await apiClient.get("/api/autonomous/statistics");
        return response.data;
    },
    // Scheduler endpoints
    startScheduler: async () => {
        const response = await apiClient.post(
            "/api/autonomous/scheduler/start",
        );
        return response.data;
    },
    stopScheduler: async () => {
        const response = await apiClient.post("/api/autonomous/scheduler/stop");
        return response.data;
    },
    getSchedulerStatus: async () => {
        const response = await apiClient.get(
            "/api/autonomous/scheduler/status",
        );
        return response.data;
    },
};

export const edr = {
    getStatus: async () => {
        const response = await apiClient.get("/api/edr/status");
        return response.data;
    },
    getEndpoints: async () => {
        const response = await apiClient.get("/api/edr/endpoints");
        return response.data;
    },
    getDetections: async () => {
        const response = await apiClient.get("/api/edr/detections");
        return response.data;
    },
    getCorrelationStats: async () => {
        const response = await apiClient.get("/api/edr/correlation/stats");
        return response.data;
    },
    isolateEndpoint: async (endpointId, platform) => {
        const response = await apiClient.post(
            `/api/edr/endpoints/${endpointId}/isolate`,
            { platform },
        );
        return response.data;
    },
    unisolateEndpoint: async (endpointId, platform) => {
        const response = await apiClient.post(
            `/api/edr/endpoints/${endpointId}/unisolate`,
            { platform },
        );
        return response.data;
    },
    huntIOC: async (ioc, iocType) => {
        const response = await apiClient.post("/api/edr/hunt/ioc", {
            ioc,
            ioc_type: iocType,
        });
        return response.data;
    },
    getHuntQueries: async () => {
        const response = await apiClient.get("/api/edr/hunt/queries");
        return response.data;
    },
    getSigmaRules: async () => {
        const response = await apiClient.get("/api/edr/hunt/sigma-rules");
        return response.data;
    },
    getMitreTactics: async () => {
        const response = await apiClient.get("/api/edr/mitre/tactics");
        return response.data;
    },
    getMitreTechniques: async () => {
        const response = await apiClient.get("/api/edr/mitre/techniques");
        return response.data;
    },
    getMitreCoverage: async () => {
        const response = await apiClient.get("/api/edr/mitre/coverage");
        return response.data;
    },
    getMitreTechniqueDetails: async (techniqueId) => {
        const response = await apiClient.get(
            `/api/edr/mitre/technique/${techniqueId}`,
        );
        return response.data;
    },
    getMitreTacticCoverage: async (tacticName) => {
        const response = await apiClient.get(
            `/api/edr/mitre/tactic/${tacticName}/coverage`,
        );
        return response.data;
    },
    getMitreNavigatorLayer: async () => {
        const response = await apiClient.get("/api/edr/mitre/navigator/layer");
        return response.data;
    },
    getMitreScores: async () => {
        const response = await apiClient.get("/api/edr/mitre/scores");
        return response.data;
    },
    getRemoteAccessGraph: async (timeRangeDays = 7, platform = null) => {
        const params = { time_range_days: timeRangeDays };
        if (platform) params.platform = platform;
        const response = await apiClient.get(
            "/api/edr/identity/remote-access-graph",
            { params },
        );
        return response.data;
    },
    getUserActivity: async (user = null, host = null, limit = 100) => {
        const params = { limit };
        if (user) params.user = user;
        if (host) params.host = host;
        const response = await apiClient.get(
            "/api/edr/identity/user-activity",
            { params },
        );
        return response.data;
    },
};

export const users = {
    getCurrentUser: async () => {
        const response = await apiClient.get("/api/users/me");
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await apiClient.put("/api/users/me", data);
        return response.data;
    },
    changePassword: async (currentPassword, newPassword) => {
        const response = await apiClient.post("/api/users/me/change-password", {
            current_password: currentPassword,
            new_password: newPassword,
        });
        return response.data;
    },
    list: async () => {
        const response = await apiClient.get("/api/users");
        return { users: Array.isArray(response.data) ? response.data : [] };
    },
    create: async (userData) => {
        const response = await apiClient.post("/api/users", userData);
        return response.data;
    },
    get: async (userId) => {
        const response = await apiClient.get(`/api/users/${userId}`);
        return response.data;
    },
    update: async (userId, data) => {
        const response = await apiClient.put(`/api/users/${userId}`, data);
        return response.data;
    },
    delete: async (userId) => {
        const response = await apiClient.delete(`/api/users/${userId}`);
        return response.data;
    },
    assignRole: async (userId, roleName) => {
        const response = await apiClient.post(`/api/users/${userId}/roles`, {
            role_name: roleName,
        });
        return response.data;
    },
    revokeRole: async (userId, role) => {
        const response = await apiClient.delete(
            `/api/users/${userId}/roles/${role}`,
        );
        return response.data;
    },
    getPermissions: async (userId) => {
        const response = await apiClient.get(
            `/api/users/${userId}/permissions`,
        );
        return response.data;
    },
    getRoles: async () => {
        const response = await apiClient.get("/api/users/roles/");
        return response.data;
    },
    createRole: async (roleData) => {
        const response = await apiClient.post("/api/users/roles/", roleData);
        return response.data;
    },
    getAllPermissions: async () => {
        const response = await apiClient.get("/api/users/permissions/");
        return response.data;
    },
    // Aliases used by UserManagement.jsx
    getById: async (userId) => {
        const response = await apiClient.get(`/api/users/${userId}`);
        return response.data;
    },
    listRoles: async () => {
        const response = await apiClient.get("/api/users/roles/");
        return { roles: Array.isArray(response.data) ? response.data : [] };
    },
    listPermissions: async () => {
        const response = await apiClient.get("/api/users/permissions/");
        return {
            permissions: Array.isArray(response.data) ? response.data : [],
        };
    },
};

export const approvals = {
    getQueue: async () => {
        const response = await apiClient.get("/api/actions/approval-queue");
        return response.data;
    },
    approve: async (actionId, reason = "") => {
        const response = await apiClient.post(
            `/api/actions/${actionId}/approve`,
            { reason },
        );
        return response.data;
    },
    reject: async (actionId, reason = "") => {
        const response = await apiClient.post(
            `/api/actions/${actionId}/reject`,
            { reason },
        );
        return response.data;
    },
    getRecent: async (limit = 50) => {
        const response = await apiClient.get(
            `/api/actions/history?limit=${limit}`,
        );
        return response.data;
    },
    getConfig: async () => {
        const response = await apiClient.get("/api/actions/config");
        return response.data;
    },
    updateConfig: async (config) => {
        const response = await apiClient.put("/api/actions/config", config);
        return response.data;
    },
    getStatus: async () => {
        const response = await apiClient.get("/api/actions/status");
        return response.data;
    },
};

export const pipeline = {
    getStatus: async () => {
        const response = await apiClient.get("/api/pipeline/status");
        return response.data;
    },
    getFlow: async (limit = 50) => {
        const response = await apiClient.get(
            `/api/pipeline/flow?limit=${limit}`,
        );
        return response.data;
    },
    getStats: async () => {
        const response = await apiClient.get("/api/pipeline/stats");
        return response.data;
    },
    getTimeline: async (limit = 100, eventType = null, severity = null) => {
        const params = { limit };
        if (eventType) params.event_type = eventType;
        if (severity) params.severity = severity;
        const response = await apiClient.get("/api/pipeline/timeline", {
            params,
        });
        return response.data;
    },
};

export const bugBounty = {
    getStats: async () => {
        const response = await apiClient.get("/arsenal/bugbounty/stats");
        return response;
    },
    getScans: async () => {
        const response = await apiClient.get("/arsenal/bugbounty/scans");
        return response;
    },
    getFindings: async () => {
        const response = await apiClient.get("/arsenal/bugbounty/findings");
        return response;
    },
    getReports: async () => {
        const response = await apiClient.get("/arsenal/bugbounty/reports");
        return response;
    },
    startScan: async (config) => {
        const response = await apiClient.post(
            "/arsenal/bugbounty/scans",
            config,
        );
        return response.data;
    },
    stopScan: async (scanId) => {
        const response = await apiClient.post(
            `/arsenal/bugbounty/scans/${scanId}/stop`,
        );
        return response.data;
    },
    syncPrograms: async (platform) => {
        const response = await apiClient.post(
            "/arsenal/bugbounty/programs/sync",
            { platform },
        );
        return response.data;
    },
    submitFinding: async (findingId) => {
        const response = await apiClient.post(
            "/arsenal/bugbounty/findings/submit",
            { finding_id: findingId },
        );
        return response.data;
    },
    downloadReport: async (reportId) => {
        const response = await apiClient.get(
            `/arsenal/bugbounty/reports/${reportId}`,
        );
        return response.data;
    },
};

export const patchDeployment = {
    getStatus: async () => {
        const response = await apiClient.get("/api/patches/deployment/status");
        return response.data;
    },
    getHosts: async () => {
        const response = await apiClient.get("/api/patches/deployment/hosts");
        return response.data;
    },
    getHistory: async () => {
        const response = await apiClient.get("/api/patches/deployment/history");
        return response.data;
    },
    getStats: async () => {
        const response = await apiClient.get("/api/patches/deployment/stats");
        return response.data;
    },
    getAlgorithms: async () => {
        const response = await apiClient.get(
            "/api/patches/deployment/algorithms",
        );
        return response.data;
    },
    registerHost: async (host) => {
        const response = await apiClient.post(
            "/api/patches/deployment/hosts",
            host,
        );
        return response.data;
    },
    selectCanaries: async (metadata, options = {}) => {
        const response = await apiClient.post(
            "/api/patches/deployment/canaries",
            { metadata, ...options },
        );
        return response.data;
    },
    deploy: async (plan, options = {}) => {
        const response = await apiClient.post(
            "/api/patches/deployment/deploy",
            { plan, ...options },
        );
        return response.data;
    },
};

export const arsenal = {
    getToolStatus: async () => {
        const response = await apiClient.get("/arsenal/tools/status");
        return response.data;
    },
    detectTechnologies: async (target) => {
        const response = await apiClient.post("/arsenal/recon/detect", {
            target,
        });
        return response.data;
    },
    getAttackChain: async (technologies, scanType = "full") => {
        const response = await apiClient.post("/arsenal/attack-chain", {
            technologies,
            scan_type: scanType,
        });
        return response.data;
    },
    executeTool: async (toolId, target, options = {}) => {
        const response = await apiClient.post(
            `/arsenal/tools/${toolId}/execute`,
            { target, options },
        );
        return response.data;
    },
    executeAttackChain: async (chainId, target, options = {}) => {
        const response = await apiClient.post(
            `/arsenal/attack-chain/${chainId}/execute`,
            { target, options },
        );
        return response.data;
    },
    getScanHistory: async (limit = 20) => {
        const response = await apiClient.get(`/arsenal/scans?limit=${limit}`);
        return response.data;
    },
    getScanStats: async () => {
        const response = await apiClient.get("/arsenal/scans/stats");
        return response.data;
    },
    getScanById: async (scanId) => {
        const response = await apiClient.get(`/arsenal/scans/${scanId}`);
        return response.data;
    },
    runTrivyScan: async (target, options = {}) => {
        const response = await apiClient.post("/arsenal/scan/trivy", {
            target,
            ...options,
        });
        return response.data;
    },
    runPortScan: async (target, options = {}) => {
        const response = await apiClient.post("/arsenal/scan/ports", {
            target,
            ...options,
        });
        return response.data;
    },
};

// --- Autonomous Pipeline Namespaces ---

export const playbooks = {
    getStatus: async () => {
        const response = await apiClient.get("/api/playbooks/status");
        return response.data;
    },
    list: async () => {
        const response = await apiClient.get("/api/playbooks");
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/api/playbooks/${id}`);
        return response.data;
    },
    enable: async (id) => {
        const response = await apiClient.post(`/api/playbooks/${id}/enable`);
        return response.data;
    },
    disable: async (id) => {
        const response = await apiClient.post(`/api/playbooks/${id}/disable`);
        return response.data;
    },
    getExecutions: async (limit = 20) => {
        const response = await apiClient.get(`/api/playbooks/executions?limit=${limit}`);
        return response.data;
    },
    getExecution: async (id) => {
        const response = await apiClient.get(`/api/playbooks/executions/${id}`);
        return response.data;
    },
    trigger: async (id, data) => {
        const response = await apiClient.post(`/api/playbooks/${id}/trigger`, data);
        return response.data;
    },
};

export const watchers = {
    getStatus: async () => {
        const response = await apiClient.get("/api/watchers/status");
        return response.data;
    },
    startAll: async () => {
        const response = await apiClient.post("/api/watchers/start");
        return response.data;
    },
    stopAll: async () => {
        const response = await apiClient.post("/api/watchers/stop");
        return response.data;
    },
    startWatcher: async (name) => {
        const response = await apiClient.post(`/api/watchers/${name}/start`);
        return response.data;
    },
    stopWatcher: async (name) => {
        const response = await apiClient.post(`/api/watchers/${name}/stop`);
        return response.data;
    },
    pauseWatcher: async (name) => {
        const response = await apiClient.post(`/api/watchers/${name}/pause`);
        return response.data;
    },
    resumeWatcher: async (name) => {
        const response = await apiClient.post(`/api/watchers/${name}/resume`);
        return response.data;
    },
    ingestLogs: async (lines) => {
        const response = await apiClient.post("/api/watchers/log/ingest", { lines });
        return response.data;
    },
};

export const feedback = {
    getStatus: async () => {
        const response = await apiClient.get("/api/feedback/status");
        return response.data;
    },
    getActionEffectiveness: async () => {
        const response = await apiClient.get("/api/feedback/effectiveness/actions");
        return response.data;
    },
    getPlaybookEffectiveness: async () => {
        const response = await apiClient.get("/api/feedback/effectiveness/playbooks");
        return response.data;
    },
    getOutcomes: async (limit = 20) => {
        const response = await apiClient.get(`/api/feedback/outcomes?limit=${limit}`);
        return response.data;
    },
    getIncidents: async (limit = 20) => {
        const response = await apiClient.get(`/api/feedback/incidents?limit=${limit}`);
        return response.data;
    },
    getIncident: async (id) => {
        const response = await apiClient.get(`/api/feedback/incidents/${id}`);
        return response.data;
    },
    getMultipliers: async () => {
        const response = await apiClient.get("/api/feedback/multipliers");
        return response.data;
    },
    getRecommendations: async () => {
        const response = await apiClient.get("/api/feedback/recommendations");
        return response.data;
    },
    assessOutcome: async (actionId, data) => {
        const response = await apiClient.post(`/api/feedback/outcomes/${actionId}/assess`, data);
        return response.data;
    },
    autoAssess: async () => {
        const response = await apiClient.post("/api/feedback/auto-assess");
        return response.data;
    },
};

export const knowledge = {
    getStatus: async () => {
        const response = await apiClient.get("/api/knowledge/status");
        return response.data;
    },
    search: async (q, topK = 5, docType = null, tag = null) => {
        const params = { q, top_k: topK };
        if (docType) params.doc_type = docType;
        if (tag) params.tag = tag;
        const response = await apiClient.get("/api/knowledge/search", { params });
        return response.data;
    },
    listDocuments: async (docType = null, limit = 50, offset = 0) => {
        const params = { limit, offset };
        if (docType) params.doc_type = docType;
        const response = await apiClient.get("/api/knowledge/documents", { params });
        return response.data;
    },
    getDocument: async (id) => {
        const response = await apiClient.get(`/api/knowledge/documents/${id}`);
        return response.data;
    },
    deleteDocument: async (id) => {
        const response = await apiClient.delete(`/api/knowledge/documents/${id}`);
        return response.data;
    },
    getTags: async () => {
        const response = await apiClient.get("/api/knowledge/tags");
        return response.data;
    },
    ingest: async (data) => {
        const response = await apiClient.post("/api/knowledge/ingest", data);
        return response.data;
    },
    ingestAnalystNote: async (data) => {
        const response = await apiClient.post("/api/knowledge/ingest/analyst-note", data);
        return response.data;
    },
    ingestIncident: async (data) => {
        const response = await apiClient.post("/api/knowledge/ingest/incident", data);
        return response.data;
    },
    getContext: async (data) => {
        const response = await apiClient.post("/api/knowledge/context", data);
        return response.data;
    },
    uploadDocument: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post("/api/knowledge/ingest/document", formData);
        return response.data;
    },
    confirmDocument: async (data) => {
        const response = await apiClient.post("/api/knowledge/ingest/document/confirm", data);
        return response.data;
    },
};

export const threatIntel = {
    getConfig: async () => {
        const response = await apiClient.get("/api/threat-intel/config");
        return response.data;
    },
    saveConfig: async (data) => {
        const response = await apiClient.post("/api/threat-intel/config", data);
        return response.data;
    },
    testConnection: async () => {
        const response = await apiClient.post("/api/threat-intel/test-connection");
        return response.data;
    },
    lookup: async (hash) => {
        const response = await apiClient.post("/api/threat-intel/lookup", { hash });
        return response.data;
    },
    deleteConfig: async () => {
        const response = await apiClient.delete("/api/threat-intel/config");
        return response.data;
    },
};

export const logAnomaly = {
    getStatus: async () => {
        const response = await apiClient.get("/log-anomaly/status");
        return response.data;
    },
    analyzeBatch: async (logs, source = null) => {
        const response = await apiClient.post("/log-anomaly/analyze", { logs, source });
        return response.data;
    },
    analyzeSingle: async (logLine, source = null) => {
        const response = await apiClient.post("/log-anomaly/analyze/single", { log_line: logLine, source });
        return response.data;
    },
    startTraining: async (data) => {
        const response = await apiClient.post("/log-anomaly/train", data);
        return response.data;
    },
    getTrainingStatus: async () => {
        const response = await apiClient.get("/log-anomaly/train/status");
        return response.data;
    },
    updateRuleConfig: async (config) => {
        const response = await apiClient.post("/log-anomaly/rules/config", config);
        return response.data;
    },
    getRuleConfig: async () => {
        const response = await apiClient.get("/log-anomaly/rules/config");
        return response.data;
    },
    getAnomalyTypes: async () => {
        const response = await apiClient.get("/log-anomaly/anomaly-types");
        return response.data;
    },
};

export default apiClient;
