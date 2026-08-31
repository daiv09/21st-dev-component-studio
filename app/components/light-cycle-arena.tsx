"use client";

/**
 * Light Cycle Arena — a trail-snake duel on a shrinking-feeling grid.
 * Every cell a rider crosses fuses into permanent wall; first to touch
 * any wall (or each other) loses the round. The AI reads only one cell
 * ahead like a honest opponent: it survives by keeping its options open
 * and strikes when your corridor narrows. WASD / ARROWS steer the white
 * rider. Rounds escalate tempo — the arena gets deadlier as you win.
 */

import React, { useEffect, useRef, useState } from "react";

const COLS = 44;
const ROWS = 30;

type Owner = 0 | 1 | 2;

interface Rider {
  cx: number;
  cy: number;
  px: number; // previous cell for interpolation
  py: number;
  dx: number;
  dy: number;
  pendDx: number;
  pendDy: number;
  prog: number; // 0..1 between prev→current
  alive: boolean;
}

export function LightCycleArena() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    grid: new Uint8Array(COLS * ROWS),
    p1: null as unknown as Rider,
    p2: null as unknown as Rider,
    phase: "RUN" as "RUN" | "RESET",
    phaseT: 0,
    cellT: 0.11,
    scoreP1: 0,
    scoreP2: 0,
    flash: 0,
    winner: "" as "" | "YOU" | "AI",
  });

  const [hud, setHud] = useState({ you: 0, ai: 0, tempo: 9 });

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
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const resetRound = () => {
      s.grid.fill(0);
      const midY = Math.floor(ROWS / 2);
      s.p1 = { cx: 8, cy: midY, px: 8, py: midY, dx: 1, dy: 0, pendDx: 1, pendDy: 0, prog: 0, alive: true };
      s.p2 = { cx: COLS - 9, cy: midY, px: COLS - 9, py: midY, dx: -1, dy: 0, pendDx: -1, pendDy: 0, prog: 0, alive: true };
      s.grid[midY * COLS + 8] = 1;
      s.grid[midY * COLS + (COLS - 9)] = 2;
      s.phase = "RUN";
      s.winner = "";
    };
    resetRound();

    const cellBlocked = (x: number, y: number): boolean => {
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
      return s.grid[y * COLS + x] !== 0;
    };

    const aiChoose = (): void => {
      const r = s.p2;
      const opts: [number, number][] = [
        [r.dx, r.dy], // straight
        [-r.dy, r.dx],
        [r.dy, -r.dx],
      ];
      const safe = opts.filter(([ox, oy]) => !cellBlocked(r.cx + ox, r.cy + oy));
      if (!safe.length) {
        // doomed — keep heading
        return;
      }
      // aggression: chase the player's future cell sometimes
      const targetX = s.p1.cx + s.p1.dx * 4;
      const targetY = s.p1.cy + s.p1.dy * 4;
      let best = safe[0];
      let bestScore = -Infinity;
      for (const [ox, oy] of safe) {
        const nx = r.cx + ox;
        const ny = r.cy + oy;
        // count free neighbours there (mobility heuristic)
        let mobility = 0;
        if (!cellBlocked(nx + 1, ny)) mobility++;
        if (!cellBlocked(nx - 1, ny)) mobility++;
        if (!cellBlocked(nx, ny + 1)) mobility++;
        if (!cellBlocked(nx, ny - 1)) mobility++;
        const distPenalty = -Math.hypot(targetX - nx, targetY - ny) * 0.35;
        const straightBonus = ox === r.dx && oy === r.dy ? 0.6 : 0;
        const score = mobility * 1.4 + distPenalty * (Math.random() < 0.65 ? 1 : 0.15) + straightBonus + Math.random() * 0.3;
        if (score > bestScore) {
          bestScore = score;
          best = [ox, oy];
        }
      }
      r.pendDx = best[0];
      r.pendDy = best[1];
    };

    const advance = (r: Rider, owner: Owner): boolean => {
      r.dx = r.pendDx;
      r.dy = r.pendDy;
      const nx = r.cx + r.dx;
      const ny = r.cy + r.dy;
      if (cellBlocked(nx, ny)) {
        r.alive = false;
        return false;
      }
      r.px = r.cx;
      r.py = r.cy;
      r.cx = nx;
      r.cy = ny;
      r.prog = 0;
      s.grid[ny * COLS + nx] = owner;
      return true;
    };

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.05);
      last = nowMs;

      if (s.phase === "RESET") {
        s.phaseT -= dt;
        if (s.phaseT <= 0) {
          resetRound();
          // winner escalates tempo slightly
          if (s.winner === "YOU") s.cellT = Math.max(0.065, s.cellT * 0.94);
          else s.cellT = Math.min(0.13, s.cellT * 1.04);
        }
      } else {
        s.flash = Math.max(0, s.flash - dt * 2);
        const r1 = s.p1;
        const r2 = s.p2;
        r1.prog += dt / s.cellT;
        r2.prog += dt / s.cellT;
        while (r1.prog >= 1 && r1.alive && s.phase === "RUN") {
          r1.prog -= 1;
          advance(r1, 1);
        }
        while (r2.prog >= 1 && r2.alive && s.phase === "RUN") {
          r2.prog -= 1;
          aiChoose();
          advance(r2, 2);
        }

        // head-to-head contact check
        if (s.phase === "RUN" && r1.alive && r2.alive &&
            r1.cx === r2.cx && r1.cy === r2.cy) {
          r1.alive = false;
          r2.alive = false;
        }

        if ((!r1.alive || !r2.alive) && s.phase === "RUN") {
          s.phase = "RESET";
          s.phaseT = 1.6;
          s.flash = 1;
          s.winner = r1.alive ? "YOU" : r2.alive ? "AI" : "AI"; // mutual = AI edge
          if (r1.alive && !r2.alive) s.scoreP1++;
          else if (!r1.alive && r2.alive) s.scoreP2++;
          else { s.scoreP2++; }
        }
      }

      // ---- draw -----------------------------------------------------------------
      ctx.fillStyle = "#0a0a0b";
      const rect = canvas.getBoundingClientRect();
      ctx.fillRect(0, 0, rect.width, rect.height);

      const cs = Math.floor(Math.min(rect.width / COLS, (rect.height - 120) / ROWS));
      const ox = (rect.width - cs * COLS) / 2;
      const oy = 60 + ((rect.height - 120) - cs * ROWS) / 2;

      // faint grid
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 0; c <= COLS; c++) {
        ctx.moveTo(ox + c * cs, oy);
        ctx.lineTo(ox + c * cs, oy + ROWS * cs);
      }
      for (let rr = 0; rr <= ROWS; rr++) {
        ctx.moveTo(ox, oy + rr * cs);
        ctx.lineTo(ox + COLS * cs, oy + rr * cs);
      }
      ctx.stroke();

      // walls — flat two-tone fused ribbons
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const own = s.grid[y * COLS + x];
          if (!own) continue;
          ctx.fillStyle = own === 1 ? "#e7e5e4" : "#7f1d1d";
          ctx.fillRect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, cs - 2);
          ctx.fillStyle = own === 1 ? "#fafaf9" : "#ef4444";
          ctx.fillRect(ox + x * cs + 1, oy + y * cs + 1, cs - 2, 3);
        }
      }

      // riders
      const drawRider = (r: Rider, owner: Owner) => {
        if (!r.alive && s.phase === "RESET") return;
        const ix = (r.px + (r.cx - r.px) * Math.min(1, r.prog)) * cs + ox;
        const iy = (r.py + (r.cy - r.py) * Math.min(1, r.prog)) * cs + oy;
        const hx = ix + cs / 2;
        const hy = iy + cs / 2;
        const core = owner === 1 ? "#ffffff" : "#ef4444";
        const rim = owner === 1 ? "#a8a29e" : "#7f1d1d";
        ctx.beginPath();
        ctx.arc(hx, hy, cs * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = rim;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx, hy, cs * 0.26, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();
        // direction tick
        ctx.strokeStyle = core;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hx + r.dx * cs * 0.3, hy + r.dy * cs * 0.3);
        ctx.lineTo(hx + r.dx * cs * 0.55, hy + r.dy * cs * 0.55);
        ctx.stroke();
      };
      drawRider(s.p1, 1);
      drawRider(s.p2, 2);

      // round banner
      if (s.phase === "RESET") {
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = s.winner === "YOU" ? "#fbbf24" : "#ef4444";
        ctx.fillText(
          s.winner === "YOU" ? "ROUND YOURS" : "DEREZZED",
          rect.width / 2,
          rect.height / 2,
        );
      }

      hudAcc += dt;
      if (hudAcc > 0.3) {
        hudAcc = 0;
        setHud({ you: s.scoreP1, ai: s.scoreP2, tempo: Math.round(1 / s.cellT) });
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const onKey = (e: KeyboardEvent) => {
      const r = s.p1;
      if (!r) return;
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") { if (r.dy !== 1) { r.pendDx = 0; r.pendDy = -1; } }
      else if (k === "s" || k === "arrowdown") { if (r.dy !== -1) { r.pendDx = 0; r.pendDy = 1; } }
      else if (k === "a" || k === "arrowleft") { if (r.dx !== 1) { r.pendDx = -1; r.pendDy = 0; } }
      else if (k === "d" || k === "arrowright") { if (r.dx !== -1) { r.pendDx = 1; r.pendDy = 0; } }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-screen w-full overflow-hidden bg-[#0a0a0b] select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Light Cycle Arena
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Grid Duel · One-Lookahead Opponent
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          WASD / Arrows — Steer White Rider
          <br />
          Survive Rounds — Tempo Escalates
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="You">{hud.you}</Readout>
        <Readout label="Program">{hud.ai}</Readout>
        <Readout label="Tempo">{hud.tempo} c/s</Readout>
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

export default LightCycleArena;
