"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck } from "lucide-react";

export function CyberDiagnosticHudBlock() {
  const [active, setActive] = useState(true);

  return (
    <div className="w-full max-w-[280px] p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex flex-col gap-2 select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>HUD TELEMETRY</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 font-bold">NODE-X</span>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
        <span>STABILITY</span>
        <span className="text-emerald-400 font-extrabold">99.8%</span>
      </div>

      {/* SVG Wave Line */}
      <div className="h-6 w-full flex items-center">
        <svg className="w-full h-full" viewBox="0 0 200 24">
          <motion.path
            d="M 0,12 L 40,12 L 50,4 L 60,20 L 70,12 L 120,12 L 130,2 L 140,22 L 150,12 L 200,12"
            stroke="#10b981"
            strokeWidth="2"
            fill="none"
            animate={{ x: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1 text-emerald-500">
          <ShieldCheck className="w-3 h-3" />
          SECURE
        </span>
        <span>LATENCY: 4ms</span>
      </div>
    </div>
  );
}
