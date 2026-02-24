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

export default function NotificationSettings() {
  const { isDarkMode } = useTheme()
  const queryClient = useQueryClient()
  const [saveStatus, setSaveStatus] = useState(null)
  const [testStatus, setTestStatus] = useState(null)
  const [showWebhooks, setShowWebhooks] = useState(false)

  const [formData, setFormData] = useState({
    email_notifications_enabled: true,
    email_address: '',
    notify_critical_vulnerabilities: true,
    notify_high_risk_samples: true,
    notify_policy_violations: true,
    notify_system_alerts: true,
    notify_failed_login: true,
    notify_scheduled_reports: false,
    slack_enabled: false,
    slack_webhook_url: '',
    slack_channel: '#security-alerts',
    teams_enabled: false,
    teams_webhook_url: '',
    alert_frequency: 'realtime',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  })

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await api.get('/api/settings/notifications')
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
      const response = await api.post('/api/settings/notifications', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['notification-settings'])
      setSaveStatus({ type: 'success', message: data.message })
      setTimeout(() => setSaveStatus(null), 3000)
    },
    onError: (error) => {
      setSaveStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to save notification settings',
      })
      setTimeout(() => setSaveStatus(null), 5000)
    },
  })

  const testNotificationMutation = useMutation({
    mutationFn: async (type) => {
      const response = await api.post(`/api/settings/notifications/test?notification_type=${type}`)
      return response.data
    },
    onSuccess: (data) => {
      setTestStatus({ type: 'success', message: data.message })
      setTimeout(() => setTestStatus(null), 3000)
    },
    onError: (error) => {
      setTestStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Test notification failed',
      })
      setTimeout(() => setTestStatus(null), 5000)
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
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleTestNotification = (type) => {
    setTestStatus(null)
    testNotificationMutation.mutate(type)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-brand-purple-light">Loading notification settings...</div>
      </div>
    )
  }

  // Shared class helpers
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
  const sectionBorder = isDarkMode ? 'border-slate-700' : 'border-gray-200'
  const rowBg = isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-50 border-gray-200'
  const rowHover = isDarkMode ? 'hover:bg-slate-750' : 'hover:bg-gray-100'
  const labelText = isDarkMode ? 'text-gray-300' : 'text-gray-700'
  const subText = isDarkMode ? 'text-gray-500' : 'text-gray-400'
  const inputBg = isDarkMode
    ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-500 focus:border-purple-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500'
  const inputSmBg = isDarkMode
    ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500'
    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
  const checkboxBg = isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'

  return (
    <div className={`border rounded-lg p-6 ${cardBg}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-purple-light mb-2">Notification Settings</h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Configure how and when you receive alerts about security events
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            Email Notifications
          </h3>

          <div className={`flex items-center justify-between p-4 border rounded-lg ${rowBg}`}>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="email_notifications_enabled"
                checked={formData.email_notifications_enabled}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
              />
              <div>
                <div className={`text-sm font-medium ${labelText}`}>Enable Email Notifications</div>
                <div className={`text-xs ${subText}`}>Receive alerts via email</div>
              </div>
            </label>
            {formData.email_notifications_enabled && (
              <button
                type="button"
                onClick={() => handleTestNotification('email')}
                disabled={testNotificationMutation.isPending}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
              >
                Test Email
              </button>
            )}
          </div>

          {formData.email_notifications_enabled && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${labelText}`}>
                Email Address
              </label>
              <input
                type="email"
                name="email_address"
                value={formData.email_address}
                onChange={handleChange}
                placeholder="security@company.com"
                required
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputBg}`}
              />
            </div>
          )}
        </div>

        {/* Alert Types */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            Alert Types
          </h3>

          <div className="space-y-3">
            <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${rowBg} ${rowHover}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="notify_critical_vulnerabilities"
                  checked={formData.notify_critical_vulnerabilities}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Critical Vulnerabilities</div>
                  <div className={`text-xs ${subText}`}>CVSS 9.0+ vulnerabilities detected</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-800 border border-red-200'}`}>Critical</span>
            </label>

            <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${rowBg} ${rowHover}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="notify_high_risk_samples"
                  checked={formData.notify_high_risk_samples}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>High-Risk Malware</div>
                  <div className={`text-xs ${subText}`}>Dangerous malware samples detected</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-800 border border-orange-200'}`}>High</span>
            </label>

            <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${rowBg} ${rowHover}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="notify_policy_violations"
                  checked={formData.notify_policy_violations}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Policy Violations</div>
                  <div className={`text-xs ${subText}`}>Security policy breaches</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'}`}>Medium</span>
            </label>

            <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${rowBg} ${rowHover}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="notify_system_alerts"
                  checked={formData.notify_system_alerts}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>System Alerts</div>
                  <div className={`text-xs ${subText}`}>System health and performance</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>Info</span>
            </label>

            <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${rowBg} ${rowHover}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="notify_failed_login"
                  checked={formData.notify_failed_login}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Failed Login Attempts</div>
                  <div className={`text-xs ${subText}`}>Suspicious login activity</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-800 border border-red-200'}`}>Security</span>
            </label>

            <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${rowBg} ${rowHover}`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="notify_scheduled_reports"
                  checked={formData.notify_scheduled_reports}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Scheduled Reports</div>
                  <div className={`text-xs ${subText}`}>Daily/weekly summary reports</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>Report</span>
            </label>
          </div>
        </div>

        {/* Alert Frequency */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b pb-2 ${sectionBorder}`}>
            Alert Frequency
          </h3>

          <div>
            <label className={`block text-sm font-medium mb-2 ${labelText}`}>
              Notification Frequency
            </label>
            <select
              name="alert_frequency"
              value={formData.alert_frequency}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputBg}`}
            >
              <option value="realtime">Real-time (Immediate)</option>
              <option value="hourly">Hourly Digest</option>
              <option value="daily">Daily Summary</option>
            </select>
            <p className={`text-xs mt-1 ${subText}`}>
              How frequently to send notifications
            </p>
          </div>

          <div className={`p-4 border rounded-lg ${rowBg}`}>
            <label className="flex items-center space-x-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                name="quiet_hours_enabled"
                checked={formData.quiet_hours_enabled}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
              />
              <div>
                <div className={`text-sm font-medium ${labelText}`}>Enable Quiet Hours</div>
                <div className={`text-xs ${subText}`}>Suppress non-critical alerts during specified hours</div>
              </div>
            </label>

            {formData.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start Time</label>
                  <input
                    type="time"
                    name="quiet_hours_start"
                    value={formData.quiet_hours_start}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${inputSmBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>End Time</label>
                  <input
                    type="time"
                    name="quiet_hours_end"
                    value={formData.quiet_hours_end}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${inputSmBg}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* External Integrations */}
        <div className="space-y-4">
          <div className={`flex items-center justify-between border-b pb-2 ${sectionBorder}`}>
            <h3 className="text-lg font-semibold text-purple-300">
              External Integrations
            </h3>
            <button
              type="button"
              onClick={() => setShowWebhooks(!showWebhooks)}
              className="text-sm text-brand-purple-light hover:text-purple-300"
            >
              {showWebhooks ? 'Hide' : 'Show'} Webhooks
            </button>
          </div>

          {/* Slack Integration */}
          <div className={`p-4 border rounded-lg ${rowBg}`}>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="slack_enabled"
                  checked={formData.slack_enabled}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Slack Integration</div>
                  <div className={`text-xs ${subText}`}>Send alerts to Slack workspace</div>
                </div>
              </label>
              {formData.slack_enabled && (
                <button
                  type="button"
                  onClick={() => handleTestNotification('slack')}
                  disabled={testNotificationMutation.isPending}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                >
                  Test Slack
                </button>
              )}
            </div>

            {formData.slack_enabled && showWebhooks && (
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Webhook URL</label>
                  <input
                    type="url"
                    name="slack_webhook_url"
                    value={formData.slack_webhook_url}
                    onChange={handleChange}
                    placeholder="https://hooks.slack.com/services/..."
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${inputSmBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Channel</label>
                  <input
                    type="text"
                    name="slack_channel"
                    value={formData.slack_channel}
                    onChange={handleChange}
                    placeholder="#security-alerts"
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${inputSmBg}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Microsoft Teams Integration */}
          <div className={`p-4 border rounded-lg ${rowBg}`}>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="teams_enabled"
                  checked={formData.teams_enabled}
                  onChange={handleChange}
                  className={`w-5 h-5 text-purple-600 border rounded focus:ring-purple-500 ${checkboxBg}`}
                />
                <div>
                  <div className={`text-sm font-medium ${labelText}`}>Microsoft Teams Integration</div>
                  <div className={`text-xs ${subText}`}>Send alerts to Teams channel</div>
                </div>
              </label>
              {formData.teams_enabled && (
                <button
                  type="button"
                  onClick={() => handleTestNotification('teams')}
                  disabled={testNotificationMutation.isPending}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                >
                  Test Teams
                </button>
              )}
            </div>

            {formData.teams_enabled && showWebhooks && (
              <div>
                <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Webhook URL</label>
                <input
                  type="url"
                  name="teams_webhook_url"
                  value={formData.teams_webhook_url}
                  onChange={handleChange}
                  placeholder="https://outlook.office.com/webhook/..."
                  className={`w-full px-3 py-2 border rounded text-sm focus:outline-none ${inputSmBg}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Test Status */}
        {testStatus && (
          <div
            className={`p-4 rounded-lg border ${
              testStatus.type === 'success'
                ? isDarkMode ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                : isDarkMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{testStatus.type === 'success' ? '✅' : '❌'}</span>
              <div>
                <div className="font-medium">
                  {testStatus.type === 'success' ? 'Test Successful' : 'Test Failed'}
                </div>
                <div className="text-sm mt-1">{testStatus.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Save Status */}
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

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex-1 px-4 py-3 bg-brand-purple hover:bg-primary-dark text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
          </button>
          <button
            type="button"
            onClick={() => setFormData(settings)}
            className={`px-4 py-3 rounded-lg font-medium transition-colors text-white ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
