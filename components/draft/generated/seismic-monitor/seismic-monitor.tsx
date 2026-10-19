"use client";

/**
 * SeismicMonitor — a three-channel strip-chart recorder drawing live traces
 * onto scrolling graph paper. Move your pointer violently to shake the bed,
 * CLICK "CAL" (or press C) to fire a calibration pulse, WHEEL changes trace
 * gain, FREEZE halts the paper. Event flags stamp themselves on strong shocks.
 */

import React, { useEffect, useRef, useState } from "react";

const STEP_PX = 3; // horizontal pixels per sample
const PAPER_SPEED = 110; // px/s
const MINOR = 24;
const MAJOR = 120;

interface Channel {
  buf: Float32Array;
  head: number;
  count: number;
  phase: number[];
  color: string;
  amp: number;
  label: string;
}

export function SeismicMonitor() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const peakRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rmsRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [frozen, setFrozen] = useState(false);
  const frozenRef = useRef(false);
  const [gain, setGain] = useState(1);
  const gainRef = useRef(1);

  const calRef = useRef<{ t0: number } | null>(null);
  const markerCooldownRef = useRef(0);

  useEffect(() => {
    frozenRef.current = frozen;
  }, [frozen]);
  useEffect(() => {
    gainRef.current = gain;
  }, [gain]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let last = performance.now();
    let simT = 0;
    let carry = 0;
    let elapsed = 0;
    let prevEnv = 0;
    let tremorEnv = 0;
    let penX = 0;

    const markers: { idx: number; label: string }[] = [];
    const mouse = { x: -999, y: -999 };

    const channels: Channel[] = [
      { buf: new Float32Array(0), head: 0, count: 0, phase: [0.3, 1.7, 4.1], color: "#fbbf24", amp: 1, label: "CH-A ACCEL" },
      { buf: new Float32Array(0), head: 0, count: 0, phase: [2.1, 0.4, 2.9], color: "#e7e5e4", amp: 0.78, label: "CH-B VELO" },
      { buf: new Float32Array(0), head: 0, count: 0, phase: [5.2, 3.3, 1.1], color: "#f87171", amp: 0.55, label: "CH-C DISP" },
    ];

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      penX = width - 150;
      const cap = Math.ceil(width / STEP_PX) + 4;
      for (const ch of channels) {
        const next = new Float32Array(cap);
        next.set(ch.buf.subarray(0, Math.min(cap, ch.buf.length)));
        ch.buf = next;
        ch.head = ch.head % cap;
      }
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    handleResize();

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dist = Math.hypot(x - mouse.x, y - mouse.y);
      if (mouse.x > -500) tremorEnv = Math.min(1.5, tremorEnv + dist * 0.0045);
      mouse.x = x;
      mouse.y = y;
    };

    const fireCal = () => {
      calRef.current = { t0: performance.now() };
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") fireCal();
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      gainRef.current = Math.min(2, Math.max(0.5, gainRef.current * (e.deltaY < 0 ? 1.1 : 0.91)));
      setGain(gainRef.current);
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    const signal = (ch: Channel, t: number, env: number, now: number): number => {
      let v =
        Math.sin(t * 1.15 + ch.phase[0]) * 0.13 +
        Math.sin(t * 2.75 + ch.phase[1]) * 0.08 +
        Math.sin(t * 0.55 + ch.phase[2]) * 0.11;
      v += env * (Math.sin(t * 31 + ch.phase[0] * 9) + Math.sin(t * 47.3 + ch.phase[1]) * 0.6) * 0.34;
      const cal = calRef.current;
      if (cal) {
        const ct = (now - cal.t0) / 1000;
        if (ct < 2.2) {
          if (ct < 0.32) v += 0.85 * ch.amp;
          else v += Math.sin((ct - 0.32) * 21) * Math.exp(-(ct - 0.32) * 3.6) * 0.5 * ch.amp;
        }
      }
      return v;
    };

    const fmtTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s - m * 60;
      return `${String(m).padStart(2, "0")}:${sec.toFixed(1).padStart(4, "0")}`;
    };

    let statTick = 0;

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      simT += dt;
      if (!frozenRef.current) elapsed += dt;

      // Envelope dynamics
      tremorEnv *= Math.exp(-dt * 1.9);
      markerCooldownRef.current -= dt;
      if (prevEnv < 0.72 && tremorEnv >= 0.72 && markerCooldownRef.current <= 0 && !frozenRef.current) {
        markers.push({ idx: -1, label: fmtTime(elapsed) }); // idx patched below
        markerCooldownRef.current = 3;
        if (markers.length > 24) markers.shift();
      }
      prevEnv = tremorEnv;

      // Background
      ctx.fillStyle = "#0b0904";
      ctx.fillRect(0, 0, width, height);

      const bandH = height / channels.length;
      const gain = gainRef.current;

      // --- Paper advance ------------------------------------------------------
      if (!frozenRef.current) {
        carry += PAPER_SPEED * dt;
        while (carry >= STEP_PX) {
          carry -= STEP_PX;
          for (let ci = 0; ci < channels.length; ci++) {
            const ch = channels[ci];
            const v = signal(ch, simT + ci * 0.37, tremorEnv, now) * ch.amp * gain;
            ch.buf[ch.head] = v;
            ch.head = (ch.head + 1) % ch.buf.length;
            ch.count = Math.min(ch.count + 1, ch.buf.length);
            if (ci === 0 && markers.length && markers[markers.length - 1].idx === -1) {
              markers[markers.length - 1].idx = ch.head;
            }
          }
        }
      }

      // --- Grid ----------------------------------------------------------------
      const offsetPx = frozenRef.current ? 0 : (carry % MINOR);
      // horizontal rules
      for (let y = 0; y <= height; y += MINOR) {
        const major = y % MAJOR === 0;
        ctx.strokeStyle = `rgba(251, 191, 36, ${major ? 0.14 : 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }
      // vertical scrolling rules
      let lane = 0;
      for (let x = penX + offsetPx; x > -MAJOR; x -= MINOR, lane++) {
        const major = lane % 5 === 0;
        ctx.strokeStyle = `rgba(251, 191, 36, ${major ? 0.13 : 0.045})`;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
        if (major && !frozenRef.current) {
          const tAtX = elapsed - (penX - x) / PAPER_SPEED;
          if (tAtX >= 0) {
            ctx.fillStyle = "rgba(251, 191, 36, 0.4)";
            ctx.font = "9px ui-monospace, monospace";
            ctx.textAlign = "center";
            ctx.fillText(fmtTime(tAtX), x, height - 10);
          }
        }
      }

      // --- Traces ---------------------------------------------------------------
      for (let ci = 0; ci < channels.length; ci++) {
        const ch = channels[ci];
        const mid = bandH * ci + bandH / 2;
        const ampPx = (bandH / 2 - 26);

        // band separator + baseline
        ctx.strokeStyle = "rgba(251,191,36,0.1)";
        ctx.beginPath();
        ctx.moveTo(0, bandH * (ci + 1) + 0.5);
        ctx.lineTo(width, bandH * (ci + 1) + 0.5);
        ctx.stroke();

        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        let started = false;
        const samples = Math.min(ch.count, Math.floor(penX / STEP_PX));
        for (let k = 0; k < samples; k++) {
          const idx = (((ch.head - 1 - k) % ch.buf.length) + ch.buf.length) % ch.buf.length;
          const x = penX - k * STEP_PX;
          const y = mid - ch.buf[idx] * ampPx;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Channel tag
        ctx.fillStyle = ch.color;
        ctx.font = "bold 10px ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(ch.label, 18, mid - bandH / 2 + 20);

        // --- Pen assembly -----------------------------------------------------
        const latest = ch.count ? ch.buf[(ch.head - 1 + ch.buf.length) % ch.buf.length] : 0;
        const py = mid - latest * ampPx;
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width - 26, py);
        ctx.lineTo(penX + 4, py);
        ctx.stroke();
        ctx.fillStyle = ch.color;
        ctx.beginPath();
        ctx.moveTo(penX + 4, py);
        ctx.lineTo(penX - 7, py - 5);
        ctx.lineTo(penX - 7, py + 5);
        ctx.closePath();
        ctx.fill();
        // pivot dot
        ctx.beginPath();
        ctx.arc(width - 22, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Event flags -----------------------------------------------------------
      for (const mk of markers) {
        if (mk.idx < 0) continue;
        const back = (channels[0].head - mk.idx + channels[0].buf.length) % channels[0].buf.length;
        const x = penX - back * STEP_PX;
        if (x < 0 || !isFinite(x)) continue;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
        ctx.font = "bold 9px ui-monospace, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`EVENT ${mk.label}`, x + 6, 18);
      }

      // --- Stats (throttled DOM writes) ------------------------------------------
      statTick += dt;
      if (statTick > 0.2) {
        statTick = 0;
        for (let ci = 0; ci < channels.length; ci++) {
          const ch = channels[ci];
          let peak = 0;
          let sumSq = 0;
          const n = Math.min(ch.count, 400);
          for (let k = 0; k < n; k++) {
            const idx = (((ch.head - 1 - k) % ch.buf.length) + ch.buf.length) % ch.buf.length;
            const a = Math.abs(ch.buf[idx]);
            if (a > peak) peak = a;
            sumSq += ch.buf[idx] * ch.buf[idx];
          }
          const rms = n ? Math.sqrt(sumSq / n) : 0;
          const pe = peakRefs.current[ci];
          const re = rmsRefs.current[ci];
          if (pe) pe.textContent = peak.toFixed(2);
          if (re) re.textContent = rms.toFixed(2);
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#0b0904] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />

      {/* Title */}
      <div className="absolute top-7 left-9 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-300 uppercase">
          Seismic Monitor
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-amber-800 uppercase">
          STR-3 · Triaxial Chart Recorder · 110 mm/s
        </p>
      </div>

      {/* Hints */}
      <div className="absolute top-7 right-9 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-amber-900 uppercase leading-relaxed">
          Shake Pointer — Tremor
          <br />
          Wheel — Trace Gain ×{gain.toFixed(1)}
          <br />
          Key C — Calibrate
        </p>
      </div>

      {/* Device controls */}
      <div className="absolute bottom-8 left-9 flex items-center gap-3">
        <button
          onClick={() => {
            calRef.current = { t0: performance.now() };
          }}
          className="px-4 py-2 font-mono text-[11px] tracking-[0.3em] uppercase rounded border border-amber-600/60 text-amber-300 hover:bg-amber-500/10 transition-colors"
        >
          CAL
        </button>
        <button
          onClick={() => setFrozen((f) => !f)}
          className={`px-4 py-2 font-mono text-[11px] tracking-[0.3em] uppercase rounded border transition-colors ${
            frozen
              ? "border-red-500/70 text-red-400 bg-red-500/10"
              : "border-neutral-700 text-neutral-400 hover:bg-neutral-800/40"
          }`}
        >
          {frozen ? "Frozen" : "Run"}
        </button>
        <span className="font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase ml-2">
          Shake the pointer to excite the bed
        </span>
      </div>

      {/* Live stats */}
      <div className="absolute bottom-8 right-9 flex items-end gap-8 pointer-events-none">
        {[0, 1, 2].map((ci) => (
          <div key={ci} className="flex flex-col items-end gap-1">
            <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
              {["A", "B", "C"][ci]} Peak / RMS
            </span>
            <span className="font-mono text-sm tabular-nums text-neutral-300">
              <span
                ref={(el) => {
                  peakRefs.current[ci] = el;
                }}
              >
                0.00
              </span>
              <span className="text-neutral-600"> / </span>
              <span
                ref={(el) => {
                  rmsRefs.current[ci] = el;
                }}
              >
                0.00
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeismicMonitor;
