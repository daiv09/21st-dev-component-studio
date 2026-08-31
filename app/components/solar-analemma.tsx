"use client";

/**
 * Solar Analemma Dial — the sun's position at the same mean solar time
 * (14:30) traced across a full year projects onto the dial plate as the
 * classic slanted figure-eight, computed live from declination and the
 * equation of time. A gnomon at centre throws its true shadow toward the
 * current tip. DRAG the outer date ring to scrub the calendar, WHEEL to
 * relocate the observatory's latitude — the eight shears, flattens and
 * flips as you cross the tropics and the equator.
 */

import React, { useEffect, useRef, useState } from "react";

const OBS_HOUR = 14.5;
const DAYS = 365;

interface Tip {
  x: number;
  y: number;
  up: boolean;
  m: number; // month bucket 0..11 for tonal banding
}

function solarForDay(n: number, latDeg: number) {
  const rad = Math.PI / 180;
  const dec = -23.44 * Math.cos((2 * Math.PI * (n + 10)) / DAYS);
  const B = (2 * Math.PI * (n - 81)) / 364;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutes
  const tst = OBS_HOUR + eot / 60;
  const H = (tst - 12) * 15 * rad;
  const phi = latDeg * rad;
  const d = dec * rad;
  const sinAlt =
    Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  // azimuth measured from north, clockwise
  const azFromSouth = Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) - Math.tan(d) * Math.cos(phi),
  );
  const az = Math.PI - azFromSouth;
  return { alt, az, dec, eot };
}

const MONTH_LETTERS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
// stepped seasonal tones, dark winter → hot summer (northern sense)
const SEASON_TONES = ["#78350f", "#b45309", "#f59e0b", "#fbbf24"];

