"use client";

import React, { useEffect, useRef, useState } from "react";

const CHARSET =
  " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-:./";

export interface SplitFlapChronographProps {
  /** Target display string (padded/truncated to `digits`) */
  value?: string;
  /** Number of flap modules */
  digits?: number;
  /** Flap width */
  flapWidth?: number;
  /** Flap height */
  flapHeight?: number;
  /** Inertia: ms base per flap step */
  stepMs?: number;
  /** Extra ms variance for mechanical stagger */
  staggerMs?: number;
  className?: string;
  onSettle?: () => void;
}

function normalize(value: string, digits: number) {
  const up = value.toUpperCase().slice(0, digits);
  return up.padEnd(digits, " ");
}

function FlapModule({
  target,
  stepMs,
  delay,
  width,
  height,
}: {
  target: string;
  stepMs: number;
  delay: number;
  width: number;
  height: number;
}) {
  const [char, setChar] = useState(" ");
  const [flipping, setFlipping] = useState(false);
  const [nextChar, setNextChar] = useState(" ");
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const goal = CHARSET.indexOf(target);
    const targetIdx = goal < 0 ? 0 : goal;

    const tick = () => {
      if (idxRef.current === targetIdx) {
        setFlipping(false);
        return;
      }
      const next = (idxRef.current + 1) % CHARSET.length;
      setNextChar(CHARSET[next]);
      setFlipping(true);

      // Half-flip then commit (inertia feel)
      const half = stepMs * (0.45 + Math.random() * 0.25);
      timerRef.current = setTimeout(() => {
        idxRef.current = next;
        setChar(CHARSET[next]);
        setFlipping(false);
        const coast = stepMs * (0.35 + Math.random() * 0.4);
        timerRef.current = setTimeout(tick, coast);
      }, half);
    };

    timerRef.current = setTimeout(tick, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [target, stepMs, delay]);

  const halfH = height / 2;

  return (
    <div
      className="relative select-none"
      style={{ width, height, perspective: 600 }}
      aria-label={char}
    >
      {/* Static bottom half of current */}
      <div
        className="absolute overflow-hidden bg-neutral-900 border border-neutral-700"
        style={{ left: 0, right: 0, top: halfH, height: halfH }}
      >
        <div
          className="flex items-end justify-center text-neutral-100 font-bold"
          style={{
            height: height,
            marginTop: -halfH,
            fontSize: height * 0.55,
            fontFamily: "ui-monospace, monospace",
            lineHeight: 1,
            paddingBottom: height * 0.12,
          }}
        >
          {char}
        </div>
      </div>

      {/* Static top half of current (or flipping away) */}
      <div
        className="absolute overflow-hidden bg-neutral-800 border border-neutral-700 origin-bottom"
        style={{
          left: 0,
          right: 0,
          top: 0,
          height: halfH,
          transform: flipping ? "rotateX(-90deg)" : "rotateX(0deg)",
          transition: flipping ? `transform ${stepMs * 0.45}ms cubic-bezier(0.4,0.0,0.6,1)` : "none",
          backfaceVisibility: "hidden",
          zIndex: 2,
        }}
      >
        <div
          className="flex items-start justify-center text-neutral-100 font-bold"
          style={{
            height: height,
            fontSize: height * 0.55,
            fontFamily: "ui-monospace, monospace",
            lineHeight: 1,
            paddingTop: height * 0.12,
          }}
        >
          {char}
        </div>
      </div>

      {/* Incoming top half of next */}
      {flipping && (
        <div
          className="absolute overflow-hidden bg-neutral-800 border border-neutral-700 origin-top"
          style={{
            left: 0,
            right: 0,
            top: 0,
            height: halfH,
            transform: "rotateX(90deg)",
            animation: `splitflap-in ${stepMs * 0.45}ms cubic-bezier(0.2,0.8,0.2,1) forwards`,
            zIndex: 3,
          }}
        >
          <div
            className="flex items-start justify-center text-neutral-100 font-bold"
            style={{
              height: height,
              fontSize: height * 0.55,
              fontFamily: "ui-monospace, monospace",
              lineHeight: 1,
              paddingTop: height * 0.12,
            }}
          >
            {nextChar}
          </div>
        </div>
      )}

      {/* Center seam */}
      <div
        className="absolute left-0 right-0 bg-black pointer-events-none z-10"
        style={{ top: halfH - 1, height: 2 }}
      />
    </div>
  );
}

export function SplitFlapChronograph({
  value = "DEPART 14:30",
  digits = 12,
  flapWidth = 36,
  flapHeight = 52,
  stepMs = 55,
  staggerMs = 40,
  className = "",
  onSettle,
}: SplitFlapChronographProps) {
  const text = normalize(value, digits);
  const settleRef = useRef(onSettle);
  settleRef.current = onSettle;

  useEffect(() => {
    const maxSteps = CHARSET.length;
    const t = setTimeout(
      () => settleRef.current?.(),
      digits * staggerMs + maxSteps * stepMs * 1.4
    );
    return () => clearTimeout(t);
  }, [text, digits, staggerMs, stepMs]);

  return (
    <div className={`inline-flex flex-col gap-3 ${className}`}>
      <style>{`
        @keyframes splitflap-in {
          from { transform: rotateX(90deg); }
          to { transform: rotateX(0deg); }
        }
      `}</style>
      <div
        className="inline-flex gap-1 p-3 bg-neutral-950 border border-neutral-700"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {text.split("").map((ch, i) => (
          <FlapModule
            key={`${i}-${text}`}
            target={ch}
            stepMs={stepMs}
            delay={i * staggerMs}
            width={flapWidth}
            height={flapHeight}
          />
        ))}
      </div>
    </div>
  );
}

export default SplitFlapChronograph;
