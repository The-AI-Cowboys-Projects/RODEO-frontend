/**
 * ChartWrapper Component
 * Accessible chart wrapper with enhanced tooltips, legends, and keyboard navigation
 */

import { useTheme } from '../../context/ThemeContext'
import { ChartSkeleton } from './LoadingState'
import EmptyState from './EmptyState'

// Custom tooltip component for Recharts
export function CustomTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  valuePrefix = '',
  valueSuffix = '',
}) {
  const { isDarkMode } = useTheme()

  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div
      className={`
        px-3 py-2 rounded-lg shadow-lg border
        ${isDarkMode
          ? 'bg-slate-800 border-slate-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'
        }
      `}
      role="tooltip"
    >
      {label && (
        <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            {entry.name}:
          </span>
          <span className="font-semibold">
            {valuePrefix}
            {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}
            {valueSuffix}
          </span>
        </div>
      ))}
    </div>
  )
}

// Custom legend component for Recharts
export function CustomLegend({
  payload,
  onClick,
  orientation = 'horizontal',
  align = 'center',
}) {
  const { isDarkMode } = useTheme()

  if (!payload || payload.length === 0) {
    return null
  }

  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <ul
      className={`
        flex flex-wrap gap-x-4 gap-y-2 mt-4 px-2
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
        ${alignClasses[align]}
      `}
      role="list"
      aria-label="Chart legend"
    >
      {payload.map((entry, index) => (
        <li key={`legend-${index}`}>
          <button
            type="button"
            className={`
              flex items-center gap-2 text-sm transition-opacity
              ${entry.inactive ? 'opacity-40' : 'opacity-100'}
              hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              ${isDarkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'}
              rounded px-1 py-0.5
            `}
            onClick={() => onClick && onClick(entry, index)}
            aria-pressed={!entry.inactive}
            aria-label={`${entry.inactive ? 'Show' : 'Hide'} ${entry.value}`}
          >
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.inactive ? '#9ca3af' : entry.color }}
              aria-hidden="true"
            />
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {entry.value}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

// Accessible color palette that meets WCAG contrast requirements
export const accessibleColors = {
  // High contrast palette for charts
  primary: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'],
  // Colorblind-friendly palette
  colorblind: ['#0077bb', '#33bbee', '#009988', '#ee7733', '#cc3311', '#ee3377', '#bbbbbb', '#000000'],
  // Sequential palette for gradients
  sequential: {
    purple: ['#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9'],
    blue: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
    green: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534'],
  },
  // Severity palette
  severity: {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    informational: '#6b7280',
  },
}

// Chart wrapper with loading, empty, and error states
export default function ChartWrapper({
  title,
  description,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'No data available',
  height = 300,
  children,
  className = '',
  actions,
}) {
  const { isDarkMode } = useTheme()

  return (
    <div
      className={`
        rounded-xl border p-4
        ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}
        ${className}
      `}
      role="figure"
      aria-label={title}
    >
      {/* Header */}
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
            )}
            {description && (
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ minHeight: height }}>
        {loading ? (
          <ChartSkeleton height={height} />
        ) : error ? (
          <EmptyState
            preset="error"
            title="Failed to load chart"
            description={error.message || 'An error occurred while loading the chart data.'}
            size="sm"
          />
        ) : isEmpty ? (
          <EmptyState
            preset="noData"
            title={emptyMessage}
            size="sm"
          />
        ) : (
          <div
            className="w-full"
            style={{ height }}
            role="img"
            aria-label={description || title || 'Chart visualization'}
          >
            {children}
          </div>
        )}
      </div>

      {/* Screen reader description */}
      {!loading && !error && !isEmpty && description && (
        <div className="sr-only" aria-live="polite">
          {description}
        </div>
      )}
    </div>
  )
}

// Data table for screen reader accessibility (hidden visually)
export function ChartDataTable({
  data,
  columns,
  caption,
  className = '',
}) {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <table className={`sr-only ${className}`} aria-label={caption}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i} scope="col">{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col, colIndex) => (
              <td key={colIndex}>
                {col.accessor ? col.accessor(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// Utility function to format numbers for display
export function formatChartValue(value, type = 'number') {
  if (value === null || value === undefined) return '-'

  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value)
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value)
    case 'bytes':
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let unitIndex = 0
      let size = value
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    default:
      return value.toLocaleString()
  }
}
