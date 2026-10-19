"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Orbit } from "lucide-react";

export function VectorOrbitToggle() {
  const [isOn, setIsOn] = useState(false);

  const toggle = () => setIsOn(!isOn);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Orbit className="w-3.5 h-3.5 text-indigo-500" />
        <span>PLANETARY ORBIT SWITCH</span>
      </div>

      <div
        onClick={toggle}
        className="relative w-32 h-16 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        {/* Orbital Track Line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 64">
          <ellipse cx="64" cy="32" rx="45" ry="18" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        </svg>

        {/* Central Nucleus */}
        <div className="w-6 h-6 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1] z-10" />

        {/* Orbiting Satellite Node */}
        <motion.div
          animate={{
            x: isOn ? 36 : -36,
            y: isOn ? -8 : 8,
            scale: isOn ? 1.2 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="absolute w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-md z-20"
        />
      </div>
    </div>
  );
}