export function SolarAnalemma() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    day: 80,
    playing: true,
    lat: 40,
    ringDrag: false,
  });

  const [hud, setHud] = useState({ date: "MAR 21", dec: 0, eot: 0, lat: 40 });
  const [playing, setPlaying] = useState(true);

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
      if (s.playing && !s.ringDrag) {
        s.day = (s.day + dt * 7) % DAYS; // ~52 s per year sweep
      }

      ctx.fillStyle = "#0c0a08";
      ctx.fillRect(0, 0, s.w, s.h);

      const cx = s.w / 2;
      const cy = s.h * 0.54;
      const R = Math.min(s.w, s.h) * 0.38; // horizon radius

      // ---- dial plate ----------------------------------------------------
      // horizon disc
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = "#141210";
      ctx.fill();

      // altitude rings (sun elevation 10° steps → shadow-length rings)
      ctx.strokeStyle = "rgba(120,113,108,0.22)";
      ctx.lineWidth = 1;
      for (let a = 10; a <= 80; a += 10) {
        const rr = R * Math.cos(a * (Math.PI / 180));
        if (rr < 12) break;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(120,113,108,0.55)";
        ctx.font = "9px monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${a}°`, cx + rr + 3, cy - 3);
      }

      // cardinal spokes + letters (north up)
      ctx.strokeStyle = "rgba(120,113,108,0.28)";
      for (let c = 0; c < 4; c++) {
        const a = (c * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(a) * R, cy - Math.cos(a) * R);
        ctx.stroke();
      }
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const CARD = [
        ["N", 0],
        ["E", 90],
        ["S", 180],
        ["W", 270],
      ] as const;
      for (const [ch, deg] of CARD) {
        const a = deg * (Math.PI / 180);
        ctx.fillStyle = ch === "N" ? "#fbbf24" : "rgba(231,229,228,0.75)";
        ctx.fillText(
          ch,
          cx + Math.sin(a) * (R + 18),
          cy - Math.cos(a) * (R + 18),
        );
      }

      // ---- date ring ------------------------------------------------------
      const RING_R = R + 34;
      ctx.strokeStyle = "rgba(120,113,108,0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, RING_R, 0, Math.PI * 2);
      ctx.stroke();

      for (let n = 0; n < DAYS; n += 5) {
        const a = (n / DAYS) * Math.PI * 2 - Math.PI / 2;
        const major = Math.abs(((n + 1) % 30)) < 5;
        const r0 = RING_R - (major ? 9 : 4);
        ctx.strokeStyle = major ? "rgba(245,158,11,0.55)" : "rgba(120,113,108,0.35)";
        ctx.lineWidth = major ? 1.6 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * RING_R, cy + Math.sin(a) * RING_R);
        ctx.stroke();
      }
      // month letters just inside ring
      ctx.font = "10px monospace";
      ctx.fillStyle = "rgba(168,162,158,0.85)";
      for (let m = 0; m < 12; m++) {
        const a = ((m * 30.4) / DAYS) * Math.PI * 2 - Math.PI / 2 + (15.2 / DAYS) * Math.PI * 2;
        ctx.fillText(
          MONTH_LETTERS[m],
          cx + Math.cos(a) * (RING_R - 20),
          cy + Math.sin(a) * (RING_R - 20),
        );
      }

      // ---- analemma locus (full-year deterministic recompute) -------------
      const proj = (alt: number, az: number) => {
        const rShadow = Math.min(R, 46 / Math.tan(Math.max(alt, 0.07)));
        return {
          x: cx + Math.sin(az) * rShadow,
          y: cy - Math.cos(az) * rShadow,
        };
      };

      const locus: Tip[] = [];
      for (let n = 0; n < DAYS; n += 2) {
        const { alt, az } = solarForDay(n, s.lat);
        if (alt <= 0.02) continue;
        const p = proj(alt, az);
        locus.push({ x: p.x, y: p.y, up: true, m: Math.floor((n / DAYS) * 12) });
      }
      // draw in 4 seasonal tone bands (by month bucket)
      for (let b = 0; b < 4; b++) {
        ctx.strokeStyle = SEASON_TONES[b];
        ctx.lineWidth = b === 3 ? 2.2 : 1.5;
        ctx.beginPath();
        let started = false;
        for (const t of locus) {
          const band = Math.min(3, Math.floor(t.m / 3));
          if (band !== b) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(t.x, t.y);
            started = true;
          } else ctx.lineTo(t.x, t.y);
        }
        ctx.stroke();
      }
      // node dots where the eight crosses itself region (solstice extremes)
      ctx.fillStyle = "#fafaf9";
      for (const nSol of [172, 355]) {
        const { alt, az } = solarForDay(nSol, s.lat);
        if (alt > 0.02) {
          const p = proj(alt, az);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- today: gnomon + live shadow -----------------------------------
      const cur = solarForDay(s.day, s.lat);
      if (cur.alt > 0.02) {
        const tip = proj(cur.alt, cur.az);
        // shadow beam — two-tone hard specular
        ctx.strokeStyle = "rgba(250,250,249,0.92)";
        ctx.lineWidth = 4;
        ctx.lineCap = "butt";
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();
        ctx.strokeStyle = "rgba(23,19,12,0.9)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tip.x, tip.y);
        ctx.stroke();

        // gnomon stub
        ctx.beginPath();
        ctx.moveTo(cx - 9, cy + 6);
        ctx.lineTo(cx + 9, cy + 6);
        ctx.lineTo(cx, cy - 14);
        ctx.closePath();
        ctx.fillStyle = "#efe7d3";
        ctx.fill();
        ctx.strokeStyle = "#0c0a08";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // sun tip marker
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 4.6, 0, Math.PI * 2);
        ctx.fillStyle = "#fde68a";
        ctx.fill();
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // date-ring cursor
        const ra = (s.day / DAYS) * Math.PI * 2 - Math.PI / 2;
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ra) * (RING_R - 12), cy + Math.sin(ra) * (RING_R - 12));
        ctx.lineTo(cx + Math.cos(ra) * (RING_R + 12), cy + Math.sin(ra) * (RING_R + 12));
        ctx.stroke();
      }

      hudAcc += dt;
      if (hudAcc > 0.25) {
        hudAcc = 0;
        const m = Math.floor((s.day / DAYS) * 12);
        const dom = Math.floor((((s.day / DAYS) * 12) % 1) * 30) + 1;
        setHud({
          date: `${MONTH_NAMES[m]} ${String(dom).padStart(2, "0")}`,
          dec: Math.round(cur.dec * 10) / 10,
          eot: Math.round(cur.eot * 10) / 10,
          lat: Math.round(s.lat),
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

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.lat = Math.max(-65, Math.min(68, s.lat + (e.deltaY < 0 ? 1.5 : -1.5)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height * 0.54;
    const d = Math.hypot(mx, my);
    const R = Math.min(rect.width, rect.height) * 0.38;
    if (d > R + 14) {
      sim.current.ringDrag = true;
      wrap.setPointerCapture(e.pointerId);
      scrub(e);
    }
  };

  const scrub = (e: React.PointerEvent | React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left - rect.width / 2;
    const my = e.clientY - rect.top - rect.height * 0.54;
    let a = Math.atan2(my, mx) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    sim.current.day = ((a / (Math.PI * 2)) * DAYS) % DAYS;
  };

  const onMove = (e: React.PointerEvent) => {
    if (sim.current.ringDrag) scrub(e);
  };

  const onUp = () => {
    sim.current.ringDrag = false;
  };

  const togglePlay = () => {
    const next = !sim.current.playing;
    sim.current.playing = next;
    setPlaying(next);
  };

  return (
    <div
      ref={wrapRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative h-screen w-full overflow-hidden bg-[#0c0a08] select-none touch-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-grab active:cursor-grabbing" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Solar Analemma
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Gnomon Dial · Equation of Time · Declination
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag Date Ring — Scrub Year
          <br />
          Wheel — Latitude {hud.lat}° · Click Clock to Pause
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Date">{hud.date}</Readout>
        <Readout label="Declination">{hud.dec.toFixed(1)}°</Readout>
        <Readout label="Eq. of Time">{hud.eot > 0 ? "+" : ""}{hud.eot.toFixed(1)}m</Readout>
        <button
          onClick={togglePlay}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-amber-800 text-amber-300 hover:bg-amber-900/30 transition-colors pointer-events-auto"
        >
          {playing ? "Pause Orbit" : "Resume"}
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

export default SolarAnalemma;
