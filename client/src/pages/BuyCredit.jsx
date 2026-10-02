import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import GrainOverlay from '../components/ui/GrainOverlay'
import ThemeOrb from '../components/ui/ThemeOrb'
import Button from '../components/ui/Button'
import { Card, CardInner } from '../components/ui/Card'
import { Check } from 'lucide-react'

const BuyCredit = () => {
  const { user, backendUrl, loadCreditsData, token, setShowLogin, credit } = useContext(AppContext)
  const navigate = useNavigate()
  const [processingPlan, setProcessingPlan] = useState(null)
  const [activeTab, setActiveTab] = useState('individuals')

  // Data for Individuals tab (using existing Imagify plans & backend planIds)
  const individualPlans = [
    {
      id: 'Basic',
      planId: 'Basic',
      title: 'Basic',
      desc: 'Best for personal creators & hobbyists exploring AI generation.',
      price: 10,
      anchorPrice: 19,
      credits: 100,
      theme: 'blue',
      gradientBg: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
      borderColor: '#bfdbfe',
      btnText: 'Get Basic edition',
      btnType: 'light',
      features: [
        '100 studio generation credits',
        'Text-to-Image high resolution',
        'Background Eraser access',
        'Standard queue priority',
        'Credits never expire',
        'Personal creation license',
      ],
      footerTitle: 'Never-expiring credits',
      footerDesc: 'Get instant credit top-up or keep using without renewing. No pressure.',
    },
    {
      id: 'Advanced',
      planId: 'Advanced',
      title: 'Advanced',
      desc: 'Best for active creators, designers & power users generating daily.',
      price: 50,
      anchorPrice: 89,
      credits: 500,
      theme: 'purple',
      gradientBg: 'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 45%, #ffffff 100%)',
      borderColor: '#ddd6fe',
      btnText: 'Get Advanced edition',
      btnType: 'light',
      features: [
        '500 studio generation credits',
        'Text-to-Image ultra high-res (4K)',
        'Background Eraser & HD PNG export',
        'Photo Enhancer & AI upscaling',
        'Priority generation queue',
        'Commercial usage rights',
      ],
      footerTitle: 'Priority GPU queue',
      footerDesc: 'Generations are dispatched with expedited queue status across all models.',
    },
    {
      id: 'Business',
      planId: 'Business',
      title: 'Business',
      desc: 'The full system. Commercial scale, maximum speed & all models.',
      price: 250,
      anchorPrice: 399,
      credits: 5000,
      theme: 'gold',
      gradientBg: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 45%, #ffffff 100%)',
      borderColor: '#fde68a',
      badge: 'Save $149 with bundle',
      btnText: 'Get Business edition',
      btnType: 'dark',
      features: [
        '5,000 enterprise credits',
        'Commercial & resale rights',
        'Full access to all AI engines',
        'Maximum throughput & concurrency',
        'Dedicated priority GPU processing',
        'Dedicated creator priority support',
      ],
      footerTitle: 'Enterprise volume ready',
      footerDesc: 'High concurrency generation with full commercial licensing for agencies.',
    },
  ]

  // Data for Teams & Enterprise tab
  const teamPlans = [
    {
      id: 'Team-Starter',
      planId: 'Advanced',
      title: 'Team Starter',
      desc: 'Best for boutique agencies & marketing teams collaborating on visuals.',
      price: 50,
      anchorPrice: 89,
      credits: 500,
      theme: 'blue',
      gradientBg: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 45%, #ffffff 100%)',
      borderColor: '#bfdbfe',
      btnText: 'Get Team Starter',
      btnType: 'light',
      features: [
        '500 pooled team generation credits',
        'Multi-seat workspace access',
        'High-resolution text-to-image synthesis',
        'Background Eraser & batch export',
        'Priority queue routing',
        'Full commercial usage rights',
      ],
      footerTitle: 'Shared Team Pool',
      footerDesc: 'Credits are shared across your team members with consolidated usage tracking.',
    },
    {
      id: 'Studio-Pro',
      planId: 'Business',
      title: 'Studio Pro',
      desc: 'Our flagship studio tier configured for high-velocity creative teams.',
      price: 250,
      anchorPrice: 399,
      credits: 5000,
      theme: 'purple',
      gradientBg: 'linear-gradient(180deg, #ede9fe 0%, #f5f3ff 45%, #ffffff 100%)',
      borderColor: '#ddd6fe',
      badge: 'Most Popular for Teams',
      btnText: 'Get Studio Pro',
      btnType: 'dark',
      features: [
        '5,000 studio generation credits',
        'Maximum concurrency & zero queue delay',
        'Full access to all AI neural engines',
        'Photo Enhancer & 8K upscaling',
        'Priority GPU worker allocation',
        'Commercial & resale rights',
      ],
      footerTitle: 'High Concurrency',
      footerDesc: 'Run multiple concurrent generation requests simultaneously without waiting.',
    },
    {
      id: 'Enterprise',
      planId: null,
      isCustom: true,
      title: 'Enterprise',
      desc: 'Dedicated GPU clusters, custom fine-tuned styles & SLA guarantee.',
      price: 'Custom',
      anchorPrice: '$1,200+',
      credits: 'Unlimited',
      theme: 'gold',
      gradientBg: 'linear-gradient(180deg, #fef3c7 0%, #fffbeb 45%, #ffffff 100%)',
      borderColor: '#fde68a',
      badge: 'Tailored SLA',
      btnText: 'Contact Enterprise',
      btnType: 'light',
      features: [
        'Bespoke credit volume & custom quotas',
        'Custom fine-tuned checkpoint models',
        'Private dedicated GPU infrastructure',
        'Full REST API & webhook integration',
        '99.9% uptime SLA & account manager',
        'Enterprise SSO & security compliance',
      ],
      footerTitle: 'Bespoke Architecture',
      footerDesc: 'Deploy customized generation pipelines tailored to your enterprise workflow.',
    },
  ]

  const displayedPlans = activeTab === 'individuals' ? individualPlans : teamPlans

  const initPay = async (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'ImaGod Credits Payment',
      description: 'Studio Credit Pack Purchase',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/user/verify-razor',
            response,
            { headers: { token } }
          )
          if (data.success) {
            await loadCreditsData()
            navigate('/result')
            toast.success('Credits successfully added to your account!')
          } else {
            toast.error(data.message || 'Payment verification failed')
          }
        } catch (error) {
          toast.error(error.message)
        } finally {
          setProcessingPlan(null)
        }
      },
      modal: {
        ondismiss: () => {
          setProcessingPlan(null)
        },
      },
    }

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options)
      rzp.open()
    } else {
      toast.error('Razorpay SDK failed to load. Please check your internet connection.')
      setProcessingPlan(null)
    }
  }

  const handlePlanAction = async (plan) => {
    if (plan.isCustom) {
      window.location.href =
        'mailto:sales@imagod.ai?subject=ImaGod%20Enterprise%20Inquiry&body=Hello%20ImaGod%20Team%2C%0A%0AWe%20would%20like%20to%20learn%20more%20about%20the%20Enterprise%20plan%20for%20our%20organization.%0A%0ATeam%20Size%3A%0AEstimated%20Credits%20Per%20Month%3A%0A%0AThank%20you!'
      return
    }

    try {
      if (!user) {
        setShowLogin(true)
        return
      }

      setProcessingPlan(plan.id)
      const { data } = await axios.post(
        backendUrl + '/api/user/pay-razor',
        { planId: plan.planId },
        { headers: { token } }
      )

      if (data.success && data.order) {
        initPay(data.order)
      } else {
        toast.error(data.message || 'Unable to initialize order')
        setProcessingPlan(null)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      setProcessingPlan(null)
    }
  }

  return (
    <div className='w-full min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#fafafc] pt-20 sm:pt-22 pb-4 select-none flex flex-col justify-center'>
      <div className='max-w-[1180px] mx-auto px-4 sm:px-6 w-full'>
        {/* Header Stack with Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='mb-3 sm:mb-4'
        >
          <h1 className='text-2xl sm:text-3xl lg:text-[34px] font-bold font-primary text-ink tracking-tight leading-tight'>
            Simple, transparent pricing
          </h1>
          <p className='text-sm sm:text-base font-body text-ink-muted mt-1 max-w-[560px]'>
            No hidden fees. Choose the plan that works for you.
          </p>
        </motion.div>

        {/* 3-Column Pricing Grid */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className='grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch mb-0'
          >
            {displayedPlans.map((plan) => {
              const isProcessing = processingPlan === plan.id

              return (
                <Card
                  key={plan.id}
                  className='p-2.5 flex flex-col justify-between'
                >
                  {/* Top Gradient Inset Box with Avatar Orb & Price */}
                  <CardInner
                    className='p-4 sm:p-5'
                    style={{
                      background: plan.gradientBg,
                      borderColor: plan.borderColor,
                    }}
                  >
                    {/* Top Row: Avatar Orb + Optional Badge */}
                    <div className='flex items-center justify-between relative z-10'>
                      <ThemeOrb theme={plan.theme} withEyes={true} />
                      {plan.badge && (
                        <span className='px-2.5 py-0.5 rounded-full bg-black/10 backdrop-blur-sm text-[11px] font-semibold text-ink'>
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Plan Title & Description */}
                    <div className='mt-3 relative z-10'>
                      <h3 className='text-[19px] font-bold font-primary text-ink tracking-tight'>
                        {plan.title}
                      </h3>
                      <p className='text-[12px] font-body text-neutral-600 mt-1 leading-relaxed min-h-[32px]'>
                        {plan.desc}
                      </p>
                    </div>

                    {/* Price Block */}
                    <div className='mt-3 relative z-10'>
                      <div className='flex items-baseline gap-2'>
                        <span className='text-[32px] font-bold font-primary text-ink tracking-tight leading-none'>
                          {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                        </span>
                        {plan.anchorPrice && (
                          <span className='text-[15px] font-body text-neutral-400 line-through font-normal'>
                            {typeof plan.anchorPrice === 'number'
                              ? `$${plan.anchorPrice}`
                              : plan.anchorPrice}
                          </span>
                        )}
                      </div>
                      <p className='text-[12px] font-body text-ink-muted mt-1'>
                        {typeof plan.credits === 'number'
                          ? `One-time payment · ${plan.credits.toLocaleString()} Credits`
                          : 'Custom enterprise volume'}
                      </p>
                    </div>

                    {/* CTA Button inside the gradient header */}
                    <div className='mt-4 relative z-10'>
                      <Button
                        onClick={() => handlePlanAction(plan)}
                        loading={isProcessing}
                        variant={plan.btnType === 'dark' ? 'primary' : 'secondary'}
                        size='md'
                        fullWidth={true}
                      >
                        {plan.isCustom ? (
                          plan.btnText
                        ) : user ? (
                          plan.btnText
                        ) : (
                          'Sign In to Purchase'
                        )}
                      </Button>
                    </div>
                  </CardInner>

                  {/* Bottom Features Checklist */}
                  <div className='px-4 pt-3.5 pb-2 flex flex-col justify-between flex-1'>
                    <ul className='space-y-2'>
                      {plan.features.slice(0, 4).map((feature, fIdx) => (
                        <li key={fIdx} className='flex items-center gap-2 text-[13px] font-body text-ink'>
                          <Check className='w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.4]' />
                          <span className='leading-snug truncate'>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default BuyCredit
