import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { approvals } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import {
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ChartBarIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function ApprovalWorkflow() {
  const { isDarkMode } = useTheme()
  const { isDemoMode } = useDemoMode()
  const isLiveMode = !isDemoMode
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState([])
  const [recentActions, setRecentActions] = useState([])
  const [config, setConfig] = useState(null)
  const [status, setStatus] = useState(null)
  const [expandedActions, setExpandedActions] = useState({})
  const [rejectingAction, setRejectingAction] = useState(null)
  const [reasonInputs, setReasonInputs] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)
  const [editConfig, setEditConfig] = useState(null)

  useEffect(() => {
    fetchData()

    // WebSocket for real-time updates, with polling fallback
    let ws = null
    let interval = null

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      ws = new WebSocket(`${protocol}//${host}/api/actions/ws/alerts`)

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_action' || data.type === 'action_approved' || data.type === 'action_rejected') {
            fetchData()
          }
        } catch (e) {
          // Ignore malformed messages
        }
      }

      ws.onerror = () => {
        // Fall back to polling on WebSocket error
        if (!interval) {
          interval = setInterval(() => fetchData(), 5000)
        }
      }

      ws.onclose = () => {
        // Fall back to polling on disconnect
        if (!interval) {
          interval = setInterval(() => fetchData(), 5000)
        }
      }
    } catch (e) {
      // WebSocket not available, use polling
      interval = setInterval(() => fetchData(), 5000)
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close()
      if (interval) clearInterval(interval)
    }
  }, [])

  const fetchData = async () => {
    try {
      const [queueData, statusData] = await Promise.all([
        approvals.getQueue(),
        approvals.getStatus(),
      ])
      setQueue(queueData.actions || [])
      setStatus(statusData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching approval data:', error)
      setLoading(false)
    }
  }

  const fetchRecent = async () => {
    try {
      const data = await approvals.getRecent(50)
      setRecentActions(data.actions || [])
    } catch (error) {
      console.error('Error fetching recent actions:', error)
    }
  }

  const fetchConfig = async () => {
    try {
      const data = await approvals.getConfig()
      setConfig(data)
      setEditConfig(data)
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  useEffect(() => {
    if (activeTab === 'recent' && recentActions.length === 0) {
      fetchRecent()
    }
    if (activeTab === 'config' && !config) {
      fetchConfig()
    }
  }, [activeTab])

  useEffect(() => {
    if (!isLiveMode) return
    const interval = setInterval(() => {
      fetchData().catch(err => console.error('Live poll error:', err))
    }, 15000)
    return () => clearInterval(interval)
  }, [isLiveMode])

  const handleApprove = async (actionId) => {
    try {
      const reason = reasonInputs[actionId] || ''
      await approvals.approve(actionId, reason)
      console.log('Action approved successfully')
      await fetchData()
      setReasonInputs({ ...reasonInputs, [actionId]: '' })
    } catch (error) {
      console.error('Error approving action:', error)
    }
  }

  const handleReject = async (actionId) => {
    try {
      const reason = reasonInputs[actionId] || ''
      if (!reason.trim()) {
        alert('Please provide a reason for rejection')
        return
      }
      await approvals.reject(actionId, reason)
      console.log('Action rejected successfully')
      await fetchData()
      await fetchRecent()
      setReasonInputs({ ...reasonInputs, [actionId]: '' })
      setRejectingAction(null)
    } catch (error) {
      console.error('Error rejecting action:', error)
    }
  }

  const handleSaveConfig = async () => {
    setSavingConfig(true)
    try {
      await approvals.updateConfig(editConfig)
      console.log('Configuration updated successfully')
      setConfig(editConfig)
    } catch (error) {
      console.error('Error updating config:', error)
    } finally {
      setSavingConfig(false)
    }
  }

  const toggleExpanded = (actionId) => {
    setExpandedActions({
      ...expandedActions,
      [actionId]: !expandedActions[actionId],
    })
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'green'
      case 'rejected': return 'red'
      case 'completed': return 'blue'
      case 'failed': return 'red'
      case 'timeout': return 'gray'
      default: return 'gray'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
      case 'medium':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
      case 'low':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getSeverityBreakdown = () => {
    const breakdown = { critical: 0, high: 0, medium: 0, low: 0 }
    queue.forEach((action) => {
      const severity = action.severity?.toLowerCase() || 'low'
      if (breakdown.hasOwnProperty(severity)) {
        breakdown[severity]++
      }
    })
    return breakdown
  }

  const filteredRecentActions = recentActions.filter((action) => {
    const matchesStatus = statusFilter === 'all' || action.status?.toLowerCase() === statusFilter
    const matchesSearch = !searchTerm ||
      action.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.target?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 mx-auto text-brand-purple animate-pulse" />
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading Approval Queue...</p>
        </div>
      </div>
    )
  }

  const severityBreakdown = getSeverityBreakdown()

  const tabs = [
    { id: 'pending', label: 'Pending', icon: ClockIcon, badge: queue.length },
    { id: 'recent', label: 'Recent', icon: ChartBarIcon },
    { id: 'config', label: 'Config', icon: CogIcon },
  ]

  return (
    <div className={`space-y-6 pb-8 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
        <div className={`relative backdrop-blur-sm rounded-2xl border p-8 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${queue.length > 0 ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20' : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'}`}>
                <ShieldCheckIcon className={`w-10 h-10 ${queue.length > 0 ? 'text-orange-400 animate-pulse' : 'text-purple-400'}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Action Approval Workflow
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Human-in-the-loop security action approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Pending Count */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-orange-500/50 hover:shadow-orange-500/10' : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-orange-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <p className={`text-4xl font-bold ${queue.length > 0 ? 'text-orange-400 animate-pulse' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {queue.length}
            </p>
            <p className={`text-xs mt-2 ${queue.length > 0 ? 'text-orange-400' : isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {queue.length > 0 ? 'Requires attention' : 'All clear'}
            </p>
          </div>
        </div>

        {/* Approved Today */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-green-500/50 hover:shadow-green-500/10' : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-green-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved</p>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {status?.approved_count || 0}
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Total approved
            </p>
          </div>
        </div>

        {/* Rejected Today */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-red-500/50 hover:shadow-red-500/10' : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-red-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</p>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {status?.rejected_count || 0}
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Total rejected
            </p>
          </div>
        </div>

        {/* Average Wait Time */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-blue-500/50 hover:shadow-blue-500/10' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Wait</p>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {status?.avg_wait_time_minutes ? `${Math.round(status.avg_wait_time_minutes)}m` : '-'}
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Average time
            </p>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      {queue.length > 0 && (
        <div className={`backdrop-blur-sm p-6 rounded-xl border shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Severity Breakdown
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
              <ExclamationTriangleIcon className="w-8 h-8 mx-auto text-red-400 mb-2" />
              <div className="text-3xl font-bold text-red-400">{severityBreakdown.critical}</div>
              <div className="text-sm text-red-400/70">Critical</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
              <ExclamationTriangleIcon className="w-8 h-8 mx-auto text-orange-400 mb-2" />
              <div className="text-3xl font-bold text-orange-400">{severityBreakdown.high}</div>
              <div className="text-sm text-orange-400/70">High</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
              <ExclamationTriangleIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
              <div className="text-3xl font-bold text-yellow-400">{severityBreakdown.medium}</div>
              <div className="text-sm text-yellow-400/70">Medium</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
              <CheckCircleIcon className="w-8 h-8 mx-auto text-green-400 mb-2" />
              <div className="text-3xl font-bold text-green-400">{severityBreakdown.low}</div>
              <div className="text-sm text-green-400/70">Low</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex space-x-1 p-1 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-orange-500 text-white animate-pulse'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {queue.length === 0 ? (
            <div className={`backdrop-blur-sm p-12 rounded-xl border text-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
              <CheckCircleIcon className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Pending Actions
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                All security actions have been reviewed
              </p>
            </div>
          ) : (
            queue.map((action) => (
              <div key={action.action_id} className={`backdrop-blur-sm p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 hover:border-orange-500/30' : 'bg-white border-gray-200 hover:border-orange-300'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getSeverityIcon(action.severity)}
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {action.description}
                      </h3>
                      <Badge color={getSeverityColor(action.severity)}>
                        {action.severity}
                      </Badge>
                    </div>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {action.rationale}
                    </p>
                    <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <span className="font-semibold text-cyan-400">Type:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.action_type}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <span className="font-semibold text-purple-400">Target:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.target}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <span className="font-semibold text-orange-400">Waiting:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.time_waiting_human || 'N/A'}</span>
                      </div>
                      {action.source_event_id && (
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                          <span className="font-semibold text-blue-400">Event ID:</span>
                          <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.source_event_id.substring(0, 8)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Expandable Parameters Section */}
                    {action.parameters && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleExpanded(action.action_id)}
                          className={`flex items-center space-x-2 text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          {expandedActions[action.action_id] ? (
                            <ChevronUpIcon className="w-4 h-4" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4" />
                          )}
                          <span>Parameters</span>
                        </button>
                        {expandedActions[action.action_id] && (
                          <pre className={`mt-2 p-3 rounded-lg text-xs overflow-x-auto ${isDarkMode ? 'bg-slate-900/50 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                            {JSON.stringify(action.parameters, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Reason Input */}
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Reason/Notes {rejectingAction === action.action_id && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Optional for approve, required for reject"
                        value={reasonInputs[action.action_id] || ''}
                        onChange={(e) => setReasonInputs({ ...reasonInputs, [action.action_id]: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                          isDarkMode
                            ? 'bg-slate-900/50 border-slate-700 text-white placeholder-gray-500 focus:border-purple-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleApprove(action.action_id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-emerald-500/30"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        if (rejectingAction === action.action_id) {
                          handleReject(action.action_id)
                        } else {
                          setRejectingAction(action.action_id)
                        }
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                        rejectingAction === action.action_id
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-600/30'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-red-500/30'
                      }`}
                    >
                      <XCircleIcon className="w-5 h-5" />
                      <span>{rejectingAction === action.action_id ? 'Confirm' : 'Reject'}</span>
                    </button>
                    {rejectingAction === action.action_id && (
                      <button
                        onClick={() => setRejectingAction(null)}
                        className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recent Tab */}
      {activeTab === 'recent' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="timeout">Timeout</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              />
            </div>
          </div>

          {/* Recent Actions List */}
          <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Action</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Severity</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Target</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reviewed By</th>
                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Reason</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/30' : 'divide-gray-200'}`}>
                  {filteredRecentActions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <ChartBarIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No recent actions found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRecentActions.map((action, idx) => (
                      <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'}`}>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.created_at ? new Date(action.created_at).toLocaleString() : '-'}
                        </td>
                        <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {action.description || action.action_type}
                        </td>
                        <td className="px-6 py-4">
                          <Badge color="blue">{action.action_type}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={getSeverityColor(action.severity)}>
                            {action.severity}
                          </Badge>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.target}
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={getStatusColor(action.status)}>
                            {action.status}
                          </Badge>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.approved_by || action.reviewed_by || '-'}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {action.reason ? (
                            <span className="truncate max-w-xs inline-block" title={action.reason}>
                              {action.reason}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && config && editConfig && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto-Approve Settings */}
          <div className={`backdrop-blur-sm p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-cyan-400" />
              Auto-Approval Settings
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Low Severity', key: 'auto_approve_low' },
                { label: 'Medium Severity', key: 'auto_approve_medium' },
                { label: 'High Severity', key: 'auto_approve_high' },
                { label: 'Critical Severity', key: 'auto_approve_critical' },
              ].map((item) => (
                <div key={item.key} className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                  <button
                    onClick={() => setEditConfig({ ...editConfig, [item.key]: !editConfig[item.key] })}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      editConfig[item.key]
                        ? 'bg-green-600 text-white'
                        : isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {editConfig[item.key] ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Operation Mode */}
          <div className={`backdrop-blur-sm p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <CogIcon className="w-5 h-5 mr-2 text-purple-400" />
              Operation Mode
            </h3>
            <div className="space-y-3">
              <select
                value={editConfig.mode || 'semi_autonomous'}
                onChange={(e) => setEditConfig({ ...editConfig, mode: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDarkMode
                    ? 'bg-slate-900/50 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
              >
                <option value="autonomous">Autonomous (Auto-approve all)</option>
                <option value="semi_autonomous">Semi-Autonomous (Selective)</option>
                <option value="manual">Manual (Require all approvals)</option>
                <option value="monitoring">Monitoring (Log only, no action)</option>
              </select>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {editConfig.mode === 'autonomous' && 'All actions auto-approved based on severity settings'}
                {editConfig.mode === 'semi_autonomous' && 'Auto-approve enabled actions, manual for others'}
                {editConfig.mode === 'manual' && 'All actions require manual approval'}
                {editConfig.mode === 'monitoring' && 'No actions taken, logging only'}
              </p>
            </div>
          </div>

          {/* Approval Timeout */}
          <div className={`backdrop-blur-sm p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <ClockIcon className="w-5 h-5 mr-2 text-orange-400" />
              Approval Timeout
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={editConfig.approval_timeout_seconds || 3600}
                  onChange={(e) => setEditConfig({ ...editConfig, approval_timeout_seconds: parseInt(e.target.value) })}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'bg-slate-900/50 border-slate-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                />
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>seconds</span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Actions timeout after {Math.floor((editConfig.approval_timeout_seconds || 3600) / 60)} minutes
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className={`backdrop-blur-sm p-6 rounded-xl border flex items-center justify-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-purple-500/30 disabled:opacity-50"
            >
              {savingConfig ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
