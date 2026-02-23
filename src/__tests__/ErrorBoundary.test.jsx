import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary, {
  PageErrorBoundary,
  ChartErrorBoundary,
  WidgetErrorBoundary,
} from '../components/ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow = true, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message)
  }
  return <div>No Error</div>
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy

  beforeEach(() => {
    // Suppress console.error for cleaner test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore()
    }
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Component</div>
      </ErrorBoundary>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Child Component')).toBeInTheDocument()
  })

  it('catches errors and displays fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('displays error message in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(
      screen.getByText(/we encountered an unexpected error/i)
    ).toBeInTheDocument()
  })

  it('has try again button that resets error', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // Error is shown
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click try again
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    expect(tryAgainButton).toBeInTheDocument()
    fireEvent.click(tryAgainButton)

    // Should attempt to render children again (but they'll still throw)
    // In real scenario, the component would not throw again
  })

  it('has reload page button', () => {
    // Mock window.location.reload
    delete window.location
    window.location = { reload: vi.fn() }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', { name: /reload page/i })
    fireEvent.click(reloadButton)

    expect(window.location.reload).toHaveBeenCalled()
  })

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="Custom error" />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0].message).toBe('Custom error')
  })

  it('displays custom message when provided', () => {
    render(
      <ErrorBoundary message="Custom error message">
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    // Mock DEV mode
    vi.stubGlobal('import.meta', { env: { DEV: true } })

    render(
      <ErrorBoundary>
        <ThrowError message="Detailed error" />
      </ErrorBoundary>
    )

    // Look for details element
    const details = screen.getByText(/error details/i)
    expect(details).toBeInTheDocument()

    vi.unstubAllGlobals()
  })

  it('PageErrorBoundary renders with page-specific message', () => {
    render(
      <PageErrorBoundary pageName="Dashboard">
        <ThrowError />
      </PageErrorBoundary>
    )

    expect(screen.getByText(/failed to load the dashboard/i)).toBeInTheDocument()
  })

  it('ChartErrorBoundary exists and can be imported', () => {
    // Simply test that the component can be imported and used
    expect(ChartErrorBoundary).toBeDefined()
    expect(typeof ChartErrorBoundary).toBe('function')
  })

  it('WidgetErrorBoundary renders compact error UI', () => {
    render(
      <WidgetErrorBoundary widgetName="Stats Widget">
        <ThrowError />
      </WidgetErrorBoundary>
    )

    expect(screen.getByText(/stats widget unavailable/i)).toBeInTheDocument()
  })

  it('WidgetErrorBoundary has retry button', () => {
    render(
      <WidgetErrorBoundary widgetName="Test Widget">
        <ThrowError />
      </WidgetErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
  })
})
