"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { Sparkles, Terminal, RefreshCw, Layers, Zap, Radio, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

// Cryptographic / Alien character pool for the cipher decryptor effect
const CIPHER_GLYPHS = "010189ABCDEFΣΨΩΞλµ§#><_*/![]{}=";

const DEFAULT_WORDS = [
    "IMMERSE",
    "KINETIC",
    "QUANTUM",
    "SYNAPSE",
    "FRACTURE",
    "TOPOLOGY",
];

interface KineticCipherHeroProps {
    initialText?: string;
    className?: string;
}

type GlitchMode = "SLICE_DISPLACE" | "CIPHER_DECRYPT" | "RGB_ABERRATION" | "ECHO_CASCADE";

export default function KineticCipherHero({
    initialText = "IMMERSE",
    className = "",
}: KineticCipherHeroProps) {
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [displayText, setDisplayText] = useState(initialText);
    const [glitchMode, setGlitchMode] = useState<GlitchMode>("SLICE_DISPLACE");
    const [isScrambling, setIsScrambling] = useState(false);
    const [cycleCount, setCycleCount] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);

    // Smooth mouse coordinates for parallax slice shearing
    const mouseX = useSpring(0, { stiffness: 220, damping: 24 });
    const mouseY = useSpring(0, { stiffness: 220, damping: 24 });

    // Cryptographic Decryption / Scramble Animation Loop
    const triggerCipherScramble = useCallback((targetText: string) => {
        setIsScrambling(true);
        let iteration = 0;
        const maxIterations = targetText.length * 3;

        const interval = setInterval(() => {
            setDisplayText(() =>
                targetText
                    .split("")
                    .map((letter, idx) => {
                        if (letter === " ") return " ";
                        if (idx < iteration / 3) {
                            return targetText[idx];
                        }
                        return CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
                    })
                    .join("")
            );

            iteration += 1;
            if (iteration > maxIterations) {
                clearInterval(interval);
                setDisplayText(targetText);
                setIsScrambling(false);
            }
        }, 32);
    }, []);

    // Cycle to next word or re-trigger effect
    const cycleNextWord = () => {
        const nextIdx = (currentWordIdx + 1) % DEFAULT_WORDS.length;
        setCurrentWordIdx(nextIdx);
        setCycleCount((c) => c + 1);
        triggerCipherScramble(DEFAULT_WORDS[nextIdx]);
    };

    // Mouse Parallax Shearing
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        mouseX.set(normX * 18);
        mouseY.set(normY * 18);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const chars = displayText.split("");

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative flex h-screen w-full select-none flex-col justify-between overflow-hidden bg-neutral-50 p-6 transition-colors duration-700 md:p-12 dark:bg-[#040508]",
                className
            )}
        >
            {/* Background Architectural Grid */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: "clamp(24px, 4vw, 54px) clamp(24px, 4vw, 54px)",
                }}
            />

            {/* Top Telemetry Header Bar */}
            <header className="relative z-20 flex w-full flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">

                {/* Interactive Mode Selectors */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-neutral-300/80 bg-white/70 p-1 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70">
                        {(
                            [
                                "SLICE_DISPLACE",
                                "CIPHER_DECRYPT",
                                "RGB_ABERRATION",
                                "ECHO_CASCADE",
                            ] as GlitchMode[]
                        ).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => {
                                    setGlitchMode(mode);
                                    setCycleCount((c) => c + 1);
                                }}
                                className={cn(
                                    "rounded-lg px-2.5 py-1 text-[10px] font-medium tracking-wider transition-all",
                                    glitchMode === mode
                                        ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black"
                                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                )}
                            >
                                {mode.replace("_", " ")}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={cycleNextWord}
                        className="flex items-center gap-1.5 rounded-lg border border-neutral-300/80 bg-white/70 px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider uppercase transition-all backdrop-blur-md hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                        <RefreshCw className={cn("size-3", isScrambling && "animate-spin")} />
                        <span>MUTATE</span>
                    </button>
                </div>
            </header>

            {/* Center Kinetic Typography Stage */}
            <main className="relative z-10 my-auto flex w-full flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={cycleCount}
                        className="group relative flex flex-wrap items-center justify-center leading-none"
                    >
                        {chars.map((char, i) => (
                            <div
                                key={`${char}-${i}`}
                                className="relative cursor-pointer px-[0.15vw] overflow-visible"
                                onClick={cycleNextWord}
                            >
                                {/* 1. Core Base Typography Layer */}
                                <motion.span
                                    initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    transition={{
                                        delay: i * 0.035,
                                        duration: 0.65,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="block text-[14vw] font-black tracking-tighter text-neutral-950 uppercase dark:text-white"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>

                                {/* 2. Mode: SLICE_DISPLACE (Multi-Horizontal Shear Bands) */}
                                {glitchMode === "SLICE_DISPLACE" && (
                                    <>
                                        {/* Top 33% Horizontal Shutter */}
                                        <motion.span
                                            initial={{ x: "-110%", opacity: 0 }}
                                            animate={{ x: ["-100%", "0%", "100%"], opacity: [0, 1, 0] }}
                                            transition={{
                                                duration: 0.65,
                                                delay: i * 0.03,
                                                ease: "easeInOut",
                                            }}
                                            className="pointer-events-none absolute inset-0 text-[14vw] font-black tracking-tighter text-neutral-400 select-none dark:text-neutral-500"
                                            style={{
                                                clipPath: "polygon(0 0, 100% 0, 100% 33%, 0 33%)",
                                            }}
                                        >
                                            {char}
                                        </motion.span>

                                        {/* Middle 33-66% Inverse Horizontal Shutter */}
                                        <motion.span
                                            initial={{ x: "110%", opacity: 0 }}
                                            animate={{ x: ["100%", "0%", "-100%"], opacity: [0, 1, 0] }}
                                            transition={{
                                                duration: 0.65,
                                                delay: i * 0.03 + 0.08,
                                                ease: "easeInOut",
                                            }}
                                            className="pointer-events-none absolute inset-0 text-[14vw] font-black tracking-tighter text-neutral-900 select-none dark:text-white"
                                            style={{
                                                clipPath: "polygon(0 33%, 100% 33%, 100% 66%, 0 66%)",
                                            }}
                                        >
                                            {char}
                                        </motion.span>

                                        {/* Bottom 66-100% Shutter */}
                                        <motion.span
                                            initial={{ x: "-110%", opacity: 0 }}
                                            animate={{ x: ["-100%", "0%", "100%"], opacity: [0, 1, 0] }}
                                            transition={{
                                                duration: 0.65,
                                                delay: i * 0.03 + 0.16,
                                                ease: "easeInOut",
                                            }}
                                            className="pointer-events-none absolute inset-0 text-[14vw] font-black tracking-tighter text-neutral-400 select-none dark:text-neutral-500"
                                            style={{
                                                clipPath: "polygon(0 66%, 100% 66%, 100% 100%, 0 100%)",
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    </>
                                )}

                                {/* 3. Mode: RGB_ABERRATION (Chromatic Channel Offset) */}
                                {glitchMode === "RGB_ABERRATION" && (
                                    <>
                                        <motion.span
                                            animate={{
                                                x: [-3, 4, -2, 3, 0],
                                                opacity: [0.7, 0.9, 0.4, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 0.4,
                                                repeat: Infinity,
                                                repeatType: "reverse",
                                                delay: i * 0.05,
                                            }}
                                            className="pointer-events-none absolute inset-0 text-[14vw] font-black tracking-tighter text-red-500/80 mix-blend-screen select-none dark:text-red-400"
                                            style={{
                                                clipPath: "polygon(0 15%, 100% 15%, 100% 55%, 0 55%)",
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                        <motion.span
                                            animate={{
                                                x: [3, -4, 2, -3, 0],
                                                opacity: [0.7, 0.9, 0.4, 0.8, 0.5],
                                            }}
                                            transition={{
                                                duration: 0.4,
                                                repeat: Infinity,
                                                repeatType: "reverse",
                                                delay: i * 0.05 + 0.02,
                                            }}
                                            className="pointer-events-none absolute inset-0 text-[14vw] font-black tracking-tighter text-cyan-500/80 mix-blend-screen select-none dark:text-cyan-400"
                                            style={{
                                                clipPath: "polygon(0 50%, 100% 50%, 100% 85%, 0 85%)",
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    </>
                                )}

                                {/* 4. Mode: ECHO_CASCADE (Stratified Ghost Shadows) */}
                                {glitchMode === "ECHO_CASCADE" && (
                                    <>
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{
                                                opacity: [0, 0.35, 0],
                                                scale: [1, 1.15, 1.25],
                                                y: [-10, -30],
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                delay: i * 0.04,
                                                ease: "easeOut",
                                            }}
                                            className="pointer-events-none absolute inset-0 text-[14vw] font-black tracking-tighter text-neutral-400 select-none dark:text-neutral-600"
                                        >
                                            {char}
                                        </motion.span>
                                    </>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Interactive Stencil Sub-Readout */}
                <p className="mt-4 font-mono text-xs tracking-[0.4em] text-neutral-400 uppercase md:text-sm dark:text-neutral-500">
                    CLICK GLYPHS TO SHIFT VECTOR SEED
                </p>
            </main>

            {/* Optical Frame Corner Brackets */}
            <div className="pointer-events-none absolute top-6 left-6 size-4 border-t-2 border-l-2 border-neutral-300 dark:border-neutral-800" />
            <div className="pointer-events-none absolute top-6 right-6 size-4 border-t-2 border-r-2 border-neutral-300 dark:border-neutral-800" />
            <div className="pointer-events-none absolute bottom-6 left-6 size-4 border-b-2 border-l-2 border-neutral-300 dark:border-neutral-800" />
            <div className="pointer-events-none absolute bottom-6 right-6 size-4 border-b-2 border-r-2 border-neutral-300 dark:border-neutral-800" />
        </div>
    );
}