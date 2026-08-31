"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";

export function KaleidoscopeTextOrbit() {
  const [rotating, setRotating] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <RotateCw className="w-3.5 h-3.5 text-violet-400" />
        <span>QUADRANT TEXT ORBIT</span>
      </div>

      <div
        onClick={() => setRotating(!rotating)}
        className="relative w-28 h-28 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden"
      >
        <motion.div
          animate={{ rotate: rotating ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="relative w-full h-full flex items-center justify-center font-mono text-[10px] font-black text-violet-400"
        >
          <span className="absolute top-1">NORTH</span>
          <span className="absolute bottom-1">SOUTH</span>
          <span className="absolute left-1 rotate-90">WEST</span>
          <span className="absolute right-1 -rotate-90">EAST</span>
          <div className="w-4 h-4 rounded-full bg-violet-500 border border-white" />
        </motion.div>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">CLICK TO PAUSE/RESUME</span>
    </div>
  );
}
