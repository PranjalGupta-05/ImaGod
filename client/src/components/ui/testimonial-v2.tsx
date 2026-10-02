import React from 'react';
import { motion } from "framer-motion";

// --- Types ---
export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
  stars?: number;
}

// --- Data tailored for Imagify & Creative Suite ---
export const testimonials: Testimonial[] = [
  {
    text: "ImaGod completely transformed our design workflow. The text-to-image synthesis produces studio-grade keyframes in seconds, saving us days of conceptual modeling.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Briana Patton",
    role: "Creative Director · Studio Pixel",
    stars: 5,
  },
  {
    text: "The background removal and edge-feathering are unparalleled. It captures fine hair and translucent glass without manual touchups. Best tool in our stack.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Bilal Ahmed",
    role: "Lead Product Designer",
    stars: 5,
  },
  {
    text: "The neural upscaler blew me away. We rescued low-res archival photography and scaled it up to 4K for physical exhibition prints without losing natural texture.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    name: "Saman Malik",
    role: "Visual Art Director",
    stars: 5,
  },
  {
    text: "We migrated our entire marketing asset generation pipeline to ImaGod. Fast turnaround, pristine lighting coherence, and an intuitive UI that requires zero training.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    name: "Omar Raza",
    role: "Head of Growth",
    stars: 5,
  },
  {
    text: "The unblur and facial restoration feature is pure magic. It rescued dozens of spontaneous event photos that had camera shake and brought them to publication sharpness.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    name: "Zainab Hussain",
    role: "Digital Media Producer",
    stars: 5,
  },
  {
    text: "Generative Fill is the smoothest implementation I've experienced. Expanding canvas boundaries and replacing background elements feels completely seamless.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
    name: "Aliza Khan",
    role: "Brand Identity Designer",
    stars: 5,
  },
  {
    text: "Our e-commerce product listings saw a 38% conversion boost after using ImaGod to create stylized lifestyle backdrops for our catalog.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    name: "Farhan Siddiqui",
    role: "E-Commerce Director",
    stars: 5,
  },
  {
    text: "Customer support is top notch, and the continuous generation speed makes live client presentations an absolute joy. Highly recommended for any agency.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    name: "Sana Sheikh",
    role: "Agency Founder · Forma",
    stars: 5,
  },
  {
    text: "From raw ideas to final 4K renders in minutes. ImaGod delivers the highest fidelity outputs among all generative platforms we have benchmarked.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    name: "Hassan Ali",
    role: "Principal 3D & Concept Artist",
    stars: 5,
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 16,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role, stars = 5 }, i) => (
                <motion.li 
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{ 
                    scale: 1.02,
                    y: -6,
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.06)",
                    transition: { type: "spring", stiffness: 400, damping: 20 }
                  }}
                  whileFocus={{ 
                    scale: 1.02,
                    y: -6,
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.06)",
                    transition: { type: "spring", stiffness: 400, damping: 20 }
                  }}
                  className="p-8 sm:p-9 rounded-3xl border border-neutral-200/80 shadow-md shadow-black/[0.03] max-w-sm w-full bg-white transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-blue-500/30" 
                >
                  <blockquote className="m-0 p-0 flex flex-col justify-between h-full">
                    <div>
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array(stars).fill(0).map((_, starIdx) => (
                          <svg key={starIdx} className="w-4 h-4 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      <p className="text-neutral-600 text-[15px] leading-relaxed font-normal m-0">
                        "{text}"
                      </p>
                    </div>

                    <footer className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-100">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-100 group-hover:ring-blue-500/30 transition-all duration-300 ease-in-out"
                        loading="lazy"
                      />
                      <div className="flex flex-col text-left">
                        <cite className="font-semibold not-italic tracking-tight text-[15px] leading-snug text-neutral-900">
                          {name}
                        </cite>
                        <span className="text-xs leading-tight tracking-tight text-neutral-500 mt-0.5">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

// --- Testimonial-v2 Section (Light Mode by default) ---
export default function TestimonialV2() {
  return (
    <section 
      aria-labelledby="testimonials-heading"
      className="bg-canvas py-20 sm:py-28 relative overflow-hidden select-none"
    >
      <div className="max-w-[1240px] px-4 sm:px-6 lg:px-8 z-10 mx-auto">
        
        {/* Header Stack */}
        <div className="flex flex-col items-center justify-center max-w-[640px] mx-auto mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100/80 border border-neutral-200/80 text-neutral-600 text-[11px] sm:text-xs font-medium tracking-[0.08em] uppercase mb-4 shadow-xs font-sans"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span>Community Voice · 03</span>
          </motion.div>

          <motion.h2 
            id="testimonials-heading" 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
            className="text-3xl sm:text-4xl lg:text-[46px] text-ink font-bold max-w-[760px] mx-auto font-primary text-center"
          >
            Loved by creators <span className="text-primary font-bold">worldwide</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mt-3.5 text-neutral-500 text-base sm:text-lg leading-relaxed max-w-lg font-normal font-sans"
          >
            See what designers, art directors, and creative studios accomplish with ImaGod.
          </motion.p>
        </div>

        {/* Scrolling Animated Multi-Column Grid */}
        <div 
          className="flex justify-center gap-6 mt-8 [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)] max-h-[680px] sm:max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={16} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={20} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={18} />
        </div>

      </div>
    </section>
  );
}
