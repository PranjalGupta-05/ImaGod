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

import GrainOverlay from '../components/ui/GrainOverlay'
import ThemeOrb from '../components/ui/ThemeOrb'
import Button from '../components/ui/Button'
import { Card, CardInner, PageHeader } from '../components/ui/Card'

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
          className='w-full'
        >
          <PageHeader
            title="Restore clarity. Upscale every detail."
            subtitle="Upload any compressed, blurry, or low-resolution photo. Our neural engine synthesizes missing high-frequency details."
          />
        </motion.div>

        {/* ── Upload Zone: Signature Double-Card Container ── */}
        {!originalImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className='w-full max-w-[560px]'
          >
            <Card>
              <CardInner
                dashed
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`cursor-pointer flex flex-col items-center justify-center gap-3 ${
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
                  <ThemeOrb theme='gold' icon={Sparkles} />
                </div>

                {/* Text Block */}
                <div className='relative z-10 text-center'>
                  <h3 className='text-[18px] font-bold text-ink tracking-tight font-primary'>
                    {dragOver ? 'Drop image right here' : 'Choose an image to enhance & upscale'}
                  </h3>
                  <p className='text-xs text-ink-muted mt-0.5 font-sans'>
                    Drag & drop your photo here, or{' '}
                    <span className='text-amber-700 font-semibold underline underline-offset-2'>
                      browse computer
                    </span>
                  </p>
                  <p className='text-[11px] text-ink-subtle mt-0.5 font-sans'>
                    Supports PNG, JPG, WEBP up to 25MB
                  </p>
                </div>

                {/* Action button inside dropzone */}
                <div className='relative z-10'>
                  <Button
                    variant='secondary'
                    size='sm'
                    icon={Upload}
                    className='text-amber-800 border-amber-300/80 hover:bg-amber-50'
                  >
                    Select Image File
                  </Button>
                </div>
              </CardInner>
            </Card>
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
              <Card className='w-full'>
                <CardInner
                  className='p-3 border-amber-200 flex flex-col items-center justify-center'
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
                          <p className='text-ink font-bold text-[15px] font-primary'>
                            Enhancing details…
                          </p>
                          <p className='text-xs text-ink-muted mt-0.5 font-sans'>
                            Synthesizing high-frequency textures & 4K upscaling
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardInner>
              </Card>

              {/* Actions */}
              <div className='flex flex-wrap gap-2.5 justify-center'>
                <Button
                  variant='gold'
                  size='md'
                  disabled={loading}
                  loading={loading}
                  iconRight={!loading ? ArrowRight : undefined}
                  onClick={onSubmit}
                >
                  Enhance Image
                </Button>
                <Button
                  variant='secondary'
                  size='md'
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                  className='text-amber-800 border-amber-300 hover:bg-amber-50'
                >
                  Change Image
                </Button>
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
              <Card className='w-full'>
                <CardInner
                  className='p-3 border-amber-200'
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
                    <span className='absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md border border-amber-200 text-amber-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs font-primary'>
                      Original
                    </span>
                    <span className='absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md border border-amber-200 text-amber-900 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs font-primary'>
                      Enhanced (4K)
                    </span>
                  </div>

                  <p className='text-xs text-ink-muted text-center mt-2 font-medium font-sans'>
                    Drag the divider across to compare fine sharpness, textures, and details
                  </p>
                </CardInner>
              </Card>

              {/* Actions */}
              <div className='flex flex-wrap gap-2.5 justify-center'>
                <a
                  href={resultImage}
                  download='enhanced-image.png'
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex items-center justify-center font-primary font-semibold select-none cursor-pointer transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 px-7 py-2.5 rounded-full text-sm bg-neutral-900 hover:bg-black text-white shadow-xs gap-2'
                >
                  <Download className='w-3.5 h-3.5' />
                  <span>Download 4K Image</span>
                </a>
                <Button
                  variant='secondary'
                  size='md'
                  icon={RotateCcw}
                  onClick={reset}
                  className='text-amber-800 border-amber-300 hover:bg-amber-50'
                >
                  Try Another Photo
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Enhance
