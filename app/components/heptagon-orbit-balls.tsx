"use client";

/**
 * Heptagon Orbit — billiard physics inside a rotating seven-sided drum.
 * The vessel's walls are kinematic: a spinning rim drags every ball through
 * contact friction, so cranking the wheel literally stirs the population.
 * CLICK drops a new ball under your cursor, DRAG any ball and fling it,
 * WHEEL drives the drum's angular velocity. Phosphor-style trail veil keeps
 * every trajectory readable.
 */

import React, { useEffect, useRef, useState } from "react";

const SIDES = 7;
const BALL_R = 11;
const MAX_BALLS = 42;
const WALL_E = 0.86;
const WALL_GRIP = 0.35;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function HeptagonOrbitBalls() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sim = useRef({
    w: 0,
    h: 0,
    cx: 0,
    cy: 0,
    R: 200,
    rot: 0,
    omega: 0.55,
    balls: [] as Ball[],
    grabbed: -1,
    grabVX: 0,
    grabVY: 0,
  });

  const [stats, setStats] = useState({ n: 3, rpm: "5.3 CW", ke: 0 });

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
      s.cx = rect.width / 2;
      s.cy = rect.height / 2;
      s.R = Math.min(rect.width, rect.height) * 0.4;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // Seed trio
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      s.balls.push({
        x: s.cx + Math.cos(a) * s.R * 0.4,
        y: s.cy + Math.sin(a) * s.R * 0.4,
        vx: 120 + i * 40,
        vy: -90,
      });
    }

    const verts = () =>
      Array.from({ length: SIDES }, (_, k) => {
        const a = s.rot + (k / SIDES) * Math.PI * 2 + Math.PI / SIDES;
        return { x: s.cx + Math.cos(a) * s.R, y: s.cy + Math.sin(a) * s.R };
      });

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      s.rot += s.omega * dt;

      const V = verts();
      // Ball–ball
      for (let i = 0; i < s.balls.length; i++) {
        for (let j = i + 1; j < s.balls.length; j++) {
          const A = s.balls[i];
          const B = s.balls[j];
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < (BALL_R * 2) ** 2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            const overlap = BALL_R * 2 - d;
            A.x -= nx * overlap * 0.5;
            A.y -= ny * overlap * 0.5;
            B.x += nx * overlap * 0.5;
            B.y += ny * overlap * 0.5;
            const rvn = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
            if (rvn < 0) {
              const imp = -(1 + 0.94) * rvn * 0.5;
              A.vx -= imp * nx;
              A.vy -= imp * ny;
              B.vx += imp * nx;
              B.vy += imp * ny;
            }
          }
        }
      }

      // Integrate + wall contacts
      let ke = 0;
      for (let bi = 0; bi < s.balls.length; bi++) {
        const b = s.balls[bi];
        if (bi !== s.grabbed) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.vx *= Math.pow(0.995, dt * 60);
          b.vy *= Math.pow(0.995, dt * 60);
        }

        for (let k = 0; k < SIDES; k++) {
          const P1 = V[k];
          const P2 = V[(k + 1) % SIDES];
          const ex = P2.x - P1.x;
          const ey = P2.y - P1.y;
          const len2 = ex * ex + ey * ey || 1;
          let t = ((b.x - P1.x) * ex + (b.y - P1.y) * ey) / len2;
          t = Math.max(0, Math.min(1, t));
          const qx = P1.x + ex * t;
          const qy = P1.y + ey * t;
          let dx = b.x - qx;
          let dy = b.y - qy;
          let d = Math.hypot(dx, dy);
          if (d < BALL_R && d > 0.001) {
            const nx = dx / d;
            const ny = dy / d;
            b.x = qx + nx * BALL_R;
            b.y = qy + ny * BALL_R;
            // Kinematic wall velocity at contact (rotation about centre)
            const rqx = qx - s.cx;
            const rqy = qy - s.cy;
            const wvx = -rqy * s.omega;
            const wvy = rqx * s.omega;
            const rvnx = b.vx - wvx;
            const rvny = b.vy - wvy;
            const vn = rvnx * nx + rvny * ny;
            if (vn < 0) {
              b.vx -= (1 + WALL_E) * vn * nx;
              b.vy -= (1 + WALL_E) * vn * ny;
              // Rim grip: bleed some tangential wall speed into the ball
              b.vx += (wvx - b.vx) * WALL_GRIP * 0.25;
              b.vy += (wvy - b.vy) * WALL_GRIP * 0.25;
            }
          }
          void dx; void dy; void d;
        }
        ke += 0.5 * (b.vx * b.vx + b.vy * b.vy);
      }

      // ---- draw ----------------------------------------------------------
      // Persistence veil for trails
      ctx.fillStyle = "rgba(11,9,6,0.30)";
      ctx.fillRect(0, 0, s.w, s.h);

      // Drum
      ctx.beginPath();
      V.forEach((p, k) => (k === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = "#141008";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#f59e0b";
      ctx.stroke();
      // Inner bevel ring
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#d4a24e";
      ctx.fill();

      // Balls (two-tone)
      for (let bi = 0; bi < s.balls.length; bi++) {
        const b = s.balls[bi];
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fillStyle = bi === s.grabbed ? "#fbbf24" : "#efe7d3";
        ctx.fill();
        ctx.strokeStyle = "#786a45";
        ctx.lineWidth = 2;
        ctx.stroke();
        // specular cap
        ctx.beginPath();
        ctx.arc(b.x - 3.5, b.y - 3.5, BALL_R * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const statTimer = setInterval(() => {
      let ke = 0;
      for (const b of s.balls) ke += 0.5 * (b.vx ** 2 + b.vy ** 2);
      const rpm = (Math.abs(s.omega) * 60) / (2 * Math.PI);
      setStats({
        n: s.balls.length,
        rpm: `${rpm.toFixed(1)} ${s.omega >= 0 ? "CW" : "CCW"}`,
        ke: Math.round(ke / 1000),
      });
    }, 250);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearInterval(statTimer);
    };
  }, []);

  // ---- interaction ---------------------------------------------------------
  const pickBall = (clientX: number, clientY: number): number => {
    const s = sim.current;
    const wrap = wrapRef.current;
    if (!wrap) return -1;
    const rect = wrap.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    let best = -1;
    let bestD = BALL_R + 14;
    s.balls.forEach((b, i) => {
      const d = Math.hypot(b.x - mx, b.y - my);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const dragState = useRef({ active: false, lx: 0, ly: 0, lt: 0 });

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const idxPick = pickBall(e.clientX, e.clientY);
    const s = sim.current;
    if (idxPick >= 0) {
      s.grabbed = idxPick;
    } else {
      // spawn
      if (s.balls.length >= MAX_BALLS) s.balls.shift();
      const rect = wrapRef.current!.getBoundingClientRect();
      s.balls.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        vx: (Math.random() - 0.5) * 260,
        vy: (Math.random() - 0.5) * 260,
      });
    }
    dragState.current = { active: true, lx: e.clientX, ly: e.clientY, lt: performance.now() };
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const s = sim.current;
    if (s.grabbed < 0 || !dragState.current.active) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const now = performance.now();
    const dtm = Math.max(6, now - dragState.current.lt) / 1000;
    const tx = e.clientX - rect.left;
    const ty = e.clientY - rect.top;
    const b = s.balls[s.grabbed];
    s.grabVX = ((tx - b.x) / dtm) * 0.4;
    s.grabVY = ((ty - b.y) / dtm) * 0.4;
    b.x = tx;
    b.y = ty;
    dragState.current.lx = e.clientX;
    dragState.current.ly = e.clientY;
    dragState.current.lt = now;
  };

  const onUp = () => {
    const s = sim.current;
    if (s.grabbed >= 0) {
      s.balls[s.grabbed].vx = s.grabVX;
      s.balls[s.grabbed].vy = s.grabVY;
    }
    s.grabbed = -1;
    dragState.current.active = false;
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = sim.current;
      s.omega = Math.max(-3.2, Math.min(3.2, s.omega * (e.deltaY < 0 ? 1.09 : 0.917)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0b0906] select-none">
      <div
        ref={wrapRef}
        className="absolute inset-0 touch-none cursor-crosshair"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Heptagon Orbit
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Rotating-Vessel Billiards · {SIDES}-gon
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Click — Drop Ball · Drag — Fling
          <br />
          Wheel — Drum Spin {stats.rpm}
        </p>
      </div>

      {/* Readouts */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Balls">{stats.n}</Readout>
        <Readout label="Drum">{stats.rpm}</Readout>
        <Readout label="Kinetic E">{stats.ke} kU</Readout>
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

export default HeptagonOrbitBalls;
