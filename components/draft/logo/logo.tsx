"use client";

import React, { useRef, useState } from "react";
import { Cpu, Globe2, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureItem = {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    lightBg: string;
    darkBg: string;
    badge: string;
};

const FEATURES: FeatureItem[] = [
    {
        id: "global-edge",
        title: "Global Edge Network",
        description: "Deploy your compute closest to your users with 275+ globally distributed PoPs.",
        icon: Globe2,
        color: "#3b82f6", // Blue
        lightBg: "rgba(59, 130, 246, 0.1)",
        darkBg: "rgba(59, 130, 246, 0.15)",
        badge: "LATENCY < 10ms",
    },
    {
        id: "zero-trust",
        title: "Zero-Trust Security",
        description: "Granular access controls, automated key rotation, and isolated execution environments.",
        icon: Lock,
        color: "#10b981", // Emerald
        lightBg: "rgba(16, 185, 129, 0.1)",
        darkBg: "rgba(16, 185, 129, 0.15)",
        badge: "SOC2 COMPLIANT",
    },
    {
        id: "neural-compute",
        title: "Neural Acceleration",
        description: "Dedicated tensor cores for running inference workloads at a fraction of the cost.",
        icon: Cpu,
        color: "#8b5cf6", // Violet
        lightBg: "rgba(139, 92, 246, 0.1)",
        darkBg: "rgba(139, 92, 246, 0.15)",
        badge: "GPU ENABLED",
    },
    {
        id: "high-frequency",
        title: "High-Frequency Cache",
        description: "In-memory datastore replication ensuring microsecond read times globally.",
        icon: Zap,
        color: "#f59e0b", // Amber
        lightBg: "rgba(245, 158, 11, 0.1)",
        darkBg: "rgba(245, 158, 11, 0.15)",
        badge: "1.2M OPS/SEC",
    },
];

export function NexusBentoGrid({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            className={cn(
                "mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2",
                className
            )}
            {...props}
        >
            {FEATURES.map((feature) => (
                <InteractiveFeatureCard key={feature.id} feature={feature} />
            ))}
        </div>
    );
}

function InteractiveFeatureCard({ feature }: { feature: FeatureItem }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePos({ x, y });

        // Calculate 3D tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setTilt({
            rx: ((y - centerY) / centerY) * -4, // Subtle tilt
            ry: ((x - centerX) / centerX) * 4,
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTilt({ rx: 0, ry: 0 });
    };

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            style={
                {
                    perspective: "1000px",
                    "--theme-color": feature.color,
                    "--theme-light-bg": feature.lightBg,
                    "--theme-dark-bg": feature.darkBg,
                } as React.CSSProperties
            }
            className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl border border-neutral-300/70 bg-neutral-100/50 p-6 shadow-sm backdrop-blur-md transition-colors duration-500 hover:border-neutral-400/50 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:border-neutral-700/50"
        >
            {/* 1. HIDDEN REVEAL LAYER: Dense Dot Matrix + Gradient */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    // This masks the entire div so it's only visible in a circle around the mouse
                    WebkitMaskImage: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, black 10%, transparent 100%)`,
                    maskImage: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, black 10%, transparent 100%)`,
                }}
            >
                {/* Background color tint */}
                <div className="absolute inset-0 bg-[var(--theme-light-bg)] dark:bg-[var(--theme-dark-bg)]" />

                {/* SVG Dot Pattern */}
                <svg
                    className="absolute inset-0 h-full w-full mix-blend-overlay opacity-60 dark:opacity-40"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id={`dot-pattern-${feature.id}`}
                            width="16"
                            height="16"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle
                                cx="2"
                                cy="2"
                                r="1"
                                fill="currentColor"
                                className="text-neutral-600 dark:text-neutral-400"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#dot-pattern-${feature.id})`} />
                </svg>
            </div>

            {/* 2. CORNER RETICLES (Animated Brackets) */}
            <div className="pointer-events-none absolute inset-4 z-10 transition-transform duration-500 ease-out group-hover:scale-[0.98]">
                {/* Top Left */}
                <svg width="12" height="12" className="absolute left-0 top-0 text-neutral-400 transition-colors duration-300 group-hover:text-[var(--theme-color)] dark:text-neutral-600">
                    <path d="M12 1.5H1.5V12" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {/* Top Right */}
                <svg width="12" height="12" className="absolute right-0 top-0 text-neutral-400 transition-colors duration-300 group-hover:text-[var(--theme-color)] dark:text-neutral-600">
                    <path d="M0 1.5H10.5V12" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {/* Bottom Left */}
                <svg width="12" height="12" className="absolute bottom-0 left-0 text-neutral-400 transition-colors duration-300 group-hover:text-[var(--theme-color)] dark:text-neutral-600">
                    <path d="M12 10.5H1.5V0" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {/* Bottom Right */}
                <svg width="12" height="12" className="absolute bottom-0 right-0 text-neutral-400 transition-colors duration-300 group-hover:text-[var(--theme-color)] dark:text-neutral-600">
                    <path d="M0 10.5H10.5V0" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </div>

            {/* 3. CONTENT (3D Tilted Layer) */}
            <div
                style={{
                    transform: isHovered
                        ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(10px)`
                        : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transition: isHovered
                        ? "transform 0.1s ease-out"
                        : "transform 0.5s ease-out",
                }}
                className="relative z-20 flex h-full flex-col justify-between"
            >
                {/* Top Row: Icon & Badge */}
                <div className="flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-neutral-200/50 transition-all duration-300 group-hover:shadow-md group-hover:ring-[var(--theme-color)] dark:bg-neutral-950 dark:ring-neutral-800">
                        <feature.icon
                            className="size-5 text-neutral-700 transition-colors duration-300 group-hover:text-[var(--theme-color)] dark:text-neutral-300"
                            strokeWidth={1.5}
                        />
                    </div>
                    <span className="rounded-full bg-neutral-200/50 px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest text-neutral-600 transition-colors duration-300 group-hover:bg-white group-hover:text-[var(--theme-color)] dark:bg-neutral-800/50 dark:text-neutral-400 dark:group-hover:bg-neutral-900">
                        {feature.badge}
                    </span>
                </div>

                {/* Bottom Row: Text Content */}
                <div className="mt-8 space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                        {feature.title}
                    </h3>
                    <p className="text-sm font-medium leading-relaxed text-neutral-500 transition-colors duration-300 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-300">
                        {feature.description}
                    </p>
                </div>
            </div>
        </div>
    );
}