"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

interface KineticTextProps {
    text?: string;
    className?: string;
}

export default function KineticText({
    text = "KINETIC",
    className = "",
}: KineticTextProps) {
    const [triggerCount, setTriggerCount] = useState(0);
    const characters = text.split("");

    return (
        <div
            className={`relative flex flex-col items-center justify-center min-h-screen w-full 
      bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 
      transition-colors duration-500 overflow-hidden select-none ${className}`}
        >
            {/* Dynamic Grid Background */}
            <div
                className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: "clamp(24px, 4vw, 48px) clamp(24px, 4vw, 48px)",
                }}
            />

            {/* Radial Focus Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent dark:from-emerald-500/10 pointer-events-none" />

            {/* Main Typography Display */}
            <div className="relative z-10 w-full px-4 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={triggerCount}
                        className="flex flex-wrap justify-center items-center w-full perspective-1000"
                    >
                        {characters.map((char, i) => (
                            <div
                                key={i}
                                className="relative px-[0.15vw] overflow-hidden group cursor-default"
                            >
                                {/* 1. Base Core Typography */}
                                <motion.span
                                    initial={{
                                        opacity: 0,
                                        scale: 0.8,
                                        rotateX: -90,
                                        filter: "blur(12px)",
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotateX: 0,
                                        filter: "blur(0px)",
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        delay: i * 0.04 + 0.15,
                                        type: "spring",
                                        stiffness: 140,
                                        damping: 12,
                                    }}
                                    className="inline-block text-[14vw] leading-none font-black text-zinc-900 dark:text-white tracking-tighter"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>

                                {/* 2. Top Diagonal Light Slice Layer */}
                                <motion.span
                                    initial={{ x: "-120%", opacity: 0 }}
                                    animate={{
                                        x: ["-100%", "100%"],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 0.65,
                                        delay: i * 0.04,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="absolute inset-0 text-[14vw] leading-none font-black text-indigo-600 dark:text-emerald-400 pointer-events-none z-10"
                                    style={{
                                        clipPath: "polygon(0 0, 100% 0, 100% 48%, 0 52%)",
                                    }}
                                >
                                    {char}
                                </motion.span>

                                {/* 3. Bottom Diagonal Shadow/Accent Slice Layer */}
                                <motion.span
                                    initial={{ x: "120%", opacity: 0 }}
                                    animate={{
                                        x: ["100%", "-100%"],
                                        opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 0.65,
                                        delay: i * 0.04 + 0.08,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="absolute inset-0 text-[14vw] leading-none font-black text-indigo-400 dark:text-teal-300 pointer-events-none z-10"
                                    style={{
                                        clipPath: "polygon(0 52%, 100% 48%, 100% 100%, 0 100%)",
                                    }}
                                >
                                    {char}
                                </motion.span>

                                {/* 4. Horizontal Seam Line Accent */}
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{
                                        scaleX: [0, 1, 0],
                                        opacity: [0, 0.8, 0],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.04 + 0.1,
                                        ease: "easeInOut",
                                    }}
                                    className="absolute top-1/2 left-0 right-0 h-[2px] bg-indigo-500 dark:bg-emerald-400 -translate-y-1/2 z-20 pointer-events-none shadow-[0_0_8px_rgba(99,102,241,0.6)] dark:shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                />
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Interactive Trigger */}
            <div className="absolute bottom-12 flex flex-col items-center gap-4 z-20">
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setTriggerCount((c) => c + 1)}
                    className="group flex items-center gap-3 px-7 py-3.5 
          bg-zinc-900 dark:bg-zinc-100 
          text-zinc-100 dark:text-zinc-900 
          rounded-full shadow-lg hover:shadow-2xl 
          transition-all duration-300 border border-zinc-700/30 dark:border-zinc-300/30"
                >
                    <RefreshCw className="w-4 h-4 transition-transform duration-500 group-hover:rotate-180 text-indigo-400 dark:text-emerald-600" />
                    <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase">
                        RE-SHUTTER
                    </span>
                </motion.button>
            </div>
            <div className="absolute bottom-8 right-8 text-xs font-mono text-zinc-400 dark:text-zinc-600 tracking-widest">
                [ LIGHT // DARK ]
            </div>
        </div>
    );
}