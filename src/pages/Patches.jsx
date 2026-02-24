import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patches } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { generateReport } from '../utils/reportGenerator'
import { useTheme } from '../context/ThemeContext'
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  CalendarIcon,
  CubeIcon,
  SparklesIcon,
  BoltIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ServerIcon,
  TagIcon,
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon as ShieldCheckSolid, CheckBadgeIcon } from '@heroicons/react/24/solid'

// ============================================================================
// Animated Counter Component
// ============================================================================
function AnimatedCounter({ value, duration = 1000, isDarkMode, color }) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = parseInt(value) || 0

  useEffect(() => {
    let start = 0
    const end = numericValue
    const increment = end / (duration / 16)

    const counter = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(counter)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(counter)
  }, [numericValue, duration])

  const colorClasses = {
    green: isDarkMode ? 'text-green-400' : 'text-green-600',
    blue: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    amber: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    purple: isDarkMode ? 'text-purple-400' : 'text-purple-600',
  }

  return <span className={colorClasses[color] || (isDarkMode ? 'text-white' : 'text-gray-900')}>{displayValue}</span>
}

// ============================================================================
// Hero Stat Card with Ring
// ============================================================================
function HeroStatCard({ icon: Icon, value, label, color, isDarkMode, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const colors = {
    green: {
      bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
      border: isDarkMode ? 'border-green-500/30' : 'border-green-200',
      icon: isDarkMode ? 'text-green-400' : 'text-green-600',
      glow: 'shadow-green-500/20',
      ring: 'stroke-green-500',
    },
    blue: {
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
      icon: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      glow: 'shadow-blue-500/20',
      ring: 'stroke-blue-500',
    },
    amber: {
      bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDarkMode ? 'border-amber-500/30' : 'border-amber-200',
      icon: isDarkMode ? 'text-amber-400' : 'text-amber-600',
      glow: 'shadow-amber-500/20',
      ring: 'stroke-amber-500',
    },
    purple: {
      bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      border: isDarkMode ? 'border-purple-500/30' : 'border-purple-200',
      icon: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      glow: 'shadow-purple-500/20',
      ring: 'stroke-purple-500',
    },
  }
  const c = colors[color] || colors.green

  return (
    <div
      className={`${c.bg} backdrop-blur-sm rounded-2xl border ${c.border} p-5 transition-all duration-500 hover:scale-[1.03] hover:shadow-xl ${c.glow} cursor-pointer group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`relative w-14 h-14 rounded-xl ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-7 h-7 ${c.icon}`} />
          <div className={`absolute inset-0 rounded-xl ${c.bg} animate-ping opacity-20`} />
        </div>
        <div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <AnimatedCounter value={value} isDarkMode={isDarkMode} color={color} duration={800 + delay} />
          </div>
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Filter Chip Component
// ============================================================================
function FilterChip({ label, active, onClick, count, color, isDarkMode }) {
  const colors = {
    green: active
      ? 'bg-green-500 text-white border-green-500'
      : isDarkMode ? 'bg-slate-700/50 text-gray-300 border-slate-600 hover:border-green-500/50' : 'bg-white text-gray-600 border-gray-300 hover:border-green-500',
    blue: active
      ? 'bg-blue-500 text-white border-blue-500'
      : isDarkMode ? 'bg-slate-700/50 text-gray-300 border-slate-600 hover:border-blue-500/50' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500',
    amber: active
      ? 'bg-amber-500 text-white border-amber-500'
      : isDarkMode ? 'bg-slate-700/50 text-gray-300 border-slate-600 hover:border-amber-500/50' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-500',
    red: active
      ? 'bg-red-500 text-white border-red-500'
      : isDarkMode ? 'bg-slate-700/50 text-gray-300 border-slate-600 hover:border-red-500/50' : 'bg-white text-gray-600 border-gray-300 hover:border-red-500',
    gray: active
      ? (isDarkMode ? 'bg-slate-600 text-white border-slate-500' : 'bg-gray-700 text-white border-gray-700')
      : isDarkMode ? 'bg-slate-700/50 text-gray-300 border-slate-600 hover:border-slate-400' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500',
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${colors[color]}`}
    >
      {label}
      {count !== undefined && (
        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
          active ? 'bg-white/20' : isDarkMode ? 'bg-slate-600' : 'bg-gray-100'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ============================================================================
// Patch Card Component
// ============================================================================
function PatchCard({ patch, onClick, isDarkMode, index }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50)
    return () => clearTimeout(timer)
  }, [index])

  const getPriorityConfig = (priority) => {
    const p = priority?.toLowerCase()
    if (p === 'critical') return {
      bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: isDarkMode ? 'border-red-500/30' : 'border-red-200',
      badge: isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-red-100 text-red-700 border-red-200',
      icon: 'text-red-400',
      glow: 'hover:shadow-red-500/20',
      gradient: 'from-red-500 to-rose-500',
    }
    if (p === 'high') return {
      bg: isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50',
      border: isDarkMode ? 'border-orange-500/30' : 'border-orange-200',
      badge: isDarkMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-orange-100 text-orange-700 border-orange-200',
      icon: 'text-orange-400',
      glow: 'hover:shadow-orange-500/20',
      gradient: 'from-orange-500 to-amber-500',
    }
    if (p === 'medium') return {
      bg: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50',
      border: isDarkMode ? 'border-yellow-500/30' : 'border-yellow-200',
      badge: isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: 'text-yellow-400',
      glow: 'hover:shadow-yellow-500/20',
      gradient: 'from-yellow-500 to-orange-500',
    }
    return {
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
      badge: isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-blue-100 text-blue-700 border-blue-200',
      icon: 'text-blue-400',
      glow: 'hover:shadow-blue-500/20',
      gradient: 'from-blue-500 to-cyan-500',
    }
  }

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase()
    if (s === 'validated') return {
      badge: isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
      icon: CheckCircleIcon,
    }
    if (s === 'applied') return {
      badge: isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      icon: CheckBadgeIcon,
    }
    if (s === 'draft') return {
      badge: isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
      icon: ClockIcon,
    }
    if (s === 'failed') return {
      badge: isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
      icon: ExclamationTriangleIcon,
    }
    return {
      badge: isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700',
      icon: ClockIcon,
    }
  }

  const priorityConfig = getPriorityConfig(patch.priority)
  const statusConfig = getStatusConfig(patch.status)
  const StatusIcon = statusConfig.icon

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer group ${
        isDarkMode
          ? `bg-slate-800/60 ${priorityConfig.border} hover:border-green-500/50`
          : `bg-white ${priorityConfig.border} hover:border-green-500`
      } hover:shadow-xl ${priorityConfig.glow} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Priority Indicator Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${priorityConfig.gradient}`} />

      {/* Card Header */}
      <div className={`p-5 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-gray-100'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {patch.priority && (
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${priorityConfig.badge} uppercase tracking-wide`}>
                  {patch.priority}
                </span>
              )}
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${statusConfig.badge}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {patch.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <h3 className={`text-lg font-bold truncate group-hover:text-green-500 transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {patch.patch_id || 'Unknown Patch'}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${priorityConfig.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
            <ShieldCheckIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        {patch.description && (
          <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {patch.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <TagIcon className="w-4 h-4" />
            <span className="truncate">{patch.patch_type || 'N/A'}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <ServerIcon className="w-4 h-4" />
            <span className="truncate">{patch.patch_source || 'N/A'}</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <CalendarIcon className="w-4 h-4" />
            <span>{patch.created_at ? new Date(patch.created_at).toLocaleDateString() : 'Unknown'}</span>
          </div>
          {patch.cve_ids && patch.cve_ids.length > 0 && (
            <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              <BoltIcon className="w-4 h-4" />
              <span className="font-semibold">{patch.cve_ids.length} CVEs</span>
            </div>
          )}
        </div>

        {/* Progress Bar for validated patches */}
        {patch.status === 'validated' && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Ready to apply</span>
              <span className="text-green-500 font-semibold">100%</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className={`px-5 py-3 border-t flex items-center justify-between ${
        isDarkMode ? 'border-slate-700/50 bg-slate-800/50' : 'border-gray-100 bg-gray-50/50'
      }`}>
        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Click for details
        </span>
        <ChevronRightIcon className={`w-5 h-5 transform group-hover:translate-x-1 transition-transform ${
          isDarkMode ? 'text-green-400' : 'text-green-600'
        }`} />
      </div>
    </div>
  )
}

// ============================================================================
// Main Patches Component
// ============================================================================
export default function Patches() {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()
  const [selectedPatch, setSelectedPatch] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const { data: allPatches, isLoading, refetch } = useQuery({
    queryKey: ['patches'],
    queryFn: patches.list,
  })

  const handleGenerateReport = (format) => {
    try {
      const dataToExport = selectedPatch || allPatches?.filter(patch => {
        const matchesSearch =
          patch.patch_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patch.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patch.patch_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patch.patch_source?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === 'all' || patch.status === filterStatus
        return matchesSearch && matchesStatus
      }) || []

      generateReport({
        format,
        data: selectedPatch ? [selectedPatch] : dataToExport,
        title: selectedPatch ? `Patch Report - ${selectedPatch.patch_id}` : 'Patches Report',
        filename: selectedPatch ? `Patch_${selectedPatch.patch_id}` : 'Patches_Report',
        columns: [
          { label: 'Patch ID', accessor: (p) => p.patch_id },
          { label: 'Type', accessor: (p) => p.patch_type },
          { label: 'Description', accessor: (p) => p.description },
          { label: 'Source', accessor: (p) => p.patch_source },
          { label: 'Status', accessor: (p) => p.status },
          { label: 'Priority', accessor: (p) => p.priority },
          { label: 'Created', accessor: (p) => p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A' }
        ]
      })
    } catch (err) {
      alert(`Failed to generate report: ${err.message}`)
    }
  }

  // Filter patches
  const filteredPatches = allPatches?.filter(patch => {
    const matchesSearch =
      patch.patch_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.patch_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.patch_source?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || patch.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  // Sort patches
  const sortedPatches = [...filteredPatches].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    }
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return (priorityOrder[b.priority?.toLowerCase()] || 0) - (priorityOrder[a.priority?.toLowerCase()] || 0)
    }
    return 0
  })

  // Stats
  const stats = {
    total: allPatches?.length || 0,
    validated: allPatches?.filter(p => p.status === 'validated').length || 0,
    applied: allPatches?.filter(p => p.status === 'applied').length || 0,
    draft: allPatches?.filter(p => p.status === 'draft').length || 0,
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className={`rounded-2xl p-8 animate-pulse ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
          <div className={`h-10 w-64 rounded-lg mb-4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`h-6 w-96 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`rounded-2xl p-6 animate-pulse ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
              <div className={`h-6 w-24 rounded mb-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
              <div className={`h-10 w-16 rounded ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl border p-8 ${
        isDarkMode
          ? 'bg-gradient-to-r from-green-900/50 via-slate-900 to-emerald-900/50 border-green-500/20'
          : 'bg-gradient-to-r from-green-50 via-white to-emerald-50 border-green-200'
      }`}>
        {/* Background Effects */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-green-500/10' : 'bg-green-200/30'
        }`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-200/30'
        }`} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-300'
                  : 'bg-white/80 hover:bg-white text-gray-600 shadow-sm'
              }`}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 shadow-green-500/30'
                  : 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 shadow-green-500/40'
              }`}>
                <ShieldCheckSolid className="w-10 h-10 text-white" />
              </div>
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border-2 shadow-lg ${
                isDarkMode
                  ? 'bg-emerald-400 border-slate-900'
                  : 'bg-emerald-500 border-white'
              }`}>
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className={`text-4xl font-bold ${
                isDarkMode
                  ? 'bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent'
                  : 'text-gray-900'
              }`}>
                Security Patches
              </h1>
              <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage and deploy security updates across your infrastructure
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-300'
                  : 'bg-white/80 hover:bg-white text-gray-600 shadow-sm'
              }`}
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleGenerateReport('html')}
              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-green-500/25"
            >
              <DocumentTextIcon className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <HeroStatCard
            icon={ChartBarIcon}
            value={stats.total}
            label="Total Patches"
            color="purple"
            isDarkMode={isDarkMode}
            delay={0}
          />
          <HeroStatCard
            icon={CheckCircleIcon}
            value={stats.validated}
            label="Validated"
            color="green"
            isDarkMode={isDarkMode}
            delay={100}
          />
          <HeroStatCard
            icon={CheckBadgeIcon}
            value={stats.applied}
            label="Applied"
            color="blue"
            isDarkMode={isDarkMode}
            delay={200}
          />
          <HeroStatCard
            icon={ClockIcon}
            value={stats.draft}
            label="Draft"
            color="amber"
            isDarkMode={isDarkMode}
            delay={300}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`rounded-2xl border p-6 ${
        isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
      }`}>
        {/* Search Bar */}
        <div className={`relative mb-6 transition-all duration-300 ${isSearchFocused ? 'scale-[1.01]' : ''}`}>
          <div className={`absolute inset-0 rounded-xl transition-all duration-300 ${
            isSearchFocused
              ? isDarkMode ? 'bg-green-500/10 shadow-lg shadow-green-500/20' : 'bg-green-50 shadow-lg shadow-green-500/10'
              : ''
          }`} />
          <div className="relative flex items-center">
            <MagnifyingGlassIcon className={`absolute left-4 w-5 h-5 transition-colors ${
              isSearchFocused
                ? 'text-green-500'
                : isDarkMode ? 'text-gray-400' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Search by patch ID, type, source, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none transition-all ${
                isDarkMode
                  ? `bg-slate-700/50 text-white placeholder-gray-400 ${isSearchFocused ? 'border-green-500' : 'border-slate-600'}`
                  : `bg-gray-50 text-gray-900 placeholder-gray-400 ${isSearchFocused ? 'border-green-500' : 'border-gray-200'}`
              }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute right-4 p-1 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-slate-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                }`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <FunnelIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status:</span>
          </div>
          <FilterChip
            label="All"
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
            count={stats.total}
            color="gray"
            isDarkMode={isDarkMode}
          />
          <FilterChip
            label="Validated"
            active={filterStatus === 'validated'}
            onClick={() => setFilterStatus('validated')}
            count={stats.validated}
            color="green"
            isDarkMode={isDarkMode}
          />
          <FilterChip
            label="Applied"
            active={filterStatus === 'applied'}
            onClick={() => setFilterStatus('applied')}
            count={stats.applied}
            color="blue"
            isDarkMode={isDarkMode}
          />
          <FilterChip
            label="Draft"
            active={filterStatus === 'draft'}
            onClick={() => setFilterStatus('draft')}
            count={stats.draft}
            color="amber"
            isDarkMode={isDarkMode}
          />
          <FilterChip
            label="Failed"
            active={filterStatus === 'failed'}
            onClick={() => setFilterStatus('failed')}
            count={allPatches?.filter(p => p.status === 'failed').length || 0}
            color="red"
            isDarkMode={isDarkMode}
          />

          <div className={`ml-auto flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="text-sm">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <option value="date">Release Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className={`flex items-center justify-between ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <span className="text-sm">
          Showing <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sortedPatches.length}</span> of {stats.total} patches
        </span>
      </div>

      {/* Patches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedPatches.map((patch, index) => (
          <PatchCard
            key={patch.id}
            patch={patch}
            onClick={() => setSelectedPatch(patch)}
            isDarkMode={isDarkMode}
            index={index}
          />
        ))}
      </div>

      {/* No Results */}
      {sortedPatches.length === 0 && (
        <div className={`text-center py-16 rounded-2xl border ${
          isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-gray-100'
          }`}>
            <DocumentCheckIcon className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          </div>
          <p className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            No patches found
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPatch && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPatch(null)}
        >
          <div
            className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 px-6 py-5 border-b backdrop-blur-xl ${
              isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {selectedPatch.priority && (
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${
                        selectedPatch.priority?.toLowerCase() === 'critical'
                          ? isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                          : selectedPatch.priority?.toLowerCase() === 'high'
                          ? isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                          : selectedPatch.priority?.toLowerCase() === 'medium'
                          ? isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                          : isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedPatch.priority} Priority
                      </span>
                    )}
                    <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                      selectedPatch.status === 'validated'
                        ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                        : selectedPatch.status === 'applied'
                        ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        : selectedPatch.status === 'draft'
                        ? isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                        : isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedPatch.status?.toUpperCase()}
                    </span>
                  </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedPatch.patch_id || 'Unknown Patch'}
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Created: {selectedPatch.created_at ? new Date(selectedPatch.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPatch(null)}
                  className={`p-2 rounded-xl transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Description */}
              {selectedPatch.description && (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <DocumentTextIcon className="w-4 h-4" />
                    Description
                  </h3>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{selectedPatch.description}</p>
                </div>
              )}

              {/* Patch Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TagIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Patch Type</span>
                  </div>
                  <p className={`font-mono font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedPatch.patch_type || 'N/A'}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <ServerIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Source</span>
                  </div>
                  <p className={`font-mono font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedPatch.patch_source || 'N/A'}
                  </p>
                </div>
                {selectedPatch.file_size && (
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CubeIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>File Size</span>
                    </div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPatch.file_size}
                    </p>
                  </div>
                )}
                {selectedPatch.version && (
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <CodeBracketIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Version</span>
                    </div>
                    <p className={`font-mono font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedPatch.version}
                    </p>
                  </div>
                )}
              </div>

              {/* CVEs Fixed */}
              {selectedPatch.cve_ids && selectedPatch.cve_ids.length > 0 && (
                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    <BoltIcon className="w-4 h-4" />
                    Vulnerabilities Fixed ({selectedPatch.cve_ids.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatch.cve_ids.map((cve) => (
                      <span
                        key={cve}
                        className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-all hover:scale-105 cursor-pointer ${
                          isDarkMode ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {cve}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Patch Content */}
              {selectedPatch.patch_content && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <CodeBracketIcon className="w-4 h-4" />
                    Patch Content
                  </h3>
                  <div className={`p-4 rounded-xl border overflow-x-auto ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-300'}`}>
                    <pre className={`text-sm font-mono whitespace-pre-wrap ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                      {selectedPatch.patch_content}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 px-6 py-4 border-t flex items-center gap-3 ${
              isDarkMode ? 'bg-slate-800/95 border-slate-700 backdrop-blur-xl' : 'bg-white/95 border-gray-200 backdrop-blur-xl'
            }`}>
              {selectedPatch.status === 'validated' && (
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25">
                  <PlayIcon className="w-5 h-5" />
                  Apply Patch
                </button>
              )}
              <button
                onClick={() => handleGenerateReport('html')}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <DocumentTextIcon className="w-5 h-5" />
                Report
              </button>
              <button
                onClick={() => handleGenerateReport('json')}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-slate-700 text-white hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
