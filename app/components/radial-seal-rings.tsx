"use client";

/**
 * Radial Seal Rings — an official stamp rebuilt as a machine. Five engraved
 * type rings counter-rotate around a central crest. Grab any ring and fling
 * it tangentially: it spins down under bearing friction toward its escapement
 * drift speed. A clean click (no meaningful drag) kicks the ring into
 * reverse. Everything is angular mechanics — radians, not keyframes.
 */

import React, { useEffect, useRef, useState } from "react";

const RINGS = [
  { r: 118, size: 15, drift: -9, color: "#d4a24e", text: "SIGILLUM · OFFICII · VERITAS · ORDINIS · SIGILLUM · OFFICII · VERITAS · ORDINIS ·" },
  { r: 158, size: 18, drift: 14, color: "#fbbf24", text: "ANNO · MMXXVI · CONCORDIA · ANNO · MMXXVI · CONCORDIA · ANNO · MMXXVI · CONCORDIA ·" },
  { r: 204, size: 21, drift: -7, color: "#efe7d3", text: "SCIENTIA · MOTUS · PRECISIONE · SCIENTIA · MOTUS · PRECISIONE · SCIENTIA · MOTUS ·" },
  { r: 254, size: 24, drift: 11, color: "#a8a29e", text: "DEPT · OF · KINETIC · AFFAIRS · DEPT · OF · KINETIC · AFFAIRS · DEPT · OF · KINETIC ·" },
  { r: 308, size: 27, drift: -5, color: "#78716c", text: "PRESSED · IN · STEEL · AND · TIME · PRESSED · IN · STEEL · AND · TIME · PRESSED · IN ·" },
];

const FRICTION = 0.9; // exp decay per second toward drift

