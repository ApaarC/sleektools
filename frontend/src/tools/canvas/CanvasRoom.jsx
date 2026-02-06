import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  Minus,
  Trash2,
  Download,
  Users,
  ArrowLeft,
  Undo2,
  Redo2,
  MousePointer,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'
import { Button, Badge, InlineError } from '@/components'
import { RoomNotFoundPage, ConnectionErrorPage } from '@/pages'
import config from './config'

// Drawing tools
const TOOLS = {
  SELECT: 'select',
  PEN: 'pen',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ERASER: 'eraser'
}

// Color palette
const COLORS = [
  '#ffffff', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6',
  '#ec4899', '#000000'
]

// Brush sizes
const BRUSH_SIZES = [2, 4, 8, 12, 20]

export default function CanvasRoom() {
  const { token } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const wsRef = useRef(null)
  const isDrawingRef = useRef(false)
  const lastPointRef = useRef(null)
  
  const [isConnected, setIsConnected] = useState(false)
  const [participants, setParticipants] = useState([])
  const [error, setError] = useState(null)
  const [roomNotFound, setRoomNotFound] = useState(false)
  const [connectionFailed, setConnectionFailed] = useState(false)
  
  // User info (Pokemon name)
  const [myUserInfo, setMyUserInfo] = useState(null)
  
  // Remote cursors - map of odentityId -> {x, y, userName, userColor}
  const [remoteCursors, setRemoteCursors] = useState({})
  
  // Drawing state
  const [tool, setTool] = useState(TOOLS.PEN)
  const [color, setColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(4)
  const [zoom, setZoom] = useState(1)
  
  // For shape drawing - store start point and canvas snapshot
  const shapeStartRef = useRef(null)
  const canvasSnapshotRef = useRef(null)
  
  // History for undo/redo
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      const rect = container.getBoundingClientRect()
      
      // Store current image data
      const imageData = contextRef.current?.getImageData(0, 0, canvas.width, canvas.height)
      
      canvas.width = rect.width
      canvas.height = rect.height
      
      const ctx = canvas.getContext('2d')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = color
      ctx.lineWidth = brushSize
      contextRef.current = ctx
      
      // Restore image data if exists
      if (imageData && imageData.width > 0) {
        ctx.putImageData(imageData, 0, 0)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  // Update context when color/size changes
  useEffect(() => {
    if (contextRef.current) {
      const ctx = contextRef.current
      if (tool === TOOLS.ERASER) {
        ctx.strokeStyle = '#0a0a0a'
        ctx.lineWidth = brushSize * 3
        ctx.globalAlpha = 1
      } else {
        ctx.strokeStyle = color
        ctx.lineWidth = brushSize
        ctx.globalAlpha = 1
      }
    }
  }, [color, brushSize, tool])

  // WebSocket connection
  useEffect(() => {
    if (!token) {
      navigate('/tools/canvas')
      return
    }

    let isMounted = true
    let reconnectTimeout = null

    const connectWebSocket = () => {
      if (!isMounted) return
      
      try {
        // Use hardcoded canvas endpoint to avoid config issues
        const wsUrl = `ws://localhost:8080/ws/canvas/${token}`
        console.log('Connecting to Canvas WebSocket:', wsUrl)
        
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          if (!isMounted) {
            ws.close(1000, 'Component unmounted')
            return
          }
          console.log('Canvas WebSocket connected')
          setIsConnected(true)
          setError(null)
          
          // Request current canvas state
          ws.send(JSON.stringify({ type: 'SYNC_REQUEST' }))
        }

        ws.onmessage = (event) => {
          if (!isMounted) return
          try {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          } catch (e) {
            console.error('Failed to parse message:', e)
          }
        }

        ws.onclose = (event) => {
          if (!isMounted) return
          console.log('Canvas WebSocket closed:', event.code, event.reason)
          setIsConnected(false)
          
          // Check for specific close reasons
          if (event.reason?.includes('not found') || event.code === 4004) {
            setRoomNotFound(true)
            return
          }
          
          // Reconnect for unexpected closes (but not 1006 during unmount)
          if (event.code !== 1000 && event.code !== 1001 && !roomNotFound && isMounted) {
            reconnectTimeout = setTimeout(connectWebSocket, 3000)
          }
        }

        ws.onerror = (error) => {
          if (!isMounted) return
          console.error('Canvas WebSocket error:', error)
          // Don't set error for transient connection issues during mount
        }

      } catch (err) {
        if (!isMounted) return
        console.error('Failed to connect:', err)
        setConnectionFailed(true)
      }
    }

    connectWebSocket()

    return () => {
      isMounted = false
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'User left')
      }
    }
  }, [token, navigate])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'DRAW':
        // Draw received stroke
        if (contextRef.current && data.data) {
          const ctx = contextRef.current
          const { from, to, color: strokeColor, size, toolType } = data.data
          
          ctx.save()
          ctx.strokeStyle = toolType === 'eraser' ? '#0a0a0a' : strokeColor
          ctx.lineWidth = toolType === 'eraser' ? size * 3 : size
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.stroke()
          ctx.restore()
        }
        break
      
      case 'SHAPE':
        // Draw received shape
        if (contextRef.current && data) {
          const ctx = contextRef.current
          const { shapeType, startX, startY, endX, endY, color: shapeColor, size: shapeSize } = data
          
          ctx.save()
          ctx.strokeStyle = shapeColor
          ctx.lineWidth = shapeSize
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          
          if (shapeType === TOOLS.LINE) {
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
          } else if (shapeType === TOOLS.RECTANGLE) {
            ctx.rect(startX, startY, endX - startX, endY - startY)
          } else if (shapeType === TOOLS.CIRCLE) {
            const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
            ctx.arc(startX, startY, radius, 0, Math.PI * 2)
          }
          
          ctx.stroke()
          ctx.restore()
        }
        break
        
      case 'CLEAR':
        // Clear canvas
        if (contextRef.current && canvasRef.current) {
          contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
        break
        
      case 'SYNC':
        // Sync canvas state (image data)
        if (data.data && canvasRef.current && contextRef.current) {
          const img = new Image()
          img.onload = () => {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            contextRef.current.drawImage(img, 0, 0)
          }
          img.src = data.data
        }
        break
        
      case 'PARTICIPANTS':
        if (data.data) {
          setParticipants(data.data)
        }
        break
        
      case 'JOIN':
        // New user joined - send current canvas state
        if (data.sendToNew && canvasRef.current) {
          const imageData = canvasRef.current.toDataURL()
          wsRef.current?.send(JSON.stringify({
            type: 'SYNC',
            data: imageData
          }))
        }
        break
      
      case 'USER_INFO':
        // Our own user info (Pokemon name assigned by server)
        if (data.data) {
          setMyUserInfo(data.data)
          console.log('Assigned Pokemon name:', data.data.userName)
        }
        break
      
      case 'USER_JOINED':
        // Another user joined
        if (data.data) {
          console.log(`${data.data.userName} joined the canvas`)
        }
        break
      
      case 'USER_LEFT':
        // Another user left - remove their cursor
        if (data.data) {
          setRemoteCursors(prev => {
            const updated = { ...prev }
            delete updated[data.data.odentityId]
            return updated
          })
          console.log(`${data.data.userName} left the canvas`)
        }
        break
      
      case 'CURSOR':
        // Update remote cursor position - never show our own cursor
        if (data.data && myUserInfo && data.data.odentityId !== myUserInfo.odentityId) {
          setRemoteCursors(prev => ({
            ...prev,
            [data.data.odentityId]: {
              x: data.data.x,
              y: data.data.y,
              userName: data.data.userName,
              userColor: data.data.userColor
            }
          }))
        }
        break
        
      case 'ERROR':
        // Check for specific error types
        if (data.content?.includes('not found') || data.content?.includes('does not exist')) {
          setRoomNotFound(true)
        } else {
          setError(data.content)
        }
        break
        
      default:
        console.log('Unknown message type:', data.type)
    }
  }, [myUserInfo])

  // Send cursor position
  const sendCursorPosition = useCallback((x, y) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'CURSOR',
        data: { x, y }
      }))
    }
  }, [])

  // Send drawing data
  const sendDrawData = useCallback((from, to) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'DRAW',
        data: {
          from,
          to,
          color,
          size: brushSize,
          toolType: tool === TOOLS.ERASER ? 'eraser' : 'pen'
        }
      }))
    }
  }, [color, brushSize, tool])

  // Drawing handlers
  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    if (tool === TOOLS.SELECT) return
    
    e.preventDefault()
    isDrawingRef.current = true
    const point = getCanvasPoint(e)
    lastPointRef.current = point
    
    const ctx = contextRef.current
    const isShapeTool = [TOOLS.LINE, TOOLS.RECTANGLE, TOOLS.CIRCLE].includes(tool)
    
    if (isShapeTool) {
      // Save starting point and canvas snapshot for shape preview
      shapeStartRef.current = point
      canvasSnapshotRef.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
    } else {
      // Freehand drawing (pen, eraser)
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    }
  }

  // Track cursor for broadcasting
  const lastCursorBroadcast = useRef(0)
  
  const handleMouseMove = (e) => {
    const point = getCanvasPoint(e)
    
    // Throttle cursor broadcasts to every 100ms (10 updates/sec) for smooth performance
    const now = Date.now()
    if (now - lastCursorBroadcast.current > 100) {
      sendCursorPosition(point.x, point.y)
      lastCursorBroadcast.current = now
    }
    
    // Handle drawing if active
    if (isDrawingRef.current && tool !== TOOLS.SELECT) {
      e.preventDefault()
      const ctx = contextRef.current
      const isShapeTool = [TOOLS.LINE, TOOLS.RECTANGLE, TOOLS.CIRCLE].includes(tool)
      
      if (isShapeTool && shapeStartRef.current && canvasSnapshotRef.current) {
        // Restore snapshot and draw shape preview
        ctx.putImageData(canvasSnapshotRef.current, 0, 0)
        
        const start = shapeStartRef.current
        ctx.beginPath()
        
        if (tool === TOOLS.LINE) {
          ctx.moveTo(start.x, start.y)
          ctx.lineTo(point.x, point.y)
        } else if (tool === TOOLS.RECTANGLE) {
          const width = point.x - start.x
          const height = point.y - start.y
          ctx.rect(start.x, start.y, width, height)
        } else if (tool === TOOLS.CIRCLE) {
          const radius = Math.sqrt(Math.pow(point.x - start.x, 2) + Math.pow(point.y - start.y, 2))
          ctx.arc(start.x, start.y, radius, 0, Math.PI * 2)
        }
        
        ctx.stroke()
      } else {
        // Freehand drawing
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
        
        // Send to others
        sendDrawData(lastPointRef.current, point)
        lastPointRef.current = point
      }
    }
  }

  const draw = (e) => {
    // This is now handled by handleMouseMove
  }

  const stopDrawing = (e) => {
    if (isDrawingRef.current) {
      const isShapeTool = [TOOLS.LINE, TOOLS.RECTANGLE, TOOLS.CIRCLE].includes(tool)
      
      if (isShapeTool && shapeStartRef.current) {
        // Get final point and broadcast shape
        const point = e ? getCanvasPoint(e) : lastPointRef.current
        const start = shapeStartRef.current
        
        // Send shape data to others
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'SHAPE',
            shapeType: tool,
            startX: start.x,
            startY: start.y,
            endX: point.x,
            endY: point.y,
            color: color,
            size: size
          }))
        }
        
        // Clear shape refs
        shapeStartRef.current = null
        canvasSnapshotRef.current = null
      }
      
      isDrawingRef.current = false
      // Save to history
      saveToHistory()
    }
  }

  // History management
  const saveToHistory = useCallback(() => {
    if (!canvasRef.current) return
    
    const imageData = canvasRef.current.toDataURL()
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(imageData)
      return newHistory.slice(-50) // Keep last 50 states
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const img = new Image()
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        contextRef.current.drawImage(img, 0, 0)
      }
      img.src = history[newIndex]
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const img = new Image()
      img.onload = () => {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        contextRef.current.drawImage(img, 0, 0)
      }
      img.src = history[newIndex]
      setHistoryIndex(newIndex)
    }
  }, [history, historyIndex])

  // Clear canvas
  const clearCanvas = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      
      // Notify others
      wsRef.current?.send(JSON.stringify({ type: 'CLEAR' }))
      
      saveToHistory()
    }
  }

  // Download canvas
  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = `canvas-${token}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const ToolButton = ({ icon: Icon, toolType, label }) => (
    <button
      onClick={() => setTool(toolType)}
      className={`p-2 rounded-lg transition-colors ${
        tool === toolType 
          ? 'bg-amber-500/20 text-amber-400' 
          : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
      }`}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  )

  // Show full-page error states
  if (roomNotFound) {
    return <RoomNotFoundPage type="canvas" />
  }

  if (connectionFailed) {
    return (
      <ConnectionErrorPage 
        onRetry={() => {
          setConnectionFailed(false)
          setError(null)
          window.location.reload()
        }} 
      />
    )
  }

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-800">
        {/* Left: Navigation & Tools */}
        <div className="flex items-center gap-4">
          <Link to="/tools/canvas" className="text-surface-400 hover:text-surface-200">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="h-6 w-px bg-surface-700" />
          
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1">
            <ToolButton icon={MousePointer} toolType={TOOLS.SELECT} label="Select" />
            <ToolButton icon={PenTool} toolType={TOOLS.PEN} label="Pen" />
            <ToolButton icon={Eraser} toolType={TOOLS.ERASER} label="Eraser" />
          </div>
          
          {/* Brush Size */}
          <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1">
            {BRUSH_SIZES.map(s => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                  brushSize === s 
                    ? 'bg-surface-600 text-surface-100' 
                    : 'text-surface-400 hover:bg-surface-700'
                }`}
                title={`Size ${s}`}
              >
                <div 
                  className="rounded-full bg-current"
                  style={{ width: Math.min(s, 12), height: Math.min(s, 12) }}
                />
              </button>
            ))}
            {/* Manual Size Input */}
            <input
              type="number"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-12 h-8 rounded bg-surface-700 text-surface-200 text-xs text-center border border-surface-600 focus:border-amber-500/50 focus:outline-none"
              title="Custom size (1-50)"
            />
          </div>
          
          {/* Color Picker */}
          <label 
            className="w-8 h-8 rounded-lg border-2 border-surface-600 hover:border-amber-500/50 transition-all cursor-pointer overflow-hidden relative"
            title="Pick a color"
          >
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 w-[200%] h-[200%] -top-2 -left-2 cursor-pointer border-0 opacity-0"
            />
            <div 
              className="w-full h-full rounded-md"
              style={{ backgroundColor: color }}
            />
          </label>
          
          <div className="h-6 w-px bg-surface-700" />
          
          {/* Shape Tools */}
          <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1">
            <ToolButton icon={Minus} toolType={TOOLS.LINE} label="Line" />
            <ToolButton icon={Square} toolType={TOOLS.RECTANGLE} label="Rectangle" />
            <ToolButton icon={Circle} toolType={TOOLS.CIRCLE} label="Circle" />
          </div>
        </div>
        
        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1 bg-surface-800 rounded-lg p-1">
          <button
            onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
            className="p-1.5 rounded text-surface-400 hover:text-surface-200 hover:bg-surface-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs text-surface-400 font-mono min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-1.5 rounded text-surface-400 hover:text-surface-200 hover:bg-surface-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded text-surface-400 hover:text-surface-200 hover:bg-surface-700"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 disabled:opacity-50"
            title="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700/50 disabled:opacity-50"
            title="Redo"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-surface-700" />
          
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg text-surface-400 hover:text-crimson-400 hover:bg-crimson-500/10"
            title="Clear Canvas"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={downloadCanvas}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700/50"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {participants.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-800">
              <Users className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-300">{participants.length}</span>
            </div>
          )}
          
          {/* Show my Pokemon name */}
          {myUserInfo && (
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded-lg"
              style={{ backgroundColor: `${myUserInfo.userColor}20` }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: myUserInfo.userColor }}
              />
              <span className="text-sm" style={{ color: myUserInfo.userColor }}>
                {myUserInfo.userName}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-surface-950">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <InlineError 
              message={error} 
              type="error"
              onDismiss={() => setError(null)}
            />
          </div>
        )}
        
        {/* Remote Cursors */}
        <AnimatePresence>
          {Object.entries(remoteCursors).map(([odentityId, cursor]) => (
            <motion.div
              key={odentityId}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute pointer-events-none z-20"
              style={{
                left: cursor.x,
                top: cursor.y,
                transform: 'translate(-2px, -2px)'
              }}
            >
              {/* Cursor pointer */}
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}
              >
                <path 
                  d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" 
                  fill={cursor.userColor}
                  stroke="#000"
                  strokeWidth="1"
                />
              </svg>
              {/* Name label */}
              <div 
                className="absolute left-4 top-4 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                style={{ 
                  backgroundColor: cursor.userColor,
                  color: '#000'
                }}
              >
                {cursor.userName}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${
            tool === TOOLS.PEN || tool === TOOLS.HIGHLIGHTER ? 'cursor-crosshair' : 
            tool === TOOLS.ERASER ? 'cursor-cell' : 
            tool === TOOLS.EYEDROPPER ? 'cursor-crosshair' :
            tool === TOOLS.TEXT ? 'cursor-text' :
            tool === TOOLS.LINE || tool === TOOLS.ARROW || tool === TOOLS.RECTANGLE || tool === TOOLS.CIRCLE || tool === TOOLS.TRIANGLE ? 'cursor-crosshair' :
            'cursor-default'
          }`}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  )
}
