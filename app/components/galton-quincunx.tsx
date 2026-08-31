"use client";

/**
 * Galton Quincunx — real balls, real bounces, live statistics. Spheres fall
 * through a triangular peg field, scatter off each contact with restitution
 * and micro-jitter, and settle into bins whose histogram grows under the
 * bell of the theoretical binomial overlay. CLICK the board (or POUR) to
 * release a fresh volley; WHEEL bends the clock from real-time down to 10%
 * slow-motion so individual collisions become readable. MEAN/σ readouts are
 * computed from the landed population, never faked.
 */

import React, { useEffect, useRef, useState } from "react";

const ROWS = 12;
const PEG_R = 4.5;
const BALL_R = 5;
const GRAV = 1500;
const RESTITUTION = 0.52;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function GaltonQuincunx() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const world = useRef({
    w: 0,
    h: 0,
    pegs: [] as { x: number; y: number }[],
    balls: [] as Ball[],
    counts: new Int32Array(ROWS + 1),
    timeScale: 1,
    pourQueue: 0,
    pourTimer: 0,
    slotPitch: 40,
    topY: 90,
    lastPegY: 0,
    binTopY: 0,
    landedTotal: 0,
  });

  const [stats, setStats] = useState({ n: 0, mean: 0, sd: 0 });
  const [slowmo, setSlowmo] = useState(100);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = world.current;

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.w = rect.width;
      s.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Layout: pegs occupy upper 62%, bins lower band
      s.topY = Math.max(80, s.h * 0.13);
      s.lastPegY = s.h * 0.58;
      const rowGap = (s.lastPegY - s.topY) / (ROWS - 1);
      const cx = s.w / 2;
      s.slotPitch = Math.max(24, Math.min(46, ((s.w * 0.72) / ROWS) | 0));
      s.pegs = [];
      for (let r = 0; r < ROWS; r++) {
        const y = s.topY + r * rowGap;
        const n = r + 2; // row lengths 2..ROWS+1 pegs
        const startX = cx - ((n - 1) / 2) * s.slotPitch;
        for (let i = 0; i < n; i++) {
          s.pegs.push({ x: startX + i * s.slotPitch, y });
        }
      }
      s.binTopY = s.lastPegY + rowGap * 0.9;
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(wrap);

    const spawnBall = () => {
      const cx = s.w / 2;
      s.balls.push({
        x: cx + (Math.random() - 0.5) * 8,
        y: s.topY - 60 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 30,
        vy: 40,
      });
      if (s.balls.length > 500) s.balls.shift();
    };

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      let dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      dt *= s.timeScale;

      // Pour queue dribbles balls out one by one
      if (s.pourQueue > 0) {
        s.pourTimer -= dt;
        if (s.pourTimer <= 0) {
          spawnBall();
          s.pourQueue--;
          s.pourTimer = 0.05;
        }
      }

      // Physics
      const floorY = s.h - 26;
      for (let i = s.balls.length - 1; i >= 0; i--) {
        const b = s.balls[i];
        b.vy += GRAV * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Peg collisions
        for (const p of s.pegs) {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const rr = BALL_R + PEG_R;
          const d2 = dx * dx + dy * dy;
          if (d2 < rr * rr && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            // push out
            b.x = p.x + nx * rr;
            b.y = p.y + ny * rr;
            const vn = b.vx * nx + b.vy * ny;
            if (vn < 0) {
              b.vx -= (1 + RESTITUTION) * vn * nx;
              b.vy -= (1 + RESTITUTION) * vn * ny;
              // micro-jitter decides left/right life paths
              b.vx += (Math.random() - 0.5) * 26;
            }
          }
        }

        // Funnel + outer walls
        const wallPad = s.slotPitch * 1.15;
        if (b.x < s.w / 2 - wallPad && b.y < s.binTopY) {
          b.x = s.w / 2 - wallPad;
          b.vx = Math.abs(b.vx) * 0.6;
        }
        if (b.x > s.w / 2 + wallPad && b.y < s.binTopY) {
          b.x = s.w / 2 + wallPad;
          b.vx = -Math.abs(b.vx) * 0.6;
        }

        // Land in a bin
        if (b.y >= floorY - BALL_R) {
          const slot = Math.max(
            0,
            Math.min(ROWS, Math.round((b.x - s.w / 2) / s.slotPitch))
          );
          s.counts[slot]++;
          s.landedTotal++;
          s.balls.splice(i, 1);
        }
      }

      // ---- draw ----------------------------------------------------------
      ctx.fillStyle = "#0c0d09";
      ctx.fillRect(0, 0, s.w, s.h);
      ctx.fillStyle = "#d6d3d1";
      for (const p of s.pegs) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PEG_R, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bins: baseline + dividers
      ctx.strokeStyle = "#3f3f36";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.w / 2 - s.slotPitch * (ROWS / 2 + 1), floorY);
      ctx.lineTo(s.w / 2 + s.slotPitch * (ROWS / 2 + 1), floorY);
      ctx.stroke();

      // Histogram bars (lime, hard edges)
      const maxC = Math.max(8, ...Array.from(s.counts));
      const barW = s.slotPitch - 7;
      for (let k = 0; k <= ROWS; k++) {
        const bx = s.w / 2 + (k - 0.5) * s.slotPitch - barW / 2;
        const bh = ((floorY - s.binTopY) * s.counts[k]) / maxC;
        if (bh > 0.5) {
          ctx.fillStyle = "#a3e635";
          ctx.fillRect(bx, floorY - bh, barW, bh);
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fillRect(bx, floorY - bh, barW, 2);
        }
      }

      // Theoretical binomial overlay (stepped dashed)
      const comb = (n: number, k: number): number => {
        let r = 1;
        for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
        return r;
      };
      ctx.strokeStyle = "rgba(245,158,11,0.75)";
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const N = ROWS;
      for (let k = 0; k <= N; k++) {
        const prob = comb(N, k) / Math.pow(2, N);
        const expect = prob * Math.max(s.landedTotal, 60);
        const yExpected = floorY - ((floorY - s.binTopY) * expect) / maxC;
        const xMid = s.w / 2 + k * s.slotPitch;
        if (k === 0) ctx.moveTo(xMid, yExpected);
        else ctx.lineTo(xMid, yExpected);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Balls
      ctx.fillStyle = "#fafaf9";
      for (const b of s.balls) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const statTimer = setInterval(() => {
      let sum = 0;
      let n = 0;
      for (let k = 0; k < s.counts.length; k++) {
        sum += k * s.counts[k];
        n += s.counts[k];
      }
      if (n === 0) {
        setStats({ n: 0, mean: 0, sd: 0 });
        return;
      }
      const mean = sum / n;
      let varAcc = 0;
      for (let k = 0; k < s.counts.length; k++) varAcc += s.counts[k] * (k - mean) ** 2;
      setStats({ n, mean, sd: Math.sqrt(varAcc / n) });
    }, 300);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(statTimer);
    };
  }, []);

  const pour = (count: number) => {
    world.current.pourQueue += count;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = world.current;
      s.timeScale = Math.min(1, Math.max(0.08, s.timeScale * (e.deltaY < 0 ? 1.12 : 0.893)));
      setSlowmo(Math.round(s.timeScale * 100));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0c0d09] select-none">
      <div ref={wrapRef} className="absolute inset-0 touch-none">
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-lime-300 uppercase">
          Galton Quincunx
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Stochastic Proving Board · {ROWS} Rows
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Click Board / POUR — Release Volleys
          <br />
          Wheel — Time Scale {slowmo}%
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-10">
        <button
          onClick={() => pour(40)}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-lime-900 text-lime-300 hover:bg-lime-900/30 transition-colors"
        >
          Pour ×40
        </button>
        <Readout label="Landed">{stats.n}</Readout>
        <Readout label="Mean">{stats.n ? stats.mean.toFixed(2) : "—"}</Readout>
        <Readout label="σ Sample">{stats.n ? stats.sd.toFixed(2) : "—"}</Readout>
        <Readout label="σ Theory">{Math.sqrt(ROWS / 4).toFixed(2)}</Readout>
      </div>

      {/* Click anywhere also pours */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => pour(12)}
        style={{ zIndex: 5 }}
      />
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 pointer-events-none z-10">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-lg text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

export default GaltonQuincunx;
