import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Focus, Sparkles, Upload, Download, RotateCcw, RefreshCw, Zap, Sliders } from 'lucide-react'

// Grain texture overlay matching existing theme
const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
    }}
  />
)

// Sapphire / Cyan Theme Orb
const ThemeOrb = ({ icon: Icon }) => (
  <div
    className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 shadow-[0_8px_18px_-2px_rgba(2,132,199,0.45)]"
    style={{
      background: 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 55%, #0369a1 100%)',
    }}
  >
    <div className="absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none" />
    <Icon className="w-5 h-5 text-white z-10 stroke-[2]" />
  </div>
)

const UNBLUR_MODES = [
  {
    id: 'standard',
    name: 'Balanced Focus',
    badge: 'Recommended',
    desc: 'Fixes general blur, lens softness & soft edges',
  },
  {
    id: 'motion',
    name: 'Motion Deblur',
    badge: 'Aggressive',
    desc: 'Recovers camera shake & fast-moving subject blur',
  },
  {
    id: 'face',
    name: 'Portrait & Face',
    badge: 'Detail Boost',
    desc: 'Enhances eyes, skin micro-texture & expressions',
  },
]

const Unblur = () => {
  const { unblurImage, credit, user, setShowLogin } = useContext(AppContext)

  const [dragOver, setDragOver] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState('standard')
  const [sliderPos, setSliderPos] = useState(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)

  const fileInputRef = useRef(null)
  const sliderContainerRef = useRef(null)

  // ─── File Handling ──────────────────────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    setOriginalImage(URL.createObjectURL(file))
    setOriginalFile(file)
    setResultImage(null)
    setSliderPos(50)
  }, [])

  const onFileChange = (e) => handleFile(e.target.files[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  // ─── Execute Unblur ────────────────────────────────────────────────────────
  const onSubmit = async () => {
    if (!user) {
      setShowLogin(true)
      return
    }
    if (!originalFile) return
    setLoading(true)
    const url = await unblurImage(originalFile, selectedMode)
    if (url) {
      setResultImage(url)
      setSliderPos(50)
    }
    setLoading(false)
  }

  // ─── Before / After Slider ─────────────────────────────────────────────────
  const onSliderMouseDown = (e) => {
    e.preventDefault()
    setIsDraggingSlider(true)
  }

  const onSliderMouseMove = useCallback(
    (e) => {
      if (!isDraggingSlider || !sliderContainerRef.current) return
      const rect = sliderContainerRef.current.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const pos = ((clientX - rect.left) / rect.width) * 100
      setSliderPos(Math.max(0, Math.min(100, pos)))
    },
    [isDraggingSlider]
  )

  const onSliderMouseUp = () => setIsDraggingSlider(false)

  // ─── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setOriginalImage(null)
    setOriginalFile(null)
    setResultImage(null)
    setSliderPos(50)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div
      className="w-full min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#fafafc] pt-20 sm:pt-22 pb-4 select-none flex flex-col items-center justify-center"
      onMouseMove={onSliderMouseMove}
      onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove}
      onTouchEnd={onSliderMouseUp}
    >
      <div className="max-w-[880px] mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-3 text-center flex flex-col items-center"
        >
          <div className="flex items-center gap-3 mb-2">
            <ThemeOrb icon={Focus} />
            <div className="text-left">
              <span className="block text-[11px] font-bold tracking-widest uppercase text-[#86868b] mb-0.5">
                Cloudinary AI Restoration
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#1d1d1f] tracking-tight leading-tight">
                AI Unblur & Sharpener
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#6e6e73] max-w-[560px] mx-auto leading-relaxed">
            Eliminate camera shake, out-of-focus blur, and motion smudges with neural edge reconstruction.
          </p>
          <p className="mt-1.5 text-xs text-[#86868b] flex items-center gap-1.5">
            Costs <span className="font-semibold text-[#1d1d1f]">1 credit</span> per unblur
            <span>•</span>
            Available Credits:
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-semibold text-[11px]">
              <Zap className="w-3 h-3 fill-sky-500 text-sky-500" />
              {credit ?? 0}
            </span>
          </p>
        </motion.div>

        {/* ── Upload Zone: Signature Double-Card Container ── */}
        {!originalImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[580px]"
          >
            <div className="bg-white rounded-[24px] border border-[#e5e5e7] p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] transition-all duration-300">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`relative rounded-[20px] border-2 border-dashed p-7 sm:p-9 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[290px] overflow-hidden ${
                  dragOver
                    ? 'border-sky-500 bg-sky-50/50 shadow-[0_0_24px_rgba(2,132,199,0.12)]'
                    : 'border-[#d2d2d7] bg-[#fafafc] hover:border-sky-400 hover:bg-white'
                }`}
              >
                <GrainOverlay />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-white border border-[#e5e5e7] shadow-sm flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform duration-200">
                  <Upload className="w-6 h-6 text-sky-600" />
                </div>

                <p className="text-sm sm:text-base font-semibold text-[#1d1d1f]">
                  Drop your blurry photo here, or <span className="text-sky-600 underline">browse</span>
                </p>
                <p className="text-xs text-[#86868b] mt-1.5">
                  Supports JPG, PNG, WEBP • Up to 25MB
                </p>

                {/* Feature Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-[#e5e5e7]/80 w-full max-w-sm">
                  {['Camera Shake', 'Out of Focus', 'Motion Blur', 'Facial Softness'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white border border-[#e5e5e7] text-[#6e6e73]"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Mode Selection & Workspace Container ── */}
        {originalImage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[800px] flex flex-col items-center"
          >
            {/* Mode Selector Bar */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-3 bg-white p-1.5 rounded-2xl border border-[#e5e5e7] shadow-sm">
              <span className="text-xs font-semibold text-[#86868b] px-2 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-sky-600" /> Deblur Mode:
              </span>
              {UNBLUR_MODES.map((mode) => {
                const isActive = selectedMode === mode.id
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <span>{mode.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#e5e5e7] text-[#6e6e73]'
                      }`}
                    >
                      {mode.badge}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Image Stage / Split Comparison Card */}
            <div className="w-full bg-white rounded-[24px] border border-[#e5e5e7] p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-3">
              <div
                ref={sliderContainerRef}
                className="relative w-full h-[280px] sm:h-[350px] md:h-[400px] rounded-[18px] overflow-hidden bg-[#111113] select-none flex items-center justify-center"
              >
                {/* Mode description pill on stage */}
                <div className="absolute top-3 z-30 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white/90 font-medium border border-white/10 shadow-sm pointer-events-none">
                  Mode: <span className="text-sky-300 font-semibold">{UNBLUR_MODES.find(m => m.id === selectedMode)?.name}</span>
                  <span className="hidden sm:inline text-white/60"> — {UNBLUR_MODES.find(m => m.id === selectedMode)?.desc}</span>
                </div>

                {/* Result Image (Unblurred) - Base Layer */}
                <img
                  src={resultImage || originalImage}
                  alt="Unblurred result"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Original Image (Blurry) - Clipped Top Layer (When comparison active) */}
                {resultImage && (
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={originalImage}
                      alt="Original blurry"
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{
                        width: sliderContainerRef.current?.offsetWidth || '100%',
                        maxWidth: 'none'
                      }}
                    />
                  </div>
                )}

                {/* Slider Handle (Only visible when result exists) */}
                {resultImage && (
                  <div
                    onMouseDown={onSliderMouseDown}
                    onTouchStart={onSliderMouseDown}
                    className="absolute top-0 bottom-0 z-20 cursor-ew-resize flex items-center justify-center group"
                    style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)]" />
                    <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-sky-500 text-sky-700 text-xs font-bold transition-transform group-hover:scale-110 active:scale-95">
                      ⇄
                    </div>
                  </div>
                )}

                {/* Floating Badges */}
                {resultImage && (
                  <>
                    <span className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-white/90 text-[11px] font-medium border border-white/10">
                      Original Blurry
                    </span>
                    <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-sky-600/90 backdrop-blur-sm text-white text-[11px] font-semibold shadow-sm border border-sky-400/30">
                      AI Unblurred ✨
                    </span>
                  </>
                )}

                {/* Loading State Overlay */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6"
                    >
                      <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-sky-500/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-sky-400 border-r-sky-500 border-b-transparent border-l-transparent animate-spin" />
                        <Focus className="w-6 h-6 text-sky-400 animate-pulse" />
                      </div>
                      <p className="text-white font-semibold text-sm sm:text-base">
                        Deconvolving blur matrix & restoring edges...
                      </p>
                      <p className="text-white/60 text-xs mt-1">
                        Synthesizing high-frequency focus via Cloudinary AI
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full">
              {!resultImage ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={onSubmit}
                  className="px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Unblur Image (1 Credit)
                </button>
              ) : (
                <>
                  <a
                    href={resultImage}
                    download="imagify-unblurred.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Download Crisp HD
                  </a>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={onSubmit}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-[#e5e5e7] text-[#1d1d1f] text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4 text-sky-600" />
                    Re-run Mode
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={reset}
                className="px-4 py-2.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-[#e5e5e7] text-[#6e6e73] hover:text-[#1d1d1f] text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Upload Another
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Unblur
