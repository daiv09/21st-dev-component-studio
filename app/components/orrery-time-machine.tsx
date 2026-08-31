"use client";

/**
 * Orrery Time Machine — a six-planet clockwork orrery with Ptolemaic
 * epicycle arms riding each deferent spoke. Time flows continuously and
 * can be SCRUBBED by dragging the stage, SPUN faster or slower with the
 * wheel, and any planet HOVERED makes the whole camera glide over and
 * follow it through its year while the mechanism keeps turning beneath.
 */

import React, { useEffect, useRef, useState } from "react";

interface Planet {
  name: string;
  orbit: number; // fraction of dial radius
  period: number; // days
  size: number;
  color: string;
  epiR: number; // epicycle radius px at reference dial
  epiPeriod: number; // days
}

const PLANETS: Planet[] = [
  { name: "MERCURY", orbit: 0.17, period: 88, size: 3.4, color: "#efe7d3", epiR: 7, epiPeriod: 22 },
  { name: "VENUS", orbit: 0.26, period: 225, size: 4.6, color: "#fde68a", epiR: 9, epiPeriod: 60 },
  { name: "EARTH", orbit: 0.35, period: 365, size: 4.8, color: "#fafaf9", epiR: 10, epiPeriod: 97 },
  { name: "MARS", orbit: 0.45, period: 687, size: 4.0, color: "#ef4444", epiR: 8, epiPeriod: 180 },
  { name: "JUPITER", orbit: 0.62, period: 4333, size: 7.2, color: "#d4a24e", epiR: 13, epiPeriod: 800 },
  { name: "SATURN", orbit: 0.78, period: 10759, size: 6.4, color: "#fbbf24", epiR: 15, epiPeriod: 1900 },
];

const BRASS = ["#78350f", "#b45309", "#d4a24e"];

