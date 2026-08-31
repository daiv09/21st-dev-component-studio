"use client";

/**
 * Laser Harp — eight vertical beams, each a string fixed at both rails.
 * SWEEP the pointer through them to strum (amplitude follows your swipe
 * velocity), or voice chords from the keyboard rows A–K / 1–8. Each beam
 * sustains a true standing wave — fundamental plus a soft second
 * harmonic — decaying exponentially like a real string, pitched up the
 * scale left to right so sweeps trace melodies.
 */

import React, { useEffect, useRef, useState } from "react";

const N_BEAMS = 8;
const NOTES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const KEYMAP = "asdfghjk";

interface Beam {
  x: number;
  amp: number;
  omega: number; // visual temporal frequency
  phi: number;
  h2: number; // second-harmonic component share
}

export function LaserHarpStrings() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    beams: [] as Beam[],
    lastPX: -9999,
    lastPT: 0,
    lastNote: "—",
    flash: new Float32Array(N_BEAMS),
  });

  const [hud, setHud] = useState({ voices: 0, note: "—" });

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
      if (s.beams.length === 0) {
        for (let i = 0; i < N_BEAMS; i++) {
          s.beams.push({
            x: 0,
            amp: 0,
            omega: (2.6 + i * 0.55) * Math.PI * 2,
            phi: Math.random() * Math.PI * 2,
            h2: 0.22,
          });
        }
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

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.05);
      last = nowMs;

      ctx.fillStyle = "#0a0908";
      ctx.fillRect(0, 0, s.w, s.h);

      const topY = s.h * 0.18;
      const botY = s.h * 0.82;

      // ---- rails ---------------------------------------------------------------
      ctx.fillStyle = "#171310";
      ctx.fillRect(s.w * 0.06, topY - 16, s.w * 0.88, 14);
      ctx.fillRect(s.w * 0.06, botY + 2, s.w * 0.88, 14);
      ctx.fillStyle = "#d6d3d1";
      ctx.fillRect(s.w * 0.06, topY - 16, s.w * 0.88, 3);
      ctx.fillRect(s.w * 0.06, botY + 2, s.w * 0.88, 3);

      // ---- beams ------------------------------------------------------------------
      const span = s.w * 0.82;
      const x0 = s.w * 0.09;
      for (let i = 0; i < N_BEAMS; i++) {
        const b = s.beams[i];
        if (b.x === 0) b.x = x0 + (span / N_BEAMS) * (i + 0.5);

        // physics decay
        b.amp *= Math.exp(-dt * 0.9);
        b.phi += b.omega * dt * (0.35 + b.amp * 0.65);
        s.flash[i] = Math.max(0, s.flash[i] - dt * 4);

        const SEGMENTS = 48;
        const disp = (sv: number): number => {
          const fund = Math.sin(Math.PI * sv);
          const second = Math.sin(2 * Math.PI * sv) * b.h2;
          return (
            (fund + second * Math.sin(b.phi * 1.9)) *
            Math.sin(b.phi) *
            b.amp *
            30
          );
        };

        const active = b.amp > 0.02;

        // emitter wells
        ctx.beginPath();
        ctx.arc(b.x, topY - 9, 5, 0, Math.PI * 2);
        ctx.arc(b.x, botY + 9, 5, 0, Math.PI * 2);
        ctx.fillStyle = active ? "#fbbf24" : "#78716c";
        ctx.fill();

        // idle beam: straight line, dimmer
        if (!active) {
          ctx.strokeStyle = "rgba(245,158,11,0.32)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(b.x, topY);
          ctx.lineTo(b.x, botY);
          ctx.stroke();
        } else {
          // vibrating ribbon — stepped tone layers
          for (let pass = 0; pass < 3; pass++) {
            ctx.strokeStyle =
              pass === 2 ? "#fffbeb" : pass === 1 ? "#fbbf24" : "rgba(180,83,9,0.5)";
            ctx.lineWidth = pass === 2 ? 2 : 6 - pass * 2;
            ctx.beginPath();
            for (let k = 0; k <= SEGMENTS; k++) {
              const sv = k / SEGMENTS;
              const yy = topY + (botY - topY) * sv;
              const dx = disp(sv) * (pass === 2 ? 1 : 1 + pass * 0.25);
              if (k === 0) ctx.moveTo(b.x + dx, yy);
              else ctx.lineTo(b.x + dx, yy);
            }
            ctx.stroke();
          }
        }

        // note label
        ctx.font = "9px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = active ? "#fde68a" : "rgba(120,113,108,0.7)";
        ctx.fillText(NOTES[i], b.x, botY + 34);

        // key hint
        ctx.fillStyle = "rgba(87,83,78,0.85)";
        ctx.fillText(KEYMAP[i].toUpperCase(), b.x, topY - 26);
      }

      raf = requestAnimationFrame(step);

      hudAcc += dt;
      if (hudAcc > 0.3) {
        hudAcc = 0;
        setHud({
          voices: s.beams.filter((b) => b.amp > 0.02).length,
          note: s.lastNote,
        });
      }
    };
    raf = requestAnimationFrame(step);

    // strum: pointermove handled here so we can compute crossing velocity
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const nowT = performance.now();
      const vx = (px - s.lastPX) / Math.max(1, nowT - s.lastPT);
      if (s.lastPX > -999 && Math.abs(vx) > 0.15) {
        s.beams.forEach((b, i) => {
          const crossed =
            (s.lastPX - b.x) * (px - b.x) < 0 ||
            (Math.abs(px - b.x) < 8 && Math.abs(s.lastPX - px) > 2);
          if (crossed) {
            const b2 = s.beams[i];
            b2.amp = Math.min(1, b2.amp + Math.min(0.9, Math.abs(vx) * 0.5));
            b2.phi = 0;
            s.flash[i] = 1;
            s.lastNote = NOTES[i];
          }
        });
      }
      s.lastPX = px;
      s.lastPT = nowT;
    };
    wrap.addEventListener("pointermove", onMove);

    const onLeave = () => {
      s.lastPX = -9999;
    };
    wrap.addEventListener("pointerleave", onLeave);

    const onKey = (e: KeyboardEvent) => {
      const idx = KEYMAP.indexOf(e.key.toLowerCase());
      if (idx < 0) return;
      const b = s.beams[idx];
      if (!b) return;
      b.amp = 1;
      b.phi = 0;
      s.flash[idx] = 1;
      s.lastNote = NOTES[idx];
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-screen w-full overflow-hidden bg-[#0a0908] select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Laser Harp
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Standing-Wave Strings · Velocity Strumming
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Sweep Through Beams — Strum
          <br />
          Keys A–K — Voice Notes
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Sustaining">{hud.voices}</Readout>
        <Readout label="Last Voiced">{hud.note}</Readout>
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

export default LaserHarpStrings;
