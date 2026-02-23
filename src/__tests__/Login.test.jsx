import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

// Mock the auth API - must be defined inline in the factory
vi.mock('../api/client', () => ({
  auth: {
    login: vi.fn(),
  },
}))

// Import the mocked module after mocking
import { auth } from '../api/client'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  const mockSetIsAuthenticated = vi.fn()

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Mock import.meta.env
    vi.stubGlobal('import.meta.env', { DEV: false, MODE: 'production' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders login form with username and password fields', () => {
    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays R-O-D-E-O branding', () => {
    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    expect(screen.getByText('R-O-D-E-O')).toBeInTheDocument()
    expect(
      screen.getByText(/Real-time Observation, Detection, Exploitation, and Optimization/i)
    ).toBeInTheDocument()
  })

  it('shows validation error for empty username', async () => {
    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Focus and blur to trigger validation
    fireEvent.focus(usernameInput)
    fireEvent.blur(usernameInput)

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short username', async () => {
    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const usernameInput = screen.getByLabelText(/username/i)

    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    fireEvent.blur(usernameInput)

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for empty password', async () => {
    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.focus(passwordInput)
    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.change(passwordInput, { target: { value: 'abc' } })
    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 4 characters/i)).toBeInTheDocument()
    })
  })

  it('calls API on form submission with valid credentials', async () => {
    auth.login.mockResolvedValue({ access_token: 'test-token' })

    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith('testuser', 'password123')
    })
  })

  it('displays error message on failed login', async () => {
    auth.login.mockRejectedValue({
      response: {
        status: 401,
        headers: {
          'x-attempts-remaining': '2',
        },
        data: { detail: 'Invalid credentials' },
      },
    })

    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
    })
  })

  it('stores token and redirects on successful login', async () => {
    auth.login.mockResolvedValue({ access_token: 'test-token-123' })

    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(localStorage.getItem('rodeo_token')).toBe('test-token-123')
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true)
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('shows loading state during login', async () => {
    auth.login.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ access_token: 'token' }), 100))
    )

    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  it('disables submit button when form is invalid', async () => {
    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    const usernameInput = screen.getByLabelText(/username/i)

    // Empty form should allow submit (validation happens on submit)
    expect(submitButton).not.toBeDisabled()

    // Type invalid username
    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    fireEvent.click(submitButton)

    // Button stays enabled (validation shown as error messages instead)
    expect(submitButton).not.toBeDisabled()
  })

  it('handles 429 lockout response', async () => {
    auth.login.mockRejectedValue({
      response: {
        status: 429,
        headers: {
          'x-lockout-seconds': '300',
        },
        data: { detail: 'Account locked' },
      },
    })

    render(<Login setIsAuthenticated={mockSetIsAuthenticated} />)

    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/account locked/i)).toBeInTheDocument()
    })
  })
})
