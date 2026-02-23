import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { feedback } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import {
  ArrowPathIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BeakerIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTimestamp(ts) {
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

function formatDuration(seconds) {
  if (seconds == null) return '—'
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  return `${(seconds / 60).toFixed(1)}m`
}

function rateColor(rate) {
  if (rate >= 0.8) return '#22c55e'  // green-500
  if (rate >= 0.5) return '#eab308'  // yellow-500
  return '#ef4444'                   // red-500
}

function RateBar({ rate, isDarkMode }) {
  const pct = Math.min(Math.max((rate ?? 0) * 100, 0), 100)
  const color = rateColor(rate ?? 0)
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex-1 rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
      >
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color }}>
        {pct.toFixed(0)}%
      </span>
    </div>
  )
}

const VERDICT_BADGES = {
  SUCCESS:      { label: 'Success',      cls: 'bg-green-600 text-white' },
  PARTIAL:      { label: 'Partial',      cls: 'bg-yellow-500 text-gray-900' },
  INEFFECTIVE:  { label: 'Ineffective',  cls: 'bg-orange-500 text-white' },
  FAILED:       { label: 'Failed',       cls: 'bg-red-600 text-white' },
  PENDING:      { label: 'Pending',      cls: 'bg-gray-600 text-white' },
}

function VerdictBadge({ verdict }) {
  const cfg = VERDICT_BADGES[verdict?.toUpperCase()] || VERDICT_BADGES.PENDING
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function SeverityBadge({ severity }) {
  const map = {
    critical: 'bg-red-600 text-white',
    high:     'bg-orange-600 text-white',
    medium:   'bg-yellow-500 text-gray-900',
    low:      'bg-blue-600 text-white',
  }
  const cls = map[severity?.toLowerCase()] || 'bg-gray-600 text-white'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {severity || 'unknown'}
    </span>
  )
}

function recommendationBorderColor(text) {
  const lower = (text || '').toLowerCase()
  if (lower.includes('fail') || lower.includes('ineffective') || lower.includes('critical'))
    return 'border-red-500'
  if (lower.includes('warn') || lower.includes('high') || lower.includes('underperform'))
    return 'border-orange-500'
  return 'border-blue-500'
}

