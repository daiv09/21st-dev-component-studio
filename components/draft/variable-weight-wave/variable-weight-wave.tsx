"use client";

/**
 * Weight Wave — a typographic wave that travels through a word by swelling
 * each glyph's optical weight in sequence. The stroke width is driven by a
 * sine field sampled per glyph, so the swell is perfectly smooth on any font
 * (no variable-font dependency): -webkit-text-stroke carries the continuous
 * mass, font-weight snaps underneath it for extra punch. Pointer Y tunes
 * spatial frequency, pointer X tunes travel speed, wheel swaps the weight
 * envelope.
 */

import React, { useEffect, useRef, useState } from "react";

interface Envelope {
  name: string;
  min: number;
  max: number;
}

const ENVELOPES: Envelope[] = [
  { name: "HAIRLINE→BLACK", min: 0, max: 7 },
  { name: "STEM FORGE", min: 2, max: 12 },
  { name: "PULSE ETCH", min: 4, max: 16 },
];

export function VariableWeightWave() {
  const [word, setWord] = useState("HORIZON");
  const [envIdx, setEnvIdx] = useState(0);
  const env = ENVELOPES[envIdx];

  const glyphs = React.useMemo(() => word.split(""), [word]);
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pointer = useRef({ x: 0.62, y: 0.45 }); // normalized stage coords
  const tuned = useRef({ freq: 0.85, speed: 1.4 }); // smoothed targets

  useEffect(() => {
    spanRefs.current.length = glyphs.length;
  }, [glyphs]);

  // Wave engine
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let phase = 0;
    let t = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      // Ease live controls toward pointer-derived targets
      const targetFreq = 0.22 + pointer.current.y * 1.9; // cycles across word
      const targetSpeed = 0.35 + pointer.current.x * 3.6; // rad/s
      tuned.current.freq += (targetFreq - tuned.current.freq) * Math.min(1, dt * 4);
      tuned.current.speed += (targetSpeed - tuned.current.speed) * Math.min(1, dt * 4);

      phase += tuned.current.speed * dt;
      const n = glyphs.length || 1;
      const k = (Math.PI * 2 * tuned.current.freq) / n;

      for (let i = 0; i < n; i++) {
        const s = Math.sin(phase - i * k);
        const w = 0.5 + 0.5 * s; // 0..1
        const shaped = Math.pow(w, 1.25); // fatten crests, sharpen troughs
        const stroke = env.min + (env.max - env.min) * shaped;
        const el = spanRefs.current[i];
        if (el) {
          el.style.webkitTextStrokeWidth = `${stroke.toFixed(2)}px`;
          el.style.fontWeight = String(Math.round(200 + shaped * 700));
          // Crests ride a touch higher — the wave gets physical depth
          el.style.transform = `translateY(${(-shaped * 14).toFixed(2)}px)`;
          const lum = 0.34 + shaped * 0.66;
          el.style.color = `rgba(250,250,249,${lum.toFixed(3)})`;
        }
      }
      void t;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [glyphs, env]);

  const trackPointer = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.current.x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    pointer.current.y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
  };

  return (
    <div
      onPointerMove={trackPointer}
      className="relative h-screen w-full overflow-hidden bg-[#0a0a0b] select-none"
    >
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Weight Wave
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Optical Mass Sine Field
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Pointer Y — Frequency · X — Speed
          <br />
          Wheel — Envelope · Type Below — New Word
        </p>
      </div>

      {/* Calibration ticks behind the word */}
      <div className="absolute inset-x-[8%] top-1/2 h-px bg-neutral-800 pointer-events-none" />
      {Array.from({ length: 41 }, (_, i) => (
        <span
          key={i}
          className="absolute w-px bg-neutral-800 pointer-events-none"
          style={{
            left: `${8 + (i * 84) / 40}%`,
            top: "50%",
            height: i % 5 === 0 ? 18 : 8,
            marginTop: i % 5 === 0 ? -9 : -4,
          }}
        />
      ))}

      {/* THE WORD */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-baseline"
          style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            fontSize: "clamp(64px, 13vw, 190px)",
            letterSpacing: "0.02em",
            lineHeight: 1,
          }}
        >
          {glyphs.map((ch, i) =>
            ch === " " ? (
              <span key={i} style={{ width: "0.32em", display: "inline-block" }} />
            ) : (
              <span
                key={i}
                ref={(el) => {
                  spanRefs.current[i] = el;
                }}
                className="inline-block will-change-transform"
                style={{
                  WebkitTextStrokeColor: "#fafaf9",
                  color: "#fafaf9",
                  minWidth: "0.62em",
                  textAlign: "center",
                }}
              >
                {ch}
              </span>
            )
          )}
        </div>
      </div>

      {/* Echo caption */}
      <p className="absolute bottom-[27%] inset-x-0 text-center font-mono text-[11px] tracking-[0.55em] uppercase text-neutral-700 pointer-events-none">
        every letter rides the same sine — different phase
      </p>

      {/* Controls */}
      <div className="absolute bottom-9 inset-x-0 flex flex-col items-center gap-4">
        <input
          value={word}
          onChange={(e) =>
            setWord(e.target.value.toUpperCase().replace(/[^A-Z ]/g, "").slice(0, 14))
          }
          spellCheck={false}
          aria-label="Word"
          placeholder="TYPE A WORD"
          className="w-72 px-4 py-2 text-center font-mono text-xs uppercase tracking-[0.45em] bg-transparent border border-neutral-800 rounded text-neutral-300 focus:border-neutral-400 focus:outline-none transition-colors"
        />
        <div className="flex items-end gap-10 pointer-events-none">
          <Readout label="Frequency">
            {(tuned.current.freq).toFixed(2)} cy/word
          </Readout>
          <Readout label="Envelope">{env.name}</Readout>
        </div>
      </div>

      <EnvelopeWheel
        onDelta={(dir) => setEnvIdx((v) => (v + dir + ENVELOPES.length) % ENVELOPES.length)}
      />
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

function EnvelopeWheel({ onDelta }: { onDelta: (dir: 1 | -1) => void }) {
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onDelta(e.deltaY < 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [onDelta]);
  return null;
}

export default VariableWeightWave;
