"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface SpringPopTextProps {
    text?: string;
    className?: string;
}

export default function SpringPopText({
    text = "BOUNCE",
    className = "",
}: SpringPopTextProps) {
    const [triggerCount, setTriggerCount] = useState(0);
    const characters = text.split("");

    return (
        <div
            className={`relative flex flex-col items-center justify-center min-h-screen w-full 
      bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 
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
                                <motion.span
                                    initial={{
                                        opacity: 0,
                                        scale: 0.2,
                                        rotateY: 90,
                                        y: 40,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotateY: 0,
                                        y: 0,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 12,
                                        delay: i * 0.04,
                                    }}
                                    className="inline-block text-[14vw] leading-none font-black text-amber-500 dark:text-amber-400 tracking-tighter"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-12 flex flex-col items-center gap-4 z-20">
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setTriggerCount((c) => c + 1)}
                    className="flex items-center gap-3 px-8 py-3.5 bg-stone-900 dark:bg-stone-100 text-amber-400 dark:text-stone-950 rounded-full shadow-lg transition-all duration-300 font-mono text-xs font-bold tracking-widest uppercase"
                >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>TRIGGER ELASTIC</span>
                </motion.button>
            </div>
        </div>
    );
}