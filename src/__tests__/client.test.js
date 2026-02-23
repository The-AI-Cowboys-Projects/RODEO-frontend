import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
    get: vi.fn(),
    post: vi.fn(),
  },
}))

// Mock toast functions
vi.mock('../components/ui/Toast', () => ({
  showErrorToast: vi.fn(),
  showWarningToast: vi.fn(),
  showInfoToast: vi.fn(),
}))

describe('API Client', () => {
  let apiClient
  let requestInterceptor
  let responseInterceptor
  let mockAxiosInstance

  beforeEach(async () => {
    vi.clearAllMocks()
    localStorage.clear()

    // Setup mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }

    axios.create.mockReturnValue(mockAxiosInstance)

    // Import client after mocks are set up
    const clientModule = await import('../api/client.js')
    apiClient = clientModule.default || clientModule.apiClient

    // Capture interceptors
    const requestInterceptorCall = mockAxiosInstance.interceptors.request.use.mock.calls[0]
    const responseInterceptorCall = mockAxiosInstance.interceptors.response.use.mock.calls[0]

    requestInterceptor = requestInterceptorCall ? requestInterceptorCall[0] : null
    responseInterceptor = {
      success: responseInterceptorCall ? responseInterceptorCall[0] : null,
      error: responseInterceptorCall ? responseInterceptorCall[1] : null,
    }
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('creates axios instance with correct baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      })
    )
  })

  it('request interceptor adds JWT token from localStorage', async () => {
    localStorage.setItem('rodeo_token', 'test-jwt-token')

    const config = { headers: {}, method: 'get' }
    const modifiedConfig = await requestInterceptor(config)

    expect(modifiedConfig.headers.Authorization).toBe('Bearer test-jwt-token')
  })

  it('request interceptor does not add Authorization header when no token', async () => {
    const config = { headers: {}, method: 'get' }
    const modifiedConfig = await requestInterceptor(config)

    expect(modifiedConfig.headers.Authorization).toBeUndefined()
  })

  it('request interceptor adds CSRF token for POST requests', async () => {
    // Mock CSRF token fetch
    axios.get.mockResolvedValue({
      data: { csrf_token: 'test-csrf-token' },
    })

    const config = { headers: {}, method: 'post' }
    const modifiedConfig = await requestInterceptor(config)

    expect(modifiedConfig.headers['X-CSRF-Token']).toBe('test-csrf-token')
  })

  it('request interceptor adds CSRF token for PUT requests', async () => {
    axios.get.mockResolvedValue({
      data: { csrf_token: 'test-csrf-token' },
    })

    const config = { headers: {}, method: 'put' }
    const modifiedConfig = await requestInterceptor(config)

    expect(modifiedConfig.headers['X-CSRF-Token']).toBe('test-csrf-token')
  })

  it('request interceptor adds CSRF token for DELETE requests', async () => {
    axios.get.mockResolvedValue({
      data: { csrf_token: 'test-csrf-token' },
    })

    const config = { headers: {}, method: 'delete' }
    const modifiedConfig = await requestInterceptor(config)

    expect(modifiedConfig.headers['X-CSRF-Token']).toBe('test-csrf-token')
  })

  it('request interceptor does not add CSRF token for GET requests', async () => {
    const config = { headers: {}, method: 'get' }
    const modifiedConfig = await requestInterceptor(config)

    expect(modifiedConfig.headers['X-CSRF-Token']).toBeUndefined()
  })

  it('response interceptor handles 401 by clearing token', async () => {
    localStorage.setItem('rodeo_token', 'test-token')

    const error = {
      response: {
        status: 401,
        data: { detail: 'Unauthorized' },
      },
    }

    try {
      await responseInterceptor.error(error)
    } catch (e) {
      // Expected to throw
    }

    // Token should be removed
    expect(localStorage.getItem('rodeo_token')).toBeNull()
  })

  it('CSRF token is cached and reused', async () => {
    axios.get.mockResolvedValue({
      data: { csrf_token: 'cached-token' },
    })

    // First request
    const config1 = { headers: {}, method: 'post' }
    await requestInterceptor(config1)

    // Clear the mock call history
    axios.get.mockClear()

    // Second request (should use cached token)
    const config2 = { headers: {}, method: 'post' }
    await requestInterceptor(config2)

    // CSRF endpoint should not be called again (token is cached)
    expect(axios.get).not.toHaveBeenCalled()
  })

  it('API client is exported and usable', () => {
    expect(apiClient).toBeDefined()
    expect(apiClient.interceptors).toBeDefined()
  })
})
