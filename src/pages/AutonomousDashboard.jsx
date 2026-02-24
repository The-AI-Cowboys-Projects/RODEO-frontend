import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { autonomous } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import {
  CpuChipIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BoltIcon,
  CogIcon,
  ChartBarIcon,
  QueueListIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

export default function AutonomousDashboard() {
  const { isDarkMode } = useTheme()
  const [agentStatus, setAgentStatus] = useState(null)
  const [pendingActions, setPendingActions] = useState([])
  const [actionHistory, setActionHistory] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    fetchAgentStatus()
    fetchPendingActions()
    fetchStatistics()
    fetchActionHistory()

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchAgentStatus()
      fetchPendingActions()
      fetchStatistics()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchAgentStatus = async () => {
    try {
      const data = await autonomous.getStatus()
      setAgentStatus(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching agent status:', error)
      setLoading(false)
    }
  }

  const fetchPendingActions = async () => {
    try {
      const data = await autonomous.getPendingActions()
      setPendingActions(data.actions || [])
    } catch (error) {
      console.error('Error fetching pending actions:', error)
    }
  }

  const fetchActionHistory = async () => {
    try {
      const data = await autonomous.getActionHistory(50)
      setActionHistory(data.actions || [])
    } catch (error) {
      console.error('Error fetching action history:', error)
    }
  }

  const fetchStatistics = async () => {
    try {
      const data = await autonomous.getStatistics()
      setStatistics(data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const toggleAgent = async () => {
    setIsToggling(true)
    try {
      if (agentStatus?.is_running) {
        await autonomous.stop()
      } else {
        await autonomous.start()
      }
      await fetchAgentStatus()
    } catch (error) {
      console.error('Error toggling agent:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const approveAction = async (actionId, approved) => {
    try {
      await autonomous.approveAction(actionId, approved, 'admin')
      await fetchPendingActions()
      await fetchActionHistory()
    } catch (error) {
      console.error('Error approving action:', error)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'red'
      case 'high': return 'orange'
      case 'medium': return 'yellow'
      case 'low': return 'blue'
      default: return 'gray'
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'green'
      case 'failed': return 'red'
      case 'executing': return 'blue'
      case 'pending': return 'yellow'
      case 'rejected': return 'gray'
      default: return 'gray'
    }
  }

  const getModeColor = (mode) => {
    switch (mode) {
      case 'autonomous': return 'green'
      case 'semi_autonomous': return 'blue'
      case 'manual': return 'yellow'
      case 'monitoring': return 'gray'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <CpuChipIcon className="w-16 h-16 mx-auto text-brand-purple animate-pulse" />
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Initializing Agent...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'pending', label: 'Pending', icon: ClockIcon, badge: pendingActions.length },
    { id: 'history', label: 'History', icon: QueueListIcon },
    { id: 'config', label: 'Config', icon: CogIcon },
  ]

  return (
    <div className={`space-y-6 pb-8 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
        <div className={`relative backdrop-blur-sm rounded-2xl border p-8 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${agentStatus?.is_running ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-slate-500/20 to-gray-500/20'}`}>
                <CpuChipIcon className={`w-10 h-10 ${agentStatus?.is_running ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Autonomous Security Operations
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered threat response and security automation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Status Badge */}
              <div className={`flex items-center space-x-3 px-4 py-2 rounded-xl border ${
                agentStatus?.is_running
                  ? isDarkMode ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200'
                  : isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-300'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  agentStatus?.is_running ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-gray-400'
                }`}></div>
                <span className={`font-semibold ${
                  agentStatus?.is_running ? 'text-emerald-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {agentStatus?.is_running ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleAgent}
                disabled={isToggling}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  agentStatus?.is_running
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/30'
                } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isToggling ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : agentStatus?.is_running ? (
                  <StopIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
                <span>{agentStatus?.is_running ? 'Stop Agent' : 'Start Agent'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Agent Status Card */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-cyan-500/50 hover:shadow-cyan-500/10' : 'bg-white border-gray-200 hover:border-cyan-300 hover:shadow-cyan-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Agent Mode</p>
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge color={getModeColor(agentStatus?.mode)}>
                {agentStatus?.mode?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {agentStatus?.mode === 'autonomous' ? 'Fully automated' : agentStatus?.mode === 'semi_autonomous' ? 'Requires approval' : 'Manual control'}
            </p>
          </div>
        </div>

        {/* Pending Actions Card */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-orange-500/50 hover:shadow-orange-500/10' : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-orange-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Approvals</p>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <p className={`text-4xl font-bold ${pendingActions.length > 0 ? 'text-orange-400' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {pendingActions.length}
            </p>
            <p className={`text-xs mt-2 ${pendingActions.length > 0 ? 'text-orange-400' : isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {pendingActions.length > 0 ? 'Requires attention' : 'All clear'}
            </p>
          </div>
        </div>

        {/* Total Actions Card */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-purple-500/50 hover:shadow-purple-500/10' : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-purple-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Actions</p>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {statistics?.agent?.total_actions || 0}
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Lifetime executions
            </p>
          </div>
        </div>

        {/* Success Rate Card */}
        <div className={`group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-emerald-500/50 hover:shadow-emerald-500/10' : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-emerald-100'}`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className={`text-4xl font-bold ${(statistics?.agent?.success_rate || 0) >= 90 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {(statistics?.agent?.success_rate || 0).toFixed(0)}%
            </p>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Action completion rate
            </p>
          </div>
        </div>
      </div>

      {/* Action Breakdown */}
      {statistics?.agent && (
        <div className={`backdrop-blur-sm p-6 rounded-xl border shadow-xl ${isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Action Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
              <CheckCircleIcon className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <div className="text-3xl font-bold text-emerald-400">{statistics.agent.completed}</div>
              <div className="text-sm text-emerald-400/70">Completed</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
              <XCircleIcon className="w-8 h-8 mx-auto text-red-400 mb-2" />
              <div className="text-3xl font-bold text-red-400">{statistics.agent.failed}</div>
              <div className="text-sm text-red-400/70">Failed</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20">
              <XCircleIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <div className="text-3xl font-bold text-gray-400">{statistics.agent.rejected}</div>
              <div className="text-sm text-gray-400/70">Rejected</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
              <ClockIcon className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
              <div className="text-3xl font-bold text-yellow-400">{statistics.agent.timeout}</div>
              <div className="text-sm text-yellow-400/70">Timeout</div>
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
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-orange-500 text-white'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending Actions Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingActions.length === 0 ? (
            <div className={`backdrop-blur-sm p-12 rounded-xl border text-center ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
              <CheckCircleIcon className="w-16 h-16 mx-auto text-emerald-400 mb-4" />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No Pending Actions
              </h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                All actions have been processed
              </p>
            </div>
          ) : (
            pendingActions.map((action) => (
              <div key={action.action_id} className={`backdrop-blur-sm p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50 hover:border-orange-500/30' : 'bg-white border-gray-200 hover:border-orange-300'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <ExclamationTriangleIcon className={`w-6 h-6 ${getSeverityColor(action.severity) === 'red' ? 'text-red-400' : getSeverityColor(action.severity) === 'orange' ? 'text-orange-400' : 'text-yellow-400'}`} />
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
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <span className="font-semibold text-cyan-400">Type:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.action_type}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <span className="font-semibold text-purple-400">Target:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.target}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <span className="font-semibold text-blue-400">Created:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(action.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => approveAction(action.action_id, true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-emerald-500/30"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => approveAction(action.action_id, false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-red-500/30"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Action</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Severity</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Approved By</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/30' : 'divide-gray-200'}`}>
                {actionHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <QueueListIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No action history yet</p>
                    </td>
                  </tr>
                ) : (
                  actionHistory.map((action, idx) => (
                    <tr key={idx} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'}`}>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(action.created_at).toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {action.description}
                      </td>
                      <td className="px-6 py-4">
                        <Badge color="blue">{action.action_type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={getSeverityColor(action.severity)}>
                          {action.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={getStatusColor(action.status)}>
                          {action.status}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {action.approved_by || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && agentStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`backdrop-blur-sm p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-cyan-400" />
              Auto-Approval Settings
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Low Severity', value: agentStatus.config.auto_approve_low },
                { label: 'Medium Severity', value: agentStatus.config.auto_approve_medium },
                { label: 'High Severity', value: agentStatus.config.auto_approve_high },
                { label: 'Critical Severity', value: agentStatus.config.auto_approve_critical },
              ].map((item) => (
                <div key={item.label} className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.label}</span>
                  <Badge color={item.value ? 'green' : 'red'}>
                    {item.value ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className={`backdrop-blur-sm p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <CogIcon className="w-5 h-5 mr-2 text-purple-400" />
              Feature Flags
            </h3>
            <div className="space-y-3">
              {Object.entries(agentStatus.config.features).map(([feature, enabled]) => (
                <div key={feature} className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                  <span className={`capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {feature.replace(/_/g, ' ')}
                  </span>
                  <Badge color={enabled ? 'green' : 'red'}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className={`backdrop-blur-sm p-6 rounded-xl border md:col-span-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <ClockIcon className="w-5 h-5 mr-2 text-orange-400" />
              Limits & Timeouts
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approval Timeout</div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {Math.floor(agentStatus.config.approval_timeout / 60)} min
                </div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Max Concurrent Actions</div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {agentStatus.config.max_concurrent}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`backdrop-blur-sm p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <QueueListIcon className="w-5 h-5 mr-2 text-blue-400" />
              Recent Actions
            </h3>
            <div className="space-y-3">
              {actionHistory.length === 0 ? (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No recent actions</p>
              ) : (
                actionHistory.slice(0, 5).map((action, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-3 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-900/30 hover:bg-slate-900/50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{action.description}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(action.created_at).toLocaleString()}</div>
                    </div>
                    <Badge color={getStatusColor(action.status)}>
                      {action.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`backdrop-blur-sm p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <CpuChipIcon className="w-5 h-5 mr-2 text-emerald-400" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50'}`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Agent</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${agentStatus?.is_running ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <Badge color={agentStatus?.is_running ? 'green' : 'red'}>
                    {agentStatus?.is_running ? 'Running' : 'Stopped'}
                  </Badge>
                </div>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50'}`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Scheduler</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${statistics?.scheduler?.is_running ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <Badge color={statistics?.scheduler?.is_running ? 'green' : 'red'}>
                    {statistics?.scheduler?.is_running ? 'Running' : 'Stopped'}
                  </Badge>
                </div>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50'}`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Queued Jobs</span>
                <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {statistics?.scheduler?.queued_jobs || 0}
                </span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50'}`}>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Running Jobs</span>
                <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {statistics?.scheduler?.running_jobs || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
