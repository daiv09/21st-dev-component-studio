"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    useMotionValueEvent,
    AnimatePresence,
} from "framer-motion";

export default function OrbitalPowerCore() {
    // --- CONFIGURATION ---
    const MIN_DEG = -135;
    const MAX_DEG = 135;
    const TOTAL_SEGMENTS = 32;
    const DEGREES_PER_SEGMENT = (MAX_DEG - MIN_DEG) / TOTAL_SEGMENTS;

    // --- STATE ---
    const [isDragging, setIsDragging] = useState(false);
    const [activePreset, setActivePreset] = useState<string | null>("37%");

    // Motion values for smooth interaction
    const rawRotation = useMotionValue(-45); // ~37% initial charge
    const snappedRotation = useMotionValue(-45);

    // Dynamic Spring Physics for weighty mechanical feel
    const smoothRotation = useSpring(snappedRotation, {
        stiffness: 350,
        damping: 28,
        mass: 0.6,
    });

    // Output Power Value (0 to 100%)
    const powerOutput = useTransform(smoothRotation, [MIN_DEG, MAX_DEG], [0, 100]);
    const rawPower = useTransform(rawRotation, [MIN_DEG, MAX_DEG], [0, 100]);

    // Reactive Color Mapping: Cyan -> Blue -> Vibrant Amber -> Danger Red
    const coreGlowOpacity = useTransform(rawPower, [0, 50, 85, 100], [0.2, 0.4, 0.7, 0.95]);
    const coreColor = useTransform(
        rawPower,
        [0, 50, 85, 100],
        ["#06b6d4", "#3b82f6", "#f59e0b", "#ef4444"]
    );

    // Core Interaction Handlers
    const dialRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        setIsDragging(true);
        setActivePreset(null);
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            if (!dialRef.current) return;

            const rect = dialRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const x = e.clientX - centerX;
            const y = e.clientY - centerY;

            const rads = Math.atan2(y, x);
            let degs = rads * (180 / Math.PI) + 90;

            if (degs > 180) degs -= 360;

            // Clamping constraints
            if (degs < MIN_DEG && degs > -180) degs = MIN_DEG;
            if (degs > MAX_DEG) degs = MAX_DEG;

            rawRotation.set(degs);

            const snap = Math.round(degs / DEGREES_PER_SEGMENT) * DEGREES_PER_SEGMENT;
            snappedRotation.set(snap);
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isDragging, rawRotation, snappedRotation, DEGREES_PER_SEGMENT, MAX_DEG, MIN_DEG]);

    // Helper to jump to explicit percentage presets
    const setPresetPercentage = (pct: number, label: string) => {
        const targetDeg = MIN_DEG + (pct / 100) * (MAX_DEG - MIN_DEG);
        const snap = Math.round(targetDeg / DEGREES_PER_SEGMENT) * DEGREES_PER_SEGMENT;
        rawRotation.set(targetDeg);
        snappedRotation.set(snap);
        setActivePreset(label);
    };

    return (
        <div className="relative min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden p-6 text-slate-100 select-none">
            {/* Tech Mesh Background */}
            <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, rgba(15,23,42,0.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Ambient Radial Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.95)_100%)] pointer-events-none" />

            {/* MAIN HUD CONTAINER */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* HUD Header */}
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-cyan-400/80 uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                        SYSTEM_CORE // ORBITAL-09
                    </div>
                    <h1 className="text-xl font-bold tracking-wider text-slate-200">
                        REACTOR OUTPUT CONTROL
                    </h1>
                </div>

                {/* THE DIAL MODULE */}
                <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center">
                    {/* Background Light Glow */}
                    <motion.div
                        className="absolute inset-4 rounded-full blur-3xl pointer-events-none transition-opacity"
                        style={{
                            backgroundColor: coreColor,
                            opacity: coreGlowOpacity,
                        }}
                    />

                    {/* Outer Counter-Rotating Ring Decor */}
                    <div className="absolute inset-0 rounded-full border border-cyan-500/10 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none" />
                    <div className="absolute inset-6 rounded-full border border-blue-500/15 animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

                    {/* SEGMENTED HUD TICKS */}
                    <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: TOTAL_SEGMENTS + 1 }).map((_, i) => {
                            const angle = (i / TOTAL_SEGMENTS) * (MAX_DEG - MIN_DEG) + MIN_DEG;
                            return (
                                <SegmentTick
                                    key={i}
                                    angle={angle}
                                    currentRotation={smoothRotation}
                                />
                            );
                        })}
                    </div>

                    {/* INTERACTIVE CORE KNOB */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                        <motion.div
                            ref={dialRef}
                            onPointerDown={handlePointerDown}
                            style={{ rotate: smoothRotation }}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative w-full h-full rounded-full touch-none z-20 transition-shadow duration-300 ${isDragging ? "cursor-grabbing" : "cursor-grab"
                                }`}
                        >
                            {/* Outer Mechanical Bezel */}
                            <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.15)] p-3 flex items-center justify-center relative overflow-hidden">
                                {/* Metallic Texture Overlay */}
                                <div className="absolute inset-0 opacity-20 bg-[conic-gradient(from_0deg,transparent_0deg,#ffffff_180deg,transparent_360deg)] pointer-events-none" />

                                {/* Inner Recessed Core */}
                                <div className="relative w-full h-full rounded-full bg-slate-950 border border-slate-800 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
                                    {/* Holographic Laser Sight Line */}
                                    <motion.div
                                        className="absolute top-2.5 w-1 h-7 rounded-full"
                                        style={{
                                            backgroundColor: coreColor,
                                            boxShadow: useTransform(
                                                coreColor,
                                                (c) => `0 0 12px ${c}, 0 0 20px ${c}`
                                            ),
                                        }}
                                    />

                                    {/* Center Digital Display */}
                                    <div className="flex flex-col items-center justify-center">
                                        <motion.div
                                            className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight"
                                            style={{ color: coreColor }}
                                        >
                                            <NumericReadout value={powerOutput} />
                                        </motion.div>
                                        <span className="font-mono text-[9px] text-slate-500 tracking-widest uppercase mt-0.5">
                                            CAPACITY
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* PRESET CONTROL DECK */}
                <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-lg">
                    {[
                        { label: "ECO", pct: 20 },
                        { label: "NOMINAL", pct: 50 },
                        { label: "TURBO", pct: 80 },
                        { label: "MAX", pct: 100 },
                    ].map((preset) => {
                        const isActive = activePreset === preset.label;
                        return (
                            <button
                                key={preset.label}
                                onClick={() => setPresetPercentage(preset.pct, preset.label)}
                                className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-semibold transition-all duration-200 ${isActive
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                                    }`}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Sub-Component: Dynamic Segmented Ring Ticks
function SegmentTick({
    angle,
    currentRotation,
}: {
    angle: number;
    currentRotation: any;
}) {
    const isActive = useTransform(currentRotation, (r: number) => r >= angle);

    const tickColor = useTransform(isActive, (active) =>
        active ? "#38bdf8" : "#1e293b"
    );

    const tickGlow = useTransform(isActive, (active) =>
        active ? "0 0 8px rgba(56, 189, 248, 0.8)" : "none"
    );

    return (
        <div
            className="absolute top-0 left-1/2 w-1 h-full -translate-x-1/2 pointer-events-none"
            style={{ transform: `rotate(${angle}deg)` }}
        >
            <motion.div
                style={{
                    backgroundColor: tickColor,
                    boxShadow: tickGlow,
                }}
                className="w-1 h-3 rounded-full transition-colors duration-100"
            />
        </div>
    );
}

// Sub-Component: Smooth Digits Readout
function NumericReadout({ value }: { value: any }) {
    const [displayVal, setDisplayVal] = useState(37);

    useMotionValueEvent(value, "change", (latest) => {
        setDisplayVal(Math.round(Number(latest)));
    });

    return (
        <span className="tabular-nums tracking-tighter">
            {displayVal.toString().padStart(2, "0")}
            <span className="text-base font-normal text-slate-500 ml-0.5">%</span>
        </span>
    );
}