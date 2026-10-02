import React, { useRef, useEffect, useState, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AppContext } from '../context/AppContext'

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Configuration block for hero scroll scrubbing
const CONFIG = {
  FRAME_COUNT: 169, // Clamps exactly at the high-res eye frame to prevent washing out into blank white frames
  PIN_HEIGHT: '450vh',
  SCRUB: 0.5,
}

// Complete feature suite for vertical marquee
const ALL_CAPABILITIES = [
  { tag: '01', title: 'Text to Image', desc: 'Turn natural descriptions into photorealistic visuals.' },
  { tag: '02', title: 'Background Removal', desc: 'Isolate subjects with sub-pixel edge precision.' },
  { tag: '03', title: 'Photo Enhancement', desc: 'Upscale clarity and restore fine lighting balance.' },
  { tag: '04', title: 'AI Unblur', desc: 'Fix camera shake and motion blur on faces & objects.' },
  { tag: '05', title: 'Generative Fill', desc: 'Seamlessly extend canvas borders and replace elements.' },
  { tag: '06', title: 'AI Image Editor', desc: 'Fine-tune compositions with prompt-driven canvas tools.' },
  { tag: '07', title: '4K Ultra Upscale', desc: 'Lossless resolution enhancement ready for commercial print.' },
  { tag: '08', title: 'Batch Processing', desc: 'Process multiple creative assets at scale with speed.' },
]

// Minimal creation pipeline steps for the eye frame
const PIPELINE_STEPS = [
  { num: '01', title: 'Prompt', desc: 'Natural language idea input' },
  { num: '02', title: 'Synthesis', desc: 'Sub-second neural generation' },
  { num: '03', title: 'Refine', desc: 'Detail & lighting enhancement' },
  { num: '04', title: 'Export', desc: 'Lossless 4K commercial asset' },
]

// Helper to compute scene opacity & translation windows
const getSceneTransform = (progress, fadeInStart, peakStart, peakEnd, fadeOutEnd) => {
  if (progress < fadeInStart) return { opacity: 0, translateY: 20 }
  if (progress < peakStart) {
    const t = (progress - fadeInStart) / (peakStart - fadeInStart)
    return { opacity: t, translateY: (1 - t) * 16 }
  }
  if (progress <= peakEnd) {
    return { opacity: 1, translateY: 0 }
  }
  if (progress < fadeOutEnd) {
    const t = 1 - (progress - peakEnd) / (fadeOutEnd - peakEnd)
    return { opacity: t, translateY: (1 - t) * -16 }
  }
  return { opacity: 0, translateY: -20 }
}

