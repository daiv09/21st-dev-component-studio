"use client";

/**
 * Chaos Bench — three double pendulums launched one ten-thousandth of a
 * radian apart. Full nonlinear dynamics, four substeps per frame: they track
 * each other faithfully for seconds, then opinions diverge violently and the
 * ghost trails tell the story. GRAB either bob on any arm to re-launch the
 * trio from a new near-tie; the DIVERGENCE readout quantifies the blow-up
 * live.
 */

import React, { useEffect, useRef, useState } from "react";

const G = 1400;
const L1 = 130;
const L2 = 110;
const M1 = 1.6;
const M2 = 1.1;
const EPS = 1e-4;

interface Arm {
  th1: number;
  th2: number;
  w1: number;
  w2: number;
}

const TRAIL_COLORS = ["rgba(250,250,249,0.85)", "rgba(251,191,36,0.85)", "rgba(239,68,68,0.9)"];

export function DoublePendulumChaos() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    arms: [] as Arm[],
    pivots: [] as { x: number; y: number }[],
    grabbed: null as null | { arm: number; bob: 1 | 2 },
    grabVX: 0,
    grabVY: 0,
    divergence: 0,
  });

  const [divDeg, setDivDeg] = useState("0.000");

  const seedArms = () => {
    const s = sim.current;
    s.arms = [0, 1, 2].map((k) => ({
      th1: Math.PI * 0.62 + k * EPS,
      th2: Math.PI * 0.94 + k * EPS * 1.7,
      w1: 0,
      w2: 0,
    }));
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = sim.current;

    seedArms();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      s.pivots = [0, 1, 2].map((i) => ({
        x: rect.width / 2 + (i - 1) * Math.min(300, rect.width * 0.3),
        y: rect.height * 0.3,
      }));
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const accel = (a: Arm): [number, number] => {
      const d = a.th1 - a.th2;
      const den = 2 * M1 + M2 - M2 * Math.cos(2 * d);
      const a1 =
        (-G * (2 * M1 + M2) * Math.sin(a.th1) -
          M2 * G * Math.sin(a.th1 - 2 * a.th2) -
          2 * Math.sin(d) * M2 * (a.w2 * a.w2 * L2 + a.w1 * a.w1 * L1 * Math.cos(d))) /
        (L1 * den);
      const a2 =
        (2 * Math.sin(d) *
          (a.w1 * a.w1 * L1 * (M1 + M2) +
            G * (M1 + M2) * Math.cos(a.th1) +
            a.w2 * a.w2 * L2 * M2 * Math.cos(d))) /
        (L2 * den);
      return [a1, a2];
    };

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dtFrame = Math.min((now - last) / 1000, 0.033);
      last = now;

      // Veil keeps long ghost trails
      ctx.fillStyle = "rgba(13,11,10,0.055)";
      ctx.fillRect(0, 0, s.w, s.h);

      const SUB = 4;
      const dt = dtFrame / SUB;
      for (let k = 0; k < 3; k++) {
        const a = s.arms[k];
        if (s.grabbed && s.grabbed.arm === k) continue;
        for (let sub = 0; sub < SUB; sub++) {
          const [al1, al2] = accel(a);
          a.w1 += al1 * dt;
          a.w2 += al2 * dt;
          a.th1 += a.w1 * dt;
          a.th2 += a.w2 * dt;
        }
      }

      // Draw
      for (let k = 0; k < 3; k++) {
        const a = s.arms[k];
        const P = s.pivots[k];
        const x1 = P.x + Math.sin(a.th1) * L1;
        const y1 = P.y + Math.cos(a.th1) * L1;
        const x2 = x1 + Math.sin(a.th2) * L2;
        const y2 = y1 + Math.cos(a.th2) * L2;

        ctx.strokeStyle = TRAIL_COLORS[k];
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(P.x, P.y);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = "#efe7d3";
        ctx.beginPath();
        ctx.arc(x1, y1, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = TRAIL_COLORS[k].replace("0.85", "1").replace("0.9", "1");
        ctx.beginPath();
        ctx.arc(x2, y2, 9, 0, Math.PI * 2);
        ctx.fill();

        // Pivot mount
        ctx.fillStyle = "#78716c";
        ctx.fillRect(P.x - 8, P.y - 8, 16, 16);
      }

      // Divergence metric between arm 0 and arm 2
      const A = s.arms[0];
      const C = s.arms[2];
      const dd =
        Math.abs(A.th1 - C.th1) + Math.abs(A.th2 - C.th2);
      s.divergence = (dd * 180) / Math.PI;

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const divTimer = setInterval(() => {
      setDivDeg(sim.current.divergence.toFixed(3));
    }, 220);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(divTimer);
    };
  }, []);

  const pickBob = (e: React.PointerEvent) => {
    const s = sim.current;
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (let k = 0; k < 3; k++) {
      const a = s.arms[k];
      const P = s.pivots[k];
      const x1 = P.x + Math.sin(a.th1) * L1;
      const y1 = P.y + Math.cos(a.th1) * L1;
      const x2 = x1 + Math.sin(a.th2) * L2;
      const y2 = y1 + Math.cos(a.th2) * L2;
      if (Math.hypot(x2 - mx, y2 - my) < 20) return { arm: k, bob: 2 as const };
      if (Math.hypot(x1 - mx, y1 - my) < 18) return { arm: k, bob: 1 as const };
    }
    return null;
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const hit = pickBob(e);
    if (!hit) return;
    sim.current.grabbed = hit;
    sim.current.grabVX = 0;
    sim.current.grabVY = 0;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    const grab = s.grabbed;
    if (!grab) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const a = s.arms[grab.arm];
    const P = s.pivots[grab.arm];

    if (grab.bob === 1) {
      const nth1 = Math.atan2(mx - P.x, my - P.y);
      a.w1 = ((nth1 - a.th1) / Math.max(0.008, 1 / 60)) * 0.12;
      a.th1 = nth1;
    } else {
      const x1 = P.x + Math.sin(a.th1) * L1;
      const y1 = P.y + Math.cos(a.th1) * L1;
      const nth2 = Math.atan2(mx - x1, my - y1);
      a.w2 = ((nth2 - a.th2) / Math.max(0.008, 1 / 60)) * 0.12;
      a.th2 = nth2;
    }
  };

  const onUp = () => {
    sim.current.grabbed = null;
  };

  const relaunch = () => {
    seedArms();
  };

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
          Chaos Bench
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Triple Interferometer · Δθ₀ = 10⁻⁴ rad
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Grab Either Bob — Re-Launch Trio
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Divergence">{divDeg}°</Readout>
        <button
          onClick={relaunch}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors pointer-events-auto"
        >
          Re-Launch
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-9 right-10 flex flex-col gap-2 pointer-events-none">
        {["ARM I", "ARM II", "ARM III"].map((label, i) => (
          <span key={label} className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] uppercase text-neutral-500">
            <span
              className="inline-block w-5 h-[3px]"
              style={{
                background: ["#fafaf9", "#fbbf24", "#ef4444"][i],
              }}
            />
            {label}
          </span>
        ))}
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

export default DoublePendulumChaos;
