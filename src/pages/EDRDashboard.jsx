import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { edr } from '../api/client'

// API base URL for WebSocket connections
const API_BASE = import.meta.env.VITE_API_URL || ''
import {
  ShieldCheckIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BoltIcon,
  LockClosedIcon,
  LockOpenIcon,
  WifiIcon,
  CpuChipIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PlayIcon,
  EyeIcon,
  ChartBarIcon,
  BeakerIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  BellIcon,
  SignalSlashIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon as ActivityIcon,
  ViewfinderCircleIcon,
  SignalIcon,
  FingerPrintIcon,
  CircleStackIcon,
  CommandLineIcon,
  BugAntIcon,
  UsersIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'

import RemoteAccessGraph from '../components/RemoteAccessGraph'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts'

// ==================== CSS Animations ====================
const styleTag = document.createElement('style')
styleTag.textContent = `
  @keyframes scan {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: translateY(100%); opacity: 0; }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.3); }
    50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.6); }
  }
  @keyframes radar-sweep {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes threat-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes glow-ring {
    0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
    70% { box-shadow: 0 0 0 15px rgba(236, 72, 153, 0); }
    100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
  }
  @keyframes cyber-grid {
    0% { background-position: 0 0; }
    100% { background-position: 50px 50px; }
  }
  @keyframes number-glow {
    0%, 100% { text-shadow: 0 0 10px currentColor; }
    50% { text-shadow: 0 0 25px currentColor, 0 0 40px currentColor; }
  }
  @keyframes border-flow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes icon-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  @keyframes slide-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-scan { animation: scan 3s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
  .animate-radar { animation: radar-sweep 4s linear infinite; }
  .animate-threat-pulse { animation: threat-pulse 2s ease-in-out infinite; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-glow-ring { animation: glow-ring 1.5s infinite; }
  .animate-cyber-grid { animation: cyber-grid 20s linear infinite; }
  .animate-number-glow { animation: number-glow 2s ease-in-out infinite; }
  .animate-border-flow {
    background: linear-gradient(90deg, #ec4899, #800080, #06b6d4, #ec4899);
    background-size: 300% 300%;
    animation: border-flow 3s ease infinite;
  }
  .animate-icon-pulse { animation: icon-pulse 2s ease-in-out infinite; }
  .animate-slide-in { animation: slide-in 0.5s ease-out forwards; }
  .cyber-grid-bg {
    background-image:
      linear-gradient(rgba(236, 72, 153, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(236, 72, 153, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
  }
  .stat-card-glow:hover {
    box-shadow: 0 0 30px rgba(236, 72, 153, 0.2), 0 0 60px rgba(139, 92, 246, 0.1);
  }
`
if (!document.querySelector('#edr-animations')) {
  styleTag.id = 'edr-animations'
  document.head.appendChild(styleTag)
}

// ==================== Animated Background ====================
function GradientOrb({ className, color = 'pink' }) {
  const colors = {
    pink: 'from-pink-500/20 to-purple-500/20',
    cyan: 'from-cyan-500/20 to-blue-500/20',
    orange: 'from-orange-500/20 to-red-500/20',
    green: 'from-green-500/20 to-emerald-500/20',
  }
  return (
    <div
      className={`absolute rounded-full blur-3xl bg-gradient-to-br ${colors[color]} pointer-events-none ${className}`}
    />
  )
}

// ==================== Modern Stat Card ====================
function StatCard({ icon: Icon, label, value, gradient, trend, isDarkMode, onClick, delay = 0 }) {
  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${delay}ms` }}
      className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 stat-card-glow animate-slide-in ${
        onClick ? 'cursor-pointer' : ''
      } ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-2 border-gray-700/50 hover:border-pink-500/50'
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border-2 border-gray-200/80 hover:border-pink-500/50 shadow-xl'
      }`}
    >
      {/* Animated border gradient on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
        <div className="absolute inset-0 rounded-3xl animate-border-flow opacity-30" />
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
          isDarkMode ? 'bg-gradient-to-b from-pink-500/5 via-transparent to-transparent' : 'bg-gradient-to-b from-pink-500/3 via-transparent to-transparent'
        }`} />
      </div>

      <div className="relative flex items-center gap-5">
        {/* Icon container with glow */}
        <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:animate-icon-pulse`}>
          <div className="absolute inset-0 rounded-2xl bg-white/20" />
          <Icon className="w-7 h-7 text-white relative z-10" strokeWidth={2.5} />
          {/* Glow ring */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient} blur-xl -z-10`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-base font-semibold uppercase tracking-wider mb-1 ${
            isDarkMode ? 'text-white/80' : 'text-gray-700'
          }`}>
            {label}
          </p>
          <p className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent tracking-tight`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>

        {/* Arrow indicator */}
        {onClick && (
          <div className={`p-2 rounded-2xl transition-all duration-300 group-hover:translate-x-1 ${
            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <ChevronDownIcon className={`w-6 h-6 -rotate-90 ${isDarkMode ? 'text-white/70' : 'text-gray-700'}`} />
          </div>
        )}
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={`mt-3 flex items-center gap-2 text-base ${
          trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-white/70'
        }`}>
          <ArrowTrendingUpIcon className={`w-5 h-5 ${trend < 0 ? 'rotate-180' : ''}`} />
          <span className="font-semibold">{Math.abs(trend)}% from last hour</span>
        </div>
      )}
    </div>
  )
}

// ==================== Platform Badge ====================
const platformColors = {
  crowdstrike: { bg: 'from-red-500 to-red-600', hex: '#E8283D' },
  sentinelone: { bg: 'from-purple-500 to-purple-600', hex: '#6B4FBB' },
  defender: { bg: 'from-blue-400 to-blue-500', hex: '#00A4EF' },
  carbon_black: { bg: 'from-emerald-500 to-green-500', hex: '#00C389' },
  elastic: { bg: 'from-yellow-400 to-amber-500', hex: '#FEC514' },
}

function PlatformBadge({ platform, size = 'sm' }) {
  const config = platformColors[platform] || { bg: 'from-gray-500 to-gray-600', hex: '#888' }
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-base'

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-semibold text-white bg-gradient-to-r ${config.bg} shadow-lg`}>
      {platform.replace('_', ' ')}
    </span>
  )
}

// ==================== Severity Badge ====================
const severityStyles = {
  critical: { gradient: 'from-red-500 to-red-600', lightBg: 'bg-red-100', darkBg: 'bg-red-500/20', lightText: 'text-red-700', darkText: 'text-red-400', glow: 'shadow-red-500/30' },
  high: { gradient: 'from-orange-500 to-orange-600', lightBg: 'bg-orange-100', darkBg: 'bg-orange-500/20', lightText: 'text-orange-700', darkText: 'text-orange-400', glow: 'shadow-orange-500/30' },
  medium: { gradient: 'from-yellow-500 to-amber-500', lightBg: 'bg-yellow-100', darkBg: 'bg-yellow-500/20', lightText: 'text-yellow-700', darkText: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
  low: { gradient: 'from-blue-500 to-blue-600', lightBg: 'bg-blue-100', darkBg: 'bg-blue-500/20', lightText: 'text-blue-700', darkText: 'text-blue-400', glow: 'shadow-blue-500/30' },
  info: { gradient: 'from-gray-500 to-gray-600', lightBg: 'bg-gray-200', darkBg: 'bg-gray-500/20', lightText: 'text-gray-700', darkText: 'text-gray-400', glow: 'shadow-gray-500/30' },
}

function SeverityBadge({ severity, animated = false }) {
  const { isDarkMode } = useTheme()
  const config = severityStyles[severity] || severityStyles.info
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${isDarkMode ? config.darkBg : config.lightBg} ${isDarkMode ? config.darkText : config.lightText} ${
      animated && severity === 'critical' ? 'animate-threat-pulse' : ''
    } shadow-lg ${config.glow}`}>
      {severity === 'critical' && <ShieldExclamationIcon className="w-4 h-4" />}
      {severity?.toUpperCase()}
    </span>
  )
}

// ==================== Status Badge ====================
function StatusBadge({ status }) {
  const { isDarkMode } = useTheme()
  const statusConfig = {
    online: { icon: CheckCircleIcon, gradient: 'from-green-400 to-emerald-500', lightBg: 'bg-green-100', darkBg: 'bg-green-500/20', lightText: 'text-green-700', darkText: 'text-green-400' },
    offline: { icon: XCircleIcon, gradient: 'from-red-400 to-red-500', lightBg: 'bg-red-100', darkBg: 'bg-red-500/20', lightText: 'text-red-700', darkText: 'text-red-400' },
    isolated: { icon: LockClosedIcon, gradient: 'from-orange-400 to-orange-500', lightBg: 'bg-orange-100', darkBg: 'bg-orange-500/20', lightText: 'text-orange-700', darkText: 'text-orange-400' },
    degraded: { icon: ExclamationTriangleIcon, gradient: 'from-yellow-400 to-amber-500', lightBg: 'bg-yellow-100', darkBg: 'bg-yellow-500/20', lightText: 'text-yellow-700', darkText: 'text-yellow-400' },
    unknown: { icon: InformationCircleIcon, gradient: 'from-gray-400 to-gray-500', lightBg: 'bg-gray-200', darkBg: 'bg-gray-500/20', lightText: 'text-gray-700', darkText: 'text-gray-400' },
  }
  const config = statusConfig[status?.toLowerCase()] || statusConfig.unknown
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${isDarkMode ? config.darkBg : config.lightBg} ${isDarkMode ? config.darkText : config.lightText}`}>
      <Icon className="w-4 h-4" />
      {status}
    </span>
  )
}

// ==================== Tab Configuration ====================
const tabs = [
  { id: 'overview', name: 'Overview', icon: ChartBarIcon, key: '1' },
  { id: 'endpoints', name: 'Endpoints', icon: ComputerDesktopIcon, key: '2' },
  { id: 'detections', name: 'Detections', icon: ShieldExclamationIcon, key: '3' },
  { id: 'correlation', name: 'XDR Correlation', icon: LinkIcon, key: '4' },
  { id: 'hunting', name: 'Threat Hunting', icon: ViewfinderCircleIcon, key: '5' },
  { id: 'mitre', name: 'MITRE ATT&CK', icon: ViewfinderCircleIcon, key: '6' },
  { id: 'identity', name: 'Identity', icon: UsersIcon, key: '7' },
]

