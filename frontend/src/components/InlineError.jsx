import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, WifiOff, RefreshCw } from 'lucide-react'

/**
 * InlineError - A dismissible inline error banner for real-time features
 */
export function InlineError({ 
  message, 
  onDismiss, 
  onRetry,
  type = 'error',  // 'error' | 'warning' | 'connection'
  className = ''
}) {
  if (!message) return null

  const config = {
    error: {
      bgColor: 'bg-crimson-500/10',
      borderColor: 'border-crimson-500/20',
      textColor: 'text-crimson-400',
      icon: AlertTriangle
    },
    warning: {
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400',
      icon: AlertTriangle
    },
    connection: {
      bgColor: 'bg-surface-800',
      borderColor: 'border-surface-700',
      textColor: 'text-surface-300',
      icon: WifiOff
    }
  }

  const { bgColor, borderColor, textColor, icon: Icon } = config[type] || config.error

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-3 px-4 py-2.5 ${bgColor} border ${borderColor} rounded-lg ${className}`}
      >
        <Icon className={`w-4 h-4 ${textColor} flex-shrink-0`} />
        <p className={`text-sm ${textColor} flex-1`}>{message}</p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className={`p-1 rounded ${textColor} hover:bg-white/5 transition-colors`}
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 rounded ${textColor} hover:bg-white/5 transition-colors`}
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * ConnectionStatus - Shows real-time connection status
 */
export function ConnectionStatus({ 
  isConnected, 
  isReconnecting = false,
  className = '' 
}) {
  if (isConnected) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg ${className}`}
    >
      {isReconnecting ? (
        <>
          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="text-sm text-amber-400">Reconnecting...</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400">Disconnected</span>
        </>
      )}
    </motion.div>
  )
}

export default InlineError
