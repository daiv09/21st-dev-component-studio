"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";

export function KineticKerningMorph() {
  const [tracking, setTracking] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const trackVal = Math.round((x / rect.width) * 18);
    setTracking(trackVal);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <MoveHorizontal className="w-3.5 h-3.5 text-sky-400" />
          DYNAMIC TRACKING
        </span>
        <span className="text-sky-400 font-extrabold">{tracking}px</span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="w-full h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center cursor-ew-resize overflow-hidden px-4"
      >
        <motion.span
          style={{ letterSpacing: `${tracking}px` }}
          className="font-mono text-xl font-black text-zinc-900 dark:text-zinc-100 transition-all duration-75"
        >
          HORIZONTAL
        </motion.span>
      </div>
      <span className="text-[10px] font-mono text-zinc-400">SLIDE CURSOR HORIZONTALLY</span>
    </div>
  );
}
