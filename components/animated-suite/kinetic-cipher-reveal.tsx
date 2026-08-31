"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, RefreshCw } from "lucide-react";

const TARGET_WORD = "CYBERNETIC";
const GLYPHS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ#@$%&*";

export function KineticCipherReveal() {
  const [revealed, setRevealed] = useState(false);
  const [spinKey, setSpinKey] = useState(0);

  const trigger = () => {
    setRevealed(false);
    setSpinKey((k) => k + 1);
    setTimeout(() => setRevealed(true), 300);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center justify-between w-full text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
          CIPHER MATRIX
        </span>
        <span className={revealed ? "text-emerald-500 font-extrabold" : "text-amber-500"}>
          {revealed ? "DECRYPTED" : "LOCKED"}
        </span>
      </div>

      <div
        onClick={trigger}
        className="relative flex items-center justify-center gap-1 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl cursor-pointer overflow-hidden w-full"
      >
        {TARGET_WORD.split("").map((targetChar, idx) => {
          const randomChar1 = GLYPHS[(idx * 7 + spinKey * 3) % GLYPHS.length];
          const randomChar2 = GLYPHS[(idx * 11 + spinKey * 5) % GLYPHS.length];

          return (
            <div
              key={`${idx}-${spinKey}`}
              className="relative w-6 h-10 rounded-md bg-zinc-900 border border-zinc-800/80 flex items-center justify-center overflow-hidden font-mono text-sm font-black"
            >
              <motion.div
                initial={{ y: -40 }}
                animate={{ y: revealed ? 0 : [ -40, 20, -20, 0 ] }}
                transition={{
                  duration: 0.6 + idx * 0.08,
                  ease: [0.34, 1.56, 0.64, 1],
                  delay: idx * 0.04,
                }}
                className="flex flex-col items-center justify-center gap-2 text-emerald-400"
              >
                <span>{randomChar1}</span>
                <span>{randomChar2}</span>
                <span className="text-white font-extrabold">{targetChar}</span>
              </motion.div>
            </div>
          );
        })}
      </div>

      <button
        onClick={trigger}
        className="flex items-center gap-1 text-[10px] font-mono font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>RE-ENCRYPT & SPIN</span>
      </button>
    </div>
  );
}
