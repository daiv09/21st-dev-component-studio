"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crosshair } from "lucide-react";

export function CyberVectorCrosshair() {
  const [isLocked, setIsLocked] = useState(false);

  const toggleLock = () => setIsLocked(!isLocked);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Crosshair className="w-3.5 h-3.5 text-rose-500" />
        <span>STATUS: {isLocked ? "TARGET LOCKED" : "SCANNING..."}</span>
      </div>

      <div
        onClick={toggleLock}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden shadow-xl"
      >
        <svg className="w-full h-full p-2" viewBox="0 0 100 100">
          {/* Animated Reticle Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r={isLocked ? "22" : "34"}
            stroke={isLocked ? "#f43f5e" : "#34d399"}
            strokeWidth="2"
            fill="none"
            strokeDasharray="6 4"
            animate={{ rotate: isLocked ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ transformOrigin: "50px 50px" }}
          />

          {/* Corner Brackets */}
          <motion.path
            d="M 20,30 L 20,20 L 30,20 M 70,20 L 80,20 L 80,30 M 80,70 L 80,80 L 70,80 M 30,80 L 20,80 L 20,70"
            stroke={isLocked ? "#f43f5e" : "#71717a"}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ scale: isLocked ? 0.9 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{ transformOrigin: "50px 50px" }}
          />

          {/* Center Target Dot */}
          <circle cx="50" cy="50" r="3" fill={isLocked ? "#f43f5e" : "#34d399"} />
        </svg>
      </div>
    </div>
  );
}
