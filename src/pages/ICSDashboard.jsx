import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'
import { ics } from '../api/client'

const TABS = ['Overview', 'Water Treatment', 'Power Grid', 'Manufacturing', 'Alerts', 'Attack Tools', 'MITRE ICS']

const severityColor = {
  safety_critical: 'bg-red-600 text-white',
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-400 text-white',
  info: 'bg-gray-400 text-white',
}

const statusColor = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  alarm: 'bg-yellow-500',
  error: 'bg-red-500',
  degraded: 'bg-orange-400',
  unknown: 'bg-gray-300',
  compromised: 'bg-red-700',
}

export default function ICSDashboard() {
  const { isDarkMode } = useTheme()
  const { isDemoMode } = useDemoMode()
  const isLiveMode = !isDemoMode
  const [activeTab, setActiveTab] = useState(0)
  const [status, setStatus] = useState(null)
  const [devices, setDevices] = useState([])
  const [scenarios, setScenarios] = useState([])
  const [alerts, setAlerts] = useState([])
  const [anomalies, setAnomalies] = useState(null)
  const [mitre, setMitre] = useState(null)
  const [attackHistory, setAttackHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [notif, setNotif] = useState(null)

  const showNotif = (msg) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 3000)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, d, sc, al] = await Promise.all([
        ics.getStatus().catch(() => ({ enabled: false, devices: 0 })),
        ics.getDevices().catch(() => []),
        ics.getScenarios().catch(() => []),
        ics.getAlerts().catch(() => []),
      ])
      setStatus(s)
      setDevices(d)
      setScenarios(sc)
      setAlerts(al)
    } catch {
      // fallback
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Live mode polling
  useEffect(() => {
    if (!isLiveMode) return
    const interval = setInterval(() => { fetchAll() }, 15000)
    return () => clearInterval(interval)
  }, [isLiveMode, fetchAll])

  useEffect(() => {
    if (activeTab === 4) {
      ics.getAlerts().then(setAlerts).catch(() => {})
    } else if (activeTab === 5) {
      ics.getAttackHistory().then(setAttackHistory).catch(() => {})
    } else if (activeTab === 6 && !mitre) {
      ics.getMitreICS().then(setMitre).catch(() => {})
    }
  }, [activeTab, mitre])

  // -----------------------------------------------------------------------
  // Overview Tab
  // -----------------------------------------------------------------------
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Devices" value={status?.devices ?? 0} isDarkMode={isDarkMode} />
        <StatCard label="Online" value={status?.online ?? 0} color="text-green-400" isDarkMode={isDarkMode} />
        <StatCard label="Offline" value={status?.offline ?? 0} color={isDarkMode ? 'text-gray-400' : 'text-gray-500'} isDarkMode={isDarkMode} />
        <StatCard label="Alarm" value={status?.alarm ?? 0} color="text-yellow-400" isDarkMode={isDarkMode} />
      </div>

      {/* Scenarios */}
      <Section title="Scenarios" isDarkMode={isDarkMode}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((s) => (
            <div key={s.name} className={`rounded-lg border border-pink-500/20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'} p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-pink-300">{s.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${s.loaded ? 'bg-green-600' : 'bg-gray-600'}`}>
                  {s.loaded ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={async () => {
                    try {
                      await ics.startScenario(s.name)
                      showNotif(`${s.label} started`)
                      fetchAll()
                    } catch { showNotif('Failed to start scenario') }
                  }}
                  className="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white"
                >Start</button>
                <button
                  onClick={async () => {
                    try {
                      await ics.stopScenario(s.name)
                      showNotif(`${s.label} stopped`)
                      fetchAll()
                    } catch { showNotif('Failed to stop scenario') }
                  }}
                  className="text-xs px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
                >Stop</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Device list */}
      <Section title="Devices" isDarkMode={isDarkMode}>
        {devices.length === 0 ? (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No devices registered. Start a scenario to load devices.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-left ${isDarkMode ? 'text-gray-400 border-b border-gray-700' : 'text-gray-500 border-b border-gray-200'}`}>
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Protocol</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d) => (
                  <tr key={d.device_id} className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                    <td className="py-2 pr-4 font-mono text-xs">{d.device_id}</td>
                    <td className="py-2 pr-4">{d.name}</td>
                    <td className={`py-2 pr-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{d.protocol}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${statusColor[d.status] || 'bg-gray-400'}`} />
                      {d.status}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={async () => {
                          try {
                            const r = await ics.pollDevice(d.device_id)
                            showNotif(`Polled: ${r.registers_read} regs, ${r.anomalies_detected} anomalies`)
                          } catch { showNotif('Poll failed') }
                        }}
                        className="text-xs px-2 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white"
                      >Poll</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  )

  // -----------------------------------------------------------------------
  // Scenario Tab (parameterized)
  // -----------------------------------------------------------------------
  const ScenarioTab = ({ scenarioName }) => {
    const scenarioDevices = devices.filter(
      (d) => d.scenario === scenarioName || d.metadata?.scenario === scenarioName
    )

    const [selectedDevice, setSelectedDevice] = useState(null)
    const [registers, setRegisters] = useState(null)

    const loadRegisters = async (deviceId) => {
      try {
        const r = await ics.getRegisters(deviceId)
        setRegisters(r.registers)
        setSelectedDevice(deviceId)
      } catch { showNotif('Failed to load registers') }
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarioDevices.map((d) => (
            <div
              key={d.device_id}
              onClick={() => loadRegisters(d.device_id)}
              className={`rounded-lg border p-4 cursor-pointer transition-all ${
                selectedDevice === d.device_id
                  ? 'border-pink-500 bg-pink-500/10'
                  : isDarkMode
                    ? 'border-gray-700 bg-gray-900/50 hover:border-pink-500/50'
                    : 'border-gray-200 bg-gray-50 hover:border-pink-500/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{d.name}</span>
                <span className={`inline-block w-2 h-2 rounded-full ${statusColor[d.status] || 'bg-gray-400'}`} />
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{d.protocol} | Polls: {d.poll_count}</p>
            </div>
          ))}
        </div>
        {scenarioDevices.length === 0 && (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No devices for this scenario. Start the scenario from Overview.</p>
        )}

        {registers && selectedDevice && (
          <Section title={`Registers - ${selectedDevice}`} isDarkMode={isDarkMode}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-left ${isDarkMode ? 'text-gray-400 border-b border-gray-700' : 'text-gray-500 border-b border-gray-200'}`}>
                    <th className="pb-2 pr-3">Addr</th>
                    <th className="pb-2 pr-3">Name</th>
                    <th className="pb-2 pr-3">Value</th>
                    <th className="pb-2 pr-3">Unit</th>
                    <th className="pb-2">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(registers).map(([addr, reg]) => (
                    <tr key={addr} className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                      <td className="py-1 pr-3 font-mono text-xs">{addr}</td>
                      <td className="py-1 pr-3">{reg.name}</td>
                      <td className="py-1 pr-3 font-mono">{reg.value}</td>
                      <td className={`py-1 pr-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{reg.unit || '-'}</td>
                      <td className={`py-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {reg.min_val != null ? `${reg.min_val} - ${reg.max_val}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Alerts Tab
  // -----------------------------------------------------------------------
  const AlertsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Alerts</h3>
        <button
          onClick={() => ics.getAlerts().then(setAlerts).catch(() => {})}
          className="text-xs px-3 py-1 rounded bg-pink-600 hover:bg-pink-500 text-white"
        >Refresh</button>
      </div>
      {alerts.length === 0 ? (
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No alerts recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} p-3`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${severityColor[a.severity] || 'bg-gray-500'}`}>
                  {a.severity?.toUpperCase()}
                </span>
                <span className="text-sm font-semibold">{a.data?.title || a.event_type}</span>
                {a.mitre_ics_technique && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-700 text-purple-100">
                    {a.mitre_ics_technique}
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{a.data?.description || ''}</p>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                Device: {a.device_id} | {a.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // -----------------------------------------------------------------------
  // Attack Tools Tab
  // -----------------------------------------------------------------------
  const AttackToolsTab = () => {
    const [scanResult, setScanResult] = useState(null)
    const [running, setRunning] = useState(false)

    const runScan = async (scanType) => {
      setRunning(true)
      setScanResult(null)
      try {
        const r = await ics.runModbusScan({ scan_type: scanType, slave_id: 1 })
        setScanResult(r)
        showNotif(`Scan complete: ${r.findings_count || 0} findings`)
      } catch { showNotif('Scan failed') }
      setRunning(false)
    }

    return (
      <div className="space-y-6">
        <Section title="Modbus Scanner" isDarkMode={isDarkMode}>
          <div className="flex gap-2 flex-wrap">
            <ToolButton label="Scan Slave IDs" onClick={() => runScan('slave_id')} disabled={running} />
            <ToolButton label="Enumerate Registers" onClick={() => runScan('registers')} disabled={running} />
            <ToolButton label="Fingerprint Device" onClick={() => runScan('fingerprint')} disabled={running} />
          </div>
        </Section>

        <Section title="CAN Bus Injector" isDarkMode={isDarkMode}>
          <div className="flex gap-2 flex-wrap">
            <ToolButton
              label="Inject Message"
              onClick={async () => {
                setRunning(true)
                try {
                  const r = await ics.runCANInject({ operation: 'inject', can_id: 0x100, data: [0xFF, 0x00], count: 1 })
                  setScanResult(r)
                  showNotif(`Injected: ${r.messages_sent} messages`)
                } catch { showNotif('Injection failed') }
                setRunning(false)
              }}
              disabled={running}
            />
            <ToolButton
              label="Fuzz CAN IDs"
              onClick={async () => {
                setRunning(true)
                try {
                  const r = await ics.runCANInject({ operation: 'fuzz', id_range: [0, 255] })
                  setScanResult(r)
                  showNotif(`Fuzz complete: ${r.messages_sent} messages`)
                } catch { showNotif('Fuzz failed') }
                setRunning(false)
              }}
              disabled={running}
            />
          </div>
        </Section>

        <Section title="Setpoint Fuzzer" isDarkMode={isDarkMode}>
          <div className="flex gap-2 flex-wrap">
            {devices.map((d) => (
              <ToolButton
                key={d.device_id}
                label={`Fuzz ${d.name}`}
                onClick={async () => {
                  setRunning(true)
                  try {
                    const r = await ics.runSetpointFuzz({
                      target_device_id: d.device_id,
                      address: 0,
                      num_tests: 10,
                      delay_seconds: 0.1,
                    })
                    setScanResult(r)
                    showNotif(`Fuzz: ${r.tests_run} tests`)
                  } catch { showNotif('Fuzz failed') }
                  setRunning(false)
                }}
                disabled={running}
              />
            ))}
            {devices.length === 0 && <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No devices to fuzz</span>}
          </div>
        </Section>

        {scanResult && (
          <Section title="Result" isDarkMode={isDarkMode}>
            <pre className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto`}>
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          </Section>
        )}

        <Section title="Attack History" isDarkMode={isDarkMode}>
          {attackHistory.length === 0 ? (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>No attack history yet.</p>
          ) : (
            <div className="space-y-2">
              {attackHistory.slice(0, 10).map((h, i) => (
                <div key={i} className={`text-xs ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'} rounded p-2 border`}>
                  <span className="text-pink-300 font-semibold">{h.operation || h.scan_type || 'unknown'}</span>
                  {' | '}{h.target || h.target_device || '-'}
                  {' | '}{h.started_at}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // MITRE ICS Tab
  // -----------------------------------------------------------------------
  const MitreTab = () => {
    if (!mitre) return <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Loading MITRE ATT&CK for ICS...</p>

    const byTactic = {}
    for (const t of mitre.techniques || []) {
      const tactic = t.tactic_name || 'Unknown'
      if (!byTactic[tactic]) byTactic[tactic] = []
      byTactic[tactic].push(t)
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Tactics" value={mitre.tactic_count} isDarkMode={isDarkMode} />
          <StatCard label="Techniques" value={mitre.technique_count} isDarkMode={isDarkMode} />
        </div>
        {Object.entries(byTactic).map(([tactic, techs]) => (
          <Section key={tactic} title={tactic} isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {techs.map((t) => (
                <div key={t.technique_id} className={`rounded border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} p-3`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-purple-700/50 px-1.5 py-0.5 rounded">{t.technique_id}</span>
                    <span className="text-sm font-semibold">{t.name}</span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 line-clamp-2`}>{t.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(t.platforms || []).map((p) => (
                      <span key={p} className={`text-[10px] px-1 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Shared components
  // -----------------------------------------------------------------------
  const tabContent = [
    <OverviewTab key="overview" />,
    <ScenarioTab key="water" scenarioName="water_treatment" />,
    <ScenarioTab key="power" scenarioName="power_grid" />,
    <ScenarioTab key="mfg" scenarioName="manufacturing" />,
    <AlertsTab key="alerts" />,
    <AttackToolsTab key="attacks" />,
    <MitreTab key="mitre" />,
  ]

  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Notification toast */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-pink-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in">
          {notif}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ICS/SCADA Security</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
            Industrial control system monitoring, anomaly detection, and attack tools
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${status?.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{status?.enabled ? 'Module Active' : 'Module Inactive'}</span>
          <button
            onClick={fetchAll}
            className={`text-xs px-3 py-1 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-1 overflow-x-auto border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-1`}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm rounded-t whitespace-nowrap transition-colors ${
              activeTab === i
                ? 'bg-pink-600 text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500" />
        </div>
      ) : (
        tabContent[activeTab]
      )}
    </div>
  )
}

// -------------------------------------------------------------------------
// Tiny reusable sub-components
// -------------------------------------------------------------------------

function StatCard({ label, value, color = '', isDarkMode }) {
  const textColor = color || (isDarkMode ? 'text-white' : 'text-gray-900')
  return (
    <div className={`rounded-lg border border-pink-500/20 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'} p-4 text-center`}>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{label}</p>
    </div>
  )
}

function Section({ title, children, isDarkMode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-pink-300">{title}</h3>
      {children}
    </div>
  )
}

function ToolButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-xs px-4 py-2 rounded bg-pink-600 hover:bg-pink-500 disabled:bg-gray-700 disabled:text-gray-500 text-white transition-colors"
    >{disabled ? 'Running...' : label}</button>
  )
}
