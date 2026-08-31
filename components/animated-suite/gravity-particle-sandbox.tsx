"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export function GravityParticleSandbox() {
  const [gravityCenter, setGravityCenter] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const particles = Array.from({ length: 12 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGravityCenter({ x, y });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-crosshair overflow-hidden shadow-xl"
      >
        {particles.map((_, i) => {
          const angle = (i / particles.length) * Math.PI * 2;
          const baseRadius = 28;
          const baseX = 50 + Math.cos(angle) * baseRadius;
          const baseY = 50 + Math.sin(angle) * baseRadius;

          const targetX = baseX + (gravityCenter.x - 50) * 0.4;
          const targetY = baseY + (gravityCenter.y - 50) * 0.4;

          return (
            <motion.div
              key={i}
              animate={{ x: targetX - 50, y: targetY - 50 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="absolute w-2.5 h-2.5 rounded-full bg-indigo-400 border border-white"
            />
          );
        })}
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        GRAVITY PARTICLE FIELD
      </span>
    </div>
  );
}
