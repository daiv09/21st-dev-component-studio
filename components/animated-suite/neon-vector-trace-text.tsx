"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function NeonVectorTraceText() {
  const [active, setActive] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Zap className="w-3.5 h-3.5 text-emerald-400" />
        <span>VECTOR TRACER BEACON</span>
      </div>

      <div
        onClick={() => setActive(!active)}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden p-2"
      >
        <svg className="w-full h-full" viewBox="0 0 240 70">
          <motion.text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="32"
            fontWeight="900"
            fontFamily="monospace"
            stroke="#10b981"
            strokeWidth="2"
            fill={active ? "#10b981" : "transparent"}
            strokeDasharray="8 6"
            animate={{ strokeDashoffset: active ? [0, -100] : 0 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            BEACON
          </motion.text>
        </svg>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO RUN TRACER</span>
    </div>
  );
}
