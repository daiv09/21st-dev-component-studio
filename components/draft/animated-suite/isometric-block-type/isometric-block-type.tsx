"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Box } from "lucide-react";

export function IsometricBlockType() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const WORD = "BLOCKS";

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Box className="w-3.5 h-3.5 text-violet-500" />
        <span>3D ISOMETRIC EXTRUSION</span>
      </div>

      <div className="perspective-1000 flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl w-full">
        {WORD.split("").map((letter, i) => {
          const isElevated = activeIdx === i;
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              animate={{
                y: isElevated ? -12 : 0,
                rotateX: isElevated ? 25 : 0,
                scale: isElevated ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className={`w-8 h-12 rounded-lg font-mono text-lg font-black flex items-center justify-center cursor-pointer shadow-md transition-colors ${
                isElevated
                  ? "bg-violet-500 text-white shadow-violet-500/40"
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700"
              }`}
            >
              {letter}
            </motion.div>
          );
        })}
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER INDIVIDUAL VOXEL TILES</span>
    </div>
  );
}