function recommendationIcon(text) {
  const lower = (text || '').toLowerCase()
  if (lower.includes('fail') || lower.includes('ineffective'))
    return <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
  if (lower.includes('warn') || lower.includes('underperform'))
    return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
  return <LightBulbIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FeedbackDashboard() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('effectiveness')
  const [loading, setLoading] = useState(true)

  // Data state
  const [statusData, setStatusData] = useState(null)
  const [actionEffectiveness, setActionEffectiveness] = useState([])
  const [playbookEffectiveness, setPlaybookEffectiveness] = useState([])
  const [outcomes, setOutcomes] = useState([])
  const [incidents, setIncidents] = useState([])
  const [multipliers, setMultipliers] = useState({})
  const [recommendations, setRecommendations] = useState([])

  // UI state
  const [notification, setNotification] = useState(null)
  const [expandedIncident, setExpandedIncident] = useState(null)
  const [assessingAction, setAssessingAction] = useState(null)
  const [assessForm, setAssessForm] = useState({ verdict: 'success', reason: '' })
  const [autoAssessing, setAutoAssessing] = useState(false)

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [
        statusRes,
        actionEffRes,
        playbookEffRes,
        outcomesRes,
        incidentsRes,
        multipliersRes,
        recommendationsRes,
      ] = await Promise.all([
        feedback.getStatus().catch(() => null),
        feedback.getActionEffectiveness().catch(() => ({ action_types: [] })),
        feedback.getPlaybookEffectiveness().catch(() => ({ playbooks: [] })),
        feedback.getOutcomes(50).catch(() => ({ outcomes: [] })),
        feedback.getIncidents(30).catch(() => ({ incidents: [] })),
        feedback.getMultipliers().catch(() => ({ multipliers: {} })),
        feedback.getRecommendations().catch(() => ({ recommendations: [] })),
      ])

      setStatusData(statusRes)
      setActionEffectiveness(Array.isArray(actionEffRes?.action_types) ? actionEffRes.action_types : [])
      setPlaybookEffectiveness(Array.isArray(playbookEffRes?.playbooks) ? playbookEffRes.playbooks : [])
      setOutcomes(Array.isArray(outcomesRes?.outcomes) ? outcomesRes.outcomes : [])
      setIncidents(Array.isArray(incidentsRes?.incidents) ? incidentsRes.incidents : [])
      setMultipliers(multipliersRes?.multipliers || {})
      setRecommendations(Array.isArray(recommendationsRes?.recommendations) ? recommendationsRes.recommendations : [])
    } catch (err) {
      console.error('FeedbackDashboard fetch error:', err)
      showNotif('Failed to load feedback data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleAutoAssess = async () => {
    setAutoAssessing(true)
    try {
      const result = await feedback.autoAssess()
      const count = result?.assessed_count ?? 0
      showNotif(`Auto-assessed ${count} pending outcome${count !== 1 ? 's' : ''}`, 'success')
      await fetchAll()
    } catch {
      showNotif('Auto-assess failed', 'error')
    } finally {
      setAutoAssessing(false)
    }
  }

  const handleAssessSubmit = async (actionId) => {
    try {
      await feedback.assessOutcome(actionId, {
        verdict: assessForm.verdict,
        reason: assessForm.reason,
      })
      showNotif('Outcome assessed successfully', 'success')
      setAssessingAction(null)
      setAssessForm({ verdict: 'success', reason: '' })
      await fetchAll()
    } catch {
      showNotif('Failed to assess outcome', 'error')
    }
  }

  const handleIncidentClick = (id) => {
    setExpandedIncident(prev => (prev === id ? null : id))
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const engineRunning = statusData?.running === true
  const actionTypeCount = actionEffectiveness.length
  const totalOutcomes = outcomes.length
  const recommendationCount = recommendations.length
  const pendingCount = outcomes.filter(o => (o.verdict || '').toUpperCase() === 'PENDING').length

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'effectiveness',   label: 'Effectiveness',   icon: ChartBarIcon },
    { id: 'outcomes',        label: 'Outcomes',         icon: ClipboardDocumentCheckIcon },
    { id: 'incidents',       label: 'Incidents',        icon: ExclamationTriangleIcon },
    { id: 'recommendations', label: 'Recommendations',  icon: LightBulbIcon },
    { id: 'multipliers',     label: 'Multipliers',      icon: AdjustmentsHorizontalIcon },
  ]

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && !statusData) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading feedback data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Multiplier data ────────────────────────────────────────────────────────
  const multiplierEntries = Object.entries(multipliers)
  const maxMultiplier = multiplierEntries.length
    ? Math.max(...multiplierEntries.map(([, v]) => Math.abs(v - 1.0)))
    : 0.5

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <SparklesIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Feedback Loop
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Action effectiveness tracking and adaptive learning
              </p>
            </div>
          </div>
          <Button size="sm" onClick={fetchAll} className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Engine Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      engineRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                  <span className={`font-semibold ${engineRunning ? 'text-green-400' : 'text-red-400'}`}>
                    {engineRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>
              {engineRunning
                ? <CheckCircleIcon className="w-8 h-8 text-green-500" />
                : <XCircleIcon className="w-8 h-8 text-red-500" />
              }
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Action Types Tracked
                </p>
                <p className="text-2xl font-bold mt-1">{actionTypeCount}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Outcomes
                </p>
                <p className="text-2xl font-bold mt-1">{totalOutcomes}</p>
                {pendingCount > 0 && (
                  <p className="text-xs text-yellow-500 mt-0.5">{pendingCount} pending</p>
                )}
              </div>
              <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Recommendations
                </p>
                <p className="text-2xl font-bold mt-1">{recommendationCount}</p>
              </div>
              <LightBulbIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
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

        {/* ── EFFECTIVENESS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'effectiveness' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Action Type Effectiveness */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-purple-400" />
                Action Type Effectiveness
              </h3>
              {actionEffectiveness.length === 0 ? (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No action effectiveness data yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {actionEffectiveness.map((action) => (
                    <div
                      key={action.name}
                      className={`p-3 rounded-lg border ${
                        isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {(action.name || '').replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {action.total ?? 0} runs
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <div className={`flex justify-between text-xs mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span>Success</span>
                          </div>
                          <RateBar rate={action.success_rate} isDarkMode={isDarkMode} />
                        </div>
                        <div>
                          <div className={`flex justify-between text-xs mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span>Effectiveness</span>
                          </div>
                          <RateBar rate={action.effectiveness_rate} isDarkMode={isDarkMode} />
                        </div>
                        <div className={`flex justify-between text-xs pt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>Recurrence rate</span>
                          <span className="font-mono">
                            {((action.recurrence_rate ?? 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Playbook Effectiveness */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BeakerIcon className="w-5 h-5 text-blue-400" />
                Playbook Effectiveness
              </h3>
              {playbookEffectiveness.length === 0 ? (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No playbook effectiveness data yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {playbookEffectiveness.map((pb) => (
                    <div
                      key={pb.name}
                      className={`p-3 rounded-lg border ${
                        isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {(pb.name || '').replace(/_/g, ' ')}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {pb.total ?? 0} runs
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <div className={`text-xs mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Completion
                          </div>
                          <RateBar rate={pb.completion_rate} isDarkMode={isDarkMode} />
                        </div>
                        <div>
                          <div className={`text-xs mb-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Step Success
                          </div>
                          <RateBar rate={pb.step_success_rate} isDarkMode={isDarkMode} />
                        </div>
                        <div className={`flex justify-between text-xs pt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span>Mean execution time</span>
                          <span className="font-mono">
                            {formatDuration(pb.mean_execution_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── OUTCOMES TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'outcomes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Action Outcomes
                <span className={`ml-2 text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({outcomes.length} total)
                </span>
              </h3>
              <Button
                size="sm"
                onClick={handleAutoAssess}
                disabled={autoAssessing}
                className="flex items-center gap-2"
              >
                {autoAssessing
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <SparklesIcon className="w-4 h-4" />
                }
                Auto-Assess Pending
              </Button>
            </div>

            <Card className="p-0 overflow-hidden">
              {outcomes.length === 0 ? (
                <div className="p-6">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No outcomes recorded yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {outcomes.map((outcome, idx) => {
                    const isPending = (outcome.verdict || '').toUpperCase() === 'PENDING'
                    const isAssessing = assessingAction === (outcome.action_id || idx)
                    const shortId = (outcome.action_id || '').slice(0, 8) || `#${idx + 1}`

                    return (
                      <div key={outcome.action_id || idx}>
                        {/* Outcome row */}
                        <div
                          className={`flex items-center gap-4 px-4 py-3 ${
                            isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-gray-50'
                          } transition-colors`}
                        >
                          {/* Timestamp */}
                          <div className={`flex items-center gap-1 text-xs w-40 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <ClockIcon className="w-3.5 h-3.5" />
                            {formatTimestamp(outcome.timestamp)}
                          </div>

                          {/* Action ID */}
                          <code className={`text-xs font-mono w-20 flex-shrink-0 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {shortId}
                          </code>

                          {/* Action type */}
                          <span className={`text-sm flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {(outcome.action_type || '—').replace(/_/g, ' ')}
                          </span>

                          {/* Verdict badge */}
                          <VerdictBadge verdict={outcome.verdict} />

                          {/* Assess button for pending */}
                          {isPending && (
                            <button
                              onClick={() => {
                                if (isAssessing) {
                                  setAssessingAction(null)
                                } else {
                                  setAssessingAction(outcome.action_id || idx)
                                  setAssessForm({ verdict: 'success', reason: '' })
                                }
                              }}
                              className="text-xs text-purple-400 hover:text-purple-300 transition-colors ml-2 flex-shrink-0"
                            >
                              {isAssessing ? 'Cancel' : 'Assess'}
                            </button>
                          )}
                        </div>

                        {/* Inline assess form */}
                        {isAssessing && (
                          <div
                            className={`px-4 pb-4 ${
                              isDarkMode ? 'bg-slate-800/80' : 'bg-gray-100'
                            }`}
                          >
                            <div className={`rounded-lg border p-4 ${
                              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
                            }`}>
                              <p className="text-sm font-medium mb-3">Assess Outcome — {shortId}</p>
                              <div className="flex items-end gap-3 flex-wrap">
                                <div className="flex-shrink-0">
                                  <label className={`text-xs mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Verdict
                                  </label>
                                  <select
                                    value={assessForm.verdict}
                                    onChange={e => setAssessForm(f => ({ ...f, verdict: e.target.value }))}
                                    className={`px-3 py-1.5 rounded border text-sm ${
                                      isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                  >
                                    <option value="success">Success</option>
                                    <option value="partial">Partial</option>
                                    <option value="ineffective">Ineffective</option>
                                    <option value="failed">Failed</option>
                                  </select>
                                </div>
                                <div className="flex-1 min-w-48">
                                  <label className={`text-xs mb-1 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Reason (optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={assessForm.reason}
                                    onChange={e => setAssessForm(f => ({ ...f, reason: e.target.value }))}
                                    placeholder="Analyst note..."
                                    className={`w-full px-3 py-1.5 rounded border text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none ${
                                      isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500'
                                        : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleAssessSubmit(outcome.action_id || idx)}
                                >
                                  Submit
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── INCIDENTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'incidents' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Tracked Incidents
              <span className={`ml-2 text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ({incidents.length})
              </span>
            </h3>

            {incidents.length === 0 ? (
              <Card>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No incidents tracked yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {incidents.map((incident) => {
                  const isExpanded = expandedIncident === incident.id
                  const shortId = (incident.id || '').slice(0, 8) || '?'

                  return (
                    <div
                      key={incident.id || shortId}
                      className={`rounded-xl border transition-colors ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Incident header — clickable */}
                      <button
                        className="w-full text-left px-4 py-3"
                        onClick={() => handleIncidentClick(incident.id)}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <code className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {shortId}
                          </code>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              isDarkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {incident.event_type || 'unknown'}
                          </span>
                          <SeverityBadge severity={incident.severity} />
                          {incident.target && (
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {incident.target}
                            </span>
                          )}
                          <span
                            className={`ml-auto text-xs px-2 py-0.5 rounded ${
                              (incident.status || '').toLowerCase() === 'resolved'
                                ? 'bg-green-900/40 text-green-300'
                                : (incident.status || '').toLowerCase() === 'escalated'
                                ? 'bg-red-900/40 text-red-300'
                                : isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {incident.status || 'open'}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {incident.actions_count ?? 0} actions
                          </span>
                          {isExpanded
                            ? <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          }
                        </div>
                      </button>

                      {/* Expanded lifecycle detail */}
                      {isExpanded && (
                        <div className={`border-t px-4 py-3 space-y-3 text-sm ${
                          isDarkMode ? 'border-slate-700' : 'border-gray-200'
                        }`}>
                          {incident.event_data && (
                            <div>
                              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Event Data
                              </p>
                              <pre className={`p-2 rounded text-xs overflow-x-auto ${
                                isDarkMode ? 'bg-slate-900 text-gray-300' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {JSON.stringify(incident.event_data, null, 2)}
                              </pre>
                            </div>
                          )}

                          {incident.decision && (
                            <div>
                              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Decision
                              </p>
                              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {typeof incident.decision === 'string'
                                  ? incident.decision
                                  : JSON.stringify(incident.decision)}
                              </p>
                            </div>
                          )}

                          {Array.isArray(incident.actions) && incident.actions.length > 0 && (
                            <div>
                              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Actions Taken
                              </p>
                              <div className="space-y-1">
                                {incident.actions.map((action, i) => (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-2 text-xs ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                                    {typeof action === 'string'
                                      ? action.replace(/_/g, ' ')
                                      : (action.action_type || JSON.stringify(action)).replace(/_/g, ' ')
                                    }
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {incident.outcome && (
                            <div>
                              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Outcome
                              </p>
                              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {typeof incident.outcome === 'string'
                                  ? incident.outcome
                                  : JSON.stringify(incident.outcome)}
                              </p>
                            </div>
                          )}

                          {incident.resolution_time != null && (
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Resolution time: {formatDuration(incident.resolution_time)}
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

        {/* ── RECOMMENDATIONS TAB ───────────────────────────────────────────── */}
        {activeTab === 'recommendations' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Adaptive Recommendations
              <span className={`ml-2 text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ({recommendations.length})
              </span>
            </h3>

            {recommendations.length === 0 ? (
              <Card>
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    No recommendations at this time — all systems performing within expected parameters.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border-l-4 p-4 ${recommendationBorderColor(rec)} ${
                      isDarkMode
                        ? 'bg-slate-800 border-t border-r border-b border-slate-700'
                        : 'bg-white border-t border-r border-b border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {recommendationIcon(rec)}
                      <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {rec}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MULTIPLIERS TAB ───────────────────────────────────────────────── */}
        {activeTab === 'multipliers' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Adaptive Confidence Multipliers</h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Multipliers above 1.0 indicate effective action types; below 1.0 indicates underperformance.
                Range: 0.5 — 1.5
              </p>
            </div>

            {multiplierEntries.length === 0 ? (
              <Card>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No multiplier data available yet. Multipliers are calculated after sufficient outcomes are recorded.
                </p>
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className={`text-xs uppercase tracking-wide ${
                      isDarkMode ? 'bg-slate-900/60 text-gray-400' : 'bg-gray-50 text-gray-500'
                    }`}>
                      <th className="px-4 py-3 text-left">Action Type</th>
                      <th className="px-4 py-3 text-left">Current Multiplier</th>
                      <th className="px-4 py-3 text-left w-48">Relative to Baseline</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                    {multiplierEntries.map(([actionType, value]) => {
                      const num = typeof value === 'number' ? value : 1.0
                      const isEffective = num > 1.0
                      const isNeutral = Math.abs(num - 1.0) < 0.01
                      const barPct = Math.min(Math.abs(num - 1.0) / (maxMultiplier || 0.5), 1) * 50

                      return (
                        <tr
                          key={actionType}
                          className={`${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'} transition-colors`}
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            {actionType.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-lg font-bold font-mono ${
                                isNeutral
                                  ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                  : isEffective
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {num.toFixed(2)}×
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {/* Center-anchored bar */}
                            <div className={`relative h-3 rounded-full w-full flex items-center ${
                              isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                            }`}>
                              {/* Center line */}
                              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-500 opacity-40" />
                              {/* Bar */}
                              <div
                                className={`absolute top-0 bottom-0 rounded-full ${
                                  isEffective ? 'bg-green-500' : isNeutral ? 'bg-gray-500' : 'bg-red-500'
                                }`}
                                style={{
                                  left: isEffective ? '50%' : `calc(50% - ${barPct}%)`,
                                  width: `${barPct}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {isNeutral ? (
                              <Badge variant="default" size="sm">Neutral</Badge>
                            ) : isEffective ? (
                              <Badge variant="success" size="sm">Effective</Badge>
                            ) : (
                              <Badge variant="danger" size="sm">Underperforming</Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
