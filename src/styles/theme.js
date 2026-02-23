/**
 * RODEO Design System Theme
 * Centralized theme configuration for consistent UI/UX
 */

export const theme = {
  // Color Palette
  colors: {
    // Brand Colors
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    // Background
    background: {
      primary: '#0f172a',   // slate-900
      secondary: '#1e293b', // slate-800
      tertiary: '#334155',  // slate-700
      hover: '#475569',     // slate-600
    },
    // Text
    text: {
      primary: '#f1f5f9',   // slate-100
      secondary: '#cbd5e1', // slate-300
      tertiary: '#94a3b8',  // slate-400
      muted: '#64748b',     // slate-500
    },
    // Semantic Colors
    success: {
      light: '#86efac',
      DEFAULT: '#22c55e',
      dark: '#166534',
      bg: '#14532d',
    },
    warning: {
      light: '#fcd34d',
      DEFAULT: '#f59e0b',
      dark: '#b45309',
      bg: '#451a03',
    },
    error: {
      light: '#fca5a5',
      DEFAULT: '#ef4444',
      dark: '#b91c1c',
      bg: '#7f1d1d',
    },
    info: {
      light: '#7dd3fc',
      DEFAULT: '#3b82f6',
      dark: '#1e40af',
      bg: '#1e3a8a',
    },
    // Risk Levels
    risk: {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#84cc16',
      none: '#64748b',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"Fira Code", "Cascadia Code", Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(168, 85, 247, 0.4)',
    glowLg: '0 0 40px rgba(168, 85, 247, 0.6)',
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
}

// Helper functions
export const getRiskColor = (score) => {
  if (score >= 0.9) return theme.colors.risk.critical
  if (score >= 0.7) return theme.colors.risk.high
  if (score >= 0.5) return theme.colors.risk.medium
  if (score >= 0.3) return theme.colors.risk.low
  return theme.colors.risk.none
}

export const getRiskLabel = (score) => {
  if (score >= 0.9) return 'Critical'
  if (score >= 0.7) return 'High'
  if (score >= 0.5) return 'Medium'
  if (score >= 0.3) return 'Low'
  return 'None'
}

export const getSeverityColor = (severity) => {
  const map = {
    critical: theme.colors.risk.critical,
    high: theme.colors.risk.high,
    medium: theme.colors.risk.medium,
    low: theme.colors.risk.low,
    info: theme.colors.info.DEFAULT,
  }
  return map[severity?.toLowerCase()] || theme.colors.text.muted
}

export default theme
