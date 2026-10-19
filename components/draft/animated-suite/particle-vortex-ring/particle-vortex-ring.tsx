"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export function ParticleVortexRing() {
  const [isFast, setIsFast] = useState(false);
  const particles = Array.from({ length: 12 });

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div
        onMouseEnter={() => setIsFast(true)}
        onMouseLeave={() => setIsFast(false)}
        className="relative w-28 h-28 flex items-center justify-center cursor-pointer"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: isFast ? 1.5 : 6,
            ease: "linear",
          }}
          className="absolute inset-0"
        >
          {particles.map((_, i) => {
            const angle = (i / particles.length) * 360;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 w-0 h-0"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full -translate-y-12 -translate-x-1/2 shadow-sm transition-colors ${
                    isFast ? "bg-emerald-400" : "bg-indigo-500"
                  }`}
                />
              </div>
            );
          })}
        </motion.div>

        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-md">
          {isFast ? "BOOST" : "VORTEX"}
        </div>
      </div>
    </div>
  );
}
