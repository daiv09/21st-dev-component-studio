"use client";

/**
 * Anagram Swarm — every glyph is a free particle tethered to its seat in the
 * word by a soft spring. Sweep the pointer through them to scatter the flock;
 * release pressure and each letter springs home with living overshoot. Press
 * and HOLD to freeze the swarm mid-air (they chill to lime), click to detonate
 * a radial impulse, retype below to hatch a new swarm.
 */

import React, { useEffect, useRef, useState } from "react";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // home
  hy: number;
  seed: number;
}

const SPRING_K = 46;
const DAMPING = 5.2;
const REPEL_R = 150;

export function AnagramSwarm() {
  const [word, setWord] = useState("SWARMLING");
  const [frozen, setFrozen] = useState(false);
  const frozenRef = useRef(frozen);
  frozenRef.current = frozen;

  const chars = React.useMemo(() => word.split(""), [word]);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const parts = useRef<P[]>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointer = useRef({ x: -9999, y: -9999, inside: false });
  const layoutRef = useRef({ cx: 0, cy: 0, pitch: 96 });

  // (Re)build particles whenever the word changes
  useEffect(() => {
    const rect = stageRef.current?.getBoundingClientRect();
    const n = chars.length || 1;
    const pitch = rect && rect.width < 700 ? Math.min(96, rect.width / (n + 1)) : 96;
    const cx = (rect?.width ?? 800) / 2;
    const cy = (rect?.height ?? 500) / 2;
    layoutRef.current = { cx, cy, pitch };
    parts.current = Array.from({ length: n }, (_, i) => {
      const hx = cx + (i - (n - 1) / 2) * pitch;
      return {
        x: hx,
        y: cy,
        vx: 0,
        vy: 0,
        hx,
        hy: cy,
        seed: i * 12.9898,
      };
    });
    spanRefs.current.length = n;
  }, [chars]);

  // Simulation
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let t = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      if (!frozenRef.current) {
        const ps = parts.current;
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          // Spring home + damping
          let ax = -SPRING_K * (p.x - p.hx);
          let ay = -SPRING_K * (p.y - p.hy);
          ax -= DAMPING * p.vx;
          ay -= DAMPING * p.vy;

          // Idle wander grows with how settled the letter is NOT
          const disp = Math.hypot(p.x - p.hx, p.y - p.hy);
          const wander = Math.min(1, disp / 60) * 26;
          ax += Math.sin(t * 1.7 + p.seed) * wander;
          ay += Math.cos(t * 2.3 + p.seed * 1.7) * wander * 0.7;

          // Pointer pressure field
          if (pointer.current.inside) {
            const dx = p.x - pointer.current.x;
            const dy = p.y - pointer.current.y;
            const d = Math.hypot(dx, dy);
            if (d < REPEL_R && d > 0.5) {
              const f = Math.pow(1 - d / REPEL_R, 2) * 5200;
              ax += (dx / d) * f;
              ay += (dy / d) * f;
            }
          }

          p.vx += ax * dt;
          p.vy += ay * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
      }

      // Transform write-back
      for (let i = 0; i < parts.current.length; i++) {
        const p = parts.current[i];
        const el = spanRefs.current[i];
        if (!el) continue;
        const rot = Math.max(-24, Math.min(24, p.vx * 0.045));
        el.style.transform = `translate(${(p.x - p.hx).toFixed(2)}px, ${(p.y - p.hy).toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const localPointer = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMove = (e: React.PointerEvent) => {
    const pt = localPointer(e);
    pointer.current.x = pt.x;
    pointer.current.y = pt.y;
    pointer.current.inside = true;
  };

  const onLeave = () => {
    pointer.current.inside = false;
    pointer.current.x = -9999;
    pointer.current.y = -9999;
  };

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const pt = localPointer(e);
    pointer.current.x = pt.x;
    pointer.current.y = pt.y;
    pointer.current.inside = true;
    // HOLD to freeze — armed after a beat so a quick click stays a blast.
    holdTimer.current = setTimeout(() => setFrozen(true), 240);
    wrapCapture(e);
  };

  const wrapCapture = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const finishPress = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (frozenRef.current) {
      // Releasing a freeze gives everyone a gentle wake-up nudge.
      setFrozen(false);
      return;
    }
    // Quick press = radial impulse burst from the press point.
    const px = pointer.current.x;
    const py = pointer.current.y;
    for (const p of parts.current) {
      const dx = p.x - px;
      const dy = p.y - py;
      const d = Math.max(30, Math.hypot(dx, dy));
      const mag = 620 / Math.sqrt(d);
      p.vx += (dx / d) * mag * 9;
      p.vy += (dy / d) * mag * 9 - 60;
    }
  };

  const onUp = () => {
    finishPress();
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="relative h-screen w-full overflow-hidden bg-[#0a0c08] select-none touch-none"
    >
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-lime-300 uppercase">
          Anagram Swarm
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Tethered Glyph Flock
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Sweep — Scatter · Click — Blast
          <br />
          Hold — Freeze Mid-Air
        </p>
      </div>

      {/* Freeze veil */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
          frozen ? "opacity-100" : "opacity-0"
        }`}
        style={{ boxShadow: "inset 0 0 0 3px rgba(163,230,53,0.5)" }}
      />

      {/* THE SWARM */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-baseline justify-center" style={{ height: "30vh" }}>
          {chars.map((ch, i) =>
            ch === " " ? (
              <span key={i} style={{ width: "0.35em", display: "inline-block" }} />
            ) : (
              <span
                key={i}
                ref={(el) => {
                  spanRefs.current[i] = el;
                }}
                className={`inline-block will-change-transform transition-colors duration-200 ${
                  frozen ? "text-lime-400" : "text-neutral-100"
                }`}
                style={{
                  fontFamily: "'Arial Black', Arial, sans-serif",
                  fontSize: "clamp(56px, 11vw, 150px)",
                  minWidth: "0.6em",
                  textAlign: "center",
                  lineHeight: 1,
                  transformOrigin: "center",
                }}
              >
                {ch}
              </span>
            )
          )}
        </div>
      </div>

      {/* Home-seat markers */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {parts.current.map((p, i) => (
          <circle key={i} cx={p.hx} cy={p.hy} r={2} fill="#2d3a22" />
        ))}
      </svg>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex flex-col items-center gap-4">
        <input
          value={word}
          onChange={(e) =>
            setWord(e.target.value.toUpperCase().replace(/[^A-Z ]/g, "").slice(0, 12))
          }
          spellCheck={false}
          aria-label="Swarm word"
          placeholder="TYPE A WORD"
          className="w-72 px-4 py-2 text-center font-mono text-xs uppercase tracking-[0.45em] bg-transparent border border-neutral-800 rounded text-neutral-300 focus:border-lime-700 focus:outline-none transition-colors"
        />
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600 pointer-events-none">
          {parts.current.length} particles · k={SPRING_K} · c={DAMPING}{" "}
          {frozen ? "· FROZEN" : ""}
        </span>
      </div>
    </div>
  );
}

export default AnagramSwarm;
