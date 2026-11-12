"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Check, Terminal } from "lucide-react";

interface HoverTerminalProps {
  packageName?: string;
}

export default function HoverTerminal({
  packageName = "t-cli-manager",
}: HoverTerminalProps) {
  const [state, setState] = useState<"idle" | "hovered" | "copied">("idle");

  useEffect(() => {
    if (state === "copied") {
      const timer = setTimeout(() => setState("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `pip install ${packageName}`;

    try {
      // 1. Try modern Clipboard API first
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setState("copied");
      } else {
        throw new Error("Clipboard API not supported");
      }
    } catch (err) {
      // 2. Fallback for restricted iframes (like component previewers)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        // Move it off-screen so it's invisible
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        textArea.remove();

        if (successful) {
          setState("copied");
        } else {
          console.error("Fallback copy failed.");
        }
      } catch (fallbackErr) {
        console.error("Failed to copy!", fallbackErr);
      }
    }
  };

  return (
    <div className="min-h-[50vh] bg-neutral-50 dark:bg-[#0A0A0A] transition-colors duration-300 flex items-center justify-center p-4">
      <motion.button
        layout
        onClick={handleCopy}
        onHoverStart={() => state !== "copied" && setState("hovered")}
        onHoverEnd={() => state !== "copied" && setState("idle")}
        className={`
          relative flex items-center justify-center h-12 overflow-hidden 
          rounded-lg border font-mono text-sm shadow-sm
          transition-colors duration-300 focus:outline-none focus:ring-2 
          focus:ring-neutral-500/50 focus:ring-offset-2 
          focus:ring-offset-white dark:focus:ring-offset-[#0A0A0A]
          ${state === "hovered"
            ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
            : state === "copied"
              ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
          }
        `}
        animate={{
          width: state === "hovered" ? 350 : state === "copied" ? 140 : 140,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {/* --- State 1: Default --- */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
            >
              <Download size={16} className="text-neutral-400 dark:text-neutral-500" />
              <span className="font-medium tracking-wide">Install</span>
            </motion.div>
          )}

          {/* --- State 2: Terminal/Hover --- */}
          {state === "hovered" && (
            <motion.div
              key="hovered"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute flex items-center gap-3 px-4 w-full"
            >
              <Terminal size={14} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
              <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-300 overflow-hidden whitespace-nowrap">
                <span className="text-neutral-400 dark:text-neutral-500 select-none">~</span>
                <span className="whitespace-nowrap">pip install {packageName}</span>
                <motion.div
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="w-1.5 h-4 bg-neutral-800 dark:bg-neutral-400 shrink-0"
                />
              </div>
            </motion.div>
          )}

          {/* --- State 3: Copied --- */}
          {state === "copied" && (
            <motion.div
              key="copied"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
            >
              <Check size={16} />
              <span className="font-medium">Copied!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}