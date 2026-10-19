"use client";

/**
 * Breakout Debris Wall — classic wall-breaking rebuilt as a physics toy:
 * the ball's rebound angle depends on exactly where it strikes the paddle,
 * every demolished brick bursts into rotating rigid shards that tumble
 * under gravity, and the ball drags a stepped-tone velocity streak behind
 * it. Combo multiplier climbs while the ball stays airborne off one
 * serve. Pointer steers the paddle, CLICK serves, WHEEL resizes it —
 * wider is safer, narrower pays a score bonus.
 */

import React, { useEffect, useRef, useState } from "react";

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  tone: string;
  edge: string;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  life: number;
  tone: string;
}

const ROWS = 6;
const COLS = 11;

const TONES: [string, string][] = [
  ["#7f1d1d", "#ef4444"],
  ["#9a3412", "#fb923c"],
  ["#b45309", "#fbbf24"],
  ["#a16207", "#facc15"],
  ["#78350f", "#d4a24e"],
  ["#57534e", "#e7e5e4"],
];

function buildBricks(into: Brick[], w: number): void {
  into.length = 0;
  const margin = Math.max(40, w * 0.06);
  const bw = (w - margin * 2 - (COLS - 1) * 6) / COLS;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      into.push({
        x: margin + c * (bw + 6),
        y: 96 + r * 28,
        w: bw,
        h: 22,
        hp: r < 2 ? 2 : 1,
        tone: TONES[r][0],
        edge: TONES[r][1],
      });
    }
  }
}

