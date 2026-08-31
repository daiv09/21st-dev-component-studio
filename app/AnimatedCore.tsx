'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Activity, Brain, Network, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Node {
    id: number;
    // Base unrotated 3D coordinates
    bx: number;
    by: number;
    bz: number;
    // Current physical 3D coordinates
    x: number;
    y: number;
    z: number;
    // Velocity
    vx: number;
    vy: number;
    vz: number;
    // Pre-calculated nearest neighbors for O(N) line drawing
    neighbors: number[];
}

export default function AnimatedCore() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);
    const [isActive, setIsActive] = useState(true);

    const nodesRef = useRef<Node[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });
    const timeRef = useRef(0);

    // Interaction states
    const mouseRef = useRef({ x: -1000, y: -1000, targetX: 0, targetY: 0, isDown: false });
    const shockwaveRef = useRef({ active: false, radius: 0, force: 0 });

    // 1. Initialize Fibonacci Sphere + Pre-calculate Neighbors
    const initNodes = useCallback(() => {
        const nodes: Node[] = [];
        const count = 450; // Optimal for dense web but smooth 60fps
        const radius = 220; // Sphere radius
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
            const r = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            nodes.push({
                id: i,
                bx: x * radius,
                by: y * radius,
                bz: z * radius,
                x: x * radius,
                y: y * radius,
                z: z * radius,
                vx: 0,
                vy: 0,
                vz: 0,
                neighbors: [],
            });
        }

        // Pre-calculate nearest neighbors (Distance squared to avoid sqrt)
        for (let i = 0; i < nodes.length; i++) {
            const distances = [];
            for (let j = 0; j < nodes.length; j++) {
                if (i === j) continue;
                const dx = nodes[i].bx - nodes[j].bx;
                const dy = nodes[i].by - nodes[j].by;
                const dz = nodes[i].bz - nodes[j].bz;
                distances.push({ id: j, distSq: dx * dx + dy * dy + dz * dz });
            }
            // Sort and keep 3 closest neighbors for rendering the "web"
            distances.sort((a, b) => a.distSq - b.distSq);
            nodes[i].neighbors = distances.slice(0, 3).map((d) => d.id);
        }

        nodesRef.current = nodes;
    }, []);

    // Theme observer
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(mediaQuery.matches || document.documentElement.classList.contains('dark'));
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
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
                initNodes();
            }
        });

        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, [initNodes]);

    // Main Render & Physics Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animId = 0;

        const render = () => {
            if (!isActive) {
                animId = requestAnimationFrame(render);
                return;
            }

            timeRef.current += 0.002; // Global rotation speed
            const t = timeRef.current;
            const { width, height } = dimensionsRef.current;
            const mouse = mouseRef.current;
            const shock = shockwaveRef.current;
            const nodes = nodesRef.current;

            // Clear Background
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = isDark ? '#020205' : '#f8fafc';
            ctx.fillRect(0, 0, width, height);

            // Additive blending for the glow
            ctx.globalCompositeOperation = isDark ? 'screen' : 'multiply';

            const cx = width / 2;
            const cy = height / 2;

            // Pre-calculate rotation matrices
            const cosY = Math.cos(t);
            const sinY = Math.sin(t);
            // Tilt the sphere slightly forward for better 3D depth
            const tilt = 0.4;
            const cosX = Math.cos(tilt);
            const sinX = Math.sin(tilt);

            const fov = 800;
            const cameraZ = 700;

            // Update Shockwave
            if (shock.active) {
                shock.radius += 25;
                shock.force *= 0.9;
                if (shock.force < 0.1) shock.active = false;
            }

            // 1. PHYSICS PASS
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];

                // Determine target base position (rotated)
                let rX = n.bx * cosY - n.bz * sinY;
                let rY = n.by;
                let rZ = n.bz * cosY + n.bx * sinY;

                // Apply X-axis tilt
                const finalX = rX;
                const finalY = rY * cosX - rZ * sinX;
                const finalZ = rZ * cosX + rY * sinX;

                // Projection for mouse interaction
                const scale = fov / (cameraZ + n.z);
                const projX = cx + n.x * scale;
                const projY = cy + n.y * scale;

                // Mouse Repulsion Force
                const dx = projX - mouse.x;
                const dy = projY - mouse.y;
                const distToMouse = Math.sqrt(dx * dx + dy * dy);

                if (distToMouse < 180) {
                    const force = (180 - distToMouse) / 180;
                    // Push out in 3D space based on 2D proximity
                    n.vx += (dx / distToMouse) * force * 4;
                    n.vy += (dy / distToMouse) * force * 4;
                    n.vz -= force * 2; // push into the screen slightly
                }

                // Shockwave Force
                if (shock.active) {
                    const distToCenter = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
                    if (Math.abs(distToCenter - shock.radius) < 50) {
                        const factor = shock.force * (1 / Math.max(1, distToCenter));
                        n.vx += n.bx * factor;
                        n.vy += n.by * factor;
                        n.vz += n.bz * factor;
                    }
                }

                // Spring Physics: Pull towards target position
                const spring = 0.08;
                const friction = 0.82; // Squishy fluid resistance

                n.vx += (finalX - n.x) * spring;
                n.vy += (finalY - n.y) * spring;
                n.vz += (finalZ - n.z) * spring;

                n.vx *= friction;
                n.vy *= friction;
                n.vz *= friction;

                n.x += n.vx;
                n.y += n.vy;
                n.z += n.vz;
            }

            // 2. RENDER PASS (Depth Sorting not strictly necessary for lines, but good for alpha)
            const rgbBase = isDark ? '56, 189, 248' : '15, 23, 42'; // Sky blue / Slate

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const scale = fov / (cameraZ + n.z);
                if (scale < 0) continue;

                const projX = cx + n.x * scale;
                const projY = cy + n.y * scale;

                // Depth fading
                const depthAlpha = Math.max(0.05, Math.min(1, scale * 1.2 - 0.5));

                // Draw Connecting Lines to Neighbors
                ctx.lineWidth = 0.8 * scale;
                ctx.strokeStyle = `rgba(${rgbBase}, ${depthAlpha * 0.4})`;

                ctx.beginPath();
                for (let j = 0; j < n.neighbors.length; j++) {
                    const neighbor = nodes[n.neighbors[j]];
                    const nScale = fov / (cameraZ + neighbor.z);
                    const nProjX = cx + neighbor.x * nScale;
                    const nProjY = cy + neighbor.y * nScale;

                    ctx.moveTo(projX, projY);
                    ctx.lineTo(nProjX, nProjY);
                }
                ctx.stroke();

                // Draw Node Point
                const size = Math.max(0.5, 2.5 * scale);
                ctx.beginPath();
                ctx.arc(projX, projY, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${depthAlpha})`;
                ctx.fill();
            }

            animId = requestAnimationFrame(render);
        };

        animId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animId);
    }, [isDark, isActive]);

    // Mouse Handlers
    const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
        mouseRef.current.x = -1000;
        mouseRef.current.y = -1000;
    };

    const triggerShockwave = () => {
        shockwaveRef.current = { active: true, radius: 0, force: 1.5 };
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            onClick={triggerShockwave}
            className={cn(
                "group relative flex h-full min-h-[600px] w-full select-none flex-col items-center justify-between overflow-hidden bg-slate-50 transition-colors duration-700 dark:bg-[#020205]"
            )}
        >
            {/* Main Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0 block h-full w-full cursor-crosshair"
            />

            {/* Core Glow Behind the Sphere */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(56,189,248,0.12)_0%,transparent_70%)] mix-blend-screen" />

            {/* Interface Layer */}
            <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 md:p-8 pointer-events-none mix-blend-difference text-white dark:mix-blend-normal">

                {/* Header Controls */}
                <header className="flex w-full items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-wider text-black dark:text-neutral-400 pointer-events-auto">
                    <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/50 px-4 py-2 backdrop-blur-md shadow-sm dark:border-neutral-800/80 dark:bg-black/50">
                        <Brain className="size-3.5" />
                        <span className="font-bold">Neural Lattice V2</span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsActive(!isActive);
                        }}
                        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/50 px-4 py-2 font-bold backdrop-blur-md shadow-sm transition-all hover:bg-neutral-100 dark:border-neutral-800/80 dark:bg-black/50 dark:hover:bg-neutral-900"
                    >
                        <Activity className={cn("size-3.5 transition-colors", isActive ? "text-sky-500" : "text-neutral-400")} />
                        <span>{isActive ? "ACTIVE" : "PAUSED"}</span>
                    </button>
                </header>

                {/* Center Typography */}
                <main className="flex flex-col items-center justify-center text-center opacity-90 transition-opacity group-hover:opacity-100">
                    <h2 className="mb-2 flex items-center gap-2 font-mono text-sm tracking-[0.3em] text-neutral-600 dark:text-neutral-400">
                        <Network className="size-4" />
                        SYNAPTIC CORE
                    </h2>
                    <h1 className="font-sans text-6xl font-black tracking-tighter text-black sm:text-8xl md:text-9xl dark:text-white" style={{ fontVariantLigatures: 'none' }}>
                        NEXUS
                    </h1>
                </main>

                {/* Footer Readouts */}
                <footer className="flex w-full justify-between font-mono text-[10px] text-neutral-500 dark:text-neutral-500">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 text-black dark:text-white">
                            <Zap className="size-3" />
                            INTERACTIVE EVENT
                        </span>
                        <span>HOVER: REPEL / CLICK: DETONATE</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                        <span>NODES // 450 (FIBONACCI)</span>
                        <span>PHYSICS // 3D KINETIC SPRING</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}