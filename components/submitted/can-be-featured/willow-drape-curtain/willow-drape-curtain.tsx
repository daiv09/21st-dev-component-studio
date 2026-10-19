"use client";

import React from "react";
import { motion } from "framer-motion";

// Multiple thin vertical "willow" lines hanging from the top, each with
// small leaves at intervals. The branches sway in a wave.
export default function WillowDrapeCurtain() {
    const N = 14;
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-emerald-100 to-emerald-300 dark:from-emerald-950 dark:to-emerald-800 overflow-hidden">
            <div className="absolute inset-0 flex justify-around">
                {Array.from({ length: N }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-px bg-emerald-700 dark:bg-emerald-300 origin-top"
                        style={{ height: "85%" }}
                        animate={{ x: [0, 6, -4, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeInOut",
                        }}
                    >
                        {/* leaves */}
                        {Array.from({ length: 4 }).map((_, k) => (
                            <div
                                key={k}
                                className="absolute w-2 h-3 rounded-full bg-emerald-500 dark:bg-emerald-300 -left-1"
                                style={{ top: `${15 + k * 22}%` }}
                            />
                        ))}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
