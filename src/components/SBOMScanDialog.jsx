import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Button from './ui/Button'
import Card from './ui/Card'

export default function SBOMScanDialog({ isOpen, onClose, onScanComplete }) {
  const { isDarkMode } = useTheme()
  const [scanType, setScanType] = useState('upload') // 'upload', 'path', or 'import'
  const [projectName, setProjectName] = useState('')
  const [projectVersion, setProjectVersion] = useState('1.0.0')
  const [projectPath, setProjectPath] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedSBOMFile, setSelectedSBOMFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState(null)
  const [enrichVulnerabilities, setEnrichVulnerabilities] = useState(true)
  const [checkCompliance, setCheckCompliance] = useState(true)

  if (!isOpen) return null

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    setError(null)

    // Try to detect project name from files
    const manifestFiles = files.filter(f =>
      ['package.json', 'requirements.txt', 'pom.xml', 'build.gradle'].includes(f.name)
    )

    if (manifestFiles.length > 0 && !projectName) {
      // Try to extract project name
      const file = manifestFiles[0]
      if (file.name === 'package.json') {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const json = JSON.parse(event.target.result)
            if (json.name) setProjectName(json.name)
            if (json.version) setProjectVersion(json.version)
          } catch (e) {
            console.error('Error parsing package.json:', e)
          }
        }
        reader.readAsText(file)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload')
      return null
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('project_name', projectName || 'Uploaded Project')
      formData.append('project_version', projectVersion)

      const token = localStorage.getItem('rodeo_token')

      // Fetch CSRF token from server
      let csrfToken = null
      try {
        const csrfResponse = await fetch('/auth/csrf-token')
        const csrfData = await csrfResponse.json()
        csrfToken = csrfData.csrf_token
      } catch (err) {
        console.warn('Failed to fetch CSRF token:', err)
      }

      const response = await fetch('/api/sbom/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return data.upload_id

    } catch (err) {
      setError('Failed to upload files: ' + err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleScan = async () => {
    setScanning(true)
    setError(null)

    try {
      let scanPath = projectPath

      // If upload mode, upload files first
      if (scanType === 'upload') {
        const uploadId = await uploadFiles()
        if (!uploadId) {
          setScanning(false)
          return
        }
        scanPath = `/tmp/uploads/${uploadId}`
      }

      if (!scanPath) {
        setError('Please provide a project path or upload files')
        setScanning(false)
        return
      }

      // Trigger scan
      const token = localStorage.getItem('rodeo_token')

      // Fetch CSRF token from server
      let csrfToken = null
      try {
        const csrfResponse = await fetch('/auth/csrf-token')
        const csrfData = await csrfResponse.json()
        csrfToken = csrfData.csrf_token
      } catch (err) {
        console.warn('Failed to fetch CSRF token:', err)
      }

      const response = await fetch('/api/sbom/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: JSON.stringify({
          project_path: scanPath,
          project_name: projectName || 'My Project',
          project_version: projectVersion || '1.0.0',
          detect_languages: true,
          enrich_vulnerabilities: enrichVulnerabilities,
          check_compliance: checkCompliance
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Scan failed')
      }

      const data = await response.json()

      // Success!
      onScanComplete(data)
      handleClose()

    } catch (err) {
      setError('Scan failed: ' + err.message)
    } finally {
      setScanning(false)
    }
  }

  const handleImportSBOM = async () => {
    if (!selectedSBOMFile) {
      setError('Please select an SBOM file to import')
      return
    }

    setImporting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedSBOMFile)

      const token = localStorage.getItem('rodeo_token')

      // Fetch CSRF token from server
      let csrfToken = null
      try {
        const csrfResponse = await fetch('/auth/csrf-token')
        const csrfData = await csrfResponse.json()
        csrfToken = csrfData.csrf_token
      } catch (err) {
        console.warn('Failed to fetch CSRF token:', err)
      }

      const response = await fetch(`/api/sbom/import?enrich_vulnerabilities=${enrichVulnerabilities}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Import failed')
      }

      const data = await response.json()

      // Success!
      onScanComplete(data)
      handleClose()

    } catch (err) {
      setError('Import failed: ' + err.message)
    } finally {
      setImporting(false)
    }
  }

  const handleSBOMFileSelect = (e) => {
    const file = e.target.files[0]
    setSelectedSBOMFile(file)
    setError(null)
  }

  const handleClose = () => {
    setSelectedFiles([])
    setSelectedSBOMFile(null)
    setProjectName('')
    setProjectVersion('1.0.0')
    setProjectPath('')
    setError(null)
    setScanType('upload')
    setUploading(false)
    setScanning(false)
    setImporting(false)
    onClose()
  }

  const getFileIcon = (filename) => {
    if (filename.includes('package.json')) return '📦'
    if (filename.includes('requirements.txt')) return '🐍'
    if (filename.includes('pom.xml')) return '☕'
    if (filename.includes('build.gradle')) return '🐘'
    if (filename.includes('Pipfile')) return '🐍'
    if (filename.includes('pyproject.toml')) return '🐍'
    if (filename.includes('Gemfile')) return '💎'
    if (filename.includes('Cargo.toml')) return '🦀'
    if (filename.includes('go.mod')) return '🐹'
    return '📄'
  }

  const manifestFiles = selectedFiles.filter(f =>
    ['package.json', 'package-lock.json', 'requirements.txt', 'Pipfile', 'poetry.lock',
     'pom.xml', 'build.gradle', 'Gemfile', 'Cargo.toml', 'go.mod', 'pyproject.toml'].includes(f.name)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-2xl w-full rounded-lg shadow-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🔍 Scan Project for SBOM
          </h2>
          <button
            onClick={handleClose}
            className={`text-2xl ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Scan Type Selector */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Scan Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setScanType('upload')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  scanType === 'upload'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : isDarkMode
                      ? 'border-slate-600 bg-slate-700 hover:border-slate-500'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📤</div>
                  <div className="font-semibold text-sm">Scan Project</div>
                  <div className="text-xs text-gray-500">Upload manifests</div>
                </div>
              </button>

              <button
                onClick={() => setScanType('path')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  scanType === 'path'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : isDarkMode
                      ? 'border-slate-600 bg-slate-700 hover:border-slate-500'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📁</div>
                  <div className="font-semibold text-sm">Server Path</div>
                  <div className="text-xs text-gray-500">Scan directory</div>
                </div>
              </button>

              <button
                onClick={() => setScanType('import')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  scanType === 'import'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : isDarkMode
                      ? 'border-slate-600 bg-slate-700 hover:border-slate-500'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📥</div>
                  <div className="font-semibold text-sm">Import SBOM</div>
                  <div className="text-xs text-gray-500">Load existing</div>
                </div>
              </button>
            </div>
          </div>

          {/* Upload Mode */}
          {scanType === 'upload' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Manifest Files
              </label>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDarkMode
                    ? 'border-slate-600 bg-slate-700 hover:border-purple-500'
                    : 'border-gray-300 bg-gray-50 hover:border-purple-400'
                }`}
              >
                <div className="text-6xl mb-4">📦</div>
                <div className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Drop manifest files here
                </div>
                <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  or
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".json,.txt,.xml,.gradle,.toml,.lock,.yml,.yaml"
                  />
                  <span className="px-6 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors inline-block">
                    Browse Files
                  </span>
                </label>
                <div className={`text-xs mt-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Supported: package.json, requirements.txt, pom.xml, build.gradle, Pipfile, etc.
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-semibold mb-2">
                    Selected Files ({selectedFiles.length})
                    {manifestFiles.length > 0 && (
                      <span className="ml-2 text-green-600">
                        ({manifestFiles.length} manifest{manifestFiles.length !== 1 ? 's' : ''} detected)
                      </span>
                    )}
                  </div>
                  <div className={`rounded border ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50'} p-3 max-h-40 overflow-y-auto`}>
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <span>{getFileIcon(file.name)}</span>
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Path Mode */}
          {scanType === 'path' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Project Path
              </label>
              <input
                type="text"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="/path/to/project"
                className={`w-full px-4 py-2 rounded border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Full path to the project directory on the server
              </div>
            </div>
          )}

          {/* Import Mode */}
          {scanType === 'import' && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                SBOM File
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDarkMode
                  ? 'border-slate-600 bg-slate-700'
                  : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="text-5xl mb-3">📥</div>
                <div className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Import Existing SBOM
                </div>
                <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Supports: CycloneDX (JSON, XML), SPDX (JSON, YAML, RDF, Tag-Value), SWID (XML)
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    onChange={handleSBOMFileSelect}
                    accept=".json,.xml,.yaml,.yml,.spdx,.rdf,.cdx,.cyclonedx,.swidtag"
                    className="hidden"
                  />
                  <span className={`px-6 py-2 rounded cursor-pointer inline-block ${
                    isDarkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}>
                    Choose SBOM File
                  </span>
                </label>

                {selectedSBOMFile && (
                  <div className={`mt-4 p-3 rounded border ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-600'
                      : 'bg-white border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📄</span>
                        <div className="text-left">
                          <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedSBOMFile.name}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {(selectedSBOMFile.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSBOMFile(null)}
                        className={`text-sm px-3 py-1 rounded ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Auto-detects format from file content and extension
              </div>
            </div>
          )}

          {/* Project Information (only for scan modes) */}
          {scanType !== 'import' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Application"
                  className={`w-full px-4 py-2 rounded border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Version
                </label>
                <input
                  type="text"
                  value={projectVersion}
                  onChange={(e) => setProjectVersion(e.target.value)}
                  placeholder="1.0.0"
                  className={`w-full px-4 py-2 rounded border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enrich-vulns"
                checked={enrichVulnerabilities}
                onChange={(e) => setEnrichVulnerabilities(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="enrich-vulns" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Enrich with vulnerability data (NVD, OSV)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="check-compliance"
                checked={checkCompliance}
                onChange={(e) => setCheckCompliance(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="check-compliance" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Check license compliance
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Progress Info */}
          {(uploading || scanning || importing) && (
            <div className={`p-4 rounded border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className={isDarkMode ? 'text-blue-300' : 'text-blue-700'}>
                  {uploading ? 'Uploading files...' : importing ? 'Importing SBOM...' : 'Scanning project...'}
                </span>
              </div>
              {enrichVulnerabilities && (scanning || importing) && (
                <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This may take a few minutes while we correlate vulnerabilities from NVD and OSV databases.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <Button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            disabled={uploading || scanning || importing}
          >
            Cancel
          </Button>
          {scanType === 'import' ? (
            <Button
              onClick={handleImportSBOM}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              disabled={importing || !selectedSBOMFile}
            >
              {importing ? 'Importing...' : '📥 Import SBOM'}
            </Button>
          ) : (
            <Button
              onClick={handleScan}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              disabled={uploading || scanning || !projectName || (scanType === 'upload' && selectedFiles.length === 0) || (scanType === 'path' && !projectPath)}
            >
              {uploading ? 'Uploading...' : scanning ? 'Scanning...' : '🔍 Scan Project'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
