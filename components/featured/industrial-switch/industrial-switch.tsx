"use client";

import React, { useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface IndustrialSwitchProps {
    initialValue?: boolean;
    onToggle?: (val: boolean) => void;
    title?: string;
    subtitle?: string;
}

export default function IndustrialSwitch({
    initialValue = false,
    onToggle,
    title = "POWER CONTROL",
    subtitle = "MAIN CIRCUIT BREAKER",
}: IndustrialSwitchProps) {
    const [isOn, setIsOn] = useState(initialValue);

    // Maximum travel distance of the handle inside the housing
    const MAX_TRAVEL = 88;

    const y = useMotionValue(initialValue ? MAX_TRAVEL : 0);

    // High-stiffness spring to mimic mechanical tension
    const springY = useSpring(y, {
        stiffness: 450,
        damping: 28,
        mass: 1.1,
    });

    // LED State Indicators (Dark red/grey when OFF, Bright Emerald when ON)
    const ledColor = useTransform(
        springY,
        [0, MAX_TRAVEL],
        ["#ef4444", "#10b981"]
    );

    const ledGlow = useTransform(
        springY,
        [0, MAX_TRAVEL],
        [
            "0px 0px 8px rgba(239, 68, 68, 0.4)",
            "0px 0px 22px rgba(16, 185, 129, 0.9)",
        ]
    );

    // Handle dynamic background shifting
    const handleBg = useTransform(
        springY,
        [0, MAX_TRAVEL],
        [
            "linear-gradient(180deg, #374151 0%, #1f2937 100%)",
            "linear-gradient(180deg, #15803d 0%, #064e3b 100%)",
        ]
    );

    // Smooth Cross-fade for status text labels
    const textOpacityOff = useTransform(springY, [0, MAX_TRAVEL * 0.35], [1, 0]);
    const textOpacityOn = useTransform(
        springY,
        [MAX_TRAVEL * 0.65, MAX_TRAVEL],
        [0, 1]
    );

    // Dynamic scale drop to communicate heavy mechanical force on press/drag
    const handleScale = useTransform(
        springY,
        [0, MAX_TRAVEL / 2, MAX_TRAVEL],
        [1, 0.96, 1]
    );

    const handleDragEnd = () => {
        const currentY = y.get();
        if (currentY > MAX_TRAVEL / 2) {
            setIsOn(true);
            y.set(MAX_TRAVEL);
            onToggle?.(true);
        } else {
            setIsOn(false);
            y.set(0);
            onToggle?.(false);
        }
    };

    const toggleClick = () => {
        const newState = !isOn;
        setIsOn(newState);
        y.set(newState ? MAX_TRAVEL : 0);
        onToggle?.(newState);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white dark:bg-black transition-colors duration-300">
            {/* Heavy Machinery Outer Chasis Container */}
            <div className="relative flex flex-col items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-950 border-2 border-neutral-300 dark:border-neutral-800 rounded-3xl shadow-2xl dark:shadow-neutral-900/50 select-none overflow-hidden max-w-sm w-full">
                {/* Subtle Background Structural Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                {/* Industrial Label Header */}
                <div className="relative z-10 flex flex-col items-center mb-6 text-center">
                    <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                        {title}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-600 uppercase mt-0.5">
                        {subtitle}
                    </span>
                </div>

                {/* MAIN SWITCH HOUSING */}
                <div className="relative w-32 h-64 rounded-3xl bg-neutral-200 dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-800 shadow-[inset_0_4px_8px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex justify-center p-2.5">
                    {/* Internal Caution Hatching Overlay */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-10 pointer-events-none">
                        <div className="absolute bottom-0 w-full h-24 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#000_8px,#000_16px)] dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#fff_8px,#fff_16px)]" />
                    </div>

                    {/* Recessed Mechanical Rail Slot */}
                    <div className="absolute top-7 bottom-7 w-7 bg-neutral-300 dark:bg-black rounded-full shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)] border-x border-neutral-400/40 dark:border-neutral-800/60 flex items-center justify-center">
                        <div className="h-full w-0.5 bg-neutral-400/50 dark:bg-neutral-800/80" />
                    </div>

                    {/* Top Status LED Bar */}
                    <motion.div
                        style={{ backgroundColor: ledColor, boxShadow: ledGlow }}
                        className="absolute -top-3.5 w-16 h-2.5 rounded-full border-2 border-neutral-300 dark:border-neutral-950 z-20 transition-all duration-300"
                    />

                    {/* Interactive Heavy-Duty Handle */}
                    <motion.div
                        className="relative z-10 w-28 h-36 cursor-grab active:cursor-grabbing touch-none"
                        style={{ y: springY, scale: handleScale }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: MAX_TRAVEL }}
                        dragElastic={0.04}
                        dragMomentum={false}
                        onDragEnd={handleDragEnd}
                        onClick={toggleClick}
                        whileTap={{ scale: 0.97 }}
                    >
                        <motion.div
                            style={{ background: handleBg }}
                            className="w-full h-full rounded-2xl shadow-lg border border-neutral-600/40 dark:border-neutral-700/60 flex flex-col items-center justify-between p-3 relative overflow-hidden"
                        >
                            {/* Embossed Physical Grip Lines */}
                            <div className="w-full flex flex-col gap-1.5 pt-1 opacity-40">
                                <div className="h-1 w-full bg-black/40 dark:bg-black/60 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
                                <div className="h-1 w-full bg-black/40 dark:bg-black/60 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
                                <div className="h-1 w-full bg-black/40 dark:bg-black/60 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
                            </div>

                            {/* Dynamic Status Text Overlay */}
                            <div className="my-auto relative w-full h-6 flex items-center justify-center">
                                <motion.span
                                    style={{ opacity: textOpacityOff }}
                                    className="absolute text-[12px] font-mono font-black tracking-[0.2em] text-neutral-300 dark:text-neutral-400 select-none"
                                >
                                    OFF
                                </motion.span>
                                <motion.span
                                    style={{ opacity: textOpacityOn }}
                                    className="absolute text-[12px] font-mono font-black tracking-[0.2em] text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] select-none"
                                >
                                    ACTIVE
                                </motion.span>
                            </div>

                            {/* Lower Grip Detail */}
                            <div className="w-full flex flex-col gap-1.5 pb-1 opacity-40">
                                <div className="h-1 w-full bg-black/40 dark:bg-black/60 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Side Markings */}
                    <div className="absolute top-9 left-2 text-[9px] font-mono font-bold text-neutral-400 dark:text-neutral-600 tracking-wider">
                        0
                    </div>
                    <div className="absolute bottom-9 left-2 text-[9px] font-mono font-bold text-neutral-400 dark:text-neutral-600 tracking-wider">
                        I
                    </div>
                </div>

                {/* Chassis Mounting Rivets (Visual Aesthetics) */}
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
            </div>
        </div>
    );
}