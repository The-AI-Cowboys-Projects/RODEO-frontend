import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useAuth, Permissions } from '../context/AuthContext'
import { users } from '../api/client'
import { Navigate } from 'react-router-dom'

// Role badge colors
const ROLE_COLORS = {
  admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  general_user: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  analyst: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  operator: 'bg-green-500/20 text-green-400 border-green-500/30',
  auditor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export default function UserManagement() {
  const { isDarkMode } = useTheme()
  const { hasPermission, loading: authLoading } = useAuth()

  const [userList, setUserList] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [permissionsList, setPermissionsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal states
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showAssignRole, setShowAssignRole] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Form states
  const defaultNewUser = { username: '', email: '', password: '', full_name: '', roles: ['general_user'] }
  const [newUser, setNewUser] = useState({ ...defaultNewUser })

  // Check permissions
  const canReadUsers = hasPermission(Permissions.READ_USERS)
  const canCreateUsers = hasPermission(Permissions.CREATE_USERS)
  const canUpdateUsers = hasPermission(Permissions.UPDATE_USERS)
  const canDeleteUsers = hasPermission(Permissions.DELETE_USERS)
  const canManageRoles = hasPermission(Permissions.MANAGE_ROLES)

  useEffect(() => {
    if (canReadUsers) {
      fetchData()
    }
  }, [canReadUsers])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersData, rolesData, permsData] = await Promise.all([
        users.list(),
        users.listRoles(),
        users.listPermissions(),
      ])
      setUserList(usersData.users || [])
      setRolesList(rolesData.roles || [])
      setPermissionsList(permsData.permissions || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError(err.response?.data?.detail || 'Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await users.create(newUser)
      setShowCreateUser(false)
      setNewUser({ ...defaultNewUser })
      fetchData()
    } catch (err) {
      console.error('Failed to create user:', err)
      const detail = err.response?.data?.error?.message || err.response?.data?.detail || err.message || 'Failed to create user'
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    }
  }

  const closeCreateModal = () => {
    setShowCreateUser(false)
    setNewUser({ ...defaultNewUser })
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await users.delete(userId)
      fetchData()
    } catch (err) {
      console.error('Failed to delete user:', err)
      setError(err.response?.data?.detail || 'Failed to delete user')
    }
  }

  const handleAssignRole = async (userId, roleName) => {
    try {
      await users.assignRole(userId, roleName)
      fetchData()
      if (selectedUser?.id === userId) {
        const updated = await users.getById(userId)
        setSelectedUser(updated)
      }
    } catch (err) {
      console.error('Failed to assign role:', err)
      setError(err.response?.data?.detail || 'Failed to assign role')
    }
  }

  const handleRevokeRole = async (userId, roleName) => {
    try {
      await users.revokeRole(userId, roleName)
      fetchData()
      if (selectedUser?.id === userId) {
        const updated = await users.getById(userId)
        setSelectedUser(updated)
      }
    } catch (err) {
      console.error('Failed to revoke role:', err)
      setError(err.response?.data?.detail || 'Failed to revoke role')
    }
  }

  const openUserDetails = async (user) => {
    try {
      const userData = await users.getById(user.id)
      setSelectedUser(userData)
      setShowUserDetails(true)
    } catch (err) {
      console.error('Failed to fetch user details:', err)
    }
  }

  // If auth is loading, show loading state
  if (authLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  // If user doesn't have permission, redirect to dashboard
  if (!canReadUsers) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-primary-400' : 'text-[#800080]'} mb-2`}>
          User Management
        </h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">{userList.length}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">{rolesList.length}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Available Roles</div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold">{permissionsList.length}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Permissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          {canCreateUsers && (
            <button
              onClick={() => setShowCreateUser(true)}
              className="px-4 py-2 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-brand-purple/30 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create User
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        </div>
      ) : (
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>User</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Email</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Roles</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Created</th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
              {userList.map((user) => (
                <tr key={user.id} className={`${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{user.username}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.full_name || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{user.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.length > 0 ? (
                        user.roles.map((role) => (
                          <span
                            key={role}
                            className={`px-2 py-1 text-xs font-medium rounded border ${ROLE_COLORS[role] || ROLE_COLORS.viewer}`}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No roles</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openUserDetails(user)}
                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'} transition-colors`}
                        title="View Details"
                      >
                        <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {canUpdateUsers && (
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowAssignRole(true)
                          }}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-gray-100'} transition-colors`}
                          title="Manage Roles"
                        >
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </button>
                      )}
                      {canDeleteUsers && user.username !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-red-500/20' : 'hover:bg-red-50'} transition-colors`}
                          title="Delete User"
                        >
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {userList.length === 0 && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No users found
            </div>
          )}
        </div>
      )}

      {/* Roles Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Available Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolesList.map((role) => (
            <div
              key={role.id}
              className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 text-sm font-medium rounded border ${ROLE_COLORS[role.name] || ROLE_COLORS.viewer}`}>
                  {role.name}
                </span>
                {role.is_system && (
                  <span className="text-xs text-gray-500">System</span>
                )}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                {role.description || 'No description'}
              </p>
              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {role.permission_count} permissions
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeCreateModal}>
          <div
            className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl p-6 w-full max-w-md`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-brand-purple focus:border-transparent`}
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-brand-purple focus:border-transparent`}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-brand-purple focus:border-transparent`}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-brand-purple focus:border-transparent`}
                    placeholder="Min 8 characters"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Role *
                  </label>
                  <select
                    value={newUser.roles[0] || 'general_user'}
                    onChange={(e) => setNewUser({ ...newUser, roles: [e.target.value] })}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-brand-purple focus:border-transparent`}
                  >
                    {rolesList.map((role) => (
                      <option key={role.name} value={role.name}>
                        {role.name} — {role.description || `${role.permission_count} permissions`}
                      </option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Additional roles can be assigned after creation
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-brand-purple/30 transition-all"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignRole && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl p-6 w-full max-w-md`}>
            <h3 className="text-xl font-semibold mb-4">
              Manage Roles for {selectedUser.username}
            </h3>
            <div className="space-y-3">
              {rolesList.map((role) => {
                const hasRole = selectedUser.roles?.includes(role.name)
                return (
                  <div
                    key={role.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hasRole
                        ? isDarkMode ? 'bg-brand-purple/20 border-brand-purple/30' : 'bg-purple-50 border-purple-200'
                        : isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-gray-400">{role.permission_count} permissions</div>
                    </div>
                    {hasRole ? (
                      <button
                        onClick={() => handleRevokeRole(selectedUser.id, role.name)}
                        className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignRole(selectedUser.id, role.name)}
                        className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowAssignRole(false)
                  setSelectedUser(null)
                }}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">User Details</h3>
              <button
                onClick={() => {
                  setShowUserDetails(false)
                  setSelectedUser(null)
                }}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {selectedUser.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-xl font-semibold">{selectedUser.username}</div>
                <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedUser.email}</div>
                {selectedUser.full_name && (
                  <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{selectedUser.full_name}</div>
                )}
              </div>
            </div>

            {/* Roles */}
            <div className="mb-6">
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase mb-2`}>Roles</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.roles?.length > 0 ? (
                  selectedUser.roles.map((role) => (
                    <span
                      key={role}
                      className={`px-3 py-1.5 text-sm font-medium rounded border ${ROLE_COLORS[role] || ROLE_COLORS.viewer}`}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No roles assigned</span>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} uppercase mb-2`}>
                Permissions ({selectedUser.permissions?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.permissions?.length > 0 ? (
                  selectedUser.permissions.map((perm) => (
                    <span
                      key={perm}
                      className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No permissions</span>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <span className="ml-2">{selectedUser.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2">
                    {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
