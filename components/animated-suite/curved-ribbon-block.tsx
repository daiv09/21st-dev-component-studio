"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export function CurvedRibbonBlock() {
  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="relative w-full h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center overflow-hidden">
        {/* SVG Ribbon Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 80">
          <motion.path
            d="M 10,40 Q 60,15 120,40 T 230,40"
            stroke="#6366f1"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                "M 10,40 Q 60,15 120,40 T 230,40",
                "M 10,40 Q 60,65 120,40 T 230,40",
                "M 10,40 Q 60,15 120,40 T 230,40",
              ],
            }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />
        </svg>

        <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 text-white border border-zinc-700 shadow-lg">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-xs font-bold">KINETIC RIBBON</span>
        </div>
      </div>
    </div>
  );
}
