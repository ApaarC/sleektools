import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Copy,
  Check,
  Users,
  Clock,
  ArrowLeft,
  AlertCircle,
  Wifi,
  WifiOff,
  Share2,
  LogOut
} from 'lucide-react'
import { Button, Input, Card, Badge } from '@/components'
import { useChatStore } from '@/store'
import config from './config'

export default function ChatRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const {
    userName,
    messages,
    participants,
    isConnected,
    isConnecting,
    error,
    addMessage,
    setMessages,
    setParticipants,
    setConnectionStatus,
    setError,
    setWebSocket,
    clearChat
  } = useChatStore()

  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const wsRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Connect to WebSocket
  useEffect(() => {
    if (!roomId || !userName) {
      navigate('/tools/chat')
      return
    }

    setConnectionStatus(false, true)

    // For demo purposes, we'll simulate a WebSocket connection
    // In production, replace with actual WebSocket connection
    const connectWebSocket = () => {
      try {
        // Simulated connection for demo
        // Real implementation would be:
        // wsRef.current = new WebSocket(`${config.settings.wsEndpoint}/${roomId}`)
        
        // Simulate successful connection after a short delay
        setTimeout(() => {
          setConnectionStatus(true, false)
          
          // Add system message
          addMessage({
            id: Date.now(),
            type: 'system',
            content: `Welcome to room ${roomId}! Messages are not stored.`,
            timestamp: new Date().toISOString()
          })

          // Simulate participants
          setParticipants([
            { id: '1', name: userName, isMe: true }
          ])
        }, 500)

      } catch (err) {
        setError('Failed to connect to chat server')
        setConnectionStatus(false, false)
      }
    }

    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      clearChat()
    }
  }, [roomId, userName, navigate, setConnectionStatus, setError, addMessage, setParticipants, clearChat])

  // Send message
  const handleSendMessage = useCallback(() => {
    if (!message.trim() || !isConnected) return

    const newMessage = {
      id: Date.now(),
      type: 'message',
      sender: userName,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      isMe: true
    }

    // In real implementation, send via WebSocket
    // wsRef.current?.send(JSON.stringify({ type: 'message', content: message }))
    
    addMessage(newMessage)
    setMessage('')
    inputRef.current?.focus()
  }, [message, isConnected, userName, addMessage])

  // Handle Enter key
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Copy room link
  const copyRoomLink = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // Leave room
  const handleLeaveRoom = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    clearChat()
    navigate('/tools/chat')
  }, [clearChat, navigate])

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!userName) {
    return null
  }

  return (
    <div className="tool-page flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-dark-700">
        <div className="flex items-center gap-3">
          <Link 
            to="/tools/chat"
            className="btn-ghost p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-dark-100">
                Room: {roomId}
              </h1>
              <Badge variant={isConnected ? 'success' : 'warning'}>
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3" />
                    Connected
                  </>
                ) : isConnecting ? (
                  <>
                    <WifiOff className="w-3 h-3" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    Disconnected
                  </>
                )}
              </Badge>
            </div>
            <p className="text-sm text-dark-500">
              <Clock className="w-3 h-3 inline mr-1" />
              Expires in ~{config.settings.maxRoomDurationHours} hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Participants toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowParticipants(!showParticipants)}
            icon={Users}
          >
            <span className="hidden sm:inline">{participants.length}</span>
          </Button>

          {/* Copy link */}
          <Button
            variant="secondary"
            onClick={copyRoomLink}
            icon={copied ? Check : Share2}
          >
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </Button>

          {/* Leave */}
          <Button
            variant="danger"
            onClick={handleLeaveRoom}
            icon={LogOut}
          >
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 mt-4 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {msg.type === 'system' ? (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1.5 text-xs text-dark-500 
                                     bg-dark-800/50 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${msg.isMe ? 'order-2' : ''}`}>
                        {!msg.isMe && (
                          <span className="text-xs text-dark-500 ml-1 mb-1 block">
                            {msg.sender}
                          </span>
                        )}
                        <div
                          className={`
                            px-4 py-2.5 rounded-2xl
                            ${msg.isMe
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-dark-700 text-dark-200 rounded-bl-md'
                            }
                          `}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                        <span className={`text-xs text-dark-600 mt-1 block ${
                          msg.isMe ? 'text-right mr-1' : 'ml-1'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-dark-700">
            {error ? (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            ) : null}
            
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={!isConnected}
                maxLength={config.settings.maxMessageLength}
                className="input flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected}
                icon={Send}
              >
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Participants sidebar */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="w-64 glass-card p-4 overflow-hidden"
            >
              <h3 className="font-medium text-dark-200 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-dark-800/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 
                                  flex items-center justify-center text-white text-sm font-medium">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-dark-300 truncate">
                      {p.name}
                      {p.isMe && (
                        <span className="text-dark-500 ml-1">(you)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
