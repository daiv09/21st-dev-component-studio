"use client";

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

// Clean, curated set of 8 images hosted on allowed CDN
const IMAGES = [
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img8.png", alt: "Plane" },
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img2.png", alt: "Painting" },
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img7.png", alt: "Breaker" },
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img3.png", alt: "Dog" },
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img5.png", alt: "Footballer" },
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img6.png", alt: "Jacket" },
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img1.png", alt: "Meadow" },
    { src: "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/vault-listing-images/assets-images/stack-spread/img4.png", alt: "Stripes" },
];


interface VortexCardData {
    item: { src: string; alt: string };
    baseAngle: number;
    radiusX: number;
    radiusY: number;
    depthOffset: number;
    z: number;
}

const generateVortexCards = (): VortexCardData[] => {
    const total = IMAGES.length;
    return IMAGES.map((item, i) => {
        // Smooth 1.5-turn spiral
        const angle = (i / total) * Math.PI * 3;
        const radiusBase = 18 + i * 2.2;

        return {
            item,
            baseAngle: (angle * 180) / Math.PI,
            radiusX: radiusBase,
            radiusY: radiusBase * 0.65, // Elliptical orbit gives natural 3D depth
            depthOffset: (i / total) * 0.35,
            z: i + 1,
        };
    });
};

const VORTEX_CARDS = generateVortexCards();

function VortexCard({ card, progress }: { card: VortexCardData; progress: any }) {
    const { item, baseAngle, radiusX, radiusY, depthOffset, z } = card;

    // Smooth, gentle rotation across the scroll
    const currentAngle = useTransform(progress, [0, 1], [baseAngle, baseAngle + 180]);

    // Elliptical coordinate mapping
    const x = useTransform(currentAngle, (a) => Math.cos((a * Math.PI) / 180) * radiusX);
    const y = useTransform(currentAngle, (a) => Math.sin((a * Math.PI) / 180) * radiusY);

    // Staggered depth: scale and opacity
    const localP = useTransform(progress, [0, 1], [-depthOffset, 1.15 - depthOffset]);
    const scale = useTransform(localP, [0, 0.25, 0.75, 1], [0.15, 0.7, 1.25, 2.6]);
    const opacity = useTransform(localP, [0, 0.12, 0.8, 1], [0, 1, 1, 0]);

    return (
        <motion.div
            className="absolute left-1/2 top-1/2 will-change-transform origin-center w-28 h-40 sm:w-36 sm:h-52 md:w-48 md:h-64 pointer-events-auto"
            style={{
                zIndex: z,
                x: useTransform(x, (val) => `calc(-50% + ${val}vw)`),
                y: useTransform(y, (val) => `calc(-50% + ${val}vh)`),
                rotate: useTransform(currentAngle, (a) => a * 0.35),
                scale,
                opacity,
            }}
        >
            <div className="group relative h-full w-full overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-neutral-900/60 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>
        </motion.div>
    );
}

export default function ZAxisVortex() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: wrapRef,
        offset: ["start start", "end end"],
    });

    // Silky spring physics for smooth scroll response
    const progress = useSpring(scrollYProgress, {
        stiffness: 60,
        damping: 25,
        restDelta: 0.001,
    });

    const titleScale = useTransform(progress, [0, 0.6], [1, 2]);
    const titleOpacity = useTransform(progress, [0, 0.35], [1, 0]);

    // Reduced height from 400vh to 220vh, added overflow-clip
    return (
        <section
            ref={wrapRef}
            className="relative w-full h-[220vh] bg-white dark:bg-black text-black dark:text-white overflow-clip"
        >
            <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-100 via-neutral-200 to-white dark:from-neutral-900 dark:via-neutral-950 dark:to-black">
                {/* Background ambient glow */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 dark:from-sky-500/15 dark:to-purple-500/15 blur-3xl" />
                </div>

                {/* Cards Container */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {VORTEX_CARDS.map((card, i) => (
                        <VortexCard key={i} card={card} progress={progress} />
                    ))}
                </div>

                {/* Center Title */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <motion.h2
                        className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-widest uppercase text-neutral-800/40 dark:text-white/30 mix-blend-overlay select-none"
                        style={{
                            scale: titleScale,
                            opacity: titleOpacity,
                        }}
                    >
                        The Vortex
                    </motion.h2>
                </div>
            </div>
        </section>
    );
}