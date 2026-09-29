import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Timeline from './effects/timeline'
import sample_img_1 from '../assets/sample_img_1.png'

const Steps = () => {
  const navigate = useNavigate()

  return (
    <div id="how-it-works" className="w-full bg-[#f5f5f7] select-none border-b border-[#e0e0e0]">
      {/* Intro Header Section */}
      <div className="max-w-[1024px] mx-auto pt-16 sm:pt-20 px-4 sm:px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/[0.08] text-primary text-[12px] font-semibold tracking-wide uppercase mb-4"
        >
          Product Timeline · Pipeline
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display-lg text-ink text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight"
        >
          How Imagify Delivers Studio Excellence
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-lead text-[#6e6e73] text-base sm:text-lg lg:text-[19px] mt-3 mb-6 max-w-[680px] mx-auto leading-relaxed"
        >
          From natural language input to 4K publication-ready output — discover how each stage in our 6-phase neural pipeline guarantees unmatched fidelity, speed, and precision.
        </motion.p>
      </div>

      {/* Interactive Horizontal Scroll Product Timeline */}
      <Timeline
        title="Creation Pipeline"
        periodLabel="Phase 01 — 06"
        textColor="#1d1d1f"
        mutedTextColor="#6e6e73"
        activeColor="#0066cc"
        backgroundColor="#f5f5f7"
        imageUrl={sample_img_1}
        imageAlt="Imagify Studio Neural Output"
      />


    </div>
  )
}

export default Steps
