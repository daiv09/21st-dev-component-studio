"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Waves } from "lucide-react";

export function WaveDistortionStringText() {
  const [pullY, setPullY] = useState(0);
  const WORD = "WAVESTRING";

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Waves className="w-3.5 h-3.5 text-emerald-500" />
        <span>BASELINE STRING DEFLECTION</span>
      </div>

      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - (rect.top + rect.height / 2);
          setPullY(Math.max(-25, Math.min(25, y)));
        }}
        onMouseLeave={() => setPullY(0)}
        className="relative w-full h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center cursor-pointer overflow-hidden px-4"
      >
        {/* Baseline SVG string */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 90">
          <motion.path
            d={`M 10,45 Q 130,${45 + pullY * 1.5} 250,45`}
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          />
        </svg>

        {/* Characters riding the curve */}
        <div className="relative flex items-center justify-between w-full z-10">
          {WORD.split("").map((char, i) => {
            const ratio = Math.sin((i / (WORD.length - 1)) * Math.PI);
            const charY = pullY * ratio;

            return (
              <motion.span
                key={i}
                animate={{ y: charY }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="font-mono text-base font-black text-zinc-900 dark:text-zinc-100"
              >
                {char}
              </motion.span>
            );
          })}
        </div>
      </div>
      <span className="text-[10px] font-mono text-zinc-400">MOVE MOUSE VERTICALLY</span>
    </div>
  );
}
