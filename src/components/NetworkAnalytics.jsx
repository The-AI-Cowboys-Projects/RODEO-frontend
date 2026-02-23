import { useState, useEffect } from 'react'
import { networkAnalytics } from '../api/client'
import { useTheme } from '../context/ThemeContext'
import {
  GlobeAltIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BellAlertIcon,
  ArrowsRightLeftIcon,
  CpuChipIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  WifiIcon,
  CloudIcon,
  CircleStackIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { SignalIcon as SignalSolid, ShieldCheckIcon } from '@heroicons/react/24/solid'

// ============================================================================
// Animated Counter
// ============================================================================
function AnimatedCounter({ value, duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = parseInt(value) || 0

  useEffect(() => {
    let start = 0
    const end = numericValue
    const increment = end / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(counter)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(counter)
  }, [numericValue, duration])

  return <span>{displayValue.toLocaleString()}</span>
}

// ============================================================================
// Hero Stat Card
// ============================================================================
function HeroStatCard({ icon: Icon, value, label, color, isDarkMode, delay = 0, suffix = '' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const colors = {
    blue: {
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
      icon: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      value: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    },
    red: {
      bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: isDarkMode ? 'border-red-500/30' : 'border-red-200',
      icon: isDarkMode ? 'text-red-400' : 'text-red-600',
      value: isDarkMode ? 'text-red-400' : 'text-red-600',
    },
    green: {
      bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
      border: isDarkMode ? 'border-green-500/30' : 'border-green-200',
      icon: isDarkMode ? 'text-green-400' : 'text-green-600',
      value: isDarkMode ? 'text-green-400' : 'text-green-600',
    },
    purple: {
      bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      border: isDarkMode ? 'border-purple-500/30' : 'border-purple-200',
      icon: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      value: isDarkMode ? 'text-purple-400' : 'text-purple-600',
    },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`${c.bg} backdrop-blur-sm rounded-2xl border ${c.border} p-5 transition-all duration-500 hover:scale-[1.02] cursor-pointer group ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`relative w-14 h-14 rounded-xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-7 h-7 ${c.icon}`} />
          <div className={`absolute inset-0 rounded-xl ${c.bg} animate-ping opacity-20`} />
        </div>
        <div>
          <div className={`text-3xl font-bold ${c.value}`}>
            <AnimatedCounter value={value} duration={800 + delay} />{suffix}
          </div>
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Time Range Chip
// ============================================================================
function TimeRangeChip({ minutes, label, active, onClick, isDarkMode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
          : isDarkMode
            ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-700 border border-slate-600'
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

// ============================================================================
// Tab Button
// ============================================================================
function TabButton({ label, icon: Icon, active, onClick, count, isDarkMode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
        active
          ? isDarkMode
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
          : isDarkMode
            ? 'text-gray-400 hover:text-white hover:bg-slate-700/50'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
      {count !== undefined && count > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          active
            ? isDarkMode ? 'bg-blue-500/30' : 'bg-blue-100'
            : isDarkMode ? 'bg-slate-600' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
      {active && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />
      )}
    </button>
  )
}

// ============================================================================
// Alert Card
// ============================================================================
function AlertCard({ alert, isDarkMode, index }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50)
    return () => clearTimeout(timer)
  }, [index])

  const getSeverityConfig = (severity) => {
    const s = severity?.toLowerCase()
    if (s === 'critical') return {
      bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: isDarkMode ? 'border-red-500/30' : 'border-red-200',
      badge: isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
      icon: ExclamationTriangleIcon,
    }
    if (s === 'high') return {
      bg: isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50',
      border: isDarkMode ? 'border-orange-500/30' : 'border-orange-200',
      badge: isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700',
      icon: ExclamationTriangleIcon,
    }
    if (s === 'medium') return {
      bg: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50',
      border: isDarkMode ? 'border-yellow-500/30' : 'border-yellow-200',
      badge: isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
      icon: BellAlertIcon,
    }
    return {
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
      badge: isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      icon: BellAlertIcon,
    }
  }

  const config = getSeverityConfig(alert.severity)
  const SeverityIcon = config.icon
  const formatTimestamp = (ts) => new Date(ts * 1000).toLocaleString()

  return (
    <div className={`${config.bg} rounded-xl border ${config.border} p-5 transition-all duration-500 hover:shadow-lg ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg ${config.badge} flex items-center justify-center flex-shrink-0`}>
            <SeverityIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase ${config.badge}`}>
                {alert.severity}
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {alert.source}
              </span>
              {alert.host && (
                <>
                  <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {alert.host}
                  </span>
                </>
              )}
            </div>
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{alert.title}</h4>
            {alert.description && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {alert.description}
              </p>
            )}
            {alert.tags && alert.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {alert.tags.map((tag, idx) => (
                  <span key={idx} className={`px-2 py-0.5 rounded-full text-xs ${
                    isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <span className={`text-xs whitespace-nowrap ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {formatTimestamp(alert.timestamp)}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// Log Source Card
// ============================================================================
function LogSourceCard({ source, onClick, isDarkMode }) {
  const icons = {
    elasticsearch: MagnifyingGlassIcon,
    splunk: ChartBarIcon,
    loki: DocumentTextIcon,
    datadog: SignalIcon,
    cloudwatch: CloudIcon,
    graylog: GlobeAltIcon,
  }
  const Icon = icons[source.id] || ServerIcon

  return (
    <button
      onClick={onClick}
      className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] group ${
        isDarkMode
          ? 'border-slate-600 bg-slate-800/50 hover:border-purple-500/50 hover:bg-purple-500/10'
          : 'border-gray-200 bg-white hover:border-purple-500 hover:bg-purple-50'
      }`}
    >
      <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform ${
        isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
      }`}>
        <Icon className={`w-7 h-7 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
      </div>
      <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {source.name}
      </h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {source.description}
      </p>
      <div className={`mt-4 flex items-center text-sm font-medium ${
        isDarkMode ? 'text-purple-400' : 'text-purple-600'
      }`}>
        Configure
        <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}

// ============================================================================
// Main Component
// ============================================================================
const NetworkAnalytics = () => {
  const { isDarkMode } = useTheme()
  const [status, setStatus] = useState(null)
  const [summary, setSummary] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [flows, setFlows] = useState([])
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [timeRange, setTimeRange] = useState(60)
  const [showLogSourceModal, setShowLogSourceModal] = useState(false)
  const [selectedLogSource, setSelectedLogSource] = useState(null)
  const [logSourceConfig, setLogSourceConfig] = useState({
    host: '', port: '', username: '', password: '', index: '', apiKey: ''
  })

  const fetchData = async () => {
    try {
      setError(null)
      const statusData = await networkAnalytics.status()
      setStatus(statusData)

      if (!statusData.enabled) {
        setLoading(false)
        return
      }

      if (activeTab === 'summary') {
        const summaryData = await networkAnalytics.summary()
        setSummary(summaryData)
      } else if (activeTab === 'alerts') {
        const alertsData = await networkAnalytics.alerts(timeRange)
        setAlerts(alertsData.alerts || [])
      } else if (activeTab === 'flows') {
        const flowsData = await networkAnalytics.flows(timeRange, 100)
        setFlows(flowsData.flows || [])
      } else if (activeTab === 'metrics') {
        const metricsData = await networkAnalytics.metrics(timeRange)
        setMetrics(metricsData.metrics || [])
      }

      setLoading(false)
    } catch (err) {
      console.error('Error fetching network analytics:', err)
      setError(err.response?.data?.detail || 'Failed to fetch network analytics data')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [activeTab, timeRange, autoRefresh])

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const logSources = [
    { id: 'elasticsearch', name: 'Elasticsearch', description: 'Query logs from Elasticsearch cluster', fields: ['host', 'port', 'username', 'password', 'index'] },
    { id: 'splunk', name: 'Splunk', description: 'Connect to Splunk Enterprise or Cloud', fields: ['host', 'port', 'username', 'password', 'index'] },
    { id: 'loki', name: 'Grafana Loki', description: 'Query logs from Grafana Loki', fields: ['host', 'port'] },
    { id: 'datadog', name: 'Datadog', description: 'Fetch logs from Datadog', fields: ['apiKey', 'host'] },
    { id: 'cloudwatch', name: 'AWS CloudWatch', description: 'Query AWS CloudWatch logs', fields: ['apiKey'] },
    { id: 'graylog', name: 'Graylog', description: 'Connect to Graylog server', fields: ['host', 'port', 'username', 'password'] },
  ]

  const handleLogSourceSelect = (source) => {
    setSelectedLogSource(source)
    setLogSourceConfig({ host: '', port: '', username: '', password: '', index: '', apiKey: '' })
  }

  const handleConfigSubmit = async () => {
    alert(`Log source ${selectedLogSource.name} configured successfully!`)
    setShowLogSourceModal(false)
    setSelectedLogSource(null)
  }

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl p-8 animate-pulse ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
          <div className={`h-10 w-64 rounded-lg mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`h-6 w-96 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className={`rounded-2xl border p-8 ${
        isDarkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-900'}`}>Error</h2>
            <p className={isDarkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium"
        >
          Retry
        </button>
      </div>
    )
  }

  // Not Configured State
  if (!status?.enabled) {
    return (
      <div className={`rounded-2xl border p-8 ${
        isDarkMode ? 'bg-amber-900/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Cog6ToothIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-900'}`}>
              Network Analytics Not Configured
            </h2>
            <p className={isDarkMode ? 'text-amber-300' : 'text-amber-700'}>
              No network analytics software has been configured.
            </p>
          </div>
        </div>
        <div className={`mt-4 p-4 rounded-xl font-mono text-sm ${
          isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-900 text-gray-100'
        }`}>
          python core/network_analytics_wizard.py
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl border p-8 ${
        isDarkMode
          ? 'bg-gradient-to-r from-blue-900/50 via-slate-900 to-cyan-900/50 border-blue-500/20'
          : 'bg-gradient-to-r from-blue-50 via-white to-cyan-50 border-blue-200'
      }`}>
        {/* Background Effects */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-blue-500/10' : 'bg-blue-200/30'
        }`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-200/30'
        }`} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 shadow-blue-500/30'
                  : 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 shadow-blue-500/40'
              }`}>
                <GlobeAltIcon className="w-10 h-10 text-white" />
              </div>
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border-2 shadow-lg ${
                isDarkMode ? 'bg-green-400 border-slate-900' : 'bg-green-500 border-white'
              }`}>
                <SignalSolid className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className={`text-4xl font-bold ${
                isDarkMode
                  ? 'bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent'
                  : 'text-gray-900'
              }`}>
                Network Analytics
              </h1>
              <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time network monitoring from {status.available_adapters?.length || 0} source(s)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                autoRefresh
                  ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                  : isDarkMode
                    ? 'bg-slate-700/50 text-gray-300 border border-slate-600'
                    : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
              }`}
            >
              {autoRefresh ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
              {autoRefresh ? 'Auto' : 'Paused'}
            </button>
            <button
              onClick={() => setShowLogSourceModal(true)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                isDarkMode
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30'
                  : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Configure
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <HeroStatCard
            icon={ChartBarIcon}
            value={summary?.metrics?.total || 0}
            label="Total Metrics"
            color="blue"
            isDarkMode={isDarkMode}
            delay={0}
          />
          <HeroStatCard
            icon={BellAlertIcon}
            value={summary?.alerts?.total || 0}
            label="Active Alerts"
            color="red"
            isDarkMode={isDarkMode}
            delay={100}
          />
          <HeroStatCard
            icon={ArrowsRightLeftIcon}
            value={summary?.flows?.total || 0}
            label="Network Flows"
            color="green"
            isDarkMode={isDarkMode}
            delay={200}
          />
          <HeroStatCard
            icon={ServerIcon}
            value={status.available_adapters?.length || 0}
            label="Sources"
            color="purple"
            isDarkMode={isDarkMode}
            delay={300}
          />
        </div>
      </div>

      {/* Connection Status */}
      <div className={`flex items-center justify-between p-4 rounded-xl border ${
        isDarkMode
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Connected</span>
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>|</span>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Sources: {status.available_adapters?.join(', ') || 'None'}
          </span>
        </div>
        <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Last updated: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { minutes: 15, label: '15m' },
          { minutes: 30, label: '30m' },
          { minutes: 60, label: '1h' },
          { minutes: 180, label: '3h' },
          { minutes: 360, label: '6h' },
        ].map(({ minutes, label }) => (
          <TimeRangeChip
            key={minutes}
            minutes={minutes}
            label={label}
            active={timeRange === minutes}
            onClick={() => setTimeRange(minutes)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton
          label="Summary"
          icon={ChartBarIcon}
          active={activeTab === 'summary'}
          onClick={() => setActiveTab('summary')}
          isDarkMode={isDarkMode}
        />
        <TabButton
          label="Alerts"
          icon={BellAlertIcon}
          active={activeTab === 'alerts'}
          onClick={() => setActiveTab('alerts')}
          count={summary?.alerts?.total}
          isDarkMode={isDarkMode}
        />
        <TabButton
          label="Flows"
          icon={ArrowsRightLeftIcon}
          active={activeTab === 'flows'}
          onClick={() => setActiveTab('flows')}
          count={summary?.flows?.total}
          isDarkMode={isDarkMode}
        />
        <TabButton
          label="Metrics"
          icon={CpuChipIcon}
          active={activeTab === 'metrics'}
          onClick={() => setActiveTab('metrics')}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Tab Content */}
      <div>
        {/* Summary Tab */}
        {activeTab === 'summary' && summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metrics Card */}
            <div className={`rounded-2xl border p-6 ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <ChartBarIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Metrics</h3>
              </div>
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {summary.metrics.total.toLocaleString()}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Metrics</p>
              {summary.metrics.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Sources</p>
                  <div className="flex flex-wrap gap-1">
                    {summary.metrics.sources.map((s, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded text-xs ${
                        isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alerts Card */}
            <div className={`rounded-2xl border p-6 ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <BellAlertIcon className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Alerts</h3>
              </div>
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                {summary.alerts.total.toLocaleString()}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last Hour</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {summary.alerts.by_severity.critical > 0 && (
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
                    {summary.alerts.by_severity.critical} Critical
                  </span>
                )}
                {summary.alerts.by_severity.high > 0 && (
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'}`}>
                    {summary.alerts.by_severity.high} High
                  </span>
                )}
                {summary.alerts.by_severity.medium > 0 && (
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                    {summary.alerts.by_severity.medium} Medium
                  </span>
                )}
              </div>
            </div>

            {/* Flows Card */}
            <div className={`rounded-2xl border p-6 ${
              isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <ArrowsRightLeftIcon className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Network Flows</h3>
              </div>
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {summary.flows.total.toLocaleString()}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Flows</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <ArrowUpIcon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Sent: {formatBytes(summary.flows.total_bytes_sent)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowDownIcon className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    Received: {formatBytes(summary.flows.total_bytes_received)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className={`text-center py-16 rounded-2xl border ${
                isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'
              }`}>
                <BellAlertIcon className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No alerts in the selected time range
                </p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <AlertCard key={idx} alert={alert} isDarkMode={isDarkMode} index={idx} />
              ))
            )}
          </div>
        )}

        {/* Flows Tab */}
        {activeTab === 'flows' && (
          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <tr>
                    {['Source', 'Destination', 'Protocol', 'Sent', 'Received', 'Packets'].map((h) => (
                      <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-200'}`}>
                  {flows.length === 0 ? (
                    <tr>
                      <td colSpan="6" className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No network flows in the selected time range
                      </td>
                    </tr>
                  ) : (
                    flows.map((flow, idx) => (
                      <tr key={idx} className={`transition-colors ${
                        isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                      }`}>
                        <td className={`px-6 py-4 text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {flow.src_ip}:{flow.src_port}
                        </td>
                        <td className={`px-6 py-4 text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {flow.dst_ip}:{flow.dst_port}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                            isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                          }`}>{flow.protocol}</span>
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatBytes(flow.bytes_sent)}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatBytes(flow.bytes_received)}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {flow.packets.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <tr>
                    {['Metric Name', 'Value', 'Source', 'Labels'].map((h) => (
                      <th key={h} className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-200'}`}>
                  {metrics.length === 0 ? (
                    <tr>
                      <td colSpan="4" className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        No metrics in the selected time range
                      </td>
                    </tr>
                  ) : (
                    metrics.map((metric, idx) => (
                      <tr key={idx} className={`transition-colors ${
                        isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                      }`}>
                        <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {metric.metric_name}
                        </td>
                        <td className={`px-6 py-4 text-sm font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {metric.source}
                        </td>
                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {Object.entries(metric.labels || {})
                            .filter(([key]) => key !== '__name__')
                            .map(([key, value]) => `${key}=${value}`)
                            .join(', ')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Log Source Modal */}
      {showLogSourceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 z-10 px-6 py-5 border-b backdrop-blur-xl ${
              isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}>
                    <Cog6ToothIcon className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedLogSource ? `Configure ${selectedLogSource.name}` : 'Configure Log Sources'}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedLogSource ? selectedLogSource.description : 'Select a log source to connect'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowLogSourceModal(false); setSelectedLogSource(null) }}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!selectedLogSource ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {logSources.map((source) => (
                    <LogSourceCard
                      key={source.id}
                      source={source}
                      onClick={() => handleLogSourceSelect(source)}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedLogSource(null)}
                    className={`mb-6 flex items-center gap-2 text-sm font-medium ${
                      isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                    }`}
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to log sources
                  </button>

                  <div className="space-y-4">
                    {selectedLogSource.fields.includes('host') && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Host / URL
                        </label>
                        <input
                          type="text"
                          value={logSourceConfig.host}
                          onChange={(e) => setLogSourceConfig({ ...logSourceConfig, host: e.target.value })}
                          placeholder="e.g., localhost or https://example.com"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    )}
                    {selectedLogSource.fields.includes('port') && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Port
                        </label>
                        <input
                          type="text"
                          value={logSourceConfig.port}
                          onChange={(e) => setLogSourceConfig({ ...logSourceConfig, port: e.target.value })}
                          placeholder="e.g., 9200, 8089"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    )}
                    {selectedLogSource.fields.includes('username') && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={logSourceConfig.username}
                          onChange={(e) => setLogSourceConfig({ ...logSourceConfig, username: e.target.value })}
                          placeholder="Username"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    )}
                    {selectedLogSource.fields.includes('password') && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Password
                        </label>
                        <input
                          type="password"
                          value={logSourceConfig.password}
                          onChange={(e) => setLogSourceConfig({ ...logSourceConfig, password: e.target.value })}
                          placeholder="Password"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    )}
                    {selectedLogSource.fields.includes('apiKey') && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          API Key
                        </label>
                        <input
                          type="password"
                          value={logSourceConfig.apiKey}
                          onChange={(e) => setLogSourceConfig({ ...logSourceConfig, apiKey: e.target.value })}
                          placeholder="API Key"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    )}
                    {selectedLogSource.fields.includes('index') && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Index / Search
                        </label>
                        <input
                          type="text"
                          value={logSourceConfig.index}
                          onChange={(e) => setLogSourceConfig({ ...logSourceConfig, index: e.target.value })}
                          placeholder="e.g., logs-*, main"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            isDarkMode
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  <div className={`mt-6 pt-6 border-t flex justify-end gap-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => { setShowLogSourceModal(false); setSelectedLogSource(null) }}
                      className={`px-6 py-2.5 rounded-xl font-medium ${
                        isDarkMode
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfigSubmit}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NetworkAnalytics
