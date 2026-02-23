import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { watchers } from '../api/client'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import {
  EyeIcon,
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

/**
 * Display metadata for each known watcher type
 */
const WATCHER_NAMES = {
  edr: { label: 'EDR Watcher', desc: 'Polls endpoint detection alerts' },
  cve: { label: 'CVE Intelligence', desc: 'Monitors CVE publications and exploits' },
  log_anomaly: { label: 'Log Anomaly', desc: 'Detects anomalies in log streams' },
  scan_scheduler: { label: 'Scan Scheduler', desc: 'Runs periodic vulnerability scans' },
  endpoint_health: { label: 'Endpoint Health', desc: 'Monitors agent check-ins' },
  ics: { label: 'ICS/SCADA Monitor', desc: 'Watches industrial control systems' },
}

/**
 * Watchers Panel
 * Background threat detection and monitoring
 */
export default function WatchersPanel() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('grid')
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  // Watcher data
  const [watcherMap, setWatcherMap] = useState({})
  const [totalWatchers, setTotalWatchers] = useState(0)
  const [runningCount, setRunningCount] = useState(0)

  // Per-watcher action loading: { watcherName: 'play' | 'pause' | 'stop' | null }
  const [actionLoading, setActionLoading] = useState({})

  // Global action loading
  const [globalLoading, setGlobalLoading] = useState(null) // 'start' | 'stop' | null

  // Log ingest state
  const [logText, setLogText] = useState('')
  const [ingesting, setIngesting] = useState(false)

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    fetchStatus()
    // Poll every 10 seconds
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const data = await watchers.getStatus().catch(() => null)
      if (data && data.watchers && typeof data.watchers === 'object') {
        setWatcherMap(data.watchers)
        setTotalWatchers(data.total || Object.keys(data.watchers).length)
        setRunningCount(
          data.running ??
            Object.values(data.watchers).filter((w) => w.state === 'running').length
        )
      }
    } catch (err) {
      console.error('Failed to fetch watcher status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartAll = async () => {
    setGlobalLoading('start')
    try {
      await watchers.startAll()
      showNotif('All watchers started')
      await fetchStatus()
    } catch (err) {
      showNotif(`Failed to start watchers: ${err.message}`, 'error')
    } finally {
      setGlobalLoading(null)
    }
  }

  const handleStopAll = async () => {
    setGlobalLoading('stop')
    try {
      await watchers.stopAll()
      showNotif('All watchers stopped')
      await fetchStatus()
    } catch (err) {
      showNotif(`Failed to stop watchers: ${err.message}`, 'error')
    } finally {
      setGlobalLoading(null)
    }
  }

  const handleWatcherAction = async (name, action) => {
    setActionLoading((prev) => ({ ...prev, [name]: action }))
    try {
      switch (action) {
        case 'play':
          await watchers.startWatcher(name)
          showNotif(`${getWatcherLabel(name)} started`)
          break
        case 'pause':
          await watchers.pauseWatcher(name)
          showNotif(`${getWatcherLabel(name)} paused`)
          break
        case 'stop':
          await watchers.stopWatcher(name)
          showNotif(`${getWatcherLabel(name)} stopped`)
          break
        default:
          break
      }
      await fetchStatus()
    } catch (err) {
      showNotif(`Action failed: ${err?.response?.data?.detail || err.message}`, 'error')
    } finally {
      setActionLoading((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleIngestLogs = async () => {
    const lines = logText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
    if (lines.length === 0) {
      showNotif('No log lines to ingest', 'error')
      return
    }
    setIngesting(true)
    try {
      const result = await watchers.ingestLogs(lines)
      const count = result?.lines_count ?? lines.length
      showNotif(`Ingested ${count} log line${count !== 1 ? 's' : ''} successfully`)
      setLogText('')
    } catch (err) {
      showNotif(`Ingest failed: ${err?.response?.data?.detail || err.message}`, 'error')
    } finally {
      setIngesting(false)
    }
  }

  const getWatcherLabel = (name) => WATCHER_NAMES[name]?.label || name

  const formatLastTick = (lastTick) => {
    if (!lastTick) return 'Never'
    try {
      const date = new Date(lastTick)
      const now = new Date()
      const diffMs = now - date
      const diffSec = Math.floor(diffMs / 1000)
      if (diffSec < 60) return `${diffSec}s ago`
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHr = Math.floor(diffMin / 60)
      return `${diffHr}h ago`
    } catch {
      return lastTick
    }
  }

  const getStateDot = (state) => {
    switch (state?.toLowerCase()) {
      case 'running':
        return <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
      case 'paused':
        return <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400" />
      default:
        return <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-500" />
    }
  }

  const getStateLabel = (state) => {
    switch (state?.toLowerCase()) {
      case 'running': return 'Running'
      case 'paused': return 'Paused'
      default: return 'Stopped'
    }
  }

  const getStateBadgeVariant = (state) => {
    switch (state?.toLowerCase()) {
      case 'running': return 'success'
      case 'paused': return 'warning'
      default: return 'default'
    }
  }

  // Derive paused count
  const watcherEntries = Object.entries(watcherMap)
  const pausedCount = watcherEntries.filter(([, w]) => w.state === 'paused').length
  const stoppedCount = watcherEntries.filter(([, w]) => !['running', 'paused'].includes(w.state)).length

  const pendingLines = logText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length

  const tabs = [
    { id: 'grid', label: 'Watcher Grid', icon: EyeIcon },
    { id: 'ingest', label: 'Log Ingest', icon: DocumentTextIcon },
  ]

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600 text-white' :
          notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <EyeIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Continuous Watchers
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Background threat detection and monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Watchers */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Watchers</p>
                <p className="text-2xl font-bold mt-1">{totalWatchers || watcherEntries.length}</p>
              </div>
              <EyeIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Running */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Running</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{runningCount}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Paused */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paused</p>
                <p className="text-2xl font-bold mt-1 text-yellow-400">{pausedCount}</p>
              </div>
              <PauseIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Stopped */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stopped</p>
                <p className="text-2xl font-bold mt-1 text-gray-400">{stoppedCount}</p>
              </div>
              <StopIcon className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleStartAll}
            disabled={globalLoading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {globalLoading === 'start' ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
            Start All
          </button>
          <button
            onClick={handleStopAll}
            disabled={globalLoading !== null}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {globalLoading === 'stop' ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <StopIcon className="w-5 h-5" />
            )}
            Stop All
          </button>
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchStatus}
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex gap-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'border-purple-500 text-purple-400'
                      : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Watcher Grid Tab */}
        {activeTab === 'grid' && (
          <div>
            {watcherEntries.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-12 text-center`}>
                <EyeIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No Watchers Running
                </p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No watcher status data is available. Try clicking Start All.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watcherEntries.map(([name, watcher]) => {
                  const meta = WATCHER_NAMES[name] || { label: name, desc: '' }
                  const state = watcher.state || 'stopped'
                  const tickCount = watcher.tick_count ?? 0
                  const errorCount = watcher.error_count ?? 0
                  const lastTick = watcher.last_tick
                  const isActionPending = !!actionLoading[name]
                  const currentAction = actionLoading[name]

                  return (
                    <div
                      key={name}
                      className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStateDot(state)}
                          <div>
                            <p className="font-semibold">{meta.label}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {meta.desc}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStateBadgeVariant(state)} size="xs">
                          {getStateLabel(state)}
                        </Badge>
                      </div>

                      {/* Stats Row */}
                      <div className={`flex items-center gap-4 text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span>
                          Ticks: <span className="font-medium">{tickCount.toLocaleString()}</span>
                        </span>
                        <span>
                          Errors:{' '}
                          <span className={`font-medium ${errorCount > 0 ? 'text-red-400' : ''}`}>
                            {errorCount}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {formatLastTick(lastTick)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Play / Resume */}
                        <button
                          onClick={() => handleWatcherAction(name, 'play')}
                          disabled={isActionPending || state === 'running'}
                          title={state === 'paused' ? 'Resume' : 'Start'}
                          className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            isDarkMode
                              ? 'bg-green-700/40 hover:bg-green-700/70 text-green-300 disabled:bg-slate-700'
                              : 'bg-green-100 hover:bg-green-200 text-green-700 disabled:bg-gray-100'
                          }`}
                        >
                          {isActionPending && currentAction === 'play' ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlayIcon className="w-4 h-4" />
                          )}
                          <span>Play</span>
                        </button>

                        {/* Pause */}
                        <button
                          onClick={() => handleWatcherAction(name, 'pause')}
                          disabled={isActionPending || state !== 'running'}
                          title="Pause"
                          className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            isDarkMode
                              ? 'bg-yellow-700/40 hover:bg-yellow-700/70 text-yellow-300 disabled:bg-slate-700'
                              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 disabled:bg-gray-100'
                          }`}
                        >
                          {isActionPending && currentAction === 'pause' ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <PauseIcon className="w-4 h-4" />
                          )}
                          <span>Pause</span>
                        </button>

                        {/* Stop */}
                        <button
                          onClick={() => handleWatcherAction(name, 'stop')}
                          disabled={isActionPending || state === 'stopped'}
                          title="Stop"
                          className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                            isDarkMode
                              ? 'bg-red-700/40 hover:bg-red-700/70 text-red-300 disabled:bg-slate-700'
                              : 'bg-red-100 hover:bg-red-200 text-red-700 disabled:bg-gray-100'
                          }`}
                        >
                          {isActionPending && currentAction === 'stop' ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <StopIcon className="w-4 h-4" />
                          )}
                          <span>Stop</span>
                        </button>
                      </div>

                      {/* Extra watcher metadata */}
                      {(watcher.interval_seconds || watcher.last_error) && (
                        <div className={`mt-3 pt-3 border-t text-xs ${
                          isDarkMode ? 'border-slate-700 text-gray-500' : 'border-gray-100 text-gray-400'
                        }`}>
                          {watcher.interval_seconds && (
                            <span>Interval: {watcher.interval_seconds}s</span>
                          )}
                          {watcher.last_error && (
                            <div className="flex items-start gap-1 mt-1 text-red-400">
                              <ExclamationTriangleIcon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span className="break-all">{watcher.last_error}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Log Ingest Tab */}
        {activeTab === 'ingest' && (
          <div className="max-w-3xl">
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-purple-400" />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Ingest Log Lines
                </h2>
              </div>

              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Paste raw log lines below — one per line. They will be forwarded to the log anomaly
                watcher for real-time analysis.
              </p>

              <textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                rows={10}
                placeholder={
                  'Paste log lines here, one per line...\n' +
                  'Example: Jan 23 10:15:32 server sshd[1234]: Failed password for root from 192.168.1.100'
                }
                className={`${
                  isDarkMode
                    ? 'bg-slate-900/50 border-slate-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                } w-full rounded-lg border p-3 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none resize-y`}
                style={{ minHeight: '200px' }}
              />

              <div className="flex items-center justify-between mt-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {pendingLines > 0 ? (
                    <>
                      <span className="font-semibold text-purple-400">{pendingLines}</span>
                      {' '}line{pendingLines !== 1 ? 's' : ''} ready to submit
                    </>
                  ) : (
                    'No lines entered yet'
                  )}
                </p>
                <div className="flex items-center gap-3">
                  {logText && (
                    <button
                      onClick={() => setLogText('')}
                      className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={handleIngestLogs}
                    disabled={ingesting || pendingLines === 0}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {ingesting ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Ingesting...
                      </>
                    ) : (
                      <>
                        <DocumentTextIcon className="w-4 h-4" />
                        Ingest Logs
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info box */}
              <div className={`mt-4 px-4 py-3 rounded-lg border flex items-start gap-3 ${
                isDarkMode
                  ? 'bg-blue-900/20 border-blue-700/40'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  <p className="font-medium mb-1">Supported formats</p>
                  <ul className="space-y-0.5 text-xs">
                    <li>Syslog: <code className="font-mono">Jan 23 10:15:32 host sshd[1234]: message</code></li>
                    <li>JSON: <code className="font-mono">{"{"}"timestamp": "...", "level": "ERROR", "message": "..."{"}"}</code></li>
                    <li>Apache: <code className="font-mono">192.168.1.1 - - [23/Jan/2026:10:15:32 +0000] "GET / HTTP/1.1" 200 1234</code></li>
                    <li>Windows Event: <code className="font-mono">Security,4625,An account failed to log on</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
