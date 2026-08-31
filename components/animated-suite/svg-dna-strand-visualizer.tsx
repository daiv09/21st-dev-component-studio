"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dna } from "lucide-react";

export function SvgDnaStrandVisualizer() {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  const rungs = Array.from({ length: 7 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Dna className="w-3.5 h-3.5 text-violet-500" />
        <span>DNA HELIX MAP</span>
      </div>

      <div className="relative w-32 h-28 p-2 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between shadow-xl">
        {rungs.map((_, i) => {
          const isSelected = activeNode === i;
          return (
            <div
              key={i}
              onClick={() => setActiveNode(i)}
              className="flex flex-col items-center justify-between h-full cursor-pointer py-2"
            >
              <motion.div
                animate={{ scale: isSelected ? 1.4 : 1 }}
                className={`w-3 h-3 rounded-full ${
                  isSelected ? "bg-amber-400" : "bg-violet-500"
                }`}
              />
              <div className="w-0.5 h-12 bg-zinc-700" />
              <motion.div
                animate={{ scale: isSelected ? 1.4 : 1 }}
                className={`w-3 h-3 rounded-full ${
                  isSelected ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
