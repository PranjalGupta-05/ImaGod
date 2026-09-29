import React, { useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const Login = () => {
  const { showLogin, setShowLogin, backendUrl, setToken, setUser, loadCreditsData } =
    useContext(AppContext)

  const [state, setState] = useState(
    typeof showLogin === 'string' && showLogin === 'Sign Up' ? 'Sign Up' : 'Login'
  )

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 select-none'
      onClick={() => setShowLogin(false)}
    >
      <motion.form
        onSubmit={onSubmitHandler}
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-[390px] bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-gray-100 text-gray-700'
      >
        {/* Close Button */}
        <button
          type='button'
          onClick={() => setShowLogin(false)}
          className='absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer'
          aria-label='Close'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>

        {/* Clean Header */}
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            {state === 'Login' ? 'Login' : 'Sign Up'}
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            {state === 'Login'
              ? 'Welcome back! Please sign in to continue'
              : 'Create an account to get started'}
          </p>
        </div>

        {/* Input Fields */}
        <div className='space-y-4'>
          {state !== 'Login' && (
            <div className='border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 px-4 py-2.5 flex items-center gap-3 rounded-full transition-all'>
              <svg
                className='w-4 h-4 text-gray-400 shrink-0'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type='text'
                placeholder='Full Name'
                required
                className='w-full outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent'
              />
            </div>
          )}

          <div className='border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 px-4 py-2.5 flex items-center gap-3 rounded-full transition-all'>
            <svg
              className='w-4 h-4 text-gray-400 shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type='email'
              placeholder='Email address'
              required
              className='w-full outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent'
            />
          </div>

          <div className='border border-gray-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 px-4 py-2.5 flex items-center gap-3 rounded-full transition-all'>
            <svg
              className='w-4 h-4 text-gray-400 shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type='password'
              placeholder='Password'
              required
              className='w-full outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent'
            />
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md disabled:opacity-50 mt-6 flex items-center justify-center cursor-pointer'
        >
          {loading ? (
            <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
          ) : state === 'Login' ? (
            'Login'
          ) : (
            'Create Account'
          )}
        </button>

        {/* Bottom Mode Switcher */}
        <div className='mt-6 text-center text-sm text-gray-500'>
          {state === 'Login' ? (
            <p>
              Don't have an account?{' '}
              <span
                onClick={() => setState('Sign Up')}
                className='text-blue-600 font-semibold cursor-pointer hover:underline'
              >
                Sign Up
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span
                onClick={() => setState('Login')}
                className='text-blue-600 font-semibold cursor-pointer hover:underline'
              >
                Login
              </span>
            </p>
          )}
        </div>
      </motion.form>
    </div>
  )
}

export default Login
