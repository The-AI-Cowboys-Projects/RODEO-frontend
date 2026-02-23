import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  MagnifyingGlassCircleIcon,
  ViewfinderCircleIcon,
  CpuChipIcon,
  ChartBarSquareIcon,
  DocumentChartBarIcon,
  TicketIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// Stage icons as React components
const StageIcons = {
  Discovery: MagnifyingGlassCircleIcon,
  Scanning: ViewfinderCircleIcon,
  Triage: CpuChipIcon,
  Prioritization: ChartBarSquareIcon,
  Reporting: DocumentChartBarIcon,
  Ticketing: TicketIcon,
  Patching: WrenchScrewdriverIcon,
  Verification: ShieldCheckIcon
}

export default function WorkflowAutomation() {
  const [activeStage, setActiveStage] = useState(0)
  const [stageMetrics, setStageMetrics] = useState([])

  // Workflow stages with detailed metrics
  const workflowStages = [
    {
      id: 1,
      name: 'Discovery',
      description: 'Asset & vulnerability discovery',
      automation: 98,
      avgTime: '2 min',
      manualTime: '2 hours',
      timeSaved: '98%',
      color: '#3b82f6',
      status: 'completed',
      details: [
        'Network scanning',
        'Service enumeration',
        'Port detection',
        'Asset inventory'
      ]
    },
    {
      id: 2,
      name: 'Scanning',
      description: 'Vulnerability scanning & detection',
      automation: 95,
      avgTime: '5 min',
      manualTime: '4 hours',
      timeSaved: '97%',
      color: '#8b5cf6',
      status: 'active',
      details: [
        'CVE matching',
        'Version detection',
        'Exploit mapping',
        'Risk scoring'
      ]
    },
    {
      id: 3,
      name: 'Triage',
      description: 'AI-powered threat prioritization',
      automation: 94,
      avgTime: '4 min',
      manualTime: '3 hours',
      timeSaved: '98%',
      color: '#a855f7',
      status: 'pending',
      details: [
        'ML classification',
        'Exploitability prediction',
        'Priority assignment',
        'False positive filtering'
      ]
    },
    {
      id: 4,
      name: 'Prioritization',
      description: 'Business impact assessment',
      automation: 92,
      avgTime: '3 min',
      manualTime: '2 hours',
      timeSaved: '97%',
      color: '#ec4899',
      status: 'pending',
      details: [
        'Impact analysis',
        'Asset criticality',
        'Risk quantification',
        'SLA alignment'
      ]
    },
    {
      id: 5,
      name: 'Reporting',
      description: 'Automated report generation',
      automation: 96,
      avgTime: '1 min',
      manualTime: '1 hour',
      timeSaved: '98%',
      color: '#f59e0b',
      status: 'pending',
      details: [
        'Executive summaries',
        'Technical details',
        'Compliance mapping',
        'Trend analysis'
      ]
    },
    {
      id: 6,
      name: 'Ticketing',
      description: 'ServiceNow/Jira integration',
      automation: 94,
      avgTime: '30 sec',
      manualTime: '30 min',
      timeSaved: '99%',
      color: '#10b981',
      status: 'pending',
      details: [
        'Ticket creation',
        'Assignment routing',
        'Status tracking',
        'Auto-updates'
      ]
    },
    {
      id: 7,
      name: 'Patching',
      description: 'Automated patch deployment',
      automation: 73,
      avgTime: '15 min',
      manualTime: '2 hours',
      timeSaved: '87%',
      color: '#14b8a6',
      status: 'pending',
      details: [
        'Patch validation',
        'Deployment planning',
        'Rollback prep',
        'Application'
      ]
    },
    {
      id: 8,
      name: 'Verification',
      description: 'Post-patch validation',
      automation: 85,
      avgTime: '5 min',
      manualTime: '1 hour',
      timeSaved: '92%',
      color: '#06b6d4',
      status: 'pending',
      details: [
        'Vulnerability rescan',
        'Service health check',
        'Confirmation',
        'Documentation'
      ]
    }
  ]

  // Simulate workflow progression
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev + 1) % workflowStages.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Update metrics for chart
  useEffect(() => {
    setStageMetrics(workflowStages.map(stage => ({
      name: stage.name,
      automation: stage.automation,
      manual: 100 - stage.automation
    })))
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'active': return 'bg-blue-500/20 border-blue-500/50 text-blue-400'
      case 'pending': return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓'
      case 'active': return '⟳'
      case 'pending': return '○'
      default: return '○'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 p-6 rounded-xl border border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Automated Workflow Pipeline</h2>
              <p className="text-gray-400 text-sm">End-to-end security operations automation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-semibold text-sm">Pipeline Active</span>
          </div>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Overall Automation</p>
            <p className="text-2xl font-bold text-white">91%</p>
            <p className="text-xs text-gray-500 mt-1">Across all stages</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Time</p>
            <p className="text-2xl font-bold text-white">35 min</p>
            <p className="text-xs text-gray-500 mt-1">Discovery → Verification</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Manual Process</p>
            <p className="text-2xl font-bold text-red-400">15.5 hrs</p>
            <p className="text-xs text-gray-500 mt-1">Traditional workflow</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Time Saved</p>
            <p className="text-2xl font-bold text-green-400">96%</p>
            <p className="text-xs text-gray-500 mt-1">Efficiency gain</p>
          </div>
        </div>
      </div>

      {/* Workflow Stages Visualization */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-6">Pipeline Stages</h3>

        {/* Stage Flow */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />

          {/* Stages */}
          <div className="grid grid-cols-4 gap-4 relative z-10">
            {workflowStages.map((stage, idx) => (
              <div
                key={stage.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  idx === activeStage ? 'transform scale-105' : ''
                }`}
                onMouseEnter={() => setActiveStage(idx)}
              >
                {/* Stage Card */}
                <div
                  className={`bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border transition-all duration-300 ${
                    idx === activeStage
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  style={{
                    borderColor: idx === activeStage ? stage.color : undefined
                  }}
                >
                  {/* Stage Icon & Name */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const IconComponent = StageIcons[stage.name]
                        return (
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300"
                            style={{
                              backgroundColor: `${stage.color}20`,
                            }}
                          >
                            {/* Glow effect on hover */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300 blur-md"
                              style={{ backgroundColor: stage.color }}
                            />
                            <IconComponent
                              className="w-6 h-6 relative z-10"
                              style={{ color: stage.color }}
                            />
                          </div>
                        )
                      })()}
                      <div>
                        <p className="text-white font-semibold text-sm">{stage.name}</p>
                        <p className="text-[10px] text-gray-500">Stage {stage.id}/8</p>
                      </div>
                    </div>
                  </div>

                  {/* Automation Percentage */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Automated</span>
                      <span className="font-bold" style={{ color: stage.color }}>
                        {stage.automation}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${stage.automation}%`,
                          backgroundColor: stage.color
                        }}
                      />
                    </div>
                  </div>

                  {/* Time Metrics */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Automated:</span>
                      <span className="text-green-400 font-semibold">{stage.avgTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Manual:</span>
                      <span className="text-gray-400 line-through">{stage.manualTime}</span>
                    </div>
                  </div>

                  {/* Hover Details */}
                  <div className="mt-3 pt-3 border-t border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-gray-400 mb-2">{stage.description}</p>
                    <div className="space-y-1">
                      {stage.details.map((detail, i) => (
                        <div key={i} className="flex items-center space-x-1">
                          <div className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="text-[10px] text-gray-500">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Automation Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Automation vs Manual Effort</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageMetrics} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={90} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="automation" stackId="a" fill="#10b981" name="Automated" />
              <Bar dataKey="manual" stackId="a" fill="#ef4444" name="Manual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Stage Details */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Stage Details</h3>
          <div
            className="p-6 rounded-lg border-2 mb-4"
            style={{
              backgroundColor: `${workflowStages[activeStage].color}10`,
              borderColor: `${workflowStages[activeStage].color}40`
            }}
          >
            <div className="flex items-center space-x-3 mb-4">
              {(() => {
                const activeStageData = workflowStages[activeStage]
                const IconComponent = StageIcons[activeStageData.name]
                return (
                  <>
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden"
                      style={{
                        backgroundColor: `${activeStageData.color}20`,
                      }}
                    >
                      {/* Animated glow ring */}
                      <div
                        className="absolute inset-0 animate-pulse opacity-30"
                        style={{
                          background: `radial-gradient(circle, ${activeStageData.color}40 0%, transparent 70%)`
                        }}
                      />
                      <IconComponent
                        className="w-8 h-8 relative z-10"
                        style={{ color: activeStageData.color }}
                      />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white">{activeStageData.name}</h4>
                      <p className="text-sm text-gray-400">{activeStageData.description}</p>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Automation Level</p>
                <p className="text-2xl font-bold" style={{ color: workflowStages[activeStage].color }}>
                  {workflowStages[activeStage].automation}%
                </p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Time Saved</p>
                <p className="text-2xl font-bold text-green-400">{workflowStages[activeStage].timeSaved}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Key Activities:</p>
              {workflowStages[activeStage].details.map((detail, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: workflowStages[activeStage].color }}
                  />
                  <span className="text-sm text-gray-300">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
              <p className="text-xs text-green-400 font-semibold mb-1">R-O-D-E-O Automated</p>
              <p className="text-xl font-bold text-white">{workflowStages[activeStage].avgTime}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              <p className="text-xs text-red-400 font-semibold mb-1">Manual Process</p>
              <p className="text-xl font-bold text-white line-through opacity-50">
                {workflowStages[activeStage].manualTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Workflow Automation Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Lightning Fast</p>
              <p className="text-sm text-gray-400">Complete security workflows in minutes instead of hours, enabling rapid threat response.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Consistent Quality</p>
              <p className="text-sm text-gray-400">Eliminate human error with standardized, repeatable processes across all security operations.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">Massive ROI</p>
              <p className="text-sm text-gray-400">Reduce operational costs by 96% while increasing security coverage and team productivity.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
