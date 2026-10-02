import React, { useContext, useRef, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Upload, Download, RotateCcw, Palette, SwitchCamera } from 'lucide-react'
import GrainOverlay from '../components/ui/GrainOverlay'
import ThemeOrb from '../components/ui/ThemeOrb'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardInner, PageHeader } from '../components/ui/Card'

const TABS = [
  { id: 'replace', label: 'Replace Object', icon: SwitchCamera, theme: 'purple' },
  { id: 'recolor', label: 'Recolor Object', icon: Palette, theme: 'orange' },
]

const RECOLOR_PRESETS = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'black', 'white', 'gold', 'silver', 'teal']

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

  const activeTab = TABS.find(t => t.id === tab) || TABS[0]

  return (
    <div
      className="min-h-[90vh] flex flex-col items-center pb-20 pt-24 px-4"
      onMouseMove={onSliderMouseMove} onMouseUp={onSliderMouseUp}
      onTouchMove={onSliderMouseMove} onTouchEnd={onSliderMouseUp}
    >
      {/* Unified Page Header */}
      <PageHeader
        category="Cloudinary Generative AI"
        title="AI Editor"
        description="Replace any object in your photo or recolor it with a single text prompt. Powered by Cloudinary's Generative AI."
        creditCost={1}
        userCredit={credit}
        isAuthenticated={!!user}
        theme={activeTab.theme}
        icon={activeTab.icon}
      />

      {/* Standardized Tab Switcher */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex bg-neutral-100/90 border border-neutral-200/80 rounded-full p-1 mb-8 gap-1 shadow-2xs"
      >
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setResultImage(null) }}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              tab === t.id
                ? 'bg-white shadow-xs text-ink font-bold'
                : 'text-ink-muted hover:text-ink hover:bg-white/50'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </motion.div>

      {/* Upload Zone */}
      {!originalImage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-full max-w-[580px]"
        >
          <Card>
            <CardInner
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`p-7 sm:p-9 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[290px] text-center ${
                dragOver
                  ? 'border-violet-500 bg-violet-100/60 ring-4 ring-violet-500/10'
                  : 'border-violet-300/80 hover:border-violet-400 hover:bg-violet-50/40'
              }`}
              style={{
                background: dragOver
                  ? undefined
                  : 'linear-gradient(180deg, #ddd6fe 0%, #ede9fe 45%, #ffffff 100%)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-line shadow-2xs flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform duration-200">
                <Upload className="w-6 h-6 text-violet-600" />
              </div>

              <p className="text-sm sm:text-base font-semibold text-ink">
                Drop your photo here, or <span className="text-violet-600 underline font-bold">browse</span>
              </p>
              <p className="text-xs text-ink-muted mt-1.5">
                Supports JPG, PNG, WEBP • Up to 25MB
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 pt-3 border-t border-line/80 w-full max-w-sm">
                {['Object Replace', 'Color Switch', 'Clothing & Props', 'Natural Blending'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/80 border border-line text-ink-muted"
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

      {/* Image loaded – show controls + preview */}
      <AnimatePresence>
        {originalImage && !resultImage && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 w-full max-w-2xl"
          >
            {/* Preview Frame */}
            <div className="relative w-full rounded-[24px] overflow-hidden shadow-card bg-white border border-line p-2">
              <div className="relative rounded-[18px] overflow-hidden bg-neutral-50 flex items-center justify-center">
                <img src={originalImage} alt="Preview" className="w-full max-h-80 object-contain" />
                {loading && (
                  <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3, 4].map(i => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [0.4, 1.8, 0.4] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                          className={`w-1.5 h-7 rounded-full origin-bottom ${tab === 'replace' ? 'bg-violet-600' : 'bg-orange-500'}`}
                        />
                      ))}
                    </div>
                    <p className="text-ink text-sm font-semibold">Generative AI is editing…</p>
                  </div>
                )}
              </div>
            </div>

            {/* Input fields */}
            <AnimatePresence mode="wait">
              {tab === 'replace' ? (
                <motion.div
                  key="replace-fields"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <Input
                    label="Replace this object"
                    value={fromObj}
                    onChange={e => setFromObj(e.target.value)}
                    placeholder='e.g. "jacket"'
                  />
                  <Input
                    label="Replace with"
                    value={toObj}
                    onChange={e => setToObj(e.target.value)}
                    placeholder='e.g. "leather jacket"'
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="recolor-fields"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="w-full flex flex-col gap-4"
                >
                  <Input
                    label="Object to recolor"
                    value={recolorPrompt}
                    onChange={e => setRecolorPrompt(e.target.value)}
                    placeholder='e.g. "the car", "the shirt", "the sofa"'
                  />
                  <div className="bg-white rounded-input border border-line p-3">
                    <label className="block text-xs font-semibold text-ink-muted mb-2">Target color</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {RECOLOR_PRESETS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setRecolorColor(c)}
                          className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                            recolorColor === c ? 'scale-110 border-ink ring-2 ring-primary/20' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ background: c }}
                          title={c}
                        />
                      ))}
                      <input
                        type="color"
                        value={`#${recolorColor.startsWith('#') ? recolorColor.slice(1) : 'ef4444'}`}
                        onChange={e => setRecolorColor(e.target.value)}
                        className="w-7 h-7 rounded-full border border-line cursor-pointer p-0 overflow-hidden"
                        title="Custom color"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={onSubmit}
                loading={loading}
                variant={activeTab.theme}
                size="lg"
                icon={Wand2}
              >
                {loading ? 'Generating…' : (tab === 'replace' ? 'Replace Object' : 'Recolor Object')}
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                variant="secondary"
                size="lg"
              >
                Change Image
              </Button>
            </div>
          </motion.div>
        )}

        {/* Result with before/after slider */}
        {resultImage && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 w-full max-w-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-line bg-white shadow-2xs text-ink"
            >
              <ThemeOrb theme={activeTab.theme} icon={Wand2} size="sm" />
              <span>Edit complete!</span>
            </motion.div>

            <p className="text-ink-muted text-sm">Drag the slider to compare original vs. edited</p>

            <div
              ref={sliderContainerRef}
              className="relative w-full rounded-[24px] overflow-hidden shadow-card select-none cursor-col-resize border border-line"
              style={{ aspectRatio: '4/3' }}
              onMouseDown={onSliderMouseDown}
              onTouchStart={onSliderMouseDown}
            >
              <img
                src={originalImage}
                alt="Before"
                className="absolute inset-0 w-full h-full object-contain bg-neutral-100"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                draggable={false}
              />
              <img
                src={resultImage}
                alt="After"
                className="absolute inset-0 w-full h-full object-contain bg-white"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                draggable={false}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white rounded-full shadow-card flex items-center justify-center border border-line">
                  <svg className="w-4 h-4 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
                  </svg>
                </div>
              </div>
              <span className="absolute top-3 left-3 text-white text-xs font-semibold bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                Original
              </span>
              <span
                className="absolute top-3 right-3 text-white text-xs font-semibold backdrop-blur-sm px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(124,58,237,0.75)' }}
              >
                Edited ✦
              </span>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={resultImage}
                download="ai-edited.jpg"
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button
                  variant={activeTab.theme}
                  size="lg"
                  icon={Download}
                >
                  Download
                </Button>
              </a>
              <Button
                onClick={reset}
                variant="secondary"
                size="lg"
                icon={RotateCcw}
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

export default AiEditor
