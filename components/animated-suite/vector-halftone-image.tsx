"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function VectorHalftoneImage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const dots = Array.from({ length: 36 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="grid grid-cols-6 gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        {dots.map((_, i) => {
          const isHovered = activeIdx === i;
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              animate={{
                scale: isHovered ? 1.8 : 1,
                backgroundColor: isHovered ? "#38bdf8" : "#3f3f46",
              }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className="w-4 h-4 rounded-full cursor-pointer"
            />
          );
        })}
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        HALFTONE VECTOR MATRIX
      </span>
    </div>
  );
}
