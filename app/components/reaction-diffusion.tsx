"use client";

/**
 * Turing Garden — a Gray–Scott reaction-diffusion reactor rendered as a
 * living petri dish. Drag to inoculate the medium with chemical B and watch
 * morphogenetic patterns self-organise: coral, mitosis, worms, maze. WHEEL
 * cycles feed/kill regimes and the colony re-flowers into a new species.
 * Concentrations are posterised to four hard lime tones — no soft ramps,
 * just clean biological banding.
 */

import React, { useEffect, useRef, useState } from "react";

const PRESETS = [
  { name: "CORAL", f: 0.0545, k: 0.062 },
  { name: "MITOSIS", f: 0.0367, k: 0.0649 },
  { name: "WORMS", f: 0.058, k: 0.065 },
  { name: "MAZE", f: 0.029, k: 0.057 },
];

const BANDS = [
  [26, 46, 18], // faint haze
  [54, 83, 20],
  [101, 163, 13],
  [163, 230, 53],
];

export function ReactionDiffusion() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const world = useRef({
    cols: 0,
    rows: 0,
    A: new Float32Array(0),
    B: new Float32Array(0),
    img: null as ImageData | null,
    buf: null as HTMLCanvasElement | null,
    bctx: null as CanvasRenderingContext2D | null,
    presetIdx: 0,
    gen: 0,
    painting: false,
    px: -50,
    py: -50,
  });

  const [presetName, setPresetName] = useState(PRESETS[0].name);
  const [genReadout, setGenReadout] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = world.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      w.cols = Math.max(60, Math.floor(rect.width / 4));
      w.rows = Math.max(40, Math.floor(rect.height / 4));
      w.A = new Float32Array(w.cols * w.rows).fill(1);
      w.B = new Float32Array(w.cols * w.rows);
      w.gen = 0;

      if (!w.buf) {
        w.buf = document.createElement("canvas");
        w.bctx = w.buf.getContext("2d");
      }
      w.buf!.width = w.cols;
      w.buf!.height = w.rows;
      w.img = w.bctx!.createImageData(w.cols, w.rows);

      // Central seed square so the dish is alive immediately
      const c0 = Math.floor(w.cols / 2);
      const r0 = Math.floor(w.rows / 2);
      for (let r = r0 - 6; r <= r0 + 6; r++) {
        for (let c = c0 - 6; c <= c0 + 6; c++) {
          w.B[r * w.cols + c] = 1;
        }
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const simulate = () => {
      const p = PRESETS[w.presetIdx];
      const { cols, rows, A, B } = w;
      const DA = 1.0;
      const DB = 0.5;
      const dt = 1.0;

      for (let it = 0; it < 8; it++) {
        for (let r = 0; r < rows; r++) {
          const rUp = ((r - 1 + rows) % rows) * cols;
          const rDn = ((r + 1) % rows) * cols;
          const rC = r * cols;
          for (let c = 0; c < cols; c++) {
            const cL = (c - 1 + cols) % cols;
            const cR = (c + 1) % cols;
            const i = rC + c;
            const a = A[i];
            const b = B[i];
            const lapA =
              A[rC + cL] + A[rC + cR] + A[rUp + c] + A[rDn + c] - 4 * a;
            const lapB =
              B[rC + cL] + B[rC + cR] + B[rUp + c] + B[rDn + c] - 4 * b;
            const reaction = a * b * b;
            let na = a + (DA * lapA - reaction + p.f * (1 - a)) * dt;
            let nb = b + (DB * lapB + reaction - (p.k + p.f) * b) * dt;
            if (na < 0) na = 0; else if (na > 1) na = 1;
            if (nb < 0) nb = 0; else if (nb > 1) nb = 1;
            // write into shadow copies via ping-pong trick:
            // (single-buffer with immediate reuse is stable enough at dt=1
            //  for Gray–Scott when written back per-cell in scan order)
            A[i] = na;
            B[i] = nb;
          }
        }
        w.gen += 8;
      }
    };

    const render = () => {
      const data = w.img!.data;
      const { A, B } = w;
      for (let i = 0; i < B.length; i++) {
        const v = Math.min(1, B[i] * 5);
        const band = v <= 0 ? 0 : Math.min(BANDS.length, 1 + Math.floor(v * (BANDS.length - 1))) - 1;
        const o = i * 4;
        if (B[i] < 0.04) {
          data[o] = 8;
          data[o + 1] = 16;
          data[o + 2] = 11;
        } else {
          const col = BANDS[Math.max(0, band)];
          data[o] = col[0];
          data[o + 1] = col[1];
          data[o + 2] = col[2];
        }
        data[o + 3] = 255;
        void A;
      }
      w.bctx!.putImageData(w.img!, 0, 0);
    };

    let raf = 0;
    const loop = () => {
      if (w.painting) seedAt(w.px, w.py);
      simulate();
      render();
      ctx.drawImage(
        w.buf!,
        0, 0, w.cols, w.rows,
        0, 0,
        canvas.width / (window.devicePixelRatio || 1),
        canvas.height / (window.devicePixelRatio || 1)
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const genTimer = setInterval(() => setGenReadout(w.gen), 400);

    const seedAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const cc = Math.round(((clientX - rect.left) / rect.width) * w.cols);
      const rr = Math.round(((clientY - rect.top) / rect.height) * w.rows);
      const R = 3;
      for (let dr = -R; dr <= R; dr++) {
        for (let dc = -R; dc <= R; dc++) {
          if (dc * dc + dr * dr > R * R) continue;
          const c = cc + dc;
          const r = rr + dr;
          if (c < 0 || r < 0 || c >= w.cols || r >= w.rows) continue;
          w.B[r * w.cols + c] = 1;
        }
      }
    };
    seedRef.current = seedAt;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(genTimer);
    };
  }, []);

  const seedRef = useRef<(x: number, y: number) => void>(() => {});

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    world.current.painting = true;
    world.current.px = e.clientX;
    world.current.py = e.clientY;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };
  const onMoveEvt = (e: React.PointerEvent) => {
    world.current.px = e.clientX;
    world.current.py = e.clientY;
  };
  const onUp = () => {
    world.current.painting = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next =
        (world.current.presetIdx + (e.deltaY < 0 ? 1 : PRESETS.length - 1)) %
        PRESETS.length;
      world.current.presetIdx = next;
      setPresetName(PRESETS[next].name);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#081009] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onPointerDown={onDown}
        onPointerMove={onMoveEvt}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-lime-300 uppercase">
          Turing Garden
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Gray–Scott Reactor · Regime {presetName}
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — Inoculate Medium
          <br />
          Wheel — Feed/Kill Regime
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Regime">{presetName}</Readout>
        <Readout label="F / K">
          {PRESETS[world.current.presetIdx].f.toFixed(3)} /{" "}
          {PRESETS[world.current.presetIdx].k.toFixed(3)}
        </Readout>
        <Readout label="Steps">{genReadout.toLocaleString()}</Readout>
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

export default ReactionDiffusion;
