/**
 * LoadingState Component
 * Reusable loading indicators with variants for different contexts
 */

import { useTheme } from '../../context/ThemeContext'

// Spinner component
function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Skeleton loader for content placeholders
export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}) {
  const { isDarkMode } = useTheme()

  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-full',
    thumbnail: 'w-16 h-16 rounded-lg',
    card: 'h-32 rounded-xl',
    chart: 'h-64 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
    badge: 'h-6 w-16 rounded-full',
  }

  const baseClass = `animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`
  const variantClass = variants[variant] || variants.text

  const style = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClass} ${variantClass} ${className}`}
            style={{ ...style, width: i === count - 1 ? '60%' : style.width }}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// Table skeleton loader
export function TableSkeleton({ rows = 5, columns = 4 }) {
  const { isDarkMode } = useTheme()

  return (
    <div className="w-full" role="status" aria-label="Loading table data">
      <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        {/* Header */}
        <div className={`flex gap-4 p-4 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" className="flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex gap-4 p-4 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} border-t`}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Chart skeleton loader
export function ChartSkeleton({ type = 'bar', height = 256 }) {
  const { isDarkMode } = useTheme()

  return (
    <div
      className={`rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} p-4`}
      style={{ height }}
      role="status"
      aria-label="Loading chart"
    >
      <div className="flex flex-col h-full">
        {/* Chart title skeleton */}
        <Skeleton variant="title" width="40%" className="mb-4" />

        {/* Chart area */}
        <div className="flex-1 flex items-end gap-2 px-4">
          {type === 'bar' && (
            <>
              {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                  style={{ height: `${h}%` }}
                  aria-hidden="true"
                />
              ))}
            </>
          )}
          {type === 'line' && (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-full h-3/4" viewBox="0 0 100 50" preserveAspectRatio="none">
                <path
                  d="M0,40 Q20,30 30,35 T50,25 T70,30 T100,15"
                  fill="none"
                  stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                  strokeWidth="2"
                  className="animate-pulse"
                />
              </svg>
            </div>
          )}
          {type === 'pie' && (
            <div className="w-full h-full flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full animate-pulse ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>
      <span className="sr-only">Loading chart...</span>
    </div>
  )
}

// Card skeleton loader
export function CardSkeleton({ showImage = false, lines = 3 }) {
  const { isDarkMode } = useTheme()

  return (
    <div
      className={`rounded-xl border p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
      role="status"
      aria-label="Loading card"
    >
      {showImage && (
        <Skeleton variant="chart" height={120} className="mb-4" />
      )}
      <Skeleton variant="title" width="70%" className="mb-3" />
      <Skeleton count={lines} className="mb-2" />
      <div className="flex gap-2 mt-4">
        <Skeleton variant="badge" />
        <Skeleton variant="badge" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Full page loading state
export function PageLoader({ message = 'Loading...' }) {
  const { isDarkMode } = useTheme()

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] gap-4"
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" className={isDarkMode ? 'text-brand-purple' : 'text-purple-600'} />
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {message}
      </p>
    </div>
  )
}

// Inline loading indicator
export function InlineLoader({ message = 'Loading...', size = 'sm' }) {
  const { isDarkMode } = useTheme()

  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <Spinner size={size} className={isDarkMode ? 'text-brand-purple' : 'text-purple-600'} />
      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {message}
      </span>
    </div>
  )
}

// Overlay loading state
export function LoadingOverlay({ message = 'Processing...', transparent = false }) {
  const { isDarkMode } = useTheme()

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center z-10 rounded-xl ${
        transparent
          ? 'bg-transparent'
          : isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'
      } backdrop-blur-sm`}
      role="status"
      aria-live="assertive"
    >
      <Spinner size="lg" className={isDarkMode ? 'text-brand-purple' : 'text-purple-600'} />
      <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {message}
      </p>
    </div>
  )
}

// Stats grid skeleton
export function StatsGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="status" aria-label="Loading statistics">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={1} />
      ))}
      <span className="sr-only">Loading statistics...</span>
    </div>
  )
}

// Export default with all variants
export default function LoadingState({
  variant = 'page',
  message,
  ...props
}) {
  switch (variant) {
    case 'spinner':
      return <Spinner {...props} />
    case 'skeleton':
      return <Skeleton {...props} />
    case 'table':
      return <TableSkeleton {...props} />
    case 'chart':
      return <ChartSkeleton {...props} />
    case 'card':
      return <CardSkeleton {...props} />
    case 'page':
      return <PageLoader message={message} {...props} />
    case 'inline':
      return <InlineLoader message={message} {...props} />
    case 'overlay':
      return <LoadingOverlay message={message} {...props} />
    case 'stats':
      return <StatsGridSkeleton {...props} />
    default:
      return <PageLoader message={message} {...props} />
  }
}
