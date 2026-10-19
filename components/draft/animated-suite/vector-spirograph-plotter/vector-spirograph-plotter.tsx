"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VectorSpirographPlotter() {
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
          transition={{ repeat: Infinity, duration: 8 / speed, ease: "linear" }}
          className="w-full h-full p-2"
          viewBox="0 0 100 100"
        >
          <path
            d="M 50,10 Q 75,50 50,90 Q 25,50 50,10 Z M 10,50 Q 50,75 90,50 Q 50,25 10,50 Z"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="50" cy="50" r="12" stroke="#34d399" strokeWidth="1.5" fill="none" />
        </motion.svg>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        SPIROGRAPH SPEED: {speed}X
      </span>
    </div>
  );
}
