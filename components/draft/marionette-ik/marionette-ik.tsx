"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface MarionetteIKProps {
  size?: number;
  /** FABRIK iterations */
  iterations?: number;
  className?: string;
}

type Pt = { x: number; y: number };

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** FABRIK for a single chain */
function fabrik(points: Pt[], lengths: number[], target: Pt, base: Pt, iters: number) {
  const pts = points.map((p) => ({ ...p }));
  for (let iter = 0; iter < iters; iter++) {
    // Forward
    pts[pts.length - 1] = { ...target };
    for (let i = pts.length - 2; i >= 0; i--) {
      const d = dist(pts[i], pts[i + 1]) || 1;
      const r = lengths[i] / d;
      pts[i] = {
        x: pts[i + 1].x + (pts[i].x - pts[i + 1].x) * r,
        y: pts[i + 1].y + (pts[i].y - pts[i + 1].y) * r,
      };
    }
    // Backward
    pts[0] = { ...base };
    for (let i = 0; i < pts.length - 1; i++) {
      const d = dist(pts[i], pts[i + 1]) || 1;
      const r = lengths[i] / d;
      pts[i + 1] = {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * r,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * r,
      };
    }
  }
  return pts;
}

/** Catenary between two points (approx via hyperbolic cosine samples) */
function catenary(a: Pt, b: Pt, sag: number, samples = 12): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t + sag * Math.sin(Math.PI * t);
    pts.push({ x, y });
  }
  return pts;
}

/**
 * Marionette with FABRIK limbs and catenary control strings.
 */
export function MarionetteIK({
  size = 520,
  iterations = 8,
  className = "",
}: MarionetteIKProps) {
  const [target, setTarget] = useState<Pt>({ x: size * 0.62, y: size * 0.72 });
  const [dragging, setDragging] = useState<"L" | "R" | "body" | null>(null);
  const [body, setBody] = useState<Pt>({ x: size * 0.5, y: size * 0.42 });
  const [leftHand, setLeftHand] = useState<Pt>({ x: size * 0.35, y: size * 0.55 });
  const svgRef = useRef<SVGSVGElement>(null);

  const controlBar = { x: size * 0.5, y: 48 };
  const barW = 120;

  const shoulderL: Pt = { x: body.x - 28, y: body.y - 10 };
  const shoulderR: Pt = { x: body.x + 28, y: body.y - 10 };
  const hip: Pt = { x: body.x, y: body.y + 50 };

  const armLen = [36, 34];
  const leftArm = fabrik(
    [shoulderL, { x: shoulderL.x - 30, y: shoulderL.y + 30 }, leftHand],
    armLen,
    leftHand,
    shoulderL,
    iterations
  );
  const rightArm = fabrik(
    [shoulderR, { x: shoulderR.x + 30, y: shoulderR.y + 30 }, target],
    armLen,
    target,
    shoulderR,
    iterations
  );

  const legLen = [40, 38];
  const footL: Pt = { x: hip.x - 22, y: hip.y + 90 };
  const footR: Pt = { x: hip.x + 22, y: hip.y + 90 };
  const leftLeg = fabrik(
    [hip, { x: hip.x - 15, y: hip.y + 40 }, footL],
    legLen,
    footL,
    hip,
    iterations
  );
  const rightLeg = fabrik(
    [hip, { x: hip.x + 15, y: hip.y + 40 }, footR],
    legLen,
    footR,
    hip,
    iterations
  );

  const strings = [
    catenary({ x: controlBar.x - barW / 2, y: controlBar.y }, leftArm[2], 28),
    catenary({ x: controlBar.x + barW / 2, y: controlBar.y }, rightArm[2], 28),
    catenary({ x: controlBar.x, y: controlBar.y }, { x: body.x, y: body.y - 28 }, 18),
    catenary({ x: controlBar.x - 40, y: controlBar.y }, leftLeg[2], 40),
    catenary({ x: controlBar.x + 40, y: controlBar.y }, rightLeg[2], 40),
  ];

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

  useEffect(() => {
    // idle sway
    let raf = 0;
    const start = performance.now();
    const sway = (now: number) => {
      if (!dragging) {
        const t = (now - start) / 1000;
        setBody((b) => ({
          x: size * 0.5 + Math.sin(t * 0.7) * 8,
          y: size * 0.42 + Math.sin(t * 1.1) * 3,
        }));
        setLeftHand((h) => ({
          x: size * 0.35 + Math.sin(t * 0.9 + 1) * 12,
          y: size * 0.55 + Math.cos(t * 0.8) * 8,
        }));
      }
      raf = requestAnimationFrame(sway);
    };
    raf = requestAnimationFrame(sway);
    return () => cancelAnimationFrame(raf);
  }, [dragging, size]);

  const poly = (pts: Pt[]) => pts.map((p) => `${p.x},${p.y}`).join(" ");

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
      }}
      onPointerMove={(e) => {
        const pt = toLocal(e);
        if (!pt || !dragging) return;
        if (dragging === "R") setTarget(pt);
        if (dragging === "L") setLeftHand(pt);
        if (dragging === "body") setBody(pt);
      }}
      onPointerUp={() => setDragging(null)}
    >
      {/* Control bar */}
      <rect
        x={controlBar.x - barW / 2}
        y={controlBar.y - 6}
        width={barW}
        height={12}
        fill="#333"
        stroke="#888"
        strokeWidth="2"
      />
      <circle cx={controlBar.x} cy={controlBar.y} r={5} fill="#aaa" />

      {/* Catenary strings */}
      {strings.map((s, i) => (
        <polyline
          key={i}
          points={poly(s)}
          fill="none"
          stroke="#666"
          strokeWidth="1"
        />
      ))}

      {/* Legs */}
      <polyline points={poly(leftLeg)} fill="none" stroke="#c4b59a" strokeWidth="6" strokeLinecap="round" />
      <polyline points={poly(rightLeg)} fill="none" stroke="#c4b59a" strokeWidth="6" strokeLinecap="round" />
      {/* Arms */}
      <polyline points={poly(leftArm)} fill="none" stroke="#d4c4a8" strokeWidth="5" strokeLinecap="round" />
      <polyline points={poly(rightArm)} fill="none" stroke="#d4c4a8" strokeWidth="5" strokeLinecap="round" />

      {/* Torso */}
      <rect
        x={body.x - 22}
        y={body.y - 20}
        width={44}
        height={70}
        rx={4}
        fill="#8b4513"
        stroke="#5c2e0a"
        strokeWidth="2"
        style={{ cursor: "grab" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging("body");
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
      />
      {/* Head */}
      <circle cx={body.x} cy={body.y - 36} r={16} fill="#e8d5b7" stroke="#c4a882" strokeWidth="2" />

      {/* Hands (targets) */}
      <circle
        cx={leftArm[2].x}
        cy={leftArm[2].y}
        r={10}
        fill="#c45c26"
        stroke="#f0a060"
        strokeWidth="2"
        style={{ cursor: "grab" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging("L");
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
      />
      <circle
        cx={rightArm[2].x}
        cy={rightArm[2].y}
        r={10}
        fill="#2a6f6f"
        stroke="#5aafaf"
        strokeWidth="2"
        style={{ cursor: "grab" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setDragging("R");
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
      />

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        DRAG HANDS / BODY · FABRIK + CATENARY
      </text>
    </svg>
  );
}

export default MarionetteIK;
