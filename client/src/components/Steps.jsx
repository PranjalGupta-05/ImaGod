import React from 'react'
import { motion } from 'framer-motion'
import Timeline from './effects/timeline'

const Steps = () => {
  return (
    <div id="how-it-works" className="w-full bg-canvas select-none relative pt-12 pb-6">
      {/* Intro Header Section */}
      <div className="max-w-[1024px] mx-auto pt-10 sm:pt-14 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100/80 border border-neutral-200/80 text-neutral-600 text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase mb-4 shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Product Pipeline · 01 — 06</span>
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
          className="text-3xl sm:text-4xl lg:text-[46px] text-ink font-bold max-w-[760px] mx-auto font-primary"
        >
          How ImaGod delivers <span className="text-primary font-bold">studio excellence</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-neutral-500 text-base sm:text-lg mt-3.5 mb-2 max-w-[600px] mx-auto leading-relaxed font-normal"
        >
          From prompt input to 4K publication master — see how each stage in our 6-phase neural pipeline guarantees unmatched fidelity.
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
      />
    </div>
  )
}

export default Steps
