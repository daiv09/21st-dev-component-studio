"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RefreshCw } from "lucide-react";

export function StaggeredListReveal() {
  const [items, setItems] = useState(["Deploy Micro-service", "Optimize Latency", "Verify Contracts"]);

  const reload = () => {
    setItems([]);
    setTimeout(() => {
      setItems(["Deploy Micro-service", "Optimize Latency", "Verify Contracts"]);
    }, 200);
  };

  return (
    <div className="w-full max-w-[260px] p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-500">
        <span>QUEUE ACTIONS</span>
        <button onClick={reload} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                delay: idx * 0.1,
              }}
              className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-emerald-500/50 transition-colors"
            >
              <span>{item}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
