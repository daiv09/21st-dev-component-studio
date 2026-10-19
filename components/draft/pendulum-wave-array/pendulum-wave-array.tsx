"use client";

/**
 * Pendulum Wave Array — fifteen pendulums of graded length whose frequencies
 * differ by a fixed step, so the ensemble drifts out of phase into travelling
 * waves, serpents and split columns before snapping back into unison. GRAB
 * any bob and displace it; WHEEL retunes the frequency spread that governs
 * how fast the figures evolve.
 */

import React, { useEffect, useRef, useState } from "react";

const N = 15;

// Discrete tone buckets from warm white → amber → red
const LUT = ["#fafaf9", "#efe7d3", "#fbbf24", "#f59e0b", "#ef4444"];

export function PendulumWaveArray() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    theta: new Float64Array(N),
    omega: new Float64Array(N),
    lengths: new Float64Array(N),
    baseLen: 300,
    spread: 1, // frequency-spread multiplier
    railY: 90,
    grabbed: -1,
    grabX: 0,
    pivotGap: 0,
  });

  const [spreadPct, setSpreadPct] = useState(100);

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
      s.railY = rect.height * 0.16;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.baseLen = Math.min(rect.height * 0.72, rect.width * 0.55);
      retuneLengths();
    };

    // Longest bob completes F0 cycles per era T; each next one one more.
    const ERA_S = 26;
    const F0 = 8;
    const retuneLengths = () => {
      for (let i = 0; i < N; i++) {
        const f = (F0 + i) / ERA_S * s.spread; // Hz
        const omega = 2 * Math.PI * f;
        // L such that ω_pendulum = ω → L = g/ω²  (g in px/s², scaled)
        s.lengths[i] = 24000 / (omega * omega);
        if (s.lengths[i] > s.baseLen) s.lengths[i] = s.baseLen * (0.35 + 0.65 * (F0 / (F0 + i)));
      }
    };
    retuneRef.current = retuneLengths;

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      ctx.fillStyle = "#0d0b0a";
      ctx.fillRect(0, 0, s.w, s.h);

      // Rail
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(24, s.railY - 14, s.w - 48, 16);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(24, s.railY - 14, s.w - 48, 2);

      const gap = (s.w - 160) / N;
      s.pivotGap = gap;

      for (let i = 0; i < N; i++) {
        const px = 80 + gap * i + gap / 2;
        const L = s.lengths[i];

        if (i !== s.grabbed) {
          // exact harmonic oscillator via linearisation (small angles)
          const omSq = 24000 / (L * L);
          s.omega[i] += -omSq * s.theta[i] * dt;
          s.omega[i] -= s.omega[i] * 0.012 * dt;
          s.theta[i] += s.omega[i] * dt;
        }

        const bx = px + Math.sin(s.theta[i]) * L;
        const by = s.railY + Math.cos(s.theta[i]) * L;

        // String
        ctx.strokeStyle = "#57534e";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(px, s.railY + 2);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Bob — two-tone shading
        const R = 11;
        ctx.beginPath();
        ctx.arc(bx, by, R, 0, Math.PI * 2);
        ctx.fillStyle = LUT[Math.floor((i / N) * LUT.length)];
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.45)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(bx - R * 0.3, by - R * 0.32, R * 0.36, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.fill();

        if (i === s.grabbed) {
          ctx.beginPath();
          ctx.arc(bx, by, R + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const retuneRef = useRef<() => void>(() => {});

  const pickBob = (e: React.PointerEvent): number => {
    const s = sim.current;
    const wrap = wrapRef.current;
    if (!wrap) return -1;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = -1;
    let bestD = 30;
    for (let i = 0; i < N; i++) {
      const px = 80 + s.pivotGap * i + s.pivotGap / 2;
      const bx = px + Math.sin(s.theta[i]) * s.lengths[i];
      const by = s.railY + Math.cos(s.theta[i]) * s.lengths[i];
      const d = Math.hypot(bx - mx, by - my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const hit = pickBob(e);
    if (hit < 0) return;
    sim.current.grabbed = hit;
    sim.current.grabX = e.clientX;
    sim.current.omega[hit] = 0;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.grabbed < 0) return;
    const dxp = (e.clientX - s.grabX) * 0.006;
    s.grabX = e.clientX;
    s.theta[s.grabbed] = Math.max(-1.25, Math.min(1.25, s.theta[s.grabbed] + dxp));
  };

  const onUp = () => {
    sim.current.grabbed = -1;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.spread = Math.max(0.4, Math.min(2.4, s.spread * (e.deltaY < 0 ? 1.07 : 0.9346)));
      retuneRef.current();
      setSpreadPct(Math.round(s.spread * 100));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0d0b0a] select-none">
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
          Pendulum Wave
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Graded-Frequency Ensemble · {N} Bobs · 26 s Era
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Grab a Bob — Displace It
          <br />
          Wheel — Frequency Spread {spreadPct}%
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Spread">{spreadPct}%</Readout>
        <Readout label="Bobs">{N}</Readout>
        <Readout label="Era">26.0 s</Readout>
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

export default PendulumWaveArray;