const VideoHero = () => {
  const { user, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const rafScheduledRef = useRef(false)

  const [currentFrame, setCurrentFrame] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [loadedCount, setLoadedCount] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Navigation handler for Get Started
  const handleGetStarted = useCallback(() => {
    if (user) {
      navigate('/result')
    } else {
      setShowLogin(true)
    }
  }, [user, navigate, setShowLogin])

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const handler = (e) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Canvas drawing routine (cover fit, devicePixelRatio scaling)
  const renderFrame = useCallback((index) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // Find requested image or fallback to nearest loaded frame
    let img = imagesRef.current[index]
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let i = index - 1; i >= 0; i--) {
        if (imagesRef.current[i]?.complete && imagesRef.current[i]?.naturalWidth > 0) {
          img = imagesRef.current[i]
          break
        }
      }
    }
    if (!img || !img.complete || img.naturalWidth === 0) {
      img = imagesRef.current[0]
    }
    if (!img || !img.complete || img.naturalWidth === 0) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    const targetW = Math.round(width * dpr)
    const targetH = Math.round(height * dpr)

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW
      canvas.height = targetH
    }

    ctx.save()
    ctx.scale(dpr, dpr)

    // Cover math
    const imgRatio = img.naturalWidth / img.naturalHeight
    const canvasRatio = width / height

    let drawW, drawH, drawX, drawY

    if (canvasRatio > imgRatio) {
      drawW = width
      drawH = width / imgRatio
      drawX = 0
      drawY = (height - drawH) / 2
    } else {
      drawH = height
      drawW = height * imgRatio
      drawX = (width - drawW) / 2
      drawY = 0
    }

    // Clean background fill matching site canvas (#fafafc)
    ctx.fillStyle = '#fafafc'
    ctx.fillRect(0, 0, width, height)

    // Draw frame
    ctx.drawImage(img, drawX, drawY, drawW, drawH)
    ctx.restore()
  }, [])

  // Preload frame sequence with progress tracking
  useEffect(() => {
    const totalFrames = CONFIG.FRAME_COUNT
    const loadedImages = new Array(totalFrames)
    imagesRef.current = loadedImages

    let count = 0

    // Load first frame with high priority to render immediately
    const firstImg = new Image()
    firstImg.src = '/frames/frame_0000.webp'
    firstImg.onload = () => {
      loadedImages[0] = firstImg
      count++
      setLoadedCount(count)
      renderFrame(0)
    }

    // Stream load the remaining frames in background
    for (let i = 1; i < totalFrames; i++) {
      const img = new Image()
      const padded = String(i).padStart(4, '0')
      img.src = `/frames/frame_${padded}.webp`

      img.onload = () => {
        loadedImages[i] = img
        count++
        setLoadedCount(count)
      }

      img.onerror = () => {
        count++
        setLoadedCount(count)
      }
    }
  }, [renderFrame])

  // Window resize handler to maintain sharp canvas aspect
  useEffect(() => {
    const handleResize = () => {
      renderFrame(currentFrameRef.current)
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [renderFrame])

  // GSAP ScrollTrigger pinning and scroll scrubbing
  useEffect(() => {
    if (prefersReducedMotion) {
      renderFrame(0)
      return
    }

    const container = containerRef.current
    const stage = stageRef.current
    if (!container || !stage) return

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      pinSpacing: true,
      scrub: CONFIG.SCRUB,
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress
        setScrollProgress(progress)

        const rawFrame = Math.round(progress * (CONFIG.FRAME_COUNT - 1))
        const frameIndex = Math.min(CONFIG.FRAME_COUNT - 1, Math.max(0, rawFrame))

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex
          setCurrentFrame(frameIndex)

          if (!rafScheduledRef.current) {
            rafScheduledRef.current = true
            requestAnimationFrame(() => {
              renderFrame(frameIndex)
              rafScheduledRef.current = false
            })
          }
        }
      },
    })

    return () => {
      trigger.kill()
    }
  }, [prefersReducedMotion, renderFrame])


  // Text Scenes (4 scenes across scroll progress 0.0 to 1.0)
  // Scene 1: 0.00 - 0.28
  const scene1 = prefersReducedMotion
    ? { opacity: 1, translateY: 0 }
    : getSceneTransform(scrollProgress, 0.0, 0.0, 0.18, 0.28)

  // Scene 2: 0.28 - 0.55
  const scene2 = prefersReducedMotion
    ? { opacity: 0, translateY: 20 }
    : getSceneTransform(scrollProgress, 0.26, 0.33, 0.46, 0.54)

  // Scene 3: 0.55 - 0.78
  const scene3 = prefersReducedMotion
    ? { opacity: 0, translateY: 20 }
    : getSceneTransform(scrollProgress, 0.52, 0.59, 0.71, 0.77)

  // Scene 4: 0.74 - 0.96 (Smoothly dissolves out before scroll ends so nothing lingers on screen)
  const scene4 = prefersReducedMotion
    ? { opacity: 0, translateY: 20 }
    : getSceneTransform(scrollProgress, 0.74, 0.81, 0.91, 0.96)

  // Creation pipeline stepping during the eye frame (Scene 4: 0.74 to 0.91)
  const pipelineProgress = prefersReducedMotion
    ? 1
    : Math.max(0, Math.min(1, (scrollProgress - 0.74) / (0.91 - 0.74)))

  const activePipelineIndex = Math.min(
    PIPELINE_STEPS.length - 1,
    Math.floor(pipelineProgress * PIPELINE_STEPS.length)
  )

  // Interactive jump to pipeline step
  const handlePipelineStepClick = useCallback((index) => {
    if (!containerRef.current) return
    const targetProgress = 0.75 + (index / 3.5) * 0.22
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight
    window.scrollTo({
      top: targetProgress * totalScrollable,
      behavior: 'smooth',
    })
  }, [])

  const loadPercent = Math.min(100, Math.round((loadedCount / CONFIG.FRAME_COUNT) * 100))

  return (
    <section
      ref={containerRef}
      style={{ height: prefersReducedMotion ? '100vh' : CONFIG.PIN_HEIGHT }}
      className="relative w-full bg-canvas select-none"
    >
      {/* Sticky Fullscreen Stage */}
      <div
        ref={stageRef}
        className="h-screen w-full overflow-hidden relative flex items-center justify-between"
      >
        {/* Minimal thin progress loader during initial frame caching */}
        <div
          className={`absolute top-0 inset-x-0 h-[2px] bg-neutral-100 z-50 pointer-events-none transition-opacity duration-700 ${
            loadPercent >= 100 ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            style={{ width: `${loadPercent}%` }}
            className="h-full bg-primary transition-all duration-150 ease-out"
          />
        </div>

        {/* Fullsize Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Bottom feather-soft blend seamlessly into the next section */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-canvas via-canvas/90 via-40% to-transparent pointer-events-none z-10" />

        {/* Top subtle fade under floating navbar */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-canvas/90 via-canvas/40 to-transparent pointer-events-none z-10" />

        {/* Dual Flanking Typography Layer: Left and Right balanced typography */}
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 flex items-center justify-between min-h-screen pointer-events-none">
          {/* Left Column (Primary Narrative & Headings) - Clean direct typography without enclosing container */}
          <div className="w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[430px] text-left relative min-h-[320px] sm:min-h-[350px] flex items-center pointer-events-none">

            {/* SCENE 1 (Initial Hero State) */}
            <div
              style={{
                opacity: scene1.opacity,
                transform: `translateY(${scene1.translateY}px)`,
                pointerEvents: scene1.opacity > 0.05 ? 'auto' : 'none',
                visibility: scene1.opacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-x-0 transition-opacity duration-75"
            >
              <h1
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(1.95rem, 2.7vw, 2.65rem)',
                  lineHeight: 1.14,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
                className="text-ink max-w-[360px] font-primary"
              >
                Turn text into{' '}
                <br />
                <span className="text-primary font-bold">stunning visuals</span>
              </h1>

              <p className="font-sans text-[15px] sm:text-[16px] font-normal leading-[1.6] text-neutral-600 mt-4 max-w-[340px]">
                Generate photorealistic images, remove backgrounds, and enhance quality in seconds.
              </p>

              <div className="mt-8 flex items-center gap-2.5 text-[13px] font-medium text-neutral-400 font-sans">
                <div className="w-4 h-7 rounded-full border border-neutral-300 flex items-start justify-center p-0.5">
                  <div className="w-1 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                </div>
                <span>Scroll to explore</span>
              </div>
            </div>

            {/* SCENE 2 (Generation / Motion Phase) */}
            <div
              style={{
                opacity: scene2.opacity,
                transform: `translateY(${scene2.translateY}px)`,
                pointerEvents: scene2.opacity > 0.05 ? 'auto' : 'none',
                visibility: scene2.opacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-x-0 transition-opacity duration-75"
            >
              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(1.95rem, 2.7vw, 2.65rem)',
                  lineHeight: 1.14,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
                className="text-ink max-w-[360px] font-primary"
              >
                From idea to{' '}
                <br />
                <span className="text-primary font-bold">finished artwork</span>
              </h2>

              <p className="font-sans text-[15px] sm:text-[16px] font-normal leading-[1.6] text-neutral-600 mt-4 max-w-[340px]">
                Describe what you envision. Our model generates high-definition assets without complex prompting.
              </p>
            </div>

            {/* SCENE 3 (Fine Detail Phase - Mobile only on left, shifted to right on desktop) */}
            <div
              style={{
                opacity: scene3.opacity,
                transform: `translateY(${scene3.translateY}px)`,
                pointerEvents: scene3.opacity > 0.05 ? 'auto' : 'none',
                visibility: scene3.opacity > 0 ? 'visible' : 'hidden',
              }}
              className="md:hidden absolute inset-x-0 transition-opacity duration-75"
            >
              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(1.95rem, 2.7vw, 2.65rem)',
                  lineHeight: 1.14,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
                className="text-ink max-w-[360px] font-primary"
              >
                Razor-sharp{' '}
                <br />
                <span className="text-primary font-bold">fine detail</span>
              </h2>

              <p className="font-sans text-[15px] sm:text-[16px] font-normal leading-[1.6] text-neutral-600 mt-4 max-w-[340px]">
                Lifelike textures, clean edges, and natural lighting crafted for commercial creative work.
              </p>
            </div>

            {/* SCENE 4 (Eye Frame Trigger & Studio Launch) */}
            <div
              style={{
                opacity: scene4.opacity,
                transform: `translateY(${scene4.translateY}px)`,
                pointerEvents: scene4.opacity > 0.05 ? 'auto' : 'none',
                visibility: scene4.opacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-x-0 transition-opacity duration-75"
            >
              {/* Soft ambient backlight diffusion for high-contrast visibility against eye canvas */}
              <div className="absolute -inset-10 -z-10 rounded-full bg-white/75 blur-3xl pointer-events-none" />

              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(1.95rem, 2.7vw, 2.65rem)',
                  lineHeight: 1.14,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
                className="text-ink max-w-[360px] font-primary [text-shadow:_0_1px_16px_rgba(255,255,255,0.95)]"
              >
                Create without{' '}
                <br />
                <span className="text-primary font-bold">limitations</span>
              </h2>

              <p className="font-sans text-[15px] sm:text-[16px] font-medium leading-[1.65] text-neutral-900 mt-4 max-w-[340px] [text-shadow:_0_1px_10px_rgba(255,255,255,0.9)]">
                Speed, precision, and complete creative control over every image you produce.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[14px] sm:text-[15px] shadow-[0_2px_12px_rgba(0,102,204,0.25)] hover:shadow-[0_4px_20px_rgba(0,102,204,0.35)] active:scale-[0.98] transition-all duration-200 cursor-pointer font-primary pointer-events-auto"
                >
                  Generate images
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="font-sans text-[12px] sm:text-[13px] text-neutral-800 font-semibold [text-shadow:_0_1px_8px_rgba(255,255,255,0.9)]">
                  Free credits included.
                </p>
              </div>

              {/* Mobile Minimal Creation Pipeline Stepper */}
              <div className="md:hidden mt-8 pt-5 border-t border-black/[0.1] flex items-center justify-between w-full max-w-[340px]">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isActive = idx === activePipelineIndex
                  const isPast = idx < activePipelineIndex

                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => handlePipelineStepClick(idx)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer pointer-events-auto"
                    >
                      <div
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          isActive
                            ? 'bg-primary scale-125 ring-2 ring-primary/25'
                            : isPast
                            ? 'bg-ink'
                            : 'bg-neutral-300'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono tracking-tight transition-colors duration-200 ${
                          isActive
                            ? 'text-primary font-bold'
                            : isPast
                            ? 'text-neutral-800 font-semibold'
                            : 'text-neutral-500 font-medium'
                        }`}
                      >
                        {step.num} {step.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Right Column Area: Holds Scene 1 Marquee and Scene 4 Creation Pipeline */}
          <div className="hidden md:flex flex-col w-full max-w-[280px] lg:max-w-[320px] text-left relative min-h-[350px] justify-center pointer-events-none">
            {/* Scene 1: Dynamic Vertical Marquee Capabilities List (Visible ONLY during Scene 1) */}
            <div
              style={{
                opacity: scene1.opacity,
                transform: `translateY(${scene1.translateY}px)`,
                pointerEvents: scene1.opacity > 0.05 ? 'auto' : 'none',
                visibility: scene1.opacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-0 flex flex-col justify-center transition-opacity duration-75"
            >
              {/* Vertical Infinite Marquee Window with Top & Bottom Feather Masks - Clean direct track without container card */}
              <div className="relative h-[250px] sm:h-[275px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] pointer-events-auto">
                <div className="vertical-marquee-track flex flex-col gap-3.5 py-2">
                  {[...ALL_CAPABILITIES, ...ALL_CAPABILITIES].map((item, idx) => (
                    <div
                      key={idx}
                      className="border-l-2 border-primary/35 hover:border-primary pl-3 py-0.5 transition-colors group cursor-default select-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold text-primary/70">{item.tag}</span>
                        <span className="text-[13.5px] font-semibold text-ink font-primary group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-[12px] text-neutral-500 font-sans mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <style>{`
                @keyframes verticalMarquee {
                  0% { transform: translateY(0%); }
                  100% { transform: translateY(-50%); }
                }
                .vertical-marquee-track {
                  animation: verticalMarquee 24s linear infinite;
                  will-change: transform;
                }
                .vertical-marquee-track:hover {
                  animation-play-state: paused;
                }
              `}</style>
            </div>

            {/* Scene 3: Shifted to Right Hand Side */}
            <div
              style={{
                opacity: scene3.opacity,
                transform: `translateY(${scene3.translateY}px)`,
                pointerEvents: scene3.opacity > 0.05 ? 'auto' : 'none',
                visibility: scene3.opacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-0 flex flex-col justify-center transition-opacity duration-75 text-left"
            >
              {/* Soft ambient backlight diffusion for high-contrast visibility against canvas */}
              <div className="absolute -inset-10 -z-10 rounded-full bg-white/75 blur-3xl pointer-events-none" />

              <h2
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(1.95rem, 2.7vw, 2.65rem)',
                  lineHeight: 1.14,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
                className="text-ink max-w-[360px] font-primary [text-shadow:_0_1px_16px_rgba(255,255,255,0.95)]"
              >
                Razor-sharp{' '}
                <br />
                <span className="text-primary font-bold">fine detail</span>
              </h2>

              <p className="font-sans text-[15px] sm:text-[16px] font-medium leading-[1.65] text-neutral-800 mt-4 max-w-[340px] [text-shadow:_0_1px_10px_rgba(255,255,255,0.9)]">
                Lifelike textures, clean edges, and natural lighting crafted for commercial creative work.
              </p>
            </div>

            {/* Scene 4: Minimal Creation Pipeline (Visible ONLY during Scene 4: Eye Frame) */}
            <div
              style={{
                opacity: scene4.opacity,
                transform: `translateY(${scene4.translateY}px)`,
                pointerEvents: scene4.opacity > 0.05 ? 'auto' : 'none',
                visibility: scene4.opacity > 0 ? 'visible' : 'hidden',
              }}
              className="absolute inset-0 flex flex-col justify-center transition-opacity duration-75"
            >
              {/* Soft ambient diffusion backdrop for razor-sharp readability */}
              <div className="absolute -inset-10 -z-10 rounded-full bg-white/75 blur-3xl pointer-events-none" />

              {/* Minimalist Section Header */}
              <div className="flex items-center gap-2.5 mb-7 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] sm:text-[12px] font-mono uppercase tracking-[0.2em] text-neutral-800 font-bold [text-shadow:_0_1px_8px_rgba(255,255,255,0.9)]">
                  Creation Pipeline
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/[0.06] text-neutral-600 font-semibold ml-auto">
                  Step {activePipelineIndex + 1}/4
                </span>
              </div>

              {/* Stepper with clear vertical hairline & node progression */}
              <div className="relative flex flex-col gap-6 pl-5 border-l-2 border-neutral-300/80">
                {/* Active progress hairline fill */}
                <div
                  style={{
                    height: `${Math.min(100, Math.max(8, ((activePipelineIndex + 0.6) / PIPELINE_STEPS.length) * 100))}%`,
                  }}
                  className="absolute left-[-2px] top-0 w-[2px] bg-primary transition-all duration-300 ease-out shadow-[0_0_8px_rgba(0,102,204,0.5)]"
                />

                {PIPELINE_STEPS.map((step, idx) => {
                  const isActive = idx === activePipelineIndex
                  const isPast = idx < activePipelineIndex

                  return (
                    <div
                      key={step.num}
                      onClick={() => handlePipelineStepClick(idx)}
                      className={`relative transition-all duration-300 cursor-pointer pointer-events-auto group ${
                        isActive
                          ? 'opacity-100 translate-x-1.5'
                          : isPast
                          ? 'opacity-90 hover:opacity-100'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Node dot on connecting line */}
                      <div
                        className={`absolute -left-[27px] top-1 rounded-full border-2 border-white transition-all duration-300 ${
                          isActive
                            ? 'w-3.5 h-3.5 bg-primary scale-110 shadow-[0_0_12px_rgba(0,102,204,0.6)]'
                            : isPast
                            ? 'w-3 h-3 bg-ink'
                            : 'w-3 h-3 bg-neutral-300 group-hover:bg-neutral-400'
                        }`}
                      />

                      <div className="flex items-baseline gap-2.5">
                        <span
                          className={`font-mono text-[11px] tracking-wider transition-colors duration-200 ${
                            isActive
                              ? 'text-primary font-bold'
                              : isPast
                              ? 'text-ink font-semibold'
                              : 'text-neutral-500 font-semibold'
                          }`}
                        >
                          {step.num}
                        </span>
                        <span
                          className={`font-primary text-[15px] sm:text-[16px] tracking-tight transition-colors duration-200 [text-shadow:_0_1px_8px_rgba(255,255,255,0.95)] ${
                            isActive
                              ? 'text-ink font-bold group-hover:text-primary'
                              : isPast
                              ? 'text-neutral-800 font-semibold'
                              : 'text-neutral-700 font-semibold group-hover:text-ink'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>

                      <p
                        className={`font-sans text-[12.5px] sm:text-[13px] mt-0.5 leading-snug transition-colors duration-200 [text-shadow:_0_1px_8px_rgba(255,255,255,0.95)] ${
                          isActive
                            ? 'text-neutral-800 font-medium'
                            : isPast
                            ? 'text-neutral-600 font-normal'
                            : 'text-neutral-500 font-normal group-hover:text-neutral-700'
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

export default VideoHero
