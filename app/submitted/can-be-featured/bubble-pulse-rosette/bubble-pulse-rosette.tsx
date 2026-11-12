"use client";

import React from "react";
import { motion } from "framer-motion";

// 8 circles in a ring around a center; each pulses scale on a staggered
// spring timing. Hover scales the whole rosette.
export default function BubblePulseRosette() {
    const N = 8;
    const R = 90;

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden flex items-center justify-center">
            <motion.div
                className="relative"
                style={{ width: R * 2 + 40, height: R * 2 + 40 }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
                {/* center orb */}
                <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 dark:from-fuchsia-500 dark:to-pink-600"
                    style={{ width: 28, height: 28 }}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                {Array.from({ length: N }).map((_, i) => {
                    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(a) * R;
                    const y = Math.sin(a) * R;
                    const colors = [
                        "from-cyan-400 to-sky-500",
                        "from-violet-400 to-purple-500",
                        "from-pink-400 to-rose-500",
                        "from-amber-400 to-orange-500",
                        "from-emerald-400 to-teal-500",
                        "from-blue-400 to-indigo-500",
                        "from-fuchsia-400 to-pink-500",
                        "from-lime-400 to-green-500",
                    ];
                    return (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-gradient-to-br shadow-md dark:shadow-none"
                            style={{
                                left: `calc(50% + ${x}px - 14px)`,
                                top: `calc(50% + ${y}px - 14px)`,
                                width: 28,
                                height: 28,
                            }}
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{
                                duration: 1.6,
                                repeat: Infinity,
                                repeatType: "reverse",
                                delay: i * 0.18,
                                ease: "easeInOut",
                            }}
                        >
                            <div
                                className={`w-full h-full rounded-full bg-gradient-to-br ${colors[i % colors.length]}`}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
