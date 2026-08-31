"use client";

import React from "react";
import { motion } from "framer-motion";

export function VectorPendulumWave() {
  const bobs = Array.from({ length: 6 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-4 h-32 py-2">
        {bobs.map((_, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center origin-top"
            animate={{ rotate: [-24, 24, -24] }}
            transition={{
              repeat: Infinity,
              duration: 1.4 + i * 0.1,
              ease: "easeInOut",
            }}
          >
            {/* String Line */}
            <div className="w-0.5 h-20 bg-zinc-400 dark:bg-zinc-600" />
            {/* Vector Bob */}
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm border border-white dark:border-zinc-900" />
          </motion.div>
        ))}
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        HARMONIC PENDULUM WAVE
      </span>
    </div>
  );
}
