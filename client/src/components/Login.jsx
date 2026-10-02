import React, { useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import GrainOverlay from '../components/ui/GrainOverlay'
import ThemeOrb from '../components/ui/ThemeOrb'
import Button from '../components/ui/Button'
import { Card, CardInner } from '../components/ui/Card'
import { User, Mail, Lock, X } from 'lucide-react'

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
        <Card className='p-2.5 sm:p-3'>
          <CardInner
            className='p-6 sm:p-7 border-blue-200/90'
            style={{
              background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
            }}
          >
            {/* Top Bar: Avatar Orb + Close Button */}
            <div className='flex items-center justify-between relative z-10'>
              <ThemeOrb theme={state === 'Login' ? 'blue' : 'purple'} withEyes={true} />
              <button
                type='button'
                onClick={() => setShowLogin(false)}
                className='w-8 h-8 rounded-full bg-white/80 hover:bg-white text-ink-muted hover:text-ink border border-line flex items-center justify-center shadow-2xs transition-all active:scale-95 cursor-pointer'
                aria-label='Close dialog'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            {/* Title & Description */}
            <div className='mt-4 relative z-10'>
              <h2 className='text-2xl font-bold font-primary text-ink tracking-tight'>
                {state === 'Login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className='text-[13px] font-body text-ink-muted mt-1 leading-snug'>
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
                      ? 'bg-white text-ink shadow-2xs font-bold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type='button'
                  onClick={() => setState('Sign Up')}
                  className={`px-4 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                    state === 'Sign Up'
                      ? 'bg-white text-ink shadow-2xs font-bold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Form Inputs */}
            <form onSubmit={onSubmitHandler} className='mt-4 space-y-3 relative z-10'>
              {state !== 'Login' && (
                <div className='bg-white/95 backdrop-blur-xs border border-line hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 rounded-full px-4 py-2.5 transition-all text-[13px] shadow-2xs flex items-center gap-2.5'>
                  <User className='w-4 h-4 text-ink-subtle shrink-0' />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type='text'
                    placeholder='Full Name'
                    required
                    className='w-full outline-none text-ink font-body placeholder-ink-subtle bg-transparent text-[13px]'
                  />
                </div>
              )}

              <div className='bg-white/95 backdrop-blur-xs border border-line hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 rounded-full px-4 py-2.5 transition-all text-[13px] shadow-2xs flex items-center gap-2.5'>
                <Mail className='w-4 h-4 text-ink-subtle shrink-0' />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type='email'
                  placeholder='Email address'
                  required
                  className='w-full outline-none text-ink font-body placeholder-ink-subtle bg-transparent text-[13px]'
                />
              </div>

              <div className='bg-white/95 backdrop-blur-xs border border-line hover:border-neutral-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 rounded-full px-4 py-2.5 transition-all text-[13px] shadow-2xs flex items-center gap-2.5'>
                <Lock className='w-4 h-4 text-ink-subtle shrink-0' />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Password'
                  required
                  className='w-full outline-none text-ink font-body placeholder-ink-subtle bg-transparent text-[13px]'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='text-ink-subtle hover:text-ink text-[11px] font-medium font-body transition-colors cursor-pointer px-1'
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Primary Action Button */}
              <div className='pt-2'>
                <Button
                  type='submit'
                  loading={loading}
                  variant='primary'
                  size='md'
                  fullWidth={true}
                >
                  {state === 'Login' ? 'Sign In to ImaGod' : 'Create Free Account'}
                </Button>
              </div>
            </form>

            {/* Bottom Switcher Note */}
            <div className='mt-4 pt-3 border-t border-black/[0.06] text-center text-[12px] font-body text-ink-muted relative z-10'>
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
          </CardInner>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login
