import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'

/**
 * ToolCard - Premium card component for displaying tools
 */
export default function ToolCard({ tool, index }) {
  const Icon = tool.icon
  const isComingSoon = tool.status === 'coming-soon'
  const isBeta = tool.status === 'beta'

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={clsx(
        'tool-card group',
        isComingSoon && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Status Badge */}
      {(isComingSoon || isBeta) && (
        <div className="absolute top-4 right-4 z-10">
          {isComingSoon ? (
            <span className="badge-neutral">
              <Clock className="w-3 h-3" />
              Soon
            </span>
          ) : (
            <span className="badge-info">Beta</span>
          )}
        </div>
      )}

      {/* Content layout - Left aligned */}
      <div className="flex items-start gap-4 flex-1">
        {/* Icon */}
        <div className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
          'bg-surface-750 border border-surface-600/30',
          'group-hover:border-surface-500/50 transition-colors duration-200',
          isComingSoon && 'opacity-60'
        )}>
          <Icon className={clsx(
            'w-5 h-5',
            isComingSoon ? 'text-surface-500' : 'text-surface-200 group-hover:text-surface-50'
          )} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={clsx(
              'font-medium text-base truncate',
              isComingSoon ? 'text-surface-400' : 'text-surface-100 group-hover:text-surface-50'
            )}>
              {tool.name}
            </h3>
            {!isComingSoon && (
              <ArrowUpRight className="w-4 h-4 text-surface-500 opacity-0 group-hover:opacity-100 
                                      transition-opacity duration-150 flex-shrink-0" />
            )}
          </div>
          <p className={clsx(
            'text-sm line-clamp-2',
            isComingSoon ? 'text-surface-600' : 'text-surface-400'
          )}>
            {tool.description}
          </p>
        </div>
      </div>

      {/* Bottom row - pushed to bottom with mt-auto */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-700/30">
        <span className="text-xs text-surface-500 bg-surface-800/50 px-2 py-1 rounded-md">
          {tool.category}
        </span>
        {tool.clientSide && !isComingSoon && (
          <span className="text-xs text-teal-500/80">
            Client-side
          </span>
        )}
      </div>
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
