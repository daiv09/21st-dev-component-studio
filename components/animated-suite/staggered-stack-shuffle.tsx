"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";

const CARDS = [
  { id: 1, title: "Alpha Studio", color: "bg-indigo-600 text-white" },
  { id: 2, title: "Beta Engine", color: "bg-emerald-500 text-zinc-950" },
  { id: 3, title: "Gamma Lattice", color: "bg-amber-400 text-zinc-950" },
];

export function StaggeredStackShuffle() {
  const [deck, setDeck] = useState(CARDS);

  const shuffle = () => {
    setDeck((prev) => [...prev.slice(1), prev[0]]);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div
        onClick={shuffle}
        className="relative w-56 h-28 flex items-center justify-center cursor-pointer"
      >
        <AnimatePresence>
          {deck.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ scale: 0.8, y: -20, opacity: 0 }}
              animate={{
                scale: 1 - idx * 0.06,
                y: idx * 8,
                rotate: (idx - 1) * 3,
                opacity: 1,
              }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`absolute inset-0 p-3 rounded-2xl ${item.color} shadow-lg border border-white/20 flex items-center justify-between`}
              style={{ zIndex: 10 - idx }}
            >
              <span className="font-mono text-xs font-bold">{item.title}</span>
              <Layers className="w-4 h-4 opacity-80" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <span className="text-[10px] font-mono text-zinc-400">CLICK TO SHUFFLE CARDS</span>
    </div>
  );
}
