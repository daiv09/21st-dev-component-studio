"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function PerspectiveStepFlow() {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => (s >= 3 ? 1 : s + 1));

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="perspective-1000 flex items-center justify-between w-full p-3 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl">
        {[1, 2, 3].map((num) => {
          const isDone = num <= step;
          return (
            <motion.div
              key={num}
              onClick={() => setStep(num)}
              animate={{
                rotateY: isDone ? 0 : 35,
                scale: isDone ? 1.05 : 0.9,
                backgroundColor: isDone ? "#10b981" : "#18181b",
              }}
              transition={{ type: "spring", stiffness: 450, damping: 22 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-sm font-bold text-zinc-950 border border-zinc-700 cursor-pointer shadow-md"
            >
              {isDone ? <Check className="w-5 h-5 stroke-[3] text-zinc-950" /> : <span className="text-zinc-400">{num}</span>}
            </motion.div>
          );
        })}
      </div>
      <button
        onClick={next}
        className="text-[10px] font-mono font-bold text-emerald-500 uppercase hover:underline"
      >
        ADVANCE FLOW STEP ({step}/3)
      </button>
    </div>
  );
}
