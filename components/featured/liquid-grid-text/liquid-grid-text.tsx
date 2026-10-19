"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function LiquidGridText({
    text = "FLUID",
    className = "",
}: {
    text?: string;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isClicking, setIsClicking] = useState(false);

    // Mouse normalized position (-0.5 to 0.5)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Responsive Spring Physics Engine
    const springConfig = { stiffness: 80, damping: 15, mass: 0.6 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Secondary delayed spring for trailing fluid aura
    const auraX = useSpring(mouseX, { stiffness: 30, damping: 25 });
    const auraY = useSpring(mouseY, { stiffness: 30, damping: 25 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleMouseDown = () => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 400);
    };

    const characters = text.split("");

    // Super deep extrusion array for high-density 3D volume
    const extrusionDepths = Array.from({ length: 35 }, (_, i) => (i + 1) * 1.2);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            className={`relative flex flex-col items-center justify-center min-h-screen w-full bg-zinc-950 text-white overflow-hidden select-none font-mono antialiased cursor-crosshair ${className}`}
        >
            {/* BACKGROUND LIQUID METABALL GLOW */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    style={{
                        x: useTransform(auraX, [-0.5, 0.5], [-250, 250]),
                        y: useTransform(auraY, [-0.5, 0.5], [-250, 250]),
                        scale: isClicking ? 1.6 : 1,
                    }}
                    transition={{
                        scale: { type: "spring", stiffness: 300, damping: 15 },
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 rounded-full blur-[140px]"
                />
            </div>

            {/* INTERACTIVE ULTRA-THICK 3D WHITE BLOCK TEXT */}
            <div className="relative z-10 flex items-center justify-center gap-[2vw] [perspective:1000px]">
                {characters.map((char, index) => {
                    // Calculate distance factor from center for localized ripple physics
                    const centerOffset = (index - (characters.length - 1) / 2) * 0.4;

                    // Physics transformations derived from smooth spring values
                    const translateX = useTransform(
                        smoothX,
                        [-0.5, 0.5],
                        [
                            -120 * (1 + Math.abs(centerOffset)),
                            120 * (1 + Math.abs(centerOffset)),
                        ]
                    );

                    const translateY = useTransform(
                        smoothY,
                        [-0.5, 0.5],
                        [-80 * (1 - centerOffset), 80 * (1 + centerOffset)]
                    );

                    const rotateX = useTransform(smoothY, [-0.5, 0.5], [50, -50]);
                    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-50, 50]);
                    const skewY = useTransform(
                        smoothX,
                        [-0.5, 0.5],
                        [-12 * centerOffset, 12 * centerOffset]
                    );

                    // Dynamic scale based on mouse proximity center
                    const scale = useTransform(
                        smoothX,
                        [-0.5, 0, 0.5],
                        [
                            1 - Math.abs(centerOffset) * 0.15,
                            1.15,
                            1 - Math.abs(centerOffset) * 0.15,
                        ]
                    );

                    return (
                        <motion.div
                            key={index}
                            style={{
                                x: translateX,
                                y: translateY,
                                rotateX,
                                rotateY,
                                skewY,
                                scale: isClicking ? scale.get() * 1.25 : scale,
                                transformStyle: "preserve-3d",
                            }}
                            className="relative group inline-block"
                        >
                            {/* HEAVY ATMOSPHERIC DROP SHADOWS */}
                            <span
                                aria-hidden="true"
                                style={{
                                    transform: "translateZ(-60px) translateY(50px) scale(0.95)",
                                }}
                                className="absolute inset-0 text-[15vw] font-black leading-none tracking-tighter text-black/90 blur-[28px] pointer-events-none select-none"
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                            <span
                                aria-hidden="true"
                                style={{
                                    transform: "translateZ(-40px) translateY(30px) scale(0.98)",
                                }}
                                className="absolute inset-0 text-[15vw] font-black leading-none tracking-tighter text-black/80 blur-[14px] pointer-events-none select-none"
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>

                            {/* DENSE WHITE EXTRUSION STACK FOR MASSIVE BLOCK THICKNESS */}
                            {extrusionDepths.map((depth, idx) => {
                                // Gradient shading for the extruded sides to simulate ambient occlusion
                                const shadowStrength = Math.min(100, Math.floor((idx / extrusionDepths.length) * 45 + 55));

                                return (
                                    <span
                                        key={depth}
                                        aria-hidden="true"
                                        aria-disabled="true"
                                        style={{
                                            transform: `translateZ(-${depth}px) translateY(${depth * 0.25}px)`,
                                            color: `rgb(${shadowStrength}%, ${shadowStrength}%, ${shadowStrength}%)`,
                                        }}
                                        className="absolute inset-0 text-[15vw] font-black leading-none tracking-tighter pointer-events-none select-none"
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </span>
                                );
                            })}

                            {/* PURE WHITE 3D FRONT FACE */}
                            <span
                                style={{
                                    transform: "translateZ(0px)",
                                }}
                                className="relative block text-[15vw] font-black leading-none tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] will-change-transform"
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>

                            {/* HIGHLIGHT REFLECTION RIM */}
                            <span
                                aria-hidden="true"
                                style={{ transform: "translateZ(2px)" }}
                                className="absolute inset-0 text-[15vw] font-black leading-none tracking-tighter text-cyan-200/40 blur-[1px] opacity-0 transition-opacity pointer-events-none"
                            >
                                {char}
                            </span>
                        </motion.div>
                    );
                })}
            </div>

            {/* LIQUID SHOCKWAVE RING ON CLICK */}
            <motion.div
                animate={{
                    scale: isClicking ? [0.8, 2.2] : 1,
                    opacity: isClicking ? [0.8, 0] : 0,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="pointer-events-none fixed w-64 h-64 rounded-full border-2 border-cyan-400/50 mix-blend-screen"
                style={{
                    left: "50%",
                    top: "50%",
                    x: "-50%",
                    y: "-50%",
                }}
            />

            {/* FLOATING HUD ACCENTS */}
            <div className="absolute top-8 left-8 flex items-center gap-3 opacity-40">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono tracking-widest text-zinc-300">
                </span>
            </div>

            <div className="absolute bottom-8 text-center opacity-40 font-mono text-xs tracking-[0.6em] text-zinc-400">
                MOVE TO DISPLACE • CLICK TO RIPPLE
            </div>
        </div>
    );
}