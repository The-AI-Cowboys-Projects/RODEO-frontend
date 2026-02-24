import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { networkAnalytics } from '../api/client'
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Badge from '../components/ui/Badge'
import {
  GlobeAltIcon,
  ShieldExclamationIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

const REFRESH_INTERVAL = 15000
const SEVERITY_COLORS = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#22c55e' }
const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low']

export default function ThreatMap() {
  const { isDarkMode } = useTheme()
  const { isDemoMode, seededInt, seededRandom } = useDemoMode()
  const isLiveMode = !isDemoMode

  // Data state
  const [regions, setRegions] = useState([])
  const [attackFlows, setAttackFlows] = useState([])
  const [threatTypes, setThreatTypes] = useState([])
  const [summary, setSummary] = useState({ total_threats: 0, total_blocked: 0, active_incidents: 0 })
  const [lastUpdated, setLastUpdated] = useState(null)

  // UI state
  const [activeFlows, setActiveFlows] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [activeTypeFilters, setActiveTypeFilters] = useState(new Set())
  const [activeSeverityFilters, setActiveSeverityFilters] = useState(new Set(SEVERITY_ORDER))
  const [isPaused, setIsPaused] = useState(false)
  const [dataSource, setDataSource] = useState(isDemoMode ? 'demo' : 'live')
  const [nextRefresh, setNextRefresh] = useState(REFRESH_INTERVAL / 1000)
  const [highlightedRegion, setHighlightedRegion] = useState(null)
  const isLive = isLiveMode && !isPaused
  const liveFetchFailed = useRef(false)

  // Track dataSource changes when demo mode toggles
  useEffect(() => {
    if (isDemoMode) {
      setDataSource('demo')
      liveFetchFailed.current = false
    }
  }, [isDemoMode])

  // ---- DEMO MODE: seed stable data ----
  useEffect(() => {
    if (!isDemoMode) return

    const demoRegions = [
      { name: 'North America', lat: 40, lng: -100, code: 'NA', threats: seededInt('tm_na', 250, 500), attacks_blocked: seededInt('tm_nab', 200, 400), active_incidents: seededInt('tm_nai', 2, 8) },
      { name: 'South America', lat: -15, lng: -60, code: 'SA', threats: seededInt('tm_sa', 80, 200), attacks_blocked: seededInt('tm_sab', 60, 160), active_incidents: seededInt('tm_sai', 1, 4) },
      { name: 'Europe', lat: 50, lng: 10, code: 'EU', threats: seededInt('tm_eu', 350, 600), attacks_blocked: seededInt('tm_eub', 280, 500), active_incidents: seededInt('tm_eui', 3, 9) },
      { name: 'Africa', lat: 0, lng: 20, code: 'AF', threats: seededInt('tm_af', 50, 150), attacks_blocked: seededInt('tm_afb', 35, 120), active_incidents: seededInt('tm_afi', 1, 3) },
      { name: 'Middle East', lat: 30, lng: 50, code: 'ME', threats: seededInt('tm_me', 180, 380), attacks_blocked: seededInt('tm_meb', 140, 300), active_incidents: seededInt('tm_mei', 2, 6) },
      { name: 'Asia', lat: 35, lng: 105, code: 'AS', threats: seededInt('tm_as', 400, 800), attacks_blocked: seededInt('tm_asb', 320, 650), active_incidents: seededInt('tm_asi', 4, 12) },
      { name: 'Oceania', lat: -25, lng: 135, code: 'OC', threats: seededInt('tm_oc', 30, 100), attacks_blocked: seededInt('tm_ocb', 22, 80), active_incidents: seededInt('tm_oci', 0, 2) },
    ]

    const demoFlows = [
      { from: [-100, 40], to: [10, 50], color: '#ef4444', type: 'Ransomware', severity: 'critical', count: seededInt('tf_0', 10, 80) },
      { from: [105, 35], to: [-100, 40], color: '#f59e0b', type: 'DDoS', severity: 'high', count: seededInt('tf_1', 50, 250) },
      { from: [105, 35], to: [10, 50], color: '#ef4444', type: 'APT', severity: 'critical', count: seededInt('tf_2', 5, 25) },
      { from: [50, 30], to: [10, 50], color: '#f59e0b', type: 'Phishing', severity: 'high', count: seededInt('tf_3', 80, 400) },
      { from: [105, 35], to: [135, -25], color: '#3b82f6', type: 'Malware', severity: 'medium', count: seededInt('tf_4', 20, 60) },
      { from: [-60, -15], to: [-100, 40], color: '#3b82f6', type: 'BruteForce', severity: 'medium', count: seededInt('tf_5', 150, 700) },
      { from: [20, 0], to: [10, 50], color: '#f59e0b', type: 'Botnet', severity: 'high', count: seededInt('tf_6', 40, 150) },
      { from: [10, 50], to: [-100, 40], color: '#ef4444', type: 'Zero-Day', severity: 'critical', count: seededInt('tf_7', 1, 8) },
      { from: [105, 35], to: [50, 30], color: '#ef4444', type: 'Espionage', severity: 'critical', count: seededInt('tf_8', 3, 20) },
    ]

    const demoThreatTypes = [
      { type: 'Malware', count: seededInt('tt_m', 300, 900), severity: 'critical' },
      { type: 'Phishing', count: seededInt('tt_p', 200, 700), severity: 'high' },
      { type: 'DDoS', count: seededInt('tt_d', 120, 450), severity: 'high' },
      { type: 'Ransomware', count: seededInt('tt_r', 60, 250), severity: 'critical' },
      { type: 'Brute Force', count: seededInt('tt_b', 150, 550), severity: 'medium' },
      { type: 'SQL Injection', count: seededInt('tt_s', 90, 350), severity: 'high' },
      { type: 'XSS', count: seededInt('tt_x', 80, 300), severity: 'medium' },
      { type: 'Zero-Day', count: seededInt('tt_z', 3, 40), severity: 'critical' },
    ]

    setRegions(demoRegions)
    setAttackFlows(demoFlows)
    setActiveFlows(demoFlows.map((_, i) => i))
    setThreatTypes(demoThreatTypes)
    setSummary({
      total_threats: demoRegions.reduce((s, r) => s + r.threats, 0),
      total_blocked: demoRegions.reduce((s, r) => s + r.attacks_blocked, 0),
      active_incidents: demoRegions.reduce((s, r) => s + r.active_incidents, 0),
    })
    setActiveTypeFilters(new Set())
    setLastUpdated(new Date())
  }, [isDemoMode, seededInt, seededRandom])

  // ---- LIVE MODE: fetch from API ----
  const fetchGeoThreats = useCallback(async () => {
    if (isDemoMode) return
    try {
      const data = await networkAnalytics.geoThreats(true)

      const apiRegions = data.regions.map(r => ({
        name: r.name, lat: r.lat, lng: r.lng, code: r.code,
        threats: r.threats, attacks_blocked: r.attacks_blocked, active_incidents: r.active_incidents,
      }))

      const apiFlows = data.attack_flows.map(f => ({
        from: [f.from.lng, f.from.lat],
        to: [f.to.lng, f.to.lat],
        color: f.color, type: f.type, severity: f.severity, count: f.count,
      }))

      const apiThreatTypes = data.threat_types.map(t => ({
        type: t.type, count: t.count, severity: t.severity,
      }))

      setRegions(apiRegions)
      setAttackFlows(apiFlows)
      setActiveFlows(apiFlows.map((_, i) => i))
      setThreatTypes(apiThreatTypes)
      setSummary({
        total_threats: data.total_threats,
        total_blocked: data.total_blocked,
        active_incidents: data.active_incidents,
      })
      setLastUpdated(new Date(data.timestamp))
      setDataSource('live')
      liveFetchFailed.current = false
    } catch (err) {
      console.error('[ThreatMap] API fetch failed:', err)
      if (!liveFetchFailed.current) {
        liveFetchFailed.current = true
        setDataSource('simulated')
      }
      // Data stays unchanged — no random fallback
    }
  }, [isDemoMode])

  useEffect(() => {
    if (!isLive) return
    fetchGeoThreats()
    const interval = setInterval(fetchGeoThreats, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [isLive, fetchGeoThreats])

  // ---- Refresh countdown ----
  useEffect(() => {
    if (!isLive) { setNextRefresh(0); return }
    setNextRefresh(REFRESH_INTERVAL / 1000)
    const tick = setInterval(() => {
      setNextRefresh(prev => prev <= 1 ? REFRESH_INTERVAL / 1000 : prev - 1)
    }, 1000)
    return () => clearInterval(tick)
  }, [isLive])

  // ---- Flow animation ----
  useEffect(() => {
    if (attackFlows.length === 0) return
    let idx = 0
    const interval = setInterval(() => {
      const count = 3 + Math.floor(Math.random() * 3)
      const active = []
      for (let i = 0; i < count; i++) active.push((idx + i) % attackFlows.length)
      setActiveFlows(active)
      idx = (idx + 1) % attackFlows.length
    }, 800)
    return () => clearInterval(interval)
  }, [attackFlows.length])

  // ---- Derived: filtered flows ----
  const filteredFlows = useMemo(() => {
    return attackFlows.filter(flow => {
      if (activeTypeFilters.size > 0 && !activeTypeFilters.has(flow.type)) return false
      if (!activeSeverityFilters.has(flow.severity)) return false
      return true
    })
  }, [attackFlows, activeTypeFilters, activeSeverityFilters])

  // All unique attack types from current data
  const allAttackTypes = useMemo(() => {
    return [...new Set(attackFlows.map(f => f.type))]
  }, [attackFlows])

  // Sorted regions for sidebar
  const sortedRegions = useMemo(() => {
    return [...regions].sort((a, b) => b.threats - a.threats)
  }, [regions])

  const maxRegionThreats = useMemo(() => {
    return Math.max(1, ...regions.map(r => r.threats))
  }, [regions])

  // ---- Handlers ----
  const toggleTypeFilter = (type) => {
    setActiveTypeFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const toggleSeverityFilter = (sev) => {
    setActiveSeverityFilters(prev => {
      const next = new Set(prev)
      if (next.has(sev)) next.delete(sev)
      else next.add(sev)
      return next
    })
  }

  const exportCSV = () => {
    const header = 'Region,Threats,Blocked,Active Incidents\n'
    const rows = regions.map(r => `${r.name},${r.threats},${r.attacks_blocked},${r.active_incidents}`).join('\n')
    const flowHeader = '\n\nAttack Type,From,To,Severity,Count\n'
    const flowRows = attackFlows.map(f => {
      const fromRegion = regions.find(r => Math.abs(r.lng - f.from[0]) < 20 && Math.abs(r.lat - f.from[1]) < 20)?.name || `${f.from[0]},${f.from[1]}`
      const toRegion = regions.find(r => Math.abs(r.lng - f.to[0]) < 20 && Math.abs(r.lat - f.to[1]) < 20)?.name || `${f.to[0]},${f.to[1]}`
      return `${f.type},${fromRegion},${toRegion},${f.severity},${f.count}`
    }).join('\n')
    const blob = new Blob([header + rows + flowHeader + flowRows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `threat-map-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---- Theme-aware colors ----
  const mapColors = isDarkMode
    ? { fill: '#1e293b', stroke: '#334155', hover: '#475569', bg: 'bg-slate-900/30', ocean: '#0f172a' }
    : { fill: '#e2e8f0', stroke: '#cbd5e1', hover: '#c4b5fd', bg: 'bg-slate-50', ocean: '#f1f5f9' }

  const cardCls = isDarkMode
    ? 'bg-slate-800/80 border-slate-700/50 backdrop-blur-sm'
    : 'bg-white border-gray-200 shadow-sm'

  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900'
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-500'
  const textMuted = isDarkMode ? 'text-gray-500' : 'text-gray-400'

  const dataSourceBadge = {
    live: { variant: 'success', label: 'Live Data', dot: true },
    demo: { variant: 'purple', label: 'Demo Mode', dot: false },
    simulated: { variant: 'warning', label: 'API Unavailable', dot: true },
  }[dataSource]

  return (
    <div className="space-y-4">
      {/* ---- HEADER ---- */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <GlobeAltIcon className={`w-7 h-7 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>Threat Map</h1>
          <Badge variant={dataSourceBadge.variant} size="sm" dot={dataSourceBadge.dot} rounded>
            {dataSourceBadge.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {isLiveMode && (
            <button
              onClick={() => setIsPaused(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode
                  ? 'bg-slate-700/80 hover:bg-slate-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isPaused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          {isLive && nextRefresh > 0 && (
            <span className={`text-xs ${textMuted} flex items-center gap-1`}>
              <ArrowPathIcon className="w-3.5 h-3.5" />
              {nextRefresh}s
            </span>
          )}
          {lastUpdated && (
            <span className={`text-xs ${textMuted}`}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={exportCSV}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isDarkMode
                ? 'bg-slate-700/80 hover:bg-slate-600 text-gray-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Export threat data as CSV"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* ---- SUMMARY STATS ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl border p-4 ${cardCls}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-500/15' : 'bg-red-50'}`}>
              <ShieldExclamationIcon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${textSecondary}`}>Total Threats</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{summary.total_threats.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${cardCls}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/15' : 'bg-green-50'}`}>
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${textSecondary}`}>Blocked</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>
                {summary.total_blocked.toLocaleString()}
                {summary.total_threats > 0 && (
                  <span className="text-sm font-normal text-green-400 ml-2">
                    {((summary.total_blocked / summary.total_threats) * 100).toFixed(1)}%
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${cardCls}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-amber-500/15' : 'bg-amber-50'}`}>
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${textSecondary}`}>Active Incidents</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{summary.active_incidents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- MAP + SIDEBAR ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Map */}
        <div className={`rounded-xl border overflow-hidden ${cardCls}`}>
          <div className={`relative ${mapColors.bg}`} style={{ height: 520 }}>
            <style>{`
              @keyframes dashMove {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
            `}</style>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 147, center: [0, 20] }}
              className="w-full h-full"
            >
              <defs>
                {Object.entries(SEVERITY_COLORS).map(([sev, color]) => (
                  <linearGradient key={sev} id={`flow-${sev}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color} stopOpacity="0" />
                    <stop offset="50%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </linearGradient>
                ))}
              </defs>

              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={mapColors.fill}
                      stroke={mapColors.stroke}
                      strokeWidth={0.5}
                      style={{
                        default: { fill: mapColors.fill, outline: 'none' },
                        hover: { fill: mapColors.hover, outline: 'none', transition: 'all 0.2s' },
                        pressed: { fill: mapColors.hover, outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Attack Flow Lines */}
              {filteredFlows.map((flow, idx) => {
                const origIdx = attackFlows.indexOf(flow)
                const isActive = activeFlows.includes(origIdx)
                return (
                  <Line
                    key={`flow-${idx}`}
                    from={flow.from}
                    to={flow.to}
                    stroke={flow.color}
                    strokeWidth={isActive ? 2.5 : 1}
                    strokeLinecap="round"
                    strokeDasharray={isActive ? '8 4' : '4 4'}
                    strokeOpacity={isActive ? 0.9 : 0.25}
                    style={{
                      transition: 'all 0.3s ease',
                      filter: isActive ? `drop-shadow(0 0 6px ${flow.color})` : 'none',
                      animation: isActive ? 'dashMove 0.8s linear infinite' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <title>{`${flow.type} — ${flow.count} attacks (${flow.severity})`}</title>
                  </Line>
                )
              })}

              {/* Region Markers */}
              {regions.map((region, idx) => {
                if (!activeSeverityFilters.size) return null
                const intensity = Math.min(region.threats / maxRegionThreats, 1)
                const size = 6 + (intensity * 10)
                const color = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : '#3b82f6'
                const isSelected = selectedRegion?.code === region.code
                const isHighlighted = highlightedRegion === region.code

                return (
                  <Marker key={idx} coordinates={[region.lng, region.lat]}>
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedRegion(isSelected ? null : region)}
                    >
                      {/* Pulse ring */}
                      <circle r={size * 2} fill={color} opacity={0.15} className="animate-ping" />
                      {/* Selection ring */}
                      {(isSelected || isHighlighted) && (
                        <circle r={size + 4} fill="none" stroke="#a78bfa" strokeWidth={2} opacity={0.8} />
                      )}
                      {/* Main marker */}
                      <circle
                        r={size}
                        fill={color}
                        stroke={isSelected ? '#ffffff' : isDarkMode ? '#ffffff' : '#1e293b'}
                        strokeWidth={isSelected ? 2 : 1}
                        style={{ filter: `drop-shadow(0 0 ${size}px ${color})` }}
                      />
                      {/* Label */}
                      <text
                        textAnchor="middle"
                        y={-size - 8}
                        style={{
                          fontSize: '10px',
                          fill: isDarkMode ? '#e2e8f0' : '#334155',
                          fontWeight: '600',
                          pointerEvents: 'none',
                          textShadow: isDarkMode ? '0 0 4px rgba(0,0,0,0.9)' : '0 0 4px rgba(255,255,255,0.9)',
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
            <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 backdrop-blur-sm border-t ${
              isDarkMode ? 'bg-slate-900/80 border-slate-700/30' : 'bg-white/90 border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${textMuted}`}>Severity:</span>
                {SEVERITY_ORDER.map(sev => (
                  <div key={sev} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[sev] }} />
                    <span className={`text-xs capitalize ${textSecondary}`}>{sev}</span>
                  </div>
                ))}
              </div>
              <span className={`text-xs ${textMuted}`}>Click markers for details</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Region Rankings */}
          <div className={`rounded-xl border p-4 ${cardCls}`}>
            <h3 className={`text-sm font-semibold mb-3 ${textPrimary}`}>Region Rankings</h3>
            <div className="space-y-2">
              {sortedRegions.map(region => {
                const pct = maxRegionThreats > 0 ? (region.threats / maxRegionThreats) * 100 : 0
                const isSelected = selectedRegion?.code === region.code
                return (
                  <button
                    key={region.code}
                    onClick={() => {
                      setSelectedRegion(isSelected ? null : region)
                      setHighlightedRegion(isSelected ? null : region.code)
                    }}
                    onMouseEnter={() => setHighlightedRegion(region.code)}
                    onMouseLeave={() => !selectedRegion && setHighlightedRegion(null)}
                    className={`w-full text-left rounded-lg px-2.5 py-1.5 transition-all ${
                      isSelected
                        ? isDarkMode ? 'bg-purple-500/20 ring-1 ring-purple-500/40' : 'bg-purple-50 ring-1 ring-purple-300'
                        : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-medium ${isSelected ? (isDarkMode ? 'text-purple-300' : 'text-purple-700') : textPrimary}`}>
                        {region.name}
                      </span>
                      <span className={`text-xs font-mono ${textSecondary}`}>{region.threats}</span>
                    </div>
                    <div className={`h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#3b82f6',
                        }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Severity Filter */}
          <div className={`rounded-xl border p-4 ${cardCls}`}>
            <h3 className={`text-sm font-semibold mb-2 ${textPrimary}`}>Severity Filter</h3>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITY_ORDER.map(sev => {
                const isOn = activeSeverityFilters.has(sev)
                return (
                  <button
                    key={sev}
                    onClick={() => toggleSeverityFilter(sev)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all capitalize ${
                      isOn
                        ? `text-white border-transparent`
                        : isDarkMode
                          ? 'bg-slate-800 text-gray-400 border-slate-600 opacity-50'
                          : 'bg-gray-100 text-gray-500 border-gray-300 opacity-50'
                    }`}
                    style={isOn ? { backgroundColor: SEVERITY_COLORS[sev] } : {}}
                  >
                    {sev}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Attack Type Filter */}
          <div className={`rounded-xl border p-4 ${cardCls}`}>
            <h3 className={`text-sm font-semibold mb-2 ${textPrimary}`}>
              Attack Types
              {activeTypeFilters.size > 0 && (
                <button onClick={() => setActiveTypeFilters(new Set())} className="ml-2 text-xs text-purple-400 hover:text-purple-300">
                  Clear
                </button>
              )}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {allAttackTypes.map(type => {
                const isOn = activeTypeFilters.size === 0 || activeTypeFilters.has(type)
                return (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type)}
                    className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
                      isOn
                        ? isDarkMode
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-purple-50 text-purple-700 border-purple-300'
                        : isDarkMode
                          ? 'bg-slate-800 text-gray-500 border-slate-600 opacity-40'
                          : 'bg-gray-100 text-gray-400 border-gray-300 opacity-40'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---- BOTTOM PANELS ---- */}
      <div className={`grid grid-cols-1 ${selectedRegion ? 'lg:grid-cols-2' : ''} gap-4`}>
        {/* Threat Type Breakdown Chart */}
        <div className={`rounded-xl border p-4 ${cardCls}`}>
          <h3 className={`text-sm font-semibold mb-3 ${textPrimary}`}>Threat Type Breakdown</h3>
          {threatTypes.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={threatTypes} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                <XAxis type="number" stroke={isDarkMode ? '#64748b' : '#9ca3af'} fontSize={11} />
                <YAxis type="category" dataKey="type" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} fontSize={11} width={75} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#111827' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {threatTypes.map((entry, i) => (
                    <Cell key={i} fill={SEVERITY_COLORS[entry.severity] || '#6b7280'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-32 ${textMuted}`}>No threat data available</div>
          )}
        </div>

        {/* Selected Region Detail */}
        {selectedRegion && (
          <div className={`rounded-xl border p-4 ${cardCls}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${textPrimary}`}>{selectedRegion.name}</h3>
              <button
                onClick={() => { setSelectedRegion(null); setHighlightedRegion(null) }}
                className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <p className="text-lg font-bold text-red-400">{selectedRegion.threats}</p>
                <p className={`text-xs ${textMuted}`}>Threats</p>
              </div>
              <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <p className="text-lg font-bold text-green-400">{selectedRegion.attacks_blocked}</p>
                <p className={`text-xs ${textMuted}`}>Blocked</p>
              </div>
              <div className={`text-center p-2 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <p className="text-lg font-bold text-amber-400">{selectedRegion.active_incidents}</p>
                <p className={`text-xs ${textMuted}`}>Incidents</p>
              </div>
            </div>
            {/* Block rate bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${textSecondary}`}>Block Rate</span>
                <span className={`text-xs font-mono ${textPrimary}`}>
                  {selectedRegion.threats > 0
                    ? ((selectedRegion.attacks_blocked / selectedRegion.threats) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className={`h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{
                    width: `${selectedRegion.threats > 0 ? (selectedRegion.attacks_blocked / selectedRegion.threats) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            {/* Attack flows targeting this region */}
            <div className="mt-4">
              <h4 className={`text-xs font-semibold mb-2 ${textSecondary}`}>Inbound Attacks</h4>
              <div className="space-y-1">
                {attackFlows
                  .filter(f => {
                    const toLng = f.to[0], toLat = f.to[1]
                    return Math.abs(toLng - selectedRegion.lng) < 20 && Math.abs(toLat - selectedRegion.lat) < 20
                  })
                  .map((flow, i) => (
                    <div key={i} className={`flex items-center justify-between text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                      <span className={textPrimary}>{flow.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono" style={{ color: flow.color }}>{flow.count}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                          flow.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                          flow.severity === 'high' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>{flow.severity}</span>
                      </div>
                    </div>
                  ))
                }
                {attackFlows.filter(f => Math.abs(f.to[0] - selectedRegion.lng) < 20 && Math.abs(f.to[1] - selectedRegion.lat) < 20).length === 0 && (
                  <p className={`text-xs ${textMuted}`}>No inbound attacks tracked</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
