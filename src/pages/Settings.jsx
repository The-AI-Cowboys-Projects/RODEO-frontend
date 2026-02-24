import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import JiraSettings from '../components/JiraSettings'
import ServiceNowSettings from '../components/ServiceNowSettings'
import GeneralSettings from '../components/GeneralSettings'
import SecuritySettings from '../components/SecuritySettings'
import NotificationSettings from '../components/NotificationSettings'
import ThreatIntelSettings from '../components/ThreatIntelSettings'

/**
 * Settings Page
 *
 * Central page for all R-O-D-E-O configuration and settings
 */
export default function Settings() {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'threat-intel', label: 'Threat Intel', icon: '🛡️' },
    { id: 'jira', label: 'Jira', icon: '🎫' },
    { id: 'servicenow', label: 'ServiceNow', icon: '🔧' },
  ]

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'} p-6`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-[#800080]'} mb-2`}>Settings</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-[#800080]'}`}>Configure R-O-D-E-O integrations and preferences</p>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-medium transition-colors relative rounded-t-lg ${
                activeTab === tab.id
                  ? isDarkMode
                    ? 'text-white bg-slate-800 border-b-2 border-purple-500'
                    : 'text-gray-900 bg-gray-100 border-b-2 border-purple-500'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && <SettingsOverview onNavigate={setActiveTab} isDarkMode={isDarkMode} />}
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'threat-intel' && <ThreatIntelSettings />}
          {activeTab === 'jira' && <JiraSettings />}
          {activeTab === 'servicenow' && <ServiceNowSettings />}
        </div>
      </div>
    </div>
  )
}

/**
 * Settings Overview Component
 * Displays summary of all settings categories with quick access
 */
function SettingsOverview({ onNavigate, isDarkMode }) {
  const settingsCategories = [
    {
      id: 'general',
      title: 'General Settings',
      icon: '⚙️',
      description: 'System preferences, localization, and display options',
      features: ['Timezone & Language', 'Date/Time Formats', 'Auto-Refresh Settings', 'UI Preferences'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: '🔒',
      description: 'Authentication, session management, and security policies',
      features: ['Password Policies', 'Session Timeouts', 'MFA Configuration', 'Audit Logging'],
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      description: 'Alert preferences and external notification channels',
      features: ['Email Alerts', 'Slack Integration', 'Teams Integration', 'Alert Frequency'],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'threat-intel',
      title: 'Threat Intelligence',
      icon: '🛡️',
      description: 'Configure VirusTotal and MalwareBazaar for hash-based malware detection',
      features: ['VirusTotal API', 'MalwareBazaar API', 'Auto Hash Lookup', 'Detection Ratio'],
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'jira',
      title: 'Jira Integration',
      icon: '🎫',
      description: 'Atlassian Jira integration for ticket management',
      features: ['Vulnerability Tickets', 'Incident Tracking', 'Automated Workflows', 'Comment Sync'],
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'servicenow',
      title: 'ServiceNow Integration',
      icon: '🔧',
      description: 'ServiceNow ITSM integration for enterprise workflows',
      features: ['Security Incidents', 'Change Requests', 'Work Notes', 'Priority Mapping'],
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎛️</div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>R-O-D-E-O Settings</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              Configure system preferences, security policies, integrations, and notification settings
              to customize your security operations platform.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-2xl">
              🔗
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Integrations</div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl">
              ✓
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Configured Settings</div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl">
              🔔
            </div>
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Alert Channels</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsCategories.map((category) => (
          <div
            key={category.id}
            className={`${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-purple-500/50' : 'bg-gray-50 border-gray-200 hover:border-purple-400'} border rounded-lg p-5 transition-all cursor-pointer group`}
            onClick={() => onNavigate(category.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1 group-hover:text-purple-400 transition-colors`}>
                  {category.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-200 text-gray-600'} text-xs rounded`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} group-hover:text-purple-400 transition-colors`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-6`}>
        <h3 className="text-lg font-semibold text-purple-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('jira')}
            className={`p-4 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600' : 'bg-gray-100 hover:bg-purple-50/30 border-gray-200'} border rounded-lg text-left transition-colors group`}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎫</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configure Jira</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Setup ticket integration</div>
          </button>

          <button
            onClick={() => onNavigate('servicenow')}
            className={`p-4 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600' : 'bg-gray-100 hover:bg-purple-50/30 border-gray-200'} border rounded-lg text-left transition-colors group`}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔧</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Configure ServiceNow</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Setup ITSM integration</div>
          </button>

          <button
            onClick={() => onNavigate('notifications')}
            className={`p-4 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600' : 'bg-gray-100 hover:bg-purple-50/30 border-gray-200'} border rounded-lg text-left transition-colors group`}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔔</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Setup Alerts</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Configure notifications</div>
          </button>

          <button
            onClick={() => onNavigate('security')}
            className={`p-4 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600' : 'bg-gray-100 hover:bg-purple-50/30 border-gray-200'} border rounded-lg text-left transition-colors group`}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔒</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security Policies</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Manage security settings</div>
          </button>

          <button
            onClick={() => onNavigate('threat-intel')}
            className={`p-4 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 border-slate-600' : 'bg-gray-100 hover:bg-purple-50/30 border-gray-200'} border rounded-lg text-left transition-colors group`}
          >
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🛡️</div>
            <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Threat Intelligence</div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Configure VirusTotal API</div>
          </button>
        </div>
      </div>

      {/* Help & Resources */}
      <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Getting Started</h3>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
              <p>
                <strong>New to R-O-D-E-O?</strong> Start by configuring your general system preferences,
                then setup security policies to match your organization's requirements.
              </p>
              <p>
                <strong>Integrations:</strong> Connect Jira or ServiceNow to automatically create tickets
                for vulnerabilities and security incidents. Enable notifications to receive real-time alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
