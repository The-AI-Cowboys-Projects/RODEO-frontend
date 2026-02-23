import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const API_BASE = ''

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token')

// Axios instance with auth
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * JiraSettings Component
 *
 * Allows users to configure Jira integration:
 * - Jira instance URL
 * - Username (email)
 * - API Token
 * - Project Key
 * - Connection testing
 */
export default function JiraSettings() {
  const queryClient = useQueryClient()

  const [authMethod, setAuthMethod] = useState('api_token') // 'api_token' or 'oauth'

  const [formData, setFormData] = useState({
    url: '',
    project_key: 'SEC',
    auth_method: 'api_token',
    // API Token fields
    username: '',
    api_token: '',
    // OAuth fields
    oauth_token: '',
    client_id: '',
    client_secret: '',
  })

  const [showApiToken, setShowApiToken] = useState(false)
  const [showOAuthToken, setShowOAuthToken] = useState(false)
  const [showClientSecret, setShowClientSecret] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // Fetch current Jira configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ['jira-config'],
    queryFn: async () => {
      const response = await api.get('/api/jira/config')
      return response.data
    },
  })

  // Update form when config loads
  useEffect(() => {
    if (config && config.configured) {
      const method = config.auth_method || 'api_token'
      setAuthMethod(method)
      setFormData((prev) => ({
        ...prev,
        url: config.url || '',
        project_key: config.project_key || 'SEC',
        auth_method: method,
        username: config.username || '',
        // Don't populate sensitive tokens for security
      }))
    }
  }, [config])

  // Configure Jira mutation
  const configureMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/api/jira/config', data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['jira-config'])
      setTestResult({
        type: 'success',
        message: data.message || 'Jira configured successfully',
      })
      // Clear sensitive tokens from form for security
      setFormData((prev) => ({
        ...prev,
        api_token: '',
        oauth_token: '',
        client_secret: ''
      }))
    },
    onError: (error) => {
      setTestResult({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to configure Jira',
      })
    },
  })

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/jira/test-connection')
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

  const handleAuthMethodChange = (method) => {
    setAuthMethod(method)
    setFormData((prev) => ({ ...prev, auth_method: method }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-cyan-400">Loading configuration...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Jira Integration</h2>
        <p className="text-gray-400 text-sm">
          Configure Jira to automatically create tickets for vulnerabilities and malware incidents.
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-300">Status</div>
            <div className="text-lg font-bold">
              {config?.configured ? (
                <span className="text-green-400">Configured</span>
              ) : (
                <span className="text-yellow-400">Not Configured</span>
              )}
            </div>
          </div>
          {config?.configured && (
            <button
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
            </button>
          )}
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Jira URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Jira Instance URL
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://your-domain.atlassian.net"
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your Atlassian Jira Cloud URL (e.g., https://company.atlassian.net)
          </p>
        </div>

        {/* Authentication Method Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Authentication Method
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAuthMethodChange('api_token')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                authMethod === 'api_token'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-medium">API Token</div>
              <div className="text-xs mt-1">Username + API Token</div>
            </button>
            <button
              type="button"
              onClick={() => handleAuthMethodChange('oauth')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                authMethod === 'oauth'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-medium">OAuth 2.0</div>
              <div className="text-xs mt-1">Access Token</div>
            </button>
          </div>
        </div>

        {/* API Token Authentication Fields */}
        {authMethod === 'api_token' && (
          <>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username (Email)
              </label>
              <input
                type="email"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="your-email@company.com"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Jira account email address
              </p>
            </div>

            {/* API Token */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Token
              </label>
              <div className="relative">
                <input
                  type={showApiToken ? 'text' : 'password'}
                  name="api_token"
                  value={formData.api_token}
                  onChange={handleChange}
                  placeholder="Your Jira API token"
                  required={!config?.configured}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowApiToken(!showApiToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                >
                  {showApiToken ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Generate at{' '}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  https://id.atlassian.com/manage-profile/security/api-tokens
                </a>
              </p>
            </div>
          </>
        )}

        {/* OAuth 2.0 Authentication Fields */}
        {authMethod === 'oauth' && (
          <>
            {/* OAuth Access Token */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                OAuth Access Token
              </label>
              <div className="relative">
                <input
                  type={showOAuthToken ? 'text' : 'password'}
                  name="oauth_token"
                  value={formData.oauth_token}
                  onChange={handleChange}
                  placeholder="Your OAuth 2.0 access token"
                  required={!config?.configured}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowOAuthToken(!showOAuthToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                >
                  {showOAuthToken ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                OAuth 2.0 access token from your Jira OAuth app
              </p>
            </div>

            {/* Client ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client ID (Optional)
              </label>
              <input
                type="text"
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                placeholder="OAuth client ID"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Client ID from your Jira OAuth application
              </p>
            </div>

            {/* Client Secret (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client Secret (Optional)
              </label>
              <div className="relative">
                <input
                  type={showClientSecret ? 'text' : 'password'}
                  name="client_secret"
                  value={formData.client_secret}
                  onChange={handleChange}
                  placeholder="OAuth client secret"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowClientSecret(!showClientSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                >
                  {showClientSecret ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Client secret from your Jira OAuth application
              </p>
            </div>
          </>
        )}

        {/* Project Key */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Key
          </label>
          <input
            type="text"
            name="project_key"
            value={formData.project_key}
            onChange={handleChange}
            placeholder="SEC"
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 uppercase"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            The Jira project key where tickets will be created (e.g., SEC, IT, CYBER)
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
            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {configureMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-sm font-medium text-blue-400 mb-2">How to get your API Token:</h3>
          <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Atlassian Account Settings</a></li>
            <li>Navigate to Security → API tokens</li>
            <li>Click "Create API token"</li>
            <li>Give it a label (e.g., "R-O-D-E-O Integration")</li>
            <li>Copy the token and paste it above</li>
          </ol>
        </div>

        {/* Troubleshooting for 401 errors */}
        <div className="p-4 bg-yellow-900/10 border border-yellow-500/30 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-400 mb-2">❌ Getting 401 Authentication Error?</h3>
          <div className="text-xs text-gray-400 space-y-2">
            <p className="font-medium text-gray-300">Common issues and solutions:</p>
            <div className="space-y-2 ml-2">
              <div>
                <span className="text-yellow-400">✓</span> <strong>URL Format:</strong> Must be exactly <code className="bg-gray-800 px-1 rounded">https://yourcompany.atlassian.net</code>
                <div className="ml-4 text-red-400 text-xs mt-1">
                  ✗ Don't include trailing slash: <code>https://yourcompany.atlassian.net/</code><br/>
                  ✗ Don't include /rest/api: <code>https://yourcompany.atlassian.net/rest/api/3</code>
                </div>
              </div>
              <div>
                <span className="text-yellow-400">✓</span> <strong>Email:</strong> Use the <strong>exact email</strong> from your Atlassian account (e.g., <code className="bg-gray-800 px-1 rounded">user@company.com</code>)
              </div>
              <div>
                <span className="text-yellow-400">✓</span> <strong>API Token:</strong> Make sure you copied the <strong>entire token</strong> when it was first displayed (you can't view it again - create a new one if unsure)
              </div>
              <div>
                <span className="text-yellow-400">✓</span> <strong>Token Owner:</strong> The email must match the account that created the API token
              </div>
              <div>
                <span className="text-yellow-400">✓</span> <strong>Token Not Expired:</strong> Check if the token still exists in your <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">API tokens page</a>
              </div>
            </div>
          </div>
        </div>

        {/* OAuth 2.0 Setup Guide */}
        {authMethod === 'oauth' && (
          <div className="p-4 bg-purple-900/10 border border-brand-purple/30 rounded-lg">
            <h3 className="text-sm font-medium text-brand-purple-light mb-2">🔐 OAuth 2.0 Setup Guide:</h3>
            <div className="text-xs text-gray-400 space-y-2">
              <p className="font-medium text-gray-300">Setting up OAuth 2.0 for Jira:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>
                  <strong>Create an OAuth 2.0 app</strong> in Jira:
                  <div className="ml-4 mt-1">
                    • Go to{' '}
                    <a
                      href="https://developer.atlassian.com/console/myapps/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-purple-light hover:underline"
                    >
                      Atlassian Developer Console
                    </a>
                    <br />
                    • Create a new app or select an existing one
                    <br />
                    • Enable OAuth 2.0 (3LO) authorization
                    <br />• Add callback URL: <code className="bg-gray-800 px-1 rounded">http://localhost:3000/oauth/callback</code>
                  </div>
                </li>
                <li>
                  <strong>Configure permissions:</strong>
                  <div className="ml-4 mt-1">
                    • Add Jira API scopes:
                    <br />
                    &nbsp;&nbsp;- <code className="bg-gray-800 px-1 rounded">read:jira-work</code>
                    <br />
                    &nbsp;&nbsp;- <code className="bg-gray-800 px-1 rounded">write:jira-work</code>
                    <br />• Save your app configuration
                  </div>
                </li>
                <li>
                  <strong>Get your OAuth credentials:</strong>
                  <div className="ml-4 mt-1">
                    • Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>
                    <br />• Use the OAuth authorization flow to get an <strong>Access Token</strong>
                  </div>
                </li>
                <li>
                  <strong>Enter credentials above:</strong>
                  <div className="ml-4 mt-1">
                    • Paste the <strong>Access Token</strong> (required)
                    <br />
                    • Optionally add <strong>Client ID</strong> and <strong>Client Secret</strong>
                    <br />• Test the connection
                  </div>
                </li>
              </ol>
              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                <p className="text-blue-300 font-medium">💡 Why use OAuth?</p>
                <p className="mt-1">
                  OAuth 2.0 is more secure than API tokens and supports service accounts better. It's recommended for
                  production deployments and automated workflows.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Example Configuration */}
        <div className="p-4 bg-green-900/10 border border-green-500/30 rounded-lg">
          <h3 className="text-sm font-medium text-green-400 mb-2">✓ Example Configuration:</h3>
          <div className="text-xs text-gray-400 space-y-1 font-mono">
            {authMethod === 'api_token' ? (
              <>
                <div><strong>URL:</strong> <code className="bg-gray-800 px-1 rounded">https://mycompany.atlassian.net</code></div>
                <div><strong>Username:</strong> <code className="bg-gray-800 px-1 rounded">john.doe@mycompany.com</code></div>
                <div><strong>API Token:</strong> <code className="bg-gray-800 px-1 rounded">ATATT3xFfGF0...</code> (long random string)</div>
                <div><strong>Project Key:</strong> <code className="bg-gray-800 px-1 rounded">SEC</code> (2-10 uppercase letters)</div>
              </>
            ) : (
              <>
                <div><strong>URL:</strong> <code className="bg-gray-800 px-1 rounded">https://mycompany.atlassian.net</code></div>
                <div><strong>OAuth Token:</strong> <code className="bg-gray-800 px-1 rounded">eyJhbGciOiJIUzI1...</code> (JWT token)</div>
                <div><strong>Client ID:</strong> <code className="bg-gray-800 px-1 rounded">abc123xyz</code> (optional)</div>
                <div><strong>Project Key:</strong> <code className="bg-gray-800 px-1 rounded">SEC</code> (2-10 uppercase letters)</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
