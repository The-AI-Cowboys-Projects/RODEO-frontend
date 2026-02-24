import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import SBOMScanDialog from '../components/SBOMScanDialog'
import {
  CubeIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CubeTransparentIcon,
  ScaleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  EyeIcon,
  ChevronRightIcon,
  CircleStackIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  LockClosedIcon,
  LockOpenIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon as ShieldCheckSolid } from '@heroicons/react/24/solid'

export default function SBOMDashboard() {
  const { isDarkMode } = useTheme()
  const [sboms, setSboms] = useState([])
  const [selectedSbom, setSelectedSbom] = useState(null)
  const [components, setComponents] = useState([])
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [scanDialogOpen, setScanDialogOpen] = useState(false)
  const [componentSearch, setComponentSearch] = useState('')

  useEffect(() => {
    fetchSBOMs()
  }, [])

  useEffect(() => {
    if (selectedSbom) {
      fetchSBOMDetails(selectedSbom.sbom_id)
    }
  }, [selectedSbom])

  const fetchSBOMs = async () => {
    try {
      const token = localStorage.getItem('rodeo_token')
      const response = await fetch('/api/sbom/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setSboms(data.sboms || [])
      if (data.sboms && data.sboms.length > 0) {
        setSelectedSbom(data.sboms[0])
      }
    } catch (error) {
      console.error('Error fetching SBOMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSBOMDetails = async (sbomId) => {
    try {
      const token = localStorage.getItem('rodeo_token')

      const compResponse = await fetch(`/api/sbom/${sbomId}/components`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const compData = await compResponse.json()
      setComponents(compData.components || [])

      const vulnResponse = await fetch(`/api/sbom/${sbomId}/vulnerabilities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const vulnData = await vulnResponse.json()
      setVulnerabilities(vulnData.vulnerabilities || [])

      const analyticsResponse = await fetch(`/api/sbom/${sbomId}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const analyticsData = await analyticsResponse.json()
      setAnalytics(analyticsData)

    } catch (error) {
      console.error('Error fetching SBOM details:', error)
    }
  }

  const handleScanComplete = (data) => {
    console.log('Scan complete:', data)
    fetchSBOMs()
    if (data.sbom) {
      setSelectedSbom(data.sbom)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'components', label: 'Components', icon: CubeTransparentIcon },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldExclamationIcon },
    { id: 'licenses', label: 'Licenses', icon: ScaleIcon },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <CubeIcon className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-gray-400 text-lg">Loading SBOM data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-indigo-900/50 via-slate-900 to-purple-900/50 border-indigo-500/20' : 'bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-indigo-200'} rounded-2xl border p-6`}>
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 rotate-3 hover:rotate-0 transition-transform">
                <CubeIcon className="w-9 h-9 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 ${isDarkMode ? 'border-slate-900' : 'border-white'} flex items-center justify-center`}>
                <CheckCircleIcon className="w-3 h-3 text-slate-900" />
              </div>
            </div>
            <div>
              <h1 className={`text-3xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-white via-indigo-200 to-purple-200' : 'from-indigo-700 via-purple-600 to-indigo-800'} bg-clip-text text-transparent`}>
                Software Bill of Materials
              </h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 flex items-center gap-2`}>
                <span>Track components, vulnerabilities & license compliance</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setScanDialogOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Scan New Project
          </button>
        </div>
      </div>

      {/* SBOM Selector Pills */}
      {sboms.length > 0 && (
        <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-thin ${isDarkMode ? 'scrollbar-thumb-slate-700' : 'scrollbar-thumb-gray-300'}`}>
          {sboms.map((sbom) => (
            <button
              key={sbom.sbom_id}
              onClick={() => setSelectedSbom(sbom)}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                selectedSbom?.sbom_id === sbom.sbom_id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : `${isDarkMode ? 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700/50 border-slate-700/50' : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-gray-200'} border`
              }`}
            >
              <CubeTransparentIcon className="w-4 h-4" />
              <span className="font-medium">{sbom.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedSbom?.sbom_id === sbom.sbom_id
                  ? 'bg-white/20'
                  : (isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100')
              }`}>
                v{sbom.version}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedSbom && analytics && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={CubeTransparentIcon}
              label="Total Components"
              value={selectedSbom.component_count}
              color="indigo"
            />
            <StatCard
              icon={ExclamationTriangleIcon}
              label="Vulnerable Components"
              value={selectedSbom.vulnerable_components}
              color={selectedSbom.vulnerable_components > 0 ? 'orange' : 'green'}
              trend={selectedSbom.vulnerable_components > 0 ? 'up' : null}
            />
            <StatCard
              icon={ShieldExclamationIcon}
              label="Total Vulnerabilities"
              value={selectedSbom.total_vulnerabilities}
              color={selectedSbom.total_vulnerabilities > 0 ? 'red' : 'green'}
            />
            <RiskScoreCard score={analytics.risk_metrics.risk_score} />
          </div>

          {/* Vulnerability Breakdown */}
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vulnerability Breakdown</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SeverityCard
                severity="Critical"
                count={analytics.vulnerability_severity_distribution.CRITICAL || 0}
                color="red"
              />
              <SeverityCard
                severity="High"
                count={analytics.vulnerability_severity_distribution.HIGH || 0}
                color="orange"
              />
              <SeverityCard
                severity="Medium"
                count={analytics.vulnerability_severity_distribution.MEDIUM || 0}
                color="yellow"
              />
              <SeverityCard
                severity="Low"
                count={analytics.vulnerability_severity_distribution.LOW || 0}
                color="blue"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className={`flex gap-2 p-1.5 ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} rounded-xl border`}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.id === 'vulnerabilities' && selectedSbom.total_vulnerabilities > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-red-500/20 text-red-400'}`}>
                      {selectedSbom.total_vulnerabilities}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
            {activeTab === 'overview' && (
              <OverviewTab analytics={analytics} isDarkMode={isDarkMode} />
            )}
            {activeTab === 'components' && (
              <ComponentsTab
                components={components}
                search={componentSearch}
                onSearchChange={setComponentSearch}
                isDarkMode={isDarkMode}
              />
            )}
            {activeTab === 'vulnerabilities' && (
              <VulnerabilitiesTab vulnerabilities={vulnerabilities} isDarkMode={isDarkMode} />
            )}
            {activeTab === 'licenses' && (
              <LicensesTab analytics={analytics} isDarkMode={isDarkMode} />
            )}
          </div>
        </>
      )}

      {sboms.length === 0 && (
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-12 text-center`}>
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto">
              <CubeIcon className="w-12 h-12 text-indigo-400" />
            </div>
            <div className={`absolute -bottom-2 -right-2 w-10 h-10 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-xl flex items-center justify-center border`}>
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No SBOMs Found</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6 max-w-md mx-auto`}>
            Scan a project to generate your first Software Bill of Materials and start tracking dependencies
          </p>
          <button
            onClick={() => setScanDialogOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Scan Your First Project
          </button>
        </div>
      )}

      {/* Scan Dialog */}
      <SBOMScanDialog
        isOpen={scanDialogOpen}
        onClose={() => setScanDialogOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, trend }) {
  const { isDarkMode } = useTheme()
  const colorStyles = isDarkMode ? {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  } : {
    indigo: 'from-indigo-50 to-indigo-100/80 border-indigo-200 text-indigo-600 shadow-sm shadow-indigo-100/50',
    green: 'from-green-50 to-green-100/80 border-green-200 text-green-600 shadow-sm shadow-green-100/50',
    orange: 'from-orange-50 to-orange-100/80 border-orange-200 text-orange-600 shadow-sm shadow-orange-100/50',
    red: 'from-red-50 to-red-100/80 border-red-200 text-red-600 shadow-sm shadow-red-100/50',
    purple: 'from-purple-50 to-purple-100/80 border-purple-200 text-purple-600 shadow-sm shadow-purple-100/50',
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colorStyles[color]} rounded-2xl border p-5 group hover:scale-[1.02] transition-transform`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-white/60 shadow-sm'} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend === 'up' && (
            <ArrowTrendingUpIcon className="w-5 h-5 text-orange-400" />
          )}
        </div>
        <div className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{value}</div>
        <div className="text-sm opacity-80">{label}</div>
      </div>
    </div>
  )
}

// Risk Score Card with animated ring
function RiskScoreCard({ score }) {
  const { isDarkMode } = useTheme()
  const getScoreColor = (s) => {
    if (s >= 75) return { ring: 'text-red-500', bg: 'from-red-500/20', label: 'Critical' }
    if (s >= 50) return { ring: 'text-orange-500', bg: 'from-orange-500/20', label: 'High' }
    if (s >= 25) return { ring: 'text-yellow-500', bg: 'from-yellow-500/20', label: 'Medium' }
    return { ring: 'text-green-500', bg: 'from-green-500/20', label: 'Low' }
  }

  const { ring, bg, label } = getScoreColor(score)
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bg} ${isDarkMode ? 'to-slate-800/50 border-slate-700/50' : 'to-white border-gray-200'} rounded-2xl border p-5 group hover:scale-[1.02] transition-transform`}>
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={isDarkMode ? 'text-slate-700/50' : 'text-gray-200'}
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={`${ring} transition-all duration-1000`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{score}</span>
          </div>
        </div>
        <div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Risk Score</div>
          <div className={`text-lg font-semibold ${ring}`}>{label} Risk</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>0-100 scale</div>
        </div>
      </div>
    </div>
  )
}

// Severity Card Component
function SeverityCard({ severity, count, color }) {
  const { isDarkMode } = useTheme()
  const colorStyles = isDarkMode ? {
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400 hover:shadow-red-500/20',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400 hover:shadow-orange-500/20',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400 hover:shadow-yellow-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400 hover:shadow-blue-500/20',
  } : {
    red: 'from-red-50 to-red-100/80 border-red-200 text-red-600 hover:shadow-red-200/60 shadow-sm',
    orange: 'from-orange-50 to-orange-100/80 border-orange-200 text-orange-600 hover:shadow-orange-200/60 shadow-sm',
    yellow: 'from-yellow-50 to-yellow-100/80 border-yellow-200 text-yellow-600 hover:shadow-yellow-200/60 shadow-sm',
    blue: 'from-blue-50 to-blue-100/80 border-blue-200 text-blue-600 hover:shadow-blue-200/60 shadow-sm',
  }

  return (
    <div className={`relative bg-gradient-to-br ${colorStyles[color]} rounded-xl border p-5 text-center group hover:scale-105 hover:shadow-lg transition-all cursor-default`}>
      <div className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{count}</div>
      <div className="text-sm font-medium">{severity}</div>
      {count > 0 && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current animate-pulse" />
      )}
    </div>
  )
}

// Overview Tab
function OverviewTab({ analytics, isDarkMode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Component Types */}
      <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700/30' : 'bg-gray-50 border-gray-200'} rounded-xl p-5 border`}>
        <div className="flex items-center gap-2 mb-4">
          <CircleStackIcon className="w-5 h-5 text-indigo-400" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Component Types</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(analytics.component_type_distribution).map(([type, count]) => {
            const total = Object.values(analytics.component_type_distribution).reduce((a, b) => a + b, 0)
            const percent = (count / total) * 100
            return (
              <div key={type} className="group">
                <div className="flex justify-between items-center mb-1">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} capitalize flex items-center gap-2`}>
                    <CodeBracketIcon className="w-4 h-4 text-gray-500" />
                    {type}
                  </span>
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>{count}</span>
                </div>
                <div className={`h-2 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all group-hover:from-indigo-400 group-hover:to-purple-400"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk Metrics */}
      <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700/30' : 'bg-gray-50 border-gray-200'} rounded-xl p-5 border`}>
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-purple-400" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Risk Metrics</h3>
        </div>
        <div className="space-y-4">
          <MetricRow
            icon={ShieldExclamationIcon}
            label="Vulnerability Rate"
            value={`${analytics.risk_metrics.vulnerability_rate.toFixed(1)}%`}
            color={analytics.risk_metrics.vulnerability_rate > 10 ? 'red' : 'green'}
            isDarkMode={isDarkMode}
          />
          <MetricRow
            icon={ScaleIcon}
            label="High-Risk Licenses"
            value={analytics.compliance_metrics.high_risk_licenses}
            color={analytics.compliance_metrics.high_risk_licenses > 0 ? 'orange' : 'green'}
            isDarkMode={isDarkMode}
          />
          <MetricRow
            icon={ClockIcon}
            label="Deprecated Components"
            value={analytics.compliance_metrics.deprecated_components}
            color={analytics.compliance_metrics.deprecated_components > 0 ? 'yellow' : 'green'}
            isDarkMode={isDarkMode}
          />
          <MetricRow
            icon={GlobeAltIcon}
            label="External Dependencies"
            value={Object.values(analytics.component_type_distribution).reduce((a, b) => a + b, 0)}
            color="indigo"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`md:col-span-2 ${isDarkMode ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20' : 'bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-indigo-200 shadow-sm shadow-indigo-100/40'} rounded-xl p-5 border`}>
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-indigo-400" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            icon={CheckCircleIcon}
            title="Secure Components"
            value={`${((1 - analytics.risk_metrics.vulnerability_rate / 100) * 100).toFixed(0)}%`}
            description="of components have no known vulnerabilities"
            color="green"
            isDarkMode={isDarkMode}
          />
          <InsightCard
            icon={ScaleIcon}
            title="License Compliance"
            value={analytics.compliance_metrics.high_risk_licenses === 0 ? 'Compliant' : 'Review Needed'}
            description={analytics.compliance_metrics.high_risk_licenses === 0 ? 'No high-risk licenses detected' : `${analytics.compliance_metrics.high_risk_licenses} license(s) need review`}
            color={analytics.compliance_metrics.high_risk_licenses === 0 ? 'green' : 'orange'}
            isDarkMode={isDarkMode}
          />
          <InsightCard
            icon={ArrowPathIcon}
            title="Freshness"
            value={analytics.compliance_metrics.deprecated_components === 0 ? 'Up to Date' : 'Updates Available'}
            description={analytics.compliance_metrics.deprecated_components === 0 ? 'All components are current' : `${analytics.compliance_metrics.deprecated_components} deprecated component(s)`}
            color={analytics.compliance_metrics.deprecated_components === 0 ? 'green' : 'yellow'}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  )
}

function MetricRow({ icon: Icon, label, value, color, isDarkMode }) {
  const colorStyles = {
    red: 'text-red-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    indigo: 'text-indigo-400',
  }

  return (
    <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-slate-800/50' : 'bg-white border border-gray-200'} rounded-lg`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${colorStyles[color]}`} />
        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
      </div>
      <span className={`font-bold ${colorStyles[color]}`}>{value}</span>
    </div>
  )
}

function InsightCard({ icon: Icon, title, value, description, color, isDarkMode }) {
  const colorStyles = isDarkMode ? {
    green: 'border-green-500/30 text-green-400',
    orange: 'border-orange-500/30 text-orange-400',
    yellow: 'border-yellow-500/30 text-yellow-400',
  } : {
    green: 'border-green-200 text-green-600 shadow-sm shadow-green-100/40',
    orange: 'border-orange-200 text-orange-600 shadow-sm shadow-orange-100/40',
    yellow: 'border-yellow-200 text-yellow-600 shadow-sm shadow-yellow-100/40',
  }

  return (
    <div className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-white'} rounded-xl p-4 border ${colorStyles[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</span>
      </div>
      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{value}</div>
      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{description}</div>
    </div>
  )
}

// Components Tab
function ComponentsTab({ components, search, onSearchChange, isDarkMode }) {
  const filteredComponents = components.filter(comp =>
    comp.name.toLowerCase().includes(search.toLowerCase()) ||
    comp.version.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CubeTransparentIcon className="w-5 h-5 text-indigo-400" />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Components ({components.length})</h3>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`pl-10 pr-4 py-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-600/50 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-lg focus:outline-none focus:border-indigo-500/50 w-64`}
          />
        </div>
      </div>

      <div className={`overflow-x-auto rounded-xl border ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
        <table className="w-full">
          <thead>
            <tr className={`${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
              <th className={`text-left py-4 px-5 font-medium ${isDarkMode ? 'text-gray-400 border-slate-700/50' : 'text-gray-600 border-gray-200'} border-b`}>Component</th>
              <th className={`text-left py-4 px-5 font-medium ${isDarkMode ? 'text-gray-400 border-slate-700/50' : 'text-gray-600 border-gray-200'} border-b`}>Version</th>
              <th className={`text-left py-4 px-5 font-medium ${isDarkMode ? 'text-gray-400 border-slate-700/50' : 'text-gray-600 border-gray-200'} border-b`}>Type</th>
              <th className={`text-left py-4 px-5 font-medium ${isDarkMode ? 'text-gray-400 border-slate-700/50' : 'text-gray-600 border-gray-200'} border-b`}>License</th>
              <th className={`text-left py-4 px-5 font-medium ${isDarkMode ? 'text-gray-400 border-slate-700/50' : 'text-gray-600 border-gray-200'} border-b`}>Vulnerabilities</th>
            </tr>
          </thead>
          <tbody>
            {filteredComponents.slice(0, 50).map((comp, idx) => (
              <tr
                key={idx}
                className={`border-b ${isDarkMode ? 'border-slate-700/30 hover:bg-slate-700/20' : 'border-gray-100 hover:bg-gray-50'} transition-colors ${
                  idx % 2 === 0 ? (isDarkMode ? 'bg-slate-800/30' : 'bg-gray-50/50') : ''
                }`}
              >
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <CubeTransparentIcon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>{comp.name}</span>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className={`px-2 py-1 ${isDarkMode ? 'bg-slate-700/50 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded text-sm font-mono`}>
                    {comp.version}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <span className={`px-3 py-1 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'} rounded-full text-sm`}>
                    {comp.component_type}
                  </span>
                </td>
                <td className="py-4 px-5">
                  {comp.licenses && comp.licenses.length > 0 ? (
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      comp.license_risk_level === 'high' || comp.license_risk_level === 'critical'
                        ? (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                        : (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                    }`}>
                      {comp.licenses[0].license_type}
                    </span>
                  ) : (
                    <span className={`px-3 py-1 ${isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'} rounded-full text-sm`}>
                      Unknown
                    </span>
                  )}
                </td>
                <td className="py-4 px-5">
                  {comp.vulnerability_count > 0 ? (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'} rounded-full text-sm`}>
                      <ShieldExclamationIcon className="w-4 h-4" />
                      {comp.vulnerability_count}
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'} rounded-full text-sm`}>
                      <CheckCircleIcon className="w-4 h-4" />
                      Secure
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredComponents.length > 50 && (
        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm py-4`}>
          Showing 50 of {filteredComponents.length} components
        </div>
      )}
    </div>
  )
}

// Vulnerabilities Tab
function VulnerabilitiesTab({ vulnerabilities, isDarkMode }) {
  const getSeverityStyle = (severity) => {
    const dark = {
      CRITICAL: 'from-red-500/20 to-red-600/5 border-red-500/40 text-red-400',
      HIGH: 'from-orange-500/20 to-orange-600/5 border-orange-500/40 text-orange-400',
      MEDIUM: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/40 text-yellow-400',
      LOW: 'from-blue-500/20 to-blue-600/5 border-blue-500/40 text-blue-400',
    }
    const light = {
      CRITICAL: 'from-red-50 to-red-100/80 border-red-300 text-red-700',
      HIGH: 'from-orange-50 to-orange-100/80 border-orange-300 text-orange-700',
      MEDIUM: 'from-yellow-50 to-yellow-100/80 border-yellow-300 text-yellow-700',
      LOW: 'from-blue-50 to-blue-100/80 border-blue-300 text-blue-700',
    }
    const key = severity?.toUpperCase()
    const map = isDarkMode ? dark : light
    return map[key] || (isDarkMode ? 'from-gray-500/20 to-gray-600/5 border-gray-500/40 text-gray-400' : 'from-gray-50 to-gray-100/80 border-gray-300 text-gray-600')
  }

  const getSeverityBadgeStyle = (severity) => {
    const dark = {
      CRITICAL: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
      HIGH: 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/30',
      LOW: 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30',
    }
    const light = {
      CRITICAL: 'bg-red-100 text-red-700 ring-1 ring-red-300',
      HIGH: 'bg-orange-100 text-orange-700 ring-1 ring-orange-300',
      MEDIUM: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300',
      LOW: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300',
    }
    const key = severity?.toUpperCase()
    const map = isDarkMode ? dark : light
    return map[key] || (isDarkMode ? 'bg-gray-500/20 text-gray-400 ring-1 ring-gray-500/30' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-300')
  }

  if (vulnerabilities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldCheckSolid className="w-8 h-8 text-green-400" />
        </div>
        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Vulnerabilities Found</h3>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>All components are secure with no known vulnerabilities</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldExclamationIcon className="w-5 h-5 text-red-400" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vulnerabilities ({vulnerabilities.length})</h3>
      </div>

      <div className="space-y-4">
        {vulnerabilities.slice(0, 20).map((vuln, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden bg-gradient-to-r ${getSeverityStyle(vuln.vulnerability.severity)} rounded-xl border p-5 hover:scale-[1.01] transition-transform`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-white/60 shadow-sm'} flex items-center justify-center`}>
                  <ExclamationTriangleIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{vuln.vulnerability.vulnerability_id}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    in <span className="text-purple-400">{vuln.component.name}</span> {vuln.component.version}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityBadgeStyle(vuln.vulnerability.severity)}`}>
                {vuln.vulnerability.severity}
              </span>
            </div>

            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mb-3 line-clamp-2`}>
              {vuln.vulnerability.description?.substring(0, 200)}...
            </p>

            {vuln.vulnerability.cvss_score && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>CVSS Score:</span>
                  <span className={`font-bold ${
                    vuln.vulnerability.cvss_score >= 9 ? 'text-red-400' :
                    vuln.vulnerability.cvss_score >= 7 ? 'text-orange-400' :
                    vuln.vulnerability.cvss_score >= 4 ? 'text-yellow-400' : 'text-blue-400'
                  }`}>
                    {vuln.vulnerability.cvss_score}
                  </span>
                </div>
                <button className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                  <EyeIcon className="w-4 h-4" />
                  View Details
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {vulnerabilities.length > 20 && (
        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm py-4`}>
          Showing 20 of {vulnerabilities.length} vulnerabilities
        </div>
      )}
    </div>
  )
}

// Licenses Tab
function LicensesTab({ analytics, isDarkMode }) {
  const getLicenseRisk = (license) => {
    const highRisk = ['GPL-3.0', 'AGPL-3.0', 'GPL-2.0', 'LGPL-3.0', 'LGPL-2.1']
    const mediumRisk = ['MPL-2.0', 'EPL-2.0', 'CDDL-1.0']
    if (highRisk.some(l => license.includes(l))) return 'high'
    if (mediumRisk.some(l => license.includes(l))) return 'medium'
    return 'low'
  }

  const getLicenseStyle = (risk) => {
    if (isDarkMode) {
      switch (risk) {
        case 'high': return 'from-red-500/20 to-red-600/5 border-red-500/30'
        case 'medium': return 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30'
        default: return 'from-green-500/20 to-green-600/5 border-green-500/30'
      }
    }
    switch (risk) {
      case 'high': return 'from-red-50 to-red-100/80 border-red-200 shadow-sm shadow-red-100/40'
      case 'medium': return 'from-yellow-50 to-yellow-100/80 border-yellow-200 shadow-sm shadow-yellow-100/40'
      default: return 'from-green-50 to-green-100/80 border-green-200 shadow-sm shadow-green-100/40'
    }
  }

  const getLicenseIcon = (risk) => {
    switch (risk) {
      case 'high': return LockClosedIcon
      case 'medium': return BeakerIcon
      default: return LockOpenIcon
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ScaleIcon className="w-5 h-5 text-purple-400" />
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>License Distribution</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(analytics.license_distribution).map(([license, count]) => {
          const risk = getLicenseRisk(license)
          const Icon = getLicenseIcon(risk)
          return (
            <div
              key={license}
              className={`relative overflow-hidden bg-gradient-to-br ${getLicenseStyle(risk)} rounded-xl border p-5 hover:scale-105 transition-transform`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${
                  risk === 'high' ? 'text-red-400' :
                  risk === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`} />
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  risk === 'high' ? (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700') :
                  risk === 'medium' ? (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700') :
                  (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                }`}>
                  {risk === 'high' ? 'Copyleft' : risk === 'medium' ? 'Weak Copyleft' : 'Permissive'}
                </span>
              </div>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{count}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`} title={license}>{license}</div>
            </div>
          )
        })}
      </div>

      {/* License Legend */}
      <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700/30' : 'bg-gray-50 border-gray-200'} rounded-xl p-5 border mt-6`}>
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="w-5 h-5 text-indigo-400" />
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>License Risk Guide</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <LockOpenIcon className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <div className="text-green-400 font-medium">Permissive</div>
              <div className="text-xs text-gray-500">MIT, Apache-2.0, BSD - Low risk, minimal restrictions</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BeakerIcon className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <div className="text-yellow-400 font-medium">Weak Copyleft</div>
              <div className="text-xs text-gray-500">MPL-2.0, LGPL - Medium risk, file-level requirements</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <LockClosedIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="text-red-400 font-medium">Copyleft</div>
              <div className="text-xs text-gray-500">GPL, AGPL - High risk, derivative work requirements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
