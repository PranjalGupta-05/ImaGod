import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const GenerateBtn = () => {
  const { user, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const onClickHandler = () => {
    if (user) {
      navigate('/result')
    } else {
      setShowLogin(true)
    }
  }

  return (
    <section className='w-full bg-canvas py-16 sm:py-24 px-4 sm:px-6 select-none'>
      <div className='max-w-[1140px] mx-auto rounded-[32px] bg-black text-white p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl'>
        {/* Subtle background ambient mesh glow */}
        <div className='absolute -top-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none' />
        <div className='absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none' />

        <div className='max-w-[840px] mx-auto text-center flex flex-col items-center relative z-10'>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center gap-2 px-3 py-1 bg-neon text-black font-extrabold text-[11px] sm:text-xs tracking-widest uppercase mb-6 shadow-xs'
          >
            <span>NEXT STEPS · 04</span>
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase text-white tracking-[-0.03em] leading-[0.95] max-w-[720px]'
          >
            READY TO CREATE WHAT MOVES?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-neutral-400 text-base sm:text-lg mt-5 mb-10 max-w-[560px] leading-relaxed font-normal'
          >
            Experience studio-grade neural generation, instant background removal, and 4K photo upscaling in one unified suite.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='flex flex-wrap items-center justify-center gap-4'
          >
            <button
              onClick={onClickHandler}
              className='group inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-neutral-100 text-black font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg cursor-pointer'
            >
              <span className='uppercase font-bold tracking-wide'>Start Creating Free</span>
              <span className='w-7 h-7 rounded-full bg-neon text-black flex items-center justify-center transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5'>
                <ArrowUpRight className='w-4 h-4 stroke-[2.5]' />
              </span>
            </button>
            <button
              onClick={() => navigate('/buycredit')}
              className='inline-flex items-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wide'
            >
              View Credit Plans
            </button>
          </motion.div>

          <p className='text-xs font-mono text-neutral-400 mt-8 tracking-wider uppercase'>
            [ Instant Access · No Installation Required · High-Res 4K Exports ]
          </p>
        </div>
      </div>
    </section>
  )
}

export default GenerateBtn
