"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface PantographTracerProps {
  /** Scale factor (output / input). Classic pantograph: AB/AD */
  scale?: number;
  /** Arm length (SVG units) */
  armLength?: number;
  size?: number;
  className?: string;
}

type Pt = { x: number; y: number };

/**
 * Parallelogram pantograph linkage.
 * Fixed pivot F, input stylus S, output O = F + k·(S − F)
 * Visual arms form parallelogram with mid joints.
 */
export function PantographTracer({
  scale = 2,
  armLength = 140,
  size = 520,
  className = "",
}: PantographTracerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [stylus, setStylus] = useState<Pt>({ x: 180, y: 280 });
  const [drawing, setDrawing] = useState(false);
  const [trace, setTrace] = useState<string>("");
  const fixed: Pt = { x: size * 0.12, y: size * 0.55 };

  const output: Pt = {
    x: fixed.x + scale * (stylus.x - fixed.x),
    y: fixed.y + scale * (stylus.y - fixed.y),
  };

  // Parallelogram joints: A near fixed, B near stylus mid, C near output mid
  const midScale = (scale + 1) / 2;
  const jointA: Pt = {
    x: fixed.x + (stylus.x - fixed.x) * 0.45,
    y: fixed.y + (stylus.y - fixed.y) * 0.45,
  };
  const jointB: Pt = {
    x: fixed.x + (output.x - fixed.x) * (0.45 / scale),
    y: fixed.y + (output.y - fixed.y) * (0.45 / scale),
  };
  // Recompute proper parallelogram: F–A–M–B where M is scaled stylus midpoint
  const A: Pt = {
    x: fixed.x + Math.cos(-0.6) * armLength * 0.55,
    y: fixed.y + Math.sin(-0.6) * armLength * 0.55,
  };
  // Use vector geometry from stylus for live linkage
  const v = { x: stylus.x - fixed.x, y: stylus.y - fixed.y };
  const len = Math.hypot(v.x, v.y) || 1;
  const ux = v.x / len;
  const uy = v.y / len;
  const px = -uy;
  const py = ux;
  const half = armLength * 0.35;

  const P1: Pt = { x: fixed.x + ux * half + px * 18, y: fixed.y + uy * half + py * 18 };
  const P2: Pt = { x: stylus.x - ux * half * 0.3 + px * 18, y: stylus.y - uy * half * 0.3 + py * 18 };
  const P3: Pt = {
    x: fixed.x + ux * half * midScale + px * 18 * scale * 0.5,
    y: fixed.y + uy * half * midScale + py * 18 * scale * 0.5,
  };
  const P4: Pt = {
    x: output.x - ux * half * 0.2 + px * 18 * scale * 0.5,
    y: output.y - uy * half * 0.2 + py * 18 * scale * 0.5,
  };

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

  const onMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const pt = toLocal(e);
    if (!pt) return;
    setStylus(pt);
    const o = {
      x: fixed.x + scale * (pt.x - fixed.x),
      y: fixed.y + scale * (pt.y - fixed.y),
    };
    setTrace((t) => (t ? `${t} L ${o.x} ${o.y}` : `M ${o.x} ${o.y}`));
  };

  useEffect(() => {
    // keep unused vars quiet for linkage visual
    void A;
    void jointA;
    void jointB;
  }, [A, jointA, jointB]);

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
        cursor: drawing ? "crosshair" : "default",
      }}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setDrawing(true);
        const pt = toLocal(e);
        if (pt) {
          setStylus(pt);
          const o = {
            x: fixed.x + scale * (pt.x - fixed.x),
            y: fixed.y + scale * (pt.y - fixed.y),
          };
          setTrace((t) => (t ? `${t} M ${o.x} ${o.y}` : `M ${o.x} ${o.y}`));
        }
      }}
      onPointerMove={onMove}
      onPointerUp={() => setDrawing(false)}
      onPointerLeave={() => setDrawing(false)}
    >
      {/* Paper plane */}
      <rect x={size * 0.35} y={40} width={size * 0.58} height={size * 0.72} fill="#141414" stroke="#333" />
      <text x={size * 0.38} y={58} fill="#555" fontSize="9" fontFamily="monospace">
        OUTPUT PLANE ×{scale.toFixed(1)}
      </text>

      {/* Trace */}
      <path d={trace} fill="none" stroke="#e8e4d9" strokeWidth="1.5" strokeLinecap="round" />

      {/* Linkage arms */}
      <line x1={fixed.x} y1={fixed.y} x2={P1.x} y2={P1.y} stroke="#666" strokeWidth="3" />
      <line x1={P1.x} y1={P1.y} x2={P2.x} y2={P2.y} stroke="#888" strokeWidth="2.5" />
      <line x1={P2.x} y1={P2.y} x2={stylus.x} y2={stylus.y} stroke="#666" strokeWidth="2.5" />
      <line x1={P1.x} y1={P1.y} x2={P3.x} y2={P3.y} stroke="#555" strokeWidth="2" />
      <line x1={P3.x} y1={P3.y} x2={P4.x} y2={P4.y} stroke="#777" strokeWidth="2" />
      <line x1={P4.x} y1={P4.y} x2={output.x} y2={output.y} stroke="#555" strokeWidth="2" />
      <line x1={P2.x} y1={P2.y} x2={P4.x} y2={P4.y} stroke="#444" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Joints */}
      {[fixed, P1, P2, P3, P4].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill="#1a1a1a" stroke="#aaa" strokeWidth="1.5" />
      ))}

      {/* Fixed pivot */}
      <rect x={fixed.x - 8} y={fixed.y - 8} width={16} height={16} fill="#222" stroke="#ccc" strokeWidth="2" />
      {/* Stylus */}
      <circle cx={stylus.x} cy={stylus.y} r={8} fill="#c45c26" stroke="#f0a060" strokeWidth="2" />
      {/* Output pen */}
      <circle cx={output.x} cy={output.y} r={5} fill="#e8e4d9" stroke="#fff" strokeWidth="1" />

      <text x={12} y={size - 16} fill="#555" fontSize="9" fontFamily="monospace">
        DRAG STYLUS · SCALE k={scale.toFixed(2)}
      </text>
    </svg>
  );
}

export function clearPantographTrace() {
  /* helper placeholder for page reset via key */
}

export default PantographTracer;
