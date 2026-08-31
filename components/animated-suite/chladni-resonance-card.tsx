"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Disc } from "lucide-react";

export function ChladniResonanceCard() {
  const [pattern, setPattern] = useState(1);

  const cycle = () => setPattern((p) => (p >= 3 ? 1 : p + 1));

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Disc className="w-3.5 h-3.5 text-violet-400" />
        <span>RESONANCE PATTERN 0{pattern}</span>
      </div>

      <div
        onClick={cycle}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden p-2"
      >
        <svg className="w-full h-full" viewBox="0 0 240 70">
          <motion.ellipse
            cx="120"
            cy="35"
            rx={pattern === 1 ? 50 : pattern === 2 ? 80 : 30}
            ry={pattern === 1 ? 25 : pattern === 2 ? 15 : 30}
            stroke="#818cf8"
            strokeWidth="2"
            fill="none"
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
          />
          <motion.ellipse
            cx="120"
            cy="35"
            rx={pattern === 1 ? 25 : pattern === 2 ? 40 : 15}
            ry={pattern === 1 ? 12 : pattern === 2 ? 8 : 15}
            stroke="#c084fc"
            strokeWidth="1.5"
            fill="none"
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
          />
        </svg>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">CLICK TO SHIFT FREQUENCY</span>
    </div>
  );
}
