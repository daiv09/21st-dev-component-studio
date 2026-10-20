"use client";

import {
    motion,
    useTransform,
    useReducedMotion,
    useMotionValue,
    useSpring,
    useMotionValueEvent,
    MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const IMAGES = [
    { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80", alt: "Villa" },
    { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80", alt: "Pavilion" },
    { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80", alt: "Mansion" },
    { src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80", alt: "Interior" },
    { src: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=80", alt: "Courtyard" },
    { src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&auto=format&fit=crop&q=80", alt: "Facade" },
    { src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80", alt: "Loft" },
    { src: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&auto=format&fit=crop&q=80", alt: "Concrete" },
];

const SPRING_CONFIG = { stiffness: 65, damping: 22, mass: 0.5 };

interface StageDimensions {
    width: number;
    height: number;
    isMobile: boolean;
}

interface CurtainCardProps {
    item: { src: string; alt: string };
    index: number;
    total: number;
    progress: MotionValue<number>;
    pointer: { x: MotionValue<number>; y: MotionValue<number> };
    isSpreadActive: boolean;
    stage: StageDimensions;
}

function CurtainCard({
    item,
    index,
    total,
    progress,
    pointer,
    isSpreadActive,
    stage,
}: CurtainCardProps) {
    const half = total / 2;
    const isLeft = index % 2 === 0;
    const wingIndex = Math.floor(index / 2); // 0 to 3
    const norm = wingIndex / (half - 1) - 0.5; // -0.5 to 0.5
    const sideMult = isLeft ? -1 : 1;

    // Compact card dimensions bounded strictly to stage
    const cardWidth = stage.isMobile ? 70 : 92;
    const cardHeight = stage.isMobile ? 95 : 124;

    // Compact wing coordinates within container bounds
    const archCurve = Math.cos(norm * Math.PI) * (stage.width * 0.025);
    const targetX = sideMult * (stage.width * (stage.isMobile ? 0.32 : 0.34) + archCurve);
    const targetY = norm * (stage.height * 0.58);
    const targetRotate = sideMult * (norm * 18);

    const initialX = sideMult * (wingIndex * 4);
    const initialY = norm * 10;
    const initialRotate = sideMult * (wingIndex * 2);


    const translate = useTransform(
        [progress, pointer.x, pointer.y],
        ([p, px, py]: number[]) => {
            // Smooth ease out cubic for curtain split
            const easeP = 1 - Math.pow(1 - p, 3);

            const tx = initialX + (targetX - initialX) * easeP;
            const ty = initialY + (targetY - initialY) * easeP;

            const maxParallaxX = stage.isMobile ? 8 : 16;
            const maxParallaxY = stage.isMobile ? 6 : 14;

            const dx = tx + px * (isLeft ? -maxParallaxX : maxParallaxX) * easeP;
            const dy = ty + py * maxParallaxY * easeP;

            return `calc(-50% + ${dx}px) calc(-50% + ${dy}px)`;
        }
    );

    const rotate = useTransform(
        progress,
        [0, 0.45, 1],
        [initialRotate, isLeft ? -14 : 14, targetRotate]
    );

    const scale = useTransform(progress, [0, 0.5, 1], [1, 0.96, 0.92]);

    return (
        <motion.div
            className="absolute left-1/2 top-1/2 will-change-transform cursor-pointer select-none"
            style={{
                width: cardWidth,
                height: cardHeight,
                zIndex: isLeft ? index + 1 : total - index,
                translate,
                rotate,
                scale,
            }}
            whileHover={
                isSpreadActive
                    ? {
                        scale: 1.08,
                        zIndex: 50,
                        rotate: 0,
                        transition: SPRING_CONFIG,
                    }
                    : { scale: 0.98 }
            }
            whileTap={{ scale: 1.04, zIndex: 50 }}
        >
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-stone-200 dark:bg-stone-800 shadow-xl shadow-black/15 dark:shadow-black/60 ring-1 ring-black/10 dark:ring-white/15 transition-shadow duration-300 hover:shadow-2xl hover:ring-stone-900/40 dark:hover:ring-white/40">
                <img
                    src={item.src}
                    alt={item.alt}
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-110"
                />
            </div>
        </motion.div>
    );
}

export default function CurtainSplitHero() {
    const stageRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    const [stage, setStage] = useState<StageDimensions>({
        width: 1000,
        height: 640,
        isMobile: false,
    });

    // Local smooth progress (0 = closed curtain in center, 1 = parted wings)
    const rawProgress = useMotionValue(0);
    const progress = useSpring(rawProgress, SPRING_CONFIG);

    const [isSpreadActive, setIsSpreadActive] = useState(false);
    useMotionValueEvent(progress, "change", (p) => setIsSpreadActive(p > 0.65));

    // Pointer parallax
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
                isMobile: rect.width < 768,
            });
        };

        updateDimensions();
        const observer = new ResizeObserver(updateDimensions);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Local smooth wheel handling directly on the component
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            const current = rawProgress.get();
            const delta = e.deltaY * 0.002;
            const next = Math.min(1, Math.max(0, current + delta));

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

    const toggleCurtain = () => {
        rawProgress.set(rawProgress.get() > 0.5 ? 0 : 1);
    };

    const textY = useTransform(progress, [0.25, 0.85], [30, 0]);
    const textOpacity = useTransform(progress, [0.3, 0.8], [0, 1]);
    const lineScale = useTransform(progress, [0.35, 0.85], [0, 1]);

    return (
        <section className="relative w-full flex flex-col items-center justify-center">
            <div
                ref={stageRef}
                onClick={toggleCurtain}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative h-[430px] sm:h-[480px] md:h-[510px] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#F5F2EB] dark:bg-[#111110] text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex items-center justify-center cursor-pointer transition-colors duration-300"
            >
                {/* Subtle Architectural Dot / Grid Pattern */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d6d3d1_1px,transparent_1px)] dark:bg-[radial-gradient(#292524_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_50%,transparent_100%)] opacity-80" />

                {/* Center Editorial Headline */}
                <motion.div
                    className="pointer-events-none z-[5] flex flex-col items-center text-center px-4 max-w-xs sm:max-w-sm"
                    style={{ y: textY, opacity: textOpacity }}
                >
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
                        Monograph No. 04
                    </span>
                    <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight leading-[0.95] font-serif">
                        Architectural
                        <br />
                        Symmetry.
                    </h2>
                    <motion.div
                        style={{ scaleX: lineScale }}
                        className="my-3 sm:my-4 h-px w-14 sm:w-16 bg-stone-400 dark:bg-stone-600 origin-center"
                    />
                    <p className="max-w-[32ch] text-[11px] sm:text-xs font-light text-stone-600 dark:text-stone-400 leading-relaxed">
                        Unfolding spatial narratives through raw concrete, natural light, and balanced bilateral geometry.
                    </p>
                </motion.div>


                {/* Bilateral Curtain Cards */}
                <div className="absolute inset-0 z-10 pointer-events-auto">
                    {IMAGES.map((item, i) => (
                        <CurtainCard
                            key={i}
                            item={item}
                            index={i}
                            total={IMAGES.length}
                            progress={progress}
                            pointer={{ x: pointerX, y: pointerY }}
                            isSpreadActive={isSpreadActive}
                            stage={stage}
                        />
                    ))}
                </div>

                {/* Bottom Status Pill Indicator */}
                <div className="pointer-events-none absolute bottom-4 z-30 flex items-center gap-2 rounded-full bg-stone-200/80 dark:bg-stone-800/80 backdrop-blur-md px-3.5 py-1.5 border border-stone-300/70 dark:border-stone-700/70 text-[10px] font-medium tracking-wide text-stone-700 dark:text-stone-300">
                    <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                            isSpreadActive ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                    />
                    <span>{isSpreadActive ? "Scroll up or click to close curtain" : "Scroll down or click to unveil"}</span>
                </div>
            </div>
        </section>
    );
}