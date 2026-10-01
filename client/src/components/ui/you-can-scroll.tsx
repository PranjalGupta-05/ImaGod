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

const ITEM_HEIGHT = 90;            // px per slot in the wheel
const VISIBLE_ITEMS = 7;           // total visible slots (3 above + active + 3 below)
const CENTER_INDEX = 3;            // which slot is the "active" center (0-based)
const RADIUS = 320;                // 3D cylinder radius in px

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
        const opacity = Math.max(0, 1 - dist * 0.3);
        const scale = Math.max(0.55, 1 - dist * 0.12);

        // Apply transforms
        gsap.set(item, {
          y: y,
          z: z,
          rotateX: -angle * 0.7,
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
          } else if (dist < 1.5) {
            textEl.style.color = "#5a5a62";
            textEl.style.fontWeight = "700";
          } else {
            textEl.style.color = "#b0b0ba";
            textEl.style.fontWeight = "600";
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
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

        {/* Top & bottom seamless fade masks */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-canvas via-canvas/90 to-transparent z-10 pointer-events-none" />

        {/* Static "YOU CAN" prefix */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full max-w-5xl px-6 pointer-events-none z-20">
          <span
            className="text-ink select-none whitespace-nowrap uppercase tracking-[-0.03em]"
            style={{
              fontFamily: "'Clash Display', 'Cabinet Grotesk', 'Syne', sans-serif",
              fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1,
              marginRight: "0.35em",
            }}
          >
            YOU CAN
          </span>

          {/* 3D Wheel Container */}
          <div
            ref={wheelRef}
            className="relative"
            style={{
              height: `${ITEM_HEIGHT}px`,
              perspective: "1000px",
              perspectiveOrigin: "center center",
              transformStyle: "preserve-3d",
              width: "max(52vw, 320px)",
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
                  className="wheel-feature-text select-none whitespace-nowrap transition-colors duration-200 uppercase tracking-[-0.03em]"
                  style={{
                    fontFamily: "'Clash Display', 'Cabinet Grotesk', 'Syne', sans-serif",
                    fontSize: "clamp(2.2rem, 5.5vw, 4rem)",
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
    </section>
  );
}
