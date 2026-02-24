import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'

// Purdue model zone definitions
const PURDUE_ZONES = [
  { level: 0, label: 'Level 0 — Field Devices', description: 'Sensors, actuators, PLCs directly on process', color: 'border-orange-600 bg-orange-950/40' },
  { level: 1, label: 'Level 1 — Basic Control', description: 'PLCs, DCS, RTUs executing control loops', color: 'border-amber-500 bg-amber-950/40' },
  { level: 2, label: 'Level 2 — Supervisory Control', description: 'SCADA HMI, engineering workstations', color: 'border-yellow-500 bg-yellow-950/40' },
  { level: 3, label: 'Level 3 — Manufacturing Ops', description: 'Historian, batch management, scheduling', color: 'border-lime-600 bg-lime-950/30' },
  { level: 4, label: 'Level 4 — Business Logistics', description: 'ERP, business systems, plant IT network', color: 'border-green-600 bg-green-950/30' },
  { level: 5, label: 'Level 5 — Enterprise Network', description: 'Corporate IT, internet-facing systems', color: 'border-teal-600 bg-teal-950/30' },
]

// Assign protocol → Purdue level heuristic
function protocolToLevel(protocol) {
  const p = (protocol || '').toLowerCase()
  if (p === 'modbus_rtu' || p === 'modbus_tcp') return 1
  if (p === 'dnp3') return 1
  if (p === 'bacnet') return 2
  if (p === 'ethernetip' || p === 'profinet') return 1
  if (p === 'opc_ua') return 2
  return 1
}

const statusColor = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  alarm: 'bg-yellow-400',
  error: 'bg-red-500',
  degraded: 'bg-orange-400',
  compromised: 'bg-red-700',
  unknown: 'bg-gray-400',
}

const severityBadge = {
  safety_critical: 'bg-red-600 text-white',
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white',
  info: 'bg-gray-500 text-white',
}

// Mock data used when API is unreachable
const MOCK_DEVICES = [
  { device_id: 'oilgas_plc_1', name: 'Pipeline Compressor PLC', protocol: 'modbus_tcp', status: 'online', scenario: 'oil_gas', last_polled: new Date().toISOString() },
  { device_id: 'oilgas_rtu_1', name: 'Separator Unit RTU', protocol: 'dnp3', status: 'alarm', scenario: 'oil_gas', last_polled: new Date().toISOString() },
  { device_id: 'oilgas_sensor_1', name: 'Leak Detection Sensor', protocol: 'modbus_tcp', status: 'online', scenario: 'oil_gas', last_polled: new Date().toISOString() },
  { device_id: 'bldg_plc_1', name: 'HVAC Controller', protocol: 'bacnet', status: 'online', scenario: 'building_automation', last_polled: new Date().toISOString() },
  { device_id: 'bldg_plc_2', name: 'Fire Alarm Panel', protocol: 'bacnet', status: 'online', scenario: 'building_automation', last_polled: new Date().toISOString() },
  { device_id: 'bldg_plc_3', name: 'Access Control System', protocol: 'ethernetip', status: 'degraded', scenario: 'building_automation', last_polled: new Date().toISOString() },
  { device_id: 'water_plc_1', name: 'Water Treatment PLC', protocol: 'modbus_rtu', status: 'online', scenario: 'water_treatment', last_polled: new Date().toISOString() },
]

const MOCK_COMPLIANCE = {
  frameworks: [
    { name: 'IEC 62443', pass: 34, fail: 6, warning: 8, total: 48 },
    { name: 'NERC CIP', pass: 19, fail: 4, warning: 5, total: 28 },
    { name: 'NIST 800-82', pass: 41, fail: 9, warning: 10, total: 60 },
  ],
}