export function RadialSealRings() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const groupRefs = useRef<(SVGGElement | null)[]>([]);

  const ang = useRef<number[]>(RINGS.map((_, i) => i * 23));
  const omg = useRef<number[]>(RINGS.map((r) => r.drift));

  const [rpmText, setRpmText] = useState<string[]>(RINGS.map(() => ""));
  const [grabbed, setGrabbed] = useState<number | null>(null);
  const grabbedRef = useRef<number | null>(null);
  const rpmTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Angular integration
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      for (let i = 0; i < RINGS.length; i++) {
        if (grabbedRef.current !== i) {
          // Bearing friction pulls omega back to the escapement drift.
          const d = RINGS[i].drift;
          omg.current[i] += (d - omg.current[i]) * (1 - Math.exp(-FRICTION * dt));
          ang.current[i] += omg.current[i] * dt;
        }
        const g = groupRefs.current[i];
        if (g) g.setAttribute("transform", `rotate(${((ang.current[i] * 180) / Math.PI).toFixed(3)})`);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Throttled RPM readout
  useEffect(() => {
    rpmTimer.current = setInterval(() => {
      setRpmText(
        omg.current.map((w, i) => {
          const rpm = (Math.abs(w) * 60) / (2 * Math.PI);
          return `${(i % 2 === 0 ? "" : "")}${rpm.toFixed(1)} ${Math.sign(w) >= 0 ? "CW" : "CCW"}`;
        })
      );
    }, 180);
    const t = rpmTimer.current;
    return () => {
      if (t) clearInterval(t);
    };
  }, []);

  // Pointer interaction
  const gesture = useRef({
    active: false,
    ring: -1,
    prevAngle: 0,
    movedDeg: 0,
    lastT: 0,
  });

  const angleAt = (e: React.PointerEvent | PointerEvent): number | null => {
    const wrap = wrapRef.current;
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  };

  const ringAt = (e: React.PointerEvent): number => {
    const wrap = wrapRef.current;
    if (!wrap) return -1;
    const rect = wrap.getBoundingClientRect();
    const dist = Math.hypot(
      e.clientX - (rect.left + rect.width / 2),
      e.clientY - (rect.top + rect.height / 2)
    );
    let best = -1;
    let bestD = 34;
    RINGS.forEach((r, i) => {
      const d = Math.abs(dist - r.r);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  const onDown = (e: React.PointerEvent) => {
    const ring = ringAt(e);
    const a = angleAt(e);
    if (ring < 0 || a === null) return;
    e.preventDefault();
    gesture.current = { active: true, ring, prevAngle: a, movedDeg: 0, lastT: performance.now() };
    grabbedRef.current = ring;
    setGrabbed(ring);
    wrapRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g.active || grabbedRef.current !== g.ring) return;
    const a = angleAt(e);
    if (a === null) return;
    let da = a - g.prevAngle;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    const now = performance.now();
    const dtm = Math.max(6, now - g.lastT) / 1000;

    ang.current[g.ring] += da;
    // Exponential velocity estimator — smooth even at high flick speeds
    const instW = da / dtm;
    omg.current[g.ring] = omg.current[g.ring] * 0.55 + instW * 0.45;

    g.movedDeg += (da * 180) / Math.PI;
    g.prevAngle = a;
    g.lastT = now;
  };

  const onUp = () => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;
    grabbedRef.current = null;
    setGrabbed(null);
    // A tap (barely any angular travel) reverses the ring's escapement.
    if (Math.abs(g.movedDeg) < 3 && g.ring >= 0) {
      RINGS[g.ring].drift *= -1;
      omg.current[g.ring] = RINGS[g.ring].drift * 2.2;
    }
  };

  const size = 700;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0b0906] select-none">
      <div
        ref={wrapRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
      >
        <svg
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "min(92vmin, 820px)", height: "min(92vmin, 820px)" }}
        >
          {/* Engraved plate backing */}
          <circle r={size / 2 - 6} fill="#12100c" stroke="#2b241a" strokeWidth="3" />
          <circle r={size / 2 - 22} fill="none" stroke="#3a3122" strokeWidth="1.5" />

          {RINGS.map((ring, i) => {
            const pathId = `seal-path-${i}`;
            return (
              <g
                key={i}
                ref={(el) => {
                  groupRefs.current[i] = el;
                }}
              >
                <defs>
                  <path id={pathId} fill="none" d={`M 0 ${-ring.r} A ${ring.r} ${ring.r} 0 1 1 -0.01 ${-ring.r}`} />
                </defs>
                <text
                  fontSize={ring.size}
                  letterSpacing="4"
                  fill={grabbed === i ? "#ffffff" : ring.color}
                  fontFamily="var(--font-mono, monospace)"
                  fontWeight="bold"
                  style={{
                    transition: "fill 120ms linear",
                    cursor: "grab",
                  }}
                >
                  <textPath href={`#${pathId}`}>{ring.text}</textPath>
                </text>
                {/* Ring guide circles */}
                <circle r={ring.r + 14} fill="none" stroke="#26211a" strokeWidth="1" />
              </g>
            );
          })}

          {/* Central crest */}
          <g>
            <circle r={86} fill="#17130d" stroke="#4a3d26" strokeWidth="2.5" />
            <circle r={70} fill="none" stroke="#6b5632" strokeWidth="1.5" />
            {/* Star */}
            <path
              d="M 0,-52 L 12,-14 L 50,-16 L 19,8 L 31,44 L 0,21 L -31,44 L -19,8 L -50,-16 L -12,-14 Z"
              fill="#d4a24e"
              stroke="#8a6d35"
              strokeWidth="1.5"
            />
            <text y="66" textAnchor="middle" fontSize="13" letterSpacing="6" fill="#a89770" fontFamily="monospace">
              EST. MMXXVI
            </text>
          </g>
        </svg>
      </div>

      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Radial Seal
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Counter-Rotating Type Press
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Fling a Ring — Spin It
          <br />
          Tap It — Reverse Drift
        </p>
      </div>

      {/* Per-ring RPM readout column */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-8 pointer-events-none">
        {RINGS.map((r, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: r.color }}>
              R{i + 1}
            </span>
            <span className="font-mono text-sm text-neutral-200 tabular-nums w-24 text-center">
              {rpmText[i] || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RadialSealRings;
