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
}: GlassEffectProps) => {
  return (
    <div
      className={cn(
        "group/glass relative isolate overflow-hidden border border-glass-edge bg-glass shadow-glass",
        className,
      )}
      style={style}
      {...props}
    >
      {/* Background blur and refraction */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 backdrop-blur-md backdrop-saturate-125"
        style={{
          borderRadius: "inherit",
          filter: "url(#liquid-glass-distortion)",
        }}
      />

      {/* Translucent tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-glass-tint"
        style={{ borderRadius: "inherit" }}
      />

      {/* Directional light reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-glass-shine opacity-30 transition-opacity duration-300 group-hover/glass:opacity-60 motion-reduce:transition-none"
        style={{ borderRadius: "inherit" }}
      />

      {/* Crisp liquid edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 shadow-glass-inner"
        style={{ borderRadius: "inherit" }}
      />

      {/* Existing navbar content remains unchanged */}
      <div className={cn("relative z-30 h-full w-full", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export const GlassFilter = () => (
  <svg
    aria-hidden="true"
    width="0"
    height="0"
    className="pointer-events-none absolute"
    style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
  >
    <defs>
      <filter
        id="liquid-glass-distortion"
        x="-15%"
        y="-25%"
        width="130%"
        height="150%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.006 0.018"
          numOctaves="2"
          seed="8"
          result="noise"
        />

        <feGaussianBlur
          in="noise"
          stdDeviation="1.5"
          result="softNoise"
        />

        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="16"
          xChannelSelector="R"
          yChannelSelector="G"
          result="distorted"
        />

        <feGaussianBlur
          in="distorted"
          stdDeviation="0.25"
          result="softened"
        />

        <feComposite
          in="softened"
          in2="SourceGraphic"
          operator="over"
        />
      </filter>
    </defs>
  </svg>
);

export default GlassEffect;
