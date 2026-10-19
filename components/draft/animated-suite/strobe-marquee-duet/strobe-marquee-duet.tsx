"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function StrobeMarqueeDuet() {
  const [fast, setFast] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span>DUAL COUNTER-MARQUEE</span>
      </div>

      <div
        onMouseEnter={() => setFast(true)}
        onMouseLeave={() => setFast(false)}
        className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl p-3 flex flex-col gap-2 overflow-hidden cursor-pointer"
      >
        {/* Top Track -> Left */}
        <div className="flex overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: fast ? 2.5 : 8,
              ease: "linear",
            }}
            className="flex items-center gap-4 whitespace-nowrap font-mono text-xs font-black text-amber-400"
          >
            <span>★ HYPERTEXT ENGINE ★ AWWWARDS WINNING ★ VECTOR MOTION</span>
            <span>★ HYPERTEXT ENGINE ★ AWWWARDS WINNING ★ VECTOR MOTION</span>
          </motion.div>
        </div>

        {/* Bottom Track -> Right */}
        <div className="flex overflow-hidden">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              repeat: Infinity,
              duration: fast ? 2.5 : 8,
              ease: "linear",
            }}
            className="flex items-center gap-4 whitespace-nowrap font-mono text-xs font-black text-indigo-400"
          >
            <span>◆ NEXT-GEN KINETICS ◆ SOLID COLOR AESTHETICS ◆ ZERO GRADIENTS</span>
            <span>◆ NEXT-GEN KINETICS ◆ SOLID COLOR AESTHETICS ◆ ZERO GRADIENTS</span>
          </motion.div>
        </div>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO BOOST VELOCITY</span>
    </div>
  );
}
