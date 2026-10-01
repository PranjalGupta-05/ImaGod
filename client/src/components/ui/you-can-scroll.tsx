import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  "Generate Images from Text",
  "Remove Backgrounds Instantly",
  "Enhance Photos to 4K",
  "Unblur Faces & Motion",
  "Inpaint & Generative Fill",
  "Edit with AI Studio",
  "Upscale Any Resolution",
  "Create Cinematic Keyframes",
  "Batch Process at Scale",
];

const ITEM_HEIGHT = 58;            // refined px per slot in the wheel (scaled down from 90)
const VISIBLE_ITEMS = 7;           // total visible slots (3 above + active + 3 below)
const CENTER_INDEX = 3;            // which slot is the "active" center (0-based)
const RADIUS = 190;                // proportional 3D cylinder radius in px (scaled down from 320)

export default function WheelCarousel() {
  const sectionRef = useRef(null);
  const wheelRef = useRef(null);
  const progressRef = useRef({ value: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const wheel = wheelRef.current;
    if (!section || !wheel) return;

    const totalItems = FEATURES.length;
    const maxProgress = totalItems - 1;

    // Render function: positions each item on the 3D wheel based on progress
    const render = () => {
      const progress = progressRef.current.value;
      const items = wheel.querySelectorAll(".wheel-item");

      items.forEach((item, i) => {
        const offset = i - progress; // how far this item is from center
        const angle = offset * (360 / (VISIBLE_ITEMS * 2)); // degrees of rotation
        const radians = (angle * Math.PI) / 180;

        // Y position on the wheel arc
        const y = Math.sin(radians) * RADIUS;
        // Z depth
        const z = Math.cos(radians) * RADIUS - RADIUS;

        // Opacity and scale based on distance from center
        const dist = Math.abs(offset);
        const opacity = Math.max(0, 1 - dist * 0.28);
        const scale = Math.max(0.65, 1 - dist * 0.1);

        // Apply transforms
        gsap.set(item, {
          y: y,
          z: z,
          rotateX: -angle * 0.65,
          scale: scale,
          opacity: opacity,
          zIndex: Math.round((1 - dist) * 100),
        });

        // Style the active item differently
        const textEl = item.querySelector(".wheel-feature-text");
        if (textEl) {
          if (dist < 0.5) {
            textEl.style.color = "#0f0f11";
            textEl.style.fontWeight = "800";
            textEl.style.opacity = "1";
          } else if (dist < 1.5) {
            textEl.style.color = "#5a5a62";
            textEl.style.fontWeight = "600";
            textEl.style.opacity = "0.7";
          } else {
            textEl.style.color = "#a1a1aa";
            textEl.style.fontWeight = "500";
            textEl.style.opacity = "0.35";
          }
        }
      });
    };

    // Initial render
    render();

    // GSAP ScrollTrigger: scrub with lag for smooth inertia
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.1, // smooth lag / inertia effect
      onUpdate: (self) => {
        progressRef.current.value = self.progress * maxProgress;
        render();
      },
    });

    // Handle resize
    const onResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Section height: enough scroll distance for smooth transitions without drag
  const scrollHeight = FEATURES.length * 48; // vh units

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-canvas select-none"
      style={{ height: `${scrollHeight}vh` }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-start">
        {/* Subtle ambient glow on the left */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[260px] bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />

        {/* Top & bottom seamless fade masks */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />

        {/* Left-Aligned Container: occupies the left ~60%, leaving 40% space on the right side */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-start pointer-events-none">
          <div className="w-full max-w-[62%] lg:max-w-[58%] flex items-center justify-start">
            {/* Static "YOU CAN" prefix */}
            <span
              className="text-ink select-none whitespace-nowrap uppercase tracking-[-0.02em] shrink-0"
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "clamp(1.25rem, 2.5vw, 2.2rem)",
                fontWeight: 800,
                lineHeight: 1,
                marginRight: "0.4em",
              }}
            >
              YOU CAN
            </span>

            {/* 3D Wheel Container */}
            <div
              ref={wheelRef}
              className="relative flex-1 overflow-visible"
              style={{
                height: `${ITEM_HEIGHT}px`,
                perspective: "850px",
                perspectiveOrigin: "left center",
                transformStyle: "preserve-3d",
              }}
            >
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="wheel-item absolute left-0 top-0 w-full flex items-center"
                  style={{
                    height: `${ITEM_HEIGHT}px`,
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <span
                    className="wheel-feature-text select-none whitespace-nowrap transition-colors duration-200 uppercase tracking-[-0.02em]"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(1.25rem, 2.5vw, 2.2rem)",
                      lineHeight: 1,
                    }}
                  >
                    {feature}.
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
