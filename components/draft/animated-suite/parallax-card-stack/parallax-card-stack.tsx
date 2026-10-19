"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";

export function ParallaxCardStack() {
  const [isHovered, setIsHovered] = useState(false);

  const cards = [
    { id: 1, title: "Card Alpha", color: "bg-indigo-600 text-white" },
    { id: 2, title: "Card Beta", color: "bg-emerald-500 text-zinc-950" },
    { id: 3, title: "Card Gamma", color: "bg-amber-400 text-zinc-950" },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-64 h-36 flex items-center justify-center cursor-pointer select-none"
    >
      {cards.map((card, idx) => {
        const offset = idx * 8;
        const hoverOffset = idx * 24 - 24;

        return (
          <motion.div
            key={card.id}
            animate={{
              y: isHovered ? hoverOffset : -offset,
              rotate: isHovered ? (idx - 1) * 6 : 0,
              scale: isHovered ? 1 : 1 - idx * 0.04,
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`absolute inset-0 p-4 rounded-2xl ${card.color} border border-white/20 shadow-lg flex flex-col justify-between`}
            style={{ zIndex: 10 - idx }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase">{card.title}</span>
              <Layers className="w-4 h-4 opacity-80" />
            </div>
            <span className="text-[10px] font-mono opacity-70">HOVER TO UNSTACK</span>
          </motion.div>
        );
      })}
    </div>
  );
}
