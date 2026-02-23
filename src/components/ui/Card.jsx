/**
 * Card Component
 * Reusable card with variants and hover effects
 */

import { useTheme } from '../../context/ThemeContext'

export default function Card({
  children,
  className = '',
  variant = 'default',
  hover = false,
  glow = false,
  onClick,
}) {
  const { isDarkMode } = useTheme()

  const variants = isDarkMode ? {
    default: 'bg-slate-800 border-slate-700',
    primary: 'bg-gradient-to-br from-purple-900/50 to-slate-800 border-purple-700',
    success: 'bg-gradient-to-br from-green-900/30 to-slate-800 border-green-700',
    warning: 'bg-gradient-to-br from-orange-900/30 to-slate-800 border-orange-700',
    error: 'bg-gradient-to-br from-red-900/30 to-slate-800 border-red-700',
    glass: 'bg-slate-800/50 backdrop-blur-lg border-slate-700/50',
  } : {
    default: 'bg-white border-gray-200',
    primary: 'bg-gradient-to-br from-purple-100 to-white border-purple-300',
    success: 'bg-gradient-to-br from-green-100 to-white border-green-300',
    warning: 'bg-gradient-to-br from-orange-100 to-white border-orange-300',
    error: 'bg-gradient-to-br from-red-100 to-white border-red-300',
    glass: 'bg-white/50 backdrop-blur-lg border-gray-200/50',
  }

  const hoverClasses = hover ? 'hover-lift hover-glow cursor-pointer' : ''
  const glowClasses = glow ? 'animate-glowPulse' : ''

  return (
    <div
      className={`
        rounded-xl border p-6 transition-base
        ${variants[variant]}
        ${hoverClasses}
        ${glowClasses}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
