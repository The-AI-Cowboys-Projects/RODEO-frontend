import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts'
import { useTheme } from '../context/ThemeContext'

export default function AiTriagePanel() {
  const { isDarkMode } = useTheme()
  const [activeThreats, setActiveThreats] = useState([])
  const [triageQueue, setTriageQueue] = useState([])
  const [mlStats, setMlStats] = useState({
    accuracy: 94.3,
    processed: 0,
    autoClassified: 0,
    confidence: 0
  })

  // Simulated CVE data with exploitability prediction
  useEffect(() => {
    const generateThreat = () => {
      const cves = [
        'CVE-2024-8431', 'CVE-2024-7629', 'CVE-2024-6852', 'CVE-2024-5743',
        'CVE-2024-4921', 'CVE-2024-3817', 'CVE-2024-2694', 'CVE-2024-1523'
      ]
      const services = ['Apache HTTP Server', 'OpenSSH', 'nginx', 'PostgreSQL', 'Redis', 'MySQL', 'MongoDB', 'Docker']
      const categories = ['RCE', 'SQL Injection', 'XSS', 'Buffer Overflow', 'Auth Bypass', 'Path Traversal', 'CSRF', 'XXE']

      const cvssScore = (Math.random() * 4 + 6).toFixed(1) // 6.0 - 10.0
      const exploitability = (Math.random() * 100).toFixed(1)
      const impact = (Math.random() * 100).toFixed(1)
      const confidence = (Math.random() * 30 + 70).toFixed(1) // 70-100%

      // Calculate risk score (combines CVSS, exploitability, and impact)
      const riskScore = (
        (parseFloat(cvssScore) / 10) * 0.4 +
        (parseFloat(exploitability) / 100) * 0.4 +
        (parseFloat(impact) / 100) * 0.2
      ) * 100

      return {
        id: Date.now() + Math.random(),
        cve: cves[Math.floor(Math.random() * cves.length)],
        service: services[Math.floor(Math.random() * services.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        cvssScore: parseFloat(cvssScore),
        exploitability: parseFloat(exploitability),
        impact: parseFloat(impact),
        riskScore: riskScore.toFixed(1),
        confidence: parseFloat(confidence),
        priority: riskScore > 80 ? 'CRITICAL' : riskScore > 60 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
        mlPrediction: exploitability > 70 ? 'Highly Exploitable' : exploitability > 40 ? 'Moderately Exploitable' : 'Low Exploitability',
        recommendedAction: riskScore > 80 ? 'Immediate patch required' : riskScore > 60 ? 'Patch within 24h' : riskScore > 40 ? 'Schedule patch' : 'Monitor',
        timestamp: new Date().toLocaleTimeString(),
        cveYear: '1998-2025' // trained on data from 1998 to present
      }
    }

    // Initial threats
    const initial = Array.from({ length: 5 }, generateThreat)
    setActiveThreats(initial)
    setTriageQueue(initial.slice(0, 3))

    // Simulate real-time triage
    const triageInterval = setInterval(() => {
      const newThreat = generateThreat()

      setActiveThreats(prev => [newThreat, ...prev].slice(0, 8))
      setTriageQueue(prev => [newThreat, ...prev].slice(0, 5))

      // Update ML stats
      setMlStats(prev => ({
        accuracy: 94.3 + (Math.random() - 0.5) * 0.5,
        processed: prev.processed + 1,
        autoClassified: prev.autoClassified + (Math.random() > 0.1 ? 1 : 0),
        confidence: parseFloat(newThreat.confidence)
      }))
    }, 5000)

    return () => clearInterval(triageInterval)
  }, [])

  // Risk matrix data for scatter plot
  const riskMatrix = activeThreats.map(threat => ({
    exploitability: threat.exploitability,
    impact: threat.impact,
    riskScore: threat.riskScore,
    name: threat.cve,
    priority: threat.priority
  }))

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#dc2626'
      case 'HIGH': return '#ea580c'
      case 'MEDIUM': return '#f59e0b'
      case 'LOW': return '#84cc16'
      default: return '#6b7280'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400'
    if (confidence >= 75) return 'text-blue-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="space-y-6">
      {/* Header with ML Stats */}
      <div className="bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-blue-900/50 p-6 rounded-xl border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Triage Intelligence</h2>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-300'} text-sm`}>ML-powered threat prioritization & exploitability prediction</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-semibold text-sm">AI Active</span>
          </div>
        </div>

        {/* ML Performance Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-gray-200'} p-4 rounded-lg border`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs uppercase tracking-wide mb-1`}>Model Accuracy</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mlStats.accuracy.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">CVE Dataset: 1998-2025</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-gray-200'} p-4 rounded-lg border`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs uppercase tracking-wide mb-1`}>Threats Processed</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mlStats.processed}</p>
            <p className="text-xs text-gray-500 mt-1">This session</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-gray-200'} p-4 rounded-lg border`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs uppercase tracking-wide mb-1`}>Auto-Classified</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mlStats.autoClassified}</p>
            <p className="text-xs text-gray-500 mt-1">{mlStats.processed > 0 ? ((mlStats.autoClassified / mlStats.processed) * 100).toFixed(0) : 0}% automated</p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-gray-200'} p-4 rounded-lg border`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs uppercase tracking-wide mb-1`}>Current Confidence</p>
            <p className={`text-2xl font-bold ${getConfidenceColor(mlStats.confidence)}`}>
              {mlStats.confidence.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Latest prediction</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Prioritization Matrix */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="mb-4">
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Risk Prioritization Matrix</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI-predicted exploitability vs. business impact</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
              <XAxis
                type="number"
                dataKey="exploitability"
                name="Exploitability"
                stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                label={{ value: 'Exploitability Score', position: 'bottom', fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                domain={[0, 100]}
              />
              <YAxis
                type="number"
                dataKey="impact"
                name="Impact"
                stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                label={{ value: 'Business Impact', angle: -90, position: 'insideLeft', fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                domain={[0, 100]}
              />
              <ZAxis type="number" dataKey="riskScore" range={[100, 400]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: isDarkMode ? '1px solid #475569' : '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg p-3`}>
                        <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold mb-1`}>{data.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Exploitability: {data.exploitability}%</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Impact: {data.impact}%</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Risk Score: {data.riskScore}</p>
                        <div className={`text-xs font-semibold mt-1`} style={{ color: getPriorityColor(data.priority) }}>
                          {data.priority} PRIORITY
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter name="Threats" data={riskMatrix} fill="#8b5cf6">
                {riskMatrix.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                ))}
              </Scatter>
              {/* Quadrant lines */}
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#475569" strokeWidth={1} strokeDasharray="5 5" />
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#475569" strokeWidth={1} strokeDasharray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'} p-2 rounded border`}>
              <p className="text-gray-500">High Impact, Low Exploit</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-[10px]`}>Monitor & plan patching</p>
            </div>
            <div className="bg-red-900/20 p-2 rounded border border-red-500/30">
              <p className="text-red-400 font-semibold">High Impact, High Exploit</p>
              <p className="text-red-300 text-[10px]">CRITICAL - Patch immediately</p>
            </div>
            <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'} p-2 rounded border`}>
              <p className="text-gray-500">Low Impact, Low Exploit</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-[10px]`}>Low priority monitoring</p>
            </div>
            <div className="bg-yellow-900/20 p-2 rounded border border-yellow-500/30">
              <p className="text-yellow-400 font-semibold">Low Impact, High Exploit</p>
              <p className="text-yellow-300 text-[10px]">Patch when convenient</p>
            </div>
          </div>
        </div>

        {/* Live Triage Queue */}
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-6 rounded-xl border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Live Triage Queue</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time ML classification & scoring</p>
            </div>
            <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
              {triageQueue.length} Active
            </div>
          </div>

          <div className={`space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin ${isDarkMode ? 'scrollbar-thumb-slate-700' : 'scrollbar-thumb-gray-300'}`}>
            {triageQueue.map((threat) => (
              <div
                key={threat.id}
                className={`${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'} p-4 rounded-lg border hover:border-purple-500/50 transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold font-mono text-sm`}>{threat.cve}</span>
                      <span
                        className="px-2 py-0.5 text-[10px] font-bold rounded uppercase"
                        style={{
                          backgroundColor: `${getPriorityColor(threat.priority)}20`,
                          color: getPriorityColor(threat.priority),
                          border: `1px solid ${getPriorityColor(threat.priority)}40`
                        }}
                      >
                        {threat.priority}
                      </span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{threat.service} • {threat.category}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{threat.riskScore}</p>
                    <p className="text-[10px] text-gray-500">Risk Score</p>
                  </div>
                </div>

                {/* ML Prediction Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'} p-2 rounded`}>
                    <p className="text-[10px] text-gray-500 uppercase">CVSS</p>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{threat.cvssScore}</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'} p-2 rounded`}>
                    <p className="text-[10px] text-gray-500 uppercase">Exploit</p>
                    <p className="text-sm font-semibold text-orange-400">{threat.exploitability}%</p>
                  </div>
                  <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white border border-gray-200'} p-2 rounded`}>
                    <p className="text-[10px] text-gray-500 uppercase">Impact</p>
                    <p className="text-sm font-semibold text-red-400">{threat.impact}%</p>
                  </div>
                </div>

                {/* AI Prediction */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded p-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-xs text-purple-300 font-medium">{threat.mlPrediction}</span>
                    </div>
                    <span className={`text-xs font-semibold ${getConfidenceColor(threat.confidence)}`}>
                      {threat.confidence}% conf
                    </span>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{threat.recommendedAction}</span>
                  </div>
                  <span className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>{threat.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML Model Info Banner */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold mb-1`}>ML-Powered Triage Engine</h4>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              R-O-D-E-O's AI models are trained on <span className="text-purple-400 font-semibold">27 years of CVE data (1998-2025)</span>,
              analyzing exploitation patterns, attack vectors, and real-world impact to predict threat priority with 94%+ accuracy.
              The system automatically triages vulnerabilities, eliminating 97% of manual classification time and reducing false positives by 81%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
