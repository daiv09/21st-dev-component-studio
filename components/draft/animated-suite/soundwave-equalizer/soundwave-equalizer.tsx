"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

export function SoundwaveEqualizer() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div
      onClick={() => setIsActive(!isActive)}
      className="flex flex-col items-center justify-center p-4 gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer select-none w-full max-w-[240px] shadow-lg"
    >
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-400">
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
          EQ MASTER
        </span>
        <span className={isActive ? "text-emerald-400" : "text-zinc-600"}>
          {isActive ? "ACTIVE" : "MUTED"}
        </span>
      </div>

      <div className="flex items-end justify-between w-full h-12 px-2 gap-1.5">
        {[24, 40, 16, 48, 32, 20, 44, 28].map((baseH, idx) => (
          <motion.div
            key={idx}
            className={`w-full rounded-full transition-colors ${
              isActive ? "bg-violet-500" : "bg-zinc-800"
            }`}
            animate={{
              height: isActive ? [baseH * 0.4, baseH, baseH * 0.6] : 6,
            }}
            transition={{
              repeat: Infinity,
              duration: 0.6 + idx * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
