"use client";

import React, { useEffect, useMemo, useState } from "react";

export interface StringArtLoomProps {
  /** Peg count around circle */
  pegs?: number;
  /** Number of chords to weave */
  chords?: number;
  /** Target image: "circle" | "heart" | "spiral" */
  motif?: "circle" | "heart" | "spiral";
  size?: number;
  className?: string;
}

function motifScore(
  motif: "circle" | "heart" | "spiral",
  x: number,
  y: number,
  cx: number,
  cy: number
) {
  const dx = (x - cx) / cx;
  const dy = (y - cy) / cy;
  if (motif === "circle") {
    const r = Math.hypot(dx, dy);
    return Math.exp(-((r - 0.45) ** 2) * 40);
  }
  if (motif === "heart") {
    // implicit heart
    const a = dx * 1.2;
    const b = dy * -1.2 + 0.1;
    const v = Math.pow(a * a + b * b - 1, 3) - a * a * b * b * b;
    return v < 0 ? 1 : 0.05;
  }
  // spiral density
  const ang = Math.atan2(dy, dx);
  const r = Math.hypot(dx, dy);
  return Math.exp(-((r - ((ang + Math.PI) / (2 * Math.PI)) * 0.7) ** 2) * 30);
}

/**
 * Greedy chord weaving: each next peg maximizes darkness along the chord vs residual.
 */
export function StringArtLoom({
  pegs = 120,
  chords = 400,
  motif = "heart",
  size = 520,
  className = "",
}: StringArtLoomProps) {
  const [drawn, setDrawn] = useState(0);

  const pegPts = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.42;
    return Array.from({ length: pegs }, (_, i) => {
      const a = (i / pegs) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
    });
  }, [pegs, size]);

  const lines = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    // Residual darkness grid
    const n = 64;
    const residual = new Float32Array(n * n);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const px = (x / (n - 1)) * size;
        const py = (y / (n - 1)) * size;
        residual[y * n + x] = motifScore(motif, px, py, cx, cy);
      }
    }

    const result: { a: number; b: number }[] = [];
    let current = 0;
    const sampleChord = (a: number, b: number) => {
      let score = 0;
      const steps = 24;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = pegPts[a].x + (pegPts[b].x - pegPts[a].x) * t;
        const y = pegPts[a].y + (pegPts[b].y - pegPts[a].y) * t;
        const gx = Math.min(n - 1, Math.max(0, Math.floor((x / size) * (n - 1))));
        const gy = Math.min(n - 1, Math.max(0, Math.floor((y / size) * (n - 1))));
        score += residual[gy * n + gx];
      }
      return score;
    };
    const burnChord = (a: number, b: number) => {
      const steps = 24;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = pegPts[a].x + (pegPts[b].x - pegPts[a].x) * t;
        const y = pegPts[a].y + (pegPts[b].y - pegPts[a].y) * t;
        const gx = Math.min(n - 1, Math.max(0, Math.floor((x / size) * (n - 1))));
        const gy = Math.min(n - 1, Math.max(0, Math.floor((y / size) * (n - 1))));
        residual[gy * n + gx] = Math.max(0, residual[gy * n + gx] - 0.08);
      }
    };

    for (let c = 0; c < chords; c++) {
      let best = -1;
      let bestScore = -1;
      // Search subset of pegs for speed
      for (let d = 8; d < pegs / 2; d += 2) {
        const cand = (current + d) % pegs;
        const sc = sampleChord(current, cand);
        if (sc > bestScore) {
          bestScore = sc;
          best = cand;
        }
      }
      if (best < 0) break;
      result.push({ a: current, b: best });
      burnChord(current, best);
      current = best;
    }
    return result;
  }, [pegs, chords, motif, pegPts, size]);

  useEffect(() => {
    setDrawn(0);
    let i = 0;
    let raf = 0;
    const tick = () => {
      i += 3;
      setDrawn(Math.min(i, lines.length));
      if (i < lines.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lines]);

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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size * 0.42}
        fill="#141210"
        stroke="#6b5b4a"
        strokeWidth="6"
      />
      {pegPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill="#c4b59a" />
      ))}
      {lines.slice(0, drawn).map((l, i) => (
        <line
          key={i}
          x1={pegPts[l.a].x}
          y1={pegPts[l.a].y}
          x2={pegPts[l.b].x}
          y2={pegPts[l.b].y}
          stroke="#e8e4d9"
          strokeWidth="0.45"
          opacity={0.55}
        />
      ))}
      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        GREEDY WEAVE {drawn}/{lines.length} · {motif.toUpperCase()}
      </text>
    </svg>
  );
}

export default StringArtLoom;
