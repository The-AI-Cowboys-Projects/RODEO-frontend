import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { knowledge } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  TagIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

// ─── Constants ───────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { value: 'incident_summary', label: 'Incident Summary' },
  { value: 'threat_pattern',   label: 'Threat Pattern' },
  { value: 'analyst_note',     label: 'Analyst Note' },
  { value: 'mitre_technique',  label: 'MITRE Technique' },
  { value: 'action_outcome',   label: 'Action Outcome' },
  { value: 'playbook_result',  label: 'Playbook Result' },
  { value: 'system_context',   label: 'System Context' },
]

const DOC_TYPE_LABEL = Object.fromEntries(DOC_TYPES.map(d => [d.value, d.label]))

// Doc-type badge colors
function docTypeBadgeClass(docType) {
  switch (docType) {
    case 'mitre_technique':  return 'bg-purple-600 text-white'
    case 'incident_summary': return 'bg-blue-600 text-white'
    case 'analyst_note':     return 'bg-green-600 text-white'
    case 'threat_pattern':   return 'bg-red-600 text-white'
    case 'action_outcome':   return 'bg-yellow-500 text-gray-900'
    case 'playbook_result':  return 'bg-cyan-600 text-white'
    case 'system_context':   return 'bg-gray-600 text-white'
    default:                 return 'bg-gray-600 text-white'
  }
}

function DocTypeBadge({ docType, size = 'sm' }) {
  const cls = docTypeBadgeClass(docType)
  const label = DOC_TYPE_LABEL[docType] || docType || 'Unknown'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}

function formatDate(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return ts
  }
}

function truncate(text, max = 200) {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}

const INPUT_BASE = (isDarkMode) =>
  `${
    isDarkMode
      ? 'bg-slate-900/50 border-slate-700 text-white placeholder-gray-500'
      : 'bg-gray-50 border-gray-300 text-gray-900'
  } w-full rounded-lg border px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none text-sm`

const LABEL_CLS = (isDarkMode) =>
  `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`

