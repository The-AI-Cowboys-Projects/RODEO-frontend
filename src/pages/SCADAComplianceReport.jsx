import { useState, useEffect, useCallback } from 'react'

const FRAMEWORKS = [
  { id: 'iec_62443', label: 'IEC 62443', description: 'Industrial Automation and Control Systems Security' },
  { id: 'nerc_cip', label: 'NERC CIP', description: 'North American Electric Reliability Corporation Critical Infrastructure Protection' },
  { id: 'nist_800_82', label: 'NIST 800-82', description: 'Guide to Industrial Control Systems (ICS) Security' },
]

const STATUS_FILTERS = ['all', 'pass', 'fail', 'warning']

const statusBadge = {
  pass: 'bg-green-700 text-green-100',
  fail: 'bg-red-700 text-red-100',
  warning: 'bg-yellow-600 text-yellow-100',
  not_applicable: 'bg-gray-700 text-gray-300',
}

// Mock report data per framework
const MOCK_REPORTS = {
  iec_62443: {
    framework: 'IEC 62443',
    generated_at: new Date().toISOString(),
    controls: [
      { control_id: 'SR-1.1', name: 'Human User Identification and Authentication', status: 'pass', details: 'Strong authentication enforced on all HMI workstations', remediation: null },
      { control_id: 'SR-1.2', name: 'Software Process and Device Identification', status: 'pass', details: 'All PLCs have unique device IDs registered in asset inventory', remediation: null },
      { control_id: 'SR-1.3', name: 'Account Management', status: 'warning', details: '3 accounts have not rotated passwords in 180+ days', remediation: 'Enforce 90-day password rotation policy and audit stale accounts.' },
      { control_id: 'SR-2.1', name: 'Application Partitioning', status: 'pass', details: 'OT and IT networks are segmented via firewall', remediation: null },
      { control_id: 'SR-2.4', name: 'Mobile Code', status: 'fail', details: 'USB ports are not disabled on engineering workstations', remediation: 'Disable USB storage via Group Policy and enforce endpoint DLP controls.' },
      { control_id: 'SR-3.1', name: 'Communication Integrity', status: 'warning', details: 'Modbus TCP has no message authentication — integrity not guaranteed', remediation: 'Implement application-layer signing or migrate to Modbus Security (TLS).' },
      { control_id: 'SR-3.3', name: 'Security Functionality Verification', status: 'pass', details: 'Monthly integrity scans pass for all field devices', remediation: null },
      { control_id: 'SR-4.1', name: 'Information Confidentiality', status: 'fail', details: 'Process historian data transmitted over plain HTTP', remediation: 'Enforce TLS 1.3 on all data-in-transit paths from historian to SCADA HMI.' },
      { control_id: 'SR-5.1', name: 'Network Segmentation', status: 'pass', details: 'Purdue model zones enforced with unidirectional gateways at Levels 2-3', remediation: null },
      { control_id: 'SR-6.1', name: 'Audit Log Accessibility', status: 'pass', details: 'SIEM receives forwarded syslog from all ICS devices', remediation: null },
      { control_id: 'SR-7.1', name: 'Denial of Service Protection', status: 'warning', details: 'No rate limiting applied to Modbus polling endpoints', remediation: 'Implement protocol-aware firewalling to rate-limit Modbus requests to known-good sources.' },
      { control_id: 'SR-7.6', name: 'Network and Security Configuration Settings', status: 'fail', details: 'Default factory credentials detected on 2 RTUs', remediation: 'Change default credentials on all field devices during next maintenance window.' },
    ],
  },
  nerc_cip: {
    framework: 'NERC CIP',
    generated_at: new Date().toISOString(),
    controls: [
      { control_id: 'CIP-002-R1', name: 'BES Cyber System Identification', status: 'pass', details: 'All BES cyber assets inventoried and classified', remediation: null },
      { control_id: 'CIP-003-R2', name: 'Cyber Security Policies', status: 'pass', details: 'Policy documentation current and signed off by CISO', remediation: null },
      { control_id: 'CIP-004-R1', name: 'Personnel Risk Assessment', status: 'warning', details: '2 contractors lack completed background checks', remediation: 'Complete outstanding background checks before granting unescorted physical access.' },
      { control_id: 'CIP-005-R1', name: 'Electronic Security Perimeter', status: 'pass', details: 'ESP defined and documented with ingress/egress controls', remediation: null },
      { control_id: 'CIP-005-R2', name: 'Remote Access Management', status: 'fail', details: 'Remote desktop sessions lack multi-factor authentication', remediation: 'Require TOTP or hardware key for all remote access into the ESP.' },
      { control_id: 'CIP-006-R1', name: 'Physical Security Plan', status: 'pass', details: 'Control rooms have badge access and camera coverage', remediation: null },
      { control_id: 'CIP-007-R1', name: 'Ports and Services', status: 'fail', details: 'TCP/502 (Modbus) reachable from IT VLAN segment', remediation: 'Block Modbus port at L2/L3 boundary. Permit only from authorized polling hosts.' },
      { control_id: 'CIP-007-R4', name: 'Security Event Monitoring', status: 'pass', details: 'IDS alerts forwarded to 24/7 SOC within 15 minutes', remediation: null },
      { control_id: 'CIP-010-R1', name: 'Configuration Change Management', status: 'warning', details: 'Firmware changes not tracked in change management system', remediation: 'Integrate firmware update events with ServiceNow change management workflow.' },
      { control_id: 'CIP-011-R1', name: 'Information Protection', status: 'pass', details: 'BES cyber system information stored encrypted at rest', remediation: null },
    ],
  },
  nist_800_82: {
    framework: 'NIST 800-82',
    generated_at: new Date().toISOString(),
    controls: [
      { control_id: 'AC-2', name: 'Account Management', status: 'pass', details: 'Role-based access control enforced across all ICS components', remediation: null },
      { control_id: 'AC-3', name: 'Access Enforcement', status: 'pass', details: 'Access control lists applied at network perimeter', remediation: null },
      { control_id: 'AC-17', name: 'Remote Access', status: 'fail', details: 'Remote sessions do not enforce idle session timeout', remediation: 'Configure 15-minute idle timeout on all remote access gateways.' },
      { control_id: 'AU-2', name: 'Audit Events', status: 'pass', details: 'Authentication, config changes, and alarms all logged', remediation: null },
      { control_id: 'AU-9', name: 'Protection of Audit Information', status: 'warning', details: 'Audit logs retained locally only — no off-site replication', remediation: 'Replicate audit logs to geographically separated SIEM or cold storage within 24 hours.' },
      { control_id: 'CA-7', name: 'Continuous Monitoring', status: 'pass', details: 'Passive OT network monitoring active (Claroty/Dragos)', remediation: null },
      { control_id: 'CM-6', name: 'Configuration Settings', status: 'fail', details: 'No baseline configuration snapshots for PLC ladder logic', remediation: 'Capture and version-control ladder logic backups. Compare against baseline monthly.' },
      { control_id: 'CM-7', name: 'Least Functionality', status: 'warning', details: 'Engineering workstations have internet access', remediation: 'Air-gap or proxy-restrict engineering workstation internet access.' },
      { control_id: 'IA-2', name: 'Identification and Authentication', status: 'pass', details: 'Multi-factor authentication enforced on SCADA HMI logins', remediation: null },
      { control_id: 'IR-4', name: 'Incident Handling', status: 'pass', details: 'ICS incident response playbook tested quarterly', remediation: null },
      { control_id: 'PE-3', name: 'Physical Access Control', status: 'pass', details: 'Mantrap and badge access installed at substation entrance', remediation: null },
      { control_id: 'SC-7', name: 'Boundary Protection', status: 'fail', details: 'DMZ between IT and OT not fully implemented on east segment', remediation: 'Deploy unidirectional security gateway (data diode) at OT/IT boundary east segment.' },
      { control_id: 'SC-8', name: 'Transmission Confidentiality', status: 'fail', details: 'DNP3 traffic unencrypted between RTU and SCADA master', remediation: 'Deploy DNP3-SA (Secure Authentication v5) or wrap in TLS tunnel.' },
      { control_id: 'SI-2', name: 'Flaw Remediation', status: 'warning', details: 'Vendor patch cadence averaging 120 days for field devices', remediation: 'Negotiate SLA with OEM for 30-day critical patch delivery. Compensating controls until patched.' },
    ],
  },
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString()
}

