"use client";

/**
 * Fourier Epicycle Drawer — a chain of rotating circles whose tip traces
 * the target path, reconstructing it as a sum of harmonics. WHEEL adds or
 * removes harmonics (the drawing sharpens from wobble to precision),
 * CLICK swaps the target shape (square → heart → star → saw). The traced
 * path decays through stepped amber tones so the recent stroke reads hot.
 */

import React, { useEffect, useRef, useState } from "react";

type ShapeKey = "SQUARE" | "HEART" | "STAR" | "SAW";

// Complex Fourier coefficients per shape: [re, im] per harmonic index k.
// Built once at module scope from dense point sampling + DFT.
function sampleShape(key: ShapeKey): [number, number][] {
  const pts: [number, number][] = [];
  const N = 256;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    let x = 0;
    let y = 0;
    if (key === "SQUARE") {
      // parametrize the unit square perimeter
      const u = i / N * 4;
      if (u < 1) { x = -1 + u * 2; y = -1; }
      else if (u < 2) { x = 1; y = -1 + (u - 1) * 2; }
      else if (u < 3) { x = 1 - (u - 2) * 2; y = 1; }
      else { x = -1; y = 1 - (u - 3) * 2; }
    } else if (key === "HEART") {
      x = 16 * Math.sin(t) ** 3;
      y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      x /= 17; y /= 17;
    } else if (key === "STAR") {
      // 5-point star outline via triangle-wave radius between outer/inner
      const spikes = 5;
      const u = ((spikes * i) / N) % 1; // 0..1 within one spike
      const tri = u < 0.5 ? u * 2 : 2 - u * 2; // 0→1→0
      const rad = 1.05 - 0.6 * tri; // outer 1.05 → inner 0.45
      x = Math.cos(t - Math.PI / 2) * rad;
      y = Math.sin(t - Math.PI / 2) * rad;
    } else {
      // horizontal sawtooth: pen sweeps left→right ramping upward, snaps back
      const s = i / N;
      x = s * 2.4 - 1.2;
      y = 0.7 - (s % (1 / 3)) * 3 * 1.4;
    }
    pts.push([x, y]);
  }
  return pts;
}

function dft(samples: [number, number][], maxK: number): { k: number; re: number; im: number }[] {
  const N = samples.length;
  const out: { k: number; re: number; im: number }[] = [];
  for (let k = 0; k <= maxK; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n++) {
      const a = (-2 * Math.PI * k * n) / N;
      re += samples[n][0] * Math.cos(a) - samples[n][1] * Math.sin(a);
      im += samples[n][0] * Math.sin(a) + samples[n][1] * Math.cos(a);
    }
    re /= N; im /= N;
    out.push({ k, re, im });
  }
  // draw big circles first: sort by amplitude desc but keep k order stable for chain
  return out;
}

const SHAPE_SAMPLES = new Map<ShapeKey, ReturnType<typeof sampleShape>>();
const SHAPE_DFT = new Map<ShapeKey, ReturnType<typeof dft>>();
const MAX_K = 40;

const SHAPES: ShapeKey[] = ["SQUARE", "HEART", "STAR", "SAW"];

