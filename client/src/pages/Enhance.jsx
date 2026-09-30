import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Upload,
  ArrowRight,
  Download,
  RotateCcw,
  Zap,
} from 'lucide-react'

// Grain texture overlay matching BuyCredit.jsx & Usage.jsx
const GrainOverlay = () => (
  <div
    className='absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]'
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

// Gold Theme Orb matching BuyCredit.jsx AvatarOrb style
const ThemeOrb = ({ icon: Icon }) => (
  <div
    className='relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 shadow-[0_8px_18px_-2px_rgba(234,179,8,0.40)]'
    style={{
      background: 'radial-gradient(circle at 35% 30%, #fde047 0%, #eab308 55%, #b45309 100%)',
    }}
  >
    <div className='absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none' />
    <Icon className='w-5 h-5 text-white z-10 stroke-[2]' />
  </div>
)

const Enhance = () => {
  const { enhanceImage, credit, user, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const [dragOver, setDragOver] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)

  const fileInputRef = useRef(null)
  const sliderContainerRef = useRef(null)

  // ─── File handling ───────────────────────────────────────────────────────────
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

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async () => {
    if (!user) {
      setShowLogin(true)
      return
    }
    if (!originalFile) return
    setLoading(true)
    const url = await enhanceImage(originalFile)
    if (url) setResultImage(url)
    setLoading(false)
  }

  // ─── Before/After slider ─────────────────────────────────────────────────────
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

  // ─── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setOriginalImage(null)
    setOriginalFile(null)
    setResultImage(null)
    setSliderPos(50)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div
      className='w-full min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#fafafc] pt-20 sm:pt-22 pb-4 select-none flex flex-col items-center justify-center'
      onMouseMove={onSliderMouseMove}
      onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove}
      onTouchEnd={onSliderMouseUp}
    >
      <div className='max-w-[840px] mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center'>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='mb-3 text-center flex flex-col items-center'
        >
          <h1 className='text-2xl sm:text-3xl lg:text-[34px] font-bold text-ink tracking-tight leading-tight'>
            Restore clarity. Upscale every detail.
          </h1>
          <p className='text-sm sm:text-base text-[#6e6e73] mt-1 max-w-[520px] mx-auto'>
            Upload any compressed, blurry, or low-resolution photo. Our neural engine synthesizes missing high-frequency details.
          </p>
        </motion.div>

        {/* ── Upload Zone: Signature Double-Card Container ── */}
        {!originalImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className='w-full max-w-[560px]'
          >
            <div className='bg-white rounded-[24px] border border-[#e5e5e7] p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.07)] transition-all duration-300'>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`rounded-[18px] p-6 sm:p-7 relative overflow-hidden border border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? 'border-amber-500 bg-amber-100/60 ring-4 ring-amber-500/10'
                    : 'border-amber-300/80 hover:border-amber-400 hover:bg-amber-50/40'
                }`}
                style={{
                  background: dragOver
                    ? undefined
                    : 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 45%, #ffffff 100%)',
                }}
              >
                <GrainOverlay />

                {/* Orb */}
                <div className='relative z-10'>
                  <ThemeOrb icon={Sparkles} />
                </div>

                {/* Text Block */}
                <div className='relative z-10 text-center'>
                  <h3 className='text-[18px] font-bold text-ink tracking-tight'>
                    {dragOver ? 'Drop image right here' : 'Choose an image to enhance & upscale'}
                  </h3>
                  <p className='text-[12px] text-[#6b7280] mt-0.5'>
                    Drag & drop your photo here, or{' '}
                    <span className='text-amber-700 font-semibold underline underline-offset-2'>
                      browse computer
                    </span>
                  </p>
                  <p className='text-[11px] text-[#9ca3af] mt-0.5'>
                    Supports PNG, JPG, WEBP up to 25MB
                  </p>
                </div>

                {/* Action button inside dropzone */}
                <div className='relative z-10'>
                  <span className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs text-[12px] font-semibold transition-all'>
                    <Upload className='w-3.5 h-3.5' />
                    Select Image File
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={onFileChange}
        />

        {/* ── Preview & Processing Card ── */}
        <AnimatePresence>
          {originalImage && !resultImage && (
            <motion.div
              key='preview'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className='w-full max-w-[540px] flex flex-col items-center gap-3.5'
            >
              <div className='w-full bg-white rounded-[24px] border border-[#e5e5e7] p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'>
                <div
                  className='rounded-[18px] p-3 relative overflow-hidden border border-amber-200 flex flex-col items-center justify-center'
                  style={{
                    background: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 45%, #ffffff 100%)',
                  }}
                >
                  <GrainOverlay />

                  <div className='relative z-10 w-full rounded-[14px] overflow-hidden bg-white/70 border border-amber-100 aspect-square max-h-[38vh] flex items-center justify-center shadow-xs'>
                    <img
                      src={originalImage}
                      alt='Preview'
                      className='w-full h-full object-contain'
                    />

                    {loading && (
                      <div className='absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20'>
                        <div className='w-9 h-9 border-3 border-amber-600 border-t-transparent rounded-full animate-spin' />
                        <div className='text-center'>
                          <p className='text-ink font-bold text-[15px]'>
                            Enhancing details…
                          </p>
                          <p className='text-[12px] text-[#6b7280] mt-0.5'>
                            Synthesizing high-frequency textures & 4K upscaling
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex flex-wrap gap-2.5 justify-center'>
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className='px-7 py-2.5 rounded-full font-semibold text-[14px] bg-[#1d1d1f] hover:bg-black text-white shadow-[0_2px_10px_rgba(0,0,0,0.16)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer'
                >
                  {loading ? (
                    <>
                      <span className='inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin' />
                      <span>Upscaling…</span>
                    </>
                  ) : (
                    <>
                      <span>Enhance Image</span>
                      <ArrowRight className='w-3.5 h-3.5' />
                    </>
                  )}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className='px-5 py-2.5 rounded-full text-[13px] font-semibold bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs transition-all active:scale-95 cursor-pointer'
                >
                  Change Image
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Result Comparison Slider ── */}
          {resultImage && (
            <motion.div
              key='result'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='w-full max-w-[580px] flex flex-col items-center gap-3.5'
            >
              <div className='w-full bg-white rounded-[24px] border border-[#e5e5e7] p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'>
                <div
                  className='rounded-[18px] p-3 relative overflow-hidden border border-amber-200'
                  style={{
                    background: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 45%, #ffffff 100%)',
                  }}
                >
                  <GrainOverlay />

                  {/* Slider Frame */}
                  <div
                    ref={sliderContainerRef}
                    className='relative w-full rounded-[14px] overflow-hidden select-none cursor-col-resize border border-amber-200 bg-white shadow-2xs max-h-[38vh]'
                    style={{ aspectRatio: '4/3' }}
                    onMouseDown={onSliderMouseDown}
                    onTouchStart={onSliderMouseDown}
                  >
                    {/* Before Image */}
                    <img
                      src={originalImage}
                      alt='Original Before'
                      className='absolute inset-0 w-full h-full object-contain'
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                      draggable={false}
                    />

                    {/* After Image */}
                    <img
                      src={resultImage}
                      alt='Enhanced After'
                      className='absolute inset-0 w-full h-full object-contain'
                      style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                      draggable={false}
                    />

                    {/* Slider divider line */}
                    <div
                      className='absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-md'
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-amber-300 flex items-center justify-center pointer-events-none shadow-md'>
                        <Sparkles className='w-3.5 h-3.5 text-amber-700' />
                      </div>
                    </div>

                    {/* Pill labels */}
                    <span className='absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md border border-amber-200 text-amber-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs'>
                      Original
                    </span>
                    <span className='absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md border border-amber-200 text-amber-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs'>
                      Enhanced (4K)
                    </span>
                  </div>

                  <p className='text-[12px] text-[#6b7280] text-center mt-2 font-medium'>
                    Drag the divider across to compare fine sharpness, textures, and details
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className='flex flex-wrap gap-2.5 justify-center'>
                <a
                  href={resultImage}
                  download='enhanced-image.png'
                  target='_blank'
                  rel='noreferrer'
                  className='px-7 py-2.5 rounded-full font-semibold text-[14px] bg-[#1d1d1f] hover:bg-black text-white shadow-[0_2px_10px_rgba(0,0,0,0.16)] transition-all flex items-center gap-2 active:scale-95 cursor-pointer'
                >
                  <Download className='w-3.5 h-3.5' />
                  <span>Download 4K Image</span>
                </a>
                <button
                  onClick={reset}
                  className='px-5 py-2.5 rounded-full text-[13px] font-semibold bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer'
                >
                  <RotateCcw className='w-3.5 h-3.5' />
                  <span>Try Another Photo</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Enhance
