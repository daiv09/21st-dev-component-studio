'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

interface ContributionDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
    index: number;
}

const generateMockData = (): ContributionDay[] => {
    const days: ContributionDay[] = [];
    const today = new Date();

    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const isActive = Math.random() > 0.4;
        const count = isActive ? Math.floor(Math.random() * 15) + 1 : 0;

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count > 0 && count <= 3) level = 1;
        else if (count > 3 && count <= 6) level = 2;
        else if (count > 6 && count <= 10) level = 3;
        else if (count > 10) level = 4;

        days.push({
            date: date.toISOString().split('T')[0],
            count,
            level,
            index: 365 - i,
        });
    }
    return days;
};

// Magnetic Button Component for your GitHub handle
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

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.a
            href="https://github.com/daiv09"
            target="_blank"
            rel="noopener noreferrer"
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black dark:bg-black dark:text-white font-semibold text-sm hover:scale-105 transition-colors z-20"
        >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            @daiv09
        </motion.a>
    );
};

export default function GithubContributions() {
    const [contributions, setContributions] = useState<ContributionDay[]>([]);
    const [hoveredCell, setHoveredCell] = useState<ContributionDay | null>(null);
    const [totalContributions, setTotalContributions] = useState(0);

    // 3D Tilt & Spotlight Setup
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring animations for smooth tilting
    const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

    // Transform mouse position into rotation angles (3D effect)
    const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

    // Spotlight coordinates
    const spotlightX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 30 });
    const spotlightY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 30 });

    // Animated Counter
    const count = useMotionValue(0);
    const roundedCount = useTransform(count, Math.round);

    useEffect(() => {
        const data = generateMockData();
        setContributions(data);
        const total = data.reduce((acc, curr) => acc + curr.count, 0);
        setTotalContributions(total);

        const animation = animate(count, total, { duration: 2.5, ease: "circOut" });
        return animation.stop;
    }, [count]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalize coordinates from -0.5 to 0.5
        mouseX.set(x / width - 0.5);
        mouseY.set(y / height - 0.5);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // Inverted Palette (Light mode = Dark UI, Dark mode = Light UI)
    const getLevelColor = (level: number) => {
        switch (level) {
            case 1: return 'bg-[#404040] dark:bg-[#a3a3a3]';
            case 2: return 'bg-[#737373] dark:bg-[#737373]';
            case 3: return 'bg-[#a3a3a3] dark:bg-[#404040]';
            case 4: return 'bg-white dark:bg-black shadow-[0_0_12px_rgba(255,255,255,0.6)] dark:shadow-[0_0_12px_rgba(0,0,0,0.6)] z-10';
            case 0: default: return 'bg-[#1a1a1a] dark:bg-[#e5e5e5]';
        }
    };

    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

    return (
        <div className="w-full min-h-[500px] flex items-center justify-center p-4 perspective-[2000px]">
            <motion.div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="w-full max-w-6xl p-6 md:p-12 rounded-3xl bg-black dark:bg-white text-white dark:text-black border border-neutral-800 dark:border-neutral-200 transition-colors duration-500 shadow-2xl relative overflow-hidden group"
            >
                {/* Dynamic Spotlight */}
                <motion.div
                    className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay dark:mix-blend-multiply"
                    style={{
                        background: useTransform(
                            [spotlightX, spotlightY],
                            ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 40%)`
                        )
                    }}
                />

                <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">

                        <div className="flex flex-col gap-4">
                            <MagneticHandle>@daiv09</MagneticHandle>
                            <div>
                                <h2 className="text-3xl sm:text-5xl font-black tracking-tighter flex items-baseline gap-2 overflow-hidden">
                                    <motion.span
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                    >
                                        {roundedCount}
                                    </motion.span>
                                    <span className="text-xl sm:text-2xl font-bold text-neutral-400 dark:text-neutral-500 tracking-tight">
                                        contributions
                                    </span>
                                </h2>
                            </div>
                        </div>

                        {/* Dynamic Interactive Tooltip */}
                        <div className="h-10 flex items-center">
                            <AnimatePresence mode="wait">
                                {hoveredCell ? (
                                    <motion.div
                                        key="tooltip"
                                        initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="text-sm font-medium py-2 px-5 rounded-full bg-neutral-900 dark:bg-neutral-100 border border-neutral-800 dark:border-neutral-300 shadow-xl flex items-center gap-2"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${getLevelColor(hoveredCell.level)}`} />
                                        <span className="font-bold text-white dark:text-black">
                                            {hoveredCell.count === 0 ? 'No' : hoveredCell.count}
                                        </span>
                                        <span className="text-neutral-400 dark:text-neutral-500">
                                            on {new Date(hoveredCell.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-sm tracking-widest uppercase text-neutral-600 dark:text-neutral-400 font-bold"
                                    >
                                        Hover Grid to Inspect
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Graph Container */}
                    <div className="w-full perspective-[1000px]">
                        {/* Months Row */}
                        <div className="hidden sm:flex text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mb-4 pl-[30px] justify-between pr-2 font-bold tracking-wider">
                            {months.map((month, i) => (
                                <div key={i}>{month}</div>
                            ))}
                        </div>

                        <div className="flex gap-2 w-full">
                            {/* Days Column */}
                            <div className="flex flex-col gap-1 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 justify-between py-1 pr-1 w-6 sm:w-8 shrink-0 font-bold tracking-wider">
                                <span className="h-2 sm:h-3 flex items-center">Mon</span>
                                <span className="h-2 sm:h-3 flex items-center">Wed</span>
                                <span className="h-2 sm:h-3 flex items-center">Fri</span>
                            </div>

                            {/* Fluid 3D Grid */}
                            <div className="grid grid-flow-col grid-rows-7 flex-1 gap-[3px] sm:gap-[4px] md:gap-[5px] lg:gap-2 justify-between">
                                {contributions.map((day) => {
                                    const isDimmed = hoveredCell !== null && hoveredCell.date !== day.date;

                                    return (
                                        <motion.div
                                            key={day.date}
                                            initial={{ opacity: 0, scale: 0, z: -100 }}
                                            animate={{
                                                opacity: isDimmed ? 0.2 : 1,
                                                scale: 1,
                                                z: 0
                                            }}
                                            transition={{
                                                opacity: { duration: 0.3 },
                                                scale: { duration: 0.5, delay: (day.index % 30) * 0.015, type: "spring", stiffness: 200, damping: 15 },
                                                z: { duration: 0.5, delay: (day.index % 30) * 0.015, type: "spring" }
                                            }}
                                            onMouseEnter={() => setHoveredCell(day)}
                                            onMouseLeave={() => setHoveredCell(null)}
                                            className={`
                        w-[4px] h-[4px] sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-[16px] lg:h-[16px] 
                        rounded-sm cursor-pointer 
                        transition-all duration-300 ease-out
                        hover:scale-[1.8] hover:-translate-y-1 hover:z-30 hover:ring-2 hover:ring-white dark:hover:ring-black
                        hover:shadow-[0_10px_20px_rgba(255,255,255,0.2)] dark:hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]
                        ${getLevelColor(day.level)}
                      `}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}