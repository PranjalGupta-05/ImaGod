import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import {
  Image as ImageIcon,
  Scissors,
  Sparkles,
  CreditCard,
  ArrowRight,
  Zap,
  PenTool,
  Expand,
  Focus,
  BarChart3,
} from 'lucide-react'

// Auth required for viewing usage data

// Grain texture overlay matching BuyCredit.jsx
const GrainOverlay = () => (
  <div
    className='absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]'
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

// Glowing Orb Component matching BuyCredit.jsx style
const ThemeOrb = ({ theme, icon: Icon }) => {
  const configs = {
    blue: {
      gradient: 'radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 55%, #1d4ed8 100%)',
      shadow: '0 8px 18px -2px rgba(37,99,235,0.40)',
    },
    purple: {
      gradient: 'radial-gradient(circle at 35% 30%, #d8b4fe 0%, #8b5cf6 55%, #6d28d9 100%)',
      shadow: '0 8px 18px -2px rgba(139,92,246,0.40)',
    },
    gold: {
      gradient: 'radial-gradient(circle at 35% 30%, #fde047 0%, #eab308 55%, #b45309 100%)',
      shadow: '0 8px 18px -2px rgba(234,179,8,0.40)',
    },
    indigo: {
      gradient: 'radial-gradient(circle at 35% 30%, #a5b4fc 0%, #6366f1 55%, #4338ca 100%)',
      shadow: '0 8px 18px -2px rgba(99,102,241,0.40)',
    },
    violet: {
      gradient: 'radial-gradient(circle at 35% 30%, #f0abfc 0%, #a855f7 55%, #7e22ce 100%)',
      shadow: '0 8px 18px -2px rgba(168,85,247,0.40)',
    },
    emerald: {
      gradient: 'radial-gradient(circle at 35% 30%, #6ee7b7 0%, #10b981 55%, #065f46 100%)',
      shadow: '0 8px 18px -2px rgba(16,185,129,0.40)',
    },
    sky: {
      gradient: 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 55%, #0369a1 100%)',
      shadow: '0 8px 18px -2px rgba(2,132,199,0.45)',
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
      <Icon className='w-5 h-5 text-white z-10 stroke-[2]' />
    </div>
  )
}

const Usage = () => {
  const { user, token, backendUrl, setShowLogin, setCredit } = useContext(AppContext)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    creditsLeft: 0,
    creditsUsed: 0,
    totalCredits: 0,
    features: {
      textToImage: 0,
      removeBg: 0,
      enhance: 0,
      aiEditor: 0,
      genFill: 0,
      unblur: 0,
    },
    history: [],
  })

  const pollingTimerRef = useRef(null)

  const fetchUsageData = useCallback(
    async (isBackground = false) => {
      if (!token || !user) {
        setLoading(false)
        return
      }

      try {
        setError(null)

        const apiUrl = backendUrl
          ? `${backendUrl}/api/user/usage`
          : '/api/user/usage'

        const { data } = await axios.get(apiUrl, {
          headers: { token },
        })

        if (data.success && data.data) {
          setStats(data.data)
          if (typeof data.data.creditsLeft === 'number') {
            setCredit(data.data.creditsLeft)
          }
        } else {
          if (!isBackground) {
            setError(data.message || 'Unable to load usage data')
          }
        }
      } catch (err) {
        console.error('Error fetching usage data:', err)
        if (!isBackground) {
          setError(
            err.response?.data?.message || err.message || 'Failed to connect to usage API'
          )
        }
      } finally {
        setLoading(false)
      }
    },
    [token, user, backendUrl, setCredit]
  )

  useEffect(() => {
    if (!user || !token) {
      setLoading(false)
      return
    }

    fetchUsageData(false)

    const startPolling = () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current)
      pollingTimerRef.current = setInterval(() => {
        if (!document.hidden && token && user) {
          fetchUsageData(true)
        }
      }, 5000)
    }

    startPolling()

    const handleVisibilityChange = () => {
      if (!document.hidden && token && user) {
        fetchUsageData(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUsageData, token, user])

  const total = Math.max(stats.totalCredits, 1)
  const usedPercent = Math.min(100, Math.round((stats.creditsUsed / total) * 100))

  // Feature cards config — easy to extend when more features are added
  const FEATURE_CARDS = [
    {
      key: 'textToImage',
      label: 'Text-to-Image',
      desc: 'High-resolution visual synthesis from prompts.',
      unit: 'generations',
      theme: 'blue',
      icon: ImageIcon,
      badgeText: '1 Credit / Run',
      badgeClass: 'bg-blue-500/10 border-blue-200/80 text-blue-700',
      dividerClass: 'border-blue-200/60',
      linkTo: '/result',
      linkLabel: 'Generate',
      linkClass: 'hover:bg-blue-50 text-blue-700 border-blue-200',
      engineLabel: 'Standard Engine',
      gradientBg: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
      gradientBorder: '#bfdbfe',
      statColor: 'text-blue-600',
    },
    {
      key: 'removeBg',
      label: 'Remove Background',
      desc: 'Instant subject isolation with HD PNG transparency.',
      unit: 'cutouts',
      theme: 'purple',
      icon: Scissors,
      badgeText: '1 Credit / Run',
      badgeClass: 'bg-purple-500/10 border-purple-200/80 text-purple-700',
      dividerClass: 'border-purple-200/60',
      linkTo: '/remove-bg',
      linkLabel: 'Erase BG',
      linkClass: 'hover:bg-purple-50 text-purple-700 border-purple-200',
      engineLabel: 'Precision Cutter',
      gradientBg: 'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 45%, #ffffff 100%)',
      gradientBorder: '#ddd6fe',
      statColor: 'text-purple-600',
    },
    {
      key: 'enhance',
      label: 'Photo Enhancer',
      desc: 'AI detail upscaling & facial recovery.',
      unit: 'enhanced',
      theme: 'gold',
      icon: Sparkles,
      badgeText: '1 Credit / Run',
      badgeClass: 'bg-amber-500/10 border-amber-300/80 text-amber-800',
      dividerClass: 'border-amber-200/80',
      linkTo: '/enhance',
      linkLabel: 'Enhance',
      linkClass: 'hover:bg-amber-50 text-amber-800 border-amber-200',
      engineLabel: 'Super-Resolution',
      gradientBg: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 45%, #ffffff 100%)',
      gradientBorder: '#fde68a',
      statColor: 'text-amber-700',
    },
    {
      key: 'aiEditor',
      label: 'AI Editor',
      desc: 'Generative replace & recolor with text prompts.',
      unit: 'edits',
      theme: 'violet',
      icon: PenTool,
      badgeText: '1 Credit / Run',
      badgeClass: 'bg-purple-500/10 border-purple-300/80 text-purple-800',
      dividerClass: 'border-purple-200/60',
      linkTo: '/ai-editor',
      linkLabel: 'Edit',
      linkClass: 'hover:bg-purple-50 text-purple-800 border-purple-200',
      engineLabel: 'Gen Replace · Recolor',
      gradientBg: 'linear-gradient(180deg, #f3e8ff 0%, #faf5ff 45%, #ffffff 100%)',
      gradientBorder: '#e9d5ff',
      statColor: 'text-purple-700',
    },
    {
      key: 'genFill',
      label: 'Generative Fill',
      desc: 'Outpaint & expand images to any aspect ratio.',
      unit: 'fills',
      theme: 'emerald',
      icon: Expand,
      badgeText: '1 Credit / Run',
      badgeClass: 'bg-emerald-500/10 border-emerald-300/80 text-emerald-800',
      dividerClass: 'border-emerald-200/60',
      linkTo: '/gen-fill',
      linkLabel: 'Expand',
      linkClass: 'hover:bg-emerald-50 text-emerald-800 border-emerald-200',
      engineLabel: 'Gen Fill · Outpaint',
      gradientBg: 'linear-gradient(180deg, #d1fae5 0%, #f0fdf4 45%, #ffffff 100%)',
      gradientBorder: '#a7f3d0',
      statColor: 'text-emerald-700',
    },
    {
      key: 'unblur',
      label: 'AI Unblur',
      desc: 'Eliminate blur & restore crisp edge clarity.',
      unit: 'restored',
      theme: 'sky',
      icon: Focus,
      badgeText: '1 Credit / Run',
      badgeClass: 'bg-sky-500/10 border-sky-300/80 text-sky-800',
      dividerClass: 'border-sky-200/60',
      linkTo: '/unblur',
      linkLabel: 'Unblur',
      linkClass: 'hover:bg-sky-50 text-sky-800 border-sky-200',
      engineLabel: 'Neural Deblur',
      gradientBg: 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 45%, #ffffff 100%)',
      gradientBorder: '#bae6fd',
      statColor: 'text-sky-700',
    },
  ]

  // Not logged in state - exactly matching History page
  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4'>
        <ThemeOrb theme='purple' icon={BarChart3} />
        <h2 className='text-[22px] font-bold text-ink'>Your Usage & Credits</h2>
        <p className='text-[14px] text-[#6b7280] text-center max-w-sm'>
          Sign in to view your real-time generation stats, credit consumption, and activity logs.
        </p>
        <button
          onClick={() => setShowLogin('Login')}
          className='px-7 py-2.5 rounded-full font-semibold text-[14px] bg-[#1d1d1f] hover:bg-black text-white shadow-[0_2px_10px_rgba(0,0,0,0.16)] transition-all active:scale-95 cursor-pointer'
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#fafafc] pt-20 sm:pt-22 pb-4 select-none flex flex-col justify-center'>
      <div className='max-w-[1180px] mx-auto px-4 sm:px-6 w-full'>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='mb-3 sm:mb-4'
        >
          <h1 className='text-2xl sm:text-3xl lg:text-[34px] font-bold text-ink tracking-tight leading-tight'>
            Usage & Credits
          </h1>
          <p className='text-sm sm:text-base text-[#6e6e73] mt-0.5 max-w-[560px]'>
            Monitor your AI model generations, tool activity, and remaining balance in real time.
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className='mb-3 px-4 py-2.5 rounded-[16px] bg-red-50 border border-red-200 text-[13px] text-red-900 flex items-center justify-between shadow-2xs'>
            <div className='flex items-center gap-2'>
              <span className='w-1.5 h-1.5 rounded-full bg-red-500' />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchUsageData(false)}
              className='text-red-700 hover:text-red-900 font-semibold text-[12px] ml-4 px-2.5 py-0.5 rounded-full bg-white border border-red-200 shadow-2xs active:scale-95 transition-all cursor-pointer'
            >
              Retry
            </button>
          </div>
        )}



        {/* Loading Skeleton */}
        {loading && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch mb-0'>
            <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 shadow-2xs animate-pulse h-[180px]'
                >
                  <div className='rounded-[16px] bg-slate-100 h-full w-full' />
                </div>
              ))}
            </div>
            <div className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 shadow-2xs animate-pulse h-[380px]'>
              <div className='rounded-[16px] bg-slate-100 h-full w-full' />
            </div>
          </div>
        )}

        {/* ──── Main Stats Grid ──── */}
        {!loading && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch mb-0'>

            {/* Left: 6 Feature Cards (3-col on large, 2-col on medium, 1-col on mobile) */}
            <div className='md:col-span-2 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 content-start'>
              {FEATURE_CARDS.map((card, index) => (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + index * 0.05 }}
                  className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300'
                >
                  <div
                    className='rounded-[16px] p-3.5 relative overflow-hidden border flex flex-col justify-between h-full'
                    style={{
                      background: card.gradientBg,
                      borderColor: card.gradientBorder,
                    }}
                  >
                    <GrainOverlay />

                    {/* Header Row */}
                    <div className='flex items-center justify-between relative z-10'>
                      <ThemeOrb theme={card.theme} icon={card.icon} />
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold backdrop-blur-sm ${card.badgeClass}`}>
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Title & Count */}
                    <div className='mt-3 relative z-10'>
                      <div className='flex items-baseline gap-1.5'>
                        <span className='text-[28px] font-bold text-ink tracking-tight leading-none'>
                          {stats.features[card.key] ?? 0}
                        </span>
                        <span className={`text-[11px] font-medium ${card.statColor}`}>{card.unit}</span>
                      </div>
                      <h3 className='text-[14px] font-bold text-ink tracking-tight mt-1 leading-tight'>
                        {card.label}
                      </h3>
                      <p className='text-[11px] text-[#4b5563] mt-0.5 leading-snug line-clamp-2'>
                        {card.desc}
                      </p>
                    </div>

                    {/* Action Row */}
                    <div className={`mt-3 relative z-10 pt-2.5 border-t flex items-center justify-between ${card.dividerClass}`}>
                      <span className='text-[10px] text-[#6b7280]'>{card.engineLabel}</span>
                      <Link
                        to={card.linkTo}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border shadow-2xs text-[11px] font-semibold transition-all active:scale-95 ${card.linkClass}`}
                      >
                        {card.linkLabel} <ArrowRight className='w-2.5 h-2.5' />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right: Credits Analytics Box (Indigo/Violet Accent) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 h-full'
            >
              <div
                className='rounded-[16px] p-4 relative overflow-hidden border flex flex-col justify-between h-full'
                style={{
                  background: 'linear-gradient(180deg, #ede9fe 0%, #e0e7ff 35%, #ffffff 100%)',
                  borderColor: '#c7d2fe',
                }}
              >
                <GrainOverlay />

                <div>
                  {/* Top Row: Orb + Live Indicator */}
                  <div className='flex items-center justify-between relative z-10'>
                    <ThemeOrb theme='indigo' icon={CreditCard} />
                    <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-300/80 text-[11px] font-semibold text-emerald-800 backdrop-blur-sm'>
                      <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping' />
                      Live Balance
                    </span>
                  </div>

                  {/* Main Credits Stat */}
                  <div className='mt-3 relative z-10'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-[42px] font-extrabold text-ink tracking-tight leading-none'>
                        {stats.creditsLeft}
                      </span>
                      <span className='text-[13px] font-semibold text-indigo-700'>credits left</span>
                    </div>
                    <h3 className='text-[18px] font-bold text-ink tracking-tight mt-1.5'>
                      Credits Balance
                    </h3>
                    <p className='text-[12px] text-[#4b5563] mt-0.5 leading-snug'>
                      Deducted seamlessly on every generation.
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className='mt-3 relative z-10 bg-white/70 backdrop-blur-xs p-3 rounded-[14px] border border-indigo-100 shadow-2xs'>
                    <div className='flex items-center justify-between text-[12px] mb-1.5 font-medium'>
                      <span className='text-ink font-semibold'>Allocation</span>
                      <span className='text-indigo-700 font-bold'>{usedPercent}% used</span>
                    </div>

                    <div className='w-full h-2.5 bg-indigo-100/70 rounded-full overflow-hidden p-0.5 border border-indigo-200/50'>
                      <div
                        className='h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-700'
                        style={{ width: `${Math.max(5, usedPercent)}%` }}
                      />
                    </div>

                    <div className='flex justify-between items-center mt-1.5 text-[11px] text-[#6b7280] font-medium'>
                      <span>{stats.creditsUsed} Used</span>
                      <span>{stats.totalCredits} Total</span>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className='mt-3 relative z-10 space-y-1.5'>
                    <div className='flex items-center justify-between p-2 rounded-[12px] bg-white/60 border border-slate-200/70 text-[12px]'>
                      <div className='flex items-center gap-1.5 text-[#4b5563]'>
                        <span className='w-1.5 h-1.5 rounded-full bg-blue-500' />
                        <span>Total Initial</span>
                      </div>
                      <span className='font-bold text-ink'>{stats.totalCredits}</span>
                    </div>

                    <div className='flex items-center justify-between p-2 rounded-[12px] bg-white/60 border border-slate-200/70 text-[12px]'>
                      <div className='flex items-center gap-1.5 text-[#4b5563]'>
                        <span className='w-1.5 h-1.5 rounded-full bg-purple-500' />
                        <span>Consumed</span>
                      </div>
                      <span className='font-bold text-purple-700'>{stats.creditsUsed}</span>
                    </div>

                    <div className='flex items-center justify-between p-2 rounded-[12px] bg-white/90 border border-indigo-200 text-[12px] shadow-2xs'>
                      <div className='flex items-center gap-1.5 text-indigo-900 font-semibold'>
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                        <span>Available</span>
                      </div>
                      <span className='font-bold text-emerald-600 text-[13px]'>{stats.creditsLeft}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className='mt-4 relative z-10'>
                  <Link
                    to='/buycredit'
                    className='w-full py-2.5 px-4 rounded-full font-semibold text-[14px] bg-[#1d1d1f] hover:bg-black text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]'
                  >
                    <span>Top Up Credits</span>
                    <ArrowRight className='w-3.5 h-3.5' />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Usage

