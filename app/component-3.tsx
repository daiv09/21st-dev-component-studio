// quantum-toggle.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import { AnimatePresence } from "framer-motion";

// --- Assets ---

// Subtle noise texture for industrial realism
const NoiseTexture = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none mix-blend-overlay"
    xmlns="http://www.w3.org/2000/svg"
  >
    <filter id="noiseFilter">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.8"
        numOctaves="3"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
  </svg>
);

// Cosmetic screws for the chassis corners
const Screw = ({ className }: { className?: string }) => (
  <div
    className={`absolute w-2 h-2 rounded-full bg-neutral-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center ${className}`}
  >
    {/* Screw slot */}
    <div className="w-full h-[1px] bg-neutral-950 rotate-45" />
  </div>
);

// --- Types ---

interface QuantumToggleProps {
  initialState?: boolean;
  onToggle?: (state: boolean) => void;
  label?: string;
}

// --- Component ---

export function QuantumToggle({
  initialState = false,
  onToggle,
  label = "Quantum Core",
}: QuantumToggleProps) {
  const [isOn, setIsOn] = useState(initialState);
  const [scope, animate] = useAnimate();

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState);

    // Ignition flicker effect when turning ON
    if (newState) {
      animate(
        "#led-core",
        {
          opacity: [0, 1, 0.5, 1, 0.8, 1],
          scale: [0.8, 1.2, 0.9, 1.1, 1],
        },
        { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
      );
    }
  };

  return (
    <div className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-neutral-700/50 to-neutral-950 overflow-hidden">
      {/* Main Chassis Container */}
      <div className="relative flex items-center gap-6 p-5 rounded-[23px] bg-neutral-950/90 backdrop-blur-md shadow-[inset_0_1px_3px_rgba(255,255,255,0.05),0_10px_20px_-5px_rgba(0,0,0,0.8)] border-b border-white/5">
        <NoiseTexture />
        <Screw className="top-2 left-2" />
        <Screw className="top-2 right-2" />
        <Screw className="bottom-2 left-2" />
        <Screw className="bottom-2 right-2" />

        {/* Label Section */}
        <div className="flex flex-col pl-2 z-10">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-2 text-shadow-sm">
            {label}
          </span>
          <div className="flex items-center gap-3 bg-neutral-900/50 px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  isOn
                    ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]"
                    : "bg-neutral-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
                }`}
              />
              {isOn && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-50" />
              )}
            </div>
            <span
              className={`text-xs font-semibold tracking-wider transition-colors duration-300 ${
                isOn
                  ? "text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
                  : "text-neutral-600"
              }`}
            >
              {isOn ? "ACTIVE" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* The Switch Mechanism */}
        <button
          ref={scope}
          onClick={handleToggle}
          className="relative w-24 h-12 rounded-full p-1 cursor-pointer outline-none z-10"
          aria-pressed={isOn}
        >
          {/* Track Bed (Recessed Area) */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isOn
                ? "bg-neutral-900 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6),inset_0_0_15px_rgba(34,211,238,0.1)] border-b border-cyan-900/20"
                : "bg-neutral-900 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] border-b border-neutral-800"
            }`}
          >
            {/* Mechanical details in the trackbed */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-800/50 flex justify-between items-center px-1">
              <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
              <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
              <div className="w-1 h-1 rounded-full bg-neutral-700"></div>
            </div>
          </div>

          {/* The Physical Handle (Knob) */}
          <motion.div
            className="relative w-10 h-10 rounded-full z-20 flex items-center justify-center group-active:scale-95 transition-transform"
            layout
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 35,
              mass: 1.2, // Heavier feel
            }}
            style={{
              // 0% is left align (off), move to right (on). Using margins for layout slide.
              marginLeft: isOn ? "calc(100% - 2.5rem)" : "0",
            }}
          >
            {/* Handle Outer Ring (Knurled Metal) */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-neutral-600 to-neutral-800 shadow-[0_4px_8px_rgba(0,0,0,0.6),0_1px_2px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden">
              {/* Knurling texture pattern */}
              <div className="w-full h-full opacity-30 bg-[repeating-conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_2deg,rgba(0,0,0,0.5)_2.1deg,rgba(0,0,0,0.5)_4deg)]"></div>
            </div>

            {/* Handle Top Bezel (Rim Lighting) */}
            <div className="absolute inset-[2px] rounded-full border-[1.5px] border-neutral-500/30 border-t-neutral-400/60 border-b-neutral-900/80 pointer-events-none"></div>

            {/* Grip Area / Lens Holder */}
            <div className="relative w-6 h-6 rounded-full bg-neutral-900 shadow-[inset_0_2px_4px_rgba(0,0,0,1),0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden">
              {/* Glass Lens Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 rounded-full pointer-events-none z-20"></div>

              {/* The LED Core */}
              <motion.div
                id="led-core"
                className="w-3 h-3 rounded-full bg-cyan-500 relative z-10"
                initial={false}
                animate={{
                  opacity: isOn ? 1 : 0.2,
                  backgroundColor: isOn ? "#22d3ee" : "#171717", // cyan-400 vs neutral-900
                  boxShadow: isOn
                    ? "0 0 15px 2px rgba(34, 211, 238, 0.8), inset 0 0 6px rgba(255,255,255,0.6)" // Bright bloom + hot center core
                    : "inset 0 1px 2px rgba(0,0,0,0.5)", // Dark recessed look
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>

          {/* Atmospheric Glow Bleed on the trackbed (underneath handle) */}
          <AnimatePresence>
            {isOn && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute top-1/2 right-2 -translate-y-1/2 w-16 h-6 bg-cyan-500/20 blur-xl pointer-events-none mix-blend-screen"
                style={{
                  marginLeft: isOn ? "calc(100% - 2.5rem)" : "0",
                }}
              />
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

// Need to import AnimatePresence for the exit animation of the glow
