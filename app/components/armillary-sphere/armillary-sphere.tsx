"use client";

import React, { useEffect, useRef } from "react";

export interface ArmillarySphereProps {
  /** Earth axial tilt degrees */
  obliquity?: number;
  /** Auto-rotate speed */
  spin?: number;
  /** Manual yaw override */
  yaw?: number;
  /** Manual pitch */
  pitch?: number;
  size?: number;
  className?: string;
}

type V3 = [number, number, number];

function rotX(v: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}
function rotY(v: V3, a: number): V3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}
function project(v: V3, size: number): { x: number; y: number; z: number; s: number } {
  const f = 420;
  const z = v[2] + 420;
  const s = f / z;
  return { x: size / 2 + v[0] * s, y: size / 2 - v[1] * s, z: v[2], s };
}

/**
 * Nested celestial rings (equator, tropics, meridian, ecliptic) via Canvas 3D projection.
 * No Three.js — pure projective geometry.
 */
export function ArmillarySphere({
  obliquity = 23.4,
  spin = 0.4,
  yaw = 0,
  pitch = 0.35,
  size = 520,
  className = "",
}: ArmillarySphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ obliquity, spin, yaw, pitch });
  params.current = { obliquity, spin, yaw, pitch };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const t0 = performance.now();
    let raf = 0;
    const R = 140;

    const ring = (tiltX: number, tiltZ: number, color: string, width: number, dash?: number[]) => {
      const pts: { x: number; y: number; z: number }[] = [];
      const n = 96;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        let v: V3 = [Math.cos(a) * R, Math.sin(a) * R, 0];
        v = rotX(v, tiltX);
        // tiltZ around Z then apply view
        const c = Math.cos(tiltZ);
        const s = Math.sin(tiltZ);
        v = [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
        pts.push({ x: v[0], y: v[1], z: v[2], ...{} });
        void pts;
      }
      return { pts: Array.from({ length: n + 1 }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        let v: V3 = [Math.cos(a) * R, 0, Math.sin(a) * R];
        v = rotX(v, tiltX);
        const c = Math.cos(tiltZ);
        const s = Math.sin(tiltZ);
        v = [v[0] * c - v[2] * s, v[1], v[0] * s + v[2] * c];
        return v;
      }), color, width, dash };
    };

    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const { obliquity: obl, spin: sp, yaw: y0, pitch: p0 } = params.current;
      const yawA = y0 + t * sp;
      const pitchA = p0;
      const oblR = (obl * Math.PI) / 180;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, size, size);

      const rings = [
        { tilt: 0, color: "#c4b59a", w: 2.5, label: "EQUATOR" },
        { tilt: oblR, color: "#d4af37", w: 2, label: "ECLIPTIC" },
        { tilt: (23.4 * Math.PI) / 180, color: "#5a6b5a", w: 1.2, label: "TROPIC" },
        { tilt: (-23.4 * Math.PI) / 180, color: "#5a6b5a", w: 1.2, label: "TROPIC" },
        { tilt: Math.PI / 2, color: "#8a7a6a", w: 1.5, label: "MERIDIAN" },
      ];

      type Seg = { a: { x: number; y: number; z: number }; b: { x: number; y: number; z: number }; color: string; w: number };
      const segs: Seg[] = [];

      for (const r of rings) {
        const n = 64;
        let prev: { x: number; y: number; z: number } | null = null;
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI * 2;
          let v: V3 = [Math.cos(a) * R, Math.sin(a) * R, 0];
          // orient ring
          if (r.label === "MERIDIAN") {
            v = [Math.cos(a) * R, 0, Math.sin(a) * R];
          } else {
            v = rotX(v, r.tilt);
          }
          v = rotY(v, yawA);
          v = rotX(v, pitchA);
          const pr = project(v, size);
          const cur = { x: pr.x, y: pr.y, z: pr.z };
          if (prev) segs.push({ a: prev, b: cur, color: r.color, w: r.w });
          prev = cur;
        }
      }

      // Horizon / outer cradle
      {
        let prev: { x: number; y: number; z: number } | null = null;
        for (let i = 0; i <= 64; i++) {
          const a = (i / 64) * Math.PI * 2;
          let v: V3 = [Math.cos(a) * (R + 18), 0, Math.sin(a) * (R + 18)];
          v = rotY(v, yawA * 0.15);
          v = rotX(v, pitchA);
          const pr = project(v, size);
          const cur = { x: pr.x, y: pr.y, z: pr.z };
          if (prev) segs.push({ a: prev, b: cur, color: "#444", w: 3 });
          prev = cur;
        }
      }

      segs.sort((s, t) => (s.a.z + s.b.z) / 2 - (t.a.z + t.b.z) / 2);
      for (const s of segs) {
        ctx.beginPath();
        ctx.moveTo(s.a.x, s.a.y);
        ctx.lineTo(s.b.x, s.b.y);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.w;
        ctx.stroke();
      }

      // Earth ball (flat disk with hard shade half)
      let earth: V3 = [0, 0, 0];
      earth = rotY(earth, yawA);
      const ep = project([0, 0, 0], size);
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#2a4a6a";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 22, -Math.PI / 2, Math.PI / 2);
      ctx.fillStyle = "#1a2a3a";
      ctx.fill();
      ctx.strokeStyle = "#8ab";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 22, 0, Math.PI * 2);
      ctx.stroke();

      // Poles
      let np: V3 = [0, R + 8, 0];
      np = rotY(np, yawA);
      np = rotX(np, pitchA);
      const npp = project(np, size);
      ctx.fillStyle = "#e8e4d9";
      ctx.fillRect(npp.x - 2, npp.y - 2, 4, 4);

      ctx.fillStyle = "#666";
      ctx.font = "10px monospace";
      ctx.fillText(`ε=${obl.toFixed(1)}°  ARMILLARY`, 12, size - 14);

      // silence unused
      void ring;
      void t;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
        display: "block",
        border: "1px solid #2a2a2a",
        boxShadow: "8px 8px 0 #000",
      }}
      aria-label="Armillary sphere"
    />
  );
}

export default ArmillarySphere;
