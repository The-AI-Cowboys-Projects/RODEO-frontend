import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import { vulnerabilities } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { generateReport } from '../utils/reportGenerator'

export default function CriticalVulnerabilities() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [selectedVuln, setSelectedVuln] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('cvss_score')
  const [filterSeverity, setFilterSeverity] = useState('all')

  const { data: criticalVulns, isLoading } = useQuery({
    queryKey: ['critical-vulns'],
    queryFn: vulnerabilities.getCritical,
  })

  const handleGenerateReport = (format) => {
    try {
      const filteredVulns = criticalVulns?.filter(vuln => {
        const matchesSearch =
          vuln.vuln_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vuln.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeverity = filterSeverity === 'all' || vuln.severity?.toLowerCase() === filterSeverity
        return matchesSearch && matchesSeverity
      }) || []

      generateReport({
        format,
        data: selectedVuln ? [selectedVuln] : filteredVulns,
        title: selectedVuln ? `Vulnerability Report - ${selectedVuln.vuln_id}` : 'Critical Vulnerabilities Report',
        filename: selectedVuln ? `Vuln_${selectedVuln.vuln_id}` : 'Critical_Vulns_Report',
        columns: [
          { label: 'CVE ID', accessor: (v) => v.vuln_id },
          { label: 'Severity', accessor: (v) => v.severity },
          { label: 'CVSS Score', accessor: (v) => v.cvss_score },
          { label: 'Description', accessor: (v) => v.description },
          { label: 'Affected Systems', accessor: (v) => v.affected_count || 0 },
          { label: 'Exploit Available', accessor: (v) => v.exploit_available ? 'Yes' : 'No' },
          { label: 'Discovered', accessor: (v) => v.discovered_date ? new Date(v.discovered_date).toLocaleDateString() : 'N/A' }
        ]
      })
    } catch (err) {
      alert(`Failed to generate report: ${err.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading critical vulnerabilities...</p>
        </div>
      </div>
    )
  }

  // Filter vulnerabilities
  const filteredVulns = criticalVulns?.filter(vuln => {
    const matchesSearch =
      vuln.cve_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.affected_software?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSeverity = filterSeverity === 'all' || vuln.severity?.toLowerCase() === filterSeverity.toLowerCase()

    return matchesSearch && matchesSeverity
  }) || []

  // Sort vulnerabilities
  const sortedVulns = [...filteredVulns].sort((a, b) => {
    if (sortBy === 'cvss_score') return (b.cvss_score || 0) - (a.cvss_score || 0)
    if (sortBy === 'date') return new Date(b.discovered_date || 0) - new Date(a.discovered_date || 0)
    if (sortBy === 'severity') {
      const severityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
    }
    return 0
  })

  const getSeverityConfig = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL',
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          glow: 'shadow-red-500/50'
        }
      case 'HIGH':
        return {
          label: 'HIGH',
          color: 'text-orange-400',
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/50',
          glow: 'shadow-orange-500/50'
        }
      case 'MEDIUM':
        return {
          label: 'MEDIUM',
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          glow: 'shadow-yellow-500/50'
        }
      default:
        return {
          label: 'LOW',
          color: 'text-blue-400',
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          glow: 'shadow-blue-500/50'
        }
    }
  }

  const getCVSSColor = (score) => {
    if (score >= 9.0) return 'text-red-400'
    if (score >= 7.0) return 'text-orange-400'
    if (score >= 4.0) return 'text-yellow-400'
    return 'text-blue-400'
  }

  const getExploitabilityColor = (exploitability) => {
    if (exploitability === 'HIGH') return 'text-red-400 bg-red-500/20 border-red-500/30'
    if (exploitability === 'MEDIUM') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    return 'text-green-400 bg-green-500/20 border-green-500/30'
  }

  return (
    <div className={`space-y-6 pb-8 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      {/* Header */}
      <div className="relative">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10' : 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10'} rounded-2xl blur-xl`}></div>
        <div className={`relative ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-purple-300'} backdrop-blur-sm rounded-2xl border p-8`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className={`w-10 h-10 rounded-lg ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'} flex items-center justify-center transition-colors border`}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className={`text-4xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent' : 'text-[#800080]'}`}>
                  Critical Vulnerabilities
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'} mt-2`}>Security threat analysis and mitigation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-500/30">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Total Critical</div>
                <div className="text-3xl font-bold text-orange-400 mt-1">{sortedVulns.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 p-4 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Critical</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {sortedVulns.filter(v => v.severity === 'CRITICAL').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 p-4 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">High</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">
                {sortedVulns.filter(v => v.severity === 'HIGH').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-4 rounded-xl border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Exploitable</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">
                {sortedVulns.filter(v => v.exploit_available).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 p-4 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Patched</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {sortedVulns.filter(v => v.patch_available).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-6 rounded-xl border border-slate-700/50 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by CVE ID, description, or software..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div className="w-full md:w-48">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="cvss_score">Sort by CVSS Score</option>
              <option value="severity">Sort by Severity</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vulnerabilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedVulns.map((vuln, idx) => {
          const severity = getSeverityConfig(vuln.severity)

          return (
            <div
              key={vuln.vulnerability_id}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border ${severity.border} hover:border-opacity-100 transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-lg ${severity.glow}`}
              onClick={() => setSelectedVuln(vuln)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-900/50 flex items-center justify-center border border-slate-700">
                      <span className="text-lg font-bold text-orange-400">#{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{vuln.cve_id}</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Vulnerability</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg ${severity.bg} border ${severity.border}`}>
                    <span className={`text-xs font-bold ${severity.color} uppercase tracking-wider`}>{severity.label}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <p className="text-sm text-gray-300 line-clamp-2">{vuln.description || 'No description available'}</p>
                </div>

                {/* CVSS Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 font-medium">CVSS Score</span>
                    <span className={`text-2xl font-bold ${getCVSSColor(vuln.cvss_score)}`}>
                      {vuln.cvss_score?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500`}
                      style={{
                        width: `${(vuln.cvss_score / 10) * 100}%`,
                        backgroundColor: vuln.cvss_score >= 9 ? '#f87171' : vuln.cvss_score >= 7 ? '#fb923c' : vuln.cvss_score >= 4 ? '#fbbf24' : '#60a5fa'
                      }}
                    />
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Affected Software</p>
                    <span className="text-sm text-white font-semibold line-clamp-1">{vuln.affected_software || 'Unknown'}</span>
                  </div>

                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Exploit Available</p>
                    <div className="flex items-center space-x-2">
                      {vuln.exploit_available ? (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-red-300 font-semibold">Yes</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-300 font-semibold">No</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Patch Available</p>
                    <div className="flex items-center space-x-2">
                      {vuln.patch_available ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-green-300 font-semibold">Yes</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-red-300 font-semibold">No</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Discovered</p>
                    <span className="text-sm text-white font-semibold">
                      {vuln.discovered_date ? new Date(vuln.discovered_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedVuln(vuln)
                  }}
                  className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-lg text-orange-300 font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>Investigate Vulnerability</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* No Results */}
      {sortedVulns.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
          </svg>
          <p className="text-gray-400 text-lg">No vulnerabilities found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedVuln && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedVuln(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedVuln.cve_id}</h2>
                  <p className="text-sm text-gray-400 mt-1">Detailed Vulnerability Analysis</p>
                </div>
                <button
                  onClick={() => setSelectedVuln(null)}
                  className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Severity & CVSS */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Threat Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Severity Level</p>
                    <div className={`inline-flex px-4 py-2 rounded-lg ${getSeverityConfig(selectedVuln.severity).bg} border ${getSeverityConfig(selectedVuln.severity).border}`}>
                      <span className={`text-lg font-bold ${getSeverityConfig(selectedVuln.severity).color} uppercase`}>
                        {selectedVuln.severity}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">CVSS Score</p>
                    <div className="flex items-baseline space-x-2">
                      <span className={`text-4xl font-bold ${getCVSSColor(selectedVuln.cvss_score)}`}>
                        {selectedVuln.cvss_score?.toFixed(1) || 'N/A'}
                      </span>
                      <span className="text-gray-400">/ 10.0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Description</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedVuln.description || 'No description available'}</p>
              </div>

              {/* Technical Details */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Technical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">CVE ID</p>
                    <p className="text-sm text-white font-mono">{selectedVuln.cve_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Affected Software</p>
                    <p className="text-sm text-white">{selectedVuln.affected_software || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Discovered Date</p>
                    <p className="text-sm text-white">
                      {selectedVuln.discovered_date ? new Date(selectedVuln.discovered_date).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Last Updated</p>
                    <p className="text-sm text-white">
                      {selectedVuln.updated_at ? new Date(selectedVuln.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Exploit & Patch Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Exploit Status</h3>
                  <div className={`p-4 rounded-lg ${selectedVuln.exploit_available ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Exploit Available</span>
                      <span className={`text-lg font-bold ${selectedVuln.exploit_available ? 'text-red-400' : 'text-green-400'}`}>
                        {selectedVuln.exploit_available ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {selectedVuln.exploit_available && (
                      <p className="text-xs text-red-300 mt-2">⚠️ Active exploits detected in the wild</p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Patch Status</h3>
                  <div className={`p-4 rounded-lg ${selectedVuln.patch_available ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Patch Available</span>
                      <span className={`text-lg font-bold ${selectedVuln.patch_available ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedVuln.patch_available ? 'YES' : 'NO'}
                      </span>
                    </div>
                    {selectedVuln.patch_available && (
                      <p className="text-xs text-green-300 mt-2">✓ Security patch available for download</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <div className="relative group flex-1">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-lg text-orange-300 font-semibold transition-all flex items-center justify-center gap-2">
                    Generate Report
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="px-3 py-2 border-b border-slate-700">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Select Format</p>
                    </div>
                    <button
                      onClick={() => handleGenerateReport('html')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition"
                    >
                      <span className="font-medium">HTML Report</span>
                      <span className="block text-xs text-gray-400">Interactive web page</span>
                    </button>
                    <button
                      onClick={() => handleGenerateReport('json')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition"
                    >
                      <span className="font-medium">JSON Data</span>
                      <span className="block text-xs text-gray-400">Structured data export</span>
                    </button>
                    <button
                      onClick={() => handleGenerateReport('csv')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 rounded-b-lg transition"
                    >
                      <span className="font-medium">CSV Spreadsheet</span>
                      <span className="block text-xs text-gray-400">Excel compatible</span>
                    </button>
                  </div>
                </div>
                <div className="relative group flex-1">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/30 rounded-lg text-blue-300 font-semibold transition-all flex items-center justify-center gap-2">
                    Export Data
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 bottom-full mb-2 w-56 bg-slate-800 rounded-lg shadow-xl border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <div className="px-3 py-2 border-b border-slate-700">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Export Format</p>
                    </div>
                    <button
                      onClick={() => handleGenerateReport('json')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition"
                    >
                      <span className="font-medium">JSON</span>
                      <span className="block text-xs text-gray-400">Raw data export</span>
                    </button>
                    <button
                      onClick={() => handleGenerateReport('csv')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 rounded-b-lg transition"
                    >
                      <span className="font-medium">CSV</span>
                      <span className="block text-xs text-gray-400">Spreadsheet format</span>
                    </button>
                  </div>
                </div>
                {selectedVuln.patch_available && (
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 rounded-lg text-green-300 font-semibold transition-all">
                    Download Patch
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
