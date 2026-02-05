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
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  }

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
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
    </motion.button>
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
        <label className="block text-sm font-medium text-dark-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'input',
            Icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
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
        <label className="block text-sm font-medium text-dark-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={clsx(
          'code-editor',
          error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

/**
 * Card - Reusable card component
 */
export function Card({ children, className, hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'glass-card p-6',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
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
        'absolute z-50 px-2 py-1 text-xs font-medium text-white',
        'bg-dark-700 rounded-lg shadow-lg whitespace-nowrap',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'pointer-events-none',
        positions[position]
      )}>
        {content}
      </div>
    </div>
  )
}

/**
 * Divider - Horizontal divider
 */
export function Divider({ className }) {
  return (
    <div className={clsx('h-px bg-dark-700', className)} />
  )
}

/**
 * IconButton - Icon-only button
 */
export const IconButton = forwardRef(({ 
  icon: Icon, 
  variant = 'ghost',
  size = 'md',
  className,
  ...props 
}, ref) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        'btn rounded-xl flex items-center justify-center p-0',
        variant === 'ghost' && 'bg-transparent hover:bg-dark-800 text-dark-400 hover:text-dark-100',
        variant === 'primary' && 'bg-primary-500 hover:bg-primary-600 text-white',
        sizes[size],
        className
      )}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </motion.button>
  )
})

IconButton.displayName = 'IconButton'

export default {
  Button,
  Input,
  Textarea,
  Card,
  Badge,
  Tooltip,
  Divider,
  IconButton,
}
