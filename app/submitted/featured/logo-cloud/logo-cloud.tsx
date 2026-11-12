"use client";

import React, { useRef, useState } from "react";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoItem = {
    name: string;
    src: string;
    alt: string;
    lightGlow: string;
    darkGlow: string;
    lightAccent: string;
    darkAccent: string;
    tag: string;
    badge: string;
};

// 6 Curated High-Contrast Brand Cards (Turso & OpenAI feature adaptive Black/White hover)
const LOGOS: LogoItem[] = [
    {
        name: "NVIDIA",
        src: "https://svgl.app/library/nvidia-wordmark-light.svg",
        alt: "Nvidia Logo",
        lightGlow: "rgba(118, 185, 0, 0.25)", // Neon Lime Green
        darkGlow: "rgba(118, 185, 0, 0.25)",
        lightAccent: "#76b900",
        darkAccent: "#76b900",
        tag: "GPU & Tensor Processing",
        badge: "01 // COMPUTE",
    },
    {
        name: "Supabase",
        src: "https://svgl.app/library/supabase_wordmark_light.svg",
        alt: "Supabase Logo",
        lightGlow: "rgba(62, 207, 142, 0.25)", // Vibrant Emerald
        darkGlow: "rgba(62, 207, 142, 0.25)",
        lightAccent: "#3ecf8e",
        darkAccent: "#3ecf8e",
        tag: "Relational Edge Engine",
        badge: "02 // DATABASE",
    },
    {
        name: "OpenAI",
        src: "https://svgl.app/library/openai_wordmark_light.svg",
        alt: "OpenAI Logo",
        lightGlow: "rgba(0, 0, 0, 0.15)", // Pure Black for Light Mode
        darkGlow: "rgba(255, 255, 255, 0.15)", // Pure White for Dark Mode
        lightAccent: "#000000",
        darkAccent: "#ffffff",
        tag: "Foundation Models",
        badge: "03 // INTELLIGENCE",
    },
    {
        name: "Turso",
        src: "https://svgl.app/library/turso-wordmark-light.svg",
        alt: "Turso Logo",
        lightGlow: "rgba(0, 0, 0, 0.15)", // Pure Black for Light Mode
        darkGlow: "rgba(255, 255, 255, 0.15)", // Pure White for Dark Mode
        lightAccent: "#000000",
        darkAccent: "#ffffff",
        tag: "Distributed Replication",
        badge: "04 // STORAGE",
    },
    {
        name: "Clerk",
        src: "https://svgl.app/library/clerk-wordmark-light.svg",
        alt: "Clerk Logo",
        lightGlow: "rgba(108, 71, 255, 0.25)", // Royal Indigo / Violet
        darkGlow: "rgba(108, 71, 255, 0.25)",
        lightAccent: "#6c47ff",
        darkAccent: "#6c47ff",
        tag: "Identity & Key Access",
        badge: "05 // AUTH",
    },
    {
        name: "Claude",
        src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg",
        alt: "Claude AI Logo",
        lightGlow: "rgba(217, 119, 6, 0.25)", // Amber / Terracotta
        darkGlow: "rgba(217, 119, 6, 0.25)",
        lightAccent: "#d97706",
        darkAccent: "#d97706",
        tag: "Context Reasoning Node",
        badge: "06 // REASONING",
    },
];

export function LogoCloud({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ x: 0, y: 0, opacity: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            opacity: 1,
        });
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setCoords((prev) => ({ ...prev, opacity: 0 }))}
            className={cn(
                "relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-neutral-300/60 bg-gradient-to-b from-neutral-100/50 via-background to-neutral-100/30 p-2 shadow-2xl backdrop-blur-xl transition-all duration-700 dark:border-neutral-800/80 dark:from-neutral-900/40 dark:via-background dark:to-neutral-950/60",
                className
            )}
            {...props}
        >
            {/* Background Animated SVG Circuit Tracer Lines */}
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-40 dark:opacity-20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="circuit-pattern"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0.75"
                            className="text-neutral-400 dark:text-neutral-700"
                            strokeDasharray="2 4"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
            </svg>

            {/* Global Interactive Flash Beam */}
            <div
                className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-700 ease-out"
                style={{
                    opacity: coords.opacity,
                    background: `radial-gradient(500px circle at ${coords.x}px ${coords.y}px, rgba(120, 120, 120, 0.08), transparent 75%)`,
                }}
            />

            {/* Main Grid Mesh (Responsive: 2 cols mobile, 3 cols tablet/desktop) */}
            <div className="relative grid grid-cols-2 divide-x divide-y divide-neutral-300/60 rounded-[20px] border border-neutral-300/60 bg-white/30 backdrop-blur-md md:grid-cols-3 dark:divide-neutral-800/60 dark:border-neutral-800/60 dark:bg-neutral-950/40">
                {LOGOS.map((item, index) => (
                    <InteractiveLogoCard key={item.name} item={item} index={index} />
                ))}
            </div>
        </div>
    );
}

