import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  CogIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ViewfinderCircleIcon,
  CommandLineIcon,
  GlobeAltIcon,
  CloudIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BoltIcon,
  ServerIcon,
  CubeIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import ToolStatus from '../components/ToolStatus'
import WorkflowProgress from '../components/WorkflowProgress'
import VulnerabilityCard from '../components/VulnerabilityCard'
import { arsenal } from '../api/client'

const SecurityArsenal = () => {
  const { isDarkMode } = useTheme()
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanTarget, setScanTarget] = useState('')
  const [scanType, setScanType] = useState('web_application')
  const [detectedTech, setDetectedTech] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [attackChain, setAttackChain] = useState({})
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [workflowPhases, setWorkflowPhases] = useState([])
  const [activeTab, setActiveTab] = useState('tools')
  const [scanning, setScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState(null)

  // Real scan state
  const [realScanResults, setRealScanResults] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [scanStats, setScanStats] = useState(null)
  const [expandedScan, setExpandedScan] = useState(null)
  const [trivyOptions, setTrivyOptions] = useState({
    scanType: 'fs',
    severityThreshold: 'MEDIUM',
    scanners: ['vuln', 'misconfig', 'secret']
  })
  const [portScanOptions, setPortScanOptions] = useState({
    scanType: 'quick',
    ports: '',
    timeout: 2.0
  })

  // Fetch tool status
  const fetchToolStatus = useCallback(async () => {
    setLoading(true)
    try {
      const response = await arsenal.getToolStatus()
      if (response.tools) {
        setTools(response.tools)
      }
    } catch (error) {
      console.error('Failed to fetch tool status:', error)
      // Use mock data if API not available
      setTools(getMockTools())
    } finally {
      setLoading(false)
    }
  }, [])

  // Detect technologies
  const detectTechnologies = async () => {
    if (!scanTarget) return

    try {
      const response = await arsenal.detectTechnologies(scanTarget)
      if (response.technologies) {
        setDetectedTech(response.technologies)
      }
      if (response.recommendations) {
        setRecommendations(response.recommendations)
      }
    } catch (error) {
      console.error('Technology detection failed:', error)
    }
  }

  // Get attack chain recommendations
  const getAttackChain = async () => {
    try {
      const techNames = detectedTech.map(t => t.name)
      const response = await arsenal.getAttackChain(techNames, scanType)
      if (response.chain) {
        setAttackChain(response.chain)
        // Convert to workflow phases format
        const phases = Object.entries(response.chain).map(([phase, tools]) => ({
          id: phase,
          status: 'pending',
          tools: tools.map(t => ({ name: t.tool_name, status: 'pending' })),
          findings: 0,
          duration: null
        }))
        setWorkflowPhases(phases)
      }
    } catch (error) {
      console.error('Failed to get attack chain:', error)
    }
  }

  // Execute tool
  const executeTool = async (tool) => {
    if (!scanTarget) {
      alert('Please enter a target URL first')
      return
    }

    setScanning(true)
    setScanStatus({ tool: tool.tool_name, status: 'running' })

    try {
      const response = await arsenal.executeTool(tool.tool_id, scanTarget, {})

      if (response.vulnerabilities) {
        setVulnerabilities(prev => [...prev, ...response.vulnerabilities])
      }

      setScanStatus({ tool: tool.tool_name, status: 'completed', results: response })
    } catch (error) {
      console.error('Tool execution failed:', error)
      setScanStatus({ tool: tool.tool_name, status: 'failed', error: error.message })
    } finally {
      setScanning(false)
    }
  }

  // Start full attack chain
  const startAttackChain = async () => {
    if (!scanTarget) {
      alert('Please enter a target URL first')
      return
    }

    setScanning(true)
    setScanStatus({ status: 'running', message: 'Starting attack chain...' })

    // Update phases to show running
    setWorkflowPhases(prev => prev.map((phase, idx) => ({
      ...phase,
      status: idx === 0 ? 'running' : 'pending'
    })))

    // This would typically be a long-running job
    // For now, simulate progress
    try {
      const response = await arsenal.executeAttackChain(
        scanTarget,
        scanType,
        detectedTech.map(t => t.name)
      )

      if (response.findings) {
        setVulnerabilities(response.findings)
      }

      setWorkflowPhases(prev => prev.map(phase => ({
        ...phase,
        status: 'completed'
      })))

      setScanStatus({ status: 'completed', message: 'Attack chain completed' })
    } catch (error) {
      setScanStatus({ status: 'failed', message: error.message })
    } finally {
      setScanning(false)
    }
  }

  // Fetch scan history and stats
  const fetchScanHistory = useCallback(async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        arsenal.getScanHistory(20),
        arsenal.getScanStats()
      ])
      setScanHistory(historyRes.scans || [])
      setScanStats(statsRes)
    } catch (error) {
      console.error('Failed to fetch scan history:', error)
    }
  }, [])

  // Run Trivy scan
  const runTrivyScan = async () => {
    if (!scanTarget) {
      alert('Please enter a target path first')
      return
    }

    setScanning(true)
    setScanStatus({ tool: 'Trivy', status: 'running', message: 'Running container/filesystem vulnerability scan...' })
    setRealScanResults(null)

    try {
      const response = await arsenal.runTrivyScan(scanTarget, trivyOptions)
      setRealScanResults({
        type: 'trivy',
        ...response
      })
      setScanStatus({ tool: 'Trivy', status: 'completed', message: `Scan completed: ${response.summary?.total_vulnerabilities || 0} vulnerabilities found` })

      // Refresh history
      fetchScanHistory()
    } catch (error) {
      console.error('Trivy scan failed:', error)
      setScanStatus({ tool: 'Trivy', status: 'failed', message: error.response?.data?.detail || error.message })
    } finally {
      setScanning(false)
    }
  }

  // Run Port scan
  const runPortScan = async () => {
    if (!scanTarget) {
      alert('Please enter a target IP/hostname first')
      return
    }

    setScanning(true)
    setScanStatus({ tool: 'Port Scanner', status: 'running', message: 'Scanning for open ports...' })
    setRealScanResults(null)

    try {
      const options = {
        ...portScanOptions,
        ports: portScanOptions.ports ? portScanOptions.ports.split(',').map(p => parseInt(p.trim())) : null
      }
      const response = await arsenal.runPortScan(scanTarget, options)
      setRealScanResults({
        type: 'portscan',
        ...response
      })
      setScanStatus({ tool: 'Port Scanner', status: 'completed', message: `Scan completed: ${response.summary?.open_ports || 0} open ports found` })

      // Refresh history
      fetchScanHistory()
    } catch (error) {
      console.error('Port scan failed:', error)
      setScanStatus({ tool: 'Port Scanner', status: 'failed', message: error.response?.data?.detail || error.message })
    } finally {
      setScanning(false)
    }
  }

  // View scan details from history
  const viewScanDetails = async (scanId) => {
    try {
      const response = await arsenal.getScanById(scanId)
      setRealScanResults({
        type: response.scanner_type,
        ...response
      })
      setExpandedScan(scanId)
    } catch (error) {
      console.error('Failed to fetch scan details:', error)
    }
  }

  useEffect(() => {
    fetchToolStatus()
    fetchScanHistory()
  }, [fetchToolStatus, fetchScanHistory])

  // Mock data for demo
  const getMockTools = () => [
    { tool_id: 'nuclei', tool_name: 'Nuclei', is_installed: true, plugin_path: 'plugins/scanner/nuclei', phases: ['vulnerability_scan'], tags: ['vulnerability', 'cve'] },
    { tool_id: 'sqlmap', tool_name: 'SQLMap', is_installed: true, plugin_path: 'plugins/webapp/sqlmap', phases: ['vulnerability_scan', 'exploitation'], tags: ['sqli', 'injection'] },
    { tool_id: 'feroxbuster', tool_name: 'Feroxbuster', is_installed: true, plugin_path: 'plugins/webapp/feroxbuster', phases: ['reconnaissance'], tags: ['discovery', 'fuzzing'] },
    { tool_id: 'dalfox', tool_name: 'Dalfox', is_installed: true, plugin_path: 'plugins/webapp/dalfox', phases: ['vulnerability_scan'], tags: ['xss', 'injection'] },
    { tool_id: 'hydra', tool_name: 'Hydra', is_installed: true, plugin_path: 'plugins/auth/hydra', phases: ['exploitation'], tags: ['brute-force', 'auth'] },
    { tool_id: 'hashcat', tool_name: 'Hashcat', is_installed: false, plugin_path: 'plugins/auth/hashcat', phases: ['post_exploitation'], tags: ['password', 'cracking'] },
    { tool_id: 'prowler', tool_name: 'Prowler', is_installed: false, plugin_path: 'plugins/cloud/prowler', phases: ['vulnerability_scan'], tags: ['aws', 'cloud'] },
    { tool_id: 'trivy', tool_name: 'Trivy', is_installed: true, plugin_path: 'plugins/cloud/trivy', phases: ['vulnerability_scan'], tags: ['container', 'sbom'] },
    { tool_id: 'nmap', tool_name: 'Nmap', is_installed: true, plugin_path: 'plugins/network/nmap', phases: ['reconnaissance'], tags: ['port', 'service'] },
  ]

  // Reusable class helpers
  const cardBg = isDarkMode
    ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-slate-600/50'
    : 'bg-white border-gray-200'
  const inputBg = isDarkMode
    ? 'bg-slate-900/70 border-slate-600 text-white placeholder-slate-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  const selectBg = isDarkMode
    ? 'bg-slate-900/70 border-slate-600 text-white'
    : 'bg-white border-gray-300 text-gray-900'
  const rowBg = isDarkMode
    ? 'bg-slate-900/50 border-slate-700 hover:border-slate-500'
    : 'bg-gray-50 border-gray-200 hover:border-gray-400'
  const labelColor = isDarkMode ? 'text-white' : 'text-gray-900'
  const mutedText = isDarkMode ? 'text-slate-400' : 'text-gray-500'
  const tabInactive = isDarkMode
    ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} p-4 sm:p-6 pb-8`}>
      {/* Header */}
      <div className="relative mb-6 sm:mb-8">
        <div className={isDarkMode ? "absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/15 to-red-500/20 rounded-2xl blur-xl" : "absolute inset-0 bg-gradient-to-r from-red-200/40 via-orange-200/30 to-red-200/40 rounded-2xl blur-xl"}></div>
        <div className={`relative ${isDarkMode ? 'bg-slate-800/60' : 'bg-white/80'} backdrop-blur-sm rounded-2xl border-2 border-red-500/30 p-4 sm:p-6 lg:p-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className={isDarkMode ? 'w-12 h-12 sm:w-14 lg:w-16 sm:h-14 lg:h-16 bg-gradient-to-br from-red-500/40 to-orange-500/40 rounded-xl flex items-center justify-center border-2 border-red-400/60 shadow-lg shadow-red-500/40 animate-pulse flex-shrink-0' : 'w-12 h-12 sm:w-14 lg:w-16 sm:h-14 lg:h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center border-2 border-red-300 shadow-lg shadow-red-200/50 animate-pulse flex-shrink-0'}>
                <ViewfinderCircleIcon className={isDarkMode ? 'w-6 h-6 sm:w-7 lg:w-9 sm:h-7 lg:h-9 text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'w-6 h-6 sm:w-7 lg:w-9 sm:h-7 lg:h-9 text-red-600 drop-shadow-[0_0_4px_rgba(239,68,68,0.3)]'} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                  <span className="relative">
                    <span className={isDarkMode ? "absolute inset-0 bg-gradient-to-r from-red-500/40 via-orange-500/50 to-red-500/40 blur-xl rounded-lg" : "hidden"}></span>
                    <span className={`relative ${isDarkMode ? 'text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gradient-to-r from-red-700 via-orange-600 to-red-700 bg-clip-text text-transparent'}`}>
                      Security Arsenal
                    </span>
                  </span>
                </h1>
                <p className={`mt-1 sm:mt-2 text-xs sm:text-sm lg:text-lg font-medium ${isDarkMode ? 'text-red-200' : 'text-red-600'}`}>
                  Manage security tools and execute attack chains
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Input */}
      <div className={`${cardBg} rounded-xl border-2 shadow-xl p-4 sm:p-6 mb-6`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-cyan-500/25 border-cyan-500/40' : 'bg-cyan-100 border-cyan-300'}`}>
            <ViewfinderCircleIcon className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
          </div>
          <span className={`text-lg font-bold ${labelColor}`}>Target Configuration</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'} uppercase tracking-wider mb-2`}>
              Target URL / IP
            </label>
            <div className="relative">
              <ViewfinderCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="text"
                value={scanTarget}
                onChange={(e) => setScanTarget(e.target.value)}
                placeholder="https://example.com or 192.168.1.1"
                className={`w-full pl-12 pr-4 py-3.5 ${inputBg} border-2 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500/50 transition-all`}
              />
            </div>
          </div>
          <div className="w-full md:w-56">
            <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'} uppercase tracking-wider mb-2`}>
              Target Type
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className={`w-full px-4 py-3.5 ${selectBg} border-2 rounded-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500/50 transition-all cursor-pointer`}
            >
              <option value="web_application">Web Application</option>
              <option value="api">API</option>
              <option value="network">Network</option>
              <option value="cloud">Cloud</option>
              <option value="container">Container</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full md:w-auto">
            <button
              onClick={detectTechnologies}
              disabled={!scanTarget || scanning}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-500' : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'} font-bold rounded-xl border-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Detect Tech
            </button>
            <button
              onClick={startAttackChain}
              disabled={!scanTarget || scanning}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-red-500/80 to-orange-500/80 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl border-2 border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/30"
            >
              {scanning ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <BoltIcon className="w-5 h-5" />
              )}
              Start Attack Chain
            </button>
          </div>
        </div>

        {/* Scan Status */}
        {scanStatus && (
          <div className={`mt-5 p-4 rounded-xl flex items-center gap-3 border-2 ${
            scanStatus.status === 'running' ? (isDarkMode ? 'bg-blue-900/30 border-blue-500/40 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-700') :
            scanStatus.status === 'completed' ? (isDarkMode ? 'bg-green-900/30 border-green-500/40 text-green-300' : 'bg-green-50 border-green-300 text-green-700') :
            (isDarkMode ? 'bg-red-900/30 border-red-500/40 text-red-300' : 'bg-red-50 border-red-300 text-red-700')
          }`}>
            {scanStatus.status === 'running' && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
            {scanStatus.status === 'completed' && <CheckCircleIcon className="w-5 h-5" />}
            {scanStatus.status === 'failed' && <XCircleIcon className="w-5 h-5" />}
            <span className="text-base font-bold">
              {scanStatus.tool ? `${scanStatus.tool}: ` : ''}
              {scanStatus.message || scanStatus.status}
            </span>
          </div>
        )}

        {/* Detected Technologies */}
        {detectedTech.length > 0 && (
          <div className={`mt-5 pt-5 border-t-2 ${isDarkMode ? 'border-slate-600/50' : 'border-gray-200'}`}>
            <h4 className={`text-base font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'} uppercase tracking-wider mb-3`}>
              Detected Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {detectedTech.map((tech, idx) => (
                <span
                  key={idx}
                  className={`px-4 py-2 text-base font-bold rounded-lg border ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-cyan-50 text-cyan-800 border-cyan-200'}`}
                >
                  {tech.name}
                  {tech.version && ` (${tech.version})`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex overflow-x-auto border-b-2 ${isDarkMode ? 'border-slate-600/50' : 'border-gray-200'} mb-6 scrollbar-none`}>
        {[
          { id: 'tools', label: 'Tools', icon: CommandLineIcon },
          { id: 'scans', label: 'Real Scans', icon: MagnifyingGlassIcon },
          { id: 'workflow', label: 'Attack Chain', icon: ViewfinderCircleIcon },
          { id: 'findings', label: 'Findings', icon: ExclamationTriangleIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b-2 font-bold text-sm sm:text-base transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-red-500 text-red-400 bg-red-500/10'
                : tabInactive
            }`}
          >
            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            {tab.label}
            {tab.id === 'findings' && vulnerabilities.length > 0 && (
              <span className={`ml-2 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold rounded-lg border ${isDarkMode ? 'bg-red-500/30 text-red-300 border-red-500/40' : 'bg-red-100 text-red-700 border-red-200'}`}>
                {vulnerabilities.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'tools' && (
          <>
            <div className="w-full">
              <ToolStatus
                tools={tools}
                onRefresh={fetchToolStatus}
                onExecute={executeTool}
                loading={loading}
              />
            </div>
            <div>
              {recommendations.length > 0 && (
                <div className={`${cardBg} rounded-xl shadow-xl border-2 p-5`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-cyan-500/25 border-cyan-500/40' : 'bg-cyan-100 border-cyan-300'}`}>
                      <CogIcon className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    </div>
                    <h3 className={`text-lg font-bold ${labelColor}`}>
                      Recommended Tools
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}
                      >
                        <div className={`font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                          {rec.technology}
                        </div>
                        <div className={`text-base font-medium ${labelColor} mt-2`}>
                          {rec.recommended_tools.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'scans' && (
          <div className="space-y-6">
            {/* Real Scanner Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trivy Scanner */}
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm' : 'bg-white'} rounded-xl border-2 border-cyan-500/30 shadow-xl p-5`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-cyan-500/25 border-cyan-500/40' : 'bg-cyan-100 border-cyan-300'}`}>
                    <CubeIcon className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${labelColor}`}>Trivy Scanner</h3>
                    <p className={`text-sm ${mutedText}`}>Container & Filesystem Vulnerabilities</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'} uppercase tracking-wider mb-2`}>
                      Scan Type
                    </label>
                    <select
                      value={trivyOptions.scanType}
                      onChange={(e) => setTrivyOptions(prev => ({ ...prev, scanType: e.target.value }))}
                      className={`w-full px-4 py-2.5 ${selectBg} border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    >
                      <option value="fs">Filesystem</option>
                      <option value="image">Container Image</option>
                      <option value="repo">Git Repository</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'} uppercase tracking-wider mb-2`}>
                      Severity Threshold
                    </label>
                    <select
                      value={trivyOptions.severityThreshold}
                      onChange={(e) => setTrivyOptions(prev => ({ ...prev, severityThreshold: e.target.value }))}
                      className={`w-full px-4 py-2.5 ${selectBg} border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    >
                      <option value="LOW">Low+</option>
                      <option value="MEDIUM">Medium+</option>
                      <option value="HIGH">High+</option>
                      <option value="CRITICAL">Critical Only</option>
                    </select>
                  </div>

                  <button
                    onClick={runTrivyScan}
                    disabled={!scanTarget || scanning}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg border-2 border-cyan-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {scanning && scanStatus?.tool === 'Trivy' ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                    Run Trivy Scan
                  </button>
                </div>
              </div>

              {/* Port Scanner */}
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm' : 'bg-white'} rounded-xl border-2 border-orange-500/30 shadow-xl p-5`}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-orange-500/25 border-orange-500/40' : 'bg-orange-100 border-orange-300'}`}>
                    <GlobeAltIcon className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${labelColor}`}>Port Scanner</h3>
                    <p className={`text-sm ${mutedText}`}>TCP Port Discovery (Pure Python)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-bold ${isDarkMode ? 'text-orange-300' : 'text-orange-700'} uppercase tracking-wider mb-2`}>
                      Scan Type
                    </label>
                    <select
                      value={portScanOptions.scanType}
                      onChange={(e) => setPortScanOptions(prev => ({ ...prev, scanType: e.target.value }))}
                      className={`w-full px-4 py-2.5 ${selectBg} border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    >
                      <option value="quick">Quick (Top 100 ports)</option>
                      <option value="common">Common (Top 1000 ports)</option>
                      <option value="full">Full (1-65535)</option>
                      <option value="custom">Custom Ports</option>
                    </select>
                  </div>

                  {portScanOptions.scanType === 'custom' && (
                    <div>
                      <label className={`block text-sm font-bold ${isDarkMode ? 'text-orange-300' : 'text-orange-700'} uppercase tracking-wider mb-2`}>
                        Custom Ports (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={portScanOptions.ports}
                        onChange={(e) => setPortScanOptions(prev => ({ ...prev, ports: e.target.value }))}
                        placeholder="22, 80, 443, 8080"
                        className={`w-full px-4 py-2.5 ${inputBg} border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                      />
                    </div>
                  )}

                  <button
                    onClick={runPortScan}
                    disabled={!scanTarget || scanning}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-lg border-2 border-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
                  >
                    {scanning && scanStatus?.tool === 'Port Scanner' ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                    Run Port Scan
                  </button>
                </div>
              </div>
            </div>

            {/* Scan Results */}
            {realScanResults && (
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm' : 'bg-white'} rounded-xl border-2 border-green-500/30 shadow-xl p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-green-500/25 border-green-500/40' : 'bg-green-100 border-green-300'}`}>
                      <CheckCircleIcon className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${labelColor}`}>Scan Results</h3>
                      <p className={`text-sm ${mutedText}`}>
                        {realScanResults.type === 'trivy' ? 'Trivy Vulnerability Scan' : 'Port Scan Results'}
                      </p>
                    </div>
                  </div>
                  {realScanResults.scan_id && (
                    <span className={`text-xs font-mono ${mutedText} ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'} px-2 py-1 rounded`}>
                      ID: {realScanResults.scan_id}
                    </span>
                  )}
                </div>

                {/* Summary */}
                {realScanResults.summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {realScanResults.type === 'trivy' ? (
                      <>
                        <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-red-900/30 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{realScanResults.summary.critical || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-600'} uppercase`}>Critical</div>
                        </div>
                        <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-orange-900/30 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-700'}`}>{realScanResults.summary.high || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-orange-300' : 'text-orange-600'} uppercase`}>High</div>
                        </div>
                        <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>{realScanResults.summary.medium || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} uppercase`}>Medium</div>
                        </div>
                        <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-blue-900/30 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{realScanResults.summary.low || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} uppercase`}>Low</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-green-900/30 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>{realScanResults.summary.open_ports || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-600'} uppercase`}>Open Ports</div>
                        </div>
                        <div className={`${isDarkMode ? 'bg-slate-900/30 border-slate-500/30' : 'bg-gray-100 border-gray-300'} rounded-lg p-3 border`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{realScanResults.summary.closed_ports || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-500'} uppercase`}>Closed</div>
                        </div>
                        <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>{realScanResults.summary.filtered_ports || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} uppercase`}>Filtered</div>
                        </div>
                        <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-cyan-900/30 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'}`}>
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>{realScanResults.summary.total_scanned || 0}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'} uppercase`}>Total Scanned</div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Detailed Results */}
                <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'} rounded-lg p-4 max-h-96 overflow-y-auto`}>
                  {realScanResults.type === 'trivy' && realScanResults.results?.vulnerabilities ? (
                    <div className="space-y-2">
                      {realScanResults.results.vulnerabilities.slice(0, 20).map((vuln, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${
                          vuln.severity === 'CRITICAL' ? (isDarkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200') :
                          vuln.severity === 'HIGH' ? (isDarkMode ? 'bg-orange-900/20 border-orange-500/30' : 'bg-orange-50 border-orange-200') :
                          vuln.severity === 'MEDIUM' ? (isDarkMode ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200') :
                          (isDarkMode ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200')
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`font-bold ${labelColor}`}>{vuln.vulnerability_id || vuln.VulnerabilityID}</span>
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded font-bold ${
                                vuln.severity === 'CRITICAL' ? (isDarkMode ? 'bg-red-500/30 text-red-300' : 'bg-red-100 text-red-800') :
                                vuln.severity === 'HIGH' ? (isDarkMode ? 'bg-orange-500/30 text-orange-300' : 'bg-orange-100 text-orange-800') :
                                vuln.severity === 'MEDIUM' ? (isDarkMode ? 'bg-yellow-500/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                                (isDarkMode ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-800')
                              }`}>
                                {vuln.severity || vuln.Severity}
                              </span>
                            </div>
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} mt-1`}>{vuln.pkg_name || vuln.PkgName}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mt-1 line-clamp-2`}>{vuln.title || vuln.Title}</div>
                        </div>
                      ))}
                      {realScanResults.results.vulnerabilities.length > 20 && (
                        <div className={`text-center ${mutedText} py-2`}>
                          ... and {realScanResults.results.vulnerabilities.length - 20} more
                        </div>
                      )}
                    </div>
                  ) : realScanResults.type === 'portscan' && realScanResults.results?.open_ports ? (
                    <div className="space-y-2">
                      {realScanResults.results.open_ports.map((port, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`font-bold ${labelColor} text-lg`}>{port.port}</span>
                              <span className={`ml-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>/{port.protocol || 'tcp'}</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-sm font-bold ${isDarkMode ? 'bg-green-500/30 text-green-300' : 'bg-green-100 text-green-700'}`}>
                              {port.state || 'open'}
                            </span>
                          </div>
                          {port.service && (
                            <div className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'} mt-1`}>
                              Service: {port.service}
                            </div>
                          )}
                          {port.banner && (
                            <div className={`text-xs ${mutedText} mt-1 font-mono ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'} p-2 rounded`}>
                              {port.banner}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} overflow-x-auto`}>
                      {JSON.stringify(realScanResults.results || realScanResults, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Scan History */}
            <div className={`${cardBg} rounded-xl border-2 shadow-xl p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isDarkMode ? 'bg-purple-500/25 border-purple-500/40' : 'bg-purple-100 border-purple-300'}`}>
                    <ClockIcon className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${labelColor}`}>Scan History</h3>
                    <p className={`text-sm ${mutedText}`}>
                      {scanStats ? `${scanStats.total_scans || 0} total scans` : 'Recent scans'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchScanHistory}
                  className={`p-2 ${mutedText} hover:text-${isDarkMode ? 'white' : 'gray-900'} transition-colors`}
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>

              {scanHistory.length > 0 ? (
                <div className="space-y-2">
                  {scanHistory.map((scan) => (
                    <div
                      key={scan.scan_id}
                      className={`p-3 ${rowBg} rounded-lg border transition-all cursor-pointer`}
                      onClick={() => viewScanDetails(scan.scan_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {scan.scanner_type === 'trivy' ? (
                            <CubeIcon className="w-5 h-5 text-cyan-400" />
                          ) : (
                            <GlobeAltIcon className="w-5 h-5 text-orange-400" />
                          )}
                          <div>
                            <div className={`font-bold ${labelColor}`}>{scan.scanner_type}</div>
                            <div className={`text-sm ${mutedText} truncate max-w-xs`}>{scan.target}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold ${
                            scan.status === 'completed' ? 'text-green-400' :
                            scan.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {scan.status}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} flex items-center gap-1`}>
                            <ClockIcon className="w-3 h-3" />
                            {new Date(scan.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {scan.total_findings > 0 && (
                        <div className="flex gap-2 mt-2">
                          {scan.critical_findings > 0 && (
                            <span className={`px-2 py-0.5 text-xs rounded ${isDarkMode ? 'bg-red-500/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
                              {scan.critical_findings} Critical
                            </span>
                          )}
                          {scan.high_findings > 0 && (
                            <span className={`px-2 py-0.5 text-xs rounded ${isDarkMode ? 'bg-orange-500/30 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                              {scan.high_findings} High
                            </span>
                          )}
                          {scan.medium_findings > 0 && (
                            <span className={`px-2 py-0.5 text-xs rounded ${isDarkMode ? 'bg-yellow-500/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                              {scan.medium_findings} Medium
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${mutedText}`}>
                  <ClockIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No scan history yet. Run a scan to see results here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="w-full">
            <WorkflowProgress
              phases={workflowPhases}
              onPhaseClick={(phase) => console.log('Phase clicked:', phase)}
              showDetails={true}
            />
          </div>
        )}

        {activeTab === 'findings' && (
          <div className="w-full">
            {vulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {vulnerabilities.map((vuln, idx) => (
                  <VulnerabilityCard
                    key={idx}
                    vulnerability={vuln}
                    onCreateTicket={(v) => console.log('Create ticket for:', v)}
                    onGeneratePoc={(v) => console.log('Generate PoC for:', v)}
                  />
                ))}
              </div>
            ) : (
              <div className={`${cardBg} rounded-xl border-2 p-16 text-center`}>
                <div className={`w-20 h-20 ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-100 border-gray-300'} rounded-full flex items-center justify-center mx-auto mb-6 border-2`}>
                  <InformationCircleIcon className={`w-10 h-10 ${mutedText}`} />
                </div>
                <h3 className={`text-2xl font-bold ${labelColor} mb-3`}>
                  No Findings Yet
                </h3>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} max-w-md mx-auto`}>
                  Run security scans to discover vulnerabilities. Start by entering a target and running the attack chain.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SecurityArsenal
