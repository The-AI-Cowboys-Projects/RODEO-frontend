import { useState, useCallback, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  LinkIcon,
  PlayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function SandboxSubmission({ onSubmitSuccess }) {
  const { isDarkMode } = useTheme()
  const [submissionMode, setSubmissionMode] = useState('file') // 'file' or 'url'
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [url, setUrl] = useState('')
  const [analysisOptions, setAnalysisOptions] = useState({
    fast_track: false,
    vm_template: 'ubuntu_analysis',
    timeout: 300,
    enable_network: false  // Disabled by default for safer analysis
  })
  const fileInputRef = useRef(null)

  // Handle file drop
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (file) => {
    // Validate file
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 100MB.')
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      // Fetch CSRF token first
      let csrfToken = null
      try {
        const csrfResponse = await fetch('/auth/csrf-token')
        const csrfData = await csrfResponse.json()
        csrfToken = csrfData.csrf_token
      } catch (err) {
        console.warn('Failed to fetch CSRF token:', err)
      }

      const formData = new FormData()

      if (submissionMode === 'file' && selectedFile) {
        formData.append('file', selectedFile)
      } else if (submissionMode === 'url' && url) {
        formData.append('url', url)
      } else {
        throw new Error('Please select a file or enter a URL')
      }

      // Add analysis options
      formData.append('fast_track', analysisOptions.fast_track)
      formData.append('vm_template', analysisOptions.vm_template)
      formData.append('timeout', analysisOptions.timeout)
      formData.append('enable_network', analysisOptions.enable_network)

      const response = await fetch('/api/sandbox/submit', {
        method: 'POST',
        body: formData,
        headers: {
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Submission failed')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Reset form
      setSelectedFile(null)
      setUrl('')

      // Notify parent
      if (onSubmitSuccess) {
        onSubmitSuccess(data)
      }
    },
  })

  const handleSubmit = () => {
    if (submissionMode === 'file' && !selectedFile) {
      alert('Please select a file to analyze')
      return
    }
    if (submissionMode === 'url' && !url) {
      alert('Please enter a URL to analyze')
      return
    }

    submitMutation.mutate()
  }

  const getFileIcon = (filename) => {
    if (!filename) return DocumentIcon

    const ext = filename.split('.').pop().toLowerCase()

    // Return appropriate icon based on file type
    return DocumentIcon
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={`${isDarkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Submit for Analysis</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
            One-click malware analysis with R-O-D-E-O sandbox
          </p>
        </div>

        {/* Submission Mode Toggle */}
        <div className={`flex ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-100 border-gray-200'} rounded-lg p-1 border`}>
          <button
            onClick={() => setSubmissionMode('file')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              submissionMode === 'file'
                ? 'bg-purple-600 text-white shadow-lg'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <DocumentIcon className="w-4 h-4 inline mr-2" />
            File
          </button>
          <button
            onClick={() => setSubmissionMode('url')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              submissionMode === 'url'
                ? 'bg-purple-600 text-white shadow-lg'
                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            URL
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      {submissionMode === 'file' && (
        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10'
                : isDarkMode
                  ? 'border-slate-600 hover:border-slate-500 bg-slate-900/30'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept="*/*"
            />

            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <DocumentIcon className="w-16 h-16 text-purple-400" />
                    <CheckCircleIcon className={`w-6 h-6 text-green-400 absolute -top-1 -right-1 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-full`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold text-lg`}>{selectedFile.name}</p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{formatFileSize(selectedFile.size)}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <CloudArrowUpIcon className="w-16 h-16 text-gray-500 mx-auto" />
                <div>
                  <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                    {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mt-1`}>
                    Maximum file size: 100MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300 text-sm">
                This file will be executed in an isolated sandbox environment. Ensure you have proper authorization to analyze this sample.
              </p>
            </div>
          )}
        </div>
      )}

      {/* URL Submission Section */}
      {submissionMode === 'url' && (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Enter URL to analyze
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/suspicious-page"
              className={`w-full ${isDarkMode ? 'bg-slate-900/50 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors`}
            />
          </div>

          {url && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300 text-sm">
                The URL will be visited in an isolated browser within the sandbox. All network activity will be monitored and recorded.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analysis Options */}
      <div className="mt-6 space-y-4">
        <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide`}>
          Analysis Options
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* VM Template Selection */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              VM Template
            </label>
            <select
              value={analysisOptions.vm_template}
              onChange={(e) => setAnalysisOptions({ ...analysisOptions, vm_template: e.target.value })}
              className={`w-full ${isDarkMode ? 'bg-slate-900/50 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors`}
            >
              <option value="ubuntu_analysis">Ubuntu Analysis</option>
              <option value="windows_10_analysis">Windows 10 Analysis</option>
              <option value="web_server">Web Server (PHP)</option>
            </select>
          </div>

          {/* Timeout */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Timeout (seconds)
            </label>
            <input
              type="number"
              value={analysisOptions.timeout}
              onChange={(e) => setAnalysisOptions({ ...analysisOptions, timeout: parseInt(e.target.value) })}
              min="60"
              max="600"
              className={`w-full ${isDarkMode ? 'bg-slate-900/50 border-slate-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors`}
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <label className={`flex items-center space-x-3 ${isDarkMode ? 'bg-slate-900/30 hover:bg-slate-900/50' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3 cursor-pointer transition-colors`}>
            <input
              type="checkbox"
              checked={analysisOptions.fast_track}
              onChange={(e) => setAnalysisOptions({ ...analysisOptions, fast_track: e.target.checked })}
              className={`w-4 h-4 text-purple-600 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} rounded focus:ring-purple-500`}
            />
            <div>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>Fast Track Mode</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Quick scan in &lt;25s</p>
            </div>
          </label>

          <label className={`flex items-center space-x-3 ${isDarkMode ? 'bg-slate-900/30 hover:bg-slate-900/50' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3 cursor-pointer transition-colors`}>
            <input
              type="checkbox"
              checked={analysisOptions.enable_network}
              onChange={(e) => setAnalysisOptions({ ...analysisOptions, enable_network: e.target.checked })}
              className={`w-4 h-4 text-purple-600 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} rounded focus:ring-purple-500`}
            />
            <div>
              <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-sm font-medium`}>Enable Network</p>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Allow internet access</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending || (!selectedFile && submissionMode === 'file') || (!url && submissionMode === 'url')}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
            submitMutation.isPending || (!selectedFile && submissionMode === 'file') || (!url && submissionMode === 'url')
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50'
          }`}
        >
          {submitMutation.isPending ? (
            <span className="flex items-center justify-center">
              <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <PlayIcon className="w-5 h-5 mr-2" />
              Start Analysis
            </span>
          )}
        </button>

        {/* Error Message */}
        {submitMutation.isError && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 inline mr-2" />
            {submitMutation.error.message}
          </div>
        )}

        {/* Success Message */}
        {submitMutation.isSuccess && (
          <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm">
            <CheckCircleIcon className="w-4 h-4 inline mr-2" />
            Analysis started! Session ID: {submitMutation.data?.session_id}
          </div>
        )}
      </div>

      {/* Speed Indicator */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {analysisOptions.fast_track ? 'Fast mode: ~25s' : 'Normal mode: ~40s'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Real-time monitoring</span>
        </div>
      </div>
    </div>
  )
}
