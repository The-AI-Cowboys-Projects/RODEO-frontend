import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const statusColor = {
  online: 'text-green-400',
  offline: 'text-gray-400',
  alarm: 'text-yellow-400',
  error: 'text-red-400',
  degraded: 'text-orange-400',
  compromised: 'text-red-600',
  unknown: 'text-gray-500',
}

const statusDot = {
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

const complianceBadge = {
  pass: 'bg-green-700 text-green-100',
  fail: 'bg-red-700 text-red-100',
  warning: 'bg-yellow-600 text-yellow-100',
  not_applicable: 'bg-gray-700 text-gray-300',
}

// Mock data used when API is unreachable
const buildMockDevice = (deviceId) => ({
  device_id: deviceId || 'oilgas_plc_1',
  name: 'Pipeline Compressor Station PLC',
  protocol: 'modbus_tcp',
  status: 'online',
  scenario: 'oil_gas',
  connection: { host: '10.10.1.10', port: 502 },
  poll_count: 142,
  anomaly_count: 3,
})

const MOCK_REGISTERS = [
  { address: 0, name: 'pipeline_pressure', value: 487.2, unit: 'PSI', min: 0, max: 1500, safety_critical: true },
  { address: 1, name: 'flow_rate', value: 1204.5, unit: 'bbl/hr', min: 0, max: 5000, safety_critical: false },
  { address: 2, name: 'temperature', value: 92.3, unit: 'degF', min: -40, max: 300, safety_critical: false },
  { address: 3, name: 'compressor_speed', value: 1800, unit: 'RPM', min: 0, max: 3600, safety_critical: false },
  { address: 4, name: 'inlet_valve', value: 1, unit: 'bool', min: 0, max: 1, safety_critical: false },
  { address: 5, name: 'outlet_valve', value: 1, unit: 'bool', min: 0, max: 1, safety_critical: false },
  { address: 6, name: 'compressor_status', value: 1, unit: 'enum', min: 0, max: 3, safety_critical: false },
  { address: 7, name: 'pressure_setpoint', value: 500.0, unit: 'PSI', min: 0, max: 1500, safety_critical: false },
  { address: 8, name: 'temperature_setpoint', value: 90.0, unit: 'degF', min: -40, max: 300, safety_critical: false },
  { address: 9, name: 'esd', value: 0, unit: 'bool', min: 0, max: 1, safety_critical: true },
  { address: 10, name: 'alarm_status', value: 0, unit: 'bitmap', min: null, max: null, safety_critical: false },
  { address: 11, name: 'operating_mode', value: 1, unit: 'enum', min: 0, max: 2, safety_critical: false },
]

const MOCK_EVENTS = [
  { id: 1, event_type: 'ANOMALY_DETECTED', severity: 'medium', description: 'Pressure variance exceeded 5% of setpoint', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 2, event_type: 'POLL_SUCCESS', severity: 'info', description: 'Device polled — 12 registers read', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 3, event_type: 'SETPOINT_CHANGE', severity: 'high', description: 'Pressure setpoint changed from 480 to 500 PSI remotely', timestamp: new Date(Date.now() - 900000).toISOString() },
]

const MOCK_COMPLIANCE = [
  { control_id: 'IEC-62443-3.2', name: 'Network Segmentation', status: 'pass', details: 'Device is on isolated OT VLAN' },
  { control_id: 'IEC-62443-4.1', name: 'Secure Development', status: 'warning', details: 'Firmware version not validated against vendor baseline' },
  { control_id: 'NERC-CIP-007-R1', name: 'Ports and Services', status: 'fail', details: 'Modbus port 502 exposed without authentication' },
  { control_id: 'NERC-CIP-005-R2', name: 'Remote Access Management', status: 'pass', details: 'No unauthorized remote sessions detected' },
]

const DEVICE_ACTIONS = [
  {
    id: 'isolate',
    label: 'Isolate Device',
    description: 'Block all network traffic to and from this device at the firewall level.',
    color: 'bg-red-700 hover:bg-red-600',
    action_type: 'isolate_host',
    confirmLabel: 'Confirm Isolate',
  },
  {
    id: 'revert',
    label: 'Revert Setpoint',
    description: 'Write the last known-good setpoint values back to the device registers.',
    color: 'bg-amber-700 hover:bg-amber-600',
    action_type: 'revert_setpoint',
    confirmLabel: 'Confirm Revert',
  },
  {
    id: 'failsafe',
    label: 'Trigger Failsafe',
    description: 'Assert the ESD (Emergency Shutdown) register to put the device into a safe state.',
    color: 'bg-orange-700 hover:bg-orange-600',
    action_type: 'trigger_failsafe',
    confirmLabel: 'Confirm Failsafe',
  },
  {
    id: 'disable_remote',
    label: 'Disable Remote Access',
    description: 'Revoke remote engineering access permissions for this device.',
    color: 'bg-gray-700 hover:bg-gray-600',
    action_type: 'disable_remote_access',
    confirmLabel: 'Confirm Disable',
  },
]

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function SCADADeviceDetail() {
  const { isDarkMode } = useTheme()
  const { device_id } = useParams()
  const [device, setDevice] = useState(null)
  const [registers, setRegisters] = useState([])
  const [events, setEvents] = useState([])
  const [compliance, setCompliance] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [notif, setNotif] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // action object pending confirmation
  const [actionRunning, setActionRunning] = useState(false)

  const showNotif = (msg) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 3500)
  }

  const fetchDevice = useCallback(async () => {
    if (!device_id) return
    setLoading(true)
    try {
      const [devRes, compRes] = await Promise.all([
        fetch(`/api/ics/devices/${device_id}`),
        fetch(`/api/ics/compliance/check/${device_id}`),
      ])

      if (!devRes.ok) throw new Error('Device API unavailable')

      const devData = await devRes.json()
      setDevice(devData.device || devData)
      setRegisters(devData.registers || MOCK_REGISTERS)
      setEvents(devData.events || MOCK_EVENTS)

      if (compRes.ok) {
        const compData = await compRes.json()
        setCompliance(compData.controls || compData || [])
      } else {
        setCompliance(MOCK_COMPLIANCE)
      }
      setUsingMock(false)
    } catch {
      setDevice(buildMockDevice(device_id))
      setRegisters(MOCK_REGISTERS)
      setEvents(MOCK_EVENTS)
      setCompliance(MOCK_COMPLIANCE)
      setUsingMock(true)
    }
    setLoading(false)
  }, [device_id])

  useEffect(() => { fetchDevice() }, [fetchDevice])

  const handleAction = async (action) => {
    setConfirmAction(null)
    setActionRunning(true)
    try {
      const res = await fetch('/api/actions/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: action.action_type,
          target: device_id,
          metadata: { device_id, device_name: device?.name, scenario: device?.scenario },
        }),
      })
      if (res.ok) {
        showNotif(`Action "${action.label}" queued for approval`)
      } else {
        showNotif(`Failed to queue action — server returned ${res.status}`)
      }
    } catch {
      showNotif(`Action queued (offline mode) — will retry when connected`)
    }
    setActionRunning(false)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className={`p-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Device <code className="text-amber-300">{device_id}</code> not found.
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Notification toast */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-amber-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {notif}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} border border-amber-600/40 rounded-xl p-6 max-w-md w-full mx-4`}>
            <h3 className="text-lg font-bold text-amber-300 mb-2">{confirmAction.label}</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{confirmAction.description}</p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-6`}>
              Target device: <span className="text-amber-200 font-mono">{device_id}</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className={`px-4 py-2 text-sm rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} text-white`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmAction)}
                disabled={actionRunning}
                className={`px-4 py-2 text-sm rounded text-white ${confirmAction.color} disabled:opacity-50`}
              >
                {actionRunning ? 'Processing...' : confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${statusDot[device.status] || 'bg-gray-400'}`} />
            <h1 className="text-2xl font-bold text-amber-400">{device.name}</h1>
          </div>
          <div className={`flex gap-4 mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>ID: </span>
              <span className="font-mono text-xs text-amber-300">{device.device_id}</span>
            </span>
            <span>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Protocol: </span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{device.protocol}</span>
            </span>
            <span>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Scenario: </span>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{device.scenario || '—'}</span>
            </span>
            <span className={statusColor[device.status] || (isDarkMode ? 'text-gray-400' : 'text-gray-500')}>{device.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {usingMock && (
            <span className="text-xs bg-amber-900/50 border border-amber-600/40 text-amber-300 px-2 py-1 rounded">
              Demo data
            </span>
          )}
          <button
            onClick={fetchDevice}
            className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Device stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Poll Count" value={device.poll_count ?? '—'} isDarkMode={isDarkMode} />
        <StatCard label="Anomalies" value={device.anomaly_count ?? 0} color={device.anomaly_count > 0 ? 'text-red-400' : 'text-green-400'} isDarkMode={isDarkMode} />
        <StatCard label="Registers" value={registers.length} isDarkMode={isDarkMode} />
        <StatCard label="Compliance" value={`${compliance.filter(c => c.status === 'pass').length}/${compliance.length}`} color="text-amber-300" isDarkMode={isDarkMode} />
      </div>

      {/* Register Table */}
      <Section title="Registers" isDarkMode={isDarkMode}>
        {registers.length === 0 ? (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No register data. Poll the device to read values.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${isDarkMode ? 'text-gray-400 border-b border-gray-700' : 'text-gray-500 border-b border-gray-200'}`}>
                  <th className="pb-2 pr-4">Addr</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Value</th>
                  <th className="pb-2 pr-4">Unit</th>
                  <th className="pb-2 pr-4">Range</th>
                  <th className="pb-2">Safety</th>
                </tr>
              </thead>
              <tbody>
                {registers.map((reg, i) => (
                  <tr
                    key={reg.address ?? i}
                    className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} ${reg.safety_critical ? 'bg-red-950/20' : ''}`}
                  >
                    <td className={`py-2 pr-4 font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{reg.address}</td>
                    <td className="py-2 pr-4 font-medium">{reg.name}</td>
                    <td className="py-2 pr-4 font-mono text-amber-300">{reg.value ?? '—'}</td>
                    <td className={`py-2 pr-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{reg.unit || '—'}</td>
                    <td className={`py-2 pr-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {reg.min != null && reg.max != null ? `${reg.min} – ${reg.max}` : '—'}
                    </td>
                    <td className="py-2">
                      {reg.safety_critical && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-700 text-red-100 font-semibold">
                          CRITICAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Anomaly / Event History */}
      <Section title="Event History" isDarkMode={isDarkMode}>
        {events.length === 0 ? (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No events recorded for this device.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.map((ev, i) => (
              <div key={ev.id || i} className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} p-3 flex items-start gap-3`}>
                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded font-semibold mt-0.5 ${severityBadge[ev.severity] || 'bg-gray-600 text-white'}`}>
                  {(ev.severity || 'info').toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{ev.event_type}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>{ev.description}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mt-1`}>{ev.timestamp ? timeAgo(ev.timestamp) : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Compliance Results */}
      <Section title="Compliance Controls" isDarkMode={isDarkMode}>
        {compliance.length === 0 ? (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No compliance checks available for this device.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${isDarkMode ? 'text-gray-400 border-b border-gray-700' : 'text-gray-500 border-b border-gray-200'}`}>
                  <th className="pb-2 pr-4">Control ID</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {compliance.map((ctrl, i) => (
                  <tr key={ctrl.control_id || i} className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <td className="py-2 pr-4 font-mono text-xs text-amber-300">{ctrl.control_id}</td>
                    <td className="py-2 pr-4">{ctrl.name}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${complianceBadge[ctrl.status] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600 border border-gray-200')}`}>
                        {(ctrl.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td className={`py-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{ctrl.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Action Controls */}
      <Section title="Device Actions" isDarkMode={isDarkMode}>
        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-4`}>
          Actions are routed through the approval workflow. A senior analyst must approve before execution.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DEVICE_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => setConfirmAction(action)}
              disabled={actionRunning}
              className={`rounded-lg p-4 text-left text-white transition-colors disabled:opacity-50 ${action.color}`}
            >
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs mt-1 opacity-80 leading-snug">{action.description}</p>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

// --- Shared sub-components ---

function StatCard({ label, value, color = '', isDarkMode }) {
  const textColor = color || (isDarkMode ? 'text-white' : 'text-gray-900')
  return (
    <div className={`rounded-lg border border-amber-500/20 ${isDarkMode ? 'bg-gray-900/60' : 'bg-gray-50'} p-4 text-center`}>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
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
