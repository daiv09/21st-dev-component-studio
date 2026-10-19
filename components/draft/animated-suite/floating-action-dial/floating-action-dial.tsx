"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Share2, Heart, Bookmark, MessageSquare } from "lucide-react";

interface FloatingActionDialProps {
  onAction?: (action: string) => void;
}

export function FloatingActionDial({ onAction }: FloatingActionDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: "like", icon: Heart, color: "bg-rose-500 text-white" },
    { id: "share", icon: Share2, color: "bg-indigo-500 text-white" },
    { id: "comment", icon: MessageSquare, color: "bg-emerald-500 text-white" },
    { id: "bookmark", icon: Bookmark, color: "bg-amber-500 text-white" },
  ];

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="relative flex items-center justify-center p-8 select-none">
      <AnimatePresence>
        {isOpen &&
          actions.map((act, index) => {
            // Fan out radially in arc
            const angle = (index / (actions.length - 1)) * 120 - 60; // -60deg to +60deg
            const rad = (angle * Math.PI) / 180;
            const distance = 56;
            const x = Math.sin(rad) * distance;
            const y = -Math.cos(rad) * distance;

            return (
              <motion.button
                key={act.id}
                initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                animate={{ scale: 1, x, y, opacity: 1 }}
                exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 22,
                  delay: index * 0.04,
                }}
                onClick={() => {
                  onAction?.(act.id);
                  setIsOpen(false);
                }}
                className={`absolute w-10 h-10 rounded-full ${act.color} shadow-md flex items-center justify-center border border-white/20 hover:scale-110 transition-transform`}
              >
                <act.icon className="w-4 h-4" />
              </motion.button>
            );
          })}
      </AnimatePresence>

      <motion.button
        onClick={toggle}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-10 w-12 h-12 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg border border-zinc-700 dark:border-zinc-300"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </motion.button>
    </div>
  );
}
