"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Code, Layers, CheckCircle2 } from "lucide-react";

const REEL_ITEMS = [
    { icon: Terminal, label: "INIT", color: "bg-yellow-300" },
    { icon: Code, label: "PARSING", color: "bg-cyan-300" },
    { icon: Layers, label: "STACKING", color: "bg-pink-300" },
    { icon: Sparkles, label: "COMPILING", color: "bg-lime-300" },
    { icon: CheckCircle2, label: "COMPLETE", color: "bg-purple-300" },
];

export default function ArcadeSlotLoader() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [progress, setProgress] = useState(0);

    // Raw drag distance in pixels
    const dragY = useMotionValue(0);

    // Smooth spring return when released
    const smoothY = useSpring(dragY, { stiffness: 400, damping: 25 });

    // Map vertical displacement strictly to rotational angle (0 to 45 deg)
    const leverRotate = useTransform(smoothY, [0, 80], [0, 45]);

    const triggerSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);

        let spins = 0;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % REEL_ITEMS.length);
            spins++;

            if (spins >= 8) {
                clearInterval(interval);
                setIsSpinning(false);
            }
        }, 110);
    };

    useEffect(() => {
        const progressTimer = setInterval(() => {
            setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
        }, 80);

        return () => clearInterval(progressTimer);
    }, []);

    // Handle drag/pull manual tracking without Framer Motion's built-in position displacement
    const handlePointerDown = (e: React.PointerEvent) => {
        const startY = e.clientY;

        const handlePointerMove = (moveEvent: PointerEvent) => {
            const deltaY = Math.max(0, Math.min(80, moveEvent.clientY - startY));
            dragY.set(deltaY);
        };

        const handlePointerUp = () => {
            if (dragY.get() > 35) {
                triggerSpin();
            }
            dragY.set(0);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
    };

    const activeItem = REEL_ITEMS[currentIndex];

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-zinc-100 p-6 z-50 select-none antialiased"
            style={{
                backgroundImage: "radial-gradient(#ccc 1px, transparent 1px)",
                backgroundSize: "20px 20px",
            }}
        >
            {/* SLOT MACHINE CONTAINER */}
            <div className="relative flex items-center gap-6">

                {/* MAIN MACHINE BODY */}
                <div className="w-80 border-[3px] border-black bg-white p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-5">

                    {/* HEADER */}
                    <div className="w-full flex items-center justify-between border-b-[3px] border-black pb-4">
                        <div className="flex gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-black bg-red-400" />
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-black bg-yellow-400" />
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-black bg-green-400" />
                        </div>
                        <span className="font-mono text-[11px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
                        </span>
                    </div>

                    {/* REEL WINDOW */}
                    <div className="relative w-full h-36 border-[3px] border-black bg-zinc-900 overflow-hidden flex items-center justify-center shadow-[inset_0px_4px_12px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-0 pointer-events-none z-10 border-y-2 border-dashed border-red-500/40 my-auto h-16" />

                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={currentIndex}
                                initial={{ y: -80, opacity: 0, filter: "blur(4px)" }}
                                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                exit={{ y: 80, opacity: 0, filter: "blur(4px)" }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                className={`w-52 h-24 border-[3px] border-black ${activeItem.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-2`}
                            >
                                <activeItem.icon size={28} className="stroke-[2.5]" />
                                <span className="font-mono font-black text-sm tracking-widest uppercase">
                                    {activeItem.label}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* PROGRESS FOOTER */}
                    <div className="w-full space-y-2">
                        <div className="flex justify-between font-mono text-xs font-black">
                            <span>SYSTEM STATE</span>
                            <span>{progress}%</span>
                        </div>

                        <div className="w-full h-5 border-[3px] border-black bg-white p-0.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <motion.div
                                className="h-full bg-black"
                                style={{ width: `${progress}%` }}
                                transition={{ ease: "linear" }}
                            />
                        </div>
                    </div>
                </div>

                {/* INTERACTIVE LEVER MECHANISM */}
                <div className="relative h-64 flex items-center">

                    {/* BASE PIVOT MOUNT */}
                    <div className="relative w-6 h-16 border-[3px] border-black bg-zinc-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 flex items-center">

                        {/* LEVER ASSEMBLY - PERMANENTLY ATTACHED TO BASE CENTER */}
                        <motion.div
                            style={{
                                rotate: leverRotate,
                                transformOrigin: "left center",
                            }}
                            onPointerDown={handlePointerDown}
                            whileHover={{ scale: 1.05, cursor: "grab" }}
                            whileTap={{ cursor: "grabbing" }}
                            className="absolute left-full flex items-center touch-none -ml-1"
                        >
                            {/* Shaft attached strictly to pivot */}
                            <div className="w-16 h-3.5 border-[2.5px] border-black bg-zinc-200 shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]" />

                            {/* Red Knob */}
                            <div className="w-10 h-10 -ml-2 rounded-full border-[3px] border-black bg-red-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center shrink-0">
                                <div className="w-3.5 h-3.5 rounded-full bg-white/40" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Instruction Label */}
                    <span className="absolute -bottom-8 left-0 font-mono text-[10px] font-black uppercase text-zinc-500 whitespace-nowrap">
                        [ Pull Lever to Spin ]
                    </span>
                </div>

            </div>
        </div>
    );
}