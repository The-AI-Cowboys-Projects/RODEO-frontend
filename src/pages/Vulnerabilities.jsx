import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import { vulnerabilities } from '../api/client'
import CreateJiraTicketButton from '../components/CreateJiraTicketButton'

export default function Vulnerabilities() {
  const { isDarkMode } = useTheme()
  const { data, isLoading } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: vulnerabilities.list,
  })

  if (isLoading) {
    return <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading vulnerabilities...</div>
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800 border border-red-200'
      case 'high': return isDarkMode ? 'bg-orange-900 text-orange-200' : 'bg-orange-50 text-orange-800 border border-orange-200'
      case 'medium': return isDarkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
      case 'low': return isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-800 border border-green-200'
      default: return isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  return (
    <div className={`space-y-6 ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-[#800080]'}`}>Vulnerabilities</h1>
        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
          Total: <span className={`${isDarkMode ? 'text-white' : 'text-[#800080]'} font-bold`}>{data?.length || 0}</span> vulnerabilities
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-300'} rounded-lg border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
            <thead className={`${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  CVE ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Component
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Severity
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  CVSS Score
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Triage
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Source
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {data?.map((vuln) => (
                <tr key={vuln.id} className={`${isDarkMode ? 'hover:bg-slate-750' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#800080]'}`}>
                    {vuln.vuln_id}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-[#800080]'}`}>
                    {vuln.component}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity?.toUpperCase()}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#800080]'}`}>
                    {vuln.cvss_score?.toFixed(1) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-50 text-purple-800 border border-purple-200'}`}>
                      {vuln.triage_label}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
                    {vuln.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <CreateJiraTicketButton
                      type="vulnerability"
                      data={{
                        cve_id: vuln.vuln_id,
                        cvss_score: vuln.cvss_score || 0,
                        severity: vuln.severity || 'medium',
                        description: vuln.description || `Vulnerability in ${vuln.component}`,
                        affected_systems: vuln.affected_systems || [vuln.component],
                        exploit_available: false,
                        rodeo_link: `${window.location.origin}/vulnerabilities`
                      }}
                      size="sm"
                    />
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
