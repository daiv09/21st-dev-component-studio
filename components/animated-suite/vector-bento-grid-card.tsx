"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp } from "lucide-react";

export function VectorBentoGridCard() {
  return (
    <div className="w-full max-w-[280px] p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500 text-zinc-950 shadow-sm">
            <Activity className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            System Throughput
          </span>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500">
          <TrendingUp className="w-3 h-3" />
          +24%
        </span>
      </div>

      {/* SVG Vector Sparkline Chart */}
      <div className="h-14 w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-2 border border-zinc-200 dark:border-zinc-800 flex items-center">
        <svg className="w-full h-full" viewBox="0 0 200 40">
          <motion.path
            d="M 0,35 Q 40,10 80,30 T 160,15 T 200,5"
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  );
}
