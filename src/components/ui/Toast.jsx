/**
 * Toast Notification System
 *
 * Provides non-intrusive notifications for success, error, warning, and info messages.
 * Uses a context-based approach for global access throughout the application.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from '../../context/ThemeContext'

// Toast Context
const ToastContext = createContext(null)

// Toast types with their configurations
const TOAST_TYPES = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    bgColor: 'bg-green-900/90',
    borderColor: 'border-green-500/50',
    iconColor: 'text-green-400',
    titleColor: 'text-green-300',
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    bgColor: 'bg-red-900/90',
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-400',
    titleColor: 'text-red-300',
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bgColor: 'bg-yellow-900/90',
    borderColor: 'border-yellow-500/50',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-300',
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-blue-900/90',
    borderColor: 'border-blue-500/50',
    iconColor: 'text-blue-400',
    titleColor: 'text-blue-300',
  },
}

// Individual Toast Component
function ToastItem({ toast, onDismiss }) {
  const { isDarkMode } = useTheme()
  const config = TOAST_TYPES[toast.type] || TOAST_TYPES.info
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }, [toast.id, onDismiss])

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(handleDismiss, toast.duration || 5000)
      return () => clearTimeout(timer)
    }
  }, [toast.duration, handleDismiss])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-xl
        transform transition-all duration-300 ease-out
        ${config.bgColor} ${config.borderColor}
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${config.iconColor}`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-semibold text-sm ${config.titleColor}`}>
            {toast.title}
          </p>
        )}
        <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {toast.message}
        </p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action.onClick()
              handleDismiss()
            }}
            className="mt-2 text-sm font-medium text-white hover:underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className={`flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar for auto-dismiss */}
      {toast.duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white/30 rounded-b-lg"
            style={{
              animation: `shrink ${toast.duration || 5000}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}

// Toast Container Component
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      aria-label="Notifications"
    >
      <style>
        {`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  )
}

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      message,
      ...options,
    })
  }, [addToast])

  // Convenience methods
  toast.success = (message, options = {}) => addToast({ type: 'success', message, ...options })
  toast.error = (message, options = {}) => addToast({ type: 'error', message, ...options })
  toast.warning = (message, options = {}) => addToast({ type: 'warning', message, ...options })
  toast.info = (message, options = {}) => addToast({ type: 'info', message, ...options })

  // Promise-based toast for async operations
  toast.promise = (promise, { loading, success, error }) => {
    const id = addToast({ type: 'info', message: loading, duration: Infinity })

    promise
      .then((result) => {
        removeToast(id)
        const message = typeof success === 'function' ? success(result) : success
        addToast({ type: 'success', message })
        return result
      })
      .catch((err) => {
        removeToast(id)
        const message = typeof error === 'function' ? error(err) : error
        addToast({ type: 'error', message })
        throw err
      })

    return promise
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

// Hook to use toast notifications
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Standalone toast function for use outside of React components (e.g., API client)
let globalToast = null

export function setGlobalToast(toastFn) {
  globalToast = toastFn
}

export function showToast(message, options = {}) {
  if (globalToast) {
    return globalToast(message, options)
  }
  console.warn('Toast system not initialized. Message:', message)
}

export function showSuccessToast(message, options = {}) {
  if (globalToast) {
    return globalToast.success(message, options)
  }
  console.log('Success:', message)
}

export function showErrorToast(message, options = {}) {
  if (globalToast) {
    return globalToast.error(message, options)
  }
  console.error('Error:', message)
}

export function showWarningToast(message, options = {}) {
  if (globalToast) {
    return globalToast.warning(message, options)
  }
  console.warn('Warning:', message)
}

export function showInfoToast(message, options = {}) {
  if (globalToast) {
    return globalToast.info(message, options)
  }
  console.info('Info:', message)
}

export default { ToastProvider, useToast, showToast, showSuccessToast, showErrorToast, showWarningToast, showInfoToast }