export default function SCADAComplianceReport() {
  const [selectedFramework, setSelectedFramework] = useState('iec_62443')
  const [report, setReport] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [usingMock, setUsingMock] = useState(false)
  const [notif, setNotif] = useState(null)

  const showNotif = (msg) => {
    setNotif(msg)
    setTimeout(() => setNotif(null), 3000)
  }

  const fetchReport = useCallback(async (frameworkId) => {
    setLoading(true)
    setReport(null)
    try {
      const res = await fetch(`/api/ics/compliance/report/${frameworkId}`)
      if (!res.ok) throw new Error('API unavailable')
      const data = await res.json()
      setReport(data)
      setUsingMock(false)
    } catch {
      setReport(MOCK_REPORTS[frameworkId] || null)
      setUsingMock(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReport(selectedFramework)
  }, [selectedFramework, fetchReport])

  const handleFrameworkChange = (e) => {
    setSelectedFramework(e.target.value)
    setStatusFilter('all')
  }

  // Computed stats
  const controls = report?.controls || []
  const passed = controls.filter(c => c.status === 'pass').length
  const failed = controls.filter(c => c.status === 'fail').length
  const warned = controls.filter(c => c.status === 'warning').length
  const total = controls.length
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  const filtered = statusFilter === 'all'
    ? controls
    : controls.filter(c => c.status === statusFilter)

  const failedControls = controls.filter(c => c.status === 'fail' && c.remediation)

  // CSV export
  const exportCSV = () => {
    if (!report || controls.length === 0) {
      showNotif('No report data to export')
      return
    }
    const fw = FRAMEWORKS.find(f => f.id === selectedFramework)?.label || selectedFramework
    const header = 'Control ID,Name,Status,Details,Remediation\n'
    const rows = controls
      .map(c => [
        `"${c.control_id}"`,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${c.status}"`,
        `"${(c.details || '').replace(/"/g, '""')}"`,
        `"${(c.remediation || '').replace(/"/g, '""')}"`,
      ].join(','))
      .join('\n')
    const csv = header + rows
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scada-compliance-${fw.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotif('CSV exported')
  }

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Notification toast */}
      {notif && (
        <div className="fixed top-4 right-4 z-50 bg-amber-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {notif}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">ICS Compliance Report</h1>
          <p className="text-gray-400 text-sm mt-1">
            Control-by-control assessment against industrial cybersecurity frameworks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {usingMock && (
            <span className="text-xs bg-amber-900/50 border border-amber-600/40 text-amber-300 px-2 py-1 rounded">
              Demo data — API offline
            </span>
          )}
          <button
            onClick={exportCSV}
            className="text-xs px-3 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Framework selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Framework:</label>
          <select
            value={selectedFramework}
            onChange={handleFrameworkChange}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-amber-500"
          >
            {FRAMEWORKS.map(fw => (
              <option key={fw.id} value={fw.id}>{fw.label}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`text-xs px-3 py-1.5 rounded transition-colors capitalize ${
                statusFilter === f
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Framework description */}
      {FRAMEWORKS.find(f => f.id === selectedFramework) && (
        <p className="text-xs text-gray-500">
          {FRAMEWORKS.find(f => f.id === selectedFramework).description}
          {report?.generated_at && (
            <span className="ml-3 text-gray-600">Generated {timeAgo(report.generated_at)}</span>
          )}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500" />
        </div>
      ) : (
        <>
          {/* Summary stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total Controls" value={total} />
            <StatCard label="Passed" value={passed} color="text-green-400" />
            <StatCard label="Failed" value={failed} color="text-red-400" />
            <StatCard label="Warnings" value={warned} color="text-yellow-400" />
            <StatCard
              label="Pass Rate"
              value={`${passRate}%`}
              color={passRate >= 80 ? 'text-green-400' : passRate >= 60 ? 'text-yellow-400' : 'text-red-400'}
            />
          </div>

          {/* Progress bar */}
          {total > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Compliance progress</span>
                <span>{passed}/{total} controls passing</span>
              </div>
              <div className="h-3 rounded-full bg-gray-800 overflow-hidden flex">
                <div className="bg-green-500 h-full transition-all" style={{ width: `${(passed / total) * 100}%` }} />
                <div className="bg-yellow-400 h-full transition-all" style={{ width: `${(warned / total) * 100}%` }} />
                <div className="bg-red-500 h-full transition-all" style={{ width: `${(failed / total) * 100}%` }} />
              </div>
              <div className="flex gap-4 mt-1 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Pass</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Warning</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Fail</span>
              </div>
            </div>
          )}

          {/* Control grid / table */}
          <Section title={`Controls (${filtered.length})`}>
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm">No controls match the selected filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                      <th className="pb-2 pr-4">Control ID</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((ctrl, i) => (
                      <tr key={ctrl.control_id || i} className="border-b border-gray-800 hover:bg-gray-900/40">
                        <td className="py-2.5 pr-4 font-mono text-xs text-amber-300 whitespace-nowrap">{ctrl.control_id}</td>
                        <td className="py-2.5 pr-4 font-medium">{ctrl.name}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${statusBadge[ctrl.status] || 'bg-gray-700 text-gray-300'}`}>
                            {(ctrl.status || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 text-xs text-gray-400 max-w-xs">{ctrl.details || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Remediation list — failed controls only */}
          {failedControls.length > 0 && (
            <Section title={`Remediation Required (${failedControls.length})`}>
              <div className="space-y-3">
                {failedControls.map((ctrl, i) => (
                  <div
                    key={ctrl.control_id || i}
                    className="rounded-lg border border-red-700/40 bg-red-950/20 p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded">
                        {ctrl.control_id}
                      </span>
                      <span className="font-semibold text-sm text-white">{ctrl.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-red-700 text-red-100 font-semibold">FAIL</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{ctrl.details}</p>
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-amber-400 font-semibold flex-shrink-0 mt-0.5">Remediation:</span>
                      <p className="text-xs text-gray-300">{ctrl.remediation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  )
}

// --- Shared sub-components ---

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="rounded-lg border border-amber-500/20 bg-gray-900/60 p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-amber-300">{title}</h2>
      {children}
    </div>
  )
}
