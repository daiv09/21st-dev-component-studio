"use client";

/**
 * Lorenz Observatory — the butterfly attractor integrated live at σ=10,
 * ρ=28, β=8/3 and orbited in a real 3-D projection. The filament keeps
 * only its most recent samples, so you watch trajectory memory: lobes
 * traced bright, older path decaying through stepped amber tones. DRAG to
 * orbit the observatory camera, WHEEL for focal range, CLICK to re-seed on
 * an unpredictably different itinerary.
 */

import React, { useEffect, useRef, useState } from "react";

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const TRAIL = 1500;

const AGE_TONES = ["#451a03", "#78350f", "#b45309", "#f59e0b", "#fde68a"];

export function LorenzObservatory() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    x: 0.1,
    y: 0,
    z: 0,
    pts: new Float32Array(TRAIL * 3),
    head: 0,
    count: 0,
    yaw: 0.7,
    pitch: -0.35,
    zoom: 1,
    dragging: false,
    lastX: 0,
    lastY: 0,
    seedN: 1,
  });

  const [hud, setHud] = useState({ seed: 1, zoomPct: 100 });

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

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dtFrame = Math.min((now - last) / 1000, 0.05);
      last = now;

      // integrate several substeps per frame
      const SUB = 6;
      const dt = Math.max(0.0015, dtFrame / SUB);
      for (let k = 0; k < SUB; k++) {
        const dx = SIGMA * (s.y - s.x);
        const dy = s.x * (RHO - s.z) - s.y;
        const dz = s.x * s.y - BETA * s.z;
        s.x += dx * dt * 2;
        s.y += dy * dt * 2;
        s.z += dz * dt * 2;
      }
      // push sample
      s.pts[s.head * 3] = s.x;
      s.pts[s.head * 3 + 1] = s.y;
      s.pts[s.head * 3 + 2] = s.z;
      s.head = (s.head + 1) % TRAIL;
      if (s.count < TRAIL) s.count++;

      // ---- draw ----------------------------------------------------------
      ctx.fillStyle = "#0d0b09";
      ctx.fillRect(0, 0, s.w, s.h);

      const cx = s.w / 2;
      const cy = s.h * 0.52;
      const scale = Math.min(s.w, s.h) * 0.016 * s.zoom;

      const cosY = Math.cos(s.yaw);
      const sinY = Math.sin(s.yaw);
      const cosP = Math.cos(s.pitch);
      const sinP = Math.sin(s.pitch);

      const project = (px: number, py: number, pz: number) => {
        // centre the attractor (centroid ≈ (0,0,27))
        const X = px;
        const Y = py;
        const Z = pz - 25;
        const x1 = X * cosY + Y * sinY;
        const y1 = -X * sinY + Y * cosY;
        const y2 = y1 * cosP - Z * sinP;
        const z2 = y1 * sinP + Z * cosP;
        const persp = 320 / (320 + z2 * scale);
        return { sx: cx + x1 * scale * persp, sy: cy + y2 * scale * persp };
      };

      // draw trail oldest → newest with stepped age tones
      const BANDS = 40;
      for (let band = 0; band < BANDS; band++) {
        // each band draws a contiguous slice of the ring
        const i0 = Math.floor((band * s.count) / BANDS);
        const i1 = Math.floor(((band + 1) * s.count) / BANDS);
        if (i1 <= i0) continue;
        const tone = AGE_TONES[Math.min(AGE_TONES.length - 1, Math.floor((band / BANDS) * AGE_TONES.length))];
        ctx.strokeStyle = tone;
        ctx.lineWidth = 1 + (band / BANDS) * 1.6;
        ctx.beginPath();
        for (let i = i0; i < i1; i++) {
          const idx = (s.head - s.count + i + TRAIL * 2) % TRAIL;
          const p = project(s.pts[idx * 3], s.pts[idx * 3 + 1], s.pts[idx * 3 + 2]);
          if (i === i0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
      }

      // head marker
      const hp = project(s.x, s.y, s.z);
      ctx.beginPath();
      ctx.arc(hp.sx, hp.sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff7ed";
      ctx.fill();

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const reseed = () => {
    const s = sim.current;
    s.x = 0.1 + (Math.random() - 0.5) * 12;
    s.y = 4 + (Math.random() - 0.5) * 14;
    s.z = 22 + (Math.random() - 0.5) * 18;
    s.count = 0;
    s.head = 0;
    s.seedN++;
    setHud((h) => ({ ...h, seed: s.seedN }));
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    sim.current.dragging = true;
    sim.current.lastX = e.clientX;
    sim.current.lastY = e.clientY;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (!s.dragging) return;
    s.yaw += (e.clientX - s.lastX) * 0.008;
    s.pitch += (e.clientY - s.lastY) * 0.006;
    s.pitch = Math.max(-1.35, Math.min(1.35, s.pitch));
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  };

  const onUp = () => {
    sim.current.dragging = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sim.current.zoom = Math.max(0.4, Math.min(2.6, sim.current.zoom * (e.deltaY < 0 ? 1.09 : 0.917)));
      setHud((h) => ({ ...h, zoomPct: Math.round(sim.current.zoom * 100) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0d0b09] select-none">
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
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Lorenz Observatory
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          σ 10 · ρ 28 · β 8⁄3 · Live Integration
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — Orbit · Wheel — Zoom {hud.zoomPct}%
          <br />
          Re-seed for a New Itinerary
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Seed">{`#${String(hud.seed).padStart(3, "0")}`}</Readout>
        <Readout label="Trail">{TRAIL.toLocaleString()} pts</Readout>
        <button
          onClick={reseed}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-amber-800 text-amber-300 hover:bg-amber-900/30 transition-colors pointer-events-auto"
        >
          Re-Seed
        </button>
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

export default LorenzObservatory;
