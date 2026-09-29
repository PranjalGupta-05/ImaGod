import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SoftGradientBackground from '../components/SoftGradientBackground'

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

  // File handling
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

  // Submit
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

  // Before/After slider
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

  // Reset
  const reset = () => {
    setOriginalImage(null)
    setOriginalFile(null)
    setResultImage(null)
    setSliderPos(50)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div
      className='relative w-full min-h-[calc(100vh-80px)] overflow-hidden select-none flex flex-col items-center justify-center pt-24 sm:pt-28 pb-16 sm:pb-20'
      onMouseMove={onSliderMouseMove}
      onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove}
      onTouchEnd={onSliderMouseUp}
    >
      {/* ── Soft animated gradient background matching Hero & Studio sections ── */}
      <div className='absolute inset-0 z-0 pointer-events-none'>
        <SoftGradientBackground />
      </div>

      <div className='relative z-10 max-w-[840px] mx-auto px-4 sm:px-6 w-full text-center flex flex-col items-center'>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs mb-4'>
            <span className='font-caption-strong text-ink'>Photo Enhancer</span>
            <span className='text-neutral-400 text-[12px]'>·</span>
            <span className='text-neutral-500 font-caption text-[13px]'>
              {user ? `${credit} Credits Left` : '1 Credit Per Image'}
            </span>
          </div>

          <h1 className='font-display-lg text-ink'>
            Restore clarity. Upscale every detail.
          </h1>
          <p className='font-lead text-[#7a7a7a] mt-2 max-w-[540px] mx-auto text-[19px]'>
            Upload any compressed, blurry, or low-resolution photo. Our neural engine synthesizes missing high-frequency details.
          </p>

          {/* Capabilities Pill Row */}
          <div className='flex flex-wrap justify-center gap-2 mt-4'>
            <span className='font-caption text-neutral-700 bg-white/70 backdrop-blur-md border border-white/60 px-3.5 py-1 rounded-full shadow-xs text-xs font-medium'>
              AI Super-Resolution
            </span>
            <span className='font-caption text-neutral-700 bg-white/70 backdrop-blur-md border border-white/60 px-3.5 py-1 rounded-full shadow-xs text-xs font-medium'>
              Deblur & Denoise
            </span>
            <span className='font-caption text-neutral-700 bg-white/70 backdrop-blur-md border border-white/60 px-3.5 py-1 rounded-full shadow-xs text-xs font-medium'>
              Edge Refinement
            </span>
          </div>
        </motion.div>

        {/* Upload Zone */}
        {!originalImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`w-full max-w-[620px] h-64 sm:h-72 rounded-[22px] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-md ${
              dragOver
                ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white/90'
                : 'border-white/80 hover:border-blue-400/60 hover:bg-white/85'
            }`}
          >
            <div className='w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center border border-white/80 text-blue-600 shadow-sm'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.8} d='M13 10V3L4 14h7v7l9-11h-7z' />
              </svg>
            </div>
            <div>
              <p className='font-body-strong text-neutral-900 text-[17px] font-semibold'>
                {dragOver ? 'Drop photo here' : 'Drag & drop photo to upscale'}
              </p>
              <p className='font-caption text-neutral-500 mt-1 text-sm'>
                or <span className='text-blue-600 font-semibold underline underline-offset-2'>browse files</span> · Optimized for vintage, noisy, or blurry images
              </p>
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

        {/* Image Preview + Process Button */}
        <AnimatePresence>
          {originalImage && !resultImage && (
            <motion.div
              key='preview'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className='flex flex-col items-center gap-6 w-full max-w-[560px]'
            >
              <div className='relative w-full rounded-[22px] overflow-hidden shadow-xl bg-white/75 backdrop-blur-xl border border-white/80 aspect-square max-h-[420px] flex items-center justify-center'>
                <img
                  src={originalImage}
                  alt='Preview'
                  className='w-full h-full object-contain rounded-[22px]'
                />

                {loading && (
                  <div className='absolute inset-0 bg-white/85 backdrop-blur-md flex flex-col items-center justify-center gap-4'>
                    <div className='flex gap-1.5 items-end h-8'>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [0.3, 1.8, 0.3] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: 'easeInOut',
                          }}
                          className='w-1.5 h-8 bg-blue-600 rounded-full origin-bottom'
                        />
                      ))}
                    </div>
                    <div className='text-center'>
                      <p className='font-body-strong text-neutral-900 text-[16px] font-semibold'>
                        Upscaling and refining…
                      </p>
                      <p className='font-caption text-neutral-500 mt-1'>
                        Synthesizing high-frequency textures
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className='flex flex-wrap gap-3 justify-center'>
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className='flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50'
                >
                  {loading ? 'Refining Details…' : 'Enhance Photo'}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className='border border-gray-300 text-gray-600 px-6 py-3 rounded-full text-sm hover:border-gray-400 transition-all hover:scale-105 active:scale-95'
                >
                  Change Image
                </button>
              </div>
            </motion.div>
          )}

          {/* Before/After Interactive Comparison Slider */}
          {resultImage && (
            <motion.div
              key='result'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='flex flex-col items-center gap-6 w-full max-w-[620px]'
            >
              <p className='font-caption text-neutral-500 text-sm'>
                Drag the divider to compare original vs. enhanced output
              </p>

              {/* Before/After slider frame */}
              <div
                ref={sliderContainerRef}
                className='relative w-full rounded-[22px] overflow-hidden shadow-xl select-none cursor-col-resize border border-white/80 bg-white/80 backdrop-blur-xl'
                style={{ aspectRatio: '4/3' }}
                onMouseDown={onSliderMouseDown}
                onTouchStart={onSliderMouseDown}
              >
                {/* BEFORE */}
                <img
                  src={originalImage}
                  alt='Original'
                  className='absolute inset-0 w-full h-full object-contain bg-white/50'
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  draggable={false}
                />

                {/* AFTER */}
                <img
                  src={resultImage}
                  alt='Enhanced Output'
                  className='absolute inset-0 w-full h-full object-contain bg-white/50'
                  style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                  draggable={false}
                />

                {/* Slider divider line */}
                <div
                  className='absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-md'
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-white/80 flex items-center justify-center pointer-events-none shadow-md'>
                    <svg className='w-4 h-4 text-neutral-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 9l-4 3 4 3M16 9l4 3-4 3' />
                    </svg>
                  </div>
                </div>

                {/* Labels */}
                <span className='absolute top-3 left-3 bg-white/80 backdrop-blur-md border border-white/60 text-neutral-800 text-[12px] font-caption-strong px-2.5 py-1 rounded-full shadow-xs'>
                  Original
                </span>
                <span className='absolute top-3 right-3 bg-white/80 backdrop-blur-md border border-white/60 text-blue-600 font-caption-strong text-[12px] px-2.5 py-1 rounded-full shadow-xs'>
                  Enhanced
                </span>
              </div>

              {/* Actions */}
              <div className='flex flex-wrap gap-3 justify-center'>
                <a
                  href={resultImage}
                  download='enhanced.jpg'
                  target='_blank'
                  rel='noreferrer'
                  className='flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg'
                >
                  <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' />
                  </svg>
                  Download Enhanced
                </a>
                <button
                  onClick={reset}
                  className='border border-gray-300 text-gray-600 px-6 py-3 rounded-full text-sm hover:border-gray-400 transition-all hover:scale-105 active:scale-95'
                >
                  Try Another Image
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
