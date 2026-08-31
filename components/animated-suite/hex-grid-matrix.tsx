"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function HexGridMatrix() {
  const [activeHex, setActiveHex] = useState<number | null>(null);

  const hexes = Array.from({ length: 12 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        {hexes.map((_, i) => {
          const isActive = activeHex === i;
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setActiveHex(i)}
              onMouseLeave={() => setActiveHex(null)}
              animate={{
                scale: isActive ? 1.2 : 1,
                rotate: isActive ? 30 : 0,
                backgroundColor: isActive ? "#10b981" : "#27272a",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center border border-zinc-700 shadow-sm"
            />
          );
        })}
      </div>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
        HONEYCOMB MATRIX
      </span>
    </div>
  );
}
