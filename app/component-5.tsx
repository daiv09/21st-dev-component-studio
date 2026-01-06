// cartoon-switch.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface CartoonSwitchProps {
  initialState?: boolean;
  onToggle?: (state: boolean) => void;
}

const Screw = ({ className }: { className?: string }) => (
  <div
    className={`w-4 h-4 rounded-full bg-red-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center ${className}`}
  >
    <div className="w-full h-0.5 bg-red-950 rotate-45" />
  </div>
);

export function CartoonSwitch({
  initialState = false,
  onToggle,
}: CartoonSwitchProps) {
  const [isOn, setIsOn] = useState(initialState);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <div className="p-10 flex items-center justify-center">
      {/* --- HOUSING --- 
          The main red box. 
      */}
      <div
        className="relative w-40 h-52 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center
        shadow-[0_10px_0_#7f1d1d,0_20px_25px_rgba(0,0,0,0.4),inset_0_2px_5px_rgba(255,255,255,0.3),inset_0_-4px_4px_rgba(0,0,0,0.1)]"
      >
        <Screw className="absolute left-4 top-1/2 -translate-y-1/2" />
        <Screw className="absolute right-4 top-1/2 -translate-y-1/2" />

        {/* --- THE WELL --- 
            Deep recessed area. Note the inner shadow changes to make it look deep.
        */}
        <div className="w-20 h-32 bg-red-950/80 rounded-xl shadow-[inset_0_5px_10px_rgba(0,0,0,0.7)] p-2 perspective-600">
          {/* --- THE ROCKER --- 
              This is the moving part.
          */}
          <motion.button
            onClick={handleToggle}
            className="relative w-full h-full outline-none preserve-3d cursor-pointer"
            initial={false}
            animate={{
              rotateX: isOn ? -20 : 20, // The physical tilt
            }}
            transition={{
              type: "spring",
              stiffness: 400, // Higher stiffness = snappier "click"
              damping: 25, // Damping prevents it from wobbling too much
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* 1. SIDE WALLS (The Thickness) 
                These are static blocks behind the face that get revealed when rotated.
            */}
            <div className="absolute inset-0 bg-[#78350f] rounded-lg transform translate-z-[-12px]" />

            {/* 2. THE MAIN FACE 
                The creamy top surface.
            */}
            <div
              className={`absolute inset-0 rounded-lg border-[0.5px] border-white/20 transition-colors duration-200
              ${
                isOn
                  ? "bg-amber-100" // Base color
                  : "bg-amber-50"
              }`}
            >
              {/* 3. DYNAMIC LIGHTING OVERLAY (The Realism Trick) 
                  Instead of changing the background color, we overlay gradients.
                  
                  Logic: 
                  - If ON (Top pressed in): Top is dark (shadow), Bottom is light.
                  - If OFF (Top sticking out): Top is light, Bottom is dark (shadow).
              */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                initial={false}
                animate={{
                  background: isOn
                    ? "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(255,255,255,0.1) 100%)" // Shadow at top
                    : "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(0,0,0,0.15) 100%)", // Highlight at top
                }}
              />

              {/* 4. EDGE HIGHLIGHT 
                  A sharp white line that moves to the "high" edge.
              */}
              <motion.div
                className="absolute left-0 right-0 h-[2px] bg-white/60 blur-[1px]"
                animate={{
                  top: isOn ? "auto" : "0",
                  bottom: isOn ? "0" : "auto",
                  opacity: isOn ? 0.5 : 0.8,
                }}
              />
            </div>

            {/* 5. DROP SHADOW (Cast by the button onto the well) 
                This shadow moves to the opposite side of the press.
            */}
            <motion.div
              className="absolute -z-10 w-full h-full rounded-lg bg-black/50 blur-md"
              animate={{
                translateY: isOn ? 15 : -15, // Shadow moves opposite to the tilt
                scale: 0.9,
              }}
            />
          </motion.button>
        </div>

        {/* ON/OFF Labels (Optional, adds nice detail) */}
        <div className="absolute top-6 font-black text-red-900/40 text-xs tracking-widest pointer-events-none">
          ON
        </div>
        <div className="absolute bottom-6 font-black text-red-900/40 text-xs tracking-widest pointer-events-none">
          OFF
        </div>
      </div>
    </div>
  );
}
