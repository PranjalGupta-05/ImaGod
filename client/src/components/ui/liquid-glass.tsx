import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  contentClassName?: string;
}

export const GlassEffect = ({
  children,
  className,
  contentClassName,
  style,
  ...props
}: GlassEffectProps) => (
  <div
    className={cn("relative overflow-hidden border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)]", className)}
    style={{
      ...style,
    }}
    {...props}
  >
    {/* Distortion + blur layer */}
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        borderRadius: "inherit",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        filter: "url(#glass-distortion)",
        isolation: "isolate",
      }}
    />
    {/* Tint layer */}
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{ borderRadius: "inherit", background: "rgba(255,255,255,0.4)" }}
    />
    {/* Edge highlight layer */}
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{
        borderRadius: "inherit",
        boxShadow:
          "inset 1.5px 1.5px 1px 0 rgba(255,255,255,0.7), inset -1px -1px 1px 0 rgba(255,255,255,0.25)",
      }}
    />
    {/* Content Container: propagates full dimensions and flex rules */}
    <div className={cn("relative z-30 w-full h-full", contentClassName)}>{children}</div>
  </div>
);

export const GlassFilter = () => (
  <svg
    aria-hidden="true"
    width="0"
    height="0"
    style={{ position: "absolute", pointerEvents: "none", opacity: 0 }}
  >
    <filter
      id="glass-distortion"
      x="0%"
      y="0%"
      width="100%"
      height="100%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.002 0.008"
        numOctaves="1"
        seed="17"
        result="turbulence"
      />
      <feGaussianBlur in="turbulence" stdDeviation="2.5" result="softMap" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="softMap"
        scale="24"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
);
