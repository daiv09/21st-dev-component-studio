"use client";

import React from "react";
import { motion } from "framer-motion";

// A single stingray SVG silhouette gliding across the card in a figure-8
// path. The tail trails behind. The "wings" flap slightly.
export default function StingrayGlide() {
    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-sky-200 to-cyan-400 dark:from-sky-900 dark:to-cyan-950 overflow-hidden">
            <motion.div
                className="absolute"
                initial={{ x: "20%", y: "50%" }}
                animate={{
                    x: ["20%", "80%", "20%"],
                    y: ["50%", "20%", "80%", "50%"],
                }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.svg
                    width={80}
                    height={50}
                    viewBox="0 0 80 50"
                    animate={{ scaleY: [1, 0.85, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* body */}
                    <path
                        d="M5 25 C 20 5 60 5 75 25 C 60 35 20 35 5 25 Z"
                        fill="#1e293b"
                    />
                    {/* tail */}
                    <motion.path
                        d="M5 25 Q -25 25 -45 30"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={2}
                        strokeLinecap="round"
                        animate={{
                            d: [
                                "M5 25 Q -25 25 -45 30",
                                "M5 25 Q -25 28 -45 26",
                                "M5 25 Q -25 22 -45 30",
                                "M5 25 Q -25 25 -45 30",
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {/* eye */}
                    <circle cx={62} cy={20} r={1.5} fill="#fef3c7" />
                </motion.svg>
            </motion.div>
        </div>
    );
}
