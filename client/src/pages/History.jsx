import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ThemeOrb from '../components/ui/ThemeOrb'
import Button from '../components/ui/Button'
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
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

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
    className='rounded-card-inner bg-white border border-line overflow-hidden animate-pulse'
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
        <ThemeOrb theme='purple' icon={Clock} />
        <h2 className='text-[22px] font-bold font-primary text-ink'>Your Creation History</h2>
        <p className='text-[14px] font-body text-ink-muted text-center max-w-sm'>
          Sign in to view all images you've created and processed with our AI tools.
        </p>
        <Button
          onClick={() => setShowLogin('Login')}
          variant='primary'
          size='md'
        >
          Sign In
        </Button>
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
        <ThemeOrb theme='purple' icon={Clock} />
        <h1 className='text-[26px] sm:text-[32px] font-bold font-primary text-ink tracking-tight text-center'>
          Creation History
        </h1>
        <p className='text-[14px] font-body text-ink-muted text-center max-w-md'>
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
        <div className='flex items-center gap-1.5 flex-wrap justify-center bg-white/80 backdrop-blur-sm border border-line rounded-full px-1.5 py-1.5 shadow-2xs'>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-neutral-900 text-white shadow-2xs font-bold'
                  : 'text-ink-muted hover:text-ink hover:bg-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-2.5'>
          <span className='text-[12px] font-body text-ink-muted font-medium'>
            {total} image{total !== 1 ? 's' : ''}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className='p-2 rounded-full bg-white hover:bg-violet-50 border border-line shadow-2xs transition-all active:scale-95 cursor-pointer disabled:opacity-50'
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
            <ImageIcon className='w-7 h-7 text-violet-400' />
          </div>
          <h3 className='text-[16px] font-semibold font-primary text-ink'>No images yet</h3>
          <p className='text-[13px] font-body text-ink-muted text-center max-w-xs'>
            Start creating with any of our AI tools and your images will appear here automatically.
          </p>
          <Button
            onClick={() => navigate('/result')}
            variant='purple'
            size='md'
          >
            Create Your First Image
          </Button>
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
                className='group relative rounded-card-inner bg-white border border-line overflow-hidden shadow-2xs hover:shadow-card hover:border-violet-300 transition-all duration-300'
              >
                {/* Thumbnail */}
                <div
                  className='aspect-square overflow-hidden cursor-pointer relative bg-neutral-100'
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
                    className='absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-2xs border'
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
                      <span className='text-[11px] font-semibold font-body text-ink truncate capitalize' title={img.prompt}>
                        "{img.prompt}"
                      </span>
                    ) : null}
                    <div className='flex items-center gap-1.5'>
                      <span className='text-[11px] font-body text-ink-muted font-medium truncate'>
                        {timeAgo(img.createdAt)}
                      </span>
                      <span className='text-[10px] font-body text-neutral-400 shrink-0'>
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
                      className='p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-ink transition-colors cursor-pointer'
                      title='Download'
                    >
                      <Download className='w-3.5 h-3.5' />
                    </a>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(img.publicId) }}
                      disabled={deleting === img.publicId}
                      className='p-1.5 rounded-full hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-50'
                      title='Delete'
                    >
                      {deleting === img.publicId ? (
                        <span className='inline-block w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin' />
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
              <div className='rounded-card overflow-hidden bg-white/5 border border-white/10 shadow-2xl'>
                <img
                  src={lightboxImage.url}
                  alt='Full view'
                  className='max-h-[70vh] max-w-full object-contain'
                />
              </div>

              {lightboxImage.prompt ? (
                <div className='bg-white/10 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 text-white text-[13px] font-body font-medium max-w-lg text-center truncate'>
                  "{lightboxImage.prompt}"
                </div>
              ) : null}

              {/* Info bar */}
              <div className='flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/10'>
                {(() => {
                  const meta = FEATURE_META[lightboxImage.feature] || FEATURE_META.unknown
                  const FeatureIcon = meta.icon
                  return (
                    <div className='flex items-center gap-1.5 text-white/80 text-[12px] font-medium font-body'>
                      <FeatureIcon className='w-3.5 h-3.5' />
                      {meta.label}
                    </div>
                  )
                })()}
                <span className='text-white/40'>|</span>
                <span className='text-white/60 text-[12px] font-body'>
                  {lightboxImage.width}x{lightboxImage.height}
                </span>
                <span className='text-white/40'>|</span>
                <span className='text-white/60 text-[12px] font-body'>
                  {formatBytes(lightboxImage.bytes)}
                </span>
                <a
                  href={lightboxImage.url}
                  download
                  target='_blank'
                  rel='noreferrer'
                  className='ml-2 inline-flex'
                >
                  <Button variant='secondary' size='sm' icon={Download}>
                    Download
                  </Button>
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
