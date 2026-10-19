"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Grid } from "lucide-react";

export function MagneticLensGridBlock() {
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLensPos({ x, y });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Grid className="w-3.5 h-3.5 text-sky-400" />
        <span>MAGNIFYING LENS GRID</span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-crosshair overflow-hidden"
      >
        <div className="grid grid-cols-6 gap-2 opacity-40">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
          ))}
        </div>

        {/* Floating Magnifying Lens */}
        <motion.div
          animate={{ left: `${lensPos.x}%`, top: `${lensPos.y}%` }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="absolute w-10 h-10 rounded-full border-2 border-sky-400 bg-sky-500/20 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 shadow-lg pointer-events-none flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        </motion.div>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO MOVE LENS</span>
    </div>
  );
}
