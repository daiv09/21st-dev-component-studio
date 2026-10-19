"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, ArrowRight } from "lucide-react";

export function SpotlightSearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const sampleResults = [
    "Quantum Grid Engine",
    "Hypertext Decryption",
    "Split Flap Counter",
  ].filter((item) => item.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="w-full max-w-[280px] select-none flex flex-col gap-2">
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all shadow-md ${
          isFocused
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : "border-zinc-200 dark:border-zinc-800"
        }`}
      >
        <Search className="w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search suite components..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none font-mono"
        />
        <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-mono text-zinc-400">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFocused && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col gap-1"
          >
            {sampleResults.length === 0 ? (
              <span className="text-[11px] font-mono text-zinc-400 p-2">
                No matching components
              </span>
            ) : (
              sampleResults.map((res) => (
                <div
                  key={res}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <span>{res}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
