/**
 * Interactive Sandbox Viewer Component
 *
 * Provides browser-based VM interaction via VNC/noVNC
 * Features:
 * - Real-time VM display
 * - Mouse and keyboard interaction
 * - Session controls (start, stop, screenshot)
 * - Live metrics and monitoring
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = '';

const SandboxViewer = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionMetrics, setSessionMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state for creating new session
  const [newSession, setNewSession] = useState({
    os_type: 'windows_10_x64',
    mode: 'interactive',
    timeout: 300,
    sample_path: '',
    sample_url: ''
  });

  const vncContainerRef = useRef(null);
  const metricsIntervalRef = useRef(null);

  // Fetch active sessions
  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sandbox/sessions`);
      setSessions(response.data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  // Create new sandbox session
  const createSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        os_type: newSession.os_type,
        mode: newSession.mode,
        timeout: parseInt(newSession.timeout),
      };

      if (newSession.sample_path) {
        payload.sample_path = newSession.sample_path;
      }

      if (newSession.sample_url) {
        payload.sample_url = newSession.sample_url;
      }

      const response = await axios.post(`${API_BASE_URL}/api/sandbox/sessions`, payload);

      const session = response.data.session;
      setCurrentSession(session);

      // Load VNC viewer
      loadVNCViewer(session);

      // Start metrics polling
      startMetricsPolling(session.session_id);

      // Refresh session list
      fetchSessions();

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create session');
      console.error('Session creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load VNC viewer in iframe
  const loadVNCViewer = (session) => {
    if (!vncContainerRef.current) return;

    // Clear existing content
    vncContainerRef.current.innerHTML = '';

    // Create iframe for noVNC viewer
    const iframe = document.createElement('iframe');
    iframe.src = session.viewer_url || `http://localhost:6080/vnc.html?autoconnect=true&resize=scale`;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #ccc';
    iframe.style.borderRadius = '4px';

    vncContainerRef.current.appendChild(iframe);
  };

  // Start polling for session metrics
  const startMetricsPolling = (sessionId) => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
    }

    const pollMetrics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/sandbox/sessions/${sessionId}/metrics`);
        setSessionMetrics(response.data.metrics);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };

    // Poll every 5 seconds
    pollMetrics();
    metricsIntervalRef.current = setInterval(pollMetrics, 5000);
  };

  // Stop metrics polling
  const stopMetricsPolling = () => {
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  };

  // Stop sandbox session
  const stopSession = async (sessionId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/sandbox/sessions/${sessionId}/stop`, null, {
        params: { generate_report: true }
      });

      // Clear current session
      setCurrentSession(null);
      setSessionMetrics(null);
      stopMetricsPolling();

      // Clear VNC viewer
      if (vncContainerRef.current) {
        vncContainerRef.current.innerHTML = '';
      }

      // Refresh session list
      fetchSessions();

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to stop session');
      console.error('Stop session error:', err);
    }
  };

  // Take screenshot
  const takeScreenshot = async (sessionId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/sandbox/sessions/${sessionId}/interact`, {
        action: 'screenshot',
        params: { name: `screenshot_${Date.now()}.png` }
      });

      alert('Screenshot captured successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to capture screenshot');
    }
  };

  // Load existing session
  const loadSession = async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sandbox/sessions/${sessionId}`);
      const session = response.data;

      setCurrentSession(session);
      loadVNCViewer(session);
      startMetricsPolling(sessionId);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load session');
    }
  };

  // Component mount/unmount
  useEffect(() => {
    fetchSessions();

    return () => {
      stopMetricsPolling();
    };
  }, []);

  return (
    <div className="sandbox-viewer p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Interactive Sandbox</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Session Control */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">New Session</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">OS Type</label>
                <select
                  value={newSession.os_type}
                  onChange={(e) => setNewSession({...newSession, os_type: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="windows_10_x64">Windows 10 x64</option>
                  <option value="windows_11_x64">Windows 11 x64</option>
                  <option value="ubuntu_22_04_x64">Ubuntu 22.04 x64</option>
                  <option value="debian_12_x64">Debian 12 x64</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <select
                  value={newSession.mode}
                  onChange={(e) => setNewSession({...newSession, mode: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="interactive">Interactive</option>
                  <option value="automated">Automated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Timeout (seconds)</label>
                <input
                  type="number"
                  value={newSession.timeout}
                  onChange={(e) => setNewSession({...newSession, timeout: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  min="30"
                  max="3600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sample Path (optional)</label>
                <input
                  type="text"
                  value={newSession.sample_path}
                  onChange={(e) => setNewSession({...newSession, sample_path: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="/path/to/sample.exe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sample URL (optional)</label>
                <input
                  type="text"
                  value={newSession.sample_url}
                  onChange={(e) => setNewSession({...newSession, sample_url: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://example.com"
                />
              </div>

              <button
                onClick={createSession}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Start Sandbox'}
              </button>
            </div>

            {/* Active Sessions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No active sessions</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.session_id} className="border rounded p-2">
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <div className="font-medium">{session.os_type}</div>
                          <div className="text-gray-500">
                            {Math.floor(session.elapsed_time || 0)}s elapsed
                          </div>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => loadSession(session.session_id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => stopSession(session.session_id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Stop
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Session Metrics */}
          {currentSession && sessionMetrics && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Live Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Processes:</span>
                  <span className="font-medium">{sessionMetrics.process_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Connections:</span>
                  <span className="font-medium">{sessionMetrics.network_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>File Modifications:</span>
                  <span className="font-medium">{sessionMetrics.file_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Screenshots:</span>
                  <span className="font-medium">{sessionMetrics.screenshot_count || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - VNC Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {currentSession ? `Session: ${currentSession.session_id}` : 'No Active Session'}
              </h2>
              {currentSession && (
                <div className="space-x-2">
                  <button
                    onClick={() => takeScreenshot(currentSession.session_id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Screenshot
                  </button>
                  <button
                    onClick={() => stopSession(currentSession.session_id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Stop Session
                  </button>
                </div>
              )}
            </div>

            {/* VNC Container */}
            <div
              ref={vncContainerRef}
              className="vnc-container bg-gray-100 rounded min-h-[600px] flex items-center justify-center"
            >
              {!currentSession && (
                <p className="text-gray-500">Start a sandbox session to begin analysis</p>
              )}
            </div>

            {currentSession && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Session Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>{' '}
                    <span className="font-medium text-green-600">{currentSession.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">OS:</span>{' '}
                    <span className="font-medium">{currentSession.os_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mode:</span>{' '}
                    <span className="font-medium">{currentSession.mode}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timeout:</span>{' '}
                    <span className="font-medium">{currentSession.timeout}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SandboxViewer;
