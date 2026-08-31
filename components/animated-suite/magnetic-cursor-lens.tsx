"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export function MagneticCursorLens() {
  const [lens, setLens] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLens({ x, y });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-36 h-36 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-crosshair overflow-hidden shadow-xl"
      >
        <span className="font-mono text-xs font-black text-zinc-600 uppercase tracking-widest text-center px-4">
          MAGNIFYING VECTOR CORE
        </span>

        {/* Floating Magnifying Lens */}
        <motion.div
          animate={{ left: `${lens.x}%`, top: `${lens.y}%` }}
          transition={{ type: "spring", stiffness: 450, damping: 25 }}
          className="absolute w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-500/20 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 shadow-lg pointer-events-none flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </motion.div>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        MAGNETIC VECTOR LENS
      </span>
    </div>
  );
}
