"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

export function MagneticCursorTarget() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.4, y: y * 0.4 });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-36 h-36 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center cursor-pointer"
      >
        <motion.div
          animate={{ x: pos.x, y: pos.y }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="w-14 h-14 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900"
        >
          <Target className="w-7 h-7 stroke-[2.5]" />
        </motion.div>
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        MAGNETIC TARGET ZONE
      </span>
    </div>
  );
}
