// Built using Hyperiux Vault & tailored for Imagify Design System
import React, { useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import SplitText from "gsap/dist/SplitText";
import { useGSAP } from "@gsap/react";
import { ReactLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger, SplitText);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback) {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );
}

// 6-Stage Imagify Pipeline — concise, high-impact scannable copy
export const defaultTopJourneyData = [
  {
    id: "phase-01",
    step: "01",
    phase: "Input & Parsing",
    title: "Intent Parsing",
    content:
      "Translates natural prompts into spatial lighting, composition, and studio focal lengths.",
    tags: ["Natural Language", "Auto-Composition"],
  },
  {
    id: "phase-03",
    step: "03",
    phase: "Latent Synthesis",
    title: "Physical Lighting",
    content:
      "Trained on studio masters for realistic skin tones, true anatomy, and volumetric diffusion.",
    tags: ["True Anatomy", "Volumetric Depth"],
  },
  {
    id: "phase-05",
    step: "05",
    phase: "Segmentation",
    title: "Sub-Pixel Matting",
    content:
      "Single-click foreground isolation down to flyaway hair for instant alpha cutout PNGs.",
    tags: ["Sub-Pixel Mask", "1-Click Cutout"],
  },
];

export const defaultBottomJourneyData = [
  {
    id: "phase-02",
    step: "02",
    phase: "Real-Time Compute",
    title: "Sub-3s Inference",
    content:
      "Dedicated multi-GPU tensor clusters deliver real-time diffusion in under 3 seconds.",
    tags: ["< 3s Latency", "Tensor Clusters"],
  },
  {
    id: "phase-04",
    step: "04",
    phase: "Refinement",
    title: "4K Super-Resolution",
    content:
      "Reconstructs micro-textures, fabric weaves, and crisp typography with zero blur.",
    tags: ["4K Native", "Micro-Detail"],
  },
  {
    id: "phase-06",
    step: "06",
    phase: "Studio Handoff",
    title: "Lossless Export",
    content:
      "Instant download in 16-bit lossless PNG and WebP with full commercial usage rights.",
    tags: ["16-Bit PNG", "Full Rights"],
  },
];

