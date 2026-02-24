import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { stats, samples, vulnerabilities, networkAnalytics } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'
import { ChartErrorBoundary, WidgetErrorBoundary } from '../components/ErrorBoundary'
import { useToast } from '../components/ui/Toast'
import AiTriagePanel from '../components/AiTriagePanel'
import WorkflowAutomation from '../components/WorkflowAutomation'
import RoiCalculator from '../components/RoiCalculator'

// TopoJSON world map data URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function Dashboard() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const { isDemoMode, seededInt } = useDemoMode()
  const toast = useToast()
  const [threatData, setThreatData] = useState({ regions: [], threatTypes: [] })
  const [attackFlows, setAttackFlows] = useState([])
  const [activeFlows, setActiveFlows] = useState([])
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isLoadingGeoData, setIsLoadingGeoData] = useState(true)

  // Copy to clipboard with feedback
  const copyToClipboard = async (text, label = 'Text') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      toast.error(`Failed to copy ${label.toLowerCase()}`)
    }
  }

  // Fetch geo threat data from API
  const fetchGeoThreats = async () => {
    try {
      setIsLoadingGeoData(true)
      const data = await networkAnalytics.geoThreats(isLiveMode)

      // Transform API response to match component expectations
      const regions = data.regions.map(r => ({
        name: r.name,
        lat: r.lat,
        lng: r.lng,
        threats: r.threats,
      }))

      const threatTypes = data.threat_types.map(t => ({
        type: t.type,
        count: t.count,
        severity: t.severity,
      }))

      // Transform attack flows from API format to component format
      const flows = data.attack_flows.map(f => ({
        from: [f.from.lng, f.from.lat],
        to: [f.to.lng, f.to.lat],
        color: f.color,
        type: f.type,
        severity: f.severity,
        count: f.count,
      }))

      setThreatData({ regions, threatTypes })
      setAttackFlows(flows)
      setActiveFlows(flows.map((_, i) => i))
      setLastUpdated(new Date(data.timestamp))
    } catch (error) {
      console.error('Failed to fetch geo threats:', error)
      // Fall back to demo data on error
      const fallbackRegions = [
        { name: 'North America', lat: 40, lng: -100, threats: 350 },
        { name: 'South America', lat: -15, lng: -60, threats: 150 },
        { name: 'Europe', lat: 50, lng: 10, threats: 450 },
        { name: 'Africa', lat: 0, lng: 20, threats: 100 },
        { name: 'Middle East', lat: 30, lng: 50, threats: 280 },
        { name: 'Asia', lat: 35, lng: 105, threats: 650 },
        { name: 'Oceania', lat: -25, lng: 135, threats: 80 },
      ]
      const fallbackFlows = [
        { from: [-100, 40], to: [10, 50], color: '#ef4444', type: 'Ransomware' },
        { from: [105, 35], to: [-100, 40], color: '#f59e0b', type: 'DDoS' },
        { from: [105, 35], to: [10, 50], color: '#ef4444', type: 'APT' },
        { from: [50, 30], to: [10, 50], color: '#f59e0b', type: 'Phishing' },
        { from: [105, 35], to: [135, -25], color: '#3b82f6', type: 'Malware' },
      ]
      setThreatData({ regions: fallbackRegions, threatTypes: [] })
      setAttackFlows(fallbackFlows)
      setActiveFlows(fallbackFlows.map((_, i) => i))
    } finally {
      setIsLoadingGeoData(false)
    }
  }

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchGeoThreats()

    // Refresh every 30 seconds in live mode, 60 seconds in demo mode
    const refreshInterval = isLiveMode ? 30000 : 60000
    const interval = setInterval(fetchGeoThreats, refreshInterval)

    return () => clearInterval(interval)
  }, [isLiveMode])

  // Animate traffic flows - cycle through which ones are highlighted
  useEffect(() => {
    if (attackFlows.length === 0) return

    let flowIndex = 0
    const interval = setInterval(() => {
      const numActive = isDemoMode ? seededInt(`dash_flows_${Math.floor(Date.now() / 5000)}`, 3, 5) : Math.floor(Math.random() * 3) + 3
      const newActive = []
      for (let i = 0; i < numActive; i++) {
        newActive.push((flowIndex + i) % attackFlows.length)
      }
      setActiveFlows(newActive)
      flowIndex = (flowIndex + 1) % attackFlows.length
    }, 800)

    return () => clearInterval(interval)
  }, [attackFlows, isDemoMode, seededInt])

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: stats.overview,
  })

  const { data: highRiskSamples, isLoading: samplesLoading } = useQuery({
    queryKey: ['high-risk-samples'],
    queryFn: () => samples.getHighRisk(0.7),
  })

  const { data: criticalVulns, isLoading: vulnsLoading } = useQuery({
    queryKey: ['critical-vulns'],
    queryFn: vulnerabilities.getCritical,
  })

  if (statsLoading || samplesLoading || vulnsLoading) {
    return <div className={`text-center p-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading dashboard...</div>
  }

  const chartData = [
    { name: 'Samples', value: statsData?.total_samples || 0 },
    { name: 'Vulnerabilities', value: statsData?.total_vulnerabilities || 0 },
    { name: 'Patches', value: statsData?.total_patches || 0 },
  ]

  // Get severity color
  const getSeverityColor = (severity) => {
    if (isDarkMode) {
      switch (severity) {
        case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/50'
        case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/50'
        case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50'
        default: return 'text-green-400 bg-green-900/20 border-green-500/50'
      }
    } else {
      switch (severity) {
        case 'critical': return 'text-red-700 bg-red-50 border-red-200'
        case 'high': return 'text-orange-700 bg-orange-50 border-orange-200'
        case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
        default: return 'text-green-700 bg-green-50 border-green-200'
      }
    }
  }

  // Sort threat types by count for top threats
  const topThreats = [...threatData.threatTypes].sort((a, b) => b.count - a.count).slice(0, 5)

  // Sort regions by threat count for top attack regions
  const topAttackRegions = [...threatData.regions].sort((a, b) => b.threats - a.threats).slice(0, 5)

  return (
    <div className={`space-y-8 pb-8 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
        <div className={'relative backdrop-blur-sm rounded-2xl border p-8 ' + (isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white/80 border-gray-200')}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-purple via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Security Dashboard
              </h1>
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' mt-2'}>Real-time threat intelligence and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Live/Demo Mode Toggle */}
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  isLiveMode
                    ? isDarkMode
                      ? 'bg-emerald-900/30 border-emerald-500/50 hover:bg-emerald-900/50'
                      : 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                    : isDarkMode
                      ? 'bg-slate-800 border-slate-600 hover:bg-slate-700'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`}
                aria-label={isLiveMode ? 'Switch to demo mode' : 'Switch to live mode'}
              >
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${
                  isLiveMode ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-600' : 'bg-gray-400'
                }`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${
                    isLiveMode ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
                <span className={`text-sm font-medium ${
                  isLiveMode ? 'text-emerald-400' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isLiveMode ? 'Live' : 'Demo'}
                </span>
              </button>

              {/* Status Badge */}
              <div className={'flex items-center space-x-3 px-4 py-2 rounded-lg border ' + (
                isLiveMode
                  ? isDarkMode ? 'bg-slate-900/50 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200'
                  : isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50 border-blue-200'
              )}>
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  isLiveMode
                    ? 'bg-emerald-400 animate-pulse shadow-emerald-400/50'
                    : isDarkMode ? 'bg-blue-400 shadow-blue-400/50' : 'bg-blue-500 shadow-blue-500/50'
                }`}></div>
                <span className={`font-semibold ${
                  isLiveMode ? 'text-emerald-400' : isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {isLiveMode ? 'Live Monitoring' : 'Demo Mode'}
                </span>
                {isLoadingGeoData && (
                  <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={'group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-brand-purple/50 hover:shadow-brand-purple/10' : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-purple-100')}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-purple/10 rounded-full blur-2xl group-hover:bg-brand-purple/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium uppercase tracking-wide'}>Total Samples</p>
              <div className="w-10 h-10 bg-brand-purple/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-purple-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-4xl font-bold mt-3'}>{statsData?.total_samples || 0}</p>
            <p className="text-xs text-brand-purple-light mt-2">↑ 12% from last week</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/high-risk-samples')}
          className={'group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-105 ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-red-500/50 hover:shadow-red-500/10' : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-red-100')}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium uppercase tracking-wide'}>High Risk</p>
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-4xl font-bold mt-3'}>{statsData?.high_risk_samples || 0}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-red-400">Requires attention</p>
              <svg className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/critical-vulnerabilities')}
          className={'group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-105 ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-orange-500/50 hover:shadow-orange-500/10' : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-orange-100')}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium uppercase tracking-wide'}>Critical Vulnerabilities</p>
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-all">
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                </svg>
              </div>
            </div>
            <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-4xl font-bold mt-3'}>{statsData?.critical_vulnerabilities || 0}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-orange-400">Active threats</p>
              <svg className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/patches')}
          className={'group relative p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-105 ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-green-500/50 hover:shadow-green-500/10' : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-green-100')}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium uppercase tracking-wide'}>Patches</p>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-4xl font-bold mt-3'}>{statsData?.total_patches || 0}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-green-400">Applied successfully</p>
              <svg className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={'backdrop-blur-sm p-8 rounded-xl border shadow-xl ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50' : 'bg-white border-gray-200')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-2xl font-bold'}>System Overview</h2>
            <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mt-1'}>Comprehensive security metrics</p>
          </div>
          <div className={'flex items-center space-x-2 px-3 py-1.5 rounded-lg border ' + (isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-blue-50 border-blue-200')}>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-xs'}>Real-time</span>
          </div>
        </div>
        <ChartErrorBoundary chartName="System Overview">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} vertical={false} />
              <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#1e293b', fontWeight: 'bold' }}
                cursor={{ fill: isDarkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(128, 0, 128, 0.05)' }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartErrorBoundary>
      </div>

      {/* Global Threat Map and Top Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map */}
        <div className={'lg:col-span-2 backdrop-blur-sm rounded-xl border overflow-hidden shadow-2xl ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50' : 'bg-white border-gray-200')}>
          <div className={'px-6 py-5 border-b ' + (isDarkMode ? 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-700/50' : 'bg-gray-50 border-gray-200')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-2xl font-bold'}>Global Threat Intelligence</h2>
                  <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mt-1'}>Live threat distribution across regions</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/30">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                <span className="text-sm text-emerald-400 font-semibold">Live</span>
              </div>
            </div>
          </div>

          <div className={`relative h-[650px] rounded-lg overflow-hidden ${isDarkMode ? 'bg-slate-900/50' : 'bg-blue-50/50'}`}>
            {/* CSS Animation for flowing dashes */}
            <style>
              {`
                @keyframes dashMove {
                  from { stroke-dashoffset: 24; }
                  to { stroke-dashoffset: 0; }
                }
              `}
            </style>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 150,
                center: [0, 30]
              }}
              className="w-full h-full"
            >
              {/* Arrow marker definitions with glow effects */}
              <defs>
                {/* Glow filters */}
                <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                {/* Arrow markers - larger and bolder */}
                <marker id="arrow-red" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0,0 L0,12 L12,6 z" fill="#ef4444" filter="url(#glow-red)" />
                </marker>
                <marker id="arrow-yellow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0,0 L0,12 L12,6 z" fill="#f59e0b" filter="url(#glow-yellow)" />
                </marker>
                <marker id="arrow-blue" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M0,0 L0,12 L12,6 z" fill="#3b82f6" filter="url(#glow-blue)" />
                </marker>
              </defs>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isDarkMode ? '#475569' : '#94a3b8'}
                      stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                      strokeWidth={0.8}
                      style={{
                        default: { fill: isDarkMode ? '#475569' : '#94a3b8', outline: 'none' },
                        hover: { fill: isDarkMode ? '#64748b' : '#cbd5e1', outline: 'none', transition: 'all 0.2s' },
                        pressed: { fill: isDarkMode ? '#334155' : '#e2e8f0', outline: 'none' }
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Attack Flow Lines */}
              {attackFlows.map((flow, idx) => {
                const isActive = activeFlows.includes(idx)
                const arrowId = flow.color === '#ef4444' ? 'arrow-red' : flow.color === '#f59e0b' ? 'arrow-yellow' : 'arrow-blue'
                return (
                  <Line
                    key={`flow-${idx}`}
                    from={flow.from}
                    to={flow.to}
                    stroke={flow.color}
                    strokeWidth={isActive ? 4 : 2.5}
                    strokeLinecap="round"
                    strokeDasharray={isActive ? "12 6" : "8 4"}
                    strokeOpacity={isActive ? 1 : 0.6}
                    markerEnd={`url(#${arrowId})`}
                    style={{
                      transition: 'all 0.3s ease',
                      filter: isActive ? `drop-shadow(0 0 10px ${flow.color}) drop-shadow(0 0 20px ${flow.color})` : `drop-shadow(0 0 4px ${flow.color})`,
                      animation: isActive ? 'dashMove 0.6s linear infinite' : 'none',
                    }}
                  />
                )
              })}

              {/* Attack Flow Target Labels - only show for active flows, deduplicated by location */}
              {(() => {
                // Get unique target locations from active flows only
                const seenLocations = new Set()
                const uniqueTargets = []

                activeFlows.forEach(idx => {
                  const flow = attackFlows[idx]
                  if (!flow) return

                  // Create a location key from coordinates
                  const locationKey = `${flow.to[0].toFixed(2)},${flow.to[1].toFixed(2)}`

                  // Only add if we haven't seen this location yet
                  if (!seenLocations.has(locationKey)) {
                    seenLocations.add(locationKey)
                    uniqueTargets.push({ flow, idx, locationKey })
                  }
                })

                return uniqueTargets.map(({ flow, idx, locationKey }) => (
                  <Marker key={`label-${locationKey}`} coordinates={flow.to}>
                    <g>
                      {/* Outer pulse ring */}
                      <circle
                        r={12}
                        fill="none"
                        stroke={flow.color}
                        strokeWidth={2}
                        opacity={0.3}
                        className="animate-ping"
                      />
                      {/* Target indicator */}
                      <circle
                        r={6}
                        fill={flow.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        style={{
                          filter: `drop-shadow(0 0 8px ${flow.color}) drop-shadow(0 0 16px ${flow.color})`,
                        }}
                      />
                      {/* Inner dot */}
                      <circle
                        r={2}
                        fill="#ffffff"
                      />
                      {/* Target label with background */}
                      <rect
                        x={-28}
                        y={-48}
                        width={56}
                        height={20}
                        rx={4}
                        fill="rgba(0,0,0,0.75)"
                        stroke={flow.color}
                        strokeWidth={1}
                      />
                      <text
                        textAnchor="middle"
                        y={-33}
                        style={{
                          fontSize: '12px',
                          fill: flow.color,
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                          letterSpacing: '1px',
                        }}
                      >
                        TARGET
                      </text>
                    </g>
                  </Marker>
                ))
              })()}

              {/* Threat Markers */}
              {threatData.regions?.map((region, idx) => {
                const intensity = Math.min(region.threats / 800, 1)
                const size = 12 + (intensity * 10)
                const color = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : '#3b82f6'

                return (
                  <Marker key={idx} coordinates={[region.lng, region.lat]}>
                    <g className="group cursor-pointer">
                      {/* Pulse ring */}
                      <circle
                        r={size * 2}
                        fill={color}
                        opacity={0.2}
                        className="animate-ping"
                      />
                      {/* Main marker */}
                      <circle
                        r={size}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        style={{
                          filter: `drop-shadow(0 0 ${size * 2}px ${color})`
                        }}
                      />
                      {/* Tooltip on hover */}
                      <text
                        textAnchor="middle"
                        y={-size - 43}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        style={{
                          fontSize: '16px',
                          fill: '#ffffff',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                          textShadow: '0 0 5px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'
                        }}
                      >
                        {region.name}: {region.threats}
                      </text>
                    </g>
                  </Marker>
                )
              })}
            </ComposableMap>
          </div>

          {/* Map legend - below map */}
          <div className={`flex items-center justify-between px-6 py-2 rounded-b-xl ${
            isDarkMode ? 'bg-slate-800 border-t border-slate-700/50' : 'bg-gray-100 border-t border-gray-200'
          }`}>
            <div className="flex items-center space-x-6">
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Threat Severity:</div>
              <div className="flex items-center space-x-5">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Critical</span>
                </div>
              </div>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Updated {lastUpdated ? lastUpdated.toLocaleTimeString() : new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Top Threats */}
        <div className={'rounded-xl border p-6 shadow-xl ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50' : 'bg-white border-gray-200')}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-xl font-bold'}>Top Threats</h2>
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-xs'}>Most detected attacks</p>
            </div>
          </div>
          <div className="space-y-3">
            {topThreats.map((threat, idx) => (
              <div
                key={threat.type}
                className={`group relative p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${getSeverityColor(threat.severity)}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${isDarkMode ? 'via-white/5' : 'via-black/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg`}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/60'}`}>
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>#{idx + 1}</span>
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{threat.type}</h3>
                        <p className="text-xs uppercase tracking-wider mt-0.5 font-semibold">{threat.severity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Detected</span>
                    <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{threat.count.toLocaleString()}</span>
                  </div>
                  <div className={`mt-2 rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/40'}`}>
                    <div
                      className="h-full bg-current rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((threat.count / Math.max(...topThreats.map(t => t.count))) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Attack Regions */}
      <div className={'backdrop-blur-sm p-8 rounded-xl border shadow-xl ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50' : 'bg-white border-gray-200')}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-2xl font-bold'}>Top Attack Source Regions</h2>
            <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mt-1'}>Geographic threat distribution</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {topAttackRegions.map((region, idx) => {
            const maxThreats = Math.max(...topAttackRegions.map(r => r.threats))
            const percentage = ((region.threats / maxThreats) * 100).toFixed(0)
            const intensity = region.threats / 800
            const severityColor = intensity > 0.7 ? 'text-red-400' : intensity > 0.4 ? 'text-orange-400' : 'text-blue-400'
            const barColor = intensity > 0.7 ? 'bg-red-500' : intensity > 0.4 ? 'bg-orange-500' : 'bg-blue-500'
            const borderColor = intensity > 0.7 ? 'border-red-500/30' : intensity > 0.4 ? 'border-orange-500/30' : 'border-blue-500/30'

            return (
              <div key={region.name} className={`group relative backdrop-blur-sm p-5 rounded-xl border ${borderColor} hover:border-opacity-100 transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50/80'}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${isDarkMode ? 'from-white/5' : 'from-black/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                      <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>#{idx + 1}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{region.name}</h3>
                    <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Attack Source</p>
                  </div>
                  <div className="flex items-baseline space-x-2 mb-3">
                    <p className={`text-3xl font-bold ${severityColor}`}>{region.threats.toLocaleString()}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>attacks</p>
                  </div>
                  <div className="relative">
                    <div className={`flex items-center justify-between text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-medium">Threat Level</span>
                      <span className="font-bold">{percentage}%</span>
                    </div>
                    <div className={`w-full rounded-full h-2.5 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-700 shadow-lg`}
                        style={{
                          width: `${percentage}%`,
                          boxShadow: intensity > 0.7 ? '0 0 12px rgba(239, 68, 68, 0.6)' : intensity > 0.4 ? '0 0 12px rgba(245, 158, 11, 0.6)' : '0 0 12px rgba(59, 130, 246, 0.6)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent High-Risk Samples */}
      <div className={'backdrop-blur-sm p-8 rounded-xl border shadow-xl ' + (isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50' : 'bg-white border-gray-200')}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' text-2xl font-bold'}>Recent High-Risk Samples</h2>
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mt-1'}>Latest detected malware and threats</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs text-red-400 font-semibold">Critical</span>
          </div>
        </div>
        <div className={`overflow-x-auto rounded-lg border ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-200'}`}>
            <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sample ID</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>SHA256 Hash</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Risk Score</th>
                <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/30 bg-slate-900/30' : 'divide-gray-100 bg-white'}`}>
              {highRiskSamples?.slice(0, 5).map((sample, idx) => (
                <tr key={sample.sample_id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-purple-50/30'}`}>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-purple/20 flex items-center justify-center border border-brand-purple/30">
                        <span className="text-xs font-bold text-brand-purple-light">#{idx + 1}</span>
                      </div>
                      <span>{sample.sample_id}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border w-fit transition-colors ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50 group-hover:border-slate-600/50' : 'bg-gray-50 border-gray-200 group-hover:border-gray-300'}`}>
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span>{sample.sha256?.substring(0, 16)}...</span>
                      <button
                        onClick={() => copyToClipboard(sample.sha256, 'Hash')}
                        className="text-gray-500 hover:text-brand-purple-light transition-colors"
                        title="Copy full hash"
                        aria-label="Copy SHA256 hash to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 max-w-[100px]">
                        <div className={`w-full rounded-full h-2 overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                            style={{ width: `${(sample.overall_risk_score || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-red-400 font-bold text-lg">{sample.overall_risk_score?.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/20 text-green-300 border border-green-500/30">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      {sample.analysis_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Triage Intelligence Panel */}
      <WidgetErrorBoundary widgetName="AI Triage Panel">
        <AiTriagePanel isLiveMode={isLiveMode} />
      </WidgetErrorBoundary>

      {/* Workflow Automation Visualization */}
      <WidgetErrorBoundary widgetName="Workflow Automation">
        <WorkflowAutomation isLiveMode={isLiveMode} />
      </WidgetErrorBoundary>

      {/* ROI Calculator */}
      <WidgetErrorBoundary widgetName="ROI Calculator">
        <RoiCalculator />
      </WidgetErrorBoundary>
    </div>
  )
}
