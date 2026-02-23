/**
 * FormField Component
 * Reusable form field with validation, error messages, and accessibility
 */

import { useState, useId } from 'react'
import { useTheme } from '../../context/ThemeContext'

// Validation rules
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required'
    }
    return null
  },
  email: (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },
  minLength: (min) => (value) => {
    if (!value) return null
    if (value.length < min) {
      return `Must be at least ${min} characters`
    }
    return null
  },
  maxLength: (max) => (value) => {
    if (!value) return null
    if (value.length > max) {
      return `Must be no more than ${max} characters`
    }
    return null
  },
  pattern: (regex, message) => (value) => {
    if (!value) return null
    if (!regex.test(value)) {
      return message || 'Invalid format'
    }
    return null
  },
  match: (otherValue, fieldName) => (value) => {
    if (!value) return null
    if (value !== otherValue) {
      return `Must match ${fieldName}`
    }
    return null
  },
  url: (value) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },
  number: (value) => {
    if (!value) return null
    if (isNaN(Number(value))) {
      return 'Please enter a valid number'
    }
    return null
  },
  ip: (value) => {
    if (!value) return null
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(value)) {
      return 'Please enter a valid IP address'
    }
    return null
  },
  cidr: (value) => {
    if (!value) return null
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/
    if (!cidrRegex.test(value)) {
      return 'Please enter a valid CIDR notation (e.g., 192.168.1.0/24)'
    }
    return null
  },
}

// Run multiple validators
export function validate(value, rules = []) {
  for (const rule of rules) {
    const error = typeof rule === 'function' ? rule(value) : null
    if (error) return error
  }
  return null
}

// Input field component
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  hint,
  prefix,
  suffix,
  icon,
  className = '',
  inputClassName = '',
  rows = 3,
  options = [],
  ...props
}) {
  const { isDarkMode } = useTheme()
  const id = useId()
  const [focused, setFocused] = useState(false)

  const hasError = touched && error
  const showError = hasError && !focused

  const baseInputClasses = `
    w-full px-3 py-2 rounded-lg border transition-colors
    ${isDarkMode
      ? 'bg-slate-700 text-white placeholder-gray-400'
      : 'bg-white text-gray-900 placeholder-gray-500'
    }
    ${hasError
      ? isDarkMode
        ? 'border-red-500 focus:border-red-400 focus:ring-red-400/20'
        : 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : isDarkMode
        ? 'border-slate-600 focus:border-purple-500 focus:ring-purple-500/20'
        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500/20'
    }
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${prefix ? 'pl-10' : ''}
    ${suffix || icon ? 'pr-10' : ''}
    ${inputClassName}
  `

  const handleFocus = () => setFocused(true)
  const handleBlur = (e) => {
    setFocused(false)
    if (onBlur) onBlur(e)
  }

  const renderInput = () => {
    const commonProps = {
      id,
      name,
      value,
      onChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      placeholder,
      disabled,
      readOnly,
      autoComplete,
      autoFocus,
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${id}-error` : hint ? `${id}-hint` : undefined,
      ...props,
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            className={baseInputClasses}
          />
        )

      case 'select':
        return (
          <select {...commonProps} className={baseInputClasses}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              {...commonProps}
              type="checkbox"
              checked={value}
              className={`
                w-4 h-4 rounded border transition-colors
                ${isDarkMode
                  ? 'bg-slate-700 border-slate-600'
                  : 'bg-white border-gray-300'
                }
                text-purple-600 focus:ring-purple-500 focus:ring-offset-0
                disabled:opacity-50
              `}
            />
            {label && (
              <label
                htmlFor={id}
                className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        )

      default:
        return (
          <input
            {...commonProps}
            type={type}
            className={baseInputClasses}
          />
        )
    }
  }

  // Checkbox has inline label
  if (type === 'checkbox') {
    return (
      <div className={`${className}`}>
        {renderInput()}
        {showError && (
          <p
            id={`${id}-error`}
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1.5 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Prefix icon */}
        {prefix && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {prefix}
          </div>
        )}

        {renderInput()}

        {/* Suffix or validation icon */}
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {hasError ? (
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : touched && !error && value ? (
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : suffix ? (
            suffix
          ) : icon ? (
            icon
          ) : null}
        </div>
      </div>

      {/* Error message */}
      {showError && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !showError && (
        <p
          id={`${id}-hint`}
          className={`mt-1.5 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

// Password field with toggle visibility
export function PasswordField({
  showStrength = false,
  ...props
}) {
  const { isDarkMode } = useTheme()
  const [showPassword, setShowPassword] = useState(false)

  const getStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-lime-500' },
      { label: 'Strong', color: 'bg-green-500' },
    ]

    return { score, ...levels[Math.min(score, levels.length - 1)] }
  }

  const strength = showStrength ? getStrength(props.value) : null

  return (
    <div>
      <FormField
        {...props}
        type={showPassword ? 'text' : 'password'}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`p-1 -m-1 ${isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        }
      />
      {showStrength && props.value && (
        <div className="mt-2">
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`flex-1 rounded-full transition-colors ${
                  level <= strength.score
                    ? strength.color
                    : isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Password strength: <span className="font-medium">{strength.label}</span>
          </p>
        </div>
      )}
    </div>
  )
}

// Form group for organizing fields
export function FormGroup({
  children,
  title,
  description,
  className = '',
}) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
          )}
          {description && (
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
