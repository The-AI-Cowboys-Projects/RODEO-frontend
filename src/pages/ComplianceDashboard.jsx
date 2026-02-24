import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import CIIPDashboard from './CIIPDashboard'
import HITRUSTDashboard from './HITRUSTDashboard'
import {
  ShieldCheckIcon,
  BuildingLibraryIcon,
  HeartIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeAltIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  PlayCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { ShieldCheckIcon as ShieldCheckSolid, StarIcon } from '@heroicons/react/24/solid'

/**
 * Unified Compliance Dashboard
 * Provides tabbed interface for different compliance frameworks:
 * - CIIP (Critical Information Infrastructure Protection - ITU)
 * - HITRUST CSF v11.6.0
 */
export default function ComplianceDashboard() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('ciip')

  const frameworks = [
    {
      id: 'ciip',
      name: 'CIIP',
      fullName: 'Critical Information Infrastructure Protection',
      icon: BuildingLibraryIcon,
      description: 'ITU National Cybersecurity Framework for critical infrastructure across 16 sectors',
      color: 'blue',
      stats: { sectors: 16, controls: 150, coverage: '94%' },
      badges: [
        { label: 'International Standard', color: 'blue' },
        { label: '16 Sectors', color: 'indigo' },
      ]
    },
    {
      id: 'hitrust',
      name: 'HITRUST CSF',
      fullName: 'Healthcare Information Trust Alliance',
      icon: HeartIcon,
      description: 'Common Security Framework v11.6.0 harmonizing HIPAA, HITECH, PCI DSS, ISO 27001, NIST',
      color: 'pink',
      stats: { tiers: 3, controls: 156, coverage: '87%' },
      badges: [
        { label: '3 Certification Tiers', color: 'purple' },
        { label: 'Healthcare Focus', color: 'pink' },
      ]
    }
  ]

  const activeFramework = frameworks.find(f => f.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-r from-emerald-900/50 via-slate-900 to-teal-900/50 border-emerald-500/20' : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200'} rounded-2xl border p-8`}>
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: isDarkMode
            ? 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)'
            : 'linear-gradient(rgba(16,185,129,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                  <ShieldCheckIcon className="w-10 h-10 text-white" />
                </div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-xl flex items-center justify-center border-2 ${isDarkMode ? 'border-slate-900' : 'border-white'} shadow-lg`}>
                  <CheckBadgeIcon className="w-5 h-5 text-slate-900" />
                </div>
              </div>
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-white via-emerald-200 to-teal-200' : 'from-emerald-700 via-teal-600 to-emerald-800'} bg-clip-text text-transparent`}>
                  Compliance Frameworks
                </h1>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2 text-lg max-w-xl`}>
                  Monitor compliance status across regulatory frameworks and industry standards
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex gap-4">
              <QuickStat
                icon={DocumentCheckIcon}
                value="2"
                label="Frameworks"
                color="emerald"
              />
              <QuickStat
                icon={ChartBarIcon}
                value="306"
                label="Controls"
                color="teal"
              />
              <QuickStat
                icon={ClipboardDocumentCheckIcon}
                value="91%"
                label="Avg Coverage"
                color="cyan"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Framework Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworks.map((framework) => (
          <FrameworkTab
            key={framework.id}
            framework={framework}
            isActive={activeTab === framework.id}
            onClick={() => setActiveTab(framework.id)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className={`${isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border overflow-hidden`}>
        {/* Tab Header */}
        <div className={`flex items-center justify-between px-6 py-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-gray-50 border-gray-200'} border-b`}>
          <div className="flex items-center gap-3">
            {activeFramework && (
              <>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                  activeFramework.color === 'blue' ? 'from-blue-500 to-indigo-500' : 'from-pink-500 to-purple-500'
                } flex items-center justify-center`}>
                  <activeFramework.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeFramework.fullName}</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Compliance Dashboard</p>
                </div>
              </>
            )}
          </div>
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <SparklesIcon className="w-4 h-4 text-emerald-400" />
            <span>Real-time monitoring enabled</span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === 'ciip' && <CIIPDashboard />}
          {activeTab === 'hitrust' && <HITRUSTDashboard />}
        </div>
      </div>

      {/* Framework Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FrameworkInfoCard
          icon={BuildingLibraryIcon}
          name="CIIP Framework"
          fullName="Critical Information Infrastructure Protection"
          color="blue"
          description="International Telecommunication Union (ITU) framework for protecting critical information infrastructure across 16 sectors including energy, healthcare, telecommunications, and financial services."
          features={[
            { icon: GlobeAltIcon, text: '16 Critical Infrastructure Sectors', detail: 'Energy, Healthcare, Finance, Telecom, Transport, Water, and more' },
            { icon: ShieldCheckSolid, text: 'National Cybersecurity Strategy Aligned', detail: 'Follows ITU-T X.1205 recommendations' },
            { icon: ChartBarIcon, text: '150+ Security Controls', detail: 'Comprehensive technical and organizational controls' },
          ]}
          stats={{ coverage: 94, controls: 150, sectors: 16 }}
          isActive={activeTab === 'ciip'}
          onClick={() => setActiveTab('ciip')}
          isDarkMode={isDarkMode}
        />
        <FrameworkInfoCard
          icon={HeartIcon}
          name="HITRUST CSF"
          fullName="Health Information Trust Alliance"
          color="pink"
          description="Common Security Framework (CSF) v11.6.0 designed for healthcare organizations. Harmonizes requirements from HIPAA, HITECH, PCI DSS, ISO 27001, and NIST frameworks."
          features={[
            { icon: CheckBadgeIcon, text: 'e1, i1, r2 Certification Tiers', detail: 'Essentials, Implemented, Risk-based assessment levels' },
            { icon: DocumentCheckIcon, text: 'HIPAA & HITECH Compliant', detail: 'Full alignment with healthcare regulations' },
            { icon: ChartBarIcon, text: '156 Security Controls', detail: 'Mapped to 50+ authoritative sources' },
          ]}
          stats={{ coverage: 87, controls: 156, tiers: 3 }}
          isActive={activeTab === 'hitrust'}
          onClick={() => setActiveTab('hitrust')}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  )
}

// Quick Stat Component
function QuickStat({ icon: Icon, value, label, color }) {
  const { isDarkMode } = useTheme()

  const colorStyles = isDarkMode ? {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    teal: 'bg-teal-500/20 text-teal-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  } : {
    emerald: 'bg-emerald-100 text-emerald-600',
    teal: 'bg-teal-100 text-teal-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  }
  return (
    <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/90 border-gray-200 shadow-sm shadow-emerald-100/40'} backdrop-blur-sm rounded-xl border px-4 py-3`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colorStyles[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</div>
        </div>
      </div>
    </div>
  )
}

// Mini Stat Component
function MiniStat({ label, value, isDarkMode }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
    </div>
  )
}

