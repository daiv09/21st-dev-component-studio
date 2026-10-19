'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Types & Interfaces ---
interface OrbitalParticle {
    id: number;
    angle: number;       // Current position in orbit
    baseRadius: number;  // Anchor distance from center
    radius: number;      // Actual distance (affected by interactions)
    speed: number;       // Orbital velocity
    yOffset: number;     // Vertical variance
    size: number;
    hueOffset: number;
}

interface GravityWave {
    radius: number;
    maxRadius: number;
    strength: number;
}

export interface SingularityCoreProps {
    headline?: string;
    className?: string;
    particleCount?: number;
}

export function SingularityCore({
    headline = "SINGULARITY",
    className = "",
    particleCount = 3500, // Slightly denser since we are focused on the top-down view
}: SingularityCoreProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isRunning, setIsRunning] = useState(true);

    // Sync theme
    useEffect(() => {
        const checkDark = () => {
            return (
                document.documentElement.classList.contains('dark') ||
                (typeof document !== 'undefined' && document.body?.classList.contains('dark')) ||
                (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
            );
        };

        setIsDarkMode(checkDark());

        const observer = new MutationObserver(() => {
            setIsDarkMode(checkDark());
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        if (document.body) {
            observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => setIsDarkMode(checkDark());
        mediaQuery.addEventListener('change', handler);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', handler);
        };
    }, []);

    // Pointer state for Gravitational Lensing
    const pointerRef = useRef({
        x: -2000,
        y: -2000,
        targetX: -2000,
        targetY: -2000,
        radius: 200,
        isDown: false,
    });

    const particlesRef = useRef<OrbitalParticle[]>([]);
    const wavesRef = useRef<GravityWave[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    // Locked to the nearly top-down perspective for the Singularity mode
    const TILT_ANGLE = 0.1;

    // --- Initialize Orbital Disk ---
    const initSystem = useCallback(() => {
        const { width, height } = dimensionsRef.current;
        const particles: OrbitalParticle[] = [];
        const maxR = Math.min(width, height) * 0.45;
        const minR = Math.min(width, height) * 0.12; // The central void

        for (let i = 0; i < particleCount; i++) {
            // Bias distribution towards the inner edge for a glowing core
            const distribution = Math.pow(Math.random(), 2);
            const radius = minR + distribution * (maxR - minR);

            // Kepler-inspired speed (faster closer to center)
            const speed = (minR / radius) * 0.015 + 0.002;

            particles.push({
                id: i,
                angle: Math.random() * Math.PI * 2,
                baseRadius: radius,
                radius: radius,
                speed: speed,
                yOffset: (Math.random() - 0.5) * (radius * 0.15), // Slight vertical thickness
                size: Math.random() * 1.5 + 0.5,
                hueOffset: Math.random() * 30 - 15,
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

                initSystem();
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [initSystem]);

    // --- Main Render & Physics Loop ---
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

            const { width, height } = dimensionsRef.current;
            const pointer = pointerRef.current;
            const particles = particlesRef.current;
            const waves = wavesRef.current;

            // Smooth pointer interpolation
            pointer.x += (pointer.targetX - pointer.x) * 0.1;
            pointer.y += (pointer.targetY - pointer.y) * 0.1;

            const isDark = document.documentElement.classList.contains('dark') || isDarkMode;

            // Trailing effect using a semi-transparent fill
            ctx.fillStyle = isDark ? 'rgba(5, 5, 10, 0.25)' : 'rgba(250, 250, 255, 0.3)';
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;
            const minR = Math.min(width, height) * 0.12;

            // Process Gravity Waves (Ripples)
            for (let i = waves.length - 1; i >= 0; i--) {
                const w = waves[i];
                w.radius += 10;
                w.strength *= 0.94;
                if (w.radius > w.maxRadius || w.strength < 0.01) {
                    waves.splice(i, 1);
                }
            }

            // Draw Particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Orbital mechanics
                p.angle += p.speed;

                // Spring back to base radius
                p.radius += (p.baseRadius - p.radius) * 0.05;

                // Apply Gravity Waves
                for (let w = 0; w < waves.length; w++) {
                    const wave = waves[w];
                    const distToWave = Math.abs(p.radius - wave.radius);
                    if (distToWave < 30) {
                        p.radius += (1 - distToWave / 30) * wave.strength * 10;
                    }
                }

                // Calculate 3D Position
                const x3D = Math.cos(p.angle) * p.radius;
                const z3D = Math.sin(p.angle) * p.radius;
                const y3D = p.yOffset;

                // Apply 3D Camera Tilt (Locked for Singularity)
                const cosTilt = Math.cos(TILT_ANGLE);
                const sinTilt = Math.sin(TILT_ANGLE);

                const ry = y3D * cosTilt - z3D * sinTilt;
                const rz = y3D * sinTilt + z3D * cosTilt;

                // Perspective Projection
                const fov = 600;
                const cameraZ = 600;
                const scale = fov / (cameraZ + rz);

                let projX = centerX + x3D * scale;
                let projY = centerY + ry * scale;

                // Gravitational Lensing (Cursor interaction)
                const dx = projX - pointer.x;
                const dy = projY - pointer.y;
                const distToMouse = Math.sqrt(dx * dx + dy * dy);

                if (distToMouse < pointer.radius && distToMouse > 0) {
                    // Warp space around the cursor
                    const warpForce = Math.pow(1 - distToMouse / pointer.radius, 2);
                    const direction = pointer.isDown ? -1 : 1; // Click pulls, hover pushes
                    projX += (dx / distToMouse) * warpForce * 40 * direction;
                    projY += (dy / distToMouse) * warpForce * 40 * direction;
                }

                // Render Math: Coloring based on temperature (radius)
                const temperature = 1 - (p.baseRadius - minR) / (Math.min(width, height) * 0.45 - minR);

                let hue;
                if (isDark) {
                    hue = 20 + temperature * 40 + p.hueOffset;
                    ctx.fillStyle = `hsla(${hue}, 100%, ${30 + temperature * 50}%, ${0.3 + temperature * 0.7})`;
                } else {
                    hue = 200 + temperature * 40 + p.hueOffset;
                    ctx.fillStyle = `hsla(${hue}, 90%, ${20 + temperature * 40}%, ${0.4 + temperature * 0.6})`;
                }

                // Draw Particle
                const depthScale = Math.max(0.1, scale);
                ctx.beginPath();
                ctx.arc(projX, projY, p.size * depthScale * (1 + temperature), 0, Math.PI * 2);
                ctx.fill();
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [isRunning, isDarkMode]);

    // --- Event Handlers ---
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

    const triggerGravityWave = () => {
        const { width, height } = dimensionsRef.current;
        wavesRef.current.push({
            radius: Math.min(width, height) * 0.12, // Start at event horizon
            maxRadius: Math.max(width, height) * 0.8,
            strength: 2.5,
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
                "group relative flex h-full w-full select-none flex-col justify-between overflow-hidden bg-[#fafafa] transition-colors duration-700 dark:bg-[#030308]",
                className
            )}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block h-full w-full cursor-crosshair"
            />

            <div className="relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-10 pointer-events-none">

                {/* Header Controls */}
                <header className="flex w-full items-center justify-end font-mono text-[11px] text-neutral-600 dark:text-neutral-400 pointer-events-auto">
                    {/* Interactive Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={triggerGravityWave}
                            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-100 dark:border-neutral-800/80 dark:bg-neutral-950/60 dark:hover:bg-neutral-800 shadow-sm"
                            title="Emit Gravity Wave"
                        >
                            <Zap className="size-3.5" />
                            <span className="hidden sm:inline font-mono text-[10px] font-bold">PULSE</span>
                        </button>

                        <button
                            onClick={() => setIsRunning((prev) => !prev)}
                            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white/60 px-3 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-100 dark:border-neutral-800/80 dark:bg-neutral-950/60 dark:hover:bg-neutral-800 shadow-sm"
                        >
                            {isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                        </button>
                    </div>
                </header>

                {/* Typography Layer */}
                <main className="pointer-events-none flex flex-col items-center justify-center text-center opacity-90">
                    <h1 className="font-mono text-6xl font-black tracking-tighter uppercase sm:text-8xl md:text-[9rem] text-neutral-900 dark:text-white">
                        {headline}
                    </h1>
                </main>

                <div />
            </div>
        </div>
    );
}

export default SingularityCore;