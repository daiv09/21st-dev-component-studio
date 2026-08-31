"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Waves } from "lucide-react";

export function ChladniFrequencyGrid() {
  const [mode, setMode] = useState(1);

  const toggle = () => {
    setMode((prev) => (prev % 3) + 1);
  };

  const grid = Array.from({ length: 25 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Waves className="w-3.5 h-3.5 text-indigo-500" />
        <span>HARMONIC MODE: 0{mode}</span>
      </div>

      <div
        onClick={toggle}
        className="w-32 h-32 p-3 rounded-2xl bg-zinc-950 border border-indigo-500/40 shadow-xl grid grid-cols-5 gap-2 cursor-pointer"
      >
        {grid.map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;

          let isActive = false;
          if (mode === 1) isActive = (row + col) % 2 === 0;
          if (mode === 2) isActive = row === 2 || col === 2;
          if (mode === 3) isActive = row === col || row + col === 4;

          return (
            <motion.div
              key={i}
              animate={{
                scale: isActive ? 1 : 0.4,
                backgroundColor: isActive ? "#6366f1" : "#27272a",
                borderRadius: isActive ? "50%" : "20%",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full h-full"
            />
          );
        })}
      </div>
    </div>
  );
}
