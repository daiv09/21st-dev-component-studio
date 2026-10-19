"use client";

/**
 * Dragon Curve Unfolder — the Heighway dragon as a living origami machine.
 * Each SPACE (or ITERATE press) folds the strip one order further, animating
 * the new creases segment-by-segment while the view auto-fits. WHEEL rolls
 * the whole specimen around its centroid, drag pans the sheet. Stroke tone
 * steps through an emerald gauge every half-thousand segments so the fold
 * lineage stays readable at high orders.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

const MAX_ITER = 15;
const UNFOLD_MS = 1300;

// Fold sequence: turns between unit steps (+1 right, -1 left)
function buildTurns(iter: number): Int8Array {
  let seq = new Int8Array(0);
  for (let k = 0; k < iter; k++) {
    const next = new Int8Array(seq.length * 2 + 1);
    next.set(seq, 0);
    next[seq.length] = 1;
    for (let i = 0; i < seq.length; i++) {
      next[next.length - 1 - i] = -seq[i];
    }
    seq = next;
  }
  return seq;
}

interface Geometry {
  pts: Float32Array; // x,y pairs
  n: number;
}

function buildGeometry(turns: Int8Array): Geometry {
  const n = turns.length + 1;
  const pts = new Float32Array(n * 2);
  let x = 0;
  let y = 0;
  let dir = 0; // 0=E 1=S 2=W 3=N
  for (let i = 0; i < n; i++) {
    pts[i * 2] = x;
    pts[i * 2 + 1] = y;
    if (i < turns.length) {
      dir = (dir + turns[i] + 4) % 4;
      x += dir === 0 ? 1 : dir === 2 ? -1 : 0;
      y += dir === 1 ? 1 : dir === 3 ? -1 : 0;
    }
  }
  return { pts, n };
}

const GAUGE = ["#064e3b", "#047857", "#10b981", "#6ee7b7", "#a7f3d0"];

export function DragonCurveUnfolder() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const view = useRef({
    w: 0,
    h: 0,
    rotDeg: 0,
    panX: 0,
    panY: 0,
    scale: 1,
    fitScale: 1,
    cx: 0,
    cy: 0, // geometry centroid in model space
  });

  const geoRef = useRef<Geometry>({ pts: new Float32Array(0), n: 0 });
  const shownRef = useRef(0); // segments currently drawn
  const targetShownRef = useRef(0);

  const [iter, setIter] = useState(9);
  const iterRef = useRef(iter);

  // Rebuild geometry whenever iteration changes, then unfold to it.
  useEffect(() => {
    iterRef.current = iter;
    const g = buildGeometry(buildTurns(iter));
    geoRef.current = g;
    targetShownRef.current = g.n;
    // keep already-visible proportion so re-folds don't blink
    if (shownRef.current === 0 || shownRef.current > g.n) shownRef.current = Math.min(shownRef.current, g.n);
  }, [iter]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const v = view.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      v.w = rect.width;
      v.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Unfold animation
      const target = targetShownRef.current;
      if (shownRef.current < target) {
        const rate = Math.max(target / (UNFOLD_MS / 1000), 400);
        shownRef.current = Math.min(target, shownRef.current + rate * dt);
      }

      const g = geoRef.current;
      const count = Math.floor(Math.min(shownRef.current, g.n));
      if (count >= 2) {
        // bounds of visible portion
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let sx = 0, sy = 0;
        for (let i = 0; i < count; i++) {
          const x = g.pts[i * 2];
          const y = g.pts[i * 2 + 1];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          sx += x;
          sy += y;
        }
        v.cx = sx / count;
        v.cy = sy / count;
        const span = Math.max(maxX - minX, maxY - minY, 1);
        v.fitScale = Math.min(v.w, v.h) * 0.82 / span;
        // ease scale toward fit; user rotation & pan ride on top
        v.scale += (v.fitScale - v.scale) * Math.min(1, dt * 5);

        ctx.fillStyle = "#07120d";
        ctx.fillRect(0, 0, v.w, v.h);

        ctx.save();
        ctx.translate(v.w / 2 + v.panX, v.h / 2 + v.panY);
        ctx.rotate((v.rotDeg * Math.PI) / 180);
        ctx.scale(v.scale, v.scale);
        ctx.translate(-v.cx, -v.cy);

        const segLen = v.fitScale; // px per model unit after scaling
        ctx.lineWidth = Math.max(1, Math.min(3, segLen * 0.12));
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Gauge bands: split visible path into tonal chunks
        const BAND = 1024;
        let i = 0;
        while (i < count - 1) {
          const end = Math.min(count - 1, i + BAND);
          ctx.strokeStyle = GAUGE[Math.floor(i / BAND) % GAUGE.length];
          ctx.beginPath();
          ctx.moveTo(g.pts[i * 2], g.pts[i * 2 + 1]);
          for (let j = i + 1; j <= end; j++) {
            ctx.lineTo(g.pts[j * 2], g.pts[j * 2 + 1]);
          }
          ctx.stroke();
          i = end;
        }

        // Head marker
        const hx = g.pts[(count - 1) * 2];
        const hy = g.pts[(count - 1) * 2 + 1];
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(hx, hy, Math.max(3, segLen * 0.22), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = "#07120d";
        ctx.fillRect(0, 0, v.w, v.h);
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const iterate = useCallback(() => {
    setIter((n) => {
      const next = Math.min(MAX_ITER, n + 1);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setIter(8);
    shownRef.current = 0;
    targetShownRef.current = 0;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        iterate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [iterate]);

  // Pan + rotate controls
  const drag = useRef({ active: false, lx: 0, ly: 0 });
  const onDown = (e: React.PointerEvent) => {
    drag.current = { active: true, lx: e.clientX, ly: e.clientY };
    wrapRef.current?.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    view.current.panX += e.clientX - drag.current.lx;
    view.current.panY += e.clientY - drag.current.ly;
    drag.current.lx = e.clientX;
    drag.current.ly = e.clientY;
  };
  const onUp = () => {
    drag.current.active = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      view.current.rotDeg += e.deltaY < 0 ? 4 : -4;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#07120d] select-none">
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
        <h1 className="font-mono text-sm tracking-[0.35em] text-emerald-300 uppercase">
          Dragon Curve
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase">
          Heighway Folding Bench · Order {iter}
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase leading-relaxed">
          Space — Iterate · Wheel — Rotate
          <br />
          Drag — Pan Sheet
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none">
        <Readout label="Order">{iter}</Readout>
        <Readout label="Segments">{Math.max(0, Math.floor(shownRef.current)).toLocaleString()}</Readout>
        <Readout label="Rotation">{`${view.current.rotDeg.toFixed(0)}°`}</Readout>
        <button
          onClick={iterate}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-emerald-900 text-emerald-300 hover:bg-emerald-900/30 transition-colors pointer-events-auto"
        >
          Iterate
        </button>
        <button
          onClick={reset}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-500 hover:text-neutral-200 transition-colors pointer-events-auto"
        >
          Refold
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
      <span className="font-mono text-sm text-neutral-200 tabular-nums">{children}</span>
    </div>
  );
}

export default DragonCurveUnfolder;
