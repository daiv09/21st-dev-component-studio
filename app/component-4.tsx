"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronRight, Check } from "lucide-react";

export default function TerminalButton() {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset copy state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simulate copy action
    navigator.clipboard.writeText("npm install pkg_name");
    setCopied(true);
  };

  return (
    <div className="min-h-[50vh] bg-[#050505] flex items-center justify-center font-mono perspective-1000">
      <motion.button
        layout
        onClick={handleCopy}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className={`
            relative overflow-hidden rounded-xl border transition-all duration-500 ease-out group
            ${
              hovered
                ? "h-40 w-72 border-green-500/30 bg-black shadow-[0_0_40px_-10px_rgba(34,197,94,0.2)]"
                : "h-14 w-48 border-white/10 bg-neutral-900 shadow-none"
            }
        `}
      >
        {/* --- Background Texture (CRT Scanline) --- */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)",
            backgroundSize: "4px 4px",
          }}
        />

        <AnimatePresence mode="wait">
          {/* --- State 1: Default Button --- */}
          {!hovered && !copied && (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-gray-200"
            >
              <Download
                size={18}
                className="group-hover:text-green-400 transition-colors"
              />
              <span className="font-bold tracking-wider text-sm">INSTALL</span>
            </motion.div>
          )}

          {/* --- State 2: Terminal Mode (Hover) --- */}
          {hovered && !copied && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex flex-col p-4"
            >
              {/* Fake Terminal Header */}
              <div className="flex items-center gap-1.5 mb-4 opacity-50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>

              {/* Typing Animation */}
              <div className="flex flex-col gap-1 text-xs text-left">
                <div className="flex items-center gap-2 text-gray-500 font-bold">
                  <ChevronRight size={12} />
                  <span className="text-green-400/80">root@daiwiik:~</span>
                </div>

                <div className="flex items-center gap-1 pl-4 font-medium text-green-400">
                  <span className="opacity-50">$</span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{ duration: 0.8, ease: "linear", delay: 0.1 }}
                    className="overflow-hidden whitespace-nowrap block"
                  >
                    npm i pkg_name
                  </motion.span>
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-1.5 h-3  inline-block align-middle"
                  />
                </div>

                {/* Simulated "Click to Copy" hint appearing late */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest pl-4"
                >
                  [ Click to Copy ]
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* --- State 3: Success / Copied --- */}
          {copied && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-green-500/10 backdrop-blur-sm"
            >
              <div className="p-2 rounded-full text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)]">
                <Check size={24} strokeWidth={3} />
              </div>
              <span className="text-green-400 font-bold tracking-widest text-xs uppercase">
                Copied
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
