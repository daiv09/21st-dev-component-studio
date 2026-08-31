"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Grid } from "lucide-react";

export function SvgGridDistortionCard() {
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursor({ x, y });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-[260px] h-36 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col justify-between select-none cursor-pointer overflow-hidden shadow-xl"
    >
      {/* SVG Distorted Wireframe Mesh */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={i * 20}
            x2="100"
            y2={i * 20 + (cursor.y - 50) * 0.2}
            stroke="#27272a"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={i * 20 + (cursor.x - 50) * 0.2}
            y1="0"
            x2={i * 20}
            y2="100"
            stroke="#27272a"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-mono font-bold text-emerald-400">DISTORTION MESH</span>
        <Grid className="w-4 h-4 text-emerald-400" />
      </div>

      <span className="text-[10px] font-mono text-zinc-500 z-10">
        MOVE CURSOR TO WARP MESH
      </span>
    </div>
  );
}
