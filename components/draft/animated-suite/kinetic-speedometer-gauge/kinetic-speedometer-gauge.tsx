"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function KineticSpeedometerGauge() {
  const [speed, setSpeed] = useState(85);

  const boost = () => setSpeed((prev) => (prev >= 200 ? 40 : prev + 35));

  const angle = (speed / 240) * 240 - 120; // -120 to +120 deg

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span>TACHOMETER: {speed} MPH</span>
      </div>

      <div
        onClick={boost}
        className="relative w-32 h-32 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#27272a"
            strokeWidth="6"
            strokeDasharray="180 300"
            strokeLinecap="round"
            fill="none"
            transform="rotate(150 50 50)"
          />
        </svg>

        {/* Needle */}
        <motion.div
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-1.5 h-14 bg-amber-400 rounded-full origin-bottom shadow-md"
          style={{ bottom: "16px" }}
        />

        <div className="absolute w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400">
          {speed}
        </div>
      </div>
    </div>
  );
}
