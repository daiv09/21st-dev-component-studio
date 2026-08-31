"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface DynamicRingGaugeProps {
  initialScore?: number; // 0-100
  title?: string;
}

export function DynamicRingGauge({
  initialScore = 82,
  title = "HEALTH SCORE",
}: DynamicRingGaugeProps) {
  const [score, setScore] = useState(initialScore);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const randomize = () => {
    setScore(Math.floor(Math.random() * 40) + 60);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Activity className="w-3.5 h-3.5 text-indigo-500" />
        <span>{title}</span>
      </div>

      <div
        onClick={randomize}
        className="relative w-28 h-28 flex items-center justify-center cursor-pointer group"
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 90 90">
          {/* Background Ring */}
          <circle
            cx="45"
            cy="45"
            r={radius}
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Animated Foreground Arc */}
          <motion.circle
            cx="45"
            cy="45"
            r={radius}
            className="stroke-indigo-600 dark:stroke-indigo-500"
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-xl font-mono font-black text-zinc-900 dark:text-zinc-100 group-hover:scale-110 transition-transform">
            {score}
          </span>
          <span className="text-[9px] font-mono font-bold text-zinc-400">/ 100</span>
        </div>
      </div>
    </div>
  );
}
