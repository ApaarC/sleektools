import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

/**
 * Button - Reusable button component with variants
 */
export const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  className,
  ...props 
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }

  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

/**
 * Input - Reusable input component
 */
export const Input = forwardRef(({ 
  label,
  error,
  icon: Icon,
  className,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'input',
            Icon && 'pl-11',
            error && 'border-crimson-500/50 focus:border-crimson-500 focus:ring-crimson-500/20',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-crimson-400">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

/**
 * Textarea - Reusable textarea component
 */
export const Textarea = forwardRef(({ 
  label,
  error,
  className,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          'code-editor',
          error && 'border-crimson-500/50 focus:border-crimson-500 focus:ring-crimson-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-crimson-400">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

/**
 * Card - Reusable card component
 */
export function Card({ children, className, padding = true, ...props }) {
  return (
    <div
      className={clsx(
        'card',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Badge - Status badge component
 */
export function Badge({ children, variant = 'info', className }) {
  const variants = {
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info',
    neutral: 'badge-neutral',
  }

  return (
    <span className={clsx(variants[variant], className)}>
      {children}
    </span>
  )
}

/**
 * Tooltip - Simple tooltip wrapper
 */
export function Tooltip({ children, content, position = 'top' }) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative group">
      {children}
      <div className={clsx(
        'absolute z-50 px-2.5 py-1.5 text-xs font-medium',
        'bg-surface-750 text-surface-100 border border-surface-600/50',
        'rounded-lg shadow-elevation-2 whitespace-nowrap',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
        'pointer-events-none',
        positions[position]
      )}>
        {content}
      </div>
    </div>
  )
}

/**
 * IconButton - Icon-only button
 */
export function IconButton({ 
  icon: Icon, 
  label, 
  variant = 'ghost',
  size = 'md',
  className,
  ...props 
}) {
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <Tooltip content={label}>
      <button
        aria-label={label}
        className={clsx(
          'btn-icon',
          sizes[size],
          className
        )}
        {...props}
      >
        <Icon className={iconSizes[size]} />
      </button>
    </Tooltip>
  )
}

/**
 * Divider - Horizontal divider
 */
export function Divider({ className }) {
  return <div className={clsx('divider my-4', className)} />
}

/**
 * LoadingSpinner - Animated loading indicator
 */
export function LoadingSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={clsx(
        'border-2 border-surface-600 border-t-surface-300 rounded-full',
        sizes[size],
        className
      )}
    />
  )
}

/**
 * EmptyState - Placeholder for empty content
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}) {
  return (
    <div className={clsx('text-center py-12', className)}>
      {Icon && (
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface-800 
                      border border-surface-700/50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-surface-500" />
        </div>
      )}
      {title && (
        <h3 className="text-base font-medium text-surface-200 mb-1">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-surface-500 mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
