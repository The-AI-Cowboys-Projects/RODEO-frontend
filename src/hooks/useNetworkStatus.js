import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to detect network connectivity status.
 * Used to hide demo/seeded data when a live network connection is detected.
 *
 * Returns:
 *   - isOnline: true if browser reports online status
 *   - isLiveNetwork: true if we can reach the backend API (confirming real connectivity)
 *   - isDemoMode: true if we should show demo data (offline or no backend connection)
 */
export default function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isLiveNetwork, setIsLiveNetwork] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check if we can actually reach the backend API
  const checkBackendConnectivity = useCallback(async () => {
    try {
      setIsChecking(true)
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        // Backend is reachable - we have a live network connection
        setIsLiveNetwork(true)
        return true
      }
    } catch (error) {
      // Backend not reachable - stay in demo mode
      setIsLiveNetwork(false)
    } finally {
      setIsChecking(false)
    }
    return false
  }, [])

  useEffect(() => {
    // Initial check
    checkBackendConnectivity()

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      checkBackendConnectivity()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsLiveNetwork(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic connectivity check every 30 seconds
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkBackendConnectivity()
      }
    }, 30000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(intervalId)
    }
  }, [checkBackendConnectivity])

  // Demo mode: show seeded data when offline OR when we can't reach the backend
  const isDemoMode = !isOnline || !isLiveNetwork

  return {
    isOnline,
    isLiveNetwork,
    isDemoMode,
    isChecking,
    recheckConnectivity: checkBackendConnectivity
  }
}