const DOCS_PER_PAGE = 50

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('search')
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  // Status / top-level data
  const [statusData, setStatusData] = useState(null)
  const [tagsData, setTagsData] = useState({})

  // Search tab
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDocType, setSearchDocType] = useState('')
  const [searchTag, setSearchTag] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchCount, setSearchCount] = useState(0)
  const [searching, setSearching] = useState(false)
  const [expandedResult, setExpandedResult] = useState(null)

  // Documents tab
  const [docFilter, setDocFilter] = useState('')
  const [documents, setDocuments] = useState([])
  const [docTotal, setDocTotal] = useState(0)
  const [docOffset, setDocOffset] = useState(0)
  const [expandedDoc, setExpandedDoc] = useState(null)
  const [loadingDocs, setLoadingDocs] = useState(false)

  // Ingest tab
  const [ingestType, setIngestType] = useState('analyst_note')
  const [ingestForm, setIngestForm] = useState({})
  const [ingesting, setIngesting] = useState(false)

  // ── Notification helper ───────────────────────────────────────────────────
  const showNotif = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // ── Initial data load ─────────────────────────────────────────────────────
  const fetchInitial = async () => {
    setLoading(true)
    try {
      const [statusRes, tagsRes] = await Promise.all([
        knowledge.getStatus().catch(() => null),
        knowledge.getTags().catch(() => ({ tags: {} })),
      ])
      setStatusData(statusRes)
      setTagsData(tagsRes?.tags || {})
    } catch (err) {
      console.error('KnowledgeBase init error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitial()
  }, [])

  // ── Fetch documents ───────────────────────────────────────────────────────
  const fetchDocuments = async (offset = 0, filter = docFilter) => {
    setLoadingDocs(true)
    try {
      const res = await knowledge.listDocuments(filter || null, DOCS_PER_PAGE, offset)
      setDocuments(Array.isArray(res?.documents) ? res.documents : [])
      setDocTotal(res?.total ?? 0)
      setDocOffset(offset)
    } catch {
      showNotif('Failed to load documents', 'error')
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments(0, docFilter)
    }
  }, [activeTab, docFilter])

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim() && !searchDocType && !searchTag) return
    setSearching(true)
    try {
      const res = await knowledge.search(
        searchQuery || ' ',
        10,
        searchDocType || null,
        searchTag || null,
      )
      setSearchResults(Array.isArray(res?.results) ? res.results : [])
      setSearchCount(res?.count ?? 0)
      setExpandedResult(null)
    } catch {
      showNotif('Search failed', 'error')
    } finally {
      setSearching(false)
    }
  }

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  // ── Delete document ───────────────────────────────────────────────────────
  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document from the knowledge base?')) return
    try {
      await knowledge.deleteDocument(docId)
      showNotif('Document deleted', 'success')
      fetchDocuments(docOffset, docFilter)
      fetchInitial()
    } catch {
      showNotif('Failed to delete document', 'error')
    }
  }

  // ── Ingest ────────────────────────────────────────────────────────────────
  const handleIngest = async () => {
    setIngesting(true)
    try {
      if (ingestType === 'analyst_note') {
        if (!ingestForm.title || !ingestForm.content) {
          showNotif('Title and content are required', 'error')
          setIngesting(false)
          return
        }
        const tags = (ingestForm.tags || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
        await knowledge.ingestAnalystNote({
          title: ingestForm.title,
          content: ingestForm.content,
          tags,
          author: ingestForm.author || undefined,
        })
      } else if (ingestType === 'incident_summary') {
        if (!ingestForm.title || !ingestForm.summary) {
          showNotif('Title and summary are required', 'error')
          setIngesting(false)
          return
        }
        const actionsTaken = (ingestForm.actions_taken || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
        const tags = (ingestForm.tags || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
        await knowledge.ingestIncident({
          title: ingestForm.title,
          summary: ingestForm.summary,
          actions_taken: actionsTaken,
          outcome: ingestForm.outcome || 'unresolved',
          tags,
        })
      } else {
        // Generic
        if (!ingestForm.doc_type || !ingestForm.title || !ingestForm.content) {
          showNotif('Document type, title, and content are required', 'error')
          setIngesting(false)
          return
        }
        const tags = (ingestForm.tags || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
        await knowledge.ingest({
          doc_type: ingestForm.doc_type,
          title: ingestForm.title,
          content: ingestForm.content,
          tags,
          source: ingestForm.source || undefined,
        })
      }

      showNotif('Document ingested successfully', 'success')
      setIngestForm({})
      fetchInitial()
    } catch {
      showNotif('Failed to ingest document', 'error')
    } finally {
      setIngesting(false)
    }
  }

  // ── Tag click → switch to search ──────────────────────────────────────────
  const handleTagClick = (tag) => {
    setSearchTag(tag)
    setSearchQuery('')
    setSearchDocType('')
    setActiveTab('search')
    // Trigger search after state update
    setTimeout(async () => {
      setSearching(true)
      try {
        const res = await knowledge.search(' ', 10, null, tag)
        setSearchResults(Array.isArray(res?.results) ? res.results : [])
        setSearchCount(res?.count ?? 0)
        setExpandedResult(null)
      } catch {
        showNotif('Search failed', 'error')
      } finally {
        setSearching(false)
      }
    }, 0)
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const docCount = statusData?.doc_count ?? 0
  const kbInitialized = statusData?.engine_initialized === true
  const tagEntries = Object.entries(tagsData)
  const tagCount = tagEntries.length
  const maxTagCount = tagEntries.length ? Math.max(...tagEntries.map(([, c]) => c)) : 1

  // Distinct doc types from status
  const distinctTypeCount = DOC_TYPES.length

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'search',    label: 'Search',    icon: MagnifyingGlassIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'ingest',    label: 'Ingest',    icon: PlusCircleIcon },
    { id: 'tags',      label: 'Tags',      icon: TagIcon },
  ]

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && !statusData) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading knowledge base...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <BookOpenIcon className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Knowledge Base
              </h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Orchestrator long-term memory and context retrieval
              </p>
            </div>
          </div>
          <Button size="sm" onClick={fetchInitial} className="flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  KB Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      kbInitialized ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                  <span className={`font-semibold ${kbInitialized ? 'text-green-400' : 'text-gray-400'}`}>
                    {kbInitialized ? 'Ready' : 'Initializing'}
                  </span>
                </div>
              </div>
              {kbInitialized
                ? <CheckCircleIcon className="w-8 h-8 text-green-500" />
                : <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
              }
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Documents
                </p>
                <p className="text-2xl font-bold mt-1">{docCount.toLocaleString()}</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Document Types
                </p>
                <p className="text-2xl font-bold mt-1">{distinctTypeCount}</p>
              </div>
              <BookOpenIcon className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Unique Tags
                </p>
                <p className="text-2xl font-bold mt-1">{tagCount}</p>
              </div>
              <TagIcon className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className={`flex gap-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'border-purple-500 text-purple-400'
                      : isDarkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── SEARCH TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'search' && (
          <div>
            {/* Search bar */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKey}
                  placeholder="Search knowledge base..."
                  className={`pl-10 pr-4 py-2.5 rounded-lg border w-full text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <Button onClick={handleSearch} disabled={searching}>
                {searching
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Search'
                }
              </Button>
            </div>

            {/* Filter row */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <select
                value={searchDocType}
                onChange={e => setSearchDocType(e.target.value)}
                className={`px-3 py-1.5 rounded border text-sm ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Types</option>
                {DOC_TYPES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>

              <select
                value={searchTag}
                onChange={e => setSearchTag(e.target.value)}
                className={`px-3 py-1.5 rounded border text-sm ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Tags</option>
                {tagEntries.sort(([a], [b]) => a.localeCompare(b)).map(([tag]) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>

              {(searchQuery || searchDocType || searchTag) && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchDocType('')
                    setSearchTag('')
                    setSearchResults([])
                    setSearchCount(0)
                  }}
                  className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="mb-2">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchCount} result{searchCount !== 1 ? 's' : ''} found
                </p>
              </div>
            )}

            {searching ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 && (searchQuery || searchDocType || searchTag) ? (
              <Card>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No results found. Try a broader search query.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {searchResults.map((result, idx) => {
                  const isExpanded = expandedResult === idx
                  const score = typeof result.score === 'number'
                    ? `${(result.score * 100).toFixed(0)}% match`
                    : null

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border cursor-pointer transition-colors ${
                        isDarkMode
                          ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setExpandedResult(isExpanded ? null : idx)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm">{result.title || 'Untitled'}</h4>
                            <DocTypeBadge docType={result.doc_type} />
                            {score && (
                              <span className="text-xs text-purple-400 font-mono">{score}</span>
                            )}
                          </div>
                          {isExpanded
                            ? <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          }
                        </div>
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {isExpanded ? (result.content || '') : truncate(result.content, 200)}
                        </p>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {result.source && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Source: {result.source}
                              </p>
                            )}
                            {result.created_at && (
                              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Added: {formatDate(result.created_at)}
                              </p>
                            )}
                            {Array.isArray(result.tags) && result.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {result.tags.map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={e => { e.stopPropagation(); handleTagClick(tag) }}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                      isDarkMode
                                        ? 'border-slate-600 text-gray-400 hover:text-purple-300 hover:border-purple-500'
                                        : 'border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-400'
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {searchResults.length === 0 && !searchQuery && !searchDocType && !searchTag && (
              <Card>
                <div className="text-center py-4">
                  <MagnifyingGlassIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Enter a query to search the knowledge base, or use the filters above.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'documents' && (
          <div>
            {/* Filter + pagination controls */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <select
                  value={docFilter}
                  onChange={e => { setDocFilter(e.target.value); setDocOffset(0) }}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Types</option>
                  {DOC_TYPES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {docTotal.toLocaleString()} document{docTotal !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Pagination */}
              <div className="flex items-center gap-2">
                <button
                  disabled={docOffset === 0 || loadingDocs}
                  onClick={() => fetchDocuments(Math.max(0, docOffset - DOCS_PER_PAGE), docFilter)}
                  className={`p-1.5 rounded border transition-colors ${
                    docOffset === 0 || loadingDocs
                      ? 'opacity-40 cursor-not-allowed'
                      : isDarkMode
                      ? 'border-slate-700 hover:bg-slate-700'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {docOffset + 1}–{Math.min(docOffset + DOCS_PER_PAGE, docTotal)} of {docTotal}
                </span>
                <button
                  disabled={docOffset + DOCS_PER_PAGE >= docTotal || loadingDocs}
                  onClick={() => fetchDocuments(docOffset + DOCS_PER_PAGE, docFilter)}
                  className={`p-1.5 rounded border transition-colors ${
                    docOffset + DOCS_PER_PAGE >= docTotal || loadingDocs
                      ? 'opacity-40 cursor-not-allowed'
                      : isDarkMode
                      ? 'border-slate-700 hover:bg-slate-700'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loadingDocs ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <Card>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No documents found.
                </p>
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className={`text-xs uppercase tracking-wide ${
                      isDarkMode ? 'bg-slate-900/60 text-gray-400' : 'bg-gray-50 text-gray-500'
                    }`}>
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Source</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Tags</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                    {documents.map((doc, idx) => {
                      const isExpanded = expandedDoc === (doc.id || idx)
                      const tags = Array.isArray(doc.tags) ? doc.tags : []

                      return (
                        <>
                          <tr
                            key={doc.id || idx}
                            className={`cursor-pointer transition-colors ${
                              isDarkMode ? 'hover:bg-slate-800/60' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setExpandedDoc(isExpanded ? null : (doc.id || idx))}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {isExpanded
                                  ? <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  : <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                }
                                <span className="text-sm font-medium">
                                  {doc.title || 'Untitled'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <DocTypeBadge docType={doc.doc_type} />
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {doc.source || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(doc.created_at)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                                      isDarkMode
                                        ? 'bg-slate-700 text-gray-300'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {tags.length > 3 && (
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    +{tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {doc.id && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleDelete(doc.id) }}
                                  className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                                  title="Delete document"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* Expanded row */}
                          {isExpanded && (
                            <tr key={`${doc.id || idx}-expanded`}>
                              <td
                                colSpan={6}
                                className={`px-4 pb-4 pt-0 ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}
                              >
                                <div className={`rounded-lg border p-3 text-sm ${
                                  isDarkMode ? 'bg-slate-900 border-slate-700 text-gray-300' : 'bg-white border-gray-200 text-gray-700'
                                }`}>
                                  <p className="leading-relaxed whitespace-pre-wrap">
                                    {doc.content || 'No content available.'}
                                  </p>
                                  {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-700/30">
                                      {tags.map(tag => (
                                        <button
                                          key={tag}
                                          onClick={e => { e.stopPropagation(); handleTagClick(tag) }}
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border transition-colors ${
                                            isDarkMode
                                              ? 'border-slate-600 text-gray-400 hover:text-purple-300 hover:border-purple-500'
                                              : 'border-gray-300 text-gray-600 hover:text-purple-600 hover:border-purple-400'
                                          }`}
                                        >
                                          {tag}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}

        {/* ── INGEST TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'ingest' && (
          <div className="max-w-2xl">
            {/* Type selector */}
            <div className="mb-6">
              <label className={LABEL_CLS(isDarkMode)}>Document Type</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'analyst_note',     label: 'Analyst Note' },
                  { id: 'incident_summary', label: 'Incident Summary' },
                  { id: 'generic',          label: 'Generic Document' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setIngestType(opt.id); setIngestForm({}) }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      ingestType === opt.id
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-gray-300 hover:border-slate-500'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <Card>
              {/* ─── Analyst Note form ─────────────────────────────────── */}
              {ingestType === 'analyst_note' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Ingest Analyst Note</h3>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Observed lateral movement via RDP"
                      value={ingestForm.title || ''}
                      onChange={e => setIngestForm(f => ({ ...f, title: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Content *</label>
                    <textarea
                      rows={6}
                      placeholder="Detailed analyst observations..."
                      value={ingestForm.content || ''}
                      onChange={e => setIngestForm(f => ({ ...f, content: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Author</label>
                    <input
                      type="text"
                      placeholder="Your name or handle"
                      value={ingestForm.author || ''}
                      onChange={e => setIngestForm(f => ({ ...f, author: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="lateral-movement, rdp, windows"
                      value={ingestForm.tags || ''}
                      onChange={e => setIngestForm(f => ({ ...f, tags: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                </div>
              )}

              {/* ─── Incident Summary form ─────────────────────────────── */}
              {ingestType === 'incident_summary' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Ingest Incident Summary</h3>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ransomware incident — 2026-02-15"
                      value={ingestForm.title || ''}
                      onChange={e => setIngestForm(f => ({ ...f, title: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Summary *</label>
                    <textarea
                      rows={4}
                      placeholder="Brief description of the incident..."
                      value={ingestForm.summary || ''}
                      onChange={e => setIngestForm(f => ({ ...f, summary: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Actions Taken (one per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Isolated affected host&#10;Blocked malicious IP&#10;Notified security team"
                      value={ingestForm.actions_taken || ''}
                      onChange={e => setIngestForm(f => ({ ...f, actions_taken: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Outcome</label>
                    <select
                      value={ingestForm.outcome || 'unresolved'}
                      onChange={e => setIngestForm(f => ({ ...f, outcome: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    >
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                      <option value="partial">Partial</option>
                      <option value="unresolved">Unresolved</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="ransomware, endpoint, windows"
                      value={ingestForm.tags || ''}
                      onChange={e => setIngestForm(f => ({ ...f, tags: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                </div>
              )}

              {/* ─── Generic form ──────────────────────────────────────── */}
              {ingestType === 'generic' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Ingest Generic Document</h3>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Document Type *</label>
                    <select
                      value={ingestForm.doc_type || ''}
                      onChange={e => setIngestForm(f => ({ ...f, doc_type: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    >
                      <option value="">Select type...</option>
                      {DOC_TYPES.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Title *</label>
                    <input
                      type="text"
                      placeholder="Document title"
                      value={ingestForm.title || ''}
                      onChange={e => setIngestForm(f => ({ ...f, title: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Content *</label>
                    <textarea
                      rows={6}
                      placeholder="Document content..."
                      value={ingestForm.content || ''}
                      onChange={e => setIngestForm(f => ({ ...f, content: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Source</label>
                    <input
                      type="text"
                      placeholder="e.g. MITRE ATT&CK, internal-wiki"
                      value={ingestForm.source || ''}
                      onChange={e => setIngestForm(f => ({ ...f, source: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLS(isDarkMode)}>Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="tag1, tag2, tag3"
                      value={ingestForm.tags || ''}
                      onChange={e => setIngestForm(f => ({ ...f, tags: e.target.value }))}
                      className={INPUT_BASE(isDarkMode)}
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleIngest}
                  disabled={ingesting}
                  className="flex items-center gap-2"
                >
                  {ingesting
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <PlusCircleIcon className="w-4 h-4" />
                  }
                  {ingesting ? 'Ingesting...' : 'Ingest Document'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── TAGS TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'tags' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Knowledge Base Tags
                <span className={`ml-2 text-sm font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({tagCount})
                </span>
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Click a tag to search for documents
              </p>
            </div>

            {tagEntries.length === 0 ? (
              <Card>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No tags found. Tags are automatically created when documents are ingested.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {tagEntries
                  .sort(([, a], [, b]) => b - a)
                  .map(([tag, count]) => {
                    const opacity = Math.min(0.5 + (count / maxTagCount) * 0.5, 1)
                    const isLarge = count >= maxTagCount * 0.6

                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        style={{ opacity }}
                        className={`rounded-lg border p-3 text-left transition-all hover:border-purple-500 hover:scale-105 active:scale-100 ${
                          isDarkMode
                            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={`text-sm font-medium break-all leading-tight ${
                              isLarge
                                ? 'text-purple-400'
                                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {tag}
                          </span>
                          <span
                            className={`flex-shrink-0 ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                              isLarge
                                ? 'bg-purple-900/50 text-purple-300'
                                : isDarkMode
                                ? 'bg-slate-700 text-gray-400'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
