"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function SplitFlapCounter() {
  const [val, setVal] = useState(7);

  const increment = () => {
    setVal((prev) => (prev + 1) % 10);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
        DEPARTURE GATE
      </div>

      <div
        onClick={increment}
        className="relative w-16 h-20 rounded-xl bg-zinc-900 border-2 border-zinc-700 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden"
      >
        {/* Split seam line */}
        <div className="absolute w-full h-0.5 bg-zinc-950 z-20 top-1/2 -translate-y-1/2" />

        <AnimatePresence mode="popLayout">
          <motion.div
            key={val}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="text-4xl font-mono font-black text-amber-400"
          >
            {val}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={increment}
        className="flex items-center gap-1 text-[11px] font-mono font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        <span>FLIP NEXT</span>
      </button>
    </div>
  );
}
