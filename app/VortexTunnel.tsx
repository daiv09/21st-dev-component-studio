'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function VortexTunnel() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    // Theme synchronization
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches || document.documentElement.classList.contains('dark'));
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Core Canvas Engine
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        // Smooth dampening state
        const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Normalize mouse to -1 to 1 range relative to center
            mouse.targetX = (e.clientX - width / 2) / (width / 2);
            mouse.targetY = (e.clientY - height / 2) / (height / 2);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        let offset = 0;

        const render = () => {
            offset += 3.5; // Tunnel travel speed

            // Mouse ease/dampening
            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;

            // Colors based on theme
            const bgColor = isDarkMode ? '#05050a' : '#f4f4f5';
            const rgbLine = isDarkMode ? '6, 182, 212' : '79, 70, 229'; // Cyan vs Indigo

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = isDarkMode ? 'screen' : 'multiply';

            const cx = width / 2;
            const cy = height / 2;
            const fov = 400;

            const rings = 35; // Number of depth layers
            const pointsPerRing = 18; // Resolution of the cylinder
            const spacing = 90; // Z-distance between rings
            const maxZ = rings * spacing;

            const frameVertices: { x: number, y: number, z: number, alpha: number }[][] = [];

            // 1. Calculate 3D Geometry
            for (let r = 0; r < rings; r++) {
                // Shift rings towards camera, wrap around when they pass the viewer
                let z = (r * spacing - (offset % spacing));
                if (z < 0) z += maxZ;

                // Avoid division by zero
                const zDist = z + 150;
                const scale = fov / zDist;

                // Mouse interaction: Curve the tunnel's far end based on Z depth
                const curveForce = Math.pow(z / maxZ, 1.5);
                const offsetX = mouse.x * (width * 0.8) * curveForce;
                const offsetY = mouse.y * (height * 0.8) * curveForce;

                // Fade out at far distance and very close distance
                const alphaFar = 1 - Math.pow(z / maxZ, 1.2);
                const alphaNear = Math.min(1, zDist / 250);
                const alpha = Math.max(0, Math.min(alphaFar, alphaNear));

                // Tunnel breathing (radius expansion)
                const breathe = Math.sin(offset * 0.01 + z * 0.002) * 40;
                const baseRadius = 220 + breathe;

                const ringVerts = [];
                for (let p = 0; p < pointsPerRing; p++) {
                    // Twist the tunnel over depth and time
                    const theta = (p / pointsPerRing) * Math.PI * 2 + (z * 0.001) + (offset * 0.002);

                    // Wave distortion along the circumference
                    const distortion = Math.sin(theta * 4 - offset * 0.03) * 15;
                    const rRadius = baseRadius + distortion;

                    const x3d = Math.cos(theta) * rRadius;
                    const y3d = Math.sin(theta) * rRadius;

                    // 3D to 2D Projection
                    const sx = cx + (x3d + offsetX) * scale;
                    const sy = cy + (y3d + offsetY) * scale;

                    ringVerts.push({ x: sx, y: sy, z, alpha });
                }
                frameVertices.push(ringVerts);
            }

            // Sort by Z depth (Painters algorithm - draw back to front)
            frameVertices.sort((a, b) => b[0].z - a[0].z);

            // 2. Draw Wireframe Mesh
            ctx.lineWidth = 1.2;

            for (let r = 0; r < frameVertices.length; r++) {
                const ring = frameVertices[r];
                const alpha = ring[0].alpha;

                if (alpha <= 0.01) continue;

                ctx.strokeStyle = `rgba(${rgbLine}, ${alpha * (isDarkMode ? 0.6 : 0.4)})`;

                // Draw Latitudinal Rings
                ctx.beginPath();
                for (let p = 0; p < pointsPerRing; p++) {
                    const pt = ring[p];
                    if (p === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                }
                ctx.closePath();
                ctx.stroke();

                // Draw Longitudinal Lines (Connecting to next ring)
                // Since we sorted by Z, we must link to the previously drawn ring which is further away
                if (r > 0) {
                    const prevRing = frameVertices[r - 1];
                    // Only connect if they are adjacent in absolute physical order 
                    // (prevents drawing a line across the entire depth when the wrap-around happens)
                    if (Math.abs(ring[0].z - prevRing[0].z) < spacing * 1.5) {
                        ctx.beginPath();
                        for (let p = 0; p < pointsPerRing; p++) {
                            ctx.moveTo(ring[p].x, ring[p].y);
                            ctx.lineTo(prevRing[p].x, prevRing[p].y);
                        }
                        ctx.stroke();
                    }
                }
            }

            ctx.globalCompositeOperation = 'source-over';
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDarkMode]);

    return (
        <div className="relative w-full h-screen overflow-hidden select-none bg-[#f4f4f5] dark:bg-[#05050a] transition-colors duration-700">
            <canvas ref={canvasRef} className="absolute inset-0 block cursor-crosshair" />

            {/* Typography Overlay */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 pointer-events-none mix-blend-difference text-white">
                <span className="font-mono text-xs tracking-[0.4em] uppercase mb-4 opacity-60">
                    Dimensional Core
                </span>

                <h1 className="font-sans text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none">
                    Vortex
                </h1>

                <p className="mt-6 font-mono text-xs md:text-sm max-w-md opacity-60 leading-relaxed">
                    Dynamic topological wireframe rendering. Responds to spatial pointer input to continuously bend the origin vector.
                </p>

                <div className="absolute bottom-10 left-10 font-mono text-[10px] uppercase opacity-40 text-left flex flex-col gap-1">
                    <span>Engine: Canvas2D</span>
                    <span>Projection: Kinematic 3D</span>
                    <span>Status: Nominal</span>
                </div>
            </div>
        </div>
    );
}