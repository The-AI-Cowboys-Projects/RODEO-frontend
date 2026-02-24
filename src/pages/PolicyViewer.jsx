import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { policy } from '../api/client'
import { useTheme } from '../context/ThemeContext'
import axios from 'axios'
import {
  ShieldCheckIcon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  LockClosedIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowUpCircleIcon,
  BellAlertIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  CloudArrowUpIcon,
  FireIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
  TicketIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { CheckIcon as CheckIconSolid } from '@heroicons/react/24/solid'

const API_BASE = ''

// Axios instance with auth
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rodeo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Stage icons mapping
const StageIcons = {
  data_exfil: CloudArrowUpIcon,
  exploit_attempt: FireIcon,
  persistence: ArrowsRightLeftIcon,
  benign: CheckCircleIcon,
}

export default function PolicyViewer() {
  const { isDarkMode } = useTheme()
  const [policyData, setPolicyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('matrix')
  const [isReloading, setIsReloading] = useState(false)

  useEffect(() => {
    loadPolicy()
  }, [])

  const loadPolicy = async () => {
    try {
      setLoading(true)
      const data = await policy.get()
      setPolicyData(data)
      setError(null)
    } catch (err) {
      console.error('Failed to load policy:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load policy configuration'
      setError(`Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReload = async () => {
    try {
      setIsReloading(true)
      await policy.reload()
      await loadPolicy()
    } catch (err) {
      alert('Failed to reload policy: ' + err.message)
    } finally {
      setIsReloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <span className="text-gray-400 text-lg">Loading policy...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg font-medium mb-2">Failed to Load Policy</div>
          <div className="text-gray-400 text-sm">{error}</div>
          <button
            onClick={loadPolicy}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'matrix', label: 'Action Matrix', icon: TableCellsIcon },
    { id: 'modifiers', label: 'Modifiers', icon: AdjustmentsHorizontalIcon },
    { id: 'approvals', label: 'Approvals', icon: CheckBadgeIcon },
    { id: 'cooldowns', label: 'Cooldowns', icon: ClockIcon },
    { id: 'followups', label: 'Follow-ups', icon: ClipboardDocumentListIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 via-slate-900 to-blue-900/50 rounded-2xl border border-purple-500/20 p-6">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Security Policy Viewer
              </h1>
              <p className="text-gray-400 mt-1 flex items-center gap-2">
                <span>Version</span>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold">
                  {policyData?.version || 'Unknown'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleReload}
            disabled={isReloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isReloading ? 'animate-spin' : ''}`} />
            {isReloading ? 'Reloading...' : 'Reload Policy'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 p-1.5 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} rounded-xl border`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
        {activeTab === 'matrix' && <ActionMatrixTab data={policyData} isDarkMode={isDarkMode} />}
        {activeTab === 'modifiers' && <ModifiersTab data={policyData} isDarkMode={isDarkMode} />}
        {activeTab === 'approvals' && <ApprovalsTab data={policyData} isDarkMode={isDarkMode} />}
        {activeTab === 'cooldowns' && <CooldownsTab data={policyData} isDarkMode={isDarkMode} />}
        {activeTab === 'followups' && <FollowupsTab data={policyData} isDarkMode={isDarkMode} />}
      </div>
    </div>
  )
}

// Map action types to the page that manages the affected host/resource
const ACTION_ROUTES = {
  isolate_host:           '/edr',
  block_ip:               '/edr',
  quarantine_file:        '/edr',
  terminate_process:      '/edr',
  apply_patch:            '/patches',
  update_firewall_rules:  '/edr',
  disable_service:        '/edr',
  create_jira_ticket:     '/settings',
  send_notification:      '/pipeline',
  enforce_policy:         '/compliance',
  revoke_permissions:     '/users',
  enforce_encryption:     '/compliance',
  run_triage:             '/approvals',
  investigate:            '/approvals',
  escalate:               '/approvals',
}

function ActionMatrixTab({ data, isDarkMode }) {
  const navigate = useNavigate()
  const actions = data?.actions || {}
  const baseMatrix = data?.base_matrix || {}
  const stages = ['data_exfil', 'exploit_attempt', 'persistence', 'benign']
  const severities = ['critical', 'high', 'medium', 'low']

  const getSeverityStyle = (severity) => {
    const styles = {
      critical: 'from-red-500/20 to-red-600/10 border-red-500/40 text-red-400',
      high: 'from-orange-500/20 to-orange-600/10 border-orange-500/40 text-orange-400',
      medium: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/40 text-yellow-400',
      low: 'from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-400',
    }
    return styles[severity] || 'from-gray-500/20 to-gray-600/10 border-gray-500/40 text-gray-400'
  }

  const getSeverityBadgeStyle = (severity) => {
    const styles = {
      critical: 'bg-red-500/20 text-red-400 ring-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 ring-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
    }
    return styles[severity] || 'bg-gray-500/20 text-gray-400 ring-gray-500/30'
  }

  return (
    <div className="space-y-8">
      {/* Actions Legend */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BoltIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Available Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(actions).map(([key, description]) => {
            const route = ACTION_ROUTES[key]
            return (
              <div
                key={key}
                onClick={() => route && navigate(route)}
                className={`group ${isDarkMode ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/50' : 'bg-white border-gray-200'} rounded-xl p-4 border hover:border-purple-500/50 transition-all hover:scale-[1.02] ${
                  route ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-mono text-sm font-bold text-purple-400">{key}</div>
                  {route && (
                    <ArrowTopRightOnSquareIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} group-hover:text-purple-400 transition-colors`} />
                  )}
                </div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>{description}</div>
                {route && (
                  <div className={`mt-2 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} group-hover:text-purple-400/60 transition-colors`}>
                    Go to {route.replace('/', '')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Matrix Table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TableCellsIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Action Matrix</h3>
        </div>
        <div className={`overflow-x-auto rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
          <table className="w-full">
            <thead>
              <tr className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                <th className={`text-left py-4 px-5 font-medium ${isDarkMode ? 'text-gray-400 border-slate-700/50' : 'text-gray-600 border-gray-200'} border-b`}>Stage</th>
                {severities.map((sev) => (
                  <th key={sev} className={`text-left py-4 px-5 font-medium border-b ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
                    <span className={`px-3 py-1 rounded-full text-sm capitalize ring-1 ${getSeverityBadgeStyle(sev)}`}>
                      {sev}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, idx) => {
                const StageIcon = StageIcons[stage] || ShieldCheckIcon
                return (
                  <tr
                    key={stage}
                    className={`border-b ${isDarkMode ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-gray-100 hover:bg-gray-50'} transition-colors ${
                      idx % 2 === 0 ? (isDarkMode ? 'bg-slate-800/30' : 'bg-gray-50/50') : ''
                    }`}
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <StageIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium capitalize`}>{stage.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    {severities.map((severity) => {
                      const key = `${stage}_${severity}`
                      const action = baseMatrix[key]
                      return (
                        <td key={severity} className="py-4 px-5">
                          {action ? (
                            <div
                              onClick={() => ACTION_ROUTES[action] && navigate(ACTION_ROUTES[action])}
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg border bg-gradient-to-r ${getSeverityStyle(severity)} font-mono text-sm ${
                                ACTION_ROUTES[action] ? 'cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all' : ''
                              }`}
                            >
                              {action}
                            </div>
                          ) : (
                            <span className="text-gray-600">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Urgency Mapping */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Urgency by Severity</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(data?.urgency_by_severity || {}).map(([severity, urgency]) => (
            <div
              key={severity}
              className={`rounded-xl p-5 border bg-gradient-to-br ${getSeverityStyle(severity)} text-center group hover:scale-105 transition-transform`}
            >
              <div className="text-sm capitalize mb-2 opacity-80">{severity}</div>
              <div className="text-4xl font-bold">{urgency}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ModifiersTab({ data, isDarkMode }) {
  const modifiers = data?.modifiers || {}

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-400" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Policy Modifiers</h3>
      </div>

      <div className="grid gap-4">
        {Object.entries(modifiers).map(([name, config]) => (
          <div
            key={name}
            className={`${isDarkMode ? 'bg-gradient-to-r from-slate-800/80 to-slate-900/50 border-slate-700/50' : 'bg-white border-gray-200'} rounded-xl p-5 border hover:border-purple-500/30 transition-colors`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.enabled ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  {config.enabled ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold text-lg capitalize`}>{name.replace(/_/g, ' ')}</h4>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  config.enabled
                    ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                    : 'bg-gray-500/20 text-gray-500 ring-1 ring-gray-500/30'
                }`}
              >
                {config.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {config.escalate_to && (
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>
                    <ArrowUpCircleIcon className="w-4 h-4" />
                    Escalate to
                  </div>
                  <div className="text-purple-400 font-mono font-semibold">{config.escalate_to}</div>
                </div>
              )}
              {config.urgency && (
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>
                    <BoltIcon className="w-4 h-4" />
                    Urgency
                  </div>
                  <div className="text-orange-400 font-bold">{config.urgency}</div>
                </div>
              )}
              {config.threshold && (
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>
                    <ChartBarIcon className="w-4 h-4" />
                    Threshold
                  </div>
                  <div className="text-yellow-400 font-bold">{config.threshold}</div>
                </div>
              )}
              {config.notify && config.notify.length > 0 && (
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3 col-span-2 lg:col-span-1`}>
                  <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-2`}>
                    <BellAlertIcon className="w-4 h-4" />
                    Notify Teams
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {config.notify.map((team) => (
                      <span key={team} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ApprovalsTab({ data, isDarkMode }) {
  const approvals = data?.approvals?.rules || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckBadgeIcon className="w-5 h-5 text-purple-400" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Approval Rules</h3>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CheckBadgeIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No approval rules configured</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {approvals.map((rule, index) => (
            <div
              key={index}
              className={`${isDarkMode ? 'bg-gradient-to-r from-slate-800/80 to-slate-900/50 border-slate-700/50' : 'bg-white border-gray-200'} rounded-xl p-5 border hover:border-green-500/30 transition-colors`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <LockClosedIcon className="w-5 h-5 text-green-400" />
                </div>
                <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold text-lg`}>{rule.name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {rule.when?.urgency_at_least && (
                  <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>Minimum Urgency</div>
                    <div className="text-orange-400 font-bold text-lg">{rule.when.urgency_at_least}</div>
                  </div>
                )}
                {rule.require?.approver_group && (
                  <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                    <div className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>
                      <UserGroupIcon className="w-4 h-4" />
                      Approver Group
                    </div>
                    <div className="text-purple-400 font-semibold">{rule.require.approver_group}</div>
                  </div>
                )}
              </div>

              {rule.require?.reason && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    Required Reason
                  </div>
                  <div className="text-yellow-200 text-sm">{rule.require.reason}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CooldownsTab({ data, isDarkMode }) {
  const cooldowns = data?.cooldowns || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5 text-purple-400" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cooldown Policies</h3>
      </div>

      {cooldowns.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No cooldown policies configured</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cooldowns.map((cooldown, index) => (
            <div
              key={index}
              className={`${isDarkMode ? 'bg-gradient-to-r from-slate-800/80 to-slate-900/50 border-slate-700/50' : 'bg-white border-gray-200'} rounded-xl p-5 border hover:border-blue-500/30 transition-colors`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold text-lg`}>{cooldown.name}</h4>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>Window</div>
                  <div className="text-blue-400 font-bold">{cooldown.window_seconds}s</div>
                  <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>({Math.floor(cooldown.window_seconds / 60)} min)</div>
                </div>
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>On Violation</div>
                  <div className="text-orange-400 font-semibold">{cooldown.on_violation}</div>
                </div>
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>Scope</div>
                  <div className="text-purple-400 font-semibold">{cooldown.match?.scope}</div>
                </div>
              </div>

              {cooldown.reason && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-1">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Reason
                  </div>
                  <div className="text-orange-200 text-sm">{cooldown.reason}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FollowupsTab({ data, isDarkMode }) {
  const followups = data?.followups_by_stage || {}

  // Load persisted data from localStorage
  const [actionStatus, setActionStatus] = useState(() => {
    const saved = localStorage.getItem('rodeo_action_status')
    return saved ? JSON.parse(saved) : {}
  })

  const [assignedTo, setAssignedTo] = useState(() => {
    const saved = localStorage.getItem('rodeo_assigned_to')
    return saved ? JSON.parse(saved) : {}
  })

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('rodeo_shift_notes')
    return saved ? JSON.parse(saved) : {}
  })

  const [showShiftReport, setShowShiftReport] = useState(false)
  const [creatingTicket, setCreatingTicket] = useState(null)

  // Determine severity based on stage
  const determineSeverity = (stage) => {
    if (stage === 'data_exfil' || stage === 'exploit_attempt') return 'CRITICAL'
    if (stage === 'persistence') return 'HIGH'
    return 'MEDIUM'
  }

  // Create Jira ticket for action
  const createJiraTicket = async (stage, action, index) => {
    const key = `${stage}-${index}`
    setCreatingTicket(key)

    try {
      const response = await api.post('/api/jira/create-followup-ticket', {
        action_type: action.split(':')[0] || 'ACTION',
        stage: stage,
        severity: determineSeverity(stage),
        description: action,
        affected_asset: assignedTo[key] || null,
        context: {
          policy: 'Security Policy',
          stage: stage.replace(/_/g, ' '),
          created_at: new Date().toISOString(),
          shift_note: notes[key] || null
        },
        follow_up_actions: [action],
        priority: 'High'
      })

      if (response.data) {
        alert(`✅ Jira ticket created!\n\nTicket ID: ${response.data.ticket_id}\nURL: ${response.data.ticket_url}`)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message

      if (errorMsg.includes('not configured')) {
        alert(`⚠️ Jira not configured\n\nGo to Settings → Jira to configure.`)
      } else {
        alert(`❌ Failed to create ticket\n\nError: ${errorMsg}`)
      }
    } finally {
      setCreatingTicket(null)
    }
  }

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('rodeo_action_status', JSON.stringify(actionStatus))
  }, [actionStatus])

  useEffect(() => {
    localStorage.setItem('rodeo_assigned_to', JSON.stringify(assignedTo))
  }, [assignedTo])

  useEffect(() => {
    localStorage.setItem('rodeo_shift_notes', JSON.stringify(notes))
  }, [notes])

  const toggleActionStatus = (stage, index) => {
    const key = `${stage}-${index}`
    setActionStatus(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const totalActions = Object.keys(followups).reduce((sum, stage) => sum + followups[stage].length, 0)
  const completedCount = Object.keys(actionStatus).filter(k => actionStatus[k]).length
  const progressPercent = totalActions > 0 ? (completedCount / totalActions) * 100 : 0

  const exportShiftReport = () => {
    const completedActions = []
    const pendingActions = []

    Object.entries(followups).forEach(([stage, actions]) => {
      actions.forEach((action, index) => {
        const key = `${stage}-${index}`
        const actionData = {
          stage: stage.replace(/_/g, ' '),
          action,
          assigned: assignedTo[key] || 'Unassigned',
          status: actionStatus[key] ? 'Completed' : 'Pending',
          notes: notes[key] || 'No notes'
        }
        if (actionStatus[key]) {
          completedActions.push(actionData)
        } else {
          pendingActions.push(actionData)
        }
      })
    })

    const reportText = `SHIFT TURNOVER REPORT\nGenerated: ${new Date().toLocaleString()}\n${'='.repeat(60)}\n\nSUMMARY:\n- Total: ${totalActions}\n- Completed: ${completedCount}\n- Pending: ${totalActions - completedCount}\n- Progress: ${progressPercent.toFixed(1)}%\n\nCOMPLETED:\n${completedActions.map((a, i) => `${i + 1}. [${a.stage}] ${a.action}\n   Assigned: ${a.assigned}\n   Notes: ${a.notes}`).join('\n')}\n\nPENDING:\n${pendingActions.map((a, i) => `${i + 1}. [${a.stage}] ${a.action}\n   Assigned: ${a.assigned}\n   Notes: ${a.notes}`).join('\n')}`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shift-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (window.confirm('Clear all shift data?')) {
      setActionStatus({})
      setAssignedTo({})
      setNotes({})
      localStorage.removeItem('rodeo_action_status')
      localStorage.removeItem('rodeo_assigned_to')
      localStorage.removeItem('rodeo_shift_notes')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardDocumentListIcon className="w-5 h-5 text-purple-400" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Follow-up Actions</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowShiftReport(!showShiftReport)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
          >
            <ChartBarIcon className="w-4 h-4" />
            {showShiftReport ? 'Hide' : 'Show'} Summary
          </button>
          <button
            onClick={exportShiftReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={clearAllData}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            <XCircleIcon className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Shift Progress</span>
          <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold`}>{completedCount}/{totalActions}</span>
        </div>
        <div className={`h-3 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'} rounded-full overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Summary Panel */}
      {showShiftReport && (
        <div className="grid grid-cols-4 gap-4">
          <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalActions}</div>
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Total</div>
          </div>
          <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
            <div className="text-3xl font-bold text-green-400">{completedCount}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 text-center border border-yellow-500/20">
            <div className="text-3xl font-bold text-yellow-400">{totalActions - completedCount}</div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 text-center border border-purple-500/20">
            <div className="text-3xl font-bold text-purple-400">{Object.keys(assignedTo).length}</div>
            <div className="text-gray-400 text-sm">Assigned</div>
          </div>
        </div>
      )}

      {/* Action Items */}
      {Object.entries(followups).map(([stage, actions]) => {
        const StageIcon = StageIcons[stage] || ShieldCheckIcon
        const stageCompleted = actions.filter((_, i) => actionStatus[`${stage}-${i}`]).length

        return (
          <div key={stage} className={`${isDarkMode ? 'bg-slate-900/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'} rounded-xl p-5 border`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <StageIcon className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold capitalize text-lg`}>{stage.replace(/_/g, ' ')}</h4>
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {stageCompleted}/{actions.length} completed
              </span>
            </div>

            <div className="space-y-3">
              {actions.map((action, index) => {
                const key = `${stage}-${index}`
                const isCompleted = actionStatus[key]
                const isCreating = creatingTicket === key

                return (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border transition-all ${
                      isCompleted
                        ? 'bg-green-500/5 border-green-500/30'
                        : `${isDarkMode ? 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600/50' : 'bg-white border-gray-200 hover:border-gray-300'}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleActionStatus(stage, index)}
                        className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-500 hover:border-green-500'
                        }`}
                      >
                        {isCompleted && <CheckIconSolid className="w-4 h-4 text-white" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>
                            {action}
                          </div>
                          <button
                            onClick={() => createJiraTicket(stage, action, index)}
                            disabled={isCreating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Create Jira Ticket"
                          >
                            <TicketIcon className={`w-4 h-4 ${isCreating ? 'animate-pulse' : ''}`} />
                            {isCreating ? 'Creating...' : 'Jira'}
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Assign to..."
                            value={assignedTo[key] || ''}
                            onChange={(e) => setAssignedTo(prev => ({ ...prev, [key]: e.target.value }))}
                            className={`px-3 py-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-600/50 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg text-sm focus:outline-none focus:border-purple-500/50`}
                          />
                          <input
                            type="text"
                            placeholder="Add note..."
                            value={notes[key] || ''}
                            onChange={(e) => setNotes(prev => ({ ...prev, [key]: e.target.value }))}
                            className={`px-3 py-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-600/50 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg text-sm focus:outline-none focus:border-purple-500/50`}
                          />
                        </div>

                        {(assignedTo[key] || notes[key]) && (
                          <div className="mt-2 flex gap-4 text-xs text-gray-400">
                            {assignedTo[key] && (
                              <span className="flex items-center gap-1">
                                <UserGroupIcon className="w-3 h-3" />
                                {assignedTo[key]}
                              </span>
                            )}
                            {notes[key] && (
                              <span className="flex items-center gap-1">
                                <DocumentTextIcon className="w-3 h-3" />
                                {notes[key]}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
          <SparklesIcon className="w-5 h-5" />
          Shift Turnover Tips
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-400" />
            Check boxes when done
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-400" />
            Assign for accountability
          </div>
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-green-400" />
            Add notes for handoff
          </div>
          <div className="flex items-center gap-2">
            <TicketIcon className="w-4 h-4 text-cyan-400" />
            Create Jira tickets
          </div>
        </div>
      </div>
    </div>
  )
}
