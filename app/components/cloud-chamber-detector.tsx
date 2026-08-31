"use client";

/**
 * Cloud Chamber Detector — a live vapour tray where decays write their own
 * biographies. Electrons corkscrew tightly, muon arcs sweep wide, alphas
 * leave fat stubs, photons cut dead straight — all bent in real time by the
 * solenoid field you tune with the WHEEL. Park the pointer in the vapour to
 * add a local lens of field that visibly kinks passing tracks.
 */

import React, { useEffect, useRef, useState } from "react";

interface Track {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  q: number; // charge in units of e
  kind: "electron" | "muon" | "alpha" | "photon";
  born: number;
  life: number; // seconds
}

const KIND_COLOR: Record<Track["kind"], string> = {
  electron: "#a7f3d0",
  muon: "#34d399",
  alpha: "#d4a24e",
  photon: "rgba(250,250,249,0.55)",
};
const KIND_W: Record<Track["kind"], number> = {
  electron: 1,
  muon: 1.6,
  alpha: 2.6,
  photon: 1,
};

export function CloudChamberDetector() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    field: 0.55, // signed, arbitrary units
    tracks: [] as Track[],
    spawnAcc: 0,
    pointer: { x: -9999, y: -9999, inside: false },
    rate: 0,
  });

  const [hud, setHud] = useState({ fieldMt: 0, tracks: 0, rate: 0 });

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

    const spawn = () => {
      if (s.tracks.length > 300) return;
      const roll = Math.random();
      let t: Track;
      const edge = Math.random();
      // enter from random border point
      let x = Math.random() * s.w;
      let y = 0;
      if (edge < 0.5) y = 0;
      else if (edge < 0.75) y = s.h;
      else {
        x = 0;
        y = Math.random() * s.h;
        if (Math.random() < 0.5) x = s.w;
      }
      const ang =
        edge < 0.75
          ? Math.PI / 2 + (Math.random() - 0.5) * 1.1
          : (x === 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 1.4;
      if (roll < 0.42) {
        const sp = 190 + Math.random() * 160;
        t = { x, y, px: x, py: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, q: Math.random() < 0.5 ? 1 : -1, kind: "electron", born: performance.now(), life: 3 + Math.random() * 3 };
      } else if (roll < 0.72) {
        const sp = 120 + Math.random() * 90;
        t = { x, y, px: x, py: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, q: Math.random() < 0.5 ? 1 : -1, kind: "muon", born: performance.now(), life: 4 + Math.random() * 4 };
      } else if (roll < 0.9) {
        const sp = 70 + Math.random() * 40;
        t = { x, y, px: x, py: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, q: 2, kind: "alpha", born: performance.now(), life: 1.2 + Math.random() * 1.2 };
      } else {
        const sp = 420;
        t = { x, y, px: x, py: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, q: 0, kind: "photon", born: performance.now(), life: 0.9 + Math.random() * 0.8 };
      }
      s.tracks.push(t);
    };

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Spawn poisson-ish
      s.spawnAcc += dt * 7;
      while (s.spawnAcc >= 1) {
        spawn();
        s.spawnAcc -= 1;
      }

      // Veil
      ctx.fillStyle = "rgba(4,8,6,0.075)";
      ctx.fillRect(0, 0, s.w, s.h);

      for (let i = s.tracks.length - 1; i >= 0; i--) {
        const tr = s.tracks[i];
        tr.px = tr.x;
        tr.py = tr.y;

        // Magnetic steering: rotate velocity by ω = q·B·κ
        const omega = tr.q * s.field * (tr.kind === "electron" ? 2.4 : tr.kind === "muon" ? 1.1 : tr.kind === "alpha" ? 0.9 : 0);

        // Pointer lens — local field bump
        let lensOmega = 0;
        if (s.pointer.inside) {
          const dxp = tr.x - s.pointer.x;
          const dyp = tr.y - s.pointer.y;
          const dp = Math.hypot(dxp, dyp);
          if (dp < 170 && dp > 1) {
            const fall = 1 - dp / 170;
            lensOmega = tr.q * fall * fall * 3.4 * Math.sign(s.field || 1);
          }
        }

        if (omega !== 0 || lensOmega !== 0) {
          const th = (omega + lensOmega) * dt;
          const cosT = Math.cos(th);
          const sinT = Math.sin(th);
          const nvx = tr.vx * cosT - tr.vy * sinT;
          const nvy = tr.vx * sinT + tr.vy * cosT;
          tr.vx = nvx;
          tr.vy = nvy;
        }

        // Ionisation losses
        const drag = tr.kind === "electron" ? 0.94 : tr.kind === "muon" ? 0.97 : 0.86;
        const f = Math.pow(drag, dt);
        tr.vx *= f;
        tr.vy *= f;

        tr.x += tr.vx * dt;
        tr.y += tr.vy * dt;

        const ageS = (now - tr.born) / 1000;
        if (
          ageS > tr.life ||
          tr.x < -20 ||
          tr.x > s.w + 20 ||
          tr.y < -20 ||
          tr.y > s.h + 20
        ) {
          s.tracks.splice(i, 1);
          continue;
        }

        // Draw fresh segment only (veil ages it)
        const fade = 1 - ageS / tr.life;
        ctx.strokeStyle =
          tr.kind === "photon"
            ? KIND_COLOR.photon
            : KIND_COLOR[tr.kind];
        ctx.globalAlpha = tr.kind === "photon" ? 0.5 : 0.28 + fade * 0.62;
        ctx.lineWidth = KIND_W[tr.kind];
        ctx.beginPath();
        ctx.moveTo(tr.px, tr.py);
        ctx.lineTo(tr.x, tr.y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Photon pair-production flourish: occasionally splits
        if (tr.kind === "photon" && Math.random() < 0.004 && s.tracks.length < 290) {
          const sp = Math.hypot(tr.vx, tr.vy) * 0.45;
          const a = Math.atan2(tr.vy, tr.vx);
          for (const da of [0.35, -0.35]) {
            s.tracks.push({
              x: tr.x, y: tr.y, px: tr.x, py: tr.y,
              vx: Math.cos(a + da) * sp, vy: Math.sin(a + da) * sp,
              q: Math.random() < 0.5 ? 1 : -1,
              kind: "electron", born: now, life: 2.4,
            });
          }
          s.tracks.splice(i, 1);
        }
      }

      void s.rate;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      setHud({
        fieldMt: Math.round(s.field * 47),
        tracks: s.tracks.length,
        rate: 7,
      });
    }, 240);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const onMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    sim.current.pointer.x = e.clientX - rect.left;
    sim.current.pointer.y = e.clientY - rect.top;
    sim.current.pointer.inside = true;
  };
  const onLeave = () => {
    sim.current.pointer.inside = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.field = Math.max(-2.4, Math.min(2.4, s.field + (e.deltaY < 0 ? 0.09 : -0.09)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#040806] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
        {/* Pointer lens reticle */}
        <PointerRing />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-emerald-300 uppercase">
          Cloud Chamber
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase">
          Diffusion Vapour Tray · Solenoid Rig
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase leading-relaxed">
          Wheel — Solenoid Field
          <br />
          Hover — Local Field Lens
        </p>
      </div>

      {/* Legend */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none z-10">
        {(Object.keys(KIND_COLOR) as Track["kind"][]).map((k) => (
          <span key={k} className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] uppercase text-neutral-500">
            <span
              className="inline-block w-6 h-[3px]"
              style={{ background: KIND_COLOR[k].startsWith("rgba") ? "#fafaf9" : KIND_COLOR[k], opacity: 0.85 }}
            />
            {k}
          </span>
        ))}
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Field">{hud.fieldMt} mT</Readout>
        <Readout label="Live Tracks">{hud.tracks}</Readout>
        <Readout label="Source">{hud.rate} Hz</Readout>
      </div>
    </div>
  );
}

function PointerRing() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      el.style.opacity = "0.5";
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      ref={ref}
      className="fixed left-0 top-0 w-40 h-40 rounded-full border border-emerald-500/40 pointer-events-none opacity-0 transition-opacity duration-200 z-[5]"
    />
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

export default CloudChamberDetector;
