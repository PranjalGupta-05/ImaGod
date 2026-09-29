import React from 'react'
import { motion } from 'framer-motion'
import how_it_works from '../assets/how_it_works.png'
import { useNavigate } from 'react-router-dom'

const Description = () => {
  const navigate = useNavigate()

  return (
    <section className='w-full bg-surface-tile1 py-16 sm:py-20 select-none'>
      <div className='max-w-[1024px] mx-auto px-4 sm:px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
          {/* Left: Product image with product shadow and radius 18 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className='flex justify-center'
          >
            <div className='w-full max-w-[460px] rounded-[18px] overflow-hidden shadow-2xl border border-white/10'>
              <img
                src={how_it_works}
                alt='Imagify Interface'
                className='w-full h-auto object-cover rounded-[18px]'
                loading='lazy'
              />
            </div>
          </motion.div>

          {/* Right: Dark Tile Copy Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className='text-left text-body-onDark flex flex-col justify-center'
          >
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-primary-dark text-[12px] font-semibold tracking-wide uppercase mb-4'>
              Studio Capabilities
            </span>

            <h2 className='font-display-md text-white mb-6 leading-tight'>
              Intelligent visual synthesis. Engineered for precision.
            </h2>

            <p className='font-body text-body-muted text-[17px] mb-4'>
              Easily bring your concepts to life with our high-throughput AI image generator. Whether you need cinematic keyframes, character design, or product visualization, Imagify transforms natural language descriptions into breathtaking assets with unmatched coherence.
            </p>

            <p className='font-body text-body-muted text-[17px] mb-8'>
              Powered by advanced diffusion transformers and trained on multi-billion asset representations, every render delivers fine textures, photorealistic depth-of-field, and nuanced lighting in seconds.
            </p>

            <div className='flex flex-wrap items-center gap-4'>
              <button
                onClick={() => navigate('/result')}
                className='inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md'
              >
                Launch Studio
              </button>
              <button
                onClick={() => navigate('/remove-bg')}
                className='inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95'
              >
                Explore Background Eraser
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Description
