"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function SplitCharacter3dFlip() {
  const [isFlipped, setIsFlipped] = useState(false);
  const word = "KINETIC";

  return (
    <div
      onClick={() => setIsFlipped(!isFlipped)}
      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-3 cursor-pointer select-none shadow-md"
    >
      <div className="flex items-center gap-1">
        {word.split("").map((char, idx) => (
          <motion.div
            key={idx}
            animate={{ rotateY: isFlipped ? 360 : 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: idx * 0.06,
            }}
            className="w-8 h-10 rounded-lg bg-zinc-900 text-amber-400 font-mono text-xl font-extrabold flex items-center justify-center shadow-sm border border-zinc-700"
          >
            {char}
          </motion.div>
        ))}
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
        CLICK TO TUMBLE FLIP
      </span>
    </div>
  );
}
