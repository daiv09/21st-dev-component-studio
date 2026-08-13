"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface GuillocheEngineProps {
  /** Fixed circle radius R */
  R?: number;
  /** Rolling circle radius r */
  r?: number;
  /** Pen offset distance d */
  d?: number;
  /** Number of revolutions to draw */
  revolutions?: number;
  /** Primary stroke color */
  color?: string;
  /** Secondary stroke color for layered rose */
  colorAlt?: string;
  /** Line density (samples per rev) */
  density?: number;
  size?: number;
  /** Rotate the figure (radians) */
  rotation?: number;
  /** Progress of drawing animation (0 to 1) */
  drawProgress?: number;
  className?: string;
}

/**
 * Hypotrochoid / rose-engine guilloché with multi-layered depth, glow, and trace animation.
 */
export function GuillocheEngine({
  R = 120,
  r = 37,
  d = 55,
  revolutions = 40,
  color = "#06b6d4",
  colorAlt = "#3b82f6",
  density = 180,
  size = 520,
  rotation = 0,
  drawProgress = 1,
  className = "",
}: GuillocheEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const path = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const total = Math.max(1, Math.floor(revolutions * density));
    for (let i = 0; i <= total; i++) {
      const theta = (i / density) * Math.PI * 2;
      const k = (R - r) / r;
      const x = (R - r) * Math.cos(theta) + d * Math.cos(k * theta);
      const y = (R - r) * Math.sin(theta) - d * Math.sin(k * theta);
      pts.push({ x, y });
    }
    return pts;
  }, [R, r, d, revolutions, density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Detect mode context
    const isDark = document.documentElement.classList.contains("dark");

    // Dynamic clean canvas background
    ctx.fillStyle = isDark ? "#090a0f" : "#f8fafc";
    ctx.fillRect(0, 0, size, size);

    // Security guilloche outer frame ring
    ctx.strokeStyle = isDark ? "#1e293b" : "#e2e8f0";
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
    ctx.stroke();

    const scale = (size * 0.38) / Math.max(R, 1);
    const cx = size / 2;
    const cy = size / 2;
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    const maxIndex = Math.floor(path.length * Math.min(Math.max(drawProgress, 0), 1));

    const drawLayer = (stroke: string, offset: number, lineWidth: number, shadowBlur = 0, shadowColor = "") => {
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shadowBlur > 0) {
        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = shadowColor;
      }

      ctx.beginPath();
      for (let i = 0; i <= maxIndex; i++) {
        const p = path[i];
        if (!p) break;
        const ox = p.x + offset;
        const oy = p.y;
        const rx = ox * cosR - oy * sinR;
        const ry = ox * sinR + oy * cosR;
        const x = cx + rx * scale;
        const y = cy + ry * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    };

    // Render glow layer pass
    drawLayer(color, 0, 2.2, 14, color);
    // Secondary shift layer
    drawLayer(colorAlt, 2.0, 0.8, 0);
    // Sharp core tracing line
    drawLayer(color, 0, 0.5, 0);

    // Center jewel core mark
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [path, size, color, colorAlt, R, rotation, drawProgress]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
        display: "block",
      }}
      aria-label="Interactive Guilloché Security Engraving Engine"
    />
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 select-none group">
      <span className="flex justify-between items-center transition-colors group-hover:text-neutral-900 dark:group-hover:text-neutral-200">
        <span>{label}</span>
        <span className="text-neutral-900 dark:text-neutral-100 font-bold bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md">
          {value.toFixed(step < 0.1 ? 2 : 0)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500 dark:accent-cyan-400 cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none transition-all"
      />
    </label>
  );
}

const PRESETS = [
  { name: "Banknote Crown", R: 130, r: 42, d: 60, revs: 45, color: "#06b6d4", alt: "#3b82f6" },
  { name: "Cerulean Vortex", R: 110, r: 23, d: 75, revs: 60, color: "#38bdf8", alt: "#818cf8" },
  { name: "Imperial Rose", R: 120, r: 37, d: 55, revs: 40, color: "#f43f5e", alt: "#fb7185" },
  { name: "Cyber Matrix", R: 150, r: 50, d: 30, revs: 50, color: "#10b981", alt: "#059669" },
];

