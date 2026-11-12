"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GLITCH_CHARS = "01100101!@#$%^&*()_+-=[]{}|;:,.<>?/\\";
const SCRAMBLE_SPEED = 25; // Speed of character shuffle (ms)
const SCRAMBLE_TICKS = 12; // Total shuffle ticks before resolving
    
interface GlitchTextProps {
    text?: string;
    highlightWords?: string[];
    className?: string;
}

interface GlitchWordProps {
    word: string;
    isHighlightable: boolean;
    isParagraphFocused: boolean;
    onHoverStart: () => void;
    onHoverEnd: () => void;
}

const GlitchWord = ({
    word,
    isHighlightable,
    isParagraphFocused,
    onHoverStart,
    onHoverEnd,
}: GlitchWordProps) => {
    const [displayText, setDisplayText] = useState(word);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Per-character cipher scramble algorithm
    const triggerGlitchScramble = useCallback(() => {
        let tick = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            const scrambled = word
                .split("")
                .map((char, index) => {
                    if (char === " ") return " ";
                    // Resolve letters progressively from left to right
                    if (tick / (SCRAMBLE_TICKS / word.length) > index) return char;
                    return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
                })
                .join("");

            setDisplayText(scrambled);
            tick++;

            if (tick >= SCRAMBLE_TICKS) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setDisplayText(word);
            }
        }, SCRAMBLE_SPEED);
    }, [word]);

    const stopGlitchScramble = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(word);
    }, [word]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
        onHoverStart();
        triggerGlitchScramble();
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        onHoverEnd();
        stopGlitchScramble();
    };

    return (
        <motion.span
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative inline-block font-mono tracking-widest ${isHighlightable ? "cursor-pointer font-bold" : "cursor-default"
                }`}
            animate={{
                opacity: isParagraphFocused && !isHovered ? 0.35 : 1,
                filter: isParagraphFocused && !isHovered ? "blur(1px)" : "blur(0px)",
            }}
        >
            {/* GLITCH RGB RED LAYER SHIFT (Appears strictly on Hover) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        initial={{ opacity: 0, x: 0 }}
                        animate={{
                            opacity: [0, 0.9, 0.2, 0.8, 0],
                            x: [-2, 3, -4, 2, 0],
                            y: [1, -1, 2, 0],
                            skewX: [0, -12, 10, -5, 0],
                        }}
                        transition={{
                            duration: 0.3,
                            repeat: Infinity,
                            repeatType: "mirror",
                        }}
                        className="absolute top-0 left-0 text-red-500 pointer-events-none select-none z-0 opacity-80 mix-blend-screen dark:mix-blend-screen"
                    >
                        {displayText}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* GLITCH RGB CYAN LAYER SHIFT (Appears strictly on Hover) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.span
                        initial={{ opacity: 0, x: 0 }}
                        animate={{
                            opacity: [0, 0.8, 0.3, 0.9, 0],
                            x: [2, -3, 4, -1, 0],
                            y: [-1, 2, -1, 0],
                            skewX: [0, 15, -8, 6, 0],
                        }}
                        transition={{
                            duration: 0.25,
                            repeat: Infinity,
                            repeatType: "mirror",
                        }}
                        className="absolute top-0 left-0 text-cyan-400 pointer-events-none select-none z-0 opacity-80 mix-blend-screen dark:mix-blend-screen"
                    >
                        {displayText}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* CORE BASE TEXT LAYER */}
            <motion.span
                animate={
                    isHovered
                        ? {
                            scale: [1, 1.06, 0.98, 1.04, 1],
                            skewX: [0, -6, 8, -3, 0],
                        }
                        : { scale: 1, skewX: 0 }
                }
                transition={{ duration: 0.2, repeat: isHovered ? Infinity : 0 }}
                className={`relative z-10 block transition-colors duration-150 ${isHovered
                        ? "text-black dark:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        : isHighlightable
                            ? "text-neutral-950 dark:text-neutral-50 underline decoration-neutral-400/50 underline-offset-4"
                            : "text-neutral-700 dark:text-neutral-300"
                    }`}
            >
                {displayText}
            </motion.span>

            {/* SCANLINE / CRT GLITCH OVERLAY ON HOVER */}
            {isHovered && (
                <span className="absolute -inset-x-1 -inset-y-0.5 border-t border-b border-cyan-500/80 bg-cyan-500/10 dark:bg-cyan-950/40 z-20 pointer-events-none animate-pulse" />
            )}
        </motion.span>
    );
};

export default function GlitchText({
    text = "ENGINEERED WITH REACT, FRAMER MOTION, AND TAILWIND CSS FOR ULTRA SMOOTH PERFORMANCE.",
    highlightWords = ["REACT", "FRAMER", "TAILWIND", "PERFORMANCE"],
    className = "",
}: GlitchTextProps) {
    const [isParagraphHovered, setIsParagraphHovered] = useState(false);

    const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const words = text.split(" ");

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white dark:bg-black transition-colors duration-300">
            <div className="w-full max-w-3xl p-6 sm:p-8 font-mono select-none bg-white dark:bg-black rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl dark:shadow-neutral-900/30 relative overflow-hidden">
                {/* Subtle Scanline Texture (Adapts to Light & Dark) */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.05)_50%)] dark:bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.03)_50%)] bg-[length:100%_4px] pointer-events-none" />

                {/* Content Container */}
                <div
                    className={`relative z-10 flex flex-wrap gap-x-3 gap-y-2 leading-relaxed text-lg sm:text-xl ${className}`}
                >
                    {words.map((word, idx) => {
                        const isHighlightable = highlightWords.some(
                            (hw) => clean(hw) === clean(word)
                        );

                        return (
                            <GlitchWord
                                key={`${word}-${idx}`}
                                word={word}
                                isHighlightable={isHighlightable}
                                isParagraphFocused={isParagraphHovered}
                                onHoverStart={() => setIsParagraphHovered(true)}
                                onHoverEnd={() => setIsParagraphHovered(false)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}