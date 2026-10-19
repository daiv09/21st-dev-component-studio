"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// 10 circles in a horizontal row that bob up and down. Each has a slight
// phase offset so the row "ripples." Click makes them all leap up and
// fall back via spring.
export default function CircleMarchBand() {
    const N = 10;
    const [leap, setLeap] = useState(0);

    return (
        <div
            onClick={() => setLeap((v) => v + 1)}
            className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden flex items-center justify-center cursor-pointer"
        >
            <div className="flex gap-3 items-end">
                {Array.from({ length: N }).map((_, i) => {
                    const colors = [
                        "bg-rose-400 dark:bg-rose-500",
                        "bg-orange-400 dark:bg-orange-500",
                        "bg-amber-400 dark:bg-amber-500",
                        "bg-lime-400 dark:bg-lime-500",
                        "bg-emerald-400 dark:bg-emerald-500",
                        "bg-cyan-400 dark:bg-cyan-500",
                        "bg-sky-400 dark:bg-sky-500",
                        "bg-blue-400 dark:bg-blue-500",
                        "bg-violet-400 dark:bg-violet-500",
                        "bg-fuchsia-400 dark:bg-fuchsia-500",
                    ];
                    return (
                        <motion.div
                            key={i}
                            className={`rounded-full ${colors[i]}`}
                            style={{ width: 24, height: 24 }}
                            animate={
                                leap > 0
                                    ? { y: [0, -60, 0] }
                                    : { y: [0, -8, 0] }
                            }
                            transition={{
                                duration: leap > 0 ? 0.7 : 1.2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: i * 0.08,
                                ease: leap > 0 ? "easeOut" : "easeInOut",
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
