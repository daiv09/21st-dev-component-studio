"use client";

/**
 * Sand Foundry — a cellular falling-matter sandbox with four materials that
 * genuinely interact: SAND granulates and piles at real angles of repose,
 * ACID flows like a liquid and eats through sand on contact, EMBERs rain
 * down burning out mid-air, and STONE is painted as permanent scenery.
 * Drag anywhere to pour; WHEEL (or the chips) swaps the hopper. Rendered
 * through raw ImageData so the whole tray updates every single frame.
 */

import React, { useEffect, useRef, useState } from "react";

const EMPTY = 0;
const SAND = 1;
const ACID = 2;
const EMBER = 3;
const WALL = 4;

const MAT_NAMES = ["SAND", "ACID", "EMBER", "STONE"];

// Flat per-material palettes (variants picked per-cell by hash)
const PAL: Record<number, string[]> = {
  [SAND]: ["#d9a441", "#c9963b", "#e0b054"],
  [ACID]: ["#a3e635", "#8bc92b", "#bef264"],
  [EMBER]: ["#ef4444", "#f87171", "#fbbf24"],
  [WALL]: ["#57534e", "#44403c", "#6b6660"],
};

export function FallingSandPourer() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const world = useRef({
    cols: 0,
    rows: 0,
    grid: new Uint8Array(0),
    shade: new Uint8Array(0),
    life: new Uint8Array(0),
    frame: 0,
    material: SAND as number,
    painting: false,
    px: -50,
    py: -50,
    counts: new Int32Array(5),
  });

  const [material, setMaterial] = useState(SAND);
  const [pop, setPop] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = world.current;

    // Offscreen buffer at grid resolution
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d")!;
    let img: ImageData;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const cell = rect.width < 700 ? 4 : 5;
      const old = w.grid;
      const oldC = w.cols;
      const oldR = w.rows;
      w.cols = Math.max(40, Math.floor(rect.width / cell));
      w.rows = Math.max(40, Math.floor(rect.height / cell));
      w.grid = new Uint8Array(w.cols * w.rows);
      w.shade = new Uint8Array(w.cols * w.rows);
      w.life = new Uint8Array(w.cols * w.rows);
      for (let r = 0; r < Math.min(oldR, w.rows); r++) {
        for (let c = 0; c < Math.min(oldC, w.cols); c++) {
          w.grid[r * w.cols + c] = old[r * oldC + c] ?? 0;
        }
      }
      buf.width = w.cols;
      buf.height = w.rows;
      img = bctx.createImageData(w.cols, w.rows);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Precompute palette RGB
    const rgbCache: Record<string, [number, number, number]> = {};
    const rgbOf = (hexv: string): [number, number, number] => {
      if (!rgbCache[hexv]) {
        rgbCache[hexv] = [
          parseInt(hexv.slice(1, 3), 16),
          parseInt(hexv.slice(3, 5), 16),
          parseInt(hexv.slice(5, 7), 16),
        ];
      }
      return rgbCache[hexv];
    };

    const idxAt = (c: number, r: number) => r * w.cols + c;

    const stepCell = (c: number, r: number, dirFlip: number) => {
      const i = idxAt(c, r);
      const mat = w.grid[i];
      if (mat === EMPTY || mat === WALL) return;

      const below = r + 1 < w.rows ? w.grid[idxAt(c, r + 1)] : WALL;
      if (below === EMPTY) {
        swap(i, idxAt(c, r + 1));
        return;
      }

      // diagonal slide
      const dFirst = dirFlip === 0 ? -1 : 1;
      for (const dd of [dFirst, -dFirst]) {
        const cc = c + dd;
        if (cc < 0 || cc >= w.cols) continue;
        const diag = w.grid[idxAt(cc, r + 1)];
        if (diag === EMPTY && w.grid[idxAt(cc, r)] === EMPTY) {
          swap(i, idxAt(cc, r + 1));
          return;
        }
      }

      if (mat === ACID) {
        // horizontal dispersion
        for (const dd of [dFirst, -dFirst]) {
          const cc = c + dd;
          if (cc < 0 || cc >= w.cols) continue;
          if (w.grid[idxAt(cc, r)] === EMPTY) {
            swap(i, idxAt(cc, r));
            return;
          }
        }
        // corrosion: eat sand neighbours
        const targets = [
          idxAt(c, Math.min(w.rows - 1, r + 1)),
          idxAt(Math.max(0, c - 1), r),
          idxAt(Math.min(w.cols - 1, c + 1), r),
        ];
        for (const tI of targets) {
          if (w.grid[tI] === SAND && Math.random() < 0.06) {
            w.grid[tI] = EMPTY;
            if (Math.random() < 0.35) w.grid[i] = EMPTY; // acid depletes
            return;
          }
        }
      }
    };

    const swap = (a: number, b: number) => {
      const g = w.grid, sh = w.shade, lf = w.life;
      const tg = g[a]; g[a] = g[b]; g[b] = tg;
      const ts = sh[a]; sh[a] = sh[b]; sh[b] = ts;
      const tl = lf[a]; lf[a] = lf[b]; lf[b] = tl;
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const tick = () => {
      w.frame++;
      const flip = w.frame % 2;
      for (let r = w.rows - 1; r >= 0; r--) {
        for (let k = 0; k < w.cols; k++) {
          const c = flip === 0 ? k : w.cols - 1 - k;
          stepCell(c, r, flip);
        }
      }
      // ember decay
      for (let i = 0; i < w.life.length; i++) {
        if (w.grid[i] === EMBER) {
          w.life[i]++;
          if (w.life[i] > 90 + (w.shade[i] % 5) * 22) {
            w.grid[i] = EMPTY;
            w.life[i] = 0;
          }
        }
      }
    };

    const paintPalette = () => {
      const data = img.data;
      w.counts.fill(0);
      for (let i = 0; i < w.grid.length; i++) {
        const m = w.grid[i];
        const o = i * 4;
        if (m === EMPTY) {
          data[o] = 11;
          data[o + 1] = 10;
          data[o + 2] = 8;
          data[o + 3] = 255;
          continue;
        }
        w.counts[m]++;
        const pal = PAL[m];
        const col = rgbOf(pal[w.shade[i] % pal.length]);
        data[o] = col[0];
        data[o + 1] = col[1];
        data[o + 2] = col[2];
        data[o + 3] = 255;
      }
      bctx.putImageData(img, 0, 0);
    };

    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;
      let steps = 0;
      while (acc >= 16 && steps < 3) {
        tick();
        acc -= 16;
        steps++;
      }
      paintPalette();

      // continuous pour while pointer held
      if (w.painting) pourAt(w.px, w.py);

      ctx.drawImage(buf, 0, 0, w.cols, w.rows, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      void steps;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const popTimer = setInterval(() => {
      setPop(w.counts[SAND] + w.counts[ACID] + w.counts[EMBER]);
    }, 400);

    const pourAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const cx = ((clientX - rect.left) / rect.width) * w.cols;
      const cy = ((clientY - rect.top) / rect.height) * w.rows;
      const R = 4.5;
      for (let dr = -R; dr <= R; dr++) {
        for (let dc = -R; dc <= R; dc++) {
          if (dc * dc + dr * dr > R * R) continue;
          const c = Math.round(cx + dc);
          const r = Math.round(cy + dr);
          if (c < 1 || r < 1 || c >= w.cols - 1 || r >= w.rows - 1) continue;
          const i = idxAt(c, r);
          if (Math.random() > 0.42) continue;
          if (w.material === WALL) {
            w.grid[i] = WALL;
          } else if (w.grid[i] === EMPTY) {
            w.grid[i] = w.material;
            w.shade[i] = Math.floor(Math.random() * 3);
            w.life[i] = 0;
          }
        }
      }
    };
    pourRef.current = pourAt;

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(popTimer);
    };
  }, []);

  const pourRef = useRef<(x: number, y: number) => void>(() => {});

  const localXY = (e: React.PointerEvent) => ({ x: e.clientX, y: e.clientY });

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const p = localXY(e);
    world.current.painting = true;
    world.current.px = p.x;
    world.current.py = p.y;
    pourRef.current(p.x, p.y);
    wrapRef.current?.setPointerCapture(e.pointerId);
  };
  const onMoveEvt = (e: React.PointerEvent) => {
    const p = localXY(e);
    world.current.px = p.x;
    world.current.py = p.y;
  };
  const onUp = () => {
    world.current.painting = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setMaterial((mIdx) => {
        const order = [SAND, ACID, EMBER, WALL];
        const cur = order.indexOf(mIdx as 1 | 2 | 3 | 4);
        const next = order[(cur + (e.deltaY < 0 ? 1 : 3)) % 4];
        world.current.material = next;
        return next;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const pickMat = (m: number) => {
    setMaterial(m);
    world.current.material = m;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0b0a08] select-none">
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
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Sand Foundry
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Cellular Matter Bench · Granular / Liquid / Thermal
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag — Pour · Wheel — Swap Hopper
          <br />
          Acid Eats Sand · Embers Burn Out
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-8 z-10">
        {MAT_NAMES.map((name, i) => {
          const code = i + 1;
          return (
            <button
              key={name}
              onClick={() => pickMat(code)}
              className={`flex flex-col items-center gap-2 group`}
            >
              <span
                className={`block w-16 h-16 rounded-lg border-2 transition-transform ${
                  material === code
                    ? "border-neutral-100 scale-105"
                    : "border-transparent opacity-70 group-hover:opacity-100"
                }`}
                style={{
                  background: PAL[code][1],
                  boxShadow: material === code ? "0 0 0 2px rgba(250,250,249,0.35)" : undefined,
                }}
              />
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-400">
                {name}
              </span>
            </button>
          );
        })}
        <Readout label="Matter">{pop.toLocaleString()}</Readout>
      </div>
    </div>
  );
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

export default FallingSandPourer;
