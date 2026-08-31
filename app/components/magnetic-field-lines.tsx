"use client";

/**
 * Field Line Bench — two magnetic poles on a plotting table. Field lines
 * are integrated live from each pole by following the local B-vector, so
 * the whole web re-draws itself every time you DRAG a pole, FLIP polarity
 * (double-click a pole) or WHEEL the pole strength. A compass needle grid
 * samples the same field underneath.
 */

import React, { useEffect, useRef, useState } from "react";

interface Pole {
  x: number;
  y: number;
  q: number; // +1 north (out), −1 south (in)
  strength: number;
}

const STEPS = 260;
const STEP_LEN = 3.2;

export function MagneticFieldLines() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    poles: [
      { x: 0, y: 0, q: 1, strength: 1 },
      { x: 0, y: 0, q: -1, strength: 1 },
    ] as Pole[],
    dragged: -1,
    t: 0,
  });

  const [hud, setHud] = useState({ q1: "N", q2: "S", s1: 100 });

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
      if (s.poles[0].x === 0 && s.poles[0].y === 0) {
        s.poles[0].x = rect.width * 0.36;
        s.poles[0].y = rect.height * 0.5;
        s.poles[1].x = rect.width * 0.64;
        s.poles[1].y = rect.height * 0.5;
      }
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // field vector at point
    const fieldAt = (x: number, y: number): [number, number] => {
      let bx = 0;
      let by = 0;
      for (const p of sim.current.poles) {
        const dx = x - p.x;
        const dy = y - p.y;
        const r2 = dx * dx + dy * dy + 140;
        const inv = (p.q * p.strength * 90000) / (r2 * Math.sqrt(r2));
        bx += dx * inv;
        by += dy * inv;
      }
      return [bx, by];
    };

    let raf = 0;

    const step = (now: number) => {
      void now;
      ctx.fillStyle = "#0e0d0b";
      ctx.fillRect(0, 0, s.w, s.h);

      // compass grid
      const GRID = 64;
      ctx.lineWidth = 1;
      for (let gx = GRID / 2; gx < s.w; gx += GRID) {
        for (let gy = GRID / 2; gy < s.h; gy += GRID) {
          const [bx, by] = fieldAt(gx, gy);
          const m = Math.hypot(bx, by);
          if (m < 0.0005) continue;
          const ux = bx / m;
          const uy = by / m;
          const len = 7;
          ctx.strokeStyle = "rgba(120,113,108,0.4)";
          ctx.beginPath();
          ctx.moveTo(gx - ux * len, gy - uy * len);
          ctx.lineTo(gx + ux * len, gy + uy * len);
          ctx.stroke();
          // arrowhead
          ctx.beginPath();
          ctx.moveTo(gx + ux * len, gy + uy * len);
          ctx.lineTo(gx + ux * len - (ux * 3 - uy * 2), gy + uy * len - (uy * 3 + ux * 2));
          ctx.moveTo(gx + ux * len, gy + uy * len);
          ctx.lineTo(gx + ux * len - (ux * 3 + uy * 2), gy + uy * len - (uy * 3 - ux * 2));
          ctx.stroke();
        }
      }

      // field lines from seed rings around each pole
      for (let pi = 0; pi < s.poles.length; pi++) {
        const p = s.poles[pi];
        const SEEDS = 14;
        for (let k = 0; k < SEEDS; k++) {
          const ang = (k / SEEDS) * Math.PI * 2 + pi * 0.22;
          let x = p.x + Math.cos(ang) * 16;
          let y = p.y + Math.sin(ang) * 16;
          ctx.strokeStyle = p.q > 0 ? "rgba(251,191,36,0.8)" : "rgba(250,250,249,0.75)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          let escaped = false;
          for (let i = 0; i < STEPS; i++) {
            const [bx, by] = fieldAt(x, y);
            const m = Math.hypot(bx, by);
            if (m < 1e-6) break;
            x += (bx / m) * STEP_LEN * (p.q > 0 ? 1 : -1);
            y += (by / m) * STEP_LEN * (p.q > 0 ? 1 : -1);
            if (
              x < -40 || x > s.w + 40 || y < -40 || y > s.h + 40
            ) {
              escaped = true;
              break;
            }
            // terminate when entering the opposite pole core
            const other = s.poles[1 - pi];
            if (Math.hypot(x - other.x, y - other.y) < 14) break;
            if (i % 2 === 0) ctx.lineTo(x, y);
          }
          ctx.stroke();
          void escaped;
        }
      }

      // poles
      for (const p of s.poles) {
        const isDrag = s.poles.indexOf(p) === s.dragged;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = p.q > 0 ? "#f59e0b" : "#efe7d3";
        ctx.fill();
        ctx.strokeStyle = "#0e0d0b";
        ctx.lineWidth = 3;
        ctx.stroke();
        if (isDrag) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 21, 0, Math.PI * 2);
          ctx.strokeStyle = "#fbbf24";
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.6;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = "#14110c";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.q > 0 ? "N" : "S", p.x, p.y + 1);
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      setHud({
        q1: sim.current.poles[0].q > 0 ? "N" : "S",
        q2: sim.current.poles[1].q > 0 ? "N" : "S",
        s1: Math.round(sim.current.poles[0].strength * 100),
      });
    }, 300);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const pickPole = (e: React.PointerEvent): number => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = -1;
    let bestD = 30;
    sim.current.poles.forEach((p, i) => {
      const d = Math.hypot(p.x - mx, p.y - my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const hit = pickPole(e);
    sim.current.dragged = hit;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.dragged < 0) return;
    const rect = wrapRef.current!.getBoundingClientRect();
    s.poles[s.dragged].x = Math.max(30, Math.min(s.w - 30, e.clientX - rect.left));
    s.poles[s.dragged].y = Math.max(30, Math.min(s.h - 30, e.clientY - rect.top));
  };

  const onUp = () => {
    sim.current.dragged = -1;
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const hit = pickPole(e as unknown as React.PointerEvent);
    if (hit < 0) return;
    sim.current.poles[hit].q *= -1;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.poles[0].strength = Math.max(0.25, Math.min(2.4, s.poles[0].strength * (e.deltaY < 0 ? 1.08 : 0.9259)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0e0d0b] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={onDoubleClick}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Field Line Bench
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Dipole Plotter · Live Integration
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — Move Pole
          <br />
          Dbl-Click — Flip Polarity · Wheel — Strength {hud.s1}%
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Pole A">{hud.q1}</Readout>
        <Readout label="Pole B">{hud.q2}</Readout>
        <Readout label="Config">
          {hud.q1 !== hud.q2 ? "DIPOLE" : "QUADRUPOLE-LIKE"}
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

export default MagneticFieldLines;