// Animated Mini Stat with counter
function AnimatedStat({ label, value, color, isDarkMode, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = parseInt(value) || 0

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const end = numericValue
      const duration = 800
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
    }, delay)

    return () => clearTimeout(timer)
  }, [numericValue, delay])

  const colorClasses = {
    blue: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    pink: isDarkMode ? 'text-pink-400' : 'text-pink-600',
  }

  return (
    <div className="text-center transform hover:scale-110 transition-transform duration-200">
      <div className={`text-2xl font-bold ${colorClasses[color] || 'text-white'}`}>
        {displayValue}{typeof value === 'string' && value.includes('%') ? '%' : typeof value === 'string' && value.includes('+') ? '+' : ''}
      </div>
      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
    </div>
  )
}

// Framework Tab Component - Interactive selector
function FrameworkTab({ framework, isActive, onClick, isDarkMode }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = framework.icon

  const colorStyles = {
    blue: {
      activeBg: isDarkMode
        ? 'bg-gradient-to-br from-blue-600/30 via-slate-800/90 to-indigo-600/20'
        : 'bg-gradient-to-br from-blue-100 via-white to-indigo-100',
      activeBorder: isDarkMode ? 'border-blue-500/60' : 'border-blue-400',
      hoverBg: isDarkMode ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50',
      hoverBorder: isDarkMode ? 'hover:border-blue-500/40' : 'hover:border-blue-300',
      icon: 'from-blue-500 to-indigo-500',
      glow: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-300/30',
      progressBg: isDarkMode ? 'bg-slate-700' : 'bg-gray-200',
      progressFill: 'from-blue-500 to-indigo-500',
      badge: isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
    },
    pink: {
      activeBg: isDarkMode
        ? 'bg-gradient-to-br from-pink-600/30 via-slate-800/90 to-purple-600/20'
        : 'bg-gradient-to-br from-pink-100 via-white to-purple-100',
      activeBorder: isDarkMode ? 'border-pink-500/60' : 'border-pink-400',
      hoverBg: isDarkMode ? 'hover:bg-pink-500/10' : 'hover:bg-pink-50',
      hoverBorder: isDarkMode ? 'hover:border-pink-500/40' : 'hover:border-pink-300',
      icon: 'from-pink-500 to-purple-500',
      glow: isDarkMode ? 'bg-pink-500/20' : 'bg-pink-300/30',
      progressBg: isDarkMode ? 'bg-slate-700' : 'bg-gray-200',
      progressFill: 'from-pink-500 to-purple-500',
      badge: isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700',
      text: isDarkMode ? 'text-pink-400' : 'text-pink-600',
    }
  }
  const c = colorStyles[framework.color]

  const coverage = framework.stats.coverage

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden text-left p-6 rounded-2xl border-2 transition-all duration-300 group ${
        isActive
          ? `${c.activeBg} ${c.activeBorder} shadow-xl scale-[1.02]`
          : `${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} ${c.hoverBg} ${c.hoverBorder} hover:shadow-lg hover:scale-[1.01]`
      }`}
    >
      {/* Animated Glow Effect */}
      {(isActive || isHovered) && (
        <div className={`absolute top-0 right-0 w-64 h-64 ${c.glow} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
      )}

      {/* Pulsing Active Indicator */}
      {isActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${framework.color === 'blue' ? 'bg-blue-400' : 'bg-pink-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${framework.color === 'blue' ? 'bg-blue-500' : 'bg-pink-500'}`}></span>
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.badge}`}>
            ACTIVE
          </span>
        </div>
      )}

      <div className="relative flex items-start gap-4">
        {/* Animated Icon */}
        <div className={`w-16 h-16 bg-gradient-to-br ${c.icon} rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 ${isHovered || isActive ? 'scale-110 rotate-3' : ''}`}>
          <Icon className="w-8 h-8 text-white" />
          {/* Sparkle effect on hover */}
          {isHovered && (
            <SparklesIcon className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
          )}
        </div>

        <div className="flex-1">
          {/* Title with hover animation */}
          <div className="flex items-center gap-3 mb-1">
            <h3 className={`text-xl font-bold transition-all duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'} ${isHovered ? 'translate-x-1' : ''}`}>
              {framework.name}
            </h3>
          </div>
          <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{framework.fullName}</p>

          {/* Description with line clamp */}
          <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {framework.description}
          </p>

          {/* Animated Badges */}
          <div className="flex flex-wrap gap-2">
            {framework.badges.map((badge, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isHovered ? 'transform scale-105' : ''
                } ${
                  badge.color === 'blue' ? (isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700') :
                  badge.color === 'indigo' ? (isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700') :
                  badge.color === 'purple' ? (isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700') :
                  (isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700')
                }`}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Animated Arrow */}
        <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          isActive
            ? `${isDarkMode ? 'bg-white/20' : 'bg-gray-100'}`
            : `${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'} group-hover:${isDarkMode ? 'bg-slate-600' : 'bg-gray-100'}`
        }`}>
          <ChevronRightIcon className={`w-5 h-5 transition-all duration-300 ${
            isActive
              ? `${isDarkMode ? 'text-white' : 'text-gray-700'} rotate-90`
              : `${isDarkMode ? 'text-gray-500' : 'text-gray-400'} group-hover:translate-x-1`
          }`} />
        </div>
      </div>

      {/* Progress Bar (shows on hover or active) */}
      {(isActive || isHovered) && (
        <div className={`relative mt-5 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Compliance Coverage</span>
            <span className={`text-sm font-bold ${c.text}`}>{coverage}%</span>
          </div>
          <div className={`h-2 rounded-full ${c.progressBg} overflow-hidden`}>
            <div
              className={`h-full rounded-full bg-gradient-to-r ${c.progressFill} transition-all duration-1000 ease-out`}
              style={{ width: isActive ? `${coverage}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {/* Stats Bar - Enhanced */}
      {isActive && (
        <div className="relative mt-4 grid grid-cols-3 gap-4">
          {framework.id === 'ciip' ? (
            <>
              <AnimatedStat label="Sectors" value="16" color="blue" isDarkMode={isDarkMode} delay={0} />
              <AnimatedStat label="Controls" value="150" color="blue" isDarkMode={isDarkMode} delay={100} />
              <AnimatedStat label="Coverage" value="94" color="blue" isDarkMode={isDarkMode} delay={200} />
            </>
          ) : (
            <>
              <AnimatedStat label="Tiers" value="3" color="pink" isDarkMode={isDarkMode} delay={0} />
              <AnimatedStat label="Controls" value="156" color="pink" isDarkMode={isDarkMode} delay={100} />
              <AnimatedStat label="Coverage" value="87" color="pink" isDarkMode={isDarkMode} delay={200} />
            </>
          )}
        </div>
      )}
    </button>
  )
}

// Framework Info Card - Interactive Version
function FrameworkInfoCard({ icon: Icon, name, fullName, color, description, features, stats, isActive, onClick, isDarkMode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState(null)
  const [animatedCoverage, setAnimatedCoverage] = useState(0)

  // Animate coverage bar on mount/active
  useEffect(() => {
    if (isActive || isExpanded) {
      const timer = setTimeout(() => setAnimatedCoverage(stats.coverage), 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedCoverage(0)
    }
  }, [isActive, isExpanded, stats.coverage])

  const colorStyles = {
    blue: {
      border: isActive
        ? isDarkMode ? 'border-blue-500/60' : 'border-blue-400'
        : isDarkMode ? 'border-slate-700/50 hover:border-blue-500/40' : 'border-gray-200 hover:border-blue-300',
      bg: isActive
        ? isDarkMode ? 'bg-gradient-to-br from-blue-900/40 via-slate-800/80 to-indigo-900/40' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
        : isDarkMode ? 'bg-slate-800/60' : 'bg-white',
      glow: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-200/50',
      icon: isDarkMode ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500',
      iconText: 'text-white',
      feature: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      featureBg: isDarkMode ? 'bg-blue-500/10 hover:bg-blue-500/20' : 'bg-blue-50 hover:bg-blue-100',
      title: isDarkMode ? 'text-white' : 'text-slate-800',
      description: isDarkMode ? 'text-gray-300' : 'text-slate-600',
      featureText: isDarkMode ? 'text-gray-200' : 'text-slate-700',
      progressBg: isDarkMode ? 'bg-slate-700' : 'bg-gray-200',
      progressFill: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
      badge: isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
    },
    pink: {
      border: isActive
        ? isDarkMode ? 'border-pink-500/60' : 'border-pink-400'
        : isDarkMode ? 'border-slate-700/50 hover:border-pink-500/40' : 'border-gray-200 hover:border-pink-300',
      bg: isActive
        ? isDarkMode ? 'bg-gradient-to-br from-pink-900/40 via-slate-800/80 to-purple-900/40' : 'bg-gradient-to-br from-pink-50 via-white to-purple-50'
        : isDarkMode ? 'bg-slate-800/60' : 'bg-white',
      glow: isDarkMode ? 'bg-pink-500/20' : 'bg-pink-200/50',
      icon: isDarkMode ? 'bg-gradient-to-br from-pink-500 to-purple-500' : 'bg-gradient-to-br from-pink-500 to-purple-500',
      iconText: 'text-white',
      feature: isDarkMode ? 'text-pink-400' : 'text-pink-600',
      featureBg: isDarkMode ? 'bg-pink-500/10 hover:bg-pink-500/20' : 'bg-pink-50 hover:bg-pink-100',
      title: isDarkMode ? 'text-white' : 'text-slate-800',
      description: isDarkMode ? 'text-gray-300' : 'text-slate-600',
      featureText: isDarkMode ? 'text-gray-200' : 'text-slate-700',
      progressBg: isDarkMode ? 'bg-slate-700' : 'bg-gray-200',
      progressFill: 'bg-gradient-to-r from-pink-500 to-purple-500',
      button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600',
      badge: isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700',
    },
  }
  const c = colorStyles[color]

  return (
    <div
      className={`relative overflow-hidden ${c.bg} backdrop-blur-sm rounded-2xl border-2 ${c.border} p-6 transition-all duration-300 cursor-pointer group ${
        isActive ? 'shadow-xl scale-[1.02]' : 'shadow-sm hover:shadow-lg hover:scale-[1.01]'
      }`}
      onClick={onClick}
    >
      {/* Glow effect when active */}
      {isActive && (
        <div className={`absolute -top-20 -right-20 w-64 h-64 ${c.glow} rounded-full blur-3xl opacity-50`} />
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-4 right-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.badge}`}>
            <StarIcon className="w-3 h-3" />
            ACTIVE
          </span>
        </div>
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-14 h-14 rounded-xl ${c.icon} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${c.iconText}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${c.title} group-hover:translate-x-1 transition-transform`}>{name}</h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>{fullName}</p>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm ${c.description} mb-5 leading-relaxed`}>{description}</p>

        {/* Coverage Progress Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Coverage</span>
            <span className={`text-sm font-bold ${c.feature}`}>{stats.coverage}%</span>
          </div>
          <div className={`h-2.5 rounded-full ${c.progressBg} overflow-hidden`}>
            <div
              className={`h-full rounded-full ${c.progressFill} transition-all duration-1000 ease-out`}
              style={{ width: `${animatedCoverage}%` }}
            />
          </div>
        </div>

        {/* Interactive Features */}
        <div className="space-y-2 mb-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl p-3 ${c.featureBg} transition-all duration-200 cursor-pointer`}
              onMouseEnter={() => setHoveredFeature(idx)}
              onMouseLeave={() => setHoveredFeature(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <feature.icon className={`w-5 h-5 ${c.feature} flex-shrink-0 ${hoveredFeature === idx ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-sm font-medium ${c.featureText}`}>{feature.text}</span>
                <InformationCircleIcon className={`w-4 h-4 ml-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              {/* Tooltip on hover */}
              {hoveredFeature === idx && feature.detail && (
                <div className={`mt-2 pt-2 border-t ${isDarkMode ? 'border-slate-600/50' : 'border-gray-200'}`}>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{feature.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-3 gap-3 mb-5 p-3 rounded-xl ${isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className={`text-lg font-bold ${c.feature}`}>{stats.controls}</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Controls</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${c.feature}`}>{stats.sectors || stats.tiers}</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stats.sectors ? 'Sectors' : 'Tiers'}</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${c.feature}`}>{stats.coverage}%</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Ready</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            className={`flex-1 py-2.5 px-4 rounded-xl text-white font-medium ${c.button} transition-all flex items-center justify-center gap-2 shadow-lg`}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <PlayCircleIcon className="w-5 h-5" />
            {isActive ? 'Viewing Dashboard' : 'View Dashboard'}
          </button>
          <button
            className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Section */}
        {isExpanded && (
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-600/50' : 'border-gray-200'} animate-fadeIn`}>
            <h4 className={`text-sm font-semibold mb-3 ${c.title}`}>Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Run Assessment', icon: ChartBarIcon },
                { label: 'Export Report', icon: ArrowTopRightOnSquareIcon },
                { label: 'View Controls', icon: ClipboardDocumentCheckIcon },
                { label: 'Gap Analysis', icon: ExclamationTriangleIcon },
              ].map((action, idx) => (
                <button
                  key={idx}
                  className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all ${
                    isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <action.icon className={`w-4 h-4 ${c.feature}`} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
