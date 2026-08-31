"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio } from "lucide-react";

interface PulseRadarButtonProps {
  label?: string;
  onPulse?: () => void;
}

export function PulseRadarButton({
  label = "EMIT BEACON",
  onPulse,
}: PulseRadarButtonProps) {
  const [pulses, setPulses] = useState<number[]>([]);

  const triggerPulse = () => {
    setPulses((prev) => [...prev.slice(-3), Date.now()]);
    onPulse?.();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 select-none">
      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {pulses.map((id) => (
            <motion.div
              key={id}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-rose-500 pointer-events-none"
            />
          ))}
        </AnimatePresence>

        <motion.button
          onClick={triggerPulse}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="relative z-10 px-5 py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs font-bold tracking-wider flex items-center gap-2.5 shadow-lg shadow-rose-500/25 transition-colors"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>{label}</span>
        </motion.button>
      </div>
    </div>
  );
}
