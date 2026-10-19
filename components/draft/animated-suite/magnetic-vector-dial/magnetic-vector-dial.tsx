"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

export function MagneticVectorDial() {
  const [val, setVal] = useState(42);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMagneticOffset({ x: x * 0.25, y: y * 0.25 });
  };

  const handleMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

  const increment = () => {
    setVal((prev) => (prev >= 100 ? 0 : prev + 10));
  };

  const angle = (val / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Gauge className="w-3.5 h-3.5 text-indigo-500" />
        <span>VECTOR DIAL: {val}%</span>
      </div>

      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={increment}
        animate={{ x: magneticOffset.x, y: magneticOffset.y }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="relative w-32 h-32 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center cursor-pointer shadow-xl"
      >
        {/* SVG Radial Vector Tick Marks */}
        <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" viewBox="0 0 100 100">
          {Array.from({ length: 20 }).map((_, i) => {
            const tickAngle = (i / 19) * 270 - 135;
            const rad = (tickAngle * Math.PI) / 180;
            const x1 = 50 + Math.sin(rad) * 38;
            const y1 = 50 - Math.cos(rad) * 38;
            const x2 = 50 + Math.sin(rad) * 44;
            const y2 = 50 - Math.cos(rad) * 44;
            const isActive = tickAngle <= angle;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? "#6366f1" : "#3f3f46"}
                strokeWidth={isActive ? "2.5" : "1.5"}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Rotatable Needle Pointer */}
        <motion.div
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="relative w-1.5 h-14 bg-indigo-500 rounded-full origin-bottom shadow-md"
          style={{ bottom: "18px" }}
        />

        <div className="absolute w-8 h-8 rounded-full bg-zinc-950 border-2 border-indigo-400 flex items-center justify-center shadow-inner">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
        </div>
      </motion.div>
    </div>
  );
}
