// Built using Hyperiux Vault & tailored for Imagify Design System
import React, { useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import SplitText from "gsap/dist/SplitText";
import { useGSAP } from "@gsap/react";
import { ReactLenis } from "lenis/react";
import sample_img_1 from "@/assets/sample_img_1.png";

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

// 6-Stage Imagify Pipeline explaining how Imagify delivers the best result
export const defaultTopJourneyData = [
  {
    id: "phase-01",
    step: "01",
    phase: "Input & Parsing",
    title: "Semantic Intent Engine",
    content:
      "Deconstructs natural human prompts into spatial composition, lighting angles, and stylistic descriptors. Automatically enhances vague text with professional camera focal lengths for zero guesswork.",
    tags: ["Natural Language NLP", "Style Guidance", "Zero Prompt Hacking"],
  },
  {
    id: "phase-03",
    step: "03",
    phase: "Latent Synthesis",
    title: "Coherent Physical Lighting",
    content:
      "Trained on millions of studio-grade visual assets to eliminate common AI distortions. Renders anatomically accurate hands, lifelike skin reflections, and volumetric light diffusion effortlessly.",
    tags: ["Volumetric Depth", "True Anatomy Weights", "Physical Coherence"],
  },
  {
    id: "phase-05",
    step: "05",
    phase: "Smart Segmentation",
    title: "Sub-Pixel Vision Matting",
    content:
      "Integrated neural segmentation isolates foreground subjects down to single flyaway hair strands. Instantly eliminate or replace backgrounds with clean transparent alpha PNGs in one click.",
    tags: ["Sub-Pixel Hair Matting", "Alpha PNG Export", "Instant Cutouts"],
  },
];

export const defaultBottomJourneyData = [
  {
    id: "phase-02",
    step: "02",
    phase: "Real-Time Compute",
    title: "Sub-3s GPU Inference",
    content:
      "Powered by dedicated multi-GPU tensor clusters, our diffusion engine synthesizes imagery in under 3 seconds. Real-time latent sampling gives you instant feedback, collapsing iteration time from minutes to milliseconds.",
    tags: ["Sub-3s Synthesis", "Multi-GPU Clusters", "Zero Queue"],
  },
  {
    id: "phase-04",
    step: "04",
    phase: "Detail Refinement",
    title: "4K Neural Super-Resolution",
    content:
      "Proprietary super-resolution models reconstruct micro-textures — skin pores, fine fabrics, specular reflections, and crisp typography — delivering razor-sharp 4K masters with zero blur.",
    tags: ["4K Native Master", "Micro-Texture Detail", "Zero Artifacting"],
  },
  {
    id: "phase-06",
    step: "06",
    phase: "Production Handoff",
    title: "Lossless Studio Export",
    content:
      "Instant commercial download in lossless 16-bit PNG and optimized WebP. Every generation includes 100% full commercial usage rights, ready for client delivery, print, and advertising.",
    tags: ["Commercial Rights", "16-bit Lossless PNG", "Cloud Sync"],
  },
];

export default function Timeline({
  title = "Creation Pipeline",
  periodLabel = "Phase 01 — 06",
  textColor = "#1d1d1f",
  mutedTextColor = "#6e6e73",
  activeColor = "#0066cc",
  backgroundColor = "#f5f5f7",
  imageUrl = sample_img_1,
  imageAlt = "Imagify Neural Synthesis Preview",
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
      const slidePercent = isTablet ? -60 : isMobile ? -58 : -64;
      const lineWidth = isTablet ? "78%" : isMobile ? "68%" : "96%";
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
        gsap.set(`.title-${item.id}`, { opacity: 0, y: 30 });
        gsap.set(`.description-${item.id}`, { opacity: 0, y: 20 });
        gsap.set(`.badge-${item.id}`, { opacity: 0, y: 15 });
        gsap.set(`.tags-${item.id}`, { opacity: 0, y: 10 });
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
              [14, 25],
              [24, 35],
              [35, 46],
              [46, 57],
              [57, 68],
              [68, 79],
            ]
          : window.innerWidth >= 642 && window.innerWidth <= 1024
          ? [
              [12, 24],
              [22, 34],
              [33, 45],
              [44, 56],
              [55, 67],
              [66, 78],
            ]
          : [
              [6, 22],
              [18, 34],
              [30, 46],
              [42, 58],
              [54, 70],
              [66, 82],
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

  const mutedTextStyle = {
    color: mutedTextColor,
  };

  const content = (
    <section
      ref={sectionRef}
      id="product-timeline"
      className="h-[220vw] max-[1025px]:h-[420vh] max-md:h-[450vh] w-full relative max-[1025px]:py-[7%] select-none overflow-x-clip"
      style={sectionStyle}
    >
      <div className="h-screen w-full flex items-center sticky top-0 pt-[3%] overflow-hidden max-[1025px]:block max-[1025px]:top-[8%] max-md:top-[4%]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[36vw] w-[260vw] items-center gap-[4vw] px-[4vw] max-[1025px]:h-[74vh] max-[1025px]:w-[440vw] max-[1025px]:flex-col max-[1025px]:items-start max-[1025px]:gap-[2vw] max-[1025px]:px-[5vw] max-md:h-[84vh] max-md:w-[860vw] max-md:px-[6vw]"
        >
          {/* Left: Product Showcase Card */}
          <div className="relative h-full w-[28vw] shrink-0 overflow-hidden rounded-[18px] bg-white border border-[#e0e0e0] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-3 flex flex-col justify-between max-[1025px]:h-[42vw] max-[1025px]:w-[18%] max-[1025px]:rounded-[14px] max-md:h-[68vw] max-md:w-[86vw] max-md:rounded-[16px]">
            <div className="relative h-[78%] w-full overflow-hidden rounded-[12px] group">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-ink flex items-center gap-1.5 shadow-sm border border-black/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Imagify Core v2.4
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-[11px] uppercase tracking-wider text-white/70 font-semibold mb-0.5">
                  Live Studio Pipeline
                </p>
                <p className="text-[13px] font-medium leading-snug line-clamp-2">
                  "Ultra-realistic cinematic lighting with micro-texture fidelity"
                </p>
              </div>
            </div>

            <div className="pt-2 px-1 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Neural Flow
                </span>
                <h3 className="text-[15px] font-semibold text-ink leading-tight">
                  Studio Precision Engine
                </h3>
              </div>
              <span className="text-[12px] font-mono text-[#6e6e73] bg-[#f5f5f7] px-2 py-1 rounded-md border border-[#e0e0e0]">
                4K HDR
              </span>
            </div>
          </div>

          {/* Right: Horizontal Timeline Track with Alternating Milestones */}
          <div className="relative h-full w-full max-[1025px]:h-[52%]">
            {/* Center Timeline Track Rail */}
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
            <div className="flex h-1/2 w-full items-end justify-start gap-[1vw] pb-[2vw]">
              {/* Header block on the line */}
              <div className="h-full w-[22%] pt-[1vw] max-md:h-fit max-md:pt-[4vw] shrink-0 flex flex-col justify-end">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
                  How It Works
                </span>
                <h2 className="w-[90%] text-[2.6vw] font-semibold tracking-tight leading-[1.02] max-[1025px]:w-[85%] max-[1025px]:text-[6vw] max-md:text-[7.5vw] text-ink">
                  {title}
                </h2>
              </div>

              {/* Top Milestones */}
              <div className="w-full flex h-full gap-x-[14vw] max-md:gap-x-[36vw] items-end">
                {topItems.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    className="relative h-full w-[28vw] px-[2.5vw] max-[1025px]:w-[48vw] max-[1025px]:px-[4vw] max-md:flex max-md:w-[68vw] max-md:flex-col max-md:px-[6vw] flex flex-col justify-end"
                  >
                    {/* Connecting Vertical Line & Node Dot */}
                    <div className="w-full absolute left-0 bottom-0 top-0 h-full pointer-events-none">
                      <div
                        className={`size-[1vw] max-md:size-[2.4vw] max-[1025px]:size-[1.8vw] -translate-x-1/2 relative aspect-square rounded-full jd-${item.id} ring-4 ring-primary/20`}
                        style={activeStyle}
                      />
                      <div
                        className={`h-[94%] w-[2px] origin-bottom rounded-full jl-${item.id}`}
                        style={activeStyle}
                      />
                    </div>

                    {/* Step Card Content */}
                    <div className="space-y-[0.6vw] max-[1025px]:space-y-[1vw] max-md:space-y-[1.5vw] pb-[1vw]">
                      <div
                        className={`badge-${item.id} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/[0.08] text-primary text-[11px] font-semibold tracking-wide uppercase`}
                      >
                        <span>Phase {item.step}</span>
                        <span className="text-primary/40">/</span>
                        <span className="text-[#6e6e73]">{item.phase}</span>
                      </div>

                      <h4
                        className={`title-${item.id} text-[1.8vw] font-semibold text-ink leading-tight max-[1025px]:text-[4.2vw] max-md:text-[5.4vw]`}
                      >
                        {item.title}
                      </h4>

                      <p
                        className={`description-${item.id} w-[95%] text-[1.1vw] leading-[1.4] max-[1025px]:w-[80%] max-[1025px]:text-[2.6vw] max-md:w-[95%] max-md:text-[3.8vw]`}
                        style={mutedTextStyle}
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
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-[#e0e0e0] text-[#48484a]"
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
            <div className="h-1/2 flex items-start justify-start w-full pt-[2vw]">
              {/* Bottom period / subcopy block */}
              <div className="w-[22%] pt-[1vw] max-md:pt-[4vw] max-md:w-[28%] h-full max-[1025px]:pt-[3vw] shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block mb-1">
                  Architecture
                </span>
                <p
                  className="text-[1.3vw] font-medium leading-tight max-[1025px]:text-[2.4vw] max-md:text-[3.4vw]"
                  style={mutedTextStyle}
                >
                  {periodLabel}
                </p>
                <p className="text-[11px] text-[#86868b] mt-2 max-w-[180px] leading-snug hidden md:block">
                  Scroll horizontally to discover how our multi-stage pipeline guarantees best-in-class results.
                </p>
              </div>

              {/* Bottom Milestones */}
              <div className="w-full flex h-full gap-x-[16vw] ml-[4vw] max-md:gap-x-[36vw] max-[1025px]:ml-0 max-md:ml-[4vw] items-start">
                {bottomItems.map((item) => (
                  <div
                    key={`bottom-${item.id}`}
                    className="relative h-full w-[28vw] px-[2.5vw] max-[1025px]:flex max-[1025px]:w-[48vw] max-[1025px]:flex-col max-[1025px]:justify-start max-[1025px]:px-[4vw] max-md:w-[68vw] max-md:px-[6vw] flex flex-col justify-start"
                  >
                    {/* Connecting Vertical Line & Node Dot */}
                    <div className="w-full absolute left-0 top-0 h-full pointer-events-none">
                      <div
                        className={`h-[94%] origin-top w-[2px] rounded-full max-md:h-full jl-${item.id}`}
                        style={activeStyle}
                      />
                      <div
                        className={`size-[1vw] max-md:size-[2.4vw] max-[1025px]:size-[1.8vw] -translate-x-1/2 relative aspect-square rounded-full jd-${item.id} ring-4 ring-primary/20`}
                        style={activeStyle}
                      />
                    </div>

                    {/* Step Card Content */}
                    <div className="space-y-[0.6vw] max-[1025px]:space-y-[1vw] max-md:space-y-[1.5vw] pt-[1vw]">
                      <div
                        className={`badge-${item.id} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/[0.08] text-primary text-[11px] font-semibold tracking-wide uppercase`}
                      >
                        <span>Phase {item.step}</span>
                        <span className="text-primary/40">/</span>
                        <span className="text-[#6e6e73]">{item.phase}</span>
                      </div>

                      <h4
                        className={`title-${item.id} text-[1.8vw] font-semibold text-ink leading-tight max-[1025px]:text-[4.2vw] max-md:text-[5.4vw]`}
                      >
                        {item.title}
                      </h4>

                      <p
                        className={`description-${item.id} w-[95%] text-[1.1vw] leading-[1.4] max-[1025px]:w-[80%] max-[1025px]:text-[2.6vw] max-md:w-[95%] max-md:text-[3.8vw]`}
                        style={mutedTextStyle}
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
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-[#e0e0e0] text-[#48484a]"
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
