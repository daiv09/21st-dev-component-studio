// Built using Hyperiux Vault (Adaptive Split-Axis Edition)
"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

const IMG = {
  angle1: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=1000&auto=format&fit=crop",
  angle2: "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?q=80&w=1000&auto=format&fit=crop",
  angle3: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop",
  angle4: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop",
  angle5: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1000&auto=format&fit=crop",
  angle6: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop",
  angle7: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=1000&auto=format&fit=crop",
//   angle7: "https://images.unsplash.com/photo-1503376780353-8d664f9f77f9?q=80&w=1000&auto=format&fit=crop",
  angle8: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=1000&auto=format&fit=crop",
} as const;

const SCALE: Partial<Record<number, number>> = {
  1: 0.85,
  2: 0.75,
  3: 0.85,
  4: 0.75,
  5: 0.75,
  6: 0.85,
  7: 0.85,
  8: 0.65,
};
const s = (i: number) => SCALE[i] ?? 1;

const CARDS: StackSpreadCard[] = [
  {
    item: { src: IMG.angle1, alt: "Track angle 1" },
    portalOffset: { x: -48, y: -30 },
    portalRotate: -15,
    target: { x: -22, y: -36, rotate: -4, scale: s(8), w: 16, h: 21 },
    targetSm: { x: -22, y: -40 },
    z: 2,
  },
  {
    item: { src: IMG.angle2, alt: "Track angle 2" },
    portalOffset: { x: 48, y: -20 },
    portalRotate: 15,
    target: { x: 34, y: -32, rotate: 6, scale: s(7), w: 17, h: 30 },
    targetSm: { x: 22, y: -40 },
    z: 3,
  },
  {
    item: { src: IMG.angle3, alt: "Track angle 3" },
    portalOffset: { x: -45, y: -10 },
    portalRotate: -10,
    target: { x: -38, y: -4, rotate: -2, scale: s(6), w: 14, h: 30 },
    targetSm: { x: -22, y: -19 },
    z: 4,
  },
  {
    item: { src: IMG.angle4, alt: "Track angle 4" },
    portalOffset: { x: 45, y: 0 },
    portalRotate: 10,
    target: { x: 4, y: -34, rotate: 3, scale: s(5), w: 24, h: 28 },
    targetSm: { x: 22, y: -19 },
    z: 5,
  },
  {
    item: { src: IMG.angle5, alt: "Track angle 5" },
    portalOffset: { x: -42, y: 10 },
    portalRotate: -5,
    target: { x: 38, y: 8, rotate: -3, scale: s(4), w: 17, h: 30 },
    targetSm: { x: -22, y: 20 },
    z: 6,
  },
  {
    item: { src: IMG.angle6, alt: "Track angle 6" },
    portalOffset: { x: 42, y: 20 },
    portalRotate: 5,
    target: { x: -26, y: 36, rotate: 5, scale: s(3), w: 21, h: 24 },
    targetSm: { x: 22, y: 20 },
    z: 7,
  },
  {
    item: { src: IMG.angle7, alt: "Track angle 7" },
    portalOffset: { x: -40, y: 30 },
    portalRotate: -8,
    target: { x: 2, y: 38, rotate: -2, scale: s(2), w: 19, h: 25 },
    targetSm: { x: -22, y: 40 },
    z: 8,
  },
  {
    item: { src: IMG.angle8, alt: "Track angle 8" },
    portalOffset: { x: 40, y: 35 },
    portalRotate: 8,
    target: { x: 32, y: 36, rotate: 4, scale: s(1), w: 15, h: 19 },
    targetSm: { x: 22, y: 40 },
    z: 9,
  },
];

const SCATTER_START = 0.12;
const SCATTER_END = 0.85;
const PARALLAX_INTENSITY = 2.5;
const SPRING_CONFIG = { stiffness: 85, damping: 25, mass: 0.6 };
const PROGRESS_SPRING = { stiffness: 95, damping: 28, restDelta: 0.0001 };

const SUB_BEFORE = "Initiating sequential multi-angle track convergence.";
const SUB_AFTER = "Cinematic framing fully realized across spatial coordinates.";

function useResponsive() {
  const [r, setR] = useState(RESPONSIVE_DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const read = () => setR(mq.matches ? RESPONSIVE_SMALL : RESPONSIVE_DESKTOP);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return r;
}

const RESPONSIVE_DESKTOP = {
  scale: null as number | null,
  small: false,
  colX: null as number | null,
  card: null as { w: number; h: number } | null,
};

const RESPONSIVE_SMALL = {
  scale: 0.72,
  small: true,
  colX: 22,
  card: { w: 40, h: 20 },
};

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);

  useEffect(() => {
    if (!enabled) return;
    if (!active) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, enabled, rawX, rawY]);

  return { x, y };
}

