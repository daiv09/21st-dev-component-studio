"use client";

import React, { useMemo } from "react";

export interface ZipperSeamProps {
  /** Open amount 0–1 */
  open?: number;
  /** Teeth count per side */
  teeth?: number;
  /** Reveal label behind zipper */
  label?: string;
  size?: number;
  className?: string;
}

/**
 * Meshing zipper: teeth interlock via phase-offset polygons; slider drives opening.
 */
export function ZipperSeam({
  open = 0.35,
  teeth = 24,
  label = "REVEALED",
  size = 520,
  className = "",
}: ZipperSeamProps) {
  const cx = size / 2;
  const top = 60;
  const bottom = size - 60;
  const length = bottom - top;
  const openY = top + length * open;
  const toothH = length / teeth;

  const leftTeeth = useMemo(() => {
    const pts: { y: number; mesh: boolean }[] = [];
    for (let i = 0; i < teeth; i++) {
      const y = top + i * toothH;
      pts.push({ y, mesh: y + toothH > openY });
    }
    return pts;
  }, [teeth, toothH, top, openY]);

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
      {/* Fabric panels */}
      <rect x={40} y={40} width={cx - 50} height={size - 80} fill="#1a2228" stroke="#333" />
      <rect x={cx + 10} y={40} width={cx - 50} height={size - 80} fill="#1a2228" stroke="#333" />

      {/* Reveal through opening */}
      <rect
        x={cx - 36}
        y={top}
        width={72}
        height={Math.max(0, openY - top)}
        fill="#0a0a0a"
      />
      {open > 0.08 && (
        <text
          x={cx}
          y={top + (openY - top) / 2}
          textAnchor="middle"
          fill="#d4af37"
          fontSize="14"
          fontFamily="monospace"
          letterSpacing="4"
        >
          {label}
        </text>
      )}

      {/* Tape edges */}
      <rect x={cx - 28} y={openY} width={20} height={bottom - openY} fill="#3a4550" />
      <rect x={cx + 8} y={openY} width={20} height={bottom - openY} fill="#3a4550" />

      {/* Teeth — left */}
      {leftTeeth.map((t, i) => {
        const y = t.y;
        const meshed = t.mesh;
        const x0 = meshed ? cx - 6 : cx - 22;
        // Tooth polygon pointing right
        return (
          <polygon
            key={`L${i}`}
            points={`${x0},${y + 2} ${x0 + 18},${y + toothH * 0.35} ${x0},${y + toothH - 2}`}
            fill={meshed ? "#c4b59a" : "#8a9aaa"}
            stroke="#111"
            strokeWidth="0.5"
          />
        );
      })}
      {/* Teeth — right (phase offset half tooth) */}
      {leftTeeth.map((t, i) => {
        const y = t.y + toothH * 0.5;
        if (y > bottom - 4) return null;
        const meshed = y + toothH > openY;
        const x0 = meshed ? cx + 6 : cx + 22;
        return (
          <polygon
            key={`R${i}`}
            points={`${x0},${y + 2} ${x0 - 18},${y + toothH * 0.35} ${x0},${y + toothH - 2}`}
            fill={meshed ? "#a09070" : "#7a8a9a"}
            stroke="#111"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Slider */}
      <g transform={`translate(${cx}, ${openY})`}>
        <rect x={-22} y={-18} width={44} height={36} rx={4} fill="#d4af37" stroke="#111" strokeWidth="2" />
        <rect x={-10} y={-8} width={20} height={16} fill="#1a1a1a" />
        <path d="M -6 4 L 0 12 L 6 4 Z" fill="#1a1a1a" />
      </g>

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        OPEN {(open * 100) | 0}% · MESH PHASE OFFSET
      </text>
    </svg>
  );
}

export default ZipperSeam;
