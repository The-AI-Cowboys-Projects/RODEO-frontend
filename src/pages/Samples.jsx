import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import { samples } from '../api/client'

export default function Samples() {
  const { isDarkMode } = useTheme()
  const { data, isLoading } = useQuery({
    queryKey: ['samples'],
    queryFn: () => samples.list(100, 0),
  })

  if (isLoading) {
    return <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading samples...</div>
  }

  const getRiskColor = (score) => {
    if (score >= 0.8) return isDarkMode ? 'text-red-400' : 'text-red-600'
    if (score >= 0.5) return isDarkMode ? 'text-orange-400' : 'text-orange-600'
    return isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-[#800080]'}`}>Malware Samples</h1>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
          Total: <span className={`${isDarkMode ? 'text-white' : 'text-[#800080]'} font-bold`}>{data?.length || 0}</span> samples
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-300'} rounded-lg border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
            <thead className={`${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Sample ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  SHA256
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Source
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Risk Score
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Created
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {data?.map((sample) => (
                <tr key={sample.id} className={`${isDarkMode ? 'hover:bg-slate-750' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#800080]'}`}>
                    {sample.sample_id}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                    <div className="flex items-center gap-2">
                      <span>{sample.sha256?.substring(0, 16)}...</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(sample.sha256)}
                        className={`${isDarkMode ? 'text-gray-500 hover:text-purple-400' : 'text-[#800080] hover:text-purple-600'} transition-colors`}
                        title="Copy full hash"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-[#800080]'}`}>
                    {sample.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-bold ${getRiskColor(sample.overall_risk_score)}`}>
                      {sample.overall_risk_score?.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        sample.analysis_status === 'complete'
                          ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800 border border-green-200'
                          : sample.analysis_status === 'processing'
                          ? isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          : isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {sample.analysis_status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                    {new Date(sample.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
