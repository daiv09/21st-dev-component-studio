"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function RadialBloomText() {
  const [bloomed, setBloomed] = useState(false);
  const WORD = "BLOOM";

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        <span>RADIAL EXPANSION BLOOM</span>
      </div>

      <div
        onMouseEnter={() => setBloomed(true)}
        onMouseLeave={() => setBloomed(false)}
        className="relative w-full h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center cursor-pointer overflow-hidden"
      >
        {WORD.split("").map((letter, i) => {
          const angle = (i / (WORD.length - 1)) * 140 - 70; // -70 to +70 deg
          const rad = (angle * Math.PI) / 180;
          const dist = 32;
          const bloomX = Math.sin(rad) * dist;
          const bloomY = -Math.cos(rad) * (dist * 0.4);

          return (
            <motion.span
              key={i}
              animate={{
                x: bloomed ? bloomX : 0,
                y: bloomed ? bloomY : 0,
                rotate: bloomed ? angle * 0.5 : 0,
                scale: bloomed ? 1.25 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="font-mono text-2xl font-black text-rose-500 mx-1"
            >
              {letter}
            </motion.span>
          );
        })}
      </div>
      <span className="text-[10px] font-mono text-zinc-400">HOVER TO BLOOM</span>
    </div>
  );
}
