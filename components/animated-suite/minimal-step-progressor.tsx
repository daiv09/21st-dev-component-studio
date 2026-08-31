"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = ["Request", "Verify", "Deploy", "Complete"];

export function MinimalStepProgressor() {
  const [currentStep, setCurrentStep] = useState(1);

  const next = () => {
    setCurrentStep((prev) => (prev >= STEPS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 select-none w-full max-w-[280px]">
      <div className="flex items-center justify-between w-full relative">
        {/* Background Connecting Line */}
        <div className="absolute top-4 inset-x-4 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-0" />
        {/* Active Line Fill */}
        <motion.div
          className="absolute top-4 left-4 h-0.5 bg-emerald-500 -z-0"
          animate={{
            width: `${(currentStep / (STEPS.length - 1)) * 80}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />

        {STEPS.map((stepLabel, idx) => {
          const isDone = idx <= currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={stepLabel}
              onClick={() => setCurrentStep(idx)}
              className="flex flex-col items-center gap-1.5 cursor-pointer z-10"
            >
              <motion.div
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  backgroundColor: isDone ? "#10b981" : "#e4e4e7",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shadow-sm ${
                  isDone
                    ? "text-zinc-950"
                    : "text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </motion.div>
              <span className="text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={next}
        className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-[11px] font-bold tracking-wider hover:opacity-90 transition-opacity"
      >
        ADVANCE STEP
      </button>
    </div>
  );
}
