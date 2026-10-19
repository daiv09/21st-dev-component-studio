"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mountain } from "lucide-react";

export function ParallaxDepthLayers() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setOffset({ x: x * 0.15, y: y * 0.15 });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-64 h-36 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col justify-between select-none cursor-pointer overflow-hidden shadow-xl"
    >
      {/* Background Vector Mountain */}
      <motion.div
        animate={{ x: offset.x * 0.4, y: offset.y * 0.4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center text-zinc-800 opacity-60 pointer-events-none"
      >
        <Mountain className="w-40 h-40" />
      </motion.div>

      {/* Foreground Floating Vector Card */}
      <motion.div
        animate={{ x: offset.x * 1.2, y: offset.y * 1.2 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="relative z-10 p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-md text-xs font-mono font-bold text-emerald-400"
      >
        PARALLAX DEPTH LAYER
      </motion.div>

      <span className="text-[10px] font-mono text-zinc-500 z-10">
        HOVER TO SHIFT PARALLAX
      </span>
    </div>
  );
}
