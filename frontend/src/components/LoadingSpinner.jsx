import { motion } from 'framer-motion'
import clsx from 'clsx'

/**
 * LoadingSpinner - Animated loading indicator
 */
export default function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={clsx(
        sizes[size],
        'border-2 border-dark-600 border-t-primary-500 rounded-full',
        className
      )}
    />
  )
}
