import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  BoltIcon,
  FlagIcon,
  CheckCircleIcon,
  EllipsisHorizontalCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

const phaseConfig = {
  reconnaissance: {
    name: 'Reconnaissance',
    icon: MagnifyingGlassIcon,
    description: 'Discovery and information gathering',
    color: 'blue'
  },
  vulnerability_scan: {
    name: 'Vulnerability Scan',
    icon: ShieldCheckIcon,
    description: 'Security vulnerability detection',
    color: 'yellow'
  },
  exploitation: {
    name: 'Exploitation',
    icon: BoltIcon,
    description: 'Vulnerability exploitation and validation',
    color: 'orange'
  },
  post_exploitation: {
    name: 'Post-Exploitation',
    icon: FlagIcon,
    description: 'Post-exploitation activities',
    color: 'red'
  }
}

const statusConfig = {
  pending: { icon: EllipsisHorizontalCircleIcon, color: 'gray', label: 'Pending' },
  running: { icon: ArrowPathIcon, color: 'info', label: 'Running', animate: true },
  completed: { icon: CheckCircleIcon, color: 'success', label: 'Completed' },
  failed: { icon: ExclamationCircleIcon, color: 'danger', label: 'Failed' },
  skipped: { icon: EllipsisHorizontalCircleIcon, color: 'gray', label: 'Skipped' }
}

