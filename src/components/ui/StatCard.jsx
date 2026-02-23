/**
 * StatCard Component
 * Displays key metrics with icons and trends
 */

import { useTheme } from '../../context/ThemeContext'

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendDirection = 'neutral',
  variant = 'default',
  loading = false,
  className = '',
}) {
  const { isDarkMode } = useTheme()

  const variants = isDarkMode ? {
    default: 'from-slate-800 to-slate-800',
    primary: 'from-purple-900/30 to-slate-800',
    success: 'from-green-900/30 to-slate-800',
    warning: 'from-orange-900/30 to-slate-800',
    danger: 'from-red-900/30 to-slate-800',
  } : {
    default: 'from-white to-white',
    primary: 'from-purple-100 to-white',
    success: 'from-green-100 to-white',
    warning: 'from-orange-100 to-white',
    danger: 'from-red-100 to-white',
  }

  const iconColors = isDarkMode ? {
    default: 'text-slate-400',
    primary: 'text-purple-400',
    success: 'text-green-400',
    warning: 'text-orange-400',
    danger: 'text-red-400',
  } : {
    default: 'text-slate-600',
    primary: 'text-purple-600',
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
  }

  const trendDirections = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-br ${variants[variant]} p-6 rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} ${className}`}>
        <div className="animate-pulse">
          <div className={`h-4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded w-1/2 mb-4`}></div>
          <div className={`h-8 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded w-3/4`}></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
        bg-gradient-to-br ${variants[variant]}
        p-6 rounded-xl border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}
        transition-base hover-lift
        animate-fadeInUp
        ${className}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
        {icon && <span className={`text-2xl ${iconColors[variant]}`}>{icon}</span>}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trendDirections[trendDirection]}`}>
              {trendDirection === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trendDirection === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              <span className="font-medium">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
