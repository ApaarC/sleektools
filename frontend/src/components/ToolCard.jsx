import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import clsx from 'clsx'

/**
 * ToolCard - Card component for displaying tools on homepage
 */
export default function ToolCard({ tool, index }) {
  const Icon = tool.icon
  const isComingSoon = tool.status === 'coming-soon'
  const isBeta = tool.status === 'beta'

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={!isComingSoon ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!isComingSoon ? { scale: 0.98 } : {}}
      className={clsx(
        'tool-card relative',
        isComingSoon && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Status Badge */}
      {(isComingSoon || isBeta) && (
        <div className="absolute top-3 right-3 z-10">
          {isComingSoon ? (
            <span className="badge badge-warning">
              <Clock className="w-3 h-3" />
              Soon
            </span>
          ) : (
            <span className="badge badge-info">Beta</span>
          )}
        </div>
      )}

      {/* Icon */}
      <motion.div
        whileHover={!isComingSoon ? { rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={clsx(
          'w-14 h-14 rounded-2xl flex items-center justify-center relative z-10',
          'bg-gradient-to-br from-primary-500/20 to-purple-500/20',
          'group-hover:from-primary-500/30 group-hover:to-purple-500/30',
          'transition-all duration-300'
        )}
      >
        <Icon className={clsx(
          'w-7 h-7',
          isComingSoon ? 'text-dark-400' : 'text-primary-400 group-hover:text-primary-300'
        )} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className={clsx(
          'font-semibold text-lg',
          isComingSoon ? 'text-dark-400' : 'text-dark-100 group-hover:text-white'
        )}>
          {tool.name}
        </h3>
        <p className={clsx(
          'text-sm mt-1',
          isComingSoon ? 'text-dark-500' : 'text-dark-400'
        )}>
          {tool.description}
        </p>
      </div>

      {/* Category Tag */}
      <div className="relative z-10 mt-2">
        <span className="text-xs text-dark-500 bg-dark-800/50 px-2 py-1 rounded-full">
          {tool.category}
        </span>
      </div>

      {/* Client-side indicator */}
      {tool.clientSide && !isComingSoon && (
        <div className="absolute bottom-3 right-3 z-10">
          <span className="text-xs text-green-400/70">
            Client-side
          </span>
        </div>
      )}
    </motion.div>
  )

  if (isComingSoon) {
    return cardContent
  }

  return (
    <Link to={tool.path} className="block">
      {cardContent}
    </Link>
  )
}