export default function Timeline({
  title = "Creation Pipeline",
  periodLabel = "Phase 01 — 06",
  textColor = "#0f0f11",
  mutedTextColor = "#6e6e73",
  activeColor = "#0066cc",
  backgroundColor = "#fafafc",
  duration,
  scrollDuration = 1.2,
  topItems = defaultTopJourneyData,
  bottomItems = defaultBottomJourneyData,
}) {
  const sectionRef = useRef(null);
  const wholeSliderRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const animationDuration = duration ?? scrollDuration;
  const normalizedDuration = Math.max(0.2, animationDuration);

  const allJourneyItems = [
    topItems[0],
    bottomItems[0],
    topItems[1],
    bottomItems[1],
    topItems[2],
    bottomItems[2],
  ].filter(Boolean);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const isTablet = window.innerWidth >= 642 && window.innerWidth <= 1024;
      const isMobile = window.innerWidth < 642;
      const slidePercent = isTablet ? -58 : isMobile ? -54 : -52;
      const lineWidth = isTablet ? "82%" : isMobile ? "72%" : "96%";
      const lineStart = isTablet ? "top 10%" : isMobile ? "top top" : "top top";
      const slideEnd = isMobile ? "82% 50%" : "92% bottom";
      const lineEnd = isMobile ? "80% 50%" : isTablet ? "90% bottom" : "92% bottom";

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "2% top",
          end: slideEnd,
          scrub: true,
        },
        defaults: {
          ease: "none",
        },
      });

      tl.fromTo(wholeSliderRef.current, { xPercent: 0 }, { xPercent: slidePercent });

      if (reducedMotion) {
        gsap.set(".journey-line", { width: lineWidth });
        return;
      }

      gsap.to(".journey-line", {
        width: lineWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: lineStart,
          end: lineEnd,
          scrub: true,
        },
      });
    },
    { dependencies: [reducedMotion], scope: sectionRef }
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const items = allJourneyItems;
      const isMobileViewport = window.innerWidth < 642;
      const isTabletViewport = window.innerWidth >= 642 && window.innerWidth <= 1024;

      if (reducedMotion) {
        items.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 1 });
          gsap.set(`.jd-${item.id}`, { scale: 1 });
          gsap.set(`.title-${item.id}`, { opacity: 1, clearProps: "transform" });
          gsap.set(`.description-${item.id}`, { opacity: 1, clearProps: "transform" });
          gsap.set(`.badge-${item.id}`, { opacity: 1 });
          gsap.set(`.tags-${item.id}`, { opacity: 1 });
        });
        return;
      }

      items.forEach((item) => {
        gsap.set(`.jl-${item.id}`, {
          scaleY: 0,
          transformOrigin: "bottom bottom",
        });
        gsap.set(`.jd-${item.id}`, { scale: 0 });
        gsap.set(`.title-${item.id}`, { opacity: 0, y: 24 });
        gsap.set(`.description-${item.id}`, { opacity: 0, y: 16 });
        gsap.set(`.badge-${item.id}`, { opacity: 0, y: 12 });
        gsap.set(`.tags-${item.id}`, { opacity: 0, y: 8 });
      });

      const createItemTimeline = (item, startPos, endPos) => {
        const lineSelector = `.jl-${item.id}`;
        const dotSelector = `.jd-${item.id}`;
        const isTop = topItems.some((topItem) => topItem.id === item.id);

        if (!isTop) {
          gsap.set(lineSelector, { transformOrigin: "top top" });
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: `${startPos}% ${isMobileViewport ? "38%" : isTabletViewport ? "top" : "20%"}`,
            end: `${endPos}% ${isMobileViewport ? "50%" : isTabletViewport ? "40%" : "60%"}`,
            scrub: true,
          },
        });

        timeline
          .to(lineSelector, {
            scaleY: 1,
            duration: normalizedDuration * 0.4,
          })
          .to(
            dotSelector,
            {
              scale: 1,
              duration: normalizedDuration * 0.4,
            },
            "<"
          )
          .to(
            `.badge-${item.id}`,
            {
              opacity: 1,
              y: 0,
              duration: normalizedDuration * 0.4,
              ease: "power2.out",
            },
            "-=0.2"
          )
          .to(
            `.title-${item.id}`,
            {
              opacity: 1,
              y: 0,
              duration: normalizedDuration * 0.5,
              ease: "power2.out",
            },
            "-=0.3"
          )
          .to(
            `.description-${item.id}`,
            {
              opacity: 1,
              y: 0,
              duration: normalizedDuration * 0.5,
              ease: "power2.out",
            },
            "-=0.3"
          )
          .to(
            `.tags-${item.id}`,
            {
              opacity: 1,
              y: 0,
              duration: normalizedDuration * 0.4,
              ease: "power2.out",
            },
            "-=0.2"
          );

        return timeline;
      };

      const positions =
        window.innerWidth < 642
          ? [
              [10, 22],
              [20, 32],
              [31, 43],
              [42, 54],
              [53, 65],
              [64, 76],
            ]
          : window.innerWidth >= 642 && window.innerWidth <= 1024
          ? [
              [8, 20],
              [18, 30],
              [29, 41],
              [40, 52],
              [51, 63],
              [62, 74],
            ]
          : [
              [4, 18],
              [14, 28],
              [25, 39],
              [36, 50],
              [47, 61],
              [58, 72],
            ];

      items.forEach((item, index) => {
        if (positions[index]) {
          const [startPos, endPos] = positions[index];
          createItemTimeline(item, startPos, endPos);
        }
      });

      const handleResize = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion], scope: sectionRef }
  );

  const sectionStyle = {
    color: textColor,
    backgroundColor,
  };

  const activeStyle = {
    backgroundColor: activeColor,
  };

  const activeBorderStyle = {
    borderColor: activeColor,
  };

  const content = (
    <section
      ref={sectionRef}
      id="product-timeline"
      className="h-[210vw] max-[1025px]:h-[420vh] max-md:h-[450vh] w-full relative max-[1025px]:py-[7%] select-none overflow-x-clip"
      style={sectionStyle}
    >
      <div className="h-screen w-full flex items-center sticky top-0 pt-[2%] overflow-hidden max-[1025px]:block max-[1025px]:top-[8%] max-md:top-[4%]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[38vw] w-[215vw] items-center gap-[2vw] px-[3vw] max-[1025px]:h-[74vh] max-[1025px]:w-[380vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-[2vw] max-[1025px]:px-[5vw] max-md:h-[84vh] max-md:w-[700vw] max-md:px-[6vw]"
        >
          {/* Horizontal Timeline Track with Alternating Milestones */}
          <div className="relative h-full w-full max-[1025px]:h-[52%]">
            {/* Center Timeline Track Rail Background */}
            <div className="w-full absolute left-0 top-[49%] -translate-y-1/2 h-[2px] bg-neutral-200/90 rounded-full pointer-events-none" />

            {/* Center Timeline Track Active Scrub Rail */}
            <div className="w-full absolute left-0 top-[49%] -translate-y-1/2 flex items-center h-fit pointer-events-none z-10">
              <div
                className="h-[.9vw] w-[.9vw] shrink-0 rounded-full max-md:h-[2.2vw] max-md:w-[2.2vw] max-[1025px]:h-[1.6vw] max-[1025px]:w-[1.6vw] ring-4 ring-primary/20"
                style={activeStyle}
              />
              <div
                className="-mx-[.4vw] h-[2px] w-[0%] rounded-full journey-line max-md:-mx-[1.5vw] max-[1025px]:-mx-[1.125vw]"
                style={activeStyle}
              />
              <div
                className="h-[.9vw] w-[.9vw] shrink-0 rounded-full max-md:h-[2.2vw] max-md:w-[2.2vw] max-[1025px]:h-[1.6vw] max-[1025px]:w-[1.6vw] ring-4 ring-primary/20"
                style={activeStyle}
              />
            </div>

            {/* TOP ROW: Title + Odd Stages (01, 03, 05) */}
            <div className="flex h-1/2 w-full items-end justify-start gap-[1vw] pb-[2.5vw]">
              {/* Header block on the line */}
              <div className="h-full w-[20%] pt-[1vw] max-md:h-fit max-md:pt-[4vw] shrink-0 flex flex-col justify-end">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.08em] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  How It Works
                </span>
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: '-0.025em',
                    lineHeight: 1.08,
                    fontWeight: 700,
                  }}
                  className="w-[90%] text-[2.2vw] font-bold max-[1025px]:w-[85%] max-[1025px]:text-[4.6vw] max-md:text-[5.8vw] text-ink font-primary"
                >
                  Creation <span className="text-primary font-bold">Pipeline</span>
                </h2>
              </div>

              {/* Top Milestones */}
              <div className="w-full flex h-full gap-x-[12vw] max-md:gap-x-[32vw] items-end">
                {topItems.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[26vw] px-[1.5vw] max-[1025px]:w-[44vw] max-[1025px]:px-[3vw] max-md:flex max-md:w-[68vw] max-md:flex-col max-md:px-[4vw] flex flex-col justify-end"
                  >
                    {/* Connecting Vertical Line & Node Dot */}
                    <div className="w-full absolute left-0 bottom-0 top-0 h-full pointer-events-none">
                      <div
                        className={`size-[12px] max-md:size-[16px] max-[1025px]:size-[14px] -translate-x-1/2 relative aspect-square rounded-full jd-${item.id} ring-4 ring-primary/20 bg-white border-2 border-primary`}
                        style={activeBorderStyle}
                      />
                      <div
                        className={`h-[94%] w-[2px] origin-bottom rounded-full jl-${item.id}`}
                        style={activeStyle}
                      />
                    </div>

                    {/* Step Card Content */}
                    <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all duration-300 backdrop-blur-xs space-y-2 pb-[1vw]">
                      <div
                        className={`badge-${item.id} flex items-center justify-between`}
                      >
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/[0.08] text-primary text-[11px] font-semibold tracking-wide uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Phase {item.step}
                        </span>
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                          {item.phase}
                        </span>
                      </div>

                      <h4
                        className={`title-${item.id} text-[1.4vw] font-semibold text-ink leading-tight max-[1025px]:text-[3.4vw] max-md:text-[4.6vw] tracking-[-0.02em]`}
                      >
                        {item.title}
                      </h4>

                      <p
                        className={`description-${item.id} text-[0.95vw] leading-[1.45] max-[1025px]:text-[2.2vw] max-md:text-[3.4vw] text-neutral-500 font-normal`}
                      >
                        {item.content}
                      </p>

                      {item.tags && (
                        <div
                          className={`tags-${item.id} flex flex-wrap gap-1.5 pt-1`}
                        >
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-200/70 text-neutral-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM ROW: Subtitle/Period + Even Stages (02, 04, 06) */}
            <div className="h-1/2 flex items-start justify-start w-full pt-[2.5vw]">
              {/* Bottom period / subcopy block */}
              <div className="w-[20%] pt-[1vw] max-md:pt-[4vw] max-md:w-[28%] h-full max-[1025px]:pt-[3vw] shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86868b] block mb-1">
                  Architecture
                </span>
                <p className="text-[1.2vw] font-medium leading-tight max-[1025px]:text-[2.2vw] max-md:text-[3.2vw] text-neutral-800">
                  {periodLabel}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[12px] text-neutral-400">
                  <span>Scroll to explore</span>
                  <span className="text-[14px]">→</span>
                </div>
              </div>

              {/* Bottom Milestones */}
              <div className="w-full flex h-full gap-x-[14vw] ml-[3vw] max-md:gap-x-[32vw] max-[1025px]:ml-0 max-md:ml-[3vw] items-start">
                {bottomItems.map((item) => (
                  <div
                    key={`bottom-${item.id}`}
                    className="relative h-full w-[26vw] px-[1.5vw] max-[1025px]:flex max-[1025px]:w-[44vw] max-[1025px]:flex-col max-[1025px]:justify-start max-[1025px]:px-[3vw] max-md:w-[68vw] max-md:px-[4vw] flex flex-col justify-start"
                  >
                    {/* Connecting Vertical Line & Node Dot */}
                    <div className="w-full absolute left-0 top-0 h-full pointer-events-none">
                      <div
                        className={`h-[94%] origin-top w-[2px] rounded-full max-md:h-full jl-${item.id}`}
                        style={activeStyle}
                      />
                      <div
                        className={`size-[12px] max-md:size-[16px] max-[1025px]:size-[14px] -translate-x-1/2 relative aspect-square rounded-full jd-${item.id} ring-4 ring-primary/20 bg-white border-2 border-primary`}
                        style={activeBorderStyle}
                      />
                    </div>

                    {/* Step Card Content */}
                    <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-neutral-300 transition-all duration-300 backdrop-blur-xs space-y-2 pt-[1vw]">
                      <div
                        className={`badge-${item.id} flex items-center justify-between`}
                      >
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/[0.08] text-primary text-[11px] font-semibold tracking-wide uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Phase {item.step}
                        </span>
                        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                          {item.phase}
                        </span>
                      </div>

                      <h4
                        className={`title-${item.id} text-[1.4vw] font-semibold text-ink leading-tight max-[1025px]:text-[3.4vw] max-md:text-[4.6vw] tracking-[-0.02em]`}
                      >
                        {item.title}
                      </h4>

                      <p
                        className={`description-${item.id} text-[0.95vw] leading-[1.45] max-[1025px]:text-[2.2vw] max-md:text-[3.4vw] text-neutral-500 font-normal`}
                      >
                        {item.content}
                      </p>

                      {item.tags && (
                        <div
                          className={`tags-${item.id} flex flex-wrap gap-1.5 pt-1`}
                        >
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-50 border border-neutral-200/70 text-neutral-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <ReactLenis
      root
      options={{
        duration: reducedMotion
          ? Math.min(normalizedDuration, 0.6)
          : normalizedDuration,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: 1,
        wheelMultiplier: 1,
      }}
    >
      {content}
    </ReactLenis>
  );
}
