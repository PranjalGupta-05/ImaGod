import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import {
  Image as ImageIcon,
  Scissors,
  Sparkles,
  Plus,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Zap,
} from 'lucide-react'

// ─── Flip to true to require sign-in before showing stats ────────────────────
const REQUIRE_AUTH = false

// ─── Swappable Feature 4 Placeholder Config ──────────────────────────────────
// Edit this object when adding a new 4th feature later.
const PLACEHOLDER_FEATURE_4 = {
  name: 'Coming Soon',
  description: 'Next AI model engine',
  statDisplay: '—',
  badge: 'In Development',
}

// Demo data shown when auth is bypassed or there's no live data
const DEMO_STATS = {
  creditsLeft: 3,
  creditsUsed: 2,
  totalCredits: 5,
  features: { textToImage: 1, removeBg: 1, enhance: 0 },
  history: [],
}

// Grain texture overlay matching BuyCredit.jsx
const GrainOverlay = () => (
  <div
    className='absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]'
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

// Glowing Orb Component for Feature & Credit Icons matching BuyCredit.jsx style
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
    slate: {
      gradient: 'radial-gradient(circle at 35% 30%, #e2e8f0 0%, #94a3b8 55%, #64748b 100%)',
      shadow: '0 6px 14px -2px rgba(100,116,139,0.25)',
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
      {/* Specular highlight */}
      <div className='absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none' />
      {/* Centered icon */}
      <Icon className='w-5 h-5 text-white z-10 stroke-[2]' />
    </div>
  )
}

