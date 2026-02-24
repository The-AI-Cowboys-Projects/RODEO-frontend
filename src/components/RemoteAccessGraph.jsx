import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTheme } from '../context/ThemeContext'
import {
  UserIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  ClockIcon,
  UsersIcon,
  ServerIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

// ============================================================================
// Force-Directed Graph Physics Simulation
// ============================================================================

class ForceSimulation {
  constructor(nodes, edges, width, height) {
    this.nodes = nodes.map(n => ({
      ...n,
      x: n.x || Math.random() * width,
      y: n.y || Math.random() * height,
      vx: 0,
      vy: 0,
    }))
    this.edges = edges
    this.width = width
    this.height = height
    this.alpha = 1
    this.alphaDecay = 0.02
    this.alphaMin = 0.001
    this.velocityDecay = 0.6

    // Build node lookup
    this.nodeMap = new Map()
    this.nodes.forEach(n => this.nodeMap.set(n.id, n))
  }

  tick() {
    if (this.alpha < this.alphaMin) return false

    // Apply forces
    this.applyManyBodyForce()
    this.applyLinkForce()
    this.applyCenterForce()
    this.applyCollisionForce()

    // Update positions
    this.nodes.forEach(node => {
      if (node.fx !== undefined) {
        node.x = node.fx
        node.vx = 0
      } else {
        node.vx *= this.velocityDecay
        node.x += node.vx
      }

      if (node.fy !== undefined) {
        node.y = node.fy
        node.vy = 0
      } else {
        node.vy *= this.velocityDecay
        node.y += node.vy
      }

      // Keep within bounds with padding
      const padding = 50
      node.x = Math.max(padding, Math.min(this.width - padding, node.x))
      node.y = Math.max(padding, Math.min(this.height - padding, node.y))
    })

    this.alpha -= this.alphaDecay * this.alpha
    return true
  }

  applyManyBodyForce() {
    const strength = -300
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i]
        const nodeB = this.nodes[j]

        let dx = nodeB.x - nodeA.x
        let dy = nodeB.y - nodeA.y
        let dist = Math.sqrt(dx * dx + dy * dy) || 1

        if (dist < 1) dist = 1
        if (dist > 500) continue // Skip far nodes

        const force = (strength * this.alpha) / (dist * dist)

        const fx = (dx / dist) * force
        const fy = (dy / dist) * force

        nodeA.vx -= fx
        nodeA.vy -= fy
        nodeB.vx += fx
        nodeB.vy += fy
      }
    }
  }

  applyLinkForce() {
    const strength = 0.3
    const distance = 120

    this.edges.forEach(edge => {
      const source = this.nodeMap.get(edge.source)
      const target = this.nodeMap.get(edge.target)

      if (!source || !target) return

      let dx = target.x - source.x
      let dy = target.y - source.y
      let dist = Math.sqrt(dx * dx + dy * dy) || 1

      const force = ((dist - distance) / dist) * strength * this.alpha

      const fx = dx * force
      const fy = dy * force

      source.vx += fx
      source.vy += fy
      target.vx -= fx
      target.vy -= fy
    })
  }

  applyCenterForce() {
    const strength = 0.05
    const centerX = this.width / 2
    const centerY = this.height / 2

    this.nodes.forEach(node => {
      node.vx += (centerX - node.x) * strength * this.alpha
      node.vy += (centerY - node.y) * strength * this.alpha
    })
  }

  applyCollisionForce() {
    const radius = 30

    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i]
        const nodeB = this.nodes[j]

        let dx = nodeB.x - nodeA.x
        let dy = nodeB.y - nodeA.y
        let dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < radius * 2) {
          const overlap = radius * 2 - dist
          const force = overlap * 0.5

          if (dist === 0) {
            dx = Math.random() - 0.5
            dy = Math.random() - 0.5
            dist = Math.sqrt(dx * dx + dy * dy)
          }

          const fx = (dx / dist) * force
          const fy = (dy / dist) * force

          nodeA.x -= fx
          nodeA.y -= fy
          nodeB.x += fx
          nodeB.y += fy
        }
      }
    }
  }

  reheat() {
    this.alpha = 1
  }

  getNodes() {
    return this.nodes
  }

  getEdges() {
    return this.edges.map(e => ({
      ...e,
      sourceNode: this.nodeMap.get(e.source),
      targetNode: this.nodeMap.get(e.target),
    }))
  }
}

