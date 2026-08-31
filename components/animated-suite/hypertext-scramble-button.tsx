"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, ShieldCheck } from "lucide-react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";

interface HypertextScrambleButtonProps {
  label?: string;
  onSuccess?: () => void;
}

export function HypertextScrambleButton({
  label = "AUTHENTICATE",
  onSuccess,
}: HypertextScrambleButtonProps) {
  const [displayText, setDisplayText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && !isDone) {
      let iteration = 0;
      interval = setInterval(() => {
        setDisplayText(
          label
            .split("")
            .map((char, index) => {
              if (index < iteration) return label[index];
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= label.length) {
          clearInterval(interval);
        }
        iteration += 1 / 2;
      }, 30);
    } else {
      setDisplayText(label);
    }
    return () => clearInterval(interval);
  }, [isHovered, label, isDone]);

  const handleClick = () => {
    setIsDone(true);
    setDisplayText("ACCESS GRANTED");
    onSuccess?.();
    setTimeout(() => {
      setIsDone(false);
      setDisplayText(label);
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-2 select-none">
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className={`px-6 py-3 rounded-xl border font-mono text-xs font-bold tracking-widest flex items-center gap-3 transition-colors duration-200 shadow-md ${
          isDone
            ? "bg-emerald-500 text-zinc-950 border-emerald-400"
            : "bg-zinc-900 text-emerald-400 border-emerald-500/40 dark:bg-zinc-950 dark:border-emerald-500/50 hover:bg-zinc-800"
        }`}
      >
        {isDone ? (
          <ShieldCheck className="w-4 h-4 text-zinc-950" />
        ) : (
          <Terminal className="w-4 h-4 text-emerald-400" />
        )}
        <span>{displayText}</span>
      </motion.button>
    </div>
  );
}
