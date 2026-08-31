"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Grid } from "lucide-react";

export function PixelDustScrambleText() {
  const [scattered, setScattered] = useState(false);
  const WORD = "PIXEL";

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Grid className="w-3.5 h-3.5 text-rose-500" />
        <span>PARTICLE DUST MATRIX</span>
      </div>

      <div
        onClick={() => setScattered(!scattered)}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
      >
        {WORD.split("").map((letter, i) => (
          <div key={i} className="relative flex items-center justify-center">
            <motion.span
              animate={{
                x: scattered ? (i - 2) * 25 + (i % 2 === 0 ? 10 : -10) : 0,
                y: scattered ? (i % 2 === 0 ? -20 : 20) : 0,
                scale: scattered ? 0.4 : 1,
                rotate: scattered ? (i - 2) * 45 : 0,
                opacity: scattered ? 0.3 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="font-mono text-3xl font-black text-rose-400"
            >
              {letter}
            </motion.span>
          </div>
        ))}
      </div>
      <span className="text-[10px] font-mono text-zinc-500">
        {scattered ? "CLICK TO CONVERGE" : "CLICK TO SCATTER DUST"}
      </span>
    </div>
  );
}
