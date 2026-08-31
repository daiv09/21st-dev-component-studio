"use client";

/**
 * Consensus Rack — five metronomes bolted to one freely-sliding platform.
 * Each tick shoves the cart sideways; the cart shoves every other pendulum
 * back through its pivot. Given time they lock into perfect unison — the
 * classic Kuramoto-style phase-transition demo. GRAB any arm mid-swing and
 * wreck the consensus; WHEEL tunes how loose the cart rolls; ORDER shows
 * the synchrony coefficient racing back toward 1.00.
 */

import React, { useEffect, useRef, useState } from "react";

const N = 5;
const G = 1500;
const L = 120;

export function SynchronizingMetronomes() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    th: new Float64Array(N),
    om: new Float64Array(N),
    env: new Float64Array(N).fill(0.01),
    px: 0,
    pv: 0,
    mobility: 1,
    held: -1,
    holdTh: 0,
    lastHoldX: 0,
    baseY: 0,
  });

  const [hud, setHud] = useState({ order: 0, mobility: 100 });

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
      s.baseY = rect.height * 0.62;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // desynchronised start
    for (let i = 0; i < N; i++) {
      s.th[i] = 0.6 + i * 0.9;
      s.om[i] = (i % 2 === 0 ? 1 : -1) * (1.2 + 0.2 * i);
    }

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dtFrame = Math.min((now - last) / 1000, 0.033);
      last = now;
      const SUB = 3;
      const dt = dtFrame / SUB;

      for (let sub = 0; sub < SUB; sub++) {
        // platform acceleration from pendulum reactions
        let fSum = 0;
        for (let i = 0; i < N; i++) {
          if (i === s.held) continue;
          fSum += 9.4 * Math.sin(s.th[i]); // horizontal shove per tick
        }
        const cartA =
          (-14 * s.pv - 26 * s.px) * s.mobility * 0.12 +
          (fSum * s.mobility) / 7;

        let pvNew = s.pv + cartA * dt;
        let pxNew = s.px + pvNew * dt;
        if (Math.abs(pxNew) > s.w * 0.06) {
          pxNew = Math.sign(pxNew) * s.w * 0.06;
          pvNew *= -0.4;
        }
        s.pv = pvNew;
        s.px = pxNew;

        const pivotAcc = (cartA); // d²x/dt² felt by pivots

        for (let i = 0; i < N; i++) {
          if (i === s.held) continue;
          const th = s.th[i];
          const om = s.om[i];

          // amplitude-governed escapement: pumps toward target swing
          const envNow = Math.abs(th);
          s.env[i] = Math.max(envNow, s.env[i] * Math.pow(0.985, dt * 60));
          const drive = 6.5 * (0.62 - Math.min(0.62, s.env[i])) * Math.sign(om);

          const alpha =
            -(G / L) * Math.sin(th) -
            0.32 * om +
            drive * (om !== 0 ? 1 : 1) -
            (pivotAcc / L) * Math.cos(th);

          s.om[i] = om + alpha * dt;
          s.th[i] = th + s.om[i] * dt;
          if (s.th[i] > 1.35) { s.th[i] = 1.35; s.om[i] *= -0.28; }
          if (s.th[i] < -1.35) { s.th[i] = -1.35; s.om[i] *= -0.28; }
        }
      }

      // ---- draw ----------------------------------------------------------
      ctx.fillStyle = "#0e0d0b";
      ctx.fillRect(0, 0, s.w, s.h);

      const cx = s.w / 2 + s.px;
      const unitW = Math.min(150, (s.w * 0.8) / N);

      // Rollers
      ctx.fillStyle = "#292524";
      ctx.fillRect(cx - (unitW * N) / 2 - 30, s.baseY + 64, unitW * N + 60, 10);

      // Cart
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(cx - (unitW * N) / 2, s.baseY, unitW * N, 64);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(cx - (unitW * N) / 2, s.baseY, unitW * N, 3);
      ctx.strokeStyle = "#44403c";
      ctx.strokeRect(cx - (unitW * N) / 2, s.baseY, unitW * N, 64);

      // Metronome cases + arms
      for (let i = 0; i < N; i++) {
        const mx = cx - (unitW * N) / 2 + unitW * (i + 0.5);
        // case (trapezoid)
        ctx.beginPath();
        ctx.moveTo(mx - unitW * 0.36, s.baseY);
        ctx.lineTo(mx - unitW * 0.22, s.baseY - 96);
        ctx.lineTo(mx + unitW * 0.22, s.baseY - 96);
        ctx.lineTo(mx + unitW * 0.36, s.baseY);
        ctx.closePath();
        ctx.fillStyle = "#211d18";
        ctx.fill();
        ctx.strokeStyle = "#3f3a32";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // scale ticks
        ctx.strokeStyle = "#57534e";
        ctx.lineWidth = 1;
        for (let t = -2; t <= 2; t++) {
          const ty = s.baseY - 30 - Math.abs(t) * 16;
          ctx.beginPath();
          ctx.moveTo(mx + t * 9 - 4, ty);
          ctx.lineTo(mx + t * 9 + 4, ty);
          ctx.stroke();
        }

        // arm
        const ax = mx;
        const ay = s.baseY - 34;
        const bx = ax + Math.sin(s.th[i]) * L * 0.72;
        const by = ay - Math.cos(s.th[i]) * L * 0.72;

        ctx.strokeStyle = i === s.held ? "#fbbf24" : "#d6d3d1";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // bob
        ctx.beginPath();
        ctx.arc(bx, by, 9, 0, Math.PI * 2);
        ctx.fillStyle = i === s.held ? "#fbbf24" : "#f59e0b";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // pivot screw
        ctx.beginPath();
        ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#a8a29e";
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      let cs = 0;
      let sn = 0;
      for (let i = 0; i < N; i++) {
        cs += Math.cos(sim.current.th[i]);
        sn += Math.sin(sim.current.th[i]);
      }
      setHud({
        order: Math.hypot(cs, sn) / N,
        mobility: Math.round(sim.current.mobility * 100),
      });
    }, 240);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const pickArm = (e: React.PointerEvent): number => {
    const s = sim.current;
    const wrap = wrapRef.current;
    if (!wrap) return -1;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const unitW = Math.min(150, (s.w * 0.8) / N);
    for (let i = 0; i < N; i++) {
      const mxCase = s.w / 2 + s.px - (unitW * N) / 2 + unitW * (i + 0.5);
      const ay = s.baseY - 34;
      const bx = mxCase + Math.sin(s.th[i]) * L * 0.72;
      const by = ay - Math.cos(s.th[i]) * L * 0.72;
      if (Math.hypot(bx - mx, by - my) < 26) return i;
    }
    return -1;
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const hit = pickArm(e);
    if (hit < 0) return;
    sim.current.held = hit;
    sim.current.lastHoldX = e.clientX;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.held < 0) return;
    const dxp = (e.clientX - s.lastHoldX) * 0.008;
    s.lastHoldX = e.clientX;
    s.th[s.held] = Math.max(-1.25, Math.min(1.25, s.th[s.held] + dxp));
    s.om[s.held] = dxp * 30;
  };

  const onUp = () => {
    sim.current.held = -1;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.mobility = Math.max(0.15, Math.min(3, s.mobility * (e.deltaY < 0 ? 1.08 : 0.9259)));
      setHud((h) => ({ ...h, mobility: Math.round(s.mobility * 100) }));
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
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Consensus Rack
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Coupled-Escapement Array · {N} Units
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Grab an Arm — Break Consensus
          <br />
          Wheel — Cart Mobility {hud.mobility}%
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Order Coefficient">{hud.order.toFixed(3)}</Readout>
        <Readout label="State">
          {hud.order > 0.92 ? "LOCKED" : hud.order > 0.55 ? "CONVERGING" : "SCRAMBLED"}
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

export default SynchronizingMetronomes;
