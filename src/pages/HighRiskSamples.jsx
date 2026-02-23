import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import { samples } from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function HighRiskSamples() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [selectedSample, setSelectedSample] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('risk_score')

  const { data: highRiskSamples, isLoading } = useQuery({
    queryKey: ['high-risk-samples'],
    queryFn: () => samples.getHighRisk(0.7),
  })

  const generateReport = (format = 'json') => {
    try {
      const reportData = selectedSample || {
        report_title: 'High Risk Samples Report',
        generated_at: new Date().toISOString(),
        total_samples: sortedSamples?.length || 0,
        samples: sortedSamples?.slice(0, 100) || []
      }

      let content, mimeType, extension

      if (format === 'json') {
        content = JSON.stringify(reportData, null, 2)
        mimeType = 'application/json'
        extension = 'json'
      } else if (format === 'csv') {
        const samples = selectedSample ? [selectedSample] : sortedSamples
        const headers = ['Sample ID', 'SHA256', 'Risk Score', 'Status', 'Created At']
        const rows = samples.map(s => [
          s.sample_id || '',
          s.sha256 || '',
          s.overall_risk_score || '',
          s.analysis_status || '',
          s.created_at || ''
        ])
        content = [headers, ...rows].map(row => row.join(',')).join('\n')
        mimeType = 'text/csv'
        extension = 'csv'
      } else if (format === 'html') {
        const samples = selectedSample ? [selectedSample] : sortedSamples
        content = `
<!DOCTYPE html>
<html>
<head>
  <title>High Risk Samples Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #dc2626; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #dc2626; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .high-risk { color: #dc2626; font-weight: bold; }
  </style>
</head>
<body>
  <h1>High Risk Samples Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Total Samples:</strong> ${samples.length}</p>
  <table>
    <thead>
      <tr>
        <th>Sample ID</th>
        <th>SHA256</th>
        <th>Risk Score</th>
        <th>Status</th>
        <th>Created At</th>
      </tr>
    </thead>
    <tbody>
      ${samples.map(s => `
        <tr>
          <td>${s.sample_id || 'N/A'}</td>
          <td style="font-family: monospace; font-size: 12px;">${s.sha256?.substring(0, 16) || 'N/A'}...</td>
          <td class="high-risk">${(s.overall_risk_score || 0).toFixed(2)}</td>
          <td>${s.analysis_status || 'N/A'}</td>
          <td>${s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`
        mimeType = 'text/html'
        extension = 'html'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = selectedSample
        ? `High_Risk_Sample_${selectedSample.sample_id}_${timestamp}.${extension}`
        : `High_Risk_Samples_Report_${timestamp}.${extension}`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error generating report:', err)
      alert('Failed to generate report')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading high-risk samples...</p>
        </div>
      </div>
    )
  }

  // Filter and sort samples
  const filteredSamples = highRiskSamples?.filter(sample =>
    sample.sample_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.sha256?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const sortedSamples = [...filteredSamples].sort((a, b) => {
    if (sortBy === 'risk_score') return (b.overall_risk_score || 0) - (a.overall_risk_score || 0)
    if (sortBy === 'date') return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    return 0
  })

  const getRiskLevel = (score) => {
    if (score >= 0.9) return { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50' }
    if (score >= 0.7) return { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50' }
    if (score >= 0.5) return { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50' }
    return { label: 'LOW', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/50' }
  }

  return (
    <div className={`space-y-6 pb-8 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      {/* Header */}
      <div className="relative">
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10' : 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10'} rounded-2xl blur-xl`}></div>
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
                <h1 className={`text-4xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent' : 'text-[#800080]'}`}>
                  High-Risk Samples
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'} mt-2`}>Detailed investigation and analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Total High Risk</div>
                <div className="text-3xl font-bold text-red-400 mt-1">{sortedSamples.length}</div>
              </div>
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
                placeholder="Search by Sample ID or SHA256..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="w-full md:w-64">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="risk_score">Sort by Risk Score</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedSamples.map((sample, idx) => {
          const risk = getRiskLevel(sample.overall_risk_score || 0)

          return (
            <div
              key={sample.sample_id}
              className={`group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl border ${risk.border} hover:border-opacity-100 transition-all duration-300 overflow-hidden cursor-pointer`}
              onClick={() => setSelectedSample(sample)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-900/50 flex items-center justify-center border border-slate-700">
                      <span className="text-lg font-bold text-purple-400">#{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{sample.sample_id}</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Sample Analysis</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg ${risk.bg} border ${risk.border}`}>
                    <span className={`text-xs font-bold ${risk.color} uppercase tracking-wider`}>{risk.label}</span>
                  </div>
                </div>

                {/* SHA256 Hash */}
                <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span className="text-xs text-gray-400 font-medium">SHA256</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigator.clipboard.writeText(sample.sha256)
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 font-mono mt-2 break-all">{sample.sha256}</p>
                </div>

                {/* Risk Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 font-medium">Risk Score</span>
                    <span className={`text-2xl font-bold ${risk.color}`}>
                      {(sample.overall_risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${risk.color.replace('text-', 'bg-')}`}
                      style={{
                        width: `${(sample.overall_risk_score || 0) * 100}%`,
                        boxShadow: `0 0 12px ${risk.color.includes('red') ? 'rgba(239, 68, 68, 0.6)' : risk.color.includes('orange') ? 'rgba(245, 158, 11, 0.6)' : 'rgba(59, 130, 246, 0.6)'}`
                      }}
                    />
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-300 font-semibold">{sample.analysis_status}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">File Type</p>
                    <span className="text-sm text-white font-semibold">{sample.file_type || 'Unknown'}</span>
                  </div>

                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Size</p>
                    <span className="text-sm text-white font-semibold">{sample.file_size ? `${(sample.file_size / 1024).toFixed(2)} KB` : 'N/A'}</span>
                  </div>

                  <div className="p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
                    <span className="text-sm text-white font-semibold">
                      {sample.created_at ? new Date(sample.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedSample(sample)
                  }}
                  className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg text-purple-300 font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <span>Investigate Sample</span>
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
      {sortedSamples.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400 text-lg">No high-risk samples found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedSample && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedSample(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedSample.sample_id}</h2>
                  <p className="text-sm text-gray-400 mt-1">Detailed Sample Analysis</p>
                </div>
                <button
                  onClick={() => setSelectedSample(null)}
                  className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Risk Assessment */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Risk Assessment</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Overall Risk Score</span>
                      <span className={`text-xl font-bold ${getRiskLevel(selectedSample.overall_risk_score).color}`}>
                        {(selectedSample.overall_risk_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getRiskLevel(selectedSample.overall_risk_score).color.replace('text-', 'bg-')}`}
                        style={{ width: `${(selectedSample.overall_risk_score || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* File Information */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">File Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">SHA256 Hash</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(selectedSample.sha256)}
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                        title="Copy hash"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-white font-mono break-all">{selectedSample.sha256}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">File Type</p>
                    <p className="text-sm text-white">{selectedSample.file_type || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">File Size</p>
                    <p className="text-sm text-white">{selectedSample.file_size ? `${(selectedSample.file_size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Analysis Status</p>
                    <p className="text-sm text-green-300">{selectedSample.analysis_status}</p>
                  </div>
                </div>
              </div>

              {/* Analysis Details */}
              <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Analysis Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-gray-400">Sample ID</span>
                    <span className="text-sm text-white font-semibold">{selectedSample.sample_id}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-gray-400">Created At</span>
                    <span className="text-sm text-white font-semibold">
                      {selectedSample.created_at ? new Date(selectedSample.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-sm text-gray-400">Last Updated</span>
                    <span className="text-sm text-white font-semibold">
                      {selectedSample.updated_at ? new Date(selectedSample.updated_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <div className="relative group flex-1">
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg text-purple-300 font-semibold transition-all flex items-center justify-center gap-2">
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
                      onClick={() => generateReport('html')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition"
                    >
                      <span className="font-medium">HTML Report</span>
                      <span className="block text-xs text-gray-400">Interactive web page</span>
                    </button>
                    <button
                      onClick={() => generateReport('json')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition"
                    >
                      <span className="font-medium">JSON Data</span>
                      <span className="block text-xs text-gray-400">Structured data export</span>
                    </button>
                    <button
                      onClick={() => generateReport('csv')}
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
                      onClick={() => generateReport('json')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition"
                    >
                      <span className="font-medium">JSON</span>
                      <span className="block text-xs text-gray-400">Raw data export</span>
                    </button>
                    <button
                      onClick={() => generateReport('csv')}
                      className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 rounded-b-lg transition"
                    >
                      <span className="font-medium">CSV</span>
                      <span className="block text-xs text-gray-400">Spreadsheet format</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
