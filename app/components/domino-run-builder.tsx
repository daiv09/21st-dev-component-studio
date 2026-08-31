"use client";

/**
 * Cascade Yard — lay runs of dominoes by dragging along the ground, then
 * click any tile to fire a true chain reaction: each tile only trips its
 * neighbour once it has physically rotated past the trip angle, so gaps
 * matter and long cascades take real time. Erase mode lifts tiles back out;
 * chips clear the yard or topple everything from the far end.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

interface Tile {
  id: number;
  x: number; // px from left
  state: "standing" | "falling" | "down";
  startedAt: number;
  angle: number;
}

const TILE_W = 13;
const TILE_H = 62;
const MIN_GAP = 26;
const MAX_REACH = 48; // a falling tile can reach this far to trip the next
const TRIP_ANGLE = 56; // degrees at which the neighbour fires
const FALL_MS = 340;

export function DominoRunBuilder() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tilesRef = useRef<Tile[]>([]);
  const nodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const idCounter = useRef(0);

  const [erase, setErase] = useState(false);
  const [count, setCount] = useState(0);
  const [lastCascadeMs, setLastCascadeMs] = useState<number | null>(null);

  const groundYRef = useRef(0);

  const [, setTick] = useState(0);
  const forceRender = useCallback(() => setTick((t) => t + 1), []);

  const syncCount = () => setCount(tilesRef.current.length);

  const addTile = useCallback((x: number) => {
    const tiles = tilesRef.current;
    // Respect minimum spacing in both directions.
    for (const t of tiles) {
      if (Math.abs(t.x - x) < MIN_GAP) return;
    }
    if (tiles.length >= 90) return;
    tiles.push({
      id: ++idCounter.current,
      x,
      state: "standing",
      startedAt: 0,
      angle: 0,
    });
    tiles.sort((a, b) => a.x - b.x);
    syncCount();
  }, []);

  const removeNear = useCallback((x: number) => {
    const before = tilesRef.current.length;
    tilesRef.current = tilesRef.current.filter((t) => Math.abs(t.x - x) > 22);
    if (tilesRef.current.length !== before) {
      nodeRefs.current.clear(); // stale nodes dropped on next commit
      forceRender();
      syncCount();
    }
  }, [forceRender]);

  const groundY = () => groundYRef.current;

  const toppleFrom = useCallback(
    (tile: Tile, dir: 1 | -1) => {
      if (tile.state !== "standing") return;
      tile.state = "falling";
      tile.startedAt = performance.now();
      void dir;
    },
    []
  );

  const fireCascade = useCallback(
    (startIdx: number, dir: 1 | -1) => {
      const tiles = tilesRef.current;
      if (!tiles[startIdx] || tiles[startIdx].state !== "standing") return;
      cascadeStart.current = performance.now();
      cascadeActive.current = true;
      toppleFrom(tiles[startIdx], dir);
    },
    [toppleFrom]
  );

  const cascadeStart = useRef(0);
  const cascadeActive = useRef(false);

  const toppleAll = () => {
    const tiles = tilesRef.current.filter((t) => t.state === "standing");
    if (!tiles.length) return;
    cascadeStart.current = performance.now();
    cascadeActive.current = true;
    toppleFrom(tiles[0], 1);
  };

  const clearYard = () => {
    tilesRef.current = [];
    nodeRefs.current.clear();
    forceRender();
    syncCount();
    setLastCascadeMs(null);
  };

  // Pointer painting
  const painting = useRef<{ active: boolean; lastX: number }>({ active: false, lastX: 0 });

  const toLocalX = (e: PointerEvent | React.PointerEvent): number | null => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return e.clientX - rect.left;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    groundYRef.current = rect.height * 0.74;
    const x = toLocalX(e)!;
    const y = e.clientY - rect.top;
    if (y < groundY() - TILE_H - 30 || y > groundY() + 26) return;

    painting.current = { active: true, lastX: x };
    wrapRef.current?.setPointerCapture(e.pointerId);

    if (erase) {
      removeNear(x);
      return;
    }
    // Click directly ON a tile fires its cascade; on bare ground it lays one.
    const hit = tilesRef.current.find((t) => Math.abs(t.x - x) < TILE_W * 1.4 && t.state === "standing");
    if (hit) fireCascade(tilesRef.current.indexOf(hit), 1);
    else addTile(x);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!painting.current.active) return;
    const x = toLocalX(e);
    if (x === null) return;
    if (erase) {
      removeNear(x);
      return;
    }
    if (Math.abs(x - painting.current.lastX) >= MIN_GAP) {
      addTile(x);
      painting.current.lastX = x;
    }
  };
  const onPointerUp = () => {
    painting.current.active = false;
  };

  // Simulation + transform write-back
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const now = performance.now();
      const tiles = tilesRef.current;
      let allDone = true;

      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const node = nodeRefs.current.get(t.id);
        if (t.state === "falling") {
          allDone = false;
          const p = Math.min(1, (now - t.startedAt) / FALL_MS);
          // Accelerating tip-over with a hard stop bounce
          const eased = p * p * (1.6 - 0.6 * p);
          t.angle = Math.min(88, eased * 88);
          if (t.angle >= 88) t.state = "down";

          // Trip neighbours once past the critical angle
          if (t.angle >= TRIP_ANGLE) {
            const right = tiles[i + 1];
            const left = tiles[i - 1];
            const reachRight =
              right && right.x - t.x > 0 && right.x - t.x <= MAX_REACH;
            const reachLeft =
              left && t.x - left.x > 0 && t.x - left.x <= MAX_REACH;
            if (reachRight && right!.state === "standing") {
              right!.state = "falling";
              right!.startedAt = now;
              allDone = false;
            }
            if (reachLeft && left!.state === "standing") {
              left!.state = "falling";
              left!.startedAt = now;
              allDone = false;
            }
          }
        } else if (t.state === "standing") {
          allDone = false;
        }

        if (node) {
          node.style.transformOrigin = "100% 100%";
          node.style.transform = `rotate(${t.angle}deg)`;
        }
      }

      if (cascadeActive.current && allDone && tiles.some((t) => t.state !== "standing")) {
        cascadeActive.current = false;
        setLastCascadeMs(Math.round(now - cascadeStart.current));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Demo run on mount (deterministic)
  useEffect(() => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const startX = Math.max(60, (rect ? rect.width / 2 : 400) - 260);
    for (let i = 0; i < 16; i++) addTile(startX + i * (i % 5 === 4 ? 44 : 32));
    const nodes = nodeRefs.current;
    return () => {
      nodes.clear();
    };
  }, [addTile]);

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative h-screen w-full overflow-hidden bg-[#0b0a08] select-none touch-none cursor-crosshair"
    >
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Cascade Yard
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Chain-Reaction Proving Ground
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag Ground — Lay Tiles
          <br />
          Click Tile — Topple
        </p>
      </div>

      {/* Ground */}
      <div
        className="absolute inset-x-0 border-t-2 border-neutral-700"
        style={{ top: "74%" }}
      >
        <div className="h-16 bg-[#141210] overflow-hidden flex items-end justify-around opacity-70">
          {Array.from({ length: 60 }, (_, i) => (
            <span key={i} className="w-px h-3 bg-neutral-800" />
          ))}
        </div>
      </div>

      {/* Tiles */}
      {tilesRef.current.map((t) => (
        <div
          key={t.id}
          ref={(el) => {
            if (el) nodeRefs.current.set(t.id, el);
          }}
          className="absolute will-change-transform"
          style={{
            left: t.x - TILE_W / 2,
            width: TILE_W,
            height: TILE_H,
            background:
              t.id % 9 === 0 ? "#f59e0b" : t.id % 3 === 0 ? "#d6d3d1" : "#a8a29e",
            boxShadow:
              "inset 2px 0 0 rgba(255,255,255,0.28), inset -2px 0 0 rgba(0,0,0,0.3), 0 6px 10px rgba(0,0,0,0.45)",
            borderRadius: 2,
            transformOrigin: "100% 100%",
          }}
        />
      ))}

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-10">
        <button
          onClick={() => setErase((v) => !v)}
          className={`px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border transition-colors ${
            erase
              ? "border-red-600/70 text-red-400 bg-red-500/10"
              : "border-neutral-800 text-neutral-400 hover:text-neutral-100"
          }`}
        >
          {erase ? "Erasing" : "Erase"}
        </button>
        <Readout label="Tiles">{count}</Readout>
        <Readout label="Last Cascade">
          {lastCascadeMs === null ? "—" : `${(lastCascadeMs / 1000).toFixed(2)}s`}
        </Readout>
        <button
          onClick={toppleAll}
          className="px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-700 transition-colors"
        >
          Topple All
        </button>
        <button
          onClick={clearYard}
          className="px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-900 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 pointer-events-none">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-lg text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

export default DominoRunBuilder;
