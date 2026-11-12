"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal } from "lucide-react";

interface MatrixTextProps {
    text?: string;
    className?: string;
}

export default function MatrixText({
    text = "daiv09",
    className = "",
}: MatrixTextProps) {
    const [triggerCount, setTriggerCount] = useState(0);
    const characters = text.split("");

    return (
        <div
            className={`relative flex flex-col items-center justify-center min-h-screen w-full 
      bg-slate-100 dark:bg-neutral-950 text-slate-900 dark:text-slate-100 
      transition-colors duration-500 overflow-hidden select-none ${className}`}
        >
            <div className="relative z-10 w-full px-4 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={triggerCount}
                        className="flex flex-wrap justify-center items-center w-full"
                    >
                        {characters.map((char, i) => (
                            <div
                                key={i}
                                className="relative px-[0.1vw] py-2 overflow-visible cursor-default"
                            >
                                {/* Core Base Text */}
                                <motion.span
                                    initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.05 + 0.2,
                                    }}
                                    className="inline-block text-[13vw] leading-none font-black text-slate-900 dark:text-white tracking-tight"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>

                                {/* Bright Red Laser Scan Curtain Overlay */}
                                <motion.span
                                    initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                                    animate={{
                                        clipPath: [
                                            "polygon(0 0, 100% 0, 100% 0, 0 0)",
                                            "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                                            "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
                                        ],
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        delay: i * 0.05,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute inset-0 text-[13vw] leading-none font-black text-red-600 dark:text-red-500 pointer-events-none z-10 py-2 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                                >
                                    {char}
                                </motion.span>

                                {/* Bright Red Scan Curtain Glow Edge Line */}
                                <motion.div
                                    initial={{ top: "0%", opacity: 0 }}
                                    animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 0.7,
                                        delay: i * 0.05,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute left-0 right-0 h-[3px] bg-red-500 shadow-[0_0_15px_#ef4444,0_0_30px_#dc2626] z-20 pointer-events-none"
                                />
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Control Button matching Red Accent */}
            <div className="absolute bottom-12 flex flex-col items-center gap-4 z-20">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTriggerCount((c) => c + 1)}
                    className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 dark:bg-red-600 text-white dark:text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all duration-300 font-mono text-xs font-bold tracking-widest uppercase"
                >
                    <Terminal className="w-4 h-4 text-red-500 dark:text-white" />
                    <span>re-Scan</span>
                </motion.button>
            </div>
        </div>
    );
}