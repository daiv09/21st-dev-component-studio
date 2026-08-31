"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Box, RotateCw } from "lucide-react";

export function Spatial3dCubeCarousel() {
  const [face, setFace] = useState(0);

  const nextFace = () => setFace((prev) => (prev + 1) % 4);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="perspective-1000 w-28 h-28 flex items-center justify-center">
        <motion.div
          animate={{ rotateY: face * 90 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative w-24 h-24 rounded-2xl bg-indigo-600 text-white font-mono text-sm font-bold flex items-center justify-center shadow-xl border-2 border-white/20 transform-style-3d cursor-pointer"
          onClick={nextFace}
        >
          <div className="flex items-center gap-1.5">
            <Box className="w-5 h-5" />
            <span>FACE {face + 1}</span>
          </div>
        </motion.div>
      </div>

      <button
        onClick={nextFace}
        className="flex items-center gap-1 text-[11px] font-mono font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>ROTATE CUBE</span>
      </button>
    </div>
  );
}
