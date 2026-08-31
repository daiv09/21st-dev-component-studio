"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";

export function VectorSoundSpectrumRing() {
  const [isPlaying, setIsPlaying] = useState(true);

  const bars = Array.from({ length: 24 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        onClick={() => setIsPlaying(!isPlaying)}
        className="relative w-32 h-32 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 100">
          {bars.map((_, i) => {
            const angle = (i / bars.length) * 360;
            const h = isPlaying ? 10 + (i % 5) * 4 : 4;
            return (
              <motion.line
                key={i}
                x1="50"
                y1={50 - 32}
                x2="50"
                y2={50 - 32 - h}
                stroke="#6366f1"
                strokeWidth="2"
                strokeLinecap="round"
                transform={`rotate(${angle} 50 50)`}
                animate={{
                  y2: isPlaying ? [50 - 32 - h, 50 - 32 - h - 6, 50 - 32 - h] : 50 - 32 - h,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + (i % 3) * 0.2,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </svg>

        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-indigo-400">
          <Radio className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`} />
        </div>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        RADIAL SPECTRUM RING
      </span>
    </div>
  );
}
