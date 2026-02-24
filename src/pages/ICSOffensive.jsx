import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'

// -------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------

const API_BASE = '/api/ics-offensive'

const TABS = [
  'Dashboard',
  'Network Scanner',
  'Credential Tester',
  'Protocol Fuzzer',
  'PLC Logic',
  'MITM',
  'Attack Chains',
  'Firmware',
  'Audit Log',
]

const ICS_VENDORS = [
  'Siemens',
  'Rockwell',
  'Schneider',
  'ABB',
  'GE',
  'Honeywell',
  'Yokogawa',
  'Emerson',
  'MOXA',
]

const ICS_PROTOCOLS = [
  'Modbus',
  'DNP3',
  'EtherNet/IP',
  'S7comm',
  'OPC-UA',
  'IEC 60870-5-104',
  'IEC 61850',
  'BACnet',
  'PROFINET',
]

const ATTACK_CHAIN_TEMPLATES = [
  {
    id: 'triton',
    name: 'Triton / TRISIS',
    description:
      'Targets Schneider Electric Triconex Safety Instrumented Systems. Disables safety PLCs to allow unsafe process conditions.',
    mitre: ['T0838', 'T0857', 'T0806', 'T0881'],
    steps: [
      'Reconnaissance — enumerate safety network segment',
      'Identify Triconex TriStation workstations',
      'Deploy TRITON malware framework',
      'Overwrite safety logic with halt instructions',
      'Trigger safety system failure / cover tracks',
    ],
  },
  {
    id: 'industroyer',
    name: 'Industroyer / Crashoverride',
    description:
      'Modular malware targeting power grid protocols (IEC 60870-5-101/104, IEC 61850, DLMS). Caused Ukraine 2016 blackout.',
    mitre: ['T0855', 'T0831', 'T0856', 'T0813'],
    steps: [
      'Backdoor installation on engineering workstation',
      'Map OT network — identify RTUs and IEDs',
      'Load protocol payload modules',
      'Send spoofed open/close commands to breakers',
      'Execute wiper to delay recovery',
    ],
  },
  {
    id: 'stuxnet',
    name: 'Stuxnet',
    description:
      'Highly sophisticated worm targeting Siemens S7-315/417 PLCs controlling centrifuge drives. Modified ladder logic covertly.',
    mitre: ['T0873', 'T0836', 'T0857', 'T0845'],
    steps: [
      'USB delivery to air-gapped network',
      'Enumerate Siemens Step 7 installations',
      'Inject rogue ladder logic into PLC',
      'Intercept and spoof operator readings',
      'Overspeed / understress centrifuges cyclically',
    ],
  },
  {
    id: 'havex',
    name: 'HAVEX / Dragonfly',
    description:
      'OPC data harvesting trojan targeting energy sector. Enumerates OPC servers and exfiltrates tag lists and process values.',
    mitre: ['T0801', 'T0852', 'T0846', 'T0832'],
    steps: [
      'Spear-phish ICS vendor / watering hole',
      'Install OPC scanning component',
      'Enumerate all OPC DA/UA servers on LAN',
      'Read process variable tag tree',
      'Exfiltrate compressed data via C2',
    ],
  },
  {
    id: 'blackenergy',
    name: 'BlackEnergy / Sandworm',
    description:
      'Modular malware used in Ukraine power grid attacks (Dec 2015). Combined KillDisk wiper with serial-to-Ethernet gateway manipulation.',
    mitre: ['T0816', 'T0831', 'T0800', 'T0879'],
    steps: [
      'Spear-phish operators with malicious XLS macro',
      'BlackEnergy 3 loader installation',
      'Deploy serial-to-Ethernet gateway module',
      'Open circuit breakers via SCADA HMI',
      'Deploy KillDisk to overwrite MBR',
    ],
  },
  {
    id: 'oldsmar',
    name: 'Oldsmar Water Treatment',
    description:
      'Feb 2021 Florida water plant attack. Attacker used remote access software to modify sodium hydroxide (lye) setpoint to dangerous levels.',
    mitre: ['T0831', 'T0855', 'T0806', 'T0803'],
    steps: [
      'Gain access via TeamViewer / VNC exposed to internet',
      'Open HMI remote session',
      'Modify NaOH (lye) setpoint from 111 ppm to 11,100 ppm',
      'Operator detected anomaly and reverted change',
      'Post-incident: close remote access, patch HMI',
    ],
  },
]

const STEP_STATUS_COLORS = {
  pending: 'bg-gray-600 text-gray-300',
  running: 'bg-yellow-500 text-black',
  completed: 'bg-green-600 text-white',
  failed: 'bg-red-600 text-white',
}

const severityColor = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-blue-400',
  info: 'text-gray-400',
}

const severityBg = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-400 text-white',
  info: 'bg-gray-400 text-white',
}

// -------------------------------------------------------------------------
// Fetch helper
// -------------------------------------------------------------------------

