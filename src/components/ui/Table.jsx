/**
 * Table Component
 * Advanced table with sorting, filtering, and pagination
 */

import { useState } from 'react'

export default function Table({
  columns,
  data,
  loading = false,
  sortable = false,
  hoverable = true,
  striped = false,
  compact = false,
  className = '',
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    if (!sortable) return

    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ column }) => {
    if (!sortable) return null
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-700">
        <div className="bg-slate-800 p-8 text-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin h-5 w-5 text-purple-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-400">Loading data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-700 ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`
                    px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider
                    ${sortable ? 'cursor-pointer hover:text-purple-400 transition-color' : ''}
                    ${compact ? 'px-4 py-2' : ''}
                  `}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    <SortIcon column={column.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-slate-800 divide-y divide-slate-700 ${striped ? 'divide-y-0' : ''}`}>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={`
                  animate-fadeInUp
                  ${hoverable ? 'hover:bg-slate-750 transition-color' : ''}
                  ${striped && rowIndex % 2 === 1 ? 'bg-slate-800/50' : ''}
                `}
                style={{ animationDelay: `${rowIndex * 0.02}s` }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm
                      ${compact ? 'px-4 py-2' : ''}
                    `}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && !loading && (
        <div className="bg-slate-800 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="mt-4 text-gray-400">No data available</p>
        </div>
      )}
    </div>
  )
}
