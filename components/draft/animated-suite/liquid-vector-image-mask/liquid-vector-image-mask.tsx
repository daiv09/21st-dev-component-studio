"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

export function LiquidVectorImageMask() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 cursor-pointer select-none shadow-md"
    >
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Morphing Liquid SVG Mask Container */}
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <motion.path
            d={
              isHovered
                ? "M 20,50 Q 10,10 50,10 Q 90,10 80,50 Q 90,90 50,90 Q 10,90 20,50 Z"
                : "M 25,50 Q 25,25 50,25 Q 75,25 75,50 Q 75,75 50,75 Q 25,75 25,50 Z"
            }
            fill="#10b981"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </svg>

        {/* Center Vector Icon / Abstract Content */}
        <div className="absolute inset-0 flex items-center justify-center text-zinc-950">
          <ImageIcon className="w-8 h-8 stroke-[2.5]" />
        </div>
      </div>

      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
        LIQUID VECTOR MASK
      </span>
    </div>
  );
}
