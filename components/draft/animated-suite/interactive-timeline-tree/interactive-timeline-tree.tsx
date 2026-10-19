"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export function InteractiveTimelineTree() {
  const [completed, setCompleted] = useState<number[]>([1, 2]);

  const nodes = [
    { id: 1, title: "v1.0 Release", date: "Q1 2026" },
    { id: 2, title: "Kinetic Engine", date: "Q2 2026" },
    { id: 3, title: "48 Components", date: "Q3 2026" },
  ];

  const toggle = (id: number) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-[240px] p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col gap-3 select-none">
      <div className="relative pl-6 flex flex-col gap-4">
        {/* Connecting Vertical Line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

        {nodes.map((n) => {
          const isDone = completed.includes(n.id);
          return (
            <div
              key={n.id}
              onClick={() => toggle(n.id)}
              className="relative flex items-start gap-3 cursor-pointer group"
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                className="absolute -left-6 top-0.5 bg-white dark:bg-zinc-900"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                )}
              </motion.div>

              <div>
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
                  {n.title}
                </h5>
                <span className="text-[10px] font-mono text-zinc-400">{n.date}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
