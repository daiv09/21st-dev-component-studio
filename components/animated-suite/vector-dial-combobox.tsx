"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Disc } from "lucide-react";

const OPTIONS = ["ALPHA", "BETA", "GAMMA", "DELTA"];

export function VectorDialCombobox() {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const rotateNext = () => {
    setSelectedIdx((prev) => (prev + 1) % OPTIONS.length);
  };

  const angle = (selectedIdx / OPTIONS.length) * 360;

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Disc className="w-3.5 h-3.5 text-emerald-500" />
        <span>SELECTED: {OPTIONS[selectedIdx]}</span>
      </div>

      <div
        onClick={rotateNext}
        className="relative w-32 h-32 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        {/* Rotating Dial Wheel */}
        <motion.svg
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="w-full h-full"
          viewBox="0 0 100 100"
        >
          {OPTIONS.map((opt, i) => {
            const itemAngle = (i / OPTIONS.length) * 360;
            const rad = (itemAngle * Math.PI) / 180;
            const x = 50 + Math.sin(rad) * 32;
            const y = 50 - Math.cos(rad) * 32;

            return (
              <g key={opt}>
                <circle cx={x} cy={y} r="5" fill={i === selectedIdx ? "#10b981" : "#3f3f46"} />
              </g>
            );
          })}
        </motion.svg>

        {/* Center Indicator */}
        <div className="absolute w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-400">
          {OPTIONS[selectedIdx]}
        </div>
      </div>
    </div>
  );
}