export function FourierEpicycleDrawer() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    time: 0,
    harm: 12,
    shapeIdx: 0,
    trail: [] as { x: number; y: number }[],
  });

  const [hud, setHud] = useState({ harm: 12, shape: "SQUARE" as ShapeKey });

  useEffect(() => {
    for (const sh of SHAPES) {
      const sm = sampleShape(sh);
      SHAPE_SAMPLES.set(sh, sm);
      SHAPE_DFT.set(sh, dft(sm, MAX_K));
    }
  }, []);

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
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      s.time += dt;

      const shape = SHAPES[s.shapeIdx];
      const coeffs = SHAPE_DFT.get(shape) ?? [];

      ctx.fillStyle = "#0d0b08";
      ctx.fillRect(0, 0, s.w, s.h);

      const cx = s.w * 0.32;
      const cy = s.h * 0.5;
      const scale = Math.min(s.w, s.h) * 0.24;

      // ---- epicycle chain -------------------------------------------------
      let x = cx;
      let y = cy;
      ctx.lineWidth = 1.1;
      const active = Math.min(s.harm + 1, coeffs.length);

      // pair symmetric harmonics so the chain stays visually ordered
      const order: number[] = [];
      for (let k = 0; k <= MAX_K; k += 2) order.push(k, k + 1);
      let drawn = 0;
      for (const k of order) {
        if (k >= coeffs.length || drawn >= active) break;
        const c = coeffs[k];
        const amp = Math.hypot(c.re, c.im);
        if (amp < scale * 0.002) continue;
        const ph = s.time * k * 0.55 + Math.atan2(c.im, c.re);
        const nx = x + Math.cos(ph) * amp * scale;
        const ny = y + Math.sin(ph) * amp * scale;

        // circle
        ctx.strokeStyle = drawn === 0 ? "#f59e0b" : `rgba(245,158,11,${Math.max(0.06, 0.42 - drawn * 0.03)})`;
        ctx.beginPath();
        ctx.arc(x, y, amp * scale, 0, Math.PI * 2);
        ctx.stroke();

        // radius arm
        ctx.strokeStyle = "rgba(250,250,249,0.28)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        x = nx;
        y = ny;
        drawn++;
      }

      // tip
      ctx.beginPath();
      ctx.arc(x, y, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff7ed";
      ctx.fill();

      // trail (decaying stepped tones)
      s.trail.push({ x, y });
      const MAXT = 900;
      if (s.trail.length > MAXT) s.trail.splice(0, s.trail.length - MAXT);
      const TONES = ["#451a03", "#78350f", "#b45309", "#f59e0b", "#fde68a"];
      const BANDS = TONES.length;
      for (let b = 0; b < BANDS; b++) {
        const i0 = Math.floor((b * s.trail.length) / BANDS);
        const i1 = Math.floor(((b + 1) * s.trail.length) / BANDS);
        if (i1 - i0 < 2) continue;
        ctx.strokeStyle = TONES[b];
        ctx.lineWidth = 1.4 + b * 0.5;
        ctx.beginPath();
        for (let i = i0; i < i1; i++) {
          const p = s.trail[i];
          if (i === i0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // ghost of the true target on the right panel
      const gx = s.w * 0.74;
      const gy = s.h * 0.5;
      const samples = SHAPE_SAMPLES.get(shape) ?? [];
      ctx.strokeStyle = "rgba(120,113,108,0.5)";
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      samples.forEach((p, i) => {
        const px = gx + p[0] * scale;
        const py = gy + p[1] * scale;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(120,113,108,0.85)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("TARGET", gx, gy - scale - 18);

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.harm = Math.max(1, Math.min(MAX_K, s.harm + (e.deltaY < 0 ? 1 : -1)));
      setHud((h) => ({ ...h, harm: s.harm }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const swapShape = () => {
    const s = sim.current;
    s.shapeIdx = (s.shapeIdx + 1) % SHAPES.length;
    s.trail.length = 0;
    setHud((h) => ({ ...h, shape: SHAPES[s.shapeIdx] }));
  };

  return (
    <div
      ref={wrapRef}
      onClick={swapShape}
      className="relative h-screen w-full overflow-hidden bg-[#0d0b08] select-none cursor-pointer"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Fourier Epicycles
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Harmonic Circle Chain · Live Reconstruction
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Wheel — Harmonics {hud.harm}
          <br />
          Click — Swap Target Shape
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Target">{hud.shape}</Readout>
        <Readout label="Harmonics">{hud.harm}</Readout>
        <Readout label="Fidelity">
          {hud.harm >= 36 ? "EXACT" : hud.harm >= 18 ? "REFINED" : hud.harm >= 8 ? "SKETCHED" : "WOBBLING"}
        </Readout>
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

export default FourierEpicycleDrawer;
