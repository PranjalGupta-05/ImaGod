import React from 'react'

/**
 * Standardized Studio Card & Double-Card System
 * Delivers exact 24px outer / 18px inner border-radius, hairline borders,
 * and unified card shadow tokens.
 */
export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[24px] border border-line p-2.5 shadow-card ${
        hoverEffect ? 'hover:shadow-card-hover transition-all duration-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardInner = ({
  children,
  className = '',
  dashed = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-[18px] p-6 sm:p-7 relative overflow-hidden transition-all duration-200 ${
        dashed ? 'border border-dashed' : 'border border-line'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Standardized Page Header for Tool & Feature Pages
 */
export const PageHeader = ({
  title,
  subtitle,
  className = '',
  badge,
}) => {
  return (
    <div className={`mb-4 sm:mb-6 text-center flex flex-col items-center select-none ${className}`}>
      {badge && (
        <span className='mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold font-sans'>
          {badge}
        </span>
      )}
      <h1 className='text-2xl sm:text-3xl lg:text-[34px] font-bold text-ink tracking-tight leading-tight font-primary'>
        {title}
      </h1>
      {subtitle && (
        <p className='text-xs sm:text-sm md:text-base text-ink-muted mt-1.5 max-w-[540px] mx-auto leading-relaxed font-sans'>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default Card
