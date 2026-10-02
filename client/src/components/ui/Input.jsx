import React from 'react'

/**
 * Standardized Design System Input / Textarea
 * Enforces unified typography, background, border, focus rings, and placeholder styles.
 */
export const Input = React.forwardRef(
  (
    {
      className = '',
      type = 'text',
      size = 'md',
      pill = false,
      error = false,
      icon: Icon,
      iconRight: IconRight,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-xs sm:text-sm',
      lg: 'px-5 py-3 text-sm sm:text-base',
    }[size] || 'px-4 py-2.5 text-xs sm:text-sm'

    const radiusClass = pill ? 'rounded-full' : 'rounded-[14px]'

    return (
      <div className='relative w-full flex items-center'>
        {Icon && (
          <div className='absolute left-3.5 pointer-events-none text-ink-subtle'>
            <Icon className='w-4 h-4' />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full ${sizeClasses} ${radiusClass} bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white text-ink placeholder:text-neutral-400 font-sans outline-none transition-all duration-200 border ${
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-line focus:border-primary focus:ring-2 focus:ring-primary/20'
          } ${Icon ? 'pl-10' : ''} ${IconRight ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {IconRight && (
          <div className='absolute right-3.5 pointer-events-none text-ink-subtle'>
            <IconRight className='w-4 h-4' />
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export const Textarea = React.forwardRef(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full px-4 py-3 rounded-[14px] bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white text-ink placeholder:text-neutral-400 font-sans outline-none transition-all duration-200 border ${
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-line focus:border-primary focus:ring-2 focus:ring-primary/20'
        } ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

export default Input
