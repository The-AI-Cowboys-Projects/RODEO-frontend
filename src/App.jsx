import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, Suspense, lazy } from 'react'
import { PageErrorBoundary } from './components/ErrorBoundary'
import { useInitializeToast } from './hooks/useInitializeToast'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import Login from './pages/Login'
import Layout from './components/Layout'

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'))
const RealtimeDashboard = lazy(() => import('./pages/RealtimeDashboard'))
const Samples = lazy(() => import('./pages/Samples'))
const HighRiskSamples = lazy(() => import('./pages/HighRiskSamples'))
const Vulnerabilities = lazy(() => import('./pages/Vulnerabilities'))
const CriticalVulnerabilities = lazy(() => import('./pages/CriticalVulnerabilities'))
const Patches = lazy(() => import('./pages/Patches'))
const SiemOptimization = lazy(() => import('./pages/SiemOptimization'))
const NetworkAnalytics = lazy(() => import('./components/NetworkAnalytics'))
const PolicyViewer = lazy(() => import('./pages/PolicyViewer'))
const SandboxViewer = lazy(() => import('./components/SandboxViewer'))
const SandboxDashboard = lazy(() => import('./pages/SandboxDashboard'))
const Settings = lazy(() => import('./pages/Settings'))
const CIIPDashboard = lazy(() => import('./pages/CIIPDashboard'))
const HITRUSTDashboard = lazy(() => import('./pages/HITRUSTDashboard'))
const ComplianceDashboard = lazy(() => import('./pages/ComplianceDashboard'))
const BCDRDashboard = lazy(() => import('./pages/BCDRDashboard'))
const SBOMDashboard = lazy(() => import('./pages/SBOMDashboard'))
const AutonomousDashboard = lazy(() => import('./pages/AutonomousDashboard'))
const ExploitGenerator = lazy(() => import('./pages/ExploitGenerator'))
const ApprovalWorkflow = lazy(() => import('./pages/ApprovalWorkflow'))
const PipelineDashboard = lazy(() => import('./pages/PipelineDashboard'))
const UserManagement = lazy(() => import('./pages/UserManagement'))
const EDRDashboard = lazy(() => import('./pages/EDRDashboard'))
const SecurityArsenal = lazy(() => import('./pages/SecurityArsenal'))
const PrivacyDashboard = lazy(() => import('./pages/PrivacyDashboard'))
const BugBountyDashboard = lazy(() => import('./pages/BugBountyDashboard'))
const PatchDeployment = lazy(() => import('./pages/PatchDeployment'))
const PlaybooksDashboard = lazy(() => import('./pages/PlaybooksDashboard'))
const WatchersPanel = lazy(() => import('./pages/WatchersPanel'))
const FeedbackDashboard = lazy(() => import('./pages/FeedbackDashboard'))
const KnowledgeBasePage = lazy(() => import('./pages/KnowledgeBasePage'))
const ThreatIntelPage = lazy(() => import('./pages/ThreatIntelPage'))
const LogAnomalyPage = lazy(() => import('./pages/LogAnomalyPage'))
const DashboardWithMap = lazy(() => import('./pages/DashboardWithMap'))
const DashboardImproved = lazy(() => import('./pages/DashboardImproved'))
const ICSDashboard = lazy(() => import('./pages/ICSDashboard'))
const ICSOffensive = lazy(() => import('./pages/ICSOffensive'))
const SCADAOverview = lazy(() => import('./pages/SCADAOverview'))
const SCADADeviceDetail = lazy(() => import('./pages/SCADADeviceDetail'))
const SCADAComplianceReport = lazy(() => import('./pages/SCADAComplianceReport'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}

// Wrapper component for lazy-loaded pages with error boundary
function LazyPage({ children, pageName }) {
  return (
    <PageErrorBoundary pageName={pageName}>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </PageErrorBoundary>
  )
}

// Route wrapper that checks a required permission before rendering
function PermissionRoute({ children, permission }) {
  const { hasPermission, loading } = useAuth()
  if (loading) return null
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { isDarkMode } = useTheme()

  // Initialize global toast for API client
  useInitializeToast()

  useEffect(() => {
    const token = localStorage.getItem('rodeo_token')
    setIsAuthenticated(!!token)
  }, [])

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <LazyPage pageName="Dashboard">
                <Dashboard />
              </LazyPage>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/samples"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_samples">
                <LazyPage pageName="Samples">
                  <Samples />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/high-risk-samples"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_samples">
                <LazyPage pageName="High Risk Samples">
                  <HighRiskSamples />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/vulnerabilities"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_vulnerabilities">
                <LazyPage pageName="Vulnerabilities">
                  <Vulnerabilities />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/critical-vulnerabilities"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_vulnerabilities">
                <LazyPage pageName="Critical Vulnerabilities">
                  <CriticalVulnerabilities />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patches"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_patches">
                <LazyPage pageName="Patches">
                  <Patches />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/network-analytics"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Network Analytics">
                  <NetworkAnalytics />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/realtime"
        element={
          <PrivateRoute>
            <Layout>
              <LazyPage pageName="Real-Time Dashboard">
                <RealtimeDashboard />
              </LazyPage>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/siem-optimization"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="SIEM Optimization">
                  <SiemOptimization />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/policy"
        element={
          <PrivateRoute>
            <Layout>
              <LazyPage pageName="Policy Viewer">
                <PolicyViewer />
              </LazyPage>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/sandbox"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_samples">
                <LazyPage pageName="Sandbox Dashboard">
                  <SandboxDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/sandbox/viewer/:sessionId"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_samples">
                <LazyPage pageName="Sandbox Viewer">
                  <SandboxViewer />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_reports">
                <LazyPage pageName="Compliance Dashboard">
                  <ComplianceDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ciip"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_reports">
                <LazyPage pageName="CIIP Dashboard">
                  <CIIPDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/compliance/hitrust"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_reports">
                <LazyPage pageName="HITRUST Dashboard">
                  <HITRUSTDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bcdr"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="manage_system">
                <LazyPage pageName="BC/DR Dashboard">
                  <BCDRDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="manage_system">
                <LazyPage pageName="Settings">
                  <Settings />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/sbom"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_assets">
                <LazyPage pageName="SBOM Dashboard">
                  <SBOMDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/autonomous"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="manage_system">
                <LazyPage pageName="Autonomous Dashboard">
                  <AutonomousDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/exploit-generator"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="create_exploits">
                <LazyPage pageName="Exploit Generator">
                  <ExploitGenerator />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <PrivateRoute>
            <Layout>
              <LazyPage pageName="Approval Workflow">
                <ApprovalWorkflow />
              </LazyPage>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/pipeline"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Pipeline Dashboard">
                  <PipelineDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/playbooks"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="manage_system">
                <LazyPage pageName="Playbooks Dashboard">
                  <PlaybooksDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/watchers"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="manage_system">
                <LazyPage pageName="Watchers Panel">
                  <WatchersPanel />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Feedback Dashboard">
                  <FeedbackDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/knowledge"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Knowledge Base">
                  <KnowledgeBasePage />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/threat-intel"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Threat Intelligence">
                  <ThreatIntelPage />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/log-anomaly"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Log Anomaly Detection">
                  <LogAnomalyPage />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_users">
                <LazyPage pageName="User Management">
                  <UserManagement />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/edr"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="EDR Dashboard">
                  <EDRDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/security-arsenal"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="run_scans">
                <LazyPage pageName="Security Arsenal">
                  <SecurityArsenal />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/privacy"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_assets">
                <LazyPage pageName="Privacy Dashboard">
                  <PrivacyDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bug-bounty"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="run_scans">
                <LazyPage pageName="Bug Bounty Dashboard">
                  <BugBountyDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patch-deployment"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="apply_patches">
                <LazyPage pageName="Patch Deployment">
                  <PatchDeployment />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/threat-map"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Threat Map">
                  <DashboardWithMap />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_scan_results">
                <LazyPage pageName="Advanced Analytics">
                  <DashboardImproved />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ics"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_assets">
                <LazyPage pageName="ICS Dashboard">
                  <ICSDashboard />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ics-offensive"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="create_exploits">
                <LazyPage pageName="ICS Offensive">
                  <ICSOffensive />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/scada"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_assets">
                <LazyPage pageName="SCADA Overview">
                  <SCADAOverview />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/scada/:deviceId"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_assets">
                <LazyPage pageName="SCADA Device Detail">
                  <SCADADeviceDetail />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/scada-compliance"
        element={
          <PrivateRoute>
            <Layout>
              <PermissionRoute permission="read_reports">
                <LazyPage pageName="SCADA Compliance">
                  <SCADAComplianceReport />
                </LazyPage>
              </PermissionRoute>
            </Layout>
          </PrivateRoute>
        }
      />
      {/* Catch-all route for 404 */}
      <Route
        path="*"
        element={
          <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
            <div className="text-center">
              <h1 className="text-6xl font-bold text-brand-purple mb-4">404</h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>Page not found</p>
              <a
                href="/"
                className="px-6 py-2 bg-brand-purple hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
