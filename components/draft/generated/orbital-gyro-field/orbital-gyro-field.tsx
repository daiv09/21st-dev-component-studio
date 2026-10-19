"use client";

/**
 * OrbitalGyroField — a three-axis mechanical gyroscope rendered in pure CSS 3D.
 * DRAG anywhere to tilt the gimbal mount · WHEEL to throttle rotor speed ·
 * CLICK the core to reverse polarity. Springs carry all the weight.
 */

import React, { useCallback, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

interface RingConfig {
  size: number;
  ticks: number;
  tiltX: number;
  tiltY: number;
  degPerSec: number;
  color: string;
  glow: string;
}

const RINGS: RingConfig[] = [
  {
    size: 360,
    ticks: 72,
    tiltX: 68,
    tiltY: 0,
    degPerSec: 42,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.45)",
  },
  {
    size: 256,
    ticks: 56,
    tiltX: 90,
    tiltY: 26,
    degPerSec: -68,
    color: "#a3e635",
    glow: "rgba(163,230,53,0.4)",
  },
  {
    size: 168,
    ticks: 36,
    tiltX: 60,
    tiltY: -38,
    degPerSec: 96,
    color: "#fafafa",
    glow: "rgba(250,250,250,0.35)",
  },
];

// Deterministic star dust — no Math.random in render, SSR-safe.
function starField(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    left: (i * 137.508 + 7) % 100,
    top: (i * 61.803 + 13) % 100,
    size: 1 + (i % 3),
    opacity: 0.08 + ((i * 7) % 10) / 42,
  }));
}
const STARS = starField(46);