export interface StackSpreadItem {
  src: string;
  alt?: string;
}

export interface StackSpreadTarget {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  w: number;
  h: number;
}

export interface StackSpreadCard {
  item: StackSpreadItem;
  target: StackSpreadTarget;
  targetSm?: { x: number; y: number };
  portalRotate?: number;
  portalOffset?: { x: number; y: number };
  z?: number;
}

function Card({
  card,
  progress,
  reduce,
  scaleMul,
  isSmall,
  colX,
  fixedCard,
  stackScale,
  cardRadius,
  pointer,
  index,
  total,
  isSpreadActive,
}: {
  card: StackSpreadCard;
  progress: MotionValue<number>;
  reduce: boolean | null;
  scaleMul: number | null;
  isSmall: boolean;
  colX: number | null;
  fixedCard: { w: number; h: number } | null;
  stackScale: number;
  cardRadius: number;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  index: number;
  total: number;
  isSpreadActive: boolean;
}) {
  const { item, target } = card;

  const flat = reduce === true;
  const portalRotate = flat ? 0 : card.portalRotate ?? 0;
  const portalOffset = card.portalOffset ?? { x: 0, y: 0 };
  const restScale = scaleMul ?? target.scale ?? 1;

  const sm = isSmall && card.targetSm ? card.targetSm : null;
  const endX = sm ? (colX != null ? Math.sign(sm.x) * colX : sm.x) : target.x;
  const endY = sm ? sm.y : target.y;
  const endRotate = flat || isSmall ? 0 : target.rotate;

  const depthFactor = 0.5 + (index / (total - 1 || 1)) * 0.7;

  const translate = useTransform(
    [progress, pointer.x, pointer.y],
    ([p, px, py]: number[]) => {
      const easeP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      const tx = portalOffset.x + (endX - portalOffset.x) * easeP;
      const ty = portalOffset.y + (endY - portalOffset.y) * easeP;
      
      const dx = tx - px * PARALLAX_INTENSITY * depthFactor * p;
      const dy = ty - py * PARALLAX_INTENSITY * depthFactor * p;
      return `calc(-50% + ${dx}vw) calc(-50% + ${dy}vh)`;
    }
  );

  const rotate = useTransform(progress, [0, 1], [portalRotate, endRotate]);
  const scale = useTransform(progress, [0, 1], [stackScale, restScale]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-transform cursor-pointer"
      style={{
        width: `${fixedCard ? fixedCard.w : target.w}vw`,
        height: `${fixedCard ? fixedCard.h : target.h}vh`,
        zIndex: card.z ?? 1,
        translate,
        rotate,
        scale,
      }}
      whileHover={
        isSpreadActive && !isSmall
          ? { scale: restScale * 1.05, y: -10, zIndex: 100, transition: { type: "spring", stiffness: 300, damping: 20 } }
          : undefined
      }
    >
      <div
        className="relative h-full w-full overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/10 transition-shadow duration-300 max-md:rounded-[4vw]"
        style={{ borderRadius: `${cardRadius}px` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 opacity-60 pointer-events-none z-10" />
        <img
          src={item.src}
          alt={item.alt ?? ""}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
      </div>
    </motion.div>
  );
}

interface StackSpreadStageProps {
  cards: StackSpreadCard[];
  scrollLength?: number;
  stackScale?: number;
  cardRadius?: number;
  textFadeStart?: number;
  showScrollHint?: boolean;
}

function StackSpreadStage({
  cards,
  scrollLength = 380,
  stackScale = 0.72,
  cardRadius = 12,
  textFadeStart = 0.28,
  showScrollHint = true,
}: StackSpreadStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scale: scaleMul, small: isSmall, colX, card: fixedCard } = useResponsive();

  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, PROGRESS_SPRING);

  const progress = useTransform(
    smoothProgress,
    [0, SCATTER_START, SCATTER_END, 1],
    [0, 0, 1, 1]
  );

  const [spread, setSpread] = useState(false);
  useMotionValueEvent(progress, "change", (p) => {
    setSpread((was) => (was ? p > 0.985 : p >= 0.999));
  });

  const parallaxEnabled = reduce !== true && !isSmall;
  const pointer = usePointerParallax(spread, parallaxEnabled);

  const noScale = reduce === true;
  
  // Before text animations (fade in early, fade out later)
  const beforeOpacity = useTransform(progress, [textFadeStart, textFadeStart + 0.2, 0.65, 0.75], [0, 1, 1, 0]);
  const beforeY = useTransform(progress, [textFadeStart, textFadeStart + 0.2], [20, 0]);

  // After text animations (fade in during final scatter phase)
  const afterOpacity = useTransform(progress, [0.68, 0.78], [0, 1]);
  const afterY = useTransform(progress, [0.68, 0.78], [20, 0]);

  const copyScale = useTransform(progress, [textFadeStart, 0.88], [0.9, 1]);
  const hintOpacity = useTransform(progress, [0, SCATTER_START], [1, 0]);

  return (
    <section
      ref={wrapRef}
      className="relative w-full select-none bg-[#faf9f6] dark:bg-[#0a0a0c] transition-colors duration-500"
      style={{ height: `${scrollLength}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient background glow optimized for light and dark themes */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25 dark:opacity-15 blur-[120px]">
          <div className="w-[50vw] h-[50vw] rounded-full bg-stone-300 dark:bg-indigo-900" />
        </div>

        {/* Dynamic Before / After Text Container */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-[5] flex flex-col items-center justify-center px-6 text-center max-md:px-8"
          style={{
            scale: noScale ? 1 : copyScale,
          }}
        >
          {/* BEFORE TEXT */}
          <motion.div
            className="absolute flex flex-col items-center max-w-2xl px-4"
            style={{ opacity: beforeOpacity, y: beforeY }}
          >
            <h2 className="w-full whitespace-pre-line text-[4.8vw] font-light tracking-tight text-zinc-900 dark:text-zinc-100 max-md:text-[10vw]">
              Portal <span className="font-normal opacity-40">Axis</span> Convergence.
            </h2>
            <p className="mt-[1.4vw] w-full max-w-[40ch] text-[1.1vw] font-light leading-relaxed tracking-wide text-zinc-600 dark:text-zinc-400 max-md:mt-3 max-md:text-[3.6vw]">
              {SUB_BEFORE}
            </p>
          </motion.div>

          {/* AFTER TEXT */}
          <motion.div
            className="absolute flex flex-col items-center max-w-2xl px-4"
            style={{ opacity: afterOpacity, y: afterY }}
          >
            <h2 className="w-full whitespace-pre-line text-[4.8vw] font-light tracking-tight text-zinc-900 dark:text-zinc-100 max-md:text-[10vw]">
              Cinematic <span className="font-normal text-indigo-500 dark:text-indigo-400">Perspective</span>.
            </h2>
            <p className="mt-[1.4vw] w-full max-w-[40ch] text-[1.1vw] font-light leading-relaxed tracking-wide text-zinc-600 dark:text-zinc-400 max-md:mt-3 max-md:text-[3.6vw]">
              {SUB_AFTER}
            </p>
          </motion.div>
        </motion.div>

        {/* Cards Stage */}
        <div className="absolute inset-0 z-10">
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              progress={progress}
              reduce={reduce}
              scaleMul={scaleMul}
              isSmall={isSmall}
              colX={colX}
              fixedCard={fixedCard}
              stackScale={stackScale}
              cardRadius={cardRadius}
              pointer={pointer}
              index={i}
              total={cards.length}
              isSpreadActive={spread}
            />
          ))}
        </div>

        {/* Scroll Instruction Hint */}
        {showScrollHint && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-[4vh] z-20 flex flex-col items-center gap-[0.8vh] text-[0.75vw] font-medium uppercase tracking-[0.25em] text-zinc-900 dark:text-zinc-100 max-md:bottom-6 max-md:gap-1 max-md:text-[2.6vw]"
            style={{ opacity: hintOpacity }}
          >
            <span className="opacity-60">Scroll to Converge</span>
            <div className="w-[1px] h-6 bg-current opacity-20 relative overflow-hidden">
              <motion.div 
                className="absolute inset-x-0 top-0 bg-current h-full"
                animate={{ y: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export interface SplitAxisProps {
  scrollLength?: number;
  stackScale?: number;
  cardRadius?: number;
  textFadeStart?: number;
  showScrollHint?: boolean;
}

export default function SplitAxisConvergence({
  scrollLength = 380,
  stackScale = 0.72,
  cardRadius = 12,
  textFadeStart = 0.28,
  showScrollHint = true,
}: SplitAxisProps = {}) {
  return (
    <StackSpreadStage
      cards={CARDS}
      scrollLength={scrollLength}
      stackScale={stackScale}
      cardRadius={cardRadius}
      textFadeStart={textFadeStart}
      showScrollHint={showScrollHint}
    />
  );
}