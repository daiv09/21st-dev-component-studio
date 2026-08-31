"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function SvgTextStrokeDraw() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-pointer select-none shadow-xl w-full max-w-[280px]"
    >
      <svg className="w-full h-16" viewBox="0 0 300 60">
        <motion.text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="32"
          fontWeight="900"
          fontFamily="monospace"
          stroke="#10b981"
          strokeWidth="2"
          fill={isHovered ? "#10b981" : "transparent"}
          initial={{ strokeDasharray: 300, strokeDashoffset: 300 }}
          animate={{
            strokeDashoffset: isHovered ? 0 : [300, 0],
          }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          AWWWARDS
        </motion.text>
      </svg>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        HOVER TO FILL STROKE
      </span>
    </div>
  );
}
