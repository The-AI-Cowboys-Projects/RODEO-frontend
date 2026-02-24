import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { stats, samples, vulnerabilities } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'

// TopoJSON world map data URL
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Attack flow connections between regions
const attackFlows = [
  { from: [-100, 40], to: [10, 50], color: '#ef4444', type: 'Ransomware' },      // NA -> Europe
  { from: [105, 35], to: [-100, 40], color: '#f59e0b', type: 'DDoS' },           // Asia -> NA
  { from: [105, 35], to: [10, 50], color: '#ef4444', type: 'APT' },              // Asia -> Europe
  { from: [50, 30], to: [10, 50], color: '#f59e0b', type: 'Phishing' },          // ME -> Europe
  { from: [105, 35], to: [135, -25], color: '#3b82f6', type: 'Malware' },        // Asia -> Oceania
  { from: [-60, -15], to: [-100, 40], color: '#3b82f6', type: 'BruteForce' },    // SA -> NA
  { from: [20, 0], to: [10, 50], color: '#8b5cf6', type: 'Botnet' },             // Africa -> Europe
  { from: [10, 50], to: [-100, 40], color: '#ef4444', type: 'Zero-Day' },        // Europe -> NA
  { from: [105, 35], to: [50, 30], color: '#f59e0b', type: 'Espionage' },        // Asia -> ME
]

