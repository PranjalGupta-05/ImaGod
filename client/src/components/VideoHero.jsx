import React, { useRef, useEffect, useState, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { AppContext } from '../context/AppContext'

const VideoHero = () => {
  const { user, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const containerRef = useRef(null)
  const videoRef = useRef(null)

  // Track scroll and smoothed progress for the text transition
  const [progress, setProgress] = useState(0)
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const rafIdRef = useRef(null)

  // Navigation handler for Get Started
  const handleGetStarted = useCallback(() => {
    if (user) {
      navigate('/result')
    } else {
      setShowLogin(true)
    }
  }, [user, navigate, setShowLogin])

  // Ensure video autoplays smoothly in loop
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true
    video.loop = true

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy fallback
      })
    }
  }, [])

  // Scroll listener to compute progress through the hero section
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalScrollable = rect.height - window.innerHeight
      if (totalScrollable <= 0) return

      // Progress: 0 at top, 1 when scrolled through the hero track
      const scrolled = -rect.top
      const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollable))
      targetProgressRef.current = rawProgress
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Smooth lerp loop for text transitions
  useEffect(() => {
    let lastTime = performance.now()

    const tick = (now) => {
      rafIdRef.current = requestAnimationFrame(tick)

      const delta = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      // Smooth interpolation for fluid text transitions
      const diff = targetProgressRef.current - currentProgressRef.current
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * Math.min(delta * 14, 0.3)
      } else {
        currentProgressRef.current = targetProgressRef.current
      }

      setProgress(currentProgressRef.current)
    }

    rafIdRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  // Calculate opacity and transforms based on smoothed scroll progress
  // Phase 1 (Initial Text): visible from 0 to 0.35, fades out between 0.35 and 0.50
  const initialOpacity = Math.max(0, Math.min(1, (0.42 - progress) / 0.18))
  const initialTranslateY = -((1 - initialOpacity) * 24)

  // Phase 2 (After Scrolling Text): hidden until 0.48, fades in between 0.48 and 0.68
  const scrolledOpacity = Math.max(0, Math.min(1, (progress - 0.48) / 0.18))
  const scrolledTranslateY = (1 - scrolledOpacity) * 24

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[230vh] bg-canvas select-none"
    >
      {/* Sticky Fullscreen Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-between">

        {/* Background Looping Video Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            ref={videoRef}
            src="/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center lg:object-right pointer-events-none"
          />

          {/* Premium Gradient Scrims & Masks */}
          {/* Left-side mask to guarantee crystal-clear typography readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/95 via-45% md:via-50% to-transparent pointer-events-none z-10" />

          {/* Top subtle fade under floating navbar */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-canvas/90 via-canvas/40 to-transparent pointer-events-none z-10" />

          {/* Bottom feather-soft blend seamlessly into the next section (NO harsh border line!) */}
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-canvas via-canvas/90 via-40% to-transparent pointer-events-none z-10" />

          {/* Subtle ambient light glow on the left */}
          <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-10" />
        </div>

        {/* Content Container — Left-Aligned, single vertical axis */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex items-center min-h-screen">
          <div className="w-full max-w-xl lg:max-w-2xl text-left relative min-h-[380px] sm:min-h-[420px] flex items-center">

            {/* INITIAL STATE (visible at top, fades on scroll) */}
            <div
              style={{
                opacity: initialOpacity,
                transform: `translateY(${initialTranslateY}px)`,
                pointerEvents: initialOpacity > 0.05 ? 'auto' : 'none',
                visibility: initialOpacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-x-0 transition-opacity duration-75"
            >
              {/* Eyebrow Badge — Secondary font, consistent brand pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] text-neutral-600 text-[12px] font-medium tracking-[0.06em] uppercase mb-5 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>AI image generation & editing</span>
              </div>

              {/* Headline — Primary Font (Poppins), bold, clean tracking */}
              <h1
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(2.4rem, 4.8vw, 4.25rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
                className="text-ink max-w-[540px] font-primary"
              >
                Turn your words{' '}
                <br className="hidden sm:inline" />
                into <span className="text-primary font-bold">any image</span>
              </h1>

              {/* Body — Secondary Font (Plus Jakarta Sans) */}
              <p
                className="font-sans text-[16px] sm:text-[17px] font-normal leading-[1.6] text-neutral-600 mt-5 max-w-[500px]"
              >
                Generate, enhance, remove backgrounds, and upscale — all from one studio. No prompt engineering needed.
              </p>

              {/* Scroll hint — Secondary font */}
              <div className="mt-9 flex items-center gap-2.5 text-[13px] font-medium text-neutral-400 font-sans">
                <div className="w-4 h-7 rounded-full border border-neutral-300 flex items-start justify-center p-0.5">
                  <div className="w-1 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                </div>
                <span>Scroll to explore</span>
              </div>
            </div>

            {/* AFTER SCROLLING (fades in) */}
            <div
              style={{
                opacity: scrolledOpacity,
                transform: `translateY(${scrolledTranslateY}px)`,
                pointerEvents: scrolledOpacity > 0.05 ? 'auto' : 'none',
                visibility: scrolledOpacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-x-0 transition-opacity duration-75"
            >
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] text-neutral-600 text-[12px] font-medium tracking-[0.06em] uppercase mb-5 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Text to image, enhance & edit</span>
              </div>

              {/* Headline — Primary Font (Poppins) */}
              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(2.4rem, 4.8vw, 4.25rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
                className="text-ink max-w-[540px] font-primary"
              >
                Create without{' '}
                <br className="hidden sm:inline" />
                the <span className="text-primary font-bold">complexity</span>
              </h2>

              {/* Body — Secondary Font */}
              <p
                className="font-sans text-[16px] sm:text-[17px] font-normal leading-[1.6] text-neutral-600 mt-5 max-w-[500px]"
              >
                4K generation, background removal, and photo repair in one place. Free credits to start, no card required.
              </p>

              {/* Buttons + microcopy — Theme aligned */}
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[15px] shadow-[0_2px_12px_rgba(0,102,204,0.25)] hover:shadow-[0_4px_20px_rgba(0,102,204,0.35)] active:scale-[0.98] transition-all duration-200 cursor-pointer font-primary"
                >
                  Launch studio
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="font-sans text-[13px] text-neutral-500">
                  Free credits included. No card required.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Removed harsh divider line here to provide ultra smooth shifting between sections */}

      </div>
    </section>
  )
}

export default VideoHero
