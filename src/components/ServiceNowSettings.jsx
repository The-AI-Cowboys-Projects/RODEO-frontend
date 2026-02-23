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

export default function ServiceNowSettings() {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    instance_url: '',
    username: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // Fetch current ServiceNow configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ['servicenow-config'],
    queryFn: async () => {
      const response = await api.get('/api/servicenow/config')
      return response.data
    },
  })

  // Update form when config loads
  useEffect(() => {
    if (config && config.configured) {
      setFormData((prev) => ({
        ...prev,
        instance_url: config.instance_url || '',
        username: config.username || '',
        // Don't populate password for security
      }))
    }
  }, [config])

  // Configure ServiceNow mutation
  const configureMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/servicenow/config', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['servicenow-config'])
      setTestResult({
        type: 'success',
        message: data.message || 'ServiceNow configured successfully',
      })
      // Clear password from form for security
      setFormData((prev) => ({ ...prev, password: '' }))
    },
    onError: (error) => {
      setTestResult({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to configure ServiceNow',
      })
    },
  })

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/servicenow/test-connection')
      return response.data
    },
    onSuccess: (data) => {
      setTestResult({
        type: 'success',
        message: data.message || 'Connection test successful',
      })
    },
    onError: (error) => {
      setTestResult({
        type: 'error',
        message: error.response?.data?.detail || 'Connection test failed',
      })
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setTestResult(null)
    configureMutation.mutate(formData)
  }

  const handleTestConnection = () => {
    setTestResult(null)
    testConnectionMutation.mutate()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-purple-400">Loading configuration...</div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-400 mb-2">ServiceNow Integration</h2>
        <p className="text-gray-400 text-sm">
          Configure ServiceNow to automatically create incidents and change requests for security events.
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-slate-800 border border-slate-600 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-300">Status</div>
            <div className="text-lg font-bold">
              {config?.configured ? (
                <span className="text-green-400">✓ Configured</span>
              ) : (
                <span className="text-yellow-400">⚠ Not Configured</span>
              )}
            </div>
            {config?.configured && config.instance_url && (
              <div className="text-xs text-gray-500 mt-1">
                Instance: {new URL(config.instance_url).hostname}
              </div>
            )}
          </div>
          {config?.configured && (
            <button
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
            </button>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Instance URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ServiceNow Instance URL
          </label>
          <input
            type="url"
            name="instance_url"
            value={formData.instance_url}
            onChange={handleChange}
            placeholder="https://dev12345.service-now.com"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your ServiceNow instance URL (e.g., https://dev12345.service-now.com)
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="admin or integration.user"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            ServiceNow username with API access
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your ServiceNow password"
              required={!config?.configured}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Password or API key for authentication
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-4 rounded-lg border ${
              testResult.type === 'success'
                ? 'bg-green-900/20 border-green-500/50 text-green-400'
                : 'bg-red-900/20 border-red-500/50 text-red-400'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{testResult.type === 'success' ? '✅' : '❌'}</span>
              <div>
                <div className="font-medium">
                  {testResult.type === 'success' ? 'Success' : 'Error'}
                </div>
                <div className="text-sm mt-1">{testResult.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={configureMutation.isPending}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {configureMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Capabilities Info */}
      <div className="mt-6 space-y-4">
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Integration Capabilities</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔒</div>
                <div>
                  <div className="font-medium text-gray-200">Security Incidents</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Automatically create incidents for vulnerabilities and malware detections
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔄</div>
                <div>
                  <div className="font-medium text-gray-200">Change Requests</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Create change requests for remediation and patching activities
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📝</div>
                <div>
                  <div className="font-medium text-gray-200">Work Notes</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Add automated updates and notes to existing incidents
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <div className="font-medium text-gray-200">Priority Mapping</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Automatic urgency and impact assignment based on threat severity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-sm font-medium text-blue-400 mb-2">Setup Instructions:</h3>
          <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
            <li>Log in to your ServiceNow instance as an administrator</li>
            <li>Create a dedicated integration user with necessary permissions</li>
            <li>Grant permissions: incident.create, incident.read, incident.write, change_request.create</li>
            <li>Enter the instance URL (including https://)</li>
            <li>Use the integration user credentials to authenticate</li>
            <li>Click "Save Configuration" and test the connection</li>
          </ol>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-yellow-900/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div className="text-sm text-yellow-400">
              <div className="font-medium mb-1">Security Best Practices</div>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use a dedicated integration account, not a personal account</li>
                <li>Grant minimal required permissions (principle of least privilege)</li>
                <li>Rotate credentials regularly (recommended: every 90 days)</li>
                <li>Monitor API usage and audit logs in ServiceNow</li>
                <li>Enable IP restrictions if your ServiceNow instance supports it</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