const MOCK_EVENTS = [
  { id: 1, device_id: 'oilgas_rtu_1', severity: 'high', event_type: 'ANOMALY_DETECTED', description: 'Oil level exceeded 90% threshold', timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 2, device_id: 'oilgas_plc_1', severity: 'medium', event_type: 'SETPOINT_CHANGE', description: 'Pressure setpoint modified remotely', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 3, device_id: 'bldg_plc_3', severity: 'critical', event_type: 'INTRUSION_DETECTED', description: 'Badge reader anomaly — door_2 forced open', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 4, device_id: 'water_plc_1', severity: 'low', event_type: 'POLL_TIMEOUT', description: 'Device did not respond within timeout window', timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: 5, device_id: 'oilgas_sensor_1', severity: 'safety_critical', event_type: 'LEAK_DETECTED', description: 'Acoustic anomaly score 91/100 — possible pipeline leak', timestamp: new Date(Date.now() - 1800000).toISOString() },
]

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function SCADAOverview() {
  const { isDarkMode } = useTheme()
  const [devices, setDevices] = useState([])
  const [compliance, setCompliance] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usingMock, setUsingMock] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [devRes, compRes] = await Promise.all([
        fetch('/api/ics/devices'),
        fetch('/api/ics/compliance/status'),
      ])

      if (!devRes.ok || !compRes.ok) throw new Error('API returned non-OK status')

      const [devData, compData] = await Promise.all([devRes.json(), compRes.json()])
      setDevices(Array.isArray(devData) ? devData : devData.devices || [])
      setCompliance(compData)
      setUsingMock(false)

      // Events are best-effort — fall back silently
      try {
        const evRes = await fetch('/api/ics/events?limit=10')
        if (evRes.ok) {
          const evData = await evRes.json()
          setEvents(Array.isArray(evData) ? evData : evData.events || [])
        } else {
          setEvents(MOCK_EVENTS)
        }
      } catch {
        setEvents(MOCK_EVENTS)
      }
    } catch {
      // API unreachable — use mock data so the page is still useful
      setDevices(MOCK_DEVICES)
      setCompliance(MOCK_COMPLIANCE)
      setEvents(MOCK_EVENTS)
      setUsingMock(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Compute zone counts from devices
  const zoneCounts = {}
  for (const d of devices) {
    const lvl = protocolToLevel(d.protocol)
    zoneCounts[lvl] = (zoneCounts[lvl] || 0) + 1
  }

  // Status summary
  const totalDevices = devices.length
  const online = devices.filter(d => d.status === 'online').length
  const alarm = devices.filter(d => d.status === 'alarm' || d.status === 'error' || d.status === 'compromised').length
  const offline = devices.filter(d => d.status === 'offline' || d.status === 'degraded').length

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500" />
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">SCADA Overview</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
            Industrial control system monitoring — all scenarios and devices at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingMock && (
            <span className="text-xs bg-amber-900/50 border border-amber-600/40 text-amber-300 px-2 py-1 rounded">
              Demo data — API offline
            </span>
          )}
          <button
            onClick={fetchData}
            className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Devices" value={totalDevices} color={isDarkMode ? 'text-white' : 'text-gray-900'} isDarkMode={isDarkMode} />
        <StatCard label="Online" value={online} color="text-green-400" isDarkMode={isDarkMode} />
        <StatCard label="Alarm / Error" value={alarm} color="text-red-400" isDarkMode={isDarkMode} />
        <StatCard label="Offline / Degraded" value={offline} color={isDarkMode ? 'text-gray-400' : 'text-gray-500'} isDarkMode={isDarkMode} />
      </div>

      {/* Device status grid */}
      <Section title="Device Status" isDarkMode={isDarkMode}>
        {devices.length === 0 ? (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No devices found. Start a scenario in ICS/SCADA to register devices.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {devices.map((d) => (
              <div
                key={d.device_id}
                className={`rounded-lg border border-amber-500/20 ${isDarkMode ? 'bg-gray-900/60 hover:border-amber-500/50' : 'bg-gray-50 hover:border-amber-500/50'} p-4 transition-colors`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate pr-2`}>{d.name}</span>
                  <span
                    className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${statusColor[d.status] || 'bg-gray-400'}`}
                    title={d.status}
                  />
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} space-y-0.5`}>
                  <div>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>ID: </span>
                    <span className="font-mono">{d.device_id}</span>
                  </div>
                  <div>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Protocol: </span>
                    <span className="text-amber-300">{d.protocol}</span>
                  </div>
                  <div>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Status: </span>
                    <span className={d.status === 'online' ? 'text-green-400' : d.status === 'alarm' || d.status === 'error' ? 'text-red-400' : isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {d.status}
                    </span>
                  </div>
                  {d.last_polled && (
                    <div>
                      <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Polled: </span>
                      <span>{timeAgo(d.last_polled)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Purdue Zone Diagram */}
      <Section title="Purdue Reference Model — Device Distribution" isDarkMode={isDarkMode}>
        <div className="space-y-2">
          {PURDUE_ZONES.map((zone) => {
            const count = zoneCounts[zone.level] || 0
            return (
              <div
                key={zone.level}
                className={`rounded-lg border ${zone.color} p-3 flex items-center gap-4`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-700/50 flex items-center justify-center text-xs font-bold text-amber-200">
                  L{zone.level}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{zone.label}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{zone.description}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className={`text-lg font-bold ${count > 0 ? 'text-amber-300' : isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {count}
                  </span>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>device{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Alert Feed */}
      <Section title="Recent ICS Events" isDarkMode={isDarkMode}>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {events.length === 0 ? (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No recent events.</p>
          ) : (
            events.map((ev, i) => (
              <div
                key={ev.id || i}
                className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} p-3 flex items-start gap-3`}
              >
                <span
                  className={`flex-shrink-0 mt-0.5 text-xs px-2 py-0.5 rounded font-semibold ${severityBadge[ev.severity] || 'bg-gray-600 text-white'}`}
                >
                  {(ev.severity || 'info').toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{ev.event_type}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>{ev.description || ev.data?.description || ''}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
                    {ev.device_id} &mdash; {ev.timestamp ? timeAgo(ev.timestamp) : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Section>

      {/* Compliance Summary */}
      <Section title="Compliance Summary" isDarkMode={isDarkMode}>
        {!compliance ? (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No compliance data available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(compliance.frameworks || []).map((fw) => {
              const passRate = fw.total > 0 ? Math.round((fw.pass / fw.total) * 100) : 0
              const failWidth = fw.total > 0 ? (fw.fail / fw.total) * 100 : 0
              const warnWidth = fw.total > 0 ? (fw.warning / fw.total) * 100 : 0
              const passWidth = fw.total > 0 ? (fw.pass / fw.total) * 100 : 0
              return (
                <div key={fw.name} className={`rounded-lg border border-amber-500/20 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'} p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm text-amber-300">{fw.name}</span>
                    <span className={`text-xs font-bold ${passRate >= 80 ? 'text-green-400' : passRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {passRate}%
                    </span>
                  </div>
                  {/* Stacked progress bar */}
                  <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden flex mb-3`}>
                    <div className="bg-green-500 h-full" style={{ width: `${passWidth}%` }} />
                    <div className="bg-yellow-400 h-full" style={{ width: `${warnWidth}%` }} />
                    <div className="bg-red-500 h-full" style={{ width: `${failWidth}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-400">{fw.pass} pass</span>
                    <span className="text-yellow-400">{fw.warning} warn</span>
                    <span className="text-red-400">{fw.fail} fail</span>
                    <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ml-auto`}>{fw.total} total</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}

// --- Shared sub-components ---

function StatCard({ label, value, color = '', isDarkMode }) {
  const textColor = color || (isDarkMode ? 'text-white' : 'text-gray-900')
  return (
    <div className={`rounded-lg border border-amber-500/20 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'} p-4 text-center`}>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{label}</p>
    </div>
  )
}

function Section({ title, children, isDarkMode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-amber-300">{title}</h2>
      {children}
    </div>
  )
}
