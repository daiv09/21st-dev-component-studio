"use client";

import React, { useCallback, useState } from "react";

export interface DrafterParallelMotionProps {
  /** Head rotation degrees (scales stay parallel via linkage) */
  headAngle?: number;
  size?: number;
  className?: string;
}

type Pt = { x: number; y: number };

/**
 * Drafting machine: parallelogram arms keep the head axes parallel to the board.
 */
export function DrafterParallelMotion({
  headAngle = 0,
  size = 520,
  className = "",
}: DrafterParallelMotionProps) {
  const [head, setHead] = useState<Pt>({ x: size * 0.55, y: size * 0.45 });
  const [dragging, setDragging] = useState(false);
  const angle = headAngle;

  const origin: Pt = { x: 50, y: 50 };
  // Two-arm parallelogram toward head
  const mid: Pt = {
    x: (origin.x + head.x) / 2 + 40,
    y: (origin.y + head.y) / 2 - 20,
  };
  // Parallelogram joints
  const A = origin;
  const B: Pt = { x: mid.x - 30, y: mid.y - 25 };
  const C: Pt = { x: mid.x + 30, y: mid.y + 25 };
  const D = head;

  // Parallel copies offset for double bar
  const offset = (p: Pt, q: Pt, n: number): [Pt, Pt] => {
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (-dy / len) * n;
    const oy = (dx / len) * n;
    return [
      { x: p.x + ox, y: p.y + oy },
      { x: q.x + ox, y: q.y + oy },
    ];
  };

  const [A1, B1] = offset(A, B, 6);
  const [A2, B2] = offset(A, B, -6);
  const [B1b, C1] = offset(B, C, 6);
  const [B2b, C2] = offset(B, C, -6);
  const [C1b, D1] = offset(C, D, 6);
  const [C2b, D2] = offset(C, D, -6);

  const toLocal = useCallback(
    (e: React.PointerEvent) => {
      const svg = e.currentTarget as SVGSVGElement;
      const rect = svg.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * size,
        y: ((e.clientY - rect.top) / rect.height) * size,
      };
    },
    [size]
  );

  const rad = (angle * Math.PI) / 180;
  const rulerLen = 70;

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
        touchAction: "none",
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        setHead(toLocal(e));
      }}
      onPointerUp={() => setDragging(false)}
    >
      {/* Board */}
      <rect x={30} y={30} width={size - 60} height={size - 60} fill="#1c1814" stroke="#5a4a3a" strokeWidth="2" />
      {/* Grid */}
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <line x1={50 + i * 42} y1={50} x2={50 + i * 42} y2={size - 50} stroke="#2a2420" />
          <line x1={50} y1={50 + i * 42} x2={size - 50} y2={50 + i * 42} stroke="#2a2420" />
        </g>
      ))}

      {/* Anchor */}
      <rect x={origin.x - 16} y={origin.y - 16} width={32} height={32} fill="#444" stroke="#888" strokeWidth="2" />

      {/* Double parallelogram arms */}
      {[
        [A1, B1],
        [A2, B2],
        [B1b, C1],
        [B2b, C2],
        [C1b, D1],
        [C2b, D2],
      ].map((seg, i) => (
        <line
          key={i}
          x1={seg[0].x}
          y1={seg[0].y}
          x2={seg[1].x}
          y2={seg[1].y}
          stroke="#8a8a8a"
          strokeWidth="3"
        />
      ))}
      {[A, B, C, D].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill="#1a1a1a" stroke="#d4af37" strokeWidth="1.5" />
      ))}

      {/* Head with orthogonal scales — stays parallel (angles absolute) */}
      <g
        transform={`translate(${head.x}, ${head.y}) rotate(${angle})`}
        style={{ cursor: "grab" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging(true);
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
      >
        <rect x={-18} y={-18} width={36} height={36} fill="#c45c26" stroke="#111" strokeWidth="2" />
        {/* H ruler */}
        <rect x={0} y={-4} width={rulerLen} height={8} fill="#e8e4d9" stroke="#333" />
        {/* V ruler */}
        <rect x={-4} y={0} width={8} height={rulerLen} fill="#e8e4d9" stroke="#333" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <line x1={10 + i * 10} y1={-4} x2={10 + i * 10} y2={2} stroke="#111" strokeWidth="1" />
            <line x1={-4} y1={10 + i * 10} x2={2} y2={10 + i * 10} stroke="#111" strokeWidth="1" />
          </g>
        ))}
      </g>

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        PARALLEL MOTION · HEAD θ={angle.toFixed(0)}° · DRAG HEAD
      </text>
      {/* Angle control via keyboard hint — also show rad unused */}
      <text x={12} y={28} fill="#666" fontSize="9" fontFamily="monospace">
        cosθ={(Math.cos(rad)).toFixed(2)} — axes stay board-parallel
      </text>
    </svg>
  );
}

export default DrafterParallelMotion;
