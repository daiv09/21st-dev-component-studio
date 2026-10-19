"use client";

/**
 * Tesseract Bench — a true 4-D hypercube, sixteen vertices and thirty-two
 * edges, double-projected (4D→3D→2D) while rotating simultaneously in two
 * orthogonal plane-pairs. DRAG spins the X·Y planes, SHIFT-DRAG or WHEEL
 * drives the alien Z·W planes — the rotation that makes the inner cube
 * swallow the outer one and invert through itself. Edge tone encodes
 * w-depth in three hard steps.
 */

import React, { useEffect, useRef, useState } from "react";

const VERTS: number[][] = [];
for (let m = 0; m < 16; m++) {
  VERTS.push([
    m & 1 ? 1 : -1,
    m & 2 ? 1 : -1,
    m & 4 ? 1 : -1,
    m & 8 ? 1 : -1,
  ]);
}
const EDGES: [number, number][] = [];
for (let a = 0; a < 16; a++) {
  for (let b = a + 1; b < 16; b++) {
    const diff = a ^ b;
    if ((diff & (diff - 1)) === 0) EDGES.push([a, b]);
  }
}

export function TesseractRotator() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    axy: 0.4,
    azw: 0.9,
    vxy: 0.32,
    vzw: 0.5,
    dragging: false,
    shiftDrag: false,
    lastX: 0,
    lastY: 0,
  });

  const [hud, setHud] = useState({ zwRate: 29 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const rot = (v: number[], a: number, i: number, j: number): void => {
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const vi = v[i];
      const vj = v[j];
      v[i] = vi * cos - vj * sin;
      v[j] = vi * sin + vj * cos;
    };

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!s.dragging) {
        s.axy += s.vxy * dt;
        s.azw += s.vzw * dt;
      }

      ctx.fillStyle = "#0d0c0e";
      ctx.fillRect(0, 0, s.w, s.h);

      const cx = s.w / 2;
      const cy = s.h / 2;
      const scale = Math.min(s.w, s.h) * 0.16;

      // project all 16 vertices
      const proj: { x: number; y: number; w: number }[] = VERTS.map((src) => {
        const v = [...src];
        rot(v, s.axy, 0, 1); // X-Y
        rot(v, s.azw, 1, 3); // Y-W
        rot(v, s.azw * 0.6 + 0.4, 2, 3); // Z-W mix
        // 4D → 3D perspective
        const wd = 1 / (2.4 - v[3]);
        const x3 = v[0] * wd;
        const y3 = v[1] * wd;
        const z3 = v[2] * wd;
        // 3D → 2D
        const zd = 1 / (2.2 - z3 * wd * 2);
        return {
          x: cx + x3 * scale * zd * 2.4,
          y: cy + y3 * scale * zd * 2.4,
          w: v[3],
        };
      });

      // edges with hard w-depth tones
      for (const [a, b] of EDGES) {
        const pa = proj[a];
        const pb = proj[b];
        const wAvg = (pa.w + pb.w) / 2;
        ctx.strokeStyle =
          wAvg > 0.33 ? "#fafaf9" : wAvg > -0.33 ? "#f87171" : "#7f1d1d";
        ctx.lineWidth = wAvg > 0.33 ? 2.4 : 1.4;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }

      // vertex nodes
      for (const p of proj) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w > 0 ? 4 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = p.w > 0 ? "#ffffff" : "#ef4444";
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      setHud({ zwRate: Math.round((sim.current.vzw * 180) / Math.PI) });
    }, 300);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const s = sim.current;
    s.dragging = true;
    s.shiftDrag = e.shiftKey;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    if (s.shiftDrag || e.shiftKey) {
      s.azw += dx * 0.008;
      s.vzw += dy * 0.002;
      s.vzw = Math.max(-3, Math.min(3, s.vzw));
    } else {
      s.axy += dx * 0.006;
      s.vxy = dy * 0.02;
      s.vxy = Math.max(-2, Math.min(2, s.vxy));
    }
  };

  const onUp = () => {
    sim.current.dragging = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sim.current.vzw = Math.max(-3, Math.min(3, sim.current.vzw * (e.deltaY < 0 ? 1.12 : 0.893)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0d0c0e] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Tesseract Bench
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          16 Vertices · 32 Edges · Double Projection
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — X·Y Planes
          <br />
          Shift-Drag / Wheel — Z·W Planes
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-24 right-10 flex flex-col gap-2 pointer-events-none z-10">
        {[
          ["#fafaf9", "w > 0 — near cell"],
          ["#f87171", "w ≈ 0 — mid cell"],
          ["#7f1d1d", "w < 0 — far cell"],
        ].map(([c, label]) => (
          <span key={label} className="flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] uppercase text-neutral-500">
            <span className="inline-block w-5 h-[3px]" style={{ background: c }} />
            {label}
          </span>
        ))}
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Z·W Rate">{hud.zwRate}°/s</Readout>
        <Readout label="Cells">8 Cubes</Readout>
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-lg text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

export default TesseractRotator;
