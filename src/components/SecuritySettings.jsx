import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

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

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-purple-light mb-2">Security Settings</h2>
        <p className="text-gray-400 text-sm">
          Configure authentication, session management, and security policies
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 border-b border-slate-700 pb-2">
            🔐 Session Management
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="session_timeout_minutes"
                value={formData.session_timeout_minutes}
                onChange={handleChange}
                min="5"
                max="480"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity (5-480 min)</p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="require_mfa"
                  checked={formData.require_mfa}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-300">Require Multi-Factor Auth</div>
                  <div className="text-xs text-gray-500">Force MFA for all users</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Password Policy */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 border-b border-slate-700 pb-2">
            🔑 Password Policy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                name="password_min_length"
                value={formData.password_min_length}
                onChange={handleChange}
                min="6"
                max="32"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum characters required (6-32)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password Expiry (days)
              </label>
              <input
                type="number"
                name="password_expiry_days"
                value={formData.password_expiry_days}
                onChange={handleChange}
                min="0"
                max="365"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Force change after N days (0 = never)</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_uppercase"
                checked={formData.password_require_uppercase}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <div className="text-sm text-gray-300">
                Require uppercase letters (A-Z)
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_lowercase"
                checked={formData.password_require_lowercase}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <div className="text-sm text-gray-300">
                Require lowercase letters (a-z)
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_numbers"
                checked={formData.password_require_numbers}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <div className="text-sm text-gray-300">
                Require numbers (0-9)
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="password_require_special"
                checked={formData.password_require_special}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <div className="text-sm text-gray-300">
                Require special characters (!@#$%^&*)
              </div>
            </label>
          </div>

          {/* Password Strength Indicator */}
          <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
            <div className="text-sm font-medium text-gray-300 mb-2">
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
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all duration-300`}
                        style={{ width }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-medium w-24">{label}</span>
                  </>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Account Protection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 border-b border-slate-700 pb-2">
            🛡️ Account Protection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                name="max_login_attempts"
                value={formData.max_login_attempts}
                onChange={handleChange}
                min="3"
                max="10"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Failed attempts before lockout (3-10)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lockout Duration (minutes)
              </label>
              <input
                type="number"
                name="lockout_duration_minutes"
                value={formData.lockout_duration_minutes}
                onChange={handleChange}
                min="5"
                max="120"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Account locked for N minutes (5-120)</p>
            </div>
          </div>
        </div>

        {/* API Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 border-b border-slate-700 pb-2">
            ⚡ API Security
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enable_api_rate_limiting"
                  checked={formData.enable_api_rate_limiting}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-300">Enable Rate Limiting</div>
                  <div className="text-xs text-gray-500">Protect against API abuse</div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Max requests per minute per user</p>
            </div>
          </div>
        </div>

        {/* Audit Logging */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-purple-300 border-b border-slate-700 pb-2">
            📝 Audit Logging
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enable_audit_logging"
                  checked={formData.enable_audit_logging}
                  onChange={handleChange}
                  className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-300">Enable Audit Logging</div>
                  <div className="text-xs text-gray-500">Log all user actions</div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Keep logs for N days (30-730)</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {saveStatus && (
          <div
            className={`p-4 rounded-lg border ${
              saveStatus.type === 'success'
                ? 'bg-green-900/20 border-green-500/50 text-green-400'
                : 'bg-red-900/20 border-red-500/50 text-red-400'
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
        <div className="p-4 bg-yellow-900/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div className="text-sm text-yellow-400">
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
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
