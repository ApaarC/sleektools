import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PenTool,
  Plus,
  Users,
  Clock,
  Share2,
  Zap,
  ArrowRight,
  Link as LinkIcon
} from 'lucide-react'
import { Button, Input, Card } from '@/components'
import config from './config'

/**
 * Generates a secure canvas token (UUID-like)
 */
function generateCanvasToken() {
  // Generate a URL-safe base64-like token
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
      <div className="w-9 h-9 rounded-lg bg-surface-700/50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-amber-400" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-surface-200">{title}</h3>
        <p className="text-xs text-surface-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

export default function CollabCanvas() {
  const navigate = useNavigate()
  
  const [canvasToken, setCanvasToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Create a new canvas
  const handleCreateCanvas = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const token = generateCanvasToken()
      
      // Call backend API to create the canvas
      const response = await fetch(`${config.settings.apiEndpoint}/canvas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create canvas')
      }

      const data = await response.json()
      
      // Navigate to the canvas with the token in URL
      navigate(`/c/${data.token}`)
    } catch (err) {
      setError('Failed to create canvas. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  // Join an existing canvas
  const handleJoinCanvas = useCallback(async () => {
    if (!canvasToken.trim()) {
      setError('Please enter a canvas link or token')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Extract token from URL if full URL is pasted
      let token = canvasToken.trim()
      if (token.includes('/c/')) {
        token = token.split('/c/').pop()
      }
      
      // Check if canvas exists
      const response = await fetch(`${config.settings.apiEndpoint}/canvas/${token}/exists`)
      
      if (!response.ok) {
        throw new Error('Failed to check canvas')
      }

      const { exists } = await response.json()
      
      if (!exists) {
        setError('Canvas not found or has expired')
        setIsLoading(false)
        return
      }

      navigate(`/c/${token}`)
    } catch (err) {
      setError('Failed to join canvas. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [canvasToken, navigate])

  return (
    <div className="tool-page">
      {/* Header */}
      <div className="tool-header">
        <div className="w-11 h-11 rounded-xl bg-surface-800 border border-surface-700/50
                      flex items-center justify-center">
          <PenTool className="w-5 h-5 text-surface-300" />
        </div>
        <div>
          <h1 className="tool-title">Collab Canvas</h1>
          <p className="tool-description">Real-time collaborative whiteboard - draw together instantly</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <FeatureCard 
            icon={Zap} 
            title="Instant" 
            description="No signup needed" 
          />
          <FeatureCard 
            icon={Users} 
            title="Collaborative" 
            description="Real-time sync" 
          />
          <FeatureCard 
            icon={Clock} 
            title="24h Duration" 
            description="Auto-expires" 
          />
        </div>

        {/* Main Actions */}
        <div className="space-y-6">
          {/* Create Canvas */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-100">Create New Canvas</h2>
                <p className="text-sm text-surface-500">Start a new collaborative whiteboard</p>
              </div>
            </div>
            
            <Button
              onClick={handleCreateCanvas}
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Canvas
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </Card>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-surface-700/50" />
            <span className="text-sm text-surface-500">or join existing</span>
            <div className="flex-1 h-px bg-surface-700/50" />
          </div>

          {/* Join Canvas */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-100">Join Canvas</h2>
                <p className="text-sm text-surface-500">Enter a canvas link or token</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Paste canvas link or token..."
                value={canvasToken}
                onChange={(e) => setCanvasToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinCanvas()}
                className="input"
              />
              
              <Button
                onClick={handleJoinCanvas}
                disabled={isLoading || !canvasToken.trim()}
                variant="secondary"
                className="w-full btn-secondary"
              >
                {isLoading ? 'Joining...' : 'Join Canvas'}
              </Button>
            </div>
          </Card>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-crimson-500/10 border border-crimson-500/20"
            >
              <p className="text-sm text-crimson-400">{error}</p>
            </motion.div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-medium text-surface-200 mb-4">How it works</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-sm font-medium text-surface-300">1</div>
              <span className="text-sm text-surface-400">Create canvas</span>
            </div>
            <ArrowRight className="w-4 h-4 text-surface-600 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-sm font-medium text-surface-300">2</div>
              <span className="text-sm text-surface-400">Share the link</span>
            </div>
            <ArrowRight className="w-4 h-4 text-surface-600 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-sm font-medium text-surface-300">3</div>
              <span className="text-sm text-surface-400">Draw together!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
