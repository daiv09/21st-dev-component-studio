"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";

export function SvgMatrixKeypad() {
  const [pin, setPin] = useState("");

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    } else {
      setPin(num);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[220px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1">
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          SECURITY PIN
        </span>
        <span className="text-amber-400 font-extrabold">{pin.padEnd(4, "_")}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 w-full p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        {keys.map((k) => (
          <motion.button
            key={k}
            whileTap={{ scale: 0.88 }}
            onClick={() => handlePress(k)}
            className="h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-sm font-bold flex items-center justify-center hover:border-amber-400 transition-colors shadow-sm"
          >
            {k}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
