"use client";

/**
 * Ripple Tank — two coherent point sources superpose on a shallow tray,
 * rendered as a living contour chart: the interference field is quantised
 * into hard emerald bands so nodal lines read like topography. DRAG either
 * source to move it, WHEEL retunes wavelength, SPACE freezes phase to
 * inspect the standing pattern. Every pixel is evaluated per frame —
 * genuine superposition, no canned texture.
 */

import React, { useEffect, useRef, useState } from "react";

const BANDS = [
  [7, 17, 12],
  [6, 78, 59],
  [16, 125, 87],
  [52, 211, 153],
  [167, 243, 208],
];

export function RippleTankInterference() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const world = useRef({
    w: 0,
    h: 0,
    cols: 0,
    rows: 0,
    srcA: { x: 0.38, y: 0.5 }, // fractional coords
    srcB: { x: 0.62, y: 0.5 },
    lambda: 42,
    t: 0,
    frozen: false,
    buf: null as HTMLCanvasElement | null,
    bctx: null as CanvasRenderingContext2D | null,
    img: null as ImageData | null,
    dragging: null as null | "A" | "B",
  });

  const [hud, setHud] = useState({ lambda: 42, frozen: false });

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
      w.w = rect.width;
      w.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      w.cols = Math.max(80, Math.floor(rect.width / 3));
      w.rows = Math.max(60, Math.floor(rect.height / 3));
      if (!w.buf) {
        w.buf = document.createElement("canvas");
        w.bctx = w.buf.getContext("2d");
      }
      w.buf!.width = w.cols;
      w.buf!.height = w.rows;
      w.img = w.bctx!.createImageData(w.cols, w.rows);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!w.frozen) w.t += dt * 9;

      const ax = w.srcA.x * w.w;
      const ay = w.srcA.y * w.h;
      const bx = w.srcB.x * w.w;
      const by = w.srcB.y * w.h;
      const k = (Math.PI * 2) / w.lambda;

      const data = w.img!.data;
      const sx = w.w / w.cols;
      const sy = w.h / w.rows;
      let di = 0;
      for (let r = 0; r < w.rows; r++) {
        const py = (r + 0.5) * sy;
        const dyA = py - ay;
        const dyB = py - by;
        const dyA2 = dyA * dyA;
        const dyB2 = dyB * dyB;
        for (let c = 0; c < w.cols; c++) {
          const px = (c + 0.5) * sx;
          const dxA = px - ax;
          const dxB = px - bx;
          const amp =
            Math.sin(Math.sqrt(dxA * dxA + dyA2) * k - w.t) +
            Math.sin(Math.sqrt(dxB * dxB + dyB2) * k - w.t);
          // quantise [-2,2] into BANDS.length flat contours
          let bi = Math.floor(((amp + 2) / 4) * BANDS.length);
          if (bi < 0) bi = 0;
          else if (bi >= BANDS.length) bi = BANDS.length - 1;
          const col = BANDS[bi];
          data[di] = col[0];
          data[di + 1] = col[1];
          data[di + 2] = col[2];
          data[di + 3] = 255;
          di += 4;
        }
      }
      w.bctx!.putImageData(w.img!, 0, 0);
      ctx.drawImage(
        w.buf!,
        0, 0, w.cols, w.rows,
        0, 0, w.w, w.h
      );

      // Source markers
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(ax, ay, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0b0a08";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Labels
      ctx.font = "10px monospace";
      ctx.fillStyle = "#fafaf9";
      ctx.fillText("A", ax + 11, ay + 4);
      ctx.fillText("B", bx + 11, by + 4);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const hudTimer = setInterval(() => {
      setHud({ lambda: Math.round(world.current.lambda), frozen: world.current.frozen });
    }, 300);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  // Dragging sources
  const pickSource = (e: React.PointerEvent): "A" | "B" | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width);
    const my = ((e.clientY - rect.top) / rect.height);
    const dA = Math.hypot(mx - world.current.srcA.x, (my - world.current.srcA.y));
    const dB = Math.hypot(mx - world.current.srcB.x, (my - world.current.srcB.y));
    if (Math.min(dA, dB) > 0.06) return null;
    return dA <= dB ? "A" : "B";
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const hit = pickSource(e);
    if (!hit) return;
    world.current.dragging = hit;
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMoveEvt = (e: React.PointerEvent) => {
    if (!world.current.dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fx = Math.min(0.95, Math.max(0.05, (e.clientX - rect.left) / rect.width));
    const fy = Math.min(0.95, Math.max(0.05, (e.clientY - rect.top) / rect.height));
    const src = world.current.dragging === "A" ? world.current.srcA : world.current.srcB;
    src.x = fx;
    src.y = fy;
  };

  const onUp = () => {
    world.current.dragging = null;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      world.current.lambda = Math.min(110, Math.max(14, world.current.lambda * (e.deltaY < 0 ? 0.92 : 1.087)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        world.current.frozen = !world.current.frozen;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#07110d] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMoveEvt}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-emerald-300 uppercase">
          Ripple Tank
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase">
          Two-Source Superposition · Contour Render
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-300 uppercase leading-relaxed">
          Drag A / B — Move Sources
          <br />
          Wheel — Wavelength · Space — Freeze Phase
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Wavelength">{hud.lambda}px</Readout>
        <Readout label="Phase">{hud.frozen ? "FROZEN" : "RUNNING"}</Readout>
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase">
        {label}
      </span>
      <span className="font-mono text-lg text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

export default RippleTankInterference;
