import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Users,
  Clock,
  ArrowLeft,
  AlertCircle,
  Wifi,
  WifiOff,
  Share2,
  LogOut,
  Key,
  Check
} from 'lucide-react'
import { Button, Badge } from '@/components'
import { useChatStore } from '@/store'
import config from './config'

export default function ChatRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  
  // Get store values - separate selectors for stability
  const userName = useChatStore(state => state.userName)
  const currentRoom = useChatStore(state => state.currentRoom)
  const messages = useChatStore(state => state.messages)
  const participants = useChatStore(state => state.participants)
  const isConnected = useChatStore(state => state.isConnected)
  const isConnecting = useChatStore(state => state.isConnecting)
  const error = useChatStore(state => state.error)
  
  // Get store actions
  const addMessage = useChatStore(state => state.addMessage)
  const setParticipants = useChatStore(state => state.setParticipants)
  const setConnectionStatus = useChatStore(state => state.setConnectionStatus)
  const setError = useChatStore(state => state.setError)
  const clearChat = useChatStore(state => state.clearChat)

  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [needsPin, setNeedsPin] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [enteredPin, setEnteredPin] = useState('')

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

    const connectWebSocket = () => {
      setConnectionStatus(false, true)
      setError(null)

      try {
        const wsUrl = `${config.settings.wsEndpoint}/${roomId}`
        console.log('Connecting to WebSocket:', wsUrl)
        
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected, sending join...')
          // Send join message with name and PIN
          // Read from store directly to avoid stale closure
          const storeState = useChatStore.getState()
          let roomPin = storeState.currentRoom?.pin || ''
          
          // Fallback to sessionStorage if store is empty
          if (!roomPin) {
            try {
              const storedRoom = sessionStorage.getItem(`room_${roomId}`)
              if (storedRoom) {
                const parsed = JSON.parse(storedRoom)
                roomPin = parsed.pin || ''
                console.log('Got PIN from sessionStorage')
              }
            } catch (e) {
              console.error('Failed to read from sessionStorage:', e)
            }
          }
          
          console.log('Current room from store:', storeState.currentRoom)
          console.log('Sending PIN:', roomPin ? `"${roomPin}"` : '(no pin)')
          const joinMessage = {
            type: 'JOIN',
            senderName: userName,
            content: roomPin
          }
          ws.send(JSON.stringify(joinMessage))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('Received:', data)
            
            // Get latest store actions to avoid stale closures
            const store = useChatStore.getState()
            
            switch (data.type) {
              case 'MESSAGE':
                store.addMessage({
                  id: data.timestamp || Date.now(),
                  type: 'message',
                  senderId: data.senderId,
                  sender: data.senderName,
                  content: String(data.content || ''),
                  timestamp: new Date(data.timestamp).toISOString(),
                  isMe: data.senderName === userName
                })
                break

              case 'JOIN':
                store.addMessage({
                  id: data.timestamp || Date.now(),
                  type: 'system',
                  content: String(data.content || `${data.senderName} joined the room`),
                  timestamp: new Date(data.timestamp).toISOString()
                })
                break

              case 'LEAVE':
                store.addMessage({
                  id: data.timestamp || Date.now(),
                  type: 'system',
                  content: String(data.content || `${data.senderName} left the room`),
                  timestamp: new Date(data.timestamp).toISOString()
                })
                break

              case 'PARTICIPANTS':
                if (data.data && Array.isArray(data.data)) {
                  store.setParticipants(data.data.map(p => ({
                    id: p.id,
                    name: p.name,
                    isMe: p.name === userName
                  })))
                }
                break

              case 'SYSTEM':
                if (data.content?.includes('Welcome')) {
                  store.setConnectionStatus(true, false)
                  store.setError(null) // Clear any previous errors
                }
                store.addMessage({
                  id: data.timestamp || Date.now(),
                  type: 'system',
                  content: String(data.content || ''),
                  timestamp: new Date(data.timestamp || Date.now()).toISOString()
                })
                break

              case 'ERROR':
                store.setError(String(data.content || 'Unknown error'))
                break

              default:
                console.log('Unknown message type:', data.type)
            }
          } catch (e) {
            console.error('Failed to parse message:', e)
          }
        }

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          setConnectionStatus(false, false)
          
          if (event.code !== 1000 && event.code !== 1001) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (wsRef.current === ws) {
                console.log('Attempting to reconnect...')
                connectWebSocket()
              }
            }, 3000)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setError('Connection error. Trying to reconnect...')
        }

      } catch (err) {
        console.error('Failed to connect:', err)
        setError('Failed to connect to chat server')
        setConnectionStatus(false, false)
      }
    }

    connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'User left')
        wsRef.current = null
      }
      clearChat()
    }
  }, [roomId, userName, navigate, currentRoom?.pin, setConnectionStatus, setError, clearChat])

  // Send message
  const handleSendMessage = () => {
    if (!message.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const chatMessage = {
      type: 'MESSAGE',
      content: message.trim()
    }

    wsRef.current.send(JSON.stringify(chatMessage))
    setMessage('')
    inputRef.current?.focus()
  }

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Copy room link
  const copyRoomLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Leave room
  const handleLeaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User left')
      wsRef.current = null
    }
    clearChat()
    navigate('/tools/chat')
  }

  // Format time
  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return ''
    }
  }

  if (!userName) {
    return null
  }

  return (
    <div className="tool-page flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <Link 
            to="/tools/chat"
            className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 
                     hover:text-surface-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-surface-100">
                Room: {roomId}
              </h1>
              {currentRoom?.isCreator && currentRoom?.pin && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 
                               bg-amber-500/10 text-amber-400 text-xs rounded-md
                               border border-amber-500/20">
                  <Key className="w-3 h-3" />
                  PIN: {currentRoom.pin}
                </span>
              )}
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
            <p className="text-sm text-surface-500">
              <Clock className="w-3 h-3 inline mr-1" />
              Expires in ~{config.settings.maxRoomDurationHours} hours
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowParticipants(!showParticipants)}
            icon={Users}
          >
            <span className="hidden sm:inline">{participants.length}</span>
          </Button>

          <Button
            variant="secondary"
            onClick={copyRoomLink}
            icon={copied ? Check : Share2}
          >
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
          </Button>

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
      <div className="flex-1 flex gap-4 mt-4 overflow-hidden min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col card overflow-hidden min-w-0">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  {msg.type === 'system' ? (
                    <div className="text-center">
                      <span className="inline-block px-3 py-1.5 text-xs text-surface-500 
                                     bg-surface-800/50 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  ) : (
                    <div className={`flex w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%]">
                        <p className={`text-xs font-medium mb-1 ${
                          msg.isMe ? 'text-right text-teal-400' : 'text-left text-surface-300'
                        }`}>
                          {msg.isMe ? 'You' : msg.sender}
                        </p>
                        <div className={msg.isMe ? 'chat-bubble-sent' : 'chat-bubble-received'}>
                          {msg.content}
                        </div>
                        <p className={`text-xs text-surface-600 mt-1 ${
                          msg.isMe ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-surface-700/50">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-crimson-500/10 
                           border border-crimson-500/20 rounded-xl mb-3">
                <AlertCircle className="w-5 h-5 text-crimson-400 flex-shrink-0" />
                <span className="text-crimson-400 text-sm">{error}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
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
              className="w-64 card p-4 overflow-hidden"
            >
              <h3 className="font-medium text-surface-200 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 
                                  flex items-center justify-center text-white text-sm font-medium">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-surface-300 truncate">
                      {p.name}
                      {p.isMe && (
                        <span className="text-surface-500 ml-1">(you)</span>
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
