"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Orbit } from "lucide-react";

export function MagneticGravityLetters() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const WORD = "GRAVITY";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0, active: false });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Orbit className="w-3.5 h-3.5 text-sky-500" />
        <span>MAGNETIC REPULSION MATRIX</span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center gap-2 overflow-hidden cursor-crosshair"
      >
        {WORD.split("").map((char, i) => {
          const letterX = 40 + i * 32;
          const letterY = 48;
          const dx = mousePos.active ? mousePos.x - letterX : 0;
          const dy = mousePos.active ? mousePos.y - letterY : 0;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 90;

          let pushX = 0;
          let pushY = 0;
          if (mousePos.active && dist < maxDist) {
            const force = (1 - dist / maxDist) * 28;
            const angle = Math.atan2(dy, dx);
            pushX = -Math.cos(angle) * force;
            pushY = -Math.sin(angle) * force;
          }

          return (
            <motion.span
              key={i}
              animate={{ x: pushX, y: pushY }}
              transition={{ type: "spring", stiffness: 450, damping: 20 }}
              className="font-mono text-2xl font-black text-zinc-900 dark:text-zinc-100"
            >
              {char}
            </motion.span>
          );
        })}
      </div>
      <span className="text-[10px] font-mono text-zinc-400">HOVER TO DISPLACE LETTERS</span>
    </div>
  );
}
