"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion, type MotionValue } from "framer-motion";
import { useTheme } from "next-themes";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export interface WheelCarouselItem {
  label: string;
  image?: string;
  imageAlt?: string;
}

export type WheelCarouselMode = "system" | "light" | "dark" | "custom";

export interface WheelCarouselProps {
  items?: (WheelCarouselItem | string)[];
  mode?: WheelCarouselMode;
  photoSide?: "left" | "right";
  photoWidth?: number;
  showPhoto?: boolean;
  hidePhoto?: boolean;
  photoAspect?: "3/4" | "1/1" | "4/3" | "3/2";
  contentWidth?: number | string;
  gap?: number;
  photoRadius?: number;
  crossfadeDuration?: number;
  radius?: number;
  spacing?: number;
  visibleItems?: number;
  apexInset?: number | string;
  textColor?: string;
  selectedColor?: string;
  showMarker?: boolean;
  markerColor?: string;
  markerSize?: number;
  markerGap?: number;
  background?: string;
  panelColor?: string;
  scrollSpeed?: number;
  dragSpeed?: number;
  snap?: boolean;
  momentum?: boolean;
  appear?: boolean;
  edgeFade?: boolean;
  edgeFadeSize?: number;
  initialIndex?: number;
  activeIndex?: number;
  targetIndex?: number;
  scrollTriggered?: boolean;
  loop?: boolean;
  prefix?: React.ReactNode;
  progress?: MotionValue<number>;
  dial?: boolean;
  onActiveChange?: (item: WheelCarouselItem, index: number) => void;
  className?: string;
  photoClassName?: string;
  itemClassName?: string;
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

const wheelCarouselDefaultItems: WheelCarouselItem[] = [
  { label: "Halcyon Fields", image: unsplash("1520529890308-f503006340b4") },
  { label: "Meridian House", image: unsplash("1483366774565-c783b9f70e2c") },
  { label: "Norlight Pavilion", image: unsplash("1496865534669-25ec2a3a0fd3") },
  { label: "Aperture Studio", image: unsplash("1549791084-5f78368b208b") },
  { label: "Solene Tower", image: unsplash("1534094830444-3a1e21f7e3e7") },
  { label: "Verdant Mile", image: unsplash("1622396481322-3b83d186701b") },
  { label: "Cobalt Works", image: unsplash("1602128110234-2d11c0aaadfe") },
  { label: "Lumen Atrium", image: unsplash("1522404419647-18cb51cc5c7a") },
  { label: "Marlowe Residence", image: unsplash("1576831371356-d6e9411ae501") },
  { label: "Ostara Gallery", image: unsplash("1738844153732-a485f0e78382") },
  { label: "Quill & Stone", image: unsplash("1548248823-ce16a73b6d49") },
  { label: "Everest Loft", image: unsplash("1665779736808-047a6bbf43a0") },
  { label: "Sable Courtyard", image: unsplash("1543067361-9bf996edf6ff") },
  { label: "Ridgeline Retreat", image: unsplash("1592274951725-1688461e2019") },
  { label: "Aurelia Plaza", image: unsplash("1599669846660-945c5c775181") },
  { label: "Northwind Cabin", image: unsplash("1491406213019-05b162a72c20") },
  { label: "Onyx Terrace", image: unsplash("1611570885483-095b1b449aa3") },
  { label: "Palladium Hall", image: unsplash("1564566698730-9903b9e4a08c") },
  { label: "Cirrus Offices", image: unsplash("1676144844767-b25cb5e6c896") },
  { label: "Bramble Cottage", image: unsplash("1522743791393-522312deeebf") },
  { label: "Vellum Library", image: unsplash("1628270680011-41792b21de87") },
  { label: "Halden Bridge", image: unsplash("1478979464727-af7d24e18554") },
  { label: "Ember & Ash", image: unsplash("1586073054612-fdd6537fc6d4") },
  { label: "Slate Meridian", image: unsplash("1567505477286-9c7269119db7") },
];

const aspectRatios = {
  "3/4": "3 / 4",
  "1/1": "1 / 1",
  "4/3": "4 / 3",
  "3/2": "3 / 2",
} as const;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function shortestOffset(index: number, rotation: number, length: number, loop: boolean = true) {
  let offset = index - rotation;
  if (!loop) return offset;
  while (offset > length / 2) offset -= length;
  while (offset < -length / 2) offset += length;
  return offset;
}

export function WheelCarousel({
  items = wheelCarouselDefaultItems,
  mode = "system",
  photoSide = "left",
  photoWidth = 24,
  showPhoto = true,
  hidePhoto = false,
  photoAspect = "3/4",
  contentWidth = 900,
  gap = 0,
  photoRadius = 14,
  crossfadeDuration = 0.5,
  radius = 320,
  spacing = 14,
  visibleItems = 7,
  apexInset = 34,
  textColor = "rgba(180, 90, 20, 0.45)",
  selectedColor = "rgb(180, 84, 30)",
  showMarker = true,
  markerColor = "rgb(232, 121, 46)",
  markerSize = 16,
  markerGap = 20,
  background = "rgb(255, 246, 236)",
  panelColor,
  scrollSpeed = 0.008,
  dragSpeed = 0.02,
  snap = true,
  momentum = true,
  appear = true,
  edgeFade = true,
  edgeFadeSize = 30,
  initialIndex = 0,
  activeIndex,
  targetIndex,
  scrollTriggered = false,
  loop = true,
  prefix,
  progress,
  dial = false,
  onActiveChange,
  className,
  photoClassName,
  itemClassName,
}: WheelCarouselProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const instanceId = useId();
  const { resolvedTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);
  const resolvedMode =
    mode === "system"
      ? themeReady && resolvedTheme === "dark"
        ? "dark"
        : "light"
      : mode;
  const carouselItems: WheelCarouselItem[] = useMemo(() => {
    const raw = items && items.length > 0 ? items : wheelCarouselDefaultItems;
    return raw.map((item) => (typeof item === "string" ? { label: item } : item));
  }, [items]);
  const itemCount = carouselItems.length;
  const startingIndex = loop ? wrapIndex(activeIndex ?? initialIndex, itemCount) : Math.max(0, Math.min(itemCount - 1, activeIndex ?? initialIndex));
  const [rotation, setRotation] = useState(startingIndex);
  const [selectedIndex, setSelectedIndex] = useState(startingIndex);
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(startingIndex);
  const selectedRef = useRef(startingIndex);
  const appliedActiveIndexRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const dragOriginRef = useRef({ y: 0, rotation: startingIndex });
  const previousDragRotationRef = useRef(startingIndex);
  const frameRef = useRef<number | null>(null);
  const scrollTriggerRanRef = useRef(false);

  useEffect(() => setThemeReady(true), []);

  useEffect(() => {
    const normalizedIndex = loop ? wrapIndex(selectedRef.current, itemCount) : Math.max(0, Math.min(itemCount - 1, selectedRef.current));

    if (normalizedIndex === selectedRef.current) return;

    selectedRef.current = normalizedIndex;
    rotationRef.current = normalizedIndex;
    setSelectedIndex(normalizedIndex);
    setRotation(normalizedIndex);
  }, [itemCount, loop]);

  const palette = useMemo(() => {
    const isDark = resolvedMode === "dark";
    const bg =
      background !== "rgb(255, 246, 236)"
        ? background
        : isDark
        ? "#000000"
        : "#ffffff";

    const hasCustomText = textColor !== "rgba(180, 90, 20, 0.45)";
    const hasCustomSelected = selectedColor !== "rgb(180, 84, 30)";
    const hasCustomMarker = markerColor !== "rgb(232, 121, 46)";

    // When background is transparent on this light canvas site, default to readable dark text
    const treatAsDark = isDark && bg !== "transparent";

    if (treatAsDark) {
      return {
        background: bg,
        text: hasCustomText ? textColor : "rgba(255, 255, 255, 0.5)",
        selected: hasCustomSelected ? selectedColor : "#ffffff",
        marker: hasCustomMarker ? markerColor : "#2c6bff",
        panel: panelColor ?? "#141414",
      };
    }
    return {
      background: bg,
      text: hasCustomText ? textColor : "rgba(15, 23, 42, 0.35)",
      selected: hasCustomSelected ? selectedColor : "#0f0f11",
      marker: hasCustomMarker ? markerColor : "#0066cc",
      panel: panelColor ?? "#ededed",
    };
  }, [
    background,
    markerColor,
    panelColor,
    resolvedMode,
    selectedColor,
    textColor,
  ]);

  const commitRotation = useCallback(
    (nextRotation: number) => {
      const clampedRotation = loop
        ? nextRotation
        : Math.max(0, Math.min(itemCount - 1, nextRotation));

      // Skip micro-jitter under 0.0001 to keep renders clean
      if (Math.abs(clampedRotation - rotationRef.current) < 0.0001 && clampedRotation === rotationRef.current) {
        return;
      }

      rotationRef.current = clampedRotation;
      setRotation(clampedRotation);
      const nextIndex = loop
        ? wrapIndex(Math.round(clampedRotation), itemCount)
        : Math.max(0, Math.min(itemCount - 1, Math.round(clampedRotation)));
      if (nextIndex !== selectedRef.current) {
        selectedRef.current = nextIndex;
        setSelectedIndex(nextIndex);
        onActiveChange?.(carouselItems[nextIndex]!, nextIndex);
      }
    },
    [carouselItems, itemCount, loop, onActiveChange],
  );

  const commitRotationRef = useRef(commitRotation);
  commitRotationRef.current = commitRotation;

  const isControlledProgress = progress !== undefined;

  // Sync rotation continuously from external progress MotionValue
  useEffect(() => {
    if (!progress) return;

    const handleProgress = (val: number) => {
      const targetVal = reduceMotion ? Math.round(val) : val;
      commitRotation(targetVal);
    };

    handleProgress(progress.get());
    const unsubscribe = progress.on("change", handleProgress);
    return () => unsubscribe();
  }, [progress, commitRotation, reduceMotion]);

  // ScrollTrigger: play ONCE when scrolled into view, do not repeat continuously
  useEffect(() => {
    if (!scrollTriggered || !stageRef.current) return;

    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const startIdx = initialIndex ?? 0;
    const destIdx = targetIndex !== undefined ? targetIndex : 2;

    const trigger = ScrollTrigger.create({
      trigger: stageRef.current,
      start: "top 80%",
      once: true,
      onEnter: () => {
        if (scrollTriggerRanRef.current) return;
        scrollTriggerRanRef.current = true;
        const anim = { val: startIdx };
        gsap.to(anim, {
          val: destIdx,
          duration: 2.2,
          ease: "power2.out",
          onUpdate: () => {
            commitRotationRef.current(anim.val);
          },
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [scrollTriggered, targetIndex, initialIndex]);

  const runAnimation = useCallback(() => {
    if (frameRef.current !== null) return;

    const tick = () => {
      let keepAnimating = false;

      if (!draggingRef.current && Math.abs(velocityRef.current) > 0.0008) {
        commitRotation(rotationRef.current + velocityRef.current);
        velocityRef.current *=
          momentum && !reduceMotion ? (snap ? 0.9 : 0.94) : 0.8;
        keepAnimating = true;
      } else if (!draggingRef.current && snap) {
        velocityRef.current = 0;
        const target = Math.round(rotationRef.current);
        const delta = target - rotationRef.current;
        if (Math.abs(delta) > 0.001 && !reduceMotion) {
          commitRotation(rotationRef.current + delta * 0.22);
          keepAnimating = true;
        } else {
          commitRotation(target);
        }
      } else if (!draggingRef.current) {
        velocityRef.current = 0;
      }

      if (keepAnimating) frameRef.current = requestAnimationFrame(tick);
      else frameRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [commitRotation, momentum, reduceMotion, snap]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  useEffect(() => {
    if (isControlledProgress) return;
    const stage = stageRef.current;
    if (!stage) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      const delta = event.deltaY * scrollSpeed;
      commitRotation(rotationRef.current + delta);
      velocityRef.current = delta * 0.2;
      runAnimation();
    };

    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, [commitRotation, runAnimation, scrollSpeed, isControlledProgress]);

  useEffect(() => {
    if (activeIndex === undefined) return;
    const controlledIndex = loop ? wrapIndex(activeIndex, itemCount) : Math.max(0, Math.min(itemCount - 1, activeIndex));
    if (appliedActiveIndexRef.current === controlledIndex) return;
    appliedActiveIndexRef.current = controlledIndex;
    const currentIndex = loop ? wrapIndex(Math.round(rotationRef.current), itemCount) : Math.round(rotationRef.current);
    let delta = controlledIndex - currentIndex;
    if (loop) {
      if (delta > itemCount / 2) delta -= itemCount;
      if (delta < -itemCount / 2) delta += itemCount;
    }
    selectedRef.current = controlledIndex;
    setSelectedIndex(controlledIndex);
    commitRotationRef.current(rotationRef.current + delta);
  }, [activeIndex, itemCount, loop]);

  const moveBy = (amount: number) => {
    velocityRef.current = 0;
    commitRotation(rotationRef.current + amount);
    runAnimation();
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    draggingRef.current = true;
    setIsDragging(true);
    velocityRef.current = 0;
    dragOriginRef.current = { y: event.clientY, rotation: rotationRef.current };
    previousDragRotationRef.current = rotationRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const distance = event.clientY - dragOriginRef.current.y;
    const nextRotation = dragOriginRef.current.rotation - distance * dragSpeed;
    velocityRef.current = nextRotation - previousDragRotationRef.current;
    previousDragRotationRef.current = nextRotation;
    commitRotation(nextRotation);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    runAnimation();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      moveBy(1);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      moveBy(-1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      velocityRef.current = 0;
      commitRotation(rotationRef.current - selectedIndex);
      runAnimation();
    }
    if (event.key === "End") {
      event.preventDefault();
      velocityRef.current = 0;
      const lastIndex = itemCount - 1;
      commitRotation(rotationRef.current + lastIndex - selectedIndex);
      runAnimation();
    }
  };

  const safeSelectedIndex = loop ? wrapIndex(selectedIndex, itemCount) : Math.max(0, Math.min(itemCount - 1, selectedIndex));
  const selectedItem = carouselItems[safeSelectedIndex] || carouselItems[0];
  const mask = edgeFade
    ? `linear-gradient(to bottom, transparent 0%, black ${edgeFadeSize}%, black ${100 - edgeFadeSize}%, transparent 100%)`
    : undefined;

  const showPhotos = showPhoto && !hidePhoto && photoWidth > 0;
  const apexStyle = typeof apexInset === "number" ? `${apexInset}%` : apexInset;

  return (
    <motion.div
      initial={appear && !reduceMotion ? { opacity: 0, y: 18 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex h-full min-h-[420px] w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ backgroundColor: palette.background }}
    >
      <div
        ref={stageRef}
        role="listbox"
        aria-label="Wheel carousel"
        aria-activedescendant={
          Math.abs(shortestOffset(safeSelectedIndex, rotation, itemCount, loop)) <=
          visibleItems + 1
            ? `${instanceId}-item-${safeSelectedIndex}`
            : undefined
        }
        tabIndex={0}
        className={cn(
          "flex h-full w-full select-none items-stretch overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current",
          !isControlledProgress && "touch-none",
          photoSide === "right" && "flex-row-reverse",
          isControlledProgress ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ maxWidth: contentWidth, gap }}
        onPointerDown={isControlledProgress ? undefined : handlePointerDown}
        onPointerMove={isControlledProgress ? undefined : handlePointerMove}
        onPointerUp={isControlledProgress ? undefined : handlePointerEnd}
        onPointerCancel={isControlledProgress ? undefined : handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {showPhotos && selectedItem?.image && (
          <div
            className="flex h-full shrink-0 items-center justify-center"
            style={{
              width: `${photoWidth}%`,
              backgroundColor: palette.background,
            }}
          >
            <div
              className={cn(
                "relative w-full max-h-full overflow-hidden",
                photoClassName,
              )}
              style={{
                aspectRatio: aspectRatios[photoAspect],
                borderRadius: photoRadius,
                backgroundColor: palette.panel,
              }}
            >
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={`${safeSelectedIndex}-${selectedItem.image}`}
                  src={selectedItem.image}
                  alt={selectedItem.imageAlt ?? selectedItem.label}
                  initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : crossfadeDuration }}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              </AnimatePresence>
            </div>
          </div>
        )}

        <div
          className="relative h-full min-w-0 flex-1 overflow-hidden"
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            perspective: dial ? "900px" : undefined,
            perspectiveOrigin: dial ? "left center" : undefined,
            transformStyle: dial ? "preserve-3d" : undefined,
          }}
        >
          {prefix ? (
            <div
              aria-hidden="true"
              className="absolute top-1/2 z-20 -translate-y-1/2 select-none pointer-events-none whitespace-nowrap"
              style={{
                right: `calc(100% - ${
                  apexInset === 0
                    ? showMarker
                      ? `calc(${markerSize}px + ${markerGap}px)`
                      : "0px"
                    : apexStyle
                } + ${markerGap}px)`,
              }}
            >
              {prefix}
            </div>
          ) : showMarker ? (
            <span
              aria-hidden="true"
              className="absolute top-1/2 z-10 -translate-y-1/2 rounded-full"
              style={{
                left: apexInset === 0 ? "0px" : `calc(${apexStyle} - ${markerGap}px)`,
                width: markerSize,
                height: markerSize,
                marginLeft: apexInset === 0 ? "0px" : -markerSize,
                backgroundColor: palette.marker,
              }}
            />
          ) : null}

          {carouselItems.map((item, index) => {
            const offset = shortestOffset(index, rotation, itemCount, loop);
            if (Math.abs(offset) > visibleItems + 1) return null;

            const angle = offset * spacing;
            const radians = (angle * Math.PI) / 180;
            const selected = Math.abs(offset) < 0.5;

            const leftPosition =
              apexInset === 0
                ? showMarker
                  ? `calc(${markerSize}px + ${markerGap}px)`
                  : "0px"
                : apexStyle;

            if (dial) {
              const y = Math.sin(radians) * radius;
              const z = Math.cos(radians) * radius - radius;
              const rotateX = -angle * 0.72;
              const dist = Math.abs(offset);
              const opacity = Math.max(0, 1 - dist * 0.24);
              const scale = Math.max(0.72, 1 - dist * 0.05);

              const renderItemLabel = () => {
                if (typeof item.label === "string") {
                  const match = item.label.match(/^(you can\s+)(.*)$/i);
                  if (match) {
                    return (
                      <span>
                        <span className="font-normal opacity-65">{match[1]}</span>
                        <span className={selected ? "font-bold" : "font-medium"}>{match[2]}</span>
                      </span>
                    );
                  }
                }
                return item.label;
              };

              return (
                <div
                  id={`${instanceId}-item-${index}`}
                  key={`${item.label}-${index}`}
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    "pointer-events-none absolute top-1/2 origin-left whitespace-nowrap text-[clamp(1.15rem,2.2vw,1.9rem)] leading-none tracking-[-0.02em]",
                    selected ? "font-extrabold" : "font-semibold",
                    itemClassName,
                  )}
                  style={{
                    left: leftPosition,
                    color: selected ? palette.selected : palette.text,
                    opacity,
                    transform: `translate3d(0px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) translateY(-50%) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    willChange: "transform, opacity",
                    WebkitFontSmoothing: "antialiased",
                    transition: "color 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {renderItemLabel()}.
                </div>
              );
            }

            const x = -radius * (1 - Math.cos(radians));
            const y = radius * Math.sin(radians);
            const distance = Math.min(Math.abs(offset) / visibleItems, 1);
            const opacity = Math.max(0, Math.cos((distance * Math.PI) / 2));
            const scale = 1 - Math.min(Math.abs(offset) * 0.04, 0.45);

            const renderItemLabel = () => {
              if (typeof item.label === "string") {
                const match = item.label.match(/^(you can\s+)(.*)$/i);
                if (match) {
                  return (
                    <span>
                      <span className="font-normal opacity-65">{match[1]}</span>
                      <span className={selected ? "font-bold" : "font-medium"}>{match[2]}</span>
                    </span>
                  );
                }
              }
              return item.label;
            };

            return (
              <div
                id={`${instanceId}-item-${index}`}
                key={`${item.label}-${index}`}
                role="option"
                aria-selected={selected}
                className={cn(
                  "pointer-events-none absolute top-1/2 origin-left whitespace-nowrap text-[clamp(1rem,2.4vw,1.625rem)] font-medium leading-none tracking-[-0.01em]",
                  itemClassName,
                )}
                style={{
                  left: leftPosition,
                  color: selected ? palette.selected : palette.text,
                  opacity,
                  transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0px) translateY(-50%) rotate(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  WebkitFontSmoothing: "antialiased",
                  transition: "color 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {renderItemLabel()}
              </div>
            );
          })}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {selectedItem.label}, item {safeSelectedIndex + 1} of {itemCount}
      </span>
    </motion.div>
  );
}

export default WheelCarousel;
