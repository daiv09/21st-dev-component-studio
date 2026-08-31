"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function OrigamiLetterUnfold() {
  const [unfolded, setUnfolded] = useState(false);
  const WORD = "ORIGAMI";

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>3D FACETED UNFLATTEN</span>
      </div>

      <div
        onClick={() => setUnfolded(!unfolded)}
        className="perspective-1000 w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center gap-1.5 cursor-pointer overflow-hidden"
      >
        {WORD.split("").map((letter, i) => (
          <motion.div
            key={i}
            animate={{
              rotateX: unfolded ? 0 : (i % 2 === 0 ? 80 : -80),
              rotateY: unfolded ? 0 : (i % 2 === 0 ? 45 : -45),
              scale: unfolded ? 1 : 0.6,
              opacity: unfolded ? 1 : 0.5,
            }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 20,
              delay: i * 0.05,
            }}
            className="w-7 h-11 rounded-lg bg-amber-400 text-zinc-950 font-mono text-lg font-black flex items-center justify-center shadow-md transform-style-3d border border-amber-300"
          >
            {letter}
          </motion.div>
        ))}
      </div>
      <span className="text-[10px] font-mono text-zinc-500 uppercase">
        {unfolded ? "CLICK TO FOLD" : "CLICK TO UNFOLD"}
      </span>
    </div>
  );
}
