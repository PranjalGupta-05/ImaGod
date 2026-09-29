import React, { useContext } from 'react'
import { motion } from 'framer-motion'
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
    <section className='w-full bg-surface-tile3 py-16 sm:py-24 select-none'>
      <div className='max-w-[840px] mx-auto px-4 sm:px-6 text-center flex flex-col items-center'>
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.1] text-primary-dark text-[12px] font-semibold tracking-wide uppercase mb-4'
        >
          Get Started
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='font-display-lg text-body-onDark max-w-[640px]'
        >
          Ready to create something extraordinary?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='font-lead text-body-muted mt-3 mb-8 max-w-[560px]'
        >
          Experience studio neural generation, background removal, and photo upscaling in one unified suite.
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
            className='inline-flex items-center gap-2 px-10 py-3.5 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 font-medium text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg'
          >
            Start Creating Free
          </button>
          <button
            onClick={() => navigate('/buycredit')}
            className='inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-base transition-all duration-200 hover:scale-105 active:scale-95'
          >
            View Credit Plans
          </button>
        </motion.div>

        <p className='font-fine-print text-[#86868b] mt-6'>
          Instant access · No installation required · High-resolution exports
        </p>
      </div>
    </section>
  )
}

export default GenerateBtn
