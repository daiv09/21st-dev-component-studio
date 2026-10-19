"use client";

/**
 * Hex Life Colony — Conway's automaton transplanted onto a honeycomb with a
 * six-neighbourhood (rules B2/S34: birth on exactly 2, survival on 3–4).
 * Drag to paint living cells, watch generations age through four green
 * tones, SPACE freezes time, WHEEL retunes the clock, and the seed bench
 * stamps proven starting colonies (DOMINO blooms, FLOWER decays, SOUP boils).
 */

import React, { useEffect, useRef, useState } from "react";

const RULE_B = [false, false, true, false, false, false, false]; // exactly 2
const RULE_S = [false, false, false, true, true, false, false]; // 3 or 4

// odd-r offset neighbour deltas
const NB_EVEN = [[+1, 0], [0, -1], [-1, -1], [-1, 0], [-1, +1], [0, +1]];
const NB_ODD = [[+1, 0], [+1, -1], [0, -1], [-1, 0], [0, +1], [+1, +1]];

const AGE_COLORS = ["#a7f3d0", "#34d399", "#10b981", "#047857"];

export function HexLifeColony() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    cols: 0,
    rows: 0,
    grid: new Uint8Array(0),
    age: new Uint8Array(0),
    gen: 0,
    pop: 0,
    acc: 0,
    tickMs: 130,
    paused: false,
    hexR: 11,
  });

  const [stats, setStats] = useState({ gen: 0, pop: 0 });
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const idx = (c: number, r: number) => r * sim.current.cols + c;

  const stepOnce = () => {
    const s = sim.current;
    const { cols, rows, grid } = s;
    const next = new Uint8Array(grid.length);
    let pop = 0;
    for (let r = 0; r < rows; r++) {
      const nb = r % 2 === 0 ? NB_EVEN : NB_ODD;
      for (let c = 0; c < cols; c++) {
        let n = 0;
        for (let k = 0; k < 6; k++) {
          const cc = (c + nb[k][0] + cols) % cols;
          const rr = (r + nb[k][1] + rows) % rows;
          n += grid[idx(cc, rr)];
        }
        const alive = grid[idx(c, r)];
        const born = !alive && RULE_B[n];
        const live = alive && RULE_S[n];
        next[idx(c, r)] = born || live ? 1 : 0;
        // age bookkeeping
        if (next[idx(c, r)]) {
          pop++;
          s.age[idx(c, r)] = alive ? Math.min(255, s.age[idx(c, r)] + 1) : 0;
        }
      }
    }
    s.grid = next;
    s.gen++;
    s.pop = pop;
  };

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
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const hexR = rect.width < 700 ? 9 : 12;
      const w = Math.sqrt(3) * hexR;
      const hStep = 1.5 * hexR;
      const cols = Math.max(4, Math.floor(rect.width / w));
      const rows = Math.max(4, Math.floor(rect.height / hStep));
      const old = s.grid;
      s.cols = cols;
      s.rows = rows;
      s.hexR = hexR;
      s.grid = new Uint8Array(cols * rows);
      s.age = new Uint8Array(cols * rows);
      // keep survivors on resize
      for (let i = 0; i < Math.min(old.length, s.grid.length); i++) s.grid[i] = old[i];
      recount();
    };

    const recount = () => {
      let p = 0;
      for (let i = 0; i < s.grid.length; i++) p += s.grid[i];
      s.pop = p;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // stamp initial colony: a central domino
    const stampInitial = () => {
      const c0 = Math.floor(s.cols / 2);
      const r0 = Math.floor(s.rows / 2);
      s.grid[idx(c0, r0)] = 1;
      s.grid[idx(Math.min(s.cols - 1, c0 + 1), r0)] = 1;
      recount();
    };
    stampInitial();

    let raf = 0;
    let last = performance.now();

    const draw = () => {
      const rect = { w: canvas.width, h: canvas.height };
      ctx.save();
      ctx.scale(1, 1); // transform already set via setTransform
      ctx.fillStyle = "#08110b";
      ctx.fillRect(0, 0, rect.w, rect.h);
      ctx.restore();

      const hexR = s.hexR;
      const w = Math.sqrt(3) * hexR;
      const hStep = 1.5 * hexR;
      const ox = ((canvas.width / (window.devicePixelRatio || 1)) - (s.cols - 0.5) * w) / 2;
      const oy = 10;

      for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < s.cols; c++) {
          const cxp = ox + c * w + w / 2 + (r % 2 === 0 ? 0 : w / 2);
          const cyp = oy + hexR + r * hStep;
          const alive = s.grid[idx(c, r)];
          if (alive) {
            const a = s.age[idx(c, r)];
            const tier = a < 2 ? 0 : a < 5 ? 1 : a < 12 ? 2 : 3;
            ctx.fillStyle = AGE_COLORS[tier];
            hexPath(ctx, cxp, cyp, hexR - 1.2);
            ctx.fill();
          } else {
            ctx.strokeStyle = "rgba(16,60,40,0.35)";
            ctx.lineWidth = 1;
            hexPath(ctx, cxp, cyp, hexR - 1.2);
            ctx.stroke();
          }
        }
      }

      void last;
    };

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      if (!pausedRef.current) {
        s.acc += dt;
        while (s.acc >= s.tickMs) {
          stepOnce();
          s.acc -= s.tickMs;
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const statTimer = setInterval(() => {
      setStats({ gen: s.gen, pop: s.pop });
    }, 250);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(statTimer);
    };
  }, []);

  // ---- painting -----------------------------------------------------------
  const paintMode = useRef(1); // 1 = birth, 0 = erase
  const painting = useRef(false);

  const cellAt = (clientX: number, clientY: number): [number, number] | null => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const s = sim.current;
    const w = Math.sqrt(3) * s.hexR;
    const hStep = 1.5 * s.hexR;
    const ox = (rect.width - (s.cols - 0.5) * w) / 2;
    const oy = 10;
    const r = Math.floor((y - oy) / hStep);
    const c = Math.floor((x - ox) / w - (r % 2 === 0 ? 0 : 0.5));
    if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) return null;
    return [c, r];
  };

  const paintAt = (clientX: number, clientY: number) => {
    const hit = cellAt(clientX, clientY);
    if (!hit) return;
    const s = sim.current;
    const i = idx(hit[0], hit[1]);
    s.grid[i] = paintMode.current;
    if (!paintMode.current) s.age[i] = 0;
    let p = 0;
    for (let j = 0; j < s.grid.length; j++) p += s.grid[j];
    s.pop = p;
  };

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    paintMode.current = e.button === 2 ? 0 : 1;
    painting.current = true;
    paintAt(e.clientX, e.clientY);
    wrapRef.current?.setPointerCapture(e.pointerId);
  };
  const onMoveEvt = (e: React.PointerEvent) => {
    if (painting.current) paintAt(e.clientX, e.clientY);
  };
  const onUp = () => {
    painting.current = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const stopCtx = (e: Event) => e.preventDefault();
    el.addEventListener("contextmenu", stopCtx);
    return () => el.removeEventListener("contextmenu", stopCtx);
  }, []);

  // ---- keyboard + wheel ---------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.tickMs = Math.min(420, Math.max(45, s.tickMs * (e.deltaY < 0 ? 0.88 : 1.136)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ---- seed bench ---------------------------------------------------------
  const clearAll = () => {
    sim.current.grid.fill(0);
    sim.current.age.fill(0);
    sim.current.gen = 0;
    sim.current.pop = 0;
  };

  const stamp = (kind: "domino" | "flower" | "soup") => {
    const s = sim.current;
    const c0 = Math.floor(s.cols / 2);
    const r0 = Math.floor(s.rows / 2);
    const set = (c: number, r: number) => {
      const cc = ((c % s.cols) + s.cols) % s.cols;
      const rr = ((r % s.rows) + s.rows) % s.rows;
      s.grid[idx(cc, rr)] = 1;
      s.age[idx(cc, rr)] = 0;
    };
    if (kind === "domino") {
      clearAll();
      set(c0, r0);
      set(c0 + 1, r0);
    } else if (kind === "flower") {
      clearAll();
      const ring = NB_EVEN;
      set(c0, r0);
      for (const [dc, dr] of ring) set(c0 + dc, r0 + dr);
    } else {
      for (let i = 0; i < s.grid.length; i++) {
        s.grid[i] = Math.random() < 0.24 ? 1 : 0;
        s.age[i] = 0;
      }
    }
    let p = 0;
    for (let i = 0; i < s.grid.length; i++) p += s.grid[i];
    s.pop = p;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#08110b] select-none">
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
        <h1 className="font-mono text-sm tracking-[0.35em] text-emerald-300 uppercase">
          Hex Colony
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase">
          Six-Neighbour Automaton · B2/S34
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-400 uppercase leading-relaxed">
          Drag — Paint · Right-Drag — Erase
          <br />
          Space — Freeze · Wheel — Clock Speed
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-8">
        <Readout label="Gen">{stats.gen}</Readout>
        <Readout label="Population">{stats.pop}</Readout>
        <div className="flex gap-1.5 p-1 rounded-lg border border-neutral-800 bg-neutral-900/70 pointer-events-auto">
          {(
            [
              ["domino", "Domino"],
              ["flower", "Flower"],
              ["soup", "Soup"],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              onClick={() => stamp(kind)}
              className="px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase rounded-md text-emerald-300 hover:bg-emerald-900/40 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className={`mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border transition-colors pointer-events-auto ${
            paused
              ? "border-amber-700 text-amber-300 bg-amber-500/10"
              : "border-neutral-800 text-neutral-400 hover:text-neutral-100"
          }`}
        >
          {paused ? "Frozen" : "Running"}
        </button>
        <button
          onClick={clearAll}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-900 transition-colors pointer-events-auto"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // flat-top hexagon
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 180) * (60 * k);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-lg text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

export default HexLifeColony;
