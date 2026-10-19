"use client";

/**
 * Momentum Cradle — a Newton's cradle with exact momentum-transfer timing.
 * Grab any ball, haul it aside, let go: its whole side group swings in and
 * the mirror group launches out. WHEEL tunes elasticity from lossy clay
 * (55%) to perfect steel (100%); chips restring the frame with 3 / 5 / 7 balls.
 */

import React, { useEffect, useRef, useState } from "react";

const RAIL_FRAC = 0.24; // rail height as fraction of stage height
const BALL_R = 30;

type Holder = "left" | "right";
type Mode = "rest" | "hold" | "swing";

export function NewtonsCradleArray() {
  const [count, setCount] = useState(5);
  const [elasticity, setElasticity] = useState(0.94);
  const [transfers, setTransfers] = useState(0);
  const [holding, setHolding] = useState<string>("—");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const sim = useRef({
    mode: "rest" as Mode,
    holder: "left" as Holder,
    k: 2,
    theta: 0,
    omega: 0,
    prevTheta: 0,
    hover: -1,
    L: 300,
    cx: 0,
    railY: 0,
    width: 0,
    height: 0,
  });
  const elasticRef = useRef(elasticity);
  elasticRef.current = elasticity;
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    const s = sim.current;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      s.width = rect.width;
      s.height = rect.height;
      s.cx = rect.width / 2;
      s.railY = rect.height * RAIL_FRAC;
      s.L = Math.min(rect.height * 0.52, rect.width * 0.42);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    // ---- geometry helpers -------------------------------------------------
    const pitch = () => BALL_R * 2 + 1;
    const n = () => countRef.current;
    const pivotX = (i: number) => s.cx + (i - (n() - 1) / 2) * pitch();
    const ballPos = (i: number, theta: number, holder: Holder) => {
      const inGroup =
        (holder === "left" && i < s.k) || (holder === "right" && i >= n() - s.k);
      const th = inGroup ? theta : 0;
      return {
        x: pivotX(i) + Math.sin(th) * s.L,
        y: s.railY + Math.cos(th) * s.L,
      };
    };

    const hitBall = (mx: number, my: number) => {
      for (let i = 0; i < n(); i++) {
        // Rest positions are enough for grabbing (pack is stationary there).
        const bx = pivotX(i);
        const by = s.railY + s.L;
        if (Math.hypot(bx - mx, by - my) < BALL_R + 12) return i;
      }
      return -1;
    };

    // ---- interaction ------------------------------------------------------
    let dragging = false;
    let dragTheta = 0;
    let lastMoveT = 0;

    const onDown = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const idx = hitBall(mx, my);
      if (idx < 0) return;
      const mid = (n() - 1) / 2;
      if (idx === mid && n() % 2 === 1) {
        // Center ball: treat as a single-ball left group.
        s.holder = "left";
        s.k = 1;
      } else if (idx <= mid) {
        s.holder = "left";
        s.k = mid - idx + 1;
      } else {
        s.holder = "right";
        s.k = idx - mid;
      }
      s.mode = "hold";
      s.theta = 0;
      s.omega = 0;
      dragging = true;
      lastMoveT = performance.now();
      setHolding(`${s.k} × ${s.holder.toUpperCase()}`);
      wrap.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (!dragging) {
        s.hover = hitBall(mx, my);
        return;
      }
      const midIdx = s.holder === "left" ? (s.k - 1) / 2 : n() - s.k + (s.k - 1) / 2;
      const px = pivotX(Math.round(midIdx));
      const now = performance.now();
      const dtm = Math.max(8, now - lastMoveT) / 1000;
      lastMoveT = now;
      const target = Math.max(
        -1.32,
        Math.min(1.32, Math.atan2(px - mx, Math.max(40, my - s.railY)))
      );
      s.omega = (target - s.theta) / dtm * 0.25 + s.omega * 0.6;
      dragTheta = target;
      s.theta = target;
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      s.mode = "swing";
      s.omega = Math.abs(s.omega) > 0.4 ? s.omega : 0;
      setHolding("—");
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    // ---- simulation -------------------------------------------------------
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      if (s.mode === "swing") {
        s.prevTheta = s.theta;
        s.theta += s.omega * dt;
        s.omega += -(1400 / s.L) * Math.sin(s.theta) * dt;
        s.omega -= s.omega * 0.06 * dt;

        const crossedZero = s.prevTheta < 0 !== s.theta < 0;
        if (crossedZero && Math.abs(s.omega) > 0.15) {
          // Momentum hand-off to the mirror group.
          const e = elasticRef.current;
          const outgoing = s.omega;
          s.theta = 0;
          s.prevTheta = 0;
          s.holder = s.holder === "left" ? "right" : "left";
          s.omega = outgoing * e;
          if (e < 0.999) {
            // Imperfect steel leaks a little kick-back into the striker.
            s.omega *= 0.995;
          }
          setTransfers((t) => t + 1);
          if (Math.abs(s.omega) < 0.22) {
            s.mode = "rest";
            s.omega = 0;
          }
        }
        if (crossedZero && Math.abs(s.omega) <= 0.15) {
          s.mode = "rest";
          s.theta = 0;
          s.omega = 0;
        }
      }

      // ---- draw -----------------------------------------------------------
      ctx.clearRect(0, 0, s.width, s.height);

      // Frame posts
      ctx.fillStyle = "#17171a";
      const postW = 14;
      ctx.fillRect(40, s.railY - 10, postW, s.height - s.railY - 40);
      ctx.fillRect(s.width - 54, s.railY - 10, postW, s.height - s.railY - 40);
      // Rail plate
      ctx.fillStyle = "#1d1d21";
      ctx.fillRect(28, s.railY - 18, s.width - 56, 20);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fillRect(28, s.railY - 18, s.width - 56, 2);

      // Cords + balls
      for (let i = 0; i < n(); i++) {
        const p = ballPos(i, s.theta, s.holder);
        const piv = pivotX(i);

        ctx.strokeStyle = "#57534e";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(piv - 9, s.railY + 2);
        ctx.lineTo(p.x, p.y);
        ctx.moveTo(piv + 9, s.railY + 2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Ball body
        ctx.beginPath();
        ctx.arc(p.x, p.y, BALL_R, 0, Math.PI * 2);
        ctx.fillStyle = "#a8a29e";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#57534e";
        ctx.stroke();

        // Flat specular cap (two hard tones, no ramps)
        ctx.beginPath();
        ctx.arc(p.x - BALL_R * 0.3, p.y - BALL_R * 0.34, BALL_R * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250,250,250,0.38)";
        ctx.fill();
        // Ground-contact darkening
        ctx.beginPath();
        ctx.arc(p.x + BALL_R * 0.18, p.y + BALL_R * 0.3, BALL_R * 0.5, 0, Math.PI);
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.fill();

        if (i === s.hover) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, BALL_R + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(245,158,11,0.85)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        void dragTheta;
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0b0b0c] select-none">
      <div ref={wrapRef} className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="absolute inset-0 block" />
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Momentum Cradle
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          NC-{String(count).padStart(2, "0")} · Conservation Bench
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Haul a Ball Aside — Release
          <br />
          Wheel — Elasticity {(elasticity * 100).toFixed(0)}%
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex items-end gap-10">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
            Balls
          </span>
          <div className="flex gap-1.5 p-1 rounded-lg border border-neutral-800 bg-neutral-900/70">
            {[3, 5, 7].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCount(c);
                  sim.current.mode = "rest";
                  sim.current.theta = 0;
                  sim.current.omega = 0;
                }}
                className={`px-3 py-1.5 font-mono text-xs rounded-md transition-colors ${
                  count === c
                    ? "bg-neutral-100 text-neutral-900 font-semibold"
                    : "text-neutral-500 hover:text-neutral-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
            In Hand
          </span>
          <span className="font-mono text-xl text-amber-300 tabular-nums">{holding}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
            Transfers
          </span>
          <span className="font-mono text-xl text-neutral-100 tabular-nums">{transfers}</span>
        </div>
      </div>

      <ElasticityWheel
        onDelta={(f) =>
          setElasticity((v) => Math.min(1, Math.max(0.55, +(v * f).toFixed(3))))
        }
      />
    </div>
  );
}

function ElasticityWheel({ onDelta }: { onDelta: (f: number) => void }) {
  React.useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onDelta(e.deltaY < 0 ? 1.04 : 0.962);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [onDelta]);
  return null;
}

export default NewtonsCradleArray;
