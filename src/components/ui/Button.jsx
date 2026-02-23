/**
 * Button Component
 * Versatile button with variants, sizes, and loading states
 * Enhanced with WCAG-compliant focus states and hover effects
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...props
}) {
  // Enhanced variants with better hover states and shadows
  const variants = {
    primary: `
      bg-purple-600 text-white border-purple-600
      hover:bg-purple-500 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/25
      active:bg-purple-700 active:scale-[0.98]
    `,
    secondary: `
      bg-slate-700 text-white border-slate-600
      hover:bg-slate-600 hover:border-slate-500 hover:shadow-md
      active:bg-slate-700 active:scale-[0.98]
    `,
    success: `
      bg-green-600 text-white border-green-600
      hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/25
      active:bg-green-700 active:scale-[0.98]
    `,
    danger: `
      bg-red-600 text-white border-red-600
      hover:bg-red-500 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/25
      active:bg-red-700 active:scale-[0.98]
    `,
    warning: `
      bg-orange-600 text-white border-orange-600
      hover:bg-orange-500 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/25
      active:bg-orange-700 active:scale-[0.98]
    `,
    ghost: `
      bg-transparent text-gray-300 border-slate-700
      hover:bg-slate-800 hover:text-white hover:border-slate-600
      active:bg-slate-900
    `,
    link: `
      bg-transparent text-purple-400 border-transparent
      hover:text-purple-300 hover:underline underline-offset-4
      active:text-purple-500
    `,
    outline: `
      bg-transparent text-purple-400 border-purple-500
      hover:bg-purple-500/10 hover:text-purple-300
      active:bg-purple-500/20
    `,
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  }

  // Icon-only button sizes
  const iconOnlySizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4',
  }

  const isDisabled = disabled || loading
  const isIconOnly = icon && !children

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg border
        transition-all duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]}
        ${isIconOnly ? iconOnlySizes[size] : sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
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
          {!isIconOnly && <span>Loading...</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={children ? '' : ''} aria-hidden="true">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span aria-hidden="true">{icon}</span>
          )}
        </>
      )}
    </button>
  )
}

// Icon Button variant for compact icon-only buttons
export function IconButton({
  icon,
  ariaLabel,
  variant = 'ghost',
  size = 'md',
  ...props
}) {
  return (
    <Button
      icon={icon}
      variant={variant}
      size={size}
      ariaLabel={ariaLabel}
      {...props}
    />
  )
}

// Button Group for grouping related buttons
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  className = '',
}) {
  return (
    <div
      className={`
        inline-flex
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
        ${className}
      `}
      role="group"
    >
      {children}
    </div>
  )
}
