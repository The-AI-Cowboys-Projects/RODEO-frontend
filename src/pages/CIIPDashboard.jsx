/**
 * RODEO Critical Information Infrastructure Protection (CIIP) Dashboard
 * ====================================================================
 *
 * ITU National Cybersecurity Framework compliance and critical
 * infrastructure monitoring dashboard.
 *
 * Author: RODEO Team
 * Date: 2025-01-11
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import {
  ShieldCheckIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  GlobeAltIcon,
  BoltIcon,
  BuildingOfficeIcon,
  HeartIcon,
  SignalIcon,
  BanknotesIcon,
  DocumentArrowDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const API_BASE = import.meta.env.VITE_API_URL || '';

// ============================================================================
// Utility Components
// ============================================================================

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <p className={`mt-1 text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend} from last period
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

const RiskBadge = ({ level }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
    minimal: 'bg-green-100 text-green-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level]}`}>
      {level.toUpperCase()}
    </span>
  );
};

const ComplianceBar = ({ score, label }) => {
  const getColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{score}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${getColor(score)} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

const CIIPDashboard = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/ciip/dashboard/overview`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching CIIP dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} p-6`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-[#800080]'}`}>
          Critical Infrastructure Protection Dashboard
        </h1>
        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>
          ITU National Cybersecurity Framework Compliance & Monitoring
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {['overview', 'compliance', 'sectors', 'assets', 'incidents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <OverviewTab data={dashboardData} />
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <ComplianceTab />
      )}

      {/* Sectors Tab */}
      {activeTab === 'sectors' && (
        <SectorsTab />
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <AssetsTab />
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <IncidentsTab />
      )}
    </div>
  );
};

// ============================================================================
// Overview Tab
// ============================================================================

