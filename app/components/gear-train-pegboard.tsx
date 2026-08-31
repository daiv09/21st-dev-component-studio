"use client";

/**
 * Gear Yard — a brass pegboard where you compose real gear trains. Drag
 * gears out of the crib and snap them onto pegs; any two whose pitch
 * circles touch become meshed and the driver's motion propagates through
 * the train with exact signed ratios (ω₂ = −ω₁·r₁/r₂). WHEEL drives the
 * input gear faster or slower and every downstream stage obeys instantly.
 */

import React, { useEffect, useRef, useState } from "react";

const SIZES = [
  { r: 34, label: "S" },
  { r: 52, label: "M" },
  { r: 74, label: "L" },
];
const PITCH = 118;

interface Gear {
  c: number;
  r: number; // grid col/row (renamed below)
  size: number;
}

export function GearTrainPegboard() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    cols: 0,
    rows: 0,
    ox: 0,
    oy: 0,
    gears: [] as { col: number; row: number; size: number }[],
    driverOmega: 1.1,
    angles: new Float64Array(64),
    grabbed: -1,
    grabOffset: { x: 0, y: 0 },
    ghost: null as null | { x: number; y: number; size: number },
    stages: 0,
    ratioText: "1 : 1",
  });

  const [hud, setHud] = useState({ rpm: "10.5 CW", stages: 0, ratio: "1 : 1", placed: 0 });
  const [spawnSize, setSpawnSize] = useState(1);

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
      s.cols = Math.max(3, Math.floor((rect.width - 120) / PITCH));
      s.rows = Math.max(3, Math.floor((rect.height - 220) / PITCH));
      s.ox = (rect.width - (s.cols - 1) * PITCH) / 2;
      s.oy = (rect.height - (s.rows - 1) * PITCH) / 2 - 10;
      // seed a starter train once
      if (s.gears.length === 0 && s.cols >= 4 && s.rows >= 2) {
        const midR = Math.floor(s.rows / 2);
        s.gears.push({ col: 1, row: midR, size: 2 });
        s.gears.push({ col: 2, row: midR, size: 1 });
        s.gears.push({ col: 3, row: midR, size: 0 });
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const pegXY = (col: number, row: number) => ({
      x: s.ox + col * PITCH,
      y: s.oy + row * PITCH,
    });

    const radiusOf = (sizeIdx: number) => SIZES[sizeIdx].r;

    // BFS kinematic propagation
    const propagate = () => {
      const omegas = new Map<number, number>();
      if (!s.gears.length) {
        s.stages = 0;
        s.ratioText = "1 : 1";
        return omegas;
      }
      omegas.set(0, s.driverOmega);
      const queue = [0];
      while (queue.length) {
        const i = queue.shift()!;
        const gi = s.gears[i];
        const pi = pegXY(gi.col, gi.row);
        const ri = radiusOf(gi.size);
        for (let j = 0; j < s.gears.length; j++) {
          if (j === i || omegas.has(j)) continue;
          const gj = s.gears[j];
          const pj = pegXY(gj.col, gj.row);
          const rj = radiusOf(gj.size);
          const d = Math.hypot(pj.x - pi.x, pj.y - pi.y);
          if (Math.abs(d - (ri + rj)) < 12) {
            omegas.set(j, -(omegas.get(i)! * ri) / rj);
            queue.push(j);
          }
        }
      }
      s.stages = Math.max(0, omegas.size - 1);
      const lastIdx = [...omegas.keys()].pop();
      if (lastIdx !== undefined && omegas.size > 1) {
        const ratioVal = Math.abs(omegas.get(lastIdx)! / s.driverOmega);
        s.ratioText = `1 : ${ratioVal.toFixed(2)}`;
      } else {
        s.ratioText = "1 : 1";
      }
      return omegas;
    };

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      const omegas = propagate();
      s.gears.forEach((g, i) => {
        const w = omegas.get(i);
        if (w !== undefined) s.angles[i] += w * dt;
      });

      // ---- draw ----------------------------------------------------------
      ctx.fillStyle = "#12100c";
      ctx.fillRect(0, 0, s.w, s.h);

      // pegboard plate
      const pad = 46;
      ctx.fillStyle = "#171310";
      ctx.fillRect(pad, pad - 20, s.w - pad * 2, s.h - pad * 2 + 20);
      ctx.strokeStyle = "#2b2318";
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, pad - 20, s.w - pad * 2, s.h - pad * 2 + 20);

      // pegs
      ctx.fillStyle = "#4a3f28";
      for (let cRow = 0; cRow < s.rows; cRow++) {
        for (let cCol = 0; cCol < s.cols; cCol++) {
          const p = pegXY(cCol, cRow);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // gears
      s.gears.forEach((g, i) => {
        const p = pegXY(g.col, g.row);
        drawGear(ctx, p.x, p.y, radiusOf(g.size), s.angles[i], i === 0, omegas.has(i));
      });

      // ghost preview
      if (s.ghost) {
        ctx.globalAlpha = 0.35;
        drawGear(ctx, s.ghost.x, s.ghost.y, radiusOf(s.ghost.size), 0, false, false);
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const hudTimer = setInterval(() => {
      const rpm = (Math.abs(sim.current.driverOmega) * 60) / (2 * Math.PI);
      setHud({
        rpm: `${rpm.toFixed(1)} ${sim.current.driverOmega >= 0 ? "CW" : "CCW"}`,
        stages: sim.current.stages,
        ratio: sim.current.ratioText,
        placed: sim.current.gears.length,
      });
    }, 240);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(hudTimer);
    };
  }, []);

  const nearestPeg = (clientX: number, clientY: number) => {
    const s = sim.current;
    const rect = wrapRef.current!.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const col = Math.round((mx - s.ox) / PITCH);
    const row = Math.round((my - s.oy) / PITCH);
    if (col < 0 || row < 0 || col >= s.cols || row >= s.rows) return null;
    return { col, row, x: s.ox + col * PITCH, y: s.oy + row * PITCH };
  };

  const occupiedAt = (col: number, row: number, except = -1) =>
    sim.current.gears.findIndex(
      (g, i) => i !== except && g.col === col && g.row === row
    );

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const peg = nearestPeg(e.clientX, e.clientY);
    const s = sim.current;
    if (peg) {
      const occ = occupiedAt(peg.col, peg.row);
      if (occ >= 0) {
        s.grabbed = occ;
        s.gears.splice(occ, 0, s.gears.splice(occ, 1)[0]); // move to end stable
        s.grabbed = s.gears.length - 1;
        wrapRef.current?.setPointerCapture(e.pointerId);
        return;
      }
    }
    // spawn from crib
    if (peg) {
      s.gears.push({ col: peg.col, row: peg.row, size: spawnSize });
      s.grabbed = s.gears.length - 1;
      wrapRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.grabbed >= 0) {
      const peg = nearestPeg(e.clientX, e.clientY);
      if (peg && occupiedAt(peg.col, peg.row, s.grabbed) < 0) {
        const g = s.gears[s.grabbed];
        g.col = peg.col;
        g.row = peg.row;
      }
    } else {
      const peg = nearestPeg(e.clientX, e.clientY);
      s.ghost = peg ? { x: peg.x, y: peg.y, size: spawnSize } : null;
    }
  };

  const onUp = () => {
    sim.current.grabbed = -1;
  };

  const removeGrabbed = () => {
    const s = sim.current;
    if (s.gears.length <= 1) return;
    s.gears.pop(); // simplest: pop last; fine-grained removal via double-click
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sim.current.driverOmega = Math.max(-4, Math.min(4, sim.current.driverOmega * (e.deltaY < 0 ? 1.09 : 0.917)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#12100c] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={removeGrabbed}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Gear Yard
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Composable Ratio Bench · Pitch {PITCH}px
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Click Peg — Place · Drag — Move
          <br />
          Dbl-Click — Remove Last · Wheel — Drive Speed
        </p>
      </div>

      {/* Size selector */}
      <div className="absolute left-1/2 -translate-x-1/2 top-20 flex gap-2 z-10">
        {SIZES.map((sz, i) => (
          <button
            key={sz.label}
            onClick={() => setSpawnSize(i)}
            className={`w-11 h-11 rounded-full border-2 font-mono text-xs transition-colors ${
              spawnSize === i
                ? "border-amber-300 text-amber-200 bg-amber-900/40"
                : "border-neutral-700 text-neutral-500 hover:text-neutral-200"
            }`}
          >
            {sz.label}
          </button>
        ))}
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Driver">{hud.rpm}</Readout>
        <Readout label="Meshed Stages">{hud.stages}</Readout>
        <Readout label="End Ratio">{hud.ratio}</Readout>
        <Readout label="Gears">{hud.placed}</Readout>
      </div>
    </div>
  );
}

function drawGear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  angle: number,
  isDriver: boolean,
  powered: boolean
) {
  const teeth = Math.max(10, Math.round(R / 5.2));
  const toothH = R * 0.14;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.beginPath();
  for (let t = 0; t < teeth; t++) {
    const a0 = (t / teeth) * Math.PI * 2;
    const a1 = ((t + 0.38) / teeth) * Math.PI * 2;
    const a2 = ((t + 0.62) / teeth) * Math.PI * 2;
    const a3 = ((t + 1) / teeth) * Math.PI * 2;
    const rO = R + toothH;
    const rI = R - 2;
    if (t === 0) ctx.moveTo(Math.cos(a0) * rI, Math.sin(a0) * rI);
    ctx.lineTo(Math.cos(a1) * rO, Math.sin(a1) * rO);
    ctx.lineTo(Math.cos(a2) * rO, Math.sin(a2) * rO);
    ctx.lineTo(Math.cos(a3) * rI, Math.sin(a3) * rI);
  }
  ctx.closePath();
  ctx.fillStyle = isDriver ? "#f59e0b" : powered ? "#d4a24e" : "#8a7a55";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // face ring + hub
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.62, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, R * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "#211b10";
  ctx.fill();
  ctx.restore();

  if (isDriver) {
    ctx.beginPath();
    ctx.arc(x, y, R + toothH + 7, 0, Math.PI * 2);
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = "rgba(251,191,36,0.65)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.setLineDash([]);
  }
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

export default GearTrainPegboard;
