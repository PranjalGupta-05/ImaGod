import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Timeline from './effects/timeline'
import sample_img_1 from '../assets/sample_img_1.png'

const Steps = () => {
  const navigate = useNavigate()

  return (
    <div id="how-it-works" className="w-full bg-canvas select-none relative pt-12 pb-6">
      {/* Intro Header Section */}
      <div className="max-w-[1024px] mx-auto pt-12 sm:pt-16 px-4 sm:px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-neon text-black font-extrabold text-[11px] sm:text-xs tracking-widest uppercase mb-5 shadow-xs"
        >
          <span>PRODUCT PIPELINE · 01 — 06</span>
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl sm:text-5xl lg:text-[56px] font-extrabold uppercase text-ink tracking-[-0.03em] leading-[0.96]"
        >
          HOW IMAGIFY DELIVERS STUDIO EXCELLENCE
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-neutral-600 text-base sm:text-lg lg:text-[18px] mt-4 mb-6 max-w-[640px] mx-auto leading-relaxed font-normal"
        >
          From natural language input to 4K publication-ready output — discover how each stage in our 6-phase neural pipeline guarantees unmatched fidelity, speed, and precision.
        </motion.p>
      </div>

      {/* Interactive Horizontal Scroll Product Timeline */}
      <Timeline
        title="Creation Pipeline"
        periodLabel="Phase 01 — 06"
        textColor="#0f0f11"
        mutedTextColor="#5a5a62"
        activeColor="#0066cc"
        backgroundColor="#fafafc"
        imageUrl={sample_img_1}
        imageAlt="Imagify Studio Neural Output"
      />
    </div>
  )
}

export default Steps
