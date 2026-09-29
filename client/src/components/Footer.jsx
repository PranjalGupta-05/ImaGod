import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className='w-full bg-canvas-parchment py-16 border-t border-hairline select-none'>
      <div className='max-w-[1024px] mx-auto px-4 sm:px-6'>
        {/* Footnote / Disclaimer section */}
        <div className='pb-8 mb-8 border-b border-hairline font-micro-legal text-ink-muted48 space-y-2'>
          <p>
            1. Generation speed depends on network latency and cluster concurrency. High-resolution exports available on all plans.
          </p>
          <p>
            2. Credit consumption: 1 credit per Image Generation, 1 credit per Background Removal, 1 credit per Photo Enhancement.
          </p>
        </div>

        {/* Directory columns (headings: caption-strong 14/600, dense-link: 17/400 line-height 2.41) */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-12'>
          {/* Col 1 */}
          <div>
            <h4 className='font-caption-strong text-ink mb-3'>AI Tools</h4>
            <ul className='space-y-1 text-[13px]'>
              <li>
                                <Link to='/result' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Text to Image
                </Link>
              </li>
              <li>
                <Link to='/remove-bg' className='text-[#333333] hover:text-primary transition-colors'>
                  Remove Background
                </Link>
              </li>
              <li>
                <Link to='/enhance' className='text-[#333333] hover:text-primary transition-colors'>
                  Photo Enhancer
                </Link>
              </li>
              <li>
                                <Link to='/result' className='text-[#6e6e73] hover:text-primary transition-colors'>
                  Neural Synthesis 2.0
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className='font-caption-strong text-ink mb-3'>Store & Credits</h4>
            <ul className='space-y-1 text-[13px]'>
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
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className='font-caption-strong text-ink mb-3'>Imagify Studio</h4>
            <ul className='space-y-1 text-[13px]'>
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

          {/* Col 4 */}
          <div>
            <h4 className='font-caption-strong text-ink mb-3'>Account & Legal</h4>
            <ul className='space-y-1 text-[13px]'>
              <li>
                <Link to='/buycredit' className='text-[#333333] hover:text-primary transition-colors'>
                  Manage Credits
                </Link>
              </li>
              <li>
                <span className='text-[#6e6e73] cursor-default'>
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className='text-[#6e6e73] cursor-default'>
                  Terms of Service
                </span>
              </li>
              <li>
                <span className='text-[#6e6e73] cursor-default'>
                  Legal Disclaimers
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright + Social Links */}
        <div className='pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <span className='font-display text-ink font-semibold text-[14px]'>
              Imagify
            </span>
            <span className='font-fine-print text-ink-muted48'>
              Copyright © 2026 Imagify Inc. All rights reserved.
            </span>
          </div>

          <div className='flex items-center gap-4'>
            <a href='https://facebook.com' target='_blank' rel='noreferrer' className='opacity-60 hover:opacity-100 transition-opacity' aria-label='Facebook'>
              <img src={assets.facebook_icon} alt='' className='w-5 h-5' />
            </a>
            <a href='https://twitter.com' target='_blank' rel='noreferrer' className='opacity-60 hover:opacity-100 transition-opacity' aria-label='Twitter'>
              <img src={assets.twitter_icon} alt='' className='w-5 h-5' />
            </a>
            <a href='https://instagram.com' target='_blank' rel='noreferrer' className='opacity-60 hover:opacity-100 transition-opacity' aria-label='Instagram'>
              <img src={assets.instagram_icon} alt='' className='w-5 h-5' />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
