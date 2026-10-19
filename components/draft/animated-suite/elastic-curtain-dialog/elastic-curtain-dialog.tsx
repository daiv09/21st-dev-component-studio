"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";

export function ElasticCurtainDialog() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="relative w-full h-24 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex items-center justify-center p-3">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs font-bold shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>EXPAND PORTAL</span>
          </button>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="absolute inset-2 bg-emerald-500 text-zinc-950 rounded-xl p-2 flex items-center justify-between shadow-lg"
          >
            <span className="font-mono text-xs font-black">PORTAL ENGAGED</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md bg-zinc-950 text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
