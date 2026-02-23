import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../api/client'
import { useAuth } from '../context/AuthContext'

// Check if running in development mode
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

// Validation helpers
const validateUsername = (value) => {
  if (!value || !value.trim()) return 'Username is required'
  if (value.length < 3) return 'Username must be at least 3 characters'
  return null
}

const validatePassword = (value) => {
  if (!value) return 'Password is required'
  if (value.length < 4) return 'Password must be at least 4 characters'
  return null
}

export default function Login({ setIsAuthenticated }) {
  const { refreshUser } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)
  const [showDevInfo, setShowDevInfo] = useState(false)

  // Form validation state
  const [touched, setTouched] = useState({ username: false, password: false })
  const [fieldErrors, setFieldErrors] = useState({ username: null, password: null })

  const navigate = useNavigate()

  // Validate fields on change
  const validateField = useCallback((field, value) => {
    if (field === 'username') {
      return validateUsername(value)
    }
    if (field === 'password') {
      return validatePassword(value)
    }
    return null
  }, [])

  // Update field errors when values change
  useEffect(() => {
    if (touched.username) {
      setFieldErrors(prev => ({ ...prev, username: validateField('username', username) }))
    }
  }, [username, touched.username, validateField])

  useEffect(() => {
    if (touched.password) {
      setFieldErrors(prev => ({ ...prev, password: validateField('password', password) }))
    }
  }, [password, touched.password, validateField])

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            setIsLocked(false)
            setError('')
            setAttemptsRemaining(3)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [lockoutSeconds])

  const formatLockoutTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields before submit
    const usernameError = validateUsername(username)
    const passwordError = validatePassword(password)

    setTouched({ username: true, password: true })
    setFieldErrors({ username: usernameError, password: passwordError })

    if (usernameError || passwordError) {
      return
    }

    setError('')
    setLoading(true)

    try {
      const data = await auth.login(username, password)
      localStorage.setItem('rodeo_token', data.access_token)
      await refreshUser()
      setIsAuthenticated(true)
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)

      // Development mode fallback - only when backend is unavailable AND in dev mode
      if (!err.response || err.code === 'ERR_NETWORK') {
        if (isDevelopment) {
          // Only allow dev fallback in development mode
          if (username === 'admin' && password === 'rodeo123') {
            console.warn('[DEV MODE] Using development authentication fallback')
            localStorage.setItem('rodeo_token', 'dev_mock_token_' + Date.now())
            await refreshUser()
            setIsAuthenticated(true)
            navigate('/')
            return
          } else {
            setError('Backend not available. Development mode active.')
            setShowDevInfo(true)
            setLoading(false)
            return
          }
        } else {
          // Production mode - don't reveal dev credentials
          setError('Unable to connect to authentication server. Please try again later.')
          setLoading(false)
          return
        }
      }

      // Check if it's a lockout (429 status)
      if (err.response?.status === 429) {
        const lockoutSecondsHeader = err.response.headers['x-lockout-seconds']
        const lockoutSecondsFromError = parseInt(lockoutSecondsHeader) || 1800 // default 30 min

        setIsLocked(true)
        setLockoutSeconds(lockoutSecondsFromError)
        setError(err.response?.data?.detail || 'Account locked due to too many failed attempts')
      } else if (err.response?.status === 401) {
        // Failed attempt but not locked yet
        const attemptsRemainingHeader = err.response.headers['x-attempts-remaining']
        const remaining = parseInt(attemptsRemainingHeader) || 0

        setAttemptsRemaining(remaining)

        if (remaining > 0) {
          setError(`Invalid username or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`)
        } else {
          setError(err.response?.data?.detail || 'Invalid username or password')
        }
      } else {
        setError('Invalid username or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Ambient glow behind the card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.06) 50%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-md w-full space-y-8 relative">
        {/* Card with gradient top border */}
        <div
          className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden"
          style={{ border: '1px solid rgba(148,163,184,0.12)' }}
        >
          {/* Gradient top border strip */}
          <div
            style={{
              height: '3px',
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899)',
            }}
          />

          <div className="px-8 pt-8 pb-8">
            {/* Logo + branding */}
            <div className="flex flex-col items-center mb-8">
              <img
                src="/rodeo-logo.png"
                alt="RODEO"
                className="h-16 w-auto mb-4 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling.style.display = 'block'
                }}
              />
              {/* Fallback wordmark — hidden unless image fails to load */}
              <span
                className="text-3xl font-bold tracking-widest text-purple-400 mb-4"
                style={{ display: 'none', letterSpacing: '0.3em' }}
              >
                RODEO
              </span>
              <p
                className="text-center text-xs text-gray-500 tracking-tight"
                style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Fira Code", monospace', letterSpacing: '0.01em' }}
              >
                Real-time Observation, Detection, Exploitation, and Optimization
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      className={`appearance-none rounded-lg relative block w-full px-3 py-2.5 border placeholder-gray-500 text-white bg-slate-700 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                        touched.username && fieldErrors.username
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                          : touched.username && !fieldErrors.username && username
                            ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500'
                            : 'border-gray-600 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={() => handleBlur('username')}
                      aria-invalid={touched.username && fieldErrors.username ? 'true' : 'false'}
                      aria-describedby={touched.username && fieldErrors.username ? 'username-error' : undefined}
                    />
                    {/* Validation icon */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {touched.username && fieldErrors.username ? (
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : touched.username && !fieldErrors.username && username ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </div>
                  </div>
                  {/* Error message */}
                  {touched.username && fieldErrors.username && (
                    <p id="username-error" className="mt-1.5 text-sm text-red-400 flex items-center gap-1" role="alert">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      className={`appearance-none rounded-lg relative block w-full px-3 py-2.5 border placeholder-gray-500 text-white bg-slate-700 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors ${
                        touched.password && fieldErrors.password
                          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                          : touched.password && !fieldErrors.password && password
                            ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500'
                            : 'border-gray-600 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur('password')}
                      aria-invalid={touched.password && fieldErrors.password ? 'true' : 'false'}
                      aria-describedby={touched.password && fieldErrors.password ? 'password-error' : undefined}
                    />
                    {/* Validation icon */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {touched.password && fieldErrors.password ? (
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : touched.password && !fieldErrors.password && password ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </div>
                  </div>
                  {/* Error message */}
                  {touched.password && fieldErrors.password && (
                    <p id="password-error" className="mt-1.5 text-sm text-red-400 flex items-center gap-1" role="alert">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className={`rounded-md p-4 ${isLocked ? 'bg-orange-900 bg-opacity-50' : 'bg-red-900 bg-opacity-50'}`}>
                  <div className="flex items-center">
                    {isLocked && (
                      <svg className="w-5 h-5 text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    <p className={`text-sm ${isLocked ? 'text-orange-200' : 'text-red-200'}`}>{error}</p>
                  </div>
                  {isLocked && lockoutSeconds > 0 && (
                    <div className="mt-3 p-3 bg-slate-900 bg-opacity-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Time remaining:</span>
                        <span className="text-lg font-mono font-bold text-orange-400">
                          {formatLockoutTime(lockoutSeconds)}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${(lockoutSeconds / 1800) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isLocked && attemptsRemaining < 3 && (
                <div className="rounded-md bg-yellow-900 bg-opacity-30 p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-yellow-200">
                      Warning: {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading || isLocked}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: loading || isLocked
                      ? undefined
                      : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 60%, #a855f7 100%)',
                    backgroundColor: loading || isLocked ? '#6d28d9' : undefined,
                    boxShadow: loading || isLocked ? 'none' : '0 4px 14px rgba(139,92,246,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !isLocked) {
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(139,92,246,0.5)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,92,246,0.35)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {isLocked && lockoutSeconds > 0 ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked ({formatLockoutTime(lockoutSeconds)})
                    </>
                  ) : loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              {/* Only show dev credentials in development mode */}
              {isDevelopment && showDevInfo && (
                <div className="mt-4 p-3 bg-slate-700/50 rounded-md border border-slate-600">
                  <p className="text-xs text-center text-amber-400 font-medium mb-1">
                    Development Mode
                  </p>
                  <p className="text-xs text-center text-gray-400">
                    Demo credentials: admin / rodeo123
                  </p>
                </div>
              )}
              {isDevelopment && !showDevInfo && (
                <p className="text-xs text-center text-gray-600 mt-2">
                  Development build
                </p>
              )}
            </form>

            {/* Version / copyright */}
            <p className="mt-8 text-center text-xs text-slate-600 select-none">
              v2.0 &mdash; AI Cowboys
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