// ==================== Overview Tab ====================
function OverviewTab({ endpoints, detections, platforms, correlationStats, isDarkMode, setActiveTab, setPendingFilter }) {
  const { isDemoMode, seededInt } = useDemoMode()
  const totalEndpoints = Object.values(endpoints).flat().length
  const onlineEndpoints = Object.values(endpoints).flat().filter(e => e.status === 'online').length
  const totalDetections = Object.values(detections).flat().length
  const criticalDetections = Object.values(detections).flat().filter(d => d.severity === 'critical').length

  const platformData = Object.entries(endpoints).map(([platform, eps]) => ({
    name: platform,
    value: eps.length,
    color: platformColors[platform]?.hex || '#888'
  }))

  const severityData = ['critical', 'high', 'medium', 'low'].map(sev => ({
    name: sev.charAt(0).toUpperCase() + sev.slice(1),
    value: Object.values(detections).flat().filter(d => d.severity === sev).length,
    color: sev === 'critical' ? '#ef4444' : sev === 'high' ? '#f97316' : sev === 'medium' ? '#eab308' : '#3b82f6'
  }))

  // Real-time timeline: initialize once, then update the current slot every 5 minutes
  const [timelineData, setTimelineData] = useState(() => {
    const now = new Date()
    const currentHour = now.getHours()
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      detections: i <= currentHour ? (isDemoMode ? seededInt(`edr_det_${i}`, 10, 60) : Math.floor(Math.random() * 50) + 10) : 0,
      correlated: i <= currentHour ? (isDemoMode ? seededInt(`edr_cor_${i}`, 5, 25) : Math.floor(Math.random() * 20) + 5) : 0,
    }))
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentHour = now.getHours()
      const allDets = Object.values(detections).flat()
      // Count detections from the current hour window
      const hourStart = new Date(now)
      hourStart.setMinutes(0, 0, 0)
      const recentDets = allDets.filter(d => d.timestamp && new Date(d.timestamp) >= hourStart).length
      setTimelineData(prev => prev.map((slot, i) =>
        i === currentHour
          ? {
              ...slot,
              detections: recentDets || slot.detections + (isDemoMode ? seededInt(`edr_tick_det_${currentHour}`, 0, 3) : Math.floor(Math.random() * 3)),
              correlated: Math.floor((recentDets || slot.detections) * 0.4),
            }
          : slot
      ))
    }, 5 * 60 * 1000) // 5 minute interval
    return () => clearInterval(interval)
  }, [detections, isDemoMode, seededInt])

  const stats = [
    { name: 'Total Endpoints', value: totalEndpoints, icon: ComputerDesktopIcon, gradient: 'from-blue-400 to-cyan-500', tab: 'endpoints' },
    { name: 'Online', value: onlineEndpoints, icon: WifiIcon, gradient: 'from-green-400 to-emerald-500', tab: 'endpoints', filter: 'online' },
    { name: 'Detections (24h)', value: totalDetections, icon: ShieldExclamationIcon, gradient: 'from-orange-400 to-amber-500', tab: 'detections' },
    { name: 'Critical Alerts', value: criticalDetections, icon: ExclamationTriangleIcon, gradient: 'from-red-400 to-pink-500', tab: 'detections', filter: 'critical' },
    { name: 'Correlated', value: correlationStats?.total_correlated || 0, icon: LinkIcon, gradient: 'from-purple-400 to-purple-600', tab: 'correlation' },
    { name: 'Platforms', value: Object.keys(platforms).filter(p => platforms[p]).length, icon: ServerIcon, gradient: 'from-indigo-400 to-blue-500', scrollTo: 'platform-health' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid - 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.name}
            icon={stat.icon}
            label={stat.name}
            value={stat.value}
            gradient={stat.gradient}
            isDarkMode={isDarkMode}
            delay={index * 100}
            onClick={() => {
              if (stat.scrollTo) {
                // Scroll to element
                document.getElementById(stat.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              } else if (stat.tab) {
                setPendingFilter(stat.filter || null)
                setActiveTab(stat.tab)
              }
            }}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Detection Timeline */}
        <div className={`group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-2 border-gray-700/50 hover:border-pink-500/30'
            : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border-2 border-gray-200/80 shadow-xl'
        }`}>
          {/* Cyber grid background */}
          <div className={`absolute inset-0 cyber-grid-bg animate-cyber-grid opacity-30 pointer-events-none`} />

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Detection Timeline
                </span>
                <span className={`text-base font-normal ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  Last 24 hours
                </span>
              </h3>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>
            </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                <defs>
                  <linearGradient id="colorDetectionsEDR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorCorrelatedEDR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800080" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#800080" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4b5563' : '#e5e7eb'} vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke={isDarkMode ? '#ffffff' : '#1f2937'}
                  fontSize={20}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={{ stroke: isDarkMode ? '#6b7280' : '#d1d5db', strokeWidth: 2 }}
                  dy={10}
                  interval={2}
                  height={60}
                  label={{
                    value: 'Hour (24h)',
                    position: 'insideBottom',
                    offset: -5,
                    fill: isDarkMode ? '#ffffff' : '#374151',
                    fontSize: 18,
                    fontWeight: 600
                  }}
                />
                <YAxis
                  stroke={isDarkMode ? '#ffffff' : '#1f2937'}
                  fontSize={20}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={{ stroke: isDarkMode ? '#6b7280' : '#d1d5db', strokeWidth: 2 }}
                  dx={-5}
                  label={{
                    value: 'Count',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: isDarkMode ? '#ffffff' : '#374151',
                    fontSize: 18,
                    fontWeight: 600
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#fff',
                    border: `2px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    padding: '16px 20px',
                  }}
                  labelStyle={{
                    color: isDarkMode ? '#ffffff' : '#111827',
                    fontWeight: 700,
                    fontSize: '16px',
                    marginBottom: '10px',
                  }}
                  itemStyle={{
                    color: isDarkMode ? '#ffffff' : '#1f2937',
                    padding: '4px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                  }}
                  formatter={(value, name) => [value, name === 'detections' ? 'Raw Detections' : 'Correlated Alerts']}
                  labelFormatter={(label) => `Hour: ${label}:00`}
                />
                <Legend
                  verticalAlign="top"
                  height={40}
                  formatter={(value) => (
                    <span style={{ color: isDarkMode ? '#ffffff' : '#1f2937', fontSize: '17px', fontWeight: 600 }}>
                      {value === 'detections' ? 'Raw Detections' : 'Correlated Alerts'}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="detections"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  fill="url(#colorDetectionsEDR)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="correlated"
                  stroke="#800080"
                  strokeWidth={2.5}
                  fill="url(#colorCorrelatedEDR)"
                  dot={false}
                  activeDot={{ r: 6, fill: '#800080', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>

      </div>

      {/* Endpoints by Platform & Platform Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <div className={`group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-2 border-gray-700/50 hover:border-cyan-500/30'
            : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border-2 border-gray-200/80 shadow-xl'
        }`}>
          <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <CircleStackIcon className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
              Endpoints by Platform
            </span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${value}`}
                  labelLine={false}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  }}
                  labelStyle={{
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    fontWeight: 600,
                  }}
                  itemStyle={{
                    color: isDarkMode ? '#d1d5db' : '#374151',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            {platformData.map((p) => (
              <span key={p.name} className="flex items-center gap-2 text-base">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }} />
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</span>
                <span className={isDarkMode ? 'text-white/70' : 'text-gray-700'}>({p.value})</span>
              </span>
            ))}
          </div>
        </div>

        {/* Platform Health */}
        <div
          id="platform-health"
          className={`group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-2 border-gray-700/50 hover:border-green-500/30'
              : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border-2 border-gray-200/80 shadow-xl'
          }`}
        >
          <h3 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Platform Health
            </span>
            <span className={`ml-auto text-sm font-semibold px-4 py-2 rounded-full ${
              isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              All Systems Operational
            </span>
          </h3>
          <div className="space-y-3">
            {Object.entries(platforms).map(([platform, connected], index) => (
              <div
                key={platform}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`group/item flex items-center justify-between p-4 rounded-2xl transition-all duration-300 animate-slide-in hover:scale-[1.02] ${
                  isDarkMode
                    ? 'bg-gray-900/50 hover:bg-gray-900/80 border border-transparent hover:border-gray-700/50'
                    : 'bg-gray-50/80 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${platformColors[platform]?.hex}20` || '#88888820' }}
                  >
                    <ServerIcon                       className="w-5 h-5"
                      style={{ color: platformColors[platform]?.hex || '#888' }}
                    />
                  </div>
                  <div>
                    <span className={`capitalize font-semibold block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {platform.replace('_', ' ')}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                      EDR Platform
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  connected
                    ? isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                    : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                  <span className={`text-base font-semibold ${
                    connected
                      ? 'text-green-400'
                      : isDarkMode ? 'text-white/70' : 'text-gray-700'
                  }`}>
                    {connected ? 'Connected' : 'Offline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Severity Distribution Row */}
      <div className="grid grid-cols-1 gap-6">
        {/* Severity Distribution */}
        <div className={`group relative rounded-2xl p-8 overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-2 border-gray-700/50 hover:border-orange-500/30'
            : 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border-2 border-gray-200/80 shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Severity Distribution
              </span>
            </h3>
            {/* Severity legend */}
            <div className="flex items-center gap-4">
              {severityData.map((sev) => (
                <div key={sev.name} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sev.color }} />
                  <span className={`text-base font-semibold ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    {sev.name}: {sev.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                <XAxis type="number" stroke={isDarkMode ? '#ffffff' : '#1f2937'} fontSize={20} fontWeight={700} tickMargin={12} height={50} />
                <YAxis type="category" dataKey="name" stroke={isDarkMode ? '#ffffff' : '#1f2937'} width={140} fontSize={20} fontWeight={700} tickMargin={15} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                  }}
                  labelStyle={{
                    color: isDarkMode ? '#f3f4f6' : '#1f2937',
                    fontWeight: 600,
                  }}
                  itemStyle={{
                    color: isDarkMode ? '#d1d5db' : '#374151',
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Endpoints Tab ====================
function EndpointsTab({ endpoints, onIsolate, onRefresh, loading, isDarkMode, initialFilter, clearInitialFilter }) {
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState(initialFilter || 'all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [osFilter, setOsFilter] = useState('all')

  // Consume the initial filter on mount so it doesn't persist across tab switches
  useEffect(() => {
    if (initialFilter) clearInitialFilter()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('hostname')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedEndpoints, setSelectedEndpoints] = useState(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)

  const allEndpoints = Object.entries(endpoints).flatMap(([platform, eps]) =>
    eps.map(ep => ({ ...ep, platform }))
  )

  // Sort endpoints
  const sortedEndpoints = [...allEndpoints].sort((a, b) => {
    let aVal = a[sortBy] || ''
    let bVal = b[sortBy] || ''
    if (sortBy === 'last_seen') {
      aVal = new Date(aVal || 0).getTime()
      bVal = new Date(bVal || 0).getTime()
    }
    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()
    if (sortOrder === 'asc') return aVal > bVal ? 1 : -1
    return aVal < bVal ? 1 : -1
  })

  const filteredEndpoints = sortedEndpoints.filter(ep => {
    const matchesSearch = !filter ||
      ep.hostname?.toLowerCase().includes(filter.toLowerCase()) ||
      ep.ip_address?.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ep.status === statusFilter
    const matchesPlatform = platformFilter === 'all' || ep.platform === platformFilter
    const matchesOS = osFilter === 'all' || ep.os_type?.toLowerCase() === osFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesPlatform && matchesOS
  })

  const platformsList = [...new Set(Object.keys(endpoints))]
  const statuses = [...new Set(allEndpoints.map(ep => ep.status))]

  // Stats calculation
  const stats = {
    total: allEndpoints.length,
    online: allEndpoints.filter(e => e.status === 'online').length,
    offline: allEndpoints.filter(e => e.status === 'offline').length,
    isolated: allEndpoints.filter(e => e.status === 'isolated').length,
    byPlatform: platformsList.reduce((acc, p) => {
      acc[p] = allEndpoints.filter(e => e.platform === p).length
      return acc
    }, {}),
    byOS: allEndpoints.reduce((acc, e) => {
      const os = e.os_type || 'unknown'
      acc[os] = (acc[os] || 0) + 1
      return acc
    }, {})
  }

  // Toggle endpoint selection
  const toggleSelection = (id) => {
    const newSet = new Set(selectedEndpoints)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedEndpoints(newSet)
    setShowBulkActions(newSet.size > 0)
  }

  // Select all
  const selectAll = () => {
    if (selectedEndpoints.size === filteredEndpoints.length) {
      setSelectedEndpoints(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedEndpoints(new Set(filteredEndpoints.map(e => e.id)))
      setShowBulkActions(true)
    }
  }

  // Highlight search text
  const highlightText = (text, search) => {
    if (!search || !text) return text
    const parts = text.split(new RegExp(`(${search})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ?
        <span key={i} className={`${isDarkMode ? 'bg-yellow-500/30 text-yellow-300' : 'bg-yellow-400/50 text-yellow-900'} px-0.5 rounded`}>{part}</span> :
        part
    )
  }

  // Get time ago string
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // OS icons - custom SVG icons for each OS
  const getOSIcon = (osType) => {
    switch (osType?.toLowerCase()) {
      case 'windows':
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-cyan-400" fill="currentColor">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
            </svg>
          </div>
        )
      case 'linux':
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-400" fill="currentColor">
              <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.468v.02c.002.134.017.268.065.398.036.065.09.135.14.198a.134.134 0 01-.05.036c-.085.045-.178.086-.276.119a.316.316 0 01-.043.017.186.186 0 01-.164-.134 1.242 1.242 0 01-.053-.198 1.805 1.805 0 01-.053-.532v-.02c.005-.264.063-.531.166-.793.108-.199.247-.398.44-.53.19-.135.387-.2.601-.2zm-2.71.134a1.576 1.576 0 011.163.585c.134.132.24.332.313.535.063.199.1.398.1.665v.02c0 .266-.037.465-.1.665-.073.2-.18.398-.313.533a1.457 1.457 0 01-.548.403l-.003.003a1.02 1.02 0 01-.134.053.252.252 0 01-.053.015.376.376 0 01-.196-.064l-.196-.133a.395.395 0 01-.132-.202.501.501 0 01-.02-.2v-.02c0-.066.007-.133.026-.199.017-.066.044-.133.082-.199l.003-.003a.474.474 0 00.082-.134c.024-.065.04-.131.04-.2v-.019c0-.134-.023-.269-.07-.403a.8.8 0 00-.2-.334c-.085-.1-.168-.13-.261-.13h-.013c-.093 0-.175.03-.261.13a.799.799 0 00-.203.334 1.17 1.17 0 00-.07.403v.02c0 .066.013.133.04.198.024.066.059.133.1.2l.003.003c.026.045.051.095.07.132.017.065.027.132.027.199v.02c0 .065-.008.132-.024.198a.375.375 0 01-.109.2c-.049.049-.11.1-.197.132a.37.37 0 01-.196.063.252.252 0 01-.052-.014.917.917 0 01-.134-.05l-.003-.003a1.433 1.433 0 01-.55-.403 1.723 1.723 0 01-.31-.535 1.8 1.8 0 01-.104-.665v-.02c0-.267.035-.466.1-.665.073-.2.18-.403.31-.535a1.6 1.6 0 011.17-.585z"/>
            </svg>
          </div>
        )
      case 'macos':
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-300" fill="currentColor">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <CpuChipIcon className="w-6 h-6 text-purple-400" />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: ComputerDesktopIcon, gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20', filterType: 'none' },
          { label: 'Online', value: stats.online, icon: WifiIcon, gradient: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20', filterType: 'status', filterValue: 'online' },
          { label: 'Offline', value: stats.offline, icon: SignalSlashIcon, gradient: 'from-gray-500 to-gray-600', glow: 'shadow-gray-500/20', filterType: 'status', filterValue: 'offline' },
          { label: 'Isolated', value: stats.isolated, icon: LockClosedIcon, gradient: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/20', filterType: 'status', filterValue: 'isolated' },
          { label: 'Windows', value: stats.byOS.windows || 0, icon: ComputerDesktopIcon, gradient: 'from-blue-400 to-blue-600', glow: 'shadow-blue-500/20', filterType: 'os', filterValue: 'windows' },
          { label: 'Linux', value: stats.byOS.linux || 0, icon: CommandLineIcon, gradient: 'from-yellow-500 to-orange-500', glow: 'shadow-yellow-500/20', filterType: 'os', filterValue: 'linux' },
        ].map((stat, idx) => {
          // Check if this stat card's filter is active
          const isActive = (stat.filterType === 'status' && statusFilter === stat.filterValue) ||
                          (stat.filterType === 'os' && osFilter === stat.filterValue) ||
                          (stat.filterType === 'none' && statusFilter === 'all' && osFilter === 'all')

          return (
          <div
            key={stat.label}
            className={`relative group p-4 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:scale-105 ${
              isDarkMode
                ? `bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 ${isActive ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-gray-700/50 hover:border-pink-500/30'}`
                : `bg-gradient-to-br from-white to-gray-50 border-2 shadow-lg hover:shadow-xl ${isActive ? 'border-pink-500 ring-2 ring-pink-500/30' : 'border-gray-200'}`
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => {
              // Reset all filters first
              setStatusFilter('all')
              setOsFilter('all')

              // Then apply the specific filter
              if (stat.label === 'Online') setStatusFilter('online')
              else if (stat.label === 'Offline') setStatusFilter('offline')
              else if (stat.label === 'Isolated') setStatusFilter('isolated')
              else if (stat.label === 'Windows') setOsFilter('windows')
              else if (stat.label === 'Linux') setOsFilter('linux')
              // 'Total' resets to show all (already done above)
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.glow}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Filters and Controls */}
      <div className={`p-6 rounded-2xl ${
        isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border-2 border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-lg'
      }`}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative group">
              <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                isDarkMode ? 'text-white/50 group-focus-within:text-pink-400' : 'text-gray-400 group-focus-within:text-pink-500'
              }`} />
              <input
                type="text"
                placeholder="Search by hostname or IP..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all text-base ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700 text-white placeholder-white/40 focus:border-pink-500 focus:bg-gray-900/80'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-pink-500'
                } focus:outline-none focus:ring-4 focus:ring-pink-500/20`}
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <XCircleIcon className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none pl-4 pr-10 py-3 rounded-xl border-2 transition-all text-base font-semibold cursor-pointer ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-700 text-white hover:border-gray-600'
                  : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
              } focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500`}
            >
              <option value="all">All Status</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s?.charAt(0).toUpperCase() + s?.slice(1)}</option>
              ))}
            </select>
            <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
              isDarkMode ? 'text-white/50' : 'text-gray-400'
            }`} />
          </div>

          {/* Platform Filter */}
          <div className="relative">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className={`appearance-none pl-4 pr-10 py-3 rounded-xl border-2 transition-all text-base font-semibold cursor-pointer ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-700 text-white hover:border-gray-600'
                  : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
              } focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500`}
            >
              <option value="all">All Platforms</option>
              {platformsList.map(p => (
                <option key={p} value={p}>{p?.charAt(0).toUpperCase() + p?.slice(1)}</option>
              ))}
            </select>
            <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
              isDarkMode ? 'text-white/50' : 'text-gray-400'
            }`} />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className={`appearance-none pl-4 pr-10 py-3 rounded-xl border-2 transition-all text-base font-semibold cursor-pointer ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-700 text-white hover:border-gray-600'
                  : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
              } focus:outline-none focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500`}
            >
              <option value="hostname-asc">Name A-Z</option>
              <option value="hostname-desc">Name Z-A</option>
              <option value="last_seen-desc">Recently Active</option>
              <option value="last_seen-asc">Least Active</option>
              <option value="status-asc">Status</option>
            </select>
            <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
              isDarkMode ? 'text-white/50' : 'text-gray-400'
            }`} />
          </div>

          {/* View Toggle */}
          <div className={`flex rounded-xl overflow-hidden border-2 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2.5 flex items-center gap-2 transition-all ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : isDarkMode ? 'bg-gray-800 text-white/60 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-900'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2.5 flex items-center gap-2 transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : isDarkMode ? 'bg-gray-800 text-white/60 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-900'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4" />
              Table
            </button>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || osFilter !== 'all' || filter) && (
            <button
              onClick={() => {
                setStatusFilter('all')
                setOsFilter('all')
                setFilter('')
              }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                isDarkMode
                  ? 'bg-gray-700 text-white/80 hover:bg-gray-600 hover:text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800'
              }`}
            >
              <XCircleIcon className="w-5 h-5" />
              Clear Filters
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:opacity-50 shadow-lg hover:shadow-pink-500/25 hover:scale-105 active:scale-95"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className={`mt-4 flex items-center gap-4 p-4 rounded-xl animate-slide-in ${
            isDarkMode ? 'bg-pink-500/10 border border-pink-500/30' : 'bg-pink-50 border border-pink-200'
          }`}>
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-semibold">{selectedEndpoints.size} selected</span>
            </div>
            <div className="flex-1" />
            <button
              onClick={() => {
                selectedEndpoints.forEach(id => {
                  const ep = filteredEndpoints.find(e => e.id === id)
                  if (ep && ep.status !== 'isolated') onIsolate(id, ep.platform, false)
                })
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
            >
              <LockClosedIcon className="w-4 h-4" />
              Isolate Selected
            </button>
            <button
              onClick={() => {
                setSelectedEndpoints(new Set())
                setShowBulkActions(false)
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-gray-700 text-white/70 hover:text-white' : 'bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEndpoints.length === 0 ? (
            <div className={`col-span-full p-12 rounded-2xl text-center ${
              isDarkMode ? 'bg-gray-800/60' : 'bg-white/80'
            }`}>
              <ComputerDesktopIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className={`text-lg ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                {loading ? 'Loading endpoints...' : 'No endpoints found'}
              </p>
            </div>
          ) : (
            filteredEndpoints.map((endpoint, idx) => (
              <div
                key={`${endpoint.platform}-${endpoint.id}`}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${
                  selectedEndpoints.has(endpoint.id)
                    ? 'ring-2 ring-pink-500 ring-offset-2 ' + (isDarkMode ? 'ring-offset-gray-900' : 'ring-offset-white')
                    : ''
                } ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50 hover:border-pink-500/50'
                    : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg hover:shadow-xl'
                } hover:scale-[1.02]`}
                style={{ animationDelay: `${idx * 30}ms` }}
                onClick={() => setSelectedEndpoint(endpoint)}
              >
                {/* Selection checkbox */}
                <div
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelection(endpoint.id)
                  }}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedEndpoints.has(endpoint.id)
                      ? 'bg-pink-500 border-pink-500'
                      : isDarkMode ? 'border-gray-600 hover:border-pink-400' : 'border-gray-300 hover:border-pink-400'
                  }`}>
                    {selectedEndpoints.has(endpoint.id) && <CheckCircleIcon className="w-4 h-4 text-white" />}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                    endpoint.status === 'online'
                      ? 'bg-green-500/20 text-green-400'
                      : endpoint.status === 'isolated'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      endpoint.status === 'online' ? 'bg-green-500 animate-pulse' : endpoint.status === 'isolated' ? 'bg-orange-500' : 'bg-gray-500'
                    }`} />
                    {endpoint.status}
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5 pt-12">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-2xl ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      {getOSIcon(endpoint.os_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {highlightText(endpoint.hostname, filter)}
                      </h3>
                      <p className={`font-mono text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        {highlightText(endpoint.ip_address || 'N/A', filter)}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Platform</span>
                      <PlatformBadge platform={endpoint.platform} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Last Seen</span>
                      <span className={`text-sm font-semibold flex items-center gap-1 ${
                        isDarkMode ? 'text-white/80' : 'text-gray-700'
                      }`}>
                        <ClockIcon className="w-3.5 h-3.5" />
                        {getTimeAgo(endpoint.last_seen)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>OS</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {endpoint.os_version || endpoint.os_type || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700/30">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onIsolate(endpoint.id, endpoint.platform, endpoint.status === 'isolated')
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
                        endpoint.status === 'isolated'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                      }`}
                    >
                      {endpoint.status === 'isolated' ? <LockOpenIcon className="w-4 h-4" /> : <LockClosedIcon className="w-4 h-4" />}
                      {endpoint.status === 'isolated' ? 'Unisolate' : 'Isolate'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEndpoint(endpoint)
                      }}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                        isDarkMode
                          ? 'bg-gray-700/50 text-white/70 hover:bg-gray-700 hover:text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
                  endpoint.status === 'online' ? 'bg-green-500/5' : endpoint.status === 'isolated' ? 'bg-orange-500/5' : 'bg-gray-500/5'
                }`} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className={`rounded-2xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border-2 border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-lg'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-gray-900/70' : 'bg-gray-50'}`}>
                <tr>
                  <th className="px-4 py-4 w-12">
                    <div
                      onClick={selectAll}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                        selectedEndpoints.size === filteredEndpoints.length && filteredEndpoints.length > 0
                          ? 'bg-pink-500 border-pink-500'
                          : isDarkMode ? 'border-gray-600 hover:border-pink-400' : 'border-gray-300 hover:border-pink-400'
                      }`}
                    >
                      {selectedEndpoints.size === filteredEndpoints.length && filteredEndpoints.length > 0 && (
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </th>
                  {['Hostname', 'IP Address', 'OS', 'Platform', 'Status', 'Last Seen', 'Actions'].map((header, idx) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-left text-sm font-bold uppercase tracking-wider ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-gray-100'}`}>
                {filteredEndpoints.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={`px-6 py-12 text-center text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <ComputerDesktopIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      {loading ? 'Loading endpoints...' : 'No endpoints found'}
                    </td>
                  </tr>
                ) : (
                  filteredEndpoints.map((endpoint, idx) => (
                    <tr
                      key={`${endpoint.platform}-${endpoint.id}`}
                      className={`transition-colors cursor-pointer group ${
                        selectedEndpoints.has(endpoint.id)
                          ? isDarkMode ? 'bg-pink-500/10' : 'bg-pink-50'
                          : isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div
                          onClick={() => toggleSelection(endpoint.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                            selectedEndpoints.has(endpoint.id)
                              ? 'bg-pink-500 border-pink-500'
                              : isDarkMode ? 'border-gray-600 group-hover:border-pink-400' : 'border-gray-300 group-hover:border-pink-400'
                          }`}
                        >
                          {selectedEndpoints.has(endpoint.id) && <CheckCircleIcon className="w-4 h-4 text-white" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            {getOSIcon(endpoint.os_type)}
                          </div>
                          <span className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {highlightText(endpoint.hostname, filter)}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-mono text-base ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {highlightText(endpoint.ip_address || 'N/A', filter)}
                      </td>
                      <td className={`px-6 py-4 text-base ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {endpoint.os_type || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <PlatformBadge platform={endpoint.platform} />
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                          endpoint.status === 'online'
                            ? 'bg-green-500/20 text-green-400'
                            : endpoint.status === 'isolated'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            endpoint.status === 'online' ? 'bg-green-500 animate-pulse' : endpoint.status === 'isolated' ? 'bg-orange-500' : 'bg-gray-500'
                          }`} />
                          {endpoint.status}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-base ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {getTimeAgo(endpoint.last_seen)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onIsolate(endpoint.id, endpoint.platform, endpoint.status === 'isolated')}
                            className={`p-2.5 rounded-xl transition-all ${
                              endpoint.status === 'isolated'
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                            }`}
                            title={endpoint.status === 'isolated' ? 'Unisolate' : 'Isolate'}
                          >
                            {endpoint.status === 'isolated' ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setSelectedEndpoint(endpoint)}
                            className={`p-2.5 rounded-xl transition-all ${
                              isDarkMode
                                ? 'bg-gray-700/50 hover:bg-gray-700 text-white/70 hover:text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                            }`}
                            title="View Details"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
        <span>
          Showing <span className="font-bold text-pink-400">{filteredEndpoints.length}</span> of{' '}
          <span className="font-bold">{allEndpoints.length}</span> endpoints
        </span>
        {selectedEndpoints.size > 0 && (
          <span className="text-pink-400 font-semibold">
            {selectedEndpoints.size} selected
          </span>
        )}
      </div>

      {/* Endpoint Details Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEndpoint(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`flex flex-col rounded-2xl ${
              isDarkMode
                ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-700'
                : 'bg-white border-2 border-gray-200'
            } shadow-2xl`}>
              {/* Header */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      {getOSIcon(selectedEndpoint.os_type)}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedEndpoint.hostname}
                      </h2>
                      <p className={`font-mono ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                        {selectedEndpoint.ip_address}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEndpoint(null)}
                    className={`p-2 rounded-xl transition-colors ${
                      isDarkMode ? 'hover:bg-gray-700 text-white/70' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-120px)]">
                {/* Status */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                    Status
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      selectedEndpoint.status === 'online' ? 'bg-green-500 animate-pulse' :
                      selectedEndpoint.status === 'isolated' ? 'bg-orange-500' : 'bg-gray-500'
                    }`} />
                    <span className={`text-lg font-bold capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEndpoint.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                    Details
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Platform', value: selectedEndpoint.platform, badge: true },
                      { label: 'Operating System', value: selectedEndpoint.os_version || selectedEndpoint.os_type },
                      { label: 'Agent Version', value: selectedEndpoint.agent_version || 'N/A' },
                      { label: 'Last Seen', value: selectedEndpoint.last_seen ? new Date(selectedEndpoint.last_seen).toLocaleString() : 'N/A' },
                      { label: 'Endpoint ID', value: selectedEndpoint.id, mono: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className={`${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>{item.label}</span>
                        {item.badge ? (
                          <PlatformBadge platform={item.value} />
                        ) : (
                          <span className={`font-semibold ${item.mono ? 'font-mono text-sm' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onIsolate(selectedEndpoint.id, selectedEndpoint.platform, selectedEndpoint.status === 'isolated')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                        selectedEndpoint.status === 'isolated'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                      }`}
                    >
                      {selectedEndpoint.status === 'isolated' ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                      {selectedEndpoint.status === 'isolated' ? 'Unisolate' : 'Isolate'}
                    </button>
                    <button className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                      isDarkMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}>
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      Scan
                    </button>
                    <button className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                      isDarkMode ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}>
                      <CommandLineIcon className="w-5 h-5" />
                      Console
                    </button>
                    <button className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                      isDarkMode ? 'bg-gray-700/50 text-white/70 hover:bg-gray-700 hover:text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-900'
                    }`}>
                      <ChartBarIcon className="w-5 h-5" />
                      Activity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== Detections Tab ====================
function DetectionsTab({ detections, onRefresh, loading, isDarkMode, initialFilter, clearInitialFilter }) {
  const [filter, setFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState(initialFilter || 'all')
  const [platformFilter, setPlatformFilter] = useState('all')

  // Consume the initial filter on mount so it doesn't persist across tab switches
  useEffect(() => {
    if (initialFilter) clearInitialFilter()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const allDetections = Object.entries(detections).flatMap(([platform, dets]) =>
    dets.map(d => ({ ...d, platform }))
  ).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))

  const filteredDetections = allDetections.filter(d => {
    const matchesSearch = !filter ||
      d.title?.toLowerCase().includes(filter.toLowerCase()) ||
      d.description?.toLowerCase().includes(filter.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || d.severity === severityFilter
    const matchesPlatform = platformFilter === 'all' || d.platform === platformFilter
    return matchesSearch && matchesSeverity && matchesPlatform
  })

  const platformsList = [...new Set(Object.keys(detections))]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className={`flex flex-wrap gap-4 p-4 rounded-2xl ${
        isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
      }`}>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`} />
            <input
              type="text"
              placeholder="Search detections..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-pink-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-pink-500'
              } focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
            />
          </div>
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border transition-all ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className={`px-4 py-2.5 rounded-xl border transition-all ${
            isDarkMode
              ? 'bg-gray-900/50 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
        >
          <option value="all">All Platforms</option>
          {platformsList.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button
          onClick={onRefresh}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:opacity-50 shadow-lg hover:shadow-pink-500/25`}
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Detections List */}
      <div className="space-y-4">
        {filteredDetections.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl ${
            isDarkMode ? 'bg-gray-800/60 border border-gray-700/50' : 'bg-white/80 border border-gray-200'
          }`}>
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-green-500 opacity-50" />
            <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
              {loading ? 'Loading detections...' : 'No detections found'}
            </p>
          </div>
        ) : (
          filteredDetections.map((detection, idx) => {
            const sevConfig = severityConfig[detection.severity] || severityConfig.info
            return (
              <div
                key={`${detection.platform}-${detection.id}-${idx}`}
                className={`group rounded-2xl p-5 border-l-4 transition-all hover:scale-[1.01] ${
                  isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
                } ${detection.severity === 'critical' ? 'border-l-red-500' : detection.severity === 'high' ? 'border-l-orange-500' : detection.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <SeverityBadge severity={detection.severity} animated />
                      <PlatformBadge platform={detection.platform} />
                      {detection.mitre_tactics?.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                          {detection.mitre_tactics[0]}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {detection.title || detection.name || 'Unnamed Detection'}
                    </h3>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-cyan-300' : 'text-gray-900'}`}>
                      {detection.description || 'No description available'}
                    </p>
                    <div className={`flex items-center gap-6 text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      <span className="flex items-center gap-1.5">
                        <ComputerDesktopIcon className="w-4 h-4" />
                        {detection.hostname || detection.endpoint_id || 'Unknown host'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        {detection.timestamp ? new Date(detection.timestamp).toLocaleString() : 'Unknown time'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`p-2.5 rounded-xl transition-all ${
                        isDarkMode
                          ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                      title="View Details"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 hover:from-pink-500/30 hover:to-purple-500/30 transition-all"
                      title="Investigate"
                    >
                      <ViewfinderCircleIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Detection Count */}
      <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        Showing {filteredDetections.length} of {allDetections.length} detections
      </div>
    </div>
  )
}

// ==================== Correlation Tab ====================
function CorrelationTab({ correlatedAlerts, correlationStats, isDarkMode }) {
  const [expandedAlert, setExpandedAlert] = useState(null)

  const correlationMetrics = [
    { label: 'Correlated Alerts', value: correlationStats?.total_correlated || 0, icon: LinkIcon, gradient: 'from-purple-400 to-purple-600' },
    { label: 'Critical Priority', value: correlatedAlerts.filter(a => a.priority === 'critical').length, icon: ExclamationTriangleIcon, gradient: 'from-red-400 to-pink-500' },
    { label: 'Attack Chains', value: correlationStats?.attack_chains || 0, icon: BoltIcon, gradient: 'from-orange-400 to-amber-500' },
    { label: 'Platforms Involved', value: correlationStats?.platforms_involved || 0, icon: ServerIcon, gradient: 'from-blue-400 to-cyan-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {correlationMetrics.map((metric) => (
          <StatCard
            key={metric.label}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            gradient={metric.gradient}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Correlated Alerts */}
      <div className={`rounded-2xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDarkMode ? 'border-gray-700/50 bg-gray-900/30' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <LinkIcon className="w-5 h-5 text-purple-500" />
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Correlated Alerts
            </span>
          </h3>
          <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            {correlatedAlerts.length} alerts
          </span>
        </div>
        <div className={`divide-y ${isDarkMode ? 'divide-gray-700/50' : 'divide-gray-200'}`}>
          {correlatedAlerts.length === 0 ? (
            <div className={`p-12 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              <SignalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No correlated alerts detected.</p>
              <p className="text-sm mt-2">Events are being analyzed for correlation patterns.</p>
            </div>
          ) : (
            correlatedAlerts.map((alert, idx) => (
              <div
                key={alert.id || idx}
                className={`p-5 transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                }`}
                onClick={() => setExpandedAlert(expandedAlert === idx ? null : idx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        alert.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {alert.priority?.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        {alert.correlation_type}
                      </span>
                      {alert.platforms?.map((p, i) => (
                        <PlatformBadge key={i} platform={p} />
                      ))}
                    </div>
                    <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-cyan-300' : 'text-gray-900'}`}>
                      {alert.description}
                    </p>
                    {expandedAlert === idx && (
                      <div className={`mt-5 p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                        <h5 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          <ChartBarIcon className="w-4 h-4" />
                          Related Events ({alert.related_events?.length || 0})
                        </h5>
                        <div className="space-y-2">
                          {alert.related_events?.slice(0, 5).map((event, i) => (
                            <div key={i} className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-cyan-300' : 'text-gray-900'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                              {event.title || event.type} - {event.hostname}
                            </div>
                          ))}
                        </div>
                        {alert.mitre_tactics?.length > 0 && (
                          <div className="mt-4">
                            <h5 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                              <ViewfinderCircleIcon className="w-4 h-4" />
                              MITRE ATT&CK Tactics
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {alert.mitre_tactics.map((tactic, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 font-medium">
                                  {tactic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {expandedAlert === idx ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== Threat Hunting Tab ====================
function HuntingTab({ isDarkMode }) {
  const [huntType, setHuntType] = useState('ioc')
  const [iocValue, setIocValue] = useState('')
  const [iocType, setIocType] = useState('hash')
  const [hunting, setHunting] = useState(false)
  const [results, setResults] = useState(null)
  const [sigmaRules, setSigmaRules] = useState([])
  const [huntQueries, setHuntQueries] = useState([])

  useEffect(() => {
    loadHuntingData()
  }, [])

  const loadHuntingData = async () => {
    try {
      const [rulesRes, queriesRes] = await Promise.all([
        edr.getSigmaRules(),
        edr.getHuntQueries()
      ])
      setSigmaRules(rulesRes.rules || [])
      setHuntQueries(queriesRes.queries || [])
    } catch (err) {
      console.error('Failed to load hunting data:', err)
    }
  }

  const runHunt = async () => {
    if (!iocValue.trim()) return
    setHunting(true)
    setResults(null)
    try {
      const res = await edr.huntIOC(iocValue, iocType)
      setResults(res)
    } catch (err) {
      console.error('Hunt failed:', err)
    } finally {
      setHunting(false)
    }
  }

  const huntTypeButtons = [
    { id: 'ioc', label: 'IOC Hunt', icon: FingerPrintIcon },
    { id: 'sigma', label: 'Sigma Rules', icon: DocumentTextIcon },
    { id: 'queries', label: 'Hunt Queries', icon: CommandLineIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Hunt Type Selector */}
      <div className={`flex gap-2 p-2 rounded-2xl ${
        isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
      }`}>
        {huntTypeButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setHuntType(btn.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all flex-1 justify-center ${
              huntType === btn.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <btn.icon className="w-5 h-5" />
            {btn.label}
          </button>
        ))}
      </div>

      {/* IOC Hunt */}
      {huntType === 'ioc' && (
        <div className={`rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
        }`}>
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
              <ViewfinderCircleIcon className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Hunt for Indicators of Compromise
            </span>
          </h3>
          <div className="flex gap-4 mb-6">
            <select
              value={iocType}
              onChange={(e) => setIocType(e.target.value)}
              className={`px-4 py-3 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
            >
              <option value="hash">Hash (MD5/SHA1/SHA256)</option>
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="filename">Filename</option>
              <option value="email">Email</option>
            </select>
            <input
              type="text"
              value={iocValue}
              onChange={(e) => setIocValue(e.target.value)}
              placeholder={`Enter ${iocType}...`}
              className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-pink-500/30`}
            />
            <button
              onClick={runHunt}
              disabled={hunting || !iocValue.trim()}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-all disabled:opacity-50 shadow-lg hover:shadow-pink-500/25"
            >
              {hunting ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <ViewfinderCircleIcon className="w-5 h-5" />
              )}
              Hunt
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className={`mt-6 p-5 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
              <h4 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <ViewfinderCircleIcon className="w-5 h-5 text-pink-500" />
                Hunt Results
              </h4>
              {Object.entries(results).map(([platform, matches]) => (
                <div key={platform} className="mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <PlatformBadge platform={platform} size="md" />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-gray-900'}`}>
                      {matches.length} match(es)
                    </span>
                  </div>
                  {matches.length > 0 ? (
                    <div className="space-y-2">
                      {matches.map((match, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border-l-4 border-pink-500 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}
                        >
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {match.hostname || match.endpoint}
                          </div>
                          <div className={`text-sm mt-1 ${isDarkMode ? 'text-cyan-300' : 'text-gray-900'}`}>
                            {match.details || match.path || 'Match found'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      No matches found
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sigma Rules */}
      {huntType === 'sigma' && (
        <div className={`rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Sigma Detection Rules
              </span>
            </h3>
            <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
              isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              {sigmaRules.length} rules loaded
            </span>
          </div>
          <div className="space-y-4">
            {sigmaRules.length === 0 ? (
              <div className={`p-8 text-center rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                  No Sigma rules configured. Add rules via the API or configuration.
                </p>
              </div>
            ) : (
              sigmaRules.map((rule, idx) => (
                <div
                  key={rule.id || idx}
                  className={`p-5 rounded-xl border transition-all hover:scale-[1.01] ${
                    isDarkMode ? 'border-gray-700/50 bg-gray-900/30 hover:border-cyan-500/30' : 'border-gray-200 bg-gray-50 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rule.title || rule.name}
                      </h4>
                      <p className={`text-sm mt-2 ${isDarkMode ? 'text-cyan-300' : 'text-gray-900'}`}>
                        {rule.description}
                      </p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {rule.tags?.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <SeverityBadge severity={rule.level} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hunt Queries */}
      {huntType === 'queries' && (
        <div className={`rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
        }`}>
          <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <CommandLineIcon className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              Pre-built Hunt Queries
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {huntQueries.length === 0 ? (
              <div className={`col-span-2 p-8 text-center rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                <CommandLineIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                  No hunt queries available.
                </p>
              </div>
            ) : (
              huntQueries.map((query, idx) => (
                <div
                  key={query.id || idx}
                  className={`group p-5 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                    isDarkMode
                      ? 'border-gray-700/50 hover:border-green-500/30 bg-gray-900/30'
                      : 'border-gray-200 hover:border-green-500/50 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                      <MagnifyingGlassIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {query.name}
                      </h4>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-cyan-300' : 'text-gray-900'}`}>
                        {query.description}
                      </p>
                      {query.mitre_techniques?.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {query.mitre_techniques.map((t, i) => (
                            <span key={i} className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <PlayIcon className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== MITRE ATT&CK Tab ====================
function MitreTab({ detections, isDarkMode }) {
  const [view, setView] = useState('matrix') // matrix, killchain, summary
  const [selectedTechnique, setSelectedTechnique] = useState(null)
  const [selectedTactic, setSelectedTactic] = useState(null)
  const [mitreData, setMitreData] = useState({ tactics: [], techniques: [], coverage: null, scores: {} })
  const [loading, setLoading] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [hoveredTechnique, setHoveredTechnique] = useState(null)

  // MITRE ATT&CK Enterprise Tactics (in kill chain order)
  const defaultTactics = [
    { id: 'TA0043', name: 'Reconnaissance', shortName: 'Recon', color: '#60a5fa', phase: 1 },
    { id: 'TA0042', name: 'Resource Development', shortName: 'Resource Dev', color: '#34d399', phase: 2 },
    { id: 'TA0001', name: 'Initial Access', shortName: 'Initial Access', color: '#f472b6', phase: 3 },
    { id: 'TA0002', name: 'Execution', shortName: 'Execution', color: '#fb923c', phase: 4 },
    { id: 'TA0003', name: 'Persistence', shortName: 'Persistence', color: '#a78bfa', phase: 5 },
    { id: 'TA0004', name: 'Privilege Escalation', shortName: 'Priv Esc', color: '#f87171', phase: 6 },
    { id: 'TA0005', name: 'Defense Evasion', shortName: 'Def Evasion', color: '#fbbf24', phase: 7 },
    { id: 'TA0006', name: 'Credential Access', shortName: 'Cred Access', color: '#38bdf8', phase: 8 },
    { id: 'TA0007', name: 'Discovery', shortName: 'Discovery', color: '#4ade80', phase: 9 },
    { id: 'TA0008', name: 'Lateral Movement', shortName: 'Lateral Mvmt', color: '#e879f9', phase: 10 },
    { id: 'TA0009', name: 'Collection', shortName: 'Collection', color: '#fb7185', phase: 11 },
    { id: 'TA0011', name: 'Command and Control', shortName: 'C2', color: '#94a3b8', phase: 12 },
    { id: 'TA0010', name: 'Exfiltration', shortName: 'Exfil', color: '#c084fc', phase: 13 },
    { id: 'TA0040', name: 'Impact', shortName: 'Impact', color: '#ef4444', phase: 14 },
  ]

  // Common techniques per tactic (comprehensive list)
  const defaultTechniques = {
    'TA0043': [ // Reconnaissance
      { id: 'T1595', name: 'Active Scanning', subtechniques: ['T1595.001', 'T1595.002', 'T1595.003'] },
      { id: 'T1592', name: 'Gather Victim Host Info', subtechniques: ['T1592.001', 'T1592.002', 'T1592.003', 'T1592.004'] },
      { id: 'T1589', name: 'Gather Victim Identity Info', subtechniques: ['T1589.001', 'T1589.002', 'T1589.003'] },
      { id: 'T1590', name: 'Gather Victim Network Info', subtechniques: ['T1590.001', 'T1590.002', 'T1590.003', 'T1590.004', 'T1590.005', 'T1590.006'] },
      { id: 'T1591', name: 'Gather Victim Org Info', subtechniques: ['T1591.001', 'T1591.002', 'T1591.003', 'T1591.004'] },
      { id: 'T1598', name: 'Phishing for Information', subtechniques: ['T1598.001', 'T1598.002', 'T1598.003'] },
      { id: 'T1597', name: 'Search Closed Sources', subtechniques: ['T1597.001', 'T1597.002'] },
      { id: 'T1596', name: 'Search Open Tech Databases', subtechniques: ['T1596.001', 'T1596.002', 'T1596.003', 'T1596.004', 'T1596.005'] },
      { id: 'T1593', name: 'Search Open Websites/Domains', subtechniques: ['T1593.001', 'T1593.002', 'T1593.003'] },
      { id: 'T1594', name: 'Search Victim-Owned Websites', subtechniques: [] },
    ],
    'TA0042': [ // Resource Development
      { id: 'T1583', name: 'Acquire Infrastructure', subtechniques: ['T1583.001', 'T1583.002', 'T1583.003', 'T1583.004', 'T1583.005', 'T1583.006', 'T1583.007', 'T1583.008'] },
      { id: 'T1586', name: 'Compromise Accounts', subtechniques: ['T1586.001', 'T1586.002', 'T1586.003'] },
      { id: 'T1584', name: 'Compromise Infrastructure', subtechniques: ['T1584.001', 'T1584.002', 'T1584.003', 'T1584.004', 'T1584.005', 'T1584.006', 'T1584.007'] },
      { id: 'T1587', name: 'Develop Capabilities', subtechniques: ['T1587.001', 'T1587.002', 'T1587.003', 'T1587.004'] },
      { id: 'T1585', name: 'Establish Accounts', subtechniques: ['T1585.001', 'T1585.002', 'T1585.003'] },
      { id: 'T1588', name: 'Obtain Capabilities', subtechniques: ['T1588.001', 'T1588.002', 'T1588.003', 'T1588.004', 'T1588.005', 'T1588.006'] },
      { id: 'T1608', name: 'Stage Capabilities', subtechniques: ['T1608.001', 'T1608.002', 'T1608.003', 'T1608.004', 'T1608.005', 'T1608.006'] },
    ],
    'TA0001': [ // Initial Access
      { id: 'T1189', name: 'Drive-by Compromise', subtechniques: [] },
      { id: 'T1190', name: 'Exploit Public-Facing App', subtechniques: [] },
      { id: 'T1133', name: 'External Remote Services', subtechniques: [] },
      { id: 'T1200', name: 'Hardware Additions', subtechniques: [] },
      { id: 'T1566', name: 'Phishing', subtechniques: ['T1566.001', 'T1566.002', 'T1566.003', 'T1566.004'] },
      { id: 'T1091', name: 'Replication Through Removable Media', subtechniques: [] },
      { id: 'T1195', name: 'Supply Chain Compromise', subtechniques: ['T1195.001', 'T1195.002', 'T1195.003'] },
      { id: 'T1199', name: 'Trusted Relationship', subtechniques: [] },
      { id: 'T1078', name: 'Valid Accounts', subtechniques: ['T1078.001', 'T1078.002', 'T1078.003', 'T1078.004'] },
    ],
    'TA0002': [ // Execution
      { id: 'T1059', name: 'Command and Scripting Interpreter', subtechniques: ['T1059.001', 'T1059.002', 'T1059.003', 'T1059.004', 'T1059.005', 'T1059.006', 'T1059.007', 'T1059.008', 'T1059.009'] },
      { id: 'T1609', name: 'Container Admin Command', subtechniques: [] },
      { id: 'T1610', name: 'Deploy Container', subtechniques: [] },
      { id: 'T1203', name: 'Exploitation for Client Execution', subtechniques: [] },
      { id: 'T1559', name: 'Inter-Process Communication', subtechniques: ['T1559.001', 'T1559.002', 'T1559.003'] },
      { id: 'T1106', name: 'Native API', subtechniques: [] },
      { id: 'T1053', name: 'Scheduled Task/Job', subtechniques: ['T1053.002', 'T1053.003', 'T1053.005', 'T1053.006', 'T1053.007'] },
      { id: 'T1129', name: 'Shared Modules', subtechniques: [] },
      { id: 'T1072', name: 'Software Deployment Tools', subtechniques: [] },
      { id: 'T1569', name: 'System Services', subtechniques: ['T1569.001', 'T1569.002'] },
      { id: 'T1204', name: 'User Execution', subtechniques: ['T1204.001', 'T1204.002', 'T1204.003'] },
      { id: 'T1047', name: 'Windows Management Instrumentation', subtechniques: [] },
    ],
    'TA0003': [ // Persistence
      { id: 'T1098', name: 'Account Manipulation', subtechniques: ['T1098.001', 'T1098.002', 'T1098.003', 'T1098.004', 'T1098.005'] },
      { id: 'T1197', name: 'BITS Jobs', subtechniques: [] },
      { id: 'T1547', name: 'Boot or Logon Autostart Execution', subtechniques: ['T1547.001', 'T1547.002', 'T1547.003', 'T1547.004', 'T1547.005', 'T1547.006', 'T1547.007', 'T1547.008', 'T1547.009', 'T1547.010', 'T1547.012', 'T1547.013', 'T1547.014', 'T1547.015'] },
      { id: 'T1037', name: 'Boot or Logon Init Scripts', subtechniques: ['T1037.001', 'T1037.002', 'T1037.003', 'T1037.004', 'T1037.005'] },
      { id: 'T1176', name: 'Browser Extensions', subtechniques: [] },
      { id: 'T1554', name: 'Compromise Client Software Binary', subtechniques: [] },
      { id: 'T1136', name: 'Create Account', subtechniques: ['T1136.001', 'T1136.002', 'T1136.003'] },
      { id: 'T1543', name: 'Create or Modify System Process', subtechniques: ['T1543.001', 'T1543.002', 'T1543.003', 'T1543.004'] },
      { id: 'T1546', name: 'Event Triggered Execution', subtechniques: ['T1546.001', 'T1546.002', 'T1546.003', 'T1546.004', 'T1546.005', 'T1546.006', 'T1546.007', 'T1546.008', 'T1546.009', 'T1546.010', 'T1546.011', 'T1546.012', 'T1546.013', 'T1546.014', 'T1546.015', 'T1546.016'] },
      { id: 'T1133', name: 'External Remote Services', subtechniques: [] },
      { id: 'T1574', name: 'Hijack Execution Flow', subtechniques: ['T1574.001', 'T1574.002', 'T1574.004', 'T1574.005', 'T1574.006', 'T1574.007', 'T1574.008', 'T1574.009', 'T1574.010', 'T1574.011', 'T1574.012', 'T1574.013'] },
      { id: 'T1525', name: 'Implant Internal Image', subtechniques: [] },
      { id: 'T1556', name: 'Modify Authentication Process', subtechniques: ['T1556.001', 'T1556.002', 'T1556.003', 'T1556.004', 'T1556.005', 'T1556.006', 'T1556.007', 'T1556.008'] },
      { id: 'T1137', name: 'Office Application Startup', subtechniques: ['T1137.001', 'T1137.002', 'T1137.003', 'T1137.004', 'T1137.005', 'T1137.006'] },
      { id: 'T1542', name: 'Pre-OS Boot', subtechniques: ['T1542.001', 'T1542.002', 'T1542.003', 'T1542.004', 'T1542.005'] },
      { id: 'T1053', name: 'Scheduled Task/Job', subtechniques: ['T1053.002', 'T1053.003', 'T1053.005', 'T1053.006', 'T1053.007'] },
      { id: 'T1505', name: 'Server Software Component', subtechniques: ['T1505.001', 'T1505.002', 'T1505.003', 'T1505.004', 'T1505.005'] },
      { id: 'T1205', name: 'Traffic Signaling', subtechniques: ['T1205.001', 'T1205.002'] },
      { id: 'T1078', name: 'Valid Accounts', subtechniques: ['T1078.001', 'T1078.002', 'T1078.003', 'T1078.004'] },
    ],
    'TA0004': [ // Privilege Escalation
      { id: 'T1548', name: 'Abuse Elevation Control Mechanism', subtechniques: ['T1548.001', 'T1548.002', 'T1548.003', 'T1548.004', 'T1548.005'] },
      { id: 'T1134', name: 'Access Token Manipulation', subtechniques: ['T1134.001', 'T1134.002', 'T1134.003', 'T1134.004', 'T1134.005'] },
      { id: 'T1547', name: 'Boot or Logon Autostart Execution', subtechniques: ['T1547.001', 'T1547.002', 'T1547.003', 'T1547.004', 'T1547.005'] },
      { id: 'T1037', name: 'Boot or Logon Init Scripts', subtechniques: ['T1037.001', 'T1037.002', 'T1037.003', 'T1037.004', 'T1037.005'] },
      { id: 'T1543', name: 'Create or Modify System Process', subtechniques: ['T1543.001', 'T1543.002', 'T1543.003', 'T1543.004'] },
      { id: 'T1484', name: 'Domain Policy Modification', subtechniques: ['T1484.001', 'T1484.002'] },
      { id: 'T1611', name: 'Escape to Host', subtechniques: [] },
      { id: 'T1546', name: 'Event Triggered Execution', subtechniques: ['T1546.001', 'T1546.002', 'T1546.003', 'T1546.008', 'T1546.009', 'T1546.010', 'T1546.011', 'T1546.012', 'T1546.013', 'T1546.015'] },
      { id: 'T1068', name: 'Exploitation for Privilege Escalation', subtechniques: [] },
      { id: 'T1574', name: 'Hijack Execution Flow', subtechniques: ['T1574.001', 'T1574.002', 'T1574.004', 'T1574.005', 'T1574.006', 'T1574.007', 'T1574.008', 'T1574.009', 'T1574.010', 'T1574.011', 'T1574.012'] },
      { id: 'T1055', name: 'Process Injection', subtechniques: ['T1055.001', 'T1055.002', 'T1055.003', 'T1055.004', 'T1055.005', 'T1055.008', 'T1055.009', 'T1055.011', 'T1055.012', 'T1055.013', 'T1055.014', 'T1055.015'] },
      { id: 'T1053', name: 'Scheduled Task/Job', subtechniques: ['T1053.002', 'T1053.003', 'T1053.005', 'T1053.006', 'T1053.007'] },
      { id: 'T1078', name: 'Valid Accounts', subtechniques: ['T1078.001', 'T1078.002', 'T1078.003', 'T1078.004'] },
    ],
    'TA0005': [ // Defense Evasion
      { id: 'T1548', name: 'Abuse Elevation Control', subtechniques: ['T1548.001', 'T1548.002', 'T1548.003', 'T1548.004'] },
      { id: 'T1134', name: 'Access Token Manipulation', subtechniques: ['T1134.001', 'T1134.002', 'T1134.003', 'T1134.004', 'T1134.005'] },
      { id: 'T1197', name: 'BITS Jobs', subtechniques: [] },
      { id: 'T1140', name: 'Deobfuscate/Decode Files', subtechniques: [] },
      { id: 'T1006', name: 'Direct Volume Access', subtechniques: [] },
      { id: 'T1484', name: 'Domain Policy Modification', subtechniques: ['T1484.001', 'T1484.002'] },
      { id: 'T1480', name: 'Execution Guardrails', subtechniques: ['T1480.001'] },
      { id: 'T1211', name: 'Exploitation for Defense Evasion', subtechniques: [] },
      { id: 'T1222', name: 'File and Directory Permissions Mod', subtechniques: ['T1222.001', 'T1222.002'] },
      { id: 'T1564', name: 'Hide Artifacts', subtechniques: ['T1564.001', 'T1564.002', 'T1564.003', 'T1564.004', 'T1564.005', 'T1564.006', 'T1564.007', 'T1564.008', 'T1564.009', 'T1564.010'] },
      { id: 'T1574', name: 'Hijack Execution Flow', subtechniques: ['T1574.001', 'T1574.002', 'T1574.004', 'T1574.005', 'T1574.006', 'T1574.007', 'T1574.008', 'T1574.009', 'T1574.010', 'T1574.011', 'T1574.012'] },
      { id: 'T1562', name: 'Impair Defenses', subtechniques: ['T1562.001', 'T1562.002', 'T1562.003', 'T1562.004', 'T1562.006', 'T1562.007', 'T1562.008', 'T1562.009', 'T1562.010'] },
      { id: 'T1070', name: 'Indicator Removal', subtechniques: ['T1070.001', 'T1070.002', 'T1070.003', 'T1070.004', 'T1070.005', 'T1070.006', 'T1070.007', 'T1070.008', 'T1070.009'] },
      { id: 'T1202', name: 'Indirect Command Execution', subtechniques: [] },
      { id: 'T1036', name: 'Masquerading', subtechniques: ['T1036.001', 'T1036.002', 'T1036.003', 'T1036.004', 'T1036.005', 'T1036.006', 'T1036.007', 'T1036.008'] },
      { id: 'T1556', name: 'Modify Authentication Process', subtechniques: ['T1556.001', 'T1556.002', 'T1556.003', 'T1556.004'] },
      { id: 'T1578', name: 'Modify Cloud Compute Infra', subtechniques: ['T1578.001', 'T1578.002', 'T1578.003', 'T1578.004'] },
      { id: 'T1112', name: 'Modify Registry', subtechniques: [] },
      { id: 'T1601', name: 'Modify System Image', subtechniques: ['T1601.001', 'T1601.002'] },
      { id: 'T1599', name: 'Network Boundary Bridging', subtechniques: ['T1599.001'] },
      { id: 'T1027', name: 'Obfuscated Files or Information', subtechniques: ['T1027.001', 'T1027.002', 'T1027.003', 'T1027.004', 'T1027.005', 'T1027.006', 'T1027.007', 'T1027.008', 'T1027.009', 'T1027.010', 'T1027.011'] },
      { id: 'T1542', name: 'Pre-OS Boot', subtechniques: ['T1542.001', 'T1542.002', 'T1542.003', 'T1542.004', 'T1542.005'] },
      { id: 'T1055', name: 'Process Injection', subtechniques: ['T1055.001', 'T1055.002', 'T1055.003', 'T1055.004', 'T1055.005', 'T1055.008', 'T1055.009', 'T1055.011', 'T1055.012', 'T1055.013', 'T1055.014', 'T1055.015'] },
      { id: 'T1620', name: 'Reflective Code Loading', subtechniques: [] },
      { id: 'T1207', name: 'Rogue Domain Controller', subtechniques: [] },
      { id: 'T1014', name: 'Rootkit', subtechniques: [] },
      { id: 'T1218', name: 'System Binary Proxy Execution', subtechniques: ['T1218.001', 'T1218.002', 'T1218.003', 'T1218.004', 'T1218.005', 'T1218.007', 'T1218.008', 'T1218.009', 'T1218.010', 'T1218.011', 'T1218.012', 'T1218.013', 'T1218.014'] },
      { id: 'T1216', name: 'System Script Proxy Execution', subtechniques: ['T1216.001'] },
      { id: 'T1221', name: 'Template Injection', subtechniques: [] },
      { id: 'T1205', name: 'Traffic Signaling', subtechniques: ['T1205.001', 'T1205.002'] },
      { id: 'T1127', name: 'Trusted Developer Utilities', subtechniques: ['T1127.001'] },
      { id: 'T1535', name: 'Unused/Unsupported Cloud Regions', subtechniques: [] },
      { id: 'T1550', name: 'Use Alternate Auth Material', subtechniques: ['T1550.001', 'T1550.002', 'T1550.003', 'T1550.004'] },
      { id: 'T1078', name: 'Valid Accounts', subtechniques: ['T1078.001', 'T1078.002', 'T1078.003', 'T1078.004'] },
      { id: 'T1497', name: 'Virtualization/Sandbox Evasion', subtechniques: ['T1497.001', 'T1497.002', 'T1497.003'] },
      { id: 'T1600', name: 'Weaken Encryption', subtechniques: ['T1600.001', 'T1600.002'] },
      { id: 'T1220', name: 'XSL Script Processing', subtechniques: [] },
    ],
    'TA0006': [ // Credential Access
      { id: 'T1557', name: 'Adversary-in-the-Middle', subtechniques: ['T1557.001', 'T1557.002', 'T1557.003'] },
      { id: 'T1110', name: 'Brute Force', subtechniques: ['T1110.001', 'T1110.002', 'T1110.003', 'T1110.004'] },
      { id: 'T1555', name: 'Credentials from Password Stores', subtechniques: ['T1555.001', 'T1555.002', 'T1555.003', 'T1555.004', 'T1555.005', 'T1555.006'] },
      { id: 'T1212', name: 'Exploitation for Credential Access', subtechniques: [] },
      { id: 'T1187', name: 'Forced Authentication', subtechniques: [] },
      { id: 'T1606', name: 'Forge Web Credentials', subtechniques: ['T1606.001', 'T1606.002'] },
      { id: 'T1056', name: 'Input Capture', subtechniques: ['T1056.001', 'T1056.002', 'T1056.003', 'T1056.004'] },
      { id: 'T1556', name: 'Modify Authentication Process', subtechniques: ['T1556.001', 'T1556.002', 'T1556.003', 'T1556.004', 'T1556.005', 'T1556.006', 'T1556.007', 'T1556.008'] },
      { id: 'T1111', name: 'Multi-Factor Auth Interception', subtechniques: [] },
      { id: 'T1621', name: 'Multi-Factor Auth Request Gen', subtechniques: [] },
      { id: 'T1040', name: 'Network Sniffing', subtechniques: [] },
      { id: 'T1003', name: 'OS Credential Dumping', subtechniques: ['T1003.001', 'T1003.002', 'T1003.003', 'T1003.004', 'T1003.005', 'T1003.006', 'T1003.007', 'T1003.008'] },
      { id: 'T1528', name: 'Steal Application Access Token', subtechniques: [] },
      { id: 'T1649', name: 'Steal or Forge Auth Certificates', subtechniques: [] },
      { id: 'T1558', name: 'Steal or Forge Kerberos Tickets', subtechniques: ['T1558.001', 'T1558.002', 'T1558.003', 'T1558.004'] },
      { id: 'T1539', name: 'Steal Web Session Cookie', subtechniques: [] },
      { id: 'T1552', name: 'Unsecured Credentials', subtechniques: ['T1552.001', 'T1552.002', 'T1552.003', 'T1552.004', 'T1552.005', 'T1552.006', 'T1552.007', 'T1552.008'] },
    ],
    'TA0007': [ // Discovery
      { id: 'T1087', name: 'Account Discovery', subtechniques: ['T1087.001', 'T1087.002', 'T1087.003', 'T1087.004'] },
      { id: 'T1010', name: 'Application Window Discovery', subtechniques: [] },
      { id: 'T1217', name: 'Browser Information Discovery', subtechniques: [] },
      { id: 'T1580', name: 'Cloud Infra Discovery', subtechniques: [] },
      { id: 'T1538', name: 'Cloud Service Dashboard', subtechniques: [] },
      { id: 'T1526', name: 'Cloud Service Discovery', subtechniques: [] },
      { id: 'T1613', name: 'Container and Resource Discovery', subtechniques: [] },
      { id: 'T1482', name: 'Domain Trust Discovery', subtechniques: [] },
      { id: 'T1083', name: 'File and Directory Discovery', subtechniques: [] },
      { id: 'T1615', name: 'Group Policy Discovery', subtechniques: [] },
      { id: 'T1046', name: 'Network Service Discovery', subtechniques: [] },
      { id: 'T1135', name: 'Network Share Discovery', subtechniques: [] },
      { id: 'T1040', name: 'Network Sniffing', subtechniques: [] },
      { id: 'T1201', name: 'Password Policy Discovery', subtechniques: [] },
      { id: 'T1120', name: 'Peripheral Device Discovery', subtechniques: [] },
      { id: 'T1069', name: 'Permission Groups Discovery', subtechniques: ['T1069.001', 'T1069.002', 'T1069.003'] },
      { id: 'T1057', name: 'Process Discovery', subtechniques: [] },
      { id: 'T1012', name: 'Query Registry', subtechniques: [] },
      { id: 'T1018', name: 'Remote System Discovery', subtechniques: [] },
      { id: 'T1518', name: 'Software Discovery', subtechniques: ['T1518.001'] },
      { id: 'T1082', name: 'System Information Discovery', subtechniques: [] },
      { id: 'T1614', name: 'System Location Discovery', subtechniques: ['T1614.001'] },
      { id: 'T1016', name: 'System Network Config Discovery', subtechniques: ['T1016.001'] },
      { id: 'T1049', name: 'System Network Connections Discovery', subtechniques: [] },
      { id: 'T1033', name: 'System Owner/User Discovery', subtechniques: [] },
      { id: 'T1007', name: 'System Service Discovery', subtechniques: [] },
      { id: 'T1124', name: 'System Time Discovery', subtechniques: [] },
      { id: 'T1497', name: 'Virtualization/Sandbox Evasion', subtechniques: ['T1497.001', 'T1497.002', 'T1497.003'] },
    ],
    'TA0008': [ // Lateral Movement
      { id: 'T1210', name: 'Exploitation of Remote Services', subtechniques: [] },
      { id: 'T1534', name: 'Internal Spearphishing', subtechniques: [] },
      { id: 'T1570', name: 'Lateral Tool Transfer', subtechniques: [] },
      { id: 'T1563', name: 'Remote Service Session Hijacking', subtechniques: ['T1563.001', 'T1563.002'] },
      { id: 'T1021', name: 'Remote Services', subtechniques: ['T1021.001', 'T1021.002', 'T1021.003', 'T1021.004', 'T1021.005', 'T1021.006', 'T1021.007', 'T1021.008'] },
      { id: 'T1091', name: 'Replication Through Removable Media', subtechniques: [] },
      { id: 'T1072', name: 'Software Deployment Tools', subtechniques: [] },
      { id: 'T1080', name: 'Taint Shared Content', subtechniques: [] },
      { id: 'T1550', name: 'Use Alternate Auth Material', subtechniques: ['T1550.001', 'T1550.002', 'T1550.003', 'T1550.004'] },
    ],
    'TA0009': [ // Collection
      { id: 'T1557', name: 'Adversary-in-the-Middle', subtechniques: ['T1557.001', 'T1557.002', 'T1557.003'] },
      { id: 'T1560', name: 'Archive Collected Data', subtechniques: ['T1560.001', 'T1560.002', 'T1560.003'] },
      { id: 'T1123', name: 'Audio Capture', subtechniques: [] },
      { id: 'T1119', name: 'Automated Collection', subtechniques: [] },
      { id: 'T1185', name: 'Browser Session Hijacking', subtechniques: [] },
      { id: 'T1115', name: 'Clipboard Data', subtechniques: [] },
      { id: 'T1530', name: 'Data from Cloud Storage', subtechniques: [] },
      { id: 'T1602', name: 'Data from Config Repository', subtechniques: ['T1602.001', 'T1602.002'] },
      { id: 'T1213', name: 'Data from Information Repositories', subtechniques: ['T1213.001', 'T1213.002', 'T1213.003'] },
      { id: 'T1005', name: 'Data from Local System', subtechniques: [] },
      { id: 'T1039', name: 'Data from Network Shared Drive', subtechniques: [] },
      { id: 'T1025', name: 'Data from Removable Media', subtechniques: [] },
      { id: 'T1074', name: 'Data Staged', subtechniques: ['T1074.001', 'T1074.002'] },
      { id: 'T1114', name: 'Email Collection', subtechniques: ['T1114.001', 'T1114.002', 'T1114.003'] },
      { id: 'T1056', name: 'Input Capture', subtechniques: ['T1056.001', 'T1056.002', 'T1056.003', 'T1056.004'] },
      { id: 'T1113', name: 'Screen Capture', subtechniques: [] },
      { id: 'T1125', name: 'Video Capture', subtechniques: [] },
    ],
    'TA0011': [ // Command and Control
      { id: 'T1071', name: 'Application Layer Protocol', subtechniques: ['T1071.001', 'T1071.002', 'T1071.003', 'T1071.004'] },
      { id: 'T1092', name: 'Communication Through Removable Media', subtechniques: [] },
      { id: 'T1132', name: 'Data Encoding', subtechniques: ['T1132.001', 'T1132.002'] },
      { id: 'T1001', name: 'Data Obfuscation', subtechniques: ['T1001.001', 'T1001.002', 'T1001.003'] },
      { id: 'T1568', name: 'Dynamic Resolution', subtechniques: ['T1568.001', 'T1568.002', 'T1568.003'] },
      { id: 'T1573', name: 'Encrypted Channel', subtechniques: ['T1573.001', 'T1573.002'] },
      { id: 'T1008', name: 'Fallback Channels', subtechniques: [] },
      { id: 'T1105', name: 'Ingress Tool Transfer', subtechniques: [] },
      { id: 'T1104', name: 'Multi-Stage Channels', subtechniques: [] },
      { id: 'T1095', name: 'Non-Application Layer Protocol', subtechniques: [] },
      { id: 'T1571', name: 'Non-Standard Port', subtechniques: [] },
      { id: 'T1572', name: 'Protocol Tunneling', subtechniques: [] },
      { id: 'T1090', name: 'Proxy', subtechniques: ['T1090.001', 'T1090.002', 'T1090.003', 'T1090.004'] },
      { id: 'T1219', name: 'Remote Access Software', subtechniques: [] },
      { id: 'T1205', name: 'Traffic Signaling', subtechniques: ['T1205.001', 'T1205.002'] },
      { id: 'T1102', name: 'Web Service', subtechniques: ['T1102.001', 'T1102.002', 'T1102.003'] },
    ],
    'TA0010': [ // Exfiltration
      { id: 'T1020', name: 'Automated Exfiltration', subtechniques: ['T1020.001'] },
      { id: 'T1030', name: 'Data Transfer Size Limits', subtechniques: [] },
      { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', subtechniques: ['T1048.001', 'T1048.002', 'T1048.003'] },
      { id: 'T1041', name: 'Exfiltration Over C2 Channel', subtechniques: [] },
      { id: 'T1011', name: 'Exfiltration Over Other Network Medium', subtechniques: ['T1011.001'] },
      { id: 'T1052', name: 'Exfiltration Over Physical Medium', subtechniques: ['T1052.001'] },
      { id: 'T1567', name: 'Exfiltration Over Web Service', subtechniques: ['T1567.001', 'T1567.002', 'T1567.003', 'T1567.004'] },
      { id: 'T1029', name: 'Scheduled Transfer', subtechniques: [] },
      { id: 'T1537', name: 'Transfer Data to Cloud Account', subtechniques: [] },
    ],
    'TA0040': [ // Impact
      { id: 'T1531', name: 'Account Access Removal', subtechniques: [] },
      { id: 'T1485', name: 'Data Destruction', subtechniques: [] },
      { id: 'T1486', name: 'Data Encrypted for Impact', subtechniques: [] },
      { id: 'T1565', name: 'Data Manipulation', subtechniques: ['T1565.001', 'T1565.002', 'T1565.003'] },
      { id: 'T1491', name: 'Defacement', subtechniques: ['T1491.001', 'T1491.002'] },
      { id: 'T1561', name: 'Disk Wipe', subtechniques: ['T1561.001', 'T1561.002'] },
      { id: 'T1499', name: 'Endpoint Denial of Service', subtechniques: ['T1499.001', 'T1499.002', 'T1499.003', 'T1499.004'] },
      { id: 'T1495', name: 'Firmware Corruption', subtechniques: [] },
      { id: 'T1490', name: 'Inhibit System Recovery', subtechniques: [] },
      { id: 'T1498', name: 'Network Denial of Service', subtechniques: ['T1498.001', 'T1498.002'] },
      { id: 'T1496', name: 'Resource Hijacking', subtechniques: [] },
      { id: 'T1489', name: 'Service Stop', subtechniques: [] },
      { id: 'T1529', name: 'System Shutdown/Reboot', subtechniques: [] },
    ],
  }

  // Load MITRE data from API
  useEffect(() => {
    const fetchMitreData = async () => {
      setLoading(true)
      try {
        const [tacticsRes, techniquesRes, coverageRes, scoresRes] = await Promise.all([
          edr.getMitreTactics().catch(() => ({ tactics: defaultTactics })),
          edr.getMitreTechniques().catch(() => ({ techniques: [] })),
          edr.getMitreCoverage().catch(() => null),
          edr.getMitreScores().catch(() => ({ scores: {} })),
        ])
        setMitreData({
          tactics: tacticsRes.tactics?.length > 0 ? tacticsRes.tactics : defaultTactics,
          techniques: techniquesRes.techniques || [],
          coverage: coverageRes,
          scores: scoresRes.scores || {},
        })
      } catch (err) {
        console.error('Failed to load MITRE data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMitreData()
  }, [])

  // Calculate detection scores from detections prop
  const detectionScores = useMemo(() => {
    const allDetections = Object.values(detections).flat()
    const scores = {}
    allDetections.forEach(d => {
      (d.mitre_techniques || []).forEach(techId => {
        if (!scores[techId]) scores[techId] = { count: 0, severity: 0 }
        scores[techId].count++
        scores[techId].severity = Math.max(scores[techId].severity,
          d.severity === 'critical' ? 4 : d.severity === 'high' ? 3 : d.severity === 'medium' ? 2 : 1
        )
      })
    })
    return scores
  }, [detections])

  // Merge API scores with detection scores
  const mergedScores = useMemo(() => {
    const merged = { ...mitreData.scores }
    Object.entries(detectionScores).forEach(([techId, data]) => {
      if (!merged[techId]) merged[techId] = 0
      merged[techId] = Math.max(merged[techId], data.count * data.severity)
    })
    return merged
  }, [mitreData.scores, detectionScores])

  // Get color intensity based on score
  const getHeatmapColor = (techId, baseColor) => {
    const score = mergedScores[techId] || 0
    if (score === 0) return isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(243, 244, 246, 0.8)'
    const intensity = Math.min(score / 20, 1) // Normalize to 0-1
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.6})`
  }

  // Export Navigator JSON
  const exportNavigatorLayer = async () => {
    try {
      const layer = await edr.getMitreNavigatorLayer()
      const blob = new Blob([JSON.stringify(layer, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rodeo-mitre-layer-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setShowExportModal(false)
    } catch (err) {
      console.error('Failed to export Navigator layer:', err)
      // Generate fallback layer
      const fallbackLayer = {
        name: 'RODEO Detection Coverage',
        version: '4.5',
        domain: 'enterprise-attack',
        description: 'MITRE ATT&CK coverage from RODEO detections',
        techniques: Object.entries(mergedScores).map(([techId, score]) => ({
          techniqueID: techId,
          score: Math.min(score, 100),
          color: '',
          comment: `Score: ${score}`,
          enabled: true,
        })),
        gradient: {
          colors: ['#ffffff', '#66b1ff', '#ff6666'],
          minValue: 0,
          maxValue: 100,
        },
      }
      const blob = new Blob([JSON.stringify(fallbackLayer, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rodeo-mitre-layer-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setShowExportModal(false)
    }
  }

  // Get tactics with proper ordering
  const tactics = mitreData.tactics.length > 0 ? mitreData.tactics : defaultTactics

  // Calculate stats
  const totalTechniques = Object.values(defaultTechniques).flat().length
  const coveredTechniques = Object.keys(mergedScores).filter(k => mergedScores[k] > 0).length
  const coveragePercent = ((coveredTechniques / totalTechniques) * 100).toFixed(1)

  // Render Matrix View
  const renderMatrixView = () => (
    <div className="space-y-4">
      {/* Matrix Legend */}
      <div className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Coverage Intensity:</span>
          <div className="flex items-center gap-1">
            <div className={`w-6 h-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>None</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 rounded bg-gradient-to-r from-blue-500/30 to-blue-500/50" />
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 rounded bg-gradient-to-r from-orange-500/50 to-orange-500/70" />
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 rounded bg-gradient-to-r from-red-500/70 to-red-500/90" />
            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>High</span>
          </div>
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Click technique for details
        </div>
      </div>

      {/* Matrix Grid - Scrollable */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-1 min-w-max">
          {tactics.map((tactic) => (
            <div key={tactic.id} className="flex-shrink-0 w-[140px]">
              {/* Tactic Header */}
              <div
                className={`p-2 mb-1 rounded-lg text-center cursor-pointer transition-all duration-200 ${
                  selectedTactic?.id === tactic.id ? 'ring-2 ring-white scale-105' : ''
                }`}
                style={{ backgroundColor: tactic.color }}
                onClick={() => setSelectedTactic(selectedTactic?.id === tactic.id ? null : tactic)}
              >
                <p className="text-xs font-bold text-white truncate">{tactic.shortName || tactic.name}</p>
                <p className="text-[10px] text-white/70">{tactic.id}</p>
              </div>

              {/* Techniques */}
              <div className="space-y-0.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {(defaultTechniques[tactic.id] || []).map((tech) => {
                  const score = mergedScores[tech.id] || 0
                  const hasDetection = score > 0
                  const isHovered = hoveredTechnique?.id === tech.id
                  const isSelected = selectedTechnique?.id === tech.id

                  return (
                    <div
                      key={tech.id}
                      className={`p-1.5 rounded cursor-pointer transition-all duration-150 border ${
                        isSelected ? 'ring-2 ring-pink-500 border-pink-500' :
                        isHovered ? 'border-white/50' :
                        hasDetection ? 'border-transparent' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: hasDetection
                          ? getHeatmapColor(tech.id, tactic.color)
                          : isDarkMode ? 'rgba(31, 41, 55, 0.3)' : 'rgba(243, 244, 246, 0.8)',
                        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                      }}
                      onClick={() => setSelectedTechnique(isSelected ? null : { ...tech, tactic, score })}
                      onMouseEnter={() => setHoveredTechnique(tech)}
                      onMouseLeave={() => setHoveredTechnique(null)}
                    >
                      <p className={`text-[10px] font-mono ${
                        hasDetection ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {tech.id}
                      </p>
                      <p className={`text-[9px] truncate ${
                        hasDetection ? 'text-white/90' : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {tech.name}
                      </p>
                      {hasDetection && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                          <span className="text-[8px] text-white/70">{score} hits</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Render Kill Chain View
  const renderKillChainView = () => (
    <div className="space-y-4">
      {/* Kill Chain Phases */}
      <div className="relative">
        {/* Connection Line */}
        <div className={`absolute top-1/2 left-0 right-0 h-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} -translate-y-1/2 z-0`} />

        {/* Phase Cards */}
        <div className="relative z-10 grid grid-cols-7 gap-2">
          {[
            { phase: 'Recon', tactics: ['TA0043', 'TA0042'], icon: MagnifyingGlassIcon, color: 'from-blue-500 to-cyan-500' },
            { phase: 'Weaponize', tactics: ['TA0042'], icon: BoltIcon, color: 'from-purple-500 to-pink-500' },
            { phase: 'Deliver', tactics: ['TA0001'], icon: GlobeAltIcon, color: 'from-green-500 to-emerald-500' },
            { phase: 'Exploit', tactics: ['TA0002', 'TA0003'], icon: BugAntIcon, color: 'from-orange-500 to-amber-500' },
            { phase: 'Install', tactics: ['TA0003', 'TA0004'], icon: CircleStackIcon, color: 'from-red-500 to-rose-500' },
            { phase: 'C2', tactics: ['TA0011'], icon: Radio, color: 'from-indigo-500 to-violet-500' },
            { phase: 'Actions', tactics: ['TA0009', 'TA0010', 'TA0040'], icon: ViewfinderCircleIcon, color: 'from-pink-500 to-rose-500' },
          ].map((phase, idx) => {
            const tacticData = phase.tactics.map(tid => tactics.find(t => t.id === tid)).filter(Boolean)
            const techniques = phase.tactics.flatMap(tid => defaultTechniques[tid] || [])
            const detectedCount = techniques.filter(t => mergedScores[t.id] > 0).length

            return (
              <div key={idx} className={`p-4 rounded-xl text-center relative ${
                isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'
              }`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-lg`}>
                  <phase.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {phase.phase}
                </h4>
                <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tacticData.map(t => t?.shortName).join(', ')}
                </p>
                <div className={`text-lg font-bold ${detectedCount > 0 ? 'text-pink-500' : isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  {detectedCount}/{techniques.length}
                </div>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>techniques</p>

                {/* Progress bar */}
                <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${phase.color}`}
                    style={{ width: `${(detectedCount / techniques.length) * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Breakdown by Kill Chain Phase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {['Pre-Attack', 'Attack', 'Post-Attack'].map((stage) => {
          const stageTactics = stage === 'Pre-Attack'
            ? ['TA0043', 'TA0042', 'TA0001']
            : stage === 'Attack'
            ? ['TA0002', 'TA0003', 'TA0004', 'TA0005', 'TA0006', 'TA0007', 'TA0008']
            : ['TA0009', 'TA0011', 'TA0010', 'TA0040']

          const stageTechniqueCount = stageTactics.flatMap(tid => defaultTechniques[tid] || []).length
          const stageDetectedCount = stageTactics.flatMap(tid => defaultTechniques[tid] || []).filter(t => mergedScores[t.id] > 0).length

          return (
            <div key={stage} className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stage}</h4>
                <span className={`text-sm font-mono ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                  {stageDetectedCount}/{stageTechniqueCount}
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                  style={{ width: `${(stageDetectedCount / stageTechniqueCount) * 100}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {stageTactics.map(tid => {
                  const tactic = tactics.find(t => t.id === tid)
                  return tactic ? (
                    <span
                      key={tid}
                      className="px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{ backgroundColor: `${tactic.color}30`, color: tactic.color }}
                    >
                      {tactic.shortName}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // Render Summary View
  const renderSummaryView = () => {
    const allDetections = Object.values(detections).flat()
    const techniqueData = allDetections
      .filter(d => d.mitre_techniques?.length > 0)
      .map(d => ({
        technique: d.mitre_techniques?.[0] || 'unknown',
        severity: d.severity,
        name: d.title,
      }))

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Techniques */}
        <div className={`rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <BugAntIcon className="w-5 h-5 text-purple-500" />
            Recent Techniques Detected
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {techniqueData.length === 0 ? (
              <div className={`p-6 text-center rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
                <ShieldCheckIcon className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No techniques detected yet</p>
              </div>
            ) : (
              techniqueData.slice(0, 10).map((t, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl flex items-center justify-between ${
                    isDarkMode ? 'bg-gray-900/50 hover:bg-gray-900' : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors cursor-pointer`}
                  onClick={() => {
                    const techData = Object.values(defaultTechniques).flat().find(tech => tech.id === t.technique)
                    if (techData) {
                      const tactic = tactics.find(tac => defaultTechniques[tac.id]?.some(tech => tech.id === t.technique))
                      setSelectedTechnique({ ...techData, tactic, score: mergedScores[t.technique] || 1 })
                    }
                  }}
                >
                  <div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400">
                      {t.technique}
                    </span>
                    <p className={`text-sm mt-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.name}</p>
                  </div>
                  <SeverityBadge severity={t.severity} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Tactics */}
        <div className={`rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <ArrowTrendingUpIcon className="w-5 h-5 text-orange-500" />
            Top Targeted Tactics
          </h3>
          <div className="space-y-3">
            {tactics
              .map(tactic => ({
                ...tactic,
                count: (defaultTechniques[tactic.id] || []).filter(t => mergedScores[t.id] > 0).length,
                total: (defaultTechniques[tactic.id] || []).length,
              }))
              .filter(t => t.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 8)
              .map((t, idx) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className={`text-sm flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-20 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full"
                        style={{ backgroundColor: t.color, width: `${(t.count / t.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right" style={{ color: t.color }}>
                      {t.count}/{t.total}
                    </span>
                  </div>
                </div>
              ))}
            {tactics.filter(t => (defaultTechniques[t.id] || []).some(tech => mergedScores[tech.id] > 0)).length === 0 && (
              <p className={`text-sm text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No tactics detected
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ArrowPathIcon className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 relative overflow-hidden ${
        isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
      }`}>
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 blur-3xl animate-float" />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/25">
              <ViewfinderCircleIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  MITRE ATT&CK Coverage
                </span>
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enterprise ATT&CK Framework v14.0 • {totalTechniques} techniques tracked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              {[
                { id: 'matrix', name: 'Matrix', icon: ChartBarIcon },
                { id: 'killchain', name: 'Kill Chain', icon: BoltIcon },
                { id: 'summary', name: 'Summary', icon: DocumentTextIcon },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                    view === v.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  {v.name}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative mt-6 grid grid-cols-4 gap-4">
          {[
            { label: 'Coverage', value: `${coveragePercent}%`, sub: `${coveredTechniques}/${totalTechniques}`, color: 'pink' },
            { label: 'Tactics Covered', value: tactics.filter(t => (defaultTechniques[t.id] || []).some(tech => mergedScores[tech.id] > 0)).length, sub: `of ${tactics.length}`, color: 'cyan' },
            { label: 'Active Detections', value: Object.values(detections).flat().length, sub: 'last 24h', color: 'orange' },
            { label: 'High Severity', value: Object.values(detections).flat().filter(d => d.severity === 'critical' || d.severity === 'high').length, sub: 'techniques', color: 'red' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
              <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 bg-clip-text text-transparent`}>
                {stat.value}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View Content */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg'
      }`}>
        {view === 'matrix' && renderMatrixView()}
        {view === 'killchain' && renderKillChainView()}
        {view === 'summary' && renderSummaryView()}
      </div>

      {/* Technique Details Slide-out */}
      {selectedTechnique && (
        <div className="fixed inset-y-0 right-0 w-96 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTechnique(null)} />
          <div className={`relative ml-auto h-full w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl overflow-y-auto`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span
                    className="inline-block px-2 py-1 rounded text-xs font-medium mb-2"
                    style={{ backgroundColor: `${selectedTechnique.tactic?.color}30`, color: selectedTechnique.tactic?.color }}
                  >
                    {selectedTechnique.tactic?.name}
                  </span>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTechnique.id}
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedTechnique.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Detection Status */}
              <div className={`p-4 rounded-xl mb-6 ${
                selectedTechnique.score > 0
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                  : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Detection Status
                  </span>
                  {selectedTechnique.score > 0 ? (
                    <span className="flex items-center gap-1.5 text-pink-400">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Detected</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <XCircleIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Not Detected</span>
                    </span>
                  )}
                </div>
                {selectedTechnique.score > 0 && (
                  <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedTechnique.score} <span className="text-sm font-normal text-gray-500">hits</span>
                  </p>
                )}
              </div>

              {/* Sub-techniques */}
              {selectedTechnique.subtechniques?.length > 0 && (
                <div className="mb-6">
                  <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sub-techniques ({selectedTechnique.subtechniques.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedTechnique.subtechniques.map((subId) => {
                      const subScore = mergedScores[subId] || 0
                      return (
                        <div
                          key={subId}
                          className={`p-2 rounded-lg flex items-center justify-between ${
                            subScore > 0
                              ? 'bg-pink-500/10 border border-pink-500/20'
                              : isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                          }`}
                        >
                          <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {subId}
                          </span>
                          {subScore > 0 && (
                            <span className="text-xs text-pink-400 font-medium">{subScore} hits</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Related Detections */}
              <div>
                <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Related Detections
                </h4>
                <div className="space-y-2">
                  {Object.values(detections).flat()
                    .filter(d => d.mitre_techniques?.includes(selectedTechnique.id))
                    .slice(0, 5)
                    .map((d, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {d.title}
                          </span>
                          <SeverityBadge severity={d.severity} />
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {d.platform} • {new Date(d.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  {Object.values(detections).flat().filter(d => d.mitre_techniques?.includes(selectedTechnique.id)).length === 0 && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      No related detections
                    </p>
                  )}
                </div>
              </div>

              {/* External Links */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <a
                  href={`https://attack.mitre.org/techniques/${selectedTechnique.id.replace('.', '/')}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  View on MITRE ATT&CK
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
          <div className={`relative w-96 p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Export MITRE Coverage
            </h3>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Export your detection coverage as a MITRE ATT&CK Navigator layer JSON file.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                  isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={exportNavigatorLayer}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#4B5563' : '#D1D5DB'};
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#6B7280' : '#9CA3AF'};
        }
      `}</style>
    </div>
  )
}

// ==================== Identity Tab ====================
function IdentityTab({ isDarkMode }) {
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState(7)
  const [platform, setPlatform] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userActivity, setUserActivity] = useState(null)
  const [activityLoading, setActivityLoading] = useState(false)

  // Load graph data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await edr.getRemoteAccessGraph(timeRange, platform)
        setGraphData(data)
      } catch (err) {
        console.error('Failed to fetch remote access graph:', err)
        setError('Failed to load identity graph data')
        // Generate demo data on error
        setGraphData(generateDemoGraphData())
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeRange, platform])

  // Load user activity when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setUserActivity(null)
      return
    }
    const fetchActivity = async () => {
      setActivityLoading(true)
      try {
        const data = await edr.getUserActivity(selectedUser.id, null, 50)
        setUserActivity(data)
      } catch (err) {
        console.error('Failed to fetch user activity:', err)
        setUserActivity({ sessions: [] })
      } finally {
        setActivityLoading(false)
      }
    }
    fetchActivity()
  }, [selectedUser])

  // Generate demo graph data
  const generateDemoGraphData = () => {
    const users = [
      { id: 'admin@corp.local', type: 'user', label: 'admin@corp.local', is_admin: true },
      { id: 'john.doe@corp.local', type: 'user', label: 'john.doe@corp.local', is_admin: false },
      { id: 'jane.smith@corp.local', type: 'user', label: 'jane.smith@corp.local', is_admin: false },
      { id: 'svc_backup@corp.local', type: 'user', label: 'svc_backup@corp.local', is_admin: true },
      { id: 'dev.user@corp.local', type: 'user', label: 'dev.user@corp.local', is_admin: false },
    ]
    const hosts = [
      { id: 'DC01', type: 'host', label: 'DC01', os: 'Windows Server 2022' },
      { id: 'WORKSTATION-01', type: 'host', label: 'WORKSTATION-01', os: 'Windows 11' },
      { id: 'WORKSTATION-02', type: 'host', label: 'WORKSTATION-02', os: 'Windows 11' },
      { id: 'DEV-SERVER', type: 'host', label: 'DEV-SERVER', os: 'Ubuntu 22.04' },
      { id: 'FILE-SERVER', type: 'host', label: 'FILE-SERVER', os: 'Windows Server 2019' },
    ]
    const edges = [
      { source: 'admin@corp.local', target: 'DC01', access_count: 150, last_access: new Date().toISOString() },
      { source: 'admin@corp.local', target: 'FILE-SERVER', access_count: 45, last_access: new Date().toISOString() },
      { source: 'john.doe@corp.local', target: 'WORKSTATION-01', access_count: 200, last_access: new Date().toISOString() },
      { source: 'john.doe@corp.local', target: 'FILE-SERVER', access_count: 30, last_access: new Date().toISOString() },
      { source: 'jane.smith@corp.local', target: 'WORKSTATION-02', access_count: 180, last_access: new Date().toISOString() },
      { source: 'jane.smith@corp.local', target: 'DEV-SERVER', access_count: 25, last_access: new Date().toISOString() },
      { source: 'svc_backup@corp.local', target: 'DC01', access_count: 500, last_access: new Date().toISOString() },
      { source: 'svc_backup@corp.local', target: 'FILE-SERVER', access_count: 500, last_access: new Date().toISOString() },
      { source: 'dev.user@corp.local', target: 'DEV-SERVER', access_count: 300, last_access: new Date().toISOString() },
    ]
    return { nodes: [...users, ...hosts], edges }
  }

  const handleNodeSelect = (node) => {
    if (node && node.type === 'user') {
      setSelectedUser(node)
    } else {
      setSelectedUser(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Remote Access Graph
          </h2>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            User-to-host access relationships
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          {/* Platform Filter */}
          <select
            value={platform || ''}
            onChange={(e) => setPlatform(e.target.value || null)}
            className={`px-3 py-2 rounded-lg border text-sm ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <option value="">All Platforms</option>
            <option value="crowdstrike">CrowdStrike</option>
            <option value="sentinelone">SentinelOne</option>
            <option value="defender">Microsoft Defender</option>
            <option value="carbon_black">Carbon Black</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Graph Panel */}
        <div className={`xl:col-span-3 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'} overflow-hidden`}>
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <ArrowPathIcon className={`w-8 h-8 animate-spin ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          ) : error && !graphData ? (
            <div className="h-[600px] flex flex-col items-center justify-center gap-4">
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{error}</p>
            </div>
          ) : graphData ? (
            <RemoteAccessGraph
              data={graphData}
              onNodeSelect={handleNodeSelect}
              height={600}
            />
          ) : null}
        </div>

        {/* Details Panel */}
        <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl ${selectedUser.is_admin ? 'bg-red-500/20' : 'bg-pink-500/20'}`}>
                    <UsersIcon className={`w-6 h-6 ${selectedUser.is_admin ? 'text-red-400' : 'text-pink-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedUser.label}
                    </h3>
                    {selectedUser.is_admin && (
                      <span className="text-xs text-red-400 font-medium">Administrator</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div>
                <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Recent Activity
                </h4>
                {activityLoading ? (
                  <div className="flex justify-center py-4">
                    <ArrowPathIcon className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : userActivity?.sessions?.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {userActivity.sessions.slice(0, 10).map((session, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {session.hostname || session.host}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(session.timestamp || session.last_access).toLocaleString()}
                          </span>
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {session.login_type || session.type || 'Interactive'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No recent activity found
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <UsersIcon className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select a User
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Click on a user node in the graph to view their access details and recent activity
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/30 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-6">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Admin User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-cyan-500" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Host</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-400" />
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Access relationship (line thickness = frequency)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Main Dashboard Component ====================
export default function EDRDashboard() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [pendingFilter, setPendingFilter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Data state
  const [platforms, setPlatforms] = useState({})
  const [endpoints, setEndpoints] = useState({})
  const [detections, setDetections] = useState({})
  const [correlatedAlerts, setCorrelatedAlerts] = useState([])
  const [correlationStats, setCorrelationStats] = useState({})

  // WebSocket for real-time updates
  const wsRef = useRef(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [realtimeAlerts, setRealtimeAlerts] = useState([])

  // Demo data for when API is unavailable
  const getDemoData = useCallback(() => {
    const demoEndpoints = {
      crowdstrike: [
        { id: 'cs-001', hostname: 'WORKSTATION-01', ip_address: '192.168.1.101', os_type: 'windows', platform: 'crowdstrike', status: 'online', last_seen: new Date().toISOString(), agent_version: '7.10.16303' },
        { id: 'cs-002', hostname: 'WORKSTATION-02', ip_address: '192.168.1.102', os_type: 'windows', platform: 'crowdstrike', status: 'online', last_seen: new Date().toISOString(), agent_version: '7.10.16303' },
        { id: 'cs-003', hostname: 'SERVER-DC01', ip_address: '192.168.1.10', os_type: 'windows', platform: 'crowdstrike', status: 'online', last_seen: new Date().toISOString(), agent_version: '7.10.16303' },
        { id: 'cs-004', hostname: 'WORKSTATION-03', ip_address: '192.168.1.103', os_type: 'windows', platform: 'crowdstrike', status: 'offline', last_seen: new Date(Date.now() - 86400000).toISOString(), agent_version: '7.10.16201' },
      ],
      sentinelone: [
        { id: 's1-001', hostname: 'DEV-LINUX-01', ip_address: '192.168.1.201', os_type: 'linux', platform: 'sentinelone', status: 'online', last_seen: new Date().toISOString(), agent_version: '23.3.1.7' },
        { id: 's1-002', hostname: 'DEV-MAC-01', ip_address: '192.168.1.202', os_type: 'macos', platform: 'sentinelone', status: 'online', last_seen: new Date().toISOString(), agent_version: '23.3.1.7' },
        { id: 's1-003', hostname: 'PROD-LINUX-01', ip_address: '192.168.1.203', os_type: 'linux', platform: 'sentinelone', status: 'isolated', last_seen: new Date().toISOString(), agent_version: '23.3.1.7' },
      ],
      defender: [
        { id: 'def-001', hostname: 'AZURE-VM-01', ip_address: '10.0.0.101', os_type: 'windows', platform: 'defender', status: 'online', last_seen: new Date().toISOString(), agent_version: '4.18.24010.12' },
        { id: 'def-002', hostname: 'AZURE-VM-02', ip_address: '10.0.0.102', os_type: 'windows', platform: 'defender', status: 'isolated', last_seen: new Date().toISOString(), agent_version: '4.18.24010.12' },
        { id: 'def-003', hostname: 'AZURE-VM-03', ip_address: '10.0.0.103', os_type: 'windows', platform: 'defender', status: 'offline', last_seen: new Date(Date.now() - 172800000).toISOString(), agent_version: '4.18.23090.8' },
      ],
    }

    const demoDetections = {
      crowdstrike: [
        { id: 'd-001', title: 'Suspicious PowerShell Execution', severity: 'high', platform: 'crowdstrike', hostname: 'WORKSTATION-01', timestamp: new Date(Date.now() - 300000).toISOString(), mitre_tactic: 'Execution', mitre_technique: 'T1059.001' },
        { id: 'd-002', title: 'Credential Dumping Attempt', severity: 'critical', platform: 'crowdstrike', hostname: 'SERVER-DC01', timestamp: new Date(Date.now() - 600000).toISOString(), mitre_tactic: 'Credential Access', mitre_technique: 'T1003' },
      ],
      sentinelone: [
        { id: 'd-003', title: 'Reverse Shell Connection', severity: 'critical', platform: 'sentinelone', hostname: 'DEV-LINUX-01', timestamp: new Date(Date.now() - 900000).toISOString(), mitre_tactic: 'Command and Control', mitre_technique: 'T1059.004' },
        { id: 'd-004', title: 'Suspicious Network Scan', severity: 'medium', platform: 'sentinelone', hostname: 'DEV-MAC-01', timestamp: new Date(Date.now() - 1200000).toISOString(), mitre_tactic: 'Discovery', mitre_technique: 'T1046' },
      ],
      defender: [
        { id: 'd-005', title: 'Ransomware Behavior Detected', severity: 'critical', platform: 'defender', hostname: 'AZURE-VM-02', timestamp: new Date(Date.now() - 1500000).toISOString(), mitre_tactic: 'Impact', mitre_technique: 'T1486' },
      ],
    }

    return {
      platforms: { crowdstrike: true, sentinelone: true, defender: true, carbon_black: false, elastic: false },
      endpoints: demoEndpoints,
      detections: demoDetections,
      correlationStats: { total_correlated: 3, attack_chains: 1, unique_techniques: 8 },
    }
  }, [])

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [statusRes, endpointsRes, detectionsRes, correlationRes] = await Promise.all([
        edr.getStatus(),
        edr.getEndpoints(),
        edr.getDetections(),
        edr.getCorrelationStats(),
      ])

      setPlatforms(statusRes.platforms || {})

      // Transform endpoints array into object grouped by platform
      const endpointsArray = endpointsRes.endpoints || []
      const endpointsByPlatform = endpointsArray.reduce((acc, ep) => {
        const platform = ep.platform || 'unknown'
        if (!acc[platform]) acc[platform] = []
        acc[platform].push(ep)
        return acc
      }, {})
      setEndpoints(endpointsByPlatform)

      // Transform detections array into object grouped by platform
      const detectionsArray = detectionsRes.detections || []
      const detectionsByPlatform = detectionsArray.reduce((acc, det) => {
        const platform = det.platform || 'unknown'
        if (!acc[platform]) acc[platform] = []
        acc[platform].push(det)
        return acc
      }, {})
      setDetections(detectionsByPlatform)

      setCorrelatedAlerts(correlationRes.alerts || [])
      setCorrelationStats(correlationRes.stats || {})
    } catch (err) {
      console.warn('API unavailable, using demo data:', err?.message || err)
      // Use demo data when API fails
      const demo = getDemoData()
      setPlatforms(demo.platforms)
      setEndpoints(demo.endpoints)
      setDetections(demo.detections)
      setCorrelationStats(demo.correlationStats)
    } finally {
      setLoading(false)
    }
  }, [getDemoData])

  // Track if initial load has happened
  const initialLoadRef = useRef(false)
  const wsReconnectTimeoutRef = useRef(null)

  // Connect WebSocket for real-time alerts
  const connectWebSocket = useCallback(() => {
    // Don't reconnect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    // Use current host for WebSocket connection (works with both Vite proxy and production)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/edr/ws/alerts`

    try {
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('EDR WebSocket connected')
        setWsConnected(true)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Skip status messages (connected, ping, pong, heartbeat)
          const statusTypes = ['connected', 'ping', 'pong', 'heartbeat', 'status']
          if (statusTypes.includes(data.type?.toLowerCase())) {
            return
          }

          // Handle different message types
          switch (data.type) {
            case 'detection':
              // New detection - add to list
              setRealtimeAlerts(prev => [data, ...prev].slice(0, 50))
              setDetections(prev => {
                const platform = data.platform || 'unknown'
                return {
                  ...prev,
                  [platform]: [data, ...(prev[platform] || [])].slice(0, 100)
                }
              })
              break

            case 'endpoint_status':
              // Endpoint status changed - update specific endpoint
              setEndpoints(prev => {
                const platform = data.platform || 'unknown'
                const existing = prev[platform] || []
                const updated = existing.map(ep =>
                  ep.id === data.endpoint_id ? { ...ep, status: data.status, last_seen: data.timestamp } : ep
                )
                return { ...prev, [platform]: updated }
              })
              break

            case 'correlation':
              // New correlated alert
              setCorrelatedAlerts(prev => [data, ...prev].slice(0, 50))
              setCorrelationStats(prev => ({
                ...prev,
                total_correlated: (prev.total_correlated || 0) + 1
              }))
              break

            default:
              // Unknown type - just add to realtime alerts
              setRealtimeAlerts(prev => [data, ...prev].slice(0, 50))
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      wsRef.current.onclose = () => {
        console.log('EDR WebSocket disconnected')
        setWsConnected(false)
        // Reconnect after delay, but clear any existing timeout first
        if (wsReconnectTimeoutRef.current) {
          clearTimeout(wsReconnectTimeoutRef.current)
        }
        wsReconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
      }

      wsRef.current.onerror = (err) => {
        console.error('EDR WebSocket error:', err)
      }
    } catch (err) {
      console.error('Failed to connect WebSocket:', err)
    }
  }, [])

  // Initial load - only runs once on mount
  useEffect(() => {
    if (initialLoadRef.current) return
    initialLoadRef.current = true

    loadData()
    connectWebSocket()

    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (wsReconnectTimeoutRef.current) {
        clearTimeout(wsReconnectTimeoutRef.current)
      }
    }
  }, []) // Empty dependency array - only run on mount

  // Keyboard shortcuts for tabs
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.key) {
        case '1':
          setActiveTab('overview')
          break
        case '2':
          setActiveTab('endpoints')
          break
        case '3':
          setActiveTab('detections')
          break
        case '4':
          setActiveTab('correlation')
          break
        case '5':
          setActiveTab('hunting')
          break
        case '6':
          setActiveTab('mitre')
          break
        case '7':
          setActiveTab('identity')
          break
        case 'r':
        case 'R':
          loadData()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loadData])

  // Isolate/Unisolate endpoint
  const handleIsolate = async (endpointId, platform, isIsolated) => {
    try {
      if (isIsolated) {
        await edr.unisolateEndpoint(endpointId, platform)
      } else {
        await edr.isolateEndpoint(endpointId, platform)
      }
      const res = await edr.getEndpoints()
      // Transform endpoints array into object grouped by platform
      const endpointsArray = res.endpoints || []
      const endpointsByPlatform = endpointsArray.reduce((acc, ep) => {
        const platform = ep.platform || 'unknown'
        if (!acc[platform]) acc[platform] = []
        acc[platform].push(ep)
        return acc
      }, {})
      setEndpoints(endpointsByPlatform)
    } catch (err) {
      console.error('Failed to isolate/unisolate endpoint:', err)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Animated Background Orbs */}
      {isDarkMode && (
        <>
          <GradientOrb className="w-96 h-96 -top-48 -left-48 animate-float" color="pink" />
          <GradientOrb className="w-80 h-80 top-1/3 -right-40 animate-float" color="cyan" style={{ animationDelay: '-2s' }} />
          <GradientOrb className="w-64 h-64 bottom-20 left-1/4 animate-float" color="orange" style={{ animationDelay: '-4s' }} />
        </>
      )}

      <div className="relative w-full px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl shadow-pink-500/30">
                <ShieldCheckIcon className="w-14 h-14 text-white" />
              </div>
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-3xl animate-glow-ring" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
                <span className={`bg-gradient-to-r ${isDarkMode ? 'from-pink-400 via-purple-400 to-cyan-400' : 'from-pink-600 via-purple-600 to-blue-600'} bg-clip-text text-transparent drop-shadow-lg`}>
                  EDR / XDR Dashboard
                </span>
              </h1>
              <p className={`text-lg mt-2 font-medium ${isDarkMode ? 'text-white/90' : 'text-gray-700'}`}>
                Unified endpoint detection and response across all platforms
              </p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-pink-400/80' : 'text-pink-600'}`}>
                Press 1-6 to switch tabs • R to refresh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* WebSocket Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              wsConnected
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}>
              {wsConnected ? (
                <>
                  <SignalIcon className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Live</span>
                </>
              ) : (
                <>
                  <SignalSlashIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Connecting...</span>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDarkMode
                  ? 'bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-700/50'
                  : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-lg'
              } disabled:opacity-50`}
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Real-time Alert Banner */}
        {realtimeAlerts.length > 0 && (
          <div
            onClick={() => setActiveTab('detections')}
            className={`mb-6 p-4 rounded-2xl border-l-4 border-red-500 transition-all animate-threat-pulse cursor-pointer hover:scale-[1.01] ${
              isDarkMode ? 'bg-red-900/20 border border-red-500/30 hover:bg-red-900/30' : 'bg-red-50 border border-red-200 hover:bg-red-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20">
                <BellIcon className="w-5 h-5 text-red-400" />
              </div>
              <span className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                New Alert: {realtimeAlerts[0].title || realtimeAlerts[0].type}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-red-400/70' : 'text-red-500'}`}>
                {new Date(realtimeAlerts[0].timestamp).toLocaleTimeString()}
              </span>
              <span className={`ml-auto text-xs ${isDarkMode ? 'text-red-400/50' : 'text-red-400'}`}>
                Click to view →
              </span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className={`mb-6 p-4 rounded-2xl border-l-4 border-red-500 ${
            isDarkMode ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
              <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className={`flex flex-wrap gap-2 p-2 rounded-2xl mb-8 ${
          isDarkMode ? 'bg-gray-800/60 backdrop-blur-xl border-2 border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border-2 border-gray-200 shadow-xl'
        }`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 scale-[1.02]'
                  : isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50 hover:scale-[1.02]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:scale-[1.02]'
              }`}
            >
              <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-400 group-hover:bg-pink-500/20 group-hover:text-pink-400'
                    : 'bg-gray-200 text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600'
              }`}>
                {tab.key}
              </span>
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative">
          {/* Scan line effect for dark mode */}
          {isDarkMode && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent animate-scan" />
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewTab
              endpoints={endpoints}
              detections={detections}
              platforms={platforms}
              correlationStats={correlationStats}
              isDarkMode={isDarkMode}
              setActiveTab={setActiveTab}
              setPendingFilter={setPendingFilter}
            />
          )}
          {activeTab === 'endpoints' && (
            <EndpointsTab
              endpoints={endpoints}
              onIsolate={handleIsolate}
              onRefresh={loadData}
              loading={loading}
              isDarkMode={isDarkMode}
              initialFilter={pendingFilter}
              clearInitialFilter={() => setPendingFilter(null)}
            />
          )}
          {activeTab === 'detections' && (
            <DetectionsTab
              detections={detections}
              onRefresh={loadData}
              loading={loading}
              isDarkMode={isDarkMode}
              initialFilter={pendingFilter}
              clearInitialFilter={() => setPendingFilter(null)}
            />
          )}
          {activeTab === 'correlation' && (
            <CorrelationTab
              correlatedAlerts={correlatedAlerts}
              correlationStats={correlationStats}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 'hunting' && (
            <HuntingTab isDarkMode={isDarkMode} />
          )}
          {activeTab === 'mitre' && (
            <MitreTab detections={detections} isDarkMode={isDarkMode} />
          )}
          {activeTab === 'identity' && (
            <IdentityTab isDarkMode={isDarkMode} />
          )}
        </div>
      </div>
    </div>
  )
}
