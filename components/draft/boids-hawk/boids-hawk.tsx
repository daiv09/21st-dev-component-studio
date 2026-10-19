"use client";

/**
 * Boids & Hawk — a starling murmuration running the classic three rules
 * (separation, alignment, cohesion) plus one more: terror. Your cursor is
 * the hawk; the flock shreds around it in real time. CLICK plants a roost
 * beacon the birds spiral toward and settle around — click again anywhere
 * to move the roost and watch the murmuration reorganise itself across the
 * stage.
 */

import React, { useEffect, useRef, useState } from "react";

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const N = 130;
const MAX_SPD = 240;
const MIN_SPD = 70;

export function BoidsHawk() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    boids: [] as Boid[],
    hawk: { x: -9999, y: -9999, inside: false },
    roost: null as { x: number; y: number } | null,
  });

  const [hud, setHud] = useState({ order: 0, mode: "FREE" });

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
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    for (let i = 0; i < N; i++) {
      s.boids.push({
        x: Math.random() * s.w,
        y: Math.random() * s.h,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
      });
    }

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      // Veil for motion trails
      ctx.fillStyle = "rgba(12,11,9,0.34)";
      ctx.fillRect(0, 0, s.w, s.h);

      let sumVX = 0;
      let sumVY = 0;

      for (const b of s.boids) {
        let axSep = 0, aySep = 0;
        let axAli = 0, ayAli = 0;
        let axCoh = 0, ayCoh = 0;
        let neighbors = 0;

        for (const o of s.boids) {
          if (o === b) continue;
          const dx = o.x - b.x;
          const dy = o.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 90 * 90 || d2 < 0.01) continue;
          neighbors++;
          axAli += o.vx;
          ayAli += o.vy;
          axCoh += dx;
          ayCoh += dy;
          if (d2 < 26 * 26) {
            const d = Math.sqrt(d2);
            axSep -= (dx / d) * (1 - d / 26) * 900;
            aySep -= (dy / d) * (1 - d / 26) * 900;
          }
        }
        if (neighbors > 0) {
          // alignment → match average heading
          axAli -= b.vx;
          ayAli -= b.vy;
        }

        let ax =
          axSep * 1.0 + axAli * 0.9 + axCoh * 1.4 +
          Math.sin(t * 1.3 + b.x * 0.01) * 14;
        let ay =
          aySep * 1.0 + ayAli * 0.9 + ayCoh * 1.4 +
          Math.cos(t * 1.1 + b.y * 0.01) * 14;

        // Hawk terror
        if (s.hawk.inside) {
          const dxh = b.x - s.hawk.x;
          const dyh = b.y - s.hawk.y;
          const dh = Math.hypot(dxh, dyh);
          if (dh < 210 && dh > 1) {
            const f = (1 - dh / 210) ** 2 * 5200;
            ax += (dxh / dh) * f;
            ay += (dyh / dh) * f;
          }
        }

        // Roost attraction (orbiting offset keeps it alive-looking)
        if (s.roost) {
          const dxr = s.roost.x + Math.cos(t * 0.8 + b.x * 0.02) * 40 - b.x;
          const dyr = s.roost.y + Math.sin(t * 0.8 + b.y * 0.02) * 40 - b.y;
          const dr = Math.hypot(dxr, dyr);
          if (dr > 46) {
            const f = Math.min(340, dr * 1.7);
            ax += (dxr / dr) * f;
            ay += (dyr / dr) * f;
          } else if (dr < 30 && dr > 1) {
            ax -= (dxr / dr) * 220;
            ay -= (dyr / dr) * 220;
          }
        }

        // Soft walls
        const M = 70;
        if (b.x < M) ax += (M - b.x) * 6;
        if (b.x > s.w - M) ax -= (b.x - (s.w - M)) * 6;
        if (b.y < M) ay += (M - b.y) * 6;
        if (b.y > s.h - M) ay -= (b.y - (s.h - M)) * 6;

        b.vx += ax * dt;
        b.vy += ay * dt;

        const spd = Math.hypot(b.vx, b.vy);
        if (spd > MAX_SPD) {
          b.vx = (b.vx / spd) * MAX_SPD;
          b.vy = (b.vy / spd) * MAX_SPD;
        } else if (spd < MIN_SPD && spd > 0.01) {
          b.vx = (b.vx / spd) * MIN_SPD;
          b.vy = (b.vy / spd) * MIN_SPD;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        sumVX += b.vx / (spd || 1);
        sumVY += b.vy / (spd || 1);

        // Draw bird as oriented tick
        const ang = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(ang);
        ctx.strokeStyle = "rgba(250,250,246,0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(6, 0);
        ctx.moveTo(6, 0);
        ctx.lineTo(1.5, -3.4);
        ctx.moveTo(6, 0);
        ctx.lineTo(1.5, 3.4);
        ctx.stroke();
        ctx.restore();
      }

      // Roost marker
      if (s.roost) {
        ctx.strokeStyle = "#a3e635";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.roost.x, s.roost.y, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s.roost.x, s.roost.y, 22, 0, Math.PI * 2);
        ctx.setLineDash([3, 7]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Hawk reticle
      if (s.hawk.inside) {
        ctx.strokeStyle = "rgba(239,68,68,0.8)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(s.hawk.x, s.hawk.y, 16, 0, Math.PI * 2);
        ctx.moveTo(s.hawk.x - 24, s.hawk.y);
        ctx.lineTo(s.hawk.x - 8, s.hawk.y);
        ctx.moveTo(s.hawk.x + 8, s.hawk.y);
        ctx.lineTo(s.hawk.x + 24, s.hawk.y);
        ctx.stroke();
      }

      const orderVal = Math.hypot(sumVX, sumVY) / N;
      void orderVal;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      let sx = 0, sy = 0;
      for (const b of s.boids) {
        const sp = Math.hypot(b.vx, b.vy) || 1;
        sx += b.vx / sp;
        sy += b.vy / sp;
      }
      setHud({
        order: Math.hypot(sx, sy) / s.boids.length,
        mode: s.roost ? "ROOST" : "FREE",
      });
    }, 260);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    sim.current.hawk.x = e.clientX - rect.left;
    sim.current.hawk.y = e.clientY - rect.top;
    sim.current.hawk.inside = true;
  };

  const onLeave = () => {
    sim.current.hawk.inside = false;
    sim.current.hawk.x = -9999;
  };

  const onClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    sim.current.roost = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0c0b09] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={onClick}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Murmuration Bench
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          {N} Starlings · Predator Response Study
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Pointer — Hawk · Click — Plant Roost
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Flock">{N}</Readout>
        <Readout label="Polarisation">{hud.order.toFixed(2)}</Readout>
        <Readout label="Regime">{hud.mode}</Readout>
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

export default BoidsHawk;
