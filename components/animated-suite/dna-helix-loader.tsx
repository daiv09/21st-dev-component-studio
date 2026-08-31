"use client";

import React from "react";
import { motion } from "framer-motion";

export function DnaHelixLoader() {
  const dots = Array.from({ length: 8 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-3 py-4">
        {dots.map((_, i) => {
          const delay = i * 0.15;
          return (
            <div key={i} className="relative flex flex-col items-center gap-6">
              {/* Top Strand */}
              <motion.div
                animate={{
                  y: [-12, 12, -12],
                  scale: [1, 0.6, 1],
                  opacity: [1, 0.4, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                  delay,
                }}
                className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"
              />

              {/* Rung connection */}
              <motion.div
                animate={{
                  scaleY: [1, 0.2, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                  delay,
                }}
                className="w-0.5 h-6 bg-zinc-400 dark:bg-zinc-600 rounded-full"
              />

              {/* Bottom Strand */}
              <motion.div
                animate={{
                  y: [12, -12, 12],
                  scale: [0.6, 1, 0.6],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                  delay,
                }}
                className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm"
              />
            </div>
          );
        })}
      </div>
      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
        SEQUENCING GENOME
      </span>
    </div>
  );
}
