/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 */

import { Component } from 'react'
import { useTheme } from '../context/ThemeContext'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and optionally to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({ errorInfo })

    // Optional: Report to error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // Optional: Call reset callback
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        })
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          message={this.props.message}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, errorInfo, message, onReset, onReload }) {
  const { isDarkMode } = useTheme()
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className={`backdrop-blur-sm border border-red-500/30 rounded-xl p-8 text-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Something went wrong
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {message || "We encountered an unexpected error. Please try again."}
          </p>

          {/* Error Details (Development only) */}
          {import.meta.env.DEV && error && (
            <details className="mb-6 text-left">
              <summary className={`text-sm cursor-pointer mb-2 ${isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>
                Error Details
              </summary>
              <div className={`rounded-lg p-4 overflow-auto max-h-48 ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-100'}`}>
                <pre className="text-xs text-red-400 whitespace-pre-wrap break-words">
                  {error.toString()}
                </pre>
                {errorInfo && (
                  <pre className={`text-xs mt-2 whitespace-pre-wrap break-words ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onReset}
              className={`px-6 py-2.5 bg-brand-purple hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'}`}
            >
              Try Again
            </button>
            <button
              onClick={onReload}
              className={`px-6 py-2.5 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300 focus:ring-slate-500 focus:ring-offset-slate-800' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400 focus:ring-offset-white'}`}
            >
              Reload Page
            </button>
          </div>

          {/* Help Link */}
          <p className={`mt-6 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            If this problem persists, please{' '}
            <a
              href="mailto:support@rodeo.security"
              className="text-brand-purple-light hover:underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Specialized Error Boundary for Chart Components
 */
function ChartFallback({ resetError, chartName }) {
  const { isDarkMode } = useTheme()
  return (
    <div className={`h-64 flex items-center justify-center rounded-lg border ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
      <div className="text-center p-6">
        <svg
          className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Unable to render {chartName}
        </p>
        <button
          onClick={resetError}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export function ChartErrorBoundary({ children, chartName = 'Chart' }) {
  return (
    <ErrorBoundary
      message={`The ${chartName} failed to load. This might be due to invalid data.`}
      fallback={({ resetError }) => (
        <ChartFallback resetError={resetError} chartName={chartName} />
      )}
    />
  )
}

/**
 * Specialized Error Boundary for Page Components
 */
export function PageErrorBoundary({ children, pageName = 'page' }) {
  return (
    <ErrorBoundary
      message={`Failed to load the ${pageName}. Please try refreshing.`}
      onError={(error, errorInfo) => {
        // Could send to error tracking service here
        console.error(`Page error in ${pageName}:`, error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Specialized Error Boundary for Widget/Card Components
 */
function WidgetFallback({ resetError, widgetName }) {
  const { isDarkMode } = useTheme()
  return (
    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {widgetName} unavailable
          </span>
        </div>
        <button
          onClick={resetError}
          className="text-xs text-brand-purple-light hover:text-brand-purple transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export function WidgetErrorBoundary({ children, widgetName = 'widget' }) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <WidgetFallback resetError={resetError} widgetName={widgetName} />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
