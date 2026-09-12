import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const RemoveBg = () => {
  const { removeBg, credit, user, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const [dragOver, setDragOver] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)   // object URL for preview
  const [originalFile, setOriginalFile] = useState(null)     // File object to send
  const [resultImage, setResultImage] = useState(null)       // Cloudinary URL
  const [loading, setLoading] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)             // Before/After slider %
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
    if (!user) { setShowLogin(true); return }
    if (!originalFile) return
    setLoading(true)
    const url = await removeBg(originalFile)
    if (url) setResultImage(url)
    setLoading(false)
  }

  // ─── Before/After slider ─────────────────────────────────────────────────────
  const onSliderMouseDown = (e) => {
    e.preventDefault()
    setIsDraggingSlider(true)
  }

  const onSliderMouseMove = useCallback((e) => {
    if (!isDraggingSlider || !sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const pos = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(0, Math.min(100, pos)))
  }, [isDraggingSlider])

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
      className="min-h-[90vh] flex flex-col items-center pb-16"
      onMouseMove={onSliderMouseMove}
      onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove}
      onTouchEnd={onSliderMouseUp}
    >
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-10 mb-8"
      >
        <span className="inline-block bg-white/60 backdrop-blur-sm border border-white/80 text-gray-600 text-xs font-semibold px-5 py-1.5 rounded-full mb-4 shadow-sm tracking-wide uppercase">
          AI Powered
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
          Remove Background
        </h1>
        <p className="text-gray-500 mt-3 text-base max-w-md mx-auto">
          Upload any photo — our AI will erase the background in seconds, leaving a clean transparent PNG.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Costs <span className="font-semibold text-gray-700">1 credit</span> per image &nbsp;·&nbsp; Credits remaining:&nbsp;
          <span className="font-bold text-emerald-600">{user ? credit : '—'}</span>
        </p>
      </motion.div>

      {/* ── Upload Zone ── */}
      {!originalImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`w-full max-w-2xl h-64 sm:h-80 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 select-none
            ${dragOver
              ? 'border-emerald-500 bg-emerald-50/70 scale-[1.02]'
              : 'border-gray-300 bg-white/50 hover:border-emerald-400 hover:bg-white/70'
            }`}
        >
          {/* Upload icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${dragOver ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <svg className={`w-8 h-8 transition-colors ${dragOver ? 'text-emerald-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="text-center px-6">
            <p className="font-semibold text-gray-700 text-lg">
              {dragOver ? 'Drop it here!' : 'Drag & drop your image here'}
            </p>
            <p className="text-gray-400 text-sm mt-1">or <span className="text-emerald-600 underline underline-offset-2">browse files</span> &nbsp;·&nbsp; PNG, JPG, WEBP supported</p>
          </div>
        </motion.div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* ── Image Preview + Actions ── */}
      <AnimatePresence>
        {originalImage && !resultImage && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 w-full max-w-2xl"
          >
            {/* Preview card */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-white/70 backdrop-blur-sm border border-white/80">
              {/* Checkerboard pattern to show transparency area */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%)',
                  backgroundSize: '20px 20px',
                }}
              />
              <img
                src={originalImage}
                alt="Preview"
                className="relative w-full max-h-96 object-contain"
              />
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-3xl">
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, 2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-6 bg-emerald-500 rounded-full origin-bottom"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm font-medium">AI is removing background…</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={onSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                    Remove Background
                  </>
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="border border-gray-300 text-gray-600 px-6 py-3 rounded-full text-sm hover:border-gray-400 transition-all disabled:opacity-50"
              >
                Change Image
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Before/After Result ── */}
        {resultImage && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 w-full max-w-2xl"
          >
            <p className="text-gray-500 text-sm text-center">
              Drag the slider to compare before &amp; after
            </p>

            {/* Before/After slider container */}
            <div
              ref={sliderContainerRef}
              className="relative w-full rounded-3xl overflow-hidden shadow-2xl select-none cursor-col-resize border border-white/80"
              style={{ aspectRatio: '4/3' }}
              onMouseDown={onSliderMouseDown}
              onTouchStart={onSliderMouseDown}
            >
              {/* BEFORE — original image (full width, clipped by slider) */}
              <img
                src={originalImage}
                alt="Before"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                draggable={false}
              />

              {/* AFTER — processed image on checkerboard */}
              <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#d4d4d4 0% 25%, #fff 0% 50%)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <img
                  src={resultImage}
                  alt="After"
                  className="absolute inset-0 w-full h-full object-contain"
                  draggable={false}
                />
              </div>

              {/* Slider divider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                style={{ left: `${sliderPos}%` }}
              >
                {/* Drag handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-200">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
                  </svg>
                </div>
              </div>

              {/* Labels */}
              <span className="absolute top-3 left-3 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">Before</span>
              <span className="absolute top-3 right-3 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">After</span>
            </div>

            {/* Download + Try Another */}
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={resultImage}
                download="removed-bg.png"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PNG
              </a>
              <button
                onClick={reset}
                className="border border-gray-300 text-gray-600 px-6 py-3 rounded-full text-sm hover:border-gray-400 transition-all hover:scale-105 active:scale-95"
              >
                Try Another Image
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RemoveBg
