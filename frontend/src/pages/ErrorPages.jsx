import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle,
  FileQuestion,
  WifiOff,
  Lock,
  Clock,
  Ghost
} from 'lucide-react'
import { Button } from '@/components'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: { 
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.2
    }
  }
}

// Base Error Layout Component
function ErrorLayout({ 
  code, 
  title, 
  description, 
  icon: Icon, 
  iconColor = 'text-amber-400',
  children,
  showHomeButton = true,
  showBackButton = true
}) {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        <motion.div 
          className="mb-6 inline-flex"
          variants={iconVariants}
        >
          <div className={`w-24 h-24 rounded-2xl bg-surface-800/50 border border-surface-700 flex items-center justify-center ${iconColor}`}>
            <Icon className="w-12 h-12" />
          </div>
        </motion.div>
        
        {/* Error Code */}
        {code && (
          <motion.h1 
            className="text-7xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-amber-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">
              {code}
            </span>
          </motion.h1>
        )}
        
        {/* Title */}
        <motion.h2 
          className="text-2xl font-semibold text-surface-100 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {title}
        </motion.h2>
        
        {/* Description */}
        <motion.p 
          className="text-surface-400 mb-8 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {description}
        </motion.p>
        
        {/* Custom content slot */}
        {children}
        
        {/* Action Buttons */}
        <motion.div 
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}
          
          {showHomeButton && (
            <Link
              to="/"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

// 404 - Not Found
export function NotFoundPage() {
  return (
    <ErrorLayout
      code="404"
      title="Page Not Found"
      description="Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or maybe it never existed in the first place."
      icon={FileQuestion}
      iconColor="text-amber-400"
    />
  )
}

// 403 - Forbidden / Unauthorized
export function ForbiddenPage() {
  return (
    <ErrorLayout
      code="403"
      title="Access Denied"
      description="You don't have permission to access this resource. If you think this is a mistake, please try logging in again."
      icon={Lock}
      iconColor="text-crimson-400"
    />
  )
}

// 500 - Server Error
export function ServerErrorPage({ onRetry }) {
  return (
    <ErrorLayout
      code="500"
      title="Server Error"
      description="Something went wrong on our end. Our team has been notified and is working to fix the issue."
      icon={AlertTriangle}
      iconColor="text-crimson-400"
    >
      {onRetry && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      )}
    </ErrorLayout>
  )
}

// Connection Error / Offline
export function ConnectionErrorPage({ onRetry }) {
  return (
    <ErrorLayout
      code={null}
      title="Connection Lost"
      description="Unable to connect to the server. Please check your internet connection and try again."
      icon={WifiOff}
      iconColor="text-amber-400"
    >
      {onRetry && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </motion.div>
      )}
    </ErrorLayout>
  )
}

// Room/Canvas Not Found
export function RoomNotFoundPage({ type = 'room' }) {
  const typeLabel = type === 'canvas' ? 'Canvas' : 'Room'
  
  return (
    <ErrorLayout
      code={null}
      title={`${typeLabel} Not Found`}
      description={`This ${type} doesn't exist or has expired. ${type === 'canvas' ? 'Canvases expire after 24 hours.' : 'Rooms expire after a period of inactivity.'}`}
      icon={Ghost}
      iconColor="text-surface-400"
    >
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <Link
          to={type === 'canvas' ? '/tools/canvas' : '/tools/chat'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors"
        >
          Create New {typeLabel}
        </Link>
      </motion.div>
    </ErrorLayout>
  )
}

// Session Expired
export function SessionExpiredPage() {
  return (
    <ErrorLayout
      code={null}
      title="Session Expired"
      description="Your session has timed out due to inactivity. Please refresh the page to continue."
      icon={Clock}
      iconColor="text-amber-400"
    >
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Page
        </button>
      </motion.div>
    </ErrorLayout>
  )
}

// Generic Error with custom message
export function GenericErrorPage({ 
  title = 'Something Went Wrong', 
  description = 'An unexpected error occurred. Please try again later.',
  onRetry
}) {
  return (
    <ErrorLayout
      code={null}
      title={title}
      description={description}
      icon={AlertTriangle}
      iconColor="text-amber-400"
    >
      {onRetry && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </motion.div>
      )}
    </ErrorLayout>
  )
}

// Default export for backwards compatibility
export default NotFoundPage
