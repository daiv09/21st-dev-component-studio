"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export function KineticVariableFont() {
  const [fontWeight, setFontWeight] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const weight = Math.round((x / rect.width) * 600 + 300); // 300 to 900
    setFontWeight(weight);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-crosshair select-none shadow-md w-full max-w-[260px]"
    >
      <motion.span
        style={{ fontWeight }}
        className="font-mono text-2xl text-zinc-900 dark:text-zinc-100 transition-all duration-75"
      >
        VARIABLE
      </motion.span>
      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
        WEIGHT: {fontWeight}
      </span>
    </div>
  );
}
