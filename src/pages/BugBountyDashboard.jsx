import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import { bugBounty } from "../api/client";
import {
    BugAntIcon,
    ViewfinderCircleIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    FunnelIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PlayIcon,
    PauseIcon,
    StopIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    ArrowUpTrayIcon,
    MagnifyingGlassIcon,
    CogIcon,
    BoltIcon,
    ArrowTrendingUpIcon,
    ChartBarIcon,
    GlobeAltIcon,
    DocumentTextIcon,
    PaperAirplaneIcon,
    ArrowTopRightOnSquareIcon,
    ClipboardIcon,
    TrashIcon,
    PencilIcon,
    PlusIcon,
    ServerIcon,
    LinkIcon,
    BellIcon,
    ChartPieIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    TrophyIcon,
    SignalIcon,
    CpuChipIcon,
    Squares2X2Icon,
    ChevronRightIcon,
    ArrowUpRightIcon,
    ArrowDownRightIcon,
    EllipsisVerticalIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RePieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";

// ==================== CSS Animations ====================
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes scan-line {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.6; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes pulse-ring {
    0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
    70% { box-shadow: 0 0 0 12px rgba(236, 72, 153, 0); }
    100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
  }
  @keyframes float-gentle {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 15px rgba(236, 72, 153, 0.3); }
    50% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.5); }
  }
  @keyframes border-gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes count-up {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-scan-line { animation: scan-line 2.5s ease-in-out infinite; }
  .animate-pulse-ring { animation: pulse-ring 1.5s infinite; }
  .animate-float { animation: float-gentle 3s ease-in-out infinite; }
  .animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
  .animate-border-gradient {
    background: linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4, #ec4899);
    background-size: 300% 300%;
    animation: border-gradient 3s ease infinite;
  }
  .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
  .animate-count { animation: count-up 0.3s ease-out forwards; }
  .bb-grid-bg {
    background-image:
      linear-gradient(rgba(236, 72, 153, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(236, 72, 153, 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .finding-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  .stat-glow:hover {
    box-shadow: 0 0 40px rgba(236, 72, 153, 0.15);
  }
`;
if (!document.querySelector("#bugbounty-animations")) {
    styleTag.id = "bugbounty-animations";
    document.head.appendChild(styleTag);
}

// ==================== Severity Badge ====================
function SeverityBadge({ severity, size = "md" }) {
    const colors = {
        critical: "bg-red-500/20 text-red-400 border-red-500/30",
        high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        info: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
    };
    return (
        <span
            className={`inline-flex items-center font-medium rounded-full border ${colors[severity] || colors.info} ${sizes[size]}`}
        >
            {severity?.toUpperCase()}
        </span>
    );
}

// ==================== Status Badge ====================
function StatusBadge({ status }) {
    const config = {
        running: {
            color: "bg-green-500/20 text-green-400 border-green-500/30",
            icon: PlayIcon,
            pulse: true,
        },
        completed: {
            color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            icon: CheckCircleIcon,
            pulse: false,
        },
        stopped: {
            color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
            icon: StopIcon,
            pulse: false,
        },
        error: {
            color: "bg-red-500/20 text-red-400 border-red-500/30",
            icon: XCircleIcon,
            pulse: false,
        },
        pending: {
            color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
            icon: ClockIcon,
            pulse: true,
        },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full border ${cfg.color}`}
        >
            <Icon
                className={`w-3.5 h-3.5 ${cfg.pulse ? "animate-pulse" : ""}`}
            />
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </span>
    );
}

// ==================== Stat Card ====================
function StatCard({
    icon: Icon,
    label,
    value,
    trend,
    trendUp,
    color = "pink",
    onClick,
    isDarkMode,
}) {
    const gradients = {
        pink: "from-pink-500 to-rose-500",
        purple: "from-purple-500 to-indigo-500",
        cyan: "from-cyan-500 to-blue-500",
        orange: "from-orange-500 to-amber-500",
        green: "from-green-500 to-emerald-500",
        red: "from-red-500 to-pink-500",
    };
    return (
        <div
            onClick={onClick}
            className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 stat-glow cursor-pointer
        ${
            isDarkMode
                ? "bg-gray-800/50 border border-gray-700/50 hover:border-pink-500/30"
                : "bg-white border border-gray-200 hover:border-pink-300"
        }`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p
                        className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                        {label}
                    </p>
                    <p
                        className={`mt-2 text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        {value}
                    </p>
                    {trend !== undefined && (
                        <div
                            className={`mt-2 flex items-center gap-1 text-sm ${trendUp ? "text-green-400" : "text-red-400"}`}
                        >
                            {trendUp ? (
                                <ArrowUpRightIcon className="w-4 h-4" />
                            ) : (
                                <ArrowDownRightIcon className="w-4 h-4" />
                            )}
                            <span>{trend}% vs last week</span>
                        </div>
                    )}
                </div>
                <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg`}
                >
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            {/* Decorative gradient line */}
            <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[color]} opacity-50`}
            />
        </div>
    );
}

// ==================== Finding Card ====================
function FindingCard({ finding, onView, onSubmit, isDarkMode }) {
    return (
        <div
            className={`finding-card p-5 rounded-xl border transition-all duration-200
      ${
          isDarkMode
              ? "bg-gray-800/50 border-gray-700/50 hover:border-pink-500/30"
              : "bg-white border-gray-200 hover:border-pink-300"
      }`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <SeverityBadge severity={finding.severity} size="sm" />
                        <span
                            className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                            {new Date(
                                finding.discovered_at,
                            ).toLocaleDateString()}
                        </span>
                    </div>
                    <h4
                        className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        {finding.title}
                    </h4>
                    <p
                        className={`mt-1 text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                        {finding.target}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <span
                            className={`px-2 py-0.5 text-xs rounded-md ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                        >
                            {finding.vulnerability_type}
                        </span>
                        {finding.cvss_score > 0 && (
                            <span
                                className={`px-2 py-0.5 text-xs rounded-md ${isDarkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"}`}
                            >
                                CVSS: {finding.cvss_score}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onView(finding)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                        title="View details"
                    >
                        <EyeIcon
                            className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                    </button>
                    {!finding.submitted && (
                        <button
                            onClick={() => onSubmit(finding)}
                            className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
                            title="Submit to platform"
                        >
                            <PaperAirplaneIcon className="w-4 h-4 text-pink-400" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================== Scan Card ====================
function ScanCard({ scan, onStop, onView, isDarkMode }) {
    const progress = scan.progress || 0;
    return (
        <div
            className={`p-5 rounded-xl border transition-all duration-200
      ${
          isDarkMode
              ? "bg-gray-800/50 border-gray-700/50"
              : "bg-white border-gray-200"
      }`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={scan.status} />
                        {scan.profile && (
                            <span
                                className={`px-2 py-0.5 text-xs rounded-md ${isDarkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-600"}`}
                            >
                                {scan.profile}
                            </span>
                        )}
                    </div>
                    <h4
                        className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        {scan.target}
                    </h4>
                    <p
                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                        Started {new Date(scan.started_at).toLocaleTimeString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    {scan.status === "running" && (
                        <button
                            onClick={() => onStop(scan.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                            title="Stop scan"
                        >
                            <StopIcon className="w-4 h-4 text-red-400" />
                        </button>
                    )}
                    <button
                        onClick={() => onView(scan)}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                        title="View details"
                    >
                        <EyeIcon
                            className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                    </button>
                </div>
            </div>

            {scan.status === "running" && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span
                            className={
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                            }
                        >
                            Progress
                        </span>
                        <span
                            className={
                                isDarkMode ? "text-white" : "text-gray-900"
                            }
                        >
                            {progress}%
                        </span>
                    </div>
                    <div
                        className={`h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}
                    >
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs">
                        <span
                            className={
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                            }
                        >
                            Findings: {scan.findings_count || 0}
                        </span>
                        <span
                            className={
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                            }
                        >
                            Elapsed: {scan.elapsed || "0:00"}
                        </span>
                    </div>
                </div>
            )}

            {scan.status === "completed" && (
                <div className="flex items-center gap-4 mt-2 pt-3 border-t border-gray-700/30">
                    <div className="flex items-center gap-1.5">
                        <BugAntIcon className="w-4 h-4 text-pink-400" />
                        <span
                            className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                        >
                            {scan.findings_count || 0} findings
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4 text-cyan-400" />
                        <span
                            className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                        >
                            {scan.duration || "0:00"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== New Scan Modal ====================
function NewScanModal({ isOpen, onClose, onSubmit, isDarkMode }) {
    const [target, setTarget] = useState("");
    const [profile, setProfile] = useState("quick");
    const [program, setProgram] = useState("");
    const [notifications, setNotifications] = useState(false);

    const profiles = [
        {
            id: "quick",
            name: "Quick Scan",
            desc: "30 min, high-impact vulns",
            icon: BoltIcon,
        },
        {
            id: "deep",
            name: "Deep Scan",
            desc: "4 hours, comprehensive",
            icon: MagnifyingGlassIcon,
        },
        {
            id: "stealth",
            name: "Stealth Mode",
            desc: "8 hours, low and slow",
            icon: ShieldCheckIcon,
        },
        {
            id: "cicd",
            name: "CI/CD",
            desc: "10 min, pipeline optimized",
            icon: CpuChipIcon,
        },
        {
            id: "api",
            name: "API Testing",
            desc: "1 hour, REST/GraphQL",
            icon: GlobeAltIcon,
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className={`w-full max-w-lg mx-4 rounded-2xl shadow-2xl animate-slide-up
        ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <h3
                        className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        Start New Scan
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                    >
                        <XMarkIcon
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Target URL */}
                    <div>
                        <label
                            className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                            Target URL
                        </label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="https://example.com"
                            className={`w-full px-4 py-3 rounded-xl border transition-colors
                ${
                    isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-pink-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-pink-500"
                }`}
                        />
                    </div>

                    {/* Scan Profile */}
                    <div>
                        <label
                            className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                            Scan Profile
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {profiles.map((p) => {
                                const Icon = p.icon;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setProfile(p.id)}
                                        className={`p-3 rounded-xl border text-left transition-all
                      ${
                          profile === p.id
                              ? "border-pink-500 bg-pink-500/10"
                              : isDarkMode
                                ? "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon
                                                className={`w-4 h-4 ${profile === p.id ? "text-pink-400" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                                            />
                                            <span
                                                className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                            >
                                                {p.name}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                        >
                                            {p.desc}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Program Name */}
                    <div>
                        <label
                            className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                            Program Name (optional)
                        </label>
                        <input
                            type="text"
                            value={program}
                            onChange={(e) => setProgram(e.target.value)}
                            placeholder="bug-bounty-program"
                            className={`w-full px-4 py-3 rounded-xl border transition-colors
                ${
                    isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-pink-500"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-pink-500"
                }`}
                        />
                    </div>

                    {/* Notifications toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                Enable Notifications
                            </p>
                            <p
                                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            >
                                Get alerts for new findings
                            </p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-7 rounded-full transition-colors relative
                ${notifications ? "bg-pink-500" : isDarkMode ? "bg-gray-700" : "bg-gray-300"}`}
                        >
                            <span
                                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow
                ${notifications ? "left-6" : "left-1"}`}
                            />
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-700/50">
                    <button
                        onClick={onClose}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors
              ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() =>
                            onSubmit({
                                target,
                                profile,
                                program,
                                notifications,
                            })
                        }
                        disabled={!target}
                        className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white
              hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Start Scan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==================== Finding Detail Modal ====================
function FindingDetailModal({
    finding,
    isOpen,
    onClose,
    onSubmit,
    isDarkMode,
}) {
    if (!isOpen || !finding) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
            <div
                className={`w-full max-w-2xl mx-4 rounded-2xl shadow-2xl animate-slide-up
        ${isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <SeverityBadge severity={finding.severity} />
                        <h3
                            className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Finding Details
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
                    >
                        <XMarkIcon
                            className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    <div>
                        <h4
                            className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            {finding.title}
                        </h4>
                        <p
                            className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                            Discovered:{" "}
                            {new Date(finding.discovered_at).toLocaleString()}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}`}
                        >
                            <p
                                className={`text-xs font-medium mb-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                            >
                                Target
                            </p>
                            <p
                                className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                {finding.target}
                            </p>
                        </div>
                        <div
                            className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}`}
                        >
                            <p
                                className={`text-xs font-medium mb-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                            >
                                Type
                            </p>
                            <p
                                className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                            >
                                {finding.vulnerability_type}
                            </p>
                        </div>
                        {finding.cvss_score > 0 && (
                            <div
                                className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}`}
                            >
                                <p
                                    className={`text-xs font-medium mb-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                >
                                    CVSS Score
                                </p>
                                <p
                                    className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                >
                                    {finding.cvss_score}
                                </p>
                            </div>
                        )}
                        {finding.cve_id && (
                            <div
                                className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}`}
                            >
                                <p
                                    className={`text-xs font-medium mb-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                >
                                    CVE
                                </p>
                                <p
                                    className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                >
                                    {finding.cve_id}
                                </p>
                            </div>
                        )}
                    </div>

                    {finding.url && (
                        <div>
                            <p
                                className={`text-xs font-medium mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                            >
                                Affected URL
                            </p>
                            <div
                                className={`p-3 rounded-xl font-mono text-sm break-all ${isDarkMode ? "bg-gray-800 text-cyan-400" : "bg-gray-100 text-cyan-600"}`}
                            >
                                {finding.url}
                            </div>
                        </div>
                    )}

                    {finding.description && (
                        <div>
                            <p
                                className={`text-xs font-medium mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                            >
                                Description
                            </p>
                            <p
                                className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                            >
                                {finding.description}
                            </p>
                        </div>
                    )}

                    {finding.evidence && (
                        <div>
                            <p
                                className={`text-xs font-medium mb-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                            >
                                Evidence
                            </p>
                            <pre
                                className={`p-4 rounded-xl text-xs overflow-x-auto ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                            >
                                {finding.evidence}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-6 border-t border-gray-700/50">
                    <button
                        onClick={onClose}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors
              ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(
                                JSON.stringify(finding, null, 2),
                            );
                        }}
                        className={`px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2
              ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                        <ClipboardIcon className="w-4 h-4" />
                        Copy
                    </button>
                    {!finding.submitted && (
                        <button
                            onClick={() => onSubmit(finding)}
                            className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white
                hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                        >
                            <PaperAirplaneIcon className="w-4 h-4" />
                            Submit to Platform
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================== Overview Tab ====================
function OverviewTab({
    stats,
    recentFindings,
    activeScans,
    onViewFinding,
    onStartScan,
    isDarkMode,
}) {
    // Chart data
    const severityData = [
        {
            name: "Critical",
            value: stats?.by_severity?.critical || 0,
            color: "#ef4444",
        },
        {
            name: "High",
            value: stats?.by_severity?.high || 0,
            color: "#f97316",
        },
        {
            name: "Medium",
            value: stats?.by_severity?.medium || 0,
            color: "#eab308",
        },
        { name: "Low", value: stats?.by_severity?.low || 0, color: "#3b82f6" },
        {
            name: "Info",
            value: stats?.by_severity?.info || 0,
            color: "#6b7280",
        },
    ].filter((d) => d.value > 0);

    const weeklyData = stats?.weekly_trend || [
        { day: "Mon", findings: 3 },
        { day: "Tue", findings: 7 },
        { day: "Wed", findings: 5 },
        { day: "Thu", findings: 12 },
        { day: "Fri", findings: 8 },
        { day: "Sat", findings: 4 },
        { day: "Sun", findings: 6 },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={BugAntIcon}
                    label="Total Findings"
                    value={stats?.total_findings || 0}
                    trend={stats?.findings_trend}
                    trendUp={stats?.findings_trend > 0}
                    color="pink"
                    isDarkMode={isDarkMode}
                />
                <StatCard
                    icon={ExclamationTriangleIcon}
                    label="Critical/High"
                    value={
                        (stats?.by_severity?.critical || 0) +
                        (stats?.by_severity?.high || 0)
                    }
                    color="red"
                    isDarkMode={isDarkMode}
                />
                <StatCard
                    icon={ViewfinderCircleIcon}
                    label="Active Scans"
                    value={activeScans?.length || 0}
                    color="cyan"
                    isDarkMode={isDarkMode}
                />
                <StatCard
                    icon={CurrencyDollarIcon}
                    label="Est. Bounty"
                    value={`$${stats?.estimated_bounty?.toLocaleString() || 0}`}
                    trend={12}
                    trendUp={true}
                    color="green"
                    isDarkMode={isDarkMode}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Severity Distribution */}
                <div
                    className={`p-6 rounded-2xl border ${isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}
                >
                    <h3
                        className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        Severity Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode
                                            ? "#1f2937"
                                            : "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.15)",
                                    }}
                                />
                                <Legend />
                            </RePieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Trend */}
                <div
                    className={`p-6 rounded-2xl border ${isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}
                >
                    <h3
                        className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        Weekly Findings Trend
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient
                                        id="findingsGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#ec4899"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#ec4899"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                                />
                                <XAxis
                                    dataKey="day"
                                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                />
                                <YAxis
                                    stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode
                                            ? "#1f2937"
                                            : "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="findings"
                                    stroke="#ec4899"
                                    strokeWidth={2}
                                    fill="url(#findingsGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Active Scans & Recent Findings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Scans */}
                <div
                    className={`p-6 rounded-2xl border ${isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3
                            className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Active Scans
                        </h3>
                        <button
                            onClick={onStartScan}
                            className="px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors flex items-center gap-1.5 text-sm font-medium"
                        >
                            <PlusIcon className="w-4 h-4" />
                            New Scan
                        </button>
                    </div>
                    {activeScans?.length > 0 ? (
                        <div className="space-y-3">
                            {activeScans.slice(0, 3).map((scan) => (
                                <ScanCard
                                    key={scan.id}
                                    scan={scan}
                                    isDarkMode={isDarkMode}
                                    onView={() => {}}
                                    onStop={() => {}}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className={`text-center py-8 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                            <SignalIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No active scans</p>
                            <button
                                onClick={onStartScan}
                                className="mt-3 text-pink-400 hover:text-pink-300 text-sm font-medium"
                            >
                                Start your first scan
                            </button>
                        </div>
                    )}
                </div>

                {/* Recent Findings */}
                <div
                    className={`p-6 rounded-2xl border ${isDarkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"}`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3
                            className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            Recent Findings
                        </h3>
                        <span
                            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                            Last 24 hours
                        </span>
                    </div>
                    {recentFindings?.length > 0 ? (
                        <div className="space-y-3">
                            {recentFindings.slice(0, 4).map((finding) => (
                                <FindingCard
                                    key={finding.id}
                                    finding={finding}
                                    onView={onViewFinding}
                                    onSubmit={() => {}}
                                    isDarkMode={isDarkMode}
                                />
                            ))}
                        </div>
                    ) : (
                        <div
                            className={`text-center py-8 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                        >
                            <BugAntIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No findings yet</p>
                            <p className="text-sm mt-1">
                                Start scanning to discover vulnerabilities
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================== Scans Tab ====================
function ScansTab({ scans, onStartScan, onStopScan, onViewScan, isDarkMode }) {
    const [filter, setFilter] = useState("all");

    const filteredScans =
        scans?.filter((s) => {
            if (filter === "all") return true;
            return s.status === filter;
        }) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors
              ${
                  filter === "all"
                      ? "bg-pink-500 text-white"
                      : isDarkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("running")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
              ${
                  filter === "running"
                      ? "bg-green-500 text-white"
                      : isDarkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        Running
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
              ${
                  filter === "completed"
                      ? "bg-blue-500 text-white"
                      : isDarkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        Completed
                    </button>
                </div>
                <button
                    onClick={onStartScan}
                    className="px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white
            hover:from-pink-600 hover:to-purple-600 transition-all flex items-center gap-2"
                >
                    <PlayIcon className="w-4 h-4" />
                    New Scan
                </button>
            </div>

            {/* Scans Grid */}
            {filteredScans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredScans.map((scan) => (
                        <ScanCard
                            key={scan.id}
                            scan={scan}
                            onStop={onStopScan}
                            onView={onViewScan}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </div>
            ) : (
                <div
                    className={`text-center py-16 rounded-2xl border ${isDarkMode ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-50 border-gray-200"}`}
                >
                    <SignalIcon
                        className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`}
                    />
                    <h3
                        className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        No scans found
                    </h3>
                    <p
                        className={`mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                        {filter === "all"
                            ? "Start your first vulnerability scan"
                            : `No ${filter} scans`}
                    </p>
                    {filter === "all" && (
                        <button
                            onClick={onStartScan}
                            className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white
                hover:from-pink-600 hover:to-purple-600 transition-all inline-flex items-center gap-2"
                        >
                            <PlayIcon className="w-5 h-5" />
                            Start Scanning
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ==================== Findings Tab ====================
function FindingsTab({ findings, onViewFinding, onSubmitFinding, isDarkMode }) {
    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [programFilter, setProgramFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date");

    // Get unique programs from findings
    const programs = [
        ...new Set(findings?.map((f) => f.program).filter(Boolean) || []),
    ];

    const filteredFindings =
        findings
            ?.filter((f) => {
                const matchesSearch =
                    !search ||
                    f.title?.toLowerCase().includes(search.toLowerCase()) ||
                    f.target?.toLowerCase().includes(search.toLowerCase()) ||
                    f.program?.toLowerCase().includes(search.toLowerCase());
                const matchesSeverity =
                    severityFilter === "all" || f.severity === severityFilter;
                const matchesProgram =
                    programFilter === "all" || f.program === programFilter;
                return matchesSearch && matchesSeverity && matchesProgram;
            })
            .sort((a, b) => {
                if (sortBy === "date") {
                    const dateA = new Date(
                        b.discovered_at || b.created_at || 0,
                    );
                    const dateB = new Date(
                        a.discovered_at || a.created_at || 0,
                    );
                    return dateA - dateB;
                }
                if (sortBy === "severity") {
                    const order = {
                        critical: 0,
                        high: 1,
                        medium: 2,
                        low: 3,
                        info: 4,
                    };
                    return (order[a.severity] || 5) - (order[b.severity] || 5);
                }
                if (sortBy === "program") {
                    return (a.program || "").localeCompare(b.program || "");
                }
                if (sortBy === "priority") {
                    return (b.priority_score || 0) - (a.priority_score || 0);
                }
                return 0;
            }) || [];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                    <MagnifyingGlassIcon
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search findings..."
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors
              ${
                  isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-pink-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-pink-500"
              }`}
                    />
                </div>

                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border transition-colors
            ${
                isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
            }`}
                >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="info">Info</option>
                </select>

                {programs.length > 0 && (
                    <select
                        value={programFilter}
                        onChange={(e) => setProgramFilter(e.target.value)}
                        className={`px-4 py-2.5 rounded-xl border transition-colors
              ${
                  isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-200 text-gray-900"
              }`}
                    >
                        <option value="all">All Programs</option>
                        {programs.map((prog) => (
                            <option key={prog} value={prog}>
                                {prog}
                            </option>
                        ))}
                    </select>
                )}

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border transition-colors
            ${
                isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
            }`}
                >
                    <option value="date">Sort by Date</option>
                    <option value="severity">Sort by Severity</option>
                    <option value="program">Sort by Program</option>
                    <option value="priority">Sort by Priority</option>
                </select>
            </div>

            {/* Findings List */}
            {filteredFindings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFindings.map((finding) => (
                        <FindingCard
                            key={finding.id}
                            finding={finding}
                            onView={onViewFinding}
                            onSubmit={onSubmitFinding}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </div>
            ) : (
                <div
                    className={`text-center py-16 rounded-2xl border ${isDarkMode ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-50 border-gray-200"}`}
                >
                    <BugAntIcon
                        className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`}
                    />
                    <h3
                        className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        No findings found
                    </h3>
                    <p
                        className={
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }
                    >
                        {search || severityFilter !== "all"
                            ? "Try adjusting your filters"
                            : "Start scanning to discover vulnerabilities"}
                    </p>
                </div>
            )}
        </div>
    );
}

// ==================== Reports Tab ====================
function ReportsTab({ reports, onDownload, isDarkMode }) {
    const [sortBy, setSortBy] = useState("date");

    const sortedReports = [...(reports || [])].sort((a, b) => {
        if (sortBy === "date") {
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === "findings") {
            return (b.findings_count || 0) - (a.findings_count || 0);
        }
        return 0;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3
                    className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                    Scan Reports
                </h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-4 py-2.5 rounded-xl border transition-colors
            ${
                isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
            }`}
                >
                    <option value="date">Sort by Date</option>
                    <option value="findings">Sort by Findings Count</option>
                </select>
            </div>

            {/* Reports List */}
            {sortedReports.length > 0 ? (
                <div className="space-y-4">
                    {sortedReports.map((report) => (
                        <div
                            key={report.id}
                            className={`p-5 rounded-xl border transition-all duration-200
                ${
                    isDarkMode
                        ? "bg-gray-800/50 border-gray-700/50 hover:border-pink-500/30"
                        : "bg-white border-gray-200 hover:border-pink-300"
                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4
                                        className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                    >
                                        {report.filename || report.id}
                                    </h4>
                                    <p
                                        className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                                    >
                                        Created:{" "}
                                        {report.created_at
                                            ? new Date(
                                                  report.created_at,
                                              ).toLocaleString()
                                            : "Unknown"}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-md ${isDarkMode ? "bg-pink-500/20 text-pink-400" : "bg-pink-100 text-pink-600"}`}
                                        >
                                            {report.findings_count || 0}{" "}
                                            findings
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDownload(report)}
                                    className="p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
                                    title="Download report"
                                >
                                    <ArrowDownTrayIcon className="w-5 h-5 text-pink-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className={`text-center py-16 rounded-2xl border ${isDarkMode ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-50 border-gray-200"}`}
                >
                    <DocumentTextIcon
                        className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`}
                    />
                    <h3
                        className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        No reports yet
                    </h3>
                    <p
                        className={
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                        }
                    >
                        Complete a scan to generate reports
                    </p>
                </div>
            )}
        </div>
    );
}

// ==================== Programs Tab ====================
function ProgramsTab({ programs, onSync, isDarkMode }) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3
                    className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                >
                    Bug Bounty Programs
                </h3>
                <div className="flex gap-3">
                    <button
                        onClick={() => onSync("hackerone")}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2
              ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Sync HackerOne
                    </button>
                    <button
                        onClick={() => onSync("bugcrowd")}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2
              ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Sync Bugcrowd
                    </button>
                </div>
            </div>

            {/* Programs Grid */}
            {programs?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {programs.map((program) => (
                        <div
                            key={program.handle}
                            className={`p-5 rounded-xl border transition-all duration-200
                ${
                    isDarkMode
                        ? "bg-gray-800/50 border-gray-700/50 hover:border-pink-500/30"
                        : "bg-white border-gray-200 hover:border-pink-300"
                }`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4
                                        className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                                    >
                                        {program.name}
                                    </h4>
                                    <p
                                        className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                                    >
                                        {program.handle}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs rounded-md ${
                                        program.state === "open"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-yellow-500/20 text-yellow-400"
                                    }`}
                                >
                                    {program.state}
                                </span>
                            </div>

                            {(program.min_bounty > 0 ||
                                program.max_bounty > 0) && (
                                <div className="flex items-center gap-2 mb-3">
                                    <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                                    <span
                                        className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                                    >
                                        ${program.min_bounty} - $
                                        {program.max_bounty}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs">
                                <span
                                    className={`px-2 py-1 rounded ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                                >
                                    {program.platform}
                                </span>
                                {program.scope_count && (
                                    <span
                                        className={`px-2 py-1 rounded ${isDarkMode ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"}`}
                                    >
                                        {program.scope_count} assets
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-700/30">
                                <button
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    View Scope
                                </button>
                                <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 transition-colors">
                                    Start Scan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className={`text-center py-16 rounded-2xl border ${isDarkMode ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-50 border-gray-200"}`}
                >
                    <GlobeAltIcon
                        className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-300"}`}
                    />
                    <h3
                        className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                        No programs synced
                    </h3>
                    <p
                        className={`mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                        Connect your HackerOne or Bugcrowd account to sync
                        programs
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => onSync("hackerone")}
                            className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white
                hover:from-pink-600 hover:to-purple-600 transition-all"
                        >
                            Sync HackerOne
                        </button>
                        <button
                            onClick={() => onSync("bugcrowd")}
                            className={`px-6 py-3 rounded-xl font-medium transition-colors
                ${isDarkMode ? "bg-gray-800 text-gray-300 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            Sync Bugcrowd
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== Main Dashboard ====================
export default function BugBountyDashboard() {
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data states
    const [stats, setStats] = useState(null);
    const [scans, setScans] = useState([]);
    const [findings, setFindings] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [reports, setReports] = useState([]);

    // Modal states
    const [showNewScan, setShowNewScan] = useState(false);
    const [selectedFinding, setSelectedFinding] = useState(null);

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Load all data in parallel
            const [statsRes, scansRes, findingsRes, reportsRes] =
                await Promise.all([
                    bugBounty.getStats().catch(() => ({ data: null })),
                    bugBounty.getScans().catch(() => ({ data: [] })),
                    bugBounty.getFindings().catch(() => ({ data: [] })),
                    bugBounty.getReports().catch(() => ({ data: [] })),
                ]);

            setStats(
                statsRes.data || {
                    total_findings: 0,
                    by_severity: {
                        critical: 0,
                        high: 0,
                        medium: 0,
                        low: 0,
                        info: 0,
                    },
                    estimated_bounty: 0,
                },
            );
            setScans(Array.isArray(scansRes.data) ? scansRes.data : []);
            setFindings(
                Array.isArray(findingsRes.data) ? findingsRes.data : [],
            );
            setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
            setError(null);
        } catch (err) {
            console.error("Failed to load bug bounty data:", err);
            setError("Failed to load data. Please check the API connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        // Refresh data every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    // Handlers
    const handleStartScan = async (config) => {
        try {
            await bugBounty.startScan(config);
            setShowNewScan(false);
            loadData();
        } catch (err) {
            console.error("Failed to start scan:", err);
        }
    };

    const handleStopScan = async (scanId) => {
        try {
            await bugBounty.stopScan(scanId);
            loadData();
        } catch (err) {
            console.error("Failed to stop scan:", err);
        }
    };

    const handleSyncPrograms = async (platform) => {
        try {
            const res = await bugBounty.syncPrograms(platform);
            setPrograms(res.data || []);
        } catch (err) {
            console.error("Failed to sync programs:", err);
        }
    };

    const handleSubmitFinding = async (finding) => {
        try {
            await bugBounty.submitFinding(finding.id);
            loadData();
            setSelectedFinding(null);
        } catch (err) {
            console.error("Failed to submit finding:", err);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: ChartBarIcon },
        { id: "scans", label: "Scans", icon: SignalIcon },
        { id: "findings", label: "Findings", icon: BugAntIcon },
        { id: "reports", label: "Reports", icon: DocumentTextIcon },
        { id: "programs", label: "Programs", icon: GlobeAltIcon },
    ];

    const activeScans = scans.filter((s) => s.status === "running");
    const recentFindings = findings.slice(0, 10);

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
        >
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20
          ${isDarkMode ? "bg-pink-500" : "bg-pink-300"}`}
                />
                <div
                    className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20
          ${isDarkMode ? "bg-purple-500" : "bg-purple-300"}`}
                />
                <div className="absolute inset-0 bb-grid-bg" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1
                            className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                        >
                            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                                Bug Bounty
                            </span>{" "}
                            Hunter
                        </h1>
                        <p
                            className={`mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                            Autonomous vulnerability discovery and reporting
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            className={`p-2.5 rounded-xl transition-colors ${isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"}`}
                            title="Refresh"
                        >
                            <ArrowPathIcon
                                className={`w-5 h-5 ${loading ? "animate-spin" : ""} ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                            />
                        </button>
                        <button
                            onClick={() => setShowNewScan(true)}
                            className="px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white
                hover:from-pink-600 hover:to-purple-600 transition-all flex items-center gap-2 shadow-lg shadow-pink-500/25"
                        >
                            <PlayIcon className="w-5 h-5" />
                            New Scan
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className={`flex gap-1 p-1.5 rounded-xl mb-6 w-fit ${isDarkMode ? "bg-gray-800/50" : "bg-gray-100"}`}
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                  ${
                      activeTab === tab.id
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                          : isDarkMode
                            ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Error State */}
                {error && (
                    <div
                        className={`mb-6 p-4 rounded-xl border ${isDarkMode ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-600"}`}
                    >
                        <div className="flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <OverviewTab
                        stats={stats}
                        recentFindings={recentFindings}
                        activeScans={activeScans}
                        onViewFinding={setSelectedFinding}
                        onStartScan={() => setShowNewScan(true)}
                        isDarkMode={isDarkMode}
                    />
                )}
                {activeTab === "scans" && (
                    <ScansTab
                        scans={scans}
                        onStartScan={() => setShowNewScan(true)}
                        onStopScan={handleStopScan}
                        onViewScan={() => {}}
                        isDarkMode={isDarkMode}
                    />
                )}
                {activeTab === "findings" && (
                    <FindingsTab
                        findings={findings}
                        onViewFinding={setSelectedFinding}
                        onSubmitFinding={handleSubmitFinding}
                        isDarkMode={isDarkMode}
                    />
                )}
                {activeTab === "reports" && (
                    <ReportsTab
                        reports={reports}
                        onDownload={(report) =>
                            bugBounty.downloadReport(report.id)
                        }
                        isDarkMode={isDarkMode}
                    />
                )}
                {activeTab === "programs" && (
                    <ProgramsTab
                        programs={programs}
                        onSync={handleSyncPrograms}
                        isDarkMode={isDarkMode}
                    />
                )}
            </div>

            {/* Modals */}
            <NewScanModal
                isOpen={showNewScan}
                onClose={() => setShowNewScan(false)}
                onSubmit={handleStartScan}
                isDarkMode={isDarkMode}
            />
            <FindingDetailModal
                finding={selectedFinding}
                isOpen={!!selectedFinding}
                onClose={() => setSelectedFinding(null)}
                onSubmit={handleSubmitFinding}
                isDarkMode={isDarkMode}
            />
        </div>
    );
}
