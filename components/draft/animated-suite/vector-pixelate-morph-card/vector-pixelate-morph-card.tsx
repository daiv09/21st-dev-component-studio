"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sliders } from "lucide-react";

export function VectorPixelateMorphCard() {
  const [pixelSize, setPixelSize] = useState(12);

  const cycle = () => {
    const sizes = [12, 24, 6, 16];
    const idx = (sizes.indexOf(pixelSize) + 1) % sizes.length;
    setPixelSize(sizes[idx]);
  };

  return (
    <div
      onClick={cycle}
      className="relative w-64 h-36 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col justify-between select-none cursor-pointer overflow-hidden shadow-xl"
    >
      <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-400 z-10">
        <span>PIXELATE GRID</span>
        <Sliders className="w-4 h-4" />
      </div>

      {/* SVG Pixel Mesh Overlay */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2 opacity-60 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              borderRadius: pixelSize > 15 ? "50%" : "20%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full h-full bg-sky-500/40 border border-sky-400/50"
          />
        ))}
      </div>

      <span className="text-[10px] font-mono text-zinc-500 z-10">
        GRID SIZE: {pixelSize}px
      </span>
    </div>
  );
}
