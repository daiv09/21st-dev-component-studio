"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export function KineticBezierSlider() {
  const [value, setValue] = useState(50);
  const [bend, setBend] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!trackRef.current || e.buttons !== 1) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setValue(percent);

    const dy = e.clientY - (rect.top + rect.height / 2);
    setBend(Math.max(-30, Math.min(30, dy)));
  };

  const handlePointerUp = () => setBend(0);

  const thumbX = (value / 100) * 220;
  const pathD = `M 10,25 Q ${10 + thumbX},${25 + bend} 230,25`;

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[260px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span>BEZIER STRING SLIDER</span>
        <span className="text-emerald-500 font-extrabold">{value}%</span>
      </div>

      <div
        ref={trackRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-12 flex items-center cursor-grab active:cursor-grabbing touch-none"
      >
        <svg className="w-full h-full overflow-visible" viewBox="0 0 240 50">
          <motion.path
            d={pathD}
            stroke="#10b981"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </svg>

        {/* Floating Vector Thumb */}
        <motion.div
          animate={{ x: thumbX - 8, y: bend * 0.5 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="absolute left-2.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-md"
        />
      </div>
    </div>
  );
}
