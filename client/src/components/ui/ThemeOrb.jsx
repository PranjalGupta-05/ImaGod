import React from 'react'

export const ORB_THEMES = {
  blue: {
    gradient: 'radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 55%, #1d4ed8 100%)',
    shadow: '0 8px 18px -2px rgba(37, 99, 235, 0.40)',
    eyeColor: '#0a2540',
  },
  purple: {
    gradient: 'radial-gradient(circle at 35% 30%, #d8b4fe 0%, #8b5cf6 55%, #6d28d9 100%)',
    shadow: '0 8px 18px -2px rgba(139, 92, 246, 0.40)',
    eyeColor: '#270d4f',
  },
  gold: {
    gradient: 'radial-gradient(circle at 35% 30%, #fde047 0%, #eab308 55%, #b45309 100%)',
    shadow: '0 8px 18px -2px rgba(234, 179, 8, 0.40)',
    eyeColor: '#451a03',
  },
  emerald: {
    gradient: 'radial-gradient(circle at 35% 30%, #6ee7b7 0%, #10b981 55%, #065f46 100%)',
    shadow: '0 8px 18px -2px rgba(16, 185, 129, 0.40)',
    eyeColor: '#064e3b',
  },
  sky: {
    gradient: 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 55%, #0369a1 100%)',
    shadow: '0 8px 18px -2px rgba(2, 132, 199, 0.45)',
    eyeColor: '#082f49',
  },
  indigo: {
    gradient: 'radial-gradient(circle at 35% 30%, #a5b4fc 0%, #6366f1 55%, #4338ca 100%)',
    shadow: '0 8px 18px -2px rgba(99, 102, 241, 0.40)',
    eyeColor: '#1e1b4b',
  },
  pink: {
    gradient: 'radial-gradient(circle at 35% 30%, #f472b6 0%, #ec4899 55%, #be185d 100%)',
    shadow: '0 8px 18px -2px rgba(236, 72, 153, 0.40)',
    eyeColor: '#500724',
  },
  orange: {
    gradient: 'radial-gradient(circle at 35% 30%, #fb923c 0%, #ea580c 55%, #9a3412 100%)',
    shadow: '0 8px 18px -2px rgba(234, 88, 12, 0.45)',
    eyeColor: '#431407',
  },
}

export const ThemeOrb = ({
  theme = 'blue',
  icon: Icon,
  size = 'md',
  withEyes = false,
  className = '',
  gradient,
  shadow,
}) => {
  const conf = ORB_THEMES[theme] || ORB_THEMES.blue
  const sizeClasses =
    size === 'sm'
      ? 'w-9 h-9'
      : size === 'lg'
      ? 'w-14 h-14'
      : size === 'avatar'
      ? 'w-11 h-11'
      : 'w-12 h-12'

  return (
    <div
      className={`relative ${sizeClasses} rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 select-none ${className}`}
      style={{
        background: gradient || conf.gradient,
        boxShadow: shadow || conf.shadow,
      }}
    >
      {/* Specular curved glass highlight */}
      <div className='absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none' />

      {withEyes ? (
        <div className='flex items-center gap-1.5 mt-0.5 z-10 pointer-events-none'>
          <div
            className='w-1.5 h-2 rounded-full relative'
            style={{ backgroundColor: conf.eyeColor }}
          >
            <div className='w-0.5 h-0.5 rounded-full bg-white absolute top-0.5 left-0.5' />
          </div>
          <div
            className='w-1.5 h-2 rounded-full relative'
            style={{ backgroundColor: conf.eyeColor }}
          >
            <div className='w-0.5 h-0.5 rounded-full bg-white absolute top-0.5 left-0.5' />
          </div>
        </div>
      ) : Icon ? (
        <Icon className='w-5 h-5 text-white z-10 stroke-[2] drop-shadow-xs' />
      ) : null}
    </div>
  )
}

export default ThemeOrb
