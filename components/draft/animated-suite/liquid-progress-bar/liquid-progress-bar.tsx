"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BatteryCharging, RefreshCw } from "lucide-react";

export function LiquidProgressBar() {
  const [progress, setProgress] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 15));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[240px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <BatteryCharging className="w-4 h-4 text-emerald-500" />
          STORAGE LEVEL
        </span>
        <span className="text-emerald-500 font-extrabold">{progress}%</span>
      </div>

      <div className="relative w-full h-6 rounded-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-1 overflow-hidden">
        {/* Solid Fill Bar */}
        <motion.div
          className="h-full bg-emerald-500 rounded-full relative overflow-hidden"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Animated pulse stripe */}
          <motion.div
            className="absolute inset-y-0 w-8 bg-white/30"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
          />
        </motion.div>
      </div>

      <button
        onClick={() => setProgress((p) => (p >= 100 ? 0 : Math.min(100, p + 25)))}
        className="flex items-center gap-1 text-[10px] font-mono font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>CHARGE MANUALLY</span>
      </button>
    </div>
  );
}
