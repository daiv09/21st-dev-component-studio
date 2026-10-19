"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface RealisticSwitchProps {
  initialState?: boolean;
  onToggle?: (state: boolean) => void;
}

// Realistic metallic screw component
const Screw = ({ className }: { className?: string }) => (
  <div
    className={`w-4 h-4 rounded-full bg-gradient-to-br from-neutral-300 to-neutral-600 
    shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_2px_rgba(0,0,0,0.6),0_1px_2px_rgba(0,0,0,0.8)] 
    flex items-center justify-center ${className}`}
  >
    {/* Screw head slot */}
    <div className="w-full h-[1.5px] bg-neutral-800 rotate-45 shadow-[inset_0_1px_0_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.4)]" />
  </div>
);

export function CartoonSwitch({
  initialState = false,
  onToggle,
}: RealisticSwitchProps) {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center bg-neutral-900 p-10">
      {/* --- SWITCH PLATE --- 
          Industrial matte red housing with bevelled edges
      */}
      <div
        className="relative w-40 h-56 bg-gradient-to-b from-[#a31a1a] to-[#801010] rounded-xl flex items-center justify-center
        border border-red-950
        shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,100,100,0.5),inset_0_-4px_6px_rgba(0,0,0,0.4)]"
      >
        <Screw className="absolute left-4 top-4" />
        <Screw className="absolute right-4 top-4" />
        <Screw className="absolute left-4 bottom-4" />
        <Screw className="absolute right-4 bottom-4" />

        {/* ON / OFF Engraved Labels */}
        <div
          className={`absolute top-6 font-mono font-black text-xs tracking-widest transition-colors duration-300
          ${isOn
              ? "text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]"
              : "text-red-950 shadow-[0_1px_0_rgba(255,255,255,0.1)] text-transparent bg-clip-text bg-black"
            }`}
        >
          ON
        </div>
        <div className="absolute bottom-6 font-mono font-white text-red-950 text-xs tracking-widest text-white bg-clip-text">
          OFF
        </div>

        {/* --- THE WELL --- 
            Deep recessed hole where the switch sits
        */}
        <div className="w-20 h-32 bg-black rounded-lg shadow-[inset_0_8px_15px_rgba(0,0,0,1),0_1px_1px_rgba(255,255,255,0.2)] p-[2px] perspective-1000">

          {/* --- THE ROCKER BUTTON --- */}
          <motion.button
            onClick={handleToggle}
            className="relative w-full h-full outline-none cursor-pointer"
            initial={false}
            animate={{
              rotateX: isOn ? 25 : -25,
            }}
            transition={{
              type: "spring",
              stiffness: 600, // Very stiff for a sudden snap
              damping: 20,    // Low damping to avoid soft floating
              mass: 0.5
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* 3D Face of the button */}
            <div className="absolute inset-0 rounded-[6px] bg-gradient-to-b from-neutral-800 to-neutral-950 border border-neutral-900 overflow-hidden">

              {/* Dynamic Highlight - Moves based on tilt */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: isOn
                    ? "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 100%)" // Highlight bottom
                    : "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)", // Highlight top
                }}
              />

              {/* Edge Glare */}
              <motion.div
                className="absolute left-0 right-0 h-[1px] bg-white/30"
                animate={{
                  top: isOn ? "auto" : "0",
                  bottom: isOn ? "0" : "auto",
                  opacity: isOn ? 0.3 : 0.8,
                }}
              />

              {/* Physical LED Indicator (The Ultimate visual cue) */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] p-[1px]">
                <motion.div
                  className="w-full h-full rounded-full"
                  animate={{
                    backgroundColor: isOn ? "#22c55e" : "#14532d", // Bright green vs dark green
                    boxShadow: isOn
                      ? "0 0 10px 2px rgba(34,197,94,0.6), inset 0 0 4px rgba(255,255,255,0.8)"
                      : "0 0 0px 0px rgba(0,0,0,0), inset 0 2px 3px rgba(0,0,0,0.8)",
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* Tactile Grip Lines at the bottom */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col gap-[3px]">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-[2px] bg-neutral-950 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.1)]"
                  />
                ))}
              </div>
            </div>

            {/* Moving Drop Shadow (Simulates physical depth in the well) */}
            <motion.div
              className="absolute -z-10 w-full h-full rounded-lg bg-black blur-[6px]"
              animate={{
                translateY: isOn ? 8 : -8,
                scale: 0.85,
                opacity: 0.8
              }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}