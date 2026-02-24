/**
 * RODEO Business Continuity & Disaster Recovery Dashboard
 * Modern glassmorphism redesign with HITRUST CSF Control 15.c compliance
 */

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import {
  ShieldCheckIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  ServerIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowPathIcon,
  CheckBadgeIcon,
  CloudIcon,
  CpuChipIcon,
  CircleStackIcon,
  SparklesIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon as ShieldCheckSolid } from '@heroicons/react/24/solid'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rodeo_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ============================================================================
// Hero Stat Card with Ring
// ============================================================================
function HeroStatCard({ icon: Icon, value, label, color, isDarkMode }) {
  const colors = {
    emerald: {
      bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDarkMode ? 'border-emerald-500/30' : 'border-emerald-200',
      icon: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
      value: isDarkMode ? 'text-emerald-400' : 'text-emerald-700',
    },
    cyan: {
      bg: isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50',
      border: isDarkMode ? 'border-cyan-500/30' : 'border-cyan-200',
      icon: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
      value: isDarkMode ? 'text-cyan-400' : 'text-cyan-700',
    },
    violet: {
      bg: isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50',
      border: isDarkMode ? 'border-violet-500/30' : 'border-violet-200',
      icon: isDarkMode ? 'text-violet-400' : 'text-violet-600',
      value: isDarkMode ? 'text-violet-400' : 'text-violet-700',
    },
    amber: {
      bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDarkMode ? 'border-amber-500/30' : 'border-amber-200',
      icon: isDarkMode ? 'text-amber-400' : 'text-amber-600',
      value: isDarkMode ? 'text-amber-400' : 'text-amber-700',
    },
  }
  const c = colors[color] || colors.emerald

  return (
    <div className={`${c.bg} backdrop-blur-sm rounded-xl border ${c.border} p-4 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <div className={`text-2xl font-bold ${c.value}`}>{value}</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Metric Card with Progress Ring
// ============================================================================
function MetricCard({ title, value, subtitle, icon: Icon, color, isDarkMode, progress }) {
  const colors = {
    green: {
      gradient: 'from-green-500 to-emerald-500',
      ring: 'stroke-green-500',
      bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
      text: isDarkMode ? 'text-green-400' : 'text-green-600',
    },
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      ring: 'stroke-blue-500',
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    },
    purple: {
      gradient: 'from-purple-500 to-violet-500',
      ring: 'stroke-purple-500',
      bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      text: isDarkMode ? 'text-purple-400' : 'text-purple-600',
    },
    amber: {
      gradient: 'from-amber-500 to-orange-500',
      ring: 'stroke-amber-500',
      bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      text: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    },
    red: {
      gradient: 'from-red-500 to-rose-500',
      ring: 'stroke-red-500',
      bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
      text: isDarkMode ? 'text-red-400' : 'text-red-600',
    },
  }
  const c = colors[color] || colors.blue

  const circumference = 2 * Math.PI * 36
  const progressValue = parseFloat(value) || 0
  const offset = circumference - (progressValue / 100) * circumference

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-lg ${
      isDarkMode
        ? 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
        : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>
          )}
        </div>
        {progress !== undefined ? (
          <div className="relative">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40" cy="40" r="36"
                strokeWidth="6"
                fill="none"
                stroke={isDarkMode ? '#334155' : '#e5e7eb'}
              />
              <circle
                cx="40" cy="40" r="36"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className={`${c.ring} transition-all duration-1000`}
                style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon className={`w-6 h-6 ${c.text}`} />
            </div>
          </div>
        ) : (
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Compliance Banner
// ============================================================================
function ComplianceBanner({ compliant, score, issues, isDarkMode }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 ${
      compliant
        ? isDarkMode
          ? 'bg-gradient-to-r from-green-900/30 via-emerald-900/20 to-teal-900/30 border-green-500/30'
          : 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200'
        : isDarkMode
          ? 'bg-gradient-to-r from-red-900/30 via-rose-900/20 to-orange-900/30 border-red-500/30'
          : 'bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-red-200'
    }`}>
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl ${
        compliant ? 'bg-green-500/10' : 'bg-red-500/10'
      }`} />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            compliant
              ? 'bg-gradient-to-br from-green-500 to-emerald-500'
              : 'bg-gradient-to-br from-red-500 to-rose-500'
          } shadow-lg`}>
            {compliant ? (
              <CheckBadgeIcon className="w-8 h-8 text-white" />
            ) : (
              <ExclamationTriangleIcon className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              HITRUST CSF Control 15.c
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                compliant
                  ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
              }`}>
                {compliant ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                    COMPLIANT
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4 mr-1.5" />
                    NON-COMPLIANT
                  </>
                )}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Business Continuity & Disaster Recovery
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overall Score</p>
          <p className={`text-4xl font-bold ${
            compliant
              ? isDarkMode ? 'text-green-400' : 'text-green-600'
              : isDarkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {score}
          </p>
        </div>
      </div>

      {!compliant && issues && issues.length > 0 && (
        <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-red-500/20' : 'border-red-200'}`}>
          <p className={`font-semibold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>
            Issues Requiring Attention:
          </p>
          <div className="space-y-1">
            {issues.map((issue, idx) => (
              <div key={idx} className={`flex items-center text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                <ExclamationTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                {issue}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Schedule Card
// ============================================================================
function ScheduleCard({ title, subtitle, time, color, isDarkMode }) {
  const colors = {
    blue: {
      bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
      title: isDarkMode ? 'text-blue-400' : 'text-blue-700',
      text: isDarkMode ? 'text-blue-300' : 'text-blue-600',
    },
    green: {
      bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
      border: isDarkMode ? 'border-green-500/30' : 'border-green-200',
      title: isDarkMode ? 'text-green-400' : 'text-green-700',
      text: isDarkMode ? 'text-green-300' : 'text-green-600',
    },
    purple: {
      bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
      border: isDarkMode ? 'border-purple-500/30' : 'border-purple-200',
      title: isDarkMode ? 'text-purple-400' : 'text-purple-700',
      text: isDarkMode ? 'text-purple-300' : 'text-purple-600',
    },
  }
  const c = colors[color] || colors.blue

  return (
    <div className={`${c.bg} rounded-xl border ${c.border} p-4 transition-all hover:scale-[1.02]`}>
      <p className={`text-sm font-medium mb-1 ${c.title}`}>{title}</p>
      <p className={`text-lg font-bold ${c.text}`}>{subtitle}</p>
      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{time}</p>
    </div>
  )
}

// ============================================================================
// Test Status Badge
// ============================================================================
function TestStatusBadge({ status, isDarkMode }) {
  const configs = {
    passed: {
      bg: isDarkMode ? 'bg-green-500/20' : 'bg-green-100',
      text: isDarkMode ? 'text-green-400' : 'text-green-700',
      icon: CheckCircleIcon,
    },
    failed: {
      bg: isDarkMode ? 'bg-red-500/20' : 'bg-red-100',
      text: isDarkMode ? 'text-red-400' : 'text-red-700',
      icon: XCircleIcon,
    },
    pending: {
      bg: isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100',
      text: isDarkMode ? 'text-amber-400' : 'text-amber-700',
      icon: ClockIcon,
    },
    running: {
      bg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-700',
      icon: BoltIcon,
    },
  }
  const config = configs[status] || configs.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {status.toUpperCase()}
    </span>
  )
}

// ============================================================================
// Main Dashboard
// ============================================================================
export default function BCDRDashboard() {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [schedulerRunning, setSchedulerRunning] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [runNowLoading, setRunNowLoading] = useState(false)
  const [showSchedulerModal, setShowSchedulerModal] = useState(false)
  const [scheduleConfig, setScheduleConfig] = useState({
    timezone: 'UTC',
    // Annual Test
    annualTestMonth: 1,
    annualTestDay: 15,
    annualTestHour: 10,
    annualTestMinute: 0,
    // Quarterly Tests
    quarterlyTestDay: 15,
    quarterlyTestHour: 10,
    quarterlyTestMinute: 0,
    quarterlyMonths: [1, 4, 7, 10], // Jan, Apr, Jul, Oct
    // Monthly Backup
    monthlyBackupDay: 1,
    monthlyBackupHour: 2,
    monthlyBackupMinute: 0,
    // Weekly Backup
    weeklyBackupDay: 0, // Sunday
    weeklyBackupHour: 3,
    weeklyBackupMinute: 0,
    // Daily Backup
    dailyBackupHour: 2,
    dailyBackupMinute: 0,
    // Enable flags
    enableAnnualTests: true,
    enableQuarterlyTests: true,
    enableMonthlyBackups: true,
    enableWeeklyBackups: false,
    enableDailyBackups: true,
    // Notification settings
    notifyBeforeTest: true,
    notifyHoursBefore: 24,
    notifyOnCompletion: true,
    notifyOnFailure: true,
  })

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/bcdr/dashboard')
      setDashboardData(response.data)
      setSchedulerRunning(response.data.scheduler?.running || false)
      setError(null)
    } catch (err) {
      console.error('Error fetching BCDR dashboard data:', err)
      setError(err.response?.data?.detail || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStartScheduler = () => setShowSchedulerModal(true)

  const confirmStartScheduler = async () => {
    try {
      setActionLoading(true)
      setShowSchedulerModal(false)
      await api.post('/api/bcdr/schedule/start', scheduleConfig)
      setSchedulerRunning(true)
      await fetchDashboardData()
    } catch (err) {
      console.error('Error starting scheduler:', err)
      alert('Failed to start scheduler: ' + (err.response?.data?.detail || err.message))
    } finally {
      setActionLoading(false)
    }
  }

  const handleStopScheduler = async () => {
    try {
      setActionLoading(true)
      await api.post('/api/bcdr/schedule/stop')
      setSchedulerRunning(false)
      await fetchDashboardData()
    } catch (err) {
      console.error('Error stopping scheduler:', err)
      alert('Failed to stop scheduler: ' + (err.response?.data?.detail || err.message))
    } finally {
      setActionLoading(false)
    }
  }

  const handleRunTestNow = async () => {
    if (!confirm('Run a BCP test now? This will execute an immediate annual Business Continuity Plan test.')) return

    try {
      setRunNowLoading(true)
      const response = await api.post('/api/bcdr/test/run-now')
      alert(`Test executed at: ${new Date(response.data.executed_at).toLocaleString()}\n\n${response.data.note || ''}`)
      await fetchDashboardData()
    } catch (err) {
      console.error('Error running test:', err)
      alert('Failed to run test: ' + (err.response?.data?.detail || err.message))
    } finally {
      setRunNowLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleString()
  }

  const formatRelativeTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`
    return `In ${Math.ceil(diffDays / 30)} months`
  }

  // Loading State
  if (loading && !dashboardData) {
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

  // Error State
  if (error && !dashboardData) {
    return (
      <div className={`rounded-2xl border p-8 ${
        isDarkMode ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-900'}`}>
              Error Loading Dashboard
            </h2>
            <p className={`mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
          </div>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-6 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-rose-600 transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  const compliance = dashboardData?.compliance || {}
  const scheduler = dashboardData?.scheduler || {}
  const recentTests = dashboardData?.recent_tests || []
  const backups = dashboardData?.backups || {}
  const plans = dashboardData?.plans || {}
  const summary = dashboardData?.summary || {}

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl border p-8 ${
        isDarkMode
          ? 'bg-gradient-to-r from-cyan-900/50 via-slate-900 to-blue-900/50 border-cyan-500/20'
          : 'bg-gradient-to-r from-cyan-50 via-white to-blue-50 border-cyan-200'
      }`}>
        {/* Background Effects */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-200/30'
        }`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-blue-500/10' : 'bg-blue-200/30'
        }`} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 shadow-cyan-500/30'
                  : 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 shadow-cyan-500/40'
              }`}>
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center border-2 shadow-lg ${
                isDarkMode
                  ? 'bg-cyan-400 border-slate-900'
                  : 'bg-cyan-500 border-white'
              }`}>
                <CloudIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className={`text-4xl font-bold ${
                isDarkMode
                  ? 'bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent'
                  : 'text-gray-900'
              }`}>
                BC/DR Dashboard
              </h1>
              <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Business Continuity & Disaster Recovery - HITRUST CSF Control 15.c
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className={`p-2.5 rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-300'
                  : 'bg-white/80 hover:bg-white text-gray-600 shadow-sm'
              }`}
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleRunTestNow}
              disabled={runNowLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <BoltIcon className={`w-5 h-5 ${runNowLoading ? 'animate-pulse' : ''}`} />
              {runNowLoading ? 'Running...' : 'Run Test Now'}
            </button>
            {schedulerRunning ? (
              <button
                onClick={handleStopScheduler}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-rose-600 transition-all flex items-center gap-2"
              >
                <StopIcon className="w-5 h-5" />
                Stop Scheduler
              </button>
            ) : (
              <button
                onClick={handleStartScheduler}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all flex items-center gap-2"
              >
                <PlayIcon className="w-5 h-5" />
                Start Scheduler
              </button>
            )}
          </div>
        </div>

        {/* Hero Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <HeroStatCard
            icon={ChartBarIcon}
            value={summary.quarterly_compliance || '0%'}
            label="Quarterly Compliance"
            color="emerald"
            isDarkMode={isDarkMode}
          />
          <HeroStatCard
            icon={CheckCircleIcon}
            value={summary.test_success_rate || '0%'}
            label="Test Success Rate"
            color="cyan"
            isDarkMode={isDarkMode}
          />
          <HeroStatCard
            icon={ServerIcon}
            value={`${backups.enabled || 0}/${backups.total || 0}`}
            label="Active Backups"
            color="violet"
            isDarkMode={isDarkMode}
          />
          <HeroStatCard
            icon={DocumentTextIcon}
            value={plans.total || 0}
            label="BC/DR Plans"
            color="amber"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Compliance Banner */}
      <ComplianceBanner
        compliant={compliance.compliant}
        score={summary.quarterly_compliance || '0%'}
        issues={compliance.issues}
        isDarkMode={isDarkMode}
      />

      {/* Scheduler Section */}
      <div className={`rounded-2xl border p-6 ${
        isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <CalendarIcon className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Automated Scheduler
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                HITRUST-compliant test scheduling
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl ${
              schedulerRunning
                ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                : isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              <span className="flex items-center gap-2 font-medium">
                <span className={`w-2 h-2 rounded-full ${schedulerRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {schedulerRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {scheduler.scheduled_jobs?.length || 0} jobs scheduled
            </span>
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ScheduleCard
            title="Next Annual Test"
            subtitle={formatRelativeTime(summary.next_annual_test)}
            time={formatDate(summary.next_annual_test)}
            color="blue"
            isDarkMode={isDarkMode}
          />
          <ScheduleCard
            title="Quarterly Tests"
            subtitle="Jan/Apr/Jul/Oct 15"
            time="10:00 AM UTC"
            color="green"
            isDarkMode={isDarkMode}
          />
          <ScheduleCard
            title="Backup Verification"
            subtitle="Monthly (1st)"
            time="02:00 AM UTC"
            color="purple"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Scheduled Jobs */}
        {scheduler.scheduled_jobs && scheduler.scheduled_jobs.length > 0 && (
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Scheduled Jobs
            </h3>
            <div className="space-y-2">
              {scheduler.scheduled_jobs.map((job, idx) => (
                <div key={idx} className={`flex items-center justify-between p-4 rounded-xl ${
                  isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <ClockIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{job.name}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>ID: {job.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(job.next_run)}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formatRelativeTime(job.next_run)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Tests */}
      <div className={`rounded-2xl border p-6 ${
        isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'
          }`}>
            <BoltIcon className={`w-6 h-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent BCP Tests
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Business continuity plan test history
            </p>
          </div>
        </div>

        {recentTests.length === 0 ? (
          <div className={`text-center py-12 rounded-xl ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
            <ClockIcon className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No tests executed yet</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Tests will appear here after execution
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTests.map((test, idx) => (
              <div key={idx} className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                isDarkMode ? 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.test_type || 'BCP Test'}
                    </h3>
                    <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {test.test_frequency || 'N/A'}
                    </span>
                  </div>
                  <TestStatusBadge status={test.status || 'pending'} isDarkMode={isDarkMode} />
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {test.test_scope || 'No description'}
                </p>
                <div className={`flex items-center gap-6 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <span>Planned: {formatDate(test.planned_date)}</span>
                  {test.executed_date && <span>Executed: {formatDate(test.executed_date)}</span>}
                  {test.rto_target && <span>RTO: {test.rto_target}h</span>}
                  {test.rpo_target && <span>RPO: {test.rpo_target}h</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BC/DR Plans */}
      {plans.plans && plans.plans.length > 0 && (
        <div className={`rounded-2xl border p-6 ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDarkMode ? 'bg-violet-500/20' : 'bg-violet-100'
            }`}>
              <DocumentTextIcon className={`w-6 h-6 ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BC/DR Plans
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Documented recovery procedures
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.plans.map((plan, idx) => (
              <div key={idx} className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                isDarkMode ? 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}>
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {plan.plan_name || 'Unnamed Plan'}
                </h3>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {plan.plan_type || 'General'}
                </p>
                {plan.systems_covered && plan.systems_covered.length > 0 && (
                  <div className="mb-3">
                    <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Systems Covered:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {plan.systems_covered.map((system, sidx) => (
                        <span key={sidx} className={`px-2 py-0.5 rounded text-xs ${
                          isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {plan.rto_hours && <span>RTO: {plan.rto_hours}h</span>}
                  {plan.rpo_hours && <span>RPO: {plan.rpo_hours}h</span>}
                  <span className={`ml-auto px-2 py-0.5 rounded ${
                    isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    {plan.status || 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduler Configuration Modal */}
      {showSchedulerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'
                  }`}>
                    <Cog6ToothIcon className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Configure BCDR Scheduler
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Set up automated testing and backup schedules
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSchedulerModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Timezone Selection */}
                <div className={`rounded-xl border p-4 ${isDarkMode ? 'border-slate-600 bg-slate-700/30' : 'border-gray-200 bg-gray-50'}`}>
                  <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Timezone
                  </label>
                  <select
                    value={scheduleConfig.timezone}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, timezone: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkMode
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Central European (CET)</option>
                    <option value="Europe/Berlin">Berlin (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Singapore">Singapore (SGT)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>

                {/* Annual BCP Tests */}
                <div className={`rounded-xl border overflow-hidden ${
                  isDarkMode ? 'border-slate-600' : 'border-gray-200'
                } ${scheduleConfig.enableAnnualTests ? '' : 'opacity-60'}`}>
                  <div className={`flex items-center justify-between p-4 ${
                    isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CalendarIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Annual BCP Tests
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          HITRUST CSF 15.c requirement - Full DR test annually
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleConfig.enableAnnualTests}
                        onChange={(e) => setScheduleConfig({...scheduleConfig, enableAnnualTests: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isDarkMode ? 'bg-slate-600 peer-checked:bg-blue-500' : 'bg-gray-300 peer-checked:bg-blue-600'
                      }`}></div>
                    </label>
                  </div>
                  {scheduleConfig.enableAnnualTests && (
                    <div className={`p-4 ${isDarkMode ? 'bg-slate-700/30' : 'bg-white'}`}>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Month</label>
                          <select
                            value={scheduleConfig.annualTestMonth}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, annualTestMonth: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                              <option key={i} value={i + 1}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Day</label>
                          <select
                            value={scheduleConfig.annualTestDay}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, annualTestDay: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 28}, (_, i) => (
                              <option key={i} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hour</label>
                          <select
                            value={scheduleConfig.annualTestHour}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, annualTestHour: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 24}, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minute</label>
                          <select
                            value={scheduleConfig.annualTestMinute}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, annualTestMinute: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {[0, 15, 30, 45].map((m) => (
                              <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className={`mt-3 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Next run: {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][scheduleConfig.annualTestMonth - 1]} {scheduleConfig.annualTestDay}, {scheduleConfig.annualTestHour.toString().padStart(2, '0')}:{scheduleConfig.annualTestMinute.toString().padStart(2, '0')} {scheduleConfig.timezone}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quarterly Recovery Tests */}
                <div className={`rounded-xl border overflow-hidden ${
                  isDarkMode ? 'border-slate-600' : 'border-gray-200'
                } ${scheduleConfig.enableQuarterlyTests ? '' : 'opacity-60'}`}>
                  <div className={`flex items-center justify-between p-4 ${
                    isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <ChartBarIcon className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Quarterly Recovery Tests
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Partial recovery tests each quarter
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleConfig.enableQuarterlyTests}
                        onChange={(e) => setScheduleConfig({...scheduleConfig, enableQuarterlyTests: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isDarkMode ? 'bg-slate-600 peer-checked:bg-green-500' : 'bg-gray-300 peer-checked:bg-green-600'
                      }`}></div>
                    </label>
                  </div>
                  {scheduleConfig.enableQuarterlyTests && (
                    <div className={`p-4 ${isDarkMode ? 'bg-slate-700/30' : 'bg-white'}`}>
                      <div className="mb-4">
                        <label className={`block text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Quarterly Months</label>
                        <div className="flex flex-wrap gap-2">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                            const monthNum = i + 1
                            const isSelected = scheduleConfig.quarterlyMonths.includes(monthNum)
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  const newMonths = isSelected
                                    ? scheduleConfig.quarterlyMonths.filter(n => n !== monthNum)
                                    : [...scheduleConfig.quarterlyMonths, monthNum].sort((a, b) => a - b)
                                  setScheduleConfig({...scheduleConfig, quarterlyMonths: newMonths})
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  isSelected
                                    ? isDarkMode ? 'bg-green-500 text-white' : 'bg-green-600 text-white'
                                    : isDarkMode ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                {m}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Day of Month</label>
                          <select
                            value={scheduleConfig.quarterlyTestDay}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, quarterlyTestDay: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 28}, (_, i) => (
                              <option key={i} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hour</label>
                          <select
                            value={scheduleConfig.quarterlyTestHour}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, quarterlyTestHour: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 24}, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minute</label>
                          <select
                            value={scheduleConfig.quarterlyTestMinute}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, quarterlyTestMinute: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {[0, 15, 30, 45].map((m) => (
                              <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly Backup Verification */}
                <div className={`rounded-xl border overflow-hidden ${
                  isDarkMode ? 'border-slate-600' : 'border-gray-200'
                } ${scheduleConfig.enableMonthlyBackups ? '' : 'opacity-60'}`}>
                  <div className={`flex items-center justify-between p-4 ${
                    isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CircleStackIcon className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Monthly Backup Verification
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Verify backup integrity monthly
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleConfig.enableMonthlyBackups}
                        onChange={(e) => setScheduleConfig({...scheduleConfig, enableMonthlyBackups: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isDarkMode ? 'bg-slate-600 peer-checked:bg-purple-500' : 'bg-gray-300 peer-checked:bg-purple-600'
                      }`}></div>
                    </label>
                  </div>
                  {scheduleConfig.enableMonthlyBackups && (
                    <div className={`p-4 ${isDarkMode ? 'bg-slate-700/30' : 'bg-white'}`}>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Day of Month</label>
                          <select
                            value={scheduleConfig.monthlyBackupDay}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, monthlyBackupDay: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 28}, (_, i) => (
                              <option key={i} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hour</label>
                          <select
                            value={scheduleConfig.monthlyBackupHour}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, monthlyBackupHour: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 24}, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minute</label>
                          <select
                            value={scheduleConfig.monthlyBackupMinute}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, monthlyBackupMinute: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {[0, 15, 30, 45].map((m) => (
                              <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weekly Backups */}
                <div className={`rounded-xl border overflow-hidden ${
                  isDarkMode ? 'border-slate-600' : 'border-gray-200'
                } ${scheduleConfig.enableWeeklyBackups ? '' : 'opacity-60'}`}>
                  <div className={`flex items-center justify-between p-4 ${
                    isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <ArrowPathIcon className={`w-5 h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Weekly Backups
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Full backup once per week
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleConfig.enableWeeklyBackups}
                        onChange={(e) => setScheduleConfig({...scheduleConfig, enableWeeklyBackups: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isDarkMode ? 'bg-slate-600 peer-checked:bg-amber-500' : 'bg-gray-300 peer-checked:bg-amber-600'
                      }`}></div>
                    </label>
                  </div>
                  {scheduleConfig.enableWeeklyBackups && (
                    <div className={`p-4 ${isDarkMode ? 'bg-slate-700/30' : 'bg-white'}`}>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Day of Week</label>
                          <select
                            value={scheduleConfig.weeklyBackupDay}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, weeklyBackupDay: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                              <option key={i} value={i}>{d}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hour</label>
                          <select
                            value={scheduleConfig.weeklyBackupHour}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, weeklyBackupHour: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 24}, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minute</label>
                          <select
                            value={scheduleConfig.weeklyBackupMinute}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, weeklyBackupMinute: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {[0, 15, 30, 45].map((m) => (
                              <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Backups */}
                <div className={`rounded-xl border overflow-hidden ${
                  isDarkMode ? 'border-slate-600' : 'border-gray-200'
                } ${scheduleConfig.enableDailyBackups ? '' : 'opacity-60'}`}>
                  <div className={`flex items-center justify-between p-4 ${
                    isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <ClockIcon className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Daily Backups
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Incremental backup every day
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleConfig.enableDailyBackups}
                        onChange={(e) => setScheduleConfig({...scheduleConfig, enableDailyBackups: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        isDarkMode ? 'bg-slate-600 peer-checked:bg-cyan-500' : 'bg-gray-300 peer-checked:bg-cyan-600'
                      }`}></div>
                    </label>
                  </div>
                  {scheduleConfig.enableDailyBackups && (
                    <div className={`p-4 ${isDarkMode ? 'bg-slate-700/30' : 'bg-white'}`}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hour</label>
                          <select
                            value={scheduleConfig.dailyBackupHour}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, dailyBackupHour: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {Array.from({length: 24}, (_, i) => (
                              <option key={i} value={i}>{i.toString().padStart(2, '0')}:00</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Minute</label>
                          <select
                            value={scheduleConfig.dailyBackupMinute}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, dailyBackupMinute: parseInt(e.target.value)})}
                            className={`w-full px-3 py-2 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}
                          >
                            {[0, 15, 30, 45].map((m) => (
                              <option key={m} value={m}>:{m.toString().padStart(2, '0')}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notification Settings */}
                <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                  <div className={`p-4 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <BoltIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Notification Settings
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Notify before test</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Send reminder before scheduled tests</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={scheduleConfig.notifyHoursBefore}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, notifyHoursBefore: parseInt(e.target.value)})}
                            disabled={!scheduleConfig.notifyBeforeTest}
                            className={`px-2 py-1 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white disabled:opacity-50' : 'bg-white border-gray-300 disabled:opacity-50'}`}
                          >
                            <option value={1}>1 hour</option>
                            <option value={2}>2 hours</option>
                            <option value={4}>4 hours</option>
                            <option value={12}>12 hours</option>
                            <option value={24}>24 hours</option>
                            <option value={48}>48 hours</option>
                            <option value={72}>72 hours</option>
                          </select>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={scheduleConfig.notifyBeforeTest}
                              onChange={(e) => setScheduleConfig({...scheduleConfig, notifyBeforeTest: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                              isDarkMode ? 'bg-slate-600 peer-checked:bg-indigo-500' : 'bg-gray-300 peer-checked:bg-indigo-600'
                            }`}></div>
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Notify on completion</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Send notification when test completes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={scheduleConfig.notifyOnCompletion}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, notifyOnCompletion: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                            isDarkMode ? 'bg-slate-600 peer-checked:bg-indigo-500' : 'bg-gray-300 peer-checked:bg-indigo-600'
                          }`}></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Notify on failure</p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Alert immediately if a test fails</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={scheduleConfig.notifyOnFailure}
                            onChange={(e) => setScheduleConfig({...scheduleConfig, notifyOnFailure: e.target.checked})}
                            className="sr-only peer"
                          />
                          <div className={`w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all ${
                            isDarkMode ? 'bg-slate-600 peer-checked:bg-indigo-500' : 'bg-gray-300 peer-checked:bg-indigo-600'
                          }`}></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex gap-3 mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowSchedulerModal(false)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartScheduler}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Start Scheduler
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
