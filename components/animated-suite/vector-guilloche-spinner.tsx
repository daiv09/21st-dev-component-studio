"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VectorGuillocheSpinner() {
  const [speed, setSpeed] = useState(1);

  const toggle = () => setSpeed((prev) => (prev >= 3 ? 1 : prev + 1));

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        onClick={toggle}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden shadow-xl"
      >
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10 / speed, ease: "linear" }}
          className="w-full h-full p-2"
          viewBox="0 0 100 100"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse
              key={i}
              cx="50"
              cy="50"
              rx="36"
              ry="12"
              stroke="#10b981"
              strokeWidth="1.2"
              fill="none"
              transform={`rotate(${i * 15} 50 50)`}
            />
          ))}
        </motion.svg>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        GUILLOCHE PATTERN {speed}X
      </span>
    </div>
  );
}
