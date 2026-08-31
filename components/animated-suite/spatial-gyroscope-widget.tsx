"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function SpatialGyroscopeWidget() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: (y / rect.height) * 45, y: (-x / rect.width) * 45 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Compass className="w-3.5 h-3.5 text-amber-500" />
        <span>3D GYROSCOPE GIMBAL</span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="perspective-1000 w-32 h-32 flex items-center justify-center cursor-pointer"
      >
        <motion.div
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          className="relative w-full h-full flex items-center justify-center transform-style-3d"
        >
          {/* Outer Gimbal Ring */}
          <div className="absolute w-28 h-28 rounded-full border-2 border-amber-500/80 shadow-md" />
          {/* Inner Gimbal Ring */}
          <div className="absolute w-20 h-20 rounded-full border-2 border-emerald-400/80 shadow-md transform rotate-45" />
          {/* Core Nucleus */}
          <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-white shadow-lg" />
        </motion.div>
      </div>
    </div>
  );
}
