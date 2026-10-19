"use client";

/**
 * Moiré Turntables — two engraved discs in near-perfect registration: a
 * stationary field of concentric grooves and a slowly rotating Archimedean
 * spiral. Their superposition breathes with interference fringes. DRAG to
 * de-center the spiral platter (fringes bloom outward), WHEEL retunes groove
 * pitch, double-click snaps the platters back into alignment.
 */

import React, { useEffect, useRef, useState } from "react";

const MAX_OFFSET = 280;

export function MoireTurntables() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const state = useRef({
    w: 0,
    h: 0,
    cx: 0,
    cy: 0,
    bx: 0,
    by: 0, // disc-B center offset from screen center
    phi: 0,
    pitch: 11,
    dragging: false,
    hoverRpmBoost: 0,
  });

  const [readout, setReadout] = useState({ offset: 0, pitch: 11 });
  const roRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = state.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      s.cx = rect.width / 2;
      s.cy = rect.height / 2;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      s.phi += (0.22 + s.hoverRpmBoost) * dt;

      // ---- draw ----------------------------------------------------------
      ctx.fillStyle = "#070707";
      ctx.fillRect(0, 0, s.w, s.h);

      // Disc A — concentric grooves, dead-centered
      ctx.strokeStyle = "rgba(245,245,240,0.9)";
      ctx.lineWidth = 1.4;
      const R = Math.hypot(s.w, s.h) / 2;
      ctx.beginPath();
      for (let r = s.pitch; r < R; r += s.pitch) {
        ctx.moveTo(s.cx + r, s.cy);
        ctx.arc(s.cx, s.cy, r, 0, Math.PI * 2);
      }
      ctx.stroke();

      // Disc B — Archimedean spiral platter, draggable
      ctx.strokeStyle = "rgba(250,250,246,0.92)";
      ctx.lineWidth = 1.4;
      const bx = s.cx + s.bx;
      const by = s.cy + s.by;
      ctx.beginPath();
      const TWO_PI = Math.PI * 2;
      const turns = R / s.pitch;
      for (let th = 0; th < turns * TWO_PI; th += 0.035) {
        const r = (s.pitch * th) / TWO_PI;
        const x = bx + Math.cos(th + s.phi) * r;
        const y = by + Math.sin(th + s.phi) * r;
        if (th === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Platter hub marks
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(245,158,11,0.55)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, 5, 0, Math.PI * 2);
      ctx.stroke();

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    roRef.current = setInterval(() => {
      setReadout({
        offset: Math.round(Math.hypot(s.bx, s.by)),
        pitch: s.pitch,
      });
    }, 160);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (roRef.current) clearInterval(roRef.current);
    };
  }, []);

  // Drag the spiral platter
  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    state.current.dragging = true;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (s.dragging) {
      const tx = e.clientX - rect.left - rect.width / 2;
      const ty = e.clientY - rect.top - rect.height / 2;
      const d = Math.hypot(tx, ty);
      const k = d > MAX_OFFSET ? MAX_OFFSET / d : 1;
      s.bx = tx * k;
      s.by = ty * k;
    }
    s.hoverRpmBoost = 0.25; // pointer presence nudges the motor
  };

  const onLeave = () => {
    state.current.hoverRpmBoost = 0;
  };

  const onUp = () => {
    state.current.dragging = false;
  };

  const align = () => {
    state.current.bx = 0;
    state.current.by = 0;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = state.current;
      s.pitch = Math.min(26, Math.max(4, s.pitch * (e.deltaY < 0 ? 0.94 : 1.064)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#070707] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onLeave}
        onDoubleClick={align}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Moiré Turntables
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Groove × Spiral Interference Bench
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — De-Center Platter
          <br />
          Wheel — Pitch · Dbl-Click — Re-Align
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none">
        <Readout label="Offset">{readout.offset}px</Readout>
        <Readout label="Groove Pitch">{readout.pitch.toFixed(1)}px</Readout>
        <button
          onClick={align}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors pointer-events-auto"
        >
          Align
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
      <span className="font-mono text-sm text-neutral-200 tabular-nums">{children}</span>
    </div>
  );
}

export default MoireTurntables;
