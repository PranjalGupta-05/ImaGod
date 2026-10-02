import React from 'react'

/**
 * Standardized Design System Button
 * Unifies primary, secondary, ghost, outline, and accent actions with fixed sizes,
 * matching hover/focus/active scale/disabled interactions across all pages.
 */
export const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      icon: Icon,
      iconRight: IconRight,
      className = '',
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-primary font-semibold select-none cursor-pointer transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100 whitespace-nowrap'

    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs rounded-full gap-1.5',
      md: 'px-5 py-2.5 text-xs sm:text-sm rounded-full gap-2',
      lg: 'px-7 py-3 text-sm sm:text-base rounded-full gap-2.5',
      icon: 'p-2 rounded-full aspect-square',
    }[size] || 'px-5 py-2.5 text-xs sm:text-sm rounded-full gap-2'

    const variantStyles = {
      primary:
        'bg-primary hover:bg-primary-focus text-white shadow-xs hover:shadow-sm active:bg-primary-dark',
      secondary:
        'bg-white hover:bg-neutral-50 text-ink border border-line shadow-2xs hover:border-neutral-300',
      ghost:
        'bg-transparent hover:bg-neutral-100/70 text-ink-muted hover:text-ink active:bg-neutral-200/50',
      outline:
        'bg-transparent hover:bg-neutral-50 text-ink border border-neutral-300 hover:border-neutral-400',
      subtle:
        'bg-neutral-100 hover:bg-neutral-200 text-ink border border-transparent',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:bg-rose-800',
      purple:
        'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs',
      gold:
        'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-neutral-900 shadow-xs font-bold',
      emerald:
        'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs',
      sky:
        'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-xs',
      orange:
        'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-xs',
    }[variant] || 'bg-primary hover:bg-primary-focus text-white shadow-xs'

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {loading ? (
          <div className='w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin' />
        ) : Icon ? (
          <Icon className='w-4 h-4 shrink-0' />
        ) : null}
        {children && <span>{children}</span>}
        {!loading && IconRight ? <IconRight className='w-4 h-4 shrink-0' /> : null}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
