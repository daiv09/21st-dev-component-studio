"use client";

import React, { useState, useEffect, useRef } from "react";
import { GuillocheEngine } from "./guilloche-engine";

function CinematicSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-center font-mono text-[11px] tracking-widest">
        <span className="text-neutral-400 group-hover:text-cyan-400 transition-colors">
          {label}
        </span>
        <span className="text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded font-bold shadow-inner">
          {value.toFixed(step < 0.1 ? 2 : 0)}{unit}
        </span>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        />
      </div>
    </div>
  );
}

export default function Page() {
  const [R, setR] = useState(130);
  const [r, setRSmall] = useState(42);
  const [d, setD] = useState(65);
  const [revolutions, setRevolutions] = useState(45);
  const [rotation, setRotation] = useState(0);

  // High-end interactive visual states
  const [isRotating, setIsRotating] = useState(true);
  const [colorScheme, setColorScheme] = useState<"gold" | "cyber" | "matrix" | "laser">("cyber");

  // Palettes mapping
  const palettes = {
    gold: { color: "#d4af37", alt: "#8b7355", glow: "rgba(212, 175, 55, 0.25)" },
    cyber: { color: "#06b6d4", alt: "#3b82f6", glow: "rgba(6, 182, 212, 0.3)" },
    matrix: { color: "#10b981", alt: "#047857", glow: "rgba(16, 185, 129, 0.3)" },
    laser: { color: "#f43f5e", alt: "#be123c", glow: "rgba(244, 63, 94, 0.3)" },
  };

  const activePalette = palettes[colorScheme];

  // Smooth cinematic rotation loop frame
  useEffect(() => {
    if (!isRotating) return;
    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setRotation((prev) => (prev + delta * 0.35) % (Math.PI * 2));
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isRotating]);

  return (
    <main className="min-h-screen w-full bg-[#030712] text-neutral-100 flex flex-col xl:flex-row items-center justify-center gap-12 p-6 md:p-12 font-mono relative overflow-hidden">

      {/* Background Cybernetic Glow Ambient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[160px] pointer-events-none transition-all duration-700"
        style={{ backgroundColor: activePalette.glow }}
      />

      {/* Grid Pattern Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Left Canvas Display Section */}
      <div className="flex flex-col items-center gap-6 relative z-10">

        {/* Header Telemetry Badge */}
        <div className="flex items-center justify-between w-full px-2 max-w-[480px]">
          <div className="text-[10px] tracking-[0.4em] uppercase text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Rose Engine Simulator v3.0
          </div>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            {colorScheme} Matrix
          </span>
        </div>

        {/* Guilloché Frame Card Container */}
        <div className="relative group p-6 rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 shadow-[0_25px_60px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-cyan-500/40">
          <GuillocheEngine
            R={R}
            r={r}
            d={d}
            revolutions={revolutions}
            rotation={rotation}
            color={activePalette.color}
            colorAlt={activePalette.alt}
            size={440}
          />

          {/* Quick Floating Action Overlay Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-neutral-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800 shadow-2xl">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-300 hover:text-cyan-400 transition-colors font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span>{isRotating ? "⏸ Pause Rotation" : "▶ Resume Spin"}</span>
            </button>
            <div className="w-[1px] h-3 bg-neutral-800" />
            <button
              onClick={() => { setRotation(0); }}
              className="px-3 py-1 text-[10px] uppercase tracking-wider text-neutral-300 hover:text-cyan-400 transition-colors font-bold cursor-pointer"
            >
              ↺ Reset Angle
            </button>
          </div>
        </div>

        {/* Preset Selector Matrix Bar */}
        <div className="flex items-center gap-2 w-full max-w-[480px] justify-center">
          {(["cyber", "gold", "matrix", "laser"] as const).map((scheme) => (
            <button
              key={scheme}
              onClick={() => setColorScheme(scheme)}
              className={`flex-1 py-2 px-3 rounded-xl text-[10px] uppercase tracking-widest font-bold border transition-all cursor-pointer ${colorScheme === scheme
                  ? "bg-cyan-500 text-neutral-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105"
                  : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                }`}
            >
              {scheme}
            </button>
          ))}
        </div>
      </div>

      {/* Right Advanced Control HUD Panel */}
      <aside className="w-full max-w-sm border border-neutral-800 bg-neutral-900/70 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col gap-6 relative z-10">

        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="text-[11px] tracking-[0.35em] uppercase font-bold text-neutral-200 flex items-center gap-2">
            <span>⚙️</span> Parameters HUD
          </div>
          <span className="text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded font-bold">
            Realtime Ray
          </span>
        </div>

        <div className="flex flex-col gap-5">
          <CinematicSlider label="Fixed Circle Radius (R)" value={R} min={60} max={180} step={1} onChange={setR} />
          <CinematicSlider label="Rolling Circle Radius (r)" value={r} min={5} max={80} step={1} onChange={setRSmall} />
          <CinematicSlider label="Pen Offset Distance (d)" value={d} min={5} max={100} step={1} onChange={setD} />
          <CinematicSlider label="Revolutions Density" value={revolutions} min={5} max={90} step={1} onChange={setRevolutions} />
          <CinematicSlider label="Angular Rotation" value={rotation} min={0} max={Math.PI * 2} step={0.01} onChange={setRotation} unit=" rad" />
        </div>

        {/* Master Action Triggers */}
        <div className="pt-2 border-t border-neutral-800 flex flex-col gap-2.5">
          <button
            onClick={() => {
              setR(140);
              setRSmall(31);
              setD(75);
              setRevolutions(50);
            }}
            className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[10px] font-bold uppercase tracking-[0.25em] transition-all border border-neutral-700 cursor-pointer shadow-lg active:scale-95"
          >
            ⚡ Randomize Geometry
          </button>
        </div>

      </aside>
    </main>
  );
}