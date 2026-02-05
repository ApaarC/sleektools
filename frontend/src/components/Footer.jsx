import { motion } from 'framer-motion'
import { Heart, Shield, Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-dark-700/50 bg-dark-900/50">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tagline */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-dark-400"
          >
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-green-400" />
              No login
            </span>
            <span className="text-dark-600">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              No tracking
            </span>
            <span className="text-dark-600">•</span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-400" />
              Instant tools
            </span>
          </motion.div>

          {/* Copyright */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-dark-500"
          >
            © {new Date().getFullYear()} SleekTools. Open source & privacy-first.
          </motion.p>
        </div>
      </div>
    </footer>
  )
}