function InteractiveLogoCard({
    item,
    index,
}: {
    item: LogoItem;
    index: number;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePos({ x, y });

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        setTilt({
            rx: ((y - centerY) / centerY) * -7,
            ry: ((x - centerX) / centerX) * 7,
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
                    perspective: "800px",
                    "--light-color": item.lightAccent,
                    "--dark-color": item.darkAccent,
                } as React.CSSProperties
            }
            className="group relative flex h-36 flex-col items-center justify-between p-4.5 select-none md:h-44"
        >
            {/* Light Mode Cursor Spotlight */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:hidden"
                style={{
                    background: `radial-gradient(160px circle at ${mousePos.x}px ${mousePos.y}px, ${item.lightGlow}, transparent 80%)`,
                }}
            />

            {/* Dark Mode Cursor Spotlight */}
            <div
                className="pointer-events-none absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:block"
                style={{
                    background: `radial-gradient(160px circle at ${mousePos.x}px ${mousePos.y}px, ${item.darkGlow}, transparent 80%)`,
                }}
            />

            {/* Cyber Grid Crosshairs at the vertex */}
            <div className="pointer-events-none absolute -right-[9px] -bottom-[9px] z-30 flex items-center justify-center">
                <PlusIcon
                    className={cn(
                        "size-4 text-neutral-400/40 transition-all duration-500 ease-out dark:text-neutral-600/60",
                        isHovered &&
                        "rotate-90 scale-125 text-[color:var(--light-color)] dark:text-[color:var(--dark-color)]"
                    )}
                    strokeWidth={2}
                />
            </div>

            {/* Top Meta Bar */}
            <div className="z-10 flex w-full items-center justify-between">
                <span
                    className={cn(
                        "font-mono text-[9px] font-medium tracking-widest text-neutral-400 opacity-60 transition-all duration-300 group-hover:opacity-100 dark:text-neutral-500",
                        isHovered &&
                        "text-[color:var(--light-color)] dark:text-[color:var(--dark-color)]"
                    )}
                >
                    {item.badge}
                </span>
            </div>

            {/* Center 3D Interactive Logo */}
            <div
                style={{
                    transform: isHovered
                        ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(16px)`
                        : "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                    transition: isHovered
                        ? "transform 0.1s ease-out"
                        : "transform 0.5s ease-out",
                }}
                className="pointer-events-none relative z-10 my-auto flex items-center justify-center"
            >
                <img
                    src={item.src}
                    alt={item.alt}
                    className="h-4.5 w-auto max-w-[120px] object-contain opacity-40 grayscale filter transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0 md:h-6 md:max-w-[140px] dark:brightness-0 dark:invert"
                />
            </div>

            {/* Bottom Technical Description Badge */}
            <div className="z-10 flex w-full items-center justify-start overflow-hidden">
                <span
                    className={cn(
                        "font-mono text-[10px] tracking-tight text-neutral-500 transition-all duration-300 ease-out dark:text-neutral-400",
                        isHovered
                            ? "translate-y-0 opacity-100 text-[color:var(--light-color)] dark:text-[color:var(--dark-color)]"
                            : "translate-y-2 opacity-0"
                    )}
                >
                    {item.tag}
                </span>
            </div>

            {/* Moving Laser Sweep line */}
            <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full dark:via-white/[0.05]" />
        </div>
    );
}