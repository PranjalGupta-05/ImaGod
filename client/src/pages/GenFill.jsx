import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Expand, Upload, Download, RotateCcw, RefreshCw } from 'lucide-react'

const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]"
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
  />
)

const ASPECT_RATIOS = [
  { value: '16:9',  label: '16:9',  desc: 'YouTube / Landscape', icon: '▬' },
  { value: '9:16',  label: '9:16',  desc: 'Instagram Story / Reel', icon: '▯' },
  { value: '4:3',   label: '4:3',   desc: 'Classic / Presentation', icon: '▭' },
  { value: '1:1',   label: '1:1',   desc: 'Instagram / Square', icon: '□' },
  { value: '21:9',  label: '21:9',  desc: 'Cinematic / Ultra-wide', icon: '▬' },
  { value: '3:4',   label: '3:4',   desc: 'Portrait / Pinterest', icon: '▯' },
]

const ORB_GRADIENT = 'radial-gradient(circle at 35% 30%, #34d399 0%, #059669 55%, #065f46 100%)'
const ORB_SHADOW   = '0 8px 18px -2px rgba(5,150,105,0.45)'

const GenFill = () => {
  const { genFill, credit, user, setShowLogin } = useContext(AppContext)

  const [dragOver, setDragOver] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedAR, setSelectedAR] = useState('16:9')
  const [sliderPos, setSliderPos] = useState(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)

  const fileInputRef = useRef(null)
  const sliderContainerRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return
    setOriginalImage(URL.createObjectURL(file))
    setOriginalFile(file)
    setResultImage(null)
    setSliderPos(50)
  }, [])

  const onFileChange = (e) => handleFile(e.target.files[0])
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }

  const onSubmit = async () => {
    if (!user) { setShowLogin(true); return }
    if (!originalFile) return
    setLoading(true)
    const url = await genFill(originalFile, selectedAR)
    if (url) setResultImage(url)
    setLoading(false)
  }

  const onSliderMouseDown = (e) => { e.preventDefault(); setIsDraggingSlider(true) }
  const onSliderMouseMove = useCallback((e) => {
    if (!isDraggingSlider || !sliderContainerRef.current) return
    const rect = sliderContainerRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    setSliderPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
  }, [isDraggingSlider])
  const onSliderMouseUp = () => setIsDraggingSlider(false)

  const reset = () => {
    setOriginalImage(null); setOriginalFile(null); setResultImage(null); setSliderPos(50)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div
      className="min-h-[90vh] flex flex-col items-center pb-20 pt-24 px-4"
      onMouseMove={onSliderMouseMove} onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove} onTouchEnd={onSliderMouseUp}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="text-center mb-8 max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: ORB_GRADIENT, boxShadow: ORB_SHADOW }}>
            <div className="absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none" />
            <Expand className="w-5 h-5 text-white z-10 stroke-[2]" />
          </div>
          <div className="text-left">
            <span className="block text-[11px] font-bold tracking-widest uppercase text-[#86868b] mb-0.5">Cloudinary Generative AI</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] leading-tight">Generative Fill</h1>
          </div>
        </div>
        <p className="text-[#6e6e73] text-sm leading-relaxed">
          Upload any photo, pick a new aspect ratio, and the AI will naturally extend the scene to fill the new dimensions — perfect for banners, stories, and social posts.
        </p>
        <p className="mt-2 text-xs text-[#86868b]">
          Costs <span className="font-semibold text-[#1d1d1f]">1 credit</span> per image &nbsp;·&nbsp; Credits:&nbsp;
          <span className="font-bold text-emerald-600">{user ? credit : '—'}</span>
        </p>
      </motion.div>

      {/* Upload zone */}
      {!originalImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative w-full max-w-2xl h-64 sm:h-72 rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden transition-all duration-300 select-none
            ${dragOver ? 'border-emerald-400 bg-emerald-50/60 scale-[1.015]' : 'border-black/[0.10] bg-white/50 hover:border-emerald-300 hover:bg-white/70'}`}
        >
          <GrainOverlay />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? 'bg-emerald-100' : 'bg-black/[0.04]'}`}>
            <Upload className={`w-7 h-7 ${dragOver ? 'text-emerald-500' : 'text-[#86868b]'}`} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1d1d1f]">{dragOver ? 'Drop it here!' : 'Drag & drop your image'}</p>
            <p className="text-[#86868b] text-sm mt-0.5">or <span className="text-emerald-600 underline underline-offset-2">browse files</span></p>
          </div>
        </motion.div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <AnimatePresence>
        {originalImage && !resultImage && (
          <motion.div key="controls" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-6 w-full max-w-2xl">
            {/* Preview */}
            <div className="relative w-full rounded-[20px] overflow-hidden shadow-xl bg-white border border-black/[0.06]">
              <img src={originalImage} alt="Preview" className="w-full max-h-72 object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <div className="flex gap-1.5">
                    {[0,1,2,3,4].map(i => (
                      <motion.div key={i} animate={{ scaleY: [0.4, 1.8, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                        className="w-1.5 h-7 rounded-full origin-bottom bg-emerald-500" />
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-[#1d1d1f] text-sm font-semibold">AI is extending your image…</p>
                    <p className="text-[#86868b] text-xs mt-0.5">Generating new scenery at {selectedAR}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Aspect ratio picker */}
            <div className="w-full">
              <p className="text-xs font-semibold text-[#6e6e73] mb-3 ml-1">Select target aspect ratio</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ASPECT_RATIOS.map(ar => (
                  <button key={ar.value} onClick={() => setSelectedAR(ar.value)}
                    className={`relative flex flex-col items-center justify-center gap-1 p-3.5 rounded-[14px] border-2 transition-all overflow-hidden text-center ${selectedAR === ar.value ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-black/[0.07] bg-white/60 hover:border-emerald-200'}`}
                  >
                    {selectedAR === ar.value && <GrainOverlay />}
                    <span className="text-lg">{ar.icon}</span>
                    <span className={`font-bold text-sm ${selectedAR === ar.value ? 'text-emerald-700' : 'text-[#1d1d1f]'}`}>{ar.label}</span>
                    <span className="text-[10px] text-[#86868b] leading-tight">{ar.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={onSubmit} disabled={loading}
                className="flex items-center gap-2 text-white px-8 py-3 rounded-full font-semibold text-sm disabled:opacity-50 hover:scale-[1.03] active:scale-95 transition-all"
                style={{ background: ORB_GRADIENT, boxShadow: ORB_SHADOW }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Expand className="w-4 h-4" />}
                {loading ? 'Filling…' : `Extend to ${selectedAR}`}
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="border border-black/[0.10] text-[#6e6e73] px-6 py-3 rounded-full text-sm hover:text-[#1d1d1f] transition-all disabled:opacity-50">
                Change Image
              </button>
            </div>
          </motion.div>
        )}

        {resultImage && (
          <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full"
            >
              <Expand className="w-4 h-4" /> Fill complete — {selectedAR}!
            </motion.div>

            <p className="text-[#86868b] text-sm">Drag to compare original vs. filled</p>

            <div ref={sliderContainerRef} className="relative w-full rounded-[20px] overflow-hidden shadow-2xl select-none cursor-col-resize border border-black/[0.06]" style={{ aspectRatio: '4/3' }} onMouseDown={onSliderMouseDown} onTouchStart={onSliderMouseDown}>
              <img src={originalImage} alt="Before" className="absolute inset-0 w-full h-full object-contain bg-[#f5f5f7]" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} draggable={false} />
              <img src={resultImage} alt="After" className="absolute inset-0 w-full h-full object-contain bg-white" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }} draggable={false} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center border border-black/[0.08]">
                  <svg className="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 3 4 3M16 9l4 3-4 3" /></svg>
                </div>
              </div>
              <span className="absolute top-3 left-3 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">Original</span>
              <span className="absolute top-3 right-3 text-white text-xs font-semibold bg-emerald-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full">Filled {selectedAR} ✦</span>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <a href={resultImage} download={`genfill-${selectedAR.replace(':','x')}.jpg`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-white px-8 py-3 rounded-full font-semibold text-sm hover:scale-[1.03] active:scale-95 transition-all"
                style={{ background: ORB_GRADIENT, boxShadow: ORB_SHADOW }}
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <button onClick={reset} className="flex items-center gap-2 border border-black/[0.10] text-[#6e6e73] px-6 py-3 rounded-full text-sm hover:text-[#1d1d1f] transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Try Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GenFill