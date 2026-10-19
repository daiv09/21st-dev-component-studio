"use client";

/**
 * Euler Disk Bench — a spinning disc settling on its edge, the way a coin
 * collapses on a marble table. Real physics: finite-time singularity where
 * ω ~ (t₀−t)^(−1/6) and the slip friction makes that famous rising
 * whirring chatter rendered here as accelerating wobble ticks. DRAG a
 * circle on the disc to spin it harder, WHEEL tunes surface friction,
 * CLICK to drop it fresh. The readout tracks time-to-singularity and
 * instantaneous precession rate.
 */

import React, { useEffect, useRef, useState } from "react";

export function EulerDiskCollapse() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    // state
    t0: 4.2, // total settle duration target (s)
    age: 0, // seconds since release
    spinning: false,
    spinPhase: 0, // fast rotation angle of face markings
    leanAmp: 0.32, // current lean amplitude (rad-ish)
    leanPhase: 0, // precession angle of the lean direction
    leanOmega: 6,
    friction: 1,
    dragMode: false,
    dragAngle: 0,
    dragPower: 0,
    lastTickAge: 0,
    tickFlash: 0,
    collapsedT: 0,
  });

  const [hud, setHud] = useState({ omega: 0, remain: "—", spins: 0 });

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

    const launch = () => {
      s.age = 0;
      s.spinning = true;
      s.collapsedT = 0;
      s.lastTickAge = 0;
      s.t0 = 3.2 + Math.random() * 1.8 + s.dragPower * 2.4;
      s.dragPower = 0;
    };

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.033);
      last = nowMs;

      if (s.spinning) {
        s.age += dt;
        const remain = Math.max(0.0001, s.t0 - s.age);

        // Euler-disk scaling laws: precession rate diverges as (t0-t)^(-1/3)
        // in the ideal model; we use a gentler -1/4 for visual sanity.
        const base = Math.pow(remain / s.t0, -0.25) * 7.5;
        s.leanOmega = base * Math.sqrt(s.friction);
        s.leanPhase += s.leanOmega * dt;

        // lean amplitude decays toward collapse; brief rebalancing bumps
        s.leanAmp = Math.pow(Math.max(remain, 0.02) / s.t0, 0.42) * 0.34;

        // spin phase slows then locks to the precession near the end
        s.spinPhase += (base * 0.55 + 2.2 * Math.pow(remain / s.t0, 0.3)) * dt;

        // audible-tick analogue: flash when lean crosses low point
        const tickEvery = Math.max(0.03, 1.4 / Math.max(s.leanOmega, 0.001));
        if (s.age - s.lastTickAge > tickEvery) {
          s.lastTickAge = s.age;
          s.tickFlash = 1;
        }
        s.tickFlash = Math.max(0, s.tickFlash - dt * 9);

        if (remain <= 0.05) {
          s.spinning = false;
          s.collapsedT = 0.001;
          s.leanAmp = 0;
        }
      } else if (s.collapsedT > 0) {
        s.collapsedT += dt;
      }

      ctx.fillStyle = "#100d0a";
      ctx.fillRect(0, 0, s.w, s.h);

      // ---- table surface -----------------------------------------------------
      const cx = s.w / 2;
      const cy = s.h * 0.56;
      const R = Math.min(s.w, s.h) * 0.26;

      ctx.strokeStyle = "rgba(120,113,108,0.16)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy + 30, R * (1.35 + i * 0.22), 0, Math.PI * 2);
        ctx.stroke();
      }
      // contact shadow — hard ellipse under the disc, tightens as it flattens
      const flat = 1 - Math.min(1, s.leanAmp / 0.34);
      ctx.beginPath();
      ctx.ellipse(cx, cy + 34, R * (1.06 + 0.16 * (1 - flat)), R * 0.24 * (1 + flat), 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();

      // ---- the disc ------------------------------------------------------------
      // projected ellipse: rim squash from viewing angle + dynamic lean
      const squash = 0.24 + 0.62 * (s.leanAmp / 0.34) * (0.4 + 0.6 * Math.cos(s.leanPhase));
      const tiltX = Math.sin(s.leanPhase) * s.leanAmp * 60;
      const tiltY = -Math.abs(Math.cos(s.leanPhase)) * s.leanAmp * 18;

      ctx.save();
      ctx.translate(cx + tiltX * 0.4, cy + tiltY);
      ctx.rotate(tiltX * 0.004);

      // rim (side band)
      ctx.beginPath();
      ctx.ellipse(0, 0, R, Math.max(R * 0.14, R * Math.abs(squash)), 0, 0, Math.PI * 2);
      ctx.fillStyle = "#b45309";
      ctx.fill();

      // face — rotating marker pattern so spin is legible
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, -4, R * 0.985, Math.max(R * 0.13, R * Math.abs(squash)) * 0.96, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(-R, -R, R * 2, R * 2);
      // spokes
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 3;
      for (let k = 0; k < 8; k++) {
        const a = s.spinPhase + (k * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R * Math.max(0.16, Math.abs(squash)));
        ctx.stroke();
      }
      // hub ring
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.22, R * 0.22 * Math.max(0.16, Math.abs(squash)), 0, 0, Math.PI * 2);
      ctx.strokeStyle = "#fff7ed";
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.restore();

      // rim highlight arc (specular cap, hard two-tone)
      ctx.beginPath();
      ctx.ellipse(0, -4, R * 0.985, Math.max(R * 0.13, R * Math.abs(squash)) * 0.96, 0, Math.PI * 1.15, Math.PI * 1.85);
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 2.6;
      ctx.stroke();

      ctx.restore();

      // contact point tick flash — the "chatter"
      if (s.tickFlash > 0 && s.spinning) {
        ctx.beginPath();
        ctx.arc(cx + tiltX * 0.4, cy + R * Math.max(0.14, Math.abs(squash)) + 12, 4 + s.tickFlash * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239,68,68,${s.tickFlash})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // collapsed rest state
      if (!s.spinning && s.collapsedT > 0) {
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(250,250,249,0.75)";
        ctx.fillText("SINGULARITY REACHED — CLICK TO RELAUNCH", cx, cy + R + 64);
      }

      // drag power meter while dragging a spin
      if (s.dragMode) {
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`SPIN CHARGE ${Math.round(s.dragPower * 100)}%`, cx, cy - R - 40);
      }

      hudAcc += dt;
      if (hudAcc > 0.2) {
        hudAcc = 0;
        const remain = Math.max(0, s.t0 - s.age);
        setHud({
          omega: s.spinning ? Math.round(s.leanOmega * 57.3) : 0,
          remain: s.spinning ? `${remain.toFixed(2)} s` : "0.00 s",
          spins: Math.round(s.spinPhase / (Math.PI * 2)),
        });
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const s = sim.current;
    s.dragMode = true;
    s.dragAngle = 0;
    s.dragPower = 0;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (!s.dragMode) return;
    s.dragAngle += e.movementX * 0.01;
    s.dragPower = Math.min(1, Math.abs(s.dragAngle) / 6);
  };

  const onUp = () => {
    const s = sim.current;
    if (!s.dragMode) return;
    s.dragMode = false;
    // launch with energy proportional to circular drag distance
    s.t0 = 2.6 + s.dragPower * 3.4;
    s.age = 0;
    s.spinning = true;
    s.collapsedT = 0;
    s.lastTickAge = 0;
    s.dragPower = 0;
  };

  const onClick = () => {
    const s = sim.current;
    if (!s.spinning && !s.dragMode) {
      s.t0 = 3.4 + Math.random() * 1.4;
      s.age = 0;
      s.spinning = true;
      s.collapsedT = 0;
      s.lastTickAge = 0;
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const f = sim.current.friction;
      sim.current.friction = Math.max(0.45, Math.min(2.2, f * (e.deltaY < 0 ? 1.08 : 0.9259)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={wrapRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={onClick}
      className="relative h-screen w-full overflow-hidden bg-[#100d0a] select-none touch-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-grab active:cursor-grabbing" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Euler Disk Bench
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Finite-Time Collapse · ω ∝ (t₀−t)⁻¹ᐟ⁴
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag Circle — Charge Spin · Click — Quick Drop
          <br />
          Wheel — Surface Friction
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Precession">{hud.omega}°/s</Readout>
        <Readout label="To Collapse">{hud.remain}</Readout>
        <Readout label="Revolutions">{hud.spins}</Readout>
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

export default EulerDiskCollapse;