// ============================================================================
// Remote Access Graph Component
// ============================================================================

export default function RemoteAccessGraph({
  graphData,
  loading = false,
  onRefresh,
  timeRange = 7,
  onTimeRangeChange,
}) {
  const { isDarkMode } = useTheme()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [simulation, setSimulation] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showLabels, setShowLabels] = useState(true)
  const [filterType, setFilterType] = useState('all') // 'all', 'users', 'hosts', 'admins'

  const animationRef = useRef(null)

  // Colors
  const colors = useMemo(() => ({
    userNode: isDarkMode ? '#ec4899' : '#db2777', // Pink
    userNodeAdmin: isDarkMode ? '#ef4444' : '#dc2626', // Red for admins
    hostNode: isDarkMode ? '#06b6d4' : '#0891b2', // Cyan
    hostNodeOnline: isDarkMode ? '#10b981' : '#059669', // Green
    hostNodeOffline: isDarkMode ? '#6b7280' : '#9ca3af', // Gray
    edge: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
    edgeHover: isDarkMode ? 'rgba(236, 72, 153, 0.6)' : 'rgba(219, 39, 119, 0.6)',
    text: isDarkMode ? '#ffffff' : '#1f2937',
    textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    background: isDarkMode ? '#111827' : '#f3f4f6',
    hoverRing: isDarkMode ? 'rgba(236, 72, 153, 0.4)' : 'rgba(219, 39, 119, 0.4)',
  }), [isDarkMode])

  // Filter nodes based on filter type
  const filteredData = useMemo(() => {
    if (!graphData?.nodes) return { nodes: [], edges: [] }

    let filteredNodes = graphData.nodes
    if (filterType === 'users') {
      filteredNodes = graphData.nodes.filter(n => n.type === 'user')
    } else if (filterType === 'hosts') {
      filteredNodes = graphData.nodes.filter(n => n.type === 'host')
    } else if (filterType === 'admins') {
      filteredNodes = graphData.nodes.filter(n => n.type === 'user' && n.is_admin)
    }

    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredEdges = graphData.edges.filter(
      e => nodeIds.has(e.source) && nodeIds.has(e.target)
    )

    return { nodes: filteredNodes, edges: filteredEdges }
  }, [graphData, filterType])

  // Initialize simulation when data changes
  useEffect(() => {
    if (!filteredData.nodes.length) return

    const sim = new ForceSimulation(
      filteredData.nodes,
      filteredData.edges,
      dimensions.width,
      dimensions.height
    )
    setSimulation(sim)
  }, [filteredData, dimensions])

  // Animation loop
  useEffect(() => {
    if (!simulation || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const animate = () => {
      const running = simulation.tick()
      draw(ctx)

      if (running) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [simulation, transform, hoveredNode, selectedNode, colors, showLabels])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height: Math.max(400, height) })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [])

  // Draw function
  const draw = useCallback((ctx) => {
    if (!simulation) return

    const { width, height } = dimensions
    const { x: tx, y: ty, scale } = transform

    ctx.clearRect(0, 0, width, height)

    // Apply transform
    ctx.save()
    ctx.translate(tx, ty)
    ctx.scale(scale, scale)

    const nodes = simulation.getNodes()
    const edges = simulation.getEdges()

    // Draw edges
    edges.forEach(edge => {
      if (!edge.sourceNode || !edge.targetNode) return

      const isHovered = hoveredNode &&
        (edge.source === hoveredNode.id || edge.target === hoveredNode.id)

      ctx.beginPath()
      ctx.moveTo(edge.sourceNode.x, edge.sourceNode.y)
      ctx.lineTo(edge.targetNode.x, edge.targetNode.y)
      ctx.strokeStyle = isHovered ? colors.edgeHover : colors.edge
      ctx.lineWidth = isHovered ? 2 : 1
      ctx.stroke()
    })

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode && hoveredNode.id === node.id
      const isSelected = selectedNode && selectedNode.id === node.id
      const nodeRadius = node.type === 'user' ? 18 : 16

      // Draw hover ring
      if (isHovered || isSelected) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, nodeRadius + 8, 0, Math.PI * 2)
        ctx.fillStyle = colors.hoverRing
        ctx.fill()
      }

      // Draw node
      ctx.beginPath()

      if (node.type === 'user') {
        // User: Circle
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
        ctx.fillStyle = node.is_admin ? colors.userNodeAdmin : colors.userNode
      } else {
        // Host: Rounded square
        const size = nodeRadius * 1.6
        roundedRect(ctx, node.x - size / 2, node.y - size / 2, size, size, 4)
        const status = node.status?.toLowerCase()
        if (status === 'online') {
          ctx.fillStyle = colors.hostNodeOnline
        } else if (status === 'offline') {
          ctx.fillStyle = colors.hostNodeOffline
        } else {
          ctx.fillStyle = colors.hostNode
        }
      }

      ctx.fill()

      // Draw icon inside
      ctx.fillStyle = '#ffffff'
      ctx.font = `${nodeRadius * 0.8}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.type === 'user' ? '👤' : '🖥️', node.x, node.y)

      // Draw label
      if (showLabels || isHovered) {
        ctx.font = `${isHovered ? 'bold ' : ''}11px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillStyle = colors.text

        // Background for label
        const label = node.label || node.id
        const textWidth = ctx.measureText(label).width
        ctx.fillStyle = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)'
        ctx.fillRect(
          node.x - textWidth / 2 - 4,
          node.y + nodeRadius + 4,
          textWidth + 8,
          16
        )

        ctx.fillStyle = colors.text
        ctx.fillText(label, node.x, node.y + nodeRadius + 12)
      }
    })

    ctx.restore()
  }, [simulation, dimensions, transform, hoveredNode, selectedNode, colors, showLabels, isDarkMode])

  // Helper: Rounded rectangle
  const roundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  // Get node at position
  const getNodeAtPosition = useCallback((mouseX, mouseY) => {
    if (!simulation) return null

    const { x: tx, y: ty, scale } = transform
    const x = (mouseX - tx) / scale
    const y = (mouseY - ty) / scale

    const nodes = simulation.getNodes()
    for (const node of nodes) {
      const radius = node.type === 'user' ? 18 : 16
      const dx = x - node.x
      const dy = y - node.y
      if (dx * dx + dy * dy < radius * radius * 1.5) {
        return node
      }
    }
    return null
  }, [simulation, transform])

  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (dragging) {
      setTransform(prev => ({
        ...prev,
        x: prev.x + (e.clientX - dragStart.x),
        y: prev.y + (e.clientY - dragStart.y),
      }))
      setDragStart({ x: e.clientX, y: e.clientY })
    } else {
      const node = getNodeAtPosition(x, y)
      setHoveredNode(node)
      canvasRef.current.style.cursor = node ? 'pointer' : 'grab'
    }
  }, [dragging, dragStart, getNodeAtPosition])

  const handleMouseDown = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const node = getNodeAtPosition(x, y)
    if (node) {
      setSelectedNode(node)
    } else {
      setDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      canvasRef.current.style.cursor = 'grabbing'
    }
  }, [getNodeAtPosition])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    canvasRef.current.style.cursor = hoveredNode ? 'pointer' : 'grab'
  }, [hoveredNode])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.3, Math.min(3, transform.scale * delta))

    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTransform(prev => ({
      x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
      y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
      scale: newScale,
    }))
  }, [transform.scale])

  // Zoom controls
  const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))
  const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(0.3, prev.scale / 1.2) }))
  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
    simulation?.reheat()
  }

  // Export as PNG
  const exportPNG = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `remote-access-graph-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Stats
  const stats = useMemo(() => {
    if (!graphData?.nodes) return { users: 0, hosts: 0, edges: 0, admins: 0 }
    return {
      users: graphData.nodes.filter(n => n.type === 'user').length,
      hosts: graphData.nodes.filter(n => n.type === 'host').length,
      edges: graphData.edges?.length || 0,
      admins: graphData.nodes.filter(n => n.type === 'user' && n.is_admin).length,
    }
  }, [graphData])

  return (
    <div className="flex flex-col h-full">
      {/* Header Controls */}
      <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-t-xl border-b ${
        isDarkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Remote Access Graph
          </h3>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              isDarkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-gray-100 text-gray-900 border-gray-300'
            } border`}
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              isDarkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-gray-100 text-gray-900 border-gray-300'
            } border`}
          >
            <option value="all">All Nodes</option>
            <option value="users">Users Only</option>
            <option value="hosts">Hosts Only</option>
            <option value="admins">Admin Users</option>
          </select>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700'
          }`}>
            <UsersIcon className="w-4 h-4" />
            {stats.users} Users
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
          }`}>
            <ServerIcon className="w-4 h-4" />
            {stats.hosts} Hosts
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
            isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
          }`}>
            {stats.edges} Connections
          </span>
          {stats.admins > 0 && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
              isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
            }`}>
              <ShieldExclamationIcon className="w-4 h-4" />
              {stats.admins} Admins
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? `${showLabels ? 'bg-pink-500/30 text-pink-400' : 'bg-gray-700 text-gray-400'} hover:bg-gray-600`
                : `${showLabels ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200`
            }`}
            title="Toggle Labels"
          >
            <InformationCircleIcon className="w-4 h-4" />
          </button>
          <button
            onClick={zoomIn}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Reset View"
          >
            <ArrowsPointingOutIcon className="w-4 h-4" />
          </button>
          <button
            onClick={exportPNG}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Export PNG"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'bg-pink-600 text-white hover:bg-pink-500' : 'bg-pink-500 text-white hover:bg-pink-600'
            } disabled:opacity-50`}
            title="Refresh Data"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden rounded-b-xl ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}
        style={{ minHeight: 500 }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ArrowPathIcon className={`w-12 h-12 animate-spin mx-auto mb-4 ${
                isDarkMode ? 'text-pink-400' : 'text-pink-600'
              }`} />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                Loading graph data...
              </p>
            </div>
          </div>
        ) : filteredData.nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <UsersIcon className={`w-16 h-16 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No access data available
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Connect an EDR platform with identity data to visualize user-host relationships
              </p>
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: 'grab' }}
          />
        )}

        {/* Legend */}
        <div className={`absolute bottom-4 left-4 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
        } backdrop-blur-sm shadow-lg`}>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-pink-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>User</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Admin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-cyan-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Host</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Online</span>
            </div>
          </div>
        </div>

        {/* Hovered Node Info */}
        {hoveredNode && (
          <div className={`absolute top-4 right-4 p-4 rounded-xl min-w-64 ${
            isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
          } backdrop-blur-sm shadow-xl border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                hoveredNode.type === 'user'
                  ? hoveredNode.is_admin
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-pink-500/20 text-pink-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {hoveredNode.type === 'user' ? (
                  hoveredNode.is_admin ? <ShieldExclamationIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />
                ) : (
                  <ComputerDesktopIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {hoveredNode.label}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {hoveredNode.type === 'user' ? (hoveredNode.is_admin ? 'Admin User' : 'User') : 'Host'}
                </p>
              </div>
            </div>

            {hoveredNode.type === 'host' && (
              <div className="space-y-1.5 text-sm">
                {hoveredNode.platform && (
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Platform</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{hoveredNode.platform}</span>
                  </div>
                )}
                {hoveredNode.os && (
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>OS</span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{hoveredNode.os}</span>
                  </div>
                )}
                {hoveredNode.status && (
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Status</span>
                    <span className={`font-medium ${
                      hoveredNode.status === 'online'
                        ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {hoveredNode.status}
                    </span>
                  </div>
                )}
              </div>
            )}

            {hoveredNode.type === 'user' && hoveredNode.host_count && (
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Hosts Accessed</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{hoveredNode.host_count}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
