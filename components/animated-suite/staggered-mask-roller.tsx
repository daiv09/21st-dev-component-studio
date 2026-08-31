"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

const PHRASES = [
  "HIGH VELOCITY",
  "PRECISION CODE",
  "FLUID KINETICS",
  "SOLID PALETTE",
];

export function StaggeredMaskRoller() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % PHRASES.length);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span>VERTICAL MASK ROLLER</span>
        <span className="text-emerald-500">0{index + 1}/04</span>
      </div>

      <div
        onClick={next}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden px-4"
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={index}
            initial={{ y: 35, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -35, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="font-mono text-lg font-black text-emerald-400 tracking-wider text-center"
          >
            {PHRASES[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={next}
        className="flex items-center gap-1 text-[10px] font-mono font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>NEXT PHRASE</span>
      </button>
    </div>
  );
}
