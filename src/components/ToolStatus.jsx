import { useState, useEffect } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  CogIcon,
  CommandLineIcon,
  CloudIcon,
  ShieldCheckIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const categoryIcons = {
  webapp: GlobeAltIcon,
  cloud: CloudIcon,
  auth: KeyIcon,
  network: CommandLineIcon,
  scanner: MagnifyingGlassIcon,
  exploit: ShieldCheckIcon,
  default: CogIcon
}

const ToolStatus = ({ tools = [], onRefresh, onExecute, loading = false }) => {
  const [filter, setFilter] = useState('all')
  const [expandedTool, setExpandedTool] = useState(null)

  const categories = [...new Set(tools.map(t => t.category || 'other'))]

  const filteredTools = filter === 'all'
    ? tools
    : filter === 'installed'
    ? tools.filter(t => t.is_installed)
    : filter === 'missing'
    ? tools.filter(t => !t.is_installed)
    : tools.filter(t => (t.category || 'other') === filter)

  const stats = {
    total: tools.length,
    installed: tools.filter(t => t.is_installed).length,
    missing: tools.filter(t => !t.is_installed).length
  }

  const getStatusIcon = (tool) => {
    if (tool.is_installed === null || tool.is_installed === undefined) {
      return <ExclamationCircleIcon className="w-4 h-4 text-warning-500" />
    }
    return tool.is_installed
      ? <CheckCircleIcon className="w-4 h-4 text-success-500" />
      : <XCircleIcon className="w-4 h-4 text-danger-500" />
  }

  const getCategoryIcon = (category) => {
    const Icon = categoryIcons[category] || categoryIcons.default
    return <Icon className="w-4 h-4" />
  }

  const getStatusBadge = (tool) => {
    if (tool.is_installed) {
      return (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-400">
          Installed
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-400">
        Not Installed
      </span>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl shadow-xl border-2 border-slate-600/50">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b-2 border-slate-600/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/25 rounded-lg flex items-center justify-center border border-red-500/40">
              <CommandLineIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Security Tools Arsenal
            </h3>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-cyan-300 hover:text-cyan-200 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-500/50 disabled:opacity-50 transition-all"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5">
          <div className="text-center p-2 sm:p-4 bg-slate-700/50 rounded-xl border border-slate-600/50">
            <div className="text-xl sm:text-3xl font-black text-white">{stats.total}</div>
            <div className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider mt-1">Total</div>
          </div>
          <div className="text-center p-2 sm:p-4 bg-green-900/20 rounded-xl border border-green-500/40">
            <div className="text-xl sm:text-3xl font-black text-green-400">{stats.installed}</div>
            <div className="text-xs sm:text-sm font-bold text-green-300 uppercase tracking-wider mt-1">Installed</div>
          </div>
          <div className="text-center p-2 sm:p-4 bg-red-900/20 rounded-xl border border-red-500/40">
            <div className="text-xl sm:text-3xl font-black text-red-400">{stats.missing}</div>
            <div className="text-xs sm:text-sm font-bold text-red-300 uppercase tracking-wider mt-1">Missing</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-500/40'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('installed')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              filter === 'installed'
                ? 'bg-green-500/20 text-green-300 border-2 border-green-500/40'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
            }`}
          >
            Installed
          </button>
          <button
            onClick={() => setFilter('missing')}
            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
              filter === 'missing'
                ? 'bg-red-500/20 text-red-300 border-2 border-red-500/40'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
            }`}
          >
            Missing
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 ${
                filter === cat
                  ? 'bg-brand-purple/20 text-brand-purple-light border-2 border-brand-purple/40'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600'
              }`}
            >
              {getCategoryIcon(cat)}
              <span className="hidden sm:inline">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              <span className="sm:hidden">{cat.charAt(0).toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tool List */}
      <div className="divide-y divide-slate-600/50 max-h-[600px] overflow-y-auto">
        {filteredTools.map(tool => (
          <div
            key={tool.tool_id}
            className="p-3 sm:p-5 hover:bg-slate-700/30 transition-colors"
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
              onClick={() => setExpandedTool(expandedTool === tool.tool_id ? null : tool.tool_id)}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {getStatusIcon(tool)}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg font-bold text-white truncate">
                      {tool.tool_name}
                    </span>
                    {getStatusBadge(tool)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm sm:text-base font-medium text-slate-400 truncate">
                      {tool.binary_name || tool.tool_id}
                    </span>
                    {tool.phases && tool.phases.length > 0 && (
                      <span className="text-sm sm:text-base text-cyan-400 truncate">
                        • {tool.phases.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {tool.is_installed && onExecute && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onExecute(tool)
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-500/80 to-orange-500/80 hover:from-red-500 hover:to-orange-500 rounded-lg border border-red-400/50 transition-all shadow-lg shadow-red-500/20 w-full sm:w-auto"
                >
                  <PlayIcon className="w-4 h-4" />
                  Run
                </button>
              )}
            </div>

            {/* Expanded Details */}
            {expandedTool === tool.tool_id && (
              <div className="mt-4 pt-4 border-t border-slate-600/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base">
                  <div className="overflow-hidden">
                    <span className="font-bold text-cyan-300">Plugin Path:</span>
                    <span className="ml-2 text-white font-mono text-xs sm:text-sm break-all">
                      {tool.plugin_path}
                    </span>
                  </div>
                  {tool.target_types && (
                    <div>
                      <span className="font-bold text-cyan-300">Targets:</span>
                      <span className="ml-2 text-white">
                        {tool.target_types.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tool.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold bg-slate-700/50 text-slate-300 rounded-lg border border-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredTools.length === 0 && (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-600">
              <MagnifyingGlassIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
            </div>
            <p className="text-base sm:text-lg font-bold text-white">No tools found</p>
            <p className="text-sm sm:text-base text-slate-400 mt-1">Try adjusting your filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ToolStatus
