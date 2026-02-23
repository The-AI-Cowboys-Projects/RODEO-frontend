/**
 * Badge Component
 * Status indicators and labels with color variants
 * Enhanced with WCAG-compliant color contrast
 */

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  dot = false,
  className = '',
  ariaLabel,
}) {
  // Enhanced variants with better color contrast (4.5:1 minimum)
  const variants = {
    default: 'bg-slate-700 text-slate-100 border-slate-600',
    primary: 'bg-purple-600 text-white border-purple-500',
    success: 'bg-green-600 text-white border-green-500',
    warning: 'bg-orange-500 text-white border-orange-400',
    danger: 'bg-red-600 text-white border-red-500',
    info: 'bg-blue-600 text-white border-blue-500',

    // Subtle variants (for less emphasis)
    'default-subtle': 'bg-slate-800 text-slate-200 border-slate-700',
    'primary-subtle': 'bg-purple-900/50 text-purple-200 border-purple-700',
    'success-subtle': 'bg-green-900/50 text-green-200 border-green-700',
    'warning-subtle': 'bg-orange-900/50 text-orange-200 border-orange-700',
    'danger-subtle': 'bg-red-900/50 text-red-200 border-red-700',
    'info-subtle': 'bg-blue-900/50 text-blue-200 border-blue-700',

    // Risk levels with high contrast
    critical: 'bg-red-600 text-white border-red-500 font-semibold',
    high: 'bg-orange-600 text-white border-orange-500',
    medium: 'bg-yellow-500 text-gray-900 border-yellow-400', // Dark text for yellow
    low: 'bg-green-600 text-white border-green-500',
    informational: 'bg-gray-600 text-white border-gray-500',

    // Outline variants
    'outline-primary': 'bg-transparent text-purple-400 border-purple-500',
    'outline-success': 'bg-transparent text-green-400 border-green-500',
    'outline-warning': 'bg-transparent text-orange-400 border-orange-500',
    'outline-danger': 'bg-transparent text-red-400 border-red-500',
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
