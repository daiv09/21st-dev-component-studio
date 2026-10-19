"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export function SvgClockChronograph() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev + 1) % 60);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const secondAngle = (seconds / 60) * 360;

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Clock className="w-3.5 h-3.5 text-emerald-500" />
        <span>CHRONOGRAPH: {String(seconds).padStart(2, "0")}s</span>
      </div>

      <div className="relative w-32 h-32 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center shadow-xl overflow-hidden">
        {/* Tick marks */}
        <svg className="absolute inset-0 w-full h-full p-2 pointer-events-none" viewBox="0 0 100 100">
          {Array.from({ length: 12 }).map((_, i) => {
            const rot = i * 30;
            return (
              <line
                key={i}
                x1="50"
                y1="8"
                x2="50"
                y2="14"
                stroke="#52525b"
                strokeWidth="2"
                transform={`rotate(${rot} 50 50)`}
              />
            );
          })}
        </svg>

        {/* Sweeping Second Hand */}
        <motion.div
          animate={{ rotate: secondAngle }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-1 h-14 bg-emerald-500 rounded-full origin-bottom shadow-md"
          style={{ bottom: "16px" }}
        />

        <div className="absolute w-4 h-4 rounded-full bg-emerald-400 border-2 border-zinc-950" />
      </div>
    </div>
  );
}
