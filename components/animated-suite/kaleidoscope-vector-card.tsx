"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function KaleidoscopeVectorCard() {
  const [isRotating, setIsRotating] = useState(false);

  const toggle = () => setIsRotating(!isRotating);

  const petals = Array.from({ length: 8 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        onClick={toggle}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden shadow-xl"
      >
        <motion.div
          animate={{ rotate: isRotating ? 360 : 0 }}
          transition={{ repeat: isRotating ? Infinity : 0, duration: 6, ease: "linear" }}
          className="relative w-full h-full"
        >
          {petals.map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 w-0 h-0"
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              <div className="w-8 h-8 rounded-tr-2xl bg-indigo-500/80 border border-indigo-400 -translate-x-1/2 -translate-y-12" />
            </div>
          ))}
        </motion.div>

        <div className="absolute w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 shadow-md" />
      </div>

      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        KALEIDOSCOPE SYMMETRY
      </span>
    </div>
  );
}
