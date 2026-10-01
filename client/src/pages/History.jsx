import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Clock,
  Image as ImageIcon,
  Scissors,
  Sparkles,
  PenTool,
  Expand,
  Focus,
  Download,
  Trash2,
  X,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

// Grain texture overlay matching other pages
const GrainOverlay = () => (
  <div
    className='absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay rounded-[20px]'
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
)

// Theme Orb matching other pages
const ThemeOrb = ({ icon: Icon }) => (
  <div
    className='relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 shadow-[0_8px_18px_-2px_rgba(139,92,246,0.40)]'
    style={{
      background: 'radial-gradient(circle at 35% 30%, #c4b5fd 0%, #8b5cf6 55%, #6d28d9 100%)',
    }}
  >
    <div className='absolute top-1.5 left-2 w-3.5 h-2 rounded-full bg-white/45 blur-[0.5px] -rotate-45 pointer-events-none' />
    <Icon className='w-5 h-5 text-white z-10 stroke-[2]' />
  </div>
)

// Feature metadata
const FEATURE_META = {
  textToImage: { label: 'Text to Image', icon: ImageIcon, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  removeBg: { label: 'Remove BG', icon: Scissors, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  enhance: { label: 'Enhance', icon: Sparkles, color: '#eab308', bg: '#fefce8', border: '#fde68a' },
  aiEditor: { label: 'AI Editor', icon: PenTool, color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8' },
  genReplace: { label: 'Gen Replace', icon: PenTool, color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8' },
  genRecolor: { label: 'Gen Recolor', icon: PenTool, color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8' },
  genFill: { label: 'Uncrop', icon: Expand, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  unblur: { label: 'AI Unblur', icon: Focus, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  unknown: { label: 'Other', icon: ImageIcon, color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
}

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'textToImage', label: 'Text to Image' },
  { key: 'removeBg', label: 'Remove BG' },
  { key: 'enhance', label: 'Enhance' },
  { key: 'genReplace', label: 'Replace' },
  { key: 'genRecolor', label: 'Recolor' },
  { key: 'genFill', label: 'Uncrop' },
  { key: 'unblur', label: 'Unblur' },
]

// Format bytes helper
const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

// Time ago helper
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Skeleton loader card
const SkeletonCard = ({ index }) => (
  <div
    className='rounded-[18px] bg-white border border-[#e5e5e7] overflow-hidden animate-pulse'
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className='aspect-square bg-gradient-to-b from-gray-100 to-gray-50' />
    <div className='p-3 space-y-2'>
      <div className='h-3 bg-gray-100 rounded-full w-2/3' />
      <div className='h-2.5 bg-gray-50 rounded-full w-1/3' />
    </div>
  </div>
)

const History = () => {
  const { user, token, backendUrl, setShowLogin } = useContext(AppContext)
  const navigate = useNavigate()

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [lightboxImage, setLightboxImage] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchHistory = useCallback(async (feature = 'all') => {
    if (!token) return
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/history?feature=${feature}&limit=50`,
        { headers: { token } }
      )
      if (data.success) {
        setImages(data.images)
        setTotal(data.total)
      }
    } catch (error) {
      console.log('Fetch history error:', error.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, backendUrl])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchHistory(activeFilter)
  }, [user, activeFilter, fetchHistory])

  const handleDelete = async (publicId) => {
    if (!window.confirm('Delete this image permanently from your cloud storage?')) return
    setDeleting(publicId)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/history/delete`,
        { publicId },
        { headers: { token } }
      )
      if (data.success) {
        setImages((prev) => prev.filter((img) => img.publicId !== publicId))
        setTotal((prev) => prev - 1)
        if (lightboxImage?.publicId === publicId) setLightboxImage(null)
      }
    } catch (error) {
      console.log('Delete error:', error.message)
    } finally {
      setDeleting(null)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHistory(activeFilter)
  }

  // Not logged in state
  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4'>
        <ThemeOrb icon={Clock} />
        <h2 className='text-[22px] font-bold text-ink'>Your Creation History</h2>
        <p className='text-[14px] text-[#6b7280] text-center max-w-sm'>
          Sign in to view all images you've created and processed with our AI tools.
        </p>
        <button
          onClick={() => setShowLogin('Login')}
          className='px-7 py-2.5 rounded-full font-semibold text-[14px] bg-[#1d1d1f] hover:bg-black text-white shadow-[0_2px_10px_rgba(0,0,0,0.16)] transition-all active:scale-95 cursor-pointer'
        >
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center w-full px-4 sm:px-6 pt-6 sm:pt-10 pb-24 max-w-7xl mx-auto'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='flex flex-col items-center gap-3 mb-7'
      >
        <ThemeOrb icon={Clock} />
        <h1 className='text-[26px] sm:text-[32px] font-bold text-ink tracking-tight text-center'>
          Creation History
        </h1>
        <p className='text-[14px] text-[#6b7280] text-center max-w-md'>
          Every image you've generated, enhanced, and transformed — stored in your cloud.
        </p>
      </motion.div>

      {/* Filter Tabs + Refresh */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className='w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6'
      >
        <div className='flex items-center gap-1.5 flex-wrap justify-center bg-white/80 backdrop-blur-sm border border-[#e5e5e7] rounded-full px-1.5 py-1.5 shadow-[0_1px_4px_rgba(0,0,0,0.03)]'>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-[#1d1d1f] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-ink hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-2.5'>
          <span className='text-[12px] text-[#6b7280] font-medium'>
            {total} image{total !== 1 ? 's' : ''}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className='p-2 rounded-full bg-white hover:bg-violet-50 border border-[#e5e5e7] shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50'
            title='Refresh'
          >
            <RefreshCw className={`w-3.5 h-3.5 text-violet-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Image Grid */}
      {loading ? (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full'>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className='flex flex-col items-center justify-center py-20 gap-4'
        >
          <div className='w-16 h-16 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center'>
            <ImageIcon className='w-7 h-7 text-violet-300' />
          </div>
          <h3 className='text-[16px] font-semibold text-ink'>No images yet</h3>
          <p className='text-[13px] text-[#6b7280] text-center max-w-xs'>
            Start creating with any of our AI tools and your images will appear here automatically.
          </p>
          <button
            onClick={() => navigate('/result')}
            className='px-5 py-2 rounded-full text-[13px] font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer'
          >
            Create Your First Image
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 w-full'
        >
          {images.map((img, index) => {
            const meta = FEATURE_META[img.feature] || FEATURE_META.unknown
            const FeatureIcon = meta.icon

            return (
              <motion.div
                key={img.publicId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.03 * index }}
                className='group relative rounded-[18px] bg-white border border-[#e5e5e7] overflow-hidden shadow-[0_1px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-violet-200 transition-all duration-300'
              >
                {/* Thumbnail */}
                <div
                  className='aspect-square overflow-hidden cursor-pointer relative bg-gray-50'
                  onClick={() => setLightboxImage(img)}
                >
                  <img
                    src={img.thumbnail}
                    alt={meta.label}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    loading='lazy'
                  />

                  {/* Hover overlay */}
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center'>
                    <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5'>
                      <ExternalLink className='w-5 h-5 text-white drop-shadow-md' />
                    </div>
                  </div>

                  {/* Feature badge */}
                  <div
                    className='absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm border'
                    style={{
                      backgroundColor: meta.bg + 'e6',
                      color: meta.color,
                      borderColor: meta.border,
                    }}
                  >
                    <FeatureIcon className='w-3 h-3' />
                    {meta.label}
                  </div>
                </div>

                {/* Info footer */}
                <div className='px-3 py-2.5 flex items-center justify-between gap-2'>
                  <div className='flex flex-col gap-0.5 min-w-0 flex-1'>
                    {img.prompt ? (
                      <span className='text-[11px] font-semibold text-ink truncate capitalize' title={img.prompt}>
                        "{img.prompt}"
                      </span>
                    ) : null}
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[11px] text-[#6b7280] font-medium truncate'>
                        {timeAgo(img.createdAt)}
                      </span>
                      <span className='text-[10px] text-[#9ca3af] shrink-0'>
                        {formatBytes(img.bytes)}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <a
                      href={img.url}
                      download
                      target='_blank'
                      rel='noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='p-1.5 rounded-full hover:bg-violet-50 text-[#9ca3af] hover:text-violet-600 transition-colors cursor-pointer'
                      title='Download'
                    >
                      <Download className='w-3.5 h-3.5' />
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(img.publicId) }}
                      disabled={deleting === img.publicId}
                      className='p-1.5 rounded-full hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50'
                      title='Delete'
                    >
                      {deleting === img.publicId ? (
                        <span className='inline-block w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin' />
                      ) : (
                        <Trash2 className='w-3.5 h-3.5' />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4'
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className='relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center gap-4'
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setLightboxImage(null)}
                className='absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer'
              >
                <X className='w-5 h-5' />
              </button>

              {/* Image */}
              <div className='rounded-[16px] overflow-hidden bg-white/5 border border-white/10 shadow-2xl'>
                <img
                  src={lightboxImage.url}
                  alt='Full view'
                  className='max-h-[70vh] max-w-full object-contain'
                />
              </div>

              {lightboxImage.prompt ? (
                <div className='bg-white/10 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 text-white text-[13px] font-medium max-w-lg text-center truncate'>
                  "{lightboxImage.prompt}"
                </div>
              ) : null}

              {/* Info bar */}
              <div className='flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/10'>
                {(() => {
                  const meta = FEATURE_META[lightboxImage.feature] || FEATURE_META.unknown
                  const FeatureIcon = meta.icon
                  return (
                    <div className='flex items-center gap-1.5 text-white/80 text-[12px] font-medium'>
                      <FeatureIcon className='w-3.5 h-3.5' />
                      {meta.label}
                    </div>
                  )
                })()}
                <span className='text-white/40'>|</span>
                <span className='text-white/60 text-[12px]'>
                  {lightboxImage.width}x{lightboxImage.height}
                </span>
                <span className='text-white/40'>|</span>
                <span className='text-white/60 text-[12px]'>
                  {formatBytes(lightboxImage.bytes)}
                </span>
                <a
                  href={lightboxImage.url}
                  download
                  target='_blank'
                  rel='noreferrer'
                  className='ml-2 px-4 py-1.5 rounded-full text-[12px] font-semibold bg-white text-ink hover:bg-violet-50 transition-colors cursor-pointer flex items-center gap-1.5'
                >
                  <Download className='w-3 h-3' />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default History
