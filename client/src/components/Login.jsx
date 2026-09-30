import React, { useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

// Avatar Orb matching the signature design
const AvatarOrb = ({ theme = 'blue' }) => {
  const configs = {
    blue: {
      gradient: 'radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 55%, #1d4ed8 100%)',
      shadow: '0 8px 18px -2px rgba(37,99,235,0.40)',
      eyeColor: '#0a2540',
    },
    purple: {
      gradient: 'radial-gradient(circle at 35% 30%, #d8b4fe 0%, #8b5cf6 55%, #6d28d9 100%)',
      shadow: '0 8px 18px -2px rgba(139,92,246,0.40)',
      eyeColor: '#270d4f',
    },
  }
  const conf = configs[theme] || configs.blue

  return (
    <div
      className='relative w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105'
      style={{
        background: conf.gradient,
        boxShadow: conf.shadow,
      }}
    >
      <div className='absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none' />
      <div className='flex items-center gap-1.5 mt-0.5 z-10'>
        <div className='w-1.5 h-2 rounded-full relative' style={{ backgroundColor: conf.eyeColor }}>
          <div className='w-0.5 h-0.5 rounded-full bg-white absolute top-0.5 left-0.5' />
        </div>
        <div className='w-1.5 h-2 rounded-full relative' style={{ backgroundColor: conf.eyeColor }}>
          <div className='w-0.5 h-0.5 rounded-full bg-white absolute top-0.5 left-0.5' />
        </div>
      </div>
    </div>
  )
}

// Grain texture overlay matching our signature pages
const GrainOverlay = () => (
  <div
    className='absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]'
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

const Login = () => {
  const { showLogin, setShowLogin, backendUrl, setToken, setUser, loadCreditsData } =
    useContext(AppContext)

  const [state, setState] = useState(
    typeof showLogin === 'string' && showLogin === 'Sign Up' ? 'Sign Up' : 'Login'
  )

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sync state when opened via 'Sign Up' or 'Login'
  useEffect(() => {
    if (typeof showLogin === 'string' && (showLogin === 'Sign Up' || showLogin === 'Login')) {
      setState(showLogin)
    } else if (showLogin === true) {
      setState('Login')
    }
  }, [showLogin])

  // ESC key listener & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowLogin(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [setShowLogin])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (state === 'Login') {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

        if (data.success) {
          setToken(data.token)
          setUser(data.user)
          localStorage.setItem('token', data.token)
          if (loadCreditsData) loadCreditsData()
          setShowLogin(false)
          toast.success(`Welcome back, ${data.user.name}!`)
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/register', {
          name,
          email,
          password,
        })

        if (data.success) {
          setToken(data.token)
          setUser(data.user)
          localStorage.setItem('token', data.token)
          if (loadCreditsData) loadCreditsData()
          setShowLogin(false)
          toast.success(`Account created! Welcome, ${data.user.name}`)
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none'
      onClick={() => setShowLogin(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-[420px]'
      >
        {/* Outer Signature Card */}
        <div className='bg-white rounded-[28px] border border-[#e5e5e7] p-2.5 sm:p-3 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_24px_64px_-12px_rgba(0,0,0,0.18)]'>
          {/* Inner Inset Container with Gradient */}
          <div
            className='rounded-[20px] p-6 sm:p-7 relative overflow-hidden border border-blue-200/90'
            style={{
              background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
            }}
          >
            <GrainOverlay />

            {/* Top Bar: Avatar Orb + Close Button */}
            <div className='flex items-center justify-between relative z-10'>
              <AvatarOrb theme={state === 'Login' ? 'blue' : 'purple'} />
              <button
                type='button'
                onClick={() => setShowLogin(false)}
                className='w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#6e6e73] hover:text-ink border border-black/10 flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer'
                aria-label='Close dialog'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Title & Description */}
            <div className='mt-4 relative z-10'>
              <h2 className='text-2xl font-bold text-ink tracking-tight'>
                {state === 'Login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className='text-[13px] text-[#6e6e73] mt-1 leading-snug'>
                {state === 'Login'
                  ? 'Sign in to access your models, credits & history.'
                  : 'Get started with 5 free generation credits today.'}
              </p>
            </div>

            {/* Mode Segmented Capsule Switcher */}
            <div className='mt-4 relative z-10 flex justify-center'>
              <div className='inline-flex p-1 bg-black/[0.04] rounded-full border border-black/[0.06]'>
                <button
                  type='button'
                  onClick={() => setState('Login')}
                  className={`px-4 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                    state === 'Login'
                      ? 'bg-white text-ink shadow-2xs'
                      : 'text-[#6e6e73] hover:text-ink'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type='button'
                  onClick={() => setState('Sign Up')}
                  className={`px-4 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                    state === 'Sign Up'
                      ? 'bg-white text-ink shadow-2xs'
                      : 'text-[#6e6e73] hover:text-ink'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={onSubmitHandler} className='mt-4 space-y-3 relative z-10'>
              {state !== 'Login' && (
                <div className='bg-white/90 backdrop-blur-xs border border-[#e5e5e7] hover:border-neutral-300 focus-within:border-[#1d1d1f] focus-within:ring-2 focus-within:ring-black/5 rounded-full px-4 py-2.5 transition-all text-[13px] shadow-2xs flex items-center gap-2.5'>
                  <svg
                    className='w-4 h-4 text-[#8e8e93] shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.8}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type='text'
                    placeholder='Full Name'
                    required
                    className='w-full outline-none text-ink placeholder-[#8e8e93] bg-transparent text-[13px]'
                  />
                </div>
              )}

              <div className='bg-white/90 backdrop-blur-xs border border-[#e5e5e7] hover:border-neutral-300 focus-within:border-[#1d1d1f] focus-within:ring-2 focus-within:ring-black/5 rounded-full px-4 py-2.5 transition-all text-[13px] shadow-2xs flex items-center gap-2.5'>
                <svg
                  className='w-4 h-4 text-[#8e8e93] shrink-0'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.8}
                    d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                  />
                </svg>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type='email'
                  placeholder='Email address'
                  required
                  className='w-full outline-none text-ink placeholder-[#8e8e93] bg-transparent text-[13px]'
                />
              </div>

              <div className='bg-white/90 backdrop-blur-xs border border-[#e5e5e7] hover:border-neutral-300 focus-within:border-[#1d1d1f] focus-within:ring-2 focus-within:ring-black/5 rounded-full px-4 py-2.5 transition-all text-[13px] shadow-2xs flex items-center gap-2.5'>
                <svg
                  className='w-4 h-4 text-[#8e8e93] shrink-0'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.8}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Password'
                  required
                  className='w-full outline-none text-ink placeholder-[#8e8e93] bg-transparent text-[13px]'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='text-[#8e8e93] hover:text-ink text-[11px] font-medium transition-colors cursor-pointer px-1'
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Primary Action Button */}
              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={loading}
                  className='w-full py-2.5 px-4 rounded-full font-semibold text-[14px] bg-[#1d1d1f] hover:bg-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50'
                >
                  {loading ? (
                    <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  ) : state === 'Login' ? (
                    'Sign In to Imagify'
                  ) : (
                    'Create Free Account'
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Switcher Note */}
            <div className='mt-4 pt-3 border-t border-black/[0.06] text-center text-[12px] text-[#6e6e73] relative z-10'>
              {state === 'Login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type='button'
                    onClick={() => setState('Sign Up')}
                    className='text-blue-600 font-semibold hover:underline cursor-pointer'
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type='button'
                    onClick={() => setState('Login')}
                    className='text-blue-600 font-semibold hover:underline cursor-pointer'
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