export function OrbitalGyroField() {
  const [isDragging, setIsDragging] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [ripple, setRipple] = useState(0);

  const dirRef = useRef(1);
  const draggingRef = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const angleRefs = useRef<number[]>([0, 0, 0]);

  // Rotor angles — written every frame, never re-rendering React.
  const spin0 = useMotionValue(0);
  const spin1 = useMotionValue(0);
  const spin2 = useMotionValue(0);
  const spins = [spin0, spin1, spin2];

  // Throttle: wheel-driven target with spring smoothing.
  const throttleTarget = useMotionValue(1);
  const throttle = useSpring(throttleTarget, { stiffness: 120, damping: 22 });

  // Gimbal mount pose.
  const rotXTarget = useMotionValue(-12);
  const rotYTarget = useMotionValue(18);
  const rotX = useSpring(rotXTarget, { stiffness: 130, damping: 19 });
  const rotY = useSpring(rotYTarget, { stiffness: 130, damping: 19 });

  const outerRpm = useTransform(
    throttle,
    (v: number) => `${String(Math.round((Math.abs(RINGS[0].degPerSec) * v) / 6)).padStart(2, "0")}`
  );
  const innerRpm = useTransform(
    throttle,
    (v: number) => `${String(Math.round((Math.abs(RINGS[1].degPerSec) * v) / 6)).padStart(2, "0")}`
  );
  const rotorRpm = useTransform(
    throttle,
    (v: number) => `${String(Math.round((Math.abs(RINGS[2].degPerSec) * v) / 6)).padStart(2, "0")}`
  );
  const rpmTexts = [outerRpm, innerRpm, rotorRpm];
  const throttleText = useTransform(throttle, (v: number) =>
    `${Math.round(v * 100)}`.padStart(3, "0")
  );

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    const th = throttle.get();
    for (let i = 0; i < RINGS.length; i++) {
      angleRefs.current[i] += RINGS[i].degPerSec * th * dirRef.current * dt;
      spins[i].set(angleRefs.current[i] % 360);
    }
  });

  // Wheel needs a non-passive listener so the page never scrolls.
  const stageRef = useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = throttleTarget.get() * (e.deltaY < 0 ? 1.12 : 0.89);
      throttleTarget.set(Math.min(2.6, Math.max(0.15, next)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [throttleTarget]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      rotXTarget.set(Math.min(34, Math.max(-34, rotXTarget.get() - dy * 0.22)));
      rotYTarget.set(Math.min(40, Math.max(-40, rotYTarget.get() + dx * 0.22)));
    },
    [rotXTarget, rotYTarget]
  );

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    setIsDragging(false);
  }, []);

  const reversePolarity = useCallback(() => {
    dirRef.current *= -1;
    setReversed(dirRef.current < 0);
    setRipple((n) => n + 1);
  }, []);

  return (
    <div
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`relative h-screen w-full overflow-hidden bg-[#060606] select-none touch-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* Star dust */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-neutral-400"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* Vignette via inset shadow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 220px 60px rgba(0,0,0,0.9)" }}
        aria-hidden="true"
      />

      {/* Corner brackets */}
      <Corner pos="top-5 left-5" edges="border-t border-l" />
      <Corner pos="top-5 right-5" edges="border-t border-r" />
      <Corner pos="bottom-5 left-5" edges="border-b border-l" />
      <Corner pos="bottom-5 right-5" edges="border-b border-r" />

      {/* Title block */}
      <div className="absolute top-8 left-10 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-200 uppercase">
          Orbital Gyro Field
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          GYRO-77 · Three-Axis Stabilizer · Mk II
        </p>
      </div>

      {/* Hint block */}
      <div className="absolute top-8 right-10 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — Tilt Mount
          <br />
          Wheel — Throttle
          <br />
          Click Core — Reverse
        </p>
      </div>

      {/* Assembly */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotateZ: [0, 1.2, 0, -1.2, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ perspective: 1400 }}
          className="relative"
        >
          <motion.div
            style={{
              rotateX: rotX,
              rotateY: rotY,
              transformStyle: "preserve-3d",
              width: 480,
              height: 480,
            }}
            className="relative flex items-center justify-center"
          >
            {RINGS.map((cfg, i) => (
              <GyroRing
                key={i}
                cfg={cfg}
                spin={spins[i]}
                satellite={i < 2}
              />
            ))}

            {/* Hub */}
            <button
              onClick={reversePolarity}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute w-24 h-24 rounded-full bg-neutral-900 border border-neutral-700 shadow-[0_14px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] flex items-center justify-center cursor-pointer z-20 hover:border-amber-500/60 transition-colors"
              style={{ transform: "translateZ(30px)" }}
              aria-label="Reverse rotor polarity"
            >
              {/* Spinning reticle */}
              <motion.div
                style={{ rotate: spin2 }}
                className="absolute inset-2 rounded-full"
              >
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-neutral-500" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-neutral-500" />
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-3 bg-neutral-500" />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-3 bg-neutral-500" />
              </motion.div>
              <motion.span
                animate={{
                  scale: reversed ? [1, 1.25, 1] : [1, 1.1, 1],
                  backgroundColor: reversed ? "#ef4444" : "#f59e0b",
                }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-3 h-3 rounded-full"
                style={{ boxShadow: "0 0 12px rgba(245,158,11,0.8)" }}
              />
            </button>

            {/* Polarity ripple */}
            {ripple > 0 && (
              <motion.span
                key={ripple}
                initial={{ scale: 0.35, opacity: 0.75 }}
                animate={{ scale: 3.4, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-28 h-28 rounded-full border-2 border-amber-400 pointer-events-none"
                aria-hidden="true"
              />
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Instrument readout strip */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex items-end gap-9 pointer-events-none">
        <Readout label="Throttle">
          <motion.span className="font-mono text-xl text-neutral-100 tabular-nums">
            {throttleText}
          </motion.span>
          <span className="font-mono text-[10px] text-neutral-500 ml-0.5">%</span>
        </Readout>
        <Readout label="Polarity">
          <span
            className={`font-mono text-xl tabular-nums ${
              reversed ? "text-red-500" : "text-amber-400"
            }`}
          >
            {reversed ? "REV" : "FWD"}
          </span>
        </Readout>
        {(["Outer", "Inner", "Rotor"] as const).map((name, i) => (
          <Readout key={name} label={`${name} RPM`}>
            <motion.span
              className={`font-mono text-xl tabular-nums ${
                i === 0 ? "text-amber-400" : i === 1 ? "text-lime-400" : "text-neutral-100"
              }`}
            >
              {rpmTexts[i]}
            </motion.span>
          </Readout>
        ))}
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <div className="flex items-baseline">{children}</div>
    </div>
  );
}

function GyroRing({
  cfg,
  spin,
  satellite,
}: {
  cfg: RingConfig;
  spin: MotionValue<number>;
  satellite: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: cfg.size,
        height: cfg.size,
        marginLeft: -cfg.size / 2,
        marginTop: -cfg.size / 2,
        transformStyle: "preserve-3d",
        transform: `rotateX(${cfg.tiltX}deg) rotateY(${cfg.tiltY}deg)`,
      }}
    >
      <motion.div
        style={{ rotate: spin, transformStyle: "preserve-3d" }}
        className="absolute inset-0"
      >
        {/* Rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${cfg.color}`,
            opacity: 0.55,
            boxShadow: `inset 0 0 24px ${cfg.glow}`,
          }}
        />
        {/* Tick marks travelling with rotation */}
        {Array.from({ length: cfg.ticks }, (_, t) => {
          const major = t % 6 === 0;
          return (
            <div
              key={t}
              className="absolute inset-0"
              style={{ transform: `rotate(${(360 / cfg.ticks) * t}deg)` }}
            >
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: major ? 2.5 : 1,
                  height: major ? 13 : 7,
                  backgroundColor: cfg.color,
                  opacity: major ? 0.95 : 0.4,
                }}
              />
            </div>
          );
        })}
        {/* Satellites riding the rim */}
        {satellite && (
          <>
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 11,
                height: 11,
                backgroundColor: cfg.color,
                boxShadow: `0 0 14px 3px ${cfg.glow}`,
              }}
            />
            <span
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rounded-full bg-neutral-400"
              style={{ width: 5, height: 5, opacity: 0.8 }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}

function Corner({ pos, edges }: { pos: string; edges: string }) {
  return (
    <span
      className={`absolute ${pos} ${edges} border-neutral-800 w-9 h-9 pointer-events-none`}
      aria-hidden="true"
    />
  );
}

export default OrbitalGyroField;
