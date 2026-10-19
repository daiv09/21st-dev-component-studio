"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radar } from "lucide-react";

export function OrbitalRadarScanner() {
  const [blips, setBlips] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 30;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      setBlips((prev) => [...prev.slice(-4), { id: Date.now(), x, y }]);
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-500">
        <Radar className="w-4 h-4 animate-spin" />
        <span>SECTOR SCAN: ACTIVE</span>
      </div>

      <div className="relative w-32 h-32 rounded-full bg-zinc-900 border-2 border-emerald-500/40 flex items-center justify-center overflow-hidden shadow-md">
        {/* Concentric Grid Rings */}
        <div className="absolute w-24 h-24 rounded-full border border-emerald-500/20" />
        <div className="absolute w-14 h-14 rounded-full border border-emerald-500/20" />
        <div className="absolute w-full h-0.5 bg-emerald-500/20" />
        <div className="absolute h-full w-0.5 bg-emerald-500/20" />

        {/* Sweeping Radar Arm */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="w-1/2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] absolute top-1/2 left-1/2 origin-left" />
        </motion.div>

        {/* Target Blips */}
        {blips.map((blip) => (
          <motion.div
            key={blip.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            style={{ x: blip.x, y: blip.y }}
            className="absolute w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"
          />
        ))}
      </div>
    </div>
  );
}