const WorkflowProgress = ({
  phases = [],
  currentPhase = null,
  onPhaseClick,
  showDetails = true
}) => {
  const { isDarkMode } = useTheme()
  const [expandedPhase, setExpandedPhase] = useState(null)

  // Default phases if none provided
  const workflowPhases = phases.length > 0 ? phases : [
    { id: 'reconnaissance', status: 'pending', tools: [], findings: 0, duration: null },
    { id: 'vulnerability_scan', status: 'pending', tools: [], findings: 0, duration: null },
    { id: 'exploitation', status: 'pending', tools: [], findings: 0, duration: null },
    { id: 'post_exploitation', status: 'pending', tools: [], findings: 0, duration: null }
  ]

  const getPhaseStatus = (phase) => {
    return statusConfig[phase.status] || statusConfig.pending
  }

  const getPhaseConfig = (phaseId) => {
    return phaseConfig[phaseId] || {
      name: phaseId,
      icon: EllipsisHorizontalCircleIcon,
      description: '',
      color: 'gray'
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '--'
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const calculateProgress = () => {
    const completed = workflowPhases.filter(p => p.status === 'completed').length
    return Math.round((completed / workflowPhases.length) * 100)
  }

  const totalFindings = workflowPhases.reduce((sum, p) => sum + (p.findings || 0), 0)
  const totalDuration = workflowPhases.reduce((sum, p) => sum + (p.duration || 0), 0)

  return (
    <div className={`backdrop-blur-sm rounded-xl shadow-lg border ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
      {/* Header */}
      <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Attack Chain Progress
          </h3>
          <div className="flex items-center gap-6 text-base">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 bg-slate-700' : 'text-gray-600 bg-gray-100'}`}>
              <ClockIcon className="w-5 h-5" />
              <span className="font-bold">{formatDuration(totalDuration)}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-300 bg-slate-700' : 'text-gray-600 bg-gray-100'}`}>
              <ExclamationCircleIcon className="w-5 h-5" />
              <span className="font-bold">{totalFindings} findings</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="relative pt-2">
          <div className="flex mb-3 items-center justify-between">
            <div>
              <span className={`text-lg font-bold inline-block ${isDarkMode ? 'text-[#E8B4E6]' : 'text-primary-600'}`}>
                {calculateProgress()}% Complete
              </span>
            </div>
          </div>
          <div className={`overflow-hidden h-4 text-xs flex rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              style={{ width: `${calculateProgress()}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="p-6">
        <div className="relative">
          {/* Connecting Line */}
          <div className={`absolute left-8 top-10 bottom-10 w-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

          {/* Phase Items */}
          <div className="space-y-8">
            {workflowPhases.map((phase, index) => {
              const config = getPhaseConfig(phase.id)
              const status = getPhaseStatus(phase)
              const PhaseIcon = config.icon
              const StatusIcon = status.icon
              const isExpanded = expandedPhase === phase.id
              const isCurrent = currentPhase === phase.id

              return (
                <div
                  key={phase.id}
                  className={`relative pl-20 ${
                    isCurrent
                      ? isDarkMode
                        ? 'bg-primary-900/20 -ml-4 -mr-4 pl-24 py-4 rounded-xl'
                        : 'bg-primary-50 -ml-4 -mr-4 pl-24 py-4 rounded-xl'
                      : ''
                  }`}
                >
                  {/* Phase Icon */}
                  <div
                    className={`absolute left-0 w-16 h-16 flex items-center justify-center rounded-full border-3 transition-colors shadow-lg ${
                      phase.status === 'completed'
                        ? isDarkMode ? 'bg-success-900/30 border-success-500 shadow-success-500/30' : 'bg-success-100 border-success-500 shadow-success-500/30'
                        : phase.status === 'running'
                        ? isDarkMode ? 'bg-info-900/30 border-info-500 shadow-info-500/30' : 'bg-info-100 border-info-500 shadow-info-500/30'
                        : phase.status === 'failed'
                        ? isDarkMode ? 'bg-danger-900/30 border-danger-500 shadow-danger-500/30' : 'bg-danger-100 border-danger-500 shadow-danger-500/30'
                        : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <PhaseIcon className={`w-7 h-7 ${
                      phase.status === 'completed'
                        ? isDarkMode ? 'text-success-400' : 'text-success-600'
                        : phase.status === 'running'
                        ? isDarkMode ? 'text-info-400' : 'text-info-600'
                        : phase.status === 'failed'
                        ? isDarkMode ? 'text-danger-400' : 'text-danger-600'
                        : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>

                  {/* Phase Content */}
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setExpandedPhase(isExpanded ? null : phase.id)
                      onPhaseClick && onPhaseClick(phase)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {config.name}
                          </h4>
                          <span className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-full ${
                            phase.status === 'completed'
                              ? isDarkMode ? 'bg-success-900/30 text-success-400' : 'bg-success-100 text-success-800'
                              : phase.status === 'running'
                              ? isDarkMode ? 'bg-info-900/30 text-info-400' : 'bg-info-100 text-info-800'
                              : phase.status === 'failed'
                              ? isDarkMode ? 'bg-danger-900/30 text-danger-400' : 'bg-danger-100 text-danger-800'
                              : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <StatusIcon className={`w-4 h-4 ${status.animate ? 'animate-spin' : ''}`} />
                            {status.label}
                          </span>
                        </div>
                        <p className={`text-base mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {config.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        {phase.findings > 0 && (
                          <span className={`text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {phase.findings} findings
                          </span>
                        )}
                        {phase.duration && (
                          <span className={`text-base font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {formatDuration(phase.duration)}
                          </span>
                        )}
                        {showDetails && (
                          isExpanded
                            ? <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                            : <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {showDetails && isExpanded && (
                      <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        {phase.tools && phase.tools.length > 0 ? (
                          <div>
                            <h5 className={`text-xs font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Tools Used
                            </h5>
                            <div className="space-y-2">
                              {phase.tools.map((tool, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between text-sm rounded p-2 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      tool.status === 'completed' ? 'bg-success-500' :
                                      tool.status === 'running' ? 'bg-info-500 animate-pulse' :
                                      tool.status === 'failed' ? 'bg-danger-500' :
                                      'bg-gray-400'
                                    }`} />
                                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {tool.name}
                                    </span>
                                  </div>
                                  <div className={`flex items-center gap-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {tool.findings !== undefined && (
                                      <span>{tool.findings} findings</span>
                                    )}
                                    {tool.duration && (
                                      <span>{formatDuration(tool.duration)}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No tools executed yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowProgress
