import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { patchDeployment } from '../api/client'
import {
  RocketLaunchIcon,
  ServerIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ViewfinderCircleIcon,
  BoltIcon,
  ChartBarIcon,
  CircleStackIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  Squares2X2Icon,
  SignalIcon,
  CircleStackIcon as RadioIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const PatchDeployment = () => {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(false)
  const [status, setStatus] = useState(null)
  const [hosts, setHosts] = useState([])
  const [history, setHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [algorithms, setAlgorithms] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedHost, setExpandedHost] = useState(null)
  const [expandedDeployment, setExpandedDeployment] = useState(null)

  // Modal states
  const [showAddHost, setShowAddHost] = useState(false)
  const [showSelectCanaries, setShowSelectCanaries] = useState(false)
  const [showDeploy, setShowDeploy] = useState(false)

  // Form states
  const [newHost, setNewHost] = useState({
    host_id: '',
    cpu_cores: 4,
    memory_gb: 16,
    os_type: 'linux',
    os_version: 'Ubuntu 22.04',
    workload_type: 'web_server',
    tier: 'standard',
    network_zone: 'internal',
    patch_history_success_rate: 0.95,
    uptime_days: 30,
    avg_cpu_usage: 0.45,
    avg_memory_usage: 0.60,
    has_monitoring: true
  })

  const [patchMetadata, setPatchMetadata] = useState({
    patch_id: '',
    package_name: '',
    current_version: '',
    target_version: '',
    severity: 'medium',
    affects_kernel: false,
    requires_reboot: false,
    dependencies: []
  })

  const [canaryResults, setCanaryResults] = useState(null)
  const [deploymentResult, setDeploymentResult] = useState(null)
  const [numCanaries, setNumCanaries] = useState(5)
  const [minDetectionStrength, setMinDetectionStrength] = useState(0.7)
  const [dryRun, setDryRun] = useState(true)

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const handleError = (error) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          setAuthError(true)
        }
        return null
      }

      const [statusRes, hostsRes, historyRes, statsRes, algosRes] = await Promise.all([
        patchDeployment.getStatus().catch(handleError),
        patchDeployment.getHosts().catch(e => handleError(e) || { hosts: [] }),
        patchDeployment.getHistory().catch(e => handleError(e) || { deployments: [] }),
        patchDeployment.getStats().catch(handleError),
        patchDeployment.getAlgorithms().catch(handleError)
      ])

      setStatus(statusRes)
      setHosts(hostsRes?.hosts || [])
      setHistory(historyRes?.deployments || [])
      setStats(statsRes)
      setAlgorithms(algosRes)
    } catch (error) {
      console.error('Failed to fetch patch deployment data:', error)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setAuthError(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle host registration
  const handleAddHost = async () => {
    try {
      await patchDeployment.registerHost(newHost)
      setShowAddHost(false)
      setNewHost({
        host_id: '',
        cpu_cores: 4,
        memory_gb: 16,
        os_type: 'linux',
        os_version: 'Ubuntu 22.04',
        workload_type: 'web_server',
        tier: 'standard',
        network_zone: 'internal',
        patch_history_success_rate: 0.95,
        uptime_days: 30,
        avg_cpu_usage: 0.45,
        avg_memory_usage: 0.60,
        has_monitoring: true
      })
      fetchData()
    } catch (error) {
      console.error('Failed to register host:', error)
    }
  }

  // Handle canary selection
  const handleSelectCanaries = async () => {
    try {
      const result = await patchDeployment.selectCanaries(patchMetadata, {
        numCanaries,
        minDetectionStrength
      })
      setCanaryResults(result)
    } catch (error) {
      console.error('Failed to select canaries:', error)
    }
  }

  // Handle deployment
  const handleDeploy = async () => {
    try {
      const patchPlan = {
        patch_id: patchMetadata.patch_id,
        package_name: patchMetadata.package_name,
        target_version: patchMetadata.target_version,
        hosts: canaryResults?.selected_hosts?.map(h => h.host_id) || []
      }
      const result = await patchDeployment.deploy(patchPlan, { dryRun })
      setDeploymentResult(result)
      fetchData()
    } catch (error) {
      console.error('Failed to deploy:', error)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
      case 'failed':
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />
      case 'running':
      case 'in_progress':
        return <ArrowPathIcon className="w-5 h-5 text-cyan-400 animate-spin" />
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />
      case 'rolled_back':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'hosts', label: 'Host Inventory', icon: ServerIcon },
    { id: 'canary', label: 'Canary Selection', icon: ViewfinderCircleIcon },
    { id: 'deploy', label: 'Deploy', icon: RocketLaunchIcon },
    { id: 'history', label: 'History', icon: ClockIcon },
    { id: 'algorithms', label: 'ML Algorithms', icon: CpuChipIcon }
  ]

  // Animated background gradient
  const GradientOrb = ({ className }) => (
    <div className={`absolute rounded-full blur-3xl opacity-20 ${className}`} />
  )

  // Stat card with glow effect
  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className={`relative group overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] ${
      isDarkMode
        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-600/50'
        : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
    }`}>
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${color} blur-xl`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
            <Icon className={`w-6 h-6 ${color.includes('blue') ? 'text-blue-400' : color.includes('green') ? 'text-emerald-400' : color.includes('purple') ? 'text-purple-400' : 'text-orange-400'}`} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-emerald-400 text-sm">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  )

  // Pipeline visualization
  const PipelineStage = ({ stage, index, total, isActive, isComplete }) => (
    <div className="flex items-center">
      <div className={`relative flex flex-col items-center`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
          isComplete
            ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
            : isActive
              ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400'
              : isDarkMode
                ? 'bg-slate-700/50 border-2 border-slate-600 text-slate-400'
                : 'bg-gray-100 border-2 border-gray-300 text-gray-400'
        }`}>
          {isComplete ? <CheckCircleIcon className="w-5 h-5" /> : stage.icon}
        </div>
        <span className={`mt-2 text-xs font-medium ${
          isActive ? 'text-cyan-400' : isComplete ? 'text-emerald-400' : isDarkMode ? 'text-slate-500' : 'text-gray-500'
        }`}>{stage.label}</span>
      </div>
      {index < total - 1 && (
        <div className={`w-16 h-0.5 mx-2 transition-all duration-500 ${
          isComplete ? 'bg-emerald-500' : isDarkMode ? 'bg-slate-700' : 'bg-gray-300'
        }`}>
          {isActive && <div className="h-full bg-cyan-500 animate-[progress_1s_ease-in-out_infinite]" style={{ width: '60%' }} />}
        </div>
      )}
    </div>
  )

  // Auth error screen
  if (authError) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[50vh] gap-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-xl opacity-30"></div>
          <div className={`relative w-full h-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl flex items-center justify-center border-2 border-red-500/50`}>
            <LockClosedIcon className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <p className="text-xl font-bold">Authentication Required</p>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          Please log in to access the Deployment System
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-purple to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity mt-2"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Go to Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-purple/30 rounded-full animate-spin border-t-brand-purple" />
          <RocketLaunchIcon className="w-6 h-6 text-brand-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Loading deployment system...</p>
      </div>
    )
  }

  return (
    <div className={`relative min-h-screen space-y-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Background effects */}
      {isDarkMode && (
        <>
          <GradientOrb className="w-96 h-96 bg-purple-600 -top-48 -left-48" />
          <GradientOrb className="w-96 h-96 bg-cyan-600 -bottom-48 -right-48" />
        </>
      )}

      {/* Header */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30' : 'bg-gradient-to-br from-purple-100 to-cyan-100'}`}>
                <RocketLaunchIcon className="w-8 h-8 text-brand-purple" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Intelligent Patch Deployment
                </h1>
                <p className={`mt-1 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  <CpuChipIcon className="w-4 h-4 text-purple-400" />
                  ML-driven canary selection with predictive rollback
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchData}
            className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
              isDarkMode
                ? 'bg-slate-800/80 hover:bg-slate-700 border border-slate-700'
                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ML Status Banner */}
      {status && (
        <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
          status.ml_features_available
            ? isDarkMode
              ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-cyan-500/10 border border-emerald-500/30'
              : 'bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200'
            : isDarkMode
              ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30'
              : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
        }`}>
          {/* Animated scan line */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`h-full w-1 ${status.ml_features_available ? 'bg-emerald-400/50' : 'bg-yellow-400/50'} animate-[scan_3s_linear_infinite]`}
                 style={{ transform: 'skewX(-15deg)' }} />
          </div>

          <div className="relative flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              status.ml_features_available
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {status.ml_features_available ? (
                <SparklesIcon className="w-6 h-6" />
              ) : (
                <ExclamationTriangleIcon className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">
                {status.ml_features_available
                  ? 'ML Features Active'
                  : 'ML Features Unavailable'}
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <FeatureBadge
                  label="Adaptive Canary"
                  enabled={status.adaptive_canary_available}
                  isDarkMode={isDarkMode}
                />
                <FeatureBadge
                  label="Predictive Rollback"
                  enabled={status.predictive_rollback_available}
                  isDarkMode={isDarkMode}
                />
                <FeatureBadge
                  label="State Tracking"
                  enabled={status.incremental_state_available}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex flex-wrap gap-2 p-2 rounded-2xl ${isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-gray-100'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                isActive
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={ServerIcon}
                label="Registered Hosts"
                value={stats?.total_hosts || hosts.length}
                color="from-blue-500/10 to-cyan-500/10"
              />
              <StatCard
                icon={CheckCircleIcon}
                label="Success Rate"
                value={stats?.success_rate ? `${(stats.success_rate * 100).toFixed(1)}%` : 'N/A'}
                color="from-emerald-500/10 to-green-500/10"
                trend="+2.3%"
              />
              <StatCard
                icon={RocketLaunchIcon}
                label="Total Deployments"
                value={stats?.total_deployments || history.length}
                color="from-purple-500/10 to-pink-500/10"
              />
              <StatCard
                icon={ExclamationTriangleIcon}
                label="Rollbacks"
                value={stats?.total_rollbacks || 0}
                color="from-orange-500/10 to-red-500/10"
              />
            </div>

            {/* Deployment Pipeline Visualization */}
            <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <CodeBracketIcon className="w-5 h-5 text-purple-400" />
                Deployment Pipeline
              </h3>
              <div className="flex items-center justify-center flex-wrap gap-2">
                {[
                  { icon: <ServerIcon className="w-5 h-5" />, label: 'Select' },
                  { icon: <ViewfinderCircleIcon className="w-5 h-5" />, label: 'Canary' },
                  { icon: <ChartBarIcon className="w-5 h-5" />, label: 'Monitor' },
                  { icon: <Squares2X2Icon className="w-5 h-5" />, label: 'Deploy' },
                  { icon: <CheckCircleIcon className="w-5 h-5" />, label: 'Verify' }
                ].map((stage, idx, arr) => (
                  <PipelineStage
                    key={idx}
                    stage={stage}
                    index={idx}
                    total={arr.length}
                    isActive={false}
                    isComplete={false}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickActionCard
                icon={PlusIcon}
                title="Add Host"
                description="Register a new host for deployment"
                onClick={() => setShowAddHost(true)}
                color="purple"
                isDarkMode={isDarkMode}
              />
              <QuickActionCard
                icon={ViewfinderCircleIcon}
                title="Select Canaries"
                description="ML-powered canary host selection"
                onClick={() => setActiveTab('canary')}
                color="cyan"
                isDarkMode={isDarkMode}
              />
              <QuickActionCard
                icon={RocketLaunchIcon}
                title="Deploy Patch"
                description="Execute intelligent deployment"
                onClick={() => setActiveTab('deploy')}
                color="pink"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        )}

        {/* Hosts Tab */}
        {activeTab === 'hosts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ServerIcon className="w-5 h-5 text-cyan-400" />
                Host Inventory
                <span className={`ml-2 px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                  {hosts.length} hosts
                </span>
              </h2>
              <button
                onClick={() => setShowAddHost(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <PlusIcon className="w-4 h-4" />
                Add Host
              </button>
            </div>

            <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}>
              {hosts.length === 0 ? (
                <div className="p-12 text-center">
                  <ServerIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                  <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No hosts registered</p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Add hosts to enable intelligent canary selection</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Host</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">System</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Resources</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {hosts.map((host) => (
                        <tr key={host.host_id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${host.has_monitoring ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                              <span className="font-mono text-sm font-medium">{host.host_id}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-medium">{host.os_type}</p>
                              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>{host.os_version}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1.5">
                                <CpuChipIcon className="w-4 h-4 text-cyan-400" />
                                {host.cpu_cores}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <CircleStackIcon className="w-4 h-4 text-purple-400" />
                                {host.memory_gb}GB
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <TierBadge tier={host.tier} isDarkMode={isDarkMode} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-20 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                                  style={{ width: `${(host.patch_history_success_rate || 0) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {host.patch_history_success_rate ? `${(host.patch_history_success_rate * 100).toFixed(0)}%` : 'N/A'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canary Selection Tab */}
        {activeTab === 'canary' && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <ViewfinderCircleIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">ML-Driven Canary Selection</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    13-dimensional feature vector for optimal host selection
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patch Metadata Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-purple-400" />
                    Patch Metadata
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Patch ID"
                      value={patchMetadata.patch_id}
                      onChange={(e) => setPatchMetadata({...patchMetadata, patch_id: e.target.value})}
                      placeholder="CVE-2024-XXXX"
                      isDarkMode={isDarkMode}
                    />
                    <InputField
                      label="Package Name"
                      value={patchMetadata.package_name}
                      onChange={(e) => setPatchMetadata({...patchMetadata, package_name: e.target.value})}
                      placeholder="openssl"
                      isDarkMode={isDarkMode}
                    />
                    <InputField
                      label="Current Version"
                      value={patchMetadata.current_version}
                      onChange={(e) => setPatchMetadata({...patchMetadata, current_version: e.target.value})}
                      placeholder="1.1.1"
                      isDarkMode={isDarkMode}
                    />
                    <InputField
                      label="Target Version"
                      value={patchMetadata.target_version}
                      onChange={(e) => setPatchMetadata({...patchMetadata, target_version: e.target.value})}
                      placeholder="1.1.2"
                      isDarkMode={isDarkMode}
                    />
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Severity</label>
                      <select
                        value={patchMetadata.severity}
                        onChange={(e) => setPatchMetadata({...patchMetadata, severity: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl border transition-all ${
                          isDarkMode
                            ? 'bg-slate-900/50 border-slate-600 focus:border-cyan-500'
                            : 'bg-white border-gray-300 focus:border-purple-500'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={patchMetadata.affects_kernel}
                          onChange={(e) => setPatchMetadata({...patchMetadata, affects_kernel: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm">Kernel</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={patchMetadata.requires_reboot}
                          onChange={(e) => setPatchMetadata({...patchMetadata, requires_reboot: e.target.checked})}
                          className="w-4 h-4 rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm">Reboot</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Selection Parameters */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BoltIcon className="w-4 h-4 text-cyan-400" />
                    Selection Parameters
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          Number of Canaries
                        </label>
                        <span className="text-sm font-bold text-cyan-400">{numCanaries}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={numCanaries}
                        onChange={(e) => setNumCanaries(parseInt(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700 accent-cyan-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          Min Detection Strength
                        </label>
                        <span className="text-sm font-bold text-purple-400">{(minDetectionStrength * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.05"
                        value={minDetectionStrength}
                        onChange={(e) => setMinDetectionStrength(parseFloat(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700 accent-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSelectCanaries}
                    disabled={!patchMetadata.patch_id || hosts.length === 0}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CpuChipIcon className="w-5 h-5" />
                    Run ML Selection
                    <SparklesIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Canary Results */}
              {canaryResults && (
                <div className="mt-8 pt-8 border-t border-slate-700/50">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                    Selected Canary Hosts
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      {canaryResults.selected_hosts?.length || 0} hosts
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {canaryResults.selected_hosts?.map((host, idx) => (
                      <CanaryHostCard
                        key={host.host_id}
                        host={host}
                        rank={idx + 1}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>

                  {canaryResults.coverage_metrics && (
                    <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                      <div className="flex flex-wrap gap-6">
                        <CoverageMetric label="Overall Coverage" value={canaryResults.coverage_metrics.overall} />
                        <CoverageMetric label="OS Diversity" value={canaryResults.coverage_metrics.os_diversity} />
                        <CoverageMetric label="Workload Coverage" value={canaryResults.coverage_metrics.workload_coverage} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deploy Tab */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
                  <RocketLaunchIcon className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Intelligent Deployment</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Execute with predictive rollback protection
                  </p>
                </div>
              </div>

              {!canaryResults ? (
                <div className="text-center py-12">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
                    <ViewfinderCircleIcon className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    No canary hosts selected
                  </p>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    Use ML-driven selection to choose optimal canary hosts first
                  </p>
                  <button
                    onClick={() => setActiveTab('canary')}
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Go to Canary Selection
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Deployment Summary */}
                    <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-900/50 border border-slate-700/50' : 'bg-gray-50 border border-gray-200'}`}>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <DocumentTextIcon className="w-4 h-4 text-purple-400" />
                        Deployment Summary
                      </h3>
                      <dl className="space-y-3">
                        <SummaryItem label="Patch ID" value={patchMetadata.patch_id} mono />
                        <SummaryItem label="Package" value={patchMetadata.package_name} />
                        <SummaryItem
                          label="Version"
                          value={
                            <span className="flex items-center gap-2">
                              {patchMetadata.current_version}
                              <ArrowRightIcon className="w-4 h-4 text-cyan-400" />
                              {patchMetadata.target_version}
                            </span>
                          }
                        />
                        <SummaryItem label="Target Hosts" value={canaryResults.selected_hosts?.length || 0} />
                        <SummaryItem
                          label="Severity"
                          value={
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getSeverityColor(patchMetadata.severity)}`}>
                              {patchMetadata.severity}
                            </span>
                          }
                        />
                      </dl>
                    </div>

                    {/* Deployment Options */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <BoltIcon className="w-4 h-4 text-cyan-400" />
                        Deployment Options
                      </h3>

                      <label className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        dryRun
                          ? isDarkMode
                            ? 'border-cyan-500/50 bg-cyan-500/10'
                            : 'border-cyan-500 bg-cyan-50'
                          : isDarkMode
                            ? 'border-slate-600 hover:border-slate-500'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={dryRun}
                          onChange={(e) => setDryRun(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-slate-600 text-cyan-500 focus:ring-cyan-500"
                        />
                        <div>
                          <p className="font-semibold">Dry Run Mode</p>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            Simulate deployment without making actual changes
                          </p>
                        </div>
                      </label>

                      <button
                        onClick={handleDeploy}
                        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                          dryRun
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25'
                            : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/25'
                        } text-white`}
                      >
                        {dryRun ? (
                          <>
                            <PlayIcon className="w-5 h-5" />
                            Simulate Deployment
                          </>
                        ) : (
                          <>
                            <RocketLaunchIcon className="w-5 h-5" />
                            Execute Deployment
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Deployment Result */}
                  {deploymentResult && (
                    <div className={`p-5 rounded-xl ${isDarkMode ? 'bg-slate-900/50 border border-slate-700/50' : 'bg-gray-50 border border-gray-200'}`}>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        {getStatusIcon(deploymentResult.status)}
                        Deployment Result
                      </h3>
                      <pre className={`text-sm p-4 rounded-lg overflow-x-auto ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                        {JSON.stringify(deploymentResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200 shadow-lg'}`}>
            {history.length === 0 ? (
              <div className="p-12 text-center">
                <ClockIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No deployment history</p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Completed deployments will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Deployment</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Patch</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Hosts</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Started</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {history.map((deployment) => (
                      <tr key={deployment.deployment_id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-4">{getStatusIcon(deployment.status)}</td>
                        <td className="px-6 py-4 font-mono text-sm">{deployment.deployment_id?.slice(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm">{deployment.patch_id || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">{deployment.host_count || 0}</td>
                        <td className="px-6 py-4 text-sm">{deployment.started_at ? new Date(deployment.started_at).toLocaleString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">{deployment.duration || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Algorithms Tab */}
        {activeTab === 'algorithms' && (
          <div className="space-y-6">
            {algorithms ? (
              <>
                <AlgorithmCard
                  icon={ViewfinderCircleIcon}
                  iconColor="text-cyan-400"
                  title={algorithms.adaptive_canary_selection?.name || 'Adaptive Canary Selection'}
                  description={algorithms.adaptive_canary_selection?.description}
                  features={algorithms.adaptive_canary_selection?.features}
                  properties={{
                    'Similarity Metric': algorithms.adaptive_canary_selection?.similarity_metric,
                    'Learning Rate': algorithms.adaptive_canary_selection?.learning_rate,
                    'Diversity Weight': algorithms.adaptive_canary_selection?.diversity_weight
                  }}
                  isDarkMode={isDarkMode}
                  gradient="from-cyan-500/20 to-blue-500/20"
                  borderColor="border-cyan-500/30"
                />

                <AlgorithmCard
                  icon={ShieldCheckIcon}
                  iconColor="text-orange-400"
                  title={algorithms.predictive_rollback_engine?.name || 'Predictive Rollback Engine'}
                  description={algorithms.predictive_rollback_engine?.description}
                  features={algorithms.predictive_rollback_engine?.signals}
                  featureIcon={<ChartBarIcon className="w-4 h-4 text-orange-400" />}
                  featureLabel="Monitored Signals"
                  properties={{
                    'Failure Threshold': algorithms.predictive_rollback_engine?.failure_threshold,
                    'Prediction Window': algorithms.predictive_rollback_engine?.prediction_window,
                    'Model': algorithms.predictive_rollback_engine?.model
                  }}
                  isDarkMode={isDarkMode}
                  gradient="from-orange-500/20 to-red-500/20"
                  borderColor="border-orange-500/30"
                />

                <AlgorithmCard
                  icon={BoltIcon}
                  iconColor="text-emerald-400"
                  title={algorithms.incremental_state_tracking?.name || 'Incremental State Tracking'}
                  description={algorithms.incremental_state_tracking?.description}
                  features={algorithms.incremental_state_tracking?.artifacts}
                  featureIcon={<DocumentTextIcon className="w-4 h-4 text-emerald-400" />}
                  featureLabel="Tracked Artifacts"
                  properties={{
                    'Rollback Complexity': algorithms.incremental_state_tracking?.rollback_complexity,
                    'Storage Overhead': algorithms.incremental_state_tracking?.storage_overhead,
                    'Checkpoint Interval': algorithms.incremental_state_tracking?.checkpoint_interval
                  }}
                  isDarkMode={isDarkMode}
                  gradient="from-emerald-500/20 to-green-500/20"
                  borderColor="border-emerald-500/30"
                />
              </>
            ) : (
              <div className={`rounded-2xl p-12 text-center ${isDarkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}`}>
                <CpuChipIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Algorithm documentation not available
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Host Modal */}
      {showAddHost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                <ServerIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">Register New Host</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Host ID *"
                value={newHost.host_id}
                onChange={(e) => setNewHost({...newHost, host_id: e.target.value})}
                placeholder="web-server-01"
                isDarkMode={isDarkMode}
              />
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>OS Type</label>
                <select
                  value={newHost.os_type}
                  onChange={(e) => setNewHost({...newHost, os_type: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                </select>
              </div>
              <InputField
                label="OS Version"
                value={newHost.os_version}
                onChange={(e) => setNewHost({...newHost, os_version: e.target.value})}
                isDarkMode={isDarkMode}
              />
              <InputField
                label="CPU Cores"
                type="number"
                value={newHost.cpu_cores}
                onChange={(e) => setNewHost({...newHost, cpu_cores: parseInt(e.target.value)})}
                isDarkMode={isDarkMode}
              />
              <InputField
                label="Memory (GB)"
                type="number"
                value={newHost.memory_gb}
                onChange={(e) => setNewHost({...newHost, memory_gb: parseInt(e.target.value)})}
                isDarkMode={isDarkMode}
              />
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Workload Type</label>
                <select
                  value={newHost.workload_type}
                  onChange={(e) => setNewHost({...newHost, workload_type: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="web_server">Web Server</option>
                  <option value="database">Database</option>
                  <option value="application">Application</option>
                  <option value="batch_processing">Batch Processing</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Tier</label>
                <select
                  value={newHost.tier}
                  onChange={(e) => setNewHost({...newHost, tier: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="standard">Standard</option>
                  <option value="production">Production</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Network Zone</label>
                <select
                  value={newHost.network_zone}
                  onChange={(e) => setNewHost({...newHost, network_zone: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border transition-all ${
                    isDarkMode ? 'bg-slate-900/50 border-slate-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="internal">Internal</option>
                  <option value="dmz">DMZ</option>
                  <option value="external">External</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowAddHost(false)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddHost}
                disabled={!newHost.host_id}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register Host
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add keyframe animation for scan line */}
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(1000%) skewX(-15deg); }
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Helper Components
const FeatureBadge = ({ label, enabled, isDarkMode }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
    enabled
      ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
      : isDarkMode ? 'bg-slate-700/50 text-slate-400' : 'bg-gray-100 text-gray-500'
  }`}>
    {enabled ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <XCircleIcon className="w-3.5 h-3.5" />}
    <span className="text-xs font-medium">{label}</span>
  </div>
)

const QuickActionCard = ({ icon: Icon, title, description, onClick, color, isDarkMode }) => {
  const colors = {
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/50',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-500/50',
    pink: 'from-pink-500/20 to-red-500/20 border-pink-500/30 hover:border-pink-500/50'
  }
  const iconColors = { purple: 'text-purple-400', cyan: 'text-cyan-400', pink: 'text-pink-400' }

  return (
    <button
      onClick={onClick}
      className={`group p-5 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] ${
        isDarkMode
          ? `bg-gradient-to-br ${colors[color]} border`
          : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
      }`}
    >
      <div className={`p-3 rounded-xl inline-block mb-3 ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
        <Icon className={`w-6 h-6 ${iconColors[color]} group-hover:scale-110 transition-transform`} />
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{description}</p>
    </button>
  )
}

const TierBadge = ({ tier, isDarkMode }) => {
  const colors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    production: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    staging: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    standard: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    development: 'bg-green-500/20 text-green-400 border-green-500/30'
  }
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[tier] || colors.standard}`}>
      {tier}
    </span>
  )
}

const InputField = ({ label, value, onChange, placeholder, type = 'text', isDarkMode }) => (
  <div>
    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border transition-all ${
        isDarkMode
          ? 'bg-slate-900/50 border-slate-600 focus:border-cyan-500 placeholder-slate-500'
          : 'bg-white border-gray-300 focus:border-purple-500 placeholder-gray-400'
      }`}
    />
  </div>
)

const CanaryHostCard = ({ host, rank, isDarkMode }) => (
  <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
    isDarkMode ? 'bg-slate-700/50 border border-slate-600/50 hover:border-emerald-500/30' : 'bg-gray-50 border border-gray-200 hover:border-emerald-300'
  }`}>
    <div className="flex items-center justify-between mb-3">
      <span className="font-mono text-sm font-medium">{host.host_id}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
        rank === 2 ? 'bg-slate-400/20 text-slate-300' :
        rank === 3 ? 'bg-orange-700/20 text-orange-400' :
        'bg-purple-500/20 text-purple-400'
      }`}>
        #{rank}
      </span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Detection</span>
        <span className="font-semibold text-cyan-400">{(host.detection_strength * 100).toFixed(1)}%</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Diversity</span>
        <span className="font-semibold text-purple-400">{(host.diversity_score * 100).toFixed(1)}%</span>
      </div>
    </div>
  </div>
)

const CoverageMetric = ({ label, value }) => (
  <div className="flex items-center gap-2">
    <SignalIcon className="w-4 h-4 text-purple-400" />
    <span className="text-sm font-medium">{label}:</span>
    <span className="text-sm font-bold text-purple-400">{(value * 100).toFixed(1)}%</span>
  </div>
)

const SummaryItem = ({ label, value, mono }) => (
  <div className="flex justify-between items-center">
    <dt className="text-sm text-slate-400">{label}</dt>
    <dd className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</dd>
  </div>
)

const AlgorithmCard = ({ icon: Icon, iconColor, title, description, features, featureIcon, featureLabel = 'Features', properties, isDarkMode, gradient, borderColor }) => (
  <div className={`rounded-2xl p-6 ${isDarkMode ? `bg-gradient-to-br ${gradient} border ${borderColor}` : 'bg-white border border-gray-200 shadow-lg'}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-3 rounded-xl bg-slate-800/50`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
    </div>
    <p className={`mb-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{description}</p>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          {featureIcon || <CircleStackIcon className="w-4 h-4 text-purple-400" />}
          {featureLabel}
        </h3>
        <ul className="space-y-2 text-sm">
          {features?.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${iconColor.replace('text-', 'bg-')}`} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Properties</h3>
        <dl className="space-y-2 text-sm">
          {Object.entries(properties).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <dt className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>{key}</dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </div>
)

export default PatchDeployment
