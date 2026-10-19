"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Folder } from "lucide-react";

export function OrigamiAccordionBlock() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-[280px] rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden select-none">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-900 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500 text-zinc-950">
            <Folder className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-zinc-100">Foldable Vault</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/80 text-xs text-zinc-400 space-y-1.5"
          >
            <div className="p-2 rounded-lg bg-zinc-900 text-[11px] font-mono">
              <p className="text-emerald-400">✔ Zero Gradients Enforced</p>
              <p className="text-zinc-300">✔ Light & Dark Theme Dual Sync</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
