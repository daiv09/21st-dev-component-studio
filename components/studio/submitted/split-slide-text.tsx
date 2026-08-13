"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";

export interface SplitSlideTextProps {
    text?: string;
    className?: string;
}

export function SplitSlideText({
    text = "EXTREME",
    className = "",
}: SplitSlideTextProps) {
    const [triggerCount, setTriggerCount] = useState(0);
    const characters = text.split("");

    return (
        <div
            className={`relative flex flex-col items-center justify-center min-h-[400px] w-full 
      bg-zinc-50 text-zinc-900 
      transition-colors duration-500 overflow-hidden select-none rounded-2xl ${className}`}
        >
            {/* Background Light Pattern */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Main Container */}
            <div className="relative z-10 w-full px-4 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={triggerCount}
                        className="flex flex-wrap justify-center items-center w-full"
                    >
                        {characters.map((char, i) => (
                            <div
                                key={i}
                                className="relative px-[0.1vw] py-2 overflow-hidden cursor-default group"
                            >
                                {/* Invisible sizing anchor to preserve bounding box */}
                                <span className="opacity-0 text-[13vw] md:text-[10vw] leading-none font-black tracking-tighter">
                                    {char === " " ? "\u00A0" : char}
                                </span>

                                {/* Top Half - Slides in from Left */}
                                <motion.span
                                    initial={{ x: "-100%", opacity: 0 }}
                                    animate={{ x: "0%", opacity: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: i * 0.045,
                                        ease: [0.25, 1, 0.5, 1],
                                    }}
                                    className="absolute inset-0 text-[13vw] md:text-[10vw] leading-none font-black text-violet-600 tracking-tighter"
                                    style={{
                                        clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
                                    }}
                                >
                                    {char}
                                </motion.span>

                                {/* Bottom Half - Slides in from Right */}
                                <motion.span
                                    initial={{ x: "100%", opacity: 0 }}
                                    animate={{ x: "0%", opacity: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: i * 0.045 + 0.03,
                                        ease: [0.25, 1, 0.5, 1],
                                    }}
                                    className="absolute inset-0 text-[13vw] md:text-[10vw] leading-none font-black text-zinc-900 tracking-tighter"
                                    style={{
                                        clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
                                    }}
                                >
                                    {char}
                                </motion.span>

                                {/* Center Split Flash Line */}
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 1 }}
                                    animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.045 + 0.1,
                                    }}
                                    className="absolute top-1/2 left-0 right-0 h-[2px] bg-violet-500 z-20 pointer-events-none shadow-[0_0_10px_#8b5cf6]"
                                />
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Trigger Control */}
            <div className="mt-8 flex flex-col items-center gap-4 z-20">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTriggerCount((c) => c + 1)}
                    className="flex items-center gap-3 px-8 py-3.5 bg-zinc-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-mono text-xs font-bold tracking-widest uppercase cursor-pointer"
                >
                    <SlidersHorizontal className="w-4 h-4 text-violet-400" />
                    <span>CYCLE SPLIT</span>
                </motion.button>
            </div>
        </div>
    );
}

export default SplitSlideText;