import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Custom hook for WebSocket connection to RODEO backend
 * Provides real-time updates for plugin execution, vulnerabilities, and system metrics
 */
export function useWebSocket(url, options = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    autoConnect = true
  } = options

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('[WebSocket] Connected to', url)
        setIsConnected(true)
        setError(null)
        if (onOpen) onOpen()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          if (onMessage) onMessage(data)
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e)
        }
      }

      ws.onerror = (event) => {
        console.error('[WebSocket] Error:', event)
        setError(event)
        if (onError) onError(event)
      }

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason)
        setIsConnected(false)
        wsRef.current = null

        if (onClose) onClose(event)

        // Attempt reconnection
        if (reconnectAttempts > 0) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...')
            connect()
          }, reconnectInterval)
        }
      }

      wsRef.current = ws
    } catch (e) {
      console.error('[WebSocket] Connection failed:', e)
      setError(e)
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
      return true
    }
    console.warn('[WebSocket] Cannot send message - not connected')
    return false
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect
  }
}

/**
 * Hook specifically for RODEO plugin execution updates
 */
export function usePluginUpdates() {
  const [plugins, setPlugins] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0
  })

  const handleMessage = useCallback((data) => {
    if (data.type === 'plugin_start') {
      setPlugins(prev => [{
        id: data.id,
        name: data.plugin,
        status: 'running',
        startTime: data.timestamp,
        ...data
      }, ...prev].slice(0, 50))

      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        running: prev.running + 1
      }))
    }

    if (data.type === 'plugin_complete') {
      setPlugins(prev => prev.map(p =>
        p.id === data.id ? { ...p, status: 'completed', endTime: data.timestamp, result: data.result } : p
      ))

      setStats(prev => ({
        ...prev,
        running: Math.max(0, prev.running - 1),
        completed: prev.completed + 1
      }))
    }

    if (data.type === 'plugin_error') {
      setPlugins(prev => prev.map(p =>
        p.id === data.id ? { ...p, status: 'failed', error: data.error } : p
      ))

      setStats(prev => ({
        ...prev,
        running: Math.max(0, prev.running - 1),
        failed: prev.failed + 1
      }))
    }
  }, [])

  const ws = useWebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/plugins`, {
    onMessage: handleMessage,
    reconnectAttempts: 10
  })

  return {
    plugins,
    stats,
    ...ws
  }
}

/**
 * Hook for vulnerability feed updates
 */
export function useVulnerabilityFeed() {
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  })

  const handleMessage = useCallback((data) => {
    if (data.type === 'vulnerability_discovered') {
      setVulnerabilities(prev => [{
        id: data.cve_id,
        severity: data.severity,
        service: data.service,
        score: data.score,
        timestamp: data.timestamp,
        ...data
      }, ...prev].slice(0, 100))

      setStats(prev => ({
        total: prev.total + 1,
        critical: prev.critical + (data.severity === 'CRITICAL' ? 1 : 0),
        high: prev.high + (data.severity === 'HIGH' ? 1 : 0),
        medium: prev.medium + (data.severity === 'MEDIUM' ? 1 : 0),
        low: prev.low + (data.severity === 'LOW' ? 1 : 0)
      }))
    }
  }, [])

  const ws = useWebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/vulnerabilities`, {
    onMessage: handleMessage,
    reconnectAttempts: 10
  })

  return {
    vulnerabilities,
    stats,
    ...ws
  }
}

/**
 * Hook for system metrics updates
 */
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    disk: 0,
    active_plugins: 0,
    total_scans: 0
  })

  const handleMessage = useCallback((data) => {
    if (data.type === 'metrics_update') {
      setMetrics(data.metrics)
    }
  }, [])

  const ws = useWebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/metrics`, {
    onMessage: handleMessage,
    reconnectAttempts: 10
  })

  return {
    metrics,
    ...ws
  }
}

export default useWebSocket
