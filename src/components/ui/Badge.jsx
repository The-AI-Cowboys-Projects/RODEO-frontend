/**
 * Badge Component
 * Status indicators and labels with color variants
 * Enhanced with WCAG-compliant color contrast
 */

import { useTheme } from '../../context/ThemeContext'

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  dot = false,
  className = '',
  ariaLabel,
}) {
  const { isDarkMode } = useTheme()

  // Enhanced variants with better color contrast (4.5:1 minimum)
  const variants = isDarkMode ? {
    default: 'bg-slate-700/80 text-slate-100 border-slate-600',
    primary: 'bg-purple-600 text-white border-purple-500',
    success: 'bg-green-500/15 text-green-300 border-green-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-300 border-red-500/30',
    info: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    'default-subtle': 'bg-slate-800 text-slate-200 border-slate-700',
    'primary-subtle': 'bg-purple-900/50 text-purple-200 border-purple-700',
    'success-subtle': 'bg-green-900/50 text-green-200 border-green-700',
    'warning-subtle': 'bg-orange-900/50 text-orange-200 border-orange-700',
    'danger-subtle': 'bg-red-900/50 text-red-200 border-red-700',
    'info-subtle': 'bg-blue-900/50 text-blue-200 border-blue-700',
    critical: 'bg-red-600 text-white border-red-500 font-semibold',
    high: 'bg-orange-600 text-white border-orange-500',
    medium: 'bg-yellow-500 text-gray-900 border-yellow-400',
    low: 'bg-green-600 text-white border-green-500',
    informational: 'bg-gray-600 text-white border-gray-500',
    'outline-primary': 'bg-transparent text-purple-400 border-purple-500',
    'outline-success': 'bg-transparent text-green-400 border-green-500',
    'outline-warning': 'bg-transparent text-orange-400 border-orange-500',
    'outline-danger': 'bg-transparent text-red-400 border-red-500',
  } : {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-purple-600 text-white border-purple-500',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    'default-subtle': 'bg-gray-50 text-gray-600 border-gray-200',
    'primary-subtle': 'bg-purple-50 text-purple-700 border-purple-200',
    'success-subtle': 'bg-green-50 text-green-700 border-green-200',
    'warning-subtle': 'bg-amber-50 text-amber-700 border-amber-200',
    'danger-subtle': 'bg-red-50 text-red-700 border-red-200',
    'info-subtle': 'bg-blue-50 text-blue-700 border-blue-200',
    critical: 'bg-red-600 text-white border-red-500 font-semibold',
    high: 'bg-orange-600 text-white border-orange-500',
    medium: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    low: 'bg-green-600 text-white border-green-500',
    informational: 'bg-gray-200 text-gray-700 border-gray-300',
    'outline-primary': 'bg-transparent text-purple-700 border-purple-400',
    'outline-success': 'bg-transparent text-green-700 border-green-400',
    'outline-warning': 'bg-transparent text-orange-700 border-orange-400',
    'outline-danger': 'bg-transparent text-red-700 border-red-400',
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const roundedClass = rounded ? 'rounded-full' : 'rounded-md'

  // Dot colors for status indicators
  const dotColors = {
    success: 'bg-green-400',
    warning: 'bg-orange-400',
    danger: 'bg-red-400',
    critical: 'bg-red-400',
    high: 'bg-orange-400',
    medium: 'bg-yellow-400',
    low: 'bg-green-400',
    info: 'bg-blue-400',
    default: 'bg-slate-400',
  }

  const shouldPulse = ['success', 'warning', 'danger', 'critical'].includes(variant)

  return (
    <span
      className={`
        inline-flex items-center
        font-medium border
        ${variants[variant] || variants.default}
        ${sizes[size]}
        ${roundedClass}
        ${className}
      `}
      role={ariaLabel ? 'status' : undefined}
      aria-label={ariaLabel}
    >
      {dot && (
        <span
          className={`
            inline-block w-1.5 h-1.5 rounded-full mr-1.5
            ${dotColors[variant] || dotColors.default}
            ${shouldPulse ? 'animate-pulse' : ''}
          `}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

// Severity badge preset
export function SeverityBadge({ severity, size = 'sm', ...props }) {
  const severityMap = {
    critical: { variant: 'critical', label: 'Critical' },
    high: { variant: 'high', label: 'High' },
    medium: { variant: 'medium', label: 'Medium' },
    low: { variant: 'low', label: 'Low' },
    informational: { variant: 'informational', label: 'Info' },
    info: { variant: 'informational', label: 'Info' },
  }

  const config = severityMap[severity?.toLowerCase()] || severityMap.informational

  return (
    <Badge
      variant={config.variant}
      size={size}
      ariaLabel={`Severity: ${config.label}`}
      {...props}
    >
      {props.children || config.label}
    </Badge>
  )
}

// Status badge preset
export function StatusBadge({ status, size = 'sm', ...props }) {
  const statusMap = {
    active: { variant: 'success', label: 'Active', dot: true },
    running: { variant: 'success', label: 'Running', dot: true },
    completed: { variant: 'success', label: 'Completed' },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    warning: { variant: 'warning', label: 'Warning', dot: true },
    error: { variant: 'danger', label: 'Error', dot: true },
    failed: { variant: 'danger', label: 'Failed' },
    inactive: { variant: 'default', label: 'Inactive' },
    disabled: { variant: 'default', label: 'Disabled' },
  }

  const config = statusMap[status?.toLowerCase()] || { variant: 'default', label: status }

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={config.dot}
      ariaLabel={`Status: ${config.label}`}
      {...props}
    >
      {props.children || config.label}
    </Badge>
  )
}
