"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VectorKnotTopography() {
  const [scale, setScale] = useState(1);

  const toggle = () => setScale((prev) => (prev >= 1.4 ? 1 : prev + 0.2));

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        onClick={toggle}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer shadow-xl overflow-hidden"
      >
        <motion.svg
          animate={{ scale }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="w-full h-full p-2"
          viewBox="0 0 100 100"
        >
          <path
            d="M 30,50 C 30,20 70,80 70,50 C 70,20 30,80 30,50 Z"
            stroke="#f43f5e"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 50,30 C 20,30 80,70 50,70 C 20,70 80,30 50,30 Z"
            stroke="#38bdf8"
            strokeWidth="2"
            fill="none"
          />
        </motion.svg>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        TOROIDAL KNOT TOPOGRAPHY
      </span>
    </div>
  );
}
