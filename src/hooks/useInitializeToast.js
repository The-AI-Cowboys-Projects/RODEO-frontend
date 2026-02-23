/**
 * Hook to initialize the global toast function for use in non-React contexts
 * (like the API client interceptors)
 */

import { useEffect } from 'react'
import { useToast, setGlobalToast } from '../components/ui/Toast'

export function useInitializeToast() {
  const toast = useToast()

  useEffect(() => {
    // Set the global toast function so API client can use it
    setGlobalToast(toast)

    // Cleanup on unmount
    return () => {
      setGlobalToast(null)
    }
  }, [toast])
}

export default useInitializeToast