const fetchJSON = async (url, options = {}) => {
  const token = localStorage.getItem('rodeo_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { headers, ...options })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// -------------------------------------------------------------------------
// Authorization form (shared across operative tabs)
// -------------------------------------------------------------------------

function AuthForm({ auth, setAuth, isDarkMode }) {
  return (
    <div className={`rounded-lg border border-cyan-500/30 ${isDarkMode ? 'bg-gray-900/60' : 'bg-cyan-50'} p-4 mb-6`}>
      <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
        Authorization Context
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Context</label>
          <select
            value={auth.context}
            onChange={(e) => setAuth((a) => ({ ...a, context: e.target.value }))}
            className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500`}
          >
            <option value="pentest">pentest</option>
            <option value="ctf">ctf</option>
            <option value="research">research</option>
            <option value="red_team">red_team</option>
          </select>
        </div>
        <div>
          <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Authorized By</label>
          <input
            type="text"
            value={auth.authorized_by}
            onChange={(e) => setAuth((a) => ({ ...a, authorized_by: e.target.value }))}
            placeholder="Name / role"
            className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500`}
          />
        </div>
        <div>
          <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Auth Doc</label>
          <input
            type="text"
            value={auth.auth_doc}
            onChange={(e) => setAuth((a) => ({ ...a, auth_doc: e.target.value }))}
            placeholder="SOW / ticket ref"
            className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500`}
          />
        </div>
        <div>
          <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Scope</label>
          <input
            type="text"
            value={auth.scope}
            onChange={(e) => setAuth((a) => ({ ...a, scope: e.target.value }))}
            placeholder="e.g. 10.0.0.0/8"
            className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500`}
          />
        </div>
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={auth.mock_mode}
              onChange={(e) => setAuth((a) => ({ ...a, mock_mode: e.target.checked }))}
              className="w-4 h-4 accent-cyan-500"
            />
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mock Mode</span>
            {auth.mock_mode && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-700 text-cyan-100">
                SAFE
              </span>
            )}
          </label>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------------------
// Default auth state factory
// -------------------------------------------------------------------------

const defaultAuth = () => ({
  context: 'pentest',
  authorized_by: '',
  auth_doc: '',
  scope: '',
  mock_mode: true,
})

// -------------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------------

export default function ICSOffensive() {
  const { isDarkMode } = useTheme()
  const { isDemoMode } = useDemoMode()
  const isLiveMode = !isDemoMode
  const [activeTab, setActiveTab] = useState(0)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notif, setNotif] = useState(null)

  const showNotif = (msg) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 4000)
  }

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const s = await fetchJSON(`${API_BASE}/status`).catch(() => null)
      setStatus(s)
    } catch {
      // fallback to null
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Live mode polling
  useEffect(() => {
    if (!isLiveMode) return
    const interval = setInterval(() => { fetchStatus() }, 15000)
    return () => clearInterval(interval)
  }, [isLiveMode, fetchStatus])

  // -----------------------------------------------------------------------
  // Tab 0: Dashboard
  // -----------------------------------------------------------------------
  const DashboardTab = () => {
    const tools = [
      { name: 'Network Scanner', key: 'scanner', desc: 'ICS device discovery and fingerprinting' },
      { name: 'Credential Tester', key: 'cred_tester', desc: 'Default credential verification' },
      { name: 'Protocol Fuzzer', key: 'fuzzer', desc: 'Protocol-level fault injection' },
      { name: 'PLC Logic', key: 'plc_logic', desc: 'Ladder logic download, analysis, bypass' },
      { name: 'MITM', key: 'mitm', desc: 'Man-in-the-middle for ICS protocols' },
      { name: 'Attack Chains', key: 'chains', desc: 'Multi-step automated attack playbooks' },
      { name: 'Firmware', key: 'firmware', desc: 'Firmware extraction and analysis' },
    ]

    const toolStatus = status?.tools || {}

    return (
      <div className="space-y-6">
        {/* Authorization status */}
        <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Module Authorization</h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                {status?.authorized
                  ? `Authorized — context: ${status.auth_context || 'unknown'}`
                  : 'Not yet authorized — set authorization context before running operations'}
              </p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                status?.authorized
                  ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                  : 'bg-red-600/20 text-red-400 border border-red-500/30'
              }`}
            >
              {status?.authorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}
            </span>
          </div>
          {status?.authorized && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Authorized by:</span>{' '}
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{status.authorized_by || '—'}</span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Scope:</span>{' '}
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{status.scope || '—'}</span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Mock mode:</span>{' '}
                <span className={status.mock_mode ? 'text-cyan-400' : 'text-yellow-400'}>
                  {status.mock_mode ? 'ON (safe)' : 'OFF (live)'}
                </span>
              </div>
              <div>
                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Doc ref:</span>{' '}
                <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{status.auth_doc || '—'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tool status cards */}
        <div>
          <h3 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-widest">
            Tool Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((t) => {
              const ts = toolStatus[t.key] || {}
              const isReady = ts.ready !== false
              return (
                <div
                  key={t.key}
                  className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800 hover:border-cyan-500/40' : 'border-gray-200 bg-white hover:border-cyan-400'} p-4 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.name}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${
                        isReady ? 'bg-green-400' : 'bg-gray-600'
                      }`}
                    />
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.desc}</p>
                  {ts.last_run && (
                    <p className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Last run: {ts.last_run}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Last operation summary */}
        <div>
          <h3 className="text-sm font-semibold text-cyan-300 mb-3 uppercase tracking-widest">
            Last Operation
          </h3>
          {status?.last_operation ? (
            <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} p-4 text-sm space-y-2`}>
              <div className="flex items-center gap-3">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Tool:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{status.last_operation.tool}</span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>|</span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Operation:</span>
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{status.last_operation.operation}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Target:</span>
                <span className="font-mono text-cyan-300">{status.last_operation.target}</span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>|</span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Time:</span>
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{status.last_operation.timestamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Result:</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    status.last_operation.success ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
                  }`}
                >
                  {status.last_operation.success ? 'SUCCESS' : 'FAILED'}
                </span>
                {status.last_operation.summary && (
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{status.last_operation.summary}</span>
                )}
              </div>
            </div>
          ) : (
            <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>No operations recorded yet.</p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Operations" value={status?.stats?.total_operations ?? 0} isDarkMode={isDarkMode} />
          <StatCard
            label="Devices Discovered"
            value={status?.stats?.devices_discovered ?? 0}
            color="text-cyan-400"
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Credentials Found"
            value={status?.stats?.credentials_found ?? 0}
            color="text-orange-400"
            isDarkMode={isDarkMode}
          />
          <StatCard
            label="Audit Log Entries"
            value={status?.stats?.audit_entries ?? 0}
            color={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Tab 1: Network Scanner
  // -----------------------------------------------------------------------
  const NetworkScannerTab = () => {
    const [auth, setAuth] = useState(defaultAuth())
    const [targetNetwork, setTargetNetwork] = useState('192.168.1.0/24')
    const [selectedPorts, setSelectedPorts] = useState([502, 4840])
    const [scanning, setScanning] = useState(false)
    const [devices, setDevices] = useState([])

    const ICS_PORTS = [
      { port: 502, label: '502 (Modbus)' },
      { port: 4840, label: '4840 (OPC-UA)' },
      { port: 20000, label: '20000 (DNP3)' },
      { port: 102, label: '102 (S7comm)' },
      { port: 44818, label: '44818 (EtherNet/IP)' },
      { port: 47808, label: '47808 (BACnet)' },
      { port: 2404, label: '2404 (IEC 104)' },
    ]

    const togglePort = (port) => {
      setSelectedPorts((prev) =>
        prev.includes(port) ? prev.filter((p) => p !== port) : [...prev, port]
      )
    }

    const runScan = async () => {
      if (!targetNetwork.trim()) {
        showNotif('Please enter a target network CIDR.')
        return
      }
      setScanning(true)
      setDevices([])
      try {
        const result = await fetchJSON(`${API_BASE}/scan`, {
          method: 'POST',
          body: JSON.stringify({
            target_network: targetNetwork,
            ports: selectedPorts,
            authorization: auth,
          }),
        })
        setDevices(result.devices || [])
        showNotif(`Scan complete — ${(result.devices || []).length} device(s) found`)
      } catch (err) {
        showNotif(`Scan failed: ${err.message}`)
      }
      setScanning(false)
    }

    return (
      <div className="space-y-6">
        <AuthForm auth={auth} setAuth={setAuth} isDarkMode={isDarkMode} />

        <Section title="Scan Configuration" isDarkMode={isDarkMode}>
          <div className="space-y-4">
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Target Network (CIDR)</label>
              <input
                type="text"
                value={targetNetwork}
                onChange={(e) => setTargetNetwork(e.target.value)}
                placeholder="192.168.1.0/24"
                className={`w-full md:w-72 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
              />
            </div>
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>ICS Ports to Probe</label>
              <div className="flex flex-wrap gap-2">
                {ICS_PORTS.map(({ port, label }) => (
                  <label
                    key={port}
                    className={`flex items-center gap-1.5 cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-cyan-500/50' : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-cyan-400'} border rounded px-3 py-1.5 text-xs transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPorts.includes(port)}
                      onChange={() => togglePort(port)}
                      className="accent-cyan-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={runScan}
              disabled={scanning}
              className={`px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white text-sm font-medium transition-colors`}
            >
              {scanning ? 'Scanning...' : 'Start Scan'}
            </button>
          </div>
        </Section>

        {devices.length > 0 && (
          <Section title={`Discovered Devices (${devices.length})`} isDarkMode={isDarkMode}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs uppercase tracking-wider`}>
                    <th className="px-3 py-2">IP Address</th>
                    <th className="px-3 py-2">Port</th>
                    <th className="px-3 py-2">Protocol</th>
                    <th className="px-3 py-2">Vendor</th>
                    <th className="px-3 py-2">Model</th>
                    <th className="px-3 py-2">Firmware</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d, i) => (
                    <tr key={i} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className="px-3 py-2 font-mono text-cyan-300">{d.ip}</td>
                      <td className={`px-3 py-2 font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{d.port}</td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{d.protocol}</td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{d.vendor || '—'}</td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{d.model || '—'}</td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs font-mono`}>
                        {d.firmware || '—'}
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
  // Tab 2: Credential Tester
  // -----------------------------------------------------------------------
  const CredentialTesterTab = () => {
    const [auth, setAuth] = useState(defaultAuth())
    const [vendor, setVendor] = useState('Siemens')
    const [host, setHost] = useState('')
    const [port, setPort] = useState('')
    const [testing, setTesting] = useState(false)
    const [results, setResults] = useState([])

    const runTest = async () => {
      if (!host.trim()) {
        showNotif('Please enter a host address.')
        return
      }
      setTesting(true)
      setResults([])
      try {
        const result = await fetchJSON(`${API_BASE}/credentials/test`, {
          method: 'POST',
          body: JSON.stringify({
            vendor,
            host,
            port: port ? parseInt(port, 10) : undefined,
            authorization: auth,
          }),
        })
        setResults(result.results || [])
        const found = (result.results || []).filter((r) => r.success).length
        showNotif(
          found > 0
            ? `${found} valid credential(s) found`
            : 'No valid credentials found'
        )
      } catch (err) {
        showNotif(`Test failed: ${err.message}`)
      }
      setTesting(false)
    }

    return (
      <div className="space-y-6">
        <AuthForm auth={auth} setAuth={setAuth} isDarkMode={isDarkMode} />

        <Section title="Target Configuration" isDarkMode={isDarkMode}>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Vendor</label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500`}
              >
                {ICS_VENDORS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Host / IP</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="192.168.1.100"
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 w-44`}
              />
            </div>
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="auto"
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 w-24`}
              />
            </div>
            <button
              onClick={runTest}
              disabled={testing}
              className={`px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white text-sm font-medium transition-colors`}
            >
              {testing ? 'Testing...' : 'Test Credentials'}
            </button>
          </div>
        </Section>

        {results.length > 0 && (
          <Section title={`Results (${results.length})`} isDarkMode={isDarkMode}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs uppercase tracking-wider`}>
                    <th className="px-3 py-2">Username</th>
                    <th className="px-3 py-2">Password</th>
                    <th className="px-3 py-2">Protocol</th>
                    <th className="px-3 py-2">Service</th>
                    <th className="px-3 py-2">Result</th>
                    <th className="px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`px-3 py-2 font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{r.username}</td>
                      <td className={`px-3 py-2 font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{r.password}</td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{r.protocol || '—'}</td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{r.service || '—'}</td>
                      <td className="px-3 py-2">
                        {r.success ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-700 text-green-100 font-semibold">
                            VALID
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            INVALID
                          </span>
                        )}
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{r.notes || '—'}</td>
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
  // Tab 3: Protocol Fuzzer
  // -----------------------------------------------------------------------
  const ProtocolFuzzerTab = () => {
    const [auth, setAuth] = useState(defaultAuth())
    const [protocol, setProtocol] = useState('Modbus')
    const [numCases, setNumCases] = useState(100)
    const [mutationTypes, setMutationTypes] = useState(['bit_flip', 'boundary'])
    const [fuzzing, setFuzzing] = useState(false)
    const [coverage, setCoverage] = useState(0)
    const [interestingCases, setInterestingCases] = useState([])

    const MUTATION_TYPES = [
      { value: 'bit_flip', label: 'Bit Flip' },
      { value: 'byte_boundary', label: 'Byte Boundary' },
      { value: 'boundary', label: 'Field Boundary' },
      { value: 'random', label: 'Random' },
      { value: 'zero', label: 'Zero Fill' },
      { value: 'overflow', label: 'Integer Overflow' },
    ]

    const toggleMutation = (val) => {
      setMutationTypes((prev) =>
        prev.includes(val) ? prev.filter((m) => m !== val) : [...prev, val]
      )
    }

    const runFuzz = async () => {
      setFuzzing(true)
      setCoverage(0)
      setInterestingCases([])
      try {
        const result = await fetchJSON(`${API_BASE}/fuzz`, {
          method: 'POST',
          body: JSON.stringify({
            protocol,
            num_cases: numCases,
            mutation_types: mutationTypes,
            authorization: auth,
          }),
        })
        setCoverage(result.coverage_percent || 0)
        setInterestingCases(result.interesting_cases || [])
        showNotif(
          `Fuzzing complete — ${(result.interesting_cases || []).length} interesting case(s)`
        )
      } catch (err) {
        showNotif(`Fuzzing failed: ${err.message}`)
      }
      setFuzzing(false)
    }

    return (
      <div className="space-y-6">
        <AuthForm auth={auth} setAuth={setAuth} isDarkMode={isDarkMode} />

        <Section title="Fuzzer Configuration" isDarkMode={isDarkMode}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Protocol</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500`}
                >
                  {ICS_PROTOCOLS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Number of Cases</label>
                <input
                  type="number"
                  value={numCases}
                  onChange={(e) => setNumCases(parseInt(e.target.value, 10) || 100)}
                  min={1}
                  max={10000}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 w-28`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Mutation Types</label>
              <div className="flex flex-wrap gap-2">
                {MUTATION_TYPES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-1.5 cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-cyan-500/50' : 'bg-gray-50 border-gray-300 text-gray-600 hover:border-cyan-400'} border rounded px-3 py-1.5 text-xs transition-colors`}
                  >
                    <input
                      type="checkbox"
                      checked={mutationTypes.includes(value)}
                      onChange={() => toggleMutation(value)}
                      className="accent-cyan-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={runFuzz}
              disabled={fuzzing}
              className={`px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white text-sm font-medium transition-colors`}
            >
              {fuzzing ? 'Fuzzing...' : 'Start Fuzzing'}
            </button>
          </div>
        </Section>

        {(fuzzing || coverage > 0) && (
          <Section title="Coverage" isDarkMode={isDarkMode}>
            <div className="space-y-2">
              <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Protocol state coverage</span>
                <span>{coverage.toFixed(1)}%</span>
              </div>
              <div className={`h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                  style={{ width: `${Math.min(coverage, 100)}%` }}
                />
              </div>
            </div>
          </Section>
        )}

        {interestingCases.length > 0 && (
          <Section title={`Interesting Cases (${interestingCases.length})`} isDarkMode={isDarkMode}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs uppercase tracking-wider`}>
                    <th className="px-3 py-2">Case #</th>
                    <th className="px-3 py-2">Mutation Type</th>
                    <th className="px-3 py-2">Payload (hex)</th>
                    <th className="px-3 py-2">Response</th>
                    <th className="px-3 py-2">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {interestingCases.map((c, i) => (
                    <tr key={i} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`px-3 py-2 font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{c.case_id || i + 1}</td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{c.mutation_type}</td>
                      <td className="px-3 py-2 font-mono text-xs text-cyan-300 max-w-xs truncate">
                        {c.payload_hex || '—'}
                      </td>
                      <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{c.response || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            severityBg[c.severity] || 'bg-gray-600 text-gray-200'
                          }`}
                        >
                          {(c.severity || 'info').toUpperCase()}
                        </span>
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
  // Tab 4: PLC Logic
  // -----------------------------------------------------------------------
  const PLCLogicTab = () => {
    const [auth, setAuth] = useState(defaultAuth())
    const [deviceId, setDeviceId] = useState('')
    const [loading2, setLoading2] = useState(false)
    const [program, setProgram] = useState(null)
    const [diff, setDiff] = useState(null)
    const [activeOp, setActiveOp] = useState(null)

    const runOp = async (operation) => {
      if (!deviceId.trim()) {
        showNotif('Please enter a Device ID.')
        return
      }
      setLoading2(true)
      setActiveOp(operation)
      try {
        const result = await fetchJSON(`${API_BASE}/plc/logic`, {
          method: 'POST',
          body: JSON.stringify({
            device_id: deviceId,
            operation,
            authorization: auth,
          }),
        })
        setProgram(result.program || null)
        setDiff(result.diff || null)
        showNotif(`${operation} completed`)
      } catch (err) {
        showNotif(`${operation} failed: ${err.message}`)
      }
      setLoading2(false)
      setActiveOp(null)
    }

    return (
      <div className="space-y-6">
        <AuthForm auth={auth} setAuth={setAuth} isDarkMode={isDarkMode} />

        <Section title="PLC Target" isDarkMode={isDarkMode}>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="e.g. PLC-01 or 192.168.1.10"
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 w-64`}
              />
            </div>
            <div className="flex gap-2">
              {['Download', 'Analyze', 'Simulate Bypass'].map((op) => (
                <button
                  key={op}
                  onClick={() => runOp(op)}
                  disabled={loading2}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} ${
                    op === 'Simulate Bypass'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  }`}
                >
                  {loading2 && activeOp === op ? 'Running...' : op}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {program && (
          <Section title="Program Analysis" isDarkMode={isDarkMode}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border p-3`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Safety Rungs</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{program.safety_rungs ?? '—'}</p>
                {program.safety_rung_list && (
                  <ul className="mt-2 space-y-0.5">
                    {program.safety_rung_list.map((r, i) => (
                      <li key={i} className="text-xs text-red-400 font-mono">
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border p-3`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Timers</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{program.timers ?? '—'}</p>
                {program.timer_list && (
                  <ul className="mt-2 space-y-0.5">
                    {program.timer_list.map((t, i) => (
                      <li key={i} className="text-xs text-yellow-400 font-mono">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={`rounded-lg ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border p-3`}>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Outputs</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{program.outputs ?? '—'}</p>
                {program.output_list && (
                  <ul className="mt-2 space-y-0.5">
                    {program.output_list.map((o, i) => (
                      <li key={i} className="text-xs text-cyan-400 font-mono">
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {program.raw && (
              <pre className={`${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'} border rounded p-3 text-xs overflow-x-auto max-h-56 overflow-y-auto font-mono`}>
                {program.raw}
              </pre>
            )}
          </Section>
        )}

        {diff && (
          <Section title="Program Diff (Original vs Modified)" isDarkMode={isDarkMode}>
            <div className={`rounded-lg ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} border p-3 overflow-x-auto`}>
              {(diff.lines || []).map((line, i) => (
                <div
                  key={i}
                  className={`font-mono text-xs leading-5 ${
                    line.startsWith('+')
                      ? 'text-green-400 bg-green-900/20'
                      : line.startsWith('-')
                      ? 'text-red-400 bg-red-900/20'
                      : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {line}
                </div>
              ))}
              {!diff.lines && (
                <pre className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{JSON.stringify(diff, null, 2)}</pre>
              )}
            </div>
          </Section>
        )}
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Tab 5: MITM
  // -----------------------------------------------------------------------
  const MITMTab = () => {
    const [auth, setAuth] = useState(defaultAuth())
    const [targetClient, setTargetClient] = useState('')
    const [targetServer, setTargetServer] = useState('')
    const [protocol, setProtocol] = useState('Modbus')
    const [mode, setMode] = useState('passthrough')
    const [sessionActive, setSessionActive] = useState(false)
    const [sessionLoading, setSessionLoading] = useState(false)
    const [packets, setPackets] = useState([])

    const startSession = async () => {
      if (!targetClient.trim() || !targetServer.trim()) {
        showNotif('Please enter both target client and server addresses.')
        return
      }
      setSessionLoading(true)
      try {
        await fetchJSON(`${API_BASE}/mitm/start`, {
          method: 'POST',
          body: JSON.stringify({
            target_client: targetClient,
            target_server: targetServer,
            protocol,
            mode,
            authorization: auth,
          }),
        })
        setSessionActive(true)
        showNotif('MITM session started')
      } catch (err) {
        showNotif(`Failed to start session: ${err.message}`)
      }
      setSessionLoading(false)
    }

    const stopSession = async () => {
      setSessionLoading(true)
      try {
        const result = await fetchJSON(`${API_BASE}/mitm/stop`, { method: 'POST' })
        setPackets(result.packets || [])
        setSessionActive(false)
        showNotif(`Session stopped — ${(result.packets || []).length} packet(s) captured`)
      } catch (err) {
        showNotif(`Failed to stop session: ${err.message}`)
      }
      setSessionLoading(false)
    }

    return (
      <div className="space-y-6">
        <AuthForm auth={auth} setAuth={setAuth} isDarkMode={isDarkMode} />

        <Section title="Session Configuration" isDarkMode={isDarkMode}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Target Client</label>
              <input
                type="text"
                value={targetClient}
                onChange={(e) => setTargetClient(e.target.value)}
                placeholder="192.168.1.50"
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
              />
            </div>
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Target Server / PLC</label>
              <input
                type="text"
                value={targetServer}
                onChange={(e) => setTargetServer(e.target.value)}
                placeholder="192.168.1.100"
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
              />
            </div>
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500`}
              >
                {ICS_PROTOCOLS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500`}
              >
                <option value="passthrough">Passthrough (log only)</option>
                <option value="modify">Modify (alter values)</option>
                <option value="inject">Inject (insert frames)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            {!sessionActive ? (
              <button
                onClick={startSession}
                disabled={sessionLoading}
                className={`px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white text-sm font-medium transition-colors`}
              >
                {sessionLoading ? 'Starting...' : 'Start Session'}
              </button>
            ) : (
              <button
                onClick={stopSession}
                disabled={sessionLoading}
                className={`px-5 py-2 rounded bg-red-600 hover:bg-red-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white text-sm font-medium transition-colors`}
              >
                {sessionLoading ? 'Stopping...' : 'Stop Session'}
              </button>
            )}
            {sessionActive && (
              <span className="flex items-center gap-2 text-sm text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Session active — {mode} mode
              </span>
            )}
          </div>
        </Section>

        {packets.length > 0 && (
          <Section title={`Intercepted Packets (${packets.length})`} isDarkMode={isDarkMode}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs uppercase tracking-wider`}>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Direction</th>
                    <th className="px-3 py-2">Function</th>
                    <th className="px-3 py-2">Payload (hex)</th>
                    <th className="px-3 py-2">Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {packets.map((p, i) => (
                    <tr key={i} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`px-3 py-2 font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{i + 1}</td>
                      <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-mono`}>{p.timestamp}</td>
                      <td className="px-3 py-2 text-xs">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            p.direction === 'c2s'
                              ? 'bg-blue-800 text-blue-200'
                              : 'bg-purple-800 text-purple-200'
                          }`}
                        >
                          {p.direction === 'c2s' ? 'C→S' : 'S→C'}
                        </span>
                      </td>
                      <td className={`px-3 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{p.function || '—'}</td>
                      <td className="px-3 py-2 font-mono text-xs text-cyan-300 max-w-xs truncate">
                        {p.payload_hex || '—'}
                      </td>
                      <td className="px-3 py-2">
                        {p.modified ? (
                          <span className="text-xs text-yellow-400">YES</span>
                        ) : (
                          <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>—</span>
                        )}
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
  // Tab 6: Attack Chains
  // -----------------------------------------------------------------------
  const AttackChainsTab = () => {
    const [auth, setAuth] = useState(defaultAuth())
    const [executing, setExecuting] = useState(null)
    const [stepStatuses, setStepStatuses] = useState({})

    const executeChain = async (chain) => {
      setExecuting(chain.id)
      const initialStatuses = {}
      chain.steps.forEach((_, i) => {
        initialStatuses[i] = 'pending'
      })
      setStepStatuses(initialStatuses)

      try {
        await fetchJSON(`${API_BASE}/attack-chains/execute`, {
          method: 'POST',
          body: JSON.stringify({
            chain_id: chain.id,
            authorization: auth,
          }),
        })

        // Simulate step-by-step progression against the API stream
        for (let i = 0; i < chain.steps.length; i++) {
          setStepStatuses((prev) => ({ ...prev, [i]: 'running' }))
          await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
          const success = Math.random() > 0.15
          setStepStatuses((prev) => ({ ...prev, [i]: success ? 'completed' : 'failed' }))
          if (!success) break
        }
        showNotif(`Attack chain "${chain.name}" execution complete`)
      } catch (err) {
        showNotif(`Execution failed: ${err.message}`)
        setStepStatuses((prev) => {
          const updated = { ...prev }
          Object.keys(updated).forEach((k) => {
            if (updated[k] === 'pending' || updated[k] === 'running') updated[k] = 'failed'
          })
          return updated
        })
      }
      setExecuting(null)
    }

    return (
      <div className="space-y-6">
        <AuthForm auth={auth} setAuth={setAuth} isDarkMode={isDarkMode} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ATTACK_CHAIN_TEMPLATES.map((chain) => (
            <div
              key={chain.id}
              className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 flex flex-col`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} leading-tight`}>{chain.name}</h4>
                {executing === chain.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500 text-black font-semibold animate-pulse flex-shrink-0 ml-2">
                    RUNNING
                  </span>
                )}
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3 flex-grow leading-relaxed`}>
                {chain.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {chain.mitre.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-purple-700/60 text-purple-200 font-mono"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => executeChain(chain)}
                disabled={!!executing}
                className={`w-full py-1.5 rounded bg-red-600 hover:bg-red-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white text-xs font-semibold transition-colors`}
              >
                {executing === chain.id ? 'Executing...' : 'Execute Chain'}
              </button>
            </div>
          ))}
        </div>

        {executing !== null && (
          <Section title="Execution Progress" isDarkMode={isDarkMode}>
            {(() => {
              const chain = ATTACK_CHAIN_TEMPLATES.find((c) => c.id === executing)
              if (!chain) return null
              return (
                <div className="space-y-2">
                  <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{chain.name}</p>
                  {chain.steps.map((step, i) => {
                    const s = stepStatuses[i] || 'pending'
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'} border px-4 py-2`}
                      >
                        <span
                          className={`flex-shrink-0 text-[10px] px-2 py-0.5 rounded font-semibold w-20 text-center ${STEP_STATUS_COLORS[s]}`}
                        >
                          {s.toUpperCase()}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{step}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </Section>
        )}
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Tab 7: Firmware
  // -----------------------------------------------------------------------
  const FirmwareTab = () => {
    const [auth, setAuth] = useState(defaultAuth())
    const [filePath, setFilePath] = useState('')
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState(null)

    const RISK_COLORS = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-400 text-white',
      none: 'bg-gray-600 text-gray-200',
    }

    const analyze = async () => {
      if (!filePath.trim()) {
        showNotif('Please enter a firmware file path.')
        return
      }
      setAnalyzing(true)
      setResult(null)
      try {
        const data = await fetchJSON(`${API_BASE}/firmware/analyze`, {
          method: 'POST',
          body: JSON.stringify({
            file_path: filePath,
            authorization: auth,
          }),
        })
        setResult(data)
        showNotif(`Analysis complete — risk: ${data.risk_level || 'unknown'}`)
      } catch (err) {
        showNotif(`Analysis failed: ${err.message}`)
      }
      setAnalyzing(false)
    }

    return (
      <div className="space-y-6">
        <AuthForm auth={auth} setAuth={setAuth} isDarkMode={isDarkMode} />

        <Section title="Firmware File" isDarkMode={isDarkMode}>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className={`block text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>File Path</label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="/path/to/firmware.bin"
                className={`w-full ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500`}
              />
            </div>
            <button
              onClick={analyze}
              disabled={analyzing}
              className={`px-5 py-2 rounded bg-cyan-600 hover:bg-cyan-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white text-sm font-medium transition-colors flex-shrink-0`}
            >
              {analyzing ? 'Analyzing...' : 'Analyze Firmware'}
            </button>
          </div>
        </Section>

        {result && (
          <div className="space-y-5">
            {/* Risk badge */}
            <div className="flex items-center gap-3">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overall Risk:</span>
              <span
                className={`text-sm px-3 py-1 rounded font-bold ${
                  RISK_COLORS[result.risk_level] || 'bg-gray-600 text-gray-200'
                }`}
              >
                {(result.risk_level || 'unknown').toUpperCase()}
              </span>
              {result.firmware_type && (
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type: {result.firmware_type}</span>
              )}
              {result.architecture && (
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Arch: {result.architecture}</span>
              )}
            </div>

            {/* Sections with entropy */}
            {result.sections && result.sections.length > 0 && (
              <Section title="Binary Sections" isDarkMode={isDarkMode}>
                <div className="space-y-2">
                  {result.sections.map((sec, i) => (
                    <div key={i} className={`rounded ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} border p-3`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-cyan-300">{sec.name}</span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {sec.size ? `${(sec.size / 1024).toFixed(1)} KB` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} w-20`}>
                          Entropy: {(sec.entropy || 0).toFixed(2)}
                        </span>
                        <div className={`flex-1 h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              sec.entropy > 7
                                ? 'bg-red-500'
                                : sec.entropy > 6
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((sec.entropy / 8) * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 8.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Extracted credentials */}
            {result.credentials && result.credentials.length > 0 && (
              <Section title={`Extracted Credentials (${result.credentials.length})`} isDarkMode={isDarkMode}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs uppercase tracking-wider`}>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Value</th>
                        <th className="px-3 py-2">Context</th>
                        <th className="px-3 py-2">Offset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.credentials.map((c, i) => (
                        <tr key={i} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <td className="px-3 py-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-orange-700/60 text-orange-200">
                              {c.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-yellow-300">{c.value}</td>
                          <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{c.context || '—'}</td>
                          <td className={`px-3 py-2 font-mono text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {c.offset != null ? `0x${c.offset.toString(16).toUpperCase()}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* CVE matches */}
            {result.cve_matches && result.cve_matches.length > 0 && (
              <Section title={`Known CVE Matches (${result.cve_matches.length})`} isDarkMode={isDarkMode}>
                <div className="space-y-2">
                  {result.cve_matches.map((cve, i) => (
                    <div
                      key={i}
                      className={`rounded border ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} p-3 flex items-start gap-3`}
                    >
                      <span className="font-mono text-xs text-red-400 flex-shrink-0 mt-0.5">
                        {cve.cve_id}
                      </span>
                      <div className="flex-1">
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{cve.description}</p>
                        {cve.cvss && (
                          <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1 block`}>
                            CVSS: {cve.cvss}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${
                          severityBg[cve.severity] || 'bg-gray-600 text-gray-200'
                        }`}
                      >
                        {(cve.severity || 'info').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Tab 8: Audit Log
  // -----------------------------------------------------------------------
  const AuditLogTab = () => {
    const [entries, setEntries] = useState([])
    const [sortField, setSortField] = useState('timestamp')
    const [sortDir, setSortDir] = useState('desc')
    const [fetching, setFetching] = useState(false)

    const fetchLog = useCallback(async () => {
      setFetching(true)
      try {
        const data = await fetchJSON(`${API_BASE}/audit-log`)
        setEntries(data.entries || [])
      } catch {
        // use empty
      }
      setFetching(false)
    }, [])

    useEffect(() => {
      fetchLog()
    }, [fetchLog])

    const handleSort = (field) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDir('asc')
      }
    }

    const sorted = [...entries].sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })

    const exportCSV = () => {
      const headers = ['timestamp', 'tool', 'operation', 'user', 'target', 'mock_mode', 'result_summary']
      const rows = sorted.map((e) =>
        headers.map((h) => JSON.stringify(e[h] ?? '')).join(',')
      )
      const csv = [headers.join(','), ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ics-offensive-audit-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showNotif('Audit log exported as CSV')
    }

    const SortHeader = ({ field, label }) => (
      <th
        className="px-3 py-2 cursor-pointer select-none hover:text-cyan-300 transition-colors"
        onClick={() => handleSort(field)}
      >
        {label}
        {sortField === field && (
          <span className="ml-1 text-cyan-400">{sortDir === 'asc' ? '▲' : '▼'}</span>
        )}
      </th>
    )

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cyan-300 uppercase tracking-widest">
            Operation Audit Log
          </h3>
          <div className="flex gap-2">
            <button
              onClick={fetchLog}
              disabled={fetching}
              className={`text-xs px-3 py-1.5 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
            >
              {fetching ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={exportCSV}
              disabled={entries.length === 0}
              className={`text-xs px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 ${isDarkMode ? 'disabled:bg-gray-700 disabled:text-gray-500' : 'disabled:bg-gray-200 disabled:text-gray-400'} text-white transition-colors`}
            >
              Export CSV
            </button>
          </div>
        </div>

        {entries.length === 0 && !fetching ? (
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>No audit log entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} text-left ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs uppercase tracking-wider`}>
                  <SortHeader field="timestamp" label="Timestamp" />
                  <SortHeader field="tool" label="Tool" />
                  <SortHeader field="operation" label="Operation" />
                  <SortHeader field="user" label="User" />
                  <SortHeader field="target" label="Target" />
                  <SortHeader field="mock_mode" label="Mock" />
                  <SortHeader field="result_summary" label="Result" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((e, i) => (
                  <tr key={i} className={`border-b ${isDarkMode ? 'border-gray-800 hover:bg-gray-800/40' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <td className={`px-3 py-2 font-mono text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {e.timestamp || '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-cyan-300">{e.tool || '—'}</td>
                    <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{e.operation || '—'}</td>
                    <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{e.user || '—'}</td>
                    <td className={`px-3 py-2 font-mono text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{e.target || '—'}</td>
                    <td className="px-3 py-2 text-xs">
                      {e.mock_mode ? (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-700/60 text-cyan-200">ON</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-red-700/60 text-red-200">OFF</span>
                      )}
                    </td>
                    <td className={`px-3 py-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} max-w-xs truncate`}>
                      {e.result_summary || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // -----------------------------------------------------------------------
  // Tab content map
  // -----------------------------------------------------------------------
  const tabContent = [
    <DashboardTab key="dashboard" />,
    <NetworkScannerTab key="scanner" />,
    <CredentialTesterTab key="creds" />,
    <ProtocolFuzzerTab key="fuzzer" />,
    <PLCLogicTab key="plc" />,
    <MITMTab key="mitm" />,
    <AttackChainsTab key="chains" />,
    <FirmwareTab key="firmware" />,
    <AuditLogTab key="audit" />,
  ]

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className={`p-6 space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} min-h-screen`}>
      {/* Notification toast */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-sm">
          {notif}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ICS Offensive</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
            Industrial Control System penetration testing and attack simulation — authorized use
            only
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status?.enabled ? 'bg-green-400' : 'bg-gray-600'
            }`}
          />
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {status?.enabled ? 'Module Active' : 'Module Inactive'}
          </span>
          {status?.mock_mode && (
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-700/60 text-cyan-200 border border-cyan-500/30">
              MOCK MODE
            </span>
          )}
          <button
            onClick={fetchStatus}
            className={`text-xs px-3 py-1.5 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors`}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Warning banner */}
      <div className="rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-3 text-xs text-red-300">
        <span className="font-bold text-red-400">WARNING: </span>
        This module contains active exploitation tools for ICS/SCADA systems. Only use against
        targets for which you have written authorization. Unauthorized use may violate the Computer
        Fraud and Abuse Act (18 U.S.C. 1030) and international equivalents. All operations are
        logged.
      </div>

      {/* Tabs */}
      <div className={`flex gap-0.5 overflow-x-auto border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pb-0`}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === i
                ? 'border-b-2 border-cyan-500 text-cyan-300 font-medium'
                : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'} rounded-t`
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
        </div>
      ) : (
        <div className="pb-8">{tabContent[activeTab]}</div>
      )}
    </div>
  )
}

// -------------------------------------------------------------------------
// Shared sub-components
// -------------------------------------------------------------------------

function StatCard({ label, value, color = 'text-white', isDarkMode }) {
  return (
    <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4 text-center`}>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{label}</p>
    </div>
  )
}

function Section({ title, children, isDarkMode }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">{title}</h3>
      {children}
    </div>
  )
}
