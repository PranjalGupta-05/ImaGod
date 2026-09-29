import React from 'react'
import { assets, testimonialsData } from '../assets/assets'
import { motion } from 'framer-motion'

const Testimonials = () => {
  return (
    <section className='w-full bg-canvas py-16 sm:py-20 select-none'>
      <div className='max-w-[1024px] mx-auto px-4 sm:px-6 text-center'>
        {/* Section Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/[0.06] text-primary text-[12px] font-semibold tracking-wide uppercase mb-4'
        >
          Testimonials
        </motion.span>

        {/* Section Headline (display-lg: 40px / 600) */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='font-display-lg text-ink'
        >
          Loved by Creators Worldwide
        </motion.h2>

        {/* Section Subcopy (lead: 28px / 400) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className='font-lead text-[#6e6e73] mt-3 mb-12 max-w-[620px] mx-auto'
        >
          See what designers, art directors, and creative studios accomplish with Imagify.
        </motion.p>

        {/* Grid of Apple-style Testimonial Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-left'>
          {testimonialsData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className='bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200'
            >
              <div>
                {/* Rating stars */}
                <div className='flex items-center gap-1 mb-4'>
                  {Array(item.stars)
                    .fill(0)
                    .map((_, sIdx) => (
                      <img
                        key={sIdx}
                        src={assets.rating_star}
                        alt='Star'
                        className='w-4 h-4'
                      />
                    ))}
                </div>

                {/* Quote text */}
                <p className='font-body text-[#6e6e73] text-[15px] leading-[1.47] mb-6'>
                  "{item.text}"
                </p>
              </div>

              {/* Author footer */}
              <div className='flex items-center gap-3 pt-4 border-t border-hairline'>
                <img
                  src={item.image}
                  alt={item.name}
                  className='w-10 h-10 rounded-full object-cover border border-hairline'
                />
                <div>
                  <h4 className='font-body-strong text-ink text-[15px]'>
                    {item.name}
                  </h4>
                  <p className='font-caption text-[#6e6e73] text-[13px]'>
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
