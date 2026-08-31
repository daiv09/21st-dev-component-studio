"use client";

import React from "react";
import { motion } from "framer-motion";

// A Ferris wheel with 8 cars on a rotating octagon ring. Spins slowly with
// a soft pause at the top of each rotation.
export default function FerrisSpinSegmenter() {
    const N = 8;

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-sky-200 to-indigo-300 dark:from-slate-900 dark:to-indigo-950 overflow-hidden flex items-center justify-center">
            {/* stand */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-24 bg-neutral-700 dark:bg-neutral-300 -z-0" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-neutral-700 dark:bg-neutral-300 rounded-full -z-0" />

            <motion.div
                className="relative w-56 h-56"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* ring */}
                <div className="absolute inset-0 rounded-full border-2 border-neutral-800/40 dark:border-white/40" />
                {/* spokes */}
                {Array.from({ length: N }).map((_, i) => {
                    const a = (i / N) * Math.PI * 2;
                    return (
                        <div
                            key={i}
                            className="absolute left-1/2 top-1/2 w-px bg-neutral-800/40 dark:bg-white/40"
                            style={{
                                height: "50%",
                                transformOrigin: "top",
                                transform: `translate(-50%, 0) rotate(${(a * 180) / Math.PI}deg)`,
                            }}
                        />
                    );
                })}
                {/* cars */}
                {Array.from({ length: N }).map((_, i) => {
                    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
                    const r = 90;
                    const x = Math.cos(a) * r;
                    const y = Math.sin(a) * r;
                    return (
                        <div
                            key={`c${i}`}
                            className="absolute"
                            style={{
                                left: `calc(50% + ${x}px - 14px)`,
                                top: `calc(50% + ${y}px - 10px)`,
                            }}
                        >
                            <motion.div
                                className="w-7 h-5 rounded-md bg-rose-400 dark:bg-rose-500 shadow-md"
                                animate={{ rotate: [0, -360] }}
                                transition={{
                                    duration: 14,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <div className="w-2 h-2 mx-auto mt-0.5 rounded-full bg-amber-200 animate-pulse" />
                            </motion.div>
                        </div>
                    );
                })}
                {/* center hub */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-500 dark:bg-amber-300 z-10" />
            </motion.div>
        </div>
    );
}
