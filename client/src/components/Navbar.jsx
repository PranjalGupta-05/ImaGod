import React, { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { GlassEffect, GlassFilter } from '@/components/ui/liquid-glass'

// Navigation items � includes all Cloudinary AI tools
const NAV_ITEMS = [
  {
    path: '/',
    label: 'Overview',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
      </svg>
    ),
  },
  {
    path: '/result',
    label: 'Text to Image',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
      </svg>
    ),
  },
  {
    path: '/remove-bg',
    label: 'Remove BG',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M18 10L14 6a2 2 0 00-2.8 0L3.5 13.7a2 2 0 000 2.8l3.5 3.5a2 2 0 002.8 0L18 11.8a1.3 1.3 0 000-1.8z' />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3.8 14.5l5.2 5.2' />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M20 2v3m-1.5-1.5h3' />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M17 17v3m-1.5-1.5h3' />
      </svg>
    ),
  },
  {
    path: '/enhance',
    label: 'Enhance',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z' />
      </svg>
    ),
  },
  {
    path: '/unblur',
    label: 'AI Unblur',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <circle cx='12' cy='12' r='3.5' strokeWidth={1.8} />
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M3 9V5a2 2 0 012-2h4m10 0h4a2 2 0 012 2v4m0 10v4a2 2 0 01-2 2h-4m-10 0H5a2 2 0 01-2-2v-4' />
      </svg>
    ),
  },
  {
    path: '/ai-editor',
    label: 'AI Editor',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
      </svg>
    ),
  },
  {
    path: '/gen-fill',
    label: 'Gen Fill',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' />
      </svg>
    ),
  },
  {
    path: '/history',
    label: 'History',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    ),
  },
  {
    path: '/usage',
    label: 'Usage',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
      </svg>
    ),
  },
  {
    path: '/buycredit',
    label: 'Pricing',
    icon: (
      <svg className='w-[17px] h-[17px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' />
      </svg>
    ),
  },
]
const Navbar = () => {
  const { user, setShowLogin, logout, credit } = useContext(AppContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  return (
    <>
      {/* ── TOP FLOATING SINGLE GLASS PILL NAVBAR ── */}
      <div className='fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-4 pointer-events-none select-none flex justify-center'>
        <GlassFilter />
        <div className='relative w-full max-w-[1140px] pointer-events-auto'>
          <header role='banner' className='w-full'>
            <GlassEffect
              className='w-full h-[56px] sm:h-[60px] rounded-full px-4 sm:px-6'
              contentClassName='flex items-center justify-between'
            >
              {/* ── ZONE 1: LEFT (Brand Name) ── */}
              <div className='flex items-center shrink-0'>
                <Link
                  to='/'
                  aria-label='Imagify Home'
                  className='flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus transition-transform active:scale-95 group'
                >
                  <img
                    src="/logo.png"
                    alt="Imagify"
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 transition-transform group-hover:scale-105 duration-200"
                  />
                  <span className='font-display text-ink font-bold text-[18px] tracking-tight lowercase'>
                    imagify
                  </span>
                </Link>
              </div>

              {/* ── ZONE 2: CENTER (Direct Animated Gliding Navigation on the single capsule surface) ── */}
              <nav
                role='navigation'
                aria-label='Primary Navigation'
                className='hidden md:flex items-center gap-1.5 lg:gap-2'
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path

                  return (
                    <button
                      key={item.path}
                      type='button'
                      onClick={() => navigate(item.path)}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative flex items-center justify-center rounded-full transition-colors duration-200 h-[36px] min-w-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus select-none group ${
                        isActive
                          ? 'text-ink px-3'
                          : 'text-[#666668] hover:text-ink hover:bg-black/[0.035] w-[36px]'
                      }`}
                    >
                      <span className='flex items-center justify-center shrink-0'>
                        {item.icon}
                      </span>

                      {/* Label */}
                      <div
                        className={`overflow-hidden flex items-center h-full py-0.5 transition-all duration-300 ${isActive ? 'max-w-[120px] opacity-100 ml-1.5' : 'max-w-0 opacity-0 ml-0'}`}
                      >
                        <span className='font-semibold text-[13px] whitespace-nowrap select-none text-ink leading-normal'>
                          {item.label}
                        </span>
                      </div>

                      {/* Accessible Micro-Tooltip for icon-only inactive tabs */}
                      {!isActive && (
                        <div
                          role='tooltip'
                          style={{ backgroundColor: '#1d1d1f', color: '#ffffff' }}
                          className='pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 py-1 px-2.5 bg-[#1d1d1f] text-white text-[11px] font-medium rounded-md whitespace-nowrap shadow-xl border border-white/10 z-50'
                        >
                          {item.label}
                        </div>
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* ── ZONE 3: RIGHT (LOG IN + Black Spiral SIGN UP Button OR Profile) ── */}
              <div className='flex items-center gap-3 sm:gap-4 shrink-0'>
                {user ? (
                  <div className='flex items-center gap-2.5'>
                    {/* Credit Balance Badge */}
                    <button
                      type='button'
                      onClick={() => navigate('/buycredit')}
                      className='flex items-center gap-1.5 bg-black/[0.035] hover:bg-black/[0.06] border border-black/[0.06] px-3.5 py-1.5 rounded-full text-ink font-caption text-[13px] active:scale-[0.97] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus'
                      title='View credit balance and purchase more'
                      aria-label={`Credits balance: ${credit !== false ? credit : 0}`}
                    >
                      <img src={assets.credit_star} alt='' className='w-4 h-4' />
                      <span className='font-semibold text-primary'>{credit !== false ? credit : '—'}</span>
                      <span className='text-[#7a7a7a] text-[12px] hidden sm:inline'>Credits</span>
                    </button>

                    {/* Profile Avatar */}
                    <button
                      type='button'
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      aria-label='User Profile Menu'
                      aria-expanded={profileDropdownOpen}
                      className='w-9 h-9 rounded-full bg-white border border-black/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-center overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus active:scale-[0.97] transition-transform'
                    >
                      <img src={assets.profile_icon} alt='' className='w-6 h-6 object-cover' />
                    </button>
                  </div>
                ) : (
                  <div className='flex items-center gap-1.5 sm:gap-2.5'>
                    {/* Secondary LOG IN Text Button */}
                    <button
                      type='button'
                      onClick={() => setShowLogin('Login')}
                      className='text-[11px] sm:text-[12px] font-bold tracking-wider uppercase text-[#1d1d1f] hover:text-primary px-2.5 sm:px-3 py-1.5 rounded-full transition-colors active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus select-none'
                    >
                      LOG IN
                    </button>

                    {/* Primary SIGN UP Button with Spiral Icon */}
                    <button
                      type='button'
                      onClick={() => setShowLogin('Sign Up')}
                      aria-label='Sign Up'
                      className='group relative inline-flex h-[36px] sm:h-[38px] items-center justify-center gap-2 rounded-full bg-[#18181b] hover:bg-black text-white px-4 sm:px-5 text-[11px] sm:text-[12px] font-bold tracking-wider uppercase shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-200 active:scale-95 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus'
                    >
                      {/* Spiral Swirl Icon */}
                      <svg
                        className='w-4 h-4 text-white shrink-0 transition-transform duration-300 group-hover:rotate-90'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={1.8}
                      >
                        <path strokeLinecap='round' d='M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0' />
                        <path strokeLinecap='round' d='M12 7a5 5 0 1 0 5 5' />
                        <path strokeLinecap='round' d='M12 4a8 8 0 1 0 8 8' />
                      </svg>
                      <span>SIGN UP</span>
                    </button>
                  </div>
                )}
              </div>
            </GlassEffect>
          </header>

          {/* Profile Dropdown rendered outside GlassEffect so overflow-hidden doesn't clip it! */}
          {user && profileDropdownOpen && (
            <div
              className='absolute right-2 sm:right-4 top-[64px] w-48 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-[14px] shadow-lg py-1.5 z-50 text-ink font-caption pointer-events-auto'
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div className='px-3.5 py-2 border-b border-black/[0.06] text-[12px] text-[#7a7a7a] truncate'>
                Signed in as <span className='font-semibold text-ink'>{user.name}</span>
              </div>
              <button
                type='button'
                onClick={() => {
                  setProfileDropdownOpen(false)
                  navigate('/buycredit')
                }}
                className='w-full text-left px-3.5 py-2 hover:bg-black/[0.04] text-[13px] flex items-center justify-between text-ink'
              >
                <span>Buy Credits</span>
                <span className='text-primary font-semibold'>{credit}</span>
              </button>
              <button
                type='button'
                onClick={() => {
                  setProfileDropdownOpen(false)
                  navigate('/usage')
                }}
                className='w-full text-left px-3.5 py-2 hover:bg-black/[0.04] text-[13px] flex items-center justify-between text-ink'
              >
                <span>Usage & Analytics</span>
              </button>
              <button
                type='button'
                onClick={() => {
                  setProfileDropdownOpen(false)
                  logout()
                }}
                className='w-full text-left px-3.5 py-2 hover:bg-black/[0.04] text-[13px] text-[#7a7a7a] hover:text-ink'
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FLOATING BOTTOM NAV BAR ── */}
      <div className='md:hidden fixed inset-x-0 bottom-4 mx-auto z-50 w-fit max-w-[95vw] pointer-events-auto'>
        <nav
          role='navigation'
          aria-label='Mobile Primary Navigation'
          className='bg-white/30 backdrop-blur-md border border-white/40 shadow-sm rounded-full px-2.5 py-2 flex items-center gap-0.5'
        >
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <button
                key={item.path}
                type='button'
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
                  isActive
                    ? 'gap-1.5 px-3 py-2 text-ink font-semibold bg-white/90 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-black/[0.04]'
                    : 'w-9 h-9 text-[#86868b] hover:text-ink'
                }`}
              >
                <span className='flex items-center justify-center shrink-0'>{item.icon}</span>
                {isActive && (
                  <span className='text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap'>
                    {item.label}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default Navbar
