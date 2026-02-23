/**
 * EmptyState Component
 * Reusable empty states for different contexts with actions
 */

import { useTheme } from '../../context/ThemeContext'
import Button from './Button'

// Icon components for common empty states
const Icons = {
  noData: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  noResults: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  error: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  noVulnerabilities: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  noSamples: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  noPatches: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  noNetwork: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  noAlerts: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  noCompliance: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  upload: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  ),
  folder: (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
}

// Preset configurations for common empty states
const presets = {
  noData: {
    icon: 'noData',
    title: 'No data available',
    description: 'There is no data to display at this time.',
  },
  noResults: {
    icon: 'noResults',
    title: 'No results found',
    description: 'Try adjusting your search or filter criteria.',
  },
  error: {
    icon: 'error',
    title: 'Something went wrong',
    description: 'We encountered an error loading this data. Please try again.',
    actionLabel: 'Retry',
  },
  noVulnerabilities: {
    icon: 'noVulnerabilities',
    title: 'No vulnerabilities detected',
    description: 'Great news! No security vulnerabilities were found in your scan.',
  },
  noSamples: {
    icon: 'noSamples',
    title: 'No samples yet',
    description: 'Upload your first malware sample to start analysis.',
    actionLabel: 'Upload Sample',
  },
  noPatches: {
    icon: 'noPatches',
    title: 'No patches available',
    description: 'All systems are up to date with the latest patches.',
  },
  noNetwork: {
    icon: 'noNetwork',
    title: 'No network data',
    description: 'Network analytics will appear here once traffic is detected.',
  },
  noAlerts: {
    icon: 'noAlerts',
    title: 'No active alerts',
    description: 'You have no pending security alerts at this time.',
  },
  noCompliance: {
    icon: 'noCompliance',
    title: 'No compliance data',
    description: 'Run a compliance scan to see your security posture.',
    actionLabel: 'Start Scan',
  },
  upload: {
    icon: 'upload',
    title: 'Upload files',
    description: 'Drag and drop files here, or click to browse.',
    actionLabel: 'Browse Files',
  },
  emptyFolder: {
    icon: 'folder',
    title: 'This folder is empty',
    description: 'No files or folders to display.',
  },
}

export default function EmptyState({
  preset,
  icon,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryLabel,
  size = 'md',
  className = '',
}) {
  const { isDarkMode } = useTheme()

  // Merge preset with custom props
  const config = preset ? { ...presets[preset] } : {}
  const finalIcon = icon || config.icon || 'noData'
  const finalTitle = title || config.title || 'No data'
  const finalDescription = description || config.description
  const finalActionLabel = actionLabel || config.actionLabel

  const IconComponent = typeof finalIcon === 'string' ? Icons[finalIcon] : finalIcon

  const sizes = {
    sm: {
      container: 'py-8 px-4',
      icon: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
    },
  }

  const sizeConfig = sizes[size]

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${sizeConfig.container}
        ${className}
      `}
      role="status"
      aria-label={finalTitle}
    >
      {/* Icon */}
      <div
        className={`
          ${sizeConfig.icon} mb-4
          ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}
        `}
      >
        {IconComponent && <IconComponent className="w-full h-full" />}
      </div>

      {/* Title */}
      <h3
        className={`
          font-semibold mb-2 ${sizeConfig.title}
          ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}
        `}
      >
        {finalTitle}
      </h3>

      {/* Description */}
      {finalDescription && (
        <p
          className={`
            max-w-sm mb-6 ${sizeConfig.description}
            ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
          `}
        >
          {finalDescription}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant="primary"
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={action}
            >
              {finalActionLabel || 'Take Action'}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={secondaryAction}
            >
              {secondaryLabel || 'Learn More'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Table-specific empty state
export function TableEmptyState({
  preset = 'noData',
  colSpan = 1,
  ...props
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <EmptyState preset={preset} size="md" {...props} />
      </td>
    </tr>
  )
}

// Card-wrapped empty state
export function CardEmptyState({
  preset = 'noData',
  ...props
}) {
  const { isDarkMode } = useTheme()

  return (
    <div
      className={`
        rounded-xl border p-6
        ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}
      `}
    >
      <EmptyState preset={preset} size="sm" {...props} />
    </div>
  )
}

// Full page empty state
export function PageEmptyState({
  preset = 'noData',
  ...props
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <EmptyState preset={preset} size="lg" {...props} />
    </div>
  )
}
