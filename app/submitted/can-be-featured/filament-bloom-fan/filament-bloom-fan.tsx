"use client";

import React from "react";
import { motion } from "framer-motion";

// 12 thin lines emanating from a center point (fan/sunburst). Each line's
// length pulses in and out on a staggered sine.
export default function FilamentBloomFan() {
    const N = 12;
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-rose-50 to-amber-50 dark:from-rose-950 dark:to-amber-950 overflow-hidden flex items-center justify-center">
            <div className="relative w-72 h-72">
                {Array.from({ length: N }).map((_, i) => {
                    const a = (i / N) * 360;
                    return (
                        <motion.div
                            key={i}
                            className="absolute left-1/2 top-1/2 w-1 origin-bottom bg-gradient-to-t from-rose-500 to-amber-400 dark:from-rose-300 dark:to-amber-200 rounded-full"
                            style={{
                                height: 120,
                                transform: `translate(-50%, -100%) rotate(${a}deg)`,
                            }}
                            animate={{ scaleY: [0.4, 1, 0.4] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.12,
                                ease: "easeInOut",
                            }}
                        />
                    );
                })}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 dark:bg-amber-300 shadow-lg" />
            </div>
        </div>
    );
}
