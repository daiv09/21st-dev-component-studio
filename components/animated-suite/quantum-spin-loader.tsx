"use client";

import React from "react";
import { motion } from "framer-motion";

interface QuantumSpinLoaderProps {
  size?: number;
  label?: string;
}

export function QuantumSpinLoader({
  size = 72,
  label = "SYNCING QUANTUM STATE",
}: QuantumSpinLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/50"
        />

        {/* Inner Counter Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-emerald-400 border-l-transparent"
        />

        {/* Orbiting Particle 1 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] -translate-y-1/2 left-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Orbiting Particle 2 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] translate-y-1/2 left-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Core Center Pulse */}
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-3.5 h-3.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
        />
      </div>

      {label && (
        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
