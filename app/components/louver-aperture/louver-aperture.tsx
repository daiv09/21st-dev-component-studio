"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// ==========================================
// TYPES & CONFIGURATION
// ==========================================

export type EnvironmentMode = "daylight" | "golden" | "cyber" | "blueprint";
export type SlatMaterial = "titanium" | "obsidian" | "bronze" | "frosted";

export interface LouverApertureProps {
  /** Aperture open state 0–1 (0 = fully closed/shaded, 1 = fully open) */
  open?: number;
  /** Number of slat blades */
  slats?: number;
  /** Maximum tilt angle in degrees */
  maxTilt?: number;
  /** SVG frame size in pixels */
  size?: number;
  /** Material finish for slats */
  material?: SlatMaterial;
  /** Lighting environment preset */
  environment?: EnvironmentMode;
  /** Callback on user interaction tilt */
  onChange?: (open: number) => void;
  className?: string;
}

// Preset environment color themes
const ENV_THEMES = {
  daylight: {
    bg: "#0a0d12",
    lightField: "#f4f0e6",
    glow: "#fff4d6",
    beamColor: "rgba(255, 245, 220, 0.35)",
    text: "#1c1917",
    accent: "#3b82f6",
  },
  golden: {
    bg: "#120a06",
    lightField: "#ffedd5",
    glow: "#f97316",
    beamColor: "rgba(251, 146, 60, 0.4)",
    text: "#292524",
    accent: "#f97316",
  },
  cyber: {
    bg: "#030712",
    lightField: "#06b6d4",
    glow: "#ec4899",
    beamColor: "rgba(6, 182, 212, 0.35)",
    text: "#0284c7",
    accent: "#ec4899",
  },
  blueprint: {
    bg: "#02122c",
    lightField: "#38bdf8",
    glow: "#0284c7",
    beamColor: "rgba(56, 189, 248, 0.25)",
    text: "#0369a1",
    accent: "#38bdf8",
  },
};

// Slat surface appearance presets
const MATERIAL_FINISHES = {
  titanium: {
    gradient: ["#475569", "#1e293b", "#0f172a"],
    stroke: "#64748b",
    specular: "#94a3b8",
  },
  obsidian: {
    gradient: ["#27272a", "#18181b", "#09090b"],
    stroke: "#3f3f46",
    specular: "#52525b",
  },
  bronze: {
    gradient: ["#78350f", "#451a03", "#270e02"],
    stroke: "#92400e",
    specular: "#b45309",
  },
  frosted: {
    gradient: ["rgba(255,255,255,0.7)", "rgba(200,225,255,0.4)", "rgba(150,180,220,0.5)"],
    stroke: "rgba(255,255,255,0.8)",
    specular: "#ffffff",
  },
};

// ==========================================
// MAIN INSTRUMENT COMPONENT
// ==========================================

