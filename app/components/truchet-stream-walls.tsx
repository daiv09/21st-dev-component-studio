"use client";

/**
 * Truchet Stream Walls — a wall of quarter-circle truchet tiles whose
 * random orientations weave endless winding streams. Sweep the pointer to
 * flip tiles under it, CLICK to blast-scramble a neighborhood, WHEEL
 * rescales the tile lattice. Pure combinatorics — no physics loop needed,
 * so every flip is instant and the wall never sleeps visually.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PALETTE = ["#f59e0b", "#efe7d3", "#8a7a55"];

interface TileProps {
  o: number;
  x: number;
  y: number;
  s: number;
  stroke: string;
  hovered: boolean;
  onHover: () => void;
}

const Tile = React.memo(function Tile({ o, x, y, s, stroke, hovered, onHover }: TileProps) {
  const r = s / 2;
  const sw = Math.max(3, s * 0.17);
  // Two truchet variants: arcs meet top-left/bottom-right vs top-right/bottom-left.
  const d =
    o === 0
      ? `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 M ${s} ${r} A ${r} ${r} 0 0 1 ${r} ${s}`
      : `M 0 ${r} A ${r} ${r} 0 0 0 ${r} 0 M ${s} ${r} A ${r} ${r} 0 0 0 ${r} ${s}`;
  return (
    <g transform={`translate(${x} ${y})`} onMouseEnter={onHover} style={{ cursor: "crosshair" }}>
      <rect width={s} height={s} fill="transparent" />
      {hovered && <rect width={s} height={s} fill="rgba(245,158,11,0.16)" />}
      {/* Both variants drawn ghost-faint underneath — flipping feels physical */}
      <path
        d={o === 0
          ? `M 0 ${r} A ${r} ${r} 0 0 0 ${r} 0 M ${s} ${r} A ${r} ${r} 0 0 0 ${r} ${s}`
          : `M 0 ${r} A ${r} ${r} 0 0 1 ${r} 0 M ${s} ${r} A ${r} ${r} 0 0 1 ${r} ${s}`}
        fill="none"
        stroke="#211d15"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </g>
  );
});

export function TruchetStreamWalls() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [cell, setCell] = useState(46);
  const [dims, setDims] = useState({ cols: 0, rows: 0 });
  const [grid, setGrid] = useState<Uint8Array>(new Uint8Array(0));
  const [hovered, setHovered] = useState(-1);

  // (Re)build lattice whenever size/cell changes
  useEffect(() => {
    const measure = () => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cols = Math.ceil(rect.width / cell) + 1;
      const rows = Math.ceil(rect.height / cell) + 1;
      const n = cols * rows;
      setDims({ cols, rows });
      setGrid((prev) => {
        const next = new Uint8Array(n);
        // Deterministic seed pattern (hash), preserved where possible on resize
        for (let i = 0; i < n; i++) {
          next[i] = prev && i < prev.length ? prev[i] : ((i * 2654435761) >>> 8) % 2;
        }
        return next;
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [cell]);

  const flipAt = useCallback((idx: number) => {
    setGrid((g) => {
      if (!g || idx >= g.length) return g;
      const next = g.slice();
      next[idx] ^= 1;
      return next;
    });
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!wrapRef.current || !dims.cols) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / cell);
    const r = Math.floor((e.clientY - rect.top) / cell);
    if (c < 0 || r < 0 || c >= dims.cols || r >= dims.rows) return;
    const idx = r * dims.cols + c;
    if (idx !== hovered) {
      setHovered(idx);
      flipAt(idx);
    }
  };

  const scramble = (e: React.MouseEvent) => {
    if (!wrapRef.current || !dims.cols || !grid.length) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const RADIUS = cell * 4.5;
    const c0 = Math.max(0, Math.floor((px - RADIUS) / cell));
    const c1 = Math.min(dims.cols - 1, Math.floor((px + RADIUS) / cell));
    const r0 = Math.max(0, Math.floor((py - RADIUS) / cell));
    const r1 = Math.min(dims.rows - 1, Math.floor((py + RADIUS) / cell));
    setGrid((g) => {
      const next = g.slice();
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const cxp = c * cell + cell / 2;
          const cyp = r * cell + cell / 2;
          if (Math.hypot(cxp - px, cyp - py) <= RADIUS) {
            const idx = r * dims.cols + c;
            next[idx] = Math.random() < 0.5 ? 0 : 1;
          }
        }
      }
      return next;
    });
  };

  const wheelLock = useRef(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelLock.current) return;
      wheelLock.current = true;
      setTimeout(() => (wheelLock.current = false), 60);
      setCell((v) => Math.round(Math.min(84, Math.max(22, v * (e.deltaY < 0 ? 1.12 : 0.89)))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const tiles = useMemo(() => {
    if (!dims.cols || grid.length !== dims.cols * dims.rows) return null;
    const out: React.ReactNode[] = [];
    for (let r = 0; r < dims.rows; r++) {
      for (let c = 0; c < dims.cols; c++) {
        const idx = r * dims.cols + c;
        out.push(
          <Tile
            key={idx}
            o={grid[idx]}
            x={c * cell}
            y={r * cell}
            s={cell}
            stroke={PALETTE[(r + c) % PALETTE.length]}
            hovered={hovered === idx}
            onHover={() => flipAt(idx)}
          />
        );
      }
    }
    return out;
  }, [dims, grid, cell, hovered, flipAt]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0b0a08] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none"
        onPointerMove={onPointerMove}
        onClick={scramble}
      >
        {tiles}
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Truchet Streams
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Combinatorial Tile Field
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Sweep — Flip Tiles
          <br />
          Click — Scramble Zone · Wheel — Rescale
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none">
        <Readout label="Lattice">{`${dims.cols}×${dims.rows}`}</Readout>
        <Readout label="Tile">{cell}px</Readout>
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

export default TruchetStreamWalls;
