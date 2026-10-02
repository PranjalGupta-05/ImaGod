import React, { useContext } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'

const GenerateBtn = () => {
  const { user, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const onClickHandler = () => {
    if (user) {
      navigate('/result')
    } else {
      setShowLogin(true)
    }
  }

  const animTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }

  return (
    <section className='w-full bg-canvas py-16 sm:py-24 px-4 sm:px-6 select-none'>
      <div className='max-w-[1140px] mx-auto rounded-[32px] bg-[#0f0f11] text-white p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl border border-neutral-800/80'>
        {/* Soft, subtle atmospheric top bloom */}
        <div className='absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-primary/[0.18] blur-[80px] pointer-events-none rounded-full' />

        <div className='max-w-[840px] mx-auto text-center flex flex-col items-center relative z-10'>
          {/* Badge: Next Steps · 04 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={animTransition}
            className='inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-neutral-300 text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase mb-5 font-body'
          >
            <span className='w-1.5 h-1.5 rounded-full bg-primary-dark animate-pulse' />
            <span>Next Steps · 04</span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={animTransition}
            style={{
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
            className='font-primary text-3xl sm:text-4xl lg:text-[50px] font-bold text-white max-w-[720px]'
          >
            Ready to create <span className='text-primary-dark font-bold'>what moves you?</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={animTransition}
            className='text-neutral-400 text-base sm:text-lg mt-4 mb-9 max-w-[560px] leading-relaxed font-normal font-body'
          >
            Experience studio-grade AI generation, instant background removal, and 4K photo upscaling in one unified suite.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={animTransition}
            className='flex flex-wrap items-center justify-center gap-4'
          >
            <Button
              onClick={onClickHandler}
              variant='primary'
              size='lg'
              iconRight={ArrowRight}
              className='bg-primary hover:bg-primary-focus shadow-[0_2px_16px_rgba(0,102,204,0.4)]'
            >
              Start creating free
            </Button>
            <Button
              onClick={() => navigate('/buycredit')}
              variant='outline'
              size='lg'
              className='bg-white/10 hover:bg-white/15 text-white border-white/20'
            >
              View credit plans
            </Button>
          </motion.div>

          {/* Trust Footnote */}
          <p className='text-xs text-neutral-400 mt-8 tracking-normal font-body'>
            Instant access · Free credits included · No credit card required
          </p>
        </div>
      </div>
    </section>
  )
}

export default GenerateBtn
