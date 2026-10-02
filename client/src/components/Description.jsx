import React from 'react'
import { WheelCarousel } from '@/components/ui/wheel-carousel'

const capabilityItems = [
  { label: "GENERATE IMAGES FROM TEXT.", image: "" },
  { label: "REMOVE BACKGROUNDS INSTANTLY.", image: "" },
  { label: "ENHANCE PHOTOS TO 4K.", image: "" },
  { label: "UNBLUR FACES & MOTION.", image: "" },
  { label: "INPAINT & GENERATIVE FILL.", image: "" },
  { label: "EDIT WITH AI STUDIO.", image: "" },
  { label: "UPSCALE ANY RESOLUTION.", image: "" },
  { label: "CINEMATIC LIGHTING & STYLES.", image: "" },
  { label: "BATCH PROCESS AT SCALE.", image: "" },
]

const Description = () => {
  return (
    <section id="features" className="relative w-full bg-[#fafafc] py-20 sm:py-28 overflow-hidden select-none">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        {/* Left corner container fitting within the left 50% */}
        <div className="w-full md:w-1/2 max-w-[580px] flex items-center justify-start">
          <WheelCarousel
            items={capabilityItems}
            hidePhoto={true}
            photoWidth={0}
            scrollTriggered={true}
            targetIndex={2}
            loop={false}
            mode="custom"
            background="transparent"
            selectedColor="#09090b"
            textColor="rgba(15, 23, 42, 0.32)"
            markerColor="#2563eb"
            markerSize={10}
            markerGap={16}
            spacing={14}
            radius={270}
            visibleItems={4}
            apexInset={0}
            edgeFade={true}
            edgeFadeSize={25}
            prefix={
              <span
                className="text-neutral-950 font-extrabold uppercase tracking-[-0.02em] shrink-0 text-[clamp(1.25rem,2.4vw,2.2rem)] select-none mr-3"
                style={{ fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}
              >
                YOU CAN
              </span>
            }
            className="w-full h-[400px] min-h-[400px] !bg-transparent !justify-start !items-center"
            itemClassName="text-[clamp(1.1rem,2.2vw,1.85rem)] font-extrabold tracking-[-0.02em]"
          />
        </div>
      </div>
    </section>
  )
}

export default Description
