"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, RotateCcw } from "lucide-react";

interface HapticStepperInputProps {
  initial?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (val: number) => void;
}

export function HapticStepperInput({
  initial = 1,
  min = 0,
  max = 99,
  step = 1,
  onChange,
}: HapticStepperInputProps) {
  const [val, setVal] = useState(initial);

  const increment = () => {
    if (val + step <= max) {
      const n = val + step;
      setVal(n);
      onChange?.(n);
    }
  };

  const decrement = () => {
    if (val - step >= min) {
      const n = val - step;
      setVal(n);
      onChange?.(n);
    }
  };

  const reset = () => {
    setVal(initial);
    onChange?.(initial);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center justify-between w-full max-w-[200px] text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400">
        <span>QUANTITY</span>
        <button
          onClick={reset}
          className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={decrement}
          disabled={val <= min}
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
        >
          <Minus className="w-4 h-4" />
        </motion.button>

        <div className="relative w-16 h-10 flex items-center justify-center overflow-hidden font-mono font-bold text-xl text-zinc-900 dark:text-zinc-100">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={val}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute"
            >
              {val < 10 ? `0${val}` : val}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={increment}
          disabled={val >= max}
          className="w-10 h-10 rounded-xl bg-sky-500 text-zinc-950 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-sky-400 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </motion.button>
      </div>
    </div>
  );
}
