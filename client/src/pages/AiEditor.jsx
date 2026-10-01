import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, RefreshCw, Upload, Download, RotateCcw, Palette, SwitchCamera } from 'lucide-react'

const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]"
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
  />
)

const ThemeOrb = ({ icon: Icon, gradient, shadow }) => (
  <div
    className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg"
    style={{ background: gradient, boxShadow: shadow }}
  >
    <div className="absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none" />
    <Icon className="w-5 h-5 text-white z-10 stroke-[2]" />
  </div>
)

const TABS = [
  { id: 'replace', label: 'Replace Object', icon: SwitchCamera, gradient: 'radial-gradient(circle at 35% 30%, #a78bfa 0%, #7c3aed 55%, #4c1d95 100%)', shadow: '0 8px 18px -2px rgba(124,58,237,0.45)' },
  { id: 'recolor', label: 'Recolor Object', icon: Palette,     gradient: 'radial-gradient(circle at 35% 30%, #fb923c 0%, #ea580c 55%, #9a3412 100%)', shadow: '0 8px 18px -2px rgba(234,88,12,0.45)' },
]

const RECOLOR_PRESETS = ['red','blue','green','yellow','pink','purple','orange','black','white','gold','silver','teal']

const AiEditor = () => {
  const { genReplace, genRecolor, credit, user, setShowLogin } = useContext(AppContext)

  const [tab, setTab] = useState('replace')
  const [dragOver, setDragOver] = useState(false)
  const [originalImage, setOriginalImage] = useState(null)
  const [originalFile, setOriginalFile] = useState(null)
  const [resultImage, setResultImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)

  // Replace fields
  const [fromObj, setFromObj] = useState('')
  const [toObj, setToObj] = useState('')

  // Recolor fields
  const [recolorPrompt, setRecolorPrompt] = useState('')
  const [recolorColor, setRecolorColor] = useState('red')

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
    let url
    if (tab === 'replace') {
      if (!fromObj.trim() || !toObj.trim()) { setLoading(false); return }
      url = await genReplace(originalFile, fromObj.trim(), toObj.trim())
    } else {
      if (!recolorPrompt.trim()) { setLoading(false); return }
      url = await genRecolor(originalFile, recolorPrompt.trim(), recolorColor)
    }
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

  const activeTab = TABS.find(t => t.id === tab)

  return (
    <div
      className="min-h-[90vh] flex flex-col items-center pb-20 pt-24 px-4"
      onMouseMove={onSliderMouseMove} onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove} onTouchEnd={onSliderMouseUp}
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="text-center mb-8 max-w-xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <ThemeOrb icon={Wand2} gradient={activeTab.gradient} shadow={activeTab.shadow} />
          <div className="text-left">
            <span className="block text-[11px] font-bold tracking-widest uppercase text-[#86868b] mb-0.5">Cloudinary Generative AI</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d1d1f] leading-tight">AI Editor</h1>
          </div>
        </div>
        <p className="text-[#6e6e73] text-sm leading-relaxed">
          Replace any object in your photo or recolor it with a single text prompt. Powered by Cloudinary&apos;s Generative AI.
        </p>
        <p className="mt-2 text-xs text-[#86868b]">
          Costs <span className="font-semibold text-[#1d1d1f]">1 credit</span> per edit &nbsp;·&nbsp; Credits:&nbsp;
          <span className="font-bold" style={{ color: '#7c3aed' }}>{user ? credit : '—'}</span>
        </p>
      </motion.div>

      {/* Tab switcher */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex bg-black/[0.04] rounded-full p-1 mb-8 gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResultImage(null) }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${tab === t.id ? 'bg-white shadow text-[#1d1d1f]' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </motion.div>

      {/* Upload zone */}
      {!originalImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative w-full max-w-2xl h-64 sm:h-72 rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden transition-all duration-300 select-none
            ${dragOver ? 'border-violet-400 bg-violet-50/60 scale-[1.015]' : 'border-black/[0.10] bg-white/50 hover:border-violet-300 hover:bg-white/70'}`}
        >
          <GrainOverlay />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? 'bg-violet-100' : 'bg-black/[0.04]'}`}>
            <Upload className={`w-7 h-7 ${dragOver ? 'text-violet-500' : 'text-[#86868b]'}`} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#1d1d1f]">{dragOver ? 'Drop it here!' : 'Drag & drop your image'}</p>
            <p className="text-[#86868b] text-sm mt-0.5">or <span className="text-violet-600 underline underline-offset-2">browse files</span></p>
          </div>
        </motion.div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* Image loaded – show controls + preview */}
      <AnimatePresence>
        {originalImage && !resultImage && (
          <motion.div key="controls" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="flex flex-col items-center gap-6 w-full max-w-2xl">
            {/* Preview */}
            <div className="relative w-full rounded-[20px] overflow-hidden shadow-xl bg-white border border-black/[0.06]">
              <img src={originalImage} alt="Preview" className="w-full max-h-80 object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <div className="flex gap-1.5">
                    {[0,1,2,3,4].map(i => (
                      <motion.div key={i} animate={{ scaleY: [0.4, 1.8, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }} className="w-1.5 h-7 rounded-full origin-bottom" style={{ background: activeTab.gradient }} />
                    ))}
                  </div>
                  <p className="text-[#1d1d1f] text-sm font-semibold">Generative AI is editing…</p>
                </div>
              )}
            </div>

            {/* Input fields */}
            <AnimatePresence mode="wait">
              {tab === 'replace' ? (
                <motion.div key="replace-fields" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6e6e73] mb-1.5 ml-1">Replace this object</label>
                    <input value={fromObj} onChange={e => setFromObj(e.target.value)} placeholder='e.g. "jacket"' className="w-full px-4 py-3 rounded-[12px] bg-white border border-black/[0.08] text-sm text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-violet-400/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6e6e73] mb-1.5 ml-1">Replace with</label>
                    <input value={toObj} onChange={e => setToObj(e.target.value)} placeholder='e.g. "leather jacket"' className="w-full px-4 py-3 rounded-[12px] bg-white border border-black/[0.08] text-sm text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-violet-400/50" />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="recolor-fields" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="w-full flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6e6e73] mb-1.5 ml-1">Object to recolor</label>
                    <input value={recolorPrompt} onChange={e => setRecolorPrompt(e.target.value)} placeholder='e.g. "the car", "the shirt", "the sofa"' className="w-full px-4 py-3 rounded-[12px] bg-white border border-black/[0.08] text-sm text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-orange-400/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6e6e73] mb-2 ml-1">Target color</label>
                    <div className="flex flex-wrap gap-2">
                      {RECOLOR_PRESETS.map(c => (
                        <button key={c} onClick={() => setRecolorColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${recolorColor === c ? 'scale-110 border-[#1d1d1f]' : 'border-transparent hover:scale-105'}`}
                          style={{ background: c, boxShadow: recolorColor === c ? '0 0 0 2px white, 0 0 0 4px #1d1d1f' : 'none' }}
                          title={c}
                        />
                      ))}
                      <input type="color" value={`#${recolorColor.startsWith('#') ? recolorColor.slice(1) : 'ef4444'}`}
                        onChange={e => setRecolorColor(e.target.value)}
                        className="w-8 h-8 rounded-full border-2 border-black/[0.1] cursor-pointer"
                        title="Custom color"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={onSubmit} disabled={loading}
                className="flex items-center gap-2 text-white px-8 py-3 rounded-full font-semibold text-sm disabled:opacity-50 hover:scale-[1.03] active:scale-95 transition-all shadow-lg"
                style={{ background: activeTab.gradient, boxShadow: activeTab.shadow }}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {loading ? 'Generating…' : (tab === 'replace' ? 'Replace Object' : 'Recolor Object')}
              </button>
              <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="border border-black/[0.10] text-[#6e6e73] px-6 py-3 rounded-full text-sm hover:text-[#1d1d1f] hover:border-black/[0.2] transition-all disabled:opacity-50">
                Change Image
              </button>
            </div>
          </motion.div>
        )}

        {/* Result with before/after slider */}
        {resultImage && (
          <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border"
              style={{ background: `${activeTab.gradient.replace('radial-gradient', 'linear-gradient')}10`, borderColor: '#e5e7eb', color: '#4b5563' }}
            >
              <Wand2 className="w-4 h-4" /> Edit complete!
            </motion.div>

            <p className="text-[#86868b] text-sm">Drag the slider to compare original vs. edited</p>

            <div ref={sliderContainerRef} className="relative w-full rounded-[20px] overflow-hidden shadow-2xl select-none cursor-col-resize border border-black/[0.06]" style={{ aspectRatio: '4/3' }} onMouseDown={onSliderMouseDown} onTouchStart={onSliderMouseDown}>
              <img src={originalImage} alt="Before" className="absolute inset-0 w-full h-full object-contain bg-[#f5f5f7]" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }} draggable={false} />
              <img src={resultImage} alt="After" className="absolute inset-0 w-full h-full object-contain bg-white" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }} draggable={false} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center border border-black/[0.08]">
                  <svg className="w-4 h-4 text-[#6e6e73]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 3 4 3M16 9l4 3-4 3" /></svg>
                </div>
              </div>
              <span className="absolute top-3 left-3 text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">Original</span>
              <span className="absolute top-3 right-3 text-white text-xs font-semibold backdrop-blur-sm px-2.5 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.7)' }}>Edited ✦</span>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <a href={resultImage} download="ai-edited.jpg" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-white px-8 py-3 rounded-full font-semibold text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-lg"
                style={{ background: activeTab.gradient, boxShadow: activeTab.shadow }}
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <button onClick={reset} className="flex items-center gap-2 border border-black/[0.10] text-[#6e6e73] px-6 py-3 rounded-full text-sm hover:text-[#1d1d1f] hover:border-black/[0.2] transition-all">
                <RotateCcw className="w-3.5 h-3.5" /> Try Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AiEditor