export function BreakoutDebrisWall() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    bricks: [] as Brick[],
    shards: [] as Shard[],
    trail: [] as { x: number; y: number }[],
    ball: { x: 0, y: 0, vx: 0, vy: 0, r: 7 },
    docked: true,
    paddleX: 0,
    targetPaddleX: 0,
    padW: 110,
    lives: 3,
    score: 0,
    combo: 1,
    respawnT: 0,
    pointerX: -9999,
  });

  const [hud, setHud] = useState({ score: 0, combo: 1, lives: 3, spd: 0 });

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
      if (s.bricks.length === 0 && rect.width > 100) buildBricks(s.bricks, rect.width);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const dockBall = () => {
      s.docked = true;
      s.ball.vx = 0;
      s.ball.vy = 0;
      s.combo = 1;
      s.respawnT = 0;
    };

    const shatter = (b: Brick): void => {
      const n = 7;
      for (let i = 0; i < n; i++) {
        s.shards.push({
          x: b.x + Math.random() * b.w,
          y: b.y + Math.random() * b.h,
          vx: (Math.random() - 0.5) * 260,
          vy: -60 - Math.random() * 160,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 14,
          size: 4 + Math.random() * 8,
          life: 1,
          tone: Math.random() > 0.4 ? b.tone : b.edge,
        });
      }
    };

    let raf = 0;
    let last = performance.now();
    let hudAcc = 0;

    const step = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.033);
      last = nowMs;

      // ---- paddle follows pointer (critically-damped-ish ease) ---------------
      if (s.pointerX > -999) s.targetPaddleX = s.pointerX;
      const padY = s.h - 64;
      s.paddleX += (s.targetPaddleX - s.paddleX) * Math.min(1, dt * 14);
      s.paddleX = Math.max(s.padW / 2, Math.min(s.w - s.padW / 2, s.paddleX));

      // ---- ball ---------------------------------------------------------------
      const B = s.ball;
      if (s.docked) {
        B.x = s.paddleX;
        B.y = padY - 16;
        if (s.lives <= 0) {
          // game over state — wait for wall rebuild via click handler flag
          s.respawnT += dt;
        }
      } else {
        B.x += B.vx * dt;
        B.y += B.vy * dt;

        if (B.x < B.r) { B.x = B.r; B.vx = Math.abs(B.vx); }
        if (B.x > s.w - B.r) { B.x = s.w - B.r; B.vx = -Math.abs(B.vx); }
        if (B.y < 70 + B.r) { B.y = 70 + B.r; B.vy = Math.abs(B.vy); }

        // paddle collision — offset controls rebound angle
        if (
          B.vy > 0 &&
          B.y + B.r >= padY &&
          B.y + B.r <= padY + 18 &&
          Math.abs(B.x - s.paddleX) < s.padW / 2 + B.r
        ) {
          const off = (B.x - s.paddleX) / (s.padW / 2); // −1..1
          const speed = Math.min(560, Math.hypot(B.vx, B.vy) * 1.015);
          const ang = -Math.PI / 2 + off * 1.05; // ±60°
          B.vx = Math.cos(ang) * speed;
          B.vy = Math.sin(ang) * speed;
          s.combo = 1;
        }

        // brick collisions — resolve against smallest penetration axis
        for (const b of s.bricks) {
          if (
            B.x > b.x - B.r && B.x < b.x + b.w + B.r &&
            B.y > b.y - B.r && B.y < b.y + b.h + B.r
          ) {
            const leftPen = B.x - (b.x - B.r);
            const rightPen = b.x + b.w + B.r - B.x;
            const topPen = B.y - (b.y - B.r);
            const botPen = b.y + b.h + B.r - B.y;
            const minPen = Math.min(leftPen, rightPen, topPen, botPen);
            if (minPen === leftPen) { B.vx = -Math.abs(B.vx); B.x = b.x - B.r; }
            else if (minPen === rightPen) { B.vx = Math.abs(B.vx); B.x = b.x + b.w + B.r; }
            else if (minPen === topPen) { B.vy = -Math.abs(B.vy); B.y = b.y - B.r; }
            else { B.vy = Math.abs(B.vy); B.y = b.y + b.h + B.r; }

            b.hp--;
            s.score += 10 * s.combo;
            s.combo = Math.min(9, s.combo + 1);
            if (b.hp <= 0) {
              shatter(b);
              s.bricks.splice(s.bricks.indexOf(b), 1);
            }
            break; // one brick per frame keeps tunnelling fair
          }
        }

        if (B.y > s.h + 30) {
          s.lives--;
          dockBall();
        }

        // streak buffer
        s.trail.push({ x: B.x, y: B.y });
        if (s.trail.length > 26) s.trail.shift();
      }

      // ---- shards -----------------------------------------------------------------
      for (let i = s.shards.length - 1; i >= 0; i--) {
        const sh = s.shards[i];
        sh.vy += 900 * dt;
        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;
        sh.rot += sh.vr * dt;
        sh.life -= dt * 0.75;
        if (sh.life <= 0 || sh.y > s.h + 40) s.shards.splice(i, 1);
      }

      // ---- draw ----------------------------------------------------------------------
      ctx.fillStyle = "#0e0c0a";
      ctx.fillRect(0, 0, s.w, s.h);

      // ceiling band
      ctx.fillStyle = "#171310";
      ctx.fillRect(0, 70, s.w, 4);

      // bricks — flat two-tone plates with hard edge highlight
      for (const b of s.bricks) {
        ctx.fillStyle = b.tone;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = b.edge;
        ctx.fillRect(b.x, b.y, b.w, 3);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(b.x, b.y + b.h - 2, b.w, 2);
        if (b.hp > 1) {
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.lineWidth = 1.4;
          ctx.strokeRect(b.x + 2.5, b.y + 2.5, b.w - 5, b.h - 5);
        }
      }

      // shards
      for (const sh of s.shards) {
        ctx.save();
        ctx.translate(sh.x, sh.y);
        ctx.rotate(sh.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, sh.life));
        ctx.fillStyle = sh.tone;
        ctx.fillRect(-sh.size / 2, -sh.size / 4, sh.size, sh.size / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // ball streak — stepped tone slices oldest→newest
      const SPD = Math.hypot(B.vx, B.vy);
      for (let i = 1; i < s.trail.length; i++) {
        const p0 = s.trail[i - 1];
        const p1 = s.trail[i];
        const ageFrac = i / s.trail.length;
        ctx.strokeStyle =
          ageFrac > 0.85 ? "#fff7ed" : ageFrac > 0.6 ? "#fbbf24" : ageFrac > 0.35 ? "#b45309" : "rgba(120,53,15,0.5)";
        ctx.lineWidth = 1 + ageFrac * 3.4;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }

      // paddle — hard-edged slab with amber core strip
      ctx.fillStyle = "#e7e5e4";
      ctx.fillRect(s.paddleX - s.padW / 2, padY, s.padW, 12);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(s.paddleX - s.padW / 2 + 4, padY + 4, s.padW - 8, 4);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(s.paddleX - s.padW / 2, padY + 10, s.padW, 2);

      // ball body
      ctx.beginPath();
      ctx.arc(B.x, B.y, B.r, 0, Math.PI * 2);
      ctx.fillStyle = "#fafaf9";
      ctx.fill();
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // lives pips
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(28 + i * 20, 36, 5, 0, Math.PI * 2);
        ctx.fillStyle = i < s.lives ? "#f59e0b" : "rgba(255,255,255,0.12)";
        ctx.fill();
      }

      // serve hint
      if (s.docked && s.lives > 0) {
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(251,191,36,0.9)";
        ctx.fillText("CLICK TO SERVE", s.paddleX, padY + 38);
      }
      if (s.lives <= 0) {
        ctx.font = "bold 26px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ef4444";
        ctx.fillText("WALL HOLDS", s.w / 2, s.h / 2 - 40);
      }

      hudAcc += dt;
      if (hudAcc > 0.25) {
        hudAcc = 0;
        setHud({ score: s.score, combo: s.combo, lives: s.lives, spd: Math.round(SPD) });
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const onClick = () => {
    const s = sim.current;
    if (s.lives <= 0) {
      s.lives = 3;
      s.score = 0;
      if (s.w > 100) buildBricks(s.bricks, s.w);
      return;
    }
    if (!s.docked) return;
    const B = s.ball;
    s.docked = false;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
    const speed = 340;
    B.vx = Math.cos(ang) * speed;
    B.vy = Math.sin(ang) * speed;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.padW = Math.max(56, Math.min(190, s.padW + (e.deltaY < 0 ? 10 : -10)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={wrapRef}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        sim.current.pointerX = e.clientX - rect.left;
      }}
      onClick={onClick}
      className="relative h-screen w-full overflow-hidden bg-[#0e0c0a] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block cursor-none" />

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-red-400 uppercase">
          Debris Wall
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Rebound Physics · Rigid Shard Demolition
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Pointer — Steer · Click — Serve
          <br />
          Wheel — Paddle Width (risk vs reward)
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Score">{hud.score}</Readout>
        <Readout label="Combo">×{hud.combo}</Readout>
        <Readout label="Ball Speed">{hud.spd}</Readout>
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

export default BreakoutDebrisWall;
