"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function KineticWordScaffold() {
  const [isExploded, setIsExploded] = useState(false);
  const letters = ["S", "P", "A", "T", "I", "A", "L"];

  return (
    <div
      onMouseEnter={() => setIsExploded(true)}
      onMouseLeave={() => setIsExploded(false)}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 cursor-pointer select-none shadow-md"
    >
      <div className="flex items-center gap-2">
        {letters.map((l, i) => {
          const offset = (i - 3) * 12;
          return (
            <motion.div
              key={i}
              animate={{
                x: isExploded ? offset : 0,
                rotate: isExploded ? (i - 3) * 15 : 0,
                scale: isExploded ? 1.15 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="w-7 h-9 rounded-md bg-indigo-600 text-white font-mono text-base font-extrabold flex items-center justify-center shadow-sm"
            >
              {l}
            </motion.div>
          );
        })}
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
        HOVER TO RADIAL EXPLODE
      </span>
    </div>
  );
}
