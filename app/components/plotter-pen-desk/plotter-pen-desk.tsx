"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export interface PlotterPenDeskProps {
  /** Path to plot as SVG path commands in 0–100 space */
  pathD?: string;
  /** Feed rate (units/sec) */
  feedRate?: number;
  /** Pen-up travel speed multiplier */
  travelMult?: number;
  size?: number;
  running?: boolean;
  className?: string;
  onComplete?: () => void;
}

type Pt = { x: number; y: number; penDown: boolean };

function samplePath(d: string, size: number): Pt[] {
  // Simple polyline parser: M/L absolute in 0-100 mapped to size
  const pts: Pt[] = [];
  const tokens = d.trim().split(/[\s,]+/);
  let i = 0;
  let penDown = false;
  let x = 0;
  let y = 0;
  const map = (v: number) => (v / 100) * (size * 0.7) + size * 0.15;

  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === "M" || cmd === "m") {
      const nx = Number(tokens[i++]);
      const ny = Number(tokens[i++]);
      // pen-up travel
      if (pts.length) {
        const steps = 8;
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          pts.push({
            x: map(x + (nx - x) * t),
            y: map(y + (ny - y) * t),
            penDown: false,
          });
        }
      }
      x = nx;
      y = ny;
      penDown = true;
      pts.push({ x: map(x), y: map(y), penDown: true });
    } else if (cmd === "L" || cmd === "l") {
      const nx = Number(tokens[i++]);
      const ny = Number(tokens[i++]);
      const dist = Math.hypot(nx - x, ny - y);
      const steps = Math.max(2, Math.ceil(dist * 2));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        pts.push({
          x: map(x + (nx - x) * t),
          y: map(y + (ny - y) * t),
          penDown: true,
        });
      }
      x = nx;
      y = ny;
      penDown = true;
    } else if (cmd === "Z" || cmd === "z") {
      penDown = false;
    } else {
      // numeric continuation as L
      if (!Number.isNaN(Number(cmd))) {
        const nx = Number(cmd);
        const ny = Number(tokens[i++]);
        const dist = Math.hypot(nx - x, ny - y);
        const steps = Math.max(2, Math.ceil(dist * 2));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          pts.push({
            x: map(x + (nx - x) * t),
            y: map(y + (ny - y) * t),
            penDown,
          });
        }
        x = nx;
        y = ny;
      }
    }
  }
  return pts;
}

const DEFAULT_PATH =
  "M 20 30 L 80 30 L 80 70 L 20 70 Z M 35 45 L 50 60 L 65 40";

/**
 * AxiDraw-style gantry plotter with pen-up rapid travels (dashed) and pen-down ink.
 */
export function PlotterPenDesk({
  pathD = DEFAULT_PATH,
  feedRate = 80,
  travelMult = 2.2,
  size = 520,
  running = true,
  className = "",
  onComplete,
}: PlotterPenDeskProps) {
  const samples = useMemo(() => samplePath(pathD, size), [pathD, size]);
  const [index, setIndex] = useState(0);
  const [inkPath, setInkPath] = useState("");
  const [travelPath, setTravelPath] = useState("");
  const last = useRef(performance.now());
  const acc = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    setIndex(0);
    setInkPath("");
    setTravelPath("");
    acc.current = 0;
    done.current = false;
  }, [pathD, size]);

  useEffect(() => {
    if (!running || samples.length < 2) return;
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last.current) / 1000, 0.05);
      last.current = now;
      const cur = samples[Math.min(index, samples.length - 1)];
      const next = samples[Math.min(index + 1, samples.length - 1)];
      const dist = Math.hypot(next.x - cur.x, next.y - cur.y) || 1;
      const speed = (cur.penDown ? feedRate : feedRate * travelMult);
      acc.current += (speed * dt) / dist;

      if (acc.current >= 1 && index < samples.length - 1) {
        acc.current = 0;
        const p = samples[index + 1];
        const prev = samples[index];
        if (p.penDown && prev.penDown) {
          setInkPath((d) => (d ? `${d} L ${p.x} ${p.y}` : `M ${p.x} ${p.y}`));
        } else if (!p.penDown) {
          setTravelPath((d) =>
            d ? `${d} L ${p.x} ${p.y}` : `M ${prev.x} ${prev.y} L ${p.x} ${p.y}`
          );
        } else {
          setInkPath((d) => `${d} M ${p.x} ${p.y}`);
        }
        setIndex((i) => i + 1);
      } else if (index >= samples.length - 1 && !done.current) {
        done.current = true;
        onComplete?.();
      }
      raf = requestAnimationFrame(tick);
    };
    last.current = performance.now();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, samples, index, feedRate, travelMult, onComplete]);

  const head = samples[Math.min(index, samples.length - 1)] || { x: size * 0.15, y: size * 0.15, penDown: false };
  const railY = 36;
  const railX = 36;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{
        background: "#0a0a0a",
        border: "1px solid #2a2a2a",
        boxShadow: "8px 8px 0 #000",
      }}
    >
      {/* Desk */}
      <rect x={size * 0.12} y={size * 0.12} width={size * 0.76} height={size * 0.76} fill="#e8e4d9" stroke="#888" />
      {/* Gantry rails */}
      <rect x={railX} y={railY} width={size - railX * 2} height={10} fill="#333" stroke="#666" />
      <rect x={railX} y={railY} width={10} height={size - railY * 2} fill="#333" stroke="#666" />
      {/* Moving gantry beam */}
      <rect x={railX} y={head.y - 6} width={size - railX * 2} height={8} fill="#555" stroke="#888" />
      <rect x={head.x - 6} y={railY} width={8} height={size - railY * 2} fill="#555" stroke="#888" />
      {/* Pen head */}
      <rect
        x={head.x - 10}
        y={head.y - 10}
        width={20}
        height={20}
        fill={head.penDown ? "#c45c26" : "#2a6f6f"}
        stroke="#111"
        strokeWidth="2"
      />
      <circle cx={head.x} cy={head.y} r={3} fill={head.penDown ? "#111" : "#888"} />

      {/* Travel (pen-up) */}
      <path d={travelPath} fill="none" stroke="#8a9" strokeWidth="1" strokeDasharray="4 3" opacity={0.7} />
      {/* Ink */}
      <path d={inkPath} fill="none" stroke="#1a1612" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        {head.penDown ? "PEN DOWN" : "PEN UP TRAVEL"} · {index}/{samples.length}
      </text>
    </svg>
  );
}

export default PlotterPenDesk;
