"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FlipClockDisplay() {
  const [time, setTime] = useState({ h: "10", m: "42", s: "00" });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime({
        h: String(now.getHours()).padStart(2, "0"),
        m: String(now.getMinutes()).padStart(2, "0"),
        s: String(now.getSeconds()).padStart(2, "0"),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderCard = (num: string, label: string) => (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-14 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center overflow-hidden shadow-md">
        <div className="absolute w-full h-0.5 bg-zinc-950 top-1/2 -translate-y-1/2" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={num}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="font-mono text-xl font-bold text-zinc-100"
          >
            {num}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl select-none">
      {renderCard(time.h, "HRS")}
      <span className="font-mono text-xl font-black text-zinc-600 animate-pulse pb-4">:</span>
      {renderCard(time.m, "MIN")}
      <span className="font-mono text-xl font-black text-zinc-600 animate-pulse pb-4">:</span>
      {renderCard(time.s, "SEC")}
    </div>
  );
}
