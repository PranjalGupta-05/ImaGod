import React, { useState, useEffect, useMemo, useRef, useContext } from 'react'
import { motion, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import SoftGradientBackground from './SoftGradientBackground'
import { assets } from '../assets/assets'

import sam_img_1 from '../assets/sam_img_1.png'
import sam_img_2 from '../assets/sam_img_2.png'
import sam_img_3 from '../assets/sam_img_3.png'
import sam_img_4 from '../assets/sam_img_4.png'
import sam_img_5 from '../assets/sam_img_5.png'
import sam_img_6 from '../assets/sam_img_6.png'
import sample_img_1 from '../assets/sample_img_1.png'
import sample_img_2 from '../assets/sample_img_2.png'
import resultpage_img from '../assets/resultpage_img.png'

const CARD_DATA = [
  { src: sam_img_1, title: 'Cyberpunk Wanderer', prompt: 'Cinematic portrait of a cyberpunk wanderer in neon rain' },
  { src: sam_img_2, title: 'Nordic Concrete Villa', prompt: 'Minimalist brutalist concrete villa suspended over calm Nordic sea' },
  { src: sam_img_3, title: 'Forest Starlight Spirit', prompt: 'Ethereal forest spirit woven from starlight and autumn mist' },
  { src: sam_img_4, title: 'Solar Hovercraft', prompt: 'Aerodynamic solar hovercraft skimming over crimson desert dunes' },
  { src: sam_img_5, title: 'Galaxy Dewdrop', prompt: 'Hyperdetailed macro dewdrop refracting galaxy on obsidian petals' },
  { src: sam_img_6, title: 'Tinted Glass Architecture', prompt: 'Architectural ribbons of translucent tinted glass catching sunrise' },
  { src: sample_img_1, title: 'Botanical Portrait', prompt: 'Editorial studio portrait surrounded by blooming nocturnal flora' },
  { src: sample_img_2, title: 'Futuristic Metropol', prompt: 'Luminescent skyscraper spires emerging from silver morning cloud' },
  { src: resultpage_img, title: 'Neural Realism', prompt: 'Photorealistic character render with natural diffuse studio lighting' },
  { src: 'https://cdn.21st.dev/assets/mirror/4d/4d1bff4ea8b9f400dff7ae405f92e15bd39ec76e9285c7d96017e64ba1de3ae1.jpg', title: 'Solar Flare', prompt: 'Abstract chromatic refraction through prisms in deep space' },
  { src: 'https://cdn.21st.dev/assets/mirror/ee/ee36e332fe99d7611c43b90511db08a4f84e4545caa78e7b52e9ccffe273864b.jpg', title: 'Monochrome Wave', prompt: 'High contrast black and white oceanic wave frozen in mid crest' },
  { src: 'https://cdn.21st.dev/assets/mirror/dd/dddeaa4e6132c65bf7ff99d197f792a30937b5cbfe97a2b1ee54a793684df52e.jpg', title: 'Glass Sculpting', prompt: 'Curved blown glass sculpture with liquid interior reflections' },
  { src: 'https://cdn.21st.dev/assets/mirror/48/487977107b5011b5e1c25289f6e4393ef555e1a92daee554788e9363b233ca14.jpg', title: 'Desert Solitude', prompt: 'Warm minimalist desert landscape with lone modern monolith' },
  { src: 'https://cdn.21st.dev/assets/mirror/a1/a12509688be6c9d3b2cb26d2ea1cfce48b8a8dbf2653e17be8a3fc31bd69f162.jpg', title: 'Ethereal Mist', prompt: 'Alpine mountain peak bathed in golden dawn rays piercing fog' },
  { src: 'https://cdn.21st.dev/assets/mirror/05/051f9e565b5b0b221384d9c27a0760febc3fb48d190c046adfda579f3614c958.jpg', title: 'Neon Horizon', prompt: 'Vibrant horizon line blending ultraviolet and cyan hues' },
  { src: 'https://cdn.21st.dev/assets/mirror/87/87d4f60a4465d19d14b8acefa46275df4ccd767ccea6d7f234ea5bad99cfec56.jpg', title: 'Architectural Shadow', prompt: 'Brutalist staircase cast in dramatic diagonal midday shadows' },
  { src: 'https://cdn.21st.dev/assets/mirror/06/0610989e0675a12c02d35aa5464e2644bf77913214b748b73a894808d2d79877.jpg', title: 'Prismatic Dispersion', prompt: 'Light breaking into rainbow dispersion across crystal facets' },
  { src: 'https://cdn.21st.dev/assets/mirror/fe/fe90b90751e671a9526134c4743e2fcbf6c1a24991aba273ad7418c88fc9c701.jpg', title: 'Autumn Geometry', prompt: 'Golden aspen grove with geometric golden leaves floating in wind' },
  { src: 'https://cdn.21st.dev/assets/mirror/2e/2e0452c1994fcc2130a1b8ef68e34b5ea52d1b35b80dde09b99349ad1de54598.jpg', title: 'Obsidian Sphere', prompt: 'Mirror-polished obsidian sphere levitating above still reflecting pool' },
  { src: 'https://cdn.21st.dev/assets/mirror/84/847dc523558808119dc4bbb5218ff862ae5f5b455f33e9a0304f2f5a4b2f0f2c.jpg', title: 'Sapphire Horizon', prompt: 'Deep sapphire evening gradient over quiet Scandinavian fjord' },
]

const TOTAL_IMAGES = 20
const MAX_SCROLL = 3000
const IMG_WIDTH = 88
const IMG_HEIGHT = 124

const lerp = (start, end, t) => start * (1 - t) + end * t

// 3D Flip Card Component
function FlipCard({ src, index, target, title, prompt, onSelect }) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: 'spring',
        stiffness: 40,
        damping: 15,
      }}
      style={{
        position: 'absolute',
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className='cursor-pointer group select-none'
      onClick={() => onSelect(prompt)}
    >
      <motion.div
        className='relative h-full w-full'
        style={{ transformStyle: 'preserve-3d' }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className='absolute inset-0 h-full w-full overflow-hidden rounded-[16px] border border-black/[0.04] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] transition-shadow duration-300'
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={src}
            alt={title}
            className='h-full w-full object-cover select-none pointer-events-none'
            loading={index < 8 ? 'eager' : 'lazy'}
          />
          <div className='absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300' />
        </div>

        {/* Back Face */}
        <div
          className='absolute inset-0 h-full w-full overflow-hidden rounded-[16px] bg-[#1d1d1f] text-white flex flex-col items-center justify-between p-3.5 border border-neutral-700/50 shadow-[0_8px_25px_rgba(0,0,0,0.12)] text-center'
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className='w-full'>
            <span className='text-[9px] font-semibold text-blue-400 uppercase tracking-wider block mb-1'>
              ImaGod AI
            </span>
            <p className='text-[11px] font-medium leading-tight text-white line-clamp-3'>
              {title}
            </p>
          </div>
          <span className='text-blue-400 text-[10px] font-semibold block hover:underline'>
            Try &gt;
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ScrollMorphHero() {
  const { user, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const [introPhase, setIntroPhase] = useState('scatter')
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return

    const handleResize = (entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(containerRef.current)

    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    })

    return () => observer.disconnect()
  }, [])

  // Virtual Scroll setup with smart boundary passthrough
  const virtualScroll = useMotionValue(0)
  const scrollRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e) => {
      // If at MAX_SCROLL and user continues scrolling downwards, allow normal page scroll
      if (e.deltaY > 0 && scrollRef.current >= MAX_SCROLL) {
        return
      }
      // If at top and user scrolls upwards, allow normal page scroll
      if (e.deltaY < 0 && scrollRef.current <= 0) {
        return
      }

      e.preventDefault()
      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL)
      scrollRef.current = newScroll
      virtualScroll.set(newScroll)
    }

    let touchStartY = 0
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
    }
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY
      touchStartY = touchY

      if (deltaY > 0 && scrollRef.current >= MAX_SCROLL) return
      if (deltaY < 0 && scrollRef.current <= 0) return

      const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL)
      scrollRef.current = newScroll
      virtualScroll.set(newScroll)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [virtualScroll])

  // Morph Progress: 0 (Circle) -> 1 (Bottom Rainbow Arc) across 0 to 600 scroll units
  const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1])
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 })

  // Scroll Rotation (Shuffling): rotates the arc as user scrolls past 600 up to MAX_SCROLL (3000)
  const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360])
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 })

  // Mouse Parallax
  const mouseX = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const relativeX = e.clientX - rect.left
      const normalizedX = (relativeX / rect.width) * 2 - 1
      mouseX.set(normalizedX * 60)
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX])

  // Auto Intro Sequence: scatter -> line -> circle
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase('line'), 500)
    const timer2 = setTimeout(() => setIntroPhase('circle'), 2500)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  // Random Scatter Positions
  const scatterPositions = useMemo(() => {
    return CARD_DATA.map(() => ({
      x: (Math.random() - 0.5) * 1400,
      y: (Math.random() - 0.5) * 900,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }))
  }, [])

  // State bindings for spring outputs
  const [morphValue, setMorphValue] = useState(0)
  const [rotateValue, setRotateValue] = useState(0)
  const [parallaxValue, setParallaxValue] = useState(0)

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on('change', setMorphValue)
    const unsubscribeRotate = smoothScrollRotate.on('change', setRotateValue)
    const unsubscribeParallax = smoothMouseX.on('change', setParallaxValue)
    return () => {
      unsubscribeMorph()
      unsubscribeRotate()
      unsubscribeParallax()
    }
  }, [smoothMorph, smoothScrollRotate, smoothMouseX])

  // Content fades in when arc morph starts
  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1])
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0])

  const onGenerateClick = () => {
    if (user) {
      navigate('/result')
    } else {
      setShowLogin(true)
    }
  }

  const onCardSelect = (prompt) => {
    navigate('/result', { state: { initialPrompt: prompt } })
  }

  return (
    <section
      ref={containerRef}
      className='relative w-full h-[900px] sm:h-[980px] lg:h-[1020px] pt-16 sm:pt-20 bg-canvas border-b border-hairline overflow-hidden select-none'
    >
      {/* Soft Gradient Background Animation */}
      <div className='absolute inset-0 z-0 pointer-events-none'>
        <SoftGradientBackground />
      </div>

      <div className='flex h-full w-full flex-col items-center justify-center relative z-10'>
        {/* Subtle Radial Glow for Depth */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] bg-white/60 blur-[90px] rounded-full pointer-events-none z-0' />

        {/* Intro Text (visible during circle phase before scroll morph) */}
        <div className='absolute z-10 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              introPhase === 'circle' && morphValue < 0.4
                ? { opacity: 1 - morphValue * 2.5, scale: 1 }
                : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.8 }}
            className='flex flex-col items-center'
          >
            {/* Eyebrow - WITHOUT ANY CAPSULE */}
            <div className='text-stone-500 inline-flex items-center justify-center gap-2 select-none mb-3'>
              <p className='text-sm sm:text-base font-medium tracking-wide'>Best Text To Image Generator</p>
              <img src={assets.star_icon} alt="" className='w-4 h-4 sm:w-5 sm:h-5'/>
            </div>

            {/* Main Headline */}
            <h1 className='text-3xl max-w-[280px] sm:text-6xl sm:max-w-[560px] mx-auto text-center font-medium leading-[1.15] tracking-tight'>
              Turn <span className='text-gray-500'>TEXT</span> To <span className='text-blue-500'>IMAGE</span> In Seconds
            </h1>

            {/* Subheading */}
            <p className='text-center max-w-md mx-auto mt-4 text-neutral-600 text-sm sm:text-[15px] leading-relaxed'>
              Unleash your creativity with AI. Turn your imagination into visual art in seconds – just type and watch the magic happens.
            </p>
          </motion.div>
        </div>

        {/* Morph Arc Active Content (Fades in when arc forms) */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className='absolute top-[5%] sm:top-[7%] z-20 flex flex-col items-center justify-center text-center pointer-events-auto px-4 max-w-[840px]'
        >
          {/* Eyebrow - WITHOUT ANY CAPSULE */}
          <div className='text-stone-500 inline-flex items-center justify-center gap-2 select-none mb-3'>
            <p className='text-sm sm:text-base font-medium tracking-wide'>Best Text To Image Generator</p>
            <img src={assets.star_icon} alt="" className='w-4 h-4 sm:w-5 sm:h-5'/>
          </div>

          <h2 className='text-3xl max-w-[280px] sm:text-5xl sm:max-w-[540px] mx-auto text-center font-medium leading-tight'>
            Turn <span className='text-gray-500'>TEXT</span> To <span className='text-blue-500'>IMAGE</span> In Seconds
          </h2>

          <p className='text-center max-w-lg mx-auto mt-3 text-neutral-600 text-sm sm:text-[15px] leading-relaxed'>
            Unleash your creativity with AI. Turn your imagination into visual art in seconds – just type and watch the magic happens.
          </p>

          <div className='flex items-center justify-center gap-3 mt-6'>
            <button onClick={onGenerateClick} className='sm:text-lg text-white bg-black w-auto px-10 py-2.5 flex items-center gap-2 rounded-full hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg'>
              Generate Images
              <img className='h-6' src={assets.star_group} alt="" />
            </button>
          </div>
        </motion.div>

        {/* Morphing Cards Canvas */}
        <div className='relative flex items-center justify-center w-full h-full'>
          {CARD_DATA.slice(0, TOTAL_IMAGES).map((item, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 }

            if (introPhase === 'scatter') {
              target = scatterPositions[i] || { x: 0, y: 0, rotation: 0, scale: 0.6, opacity: 0 }
            } else if (introPhase === 'line') {
              const lineSpacing = 100
              const lineTotalWidth = TOTAL_IMAGES * lineSpacing
              const lineX = i * lineSpacing - lineTotalWidth / 2
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 }
            } else {
              // Circle & Arc Morph Math
              const isMobile = containerSize.width < 768
              const minDimension = Math.min(containerSize.width || 1000, containerSize.height || 980)

              // 1. Circle Position (spacious circle radius matching reference)
              const circleRadius = isMobile
                ? Math.min(minDimension * 0.36, 270)
                : Math.min(minDimension * 0.42, 400)
              const circleScale = isMobile ? 0.75 : 1

              const circleAngle = (i / TOTAL_IMAGES) * 360
              const circleRad = (circleAngle * Math.PI) / 180
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
                scale: circleScale,
              }

              // 2. Rainbow Arc Position
              const baseRadius = Math.min(containerSize.width || 1000, (containerSize.height || 850) * 1.5)
              const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1)
              const arcApexY = (containerSize.height || 850) * (isMobile ? 0.38 : 0.34)
              const arcCenterY = arcApexY + arcRadius

              const spreadAngle = isMobile ? 95 : 125
              const startAngle = -90 - spreadAngle / 2
              const step = spreadAngle / (TOTAL_IMAGES - 1)

              const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1)
              const maxRotation = spreadAngle * 0.8
              const boundedRotation = -scrollProgress * maxRotation

              const currentArcAngle = startAngle + i * step + boundedRotation
              const arcRad = (currentArcAngle * Math.PI) / 180

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.15 : 1.35,
              }

              // 3. Interpolation between Circle and Arc
              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(circlePos.scale, arcPos.scale, morphValue),
                opacity: 1,
              }
            }

            return (
              <FlipCard
                key={i}
                src={item.src}
                index={i}
                target={target}
                title={item.title}
                prompt={item.prompt}
                onSelect={onCardSelect}
              />
            )
          })}
        </div>


      </div>
    </section>
  )
}