export default function Page() {
  const [R, setR] = useState(130);
  const [r, setRSmall] = useState(42);
  const [d, setD] = useState(60);
  const [revolutions, setRevolutions] = useState(45);
  const [rotation, setRotation] = useState(0);
  const [color, setColor] = useState("#06b6d4");
  const [colorAlt, setColorAlt] = useState("#3b82f6");

  // Motion & Animation States
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(true);
  const [drawProgress, setDrawProgress] = useState(1);
  const [activePreset, setActivePreset] = useState("Banknote Crown");
  const [darkMode, setDarkMode] = useState(true);

  // Sync Dark/Light mode class handler on document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Entrance draw-in cubic trace animation loop
  useEffect(() => {
    if (!isDrawing) return;
    setDrawProgress(0);
    let start: number | null = null;
    let frameId: number;
    const duration = 1600; // ms

    const animateDraw = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDrawProgress(eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(animateDraw);
      } else {
        setIsDrawing(false);
      }
    };
    frameId = requestAnimationFrame(animateDraw);
    return () => cancelAnimationFrame(frameId);
  }, [R, r, d, revolutions, isDrawing]);

  // Continuous auto-rotation loop frame
  useEffect(() => {
    if (!isAnimating) return;
    let lastTime = performance.now();
    let frameId: number;

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setRotation((prev) => (prev + delta * 0.4) % (Math.PI * 2));
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isAnimating]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setR(preset.R);
    setRSmall(preset.r);
    setD(preset.d);
    setRevolutions(preset.revs);
    setColor(preset.color);
    setColorAlt(preset.alt);
    setActivePreset(preset.name);
    setIsDrawing(true);
  };

  return (
    <main className="min-h-screen w-full bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-10 p-6 md:p-12 font-mono transition-colors duration-500 relative overflow-hidden">

      {/* Ambient Backlight Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none transition-all duration-700" />

      {/* Top Bar Utilities */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:border-cyan-500 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
        </button>
      </div>

      {/* Left Canvas Display Section */}
      <div className="flex flex-col items-center gap-5 relative z-10">
        <div className="flex items-center justify-between w-full px-2">
          <div className="text-[10px] tracking-[0.35em] uppercase text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            Guilloché Security Engine v2.8
          </div>
          <span className="text-[10px] uppercase text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg">
            {activePreset}
          </span>
        </div>

        <div className="relative group p-6 rounded-3xl bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all">
          <GuillocheEngine
            R={R}
            r={r}
            d={d}
            revolutions={revolutions}
            rotation={rotation}
            color={color}
            colorAlt={colorAlt}
            drawProgress={drawProgress}
            size={420}
          />

          {/* Quick Floating Interactive Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-neutral-900/90 dark:bg-neutral-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-700/80 shadow-2xl">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="px-3 py-1 text-[10px] uppercase tracking-wider text-white hover:text-cyan-400 transition-colors cursor-pointer font-semibold"
            >
              {isAnimating ? "⏸ Pause" : "▶ Spin"}
            </button>
            <div className="w-[1px] h-3 bg-neutral-700" />
            <button
              onClick={() => setIsDrawing(true)}
              className="px-3 py-1 text-[10px] uppercase tracking-wider text-white hover:text-cyan-400 transition-colors cursor-pointer font-semibold"
            >
              🔄 Replay Trace
            </button>
          </div>
        </div>

        {/* Preset Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-[468px]">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-3 py-2.5 text-[10px] uppercase font-mono tracking-wider rounded-2xl border transition-all cursor-pointer truncate ${activePreset === p.name
                  ? "bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                  : "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-cyan-500/50"
                }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right Control HUD Side Panel */}
      <aside className="w-full max-w-sm border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-5 relative z-10">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-neutral-800 dark:text-neutral-200">
            Parameters HUD
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] uppercase text-neutral-400 tracking-wider">Live Engine</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Slider label="Fixed Circle R" value={R} min={60} max={180} step={1} onChange={(v) => { setR(v); setActivePreset("Custom"); }} />
          <Slider label="Rolling Circle r" value={r} min={5} max={80} step={1} onChange={(v) => { setRSmall(v); setActivePreset("Custom"); }} />
          <Slider label="Pen Offset d" value={d} min={5} max={100} step={1} onChange={(v) => { setD(v); setActivePreset("Custom"); }} />
          <Slider label="Revolutions" value={revolutions} min={5} max={90} step={1} onChange={(v) => { setRevolutions(v); setActivePreset("Custom"); }} />
          <Slider label="Manual Rotation" value={rotation} min={0} max={Math.PI * 2} step={0.01} onChange={(v) => { setRotation(v); setActivePreset("Custom"); }} />
        </div>

        {/* Color Palette Customizer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col gap-2.5">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Chroma Tinting
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 bg-neutral-100 dark:bg-neutral-950 px-3 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-5 h-5 rounded-lg border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-300">Core</span>
            </div>
            <div className="flex items-center gap-2.5 flex-1 bg-neutral-100 dark:bg-neutral-950 px-3 py-2 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              <input
                type="color"
                value={colorAlt}
                onChange={(e) => setColorAlt(e.target.value)}
                className="w-5 h-5 rounded-lg border-0 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-300">Glow</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-mono uppercase tracking-widest transition-all cursor-pointer font-bold shadow-lg ${isAnimating
                ? "bg-amber-500 text-neutral-950 shadow-amber-500/25"
                : "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:opacity-90 shadow-neutral-900/10"
              }`}
          >
            {isAnimating ? "Pause Engine" : "Auto Spin"}
          </button>
          <button
            onClick={() => setIsDrawing(true)}
            className="py-3 px-4 rounded-2xl text-xs font-mono uppercase tracking-widest border border-neutral-300 dark:border-neutral-700 hover:border-cyan-500 transition-all cursor-pointer font-semibold"
          >
            Trace
          </button>
        </div>
      </aside>
    </main>
  );
}