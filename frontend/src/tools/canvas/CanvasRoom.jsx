import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Trash2,
  Download,
  Share2,
  Users,
  ArrowLeft,
  Check,
  Undo2,
  Redo2,
  Palette,
  MousePointer
} from 'lucide-react'
import { Button, Badge } from '@/components'
import config from './config'

// Drawing tools
const TOOLS = {
  SELECT: 'select',
  PEN: 'pen',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  ERASER: 'eraser',
  TEXT: 'text'
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
  const [copied, setCopied] = useState(false)
  
  // Drawing state
  const [tool, setTool] = useState(TOOLS.PEN)
  const [color, setColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(4)
  const [showColorPicker, setShowColorPicker] = useState(false)
  
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
      contextRef.current.strokeStyle = tool === TOOLS.ERASER ? '#0a0a0a' : color
      contextRef.current.lineWidth = tool === TOOLS.ERASER ? brushSize * 3 : brushSize
    }
  }, [color, brushSize, tool])

  // WebSocket connection
  useEffect(() => {
    if (!token) {
      navigate('/tools/canvas')
      return
    }

    const connectWebSocket = () => {
      try {
        const wsUrl = `${config.settings.wsEndpoint}/${token}`
        console.log('Connecting to Canvas WebSocket:', wsUrl)
        
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('Canvas WebSocket connected')
          setIsConnected(true)
          setError(null)
          
          // Request current canvas state
          ws.send(JSON.stringify({ type: 'SYNC_REQUEST' }))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          } catch (e) {
            console.error('Failed to parse message:', e)
          }
        }

        ws.onclose = (event) => {
          console.log('Canvas WebSocket closed:', event.code)
          setIsConnected(false)
          
          if (event.code !== 1000 && event.code !== 1001) {
            setTimeout(connectWebSocket, 3000)
          }
        }

        ws.onerror = (error) => {
          console.error('Canvas WebSocket error:', error)
          setError('Connection error')
        }

      } catch (err) {
        console.error('Failed to connect:', err)
        setError('Failed to connect')
      }
    }

    connectWebSocket()

    return () => {
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
        
      case 'ERROR':
        setError(data.content)
        break
        
      default:
        console.log('Unknown message type:', data.type)
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
    lastPointRef.current = getCanvasPoint(e)
    
    // Start a new path
    const ctx = contextRef.current
    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
  }

  const draw = (e) => {
    if (!isDrawingRef.current || tool === TOOLS.SELECT) return
    
    e.preventDefault()
    const point = getCanvasPoint(e)
    const ctx = contextRef.current
    
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    
    // Send to others
    sendDrawData(lastPointRef.current, point)
    lastPointRef.current = point
  }

  const stopDrawing = () => {
    if (isDrawingRef.current) {
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

  // Copy share link
  const copyLink = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            {BRUSH_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                  brushSize === size 
                    ? 'bg-surface-600 text-surface-100' 
                    : 'text-surface-400 hover:bg-surface-700'
                }`}
                title={`Size ${size}`}
              >
                <div 
                  className="rounded-full bg-current"
                  style={{ width: Math.min(size, 12), height: Math.min(size, 12) }}
                />
              </button>
            ))}
          </div>
          
          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-8 h-8 rounded-lg border-2 border-surface-600 hover:border-surface-500 transition-colors"
              style={{ backgroundColor: color }}
              title="Color"
            />
            
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 p-2 bg-surface-800 rounded-lg border border-surface-700 shadow-xl z-50"
              >
                <div className="grid grid-cols-5 gap-1">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c)
                        setShowColorPicker(false)
                      }}
                      className={`w-7 h-7 rounded border-2 transition-colors ${
                        color === c ? 'border-amber-400' : 'border-transparent hover:border-surface-500'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Center: Canvas Token */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500 font-mono">{token}</span>
          <Badge className={isConnected ? 'badge-success' : 'badge-error'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
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
          
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span className="text-sm">{copied ? 'Copied!' : 'Share'}</span>
          </button>
          
          {participants.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-800">
              <Users className="w-4 h-4 text-surface-400" />
              <span className="text-sm text-surface-300">{participants.length}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-surface-950">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-crimson-500/10 border border-crimson-500/20 rounded-lg z-10">
            <p className="text-sm text-crimson-400">{error}</p>
          </div>
        )}
        
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${
            tool === TOOLS.PEN ? 'cursor-crosshair' : 
            tool === TOOLS.ERASER ? 'cursor-cell' : 
            'cursor-default'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
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
