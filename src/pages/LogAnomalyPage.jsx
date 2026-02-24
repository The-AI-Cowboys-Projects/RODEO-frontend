import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { logAnomaly } from '../api/client'
import {
  MagnifyingGlassIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  CpuChipIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

function toTitleCase(str) {
  if (!str) return ''
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

const ANOMALY_BORDER_COLORS = [
  'border-l-red-500',
  'border-l-orange-500',
  'border-l-yellow-500',
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-cyan-500',
  'border-l-green-500',
  'border-l-pink-500',
]

const SEVERITY_STYLES = {
  critical: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-blue-500/20 text-blue-400',
  info: 'bg-gray-500/20 text-gray-400',
}

const TRAINING_STATUS_STYLES = {
  idle: 'bg-gray-500/20 text-gray-400',
  starting: 'bg-blue-500/20 text-blue-400',
  training: 'bg-purple-500/20 text-purple-400',
  complete: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
}

export default function LogAnomalyPage() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('analyze')
  const [notification, setNotification] = useState(null)

  // Status
  const [status, setStatus] = useState({
    ml_enabled: false,
    rules_enabled: true,
    model_loaded: false,
    anomaly_threshold: 0.5,
    supported_log_formats: [],
  })

  // Analyze tab
  const [logText, setLogText] = useState('')
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState(null)

  // Training tab
  const [trainingStatus, setTrainingStatus] = useState({ status: 'idle', progress: 0 })
  const [trainingForm, setTrainingForm] = useState({
    use_synthetic: true,
    synthetic_count: 10000,
    epochs: 50,
    batch_size: 256,
  })
  const [startingTraining, setStartingTraining] = useState(false)

  // Rules tab
  const [ruleConfig, setRuleConfig] = useState({
    failed_auth_threshold: 5,
    failed_auth_ratio_threshold: 0.8,
    events_per_minute_threshold: 100,
    unusual_hour_start: 22,
    unusual_hour_end: 6,
    scanning_ports_threshold: 10,
  })
  const [savingRules, setSavingRules] = useState(false)

  // Anomaly types tab
  const [anomalyTypes, setAnomalyTypes] = useState({})

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Load all data on mount
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    const [statusData, ruleData, typesData, trainingData] = await Promise.all([
      logAnomaly.getStatus().catch(() => null),
      logAnomaly.getRuleConfig().catch(() => null),
      logAnomaly.getAnomalyTypes().catch(() => null),
      logAnomaly.getTrainingStatus().catch(() => null),
    ])
    if (statusData) setStatus(statusData)
    if (ruleData) setRuleConfig((prev) => ({ ...prev, ...ruleData }))
    if (typesData && typeof typesData === 'object') setAnomalyTypes(typesData)
    if (trainingData) setTrainingStatus(trainingData)
  }

  // Poll training status while active
  useEffect(() => {
    if (trainingStatus.status === 'training' || trainingStatus.status === 'starting') {
      const interval = setInterval(async () => {
        const res = await logAnomaly.getTrainingStatus().catch(() => trainingStatus)
        setTrainingStatus(res)
        if (res.status === 'complete' || res.status === 'failed' || res.status === 'idle') {
          clearInterval(interval)
          if (res.status === 'complete') {
            showNotif('Model training completed successfully.')
            // Refresh status to update model_loaded
            const s = await logAnomaly.getStatus().catch(() => null)
            if (s) setStatus(s)
          } else if (res.status === 'failed') {
            showNotif('Model training failed.', 'error')
          }
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [trainingStatus.status])

  const handleAnalyze = async () => {
    const lines = logText.split('\n').filter((l) => l.trim().length > 0)
    if (lines.length === 0) {
      showNotif('Please paste at least one log line to analyze.', 'error')
      return
    }
    setAnalyzeLoading(true)
    setAnalyzeResult(null)
    try {
      const result = await logAnomaly.analyzeBatch(lines)
      setAnalyzeResult(result)
      if (result.anomalies_detected > 0) {
        showNotif(`Analysis complete — ${result.anomalies_detected} anomal${result.anomalies_detected === 1 ? 'y' : 'ies'} detected.`, 'info')
      } else {
        showNotif('Analysis complete — no anomalies detected.')
      }
    } catch (err) {
      showNotif(err?.response?.data?.detail || 'Analysis failed. Please try again.', 'error')
    } finally {
      setAnalyzeLoading(false)
    }
  }

  const handleStartTraining = async () => {
    setStartingTraining(true)
    try {
      await logAnomaly.startTraining(trainingForm)
      setTrainingStatus({ status: 'starting', progress: 0 })
      showNotif('Training started.')
    } catch (err) {
      showNotif(err?.response?.data?.detail || 'Failed to start training.', 'error')
    } finally {
      setStartingTraining(false)
    }
  }

  const handleSaveRules = async () => {
    setSavingRules(true)
    try {
      await logAnomaly.updateRuleConfig(ruleConfig)
      showNotif('Rule configuration saved.')
    } catch (err) {
      showNotif(err?.response?.data?.detail || 'Failed to save rule configuration.', 'error')
    } finally {
      setSavingRules(false)
    }
  }

  const isTrainingActive = trainingStatus.status === 'training' || trainingStatus.status === 'starting'

  const cardClass = `${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-colors ${
    isDarkMode
      ? 'bg-slate-900 border-slate-600 text-white placeholder-gray-500'
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`
  const numberInputClass = `rounded-lg border px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-colors ${
    isDarkMode
      ? 'bg-slate-900 border-slate-600 text-white'
      : 'bg-gray-50 border-gray-300 text-gray-900'
  }`

  const tabs = [
    { id: 'analyze', label: 'Analyze', icon: MagnifyingGlassIcon },
    { id: 'training', label: 'Training', icon: AcademicCapIcon },
    { id: 'rules', label: 'Rules', icon: AdjustmentsHorizontalIcon },
    { id: 'anomaly-types', label: 'Anomaly Types', icon: InformationCircleIcon },
  ]

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
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
        <div className="mb-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20 flex-shrink-0">
            <BeakerIcon className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Log Anomaly Detection
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              ML-based and rule-based log analysis
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* ML Detection */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ML Detection</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    status.ml_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {status.ml_enabled ? (
                      <><CheckCircleIcon className="w-3.5 h-3.5" /> Enabled</>
                    ) : (
                      <><XCircleIcon className="w-3.5 h-3.5" /> Disabled</>
                    )}
                  </span>
                </div>
              </div>
              <CpuChipIcon className={`w-8 h-8 ${status.ml_enabled ? 'text-green-500' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Rules Engine */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rules Engine</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    status.rules_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {status.rules_enabled ? (
                      <><CheckCircleIcon className="w-3.5 h-3.5" /> Enabled</>
                    ) : (
                      <><XCircleIcon className="w-3.5 h-3.5" /> Disabled</>
                    )}
                  </span>
                </div>
              </div>
              <AdjustmentsHorizontalIcon className={`w-8 h-8 ${status.rules_enabled ? 'text-blue-500' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Model */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Model</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    status.model_loaded ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {status.model_loaded ? (
                      <><CheckCircleIcon className="w-3.5 h-3.5" /> Loaded</>
                    ) : (
                      <><XCircleIcon className="w-3.5 h-3.5" /> Not Loaded</>
                    )}
                  </span>
                </div>
              </div>
              <BeakerIcon className={`w-8 h-8 ${status.model_loaded ? 'text-purple-500' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Training Status */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Training Status</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    TRAINING_STATUS_STYLES[trainingStatus.status] || TRAINING_STATUS_STYLES.idle
                  }`}>
                    {isTrainingActive && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
                    {toTitleCase(trainingStatus.status)}
                  </span>
                </div>
              </div>
              <AcademicCapIcon className={`w-8 h-8 ${
                isTrainingActive ? 'text-purple-500' :
                trainingStatus.status === 'complete' ? 'text-green-500' :
                trainingStatus.status === 'failed' ? 'text-red-500' : 'text-gray-500'
              }`} />
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className={`flex gap-2 border-b mb-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
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

        {/* --- ANALYZE TAB --- */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {/* Input area */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Log Lines
                </label>
                {logText.trim() && (
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {logText.split('\n').filter((l) => l.trim()).length} line{logText.split('\n').filter((l) => l.trim()).length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                rows={8}
                placeholder={`Paste log lines here, one per line...\nExamples:\nJan 23 10:15:32 server sshd[1234]: Failed password for root from 192.168.1.100\n{"timestamp":"2026-01-23T10:15:32Z","level":"ERROR","message":"Authentication failed"}`}
                className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900'} w-full rounded-lg border p-3 font-mono text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none resize-y`}
                style={{ minHeight: '200px' }}
              />
              <div className="flex items-center justify-between mt-3">
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Supports Syslog, JSON, Apache, Windows event log formats
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzeLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {analyzeLoading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      Analyze Logs
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Loading */}
            {analyzeLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Results */}
            {analyzeResult && !analyzeLoading && (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Logs</p>
                      <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {analyzeResult.total_logs ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Parsed</p>
                      <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {analyzeResult.parsed_count ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Anomalies</p>
                      <p className={`text-xl font-bold ${
                        (analyzeResult.anomalies_detected ?? 0) > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {analyzeResult.anomalies_detected ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Processing Time</p>
                      <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {analyzeResult.processing_time_ms != null ? `${analyzeResult.processing_time_ms}ms` : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Anomaly cards */}
                {Array.isArray(analyzeResult.anomalies) && analyzeResult.anomalies.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Detected Anomalies ({analyzeResult.anomalies.length})
                    </h3>
                    {analyzeResult.anomalies.map((anomaly, idx) => {
                      const sev = (anomaly.severity || 'info').toLowerCase()
                      return (
                        <div
                          key={idx}
                          className={`${cardClass} border-l-4 ${
                            sev === 'critical' ? 'border-l-red-500' :
                            sev === 'high' ? 'border-l-orange-500' :
                            sev === 'medium' ? 'border-l-yellow-500' :
                            sev === 'low' ? 'border-l-blue-500' :
                            'border-l-gray-500'
                          } pl-4`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {/* Type badge */}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                  {anomaly.type ? toTitleCase(anomaly.type) : 'Unknown'}
                                </span>
                                {/* Severity badge */}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[sev] || SEVERITY_STYLES.info}`}>
                                  {sev}
                                </span>
                              </div>
                              {anomaly.title && (
                                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {anomaly.title}
                                </p>
                              )}
                              {anomaly.description && (
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {anomaly.description}
                                </p>
                              )}
                            </div>
                            <ExclamationTriangleIcon className={`w-5 h-5 flex-shrink-0 ${
                              sev === 'critical' ? 'text-red-400' :
                              sev === 'high' ? 'text-orange-400' :
                              sev === 'medium' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className={`${cardClass} flex items-center gap-3`}>
                    <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No anomalies detected</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        All analyzed log lines appear normal
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!analyzeResult && !analyzeLoading && (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <DocumentTextIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Paste log lines above and click Analyze Logs
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TRAINING TAB --- */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Training Status
              </h2>
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    TRAINING_STATUS_STYLES[trainingStatus.status] || TRAINING_STATUS_STYLES.idle
                  }`}>
                    {isTrainingActive && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                    {toTitleCase(trainingStatus.status)}
                  </span>
                  {trainingStatus.status === 'complete' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  )}
                  {trainingStatus.status === 'failed' && (
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                  )}
                </div>

                {/* Progress bar when training */}
                {isTrainingActive && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {trainingStatus.progress ?? 0}%
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${trainingStatus.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Metrics when complete */}
                {trainingStatus.status === 'complete' && trainingStatus.metrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Final Loss', key: 'final_loss' },
                      { label: 'F1 Score', key: 'f1_score' },
                      { label: 'Precision', key: 'precision' },
                      { label: 'Recall', key: 'recall' },
                    ].map(({ label, key }) => (
                      trainingStatus.metrics[key] != null && (
                        <div key={key} className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{label}</p>
                          <p className={`text-lg font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {typeof trainingStatus.metrics[key] === 'number'
                              ? trainingStatus.metrics[key].toFixed(4)
                              : trainingStatus.metrics[key]}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Error when failed */}
                {trainingStatus.status === 'failed' && trainingStatus.error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-start gap-2">
                      <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{trainingStatus.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Training Config */}
            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Training Configuration
              </h2>
              <div className="space-y-4">
                {/* Use Synthetic Data toggle */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Use Synthetic Data</p>
                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Generate synthetic log data for training when real data is unavailable
                    </p>
                  </div>
                  <button
                    onClick={() => setTrainingForm((p) => ({ ...p, use_synthetic: !p.use_synthetic }))}
                    disabled={isTrainingActive}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      trainingForm.use_synthetic
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : isDarkMode
                        ? 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {trainingForm.use_synthetic ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Synthetic Count */}
                  {trainingForm.use_synthetic && (
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Synthetic Sample Count
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="1000000"
                        value={trainingForm.synthetic_count}
                        onChange={(e) => setTrainingForm((p) => ({ ...p, synthetic_count: parseInt(e.target.value, 10) || 10000 }))}
                        disabled={isTrainingActive}
                        className={`${numberInputClass} w-full disabled:opacity-50`}
                      />
                      <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Number of synthetic log samples to generate
                      </p>
                    </div>
                  )}

                  {/* Epochs */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Epochs
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={trainingForm.epochs}
                      onChange={(e) => setTrainingForm((p) => ({ ...p, epochs: parseInt(e.target.value, 10) || 50 }))}
                      disabled={isTrainingActive}
                      className={`${numberInputClass} w-full disabled:opacity-50`}
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Number of training epochs
                    </p>
                  </div>

                  {/* Batch Size */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Batch Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4096"
                      value={trainingForm.batch_size}
                      onChange={(e) => setTrainingForm((p) => ({ ...p, batch_size: parseInt(e.target.value, 10) || 256 }))}
                      disabled={isTrainingActive}
                      className={`${numberInputClass} w-full disabled:opacity-50`}
                    />
                    <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Training mini-batch size
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleStartTraining}
                    disabled={isTrainingActive || startingTraining}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    {startingTraining || isTrainingActive ? (
                      <>
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        {startingTraining ? 'Starting...' : 'Training...'}
                      </>
                    ) : (
                      <>
                        <AcademicCapIcon className="w-4 h-4" />
                        Start Training
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- RULES TAB --- */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Rule Thresholds
              </h2>
              <div className="space-y-5">
                {/* Failed Auth Threshold */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Failed Authentication Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={ruleConfig.failed_auth_threshold}
                      onChange={(e) => setRuleConfig((p) => ({ ...p, failed_auth_threshold: parseInt(e.target.value, 10) || 5 }))}
                      className={`${numberInputClass} w-24 text-right`}
                    />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Number of consecutive failed authentication attempts before triggering a brute force alert
                  </p>
                </div>

                {/* Failed Auth Ratio */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Failed Auth Ratio Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={ruleConfig.failed_auth_ratio_threshold}
                      onChange={(e) => setRuleConfig((p) => ({ ...p, failed_auth_ratio_threshold: parseFloat(e.target.value) || 0.8 }))}
                      className={`${numberInputClass} w-24 text-right`}
                    />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Ratio of failed to total authentication events (0.0–1.0) that triggers an alert
                  </p>
                </div>

                {/* Events Per Minute */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Events Per Minute Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={ruleConfig.events_per_minute_threshold}
                      onChange={(e) => setRuleConfig((p) => ({ ...p, events_per_minute_threshold: parseInt(e.target.value, 10) || 100 }))}
                      className={`${numberInputClass} w-24 text-right`}
                    />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Maximum events per minute from a single source before flagging as anomalous activity
                  </p>
                </div>

                <div className={`border-t pt-5 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Unusual Hours Detection
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Unusual Hour Start */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Unusual Hours Start
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={ruleConfig.unusual_hour_start}
                          onChange={(e) => setRuleConfig((p) => ({ ...p, unusual_hour_start: parseInt(e.target.value, 10) }))}
                          className={`${numberInputClass} w-20 text-right`}
                        />
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Hour (0–23) when unusual activity window begins (e.g., 22 = 10 PM)
                      </p>
                    </div>

                    {/* Unusual Hour End */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Unusual Hours End
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={ruleConfig.unusual_hour_end}
                          onChange={(e) => setRuleConfig((p) => ({ ...p, unusual_hour_end: parseInt(e.target.value, 10) }))}
                          className={`${numberInputClass} w-20 text-right`}
                        />
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Hour (0–23) when unusual activity window ends (e.g., 6 = 6 AM)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scanning Ports */}
                <div className={`border-t pt-5 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Port Scanning Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={ruleConfig.scanning_ports_threshold}
                      onChange={(e) => setRuleConfig((p) => ({ ...p, scanning_ports_threshold: parseInt(e.target.value, 10) || 10 }))}
                      className={`${numberInputClass} w-24 text-right`}
                    />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Number of distinct destination ports from a single source that indicates port scanning behavior
                  </p>
                </div>
              </div>

              <div className={`flex justify-end mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <button
                  onClick={handleSaveRules}
                  disabled={savingRules}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {savingRules ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4" />
                      Save Rules
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- ANOMALY TYPES TAB --- */}
        {activeTab === 'anomaly-types' && (
          <div className="space-y-4">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Reference listing of all anomaly types detected by the rules engine and ML model.
            </p>

            {Object.keys(anomalyTypes).length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <InformationCircleIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No anomaly types available
                  </p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Backend may be unavailable
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(anomalyTypes).map(([key, value], idx) => {
                  const borderColor = ANOMALY_BORDER_COLORS[idx % ANOMALY_BORDER_COLORS.length]
                  const description = typeof value === 'string'
                    ? value
                    : value?.description || value?.desc || JSON.stringify(value)
                  return (
                    <div
                      key={key}
                      className={`${cardClass} border-l-4 ${borderColor} pl-4`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <InformationCircleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          idx % ANOMALY_BORDER_COLORS.length === 0 ? 'text-red-400' :
                          idx % ANOMALY_BORDER_COLORS.length === 1 ? 'text-orange-400' :
                          idx % ANOMALY_BORDER_COLORS.length === 2 ? 'text-yellow-400' :
                          idx % ANOMALY_BORDER_COLORS.length === 3 ? 'text-blue-400' :
                          idx % ANOMALY_BORDER_COLORS.length === 4 ? 'text-purple-400' :
                          idx % ANOMALY_BORDER_COLORS.length === 5 ? 'text-cyan-400' :
                          'text-green-400'
                        }`} />
                        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {toTitleCase(key)}
                        </h3>
                      </div>
                      <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {description}
                      </p>
                      {typeof value === 'object' && value !== null && value.severity && (
                        <div className="mt-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            SEVERITY_STYLES[(value.severity || '').toLowerCase()] || SEVERITY_STYLES.info
                          }`}>
                            {value.severity}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