const OverviewTab = ({ data }) => {
  const sectorIcons = {
    energy: BoltIcon,
    telecommunications: SignalIcon,
    financial: BanknotesIcon,
    healthcare: HeartIcon,
    government: BuildingOfficeIcon
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Infrastructure Health"
          value={data.infrastructure_health.overall_score}
          subtitle={data.infrastructure_health.status.toUpperCase()}
          trend={data.infrastructure_health.trend}
          icon={ServerIcon}
          color="green"
        />
        <StatCard
          title="ITU Compliance"
          value={`${data.itu_compliance.overall_score}%`}
          subtitle="Overall Score"
          icon={ShieldCheckIcon}
          color="blue"
        />
        <StatCard
          title="Critical Assets"
          value={data.critical_assets.crown_jewels}
          subtitle={`${data.critical_assets.at_risk} at risk`}
          icon={ServerIcon}
          color="purple"
        />
        <StatCard
          title="Incidents (30d)"
          value={data.recent_incidents.last_30d}
          subtitle={`${data.recent_incidents.critical_open} critical open`}
          icon={ExclamationTriangleIcon}
          color="red"
        />
      </div>

      {/* ITU Compliance Pillars */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ITU Framework Compliance (5 Pillars)
        </h2>
        <div className="space-y-3">
          {Object.entries(data.itu_compliance.pillars).map(([pillar, details]) => (
            <ComplianceBar
              key={pillar}
              label={pillar.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              score={details.score}
            />
          ))}
        </div>
      </div>

      {/* Sector Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Sector */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Critical Infrastructure Sectors
          </h2>
          <div className="space-y-4">
            {data.sector_distribution.map((sector) => {
              const Icon = sectorIcons[sector.sector] || ServerIcon;
              return (
                <div key={sector.sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{sector.sector}</p>
                      <p className="text-sm text-gray-500">{sector.assets} assets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Risk: {sector.risk_score}</p>
                    <RiskBadge level={sector.risk_score > 80 ? 'critical' : sector.risk_score > 70 ? 'high' : 'medium'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <GlobeAltIcon className="w-6 h-6 mr-2 text-blue-600" />
            Geographic Distribution
          </h2>
          <div className="space-y-3">
            {Object.entries(data.geographic_distribution).map(([region, count]) => (
              <div key={region} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 uppercase">{region}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{count} assets</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / 342) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-900">{data.recent_incidents.last_24h}</p>
            <p className="text-sm text-red-700">Last 24 Hours</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-900">{data.recent_incidents.last_7d}</p>
            <p className="text-sm text-orange-700">Last 7 Days</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-900">{data.recent_incidents.last_30d}</p>
            <p className="text-sm text-yellow-700">Last 30 Days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Compliance Tab
// ============================================================================

const ComplianceTab = () => {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/ciip/compliance/itu`);
      setComplianceData(response.data);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !complianceData) {
    return <div className="text-center py-12">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overall Compliance */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ITU Framework Compliance
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Last Assessment: {new Date(complianceData.overall_compliance.last_assessment).toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">
              {complianceData.overall_compliance.score}%
            </div>
            <p className="text-sm text-gray-600 mt-1">Overall Score</p>
          </div>
        </div>
      </div>

      {/* ITU Pillars Detailed View */}
      {Object.entries(complianceData.pillars).map(([pillar, details]) => (
        <div key={pillar} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {pillar.replace(/_/g, ' ')}
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-gray-900">{details.score}%</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                details.status === 'compliant' ? 'bg-green-100 text-green-800' :
                details.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {details.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            {Object.entries(details.requirements).map(([req, reqDetails]) => (
              <div key={req} className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {req.replace(/_/g, ' ')}
                    </h4>
                    {reqDetails.evidence && reqDetails.evidence.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Evidence:</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {reqDetails.evidence.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {reqDetails.gaps && reqDetails.gaps.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-red-500 mb-1">Gaps:</p>
                        <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                          {reqDetails.gaps.map((gap, idx) => (
                            <li key={idx}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <span className={`ml-4 px-2 py-1 rounded text-xs font-medium ${
                    reqDetails.status === 'compliant' ? 'bg-green-100 text-green-800' :
                    reqDetails.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {reqDetails.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {details.recommendations && details.recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Recommendations:</p>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                {details.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      {/* Gap Analysis & Roadmap */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Gap Analysis & Remediation Roadmap
        </h3>

        {['high_priority', 'medium_priority', 'low_priority'].map((priority) => (
          <div key={priority} className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase">
              {priority.replace(/_/g, ' ')}
            </h4>
            <div className="space-y-2">
              {complianceData.gap_analysis[priority].map((gap, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{gap.gap}</p>
                    <p className="text-xs text-gray-500 mt-1">Pillar: {gap.pillar}</p>
                  </div>
                  <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {gap.target_date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Sectors Tab
// ============================================================================

const SectorsTab = () => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingPlan, setExportingPlan] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sectorDetails, setSectorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchSectors();
  }, []);

  const fetchSectors = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/ciip/sectors`);
      setSectors(response.data.sectors);
    } catch (error) {
      console.error('Error fetching sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewSectorDetails = async (sector) => {
    setSelectedSector(sector);
    setLoadingDetails(true);
    try {
      const response = await axios.get(`${API_BASE}/api/ciip/sectors/${sector.id}`);
      setSectorDetails(response.data);
    } catch (error) {
      console.error('Error fetching sector details:', error);
      // Use local sector data as fallback
      setSectorDetails(sector);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeSectorModal = () => {
    setSelectedSector(null);
    setSectorDetails(null);
  };

  const exportRemediationPlan = async (sector) => {
    setExportingPlan(sector.id);
    try {
      const response = await axios.get(`${API_BASE}/api/ciip/sectors/${sector.id}/remediation-plan`);
      const plan = response.data;

      // Generate markdown content
      const content = generateRemediationPlanMarkdown(sector, plan);

      // Create and download file
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sector.id}_remediation_plan_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error fetching remediation plan:', error);
      // Fallback: Generate local plan based on sector data
      const content = generateLocalRemediationPlan(sector);
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sector.id}_remediation_plan_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExportingPlan(null);
    }
  };

  const generateRemediationPlanMarkdown = (sector, plan) => {
    return `# ${sector.name} Sector Remediation Plan

**Generated:** ${new Date().toISOString()}
**Risk Score:** ${sector.risk_score}
**Compliance:** ${sector.compliance}%

---

## Executive Summary

This remediation plan addresses ${sector.incidents_30d} incidents in the last 30 days across ${sector.assets} assets, including ${sector.crown_jewels} crown jewels.

## Current Status

| Metric | Value |
|--------|-------|
| Assets | ${sector.assets} |
| Crown Jewels | ${sector.crown_jewels} |
| Risk Score | ${sector.risk_score} |
| Incidents (30d) | ${sector.incidents_30d} |
| Compliance | ${sector.compliance}% |

## Key Systems

${sector.key_systems.map(s => `- ${s}`).join('\n')}

## Remediation Actions

${plan?.actions?.map((action, i) => `### ${i + 1}. ${action.title}
- **Priority:** ${action.priority}
- **Owner:** ${action.owner}
- **Status:** ${action.status}
- **Description:** ${action.description}
`).join('\n') || '### Pending API Implementation\nRemediation actions will be populated from the backend API.'}

---

*Generated by RODEO CIIP Module*
`;
  };

  const generateLocalRemediationPlan = (sector) => {
    const priorityMap = {
      government: { priority: 'CRITICAL', focus: 'APT defense, PAM, Zero-trust' },
      financial: { priority: 'HIGH', focus: 'Fraud detection, PCI-DSS 4.0, incident closure' },
      energy: { priority: 'HIGH', focus: 'SCADA audit, IT/OT segmentation, NERC CIP' },
      telecommunications: { priority: 'MEDIUM', focus: '5G Core security, DNS protection, SS7' },
      healthcare: { priority: 'MEDIUM', focus: 'Ransomware defense, HIPAA, immutable backups' }
    };

    const sectorInfo = priorityMap[sector.id] || { priority: 'MEDIUM', focus: 'General security hardening' };

    return `# ${sector.name} Sector Remediation Plan

**Generated:** ${new Date().toISOString()}
**Classification:** Internal Use Only
**Priority:** ${sectorInfo.priority}

---

## Executive Summary

This remediation plan addresses the ${sector.name} sector with a current risk score of **${sector.risk_score}** and **${sector.compliance}%** compliance.

## Current Status

| Metric | Value | Status |
|--------|-------|--------|
| Total Assets | ${sector.assets} | - |
| Crown Jewels | ${sector.crown_jewels} | Protected |
| Risk Score | ${sector.risk_score} | ${sector.risk_score > 80 ? 'CRITICAL' : sector.risk_score > 70 ? 'HIGH' : 'MEDIUM'} |
| Incidents (30d) | ${sector.incidents_30d} | ${sector.incidents_30d > 10 ? 'Elevated' : 'Normal'} |
| Compliance | ${sector.compliance}% | ${sector.compliance >= 90 ? 'Good' : 'Needs Improvement'} |

## Key Systems at Risk

${sector.key_systems.map(s => `- **${s}** - Requires security assessment`).join('\n')}

## Focus Areas

${sectorInfo.focus}

---

## Phase 1: Immediate Actions (0-30 Days)

| Action | Owner | Priority | Status |
|--------|-------|----------|--------|
| Deploy EDR on all ${sector.crown_jewels} crown jewel systems | Security Team | P0 | Pending |
| Implement network micro-segmentation | Network Team | P0 | Pending |
| Enable 24/7 SOC monitoring for sector subnet | SOC | P0 | Pending |
| Conduct threat hunt for indicators | IR Team | P0 | Pending |
| Implement privileged access management (PAM) | Identity Team | P0 | Pending |

## Phase 2: Short-Term (30-90 Days)

| Action | Owner | Priority | Status |
|--------|-------|----------|--------|
| Complete compliance gap remediation | Compliance | P1 | Pending |
| Deploy UEBA for insider threat detection | Security Team | P1 | Pending |
| Conduct red team assessment | External | P1 | Pending |
| Implement zero-trust architecture | Architecture | P1 | Pending |

## Phase 3: Long-Term (90-180 Days)

| Action | Owner | Priority | Status |
|--------|-------|----------|--------|
| Complete legacy system modernization | Architecture | P2 | Pending |
| Deploy advanced threat protection | Security | P2 | Pending |
| Establish cross-sector threat intel sharing | CISO | P2 | Pending |

---

## Success Metrics

- Reduce risk score from ${sector.risk_score} to <${Math.max(45, sector.risk_score - 25)} within 90 days
- Achieve ${Math.min(100, sector.compliance + 10)}% compliance
- Zero successful intrusions on crown jewels
- Mean time to detect (MTTD) < 1 hour

---

## Appendix: MITRE ATT&CK Techniques

Common techniques targeting ${sector.name} sector:
- T1071 - Application Layer Protocol
- T1078 - Valid Accounts
- T1486 - Data Encrypted for Impact
- T1566 - Phishing

---

*Generated by RODEO CIIP Module*
*Report Date: ${new Date().toLocaleDateString()}*
`;
  };

  if (loading) {
    return <div className="text-center py-12">Loading sectors...</div>;
  }

  const sectorIcons = {
    energy: BoltIcon,
    telecommunications: SignalIcon,
    financial: BanknotesIcon,
    healthcare: HeartIcon,
    government: BuildingOfficeIcon
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sectors.map((sector) => {
        const Icon = sectorIcons[sector.id] || ServerIcon;
        return (
          <div key={sector.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{sector.name}</h3>
              </div>
              <RiskBadge level={sector.risk_score > 80 ? 'critical' : sector.risk_score > 70 ? 'high' : 'medium'} />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Assets</span>
                <span className="text-sm font-semibold text-gray-900">{sector.assets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Crown Jewels</span>
                <span className="text-sm font-semibold text-gray-900">{sector.crown_jewels}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Risk Score</span>
                <span className="text-sm font-semibold text-gray-900">{sector.risk_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Incidents (30d)</span>
                <span className="text-sm font-semibold text-gray-900">{sector.incidents_30d}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Compliance</span>
                <span className="text-sm font-semibold text-gray-900">{sector.compliance}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Key Systems:</p>
              <div className="flex flex-wrap gap-2">
                {sector.key_systems.map((system) => (
                  <span key={system} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {system}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => viewSectorDetails(sector)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Details
              </button>
              <button
                onClick={() => exportRemediationPlan(sector)}
                disabled={exportingPlan === sector.id}
                className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export Remediation Plan"
              >
                {exportingPlan === sector.id ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <DocumentArrowDownIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        );
      })}

      {/* Sector Details Modal */}
      {selectedSector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center space-x-3">
                {(() => {
                  const Icon = sectorIcons[selectedSector.id] || ServerIcon;
                  return (
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedSector.name} Sector</h2>
                  <p className="text-sm text-gray-500">Critical Infrastructure Details</p>
                </div>
              </div>
              <button
                onClick={closeSectorModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            {loadingDetails ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sector details...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Risk Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-gray-900">{selectedSector.assets}</p>
                    <p className="text-sm text-gray-600">Total Assets</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-purple-900">{selectedSector.crown_jewels}</p>
                    <p className="text-sm text-purple-600">Crown Jewels</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-900">{selectedSector.risk_score}</p>
                    <p className="text-sm text-red-600">Risk Score</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-900">{selectedSector.incidents_30d}</p>
                    <p className="text-sm text-orange-600">Incidents (30d)</p>
                  </div>
                </div>

                {/* Compliance */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Compliance Score</h3>
                    <span className="text-2xl font-bold text-blue-600">{selectedSector.compliance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        selectedSector.compliance >= 90 ? 'bg-green-500' :
                        selectedSector.compliance >= 75 ? 'bg-blue-500' :
                        selectedSector.compliance >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedSector.compliance}%` }}
                    />
                  </div>
                </div>

                {/* Key Systems */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Key Systems</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedSector.key_systems.map((system) => (
                      <div key={system} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                        <ServerIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{system}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Risk Assessment</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Threat Level</span>
                      <RiskBadge level={selectedSector.risk_score > 80 ? 'critical' : selectedSector.risk_score > 70 ? 'high' : 'medium'} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Protection Status</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedSector.compliance >= 80 ? 'bg-green-100 text-green-800' :
                        selectedSector.compliance >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedSector.compliance >= 80 ? 'Protected' : selectedSector.compliance >= 60 ? 'Partially Protected' : 'At Risk'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Incident Trend</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedSector.incidents_30d <= 5 ? 'bg-green-100 text-green-800' :
                        selectedSector.incidents_30d <= 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedSector.incidents_30d <= 5 ? 'Low' : selectedSector.incidents_30d <= 15 ? 'Moderate' : 'High'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      exportRemediationPlan(selectedSector);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Export Remediation Plan
                  </button>
                  <button
                    onClick={closeSectorModal}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Assets Tab
// ============================================================================

const AssetsTab = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sector: null,
    criticality: null,
    risk_level: null
  });
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.sector) params.append('sector', filters.sector);
      if (filters.criticality) params.append('criticality', filters.criticality);
      if (filters.risk_level) params.append('risk_level', filters.risk_level);

      const response = await axios.get(`${API_BASE}/api/ciip/assets/critical?${params}`);
      setAssets(response.data.assets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading assets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.sector || ''}
            onChange={(e) => setFilters({...filters, sector: e.target.value || null})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Sectors</option>
            <option value="energy">Energy</option>
            <option value="financial">Financial</option>
            <option value="telecommunications">Telecommunications</option>
            <option value="healthcare">Healthcare</option>
            <option value="government">Government</option>
          </select>

          <select
            value={filters.criticality || ''}
            onChange={(e) => setFilters({...filters, criticality: e.target.value || null})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Criticality Levels</option>
            <option value="crown_jewel">Crown Jewel</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>

          <select
            value={filters.risk_level || ''}
            onChange={(e) => setFilters({...filters, risk_level: e.target.value || null})}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-4">
        {assets.map((asset) => (
          <div key={asset.asset_id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    asset.criticality === 'crown_jewel' ? 'bg-purple-100 text-purple-800' :
                    asset.criticality === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {asset.criticality.replace('_', ' ').toUpperCase()}
                  </span>
                  <RiskBadge level={asset.risk_level} />
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{asset.sector.toUpperCase()}</span>
                  <span>•</span>
                  <span>{asset.ip_address}</span>
                  <span>•</span>
                  <span>{asset.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{asset.risk_score}</div>
                <div className="text-xs text-gray-500">Risk Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-900">{asset.vulnerabilities.critical}</div>
                <div className="text-xs text-red-700">Critical</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-900">{asset.vulnerabilities.high}</div>
                <div className="text-xs text-orange-700">High</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-900">{asset.vulnerabilities.medium}</div>
                <div className="text-xs text-yellow-700">Medium</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-900">{asset.vulnerabilities.low}</div>
                <div className="text-xs text-blue-700">Low</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-xl font-bold ${asset.compliance_status === 'compliant' ? 'text-green-900' : 'text-yellow-900'}`}>
                  {asset.compliance_status === 'compliant' ? '✓' : '⚠'}
                </div>
                <div className="text-xs text-gray-700">Compliance</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex space-x-4 text-xs">
                <span className={`flex items-center ${asset.controls.encryption ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.controls.encryption ? '✓' : '✗'} Encryption
                </span>
                <span className={`flex items-center ${asset.controls.mfa ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.controls.mfa ? '✓' : '✗'} MFA
                </span>
                <span className={`flex items-center ${asset.controls.segmented ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.controls.segmented ? '✓' : '✗'} Segmented
                </span>
                <span className={`flex items-center ${asset.controls.monitored ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.controls.monitored ? '✓' : '✗'} Monitored
                </span>
                <span className={`flex items-center ${asset.controls.patched ? 'text-green-600' : 'text-red-600'}`}>
                  {asset.controls.patched ? '✓' : '✗'} Patched
                </span>
              </div>
              <button
                onClick={() => setSelectedAsset(asset)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Asset Details Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedAsset.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">{selectedAsset.asset_id}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500 uppercase">{selectedAsset.sector}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Asset Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">IP Address</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedAsset.ip_address}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedAsset.location}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-sm text-purple-600">Criticality</p>
                  <p className="text-lg font-semibold text-purple-900 capitalize">{selectedAsset.criticality.replace('_', ' ')}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg text-center">
                  <p className="text-sm text-red-600">Risk Score</p>
                  <p className="text-3xl font-bold text-red-900">{selectedAsset.risk_score}</p>
                </div>
              </div>

              {/* Vulnerabilities */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Vulnerabilities</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-900">{selectedAsset.vulnerabilities.critical}</p>
                    <p className="text-sm text-red-700">Critical</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-orange-900">{selectedAsset.vulnerabilities.high}</p>
                    <p className="text-sm text-orange-700">High</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-yellow-900">{selectedAsset.vulnerabilities.medium}</p>
                    <p className="text-sm text-yellow-700">Medium</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-900">{selectedAsset.vulnerabilities.low}</p>
                    <p className="text-sm text-blue-700">Low</p>
                  </div>
                </div>
              </div>

              {/* Security Controls */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Security Controls</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(selectedAsset.controls).map(([control, enabled]) => (
                    <div key={control} className={`p-3 rounded-lg text-center ${enabled ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className={`text-2xl mb-1 ${enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {enabled ? '✓' : '✗'}
                      </div>
                      <p className={`text-sm font-medium capitalize ${enabled ? 'text-green-800' : 'text-red-800'}`}>
                        {control}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Compliance Status</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedAsset.compliance_status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedAsset.compliance_status === 'compliant' ? 'Compliant' : 'Needs Attention'}
                  </span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Risk Level</h3>
                  <RiskBadge level={selectedAsset.risk_level} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Incidents Tab
// ============================================================================

const IncidentsTab = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/ciip/incidents/critical`);
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading incidents...</div>;
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <div key={incident.incident_id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{incident.incident_id}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {incident.severity.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  incident.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {incident.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{incident.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{new Date(incident.timestamp).toLocaleString()}</span>
                <span>•</span>
                <span className="font-medium">{incident.asset_name}</span>
                <span>•</span>
                <span className="uppercase">{incident.sector}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Attack Stage</p>
              <p className="text-sm font-medium text-gray-900">{incident.attack_stage.replace('_', ' ').toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Assigned To</p>
              <p className="text-sm font-medium text-gray-900">{incident.assigned_to}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-500">MITRE ATT&CK:</span>
            {incident.mitre_techniques.map((technique) => (
              <span key={technique} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                {technique}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Response Actions:</span>
            {incident.response_actions.map((action) => (
              <span key={action} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {action}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CIIPDashboard;