export function OrreryTimeMachine() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    tDays: 0,
    daysPerSec: 40,
    hover: -1,
    focusX: 0,
    focusY: 0,
    hasFocus: false,
    scrubbing: false,
    lastX: 0,
    positions: [] as { x: number; y: number }[],
  });

  const [hud, setHud] = useState({ day: 0, speed: 40, focusName: "—" });

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
    let hudAcc = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!s.scrubbing) s.tDays += dt * s.daysPerSec;

      ctx.fillStyle = "#0e0c08";
      ctx.fillRect(0, 0, s.w, s.h);

      const cx0 = s.w / 2;
      const cy0 = s.h * 0.48;
      const R = Math.min(s.w, s.h) * 0.4;

      // ---- planet positions (before camera shift) -------------------------
      s.positions.length = 0;
      for (const p of PLANETS) {
        const a = (2 * Math.PI * s.tDays) / p.period;
        const ea = (2 * Math.PI * s.tDays) / p.epiPeriod;
        const bx = Math.cos(a) * p.orbit * R;
        const by = Math.sin(a) * p.orbit * R;
        const ex = Math.cos(ea) * p.epiR * (R / 320);
        const ey = Math.sin(ea) * p.epiR * (R / 320);
        s.positions.push({ x: cx0 + bx + ex, y: cy0 + by + ey });
      }

      // ---- camera focus-follow --------------------------------------------
      if (s.hover >= 0 && s.hover < s.positions.length) {
        s.hasFocus = true;
      } else {
        s.hasFocus = false;
      }
      const tx = s.hasFocus ? s.positions[s.hover].x : cx0;
      const ty = s.hasFocus ? s.positions[s.hover].y : cy0;
      const k = Math.min(1, dt * 3.2);
      s.focusX += (tx - s.focusX) * k;
      s.focusY += (ty - s.focusY) * k;
      if (!s.hasFocus && Math.abs(s.focusX - cx0) < 0.4 && Math.abs(s.focusY - cy0) < 0.4) {
        s.focusX = cx0;
        s.focusY = cy0;
      }
      const ox = cx0 - (s.focusX - cx0);
      const oy = cy0 - (s.focusY - cy0);

      // ---- dial rings ------------------------------------------------------
      for (let i = 0; i < PLANETS.length; i++) {
        const rr = PLANETS[i].orbit * R;
        ctx.strokeStyle = i % 2 === 0 ? "rgba(180,83,9,0.30)" : "rgba(212,162,78,0.20)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ox, oy, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      // engraved zodiac ticks
      ctx.strokeStyle = "rgba(212,162,78,0.35)";
      for (let dgi = 0; dgi < 36; dgi++) {
        const a = (dgi * Math.PI) / 18;
        const long = dgi % 9 === 0;
        ctx.lineWidth = long ? 1.6 : 0.8;
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(a) * (R * 0.92), oy + Math.sin(a) * (R * 0.92));
        ctx.lineTo(ox + Math.cos(a) * R, oy + Math.sin(a) * R);
        ctx.stroke();
      }

      // ---- sun -------------------------------------------------------------
      const pulse = 1 + Math.sin(now * 0.004) * 0.06;
      ctx.beginPath();
      ctx.arc(ox, oy, 13 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ox, oy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#fde68a";
      ctx.fill();

      // ---- arms + planets ---------------------------------------------------
      for (let i = 0; i < PLANETS.length; i++) {
        const p = PLANETS[i];
        const pos = s.positions[i];
        const a = (2 * Math.PI * s.tDays) / p.period;
        const bx = ox + Math.cos(a) * p.orbit * R;
        const by = oy + Math.sin(a) * p.orbit * R;

        // deferent spoke
        ctx.strokeStyle = BRASS[Math.min(2, Math.floor((i / PLANETS.length) * 3))];
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // epicycle circle + secondary arm
        const epiScale = R / 320;
        ctx.strokeStyle = "rgba(212,162,78,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, p.epiR * epiScale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        // deferent hub
        ctx.beginPath();
        ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "#d4a24e";
        ctx.fill();

        // planet body
        const hovered = i === s.hover;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * (hovered ? 1.35 : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        // hard specular cap
        ctx.beginPath();
        ctx.arc(pos.x - p.size * 0.28, pos.y - p.size * 0.3, p.size * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();
        if (p.name === "SATURN") {
          ctx.strokeStyle = "rgba(251,191,36,0.85)";
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.y, p.size * 2.05, p.size * 0.72, -0.44, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (hovered) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, p.size + 8, 0, Math.PI * 2);
          ctx.strokeStyle = "#fafaf9";
          ctx.setLineDash([3, 4]);
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#fafaf9";
          ctx.fillText(p.name, pos.x, pos.y - p.size - 14);
        }
      }

      hudAcc += dt;
      if (hudAcc > 0.25) {
        hudAcc = 0;
        setHud({
          day: Math.floor(s.tDays),
          speed: Math.round(s.daysPerSec),
          focusName: s.hover >= 0 ? PLANETS[s.hover].name : "—",
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

  const pickPlanet = (e: React.PointerEvent | React.MouseEvent): number => {
    const wrap = wrapRef.current;
    if (!wrap) return -1;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best = -1;
    let bestD = 26;
    sim.current.positions.forEach((p, i) => {
      const d = Math.hypot(p.x - mx, p.y - my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.scrubbing) {
      s.tDays += (e.clientX - s.lastX) * 1.6;
      s.tDays = Math.max(0, s.tDays);
      s.lastX = e.clientX;
      s.hover = -1;
      return;
    }
    s.hover = pickPlanet(e);
  };

  const onDown = (e: React.PointerEvent) => {
    const s = sim.current;
    const hit = pickPlanet(e);
    if (hit >= 0) return; // hovering handles focus
    s.scrubbing = true;
    s.lastX = e.clientX;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onUp = () => {
    sim.current.scrubbing = false;
  };

  const onLeave = () => {
    sim.current.hover = -1;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.daysPerSec = Math.max(2, Math.min(400, s.daysPerSec * (e.deltaY < 0 ? 1.15 : 0.8696)));
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
      onPointerLeave={onLeave}
      className="relative h-screen w-full overflow-hidden bg-[#0e0c08] select-none touch-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-grab active:cursor-grabbing" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Orrery Time Machine
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Epicyclic Clockwork · Six Deferents
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — Scrub Time · Wheel — Tempo
          <br />
          Hover Planet — Camera Follow
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Day">{hud.day.toLocaleString()}</Readout>
        <Readout label="Tempo">{hud.speed} d/s</Readout>
        <Readout label="Tracking">{hud.focusName}</Readout>
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

export default OrreryTimeMachine;
