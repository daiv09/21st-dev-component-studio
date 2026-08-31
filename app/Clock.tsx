'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// Magnetic Button Component
const MagneticHandle = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLAnchorElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.a
            href="https://github.com/daiv09"
            target="_blank"
            rel="noopener noreferrer"
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black dark:bg-black dark:text-white font-semibold text-sm hover:scale-105 transition-transform z-20 shadow-lg"
        >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            @daiv09
        </motion.a>
    );
};

export default function ISTClock() {
    const [isMounted, setIsMounted] = useState(false);
    const [digitalTime, setDigitalTime] = useState('');

    // 3D Tilt Setup
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(springY, [-0.5, 0.5], [15, -15]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-15, 15]);

    // Clock Hands Setup (Using MotionValues to bypass React state for buttery 60fps)
    const hrRotation = useMotionValue(0);
    const minRotation = useMotionValue(0);
    const secRotation = useMotionValue(0);

    useEffect(() => {
        setIsMounted(true);

        const updateClock = () => {
            // Strictly calculate IST (UTC + 5:30)
            const now = new Date();
            const utc = now.getTime() + now.getTimezoneOffset() * 60000;
            const ist = new Date(utc + 3600000 * 5.5);

            const ms = ist.getMilliseconds();
            const s = ist.getSeconds();
            const m = ist.getMinutes();
            const h = ist.getHours();

            // Smooth sweeping formulas
            secRotation.set((s + ms / 1000) * 6);
            minRotation.set((m + s / 60) * 6);
            hrRotation.set(((h % 12) + m / 60) * 30);

            // Digital time format (HH:MM:SS)
            setDigitalTime(
                `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            );
        };

        updateClock();
        // 30ms interval allows for near-perfect fluid sweeping motion of the second hand
        const interval = setInterval(updateClock, 30);
        return () => clearInterval(interval);
    }, [hrRotation, minRotation, secRotation]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    if (!isMounted) return <div className="w-full min-h-[500px]" />; // Prevent SSR hydration mismatch

    return (
        <div className="w-full min-h-[600px] flex items-center justify-center p-4 perspective-[2000px]">
            <motion.div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full max-w-4xl p-8 md:p-12 rounded-[2rem] bg-black dark:bg-white text-white dark:text-black border border-neutral-800 dark:border-neutral-200 transition-colors duration-500 shadow-2xl relative flex flex-col items-center gap-12"
            >
                {/* Header - Strictly NO text blur */}
                <div className="w-full flex justify-between items-start" style={{ transform: "translateZ(40px)" }}>
                    <div>
                        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
                            IST Classic
                        </h2>
                        <p className="text-sm font-semibold tracking-widest text-neutral-500 mt-2 uppercase">
                            Indian Standard Time
                        </p>
                    </div>
                    <MagneticHandle>@daiv09</MagneticHandle>
                </div>

                {/* 3D Clock Container */}
                <div className="relative w-64 h-64 sm:w-80 sm:h-80" style={{ transform: "translateZ(60px)" }}>

                    {/* Clock Dial Rim */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className="absolute inset-0 rounded-full border-[8px] border-white dark:border-black shadow-[inset_0_0_40px_rgba(255,255,255,0.1)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] bg-neutral-950 dark:bg-neutral-50"
                    >
                        {/* Hour & Minute Markers */}
                        {[...Array(60)].map((_, i) => {
                            const isHour = i % 5 === 0;
                            return (
                                <div
                                    key={i}
                                    className="absolute top-0 left-1/2 -translate-x-1/2"
                                    style={{
                                        height: '100%',
                                        transform: `rotate(${i * 6}deg)`,
                                    }}
                                >
                                    <div
                                        className={`mt-2 rounded-full ${isHour
                                                ? 'w-1.5 h-5 bg-white dark:bg-black'
                                                : 'w-0.5 h-2 bg-neutral-700 dark:bg-neutral-300'
                                            }`}
                                    />
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* Hands */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Hour Hand */}
                        <motion.div
                            style={{ rotate: hrRotation }}
                            className="absolute w-2 h-20 sm:h-24 bg-white dark:bg-black rounded-full origin-bottom mb-[80px] sm:mb-[96px] shadow-lg"
                        />
                        {/* Minute Hand */}
                        <motion.div
                            style={{ rotate: minRotation }}
                            className="absolute w-1.5 h-28 sm:h-36 bg-neutral-300 dark:bg-neutral-700 rounded-full origin-bottom mb-[112px] sm:mb-[144px] shadow-lg"
                        />
                        {/* Second Hand (Smooth Sweep) */}
                        <motion.div
                            style={{ rotate: secRotation }}
                            className="absolute w-0.5 h-32 sm:h-40 bg-red-500 rounded-full origin-[50%_75%] mb-[64px] sm:mb-[80px] z-10"
                        />

                        {/* Center Pin */}
                        <div className="absolute w-4 h-4 rounded-full bg-red-500 z-20 border-2 border-black dark:border-white" />
                    </div>
                </div>

                {/* Digital Readout */}
                <div style={{ transform: "translateZ(30px)" }} className="flex flex-col items-center">
                    <div className="font-mono text-3xl sm:text-4xl font-bold tracking-widest bg-neutral-900 dark:bg-neutral-100 px-6 py-2 rounded-lg border border-neutral-800 dark:border-neutral-300">
                        {digitalTime}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 mt-3">
                        UTC + 05:30
                    </span>
                </div>

            </motion.div>
        </div>
    );
}