"use client";

import React from "react";
import { motion } from "framer-motion";

// A spiral of dots that "climbs" upward (each dot moves up and around a
// central axis). When it reaches the top, it fades and a new one appears.
export default function WaveBottleSpiral() {
    const N = 14;
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-sky-100 to-sky-300 dark:from-sky-950 dark:to-indigo-950 overflow-hidden flex items-center justify-center">
            <div className="relative w-40 h-64">
                {Array.from({ length: N }).map((_, i) => {
                    const delay = (i / N) * 4;
                    return (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full bg-cyan-500 dark:bg-cyan-300"
                            initial={{ y: 240, x: 80, opacity: 0 }}
                            animate={{
                                y: [240, 0],
                                x: [80, 60, 100, 60, 80],
                                opacity: [0, 1, 1, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay,
                                ease: "easeInOut",
                            }}
                        />
                    );
                })}
                {/* axis line */}
                <div className="absolute left-1/2 top-0 w-px h-full bg-cyan-300/40 dark:bg-cyan-300/30" />
            </div>
        </div>
    );
}