const Usage = () => {
  const { user, token, backendUrl, setShowLogin, setCredit } = useContext(AppContext)

  const showGrid = REQUIRE_AUTH ? !!user : true

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
    },
    history: [],
  })

  const pollingTimerRef = useRef(null)

  // ─── Fetch Usage Data ────────────────────────────────────────────────────────
  const fetchUsageData = useCallback(
    async (isBackground = false) => {
      if (!token) {
        if (!REQUIRE_AUTH) {
          setStats(DEMO_STATS)
        }
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
    [token, backendUrl, setCredit]
  )

  // ─── Real-Time Live Polling (every 5 seconds) ─────────────────────────────────
  useEffect(() => {
    fetchUsageData(false)

    const startPolling = () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current)
      pollingTimerRef.current = setInterval(() => {
        if (!document.hidden && token) {
          fetchUsageData(true)
        }
      }, 5000)
    }

    startPolling()

    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        fetchUsageData(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUsageData, token])

  // Progress calculations
  const total = Math.max(stats.totalCredits, 1)
  const usedPercent = Math.min(100, Math.round((stats.creditsUsed / total) * 100))
  const remainingPercent = Math.max(0, 100 - usedPercent)

  return (
    <div className='w-full min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#fafafc] pt-20 sm:pt-22 pb-4 select-none flex flex-col justify-center'>
      <div className='max-w-[1140px] mx-auto px-4 sm:px-6 w-full'>

        {/* ── Page Header Stack ── */}
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

        {/* ── Error State ── */}
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

        {/* ── Unauthenticated State (when REQUIRE_AUTH is true) ── */}
        {REQUIRE_AUTH && !user && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-[24px] border border-[#e5e5e7] p-8 text-center max-w-[500px] mx-auto shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
          >
            <div className='w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100'>
              <Zap className='w-5 h-5' />
            </div>
            <h2 className='text-xl font-bold text-ink tracking-tight'>
              Sign in to view your usage
            </h2>
            <p className='text-[13px] text-[#6e6e73] mt-1.5 mb-5 max-w-sm mx-auto'>
              Sign in to access your real-time generation stats, credit consumption, and activity logs.
            </p>
            <button
              type='button'
              onClick={() => setShowLogin('Login')}
              className='px-6 py-2 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[14px] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-all cursor-pointer active:scale-95'
            >
              Sign In to Imagify
            </button>
          </motion.div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading && showGrid && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch mb-0'>
            <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[...Array(4)].map((_, i) => (
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

        {/* ── 5-Box Stats Grid ── */}
        {!loading && showGrid && (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch mb-0'>

            {/* Left 2 Columns containing Box 1, 2, 3, 4 */}
            <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4'>

              {/* ── BOX 1: Text-to-Image (Blue Theme) ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300'
              >
                <div
                  className='rounded-[16px] p-3.5 sm:p-4 relative overflow-hidden border flex flex-col justify-between h-full'
                  style={{
                    background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
                    borderColor: '#bfdbfe',
                  }}
                >
                  <GrainOverlay />

                  {/* Header Row */}
                  <div className='flex items-center justify-between relative z-10'>
                    <ThemeOrb theme='blue' icon={ImageIcon} />
                    <span className='px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-200/80 text-[11px] font-semibold text-blue-700 backdrop-blur-sm'>
                      1 Credit / Gen
                    </span>
                  </div>

                  {/* Title & Count */}
                  <div className='mt-3 relative z-10'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-[34px] font-bold text-ink tracking-tight leading-none'>
                        {stats.features.textToImage}
                      </span>
                      <span className='text-[12px] font-medium text-blue-600'>generations</span>
                    </div>
                    <h3 className='text-[17px] font-bold text-ink tracking-tight mt-1.5'>
                      Text-to-Image
                    </h3>
                    <p className='text-[12px] text-[#4b5563] mt-0.5 leading-snug line-clamp-1'>
                      High-resolution visual synthesis from prompts.
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className='mt-3 relative z-10 pt-2.5 border-t border-blue-200/60 flex items-center justify-between'>
                    <span className='text-[11px] text-[#6b7280]'>Standard Engine</span>
                    <Link
                      to='/result'
                      className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs text-[12px] font-semibold transition-all active:scale-95'
                    >
                      Generate <ArrowRight className='w-3 h-3' />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* ── BOX 2: Remove BG (Purple Theme) ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300'
              >
                <div
                  className='rounded-[16px] p-3.5 sm:p-4 relative overflow-hidden border flex flex-col justify-between h-full'
                  style={{
                    background: 'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 45%, #ffffff 100%)',
                    borderColor: '#ddd6fe',
                  }}
                >
                  <GrainOverlay />

                  {/* Header Row */}
                  <div className='flex items-center justify-between relative z-10'>
                    <ThemeOrb theme='purple' icon={Scissors} />
                    <span className='px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-200/80 text-[11px] font-semibold text-purple-700 backdrop-blur-sm'>
                      1 Credit / Run
                    </span>
                  </div>

                  {/* Title & Count */}
                  <div className='mt-3 relative z-10'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-[34px] font-bold text-ink tracking-tight leading-none'>
                        {stats.features.removeBg}
                      </span>
                      <span className='text-[12px] font-medium text-purple-600'>cutouts</span>
                    </div>
                    <h3 className='text-[17px] font-bold text-ink tracking-tight mt-1.5'>
                      Remove Background
                    </h3>
                    <p className='text-[12px] text-[#4b5563] mt-0.5 leading-snug line-clamp-1'>
                      Instant subject isolation with HD PNG transparency.
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className='mt-3 relative z-10 pt-2.5 border-t border-purple-200/60 flex items-center justify-between'>
                    <span className='text-[11px] text-[#6b7280]'>Precision Cutter</span>
                    <Link
                      to='/remove-bg'
                      className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs text-[12px] font-semibold transition-all active:scale-95'
                    >
                      Erase BG <ArrowRight className='w-3 h-3' />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* ── BOX 3: Enhance (Gold Theme) ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300'
              >
                <div
                  className='rounded-[16px] p-3.5 sm:p-4 relative overflow-hidden border flex flex-col justify-between h-full'
                  style={{
                    background: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 45%, #ffffff 100%)',
                    borderColor: '#fde68a',
                  }}
                >
                  <GrainOverlay />

                  {/* Header Row */}
                  <div className='flex items-center justify-between relative z-10'>
                    <ThemeOrb theme='gold' icon={Sparkles} />
                    <span className='px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-300/80 text-[11px] font-semibold text-amber-800 backdrop-blur-sm'>
                      1 Credit / Run
                    </span>
                  </div>

                  {/* Title & Count */}
                  <div className='mt-3 relative z-10'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-[34px] font-bold text-ink tracking-tight leading-none'>
                        {stats.features.enhance}
                      </span>
                      <span className='text-[12px] font-medium text-amber-700'>enhanced</span>
                    </div>
                    <h3 className='text-[17px] font-bold text-ink tracking-tight mt-1.5'>
                      Photo Enhancer
                    </h3>
                    <p className='text-[12px] text-[#4b5563] mt-0.5 leading-snug line-clamp-1'>
                      AI detail upscaling & facial recovery.
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className='mt-3 relative z-10 pt-2.5 border-t border-amber-200/80 flex items-center justify-between'>
                    <span className='text-[11px] text-[#6b7280]'>Super-Resolution</span>
                    <Link
                      to='/enhance'
                      className='inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs text-[12px] font-semibold transition-all active:scale-95'
                    >
                      Enhance <ArrowRight className='w-3 h-3' />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* ── BOX 4: Placeholder / Coming Soon (Cool Slate Theme) ── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className='bg-white rounded-[22px] border border-[#e5e5e7] p-2 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300'
              >
                <div
                  className='rounded-[16px] p-3.5 sm:p-4 relative overflow-hidden border border-dashed flex flex-col justify-between h-full'
                  style={{
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 45%, #ffffff 100%)',
                    borderColor: '#cbd5e1',
                  }}
                >
                  <GrainOverlay />

                  {/* Header Row */}
                  <div className='flex items-center justify-between relative z-10'>
                    <ThemeOrb theme='slate' icon={Plus} />
                    <span className='px-2.5 py-0.5 rounded-full bg-slate-200/80 border border-slate-300 text-[11px] font-semibold text-slate-700 backdrop-blur-sm'>
                      {PLACEHOLDER_FEATURE_4.badge}
                    </span>
                  </div>

                  {/* Title & Count */}
                  <div className='mt-3 relative z-10'>
                    <div className='flex items-baseline gap-1.5'>
                      <span className='text-[34px] font-bold text-slate-400 tracking-tight leading-none'>
                        {PLACEHOLDER_FEATURE_4.statDisplay}
                      </span>
                      <span className='text-[12px] font-medium text-slate-500'>upcoming</span>
                    </div>
                    <h3 className='text-[17px] font-bold text-ink tracking-tight mt-1.5'>
                      {PLACEHOLDER_FEATURE_4.name}
                    </h3>
                    <p className='text-[12px] text-[#64748b] mt-0.5 leading-snug line-clamp-1'>
                      {PLACEHOLDER_FEATURE_4.description}
                    </p>
                  </div>

                  {/* Action Info */}
                  <div className='mt-3 relative z-10 pt-2.5 border-t border-slate-200 flex items-center justify-between'>
                    <span className='text-[11px] text-slate-500'>Reserved Slot</span>
                    <span className='text-[11px] font-medium text-slate-500 px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200'>
                      Stay tuned
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── BOX 5: Big Real-Time Credits Analytics Box (Indigo/Violet Accent) ── */}
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

                  {/* Progress Bar with Color Gradient */}
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

                  {/* Breakdown Table Rows */}
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

                {/* Primary CTA Button */}
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
