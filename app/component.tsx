"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 1. LAYERED DEPTH STACK (Inspired by "CONFIDENCE" vertical shadow overlap)
// ============================================================================
export const LayeredDepthText: React.FC<{ text?: string }> = ({
    text = "CONFIDENCE",
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const letters = text.split("");

    return (
        <div className="flex flex-col items-center justify-center bg-zinc-950 py-16 px-8 rounded-2xl overflow-hidden select-none">
            <div className="flex flex-col items-center">
                {letters.map((char, index) => {
                    const isHovered = hoveredIndex === index;
                    return (
                        <motion.div
                            key={index}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            initial={{ opacity: 0, y: -40 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: isHovered ? 1.12 : 1,
                                zIndex: isHovered ? 50 : letters.length - index,
                            }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.05,
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                            }}
                            style={{
                                marginTop: index === 0 ? "0px" : "-1.8rem",
                                textShadow:
                                    "0px 18px 24px rgba(0, 0, 0, 0.95), 0px 4px 8px rgba(0, 0, 0, 0.8)",
                            }}
                            className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase cursor-pointer leading-none transition-colors duration-200 hover:text-zinc-200"
                        >
                            {char}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// ============================================================================
// 2. CHAOS MATRIX REVEAL (Inspired by "THE ANSWER IS IN THE CHAOS")
// ============================================================================
const CHAOS_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface ChaosNode {
    id: number;
    char: string;
    isTarget: boolean;
    wordIndex?: number;
    x: number;
    y: number;
    rotate: number;
}

export const ChaosMatrixText: React.FC = () => {
    const [isRevealed, setIsRevealed] = useState(false);

    const targetLines = ["THE", "ANSWER", "IS IN", "THE", "CHAOS"];
    const noiseChars = React.useMemo(() => {
        return Array.from({ length: 48 }).map((_, i) => ({
            id: i,
            char: CHAOS_POOL[i % CHAOS_POOL.length],
            x: ((i * 37) % 90) - 45,
            y: ((i * 53) % 90) - 45,
            rotate: ((i * 71) % 90) - 45,
        }));
    }, []);

    return (
        <div
            onMouseEnter={() => setIsRevealed(true)}
            onMouseLeave={() => setIsRevealed(false)}
            onClick={() => setIsRevealed((prev) => !prev)}
            className="relative flex flex-col items-center justify-center min-h-[460px] w-full bg-[#1b9aaa] text-[#f5f1e3] p-8 rounded-2xl overflow-hidden cursor-pointer select-none"
        >
            {/* Background Noise Layer */}
            <div className="absolute inset-0 flex flex-wrap items-center justify-center pointer-events-none p-4">
                {noiseChars.map((item) => (
                    <motion.span
                        key={item.id}
                        animate={{
                            opacity: isRevealed ? 0.18 : 0.85,
                            scale: isRevealed ? 0.85 : 1.05,
                            rotate: isRevealed ? item.rotate * 0.3 : item.rotate,
                            x: isRevealed ? item.x * 1.4 : item.x * 0.4,
                            y: isRevealed ? item.y * 1.4 : item.y * 0.4,
                        }}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        className="text-4xl md:text-6xl font-black uppercase m-2 leading-none"
                    >
                        {item.char}
                    </motion.span>
                ))}
            </div>

            {/* Foreground Target Message */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                {targetLines.map((line, lineIdx) => (
                    <div key={lineIdx} className="flex space-x-1">
                        {line.split("").map((char, charIdx) => {
                            const seed = (lineIdx + 1) * (charIdx + 3);
                            const initialRotate = ((seed * 29) % 50) - 25;
                            const initialY = ((seed * 17) % 30) - 15;
                            return (
                                <motion.span
                                    key={charIdx}
                                    animate={{
                                        rotate: isRevealed ? 0 : initialRotate,
                                        y: isRevealed ? 0 : initialY,
                                        scale: isRevealed ? 1.1 : 0.95,
                                        color: isRevealed ? "#ef233c" : "#ef233c",
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 220,
                                        damping: 16,
                                    }}
                                    className="text-5xl md:text-7xl font-black tracking-tight uppercase drop-shadow-md"
                                >
                                    {char === " " ? " " : char}
                                </motion.span>
                            );
                        })}
                    </div>
                ))}
            </div>

            <span className="absolute bottom-4 right-5 text-xs font-mono uppercase tracking-widest text-[#f5f1e3]/80">
                {isRevealed ? "Order Restored" : "Hover or Click to Focus"}
            </span>
        </div>
    );
};

// ============================================================================
// 3. KINETIC STEPPED RIBBONS (Inspired by "BUILT BY DISCIPLINE. POWERED BY CREATION.")
// ============================================================================
export const SteppedRibbonText: React.FC<{ lines?: string[] }> = ({
    lines = ["BUILT BY", "DISCIPLINE.", "POWERED", "BY CREATION."],
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[480px] bg-zinc-100 dark:bg-zinc-900 p-8 rounded-2xl overflow-hidden select-none">
            <div className="flex flex-col items-start space-y-4 -rotate-[24deg] transform-gpu">
                {lines.map((line, index) => (
                    <motion.div
                        key={index}
                        initial={{ x: -120, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        whileHover={{ x: 16, y: -6 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.12,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                        }}
                        style={{
                            marginLeft: `${index * 2.2}rem`,
                            boxShadow: "14px 22px 0px 0px #09090b",
                        }}
                        className="bg-[#facc15] border-2 border-zinc-950 px-6 py-3 cursor-pointer transition-shadow"
                    >
                        <span className="text-3xl md:text-5xl font-black text-zinc-950 tracking-tight uppercase whitespace-nowrap">
                            {line}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// 4. SCRIBBLE CYCLE STACK (Inspired by "EAT SLEEP CREATE [ART/STORIES/...] REPEAT")
// ============================================================================
export const ScribbleCycleStack: React.FC = () => {
    const words = [
        "ART",
        "STORIES",
        "MISTAKES",
        "FUN",
        "GARBAGE",
        "PERFECTION",
        "MEMORIES",
        "FILMS",
        "BONDS",
        "ENVIRONMENTS",
        "CONNECTION",
        "LOVE",
        "YOURSELF",
    ];

    const [activeIdx, setActiveIdx] = useState<number>(12);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % words.length);
        }, 1100);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <div className="flex flex-col justify-between bg-[#f8f7f4] text-zinc-950 p-8 md:p-12 rounded-2xl border border-zinc-200 max-w-2xl mx-auto select-none">
            <div className="flex flex-col leading-[0.88] font-black text-6xl md:text-8xl tracking-tighter uppercase">
                <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="self-start"
                >
                    EAT
                </motion.span>
                <motion.span
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="self-end"
                >
                    SLEEP
                </motion.span>
                <motion.span
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="self-center"
                >
                    CREATE
                </motion.span>
            </div>

            {/* Handwritten / Scribble Dynamic Matrix */}
            <div className="my-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-red-600 font-mono text-lg md:text-2xl tracking-tight">
                {words.map((word, idx) => {
                    const isCurrent = idx === activeIdx;
                    return (
                        <React.Fragment key={word}>
                            <motion.span
                                onClick={() => setActiveIdx(idx)}
                                animate={{
                                    scale: isCurrent ? 1.12 : 1,
                                    opacity: isCurrent ? 1 : 0.55,
                                    rotate: isCurrent ? -2 : 0,
                                }}
                                className={`relative cursor-pointer px-1 font-bold transition-colors ${isCurrent ? "text-red-600 font-extrabold" : "text-red-500/80"
                                    }`}
                            >
                                {word}
                                {isCurrent && (
                                    <motion.span
                                        layoutId="scribble-underline"
                                        className="absolute left-0 right-0 -bottom-1 h-1 bg-red-600 rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                    />
                                )}
                            </motion.span>
                            {idx < words.length - 1 && (
                                <span className="text-red-400/70 font-light select-none">/</span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="leading-[0.88] font-black text-6xl md:text-8xl tracking-tighter uppercase text-center"
            >
                REPEAT
            </motion.div>
        </div>
    );
};

// ============================================================================
// 5. EDITORIAL MEDIA COLLAGE TEXT (Inspired by '"Bad" art is still better than Ai')
// ============================================================================
interface MediaItem {
    id: string;
    label: string;
    imgUrl: string;
}

export const EditorialMediaText: React.FC = () => {
    const [hoveredMedia, setHoveredMedia] = useState<string | null>(null);

    const mediaItems: Record<string, MediaItem> = {
        "01": {
            id: "01",
            label: "(01)",
            imgUrl:
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
        },
        "02": {
            id: "02",
            label: "(02)",
            imgUrl:
                "https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=400&q=80",
        },
        "03": {
            id: "03",
            label: "(03)",
            imgUrl:
                "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=400&q=80",
        },
        "04": {
            id: "04",
            label: "(04)",
            imgUrl:
                "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
        },
    };

    const MediaPill = ({ item }: { item: MediaItem }) => (
        <motion.div
            onMouseEnter={() => setHoveredMedia(item.id)}
            onMouseLeave={() => setHoveredMedia(null)}
            whileHover={{ scale: 1.08, y: -4 }}
            className="inline-flex flex-col items-center mx-3 my-1 align-middle cursor-pointer group"
        >
            <div className="w-28 h-12 md:w-36 md:h-16 overflow-hidden rounded-sm bg-zinc-300 shadow-sm border border-zinc-200">
                <motion.img
                    src={item.imgUrl}
                    alt={item.label}
                    animate={{
                        scale: hoveredMedia === item.id ? 1.18 : 1,
                    }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                />
            </div>
            <span className="text-[10px] font-mono text-zinc-500 mt-1 tracking-widest">
                {item.label}
            </span>
        </motion.div>
    );

    return (
        <div className="flex flex-col items-center justify-center bg-[#faf9f5] text-zinc-950 p-10 md:p-16 rounded-2xl max-w-2xl mx-auto select-none">
            <div className="flex flex-col space-y-2 text-5xl md:text-7xl font-bold tracking-tight leading-none">
                {/* Row 1 */}
                <div className="flex items-center justify-start">
                    <span>“Bad”</span>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-center space-x-4">
                    <MediaPill item={mediaItems["01"]} />
                    <span>art</span>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-start space-x-6">
                    <span>is</span>
                    <motion.span
                        whileHover={{ skewX: -12, scale: 1.05 }}
                        className="font-serif italic font-normal text-6xl md:text-8xl px-2"
                    >
                        still
                    </motion.span>
                    <MediaPill item={mediaItems["02"]} />
                </div>

                {/* Row 4 */}
                <div className="flex items-center justify-end space-x-4">
                    <MediaPill item={mediaItems["03"]} />
                    <span>better</span>
                </div>

                {/* Row 5 */}
                <div className="flex items-end justify-between pt-2">
                    <div className="flex flex-col items-start space-y-3">
                        <span>than</span>
                        <MediaPill item={mediaItems["04"]} />
                    </div>
                    <motion.span
                        whileHover={{ scale: 1.06 }}
                        className="text-7xl md:text-9xl font-black tracking-tighter leading-none"
                    >
                        Ai
                    </motion.span>
                </div>
            </div>
        </div>
    );
};


// ============================================================================
// DEFAULT SHOWCASE COMPONENT (Import directly or import individual components)
// ============================================================================
export default function PosterTextAnimationsShowcase() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 space-y-16">
            <div className="max-w-5xl mx-auto space-y-4">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                    Poster Typography Animations
                </h1>
                <p className="text-zinc-400 text-sm md:text-base">
                    Interactive Next.js + Tailwind CSS + Framer Motion components inspired by brutalist & editorial poster graphics.
                </p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 gap-12">
                <section className="space-y-3">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                        01 // Vertical Layered Depth Overlap ("CONFIDENCE")
                    </h2>
                    <LayeredDepthText text="CONFIDENCE" />
                </section>

                <section className="space-y-3">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                        02 // Chaos Matrix Reveal ("THE ANSWER IS IN THE CHAOS")
                    </h2>
                    <ChaosMatrixText />
                </section>

                <section className="space-y-3">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                        03 // Stepped Brutalist 3D Ribbons ("BUILT BY DISCIPLINE")
                    </h2>
                    <SteppedRibbonText />
                </section>

                <section className="space-y-3">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                        04 // Dynamic Scribble Cycle ("EAT SLEEP CREATE REPEAT")
                    </h2>
                    <ScribbleCycleStack />
                </section>

                <section className="space-y-3">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                        05 // Editorial Media Collage ("BAD ART IS STILL BETTER THAN AI")
                    </h2>
                    <EditorialMediaText />
                </section>
            </div>
        </div>
    );
}