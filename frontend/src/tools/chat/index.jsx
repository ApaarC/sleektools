import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Plus,
  LogIn,
  Users,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Hash,
  Lock
} from 'lucide-react'
import { Button, Input, Card } from '@/components'
import { useChatStore } from '@/store'
import config from './config'

/**
 * Generates a random room ID
 */
function generateRoomId(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function QuickChat() {
  const navigate = useNavigate()
  const { setUserName, setRoom } = useChatStore()
  
  const [mode, setMode] = useState('create') // 'create' or 'join'
  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [pin, setPin] = useState('')
  const [usePin, setUsePin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Create a new room
  const handleCreateRoom = useCallback(async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const newRoomId = generateRoomId(config.settings.roomIdLength)
      
      // In a real app, we'd create the room on the server first
      // For now, we'll navigate directly and let the room component handle creation
      setUserName(name.trim())
      setRoom({
        id: newRoomId,
        pin: usePin ? pin : null,
        isCreator: true
      })
      
      navigate(`/r/${newRoomId}`)
    } catch (err) {
      setError('Failed to create room. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [name, usePin, pin, navigate, setUserName, setRoom])

  // Join an existing room
  const handleJoinRoom = useCallback(async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!roomId.trim()) {
      setError('Please enter a room ID')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      setUserName(name.trim())
      setRoom({
        id: roomId.toUpperCase().trim(),
        pin: pin || null,
        isCreator: false
      })
      
      navigate(`/r/${roomId.toUpperCase().trim()}`)
    } catch (err) {
      setError('Failed to join room. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [name, roomId, pin, navigate, setUserName, setRoom])

  return (
    <div className="tool-page">
      {/* Header */}
      <div className="tool-header">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 
                      flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="tool-title">Quick Chat</h1>
          <p className="tool-description">Create instant, private chat rooms that auto-expire</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <FeatureCard 
            icon={Zap} 
            title="Instant" 
            description="No signup required" 
          />
          <FeatureCard 
            icon={Shield} 
            title="Private" 
            description="Messages not stored" 
          />
          <FeatureCard 
            icon={Clock} 
            title="Auto-Expire" 
            description="Rooms delete in 6 hours" 
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
                      font-medium transition-all duration-200 ${
              mode === 'create'
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
            }`}
          >
            <Plus className="w-5 h-5" />
            Create Room
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl 
                      font-medium transition-all duration-200 ${
              mode === 'join'
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
            }`}
          >
            <LogIn className="w-5 h-5" />
            Join Room
          </button>
        </div>

        {/* Form */}
        <Card className="p-6 md:p-8">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'create' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Name Input */}
            <Input
              label="Your Name"
              placeholder="Enter your display name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              icon={Users}
              error={error && !name.trim() ? 'Name is required' : ''}
            />

            {/* Room ID (Join mode only) */}
            {mode === 'join' && (
              <Input
                label="Room ID"
                placeholder="Enter 6-character room code"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.toUpperCase())
                  setError('')
                }}
                icon={Hash}
                maxLength={8}
                error={error && !roomId.trim() ? 'Room ID is required' : ''}
              />
            )}

            {/* PIN (optional) */}
            {mode === 'create' && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePin}
                    onChange={(e) => setUsePin(e.target.checked)}
                    className="w-5 h-5 rounded bg-dark-700 border-dark-600 
                             text-primary-500 focus:ring-primary-500/50"
                  />
                  <span className="text-dark-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Protect with PIN
                  </span>
                </label>
                
                {usePin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Input
                      placeholder="Enter 4-digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      type="password"
                      maxLength={4}
                      icon={Lock}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {mode === 'join' && (
              <Input
                label="Room PIN (if required)"
                placeholder="Enter PIN if room is protected"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                type="password"
                maxLength={4}
                icon={Lock}
              />
            )}

            {/* Error Message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <Button
              onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
              className="w-full"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </Button>
          </motion.div>
        </Card>

        {/* Info */}
        <Card className="mt-6 bg-dark-800/30">
          <h3 className="text-sm font-medium text-dark-300 mb-3">💡 How it works</h3>
          <ul className="text-sm text-dark-500 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-400">1.</span>
              Create a room and share the link or room code
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400">2.</span>
              Others join using the code - no signup needed
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400">3.</span>
              Chat in real-time with instant message delivery
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400">4.</span>
              Room auto-deletes after {config.settings.maxRoomDurationHours} hours
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 text-center"
    >
      <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary-500/10 
                    flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-400" />
      </div>
      <h3 className="font-medium text-dark-200 mb-1">{title}</h3>
      <p className="text-xs text-dark-500">{description}</p>
    </motion.div>
  )
}
