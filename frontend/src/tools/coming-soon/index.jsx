import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft, Bell } from 'lucide-react'
import { Button, Card } from '@/components'

/**
 * Coming Soon - Placeholder for tools not yet implemented
 */
export default function ComingSoon() {
  return (
    <div className="tool-page">
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl 
                        bg-gradient-to-br from-primary-500/20 to-purple-500/20 
                        flex items-center justify-center">
            <Clock className="w-12 h-12 text-primary-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-dark-100 mb-4">
            Coming Soon
          </h1>

          {/* Description */}
          <p className="text-dark-400 text-lg mb-8 max-w-md mx-auto">
            We're working hard to bring this tool to life. 
            It will be available in a future update.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button icon={ArrowLeft}>
                Back to Tools
              </Button>
            </Link>
            <Button 
              variant="secondary"
              icon={Bell}
              onClick={() => {
                // In a real app, this would trigger a notification signup
                alert('Notification feature coming soon!')
              }}
            >
              Notify Me
            </Button>
          </div>

          {/* Features Preview */}
          <Card className="mt-12 text-left bg-dark-800/30">
            <h3 className="text-sm font-medium text-dark-300 mb-4">
              🚀 What to expect
            </h3>
            <ul className="space-y-3 text-sm text-dark-500">
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">•</span>
                <span>Fast, client-side processing when possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">•</span>
                <span>Clean, minimal interface with no clutter</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">•</span>
                <span>No account required - just works instantly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-400 mt-1">•</span>
                <span>Privacy-first design with no data collection</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
