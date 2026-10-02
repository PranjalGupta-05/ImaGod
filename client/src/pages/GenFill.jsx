import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Expand, Upload, Download, RotateCcw, RefreshCw } from 'lucide-react'

import GrainOverlay from '../components/ui/GrainOverlay'
import ThemeOrb from '../components/ui/ThemeOrb'
import Button from '../components/ui/Button'
import { Card, CardInner, PageHeader } from '../components/ui/Card'

const ASPECT_RATIOS = [
  { value: '16:9',  label: '16:9',  desc: 'YouTube / Landscape', icon: '▬' },
  { value: '9:16',  label: '9:16',  desc: 'Instagram Story / Reel', icon: '▯' },
  { value: '4:3',   label: '4:3',   desc: 'Classic / Presentation', icon: '▭' },
  { value: '1:1',   label: '1:1',   desc: 'Instagram / Square', icon: '□' },
  { value: '21:9',  label: '21:9',  desc: 'Cinematic / Ultra-wide', icon: '▬' },
  { value: '3:4',   label: '3:4',   desc: 'Portrait / Pinterest', icon: '▯' },
]

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
      className="min-h-[90vh] flex flex-col items-center pb-20 pt-20 sm:pt-24 px-4 select-none"
      onMouseMove={onSliderMouseMove} onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove} onTouchEnd={onSliderMouseUp}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="text-center mb-6 max-w-xl w-full">
        <PageHeader
          badge="Cloudinary Generative AI"
          title="Generative Fill"
          subtitle="Upload any photo, pick a new aspect ratio, and the AI will naturally extend the scene to fill the new dimensions."
        />
        <p className="mt-1 text-xs text-ink-subtle font-sans">
          Costs <span className="font-semibold text-ink">1 credit</span> per image &nbsp;·&nbsp; Credits:&nbsp;
          <span className="font-bold text-emerald-600">{user ? credit : '—'}</span>
        </p>
      </motion.div>

      {/* Upload zone */}
      {!originalImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-[580px]"
        >
          <Card>
            <CardInner
              dashed
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`cursor-pointer flex flex-col items-center justify-center min-h-[260px] sm:min-h-[290px] select-none ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-100/60 ring-4 ring-emerald-500/10'
                  : 'border-emerald-300/80 hover:border-emerald-400 hover:bg-emerald-50/40'
              }`}
              style={{
                background: dragOver
                  ? undefined
                  : 'linear-gradient(180deg, #a7f3d0 0%, #d1fae5 45%, #ffffff 100%)',
              }}
            >
              <GrainOverlay />
              <div className="mb-3.5">
                <ThemeOrb theme="emerald" icon={Expand} />
              </div>

              <p className="text-sm sm:text-base font-semibold text-ink font-primary">
                Drop your photo here, or <span className="text-emerald-600 underline">browse</span>
              </p>
              <p className="text-xs text-ink-muted mt-1.5 font-sans">
                Supports JPG, PNG, WEBP • Up to 25MB
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-line w-full max-w-sm">
                {['Outpaint & Expand', 'Aspect Ratios', 'Scene Extension', 'Natural Fill'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white border border-line text-ink-muted font-sans"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </CardInner>
          </Card>
        </motion.div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <AnimatePresence>
        {originalImage && !resultImage && (
          <motion.div key="controls" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-6 w-full max-w-2xl">
            {/* Preview */}
            <Card className="w-full">
              <CardInner className="p-3 border-emerald-200">
                <div className="relative w-full rounded-[14px] overflow-hidden bg-white aspect-[16/10] max-h-72 flex items-center justify-center">
                  <img src={originalImage} alt="Preview" className="w-full h-full object-contain" />
                  {loading && (
                    <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                      <div className="flex gap-1.5">
                        {[0,1,2,3,4].map(i => (
                          <motion.div key={i} animate={{ scaleY: [0.4, 1.8, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                            className="w-1.5 h-7 rounded-full origin-bottom bg-emerald-500" />
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-ink text-sm font-semibold font-primary">AI is extending your image…</p>
                        <p className="text-ink-muted text-xs mt-0.5 font-sans">Generating new scenery at {selectedAR}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardInner>
            </Card>

            {/* Aspect ratio picker */}
            <div className="w-full">
              <p className="text-xs font-semibold text-ink-muted mb-3 ml-1 font-primary">Select target aspect ratio</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ASPECT_RATIOS.map(ar => (
                  <button key={ar.value} onClick={() => setSelectedAR(ar.value)}
                    className={`relative flex flex-col items-center justify-center gap-1 p-3.5 rounded-[14px] border transition-all overflow-hidden text-center cursor-pointer ${selectedAR === ar.value ? 'border-emerald-500 bg-emerald-50 shadow-2xs ring-2 ring-emerald-500/20' : 'border-line bg-white hover:border-emerald-200'}`}
                  >
                    {selectedAR === ar.value && <GrainOverlay />}
                    <span className="text-lg">{ar.icon}</span>
                    <span className={`font-bold text-sm font-primary ${selectedAR === ar.value ? 'text-emerald-700' : 'text-ink'}`}>{ar.label}</span>
                    <span className="text-[10px] text-ink-subtle leading-tight font-sans">{ar.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="emerald"
                size="md"
                disabled={loading}
                loading={loading}
                icon={!loading ? Expand : undefined}
                onClick={onSubmit}
              >
                {loading ? 'Filling…' : `Extend to ${selectedAR}`}
              </Button>
              <Button
                variant="secondary"
                size="md"
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                Change Image
              </Button>
            </div>
          </motion.div>
        )}

        {resultImage && (
          <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full font-primary">
              <Expand className="w-4 h-4" /> Fill complete — {selectedAR}!
            </div>

            <p className="text-ink-muted text-xs font-sans">Drag to compare original vs. filled</p>

            <Card className="w-full">
              <CardInner className="p-3 border-emerald-200">
                <div ref={sliderContainerRef} className="relative w-full rounded-[14px] overflow-hidden select-none cursor-col-resize border border-line max-h-[42vh]" style={{ aspectRatio: '4/3' }} onMouseDown={onSliderMouseDown} onTouchStart={onSliderMouseDown}>
                  <img src={originalImage} alt="Before" className="absolute inset-0 w-full h-full object-contain bg-[#f5f5f7]" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} draggable={false} />
                  <img src={resultImage} alt="After" className="absolute inset-0 w-full h-full object-contain bg-white" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }} draggable={false} />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center border border-line">
                      <Expand className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <span className="absolute top-3 left-3 text-white text-xs font-semibold bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full font-primary">Original</span>
                  <span className="absolute top-3 right-3 text-white text-xs font-semibold bg-emerald-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full font-primary">Filled {selectedAR} ✦</span>
                </div>
              </CardInner>
            </Card>

            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={resultImage}
                download={`genfill-${selectedAR.replace(':','x')}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center font-primary font-semibold select-none cursor-pointer transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 px-8 py-3 rounded-full text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <Button
                variant="secondary"
                size="md"
                icon={RotateCcw}
                onClick={reset}
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                Try Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GenFill

