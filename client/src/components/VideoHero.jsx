import React, { useRef, useEffect, useState, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AppContext } from '../context/AppContext'

// Register GSAP plugins safely
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Configuration block for hero scroll scrubbing & pipeline integration
const CONFIG = {
  FRAME_COUNT: 270, // Merged Hero 2 (0-170) -> Hero 3 (171-269)
  PIN_HEIGHT: '950vh', // Generous scroll runway for video scrubbing + alternating pipeline journey
  SCRUB: 1.2, // Smooth, liquid inertia scrub catches up in 1.2s to prevent fast jumps
  VIDEO_END_PROGRESS: 0.54, // Video completes at 0.54 (~510vh), giving plenty of room for smooth, noticeable transitions
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

// 6-Stage Creation Pipeline Data — strictly alternating: 01 UP, 02 DOWN, 03 UP, 04 DOWN, 05 UP, 06 DOWN
const PIPELINE_PHASES = [
  {
    step: '01',
    side: 'up',
    phase: 'Input & Parsing',
    title: 'Intent Parsing',
    content: 'Translates natural prompts into spatial lighting, composition, and studio focal lengths.',
    tags: ['Natural Language', 'Auto-Composition'],
  },
  {
    step: '02',
    side: 'down',
    phase: 'Real-Time Compute',
    title: 'Sub-3s Inference',
    content: 'Dedicated multi-GPU tensor clusters deliver real-time diffusion in under 3 seconds.',
    tags: ['< 3s Latency', 'Tensor Clusters'],
  },
  {
    step: '03',
    side: 'up',
    phase: 'Latent Synthesis',
    title: 'Physical Lighting',
    content: 'Trained on studio masters for realistic skin tones, true anatomy, and volumetric diffusion.',
    tags: ['True Anatomy', 'Volumetric Depth'],
  },
  {
    step: '04',
    side: 'down',
    phase: 'Refinement',
    title: '4K Super-Resolution',
    content: 'Reconstructs micro-textures, fabric weaves, and crisp typography with zero blur.',
    tags: ['4K Native', 'Micro-Detail'],
  },
  {
    step: '05',
    side: 'up',
    phase: 'Segmentation',
    title: 'Sub-Pixel Matting',
    content: 'Single-click foreground isolation down to flyaway hair for instant alpha cutout PNGs.',
    tags: ['Sub-Pixel Mask', '1-Click Cutout'],
  },
  {
    step: '06',
    side: 'down',
    phase: 'Studio Handoff',
    title: 'Lossless Export',
    content: 'Instant download in 16-bit lossless PNG and WebP with full commercial usage rights.',
    tags: ['16-Bit PNG', 'Full Rights'],
  },
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
  const pipelineBoxRef = useRef(null)
  const trackRef = useRef(null)
  const imagesRef = useRef([])
  const currentFrameRef = useRef(0)
  const rafScheduledRef = useRef(false)

  const [currentFrame, setCurrentFrame] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [loadedCount, setLoadedCount] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [maxTrackShift, setMaxTrackShift] = useState(1200)

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

  // Window resize handler to maintain sharp canvas aspect and measure track shift
  useEffect(() => {
    const handleResize = () => {
      renderFrame(currentFrameRef.current)
      if (trackRef.current && pipelineBoxRef.current) {
        const diff = trackRef.current.scrollWidth - pipelineBoxRef.current.clientWidth + 100
        setMaxTrackShift(Math.max(400, diff))
      }
      ScrollTrigger.refresh()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [renderFrame])

  // Measure pipeline track width after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (trackRef.current && pipelineBoxRef.current) {
        const diff = trackRef.current.scrollWidth - pipelineBoxRef.current.clientWidth + 100
        setMaxTrackShift(Math.max(400, diff))
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [])

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

        // Scrub video up to VIDEO_END_PROGRESS (0.42), then lock at frame 269
        let frameIndex = 0
        if (progress < CONFIG.VIDEO_END_PROGRESS) {
          const videoT = progress / CONFIG.VIDEO_END_PROGRESS
          frameIndex = Math.min(CONFIG.FRAME_COUNT - 1, Math.round(videoT * (CONFIG.FRAME_COUNT - 1)))
        } else {
          frameIndex = CONFIG.FRAME_COUNT - 1
        }

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex
          setCurrentFrame(frameIndex)

          if (!rafScheduledRef.current) {
            rafScheduledRef.current = true
            requestAnimationFrame(() => {
              renderFrame(currentFrameRef.current)
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

  // Narrative Text Scenes during Hero 2 and initial Hero 3 (0.00 to 0.54)
  // Scene 1: 0.00 - 0.20 (Initial hero state + Marquee) - held steady longer for noticeable reading
  const scene1 = prefersReducedMotion
    ? { opacity: 1, translateY: 0 }
    : getSceneTransform(scrollProgress, 0.0, 0.0, 0.14, 0.20)

  // Scene 2: 0.20 - 0.36 (From idea to finished artwork)
  const scene2 = prefersReducedMotion
    ? { opacity: 0, translateY: 20 }
    : getSceneTransform(scrollProgress, 0.20, 0.24, 0.32, 0.36)

  // Scene 3: 0.36 - 0.53 (Razor-sharp fine detail zooming into eye)
  const scene3 = prefersReducedMotion
    ? { opacity: 0, translateY: 20 }
    : getSceneTransform(scrollProgress, 0.36, 0.40, 0.49, 0.53)

  // CREATION PIPELINE SCRUB (Starts at 0.54 right as Hero completes zoom out into profile)
  const pipelineOpacity = prefersReducedMotion
    ? 1
    : Math.min(1, Math.max(0, (scrollProgress - 0.52) / 0.03))

  // Horizontal travel progress across the blank space (0.55 to 0.96)
  const pipelineT = prefersReducedMotion
    ? 1
    : Math.min(1, Math.max(0, (scrollProgress - 0.55) / (0.96 - 0.55)))

  // Current horizontal translation of the pipeline slider
  const pipelineTranslateX = -pipelineT * maxTrackShift

  // Active phase index based on scroll (0 to 5)
  const activePhaseIndex = Math.min(
    PIPELINE_PHASES.length - 1,
    Math.max(0, Math.floor(pipelineT * PIPELINE_PHASES.length))
  )

  // Interactive jump to any phase on click
  const handlePhaseClick = useCallback((index) => {
    if (!containerRef.current) return
    const targetProgress = 0.55 + (index / (PIPELINE_PHASES.length - 0.5)) * (0.96 - 0.55)
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
          {/* Left Column (Primary Narrative & Headings) */}
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

          </div>

          {/* Right Column Area: Holds Scene 1 Marquee and Scene 3 Typography */}
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
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CREATION PIPELINE IN THE BLANK SPACE: STRICTLY ALTERNATING (UP / DOWN) */}
        {/* Starts from right after Hero3 ends. Guaranteed zero overlapping with android */}
        {/* ========================================================================= */}
        <div
          ref={pipelineBoxRef}
          id="how-it-works"
          style={{
            opacity: pipelineOpacity,
            pointerEvents: pipelineOpacity > 0.05 ? 'auto' : 'none',
            visibility: pipelineOpacity > 0 ? 'visible' : 'hidden',
          }}
          className="absolute top-0 bottom-0 left-0 md:left-[45%] lg:left-[47%] right-0 overflow-hidden flex items-center z-30 transition-opacity duration-200 [mask-image:linear-gradient(to_right,transparent,black_44px,black)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_44px,black)]"
        >
          {/* Horizontal sliding track that moves smoothly across the blank space */}
          <div
            ref={trackRef}
            style={{
              transform: `translate3d(${pipelineTranslateX}px, 0, 0)`,
              willChange: 'transform',
            }}
            className="flex items-center h-[500px] sm:h-[530px] pl-8 sm:pl-12 pr-28 py-2 shrink-0 relative transition-transform duration-75 ease-out select-none"
          >
            {/* Left Header Section inside track */}
            <div className="w-[220px] sm:w-[250px] h-[400px] flex flex-col justify-between py-4 pr-6 shrink-0 border-r border-neutral-200/80 mr-6">
              {/* Top Header Label */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/[0.08] text-primary text-[11px] font-semibold tracking-wide uppercase mb-3 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  How It Works
                </span>
                <h3
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: '-0.025em',
                    lineHeight: 1.1,
                    fontWeight: 700,
                  }}
                  className="text-2xl sm:text-[28px] font-bold text-ink font-primary"
                >
                  Creation <br />
                  <span className="text-primary font-bold">Pipeline</span>
                </h3>
              </div>

              {/* Bottom Architecture Progress Label */}
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-neutral-400 block mb-1">
                  Architecture
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-ink font-primary">
                    Phase {String(activePhaseIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[12px] font-mono text-neutral-400">/ 06</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] font-medium text-neutral-400">
                  <span>Scroll to explore</span>
                  <span className="text-[13px]">→</span>
                </div>
              </div>
            </div>

            {/* Alternating Phases Rail & Columns Container */}
            <div className="relative flex items-center shrink-0 h-[420px] sm:h-[450px]">
              {/* Central Horizontal Timeline Track Rail (Only between First Node and Last Node, stops before Launch Card) */}
              <div className="absolute left-[140px] right-[140px] top-1/2 -translate-y-1/2 h-[2px] bg-neutral-200/90 rounded-full pointer-events-none z-10">
                {/* Active Primary Blue Fill Line */}
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, (pipelineT / 0.88) * 100))}%`,
                  }}
                  className="h-full bg-primary rounded-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(0,102,204,0.5)]"
                />
              </div>

              {/* 6 Sequentially Alternating Phase Columns */}
              <div className="flex items-center gap-6 sm:gap-7 shrink-0 h-full relative z-20">
                {PIPELINE_PHASES.map((item, idx) => {
                  const isUp = item.side === 'up'
                  // Threshold for when this phase is reached
                  const threshold = (idx / (PIPELINE_PHASES.length - 1)) * 0.85
                  const isActive = pipelineT >= threshold
                  const isCurrent = activePhaseIndex === idx

                  return (
                    <div
                      key={item.step}
                      onClick={() => handlePhaseClick(idx)}
                      className="w-[280px] sm:w-[295px] h-full flex flex-col justify-between shrink-0 relative cursor-pointer group"
                    >
                      {/* TOP HALF SLOT */}
                      <div className="h-[185px] sm:h-[195px] flex flex-col justify-end relative">
                        {isUp && (
                          <>
                            {/* Card Content (Phase 01, 03, 05) */}
                            <div
                              className={`rounded-2xl p-4 sm:p-4.5 border transition-all duration-300 backdrop-blur-md ${
                                isCurrent
                                  ? 'bg-white border-primary/50 shadow-[0_10px_32px_rgba(0,102,204,0.12)] scale-[1.02] ring-1 ring-primary/20'
                                  : isActive
                                  ? 'bg-white/95 border-neutral-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] group-hover:border-primary/40'
                                  : 'bg-white/90 border-neutral-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] opacity-85 group-hover:opacity-100 group-hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide uppercase transition-colors duration-200 ${
                                    isActive
                                      ? 'bg-primary text-white shadow-xs'
                                      : 'bg-primary/[0.08] text-primary'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-primary'}`} />
                                  Phase {item.step}
                                </span>
                                <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
                                  {item.phase}
                                </span>
                              </div>

                              <h4 className="text-[15px] sm:text-[15.5px] font-bold text-ink leading-tight font-primary tracking-tight group-hover:text-primary transition-colors">
                                {item.title}
                              </h4>

                              <p className="text-[12px] sm:text-[12.5px] text-neutral-600 mt-1 leading-[1.45] font-sans">
                                {item.content}
                              </p>

                              <div className="flex flex-wrap gap-1.5 mt-2.5 pt-1 border-t border-neutral-100">
                                {item.tags.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={`text-[9.5px] font-medium px-2 py-0.5 rounded transition-colors ${
                                      isActive
                                        ? 'bg-primary/[0.06] text-primary/90 border border-primary/15'
                                        : 'bg-neutral-100 text-neutral-600'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Connecting Stem from Card down to Rail Node */}
                            <div className="w-[2px] h-5 sm:h-6 bg-neutral-200/90 mx-auto pointer-events-none mt-1">
                              <div
                                style={{ height: isActive ? '100%' : '0%' }}
                                className="w-full bg-primary transition-all duration-200"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* CENTER RAIL NODE */}
                      <div className="relative flex items-center justify-center h-6 z-30 pointer-events-none">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 bg-white transition-all duration-300 flex items-center justify-center ${
                            isActive
                              ? 'border-primary bg-primary scale-125 ring-4 ring-primary/20 shadow-[0_0_12px_rgba(0,102,204,0.6)]'
                              : 'border-neutral-300 group-hover:border-neutral-400'
                          }`}
                        >
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      {/* BOTTOM HALF SLOT */}
                      <div className="h-[185px] sm:h-[195px] flex flex-col justify-start relative">
                        {!isUp && (
                          <>
                            {/* Connecting Stem from Rail Node down to Card */}
                            <div className="w-[2px] h-5 sm:h-6 bg-neutral-200/90 mx-auto pointer-events-none mb-1">
                              <div
                                style={{ height: isActive ? '100%' : '0%' }}
                                className="w-full bg-primary transition-all duration-200"
                              />
                            </div>

                            {/* Card Content (Phase 02, 04, 06) */}
                            <div
                              className={`rounded-2xl p-4 sm:p-4.5 border transition-all duration-300 backdrop-blur-md ${
                                isCurrent
                                  ? 'bg-white border-primary/50 shadow-[0_10px_32px_rgba(0,102,204,0.12)] scale-[1.02] ring-1 ring-primary/20'
                                  : isActive
                                  ? 'bg-white/95 border-neutral-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] group-hover:border-primary/40'
                                  : 'bg-white/90 border-neutral-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] opacity-85 group-hover:opacity-100 group-hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold tracking-wide uppercase transition-colors duration-200 ${
                                    isActive
                                      ? 'bg-primary text-white shadow-xs'
                                      : 'bg-primary/[0.08] text-primary'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-primary'}`} />
                                  Phase {item.step}
                                </span>
                                <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider">
                                  {item.phase}
                                </span>
                              </div>

                              <h4 className="text-[15px] sm:text-[15.5px] font-bold text-ink leading-tight font-primary tracking-tight group-hover:text-primary transition-colors">
                                {item.title}
                              </h4>

                              <p className="text-[12px] sm:text-[12.5px] text-neutral-600 mt-1 leading-[1.45] font-sans">
                                {item.content}
                              </p>

                              <div className="flex flex-wrap gap-1.5 mt-2.5 pt-1 border-t border-neutral-100">
                                {item.tags.map((tag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className={`text-[9.5px] font-medium px-2 py-0.5 rounded transition-colors ${
                                      isActive
                                        ? 'bg-primary/[0.06] text-primary/90 border border-primary/15'
                                        : 'bg-neutral-100 text-neutral-600'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* End of Pipeline: Ready to Create Launch Card (Completely free of any line cutting through) */}
              <div className="w-[270px] sm:w-[290px] h-[340px] flex flex-col justify-center items-center text-center p-6 rounded-3xl bg-gradient-to-br from-white via-white/95 to-primary/[0.04] border border-primary/20 shadow-[0_10px_32px_rgba(0,102,204,0.08)] shrink-0 ml-10 relative z-20">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3.5 shadow-xs">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>

                <h4 className="text-[18px] font-bold text-ink font-primary tracking-tight">
                  Ready to create?
                </h4>

                <p className="text-[12.5px] text-neutral-500 font-sans mt-1.5 leading-relaxed">
                  Turn your imagination into photorealistic master assets in seconds.
                </p>

                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="mt-5 inline-flex items-center justify-center gap-2 w-full py-3 rounded-full bg-primary hover:bg-primary-focus text-white font-semibold text-[13.5px] shadow-[0_4px_16px_rgba(0,102,204,0.25)] hover:shadow-[0_6px_22px_rgba(0,102,204,0.35)] active:scale-[0.98] transition-all duration-200 cursor-pointer font-primary pointer-events-auto"
                >
                  Generate images
                  <ArrowRight className="w-4 h-4" />
                </button>

                <span className="text-[11px] font-sans text-neutral-400 mt-2 font-medium">
                  Free credits included · No credit card
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default VideoHero
