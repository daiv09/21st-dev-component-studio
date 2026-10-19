'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types & Interfaces ---
interface FlowParticle {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    vx: number;
    vy: number;
    speed: number;
    life: number;
    maxLife: number;
    colorOffset: number;
}

interface Shockwave {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    force: number;
}

export type FlowMode = 'AETHER' | 'TURBULENCE' | 'MAGNETIC';

export interface AetherFlowProps {
    headline?: string;
    className?: string;
    particleCount?: number;
}

export function AetherFlow({
    headline = "AETHER",
    className = "",
    particleCount = 1800, // High particle count for dense flow lines
}: AetherFlowProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isRunning, setIsRunning] = useState(true);
    const [mode, setMode] = useState<FlowMode>('AETHER');

    // Theme Sync
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);

        if (document.documentElement.classList.contains('dark')) {
            setIsDarkMode(true);
        }

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Pointer and Physics State
    const pointerRef = useRef({
        x: -2000,
        y: -2000,
        targetX: -2000,
        targetY: -2000,
        radius: 150,
        isDown: false,
    });

    const particlesRef = useRef<FlowParticle[]>([]);
    const shockwavesRef = useRef<Shockwave[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    // --- Particle Initialization ---
    const initParticles = useCallback(() => {
        const { width, height } = dimensionsRef.current;
        const particles: FlowParticle[] = [];

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            particles.push({
                x,
                y,
                prevX: x,
                prevY: y,
                vx: 0,
                vy: 0,
                speed: Math.random() * 1.5 + 0.5,
                life: Math.random() * 100,
                maxLife: Math.random() * 100 + 50,
                colorOffset: Math.random() * Math.PI * 2, // Used for subtle color variance
            });
        }
        particlesRef.current = particles;
    }, [particleCount]);

    // --- Canvas Resize Observer ---
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const rect = entry.contentRect;
                const dpr = Math.min(window.devicePixelRatio || 1, 2);

                dimensionsRef.current = { width: rect.width, height: rect.height };
                canvas.width = Math.floor(rect.width * dpr);
                canvas.height = Math.floor(rect.height * dpr);
                canvas.style.width = `${rect.width}px`;
                canvas.style.height = `${rect.height}px`;

                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);

                // Initial clear to prevent black flicker
                ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#09090b' : '#ffffff';
                ctx.fillRect(0, 0, rect.width, rect.height);

                initParticles();
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [initParticles]);

    // --- Main Render & Physics Loop ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animId = 0;
        let time = 0;

        const render = () => {
            if (!isRunning) {
                animId = requestAnimationFrame(render);
                return;
            }

            time += 0.003;
            const { width, height } = dimensionsRef.current;
            const pointer = pointerRef.current;
            const particles = particlesRef.current;
            const shockwaves = shockwavesRef.current;

            // Smooth pointer interpolation
            pointer.x += (pointer.targetX - pointer.x) * 0.1;
            pointer.y += (pointer.targetY - pointer.y) * 0.1;

            const isDark = document.documentElement.classList.contains('dark') || isDarkMode;

            // Trailing Effect: Instead of clearing the canvas, we draw a semi-transparent rectangle over it.
            // This leaves a fading trail behind moving particles.
            ctx.fillStyle = isDark ? 'rgba(9, 9, 11, 0.12)' : 'rgba(255, 255, 255, 0.12)';
            ctx.fillRect(0, 0, width, height);

            // Process Shockwaves
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i];
                sw.radius += 12;
                sw.force *= 0.95;
                if (sw.radius > sw.maxRadius || sw.force < 0.01) {
                    shockwaves.splice(i, 1);
                }
            }

            const cx = width / 2;
            const cy = height / 2;

            // Physics & Rendering Pass
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // 1. Calculate Vector Field Angle based on Mode
                let angle = 0;
                if (mode === 'AETHER') {
                    // Smooth, sweeping, laminar waves
                    angle = Math.sin(p.x * 0.002 + time) * Math.PI + Math.cos(p.y * 0.002 - time) * Math.PI;
                } else if (mode === 'TURBULENCE') {
                    // Tight, chaotic curling noise
                    angle = Math.sin(p.x * 0.008 + time * 1.5) * 2.5 + Math.cos(p.y * 0.008 - time * 1.5) * 2.5;
                } else if (mode === 'MAGNETIC') {
                    // Dipole-like magnetic field relative to center
                    const dx = p.x - cx;
                    const dy = p.y - cy;
                    angle = Math.atan2(dy, dx) + Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.005 - time * 3) * 1.5;
                }

                // Field Force
                const fieldForce = 0.5;
                p.vx += Math.cos(angle) * fieldForce;
                p.vy += Math.sin(angle) * fieldForce;

                // 2. Cursor Interaction (Obstacle / Vortex)
                const dx = p.x - pointer.x;
                const dy = p.y - pointer.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < pointer.radius && dist > 0) {
                    const ratio = 1 - dist / pointer.radius;
                    // If mouse is down, pull them into a tight vortex, else gently repel them like a rock in a stream
                    if (pointer.isDown) {
                        const vortexAngle = Math.atan2(dy, dx) + Math.PI / 2;
                        p.vx += Math.cos(vortexAngle) * ratio * 4 - (dx / dist) * ratio * 2;
                        p.vy += Math.sin(vortexAngle) * ratio * 4 - (dy / dist) * ratio * 2;
                    } else {
                        p.vx += (dx / dist) * ratio * 2.5;
                        p.vy += (dy / dist) * ratio * 2.5;
                    }
                }

                // 3. Shockwave Force
                for (let s = 0; s < shockwaves.length; s++) {
                    const sw = shockwaves[s];
                    const swDx = p.x - sw.x;
                    const swDy = p.y - sw.y;
                    const swDist = Math.sqrt(swDx * swDx + swDy * swDy);
                    const ringDelta = Math.abs(swDist - sw.radius);

                    if (ringDelta < 40) {
                        const push = (1 - ringDelta / 40) * sw.force;
                        p.vx += (swDx / swDist) * push * 15;
                        p.vy += (swDy / swDist) * push * 15;
                    }
                }

                // 4. Apply Velocity and Friction
                p.vx *= 0.85; // Friction limits max speed
                p.vy *= 0.85;

                p.prevX = p.x;
                p.prevY = p.y;
                p.x += p.vx * p.speed;
                p.y += p.vy * p.speed;

                // 5. Lifespan and Wrapping
                p.life++;
                let reset = false;

                // Wrap around edges cleanly
                if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                    reset = true;
                }

                // Fade out based on life to avoid abrupt popping
                if (p.life >= p.maxLife) {
                    reset = true;
                }

                if (reset) {
                    p.x = Math.random() * width;
                    p.y = Math.random() * height;
                    p.prevX = p.x;
                    p.prevY = p.y;
                    p.life = 0;
                    p.vx = 0;
                    p.vy = 0;
                }

                // 6. Draw Particle Trajectory Line
                // Opacity is mapped to its lifespan (fades in and fades out)
                const lifeRatio = p.life / p.maxLife;
                const opacity = Math.sin(lifeRatio * Math.PI) * 0.8; // Peak opacity at half life

                // Subtle dynamic colors based on speed and base color offset
                const speedMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                let strokeColor;

                if (isDark) {
                    // Cool blues/cyans/purples in dark mode
                    const hue = 210 + Math.sin(time + p.colorOffset) * 40 + (speedMag * 5);
                    strokeColor = `hsla(${hue}, 90%, 65%, ${opacity})`;
                } else {
                    // Deep slate/indigo/teals in light mode
                    const hue = 220 + Math.sin(time + p.colorOffset) * 30 - (speedMag * 5);
                    strokeColor = `hsla(${hue}, 80%, 35%, ${opacity})`;
                }

                ctx.strokeStyle = strokeColor;
                ctx.beginPath();
                ctx.moveTo(p.prevX, p.prevY);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [isRunning, mode, isDarkMode]);

    // --- Interaction Handlers ---
    const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        pointerRef.current.targetX = e.clientX - rect.left;
        pointerRef.current.targetY = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
        pointerRef.current.targetX = -2000;
        pointerRef.current.targetY = -2000;
        pointerRef.current.isDown = false;
    };

    const triggerShockwave = () => {
        const { width, height } = dimensionsRef.current;
        shockwavesRef.current.push({
            x: width / 2,
            y: height / 2,
            radius: 10,
            maxRadius: Math.max(width, height) * 0.8,
            force: 1.5,
        });
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            onMouseDown={() => { pointerRef.current.isDown = true; }}
            onMouseUp={() => { pointerRef.current.isDown = false; }}
            className={cn(
                "group relative flex h-full w-full select-none flex-col justify-between overflow-hidden bg-slate-50 transition-colors duration-700 dark:bg-[#09090b]",
                className
            )}
        >
            {/* The active rendering canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block h-full w-full cursor-crosshair"
            />

            {/* Glassmorphism UI Overlay */}
            <div className="relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-10 pointer-events-none">

                {/* Header Controls */}
                <header className="flex w-full flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 pointer-events-auto">
                    <div className="flex items-center gap-2">

                        {/* Flow Mode Selector */}
                        <div className="flex items-center gap-1 rounded-xl border border-neutral-200/80 bg-white/50 p-1 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/50 shadow-sm">
                            {(['AETHER', 'TURBULENCE', 'MAGNETIC'] as FlowMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "rounded-lg px-3 py-1.5 text-[10px] font-semibold tracking-widest transition-all duration-300",
                                        mode === m
                                            ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-black"
                                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        {/* Interactive Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={triggerShockwave}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/50 px-3 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-100 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:bg-neutral-800 shadow-sm"
                                title="Pulse Field"
                            >
                                <Zap className="size-3.5" />
                                <span className="hidden sm:inline font-mono text-[10px] font-bold">PULSE</span>
                            </button>

                            <button
                                onClick={() => setIsRunning((prev) => !prev)}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/50 px-3 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-100 dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:hover:bg-neutral-800 shadow-sm"
                            >
                                {isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Typography Layer */}
                <main className="pointer-events-none flex flex-col items-center justify-center text-center opacity-90 drop-shadow-sm">
                    <h1 className="font-mono text-6xl font-black tracking-tighter uppercase sm:text-8xl md:text-[10rem] text-neutral-900 dark:text-white">
                        {headline}
                    </h1>
                </main>

                <div />
            </div>
        </div>
    );
}

export default AetherFlow;