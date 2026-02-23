import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { threatIntel } from '../api/client'
import {
  MagnifyingGlassIcon,
  CogIcon,
  ClockIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

const HISTORY_KEY = 'rodeo_ti_history'
const MAX_HISTORY = 50

function detectHashType(hash) {
  const h = hash.trim()
  if (h.length === 32) return 'MD5'
  if (h.length === 40) return 'SHA1'
  if (h.length === 64) return 'SHA256'
  return null
}

function isValidHash(hash) {
  return /^[0-9a-fA-F]+$/.test(hash.trim()) && detectHashType(hash) !== null
}

function formatTimestamp(ts) {
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return ts
  }
}

export default function ThreatIntelPage() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('lookup')
  const [notification, setNotification] = useState(null)

  // Lookup state
  const [hashInput, setHashInput] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupHistory, setLookupHistory] = useState([])
  const [expandedHistoryId, setExpandedHistoryId] = useState(null)

  // Config state
  const [config, setConfig] = useState({
    configured: false,
    enable_virustotal: true,
    enable_malwarebazaar: true,
    virustotal_configured: false,
    malwarebazaar_configured: false,
    auto_lookup_on_upload: false,
    cache_results: true,
  })
  const [configForm, setConfigForm] = useState({
    virustotal_api_key: '',
    malwarebazaar_api_key: '',
    enable_virustotal: true,
    enable_malwarebazaar: true,
    auto_lookup_on_upload: false,
    cache_results: true,
  })
  const [showVTKey, setShowVTKey] = useState(false)
  const [showMBKey, setShowMBKey] = useState(false)
  const [configLoading, setConfigLoading] = useState(true)
  const [saveLoading, setSaveLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)

  const showNotif = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Load config and history on mount
  useEffect(() => {
    loadConfig()
    loadHistory()
  }, [])

  const loadConfig = async () => {
    setConfigLoading(true)
    try {
      const data = await threatIntel.getConfig()
      setConfig(data)
      setConfigForm((prev) => ({
        ...prev,
        enable_virustotal: data.enable_virustotal ?? true,
        enable_malwarebazaar: data.enable_malwarebazaar ?? true,
        auto_lookup_on_upload: data.auto_lookup_on_upload ?? false,
        cache_results: data.cache_results ?? true,
        // Never pre-fill key fields — backend never sends them
        virustotal_api_key: '',
        malwarebazaar_api_key: '',
      }))
    } catch {
      // Backend unavailable — use defaults
    } finally {
      setConfigLoading(false)
    }
  }

  const loadHistory = () => {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY)
      if (raw) setLookupHistory(JSON.parse(raw))
    } catch {
      // Ignore parse errors
    }
  }

  const saveHistory = (newHistory) => {
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    } catch {
      // Ignore storage errors
    }
  }

  const handleLookup = async () => {
    const hash = hashInput.trim()
    if (!hash) {
      showNotif('Please enter a hash value.', 'error')
      return
    }
    if (!isValidHash(hash)) {
      showNotif('Invalid hash. Please enter a valid MD5 (32), SHA1 (40), or SHA256 (64) hex string.', 'error')
      return
    }
    setLookupLoading(true)
    setLookupResult(null)
    try {
      const result = await threatIntel.lookup(hash)
      setLookupResult({ hash, type: detectHashType(hash), ...result })
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        hash,
        type: detectHashType(hash),
        result,
      }
      const newHistory = [entry, ...lookupHistory].slice(0, MAX_HISTORY)
      setLookupHistory(newHistory)
      saveHistory(newHistory)
      showNotif('Lookup completed successfully.')
    } catch (err) {
      showNotif(err?.response?.data?.detail || 'Lookup failed. Please try again.', 'error')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleSaveConfig = async () => {
    setSaveLoading(true)
    try {
      await threatIntel.saveConfig(configForm)
      showNotif('Configuration saved successfully.')
      loadConfig()
    } catch (err) {
      showNotif(err?.response?.data?.detail || 'Failed to save configuration.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTestLoading(true)
    setTestResults(null)
    try {
      const result = await threatIntel.testConnection()
      setTestResults(result)
      if (result.success) {
        showNotif('Connection test successful.')
      } else {
        showNotif('Some connections failed. Check details below.', 'info')
      }
    } catch (err) {
      showNotif(err?.response?.data?.detail || 'Connection test failed.', 'error')
    } finally {
      setTestLoading(false)
    }
  }

  const handleDeleteConfig = async () => {
    if (!window.confirm('Are you sure you want to delete all threat intelligence configuration? This cannot be undone.')) return
    try {
      await threatIntel.deleteConfig()
      showNotif('Configuration deleted.')
      loadConfig()
      setTestResults(null)
    } catch (err) {
      showNotif(err?.response?.data?.detail || 'Failed to delete configuration.', 'error')
    }
  }

  const handleClearHistory = () => {
    setLookupHistory([])
    setExpandedHistoryId(null)
    sessionStorage.removeItem(HISTORY_KEY)
    showNotif('History cleared.')
  }

  // Severity level from VT detection count
  const getVTSeverity = (positives, total) => {
    if (!total) return { label: 'Unknown', color: 'text-gray-400' }
    const ratio = positives / total
    if (positives === 0) return { label: 'Clean', color: 'text-green-400' }
    if (ratio < 0.05) return { label: 'Low', color: 'text-blue-400' }
    if (ratio < 0.2) return { label: 'Medium', color: 'text-yellow-400' }
    if (ratio < 0.5) return { label: 'High', color: 'text-orange-400' }
    return { label: 'Critical', color: 'text-red-400' }
  }

  const cardClass = `${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border p-4`
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-colors ${
    isDarkMode
      ? 'bg-slate-900 border-slate-600 text-white placeholder-gray-500'
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`

  const tabs = [
    { id: 'lookup', label: 'Lookup', icon: MagnifyingGlassIcon },
    { id: 'configuration', label: 'Configuration', icon: CogIcon },
    { id: 'history', label: 'History', icon: ClockIcon },
  ]

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/20 flex-shrink-0">
            <ShieldCheckIcon className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Threat Intelligence
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Hash lookups and threat feed configuration
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Config Status */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Config Status</p>
                <div className="mt-1">
                  {config.configured ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                      <XCircleIcon className="w-3.5 h-3.5" />
                      Not Configured
                    </span>
                  )}
                </div>
              </div>
              <ShieldCheckIcon className={`w-8 h-8 ${config.configured ? 'text-green-500' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* VirusTotal */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>VirusTotal</p>
                <div className="mt-1">
                  {config.virustotal_configured ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                      <XCircleIcon className="w-3.5 h-3.5" />
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
              <ShieldExclamationIcon className={`w-8 h-8 ${config.virustotal_configured ? 'text-blue-500' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* MalwareBazaar */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>MalwareBazaar</p>
                <div className="mt-1">
                  {config.malwarebazaar_configured ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                      <XCircleIcon className="w-3.5 h-3.5" />
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
              <ShieldExclamationIcon className={`w-8 h-8 ${config.malwarebazaar_configured ? 'text-orange-500' : 'text-gray-500'}`} />
            </div>
          </div>

          {/* Lookups */}
          <div className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lookups</p>
                <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {lookupHistory.length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className={`flex gap-2 border-b mb-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'border-purple-500 text-purple-400'
                    : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* --- LOOKUP TAB --- */}
        {activeTab === 'lookup' && (
          <div className="space-y-6">
            {/* Search Input */}
            <div className={cardClass}>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Hash Value
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !lookupLoading && handleLookup()}
                    placeholder="Enter SHA256, SHA1, or MD5 hash..."
                    className={`${inputClass} pl-10 font-mono`}
                  />
                </div>
                <button
                  onClick={handleLookup}
                  disabled={lookupLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                >
                  {lookupLoading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      Lookup
                    </>
                  )}
                </button>
              </div>
              <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Supports MD5 (32 chars), SHA1 (40 chars), SHA256 (64 chars) hex strings
              </p>
            </div>

            {/* Loading spinner */}
            {lookupLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )}

            {/* Results */}
            {lookupResult && !lookupLoading && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Results
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    {lookupResult.type}
                  </span>
                  <span className={`text-xs font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {lookupResult.hash}
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* VirusTotal Card */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>VirusTotal</h3>
                    </div>
                    {lookupResult.virustotal ? (
                      (() => {
                        const vt = lookupResult.virustotal
                        const positives = vt.positives ?? vt.malicious ?? 0
                        const total = vt.total ?? vt.total_engines ?? 0
                        const severity = getVTSeverity(positives, total)
                        return (
                          <div className="space-y-3">
                            {/* Detection ratio */}
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Detection Ratio</span>
                              <span className={`text-2xl font-bold ${severity.color}`}>
                                {positives}/{total}
                              </span>
                            </div>
                            {/* Severity badge */}
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Severity</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                severity.label === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                severity.label === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                severity.label === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                severity.label === 'Low' ? 'bg-blue-500/20 text-blue-400' :
                                severity.label === 'Clean' ? 'bg-green-500/20 text-green-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {severity.label}
                              </span>
                            </div>
                            {/* Progress bar */}
                            {total > 0 && (
                              <div>
                                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      positives === 0 ? 'bg-green-500' :
                                      positives / total < 0.2 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min((positives / total) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {vt.file_type && (
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>File Type</span>
                                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{vt.file_type}</span>
                              </div>
                            )}
                            {vt.scan_date && (
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Analysis</span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {formatTimestamp(vt.scan_date)}
                                </span>
                              </div>
                            )}
                            {Array.isArray(vt.tags) && vt.tags.length > 0 && (
                              <div>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tags</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {vt.tags.map((tag, i) => (
                                    <span key={i} className={`px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <XCircleIcon className="w-5 h-5" />
                        <span className="text-sm">No VirusTotal data available</span>
                      </div>
                    )}
                  </div>

                  {/* MalwareBazaar Card */}
                  <div className={cardClass}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>MalwareBazaar</h3>
                    </div>
                    {lookupResult.malwarebazaar ? (
                      (() => {
                        const mb = lookupResult.malwarebazaar
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                mb.query_status === 'ok'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {mb.query_status || 'Unknown'}
                              </span>
                            </div>
                            {mb.first_seen && (
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>First Seen</span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {formatTimestamp(mb.first_seen)}
                                </span>
                              </div>
                            )}
                            {mb.reporter && (
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reporter</span>
                                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{mb.reporter}</span>
                              </div>
                            )}
                            {mb.signature && (
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Signature</span>
                                <span className={`text-sm font-medium text-orange-400`}>{mb.signature}</span>
                              </div>
                            )}
                            {mb.file_type && (
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>File Type</span>
                                <span className={`text-sm font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{mb.file_type}</span>
                              </div>
                            )}
                            {Array.isArray(mb.tags) && mb.tags.length > 0 && (
                              <div>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tags</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {mb.tags.map((tag, i) => (
                                    <span key={i} className={`px-2 py-0.5 rounded text-xs ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })()
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <XCircleIcon className="w-5 h-5" />
                        <span className="text-sm">No MalwareBazaar data available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!lookupResult && !lookupLoading && (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <MagnifyingGlassIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter a hash above to look up threat intelligence
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- CONFIGURATION TAB --- */}
        {activeTab === 'configuration' && (
          <div className="space-y-6">
            {configLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* API Keys Form */}
                <div className={cardClass}>
                  <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    API Keys
                  </h2>
                  <div className="space-y-4">
                    {/* VirusTotal Key */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        VirusTotal API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showVTKey ? 'text' : 'password'}
                          value={configForm.virustotal_api_key}
                          onChange={(e) => setConfigForm((p) => ({ ...p, virustotal_api_key: e.target.value }))}
                          placeholder={config.virustotal_configured ? 'Key configured — enter new key to update' : 'Enter your VirusTotal API key...'}
                          className={`${inputClass} pr-10 font-mono`}
                        />
                        <button
                          onClick={() => setShowVTKey((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showVTKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>
                      {config.virustotal_configured && (
                        <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Key is currently configured
                        </p>
                      )}
                    </div>

                    {/* MalwareBazaar Key */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        MalwareBazaar API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showMBKey ? 'text' : 'password'}
                          value={configForm.malwarebazaar_api_key}
                          onChange={(e) => setConfigForm((p) => ({ ...p, malwarebazaar_api_key: e.target.value }))}
                          placeholder={config.malwarebazaar_configured ? 'Key configured — enter new key to update' : 'Enter your MalwareBazaar API key...'}
                          className={`${inputClass} pr-10 font-mono`}
                        />
                        <button
                          onClick={() => setShowMBKey((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showMBKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>
                      {config.malwarebazaar_configured && (
                        <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                          <CheckCircleIcon className="w-3.5 h-3.5" /> Key is currently configured
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className={cardClass}>
                  <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Options
                  </h2>
                  <div className="space-y-3">
                    {[
                      { key: 'enable_virustotal', label: 'Enable VirusTotal', desc: 'Include VirusTotal results in hash lookups' },
                      { key: 'enable_malwarebazaar', label: 'Enable MalwareBazaar', desc: 'Include MalwareBazaar results in hash lookups' },
                      { key: 'auto_lookup_on_upload', label: 'Auto Lookup on Upload', desc: 'Automatically query threat intel when samples are uploaded' },
                      { key: 'cache_results', label: 'Cache Results', desc: 'Cache lookup results to avoid redundant API calls' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{label}</p>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{desc}</p>
                        </div>
                        <button
                          onClick={() => setConfigForm((p) => ({ ...p, [key]: !p[key] }))}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            configForm[key]
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : isDarkMode
                              ? 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {configForm[key] ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Connection Results */}
                {testResults && (
                  <div className={cardClass}>
                    <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Connection Test Results
                    </h2>
                    <div className="space-y-3">
                      {testResults.results?.virustotal && (
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <div>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>VirusTotal</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {testResults.results.virustotal.message}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            testResults.results.virustotal.success
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {testResults.results.virustotal.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      )}
                      {testResults.results?.malwarebazaar && (
                        <div className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-400" />
                            <div>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>MalwareBazaar</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {testResults.results.malwarebazaar.message}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            testResults.results.malwarebazaar.success
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {testResults.results.malwarebazaar.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      isDarkMode
                        ? 'border-slate-600 text-gray-300 hover:bg-slate-700 disabled:opacity-50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                    } disabled:cursor-not-allowed`}
                  >
                    {testLoading ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    Test Connection
                  </button>

                  <button
                    onClick={handleSaveConfig}
                    disabled={saveLoading}
                    className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    {saveLoading ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                    Save Configuration
                  </button>

                  <button
                    onClick={handleDeleteConfig}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      isDarkMode
                        ? 'border-red-700 text-red-400 hover:bg-red-900/20'
                        : 'border-red-300 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete Configuration
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {lookupHistory.length} lookup{lookupHistory.length !== 1 ? 's' : ''} in session
              </p>
              {lookupHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isDarkMode
                      ? 'text-red-400 hover:bg-red-900/20 border border-red-700'
                      : 'text-red-600 hover:bg-red-50 border border-red-300'
                  }`}
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Clear History
                </button>
              )}
            </div>

            {lookupHistory.length === 0 ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <ClockIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No lookup history yet</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    History is stored per browser session
                  </p>
                </div>
              </div>
            ) : (
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                      <th className={`px-4 py-3 text-left font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time</th>
                      <th className={`px-4 py-3 text-left font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hash</th>
                      <th className={`px-4 py-3 text-left font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</th>
                      <th className={`px-4 py-3 text-left font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lookupHistory.map((entry) => {
                      const isExpanded = expandedHistoryId === entry.id
                      const vt = entry.result?.virustotal
                      const mb = entry.result?.malwarebazaar
                      const positives = vt?.positives ?? vt?.malicious ?? null
                      const total = vt?.total ?? vt?.total_engines ?? null
                      return (
                        <>
                          <tr
                            key={entry.id}
                            onClick={() => setExpandedHistoryId(isExpanded ? null : entry.id)}
                            className={`cursor-pointer border-b transition-colors ${
                              isDarkMode
                                ? 'border-slate-700 hover:bg-slate-700/50'
                                : 'border-gray-100 hover:bg-gray-50'
                            } ${isExpanded ? (isDarkMode ? 'bg-slate-700/30' : 'bg-purple-50/50') : ''}`}
                          >
                            <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatTimestamp(entry.timestamp)}
                            </td>
                            <td className={`px-4 py-3 font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {entry.hash.slice(0, 16)}...
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                {entry.type}
                              </span>
                            </td>
                            <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {positives !== null && total !== null ? (
                                <span className={getVTSeverity(positives, total).color}>
                                  {positives}/{total} detections
                                </span>
                              ) : mb?.query_status === 'ok' ? (
                                <span className="text-orange-400">Found in MalwareBazaar</span>
                              ) : (
                                <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No detections</span>
                              )}
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr key={`${entry.id}-detail`} className={isDarkMode ? 'bg-slate-900/40' : 'bg-purple-50/30'}>
                              <td colSpan={4} className="px-4 py-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div>
                                    <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full Hash</p>
                                    <p className={`text-xs font-mono break-all ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{entry.hash}</p>
                                  </div>
                                  <div>
                                    <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Result Data</p>
                                    <pre className={`text-xs overflow-auto max-h-32 rounded p-2 ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                                      {JSON.stringify(entry.result, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
