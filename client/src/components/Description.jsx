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

  // Ultra-smooth spring inertia shared in lockstep by both the ring and hero4.mp4
  // mass: 0.3 eliminates input lag; stiffness: 70 & damping: 24 provide fluid liquid momentum;
  // micro rest thresholds eliminate premature snapping at rest.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.3,
    restDelta: 0.00005,
    restSpeed: 0.00005,
  });

  // Map progress (0 to 1) to continuous wheel rotation (0 to 8)
  const rotation = useTransform(
    shouldReduceMotion ? scrollYProgress : smoothProgress,
    [0, 1],
    [0, FEATURES.length - 1],
  );

  // Sync hero4.mp4 scrubbing directly in lockstep with the scroll trigger
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure video is strictly paused so it only advances via scroll scrubbing
    video.pause();

    const activeProgress = shouldReduceMotion ? scrollYProgress : smoothProgress;

    let targetTime = 0;
    let isSeeking = false;
    let pendingSeek = false;

    const performSeek = () => {
      if (!video || !video.duration || isNaN(video.duration)) return;
      const dur = video.duration;
      const safeTarget = Math.max(0, Math.min(targetTime, dur - 0.03));

      // Skip micro-seeks under 8ms to prevent unnecessary decoder wakeups
      if (Math.abs(video.currentTime - safeTarget) < 0.008) {
        pendingSeek = false;
        return;
      }

      if (isSeeking) {
        pendingSeek = true;
        return;
      }

      isSeeking = true;
      pendingSeek = false;

      // Use fastSeek when available for hardware-accelerated instant scrubbing
      try {
        if (typeof video.fastSeek === "function") {
          video.fastSeek(safeTarget);
        } else {
          video.currentTime = safeTarget;
        }
      } catch {
        video.currentTime = safeTarget;
      }
    };

    const handleSeeked = () => {
      isSeeking = false;
      if (pendingSeek) {
        performSeek();
      }
    };

    const handleLoaded = () => {
      video.pause();
      if (video.duration && !isNaN(video.duration)) {
        targetTime = (activeProgress.get() || 0) * video.duration;
        performSeek();
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("canplay", handleLoaded);
    video.addEventListener("seeked", handleSeeked);

    const unsubscribe = activeProgress.on("change", (val) => {
      if (!video.duration || isNaN(video.duration)) return;
      targetTime = Math.max(0, Math.min(val * video.duration, video.duration - 0.03));
      if (!isSeeking) {
        performSeek();
      } else {
        pendingSeek = true;
      }
    });

    if (video.readyState >= 1) {
      handleLoaded();
    }

    return () => {
      unsubscribe();
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [smoothProgress, scrollYProgress, shouldReduceMotion]);

  // Static "YOU CAN" prefix anchored right at the apex line in place of the blue dot
  const staticPrefix = (
    <span
      className="font-extrabold uppercase tracking-[-0.02em] text-ink select-none whitespace-nowrap text-[clamp(0.95rem,1.65vw,1.38rem)]"
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
        {/* Fullscreen Background Video Driven by Scroll Trigger */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            src="/hero4.mp4"
            playsInline
            muted
            preload="auto"
            aria-hidden="true"
            className="w-full h-full object-cover object-center lg:object-right"
            style={{
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          />

          {/* Left feather gradient to guarantee 100% crisp legibility of the scroll ring */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-canvas via-canvas/90 via-45% to-transparent pointer-events-none" />

          {/* Top & bottom smooth section fades */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-canvas via-canvas/70 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-canvas via-canvas/70 to-transparent pointer-events-none" />
        </div>

        {/* Foreground Content: Scroll Ring firmly anchored to Left side to avoid overlapping video animation */}
        <div className="relative z-20 w-full h-full px-4 sm:px-8 lg:px-12 xl:px-16 flex items-center justify-start pointer-events-none">
          {/* Left Column: Pure Curved Scroll Ring with Static "YOU CAN" in place of blue dot */}
          <div className="h-full w-full max-w-[480px] sm:max-w-[530px] lg:max-w-[570px] flex items-center justify-start min-w-0 pointer-events-auto">
            <WheelCarousel
              items={FEATURES}
              prefix={staticPrefix}
              progress={rotation}
              mode="system"
              showMarker={false}
              edgeFade={true}
              edgeFadeSize={30}
              visibleItems={7}
              photoWidth={0}
              showPhoto={false}
              background="transparent"
              textColor="rgba(15, 23, 42, 0.4)"
              selectedColor="#0f0f11"
              loop={false}
              radius={260}
              spacing={14}
              apexInset="125px"
              markerGap={12}
              contentWidth={570}
              itemClassName="!text-[clamp(0.95rem,1.65vw,1.38rem)] font-semibold tracking-[-0.015em]"
              className="h-full w-full !justify-start !bg-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Description;
