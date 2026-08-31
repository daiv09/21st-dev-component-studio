"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Bell } from "lucide-react";

export function KineticFeedbackToast() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white font-mono text-xs font-bold"
        >
          <Bell className="w-4 h-4 text-emerald-400" />
          <span>TRIGGER TOAST</span>
        </button>
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="relative w-full p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-zinc-950 shadow-sm">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">Action Completed</span>
                <span className="text-[10px] font-mono text-zinc-400">Deployed to production</span>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Countdown line */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-emerald-500"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 4, ease: "linear" }}
              onAnimationComplete={() => setIsVisible(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
