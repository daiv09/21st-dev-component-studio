"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Waves } from "lucide-react";

export function WaveSurfaceMeshBlock() {
  const [elevated, setElevated] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Waves className="w-3.5 h-3.5 text-sky-400" />
        <span>TOPOGRAPHIC SURFACE MESH</span>
      </div>

      <div
        onMouseEnter={() => setElevated(true)}
        onMouseLeave={() => setElevated(false)}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden p-2"
      >
        <svg className="w-full h-full" viewBox="0 0 240 70">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M 10,${15 + i * 10} Q 60,${elevated ? 5 + i * 6 : 25 + i * 6} 120,${15 + i * 10} T 230,${15 + i * 10}`}
              stroke="#38bdf8"
              strokeWidth="1.5"
              fill="none"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          ))}
        </svg>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO WARP ELEVATION</span>
    </div>
  );
}
