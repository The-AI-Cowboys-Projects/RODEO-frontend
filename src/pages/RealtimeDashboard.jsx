import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { edr, networkAnalytics, vulnerabilities as vulnApi, pipeline, stats } from '../api/client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Badge from '../components/ui/Badge'
import {
  SignalIcon,
  CpuChipIcon,
  CircleStackIcon,
  GlobeAltIcon,
  BoltIcon,
  ShieldExclamationIcon,
  ServerStackIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  WifiIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { SignalIcon as SignalSolid } from '@heroicons/react/24/solid'

export default function RealtimeDashboard() {
  const { isDarkMode } = useTheme()
  const { isDemoMode, seededInt, seededRandom } = useDemoMode()
  const isLiveMode = !isDemoMode
  const [pluginActivity, setPluginActivity] = useState([])
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 45,
    memory: 62,
    network: 38,
    active_plugins: 3
  })
  const [recentScans, setRecentScans] = useState([])
  const [liveEvents, setLiveEvents] = useState([])
  const [networkData, setNetworkData] = useState([])
  const [pluginDistData, setPluginDistData] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const isLive = isLiveMode && !isPaused
  const [uptime, setUptime] = useState(0)
  // 'live' = real API data, 'simulated' = API failed fallback, 'demo' = demo mode seeded
  const [dataSource, setDataSource] = useState(isDemoMode ? 'demo' : 'live')
  const eventFeedRef = useRef(null)
  const liveFetchFailed = useRef(false)

  // Update dataSource when demo mode changes
  useEffect(() => {
    if (isDemoMode) {
      setDataSource('demo')
      liveFetchFailed.current = false
    }
  }, [isDemoMode])

  // Demo mode: seed all widgets with stable data
  useEffect(() => {
    if (!isDemoMode) return

    const initialData = Array.from({ length: 30 }, (_, i) => ({
      time: i,
      packets: seededInt(`rt_pkt_${i}`, 200, 1000),
      bandwidth: seededInt(`rt_bw_${i}`, 100, 500),
      threats: seededInt(`rt_thr_${i}`, 0, 50)
    }))
    setNetworkData(initialData)

    const plugins = ['Nmap Scanner', 'Metasploit', 'CVE Analyzer', 'Binary Strings', 'OWASP ZAP', 'Nuclei', 'SQLMap', 'Nikto']
    setPluginActivity(plugins.slice(0, 6).map((p, i) => ({
      id: `demo_plugin_${i}`,
      timestamp: `${seededInt(`rt_ph_${i}`, 8, 23)}:${String(seededInt(`rt_pm_${i}`, 0, 59)).padStart(2, '0')}:${String(seededInt(`rt_ps_${i}`, 0, 59)).padStart(2, '0')}`,
      plugin: p,
      status: seededRandom(`rt_pstat_${i}`) > 0.2 ? 'success' : 'running',
      duration: seededInt(`rt_pdur_${i}`, 1, 30),
      target: `192.168.${seededInt(`rt_pa_${i}`, 1, 10)}.${seededInt(`rt_pb_${i}`, 1, 254)}`
    })))

    const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    const services = ['OpenSSH 8.2', 'Apache 2.4', 'MySQL 8.0', 'PostgreSQL 14', 'nginx 1.21', 'Redis 6.2']
    setVulnerabilities(Array.from({ length: 5 }, (_, i) => {
      const sev = severities[seededInt(`rt_vs_${i}`, 0, severities.length - 1)]
      return {
        id: `CVE-2024-${String(seededInt(`rt_vcve_${i}`, 10000, 99999)).padStart(5, '0')}`,
        severity: sev,
        service: services[seededInt(`rt_vsvc_${i}`, 0, services.length - 1)],
        score: sev === 'CRITICAL' ? (9 + seededRandom(`rt_vsc_${i}`)).toFixed(1)
          : sev === 'HIGH' ? (7 + seededRandom(`rt_vsc_${i}`) * 2).toFixed(1)
          : sev === 'MEDIUM' ? (4 + seededRandom(`rt_vsc_${i}`) * 3).toFixed(1)
          : (1 + seededRandom(`rt_vsc_${i}`) * 3).toFixed(1),
        timestamp: `${seededInt(`rt_vth_${i}`, 8, 23)}:${String(seededInt(`rt_vtm_${i}`, 0, 59)).padStart(2, '0')}`
      }
    }))

    setSystemMetrics({
      cpu: seededInt('rt_cpu', 20, 75),
      memory: seededInt('rt_mem', 40, 80),
      network: seededInt('rt_net', 10, 60),
      active_plugins: seededInt('rt_ap', 2, 7)
    })

    setRecentScans(Array.from({ length: 4 }, (_, i) => ({
      id: `demo_scan_${i}`,
      target: `192.168.${seededInt(`rt_st_${i}`, 1, 10)}.${seededInt(`rt_st2_${i}`, 1, 254)}`,
      ports_found: seededInt(`rt_sp_${i}`, 1, 15),
      vulns: seededInt(`rt_sv_${i}`, 0, 8),
      status: i === 0 ? 'scanning' : 'complete',
      progress: i === 0 ? seededInt('rt_spg', 20, 85) : 100
    })))

    setLiveEvents(Array.from({ length: 8 }, (_, i) => ({
      id: `demo_evt_${i}`,
      type: ['success', 'info', 'error'][seededInt(`rt_et_${i}`, 0, 2)],
      message: [
        'Nmap Scanner completed scan on 192.168.1.50',
        'CRITICAL vulnerability CVE-2024-38210 found in OpenSSH 8.2',
        'Nuclei scanning 10.0.0.0/24',
        'CVE Analyzer completed on PostgreSQL 14',
        'HIGH vulnerability CVE-2024-41002 found in Apache 2.4',
        'Metasploit running on 192.168.5.12',
        'OWASP ZAP completed scan on 192.168.3.100',
        'SQLMap completed injection test on 10.0.1.15',
      ][i],
      timestamp: `${seededInt(`rt_evh_${i}`, 8, 23)}:${String(seededInt(`rt_evm_${i}`, 0, 59)).padStart(2, '0')}:${String(seededInt(`rt_evs_${i}`, 0, 59)).padStart(2, '0')}`
    })))

    setPluginDistData(null) // Will use default
  }, [isDemoMode, seededInt, seededRandom])

  // Live mode: initialize network data with empty chart
  useEffect(() => {
    if (isDemoMode) return
    const initialData = Array.from({ length: 30 }, (_, i) => ({
      time: i, packets: 0, bandwidth: 0, threats: 0
    }))
    setNetworkData(initialData)
  }, [isDemoMode])

  // Real-time updates — only when live mode is active AND not paused
  useEffect(() => {
    if (!isLive) return

    let anySuccess = false
    let anyFail = false
    const updateSource = (success) => {
      if (success) anySuccess = true; else anyFail = true
      liveFetchFailed.current = anyFail && !anySuccess
      setDataSource(anySuccess ? 'live' : 'simulated')
    }

    // Update uptime
    const uptimeInterval = setInterval(() => {
      setUptime(prev => prev + 1)
    }, 1000)

    // Plugin activity — pipeline.getFlow()
    const fetchPluginActivity = async () => {
      try {
        const events = await pipeline.getFlow(10)
        if (!Array.isArray(events) || events.length === 0) throw new Error('empty')
        const mapped = events.map(evt => ({
          id: evt.id || evt.event_id || evt.timestamp || Date.now() + Math.random(),
          timestamp: evt.timestamp
            ? new Date(evt.timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
          plugin: evt.event_type || 'Pipeline Event',
          status: (evt.severity === 'critical' || evt.severity === 'high') ? 'running' : 'success',
          duration: evt.duration_ms ? Math.round(evt.duration_ms / 1000) : Math.floor(Math.random() * 30) + 1,
          target: evt.target || evt.source || 'pipeline'
        }))
        setPluginActivity(mapped.slice(0, 8))
        const newLiveEvents = mapped.slice(0, 3).map(a => ({
          id: Date.now() + Math.random(),
          type: a.status === 'success' ? 'success' : 'info',
          message: `${a.plugin} ${a.status === 'success' ? 'completed on' : 'running on'} ${a.target}`,
          timestamp: a.timestamp
        }))
        setLiveEvents(prev => [...newLiveEvents, ...prev].slice(0, 50))
        updateSource(true)
      } catch {
        updateSource(false)
      }
    }
    const activityInterval = setInterval(fetchPluginActivity, 5000)
    fetchPluginActivity()

    // Vulnerabilities — vulnApi.getCritical()
    const fetchVulns = async () => {
      try {
        const data = await vulnApi.getCritical()
        const list = Array.isArray(data) ? data : (data?.vulnerabilities || [])
        if (list.length === 0) throw new Error('empty')
        const mapped = list.map(v => ({
          id: v.cve_id || v.id || `CVE-2024-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
          severity: (v.severity || 'HIGH').toUpperCase(),
          service: v.affected_service || v.service || 'Unknown Service',
          score: v.cvss_score != null ? parseFloat(v.cvss_score).toFixed(1) : '9.0',
          timestamp: v.published_at || v.timestamp
            ? new Date(v.published_at || v.timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString()
        }))
        setVulnerabilities(mapped.slice(0, 6))
        const critical = mapped.filter(v => v.severity === 'CRITICAL' || v.severity === 'HIGH').slice(0, 2)
        if (critical.length > 0) {
          setLiveEvents(prev => [
            ...critical.map(v => ({
              id: Date.now() + Math.random(),
              type: 'error',
              message: `${v.severity} vulnerability ${v.id} found in ${v.service}`,
              timestamp: new Date().toLocaleTimeString()
            })),
            ...prev
          ].slice(0, 50))
        }
        updateSource(true)
      } catch {
        updateSource(false)
      }
    }
    const vulnInterval = setInterval(fetchVulns, 10000)
    fetchVulns()

    // System metrics — stats.overview() + edr.getStatus()
    const fetchMetrics = async () => {
      try {
        const [overview, edrStatus] = await Promise.all([
          stats.overview(),
          edr.getStatus()
        ])
        const endpointsCount = edrStatus?.endpoints_count ?? 0
        const detectionsCount = edrStatus?.detections_count ?? 0
        const connectorCount = edrStatus?.connectors
          ? Object.keys(edrStatus.connectors).length : 0
        const cpuVal = overview?.cpu_usage != null
          ? overview.cpu_usage
          : Math.min(95, Math.max(10, (endpointsCount % 80) + 20))
        const memVal = overview?.memory_usage != null
          ? overview.memory_usage
          : Math.min(90, Math.max(30, (detectionsCount % 55) + 30))
        const netVal = overview?.network_usage != null
          ? overview.network_usage
          : Math.min(95, Math.max(5, (endpointsCount * 3) % 90))
        const activePlugins = connectorCount > 0
          ? connectorCount
          : (overview?.active_plugins ?? 0)
        setSystemMetrics({ cpu: cpuVal, memory: memVal, network: netVal, active_plugins: activePlugins })
        updateSource(true)
      } catch {
        updateSource(false)
      }
    }
    const metricsInterval = setInterval(fetchMetrics, 5000)
    fetchMetrics()

    // Network data — networkAnalytics.metrics()
    const fetchNetwork = async () => {
      try {
        const metrics = await networkAnalytics.metrics(1)
        setNetworkData(prev => {
          const newPoint = {
            time: prev.length > 0 ? prev[prev.length - 1].time + 1 : 0,
            packets: metrics.packets_per_second != null
              ? Math.round(metrics.packets_per_second) : 0,
            bandwidth: metrics.bandwidth_mbps != null
              ? Math.round(metrics.bandwidth_mbps) : 0,
            threats: metrics.threat_count != null
              ? metrics.threat_count : 0
          }
          return [...prev.slice(-29), newPoint]
        })
        updateSource(true)
      } catch {
        updateSource(false)
      }
    }
    const networkInterval = setInterval(fetchNetwork, 3000)
    fetchNetwork()

    // Recent scans — pipeline.getFlow() filtered for scan events
    const fetchScans = async () => {
      try {
        const events = await pipeline.getFlow(20)
        const list = Array.isArray(events) ? events : []
        const scanEvents = list.filter(e =>
          e.event_type && (
            e.event_type.toLowerCase().includes('scan') ||
            e.event_type.toLowerCase().includes('vuln') ||
            e.event_type.toLowerCase().includes('detect')
          )
        )
        const source = scanEvents.length > 0 ? scanEvents : list
        if (source.length === 0) throw new Error('empty')
        const mapped = source.slice(0, 5).map(evt => ({
          id: evt.id || evt.event_id || Date.now() + Math.random(),
          target: evt.target || evt.source || 'pipeline',
          ports_found: evt.ports_found ?? 0,
          vulns: evt.vulnerability_count ?? evt.vuln_count ?? 0,
          status: evt.status === 'running' ? 'scanning' : 'complete',
          progress: evt.progress ?? 100
        }))
        setRecentScans(mapped)
        updateSource(true)
      } catch {
        updateSource(false)
      }
    }
    const scansInterval = setInterval(fetchScans, 4000)
    fetchScans()

    // Plugin distribution — pipeline.getStats() for dynamic pie chart
    const fetchDistribution = async () => {
      try {
        const pipeStats = await pipeline.getStats()
        const eventStats = pipeStats?.events || {}
        const execStats = pipeStats?.execution || {}
        const agentStats = pipeStats?.agent || {}

        const totalEvents = eventStats.events_published || 0
        const totalOutcomes = (execStats.total_outcomes || 0) + (execStats.successes || 0) + (execStats.failures || 0)
        const totalDecisions = agentStats.total_decisions || agentStats.decisions_made || 0
        const totalPlaybooks = pipeStats?.playbooks?.total_executions || 0

        if (totalEvents + totalOutcomes + totalDecisions + totalPlaybooks === 0) throw new Error('empty')

        setPluginDistData([
          { name: 'Events', value: totalEvents || 1, color: '#3b82f6' },
          { name: 'Decisions', value: totalDecisions || 1, color: '#8b5cf6' },
          { name: 'Actions', value: totalOutcomes || 1, color: '#f59e0b' },
          { name: 'Playbooks', value: totalPlaybooks || 1, color: '#10b981' },
        ])
        updateSource(true)
      } catch {
        setPluginDistData(null)
        updateSource(false)
      }
    }
    const distInterval = setInterval(fetchDistribution, 15000)
    fetchDistribution()

    return () => {
      clearInterval(uptimeInterval)
      clearInterval(activityInterval)
      clearInterval(vulnInterval)
      clearInterval(metricsInterval)
      clearInterval(networkInterval)
      clearInterval(scansInterval)
      clearInterval(distInterval)
    }
  }, [isLive])

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const defaultDistribution = [
    { name: 'Reconnaissance', value: 35, color: '#3b82f6' },
    { name: 'Vulnerability', value: 28, color: '#8b5cf6' },
    { name: 'Exploitation', value: 18, color: '#f59e0b' },
    { name: 'Analysis', value: 19, color: '#10b981' }
  ]
  const pluginDistribution = pluginDistData || defaultDistribution

  const severityConfig = {
    CRITICAL: { color: '#ef4444', bg: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30' },
    HIGH: { color: '#f97316', bg: 'from-orange-500/20 to-orange-600/10', border: 'border-orange-500/30' },
    MEDIUM: { color: '#eab308', bg: 'from-yellow-500/20 to-yellow-600/10', border: 'border-yellow-500/30' },
    LOW: { color: '#22c55e', bg: 'from-green-500/20 to-green-600/10', border: 'border-green-500/30' }
  }

  const getMetricColor = (value) => {
    if (value >= 80) return 'text-red-400'
    if (value >= 60) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  const getMetricGradient = (value) => {
    if (value >= 80) return 'from-red-500 to-orange-500'
    if (value >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-emerald-500 to-cyan-500'
  }

  return (
    <div className={`space-y-6 pb-8 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
        <div className={`relative backdrop-blur-sm rounded-2xl border p-6 ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${isLive ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-slate-500/20 to-gray-500/20'}`}>
                <SignalSolid className={`w-8 h-8 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Real-Time Operations
                </h1>
                <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Live security monitoring and threat detection
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Data Source Indicator */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-semibold ${
                dataSource === 'live'
                  ? isDarkMode ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : dataSource === 'demo'
                    ? isDarkMode ? 'bg-purple-900/30 border-purple-500/50 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
                    : isDarkMode ? 'bg-amber-900/30 border-amber-500/50 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  dataSource === 'live' ? 'bg-emerald-400 animate-pulse'
                    : dataSource === 'demo' ? 'bg-purple-400'
                    : 'bg-amber-400 animate-pulse'
                }`} />
                <span>{dataSource === 'live' ? 'Live Data' : dataSource === 'demo' ? 'Demo Mode' : 'API Unavailable'}</span>
              </div>

              {/* Uptime */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-slate-900/50 border border-slate-700' : 'bg-gray-100 border border-gray-200'}`}>
                <ClockIcon className="w-4 h-4 text-cyan-400" />
                <span className={`font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatUptime(uptime)}
                </span>
              </div>

              {/* Live / Pause Toggle — only shown in live mode (not demo) */}
              {isLiveMode && (
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    !isPaused
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 text-gray-300 shadow-lg'
                  }`}
                >
                  {!isPaused ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                  <span>{!isPaused ? 'Live' : 'Paused'}</span>
                  {!isPaused && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                </button>
              )}

              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${
                isLive
                  ? isDarkMode ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200'
                  : isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-300'
              }`}>
                <WifiIcon className={`w-4 h-4 ${isLive ? 'text-emerald-400' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isLive ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {isLive ? 'Connected' : isDemoMode ? 'Demo' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'CPU Usage', value: systemMetrics.cpu, icon: CpuChipIcon, suffix: '%' },
          { label: 'Memory', value: systemMetrics.memory, icon: CircleStackIcon, suffix: '%' },
          { label: 'Network I/O', value: systemMetrics.network, icon: GlobeAltIcon, suffix: '%' },
          { label: 'Active Plugins', value: systemMetrics.active_plugins, icon: BoltIcon, suffix: '', isCount: true },
        ].map((metric, idx) => (
          <div key={idx} className={`group relative p-5 rounded-xl border transition-all duration-300 hover:shadow-lg overflow-hidden ${
            isDarkMode
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-cyan-500/50'
              : 'bg-white border-gray-200 hover:border-cyan-300'
          }`}>
            {/* Animated background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getMetricGradient(metric.value)} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

            {/* Progress ring background effect */}
            {!metric.isCount && (
              <div className="absolute -right-8 -bottom-8 w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={isDarkMode ? '#1e293b' : '#f3f4f6'}
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={metric.value >= 80 ? '#ef4444' : metric.value >= 60 ? '#eab308' : '#10b981'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(metric.value / 100) * 352} 352`}
                    className="transition-all duration-500"
                    style={{ filter: `drop-shadow(0 0 6px ${metric.value >= 80 ? '#ef4444' : metric.value >= 60 ? '#eab308' : '#10b981'})` }}
                  />
                </svg>
              </div>
            )}

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {metric.label}
                </span>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  metric.value >= 80 ? 'bg-red-500/20' : metric.value >= 60 ? 'bg-yellow-500/20' : 'bg-emerald-500/20'
                }`}>
                  <metric.icon className={`w-5 h-5 ${getMetricColor(metric.value)}`} />
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className={`text-4xl font-bold ${getMetricColor(metric.value)}`}>
                  {Math.round(metric.value)}
                </span>
                <span className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{metric.suffix}</span>
              </div>
              {!metric.isCount && (
                <div className={`mt-3 h-1.5 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getMetricGradient(metric.value)} transition-all duration-500`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plugin Activity */}
        <div className="lg:col-span-2">
          <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CommandLineIcon className="w-5 h-5 text-cyan-400" />
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Plugin Execution Monitor
                  </h2>
                </div>
                <Badge color="blue">{pluginActivity.filter(p => p.status === 'running').length} running</Badge>
              </div>
            </div>
            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {pluginActivity.length === 0 ? (
                <div className="text-center py-12">
                  <ArrowPathIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} ${isLive ? 'animate-spin' : ''}`} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Waiting for plugin activity...</p>
                </div>
              ) : (
                pluginActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode ? 'bg-slate-900/50 hover:bg-slate-900/80' : 'bg-gray-50 hover:bg-gray-100'
                    } ${activity.status === 'running' ? 'ring-1 ring-cyan-500/30' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.status === 'running'
                          ? 'bg-cyan-500/20'
                          : 'bg-emerald-500/20'
                      }`}>
                        {activity.status === 'running' ? (
                          <ArrowPathIcon className="w-5 h-5 text-cyan-400 animate-spin" />
                        ) : (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.plugin}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Target: <span className="font-mono">{activity.target}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{activity.duration}s</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{activity.timestamp}</p>
                      </div>
                      <Badge color={activity.status === 'success' ? 'green' : 'blue'}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Events Feed */}
        <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SignalIcon className="w-5 h-5 text-emerald-400" />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Live Events
                </h2>
              </div>
              {isLive && <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-emerald-400">Streaming</span>
              </span>}
            </div>
          </div>
          <div ref={eventFeedRef} className="p-3 space-y-1.5 max-h-[400px] overflow-y-auto">
            {liveEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-start space-x-2 p-2.5 rounded-lg text-xs transition-all ${
                  isDarkMode ? 'bg-slate-900/30 hover:bg-slate-900/50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  event.type === 'success' ? 'bg-emerald-400' :
                  event.type === 'error' ? 'bg-red-400 animate-pulse' :
                  'bg-cyan-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} break-words`}>{event.message}</p>
                  <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vulnerabilities & Network Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Feed */}
        <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldExclamationIcon className="w-5 h-5 text-red-400" />
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Vulnerability Feed
                </h2>
              </div>
              <Badge color="red">
                {vulnerabilities.filter(v => v.severity === 'CRITICAL').length} Critical
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
            {vulnerabilities.length === 0 ? (
              <div className="text-center py-12">
                <ShieldExclamationIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No vulnerabilities detected yet</p>
              </div>
            ) : (
              vulnerabilities.map((vuln, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-l-4 bg-gradient-to-r ${severityConfig[vuln.severity].bg} ${severityConfig[vuln.severity].border} transition-all duration-300 hover:scale-[1.02]`}
                  style={{ borderLeftColor: severityConfig[vuln.severity].color }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="w-4 h-4" style={{ color: severityConfig[vuln.severity].color }} />
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vuln.id}</p>
                      </div>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{vuln.service}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: severityConfig[vuln.severity].color }}>
                        {vuln.score}
                      </p>
                      <Badge color={
                        vuln.severity === 'CRITICAL' ? 'red' :
                        vuln.severity === 'HIGH' ? 'orange' :
                        vuln.severity === 'MEDIUM' ? 'yellow' : 'green'
                      }>
                        {vuln.severity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Network Activity Chart */}
        <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="w-5 h-5 text-purple-400" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Network Activity
              </h2>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={networkData}>
                <defs>
                  <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} vertical={false} />
                <XAxis dataKey="time" stroke={isDarkMode ? '#64748b' : '#9ca3af'} tick={false} />
                <YAxis stroke={isDarkMode ? '#64748b' : '#9ca3af'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <Area type="monotone" dataKey="packets" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorPackets)" />
                <Area type="monotone" dataKey="bandwidth" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorBandwidth)" />
                <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Packets</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bandwidth</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Threats</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans & Plugin Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <ServerStackIcon className="w-5 h-5 text-blue-400" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Scans
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <ServerStackIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No recent scans</p>
              </div>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    isDarkMode ? 'bg-slate-900/50 hover:bg-slate-900/80' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-mono font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{scan.target}</p>
                    <Badge color={scan.status === 'complete' ? 'green' : 'blue'} >
                      {scan.status === 'scanning' && <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />}
                      {scan.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      <span className="text-cyan-400 font-semibold">{scan.ports_found}</span> ports
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      <span className={`font-semibold ${scan.vulns > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{scan.vulns}</span> vulns
                    </span>
                  </div>
                  {scan.status === 'scanning' && (
                    <div className={`mt-2 h-1 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"
                        style={{ width: `${scan.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Plugin Distribution */}
        <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <BoltIcon className="w-5 h-5 text-yellow-400" />
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Plugin Distribution
              </h2>
            </div>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pluginDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pluginDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isDarkMode ? '#1e293b' : '#ffffff'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e5e7eb',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {pluginDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.name}</span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
