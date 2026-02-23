import { useQuery } from '@tanstack/react-query'
import { useTheme } from '../context/ThemeContext'
import { stats, samples, vulnerabilities } from '../api/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import StatCard from '../components/ui/StatCard'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import { getRiskColor, getRiskLabel } from '../styles/theme'

export default function DashboardImproved() {
  const { isDarkMode } = useTheme()
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: stats.overview,
  })

  const { data: highRiskSamples, isLoading: samplesLoading } = useQuery({
    queryKey: ['high-risk-samples'],
    queryFn: () => samples.getHighRisk(0.7),
  })

  const { data: criticalVulns, isLoading: vulnsLoading } = useQuery({
    queryKey: ['critical-vulns'],
    queryFn: vulnerabilities.getCritical,
  })

  const isLoading = statsLoading || samplesLoading || vulnsLoading

  // Chart data
  const overviewData = [
    { name: 'Samples', value: statsData?.total_samples || 0 },
    { name: 'Vulnerabilities', value: statsData?.total_vulnerabilities || 0 },
    { name: 'Patches', value: statsData?.total_patches || 0 },
  ]

  const riskDistribution = [
    { name: 'Critical', value: statsData?.critical_vulnerabilities || 0, color: '#dc2626' },
    { name: 'High', value: statsData?.high_risk_samples || 0, color: '#ea580c' },
    { name: 'Medium', value: 15, color: '#f59e0b' },
    { name: 'Low', value: 8, color: '#84cc16' },
  ]

  // Table columns
  const columns = [
    {
      key: 'sample_id',
      label: 'Sample ID',
      render: (row) => (
        <span className="font-medium text-white">{row.sample_id}</span>
      ),
    },
    {
      key: 'sha256',
      label: 'SHA256',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-400">
            {row.sha256?.substring(0, 16)}...
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(row.sha256)}
            className="text-gray-500 hover:text-purple-400 transition-colors"
            title="Copy full hash"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      ),
    },
    {
      key: 'overall_risk_score',
      label: 'Risk',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <div
            className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden"
            title={`${(row.overall_risk_score * 100).toFixed(0)}%`}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${row.overall_risk_score * 100}%`,
                background: getRiskColor(row.overall_risk_score),
              }}
            />
          </div>
          <Badge
            variant={getRiskLabel(row.overall_risk_score).toLowerCase()}
            size="xs"
            rounded
          >
            {getRiskLabel(row.overall_risk_score)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'analysis_status',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={row.analysis_status === 'complete' ? 'success' : 'warning'}
          size="sm"
          dot={row.analysis_status === 'processing'}
        >
          {row.analysis_status}
        </Badge>
      ),
    },
  ]

  return (
    <div className={`space-y-6 animate-fadeIn ${isDarkMode ? '' : 'bg-white p-6 rounded-lg'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent' : 'text-[#800080]'}`}>
            Security Dashboard
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'} mt-2`}>Real-time threat intelligence and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="success" dot>
            System Online
          </Badge>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Samples"
          value={statsData?.total_samples || 0}
          icon="🦠"
          trend="+12% from last week"
          trendDirection="up"
          variant="primary"
          loading={statsLoading}
          className="stagger-delay-1"
        />
        <StatCard
          title="High Risk"
          value={statsData?.high_risk_samples || 0}
          icon="⚠️"
          trend="-3 from yesterday"
          trendDirection="down"
          variant="danger"
          loading={statsLoading}
          className="stagger-delay-2"
        />
        <StatCard
          title="Critical Vulnerabilities"
          value={statsData?.critical_vulnerabilities || 0}
          icon="🔓"
          trend="+5 new today"
          trendDirection="up"
          variant="warning"
          loading={statsLoading}
          className="stagger-delay-3"
        />
        <StatCard
          title="Patches Applied"
          value={statsData?.total_patches || 0}
          icon="✅"
          trend="+8 this week"
          trendDirection="up"
          variant="success"
          loading={statsLoading}
          className="stagger-delay-4"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overview Chart */}
        <Card variant="glass" className="animate-fadeInUp stagger-delay-1">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">📊</span>
            Security Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#7e22ce" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Distribution */}
        <Card variant="glass" className="animate-fadeInUp stagger-delay-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">🎯</span>
            Risk Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {riskDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* High-Risk Samples Table */}
      <Card variant="glass" className="animate-fadeInUp stagger-delay-3">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">🚨</span>
            Recent High-Risk Samples
          </h2>
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center transition-color">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <Table
          columns={columns}
          data={highRiskSamples?.slice(0, 5) || []}
          loading={samplesLoading}
          sortable
          hoverable
        />
      </Card>

      {/* Critical Alerts */}
      {criticalVulns && criticalVulns.length > 0 && (
        <Card variant="error" className="animate-fadeInUp stagger-delay-4" glow>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-200">Critical Vulnerabilities Detected</h3>
              <div className="mt-2 text-sm text-red-300">
                <p>{criticalVulns.length} critical vulnerabilities require immediate attention</p>
              </div>
              <div className="mt-4">
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-base">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
