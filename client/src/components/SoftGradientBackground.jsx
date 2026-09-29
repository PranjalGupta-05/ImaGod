import React from 'react'

/**
 * SoftGradientBackground
 * Inspired by 21st.dev "Soft gradient Background Animation".
 * Renders smooth, organically drifting pastel gradient blobs with deep gaussian diffusion.
 * Creates an elegant, ambient background that refracts through glassmorphism elements.
 */
export const SoftGradientBackground = ({ className = '', children }) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#fafafc] select-none ${className}`}>
      {/* Background Base Gradient */}
      <div className='absolute inset-0 bg-gradient-to-tr from-[#edf5ff] via-[#f7f4ff] to-[#fff8f0] opacity-90' />

      {/* Floating Animated Gradient Mesh Blobs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none filter blur-[100px] sm:blur-[140px] opacity-60'>
        {/* Blob 1: Radiant Sky / Cyan (Top Left) */}
        <div
          className='absolute -top-20 -left-20 w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full bg-gradient-to-br from-[#38bdf8]/30 via-[#7dd3fc]/35 to-[#bae6fd]/25 animate-soft-float-1'
          style={{ willChange: 'transform' }}
        />

        {/* Blob 2: Mint / Spring Emerald (Top Center) */}
        <div
          className='absolute -top-24 left-[26%] w-[480px] h-[480px] sm:w-[620px] sm:h-[620px] rounded-full bg-gradient-to-b from-[#34d399]/20 via-[#6ee7b7]/30 to-[#a7f3d0]/25 animate-soft-float-2'
          style={{ willChange: 'transform' }}
        />

        {/* Blob 3: Soft Sunset Butter / Apricot (Top Right) */}
        <div
          className='absolute -top-16 -right-16 w-[520px] h-[520px] sm:w-[660px] sm:h-[660px] rounded-full bg-gradient-to-bl from-[#fb923c]/20 via-[#fde68a]/35 to-[#fed7aa]/25 animate-soft-float-3'
          style={{ willChange: 'transform' }}
        />

        {/* Blob 4: Soft Rose / Blush (Center Lower) */}
        <div
          className='absolute top-36 left-[22%] w-[460px] h-[460px] sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-tr from-[#f472b6]/20 via-[#fbcfe8]/30 to-[#fed7aa]/25 animate-soft-float-1'
          style={{ animationDirection: 'reverse', animationDuration: '24s', willChange: 'transform' }}
        />

        {/* Blob 5: Soft Lavender / Periwinkle (Right Center) */}
        <div
          className='absolute top-28 right-[18%] w-[440px] h-[440px] sm:w-[560px] sm:h-[560px] rounded-full bg-gradient-to-tl from-[#818cf8]/25 via-[#c4b5fd]/30 to-[#e0e7ff]/20 animate-soft-float-2'
          style={{ animationDirection: 'reverse', animationDuration: '20s', willChange: 'transform' }}
        />
      </div>

      {/* Gentle bottom feather into canvas */}
      <div className='absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none' />

      {/* Foreground Content */}
      {children && (
        <div className='relative z-10 w-full h-full flex flex-col items-center justify-center'>
          {children}
        </div>
      )}
    </div>
  )
}

export default SoftGradientBackground
