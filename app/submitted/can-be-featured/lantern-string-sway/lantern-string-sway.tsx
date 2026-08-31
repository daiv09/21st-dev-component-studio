"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// A string of 7 paper lanterns hanging from a curved line. Each lantern
// sways with a phase offset. Hovering a lantern dims it and brightens the
// neighbors.
export default function LanternStringSway() {
    const N = 7;
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-indigo-100 to-rose-100 dark:from-indigo-950 dark:to-rose-950 overflow-hidden flex items-end justify-center pb-6">
            {/* the string */}
            <svg
                className="absolute top-0 left-0 w-full h-16"
                viewBox="0 0 700 60"
                preserveAspectRatio="none"
            >
                <path
                    d="M0,0 Q350,55 700,0"
                    fill="none"
                    stroke="currentColor"
                    className="text-neutral-700 dark:text-neutral-300"
                    strokeWidth={1.5}
                />
            </svg>

            <div className="flex items-end gap-2">
                {Array.from({ length: N }).map((_, i) => {
                    const colors = [
                        "from-rose-300 to-rose-500",
                        "from-amber-300 to-amber-500",
                        "from-emerald-300 to-emerald-500",
                        "from-sky-300 to-sky-500",
                        "from-violet-300 to-violet-500",
                        "from-pink-300 to-pink-500",
                        "from-teal-300 to-teal-500",
                    ];
                    const isHov = hovered === i;
                    return (
                        <motion.div
                            key={i}
                            className="origin-top"
                            style={{ width: 38, height: 64 }}
                            animate={{ rotate: [0, 6, -6, 0] }}
                            transition={{
                                duration: 3.2,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                            }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* string from top */}
                            <div className="mx-auto w-px h-4 bg-neutral-700 dark:bg-neutral-300" />
                            <motion.div
                                animate={{ opacity: isHov ? 0.3 : 1 }}
                                className={`w-full h-12 rounded-2xl bg-gradient-to-b ${colors[i]} shadow-md dark:shadow-lg`}
                                style={{
                                    boxShadow: isHov
                                        ? "0 0 0 transparent"
                                        : undefined,
                                }}
                            />
                            <motion.div
                                animate={{ opacity: isHov ? 0 : 0.7 }}
                                className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-amber-300"
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
