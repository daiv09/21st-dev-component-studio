'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Power, Settings2, Sparkles, Orbit } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type VortexTopology = 'ACCRETION_DISK' | 'PULSAR_JETS' | 'SINGULARITY_COLLAPSE';

interface Particle {
    id: number;
    angle: number;
    radius: number;
    y: number;
    speed: number;
    mass: number;
    baseRadius: number;
    phase: number;
}

export interface AetherVortexProps {
    headline?: string;
    subhead?: string;
    className?: string;
}

export function AetherVortex({
    headline = "AETHER",
    subhead = "QUANTUM DYNAMICS",
    className = "",
}: AetherVortexProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isRunning, setIsRunning] = useState(true);
    const [topology, setTopology] = useState<VortexTopology>('ACCRETION_DISK');
    const [isDark, setIsDark] = useState(true);

    // Smooth mouse/parallax state + Interaction coordinates
    const mouseRef = useRef({
        targetX: 0,
        targetY: 0,
        currentX: 0,
        currentY: 0,
        pointerX: -1000, // initialized off-screen
        pointerY: -1000,
    });

    const particlesRef = useRef<Particle[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });
    const timeRef = useRef(0);

    // Initialize Particles (Slower speeds for elegance)
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        const count = 900; // Perfect balance for 60fps+ and dense visuals

        for (let i = 0; i < count; i++) {
            const radius = Math.random() * (Math.min(width, height) * 0.4) + 20;
            particles.push({
                id: i,
                angle: Math.random() * Math.PI * 2,
                radius,
                baseRadius: radius,
                y: (Math.random() - 0.5) * 50,
                // Slower base speed
                speed: (Math.random() * 0.008 + 0.002),
                mass: Math.random() * 1.2 + 0.4,
                phase: Math.random() * Math.PI * 2,
            });
        }
        particlesRef.current = particles;
    }, []);

    // Theme observer with MutationObserver for dynamic class changes (.dark)
    useEffect(() => {
        const checkDark = () => {
            return (
                document.documentElement.classList.contains('dark') ||
                document.body.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches
            );
        };

        setIsDark(checkDark());

        const observer = new MutationObserver(() => {
            setIsDark(checkDark());
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        if (document.body) {
            observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setIsDark(checkDark());
        mediaQuery.addEventListener('change', handler);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handler);
        };
    }, []);

    // Canvas Resize Logic
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
                initParticles(rect.width, rect.height);
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [initParticles]);

    // Main Render Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animId = 0;

        const render = () => {
            if (!isRunning) {
                animId = requestAnimationFrame(render);
                return;
            }

            // Slower time progression
            timeRef.current += 0.005;
            const t = timeRef.current;
            const { width, height } = dimensionsRef.current;
            const mouse = mouseRef.current;
            const particles = particlesRef.current;

            // Smooth parallax interpolation
            mouse.currentX += (mouse.targetX - mouse.currentX) * 0.05;
            mouse.currentY += (mouse.targetY - mouse.currentY) * 0.05;

            // Trails: Low opacity fill
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(0, 0, width, height);

            // Pre-calculate constants
            const centerX = width / 2 + mouse.currentX;
            const centerY = height / 2 + mouse.currentY;
            const tilt = 0.6;
            const tiltCos = Math.cos(tilt);
            const tiltSin = Math.sin(tilt);
            const fov = 800;
            const cameraZ = 600;

            ctx.beginPath();

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Slower Topology Physics
                if (topology === 'ACCRETION_DISK') {
                    p.angle += p.speed * (100 / p.radius);
                    p.radius += (p.baseRadius - p.radius) * 0.03;
                    p.y = Math.sin(p.angle * 2 + t) * (p.baseRadius * 0.1) * Math.cos(p.phase + t);
                } else if (topology === 'SINGULARITY_COLLAPSE') {
                    p.angle += p.speed * (150 / Math.max(p.radius, 10));
                    p.radius *= 0.985;
                    p.y *= 0.96;

                    if (p.radius < 5) {
                        p.radius = Math.min(width, height) * 0.5;
                        p.y = (Math.random() - 0.5) * 100;
                    }
                } else if (topology === 'PULSAR_JETS') {
                    p.angle += p.speed * 1.5;
                    if (p.radius > 15) {
                        p.radius *= 0.94;
                        p.y *= 0.92;
                    } else {
                        p.y += (p.id % 2 === 0 ? 1 : -1) * (p.speed * 400);
                        if (Math.abs(p.y) > height * 0.6) {
                            p.radius = p.baseRadius;
                            p.y = (Math.random() - 0.5) * 20;
                        }
                    }
                }

                // 3D Projection
                const z3D = Math.sin(p.angle) * p.radius;
                const x3D = Math.cos(p.angle) * p.radius;
                const y3D = p.y;

                const scale = fov / (cameraZ + z3D);
                if (scale < 0) continue;

                let projX = centerX + x3D * scale;
                let projY = centerY + (y3D * tiltCos - z3D * tiltSin) * scale;

                // Interactive Field (Repulsion & Glow)
                const dx = projX - mouse.pointerX;
                const dy = projY - mouse.pointerY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let interactiveScale = 1;
                let interactiveAlpha = 0;

                if (dist < 120) {
                    const force = (120 - dist) / 120; // 0 to 1
                    // Repel particles slightly away from cursor
                    projX += dx * force * 0.3;
                    projY += dy * force * 0.3;
                    // Magnify size and brightness
                    interactiveScale = 1 + force * 1.5;
                    interactiveAlpha = force * 0.5;
                }

                const depthAlpha = Math.max(0.1, Math.min(1, scale * 0.9)) + interactiveAlpha;

                // Exact floats for perfect smoothness (no Math.round jitter!)
                const size = Math.max(1.0, p.mass * scale * 1.2 * interactiveScale);

                ctx.beginPath();
                ctx.arc(projX, projY, size, 0, Math.PI * 2);

                if (isDark) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, depthAlpha)})`;
                } else {
                    ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, depthAlpha)})`;
                }

                ctx.fill();
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [isRunning, topology, isDark]);

    const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Direct cursor coordinates for interaction
        mouseRef.current.pointerX = x;
        mouseRef.current.pointerY = y;

        // Parallax target relative to center
        mouseRef.current.targetX = (x - rect.width / 2) * 0.15;
        mouseRef.current.targetY = (y - rect.height / 2) * 0.15;
    };

    const handlePointerLeave = () => {
        mouseRef.current.targetX = 0;
        mouseRef.current.targetY = 0;
        mouseRef.current.pointerX = -1000;
        mouseRef.current.pointerY = -1000;
    };

    const topologies: { id: VortexTopology; label: string; icon: React.ReactNode }[] = [
        { id: 'ACCRETION_DISK', label: 'ACCRETION', icon: <Orbit className="size-3" /> },
        { id: 'SINGULARITY_COLLAPSE', label: 'COLLAPSE', icon: <Settings2 className="size-3" /> },
        { id: 'PULSAR_JETS', label: 'PULSAR', icon: <Sparkles className="size-3" /> },
    ];

    return (
        <div
            ref={containerRef}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            className={cn(
                "group relative flex h-full min-h-[600px] w-full select-none flex-col justify-between overflow-hidden bg-white transition-colors duration-700 dark:bg-black",
                className
            )}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 block h-full w-full cursor-crosshair"
            />

            {/* Interface Layer */}
            <div className="relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-8 mix-blend-difference text-white dark:mix-blend-normal pointer-events-none">

                {/* Top Controls */}
                <header className="flex w-full flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-wider text-black dark:text-neutral-400 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white/80 p-1 backdrop-blur-md shadow-sm dark:border-neutral-800/80 dark:bg-black/50">
                            {topologies.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTopology(t.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all duration-300",
                                        topology === t.id
                                            ? "bg-black text-white shadow-sm dark:bg-white dark:text-black"
                                            : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                                    )}
                                >
                                    {t.icon}
                                    <span className="hidden sm:inline-block">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Center Typography */}
                <main className="flex flex-col items-center justify-center text-center opacity-90 transition-opacity group-hover:opacity-100">
                    <h2 className="mb-2 font-mono text-sm tracking-[0.3em] text-neutral-600 dark:text-neutral-400">
                        {subhead}
                    </h2>
                    <h1 className="font-sans text-6xl font-black tracking-tighter text-black sm:text-8xl md:text-9xl dark:text-white" style={{ fontVariantLigatures: 'none' }}>
                        {headline}
                    </h1>
                </main>

                {/* Footer spacer so flex-between acts correctly */}
                <div className="h-8" />
            </div>
        </div>
    );
}

export default AetherVortex;