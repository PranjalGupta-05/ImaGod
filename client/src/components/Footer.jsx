import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUp, Sparkles, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    setSubscribed(true)
    toast.success("You're subscribed to ImaGod Studio weekly drops!")
    setEmail('')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className='relative w-full bg-gradient-to-b from-canvas via-[#f7f7fa] to-[#f4f4f7] py-16 select-none overflow-hidden'>
      {/* Linear Gradient Divider & Blending Transition between Upper Section and Footer */}
      <div className='absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300/50 via-50% to-transparent pointer-events-none' />
      <div className='absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-canvas via-canvas/50 to-transparent pointer-events-none' />
      <div className='max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Harmonious Light-Themed Prompt Drops Strip */}
        <div className='mb-12 p-6 sm:p-7 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-center justify-between gap-5'>
          <div className='space-y-1 text-center lg:text-left'>
            <div className='flex items-center justify-center lg:justify-start gap-2'>
              <Sparkles className='w-4 h-4 text-primary' />
              <h3 className='font-primary font-semibold text-base sm:text-lg text-ink'>
                Stay ahead of the generative curve.
              </h3>
            </div>
            <p className='text-xs sm:text-[13px] text-neutral-500 font-sans'>
              Receive curated weekly prompts, breakthrough model benchmarks, and workflow guides.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className='w-full lg:w-auto flex items-center gap-2 max-w-md'>
            <div className='relative flex-1'>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email...'
                disabled={subscribed}
                className='w-full px-4 py-2.5 rounded-full bg-neutral-100/80 border border-neutral-200 text-ink text-xs sm:text-[13px] placeholder:text-neutral-400 outline-none focus:border-primary focus:bg-white transition-all font-sans'
              />
            </div>
            <button
              type='submit'
              disabled={subscribed}
              className='inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-focus active:scale-95 text-white font-semibold text-xs sm:text-[13px] transition-all shadow-xs cursor-pointer whitespace-nowrap font-primary'
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className='w-3.5 h-3.5 text-white' />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <span>Join drops</span>
                  <ArrowRight className='w-3.5 h-3.5' />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Directory Navigation Columns */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-8 mb-12'>
          {/* Brand Info */}
          <div className='col-span-2 md:col-span-1 space-y-3'>
            <div className='flex items-center gap-2'>
              <img src="/logo.png" alt="ImaGod" className="w-6 h-6 object-contain" />
              <span className='font-display text-ink font-bold text-[18px] tracking-tight'>
                ImaGod
              </span>
            </div>
            <p className='text-xs text-neutral-500 leading-relaxed font-sans'>
              Next-generation generative studio engineered for artists, brand creators, and media directors.
            </p>
          </div>

          {/* Col 2: AI Tools */}
          <div>
            <h4 className='font-primary font-semibold text-ink text-[12px] sm:text-[13px] tracking-wide uppercase mb-3.5'>
              AI Tools
            </h4>
            <ul className='space-y-2 text-[13px] font-sans'>
              <li>
                <Link to='/result' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Text to Image
                </Link>
              </li>
              <li>
                <Link to='/remove-bg' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Remove Background
                </Link>
              </li>
              <li>
                <Link to='/enhance' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Photo Enhancer
                </Link>
              </li>
              <li>
                <Link to='/unblur' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  AI Unblur
                </Link>
              </li>
              <li>
                <Link to='/gen-fill' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Generative Fill
                </Link>
              </li>
              <li>
                <Link to='/ai-editor' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  AI Studio Canvas
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Store & Credits */}
          <div>
            <h4 className='font-primary font-semibold text-ink text-[12px] sm:text-[13px] tracking-wide uppercase mb-3.5'>
              Store & Credits
            </h4>
            <ul className='space-y-2 text-[13px] font-sans'>
              <li>
                <Link to='/buycredit' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Starter Plan ($10)
                </Link>
              </li>
              <li>
                <Link to='/buycredit' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Advanced Plan ($50)
                </Link>
              </li>
              <li>
                <Link to='/buycredit' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Business Tier ($250)
                </Link>
              </li>
              <li>
                <Link to='/buycredit' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Razorpay Checkout
                </Link>
              </li>
              <li>
                <Link to='/usage' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Usage & Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: ImaGod Studio */}
          <div>
            <h4 className='font-primary font-semibold text-ink text-[12px] sm:text-[13px] tracking-wide uppercase mb-3.5'>
              ImaGod Studio
            </h4>
            <ul className='space-y-2 text-[13px] font-sans'>
              <li>
                <Link to='/' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Product Overview
                </Link>
              </li>
              <li>
                <Link to='/' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Customer Stories
                </Link>
              </li>
              <li>
                <Link to='/' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Safety & Ethics
                </Link>
              </li>
              <li>
                <Link to='/' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Release Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Account & Legal */}
          <div>
            <h4 className='font-primary font-semibold text-ink text-[12px] sm:text-[13px] tracking-wide uppercase mb-3.5'>
              Account & Legal
            </h4>
            <ul className='space-y-2 text-[13px] font-sans'>
              <li>
                <Link to='/buycredit' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Manage Credits
                </Link>
              </li>
              <li>
                <Link to='/history' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Generation History
                </Link>
              </li>
              <li>
                <span className='text-[#6e6e73] hover:text-primary transition-colors cursor-pointer'>
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className='text-[#6e6e73] hover:text-primary transition-colors cursor-pointer'>
                  Terms of Service
                </span>
              </li>
              <li>
                <span className='text-[#6e6e73] hover:text-primary transition-colors cursor-pointer'>
                  Legal Disclaimers
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright + Social Links + Back to Top */}
        <div className='pt-6 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3 text-xs text-neutral-500 font-sans'>
            <span className='font-display text-ink font-semibold text-[13px]'>
              ImaGod
            </span>
            <span>·</span>
            <span>Copyright © {new Date().getFullYear()} ImaGod Inc. All rights reserved.</span>
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3.5'>
              <a href='https://facebook.com' target='_blank' rel='noreferrer' className='opacity-60 hover:opacity-100 transition-opacity' aria-label='Facebook'>
                <img src={assets.facebook_icon} alt='' className='w-4 h-4' />
              </a>
              <a href='https://twitter.com' target='_blank' rel='noreferrer' className='opacity-60 hover:opacity-100 transition-opacity' aria-label='Twitter'>
                <img src={assets.twitter_icon} alt='' className='w-4 h-4' />
              </a>
              <a href='https://instagram.com' target='_blank' rel='noreferrer' className='opacity-60 hover:opacity-100 transition-opacity' aria-label='Instagram'>
                <img src={assets.instagram_icon} alt='' className='w-4 h-4' />
              </a>
            </div>

            <div className='w-px h-3.5 bg-neutral-300 hidden sm:block' />

            <button
              onClick={scrollToTop}
              className='text-xs text-neutral-500 hover:text-ink flex items-center gap-1 font-medium transition-colors cursor-pointer font-sans'
            >
              <span>Back to top</span>
              <ArrowUp className='w-3 h-3' />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

