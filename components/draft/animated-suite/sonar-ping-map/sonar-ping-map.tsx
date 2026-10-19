"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "lucide-react";

export function SonarPingMap() {
  const [pins, setPins] = useState<{ id: number; x: number; y: number }[]>([
    { id: 1, x: 20, y: -15 },
    { id: 2, x: -30, y: 25 },
  ]);

  const addPin = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPins((prev) => [...prev.slice(-3), { id: Date.now(), x, y }]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-500">
        <Navigation className="w-3.5 h-3.5" />
        <span>TARGET GRID: {pins.length} PINNED</span>
      </div>

      <div
        onClick={addPin}
        className="relative w-32 h-32 rounded-2xl bg-zinc-950 border border-sky-500/30 flex items-center justify-center cursor-crosshair overflow-hidden shadow-lg"
      >
        {/* Grid lines */}
        <div className="absolute w-full h-0.5 bg-sky-500/20" />
        <div className="absolute h-full w-0.5 bg-sky-500/20" />

        {/* Sonar Pulse Ring */}
        <motion.div
          animate={{ scale: [0.2, 2.5], opacity: [0.8, 0] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
          className="absolute w-12 h-12 rounded-full border border-sky-400 pointer-events-none"
        />

        {/* Pinned Coordinates */}
        <AnimatePresence>
          {pins.map((pin) => (
            <motion.div
              key={pin.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{ x: pin.x, y: pin.y }}
              className="absolute w-3 h-3 rounded-full bg-sky-400 border border-white shadow-[0_0_8px_#38bdf8]"
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
