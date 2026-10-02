import React from 'react'

/**
 * Standardized Grain Texture Overlay
 * Delivers our signature subtle cinematic film grain across cards & surfaces.
 */
export const GrainOverlay = ({ className = '', opacity = 'opacity-[0.035]' }) => (
  <div
    className={`absolute inset-0 pointer-events-none ${opacity} mix-blend-overlay ${className}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

export default GrainOverlay
