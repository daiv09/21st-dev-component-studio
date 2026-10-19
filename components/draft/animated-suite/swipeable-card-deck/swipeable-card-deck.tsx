"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

const INITIAL_DECK = [
  { id: 1, title: "Kinetic Motion 1", tag: "SWIPE ME" },
  { id: 2, title: "Fluid Physics 2", tag: "SWIPE ME" },
  { id: 3, title: "Quantum Optics 3", tag: "SWIPE ME" },
];

export function SwipeableCardDeck() {
  const [deck, setDeck] = useState(INITIAL_DECK);

  const removeTop = () => {
    setDeck((prev) => prev.slice(1));
  };

  const reset = () => {
    setDeck(INITIAL_DECK);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="relative w-56 h-36 flex items-center justify-center">
        {deck.length === 0 ? (
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white font-mono text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RESET DECK</span>
          </button>
        ) : (
          <AnimatePresence>
            {deck.map((card, idx) => {
              const isTop = idx === 0;
              return (
                <motion.div
                  key={card.id}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 100) {
                      removeTop();
                    }
                  }}
                  animate={{
                    scale: 1 - idx * 0.05,
                    y: idx * 8,
                  }}
                  exit={{ x: 200, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`absolute inset-0 p-4 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col justify-between ${
                    isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
                  }`}
                  style={{ zIndex: deck.length - idx }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {card.title}
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    DRAG LEFT / RIGHT TO DISMISS
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
