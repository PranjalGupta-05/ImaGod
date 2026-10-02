import React, { useRef, useEffect } from "react";
import { useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { WheelCarousel } from "@/components/ui/wheel-carousel";

const FEATURES = [
  "Generate Images from Text",
  "Remove Backgrounds Instantly",
  "Enhance Photos to 4K",
  "Unblur Faces & Motion",
  "Inpaint & Generative Fill",
  "Edit with AI Studio",
  "Upscale Any Resolution",
  "Cinematic Lighting & Styles",
  "Batch Process at Scale",
];

const Description = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll trigger tracking progress through the tall section (0 to 1)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Responsive, fluid spring inertia with low mass for instant input tracking
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.15,
    restDelta: 0.0005,
    restSpeed: 0.0005,
  });

  // Map progress (0 to 1) to continuous wheel rotation (0 to 8)
  const rotation = useTransform(
    shouldReduceMotion ? scrollYProgress : smoothProgress,
    [0, 1],
    [0, FEATURES.length - 1],
  );

  // Ensure video autoplays smoothly in continuous loop without scroll scrubbing
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay policy fallback: re-ensure muted and play
        video.muted = true;
        video.play().catch(() => {});
      });
    }
  }, []);

  // Static "YOU CAN" prefix anchored right at the apex line in place of the blue dot
  const staticPrefix = (
    <span
      className="font-extrabold uppercase tracking-[-0.02em] text-ink select-none whitespace-nowrap text-[clamp(1.15rem,2.1vw,1.75rem)]"
      style={{ fontFamily: "'Poppins', sans-serif", lineHeight: 1 }}
    >
      YOU CAN
    </span>
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative w-full bg-canvas select-none"
      style={{ height: `${FEATURES.length * 80}vh` }}
    >
      {/* Sticky Fullscreen Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        {/* Fullscreen Background Video - Smooth Auto-Looping shifted 20% more to the right */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            src="/hero4.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="w-full h-full object-cover object-[85%_center] lg:object-[92%_center] translate-x-[15%] sm:translate-x-[20%]"
            style={{
              backfaceVisibility: "hidden",
            }}
          />

          {/* Left feather gradient to guarantee 100% crisp legibility of the scroll ring */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-2/3 bg-gradient-to-r from-canvas via-canvas/95 via-50% to-transparent pointer-events-none" />

          {/* Top & bottom smooth section fades */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-canvas via-canvas/70 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-canvas via-canvas/70 to-transparent pointer-events-none" />
        </div>

        {/* Foreground Content: Scroll Ring firmly anchored to Left side to avoid overlapping video animation */}
        <div className="relative z-20 w-full h-full px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-start pointer-events-none">
          {/* Left Column: Pure Curved Scroll Ring with Static "YOU CAN" in place of blue dot */}
          <div className="h-full w-full max-w-[560px] sm:max-w-[650px] lg:max-w-[760px] flex items-center justify-start min-w-0 pointer-events-auto">
            <WheelCarousel
              items={FEATURES}
              prefix={staticPrefix}
              progress={rotation}
              mode="system"
              showMarker={false}
              edgeFade={true}
              edgeFadeSize={35}
              visibleItems={7}
              photoWidth={0}
              showPhoto={false}
              background="transparent"
              textColor="rgba(15, 23, 42, 0.38)"
              selectedColor="#0f0f11"
              loop={false}
              radius={360}
              spacing={17}
              apexInset="155px"
              markerGap={16}
              contentWidth={760}
              itemClassName="!text-[clamp(1.15rem,2.1vw,1.75rem)] font-bold tracking-[-0.02em]"
              className="h-full w-full !justify-start !bg-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Description;
