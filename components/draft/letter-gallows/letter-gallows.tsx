"use client";

/**
 * Letter Gallows — every glyph of the word hangs from the gallows rail on
 * its own damped pendulum. Brush your pointer through the letters to set
 * them swinging, click one to punch it hard, WHEEL retunes gravity, and
 * retype the word below to hang different letters.
 */

import React, { useEffect, useRef, useState } from "react";

const PIVOT_Y = 150;
const FONT_PX = 96;
const GRAV = 900;

interface Unit {
  ch: string;
  len: number;
}

export function LetterGallows() {
  const [word, setWord] = useState("KINETIC");
  const [gravity, setGravity] = useState(GRAV);
  const gravityRef = useRef(gravity);
  gravityRef.current = gravity;

  const units: Unit[] = React.useMemo(
    () =>
      word
        .toUpperCase()
        .split("")
        .map((ch, i) => ({ ch, len: 92 + ((i * 37) % 3) * 24 })),
    [word]
  );

  const thetaRef = useRef<number[]>([]);
  const omegaRef = useRef<number[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointer = useRef({ x: -9999, y: -9999, vx: 0, vy: 0 });
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Re-hang letters whenever the word changes.
  useEffect(() => {
    const n = units.length;
    thetaRef.current = Array.from({ length: n }, (_, i) => Math.sin(i * 2.3) * 0.18);
    omegaRef.current = new Array(n).fill(0);
    nodeRefs.current = new Array(n).fill(null);
  }, [units]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let t = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const n = units.length;
      for (let i = 0; i < n; i++) {
        const L = units[i].len;
        let th = thetaRef.current[i] ?? 0;
        let om = omegaRef.current[i] ?? 0;

        // Pendulum torque + damping + idle breeze
        om += (-(gravityRef.current / (L + FONT_PX)) * Math.sin(th)) * dt;
        om -= om * 0.85 * dt;
        om += Math.sin(t * 0.7 + i * 1.7) * 0.02 * dt;

        // Pointer brush — transfer pointer velocity into angular velocity
        const px = (i - (n - 1) / 2) * (FONT_PX * 0.82);
        const py = PIVOT_Y + L + FONT_PX * 0.45;
        const dx = px - pointer.current.x;
        const dy = py - pointer.current.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 1) {
          const falloff = 1 - Math.sqrt(d2) / 130;
          om += pointer.current.vx * 0.055 * falloff * dt * 60;
          om += pointer.current.vy * 0.012 * falloff * dt * 60;
        }

        th += om * dt;
        if (th > 1.35) {
          th = 1.35;
          om *= -0.35;
        } else if (th < -1.35) {
          th = -1.35;
          om *= -0.35;
        }
        thetaRef.current[i] = th;
        omegaRef.current[i] = om;

        const node = nodeRefs.current[i];
        if (node) node.style.transform = `rotate(${th.toFixed(4)}rad)`;
      }

      pointer.current.vx *= Math.pow(0.002, dt);
      pointer.current.vy *= Math.pow(0.002, dt);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [units]);

  const trackPointer = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const vx = x - pointer.current.x;
    const vy = y - pointer.current.y;
    if (Math.abs(vx) < 200 && Math.abs(vy) < 200) {
      pointer.current.vx = vx;
      pointer.current.vy = vy;
    }
    pointer.current.x = x;
    pointer.current.y = y;
  };

  const punch = (e: React.PointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const n = units.length;
    for (let i = 0; i < n; i++) {
      const px = rect.width / 2 + (i - (n - 1) / 2) * (FONT_PX * 0.82);
      const py = PIVOT_Y + units[i].len + FONT_PX * 0.45;
      const d = Math.hypot(px - mx, py - my);
      if (d < 110) {
        const dir = px >= mx ? 1 : -1;
        omegaRef.current[i] += dir * 5.2 * (1 - d / 110);
      }
    }
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={trackPointer}
      onPointerDown={punch}
      className="relative h-screen w-full overflow-hidden bg-[#0c0b09] select-none"
    >
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Letter Gallows
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Typographic Pendulum Rig
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Brush / Click — Swing Letters
          <br />
          Wheel — Gravity {Math.round(gravity)}
        </p>
      </div>

      {/* Gallows rail — cords hang from its underside at PIVOT_Y */}
      <div
        className="absolute left-[6%] right-[6%] h-4 rounded-sm border border-neutral-800"
        style={{
          top: PIVOT_Y - 16,
          background: "#161512",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 14px 34px rgba(0,0,0,0.6)",
        }}
      />

      {/* Hanging letters */}
      <div className="absolute inset-x-0" style={{ top: PIVOT_Y }}>
        {units.map((u, i) => (
          <div
            key={`${i}-${u.ch}`}
            className="absolute top-0"
            style={{
              left: `calc(50% + ${(i - (units.length - 1) / 2) * FONT_PX * 0.82}px)`,
              width: 0,
              height: u.len,
            }}
          >
            <div
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 flex flex-col items-center"
              style={{ transformOrigin: "top center", willChange: "transform" }}
            >
              {/* Cord */}
              <span
                className="w-px bg-neutral-600"
                style={{ height: u.len }}
              />
              {/* Glyph plate */}
              <span
                className="font-black leading-none text-neutral-100"
                style={{
                  fontSize: FONT_PX,
                  marginTop: -6,
                  textShadow:
                    "0 1px 0 #000, 0 0 22px rgba(250,250,250,0.14)",
                }}
              >
                {u.ch}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex flex-col items-center gap-4">
        <input
          value={word}
          onChange={(e) =>
            setWord(e.target.value.toUpperCase().replace(/[^A-Z0-9 .!?-]/g, "").slice(0, 12))
          }
          spellCheck={false}
          aria-label="Word to hang"
          className="w-72 px-4 py-2 text-center font-mono text-sm uppercase tracking-[0.4em] bg-transparent border border-neutral-800 rounded text-neutral-200 focus:border-amber-600 focus:outline-none transition-colors"
          placeholder="TYPE A WORD"
        />
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600">
          {units.length} suspended · g {Math.round(gravity)} · wheel retunes gravity
        </span>
      </div>

      {/* Wheel listener */}
      <GravityWheel
        onDelta={(f) =>
          setGravity((g) => Math.min(2600, Math.max(160, Math.round(g * f))))
        }
      />
    </div>
  );
}

function GravityWheel({ onDelta }: { onDelta: (f: number) => void }) {
  React.useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onDelta(e.deltaY < 0 ? 1.09 : 0.917);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [onDelta]);
  return null;
}

export default LetterGallows;
