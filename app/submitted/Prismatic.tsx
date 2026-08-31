'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Types & Interfaces ---
interface Node3D {
    id: number;
    col: number;
    row: number;
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    excitation: number;
}

interface BurstWave {
    radius: number;
    maxRadius: number;
    strength: number;
}

export type TopologyMode = 'TORUS' | 'SPHERE' | 'VORTEX';

export interface PrismaticProps {
    headline?: string;
    className?: string;
}

export function Prismatic({
    headline = "NEXUS",
    className = "",
}: PrismaticProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isRunning, setIsRunning] = useState(true);
    const [topology, setTopology] = useState<TopologyMode>('TORUS');

    // Sync theme with system or external wrappers
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

    // Pointer coordinates and physics state
    const pointerRef = useRef({
        x: -2000,
        y: -2000,
        targetX: -2000,
        targetY: -2000,
        radius: 180, // Size of the hover highlighting brush
        isDown: false,
    });

    const nodesRef = useRef<Node3D[]>([]);
    const burstsRef = useRef<BurstWave[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    // Mesh settings
    const COLS = 32;
    const ROWS = 16;
    const NUM_NODES = COLS * ROWS;

    // --- Core Initialization ---
    const initMesh = useCallback(() => {
        const nodes: Node3D[] = [];
        let id = 0;

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                nodes.push({
                    id: id++,
                    col,
                    row,
                    x: (Math.random() - 0.5) * 400,
                    y: (Math.random() - 0.5) * 400,
                    z: (Math.random() - 0.5) * 400,
                    vx: 0,
                    vy: 0,
                    vz: 0,
                    excitation: 0,
                });
            }
        }
        nodesRef.current = nodes;
    }, []);

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

                if (nodesRef.current.length === 0) {
                    initMesh();
                }
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [initMesh]);

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

            time += 0.005; // Global rotation speed
            const { width, height } = dimensionsRef.current;
            const pointer = pointerRef.current;
            const nodes = nodesRef.current;
            const bursts = burstsRef.current;

            // Interpolate pointer smoothly
            pointer.x += (pointer.targetX - pointer.x) * 0.08;
            pointer.y += (pointer.targetY - pointer.y) * 0.08;

            const isDark = document.documentElement.classList.contains('dark') || isDarkMode;
            const bgColor = isDark ? '#09090b' : '#ffffff';
            const baseRgb = isDark ? '255, 255, 255' : '15, 23, 42';
            const activeRgb = isDark ? '255, 255, 255' : '0, 0, 0';

            // Clear background
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // Update color bursts
            for (let i = bursts.length - 1; i >= 0; i--) {
                const burst = bursts[i];
                burst.radius += 15; // Expansion speed
                burst.strength *= 0.96; // Fade out

                if (burst.radius > burst.maxRadius || burst.strength < 0.01) {
                    bursts.splice(i, 1);
                }
            }

            const cosT = Math.cos(time);
            const sinT = Math.sin(time);
            const cosT2 = Math.cos(time * 0.7);
            const sinT2 = Math.sin(time * 0.7);

            // 1. Math & Physics Pass
            for (let i = 0; i < NUM_NODES; i++) {
                const node = nodes[i];

                const u = (node.col / COLS) * Math.PI * 2;
                const v = (node.row / (ROWS - 1)) * Math.PI;
                const vTorus = (node.row / ROWS) * Math.PI * 2;

                let targetX = 0, targetY = 0, targetZ = 0;

                if (topology === 'TORUS') {
                    const R = Math.min(width, height) * 0.22;
                    const r = R * 0.45;
                    targetX = (R + r * Math.cos(vTorus)) * Math.cos(u);
                    targetZ = (R + r * Math.cos(vTorus)) * Math.sin(u);
                    targetY = r * Math.sin(vTorus);
                } else if (topology === 'SPHERE') {
                    const R = Math.min(width, height) * 0.3;
                    targetX = R * Math.sin(v) * Math.cos(u);
                    targetZ = R * Math.sin(v) * Math.sin(u);
                    targetY = R * Math.cos(v);
                } else if (topology === 'VORTEX') {
                    const normalizedRow = node.row / ROWS;
                    const radius = 20 + Math.pow(normalizedRow, 1.5) * Math.min(width, height) * 0.4;
                    const twist = u + normalizedRow * Math.PI * 6;
                    targetX = Math.cos(twist) * radius;
                    targetZ = Math.sin(twist) * radius;
                    targetY = (normalizedRow - 0.5) * Math.min(width, height) * 0.8;
                }

                let rx = targetX * cosT - targetZ * sinT;
                let rz = targetX * sinT + targetZ * cosT;
                let ry = targetY * cosT2 - rz * sinT2;
                rz = targetY * sinT2 + rz * cosT2;

                const spring = 0.03;
                const friction = 0.88;

                node.vx += (rx - node.x) * spring;
                node.vy += (ry - node.y) * spring;
                node.vz += (rz - node.z) * spring;

                const fov = 800;
                const cameraDist = 600;
                const scale = fov / (cameraDist + node.z);
                const projX = centerX + node.x * scale;
                const projY = centerY + node.y * scale;

                // Color highlighting from cursor proximity
                const dx = projX - pointer.x;
                const dy = projY - pointer.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < pointer.radius && dist > 0) {
                    const ratio = 1 - dist / pointer.radius;
                    const smoothRatio = ratio * ratio * (3 - 2 * ratio);
                    node.excitation = Math.max(node.excitation, smoothRatio);
                }

                // Color highlighting from Expanding Bursts (from center)
                const dxCenter = projX - centerX;
                const dyCenter = projY - centerY;
                const distFromCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter);

                for (let b = 0; b < bursts.length; b++) {
                    const burst = bursts[b];
                    const ringThickness = 60;
                    const distToRing = Math.abs(distFromCenter - burst.radius);

                    if (distToRing < ringThickness) {
                        const ratio = 1 - (distToRing / ringThickness);
                        const smoothRatio = ratio * ratio * (3 - 2 * ratio);
                        node.excitation = Math.max(node.excitation, smoothRatio * burst.strength);
                    }
                }

                node.vx *= friction;
                node.vy *= friction;
                node.vz *= friction;
                node.x += node.vx;
                node.y += node.vy;
                node.z += node.vz;

                node.excitation *= 0.92;
            }

            // 2. Render Pass
            ctx.lineWidth = 1;

            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const idx = row * COLS + col;
                    const node = nodes[idx];

                    const fov = 800;
                    const cameraDist = 600;
                    const scale = fov / (cameraDist + node.z);
                    const projX = centerX + node.x * scale;
                    const projY = centerY + node.y * scale;

                    const depthAlpha = Math.max(0, Math.min(1, 1 - (node.z + 300) / 600));

                    if (node.excitation > 0.05) {
                        ctx.strokeStyle = `rgba(${activeRgb}, ${Math.min(1, depthAlpha + node.excitation)})`;
                        ctx.lineWidth = 1 + node.excitation * 1.5;
                    } else {
                        ctx.strokeStyle = `rgba(${baseRgb}, ${depthAlpha * (isDark ? 0.25 : 0.15)})`;
                        ctx.lineWidth = 1;
                    }

                    const nextColIdx = row * COLS + ((col + 1) % COLS);
                    const rightNeighbor = nodes[nextColIdx];
                    const rScale = fov / (cameraDist + rightNeighbor.z);

                    ctx.beginPath();
                    ctx.moveTo(projX, projY);
                    ctx.lineTo(centerX + rightNeighbor.x * rScale, centerY + rightNeighbor.y * rScale);
                    ctx.stroke();

                    if (row < ROWS - 1) {
                        const bottomIdx = (row + 1) * COLS + col;
                        const bottomNeighbor = nodes[bottomIdx];
                        const bScale = fov / (cameraDist + bottomNeighbor.z);

                        ctx.beginPath();
                        ctx.moveTo(projX, projY);
                        ctx.lineTo(centerX + bottomNeighbor.x * bScale, centerY + bottomNeighbor.y * bScale);
                        ctx.stroke();
                    }

                    if (node.excitation > 0.1) {
                        ctx.fillStyle = `rgba(${activeRgb}, ${node.excitation})`;
                        ctx.beginPath();
                        ctx.arc(projX, projY, (1 + node.excitation * 2.5) * scale, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [isRunning, topology, isDarkMode]);

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

    const triggerBurst = () => {
        const { width, height } = dimensionsRef.current;
        const maxR = Math.max(width, height) * 1.2;

        // Pushes a new expanding shockwave into the render array
        burstsRef.current.push({
            radius: 0,
            maxRadius: maxR,
            strength: 1.0,
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
                "group relative flex h-full w-full select-none flex-col justify-between overflow-hidden bg-white transition-colors duration-700 dark:bg-[#09090b]",
                className
            )}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block h-full w-full cursor-crosshair"
            />

            <div className="relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-10 pointer-events-none">

                <header className="flex w-full flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white/70 p-1 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/70 shadow-sm">
                            {(['TORUS', 'SPHERE', 'VORTEX'] as TopologyMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setTopology(mode)}
                                    className={cn(
                                        "rounded-lg px-3 py-1.5 text-[10px] font-semibold tracking-widest transition-all duration-300",
                                        topology === mode
                                            ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-black"
                                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                    )}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={triggerBurst}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white/70 px-3 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:bg-neutral-800 shadow-sm"
                                title="Color Burst"
                            >
                                <Zap className="size-3.5" />
                                <span className="hidden sm:inline font-mono text-[10px] font-bold">BURST</span>
                            </button>

                            <button
                                onClick={() => setIsRunning((prev) => !prev)}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white/70 px-3 py-1.5 backdrop-blur-md transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:bg-neutral-800 shadow-sm"
                            >
                                {isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                            </button>
                        </div>
                    </div>
                </header>

                <main className="pointer-events-none flex flex-col items-center justify-center text-center opacity-90">
                    <h1 className="font-mono text-6xl font-black tracking-tighter uppercase sm:text-8xl md:text-[10rem] text-neutral-900 dark:text-white">
                        {headline}
                    </h1>
                </main>

                <div />
            </div>
        </div>
    );
}

export default Prismatic;