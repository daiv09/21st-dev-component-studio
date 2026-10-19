"use client";

import React, { useMemo } from "react";

export interface BlockAndTackleProps {
  /** Number of supporting rope segments (= mechanical advantage ideal) */
  parts?: number;
  /** Load mass (visual) */
  load?: number;
  /** Haul distance pulled (0–1 normalized) */
  haul?: number;
  size?: number;
  className?: string;
}

/**
 * Block and tackle: MA = n parts; rope conservation ⇒ load rises haul/n.
 */
export function BlockAndTackle({
  parts = 4,
  load = 0.7,
  haul = 0.4,
  size = 520,
  className = "",
}: BlockAndTackleProps) {
  const n = Math.max(2, Math.min(8, Math.round(parts)));
  const MA = n;

  const geometry = useMemo(() => {
    const cx = size / 2;
    const fixedY = 80;
    const travel = (haul * 140) / MA;
    const movingY = 220 + travel;
    const sheaveR = 16;
    const ropeX0 = cx - 40;

    // Alternate left/right rope segments between fixed and moving block
    const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < n; i++) {
      const x = ropeX0 + i * 14;
      if (i % 2 === 0) {
        segments.push({ x1: x, y1: fixedY + sheaveR, x2: x, y2: movingY - sheaveR });
      } else {
        segments.push({ x1: x, y1: movingY - sheaveR, x2: x, y2: fixedY + sheaveR });
      }
    }
    // Haul line
    const haulX = ropeX0 + n * 14;
    const haulEndY = fixedY + 40 + haul * 180;
    segments.push({
      x1: haulX,
      y1: fixedY + sheaveR,
      x2: haulX,
      y2: haulEndY,
    });

    return { cx, fixedY, movingY, sheaveR, ropeX0, segments, haulX, haulEndY };
  }, [n, haul, size, MA]);

  const g = geometry;
  const effort = load / MA;

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
      {/* Ceiling beam */}
      <rect x={size * 0.2} y={40} width={size * 0.6} height={16} fill="#555" stroke="#888" />

      {/* Fixed block */}
      <rect x={g.cx - 50} y={g.fixedY - 12} width={100} height={24} fill="#6b5b4a" stroke="#111" />
      {Array.from({ length: Math.ceil(n / 2) }, (_, i) => (
        <circle
          key={`f${i}`}
          cx={g.ropeX0 + i * 28 + 7}
          cy={g.fixedY}
          r={g.sheaveR}
          fill="#333"
          stroke="#aaa"
          strokeWidth="3"
        />
      ))}

      {/* Moving block */}
      <rect x={g.cx - 50} y={g.movingY - 12} width={100} height={24} fill="#8b7355" stroke="#111" />
      {Array.from({ length: Math.ceil(n / 2) }, (_, i) => (
        <circle
          key={`m${i}`}
          cx={g.ropeX0 + i * 28 + 7}
          cy={g.movingY}
          r={g.sheaveR}
          fill="#333"
          stroke="#d4af37"
          strokeWidth="3"
        />
      ))}

      {/* Rope */}
      {g.segments.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="#c4b59a"
          strokeWidth="2"
        />
      ))}

      {/* Hook + load */}
      <line x1={g.cx} y1={g.movingY + 12} x2={g.cx} y2={g.movingY + 40} stroke="#888" strokeWidth="3" />
      <path
        d={`M ${g.cx - 12} ${g.movingY + 40} Q ${g.cx} ${g.movingY + 58} ${g.cx + 12} ${g.movingY + 40}`}
        fill="none"
        stroke="#aaa"
        strokeWidth="4"
      />
      <rect
        x={g.cx - 30}
        y={g.movingY + 58}
        width={60}
        height={40 + load * 30}
        fill="#c45c26"
        stroke="#111"
        strokeWidth="2"
      />
      <text x={g.cx} y={g.movingY + 82 + load * 10} textAnchor="middle" fill="#111" fontSize="11" fontFamily="monospace" fontWeight="bold">
        W
      </text>

      {/* Hand on haul */}
      <circle cx={g.haulX} cy={g.haulEndY} r={10} fill="#2a6f6f" stroke="#5aafaf" strokeWidth="2" />
      <text x={g.haulX + 16} y={g.haulEndY + 4} fill="#8ab" fontSize="10" fontFamily="monospace">
        F={effort.toFixed(2)}W
      </text>

      <text x={12} y={28} fill="#888" fontSize="11" fontFamily="monospace">
        MA = {MA} · Δh_load = Δs_haul / {MA}
      </text>
      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        ROPE CONSERVATION · IDEAL (NO FRICTION)
      </text>
    </svg>
  );
}

export default BlockAndTackle;
