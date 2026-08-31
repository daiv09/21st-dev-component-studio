"use client";

import React from "react";
import { motion } from "framer-motion";

export function FoldingCubeLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 select-none">
      <div className="relative w-12 h-12 rotate-45">
        {[0, 1, 2, 3].map((i) => {
          const rotations = [0, 90, 270, 180];
          return (
            <motion.div
              key={i}
              className="absolute w-6 h-6 bg-violet-600 dark:bg-violet-500 rounded-sm opacity-90 border border-white/20"
              style={{
                top: i < 2 ? 0 : "50%",
                left: i % 2 === 0 ? 0 : "50%",
                transformOrigin: "100% 100%",
              }}
              animate={{
                scale: [1, 0, 1],
                rotateX: [0, 180, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          );
        })}
      </div>
      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
        ASSEMBLING VOXELS
      </span>
    </div>
  );
}
