import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BugAntIcon,
  GlobeAltIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '../context/ThemeContext'

export default function AnalysisProgress({ sessionId, onComplete }) {
  const { isDarkMode } = useTheme()
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('initializing')
  const [showVNC, setShowVNC] = useState(true)
  const [vncExpanded, setVncExpanded] = useState(false)

  // Analysis stages with icons and descriptions
  const stages = [
    {
      id: 'initializing',
      name: 'Initializing',
      description: 'Setting up sandbox environment',
      icon: CpuChipIcon,
      weight: 5
    },
    {
      id: 'vm_startup',
      name: 'VM Startup',
      description: 'Starting virtual machine',
      icon: ArrowPathIcon,
      weight: 10
    },
    {
      id: 'sample_transfer',
      name: 'Sample Transfer',
      description: 'Transferring sample to VM',
      icon: DocumentMagnifyingGlassIcon,
      weight: 5
    },
    {
      id: 'execution',
      name: 'Execution',
      description: 'Running sample and monitoring',
      icon: BugAntIcon,
      weight: 30
    },
    {
      id: 'network_analysis',
      name: 'Network Analysis',
      description: 'Analyzing network connections',
      icon: GlobeAltIcon,
      weight: 15
    },
    {
      id: 'behavior_analysis',
      name: 'Behavior Analysis',
      description: 'Detecting malicious patterns',
      icon: ChartBarIcon,
      weight: 15
    },
    {
      id: 'ioc_extraction',
      name: 'IOC Extraction',
      description: 'Extracting indicators of compromise',
      icon: ShieldCheckIcon,
      weight: 10
    },
    {
      id: 'report_generation',
      name: 'Report Generation',
      description: 'Generating analysis report',
      icon: ChartBarIcon,
      weight: 10
    }
  ]

  // Poll session status
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sandbox/sessions/${sessionId}`)
      if (!response.ok) throw new Error('Failed to fetch session')
      return response.json()
    },
    refetchInterval: (data) => {
      // Stop polling when complete or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false
      }
      return 2000 // Poll every 2 seconds
    },
    enabled: !!sessionId
  })

  // Update progress based on session status
  useEffect(() => {
    if (!sessionData) return

    const stageIndex = stages.findIndex(s => s.id === sessionData.current_stage)
    if (stageIndex >= 0) {
      setCurrentStage(sessionData.current_stage)

      // Calculate cumulative progress
      const completedWeight = stages
        .slice(0, stageIndex)
        .reduce((sum, stage) => sum + stage.weight, 0)

      const totalWeight = stages.reduce((sum, stage) => sum + stage.weight, 0)
      const progressPercent = (completedWeight / totalWeight) * 100

      setProgress(progressPercent)
    }

    // Notify parent when complete
    if (sessionData.status === 'completed' && onComplete) {
      setProgress(100)
      onComplete(sessionData)
    }
  }, [sessionData])

  const getStageStatus = (stageId) => {
    const stageIndex = stages.findIndex(s => s.id === stageId)
    const currentIndex = stages.findIndex(s => s.id === currentStage)

    if (sessionData?.status === 'failed') {
      if (stageIndex <= currentIndex) return 'failed'
      return 'pending'
    }

    if (stageIndex < currentIndex) return 'completed'
    if (stageIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return isDarkMode
          ? 'text-green-400 bg-green-900/20 border-green-500/50'
          : 'text-green-700 bg-green-50 border-green-200'
      case 'active':
        return isDarkMode
          ? 'text-purple-400 bg-purple-900/20 border-purple-500/50 animate-pulse'
          : 'text-purple-700 bg-purple-50 border-purple-200 animate-pulse'
      case 'failed':
        return isDarkMode
          ? 'text-red-400 bg-red-900/20 border-red-500/50'
          : 'text-red-700 bg-red-50 border-red-200'
      default:
        return isDarkMode
          ? 'text-gray-400 bg-slate-900/20 border-slate-700/50'
          : 'text-gray-500 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status, StageIcon) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'active':
        return <ArrowPathIcon className="w-5 h-5 text-purple-400 animate-spin" />
      case 'failed':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
      default:
        return <ClockIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0s'
    if (seconds < 60) return `${Math.floor(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  // Shared class helpers
  const outerCard = isDarkMode
    ? 'bg-slate-800/40 border-slate-700/50'
    : 'bg-white border-gray-200'
  const innerCard = isDarkMode
    ? 'bg-slate-900/30 border-slate-700/50'
    : 'bg-gray-50 border-gray-200'
  const progressTrack = isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-200 border-gray-200'
  const headingText = isDarkMode ? 'text-white' : 'text-gray-900'
  const subText = isDarkMode ? 'text-gray-400' : 'text-gray-500'
  const subTextXs = isDarkMode ? 'text-gray-400' : 'text-gray-500'
  const sectionLabel = isDarkMode ? 'text-gray-300' : 'text-gray-600'
  const stageName = isDarkMode ? 'text-white' : 'text-gray-900'

  if (isLoading && !sessionData) {
    return (
      <div className={`backdrop-blur-sm rounded-2xl border p-6 ${outerCard}`}>
        <div className={`flex items-center justify-center space-x-3 ${subText}`}>
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`backdrop-blur-sm rounded-2xl border p-6 space-y-6 ${outerCard}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${headingText}`}>Analysis Progress</h2>
          <p className={`text-sm mt-1 ${subText}`}>
            Session ID: <span className="font-mono text-purple-400">{sessionId}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-lg border font-semibold ${
          sessionData?.status === 'completed'
            ? isDarkMode ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
            : sessionData?.status === 'failed'
            ? isDarkMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            : isDarkMode ? 'bg-purple-900/20 border-purple-500/50 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
        }`}>
          {sessionData?.status === 'completed' ? 'Completed' :
           sessionData?.status === 'failed' ? 'Failed' :
           'Running'}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${sectionLabel}`}>Overall Progress</span>
          <span className="text-sm font-semibold text-purple-400">{Math.floor(progress)}%</span>
        </div>
        <div className={`w-full rounded-full h-3 overflow-hidden border ${progressTrack}`}>
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Time Information */}
      {sessionData && (
        <div className="grid grid-cols-3 gap-4">
          <div className={`rounded-lg p-3 border ${innerCard}`}>
            <p className={`text-xs uppercase tracking-wide ${subTextXs}`}>Elapsed Time</p>
            <p className={`text-lg font-bold mt-1 ${headingText}`}>
              {formatDuration(sessionData.elapsed_time || 0)}
            </p>
          </div>
          <div className={`rounded-lg p-3 border ${innerCard}`}>
            <p className={`text-xs uppercase tracking-wide ${subTextXs}`}>Estimated Remaining</p>
            <p className={`text-lg font-bold mt-1 ${headingText}`}>
              {sessionData.status === 'completed' ? '0s' : formatDuration((sessionData.estimated_total || 40) - (sessionData.elapsed_time || 0))}
            </p>
          </div>
          <div className={`rounded-lg p-3 border ${innerCard}`}>
            <p className={`text-xs uppercase tracking-wide ${subTextXs}`}>Mode</p>
            <p className={`text-lg font-bold mt-1 ${headingText}`}>
              {sessionData.fast_track ? 'Fast (~25s)' : 'Normal (~40s)'}
            </p>
          </div>
        </div>
      )}

      {/* Stage Progress */}
      <div className="space-y-2">
        <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${sectionLabel}`}>
          Analysis Stages
        </h3>

        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id)
          const StageIcon = stage.icon

          return (
            <div
              key={stage.id}
              className={`flex items-center space-x-4 p-3 rounded-lg border transition-all ${getStatusColor(status)}`}
            >
              {/* Stage Number/Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(status, StageIcon)}
              </div>

              {/* Stage Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`font-semibold truncate ${stageName}`}>{stage.name}</p>
                  {status === 'completed' && (
                    <span className="text-xs text-green-400 font-medium">Done</span>
                  )}
                  {status === 'active' && (
                    <span className="text-xs text-purple-400 font-medium animate-pulse">In Progress...</span>
                  )}
                </div>
                <p className={`text-sm truncate ${subText}`}>{stage.description}</p>
              </div>

              {/* Progress indicator */}
              <div className="flex-shrink-0">
                {status === 'active' && (
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sample Information */}
      {sessionData?.sample_info && (
        <div className={`rounded-lg p-4 border space-y-2 ${innerCard}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${sectionLabel}`}>Sample Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className={subText}>Name:</span>
              <span className={`ml-2 font-mono ${headingText}`}>{sessionData.sample_info.name}</span>
            </div>
            <div>
              <span className={subText}>Size:</span>
              <span className={`ml-2 ${headingText}`}>{sessionData.sample_info.size}</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className={subText}>SHA256:</span>
                  <span className={`ml-2 font-mono text-xs break-all ${headingText}`}>{sessionData.sample_info.sha256}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(sessionData.sample_info.sha256)}
                  className={`transition-colors flex-shrink-0 ${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'}`}
                  title="Copy hash"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {sessionData?.status === 'failed' && sessionData.error && (
        <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Analysis Failed</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{sessionData.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats (when running) */}
      {sessionData?.status === 'running' && sessionData.stats && (
        <div className="grid grid-cols-4 gap-3">
          <div className={`rounded-lg p-3 border text-center ${innerCard}`}>
            <p className="text-2xl font-bold text-purple-400">{sessionData.stats.processes || 0}</p>
            <p className={`text-xs mt-1 ${subText}`}>Processes</p>
          </div>
          <div className={`rounded-lg p-3 border text-center ${innerCard}`}>
            <p className="text-2xl font-bold text-blue-400">{sessionData.stats.connections || 0}</p>
            <p className={`text-xs mt-1 ${subText}`}>Connections</p>
          </div>
          <div className={`rounded-lg p-3 border text-center ${innerCard}`}>
            <p className="text-2xl font-bold text-orange-400">{sessionData.stats.files || 0}</p>
            <p className={`text-xs mt-1 ${subText}`}>Files</p>
          </div>
          <div className={`rounded-lg p-3 border text-center ${innerCard}`}>
            <p className="text-2xl font-bold text-red-400">{sessionData.stats.alerts || 0}</p>
            <p className={`text-xs mt-1 ${subText}`}>Alerts</p>
          </div>
        </div>
      )}

      {/* Live Sandbox View (VNC) */}
      {sessionData?.status === 'running' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ComputerDesktopIcon className="w-5 h-5 text-green-400" />
              <h3 className={`text-sm font-semibold uppercase tracking-wide ${sectionLabel}`}>
                Live Sandbox View
              </h3>
              <span className="flex items-center space-x-1 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Live</span>
              </span>
              {sessionData.viewer_url && (
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Port: {sessionData.novnc_port || new URL(sessionData.viewer_url).port}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVNC(!showVNC)}
                className={`text-xs transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {showVNC ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setVncExpanded(!vncExpanded)}
                className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                title="Toggle fullscreen"
              >
                <ArrowsPointingOutIcon className="w-4 h-4" />
              </button>
              {sessionData.viewer_url ? (
                <a
                  href={sessionData.viewer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Open in new tab
                </a>
              ) : (
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Waiting for VNC...</span>
              )}
            </div>
          </div>

          {showVNC && sessionData.viewer_url && (
            <div className={`relative rounded-lg border overflow-hidden transition-all ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-900 border-gray-700'
            } ${vncExpanded ? 'h-[600px]' : 'h-[400px]'}`}>
              <iframe
                src={sessionData.viewer_url}
                className="w-full h-full border-0"
                title="Sandbox VNC Viewer"
                allow="clipboard-read; clipboard-write"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                Password: rodeo123
              </div>
            </div>
          )}

          {showVNC && !sessionData.viewer_url && (
            <div className={`rounded-lg border h-[400px] flex items-center justify-center ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
              <div className={`text-center ${subText}`}>
                <ArrowPathIcon className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Waiting for sandbox to be ready...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Add shimmer animation to tailwind config or use inline styles
const style = document.createElement('style')
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`
document.head.appendChild(style)
