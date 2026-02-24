import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { playbooks } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import {
  DocumentTextIcon,
  ClockIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

/**
 * Playbooks Dashboard
 * Manage automated incident response workflows
 */
export default function PlaybooksDashboard() {
  const { isDarkMode } = useTheme()
  const { isDemoMode } = useDemoMode()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  // Data state
  const [engineStatus, setEngineStatus] = useState(null)
  const [playbookList, setPlaybookList] = useState([])
  const [executions, setExecutions] = useState([])
  const [expandedPlaybooks, setExpandedPlaybooks] = useState(new Set())
  const [expandedExecutions, setExpandedExecutions] = useState(new Set())
  const [togglingId, setTogglingId] = useState(null)
  const isLiveMode = !isDemoMode

  // Trigger form state
  const [triggerPlaybookId, setTriggerPlaybookId] = useState('')
  const [triggerEventType, setTriggerEventType] = useState('')
  const [triggerSeverity, setTriggerSeverity] = useState('high')
  const [triggerJsonData, setTriggerJsonData] = useState('{\n  "target": "host-01",\n  "threat_type": "ransomware"\n}')
  const [triggering, setTriggering] = useState(false)

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    if (activeTab === 'executions') {
      fetchExecutions()
    }
  }, [activeTab])

  useEffect(() => {
    if (!isLiveMode) return
    const poll = async () => {
      try {
        const [statusData, listData, execData] = await Promise.all([
          playbooks.getStatus().catch(() => null),
          playbooks.list().catch(() => null),
          playbooks.getExecutions(50).catch(() => null),
        ])
        if (statusData !== null) setEngineStatus(statusData)
        if (listData !== null) {
          setPlaybookList(Array.isArray(listData?.playbooks) ? listData.playbooks : [])
        }
        if (execData !== null) {
          setExecutions(Array.isArray(execData?.executions) ? execData.executions : [])
        }
      } catch (err) {
        console.error('Live poll error:', err)
      }
    }
    poll()
    const interval = setInterval(poll, 15000)
    return () => clearInterval(interval)
  }, [isLiveMode])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [statusData, listData] = await Promise.all([
        playbooks.getStatus().catch(() => null),
        playbooks.list().catch(() => ({ playbooks: [], count: 0 })),
      ])
      setEngineStatus(statusData)
      setPlaybookList(Array.isArray(listData?.playbooks) ? listData.playbooks : [])
      if (!triggerPlaybookId && listData?.playbooks?.length > 0) {
        setTriggerPlaybookId(listData.playbooks[0].playbook_id || '')
      }
    } catch (err) {
      console.error('Failed to fetch playbook data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchExecutions = async () => {
    try {
      const data = await playbooks.getExecutions(50).catch(() => ({ executions: [], total: 0 }))
      setExecutions(Array.isArray(data?.executions) ? data.executions : [])
    } catch (err) {
      console.error('Failed to fetch executions:', err)
    }
  }

  const handleTogglePlaybook = async (playbook) => {
    setTogglingId(playbook.playbook_id)
    try {
      if (playbook.enabled) {
        await playbooks.disable(playbook.playbook_id)
        showNotif(`Disabled: ${playbook.name}`)
      } else {
        await playbooks.enable(playbook.playbook_id)
        showNotif(`Enabled: ${playbook.name}`)
      }
      await fetchAllData()
    } catch (err) {
      showNotif(`Failed to toggle playbook: ${err.message}`, 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const handleTrigger = async () => {
    if (!triggerPlaybookId) {
      showNotif('Please select a playbook', 'error')
      return
    }
    if (!triggerEventType.trim()) {
      showNotif('Please enter an event type', 'error')
      return
    }
    let parsedData = {}
    try {
      parsedData = JSON.parse(triggerJsonData || '{}')
    } catch {
      showNotif('Invalid JSON in data field', 'error')
      return
    }
    setTriggering(true)
    try {
      const result = await playbooks.trigger(triggerPlaybookId, {
        event_type: triggerEventType.trim(),
        severity: triggerSeverity,
        data: parsedData,
      })
      showNotif(`Playbook triggered — execution ID: ${result?.execution_id || 'started'}`, 'success')
      if (activeTab === 'executions') {
        await fetchExecutions()
      }
    } catch (err) {
      showNotif(`Trigger failed: ${err?.response?.data?.detail || err.message}`, 'error')
    } finally {
      setTriggering(false)
    }
  }

  const togglePlaybookExpand = (id) => {
    setExpandedPlaybooks((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleExecutionExpand = (id) => {
    setExpandedExecutions((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const formatTimestamp = (ts) => {
    if (!ts) return '—'
    try {
      return new Date(ts).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return ts
    }
  }

  const getExecutionStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success'
      case 'partial': return 'warning'
      case 'aborted': return 'danger'
      case 'running': return 'info'
      default: return 'default'
    }
  }

  const getSeverityVariant = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical'
      case 'high': return 'high'
      case 'medium': return 'medium'
      case 'low': return 'low'
      default: return 'informational'
    }
  }

  const getOnFailureColor = (policy) => {
    switch (policy?.toLowerCase()) {
      case 'abort': return 'text-red-400'
      case 'continue': return 'text-green-400'
      case 'skip_remaining': return 'text-yellow-400'
      default: return isDarkMode ? 'text-gray-400' : 'text-gray-600'
    }
  }

  // Stats derived from data
  const enabledCount = playbookList.filter((p) => p.enabled).length
  const totalExecutions = executions.length

  const tabs = [
    { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
    { id: 'executions', label: 'Executions', icon: ClockIcon },
    { id: 'trigger', label: 'Manual Trigger', icon: BoltIcon },
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
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <DocumentTextIcon className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Response Playbooks
                </h1>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Manage automated incident response workflows
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Engine Status */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Engine Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                    engineStatus?.running ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`} />
                  <span className={`font-semibold ${engineStatus?.running ? 'text-green-400' : 'text-red-400'}`}>
                    {engineStatus?.running ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>
              <CheckCircleIcon className={`w-8 h-8 ${engineStatus?.running ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>

          {/* Total Playbooks */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Playbooks</p>
                <p className="text-2xl font-bold mt-1">{playbookList.length}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* Enabled Count */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enabled</p>
                <p className="text-2xl font-bold mt-1 text-green-400">{enabledCount}</p>
              </div>
              <PlayIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Total Executions */}
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Executions</p>
                <p className="text-2xl font-bold mt-1">{totalExecutions}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {playbookList.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-12 text-center`}>
                <DocumentTextIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Playbooks Found</p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  No response playbooks are currently configured.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {playbookList.map((playbook) => {
                  const isExpanded = expandedPlaybooks.has(playbook.playbook_id)
                  const isToggling = togglingId === playbook.playbook_id
                  const steps = Array.isArray(playbook.steps) ? playbook.steps : []
                  return (
                    <div
                      key={playbook.playbook_id}
                      className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border transition-colors`}
                    >
                      {/* Card Header — clickable to expand */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => togglePlaybookExpand(playbook.playbook_id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-base">{playbook.name}</p>
                              <Badge
                                variant={playbook.enabled ? 'success' : 'default'}
                                size="xs"
                              >
                                {playbook.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            <p className={`text-xs mb-2 font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {playbook.playbook_id}
                            </p>
                            <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span>
                                Trigger:{' '}
                                <span className="text-purple-400 font-medium">
                                  {playbook.trigger_event_type || '—'}
                                </span>
                              </span>
                              <span>
                                Min Severity:{' '}
                                <Badge variant={getSeverityVariant(playbook.min_severity)} size="xs">
                                  {playbook.min_severity || 'any'}
                                </Badge>
                              </span>
                              <span>
                                Steps:{' '}
                                <span className="font-medium">{steps.length}</span>
                              </span>
                              {playbook.cooldown_seconds != null && (
                                <span>
                                  Cooldown:{' '}
                                  <span className="font-medium">{playbook.cooldown_seconds}s</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTogglePlaybook(playbook)
                              }}
                              disabled={isToggling}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                playbook.enabled
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : isDarkMode
                                  ? 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                              }`}
                            >
                              {isToggling ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              ) : playbook.enabled ? (
                                'Disable'
                              ) : (
                                'Enable'
                              )}
                            </button>
                            {isExpanded ? (
                              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Steps */}
                      {isExpanded && steps.length > 0 && (
                        <div className={`border-t px-4 pb-4 pt-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Steps
                          </p>
                          <div className="space-y-2">
                            {steps.map((step, idx) => (
                              <div
                                key={idx}
                                className={`flex items-start gap-3 p-2 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}
                              >
                                <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {step.name || step.action || `Step ${idx + 1}`}
                                  </p>
                                  <div className={`flex items-center gap-3 text-xs mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {step.action_type && (
                                      <span className="text-blue-400 font-mono">{step.action_type}</span>
                                    )}
                                    {step.on_failure && (
                                      <span className={getOnFailureColor(step.on_failure)}>
                                        on_failure: {step.on_failure}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isExpanded && steps.length === 0 && (
                        <div className={`border-t px-4 pb-3 pt-3 ${isDarkMode ? 'border-slate-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                          <p className="text-sm">No steps defined for this playbook.</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {executions.length} execution{executions.length !== 1 ? 's' : ''} found
              </p>
              <Button size="sm" onClick={fetchExecutions} variant="secondary">
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>

            {executions.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-12 text-center`}>
                <ClockIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Executions Yet</p>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Playbook executions will appear here once triggered.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {executions.map((exec, idx) => {
                  const execId = exec.execution_id || exec.id || idx
                  const isExpanded = expandedExecutions.has(execId)
                  const stepResults = Array.isArray(exec.step_results) ? exec.step_results : []
                  const stepsCompleted = stepResults.filter((s) =>
                    ['completed', 'success'].includes(s.status?.toLowerCase())
                  ).length
                  const totalSteps = exec.total_steps || stepResults.length || 0

                  return (
                    <div
                      key={execId}
                      className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border`}
                    >
                      {/* Execution Row */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => toggleExecutionExpand(execId)}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <ClockIcon className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatTimestamp(exec.started_at || exec.created_at)}
                          </span>
                          <span className={`font-medium flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {exec.playbook_name || exec.playbook_id || '—'}
                          </span>
                          <Badge variant={getExecutionStatusVariant(exec.status)} size="sm">
                            {exec.status || 'unknown'}
                          </Badge>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stepsCompleted}/{totalSteps} steps
                          </span>
                          {isExpanded ? (
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Step Results */}
                      {isExpanded && stepResults.length > 0 && (
                        <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
                                <tr>
                                  <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Step
                                  </th>
                                  <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Status
                                  </th>
                                  <th className={`px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Duration
                                  </th>
                                </tr>
                              </thead>
                              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                                {stepResults.map((step, sIdx) => (
                                  <tr key={sIdx} className={isDarkMode ? 'hover:bg-slate-700/20' : 'hover:bg-gray-50'}>
                                    <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {step.name || step.step_name || `Step ${sIdx + 1}`}
                                    </td>
                                    <td className="px-4 py-2">
                                      <Badge
                                        variant={getExecutionStatusVariant(step.status)}
                                        size="xs"
                                      >
                                        {step.status || 'unknown'}
                                      </Badge>
                                    </td>
                                    <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {step.duration_ms != null
                                        ? `${(step.duration_ms / 1000).toFixed(2)}s`
                                        : step.duration != null
                                        ? `${step.duration}s`
                                        : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {isExpanded && stepResults.length === 0 && (
                        <div className={`border-t px-4 py-3 ${isDarkMode ? 'border-slate-700 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                          <p className="text-sm">No step results available.</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Manual Trigger Tab */}
        {activeTab === 'trigger' && (
          <div className="max-w-2xl">
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
              <div className="flex items-center gap-2 mb-6">
                <BoltIcon className="w-6 h-6 text-purple-400" />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Manually Trigger Playbook
                </h2>
              </div>

              <div className="space-y-4">
                {/* Playbook Select */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Playbook
                  </label>
                  <select
                    value={triggerPlaybookId}
                    onChange={(e) => setTriggerPlaybookId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 ${
                      isDarkMode
                        ? 'bg-slate-900/50 border-slate-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">— Select a playbook —</option>
                    {playbookList.map((pb) => (
                      <option key={pb.playbook_id} value={pb.playbook_id}>
                        {pb.name} {pb.enabled ? '' : '(disabled)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Type */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={triggerEventType}
                    onChange={(e) => setTriggerEventType(e.target.value)}
                    placeholder="e.g. THREAT_DETECTED"
                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 ${
                      isDarkMode
                        ? 'bg-slate-900/50 border-slate-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Severity
                  </label>
                  <select
                    value={triggerSeverity}
                    onChange={(e) => setTriggerSeverity(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 ${
                      isDarkMode
                        ? 'bg-slate-900/50 border-slate-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* JSON Data */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Event Data (JSON)
                  </label>
                  <textarea
                    value={triggerJsonData}
                    onChange={(e) => setTriggerJsonData(e.target.value)}
                    rows={6}
                    placeholder='{"target": "host-01", "threat_type": "ransomware"}'
                    className={`w-full px-3 py-2 rounded-lg border font-mono text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 ${
                      isDarkMode
                        ? 'bg-slate-900/50 border-slate-700 text-white placeholder-gray-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Must be valid JSON. This data will be passed to the playbook trigger.
                  </p>
                </div>

                {/* Warning for disabled playbook */}
                {triggerPlaybookId && playbookList.find((p) => p.playbook_id === triggerPlaybookId && !p.enabled) && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-orange-900/30 border border-orange-700/50' : 'bg-orange-50 border border-orange-200'}`}>
                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <p className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                      This playbook is currently disabled. It may not execute.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleTrigger}
                  disabled={triggering || !triggerPlaybookId}
                  loading={triggering}
                  fullWidth
                  variant="primary"
                >
                  {triggering ? 'Triggering...' : 'Trigger Playbook'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
