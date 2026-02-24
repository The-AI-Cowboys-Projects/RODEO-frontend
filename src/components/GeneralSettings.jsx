import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import { useDemoMode } from '../context/DemoModeContext'

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

export default function GeneralSettings() {
  const queryClient = useQueryClient()
  const [saveStatus, setSaveStatus] = useState(null)
  const { isDarkMode, setTheme } = useTheme()
  const { isDemoMode, toggleDemoMode } = useDemoMode()

  const [formData, setFormData] = useState({
    system_name: 'R-O-D-E-O',
    timezone: 'UTC',
    date_format: 'YYYY-MM-DD',
    time_format: '24h',
    language: 'en',
    auto_refresh_interval: 30,
    items_per_page: 50,
    enable_dark_mode: true,
    enable_animations: true,
  })

  // Track if initial load is done
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['general-settings'],
    queryFn: async () => {
      const response = await api.get('/api/settings/general')
      return response.data
    },
    staleTime: 30000, // Don't refetch for 30 seconds
  })

  // Update form when settings load initially and sync theme
  useEffect(() => {
    if (settings && !initialLoadDone) {
      setFormData(settings)
      setInitialLoadDone(true)
      // Sync theme context with loaded settings
      if (settings.enable_dark_mode !== undefined) {
        setTheme(settings.enable_dark_mode)
      }
    }
  }, [settings, initialLoadDone, setTheme])

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/settings/general', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['general-settings'])
      setSaveStatus({ type: 'success', message: data.message || 'Settings saved successfully' })
      // Ensure theme is synced after save
      setTheme(formData.enable_dark_mode)
      // Allow next fetch to update form
      setInitialLoadDone(false)
      setTimeout(() => setSaveStatus(null), 3000)
    },
    onError: (error) => {
      setSaveStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to save settings',
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
    const newValue = type === 'checkbox' ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Sync dark mode with theme context
    if (name === 'enable_dark_mode') {
      setTheme(checked)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-brand-purple-light">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-purple-light mb-2">General Settings</h2>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
          Configure system-wide preferences and display options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* System Information */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} pb-2`}>
            System Information
          </h3>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              System Name
            </label>
            <input
              type="text"
              name="system_name"
              value={formData.system_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg placeholder-gray-500 focus:outline-none focus:border-brand-purple`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Display name for the system
            </p>
          </div>
        </div>

        {/* Localization */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} pb-2`}>
            Localization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Timezone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:outline-none focus:border-brand-purple`}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central European Time</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Shanghai">China (CST)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:outline-none focus:border-brand-purple`}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Date Format
              </label>
              <select
                name="date_format"
                value={formData.date_format}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:outline-none focus:border-brand-purple`}
              >
                <option value="YYYY-MM-DD">2025-01-15 (ISO)</option>
                <option value="MM/DD/YYYY">01/15/2025 (US)</option>
                <option value="DD/MM/YYYY">15/01/2025 (EU)</option>
                <option value="DD-MMM-YYYY">15-Jan-2025</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Time Format
              </label>
              <select
                name="time_format"
                value={formData.time_format}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:outline-none focus:border-brand-purple`}
              >
                <option value="24h">24-hour (13:00)</option>
                <option value="12h">12-hour (1:00 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className={`text-lg font-semibold text-purple-300 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} pb-2`}>
            Display Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Auto-Refresh Interval (seconds)
              </label>
              <input
                type="number"
                name="auto_refresh_interval"
                value={formData.auto_refresh_interval}
                onChange={handleChange}
                min="10"
                max="300"
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:outline-none focus:border-brand-purple`}
              />
              <p className="text-xs text-gray-500 mt-1">
                How often dashboards auto-refresh (10-300 seconds)
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                Items Per Page
              </label>
              <select
                name="items_per_page"
                value={formData.items_per_page}
                onChange={handleChange}
                className={`w-full px-3 py-2 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:outline-none focus:border-brand-purple`}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Number of items shown in tables
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="enable_dark_mode"
                checked={formData.enable_dark_mode}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} rounded focus:ring-brand-purple cursor-pointer`}
              />
              <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Enable Dark Mode</div>
                <div className="text-xs text-gray-500">Toggle between dark and light theme</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="enable_animations"
                checked={formData.enable_animations}
                onChange={handleChange}
                className={`w-5 h-5 text-purple-600 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} rounded focus:ring-brand-purple`}
              />
              <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Enable Animations</div>
                <div className="text-xs text-gray-500">Show transitions and animations</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDemoMode}
                onChange={toggleDemoMode}
                className={`w-5 h-5 text-purple-600 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} rounded focus:ring-brand-purple cursor-pointer`}
              />
              <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Demo Mode</div>
                <div className="text-xs text-gray-500">Show stable simulated data on dashboards (disable for live API data only)</div>
              </div>
            </label>
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

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex-1 px-4 py-3 bg-brand-purple hover:bg-primary-dark text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (settings) {
                setFormData(settings)
                setTheme(settings.enable_dark_mode)
              }
            }}
            className={`px-4 py-3 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} rounded-lg font-medium transition-colors`}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