export function LouverAperture({
  open = 0.55,
  slats = 12,
  maxTilt = 75,
  size = 520,
  material = "titanium",
  environment = "daylight",
  onChange,
  className = "",
}: LouverApertureProps) {
  const [internalOpen, setInternalOpen] = useState(open);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<SVGSVGElement>(null);

  // Sync external open prop if provided
  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  const currentOpen = internalOpen;
  const tiltDeg = currentOpen * maxTilt;
  const rad = (tiltDeg * Math.PI) / 180;

  // Geometry calculations
  const frameMargin = size * 0.1;
  const innerW = size - frameMargin * 2;
  const innerH = size - frameMargin * 2;
  const slatGap = innerH / slats;
  const slatLength = slatGap * 1.18; // Slight overlap when fully closed

  const theme = ENV_THEMES[environment];
  const mat = MATERIAL_FINISHES[material];

  // Direct drag / scrub gesture handling
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateValueFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });

    if (isScrubbing) {
      updateValueFromPointer(e);
    }
  };

  const updateValueFromPointer = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = (e.clientY - rect.top - frameMargin) / innerH;
    // Drag down to close, drag up to open
    const newValue = Math.max(0, Math.min(1, 1 - relativeY));
    setInternalOpen(newValue);
    onChange?.(newValue);
  };

  const handlePointerUp = () => setIsScrubbing(false);

  // Scroll wheel tilt interaction
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setInternalOpen((prev) => {
      const next = Math.max(0, Math.min(1, prev - e.deltaY * 0.0015));
      onChange?.(next);
      return next;
    });
  }, [onChange]);

  return (
    <div className={`relative group select-none ${className}`}>
      <svg
        ref={containerRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="cursor-ns-resize touch-none rounded-xl transition-shadow duration-500"
        style={{
          background: theme.bg,
          boxShadow: isScrubbing
            ? `0 20px 40px -10px ${theme.glow}33, 0 0 0 2px ${theme.accent}`
            : "0 25px 50px -12px rgba(0,0,0,0.85), 0 0 0 1px #1f2937",
        }}
      >
        <defs>
          {/* Slat Gradient Finish */}
          <linearGradient id="slatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={mat.gradient[0]} />
            <stop offset="50%" stopColor={mat.gradient[1]} />
            <stop offset="100%" stopColor={mat.gradient[2]} />
          </linearGradient>

          {/* Slat Top Edge Specular Highlight */}
          <linearGradient id="specularGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={mat.specular} stopOpacity="0.2" />
            <stop offset="50%" stopColor={mat.specular} stopOpacity="0.9" />
            <stop offset="100%" stopColor={mat.specular} stopOpacity="0.2" />
          </linearGradient>

          {/* Glass Pane Reflection */}
          <linearGradient id="glassReflect" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>

          {/* Ambient Outdoor Glow */}
          <radialGradient
            id="sunGlow"
            cx={`${mousePos.x * 100}%`}
            cy={`${mousePos.y * 100}%`}
            r="70%"
          >
            <stop offset="0%" stopColor={theme.glow} stopOpacity={0.4 + currentOpen * 0.5} />
            <stop offset="60%" stopColor={theme.lightField} stopOpacity={0.25 + currentOpen * 0.4} />
            <stop offset="100%" stopColor={theme.lightField} stopOpacity="0.0" />
          </radialGradient>

          {/* Soft Drop Shadow for Slats */}
          <filter id="slatShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy={Math.sin(rad) * 12 + 2}
              stdDeviation={Math.max(1, 6 * (1 - currentOpen))}
              floodColor="#000000"
              floodOpacity={0.65}
            />
          </filter>

          {/* Soft Shadow for Linkage Rod */}
          <filter id="rodShadow" x="-30%" y="-10%" width="160%" height="120%">
            <feDropShadow dx="4" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* ========================================== */}
        {/* BACKDROP LIGHT FIELD & RAY CASTING */}
        {/* ========================================== */}
        <g id="light-environment">
          {/* Light Aperture Backplate */}
          <rect
            x={frameMargin}
            y={frameMargin}
            width={innerW}
            height={innerH}
            fill={theme.lightField}
            rx={2}
          />

          {/* Interactive Sun Glow Effect */}
          <rect
            x={frameMargin}
            y={frameMargin}
            width={innerW}
            height={innerH}
            fill="url(#sunGlow)"
          />

          {/* Light Ray Shafts (Projected when louvers open) */}
          {Array.from({ length: slats }).map((_, i) => {
            const yCenter = frameMargin + i * slatGap + slatGap / 2;
            const rayGap = slatGap * Math.sin(rad) * 0.85;
            if (rayGap < 1) return null;

            return (
              <polygon
                key={`ray-${i}`}
                points={`
                  ${frameMargin},${yCenter - rayGap / 2}
                  ${frameMargin + innerW},${yCenter - rayGap / 2 + (mousePos.x - 0.5) * 20}
                  ${frameMargin + innerW},${yCenter + rayGap / 2 + (mousePos.x - 0.5) * 20}
                  ${frameMargin},${yCenter + rayGap / 2}
                `}
                fill={theme.beamColor}
                opacity={0.15 + currentOpen * 0.7}
                style={{ mixBlendMode: "screen" }}
              />
            );
          })}

          {/* Background Technical Watermark */}
          <text
            x={size / 2}
            y={size / 2 + 6}
            textAnchor="middle"
            fill={theme.text}
            fontSize="32"
            fontWeight="800"
            fontFamily="monospace"
            letterSpacing="0.2em"
            opacity={0.12 + currentOpen * 0.25}
          >
            LOUVER // APERTURE
          </text>
        </g>

        {/* ========================================== */}
        {/* SLAT ARRAY WITH 3D PERSPECTIVE TILTING */}
        {/* ========================================== */}
        <g id="slat-array" filter="url(#slatShadow)">
          {Array.from({ length: slats }, (_, i) => {
            const yCenter = frameMargin + i * slatGap + slatGap / 2;

            // Apparent projected thickness of slat as it rotates
            const projH = Math.max(3, slatLength * Math.cos(rad));
            const xShift = Math.sin(rad) * 14;

            const topY = yCenter - projH / 2;
            const botY = yCenter + projH / 2;
            const xLeft = frameMargin + 6;
            const xRight = frameMargin + innerW - 6;

            return (
              <g key={`slat-${i}`} className="transition-transform duration-75">
                {/* Slat Main 3D Quad Body */}
                <polygon
                  points={`
                    ${xLeft},${topY} 
                    ${xRight},${topY - xShift} 
                    ${xRight},${botY - xShift} 
                    ${xLeft},${botY}
                  `}
                  fill="url(#slatGrad)"
                  stroke={mat.stroke}
                  strokeWidth="0.75"
                />

                {/* Slat Top Edge Metallic Highlight Line */}
                <line
                  x1={xLeft}
                  y1={topY}
                  x2={xRight}
                  y2={topY - xShift}
                  stroke="url(#specularGrad)"
                  strokeWidth="1.5"
                />

                {/* Slat Pivot Axis Pins */}
                <circle cx={xLeft - 2} cy={yCenter} r="2.5" fill="#64748b" />
                <circle cx={xRight + 2} cy={yCenter - xShift / 2} r="2.5" fill="#64748b" />

                {/* Mechanical Arm Linkage Connector */}
                <line
                  x1={xRight}
                  y1={yCenter - xShift / 2}
                  x2={xRight + 12}
                  y2={yCenter - Math.sin(rad) * (slatGap * 0.4)}
                  stroke="#475569"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx={xRight + 12}
                  cy={yCenter - Math.sin(rad) * (slatGap * 0.4)}
                  r="2"
                  fill="#94a3b8"
                />
              </g>
            );
          })}
        </g>

        {/* ========================================== */}
        {/* SYNCHRONIZED LINKAGE ROD MECHANISM */}
        {/* ========================================== */}
        <g id="linkage-mechanism" filter="url(#rodShadow)">
          {/* Vertical Control Drive Rod */}
          <rect
            x={frameMargin + innerW + 10}
            y={frameMargin - 6}
            width="5"
            height={innerH + 12}
            rx="2.5"
            fill="#334155"
            stroke="#1e293b"
            strokeWidth="1"
          />
          {/* Actuator Pin Highlights */}
          {Array.from({ length: slats }, (_, i) => {
            const yCenter = frameMargin + i * slatGap + slatGap / 2;
            return (
              <circle
                key={`pin-${i}`}
                cx={frameMargin + innerW + 12.5}
                cy={yCenter - Math.sin(rad) * (slatGap * 0.4)}
                r="3"
                fill={theme.accent}
              />
            );
          })}
        </g>

        {/* ========================================== */}
        {/* ARCHITECTURAL FRAME & GLASS GLARE */}
        {/* ========================================== */}
        <g id="outer-frame">
          {/* Glass Pane Sheen Layer */}
          <rect
            x={frameMargin}
            y={frameMargin}
            width={innerW}
            height={innerH}
            fill="url(#glassReflect)"
            pointerEvents="none"
          />

          {/* Inner Shadow Frame Bevel */}
          <rect
            x={frameMargin}
            y={frameMargin}
            width={innerW}
            height={innerH}
            fill="none"
            stroke="#0f172a"
            strokeWidth="6"
            rx="2"
          />

          {/* Heavy Outer Chamfered Metallic Frame */}
          <rect
            x={frameMargin - 12}
            y={frameMargin - 12}
            width={innerW + 24}
            height={innerH + 24}
            fill="none"
            stroke="#334155"
            strokeWidth="10"
            rx="6"
          />

          {/* Corner Structural Hex Bolts */}
          {[
            [frameMargin - 12, frameMargin - 12],
            [frameMargin + innerW + 12, frameMargin - 12],
            [frameMargin - 12, frameMargin + innerH + 12],
            [frameMargin + innerW + 12, frameMargin + innerH + 12],
          ].map(([bx, by], idx) => (
            <g key={`bolt-${idx}`} transform={`translate(${bx}, ${by})`}>
              <circle r="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <line x1="-2" y1="0" x2="2" y2="0" stroke="#94a3b8" strokeWidth="1" />
            </g>
          ))}
        </g>

        {/* ========================================== */}
        {/* HUD INDUSTRIAL DATA OVERLAY */}
        {/* ========================================== */}
        <g id="hud-telemetry" fontFamily="monospace" fontSize="10" fill="#64748b">
          {/* Angle & State Specs */}
          <text x={frameMargin - 10} y={size - 18} fill="#94a3b8" fontWeight="bold">
            θ = {tiltDeg.toFixed(1)}°
          </text>
          <text x={frameMargin + 75} y={size - 18}>
            OPEN: {(currentOpen * 100).toFixed(0)}%
          </text>
          <text x={size - frameMargin - 100} y={size - 18} textAnchor="end">
            PITCH: {(slatGap).toFixed(1)}mm
          </text>
          <text x={size - frameMargin + 10} y={size - 18} textAnchor="end" fill={theme.accent}>
            [SYNC OK]
          </text>

          {/* Top Status Header */}
          <text x={frameMargin - 10} y={frameMargin - 22} fill="#475569" letterSpacing="0.1em">
            SYS.APT // {slats} BLADES
          </text>
          <text
            x={size - frameMargin + 10}
            y={frameMargin - 22}
            textAnchor="end"
            fill="#475569"
            letterSpacing="0.1em"
          >
            {isScrubbing ? ">> SCRUBBING" : "SCRUB / SCROLL TO DRIVE"}
          </text>
        </g>
      </svg>

      {/* Scrub Helper Hint Overlay on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300">
        {!isScrubbing && (
          <div className="bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/10 shadow-2xl tracking-widest uppercase font-mono">
            Drag Vertical / Scroll
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// DEMO CONTROL DASHBOARD PAGE
// ==========================================

export default function LouverDemoPage() {
  const [open, setOpen] = useState(0.55);
  const [slats, setSlats] = useState(12);
  const [maxTilt, setMaxTilt] = useState(75);
  const [environment, setEnvironment] = useState<EnvironmentMode>("daylight");
  const [material, setMaterial] = useState<SlatMaterial>("titanium");
  const [isBreatheActive, setIsBreatheActive] = useState(false);

  // Animated pulse / breathe mode simulation
  useEffect(() => {
    if (!isBreatheActive) return;
    let frameId: number;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      // Smooth sine wave oscillation between 0.1 and 0.9
      const newOpen = 0.5 + 0.4 * Math.sin(elapsed * 1.5);
      setOpen(newOpen);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isBreatheActive]);

  // Preset shutter configurations
  const applyPreset = (targetOpen: number) => {
    setIsBreatheActive(false);
    setOpen(targetOpen);
  };

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col lg:flex-row items-center justify-center gap-12 p-6 font-mono">
      {/* Visualizer Display Unit */}
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-[11px] tracking-[0.35em] uppercase text-neutral-400 font-semibold">
            Instrument · 22 // Louver Matrix
          </div>
        </div>

        <LouverAperture
          open={open}
          slats={slats}
          maxTilt={maxTilt}
          size={500}
          environment={environment}
          material={material}
          onChange={(val) => {
            setIsBreatheActive(false);
            setOpen(val);
          }}
        />
      </div>

      {/* Interactive HUD Control Panel */}
      <aside className="w-full max-w-sm border border-neutral-800 bg-neutral-900/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-neutral-300">
            Control Console
          </span>
          <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
            v2.4 Pro
          </span>
        </div>

        {/* Sliders Section */}
        <div className="space-y-4">
          <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-wider text-neutral-400">
            <span className="flex justify-between">
              <span>Aperture Open</span>
              <span className="text-neutral-200 font-bold">{(open * 100).toFixed(0)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.005}
              value={open}
              onChange={(e) => {
                setIsBreatheActive(false);
                setOpen(Number(e.target.value));
              }}
              className="accent-neutral-100 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-wider text-neutral-400">
            <span className="flex justify-between">
              <span>Slat Density</span>
              <span className="text-neutral-200 font-bold">{slats} Blades</span>
            </span>
            <input
              type="range"
              min={6}
              max={22}
              step={1}
              value={slats}
              onChange={(e) => setSlats(Number(e.target.value))}
              className="accent-neutral-100 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-wider text-neutral-400">
            <span className="flex justify-between">
              <span>Max Articulation</span>
              <span className="text-neutral-200 font-bold">{maxTilt}°</span>
            </span>
            <input
              type="range"
              min={45}
              max={88}
              step={1}
              value={maxTilt}
              onChange={(e) => setMaxTilt(Number(e.target.value))}
              className="accent-neutral-100 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </label>
        </div>

        {/* Environment Lighting Selection */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            Light Environment
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["daylight", "golden", "cyber", "blueprint"] as EnvironmentMode[]).map((env) => (
              <button
                key={env}
                onClick={() => setEnvironment(env)}
                className={`py-2 px-3 text-[11px] uppercase tracking-wider rounded-lg border transition-all duration-200 ${environment === env
                    ? "border-neutral-200 bg-neutral-800 text-white font-bold shadow"
                    : "border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700"
                  }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Slat Material Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            Material Finish
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["titanium", "obsidian", "bronze", "frosted"] as SlatMaterial[]).map((mat) => (
              <button
                key={mat}
                onClick={() => setMaterial(mat)}
                className={`py-2 px-3 text-[11px] uppercase tracking-wider rounded-lg border transition-all duration-200 ${material === mat
                    ? "border-neutral-200 bg-neutral-800 text-white font-bold shadow"
                    : "border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:border-neutral-700"
                  }`}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* Presets & Auto Animation Toggle */}
        <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">
            Quick Presets
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset(0)}
              className="flex-1 py-1.5 text-[10px] uppercase tracking-wider rounded border border-neutral-800 hover:border-neutral-600 bg-neutral-950 text-neutral-300"
            >
              Eclipse
            </button>
            <button
              onClick={() => applyPreset(0.5)}
              className="flex-1 py-1.5 text-[10px] uppercase tracking-wider rounded border border-neutral-800 hover:border-neutral-600 bg-neutral-950 text-neutral-300"
            >
              Shade
            </button>
            <button
              onClick={() => applyPreset(1)}
              className="flex-1 py-1.5 text-[10px] uppercase tracking-wider rounded border border-neutral-800 hover:border-neutral-600 bg-neutral-950 text-neutral-300"
            >
              Full Sun
            </button>
            <button
              onClick={() => setIsBreatheActive(!isBreatheActive)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded border transition-colors ${isBreatheActive
                  ? "border-emerald-500 bg-emerald-950/50 text-emerald-300"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600"
                }`}
            >
              {isBreatheActive ? "Pause" : "Pulse"}
            </button>
          </div>
        </div>
      </aside>
    </main>
  );
}