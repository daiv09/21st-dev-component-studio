"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

export function HexConstellationBento() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Hexagon className="w-3.5 h-3.5 text-emerald-400" />
        <span>HEX VERTEX MATRIX</span>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        {Array.from({ length: 6 }).map((_, i) => {
          const isActive = activeIdx === i;
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              animate={{
                scale: isActive ? 1.1 : 1,
                backgroundColor: isActive ? "#10b981" : "#18181b",
              }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className={`h-10 rounded-xl border border-zinc-800 flex items-center justify-center font-mono text-[10px] font-bold cursor-pointer transition-colors ${
                isActive ? "text-zinc-950" : "text-zinc-400"
              }`}
            >
              0{i + 1}
            </motion.div>
          );
        })}
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER HEX TILES</span>
    </div>
  );
}
