import React from 'react'

/**
 * InteractiveHoverButton
 * High-performance, high-contrast primary CTA button with 21st.dev micro-animations.
 * Guaranteed visible text with Apple blue fill, tactile click scale, and animated arrow.
 */
export const InteractiveHoverButton = ({
  text = 'Sign In',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`group relative inline-flex h-[38px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#0066cc] hover:bg-[#0071e3] px-5 font-caption text-[13px] sm:text-[14px] font-medium text-white shadow-[0_2px_8px_rgba(0,102,204,0.25)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus active:scale-[0.96] select-none ${className}`}
      style={{ backgroundColor: '#0066cc', color: '#ffffff' }}
      {...props}
    >
      {/* Subtle glossy top highlight reflection */}
      <span className='pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/30' />

      {/* Button Content */}
      <div className='relative z-10 flex items-center gap-1.5 transition-transform duration-200'>
        <span className='font-semibold whitespace-nowrap text-white' style={{ color: '#ffffff' }}>
          {text}
        </span>
        {/* Animated Arrow Icon */}
        <svg
          className='w-3.5 h-3.5 text-white transition-transform duration-200 group-hover:translate-x-1 shrink-0'
          style={{ color: '#ffffff' }}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2.2}
            d='M14 5l7 7m0 0l-7 7m7-7H3'
          />
        </svg>
      </div>
    </button>
  )
}

export default InteractiveHoverButton
