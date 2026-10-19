"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface TactilePushButtonProps {
  label?: string;
  onPush?: () => void;
}

export function TactilePushButton({
  label = "ENGAGE TURBO",
  onPush,
}: TactilePushButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
    onPush?.();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        ACTIVATIONS: <span className="text-amber-500">{count}</span>
      </div>

      <div className="relative p-2.5 bg-zinc-200 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-800 rounded-2xl shadow-inner">
        <motion.button
          type="button"
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onClick={handleClick}
          animate={{
            y: isPressed ? 4 : 0,
            scale: isPressed ? 0.98 : 1,
          }}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}
          className={`relative px-6 py-3.5 rounded-xl font-bold font-mono text-xs tracking-wider flex items-center gap-2.5 transition-colors border ${
            isPressed
              ? "bg-amber-500 text-zinc-950 border-amber-600 shadow-none"
              : "bg-amber-400 text-zinc-950 border-amber-300 shadow-[0_6px_0_#d97706] dark:bg-amber-500 dark:border-amber-400 dark:shadow-[0_6px_0_#b45309]"
          }`}
        >
          <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
          <span>{label}</span>
        </motion.button>
      </div>
    </div>
  );
}
