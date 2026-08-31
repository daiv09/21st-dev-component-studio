"use client";

import React from "react";
import { motion } from "framer-motion";

export function ScaffoldSkeletonLoader() {
  return (
    <div className="w-full max-w-[260px] p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3 select-none">
      {/* Top Banner Skeleton */}
      <div className="relative h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-16 bg-zinc-200/60 dark:bg-zinc-700/60"
          animate={{ x: ["-100%", "350%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      </div>

      {/* Title Line Skeleton */}
      <div className="relative h-4 w-3/4 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-12 bg-zinc-200/60 dark:bg-zinc-700/60"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.2 }}
        />
      </div>

      {/* Subtitle Line Skeleton */}
      <div className="relative h-3 w-1/2 rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-10 bg-zinc-200/60 dark:bg-zinc-700/60"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.4 }}
        />
      </div>
    </div>
  );
}
