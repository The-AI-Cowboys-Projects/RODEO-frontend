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

export default function AnalysisProgress({ sessionId, onComplete }) {
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
      case 'completed': return 'text-green-400 bg-green-900/20 border-green-500/50'
      case 'active': return 'text-purple-400 bg-purple-900/20 border-purple-500/50 animate-pulse'
      case 'failed': return 'text-red-400 bg-red-900/20 border-red-500/50'
      default: return 'text-gray-400 bg-slate-900/20 border-slate-700/50'
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
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0s'
    if (seconds < 60) return `${Math.floor(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  if (isLoading && !sessionData) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-center space-x-3 text-gray-400">
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analysis Progress</h2>
          <p className="text-gray-400 text-sm mt-1">
            Session ID: <span className="font-mono text-purple-400">{sessionId}</span>
          </p>
        </div>

        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-lg border font-semibold ${
          sessionData?.status === 'completed'
            ? 'bg-green-900/20 border-green-500/50 text-green-400'
            : sessionData?.status === 'failed'
            ? 'bg-red-900/20 border-red-500/50 text-red-400'
            : 'bg-purple-900/20 border-purple-500/50 text-purple-400'
        }`}>
          {sessionData?.status === 'completed' ? 'Completed' :
           sessionData?.status === 'failed' ? 'Failed' :
           'Running'}
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Overall Progress</span>
          <span className="text-sm font-semibold text-purple-400">{Math.floor(progress)}%</span>
        </div>
        <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden border border-slate-700">
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
          <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Elapsed Time</p>
            <p className="text-lg font-bold text-white mt-1">
              {formatDuration(sessionData.elapsed_time || 0)}
            </p>
          </div>
          <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Estimated Remaining</p>
            <p className="text-lg font-bold text-white mt-1">
              {sessionData.status === 'completed' ? '0s' : formatDuration((sessionData.estimated_total || 40) - (sessionData.elapsed_time || 0))}
            </p>
          </div>
          <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Mode</p>
            <p className="text-lg font-bold text-white mt-1">
              {sessionData.fast_track ? 'Fast (~25s)' : 'Normal (~40s)'}
            </p>
          </div>
        </div>
      )}

      {/* Stage Progress */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
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
                  <p className="font-semibold text-white truncate">{stage.name}</p>
                  {status === 'completed' && (
                    <span className="text-xs text-green-400 font-medium">✓ Done</span>
                  )}
                  {status === 'active' && (
                    <span className="text-xs text-purple-400 font-medium animate-pulse">In Progress...</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">{stage.description}</p>
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
        <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50 space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Sample Info</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="text-white ml-2 font-mono">{sessionData.sample_info.name}</span>
            </div>
            <div>
              <span className="text-gray-400">Size:</span>
              <span className="text-white ml-2">{sessionData.sample_info.size}</span>
            </div>
            <div className="col-span-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <span className="text-gray-400">SHA256:</span>
                  <span className="text-white ml-2 font-mono text-xs break-all">{sessionData.sample_info.sha256}</span>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(sessionData.sample_info.sha256)}
                  className="text-gray-400 hover:text-purple-400 transition-colors flex-shrink-0"
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Analysis Failed</p>
              <p className="text-sm text-red-400 mt-1">{sessionData.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats (when running) */}
      {sessionData?.status === 'running' && sessionData.stats && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-purple-400">{sessionData.stats.processes || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Processes</p>
          </div>
          <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-blue-400">{sessionData.stats.connections || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Connections</p>
          </div>
          <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-orange-400">{sessionData.stats.files || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Files</p>
          </div>
          <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50 text-center">
            <p className="text-2xl font-bold text-red-400">{sessionData.stats.alerts || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Alerts</p>
          </div>
        </div>
      )}

      {/* Live Sandbox View (VNC) */}
      {sessionData?.status === 'running' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ComputerDesktopIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Live Sandbox View
              </h3>
              <span className="flex items-center space-x-1 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Live</span>
              </span>
              {sessionData.viewer_url && (
                <span className="text-xs text-gray-500">
                  Port: {sessionData.novnc_port || new URL(sessionData.viewer_url).port}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowVNC(!showVNC)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                {showVNC ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setVncExpanded(!vncExpanded)}
                className="text-gray-400 hover:text-white transition-colors"
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
                <span className="text-xs text-gray-500">Waiting for VNC...</span>
              )}
            </div>
          </div>

          {showVNC && sessionData.viewer_url && (
            <div className={`relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden transition-all ${
              vncExpanded ? 'h-[600px]' : 'h-[400px]'
            }`}>
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
            <div className="bg-slate-900 rounded-lg border border-slate-700 h-[400px] flex items-center justify-center">
              <div className="text-center text-gray-400">
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
