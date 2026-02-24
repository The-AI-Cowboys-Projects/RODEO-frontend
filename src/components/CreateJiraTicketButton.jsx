import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

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
 * CreateJiraTicketButton Component
 *
 * Provides a button to create Jira tickets for:
 * 1. Vulnerabilities (CVE/Security issues)
 * 2. Malware Incidents (Sandbox analysis results)
 *
 * Props:
 * - type: 'vulnerability' | 'incident'
 * - data: Object containing relevant data for ticket creation
 * - className: Optional CSS classes
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 */
export default function CreateJiraTicketButton({ type, data, className = '', size = 'md' }) {
  const { isDarkMode } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [ticketResult, setTicketResult] = useState(null)

  // Check if Jira is configured
  const { data: jiraConfig } = useQuery({
    queryKey: ['jira-config'],
    queryFn: async () => {
      const response = await api.get('/api/jira/config')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Create vulnerability ticket mutation
  const createVulnTicketMutation = useMutation({
    mutationFn: async (ticketData) => {
      const response = await api.post('/api/jira/create-vulnerability-ticket', ticketData)
      return response.data
    },
    onSuccess: (result) => {
      setTicketResult({
        type: 'success',
        ticketId: result.ticket_id,
        ticketUrl: result.ticket_url,
      })
    },
    onError: (error) => {
      setTicketResult({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to create ticket',
      })
    },
  })

  // Create incident ticket mutation
  const createIncidentTicketMutation = useMutation({
    mutationFn: async (ticketData) => {
      const response = await api.post('/api/jira/create-incident-ticket', ticketData)
      return response.data
    },
    onSuccess: (result) => {
      setTicketResult({
        type: 'success',
        ticketId: result.ticket_id,
        ticketUrl: result.ticket_url,
      })
    },
    onError: (error) => {
      setTicketResult({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to create incident ticket',
      })
    },
  })

  const handleCreateTicket = () => {
    setTicketResult(null)

    if (type === 'vulnerability') {
      createVulnTicketMutation.mutate(data)
    } else if (type === 'incident') {
      createIncidentTicketMutation.mutate(data)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  // Don't render if Jira not configured
  if (!jiraConfig?.configured) {
    return null
  }

  const isPending =
    type === 'vulnerability'
      ? createVulnTicketMutation.isPending
      : createIncidentTicketMutation.isPending

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${sizeClasses[size]} bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors ${className}`}
      >
        🎫 Create Jira Ticket
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`border border-cyan-500/30 rounded-lg max-w-lg w-full p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
              Create Jira Ticket
            </h3>

            {!ticketResult ? (
              <>
                {/* Preview */}
                <div className={`mb-6 p-4 border rounded-lg space-y-2 text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  {type === 'vulnerability' && (
                    <>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>CVE:</span>{' '}
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.cve_id}</span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Severity:</span>{' '}
                        <span
                          className={`font-medium ${
                            data.severity?.toLowerCase() === 'critical'
                              ? 'text-red-400'
                              : data.severity?.toLowerCase() === 'high'
                              ? 'text-orange-400'
                              : data.severity?.toLowerCase() === 'medium'
                              ? 'text-yellow-400'
                              : 'text-green-400'
                          }`}
                        >
                          {data.severity}
                        </span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>CVSS Score:</span>{' '}
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{data.cvss_score}</span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Affected Systems:</span>{' '}
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {data.affected_systems?.length || 0} system(s)
                        </span>
                      </div>
                    </>
                  )}

                  {type === 'incident' && (
                    <>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Sample:</span>{' '}
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.sample_name}</span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Classification:</span>{' '}
                        <span className="text-orange-400 font-medium">
                          {data.classification}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Threat Level:</span>{' '}
                        <span
                          className={`font-medium ${
                            data.threat_level?.toLowerCase() === 'critical'
                              ? 'text-red-400'
                              : data.threat_level?.toLowerCase() === 'high'
                              ? 'text-orange-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {data.threat_level}
                        </span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>MITRE Techniques:</span>{' '}
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {data.mitre_techniques?.length || 0} technique(s)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  This will create a new ticket in Jira project{' '}
                  <span className={`font-medium ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                    {jiraConfig.project_key}
                  </span>
                  .
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateTicket}
                    disabled={isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {isPending ? 'Creating...' : 'Create Ticket'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={isPending}
                    className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Result */}
                <div
                  className={`p-4 rounded-lg border mb-6 ${
                    ticketResult.type === 'success'
                      ? 'bg-green-900/20 border-green-500/50'
                      : 'bg-red-900/20 border-red-500/50'
                  }`}
                >
                  {ticketResult.type === 'success' ? (
                    <div>
                      <div className="text-green-400 font-medium mb-2 flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        Ticket Created Successfully
                      </div>
                      <div className={`text-sm space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Ticket ID:</span>{' '}
                          <span className="font-mono font-medium">{ticketResult.ticketId}</span>
                        </div>
                        <div>
                          <a
                            href={ticketResult.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                          >
                            View in Jira
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-red-400 font-medium mb-2 flex items-center gap-2">
                        <span className="text-xl">❌</span>
                        Failed to Create Ticket
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{ticketResult.message}</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowModal(false)
                    setTicketResult(null)
                  }}
                  className={`w-full px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Example usage for Vulnerability:
 *
 * <CreateJiraTicketButton
 *   type="vulnerability"
 *   data={{
 *     cve_id: "CVE-2024-1234",
 *     cvss_score: 9.8,
 *     severity: "critical",
 *     description: "Remote code execution vulnerability...",
 *     affected_systems: ["web-server-1", "web-server-2"],
 *     exploit_available: true,
 *     rodeo_link: "http://localhost:3000/vulnerabilities/CVE-2024-1234"
 *   }}
 * />
 *
 * Example usage for Incident:
 *
 * <CreateJiraTicketButton
 *   type="incident"
 *   data={{
 *     sample_name: "malware.exe",
 *     sha256: "abc123...",
 *     threat_level: "high",
 *     classification: "Ransomware",
 *     mitre_techniques: ["T1486", "T1490"],
 *     iocs: {
 *       ips: ["192.168.1.100"],
 *       domains: ["malicious.com"],
 *       files: ["c:\\temp\\payload.dll"]
 *     },
 *     sandbox_report_link: "http://localhost:3000/sandbox/session-123"
 *   }}
 * />
 */
