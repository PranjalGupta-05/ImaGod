import React, { useContext } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
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
      <div className='max-w-[1140px] mx-auto rounded-[32px] bg-[#0f0f11] text-white p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl border border-neutral-800/80'>
        <div className='max-w-[840px] mx-auto text-center flex flex-col items-center relative z-10'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-neutral-300 text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase mb-5 font-sans'
          >
            <span className='w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
            <span>Next Steps · 04</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
            className='font-primary text-3xl sm:text-4xl lg:text-[50px] font-bold text-white max-w-[720px]'
          >
            Ready to create <span className='text-primary-dark font-bold'>what moves you?</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-neutral-400 text-base sm:text-lg mt-4 mb-9 max-w-[560px] leading-relaxed font-normal font-sans'
          >
            Experience studio-grade AI generation, instant background removal, and 4K photo upscaling in one unified suite.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='flex flex-wrap items-center justify-center gap-4'
          >
            <button
              onClick={onClickHandler}
              className='group inline-flex items-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 shadow-[0_2px_16px_rgba(0,102,204,0.4)] cursor-pointer font-primary'
            >
              <span>Start creating free</span>
              <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
            </button>
            <button
              onClick={() => navigate('/buycredit')}
              className='inline-flex items-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 cursor-pointer font-primary'
            >
              View credit plans
            </button>
          </motion.div>

          <p className='text-xs text-neutral-400 mt-8 tracking-normal font-sans'>
            Instant access · Free credits included · No credit card required
          </p>
        </div>
      </div>
    </section>
  )
}

export default GenerateBtn
