"use client";

/**
 * Phyllotaxis Bloom — a sunflower head built from Vogel's model, seed i at
 * radius c·√i and angle i·α. α sits on the golden angle (≈137.508°) where
 * the packing is perfect; WHEEL detunes it and the spiral arms collapse,
 * shear and re-bloom into entirely different lattices. The pointer is a
 * repulsion field — sweep it through the seed head and the florets part
 * like water, then ease home.
 */

import React, { useEffect, useRef, useState } from "react";

const SEEDS = 480;
const GOLDEN = 137.50776405003785;

const TONES = ["#365314", "#4d7c0f", "#65a30d", "#a3e635", "#d9f99d"];

export function PhyllotaxisBloom() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    alpha: GOLDEN,
    targetAlpha: GOLDEN,
    offX: new Float32Array(SEEDS),
    offY: new Float32Array(SEEDS),
    px: -9999,
    py: -9999,
    spin: 0,
  });

  const [hud, setHud] = useState({ angle: GOLDEN, mode: "PHYLLOTAXIS" });

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

      s.alpha += (s.targetAlpha - s.alpha) * Math.min(1, dt * 5);
      s.spin += dt * 2.2;

      ctx.fillStyle = "#0b100a";
      ctx.fillRect(0, 0, s.w, s.h);

      const cx = s.w / 2;
      const cy = s.h / 2;
      const c = Math.min(s.w, s.h) * 0.043; // spacing constant
      const alphaRad = (s.alpha * Math.PI) / 180;
      const R_MAX = Math.min(s.w, s.h) * 0.44;

      for (let i = 0; i < SEEDS; i++) {
        const r = c * Math.sqrt(i);
        if (r > R_MAX + 60) break;
        const th = i * alphaRad + s.spin * 0.05;
        let x = cx + Math.cos(th) * r;
        let y = cy + Math.sin(th) * r;

        // pointer repulsion field with eased memory
        let tx = 0;
        let ty = 0;
        const dxp = x - s.px;
        const dyp = y - s.py;
        const dp = Math.hypot(dxp, dyp);
        if (dp < 130 && dp > 0.5) {
          const f = (1 - dp / 130) ** 2 * 46;
          tx = (dxp / dp) * f;
          ty = (dyp / dp) * f;
        }
        s.offX[i] += (tx - s.offX[i]) * Math.min(1, dt * 6);
        s.offY[i] += (ty - s.offY[i]) * Math.min(1, dt * 6);
        x += s.offX[i];
        y += s.offY[i];

        // size swells slightly toward rim; tone by radial band
        const band = Math.min(TONES.length - 1, Math.floor((r / (R_MAX + 1)) * TONES.length));
        const rad = 2.4 + (i / SEEDS) * 3.4;

        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = TONES[band];
        ctx.fill();
        if (i % 8 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fill();
        }
      }

      // golden-angle reticle
      ctx.strokeStyle = "rgba(163,230,53,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R_MAX, 0, Math.PI * 2);
      ctx.stroke();

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      setHud({
        angle: sim.current.targetAlpha,
        mode:
          Math.abs(sim.current.targetAlpha - GOLDEN) < 0.08
            ? "PHYLLOTAXIS"
            : "DETUNED",
      });
    }, 200);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const trackPointer = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    sim.current.px = e.clientX - rect.left;
    sim.current.py = e.clientY - rect.top;
  };

  const onLeave = () => {
    sim.current.px = -9999;
    sim.current.py = -9999;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.targetAlpha = Math.max(120, Math.min(155, s.targetAlpha + (e.deltaY < 0 ? 0.25 : -0.25)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const recenter = () => {
    sim.current.targetAlpha = GOLDEN;
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={trackPointer}
      onPointerLeave={onLeave}
      className="relative h-screen w-full overflow-hidden bg-[#0b100a] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-lime-300 uppercase">
          Phyllotaxis Bloom
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Vogel Model · {SEEDS} Florets
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Wheel — Divergence Angle
          <br />
          Pointer — Repulsion Field
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Divergence">{sim.current.targetAlpha.toFixed(3)}°</Readout>
        <Readout label="Regime">{hud.mode}</Readout>
        <button
          onClick={recenter}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-lime-900 text-lime-300 hover:bg-lime-900/30 transition-colors pointer-events-auto"
        >
          Golden
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

export default PhyllotaxisBloom;
