import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import {
  DashboardIcon,
  BoltIcon,
  RobotIcon,
  RocketIcon,
  PolicyIcon,
  SandboxIcon,
  PackageIcon,
  ExploitIcon,
  OptimizeIcon,
  VirusIcon,
  UnlockIcon,
  PatchIcon,
  NetworkIcon,
  ClipboardIcon,
  ShieldIcon,
  EDRIcon,
  ArsenalIcon,
  PrivacyIcon,
  DeployIcon,
  BugBountyIcon,
  PlaybookIcon,
  WatcherIcon,
  FeedbackIcon,
  KnowledgeIcon,
  ThreatIntelIcon,
  LogAnomalyIcon,
  UserIcon,
  BCDRIcon,
  ICSIcon,
  GlobeIcon
} from './icons'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useTheme()
  const { permissions, loading: authLoading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Fixed icon color scheme: #800080, #C38BBF, #000000, white
  const iconPrimary = '#800080'
  const iconSecondary = '#C38BBF'
  const iconDetail = isDarkMode ? 'white' : '#000000'
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSidebarOpen])

  const handleLogout = () => {
    localStorage.removeItem('rodeo_token')
    navigate('/login')
  }

  // Each nav item can have a `permission` (single string) or `permissions` (array, any match = visible).
  // Items without permission fields are visible to all authenticated users.
  const allNavItems = [
    { path: '/', label: 'Dashboard', Icon: DashboardIcon, ariaLabel: 'Dashboard - Main overview' },
    { path: '/realtime', label: 'Real-Time Operations', Icon: BoltIcon, ariaLabel: 'Real-time security operations' },
    { path: '/autonomous', label: 'Autonomous Mode', Icon: RobotIcon, ariaLabel: 'Autonomous security mode', permission: 'manage_system' },
    { path: '/approvals', label: 'Approvals', Icon: ShieldIcon, ariaLabel: 'Action approval workflow' },
    { path: '/pipeline', label: 'Pipeline', Icon: RocketIcon, ariaLabel: 'Autonomous pipeline dashboard', permission: 'read_scan_results' },
    { path: '/playbooks', label: 'Playbooks', Icon: PlaybookIcon, ariaLabel: 'Response playbook management', permission: 'manage_system' },
    { path: '/watchers', label: 'Watchers', Icon: WatcherIcon, ariaLabel: 'Background watcher controls', permission: 'manage_system' },
    { path: '/feedback', label: 'Feedback Loop', Icon: FeedbackIcon, ariaLabel: 'Action effectiveness feedback', permission: 'read_scan_results' },
    { path: '/knowledge', label: 'Knowledge Base', Icon: KnowledgeIcon, ariaLabel: 'Orchestrator knowledge base', permission: 'read_scan_results' },
    { path: '/threat-intel', label: 'Threat Intel', Icon: ThreatIntelIcon, ariaLabel: 'Threat intelligence lookups', permission: 'read_scan_results' },
    { path: '/log-anomaly', label: 'Log Anomaly', Icon: LogAnomalyIcon, ariaLabel: 'Log anomaly detection and ML training', permission: 'read_scan_results' },
    { path: '/threat-map', label: 'Threat Map', Icon: GlobeIcon, ariaLabel: 'Geographic threat intelligence map', permission: 'read_scan_results' },
    { path: '/analytics', label: 'Advanced Analytics', Icon: DashboardIcon, ariaLabel: 'Advanced analytics dashboard', permission: 'read_scan_results' },
    { path: '/edr', label: 'EDR/XDR', Icon: EDRIcon, ariaLabel: 'Endpoint detection and response dashboard', permission: 'read_scan_results' },
    { path: '/security-arsenal', label: 'Security Arsenal', Icon: ArsenalIcon, ariaLabel: 'Security tools and scanners', permission: 'run_scans' },
    { path: '/policy', label: 'Security Policies', Icon: PolicyIcon, ariaLabel: 'Security policies viewer' },
    { path: '/sandbox', label: 'Malware Sandbox', Icon: SandboxIcon, ariaLabel: 'Malware analysis sandbox', permission: 'read_samples' },
    { path: '/sbom', label: 'SBOM', Icon: PackageIcon, ariaLabel: 'Software Bill of Materials', permission: 'read_assets' },
    { path: '/exploit-generator', label: 'Exploit Generator', Icon: ExploitIcon, ariaLabel: 'Exploit generation tool', permission: 'create_exploits' },
    { path: '/siem-optimization', label: 'SIEM Optimization', Icon: OptimizeIcon, ariaLabel: 'SIEM optimization dashboard', permission: 'read_scan_results' },
    { path: '/samples', label: 'Samples', Icon: VirusIcon, ariaLabel: 'Malware samples', permission: 'read_samples' },
    { path: '/vulnerabilities', label: 'Vulnerabilities', Icon: UnlockIcon, ariaLabel: 'Vulnerability management', permission: 'read_vulnerabilities' },
    { path: '/patches', label: 'Patches', Icon: PatchIcon, ariaLabel: 'Patch management', permission: 'read_patches' },
    { path: '/patch-deployment', label: 'Patch Deployment', Icon: DeployIcon, ariaLabel: 'Intelligent patch deployment', permission: 'apply_patches' },
    { path: '/network-analytics', label: 'Network Analytics', Icon: NetworkIcon, ariaLabel: 'Network analytics dashboard', permission: 'read_scan_results' },
    { path: '/privacy', label: 'Privacy & Data Protection', Icon: PrivacyIcon, ariaLabel: 'PII detection and data protection', permission: 'read_assets' },
    { path: '/ics', label: 'ICS/SCADA', Icon: ICSIcon, ariaLabel: 'Industrial control systems dashboard', permission: 'read_assets' },
    { path: '/scada', label: 'SCADA Devices', Icon: ICSIcon, ariaLabel: 'SCADA device overview', permission: 'read_assets' },
    { path: '/scada-compliance', label: 'SCADA Compliance', Icon: ClipboardIcon, ariaLabel: 'SCADA compliance report', permission: 'read_reports' },
    { path: '/ics-offensive', label: 'ICS Offensive', Icon: ExploitIcon, ariaLabel: 'ICS offensive operations', permission: 'create_exploits' },
    { path: '/compliance', label: 'Compliance', Icon: ClipboardIcon, ariaLabel: 'Compliance dashboard', permission: 'read_reports' },
    { path: '/bcdr', label: 'BC/DR Testing', Icon: BCDRIcon, ariaLabel: 'Business continuity and disaster recovery', permission: 'manage_system' },
    { path: '/bug-bounty', label: 'Bug Bounty', Icon: BugBountyIcon, ariaLabel: 'Bug bounty hunter dashboard', permission: 'run_scans' },
    { path: '/users', label: 'User Management', Icon: UserIcon, ariaLabel: 'User and role management', permission: 'read_users' },
  ]

  // Filter nav items based on user permissions
  // While auth is loading, show all items to avoid flash of missing nav
  const navItems = useMemo(() => {
    if (authLoading) return allNavItems
    return allNavItems.filter(item => {
      if (!item.permission && !item.permissions) return true
      if (item.permission) return permissions.includes(item.permission)
      if (item.permissions) return item.permissions.some(p => permissions.includes(p))
      return true
    })
  }, [permissions, authLoading])

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          isDarkMode ? 'bg-slate-800 text-white' : 'bg-white/90 backdrop-blur text-gray-900 border border-gray-200/60'
        } shadow-lg`}
        aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isSidebarOpen}
        aria-controls="sidebar-nav"
      >
        {isSidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Backdrop for mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-nav"
        role="navigation"
        aria-label="Main navigation"
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          w-64 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/80 backdrop-blur-xl border-gray-200/60 shadow-lg shadow-purple-100/20'}
          border-r flex flex-col transition-transform duration-300 ease-in-out
        `}
      >
        <div className="p-4">
          <img
            src="/rodeo-logo.png"
            alt="R-O-D-E-O Security Platform"
            className="w-full max-w-[200px] mx-auto"
          />
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto" aria-label="Primary">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    aria-label={item.ariaLabel}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center px-6 py-3 transition-colors ${
                      isDarkMode
                        ? `text-gray-300 hover:bg-slate-700 hover:text-white ${
                            isActive ? 'bg-slate-700 text-white border-l-4 border-brand-purple' : ''
                          }`
                        : `text-gray-600 hover:bg-purple-50/60 hover:text-purple-900 ${
                            isActive ? 'bg-purple-50 text-purple-700 border-l-4 border-brand-purple font-medium' : ''
                          }`
                    }`}
                  >
                    <item.Icon className="w-5 h-5 mr-3 flex-shrink-0" primary={iconPrimary} secondary={iconSecondary} detail={iconDetail} aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200/60'} space-y-2`}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded transition-colors ${
              isDarkMode
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
                : 'bg-purple-50/60 text-gray-700 hover:bg-purple-100/80 hover:text-purple-900'
            }`}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
            )}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          {(authLoading || permissions.includes('manage_system')) && (
            <Link
              to="/settings"
              aria-label="Settings"
              aria-current={location.pathname === '/settings' ? 'page' : undefined}
              className={`flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded transition-colors ${
                location.pathname === '/settings'
                  ? 'bg-brand-purple text-white'
                  : isDarkMode
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
                    : 'bg-purple-50/60 text-gray-700 hover:bg-purple-100/80 hover:text-purple-900'
              }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </Link>
          )}

          <button
            onClick={handleLogout}
            className={`w-full px-4 py-2 text-sm rounded transition-colors border ${
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-red-600/20 border-red-600/30'
                : 'text-red-500 hover:bg-red-50/80 hover:text-red-700 border-red-200'
            }`}
            aria-label="Log out of R-O-D-E-O"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 overflow-auto"
        role="main"
        tabIndex={-1}
      >
        <div className={`p-4 sm:p-6 lg:p-8 ${isMobile ? 'pt-16' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  )
}
