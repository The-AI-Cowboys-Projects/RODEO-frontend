import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'

// Mock useTheme
const mockToggleTheme = vi.fn()
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    isDarkMode: true,
    toggleTheme: mockToggleTheme,
  }),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Layout Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders sidebar navigation', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const sidebar = screen.getByRole('navigation', { name: /main navigation/i })
    expect(sidebar).toBeInTheDocument()
  })

  it('renders logo/branding', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const logo = screen.getByAltText(/R-O-D-E-O Security Platform/i)
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', '/rodeo-logo.png')
  })

  it('renders expected navigation links', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    // Check for key navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Real-Time Operations')).toBeInTheDocument()
    expect(screen.getByText('Autonomous Mode')).toBeInTheDocument()
    expect(screen.getByText('Samples')).toBeInTheDocument()
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument()
    expect(screen.getByText('Patches')).toBeInTheDocument()
    expect(screen.getByText('Malware Sandbox')).toBeInTheDocument()
    expect(screen.getByText('Exploit Generator')).toBeInTheDocument()
  })

  it('highlights active link based on current path', () => {
    render(
      <MemoryRouter initialEntries={['/samples']}>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const samplesLink = screen.getByRole('link', { name: /Malware samples/i })
    expect(samplesLink).toHaveAttribute('aria-current', 'page')
  })

  it('renders children content area', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div data-testid="child-content">Test Content</div>
        </Layout>
      </MemoryRouter>
    )

    const mainContent = screen.getByRole('main')
    const childContent = within(mainContent).getByTestId('child-content')
    expect(childContent).toBeInTheDocument()
    expect(childContent).toHaveTextContent('Test Content')
  })

  it('renders logout button', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const logoutButton = screen.getByRole('button', { name: /log out of r-o-d-e-o/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('logout button clears token and navigates to login', () => {
    localStorage.setItem('rodeo_token', 'test-token')

    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const logoutButton = screen.getByRole('button', { name: /log out of r-o-d-e-o/i })
    fireEvent.click(logoutButton)

    expect(localStorage.getItem('rodeo_token')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('renders theme toggle button', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const themeButton = screen.getByRole('button', { name: /switch to light mode/i })
    expect(themeButton).toBeInTheDocument()
  })

  it('theme toggle button calls toggleTheme', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const themeButton = screen.getByRole('button', { name: /switch to light mode/i })
    fireEvent.click(themeButton)

    expect(mockToggleTheme).toHaveBeenCalled()
  })

  it('renders settings link', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const settingsLink = screen.getByRole('link', { name: /^settings$/i })
    expect(settingsLink).toBeInTheDocument()
    expect(settingsLink).toHaveAttribute('href', '/settings')
  })

  it('renders skip to main content link for accessibility', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </MemoryRouter>
    )

    const skipLink = screen.getByText('Skip to main content')
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')
  })
})
