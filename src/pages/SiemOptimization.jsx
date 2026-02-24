import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts'

export default function SiemOptimization() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [timeRange, setTimeRange] = useState('week') // week, month, year

  // Simulated efficiency metrics - showing dramatic improvements
  const efficiencyMetrics = {
    avgTriageTime: {
      manual: 180, // 3 hours in minutes
      rodeo: 4,
      unit: 'minutes',
      improvement: 97.8
    },
    falsePositiveRate: {
      manual: 65,
      rodeo: 12,
      unit: '%',
      improvement: 81.5
    },
    analystTimeSaved: {
      perDay: 5.2,
      perWeek: 36.4,
      perMonth: 156,
      unit: 'hours'
    },
    autoRemediationRate: {
      value: 73,
      unit: '%'
    },
    mttd: {
      manual: 48,
      rodeo: 0.5,
      unit: 'hours',
      improvement: 99
    },
    mttr: {
      manual: 168, // 1 week
      rodeo: 4,
      unit: 'hours',
      improvement: 97.6
    }
  }

  // Before/After comparison data
  const workloadComparison = [
    { metric: 'Daily Alerts', before: 12500, after: 2400 },
    { metric: 'False Positives', before: 8125, after: 288 },
    { metric: 'Manual Reviews', before: 4375, after: 672 },
    { metric: 'Actionable Threats', before: 4375, after: 2112 },
  ]

  // Time savings over period
  const timeSavingsTrend = [
    { week: 'Week 1', manual: 40, rodeo: 35, savings: 5 },
    { week: 'Week 2', manual: 40, rodeo: 30, savings: 10 },
    { week: 'Week 3', manual: 40, rodeo: 25, savings: 15 },
    { week: 'Week 4', manual: 40, rodeo: 20, savings: 20 },
    { week: 'Week 5', manual: 40, rodeo: 15, savings: 25 },
    { week: 'Week 6', manual: 40, rodeo: 10, savings: 30 },
    { week: 'Week 7', manual: 40, rodeo: 8, savings: 32 },
    { week: 'Week 8', manual: 40, rodeo: 6, savings: 34 },
  ]

  // Capability improvement radar
  const capabilityData = [
    { capability: 'Threat Detection', manual: 65, rodeo: 95 },
    { capability: 'Response Speed', manual: 45, rodeo: 98 },
    { capability: 'Coverage', manual: 70, rodeo: 92 },
    { capability: 'Accuracy', manual: 60, rodeo: 94 },
    { capability: 'Automation', manual: 25, rodeo: 88 },
    { capability: 'Scalability', manual: 50, rodeo: 96 },
  ]

  // Cost savings calculation
  const costMetrics = {
    analystHourlyCost: 85, // Average SOC analyst hourly rate
    incidentCostManual: 12500,
    incidentCostRodeo: 850,
    breachRiskReduction: 87, // percentage
    monthlyLicenseCost: 2500,
    teamSize: 5
  }

  const monthlySavings =
    (efficiencyMetrics.analystTimeSaved.perMonth * costMetrics.analystHourlyCost * costMetrics.teamSize) +
    ((costMetrics.incidentCostManual - costMetrics.incidentCostRodeo) * 15) // avg 15 incidents/month

  const annualSavings = monthlySavings * 12
  const roi = ((annualSavings - (costMetrics.monthlyLicenseCost * 12)) / (costMetrics.monthlyLicenseCost * 12) * 100).toFixed(0)

  // Automation breakdown
  const automationBreakdown = [
    { stage: 'Discovery', automated: 95, manual: 5 },
    { stage: 'Scanning', automated: 98, manual: 2 },
    { stage: 'Triage', automated: 88, manual: 12 },
    { stage: 'Prioritization', automated: 92, manual: 8 },
    { stage: 'Reporting', automated: 96, manual: 4 },
    { stage: 'Ticketing', automated: 94, manual: 6 },
    { stage: 'Patching', automated: 73, manual: 27 },
    { stage: 'Verification', automated: 85, manual: 15 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className={'mb-2 flex items-center space-x-2 transition-colors ' + (
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            SIEM Optimization Metrics
          </h1>
          <p className={'mt-1 ' + (isDarkMode ? 'text-gray-400' : 'text-gray-600')}>How R-O-D-E-O transforms security operations efficiency</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={'px-4 py-2 rounded-lg transition-colors ' + (
              timeRange === 'week'
                ? 'bg-purple-600 text-white'
                : isDarkMode
                  ? 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={'px-4 py-2 rounded-lg transition-colors ' + (
              timeRange === 'month'
                ? 'bg-purple-600 text-white'
                : isDarkMode
                  ? 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={'px-4 py-2 rounded-lg transition-colors ' + (
              timeRange === 'year'
                ? 'bg-purple-600 text-white'
                : isDarkMode
                  ? 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            )}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Performance Indicators - Big Impact Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Triage Time Reduction */}
        <div className="bg-gradient-to-br from-purple-900/50 to-slate-800 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              ↓ {efficiencyMetrics.avgTriageTime.improvement}%
            </div>
          </div>
          <h3 className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium mb-2'}>Average Triage Time</h3>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{efficiencyMetrics.avgTriageTime.rodeo}</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{efficiencyMetrics.avgTriageTime.unit}</span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="line-through">{efficiencyMetrics.avgTriageTime.manual} {efficiencyMetrics.avgTriageTime.unit}</span>
            <span className="ml-1">manual process</span>
          </div>
        </div>

        {/* False Positive Reduction */}
        <div className="bg-gradient-to-br from-blue-900/50 to-slate-800 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              ↓ {efficiencyMetrics.falsePositiveRate.improvement}%
            </div>
          </div>
          <h3 className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium mb-2'}>False Positive Rate</h3>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{efficiencyMetrics.falsePositiveRate.rodeo}</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{efficiencyMetrics.falsePositiveRate.unit}</span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="line-through">{efficiencyMetrics.falsePositiveRate.manual}{efficiencyMetrics.falsePositiveRate.unit}</span>
            <span className="ml-1">industry average</span>
          </div>
        </div>

        {/* Time Saved */}
        <div className="bg-gradient-to-br from-green-900/50 to-slate-800 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              Per Analyst
            </div>
          </div>
          <h3 className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium mb-2'}>Analyst Time Saved</h3>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{efficiencyMetrics.analystTimeSaved.perWeek}</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>hours/week</span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            ~{efficiencyMetrics.analystTimeSaved.perMonth} hours/month per analyst
          </div>
        </div>

        {/* MTTD Reduction */}
        <div className="bg-gradient-to-br from-orange-900/50 to-slate-800 p-6 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              ↓ {efficiencyMetrics.mttd.improvement}%
            </div>
          </div>
          <h3 className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium mb-2'}>Mean Time to Detect (MTTD)</h3>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{efficiencyMetrics.mttd.rodeo}</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{efficiencyMetrics.mttd.unit}</span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="line-through">{efficiencyMetrics.mttd.manual} {efficiencyMetrics.mttd.unit}</span>
            <span className="ml-1">manual detection</span>
          </div>
        </div>

        {/* MTTR Reduction */}
        <div className="bg-gradient-to-br from-red-900/50 to-slate-800 p-6 rounded-xl border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
              ↓ {efficiencyMetrics.mttr.improvement}%
            </div>
          </div>
          <h3 className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium mb-2'}>Mean Time to Respond (MTTR)</h3>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{efficiencyMetrics.mttr.rodeo}</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{efficiencyMetrics.mttr.unit}</span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            <span className="line-through">{efficiencyMetrics.mttr.manual} {efficiencyMetrics.mttr.unit}</span>
            <span className="ml-1">manual response</span>
          </div>
        </div>

        {/* Auto-Remediation Rate */}
        <div className="bg-gradient-to-br from-teal-900/50 to-slate-800 p-6 rounded-xl border border-teal-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold">
              Autonomous
            </div>
          </div>
          <h3 className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm font-medium mb-2'}>Auto-Remediation Rate</h3>
          <div className="flex items-baseline space-x-2 mb-2">
            <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{efficiencyMetrics.autoRemediationRate.value}</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{efficiencyMetrics.autoRemediationRate.unit}</span>
          </div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Patches applied without manual intervention
          </div>
        </div>
      </div>

      {/* Before/After Workload Comparison */}
      <div className={'p-6 rounded-xl border ' + (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={'text-2xl font-bold ' + (isDarkMode ? 'text-white' : 'text-gray-900')}>Daily Workload Transformation</h2>
            <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mt-1'}>Alert volume and analyst burden comparison</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className={'text-sm ' + (isDarkMode ? 'text-gray-400' : 'text-gray-700')}>Before R-O-D-E-O</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className={'text-sm ' + (isDarkMode ? 'text-gray-400' : 'text-gray-700')}>With R-O-D-E-O</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={workloadComparison} barCategoryGap="20%">
            <defs>
              <linearGradient id="beforeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="afterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
            <XAxis dataKey="metric" stroke={isDarkMode ? '#94a3b8' : '#4b5563'} tick={{ fontSize: 12, fontWeight: 500 }} />
            <YAxis stroke={isDarkMode ? '#94a3b8' : '#4b5563'} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
              cursor={{ fill: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="before"
              fill="url(#beforeGradient)"
              name="Before R-O-D-E-O"
              radius={[4, 4, 0, 0]}
              filter={isDarkMode ? 'url(#glow)' : undefined}
            />
            <Bar
              dataKey="after"
              fill="url(#afterGradient)"
              name="With R-O-D-E-O"
              radius={[4, 4, 0, 0]}
              filter={isDarkMode ? 'url(#glow)' : undefined}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time Savings Trend & Capability Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Savings Trend */}
        <div className={'p-6 rounded-xl border ' + (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
          <h2 className={'text-2xl font-bold mb-2 ' + (isDarkMode ? 'text-white' : 'text-gray-900')}>Analyst Time Savings Trend</h2>
          <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mb-6'}>Weekly hours saved per analyst over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSavingsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
              <XAxis dataKey="week" stroke={isDarkMode ? '#94a3b8' : '#4b5563'} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#4b5563'} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: isDarkMode ? '#94a3b8' : '#4b5563' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="manual" stroke="#ef4444" strokeWidth={2} name="Manual Process" dot={false} />
              <Line type="monotone" dataKey="rodeo" stroke="#10b981" strokeWidth={2} name="With R-O-D-E-O" />
              <Line type="monotone" dataKey="savings" stroke="#8b5cf6" strokeWidth={3} name="Hours Saved" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Capability Improvement Radar */}
        <div className={'p-6 rounded-xl border ' + (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
          <h2 className={'text-2xl font-bold mb-2 ' + (isDarkMode ? 'text-white' : 'text-gray-900')}>Security Operations Capability</h2>
          <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mb-6'}>Performance across key operational areas</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={capabilityData}>
              <PolarGrid stroke={isDarkMode ? '#334155' : '#e5e7eb'} />
              <PolarAngleAxis dataKey="capability" stroke={isDarkMode ? '#94a3b8' : '#4b5563'} tick={{ fill: isDarkMode ? '#94a3b8' : '#4b5563', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={isDarkMode ? '#94a3b8' : '#4b5563'} />
              <Radar name="Manual Process" dataKey="manual" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Radar name="With R-O-D-E-O" dataKey="rodeo" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Automation Breakdown */}
      <div className={'p-6 rounded-xl border ' + (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
        <h2 className={'text-2xl font-bold mb-2 ' + (isDarkMode ? 'text-white' : 'text-gray-900')}>Workflow Automation Breakdown</h2>
        <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm mb-6'}>Automation percentage by security workflow stage</p>
        <div className="space-y-4">
          {automationBreakdown.map((stage, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' font-medium'}>{stage.stage}</span>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="text-green-500 font-semibold">{stage.automated}%</span> automated · {stage.manual}% manual
                </span>
              </div>
              <div className={`w-full rounded-full h-3 overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stage.automated}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI & Cost Savings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-900/50 to-slate-800 p-6 rounded-xl border border-yellow-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm'}>Monthly Savings</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${(monthlySavings / 1000).toFixed(1)}K</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Analyst time + incident cost reduction
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/50 to-slate-800 p-6 rounded-xl border border-emerald-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm'}>Annual Savings</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${(annualSavings / 1000).toFixed(1)}K</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Total cost reduction per year
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-slate-800 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm'}>ROI</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{roi}%</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Return on investment (annual)
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
        <h2 className={'text-2xl font-bold mb-4 ' + (isDarkMode ? 'text-white' : 'text-gray-900')}>Key Optimization Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' font-medium mb-1'}>AI-Powered Triage</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>ML models trained on 25+ years of CVE data automatically prioritize threats with 94% accuracy, eliminating manual sorting.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' font-medium mb-1'}>Alert Fatigue Eliminated</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Intelligent filtering reduces daily alerts by 81%, allowing analysts to focus on genuine threats instead of false positives.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' font-medium mb-1'}>Autonomous Operations</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>From discovery to patching, 88% of security workflows run autonomously, freeing teams for strategic initiatives.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' font-medium mb-1'}>Real-Time Response</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Automated ticket creation and patch deployment reduces response time from days to hours, containing threats faster.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
