"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export function KineticCursorTrail() {
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTrail((prev) => [...prev.slice(-5), { x, y }]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-36 h-36 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-crosshair overflow-hidden shadow-xl"
      >
        <svg className="w-full h-full pointer-events-none">
          {trail.map((pt, i) => (
            <motion.circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={2 + i * 1.5}
              fill="#38bdf8"
              opacity={(i + 1) / trail.length}
            />
          ))}
        </svg>
        <span className="absolute text-[10px] font-mono font-bold text-zinc-500 pointer-events-none">
          SWIPE CURSOR FOR TRAIL
        </span>
      </div>
    </div>
  );
}
