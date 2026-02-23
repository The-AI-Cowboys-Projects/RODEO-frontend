import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { pipeline } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import {
  BoltIcon,
  CpuChipIcon,
  EyeIcon,
  PlayIcon,
  BeakerIcon,
  DocumentTextIcon,
  ChartBarIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

/**
 * Pipeline Dashboard
 * Displays autonomous event → decision → action → outcome pipeline
 */
export default function PipelineDashboard() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('live-feed')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State
  const [statusData, setStatusData] = useState(null)
  const [flowData, setFlowData] = useState([])
  const [statsData, setStatsData] = useState(null)
  const [timelineEvents, setTimelineEvents] = useState([])

  // Filters
  const [severityFilter, setSeverityFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [expandedEvents, setExpandedEvents] = useState(new Set())

  // Fetch data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Polling for live feed
  useEffect(() => {
    if (activeTab === 'live-feed') {
      const interval = setInterval(() => {
        fetchTimeline()
      }, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [activeTab, severityFilter, categoryFilter])

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [status, flow, stats, timeline] = await Promise.all([
        pipeline.getStatus().catch(() => null),
        pipeline.getFlow(50).catch(() => []),
        pipeline.getStats().catch(() => null),
        pipeline.getTimeline(100, categoryFilter, severityFilter).catch(() => []),
      ])
      setStatusData(status)
      setFlowData(Array.isArray(flow) ? flow : [])
      setStatsData(stats)
      setTimelineEvents(Array.isArray(timeline) ? timeline : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeline = async () => {
    try {
      const timeline = await pipeline.getTimeline(100, categoryFilter, severityFilter)
      setTimelineEvents(Array.isArray(timeline) ? timeline : [])
    } catch (err) {
      console.error('Failed to fetch timeline:', err)
    }
  }

  const toggleEventExpansion = (eventId) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  // Category colors
  const getCategoryColor = (category) => {
    const colors = {
      threat: 'danger',
      vulnerability: 'warning',
      agent: 'info',
      orchestrator: 'primary',
      scan: 'info',
      edr: 'primary',
      system: 'default',
    }
    return colors[category] || 'default'
  }

  // Severity colors
  const getSeverityVariant = (severity) => {
    const variants = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
      info: 'informational',
    }
    return variants[severity] || 'informational'
  }

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  // Health status
  const getHealthStatus = () => {
    if (!statusData) return { label: 'Unknown', variant: 'default' }
    const subsystems = Array.isArray(statusData.subsystems) ? statusData.subsystems : []
    const available = subsystems.filter((s) => s.available).length || 0
    const total = subsystems.length || 1
    const ratio = available / total

    if (ratio >= 0.9) return { label: 'Healthy', variant: 'success' }
    if (ratio >= 0.7) return { label: 'Degraded', variant: 'warning' }
    return { label: 'Critical', variant: 'danger' }
  }

  const healthStatus = getHealthStatus()

  // Tab definitions
  const tabs = [
    { id: 'live-feed', label: 'Live Feed', icon: BoltIcon },
    { id: 'subsystems', label: 'Subsystems', icon: CpuChipIcon },
    { id: 'metrics', label: 'Metrics', icon: ChartBarIcon },
  ]

  if (loading && !statusData) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading pipeline data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Autonomous Pipeline
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Real-time event processing: Event → Decision → Action → Outcome
          </p>
        </div>

        {/* Stats Header */}
        {statusData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Health</p>
                  <Badge variant={healthStatus.variant} className="mt-1">
                    {healthStatus.label}
                  </Badge>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subsystems</p>
                  <p className="text-2xl font-bold mt-1">
                    {Array.isArray(statusData.subsystems) ? statusData.subsystems.filter((s) => s.available).length : 0}/
                    {Array.isArray(statusData.subsystems) ? statusData.subsystems.length : 0}
                  </p>
                </div>
                <CpuChipIcon className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Events</p>
                  <p className="text-2xl font-bold mt-1">
                    {statusData.total_events_published?.toLocaleString() || 0}
                  </p>
                </div>
                <BoltIcon className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Decisions</p>
                  <p className="text-2xl font-bold mt-1">
                    {statusData.decisions_made?.toLocaleString() || 0}
                  </p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-cyan-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Error display */}
        {error && (
          <Card variant="error" className="mb-6">
            <div className="flex items-center gap-3">
              <XCircleIcon className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-semibold">Error loading pipeline data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-slate-700">
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

        {/* Tab Content */}
        {activeTab === 'live-feed' && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Filters:</span>
              </div>
              <select
                value={severityFilter || ''}
                onChange={(e) => setSeverityFilter(e.target.value || null)}
                className={`px-3 py-1 rounded border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className={`px-3 py-1 rounded border ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Categories</option>
                <option value="threat">Threat</option>
                <option value="vulnerability">Vulnerability</option>
                <option value="agent">Agent</option>
                <option value="orchestrator">Orchestrator</option>
                <option value="scan">Scan</option>
                <option value="edr">EDR</option>
                <option value="system">System</option>
              </select>
              <Button size="sm" onClick={fetchTimeline}>
                Refresh
              </Button>
            </div>

            {/* Event Stream */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Event Stream ({timelineEvents.length})</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {timelineEvents.length === 0 ? (
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No events to display</p>
                ) : (
                  timelineEvents.map((event, index) => {
                    const isExpanded = expandedEvents.has(event.id || index)
                    return (
                      <div
                        key={event.id || index}
                        className={`p-3 rounded border ${
                          isDarkMode
                            ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        } transition-colors`}
                      >
                        <div className="flex items-start gap-3">
                          <ClockIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {formatTimestamp(event.timestamp)}
                              </span>
                              <Badge variant={getCategoryColor(event.category)} size="xs">
                                {event.category}
                              </Badge>
                              <Badge variant={getSeverityVariant(event.severity)} size="xs">
                                {event.severity}
                              </Badge>
                            </div>
                            <p className="font-medium mb-1">{event.event_type}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Source: {event.source}
                            </p>
                            {event.data && (
                              <button
                                onClick={() => toggleEventExpansion(event.id || index)}
                                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 mt-2"
                              >
                                {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                {isExpanded ? 'Hide' : 'Show'} Data
                              </button>
                            )}
                            {isExpanded && event.data && (
                              <pre
                                className={`mt-2 p-2 rounded text-xs overflow-x-auto ${
                                  isDarkMode ? 'bg-slate-900' : 'bg-white'
                                }`}
                              >
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'subsystems' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Array.isArray(statusData?.subsystems) ? statusData.subsystems : []).map((subsystem) => (
                <Card key={subsystem.name}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{subsystem.name}</h3>
                    <Badge variant={subsystem.available ? 'success' : 'danger'} size="sm">
                      {subsystem.available ? 'Running' : 'Stopped'}
                    </Badge>
                  </div>
                  {subsystem.details && (
                    <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {Object.entries(subsystem.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div>
            {/* Summary Stats */}
            {statsData && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <Card>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Events Published</p>
                  <p className="text-2xl font-bold mt-1">{statsData.events_published?.toLocaleString() || 0}</p>
                </Card>
                <Card>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Decisions Made</p>
                  <p className="text-2xl font-bold mt-1">{statsData.decisions_made?.toLocaleString() || 0}</p>
                </Card>
                <Card>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions Executed</p>
                  <p className="text-2xl font-bold mt-1">{statsData.actions_executed?.toLocaleString() || 0}</p>
                </Card>
                <Card>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
                  <p className="text-2xl font-bold mt-1">
                    {statsData.success_rate ? `${(statsData.success_rate * 100).toFixed(1)}%` : '0%'}
                  </p>
                </Card>
                <Card>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>KB Documents</p>
                  <p className="text-2xl font-bold mt-1">{statsData.kb_documents?.toLocaleString() || 0}</p>
                </Card>
              </div>
            )}

            {/* Pipeline Flow */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Pipeline Flow</h3>
              <div className="space-y-3">
                {flowData.length === 0 ? (
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No flow data available</p>
                ) : (
                  flowData.map((flow, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="xs">
                          {flow.event_type}
                        </Badge>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>→</span>
                        <Badge
                          variant={
                            flow.stage === 'trigger'
                              ? 'warning'
                              : flow.stage === 'decision'
                              ? 'info'
                              : flow.stage === 'action'
                              ? 'success'
                              : 'default'
                          }
                          size="xs"
                        >
                          {flow.stage}
                        </Badge>
                        {flow.timestamp && (
                          <span className={`text-xs ml-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTimestamp(flow.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
