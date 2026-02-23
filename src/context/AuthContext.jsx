import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { users } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('rodeo_token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const userData = await users.getCurrentUser()
      setCurrentUser(userData)
      setPermissions(userData.permissions || [])
      setRoles(userData.roles || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      // If 401/403, the token is invalid — clear it so user must re-login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('rodeo_token')
        setCurrentUser(null)
        setPermissions([])
        setRoles([])
      }
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  // Check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission)
  }, [permissions])

  // Check if user has any of the given permissions
  const hasAnyPermission = useCallback((permissionList) => {
    return permissionList.some(p => permissions.includes(p))
  }, [permissions])

  // Check if user has all of the given permissions
  const hasAllPermissions = useCallback((permissionList) => {
    return permissionList.every(p => permissions.includes(p))
  }, [permissions])

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    return roles.includes(role)
  }, [roles])

  // Check if user is admin (has admin role or all permissions)
  const isAdmin = useCallback(() => {
    return hasRole('admin') || permissions.length >= 29
  }, [hasRole, permissions])

  // Refresh user data (call after role changes)
  const refreshUser = useCallback(async () => {
    setLoading(true)
    await fetchCurrentUser()
  }, [fetchCurrentUser])

  // Clear auth state (call on logout)
  const clearAuth = useCallback(() => {
    setCurrentUser(null)
    setPermissions([])
    setRoles([])
    setError(null)
  }, [])

  const value = {
    currentUser,
    permissions,
    roles,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    refreshUser,
    clearAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Permission constants for easy reference
export const Permissions = {
  // Samples
  READ_SAMPLES: 'read_samples',
  CREATE_SAMPLES: 'create_samples',
  DELETE_SAMPLES: 'delete_samples',

  // Vulnerabilities
  READ_VULNERABILITIES: 'read_vulnerabilities',
  CREATE_VULNERABILITIES: 'create_vulnerabilities',
  UPDATE_VULNERABILITIES: 'update_vulnerabilities',

  // Patches
  READ_PATCHES: 'read_patches',
  CREATE_PATCHES: 'create_patches',
  APPLY_PATCHES: 'apply_patches',

  // Exploits
  READ_EXPLOITS: 'read_exploits',
  CREATE_EXPLOITS: 'create_exploits',
  EXECUTE_EXPLOITS: 'execute_exploits',

  // Scans
  RUN_SCANS: 'run_scans',
  READ_SCAN_RESULTS: 'read_scan_results',

  // Assets
  READ_ASSETS: 'read_assets',
  MANAGE_ASSETS: 'manage_assets',

  // Reports
  READ_REPORTS: 'read_reports',
  CREATE_REPORTS: 'create_reports',
  EXPORT_REPORTS: 'export_reports',

  // Audit
  READ_AUDIT_LOGS: 'read_audit_logs',

  // Users
  READ_USERS: 'read_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',

  // Roles
  MANAGE_ROLES: 'manage_roles',

  // System
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_INTEGRATIONS: 'manage_integrations',

  // Plugins
  MANAGE_PLUGINS: 'manage_plugins',
  EXECUTE_PLUGINS: 'execute_plugins',
}

export default AuthContext
