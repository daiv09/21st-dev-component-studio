"use client";

import React, { useState } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    PanInfo,
} from "framer-motion";

interface RotaryDialProps {
    levels?: string[];
    initialIndex?: number;
    onChange?: (index: number, level: string) => void;
    title?: string;
    subtitle?: string;
}

const DEFAULT_LEVELS = ["OFF", "LOW", "MED", "HIGH", "MAX"];

export default function RotatoryDial({
    levels = DEFAULT_LEVELS,
    initialIndex = 0,
    onChange,
    title = "THRUST VECTOR",
    subtitle = "ROTARY CONTROL UNIT",
}: RotaryDialProps) {
    const [selectedIndex, setSelectedIndex] = useState(initialIndex);

    // Angle steps divided equally across 240 degrees total travel (-120deg to +120deg)
    const TOTAL_SWEEP = 240;
    const START_ANGLE = -120;
    const stepAngle = TOTAL_SWEEP / (levels.length - 1);

    const getAngleForIndex = (index: number) => START_ANGLE + index * stepAngle;

    const rawRotation = useMotionValue(getAngleForIndex(initialIndex));

    // Snapping spring physics
    const springRotation = useSpring(rawRotation, {
        stiffness: 400,
        damping: 28,
        mass: 0.8,
    });

    // LED Accent Glow color mapping based on level index
    const ledGlowColor = useTransform(
        springRotation,
        [START_ANGLE, 0, 120],
        ["#ef4444", "#f59e0b", "#10b981"]
    );

    // Dynamic status text color crossfade
    const isActive = selectedIndex > 0;

    const handlePan = (_: any, info: PanInfo) => {
        // Calculate angle shift relative to drag vector
        const sensitivity = 0.8;
        const currentAngle = rawRotation.get();
        let nextAngle = currentAngle + info.delta.x * sensitivity - info.delta.y * sensitivity;

        // Clamp bounds
        nextAngle = Math.max(START_ANGLE, Math.min(START_ANGLE + TOTAL_SWEEP, nextAngle));
        rawRotation.set(nextAngle);
    };

    const handlePanEnd = () => {
        const currentAngle = rawRotation.get();
        // Find nearest step index
        const closestIndex = Math.round((currentAngle - START_ANGLE) / stepAngle);
        const clampedIndex = Math.max(0, Math.min(levels.length - 1, closestIndex));

        setSelectedIndex(clampedIndex);
        rawRotation.set(getAngleForIndex(clampedIndex));
        onChange?.(clampedIndex, levels[clampedIndex]);
    };

    const setIndexDirectly = (index: number) => {
        setSelectedIndex(index);
        rawRotation.set(getAngleForIndex(index));
        onChange?.(index, levels[index]);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white dark:bg-black transition-colors duration-300 select-none">
            {/* Outer Industrial Chassis */}
            <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 bg-neutral-100 dark:bg-neutral-950 border-2 border-neutral-300 dark:border-neutral-800 rounded-3xl shadow-2xl dark:shadow-neutral-900/50 max-w-md w-full overflow-hidden">
                {/* Structural Grid BG */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                {/* Machine Header */}
                <div className="relative z-10 flex flex-col items-center mb-8 text-center">
                    <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-500 dark:text-neutral-400 uppercase">
                        {title}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-600 uppercase mt-0.5">
                        {subtitle}
                    </span>
                </div>

                {/* DIAL HOUSING CONTAINER */}
                <div className="relative w-64 h-64 rounded-full bg-neutral-200 dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_4px_20px_rgba(0,0,0,0.9)] flex items-center justify-center p-4">

                    {/* STEP NOTCHES & TICK LABELS */}
                    {levels.map((lvl, idx) => {
                        const angle = getAngleForIndex(idx);
                        const isSelected = idx === selectedIndex;

                        return (
                            <div
                                key={lvl}
                                onClick={() => setIndexDirectly(idx)}
                                className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto"
                                style={{
                                    transform: `rotate(${angle}deg)`,
                                }}
                            >
                                {/* Outer Tick Mark */}
                                <div
                                    className={`absolute -top-1 w-1.5 rounded-full transition-all duration-300 ${isSelected
                                            ? "h-4 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                            : "h-2.5 bg-neutral-400 dark:bg-neutral-700"
                                        }`}
                                />

                                {/* Level Text Label */}
                                <span
                                    className={`absolute -top-7 text-[10px] font-mono font-bold tracking-wider transition-colors duration-300 ${isSelected
                                            ? "text-black dark:text-white scale-110"
                                            : "text-neutral-400 dark:text-neutral-600"
                                        }`}
                                    style={{
                                        transform: `rotate(${-angle}deg)`,
                                    }}
                                >
                                    {lvl}
                                </span>
                            </div>
                        );
                    })}

                    {/* ROTATABLE METALLIC KNOB */}
                    <motion.div
                        onPan={handlePan}
                        onPanEnd={handlePanEnd}
                        style={{ rotate: springRotation }}
                        whileTap={{ scale: 0.97 }}
                        className="relative z-20 w-40 h-40 rounded-full bg-gradient-to-b from-neutral-300 to-neutral-400 dark:from-neutral-800 dark:to-neutral-950 border-2 border-neutral-400 dark:border-neutral-700 shadow-xl dark:shadow-black/80 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
                    >
                        {/* Machined Radial Grip Ring */}
                        <div className="absolute inset-2 rounded-full border border-neutral-400/40 dark:border-neutral-700/50 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.15)_100%)]" />

                        {/* Inset Core Ring */}
                        <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 shadow-inner flex items-center justify-center relative">
                            {/* Pointer Indicator Needle Notch */}
                            <motion.div
                                style={{ backgroundColor: ledGlowColor }}
                                className="absolute -top-3 w-1.5 h-6 rounded-full shadow-[0_0_10px_currentColor]"
                            />

                            {/* Digital Value Center Display */}
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-[9px] font-mono tracking-widest text-neutral-400 dark:text-neutral-600">
                                    VAL
                                </span>
                                <span
                                    className={`text-sm font-mono font-black tracking-wider transition-colors duration-300 ${isActive
                                            ? "text-black dark:text-white"
                                            : "text-neutral-400 dark:text-neutral-600"
                                        }`}
                                >
                                    {levels[selectedIndex]}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* STATUS FOOTER READOUT */}
                <div className="mt-8 flex items-center gap-3 bg-neutral-200/60 dark:bg-neutral-900/60 border border-neutral-300 dark:border-neutral-800 px-4 py-2 rounded-xl">
                    <motion.div
                        animate={{
                            opacity: isActive ? [0.4, 1, 0.4] : 0.3,
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: isActive ? Infinity : 0,
                        }}
                        style={{
                            backgroundColor: isActive ? "#10b981" : "#737373",
                        }}
                        className="w-2 h-2 rounded-full"
                    />
                    <span className="text-xs font-mono font-bold tracking-widest text-neutral-700 dark:text-neutral-300 uppercase">
                        STATUS: {levels[selectedIndex]}
                    </span>
                </div>

                {/* Chassis Rivets */}
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
                <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-800 shadow-inner" />
            </div>
        </div>
    );
}