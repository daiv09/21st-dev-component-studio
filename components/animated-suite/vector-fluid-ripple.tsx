"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function VectorFluidRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev.slice(-3), { id: Date.now(), x, y }]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        onClick={addRipple}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden shadow-xl"
      >
        <span className="text-[10px] font-mono font-bold text-zinc-500 z-10 pointer-events-none">
          CLICK FOR RIPPLE
        </span>

        <AnimatePresence>
          {ripples.map((r) => (
            <motion.div
              key={r.id}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ left: r.x - 20, top: r.y - 20 }}
              className="absolute w-10 h-10 rounded-full border-2 border-emerald-400 pointer-events-none"
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
