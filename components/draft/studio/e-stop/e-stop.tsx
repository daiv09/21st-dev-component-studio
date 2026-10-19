"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EStopProps {
    onTrigger?: () => void;
    onReset?: () => void;
    title?: string;
    subtitle?: string;
}

export default function EStop({
    onTrigger,
    onReset,
    title = "EMERGENCY SHUTOFF",
    subtitle = "PRESS TO KILL / TWIST TO RESET",
}: EStopProps) {
    const [isTripped, setIsTripped] = useState(false);
    const [rotation, setRotation] = useState(0);

    // Pressing the button latches it down (Tripped)
    const handlePress = () => {
        if (isTripped) return;
        setIsTripped(true);
        onTrigger?.();
    };

    // Twisting rotates the button knob and releases the mechanical latch
    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isTripped) return;
        setRotation((prev) => prev + 60);
        setIsTripped(false);
        onReset?.();
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white dark:bg-black transition-colors duration-300 select-none">
            {/* Outer Industrial Chassis Panel */}
            <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 bg-neutral-100 dark:bg-neutral-950 border-2 border-neutral-300 dark:border-neutral-800 rounded-3xl shadow-2xl dark:shadow-neutral-900/50 max-w-md w-full overflow-hidden">
                {/* Subtle Background Structural Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                {/* Machine Header */}
                <div className="relative z-10 flex flex-col items-center mb-6 text-center">
                    <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 dark:text-neutral-400 uppercase">
                        {title}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-600 uppercase mt-0.5">
                        {subtitle}
                    </span>
                </div>

                {/* E-STOP BASE HOUSING */}
                <div className="relative w-64 h-64 rounded-full bg-amber-400 dark:bg-amber-500 border-4 border-amber-600 dark:border-amber-600 shadow-xl flex items-center justify-center p-4">
                    {/* Yellow Warning Collar Text */}
                    <div className="absolute inset-2 rounded-full border border-black/20 pointer-events-none flex items-center justify-center">
                        <span className="absolute top-2 text-[10px] font-mono font-black tracking-widest text-black/80 uppercase">
                            EMERGENCY STOP
                        </span>
                        <span className="absolute bottom-2 text-[10px] font-mono font-black tracking-widest text-black/80 uppercase">
                            ARRET D'URGENCE
                        </span>
                    </div>

                    {/* Mechanical Bezel Ring */}
                    <div className="relative w-48 h-48 rounded-full bg-neutral-800 dark:bg-neutral-900 border-4 border-neutral-700 dark:border-neutral-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center">

                        {/* LARGE RED MUSHROOM BUTTON */}
                        <motion.div
                            onClick={handlePress}
                            animate={{
                                scale: isTripped ? 0.92 : 1,
                                y: isTripped ? 4 : 0,
                                rotate: rotation,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                            }}
                            whileHover={{ scale: isTripped ? 0.92 : 1.02 }}
                            whileTap={{ scale: 0.9 }}
                            className={`relative z-20 w-36 h-36 rounded-full cursor-pointer flex items-center justify-center transition-shadow duration-300 ${isTripped
                                    ? "bg-red-700 dark:bg-red-800 shadow-inner border-4 border-red-900"
                                    : "bg-gradient-to-b from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 shadow-[0_12px_24px_rgba(239,68,68,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border-4 border-red-400/40"
                                }`}
                        >
                            {/* Reset Arrows Graphic on Button Face */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                                <svg
                                    className="w-20 h-20 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                            </div>

                            {/* Center Status Text */}
                            <div className="relative z-30 text-center flex flex-col items-center">
                                <span className="text-sm font-mono font-black tracking-wider text-white drop-shadow">
                                    {isTripped ? "STOPPED" : "PUSH"}
                                </span>
                                {isTripped && (
                                    <span className="text-[9px] font-mono tracking-tight text-red-200 mt-0.5 animate-pulse">
                                        TWIST TO RESET
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* CONTROL FOOTER & MANUAL RESET TRIGGER */}
                <div className="mt-8 flex flex-col items-center gap-3 w-full">
                    <div className="flex items-center gap-3 bg-neutral-200/60 dark:bg-neutral-900/60 border border-neutral-300 dark:border-neutral-800 px-4 py-2 rounded-xl">
                        <div
                            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${isTripped
                                    ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-ping"
                                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                }`}
                        />
                        <span className="text-xs font-mono font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
                            CIRCUIT: {isTripped ? "TRIPPED / OPEN" : "ARMED / CLOSED"}
                        </span>
                    </div>

                    <AnimatePresence>
                        {isTripped && (
                            <motion.button
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                onClick={handleReset}
                                className="text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 hover:text-amber-500 underline underline-offset-4 cursor-pointer mt-1"
                            >
                                [ CLICK HERE OR TWIST BUTTON TO RESET ]
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Structural Chassis Rivets */}
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
            </div>
        </div>
    );
}