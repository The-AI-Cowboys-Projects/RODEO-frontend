import { useState } from 'react'
import {
  ShieldExclamationIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BugAntIcon,
  ServerIcon,
  FolderIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import AICopilot from './AICopilot'

export default function AnalysisResults({ sessionId, results }) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!results) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 text-center">
        <p className="text-gray-400">No analysis results available</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'copilot', name: 'AI Co-Pilot', icon: SparklesIcon },
    { id: 'behavior', name: 'Behavior', icon: BugAntIcon },
    { id: 'network', name: 'Network', icon: GlobeAltIcon },
    { id: 'iocs', name: 'IOCs', icon: ShieldExclamationIcon },
    { id: 'mitre', name: 'MITRE ATT&CK', icon: DocumentTextIcon },
  ]

  const getThreatColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-500/50'
      case 'high':
        return 'text-orange-400 bg-orange-900/20 border-orange-500/50'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50'
      case 'low':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/50'
      case 'benign':
      case 'safe':
        return 'text-green-400 bg-green-900/20 border-green-500/50'
      default:
        // UNKNOWN and other unrecognized values - yellow to indicate caution
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50'
    }
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
            <p className="text-gray-400 text-sm mt-1">
              Session: <span className="font-mono text-purple-400">{sessionId}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-slate-900/50 hover:bg-slate-900/70 border border-slate-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="px-4 py-2 bg-slate-900/50 hover:bg-slate-900/70 border border-slate-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center space-x-2">
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Threat Level Badge */}
        <div className="mt-6 flex items-center space-x-4">
          <div className={`inline-flex items-center px-6 py-3 rounded-xl border font-bold text-lg ${getThreatColor(results.threat_level || results.threat_intel?.threat_level || results.classification?.threat_level)}`}>
            <ShieldExclamationIcon className="w-6 h-6 mr-2" />
            Threat Level: {(results.threat_level || results.threat_intel?.threat_level || results.classification?.threat_level)?.toUpperCase() || 'UNKNOWN'}
          </div>

          {results.classification?.threat_type && (
            <div className="px-4 py-2 bg-purple-900/20 border border-purple-500/50 rounded-lg">
              <span className="text-purple-400 font-semibold">
                {results.classification.threat_type}
              </span>
            </div>
          )}

          {results.classification?.confidence && (
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg">
              <span className="text-gray-400 text-sm">Confidence: </span>
              <span className="text-white font-semibold">
                {Math.round(results.classification.confidence * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Processes</p>
              <p className="text-3xl font-bold text-white mt-1">
                {results.metadata?.process_count || 0}
              </p>
            </div>
            <CpuChipIcon className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Network</p>
              <p className="text-3xl font-bold text-white mt-1">
                {results.metadata?.connection_count || 0}
              </p>
            </div>
            <GlobeAltIcon className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">IOCs</p>
              <p className="text-3xl font-bold text-white mt-1">
                {Object.values(results.iocs || {}).flat().length || 0}
              </p>
            </div>
            <ShieldExclamationIcon className="w-10 h-10 text-orange-400" />
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Patterns</p>
              <p className="text-3xl font-bold text-white mt-1">
                {results.behavior_patterns?.length || 0}
              </p>
            </div>
            <BugAntIcon className="w-10 h-10 text-red-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-slate-900/30'
                }`}
              >
                <Icon className="w-5 h-5 inline mr-2" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className={activeTab === 'copilot' ? 'h-[600px]' : 'p-6'}>
          {activeTab === 'overview' && <OverviewTab results={results} />}
          {activeTab === 'copilot' && <AICopilot sessionId={sessionId} analysisResults={results} />}
          {activeTab === 'behavior' && <BehaviorTab results={results} />}
          {activeTab === 'network' && <NetworkTab results={results} />}
          {activeTab === 'iocs' && <IOCsTab results={results} />}
          {activeTab === 'mitre' && <MITRETab results={results} />}
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ results }) {
  // Prepare data for charts
  const iocData = Object.entries(results.iocs || {}).map(([type, values]) => ({
    name: type.replace(/_/g, ' ').toUpperCase(),
    count: Array.isArray(values) ? values.length : 0
  })).filter(item => item.count > 0)

  const severityData = (results.behavior_patterns || []).reduce((acc, pattern) => {
    const severity = pattern.severity || 'unknown'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {})

  const severityChartData = Object.entries(severityData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e']

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-3">Analysis Summary</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-300">
            <span className="text-gray-400">Threat Type:</span>{' '}
            <span className="font-semibold text-purple-400">
              {results.classification?.threat_type || 'Unknown'}
            </span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Classification:</span>{' '}
            <span className="font-semibold">
              {results.classification?.family || 'N/A'}
            </span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Severity Score:</span>{' '}
            <span className="font-semibold text-orange-400">
              {results.classification?.severity || 0}/10
            </span>
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* IOC Distribution */}
        {iocData.length > 0 && (
          <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              IOC Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={iocData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Severity Distribution */}
        {severityChartData.length > 0 && (
          <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
              Pattern Severity
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* YARA Rule Preview */}
      {results.yara_rule && (
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
            Generated YARA Rule
          </h3>
          <pre className="bg-slate-950/50 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto border border-slate-700">
            {results.yara_rule.substring(0, 500)}
            {results.yara_rule.length > 500 && '...'}
          </pre>
        </div>
      )}
    </div>
  )
}

// Behavior Tab
function BehaviorTab({ results }) {
  const patterns = results.behavior_patterns || []

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
      case 'high':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
      case 'medium':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
      default:
        return <CheckCircleIcon className="w-5 h-5 text-blue-400" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'border-red-500/50 bg-red-900/10'
      case 'high':
        return 'border-orange-500/50 bg-orange-900/10'
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-900/10'
      default:
        return 'border-blue-500/50 bg-blue-900/10'
    }
  }

  return (
    <div className="space-y-4">
      {patterns.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No behavior patterns detected</p>
      ) : (
        patterns.map((pattern, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getSeverityColor(pattern.severity)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getSeverityIcon(pattern.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-white">{pattern.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    pattern.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    pattern.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    pattern.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {pattern.severity?.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{pattern.description}</p>
                {pattern.confidence && (
                  <p className="text-gray-500 text-xs mt-2">
                    Confidence: {Math.round(pattern.confidence * 100)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// Network Tab
function NetworkTab({ results }) {
  const connections = results.network_connections || []
  const ipAddresses = results.iocs?.ip_addresses || []
  const domains = results.iocs?.domains || []

  return (
    <div className="space-y-6">
      {/* Network Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm">Total Connections</p>
          <p className="text-2xl font-bold text-white mt-1">{connections.length}</p>
        </div>
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm">Unique IPs</p>
          <p className="text-2xl font-bold text-white mt-1">{ipAddresses.length}</p>
        </div>
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm">Domains</p>
          <p className="text-2xl font-bold text-white mt-1">{domains.length}</p>
        </div>
      </div>

      {/* Connections List */}
      {connections.length > 0 && (
        <div className="bg-slate-900/30 rounded-lg border border-slate-700/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
              Network Connections
            </h3>
          </div>
          <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
            {connections.slice(0, 20).map((conn, index) => (
              <div key={index} className="px-4 py-3 hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm">{conn.remote_address}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {conn.protocol} • {conn.state}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">PID: {conn.pid}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// IOCs Tab
function IOCsTab({ results }) {
  const iocs = results.iocs || {}

  const iocCategories = [
    { key: 'ip_addresses', name: 'IP Addresses', icon: ServerIcon },
    { key: 'domains', name: 'Domains', icon: GlobeAltIcon },
    { key: 'file_hashes', name: 'File Hashes', icon: DocumentTextIcon },
    { key: 'file_paths', name: 'File Paths', icon: FolderIcon },
  ]

  return (
    <div className="space-y-4">
      {iocCategories.map((category) => {
        const items = iocs[category.key] || []
        const Icon = category.icon

        if (items.length === 0) return null

        return (
          <div key={category.key} className="bg-slate-900/30 rounded-lg border border-slate-700/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  {category.name}
                </h3>
              </div>
              <span className="text-xs text-gray-500 bg-slate-900/50 px-2 py-1 rounded">
                {items.length} found
              </span>
            </div>
            <div className="divide-y divide-slate-700 max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="px-4 py-2 hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-mono text-sm break-all flex-1">{item}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(item)}
                      className="text-gray-500 hover:text-purple-400 transition-colors flex-shrink-0"
                      title="Copy"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {Object.values(iocs).every(arr => arr.length === 0) && (
        <p className="text-gray-400 text-center py-8">No IOCs extracted</p>
      )}
    </div>
  )
}

// MITRE ATT&CK Tab
function MITRETab({ results }) {
  const techniques = results.mitre_techniques || []

  // Group by tactic
  const groupedByTactic = techniques.reduce((acc, technique) => {
    const tactic = technique.tactic || 'Unknown'
    if (!acc[tactic]) acc[tactic] = []
    acc[tactic].push(technique)
    return acc
  }, {})

  const tacticColors = {
    'Initial Access': 'border-red-500/50 bg-red-900/10',
    'Execution': 'border-orange-500/50 bg-orange-900/10',
    'Persistence': 'border-yellow-500/50 bg-yellow-900/10',
    'Privilege Escalation': 'border-green-500/50 bg-green-900/10',
    'Defense Evasion': 'border-blue-500/50 bg-blue-900/10',
    'Credential Access': 'border-purple-500/50 bg-purple-900/10',
    'Discovery': 'border-pink-500/50 bg-pink-900/10',
    'Lateral Movement': 'border-indigo-500/50 bg-indigo-900/10',
    'Collection': 'border-cyan-500/50 bg-cyan-900/10',
    'Command and Control': 'border-teal-500/50 bg-teal-900/10',
    'Exfiltration': 'border-lime-500/50 bg-lime-900/10',
    'Impact': 'border-rose-500/50 bg-rose-900/10',
  }

  return (
    <div className="space-y-4">
      {techniques.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No MITRE ATT&CK techniques mapped</p>
      ) : (
        Object.entries(groupedByTactic).map(([tactic, techs]) => (
          <div key={tactic} className={`border rounded-lg p-4 ${tacticColors[tactic] || 'border-slate-700 bg-slate-900/10'}`}>
            <h3 className="text-white font-semibold mb-3">{tactic}</h3>
            <div className="space-y-2">
              {techs.map((technique, index) => (
                <div key={index} className="bg-slate-950/30 rounded p-3 border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{technique.name}</p>
                      <p className="text-gray-400 text-sm mt-1">{technique.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-slate-900/50 px-2 py-1 rounded">
                      {technique.technique_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
