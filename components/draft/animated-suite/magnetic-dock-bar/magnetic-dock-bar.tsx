"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Home, Compass, MessageSquare, Settings, Bell } from "lucide-react";

export function MagneticDockBar() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const items = [
    { icon: Home, label: "Home", color: "bg-indigo-500 text-white" },
    { icon: Compass, label: "Explore", color: "bg-emerald-500 text-zinc-950" },
    { icon: MessageSquare, label: "Chat", color: "bg-sky-500 text-white" },
    { icon: Bell, label: "Alerts", color: "bg-amber-500 text-zinc-950" },
    { icon: Settings, label: "Config", color: "bg-zinc-800 text-white" },
  ];

  return (
    <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl select-none">
      {items.map((item, idx) => {
        const isHovered = hoveredIdx === idx;
        const isNeighbor = hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 1;

        const scale = isHovered ? 1.25 : isNeighbor ? 1.1 : 1;
        const y = isHovered ? -8 : isNeighbor ? -4 : 0;

        return (
          <motion.div
            key={item.label}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            animate={{ scale, y }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center cursor-pointer shadow-md`}
          >
            <item.icon className="w-5 h-5" />
          </motion.div>
        );
      })}
    </div>
  );
}
