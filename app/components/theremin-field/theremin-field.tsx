"use client";

import React, { useCallback, useRef, useState } from "react";

export interface ThereminFieldProps {
  size?: number;
  className?: string;
  onField?: (pitch: number, volume: number) => void;
}

/**
 * Dual-antenna theremin: right = pitch (horizontal proximity), left = volume (vertical).
 * Field strength ∝ 1/(d+ε) — capacitive proximity metaphor.
 */
export function ThereminField({
  size = 520,
  className = "",
  onField,
}: ThereminFieldProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(false);

  const pitchAntenna = { x: size * 0.82, y: size * 0.25, h: size * 0.55 };
  const volAntenna = { x: size * 0.18, y: size * 0.72, w: size * 0.35 };

  const pitch =
    hand && active
      ? Math.max(0, Math.min(1, 1 - Math.abs(hand.x - pitchAntenna.x) / (size * 0.5)))
      : 0;
  const volume =
    hand && active
      ? Math.max(0, Math.min(1, 1 - Math.abs(hand.y - volAntenna.y) / (size * 0.45)))
      : 0;

  const toLocal = useCallback(
    (e: React.PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * size,
        y: ((e.clientY - rect.top) / rect.height) * size,
      };
    },
    [size]
  );

  // Field rings
  const rings = [40, 80, 120, 160];

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{
        background: "#0a0a0a",
        border: "1px solid #2a2a2a",
        boxShadow: "8px 8px 0 #000",
        touchAction: "none",
        cursor: "crosshair",
      }}
      onPointerDown={(e) => {
        setActive(true);
        const p = toLocal(e);
        if (p) {
          setHand(p);
          onField?.(
            Math.max(0, Math.min(1, 1 - Math.abs(p.x - pitchAntenna.x) / (size * 0.5))),
            Math.max(0, Math.min(1, 1 - Math.abs(p.y - volAntenna.y) / (size * 0.45)))
          );
        }
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!active) return;
        const p = toLocal(e);
        if (p) {
          setHand(p);
          const pi = Math.max(0, Math.min(1, 1 - Math.abs(p.x - pitchAntenna.x) / (size * 0.5)));
          const vo = Math.max(0, Math.min(1, 1 - Math.abs(p.y - volAntenna.y) / (size * 0.45)));
          onField?.(pi, vo);
        }
      }}
      onPointerUp={() => {
        setActive(false);
        setHand(null);
        onField?.(0, 0);
      }}
    >
      {/* Cabinet */}
      <rect x={size * 0.28} y={size * 0.55} width={size * 0.44} height={size * 0.28} fill="#1a1612" stroke="#6b5b4a" strokeWidth="3" />
      <text x={size / 2} y={size * 0.7} textAnchor="middle" fill="#8a7a6a" fontSize="12" fontFamily="monospace" letterSpacing="4">
        THEREMIN
      </text>

      {/* Volume loop antenna (horizontal) */}
      <ellipse
        cx={volAntenna.x + volAntenna.w / 2}
        cy={volAntenna.y}
        rx={volAntenna.w / 2}
        ry={18}
        fill="none"
        stroke="#2a6f6f"
        strokeWidth="4"
      />
      <text x={volAntenna.x} y={volAntenna.y - 28} fill="#5aafaf" fontSize="9" fontFamily="monospace">
        VOLUME
      </text>
      {rings.map((r) => (
        <ellipse
          key={`v${r}`}
          cx={volAntenna.x + volAntenna.w / 2}
          cy={volAntenna.y}
          rx={volAntenna.w / 2 + r * 0.3}
          ry={18 + r * 0.25}
          fill="none"
          stroke="#2a6f6f"
          strokeWidth="1"
          opacity={0.15 + volume * 0.25}
        />
      ))}

      {/* Pitch rod antenna (vertical) */}
      <line
        x1={pitchAntenna.x}
        y1={pitchAntenna.y}
        x2={pitchAntenna.x}
        y2={pitchAntenna.y + pitchAntenna.h}
        stroke="#d4af37"
        strokeWidth="4"
      />
      <circle cx={pitchAntenna.x} cy={pitchAntenna.y} r={6} fill="#d4af37" />
      <text x={pitchAntenna.x - 10} y={pitchAntenna.y - 12} fill="#d4af37" fontSize="9" fontFamily="monospace" textAnchor="end">
        PITCH
      </text>
      {rings.map((r) => (
        <circle
          key={`p${r}`}
          cx={pitchAntenna.x}
          cy={pitchAntenna.y + pitchAntenna.h * 0.4}
          r={r * (0.4 + pitch * 0.4)}
          fill="none"
          stroke="#d4af37"
          strokeWidth="1"
          opacity={0.12 + pitch * 0.3}
        />
      ))}

      {/* Hand */}
      {hand && (
        <g>
          <circle cx={hand.x} cy={hand.y} r={16} fill="#c45c26" stroke="#f0a060" strokeWidth="2" />
          <line
            x1={hand.x}
            y1={hand.y}
            x2={pitchAntenna.x}
            y2={hand.y}
            stroke="#d4af37"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <line
            x1={hand.x}
            y1={hand.y}
            x2={hand.x}
            y2={volAntenna.y}
            stroke="#2a6f6f"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity={0.5}
          />
        </g>
      )}

      {/* Readouts */}
      <text x={12} y={28} fill="#d4af37" fontSize="11" fontFamily="monospace">
        PITCH {(pitch * 100) | 0}%
      </text>
      <text x={12} y={46} fill="#5aafaf" fontSize="11" fontFamily="monospace">
        VOL {(volume * 100) | 0}%
      </text>
      {/* Pitch bars */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={size * 0.35 + i * 10}
          y={size * 0.78 - (i <= pitch * 11 ? 20 + i * 2 : 4)}
          width={7}
          height={i <= pitch * 11 ? 20 + i * 2 : 4}
          fill={i <= pitch * 11 ? "#d4af37" : "#333"}
          opacity={0.3 + volume * 0.7}
        />
      ))}

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        DRAG HAND · FIELD ∝ 1/(d+ε)
      </text>
    </svg>
  );
}

export default ThereminField;
