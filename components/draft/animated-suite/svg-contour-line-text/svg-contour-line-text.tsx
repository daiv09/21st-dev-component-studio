"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function SvgContourLineText() {
  const [active, setActive] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Compass className="w-3.5 h-3.5 text-sky-400" />
        <span>TOPOGRAPHIC CONTOUR DRAW</span>
      </div>

      <div
        onClick={() => setActive(!active)}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex items-center justify-center cursor-pointer overflow-hidden p-2"
      >
        <svg className="w-full h-full" viewBox="0 0 240 70">
          {/* Background topographic lines */}
          <path
            d="M 10,20 Q 60,5 120,20 T 230,20 M 10,35 Q 60,20 120,35 T 230,35 M 10,50 Q 60,35 120,50 T 230,50"
            stroke="#27272a"
            strokeWidth="1"
            fill="none"
          />

          {/* Contour Typography Stroke */}
          <motion.text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="28"
            fontWeight="900"
            fontFamily="monospace"
            stroke="#38bdf8"
            strokeWidth="2"
            fill={active ? "#38bdf8" : "transparent"}
            strokeDasharray="4 2"
            animate={{ strokeDashoffset: active ? [0, 40] : 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            TERRAIN
          </motion.text>
        </svg>
      </div>
      <span className="text-[10px] font-mono text-zinc-500">HOVER TO ENERGIZE CONTOUR</span>
    </div>
  );
}