export default function Dashboard() {
  const { isDarkMode } = useTheme()
  const { isDemoMode, seededInt } = useDemoMode()
  const [threatData, setThreatData] = useState([])
  const [activeFlows, setActiveFlows] = useState([])
  const animationRef = useRef(null)

  // Generate simulated threat heatmap data
  useEffect(() => {
    const regions = [
      { name: 'North America', lat: 40, lng: -100, threats: isDemoMode ? seededInt('geo_na', 100, 600) : Math.floor(Math.random() * 500) + 100 },
      { name: 'South America', lat: -15, lng: -60, threats: isDemoMode ? seededInt('geo_sa', 50, 350) : Math.floor(Math.random() * 300) + 50 },
      { name: 'Europe', lat: 50, lng: 10, threats: isDemoMode ? seededInt('geo_eu', 200, 800) : Math.floor(Math.random() * 600) + 200 },
      { name: 'Africa', lat: 0, lng: 20, threats: isDemoMode ? seededInt('geo_af', 30, 230) : Math.floor(Math.random() * 200) + 30 },
      { name: 'Middle East', lat: 30, lng: 50, threats: isDemoMode ? seededInt('geo_me', 100, 500) : Math.floor(Math.random() * 400) + 100 },
      { name: 'Asia', lat: 35, lng: 105, threats: isDemoMode ? seededInt('geo_as', 300, 1100) : Math.floor(Math.random() * 800) + 300 },
      { name: 'Oceania', lat: -25, lng: 135, threats: isDemoMode ? seededInt('geo_oc', 20, 170) : Math.floor(Math.random() * 150) + 20 },
    ]

    const threatTypes = [
      { type: 'Malware', count: isDemoMode ? seededInt('tt_malware', 200, 1200) : Math.floor(Math.random() * 1000) + 200, severity: 'critical' },
      { type: 'Phishing', count: isDemoMode ? seededInt('tt_phishing', 150, 950) : Math.floor(Math.random() * 800) + 150, severity: 'high' },
      { type: 'DDoS', count: isDemoMode ? seededInt('tt_ddos', 100, 600) : Math.floor(Math.random() * 500) + 100, severity: 'high' },
      { type: 'Ransomware', count: isDemoMode ? seededInt('tt_ransomware', 50, 350) : Math.floor(Math.random() * 300) + 50, severity: 'critical' },
      { type: 'Brute Force', count: isDemoMode ? seededInt('tt_brute', 120, 720) : Math.floor(Math.random() * 600) + 120, severity: 'medium' },
      { type: 'SQL Injection', count: isDemoMode ? seededInt('tt_sqli', 80, 480) : Math.floor(Math.random() * 400) + 80, severity: 'high' },
      { type: 'XSS', count: isDemoMode ? seededInt('tt_xss', 70, 420) : Math.floor(Math.random() * 350) + 70, severity: 'medium' },
      { type: 'Zero-Day', count: isDemoMode ? seededInt('tt_zeroday', 5, 55) : Math.floor(Math.random() * 50) + 5, severity: 'critical' },
    ]

    setThreatData({ regions, threatTypes })

    // Initialize all flows as active
    setActiveFlows(attackFlows.map((_, i) => i))
  }, [isDemoMode, seededInt])

  // Animate traffic flows - cycle through which ones are highlighted
  useEffect(() => {
    let flowIndex = 0
    const interval = setInterval(() => {
      // Randomly activate 3-5 flows
      const numActive = isDemoMode ? seededInt(`flows_${Math.floor(Date.now() / 5000)}`, 3, 5) : Math.floor(Math.random() * 3) + 3
      const newActive = []
      for (let i = 0; i < numActive; i++) {
        newActive.push((flowIndex + i) % attackFlows.length)
      }
      setActiveFlows(newActive)
      flowIndex = (flowIndex + 1) % attackFlows.length
    }, 800)

    return () => clearInterval(interval)
  }, [isDemoMode, seededInt])

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
    return <div className="text-center text-gray-400 p-8">Loading dashboard...</div>
  }

  const chartData = [
    { name: 'Samples', value: statsData?.total_samples || 0 },
    { name: 'Vulnerabilities', value: statsData?.total_vulnerabilities || 0 },
    { name: 'Patches', value: statsData?.total_patches || 0 },
  ]

  return (
    <div className={`space-y-6 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-[#800080]'}`}>Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-300'} p-6 rounded-lg border`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'} text-sm`}>Total Samples</p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#800080]'} mt-2`}>{statsData?.total_samples || 0}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-300'} p-6 rounded-lg border`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'} text-sm`}>High Risk</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{statsData?.high_risk_samples || 0}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-300'} p-6 rounded-lg border`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'} text-sm`}>Critical Vulnerabilities</p>
          <p className="text-3xl font-bold text-orange-400 mt-2">{statsData?.critical_vulnerabilities || 0}</p>
        </div>
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-300'} p-6 rounded-lg border`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'} text-sm`}>Patches</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{statsData?.total_patches || 0}</p>
        </div>
      </div>

      {/* Chart */}
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} />
            <Tooltip
              contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}` }}
              labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#111827' }}
            />
            <Bar dataKey="value" fill="#a78bfa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive World Map with Real Countries */}
      <div className={`backdrop-blur-sm rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'}`}>
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Global Threat Intelligence</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`relative h-[600px] ${isDarkMode ? 'bg-slate-900/30' : 'bg-gray-100/50'}`}>
          {/* CSS Animation for flowing dashes */}
          <style>
            {`
              @keyframes dashMove {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes dashMoveReverse {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: 24; }
              }
              @keyframes pulseGlow {
                0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
                50% { filter: drop-shadow(0 0 12px currentColor); }
              }
            `}
          </style>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 147,
              center: [0, 20]
            }}
            className="w-full h-full"
          >
            {/* SVG Defs for animated gradients */}
            <defs>
              <linearGradient id="flowGradientRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="flowGradientYellow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="flowGradientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="flowGradientPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>

            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#475569"
                    stroke="#64748b"
                    strokeWidth={0.5}
                    style={{
                      default: { fill: '#475569', outline: 'none' },
                      hover: { fill: '#5b6a7f', outline: 'none', transition: 'all 0.2s' },
                      pressed: { fill: '#3b4557', outline: 'none' }
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Attack Flow Lines */}
            {attackFlows.map((flow, idx) => {
              const isActive = activeFlows.includes(idx)
              return (
                <Line
                  key={`flow-${idx}`}
                  from={flow.from}
                  to={flow.to}
                  stroke={flow.color}
                  strokeWidth={isActive ? 2.5 : 1}
                  strokeLinecap="round"
                  strokeDasharray={isActive ? "8 4" : "4 4"}
                  strokeOpacity={isActive ? 0.9 : 0.3}
                  style={{
                    transition: 'all 0.3s ease',
                    filter: isActive ? `drop-shadow(0 0 6px ${flow.color})` : 'none',
                    animation: isActive ? 'dashMove 0.8s linear infinite' : 'none',
                  }}
                />
              )
            })}

            {/* Threat Markers */}
            {threatData.regions?.map((region, idx) => {
              const intensity = Math.min(region.threats / 800, 1)
              const size = 8 + (intensity * 8)
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
                      strokeWidth={1.5}
                      style={{
                        filter: `drop-shadow(0 0 ${size * 2}px ${color})`
                      }}
                    />
                    {/* Tooltip on hover */}
                    <text
                      textAnchor="middle"
                      y={-size - 15}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      style={{
                        fontSize: '11px',
                        fill: '#ffffff',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        textShadow: '0 0 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      {region.name}: {region.threats}
                    </text>
                  </g>
                </Marker>
              )
            })}
          </ComposableMap>

          {/* Map legend */}
          <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 backdrop-blur-sm border-t ${isDarkMode ? 'bg-slate-900/80 border-slate-700/30' : 'bg-white/90 border-gray-200'}`}>
            <div className="flex items-center space-x-6">
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Threat Severity:</div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Medium</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>High</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Critical</span>
                </div>
              </div>
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Updated {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Recent High-Risk Samples */}
      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent High-Risk Samples</h2>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
            <thead>
              <tr>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sample ID</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>SHA256</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Risk Score</th>
                <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {highRiskSamples?.slice(0, 5).map((sample) => (
                <tr key={sample.sample_id}>
                  <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sample.sample_id}</td>
                  <td className={`px-4 py-3 text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2">
                      <span>{sample.sha256?.substring(0, 16)}...</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(sample.sha256)}
                        className="text-gray-500 hover:text-purple-400 transition-colors"
                        title="Copy full hash"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-red-400 font-bold">{sample.overall_risk_score?.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                      {sample.analysis_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
