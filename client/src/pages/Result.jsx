import React, { useContext, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import GrainOverlay from '../components/ui/GrainOverlay'
import ThemeOrb from '../components/ui/ThemeOrb'
import Button from '../components/ui/Button'
import { Card, CardInner } from '../components/ui/Card'
import { Sparkles, Wand2, Download, Maximize2, Copy, Check, RotateCcw, Send } from 'lucide-react'

const STYLES = [
  { id: 'natural', label: 'Natural / Raw', icon: '✨', suffix: '' },
  { id: 'photorealistic', label: 'Photorealistic', icon: '📸', suffix: ', hyperrealistic 8k resolution, shot on 35mm lens, natural studio lighting, ultra-detailed' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬', suffix: ', cinematic composition, dramatic volumetric lighting, anamorphic lens, color graded, movie still' },
  { id: 'anime', label: 'Anime & Manga', icon: '🎨', suffix: ', modern anime aesthetic, Makoto Shinkai style, vibrant colors, clean linework' },
  { id: '3d', label: '3D Digital', icon: '🧊', suffix: ', 3D digital illustration, octane render, raytracing, soft clay material, unreal engine 5' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '🌆', suffix: ', cyberpunk aesthetic, neon volumetric lighting, rainy reflections, futuristic cityscape' },
  { id: 'fantasy', label: 'Fantasy Art', icon: '🔮', suffix: ', ethereal fantasy concept art, mystical atmosphere, magical particles, textured brushstrokes' },
]

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1', frameAspect: 'aspect-square' },
  { id: '16:9', label: '16:9', frameAspect: 'aspect-[16/10]' },
  { id: '9:16', label: '9:16', frameAspect: 'aspect-[3/4]' },
]

const CURATED_PROMPTS = [
  'A mystical forest library with floating glowing orbs and ancient leather books',
  'Minimalist brutalist concrete villa suspended over calm Nordic sea at twilight',
  'Cinematic street portrait of a cyberpunk explorer under neon rain in Shinjuku',
  'Microscopic dewdrop on a bioluminescent petal reflecting a spiral galaxy',
  'Ethereal Japanese temple garden covered in fresh winter snow and morning mist',
  'Solitary astronaut standing at the edge of a crystal canyon on Mars at dawn',
]

const LOADING_STEPS = [
  'Analyzing prompt tokens…',
  'Sampling latent diffusion space…',
  'Synthesizing lighting & composition…',
  'Refining high-frequency texture details…',
]

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const { generateImage, credit, user, setShowLogin } = useContext(AppContext)

  const [input, setInput] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('natural')
  const [selectedRatio, setSelectedRatio] = useState('1:1')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingStepIdx, setLoadingStepIdx] = useState(0)
  const [copiedId, setCopiedId] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false)

  const chatContainerRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll chat feed to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, loading])

  // Prepopulate from navigation state
  useEffect(() => {
    if (location.state?.initialPrompt) {
      setInput(location.state.initialPrompt)
    }
  }, [location.state])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`
    }
  }, [input])

  // Cycle loading step messages during generation
  useEffect(() => {
    if (!loading) {
      setLoadingStepIdx(0)
      return
    }

    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [loading])

  const handleRandomPrompt = () => {
    const random = CURATED_PROMPTS[Math.floor(Math.random() * CURATED_PROMPTS.length)]
    setInput(random)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = async (promptToSend = null) => {
    const textPrompt = (promptToSend || input).trim()
    if (!textPrompt || loading) return

    if (!user) {
      setShowLogin(true)
      return
    }

    const userMessageId = `user-${Date.now()}`
    const assistantMessageId = `assistant-${Date.now()}`
    const activeStyleObj = STYLES.find((s) => s.id === selectedStyle)
    const ratioObj = ASPECT_RATIOS.find((r) => r.id === selectedRatio) || ASPECT_RATIOS[0]

    // 1. Add User Message
    const newUserMsg = {
      id: userMessageId,
      role: 'user',
      content: textPrompt,
      style: activeStyleObj?.label,
      ratio: ratioObj?.label,
    }

    // 2. Add Loading Assistant Message
    const newAssistantMsg = {
      id: assistantMessageId,
      role: 'assistant',
      status: 'loading',
      prompt: textPrompt,
      ratioClass: ratioObj?.frameAspect,
    }

    setMessages((prev) => [...prev, newUserMsg, newAssistantMsg])
    setInput('')
    setLoading(true)

    // Append chosen style suffix if applicable
    const finalPrompt = activeStyleObj?.suffix
      ? `${textPrompt}${activeStyleObj.suffix}`
      : textPrompt

    const result = await generateImage(finalPrompt)

    if (result) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, status: 'completed', image: result }
            : msg
        )
      )
    } else {
      // Remove loading message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
    }

    setLoading(false)
  }

  const handleCopyPrompt = (id, text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const activeStyle = STYLES.find((s) => s.id === selectedStyle)

  return (
    <div className='relative w-full h-[100dvh] overflow-hidden select-none flex flex-col items-center justify-between bg-[#fafafc]'>
      {/* Main Studio Wrapper */}
      <div className='relative z-10 w-full max-w-3xl h-full flex flex-col justify-between min-h-0 pt-20 sm:pt-24 pb-5 px-3 sm:px-6'>
        
        {/* ── CHAT FEED CONTAINER ── */}
        <div
          ref={chatContainerRef}
          className='flex-1 w-full overflow-y-auto px-1 sm:px-2 py-2 space-y-4 scroll-smooth min-h-0'
        >
          {messages.length === 0 ? (
            /* Empty State: Themed Signature Card */
            <div className='h-full flex flex-col items-center justify-center text-center px-2 sm:px-4 py-4'>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className='w-full max-w-[560px]'
              >
                <Card>
                  <CardInner
                    className='p-6 sm:p-8 flex flex-col items-center border-blue-200'
                    style={{
                      background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
                    }}
                  >
                    <div className='relative z-10 mb-4'>
                      <ThemeOrb theme="blue" icon={Wand2} />
                    </div>

                    <h2 className='text-2xl sm:text-3xl font-bold font-primary text-ink tracking-tight relative z-10'>
                      What will you imagine today?
                    </h2>
                    <p className='text-xs sm:text-sm font-body text-ink-muted mt-2 max-w-sm mx-auto leading-relaxed relative z-10'>
                      Type your creative prompt below to synthesize high-resolution imagery with lighting & texture details.
                    </p>

                    {/* Quick Inspiration Prompts Grid */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 w-full relative z-10'>
                      {CURATED_PROMPTS.slice(0, 4).map((prompt, idx) => (
                        <button
                          key={idx}
                          type='button'
                          onClick={() => handleSendMessage(prompt)}
                          className='p-3 rounded-input bg-white/85 hover:bg-white border border-blue-200/80 shadow-2xs hover:shadow-xs text-left text-xs font-body text-neutral-800 transition-all flex items-start gap-2 group cursor-pointer active:scale-[0.99]'
                        >
                          <span className='text-blue-500 font-bold'>↳</span>
                          <span className='line-clamp-2 leading-snug'>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </CardInner>
                </Card>
              </motion.div>
            </div>
          ) : (
            /* Chat Messages Stream */
            messages.map((msg) => (
              <div key={msg.id} className='w-full flex flex-col'>
                {msg.role === 'user' ? (
                  /* User Prompt Bubble */
                  <div className='flex justify-end mb-1'>
                    <div className='max-w-[85%] sm:max-w-md bg-neutral-900 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-sm text-sm font-body'>
                      <p className='leading-relaxed'>{msg.content}</p>
                      {(msg.style || msg.ratio) && (
                        <div className='mt-1.5 pt-1.5 border-t border-white/10 flex items-center gap-2 text-[10px] text-neutral-400'>
                          {msg.style && <span>Style: {msg.style}</span>}
                          {msg.ratio && <span>• {msg.ratio}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* AI Response */
                  <div className='flex items-start gap-2.5 mb-2'>
                    <div className='w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-0.5'>
                      ✦
                    </div>

                    <div className='flex-1 max-w-[90%] sm:max-w-md flex flex-col items-start'>
                      <p className='text-xs font-medium font-body text-ink-muted mb-1.5 flex items-center gap-1.5'>
                        {msg.status === 'loading' ? (
                          <>
                            <span className='w-2 h-2 rounded-full bg-blue-500 animate-ping' />
                            <span>Generating image…</span>
                          </>
                        ) : (
                          <>
                            <span className='text-emerald-600 font-semibold'>Image created.</span>
                          </>
                        )}
                      </p>

                      {/* Image Canvas Box */}
                      <div
                        className={`relative w-full ${
                          msg.ratioClass || 'aspect-square'
                        } max-h-[46vh] rounded-card-inner bg-white/90 backdrop-blur-md border border-line shadow-card overflow-hidden flex items-center justify-center group`}
                      >
                        {msg.status === 'loading' ? (
                          /* Shimmer Generating State */
                          <div className='w-full h-full bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center'>
                            <motion.div
                              className='absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#38bdf8]'
                              animate={{ y: [-80, 80, -80] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <div className='w-10 h-10 rounded-full border-2 border-blue-400/20 border-t-blue-400 animate-spin mb-3' />
                            <p className='text-xs font-mono text-neutral-300 h-4'>
                              {LOADING_STEPS[loadingStepIdx]}
                            </p>
                          </div>
                        ) : (
                          /* Finished Image with Action Controls */
                          <>
                            <img
                              src={msg.image}
                              alt='AI Generated'
                              className='w-full h-full object-contain cursor-pointer'
                              onClick={() => setLightboxImage(msg.image)}
                            />

                            {/* Floating Toolbar on Hover */}
                            <div className='absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity'>
                              <button
                                type='button'
                                onClick={() => setLightboxImage(msg.image)}
                                className='p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-md active:scale-95 cursor-pointer'
                                title='Preview Fullscreen'
                              >
                                <Maximize2 className='w-3.5 h-3.5' />
                              </button>

                              <a
                                href={msg.image}
                                download={`imagod-${Date.now()}.png`}
                                className='p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-md active:scale-95 cursor-pointer'
                                title='Download Image'
                              >
                                <Download className='w-3.5 h-3.5' />
                              </a>

                              <button
                                type='button'
                                onClick={() => handleCopyPrompt(msg.id, msg.prompt)}
                                className='p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all shadow-md active:scale-95 cursor-pointer'
                                title='Copy Prompt'
                              >
                                {copiedId === msg.id ? (
                                  <Check className='w-3.5 h-3.5 text-emerald-400' />
                                ) : (
                                  <Copy className='w-3.5 h-3.5' />
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── BOTTOM DOCKED AI CHAT INPUT BAR ── */}
        <div className='w-full shrink-0 pt-2'>
          <div className='w-full relative bg-white border border-line rounded-card shadow-card focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all'>
            
            {/* Top Prompt Input Area */}
            <div className='p-3.5 pb-1 flex items-start gap-2'>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask AI to generate an image… (Enter to send)'
                disabled={loading}
                rows={1}
                className='w-full bg-transparent resize-none text-sm font-body text-ink outline-none placeholder-ink-muted/60 leading-relaxed max-h-24'
              />
            </div>

            {/* Bottom Integrated Controls */}
            <div className='px-3.5 pb-3 pt-1 flex items-center justify-between gap-2 border-t border-line/60 select-none'>
              
              {/* Left Controls: Style Pill + Aspect Ratio + Surprise Me */}
              <div className='flex items-center gap-1.5 flex-wrap'>
                
                {/* Style Dropdown */}
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                    className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200/80 border border-line text-ink text-xs font-medium transition-colors cursor-pointer'
                  >
                    <span>{activeStyle?.icon}</span>
                    <span className='truncate max-w-[85px] sm:max-w-none'>{activeStyle?.label}</span>
                    <svg className='w-3 h-3 text-ink-muted' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                    </svg>
                  </button>

                  {styleDropdownOpen && (
                    <div
                      className='absolute bottom-full left-0 mb-2 w-48 bg-white/95 backdrop-blur-xl border border-line rounded-card-inner shadow-card-hover p-1 z-50'
                      onMouseLeave={() => setStyleDropdownOpen(false)}
                    >
                      {STYLES.map((style) => (
                        <button
                          key={style.id}
                          type='button'
                          onClick={() => {
                            setSelectedStyle(style.id)
                            setStyleDropdownOpen(false)
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                            selectedStyle === style.id
                              ? 'bg-neutral-900 text-white'
                              : 'text-neutral-700 hover:bg-neutral-100'
                          }`}
                        >
                          <span>{style.icon}</span>
                          <span>{style.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Aspect Ratio Toggle */}
                <div className='hidden sm:flex items-center gap-0.5 bg-neutral-100/80 border border-line p-0.5 rounded-full'>
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      type='button'
                      onClick={() => setSelectedRatio(ratio.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                        selectedRatio === ratio.id
                          ? 'bg-neutral-900 text-white shadow-2xs font-semibold'
                          : 'text-ink-muted hover:text-ink'
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>

                {/* Random Prompt Button */}
                <button
                  type='button'
                  onClick={handleRandomPrompt}
                  disabled={loading}
                  className='p-1.5 text-ink-muted hover:text-ink hover:bg-neutral-100 rounded-full transition-colors cursor-pointer'
                  title='Random Prompt Idea'
                >
                  <Sparkles className='w-4 h-4' />
                </button>
              </div>

              {/* Right Controls: Clear & Send Arrow */}
              <div className='flex items-center gap-2 shrink-0'>
                {messages.length > 0 && (
                  <button
                    type='button'
                    onClick={() => setMessages([])}
                    className='text-[11px] text-ink-muted hover:text-ink transition-colors px-1.5 py-0.5 cursor-pointer font-medium'
                  >
                    Reset
                  </button>
                )}
                <button
                  type='button'
                  onClick={() => handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className='w-8 h-8 rounded-full bg-primary hover:bg-primary-focus text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed shadow-xs'
                  title='Send Prompt (Enter)'
                >
                  {loading ? (
                    <div className='w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  ) : (
                    <Send className='w-3.5 h-3.5' />
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ── FULLSCREEN LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 select-none'
            onClick={() => setLightboxImage(null)}
          >
            <button
              type='button'
              onClick={() => setLightboxImage(null)}
              className='absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

            <div
              className='relative max-w-5xl max-h-[85vh] flex flex-col items-center'
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage}
                alt='Fullscreen Artwork'
                className='max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl border border-white/10'
              />
              <div className='w-full mt-4 flex items-center justify-end px-2'>
                <a
                  href={lightboxImage}
                  download={`imagod-${Date.now()}.png`}
                  className='inline-flex'
                >
                  <Button variant='primary' size='sm' icon={Download}>
                    Download Master (PNG)
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}