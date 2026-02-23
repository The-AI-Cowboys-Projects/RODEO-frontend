import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import {
  BeakerIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import SandboxSubmission from '../components/SandboxSubmission'
import AnalysisProgress from '../components/AnalysisProgress'
import AnalysisResults from '../components/AnalysisResults'

export default function SandboxDashboard() {
  const { isDarkMode } = useTheme()
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [viewMode, setViewMode] = useState('submit') // 'submit', 'progress', 'results'
  const [completedResults, setCompletedResults] = useState(null)

  // Fetch recent sessions
  const { data: recentSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sandbox-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/sandbox/sessions?limit=10')
      if (!response.ok) throw new Error('Failed to fetch sessions')
      return response.json()
    },
    refetchInterval: 5000 // Refresh every 5 seconds
  })

  const handleSubmitSuccess = (data) => {
    // Switch to progress view
    setActiveSessionId(data.session_id)
    setViewMode('progress')
  }

  const handleAnalysisComplete = (data) => {
    // Fetch full results
    fetch(`/api/sandbox/sessions/${data.session_id}/results`)
      .then(res => res.json())
      .then(response => {
        // Extract results and merge with threat_intel
        const results = response.results || {}
        if (response.threat_intel) {
          results.threat_intel = response.threat_intel
          if (!results.threat_level) {
            results.threat_level = response.threat_intel.threat_level
          }
        }
        setCompletedResults(results)
        setViewMode('results')
      })
      .catch(err => {
        console.error('Failed to fetch results:', err)
      })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-900/20'
      case 'running':
        return 'text-blue-400 bg-blue-900/20'
      case 'failed':
        return 'text-red-400 bg-red-900/20'
      default:
        return 'text-gray-400 bg-slate-900/20'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'running':
        return <PlayIcon className="w-4 h-4 animate-pulse" />
      case 'failed':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/10 via-pink-500/10 to-blue-500/10 rounded-2xl blur-xl"></div>
        <div className={'relative bg-slate-800/40 backdrop-blur-sm rounded-2xl border ' + (isDarkMode ? 'border-slate-700' : 'border-gray-200') + ' p-8'}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-purple via-pink-400 to-blue-400 bg-clip-text text-transparent">
                R-O-D-E-O Sandbox
              </h1>
              <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' mt-2'}>
                Interactive malware analysis in isolated environments
              </p>
            </div>

            {/* Mode Selector */}
            <div className={'flex bg-slate-900/50 rounded-lg p-1 border ' + (isDarkMode ? 'border-slate-700' : 'border-gray-200')}>
              <button
                onClick={() => setViewMode('submit')}
                className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' + (viewMode === 'submit' ? 'bg-brand-purple text-white shadow-lg' : 'text-gray-400 hover:text-white')}
              >
                Submit
              </button>
              <button
                onClick={() => setViewMode('progress')}
                disabled={!activeSessionId}
                className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' + (viewMode === 'progress' ? 'bg-brand-purple text-white shadow-lg' : 'text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed')}
              >
                Progress
              </button>
              <button
                onClick={() => setViewMode('results')}
                disabled={!completedResults}
                className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' + (viewMode === 'results' ? 'bg-brand-purple text-white shadow-lg' : 'text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed')}
              >
                Results
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className={(isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50/30') + ' rounded-lg p-3 border ' + (isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50')}>
              <div className="flex items-center space-x-2">
                <BeakerIcon className="w-5 h-5 text-brand-purple-light" />
                <div>
                  <p className="text-xs text-gray-400">Total Sessions</p>
                  <p className="text-xl font-bold text-white">
                    {recentSessions?.total || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className={(isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50/30') + ' rounded-lg p-3 border ' + (isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50')}>
              <div className="flex items-center space-x-2">
                <PlayIcon className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">Running</p>
                  <p className="text-xl font-bold text-white">
                    {recentSessions?.sessions?.filter(s => s.status === 'running').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className={(isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50/30') + ' rounded-lg p-3 border ' + (isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50')}>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="text-xl font-bold text-white">
                    {recentSessions?.sessions?.filter(s => s.status === 'completed').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className={(isDarkMode ? 'bg-slate-900/30' : 'bg-gray-50/30') + ' rounded-lg p-3 border ' + (isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50')}>
              <div className="flex items-center space-x-2">
                <XCircleIcon className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-xs text-gray-400">Failed</p>
                  <p className="text-xl font-bold text-white">
                    {recentSessions?.sessions?.filter(s => s.status === 'failed').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Recent Sessions */}
        <div className="col-span-1">
          <div className={(isDarkMode ? 'bg-slate-800/40' : 'bg-white/40') + ' backdrop-blur-sm rounded-2xl border ' + (isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50') + ' p-6'}>
            <h2 className="text-xl font-bold text-white mb-4">Recent Sessions</h2>

            {sessionsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading sessions...</div>
            ) : recentSessions?.sessions?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BeakerIcon className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p>No sessions yet</p>
                <p className="text-sm mt-1">Submit your first sample to get started</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {recentSessions?.sessions?.map((session) => (
                  <button
                    key={session.session_id}
                    onClick={() => {
                      setActiveSessionId(session.session_id)
                      if (session.status === 'completed') {
                        // Fetch results
                        fetch(`/api/sandbox/sessions/${session.session_id}/results`)
                          .then(res => res.json())
                          .then(response => {
                            // Extract results and merge with threat_intel
                            const results = response.results || {}
                            if (response.threat_intel) {
                              results.threat_intel = response.threat_intel
                              if (!results.threat_level) {
                                results.threat_level = response.threat_intel.threat_level
                              }
                            }
                            setCompletedResults(results)
                            setViewMode('results')
                          })
                      } else if (session.status === 'running') {
                        setViewMode('progress')
                      }
                    }}
                    className={'w-full text-left p-3 rounded-lg border transition-all hover:bg-slate-900/50 ' + (
                      activeSessionId === session.session_id
                        ? 'bg-brand-purple/20 border-brand-purple/50'
                        : 'bg-slate-900/20 ' + (isDarkMode ? 'border-slate-700' : 'border-gray-200/50')
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={(isDarkMode ? 'text-white' : 'text-gray-900') + ' font-medium truncate'}>
                          {session.sample_name || session.session_id}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className={'flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ' + getStatusColor(session.status)}>
                        {getStatusIcon(session.status)}
                        <span className="capitalize">{session.status}</span>
                      </div>
                    </div>

                    {session.threat_level && (
                      <div className="mt-2">
                        <span className={'text-xs px-2 py-1 rounded ' + (
                          session.threat_level === 'critical' ? 'bg-red-500/20 text-red-400' :
                          session.threat_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          session.threat_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        )}>
                          {session.threat_level.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Main Content */}
        <div className="col-span-2">
          {viewMode === 'submit' && (
            <SandboxSubmission onSubmitSuccess={handleSubmitSuccess} />
          )}

          {viewMode === 'progress' && activeSessionId && (
            <AnalysisProgress
              sessionId={activeSessionId}
              onComplete={handleAnalysisComplete}
            />
          )}

          {viewMode === 'results' && completedResults && (
            <AnalysisResults
              sessionId={activeSessionId}
              results={completedResults}
            />
          )}

          {viewMode === 'progress' && !activeSessionId && (
            <div className={(isDarkMode ? 'bg-slate-800/40' : 'bg-white/40') + ' backdrop-blur-sm rounded-2xl border ' + (isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50') + ' p-8 text-center'}>
              <ClockIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No active session</p>
              <p className="text-sm text-gray-500 mt-1">Submit a sample to start analysis</p>
            </div>
          )}

          {viewMode === 'results' && !completedResults && (
            <div className={(isDarkMode ? 'bg-slate-800/40' : 'bg-white/40') + ' backdrop-blur-sm rounded-2xl border ' + (isDarkMode ? 'border-slate-700/50' : 'border-gray-200/50') + ' p-8 text-center'}>
              <BeakerIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No results available</p>
              <p className="text-sm text-gray-500 mt-1">Complete an analysis to view results</p>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 rounded-xl border border-brand-purple/30 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-brand-purple/20 rounded-lg flex items-center justify-center">
              <BeakerIcon className="w-6 h-6 text-brand-purple-light" />
            </div>
            <h3 className="text-lg font-semibold text-white">Fast Analysis</h3>
          </div>
          <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm'}>
            Get results in under 40 seconds with our optimized parallel pipeline. Enable fast-track mode for 25s analysis.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-blue-600/10 rounded-xl border border-blue-500/30 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">AI-Powered</h3>
          </div>
          <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm'}>
            Advanced behavior analysis with automatic YARA rule generation and MITRE ATT&CK mapping.
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-900/20 to-pink-600/10 rounded-xl border border-pink-500/30 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Real-Time Monitoring</h3>
          </div>
          <p className={(isDarkMode ? 'text-gray-400' : 'text-gray-600') + ' text-sm'}>
            Watch your analysis progress in real-time with live updates on processes, network, and threats.
          </p>
        </div>
      </div>
    </div>
  )
}
