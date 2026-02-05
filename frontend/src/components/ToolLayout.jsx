import { Suspense } from 'react'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import LoadingSpinner from './LoadingSpinner'

/**
 * ToolLayout - Shared layout wrapper for all tool pages
 * Provides consistent navbar, footer, and page transitions
 */
export default function ToolLayout({ children }) {
  return (
    <div className="page-container">
      <Navbar />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex-1"
      >
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </motion.main>
      
      <Footer />
    </div>
  )
}

/**
 * PageLoader - Full page loading state
 */
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <LoadingSpinner size="lg" />
        <p className="text-dark-400 text-sm">Loading tool...</p>
      </motion.div>
    </div>
  )
}
