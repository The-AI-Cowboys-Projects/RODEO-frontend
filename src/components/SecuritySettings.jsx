import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const API_BASE = ''

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rodeo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default function SecuritySettings() {
  const { isDarkMode } = useTheme()
  const queryClient = useQueryClient()
  const [saveStatus, setSaveStatus] = useState(null)

  const [formData, setFormData] = useState({
    session_timeout_minutes: 60,
    require_mfa: false,
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_special: true,
    password_expiry_days: 90,
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
    enable_api_rate_limiting: true,
    api_rate_limit_per_minute: 100,
    enable_audit_logging: true,
    log_retention_days: 365,
  })

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      const response = await api.get('/api/settings/security')
      return response.data
    },
  })

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/settings/security', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['security-settings'])
      setSaveStatus({ type: 'success', message: data.message })
      setTimeout(() => setSaveStatus(null), 3000)
    },
    onError: (error) => {
      setSaveStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to save security settings',
      })
      setTimeout(() => setSaveStatus(null), 5000)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaveStatus(null)
    saveMutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-brand-purple-light">Loading security settings...</div>
      </div>
    )
  }

  // Shared class helpers
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
  const sectionBorder = isDarkMode ? 'border-slate-700' : 'border-gray-200'
  const labelText = isDarkMode ? 'text-gray-300' : 'text-gray-700'
  const subText = isDarkMode ? 'text-gray-500' : 'text-gray-400'
  const inputBg = isDarkMode
    ? 'bg-slate-800 border-slate-600 text-white focus:border-purple-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
  const checkboxBg = isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
  const strengthBarTrack = isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
  const strengthPanelBg = isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'

  return (
    <div className={`border rounded-lg p-6 ${cardBg}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-purple-light mb-2">Security Settings</h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Configure authentication, session management, and security policies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Management */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            Session Management
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="session_timeout_minutes"
                value={formData.session_timeout_minutes}
                onChange={handleChange}
                min="5"
                max="480"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputBg}`}
              />
              <p className={`text-xs mt-1 ${subText}`}>Auto-logout after inactivity (5-480 min)</p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="require_mfa"
                  checked={formData.require_mfa}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Require Multi-Factor Auth</div>
                  <div className={`text-xs ${subText}`}>Force MFA for all users</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            Password Policy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Minimum Password Length
              </label>
              <input
                type="number"
                name="password_min_length"
                value={formData.password_min_length}
                onChange={handleChange}
                min="6"
                max="32"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputBg}`}
              />
              <p className={`text-xs mt-1 ${subText}`}>Minimum characters required (6-32)</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Password Expiry (days)
              </label>
              <input
                type="number"
                name="password_expiry_days"
                value={formData.password_expiry_days}
                onChange={handleChange}
                min="0"
                max="365"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputBg}`}
              />
              <p className={`text-xs mt-1 ${subText}`}>Force change after N days (0 = never)</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_uppercase"
                checked={formData.password_require_uppercase}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
              />
              <div className={`text-sm ${labelText}`}>
                Require uppercase letters (A-Z)
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_lowercase"
                checked={formData.password_require_lowercase}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
              />
              <div className={`text-sm ${labelText}`}>
                Require lowercase letters (a-z)
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_numbers"
                checked={formData.password_require_numbers}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
              />
              <div className={`text-sm ${labelText}`}>
                Require numbers (0-9)
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_special"
                checked={formData.password_require_special}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
              />
              <div className={`text-sm ${labelText}`}>
                Require special characters (!@#$%^&amp;*)
              </div>
            </label>
          </div>

          {/* Password Strength Indicator */}
          <div className={`p-4 border rounded-lg ${strengthPanelBg}`}>
            <div className={`text-sm font-medium mb-2 ${labelText}`}>
              Current Password Policy Strength
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const strength =
                  formData.password_min_length +
                  (formData.password_require_uppercase ? 2 : 0) +
                  (formData.password_require_lowercase ? 2 : 0) +
                  (formData.password_require_numbers ? 2 : 0) +
                  (formData.password_require_special ? 2 : 0)

                let label = 'Weak'
                let color = 'bg-red-500'
                let width = '25%'

                if (strength >= 16) {
                  label = 'Very Strong'
                  color = 'bg-green-500'
                  width = '100%'
                } else if (strength >= 14) {
                  label = 'Strong'
                  color = 'bg-blue-500'
                  width = '75%'
                } else if (strength >= 12) {
                  label = 'Moderate'
                  color = 'bg-yellow-500'
                  width = '50%'
                }

                return (
                  <>
                    <div className={`flex-1 rounded-full h-2 ${strengthBarTrack}`}>
                      <div
                        className={`${color} h-2 rounded-full transition-all duration-300`}
                        style={{ width }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                  </>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Account Protection */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            Account Protection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Max Login Attempts
              </label>
              <input
                type="number"
                name="max_login_attempts"
                value={formData.max_login_attempts}
                onChange={handleChange}
                min="3"
                max="10"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputBg}`}
              />
              <p className={`text-xs mt-1 ${subText}`}>Failed attempts before lockout (3-10)</p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Lockout Duration (minutes)
              </label>
              <input
                type="number"
                name="lockout_duration_minutes"
                value={formData.lockout_duration_minutes}
                onChange={handleChange}
                min="5"
                max="120"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputBg}`}
              />
              <p className={`text-xs mt-1 ${subText}`}>Account locked for N minutes (5-120)</p>
            </div>
          </div>
        </div>

        {/* API Security */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            API Security
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enable_api_rate_limiting"
                  checked={formData.enable_api_rate_limiting}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Enable Rate Limiting</div>
                  <div className={`text-xs ${subText}`}>Protect against API abuse</div>
                </div>
              </label>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Rate Limit (requests/minute)
              </label>
              <input
                type="number"
                name="api_rate_limit_per_minute"
                value={formData.api_rate_limit_per_minute}
                onChange={handleChange}
                min="10"
                max="1000"
                disabled={!formData.enable_api_rate_limiting}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none disabled:opacity-50 ${inputBg}`}
              />
              <p className={`text-xs mt-1 ${subText}`}>Max requests per minute per user</p>
            </div>
          </div>
        </div>

        {/* Audit Logging */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            Audit Logging
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enable_audit_logging"
                  checked={formData.enable_audit_logging}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Enable Audit Logging</div>
                  <div className={`text-xs ${subText}`}>Log all user actions</div>
                </div>
              </label>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Log Retention (days)
              </label>
              <input
                type="number"
                name="log_retention_days"
                value={formData.log_retention_days}
                onChange={handleChange}
                min="30"
                max="730"
                disabled={!formData.enable_audit_logging}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none disabled:opacity-50 ${inputBg}`}
              />
              <p className={`text-xs mt-1 ${subText}`}>Keep logs for N days (30-730)</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {saveStatus && (
          <div
            className={`p-4 rounded-lg border ${
              saveStatus.type === 'success'
                ? isDarkMode ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                : isDarkMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{saveStatus.type === 'success' ? '✅' : '❌'}</span>
              <div>
                <div className="font-medium">
                  {saveStatus.type === 'success' ? 'Success' : 'Error'}
                </div>
                <div className="text-sm mt-1">{saveStatus.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Security Warning */}
        <div className={`p-4 border rounded-lg ${isDarkMode ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
              <div className="font-medium mb-1">Security Best Practices</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Enable MFA for all privileged accounts</li>
                <li>Use strong password policies with all requirements enabled</li>
                <li>Keep session timeouts reasonable (30-60 minutes)</li>
                <li>Enable audit logging for compliance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex-1 px-4 py-3 bg-brand-purple hover:bg-primary-dark text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Security Settings'}
          </button>
          <button
            type="button"
            onClick={() => setFormData(settings)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
