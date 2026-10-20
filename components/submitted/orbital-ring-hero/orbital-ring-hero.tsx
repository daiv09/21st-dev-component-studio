"use client";

import {
    motion,
    useReducedMotion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionValueEvent,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const IMAGES = [
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80", alt: "Portrait" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80", alt: "Minimal" },
    { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80", alt: "Fashion" },
    { src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80", alt: "Editorial" },
    { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80", alt: "Studio" },
    { src: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", alt: "Neon" },
    { src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=80", alt: "Profile" },
    { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80", alt: "Monochrome" },
];


const SPRING_CONFIG = { stiffness: 70, damping: 20, mass: 0.5 };

interface StageDimensions {
    width: number;
    height: number;
    isMobile: boolean;
}

interface OrbitalCardProps {
    item: { src: string; alt: string };
    index: number;
    total: number;
    progress: any;
    pointer: { x: any; y: any };
    isExpanded: boolean;
    stage: StageDimensions;
}

function OrbitalCard({
    item,
    index,
    total,
    progress,
    pointer,
    isExpanded,
    stage,
}: OrbitalCardProps) {
    const baseAngle = (index / total) * Math.PI * 2;
    const depthFactor = 0.5 + Math.sin(baseAngle) * 0.5;

    // Compact, minimal card dimensions
    const cardWidth = stage.isMobile ? 64 : 84;
    const cardHeight = stage.isMobile ? 88 : 114;

    // Tight, balanced orbital radius inside the minimal frame
    const radiusX = Math.min(stage.width * 0.34, stage.isMobile ? 115 : 195);
    const radiusY = Math.min(stage.height * 0.33, stage.isMobile ? 120 : 155);

    const translate = useTransform(
        [progress, pointer.x, pointer.y],
        ([p, px, py]: number[]) => {
            const easeP = 1 - Math.pow(1 - p, 3);
            const currentAngle = baseAngle + (1 - easeP) * Math.PI * 0.85;

            const tx = Math.cos(currentAngle) * (radiusX * easeP);
            const ty = Math.sin(currentAngle) * (radiusY * easeP);

            const maxParallax = stage.isMobile ? 6 : 12;
            const dx = tx + px * maxParallax * depthFactor * easeP;
            const dy = ty + py * maxParallax * depthFactor * easeP;

            return `calc(-50% + ${dx}px) calc(-50% + ${dy}px)`;
        }
    );

    const targetRotation = (baseAngle * 180) / Math.PI + 90;
    const rotate = useTransform(progress, [0, 1], [index * 5 - 18, targetRotation]);
    const scale = useTransform(progress, [0, 0.5, 1], [0.82, 0.9, 1]);

    return (
        <motion.div
            className="absolute left-1/2 top-1/2 will-change-transform cursor-pointer select-none"
            style={{
                width: cardWidth,
                height: cardHeight,
                zIndex: index + 1,
                translate,
                rotate,
                scale,
            }}
            whileHover={
                isExpanded
                    ? {
                        scale: 1.18,
                        zIndex: 50,
                        transition: SPRING_CONFIG,
                    }
                    : { scale: 0.86 }
            }
            whileTap={{ scale: 1.08, zIndex: 50 }}
        >
            <div className="group relative h-full w-full overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800 shadow-md shadow-black/10 dark:shadow-black/50 ring-1 ring-black/10 dark:ring-white/15 transition-shadow duration-300 hover:shadow-xl hover:ring-neutral-900/30 dark:hover:ring-white/40">
                <img
                    src={item.src}
                    alt={item.alt}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
            </div>
        </motion.div>
    );
}

export default function OrbitalRingHero() {
    const stageRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    // Raw progress (0 = stacked in center, 1 = expanded orbit)
    const rawProgress = useMotionValue(0);
    const progress = useSpring(rawProgress, SPRING_CONFIG);

    const [isExpanded, setIsExpanded] = useState(false);
    useMotionValueEvent(progress, "change", (p) => setIsExpanded(p > 0.65));

    const [stage, setStage] = useState<StageDimensions>({
        width: 640,
        height: 460,
        isMobile: false,
    });

    // Pointer parallax relative to the card container
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const pointerX = useSpring(rawX, SPRING_CONFIG);
    const pointerY = useSpring(rawY, SPRING_CONFIG);

    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const updateDimensions = () => {
            const rect = el.getBoundingClientRect();
            setStage({
                width: rect.width,
                height: rect.height,
                isMobile: rect.width < 500,
            });
        };

        updateDimensions();
        const observer = new ResizeObserver(updateDimensions);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Smooth wheel control directly over the component
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            const current = rawProgress.get();
            const delta = e.deltaY * 0.0018;
            const next = Math.min(1, Math.max(0, current + delta));

            // Capture wheel while animating between 0 and 1
            if ((e.deltaY > 0 && current < 1) || (e.deltaY < 0 && current > 0)) {
                e.preventDefault();
                rawProgress.set(next);
            }
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [rawProgress]);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (reduce) return;
        const rect = e.currentTarget.getBoundingClientRect();
        rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
        rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    };

    const handlePointerLeave = () => {
        rawX.set(0);
        rawY.set(0);
    };

    const toggleOrbit = () => {
        rawProgress.set(rawProgress.get() > 0.5 ? 0 : 1);
    };

    const textOpacity = useTransform(progress, [0.35, 0.85], [0, 1]);
    const textScale = useTransform(progress, [0.35, 0.9], [0.88, 1]);
    const ringScale = useTransform(progress, [0, 1], [0.3, 1]);

    const ringW = Math.min(stage.width * 0.68, stage.isMobile ? 230 : 390);
    const ringH = Math.min(stage.height * 0.66, stage.isMobile ? 240 : 310);

    return (
        <section className="mx-auto w-full max-w-2xl flex flex-col items-center justify-center">
            <div
                ref={stageRef}
                onClick={toggleOrbit}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative h-[420px] sm:h-[480px] w-full overflow-hidden rounded-2xl bg-white dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-center justify-center cursor-pointer transition-colors duration-300"
            >
                {/* Minimal Dot Background */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_50%,transparent_100%)]" />

                {/* Subtle Guide Orbit Ring */}
                <motion.div
                    style={{
                        width: ringW,
                        height: ringH,
                        scale: ringScale,
                        opacity: textOpacity,
                    }}
                    className="pointer-events-none absolute rounded-full border border-dashed border-neutral-200 dark:border-neutral-800"
                />

                {/* Center Typography */}
                <motion.div
                    style={{ opacity: textOpacity, scale: textScale }}
                    className="pointer-events-none z-20 flex flex-col items-center text-center px-4 max-w-[200px] sm:max-w-[240px]"
                >
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500 mb-1">
                        01 / Orbit
                    </span>
                    <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                        Polar Array
                    </h2>
                    <p className="mt-1 text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        Scroll or click anywhere to toggle the orbital ring.
                    </p>
                </motion.div>

                {/* Orbital Cards */}
                <div className="absolute inset-0 z-10 pointer-events-auto">
                    {IMAGES.map((item, i) => (
                        <OrbitalCard
                            key={i}
                            item={item}
                            index={i}
                            total={IMAGES.length}
                            progress={progress}
                            pointer={{ x: pointerX, y: pointerY }}
                            isExpanded={isExpanded}
                            stage={stage}
                        />
                    ))}
                </div>

                {/* Minimal Bottom Pill Indicator */}
                <div className="pointer-events-none absolute bottom-3.5 z-30 flex items-center gap-2 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-md px-3 py-1 border border-neutral-200/70 dark:border-neutral-700/70 text-[10px] font-medium tracking-wide text-neutral-600 dark:text-neutral-300">
                    <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${isExpanded ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                    />
                    <span>{isExpanded ? "Scroll up or click to stack" : "Scroll or click to expand"}</span>
                </div>
            </div>
        </section>
    );
}
