"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TextShimmerBadgeProps {
  label?: string;
}

export function TextShimmerBadge({ label = "FEATURED EDITION 2.0" }: TextShimmerBadgeProps) {
  return (
    <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 border border-zinc-700 dark:border-zinc-300 font-mono text-xs font-bold tracking-wider overflow-hidden shadow-md select-none">
      <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
      <span>{label}</span>

      {/* Solid Light Sweep Bar */}
      <motion.div
        className="absolute inset-y-0 w-12 bg-white/40 dark:bg-zinc-950/30"
        animate={{ x: ["-100%", "300%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      />
    </div>
  );
}
