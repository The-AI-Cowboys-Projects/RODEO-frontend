import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  ShieldCheckIcon,
  EyeSlashIcon,
  DocumentMagnifyingGlassIcon,
  ScaleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  UserIcon,
  GlobeEuropeAfricaIcon,
  BuildingOffice2Icon,
  HeartIcon,
  SparklesIcon,
  DocumentArrowUpIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import {
  ShieldCheckIcon as ShieldCheckSolid,
  EyeSlashIcon as EyeSlashSolid,
} from '@heroicons/react/24/solid'

const API_BASE = '/api/privacy'

/**
 * Privacy Dashboard
 * PII detection, data anonymization, and compliance checking
 */
export default function PrivacyDashboard() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // API data
  const [status, setStatus] = useState(null)
  const [piiTypes, setPiiTypes] = useState([])
  const [methods, setMethods] = useState([])
  const [frameworks, setFrameworks] = useState([])

  // Scanner state
  const [scanData, setScanData] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(false)

  // Anonymization state
  const [anonData, setAnonData] = useState('')
  const [anonMethod, setAnonMethod] = useState('pseudonymize')
  const [anonResult, setAnonResult] = useState(null)
  const [anonymizing, setAnonymizing] = useState(false)

  // Compliance state
  const [complianceData, setComplianceData] = useState('')
  const [complianceFramework, setComplianceFramework] = useState('gdpr')
  const [complianceOptions, setComplianceOptions] = useState({
    has_consent: false,
    has_purpose_limitation: false,
    has_retention_policy: false,
    has_privacy_notice: false,
    has_opt_out: false,
  })
  const [complianceResult, setComplianceResult] = useState(null)
  const [checking, setChecking] = useState(false)

  // Test data
  const [testResult, setTestResult] = useState(null)

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rodeo_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const headers = getAuthHeaders()

        const [statusRes, typesRes, methodsRes, frameworksRes] = await Promise.all([
          fetch(`${API_BASE}/status`, { headers }),
          fetch(`${API_BASE}/pii-types`, { headers }),
          fetch(`${API_BASE}/methods`, { headers }),
          fetch(`${API_BASE}/frameworks`, { headers }),
        ])

        if (statusRes.ok) setStatus(await statusRes.json())
        if (typesRes.ok) {
          const data = await typesRes.json()
          setPiiTypes(data.pii_types || [])
        }
        if (methodsRes.ok) {
          const data = await methodsRes.json()
          setMethods(data.methods || [])
        }
        if (frameworksRes.ok) {
          const data = await frameworksRes.json()
          setFrameworks(data.frameworks || [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [getAuthHeaders])

  // Run test with sample data
  const runTest = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/test`, { headers: getAuthHeaders() })
      if (res.ok) {
        setTestResult(await res.json())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Scan for PII
  const handleScan = async () => {
    if (!scanData.trim()) return
    setScanning(true)
    setScanResult(null)
    try {
      let data
      try {
        data = JSON.parse(scanData)
        if (!Array.isArray(data)) data = [data]
      } catch {
        setError('Invalid JSON. Please enter valid JSON array or object.')
        setScanning(false)
        return
      }

      const res = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ data }),
      })

      if (res.ok) {
        const result = await res.json()
        setScanResult(result)
      } else {
        const err = await res.json()
        setError(err.detail || 'Scan failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  // Anonymize data
  const handleAnonymize = async () => {
    if (!anonData.trim()) return
    setAnonymizing(true)
    setAnonResult(null)
    try {
      let data
      try {
        data = JSON.parse(anonData)
        if (!Array.isArray(data)) data = [data]
      } catch {
        setError('Invalid JSON. Please enter valid JSON array or object.')
        setAnonymizing(false)
        return
      }

      const res = await fetch(`${API_BASE}/anonymize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ data, method: anonMethod }),
      })

      if (res.ok) {
        const result = await res.json()
        setAnonResult(result)
      } else {
        const err = await res.json()
        setError(err.detail || 'Anonymization failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setAnonymizing(false)
    }
  }

  // Check compliance
  const handleComplianceCheck = async () => {
    if (!complianceData.trim()) return
    setChecking(true)
    setComplianceResult(null)
    try {
      let data
      try {
        data = JSON.parse(complianceData)
        if (!Array.isArray(data)) data = [data]
      } catch {
        setError('Invalid JSON. Please enter valid JSON array or object.')
        setChecking(false)
        return
      }

      const res = await fetch(`${API_BASE}/compliance/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          data,
          framework: complianceFramework,
          ...complianceOptions,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        setComplianceResult(result)
      } else {
        const err = await res.json()
        setError(err.detail || 'Compliance check failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setChecking(false)
    }
  }

  // Sample data for quick testing
  const sampleData = JSON.stringify([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
      ssn: "123-45-6789",
      notes: "Customer since 2020"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@company.org",
      phone: "555-987-6543",
      ssn: "987-65-4321",
      notes: "VIP customer"
    }
  ], null, 2)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
    { id: 'scanner', label: 'PII Scanner', icon: DocumentMagnifyingGlassIcon },
    { id: 'anonymize', label: 'Anonymization', icon: EyeSlashIcon },
    { id: 'compliance', label: 'Compliance', icon: ScaleIcon },
  ]

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getRiskBg = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-500/10 border-red-500/30'
      case 'high': return 'bg-orange-500/10 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/30'
      case 'low': return 'bg-green-500/10 border-green-500/30'
      default: return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-purple-100 to-pink-100'}`}>
              <ShieldCheckSolid className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Privacy & Data Protection
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                PII detection, anonymization, and compliance checking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status?.status === 'operational' && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Operational
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-500 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <DocumentMagnifyingGlassIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>PII Types</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {piiTypes.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <EyeSlashIcon className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Anonymization Methods</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {methods.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ScaleIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Frameworks</p>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {frameworks.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/10">
                    <SparklesIcon className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Status</p>
                    <p className={`text-2xl font-bold ${status?.status === 'operational' ? 'text-green-500' : 'text-red-500'}`}>
                      {status?.status || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Test */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quick Test
                </h2>
                <div className="flex items-center gap-2">
                  {testResult && (
                    <button
                      onClick={() => setTestResult(null)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={runTest}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 transition-colors"
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Run Test
                  </button>
                </div>
              </div>

              {testResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* PII Detection */}
                  <button
                    onClick={() => setActiveTab('scanner')}
                    className={`w-full p-4 rounded-lg border text-left transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${getRiskBg(testResult.pii_detection?.risk_level)}`}
                  >
                    <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      PII Detection
                    </h3>
                    <p className={`text-3xl font-bold ${getRiskColor(testResult.pii_detection?.risk_level)}`}>
                      {testResult.pii_detection?.total_pii || 0}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      PII instances found
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {testResult.pii_detection?.types_found?.map((type) => (
                        <span key={type} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      Click to scan your data →
                    </p>
                  </button>

                  {/* Anonymization */}
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                    <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Anonymization
                    </h3>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {testResult.anonymization?.method || 'N/A'}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {testResult.anonymization?.columns_modified?.length || 0} columns modified
                    </p>
                    {testResult.anonymization?.sample_anonymized && (
                      <pre className={`mt-2 p-2 rounded text-xs overflow-auto max-h-24 ${isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'}`}>
                        {JSON.stringify(testResult.anonymization.sample_anonymized, null, 2)}
                      </pre>
                    )}
                  </div>

                  {/* GDPR Compliance */}
                  <div className={`p-4 rounded-lg border ${testResult.gdpr_compliance?.compliant ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      GDPR Compliance
                    </h3>
                    <div className="flex items-center gap-2">
                      {testResult.gdpr_compliance?.compliant ? (
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-8 h-8 text-red-500" />
                      )}
                      <span className={`text-2xl font-bold ${testResult.gdpr_compliance?.compliant ? 'text-green-500' : 'text-red-500'}`}>
                        {testResult.gdpr_compliance?.score || 0}%
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {testResult.gdpr_compliance?.compliant ? 'Compliant' : 'Non-compliant'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Supported PII Types */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Supported PII Types
              </h2>
              <div className="flex flex-wrap gap-2">
                {piiTypes.map((item, idx) => (
                  <span
                    key={item?.type || idx}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      isDarkMode
                        ? 'bg-slate-700 text-slate-300 border border-slate-600'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    {typeof item === 'object' ? item.name : item}
                  </span>
                ))}
              </div>
            </div>

            {/* Compliance Frameworks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {frameworks.map((fw) => (
                <div
                  key={fw.id}
                  className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {fw.id === 'gdpr' && <GlobeEuropeAfricaIcon className="w-8 h-8 text-blue-500" />}
                    {fw.id === 'ccpa' && <BuildingOffice2Icon className="w-8 h-8 text-orange-500" />}
                    {fw.id === 'hipaa' && <HeartIcon className="w-8 h-8 text-red-500" />}
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {fw.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {fw.region}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {fw.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PII Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  PII Scanner
                </h2>
                <button
                  onClick={() => setScanData(sampleData)}
                  className={`text-sm ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  Load Sample Data
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Data to Scan (JSON)
                  </label>
                  <textarea
                    value={scanData}
                    onChange={(e) => setScanData(e.target.value)}
                    placeholder='[{"name": "John Doe", "email": "john@example.com"}]'
                    rows={8}
                    className={`w-full px-4 py-3 rounded-lg border font-mono text-sm ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <button
                  onClick={handleScan}
                  disabled={scanning || !scanData.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                >
                  {scanning ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  )}
                  {scanning ? 'Scanning...' : 'Scan for PII'}
                </button>
              </div>
            </div>

            {/* Scan Results */}
            {scanResult && (
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Scan Results
                </h2>

                {scanResult.success && scanResult.report && (
                  <div className="space-y-4">
                    {/* Risk Level */}
                    <div className={`p-4 rounded-lg border ${getRiskBg(scanResult.report.risk_level)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Risk Level</p>
                          <p className={`text-2xl font-bold capitalize ${getRiskColor(scanResult.report.risk_level)}`}>
                            {scanResult.report.risk_level}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total PII Found</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {scanResult.report.total_pii_count}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PII by Type */}
                    {Object.keys(scanResult.report.pii_by_type || {}).length > 0 && (
                      <div>
                        <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          PII by Type
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(scanResult.report.pii_by_type).map(([type, count]) => (
                            <span
                              key={type}
                              className={`px-3 py-1.5 rounded-lg text-sm ${
                                isDarkMode
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : 'bg-purple-100 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {type}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {scanResult.report.recommendations?.length > 0 && (
                      <div>
                        <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {scanResult.report.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                {rec}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Anonymization Tab */}
        {activeTab === 'anonymize' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Data Anonymization
                </h2>
                <button
                  onClick={() => setAnonData(sampleData)}
                  className={`text-sm ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  Load Sample Data
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Data to Anonymize (JSON)
                  </label>
                  <textarea
                    value={anonData}
                    onChange={(e) => setAnonData(e.target.value)}
                    placeholder='[{"name": "John Doe", "email": "john@example.com"}]'
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg border font-mono text-sm ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Anonymization Method
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: 'pseudonymize', label: 'Pseudonymize', desc: 'Hash values' },
                      { id: 'mask', label: 'Mask', desc: 'Replace with ***' },
                      { id: 'k_anonymity', label: 'K-Anonymity', desc: 'Group similar' },
                      { id: 'noise', label: 'Add Noise', desc: 'Differential privacy' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setAnonMethod(method.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          anonMethod === method.id
                            ? isDarkMode
                              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                              : 'bg-purple-100 border-purple-500 text-purple-700'
                            : isDarkMode
                              ? 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">{method.label}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {method.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAnonymize}
                  disabled={anonymizing || !anonData.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                >
                  {anonymizing ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <EyeSlashSolid className="w-5 h-5" />
                  )}
                  {anonymizing ? 'Anonymizing...' : 'Anonymize Data'}
                </button>
              </div>
            </div>

            {/* Anonymization Results */}
            {anonResult && (
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Anonymization Results
                </h2>

                {anonResult.success && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Method</p>
                        <p className={`text-lg font-semibold capitalize ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                          {anonResult.result?.method}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Columns Modified</p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {anonResult.result?.columns_modified?.length || 0}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Records Modified</p>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {anonResult.result?.records_modified || 0}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Anonymized Data
                      </h3>
                      <pre className={`p-4 rounded-lg overflow-auto max-h-64 text-sm font-mono ${
                        isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {JSON.stringify(anonResult.anonymized_data, null, 2)}
                      </pre>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(anonResult.anonymized_data, null, 2))
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <ClipboardDocumentIcon className="w-5 h-5" />
                      Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Compliance Checker
                </h2>
                <button
                  onClick={() => setComplianceData(sampleData)}
                  className={`text-sm ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
                >
                  Load Sample Data
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Data to Check (JSON)
                  </label>
                  <textarea
                    value={complianceData}
                    onChange={(e) => setComplianceData(e.target.value)}
                    placeholder='[{"name": "John Doe", "email": "john@example.com"}]'
                    rows={6}
                    className={`w-full px-4 py-3 rounded-lg border font-mono text-sm ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Compliance Framework
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {frameworks.map((fw) => (
                      <button
                        key={fw.id}
                        onClick={() => setComplianceFramework(fw.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          complianceFramework === fw.id
                            ? isDarkMode
                              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                              : 'bg-purple-100 border-purple-500 text-purple-700'
                            : isDarkMode
                              ? 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {fw.id === 'gdpr' && <GlobeEuropeAfricaIcon className="w-5 h-5 text-blue-500" />}
                          {fw.id === 'ccpa' && <BuildingOffice2Icon className="w-5 h-5 text-orange-500" />}
                          {fw.id === 'hipaa' && <HeartIcon className="w-5 h-5 text-red-500" />}
                          <span className="font-medium">{fw.id.toUpperCase()}</span>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {fw.region}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compliance Options */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Compliance Context
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { key: 'has_consent', label: 'Consent Obtained', frameworks: ['gdpr'] },
                      { key: 'has_purpose_limitation', label: 'Purpose Limited', frameworks: ['gdpr'] },
                      { key: 'has_retention_policy', label: 'Retention Policy', frameworks: ['gdpr'] },
                      { key: 'has_privacy_notice', label: 'Privacy Notice', frameworks: ['ccpa'] },
                      { key: 'has_opt_out', label: 'Opt-Out Available', frameworks: ['ccpa'] },
                    ].filter(opt => opt.frameworks.includes(complianceFramework) || complianceFramework === 'hipaa').map((opt) => (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          complianceOptions[opt.key]
                            ? isDarkMode
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-green-50 border-green-200'
                            : isDarkMode
                              ? 'bg-slate-700/50 border-slate-600'
                              : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={complianceOptions[opt.key]}
                          onChange={(e) => setComplianceOptions(prev => ({
                            ...prev,
                            [opt.key]: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleComplianceCheck}
                  disabled={checking || !complianceData.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                >
                  {checking ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <ScaleIcon className="w-5 h-5" />
                  )}
                  {checking ? 'Checking...' : 'Check Compliance'}
                </button>
              </div>
            </div>

            {/* Compliance Results */}
            {complianceResult && (
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Compliance Report
                </h2>

                {complianceResult.success && complianceResult.report && (
                  <div className="space-y-4">
                    {/* Score and Status */}
                    <div className={`p-6 rounded-lg border ${complianceResult.report.compliant ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {complianceResult.report.compliant ? (
                            <CheckCircleIcon className="w-12 h-12 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-12 h-12 text-red-500" />
                          )}
                          <div>
                            <p className={`text-3xl font-bold ${complianceResult.report.compliant ? 'text-green-500' : 'text-red-500'}`}>
                              {complianceResult.report.score}%
                            </p>
                            <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                              {complianceResult.report.compliant ? 'Compliant' : 'Non-Compliant'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Framework</p>
                          <p className={`text-xl font-semibold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {complianceResult.report.framework}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Findings */}
                    {complianceResult.report.findings?.length > 0 && (
                      <div>
                        <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Findings
                        </h3>
                        <ul className="space-y-2">
                          {complianceResult.report.findings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                {finding}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Required Actions */}
                    {complianceResult.report.required_actions?.length > 0 && (
                      <div>
                        <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Required Actions
                        </h3>
                        <ul className="space-y-2">
                          {complianceResult.report.required_actions.map((action, idx) => (
                            <li key={idx} className={`flex items-start gap-2 p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                                {action}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
