"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export interface WireEDMPathProps {
  /** Kerf width px */
  kerf?: number;
  /** Burn feed rate */
  feed?: number;
  /** Running burn */
  running?: boolean;
  size?: number;
  className?: string;
}

/**
 * Wire EDM toolpath — electrode wire burns kerf along path with spark erosion.
 */
export function WireEDMPath({
  kerf = 6,
  feed = 50,
  running = true,
  size = 520,
  className = "",
}: WireEDMPathProps) {
  // Toolpath in workpiece coords
  const path = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const pts: { x: number; y: number }[] = [];
    // Profile: stepped pocket
    const shape = [
      [0.25, 0.3],
      [0.75, 0.3],
      [0.75, 0.45],
      [0.55, 0.45],
      [0.55, 0.7],
      [0.25, 0.7],
      [0.25, 0.3],
    ];
    for (let s = 0; s < shape.length - 1; s++) {
      const [x0, y0] = shape[s];
      const [x1, y1] = shape[s + 1];
      const steps = 20;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        pts.push({ x: cx + (x0 + (x1 - x0) * t - 0.5) * size * 0.7, y: cy + (y0 + (y1 - y0) * t - 0.5) * size * 0.7 });
      }
    }
    return pts;
  }, [size]);

  const [index, setIndex] = useState(0);
  const [sparks, setSparks] = useState<{ x: number; y: number; life: number }[]>([]);
  const acc = useRef(0);
  const last = useRef(performance.now());

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last.current) / 1000, 0.05);
      last.current = now;
      if (index < path.length - 1) {
        const a = path[index];
        const b = path[index + 1];
        const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        acc.current += (feed * dt) / dist;
        if (acc.current >= 1) {
          acc.current = 0;
          setIndex((i) => Math.min(i + 1, path.length - 1));
          // Emit sparks
          setSparks((s) => [
            ...s.slice(-40),
            ...Array.from({ length: 4 }, () => ({
              x: b.x + (Math.random() - 0.5) * kerf,
              y: b.y + (Math.random() - 0.5) * kerf,
              life: 1,
            })),
          ]);
        }
      }
      setSparks((s) =>
        s.map((p) => ({ ...p, life: p.life - dt * 3 })).filter((p) => p.life > 0)
      );
      raf = requestAnimationFrame(tick);
    };
    last.current = performance.now();
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, path, index, feed, kerf]);

  const head = path[Math.min(index, path.length - 1)];
  const burned = path.slice(0, index + 1);

  // Kerf outline as offset polyline (simple perpendicular offset)
  const kerfPoly = (pts: { x: number; y: number }[], side: number) => {
    if (pts.length < 2) return "";
    return pts
      .map((p, i) => {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[Math.min(pts.length - 1, i + 1)];
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const len = Math.hypot(dx, dy) || 1;
        const ox = (-dy / len) * (kerf / 2) * side;
        const oy = (dx / len) * (kerf / 2) * side;
        return `${p.x + ox},${p.y + oy}`;
      })
      .join(" ");
  };

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
      {/* Workpiece */}
      <rect
        x={size * 0.12}
        y={size * 0.12}
        width={size * 0.76}
        height={size * 0.76}
        fill="#3a3a42"
        stroke="#666"
        strokeWidth="2"
      />

      {/* Burned kerf channel */}
      {burned.length > 1 && (
        <>
          <polyline
            points={kerfPoly(burned, 1)}
            fill="none"
            stroke="#0a0a0a"
            strokeWidth={kerf}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={burned.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth={kerf}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Planned path (dashed) */}
      <polyline
        points={path.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#5a6b5a"
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity={0.5}
      />

      {/* Wire from top guides */}
      <line x1={head.x} y1={20} x2={head.x} y2={head.y} stroke="#d4af37" strokeWidth="1.5" />
      <line x1={head.x} y1={head.y} x2={head.x} y2={size - 20} stroke="#d4af37" strokeWidth="1.5" />
      <rect x={head.x - 20} y={12} width={40} height={14} fill="#555" stroke="#888" />
      <rect x={head.x - 20} y={size - 26} width={40} height={14} fill="#555" stroke="#888" />

      {/* Electrode tip */}
      <circle cx={head.x} cy={head.y} r={3} fill="#e8e4d9" />

      {/* Sparks — hard flat dots, no glow gradients */}
      {sparks.map((s, i) => (
        <rect
          key={i}
          x={s.x - 1.5}
          y={s.y - 1.5}
          width={3}
          height={3}
          fill={s.life > 0.5 ? "#e8e4d9" : "#d4af37"}
          opacity={s.life}
        />
      ))}

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        WIRE EDM · KERF {kerf}px · {index}/{path.length}
      </text>
    </svg>
  );
}

export default WireEDMPath;
