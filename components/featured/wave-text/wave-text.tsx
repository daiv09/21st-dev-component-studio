'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function WaveText() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

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
            mouse.targetX = (e.clientX - width / 2) * 0.5;
            mouse.targetY = (e.clientY - height / 2) * 0.5;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        let offset = 0;

        const render = () => {
            offset += 1.5;

            // Mouse smooth dampening
            mouse.x += (mouse.targetX - mouse.x) * 0.08;
            mouse.y += (mouse.targetY - mouse.y) * 0.08;

            const bgColor = isDarkMode ? '#020204' : '#f8fafc';
            const gridColor = isDarkMode ? '168, 85, 247' : '99, 102, 241'; // Vivid Purple/Indigo

            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            const horizonY = height * 0.45 + mouse.y * 0.3;
            const fov = 350;

            const gridCols = 32;
            const gridRows = 28;
            const cellWidth = 120;
            const cellDepth = 80;

            // Perspective 3D Grid Engine
            for (let r = 0; r < gridRows; r++) {
                const z1 = r * cellDepth - (offset % cellDepth);
                const z2 = (r + 1) * cellDepth - (offset % cellDepth);

                if (z1 <= 10) continue;

                const scale1 = fov / z1;
                const scale2 = fov / z2;

                const y1 = horizonY + z1 * scale1 * 0.15;
                const y2 = horizonY + z2 * scale2 * 0.15;

                const alpha = Math.min(1, Math.pow(r / gridRows, 1.8));

                ctx.strokeStyle = `rgba(${gridColor}, ${alpha * (isDarkMode ? 0.35 : 0.25)})`;
                ctx.lineWidth = 1;

                // Draw Horizontal Grid Segment
                ctx.beginPath();
                for (let c = -gridCols / 2; c <= gridCols / 2; c++) {
                    const xWorld = c * cellWidth + mouse.x * (1 - r / gridRows);

                    // Wave elevation math
                    const wave = Math.sin(c * 0.3 + offset * 0.03) * 15 * (r / gridRows);

                    const xScreen = width / 2 + xWorld * scale1;
                    const yScreen = y1 - wave * scale1;

                    if (c === -gridCols / 2) ctx.moveTo(xScreen, yScreen);
                    else ctx.lineTo(xScreen, yScreen);
                }
                ctx.stroke();

                // Draw Vertical Perspective Lines
                if (r < gridRows - 1) {
                    for (let c = -gridCols / 2; c <= gridCols / 2; c++) {
                        const xWorld1 = c * cellWidth + mouse.x * (1 - r / gridRows);
                        const xWorld2 = c * cellWidth + mouse.x * (1 - (r + 1) / gridRows);

                        const wave1 = Math.sin(c * 0.3 + offset * 0.03) * 15 * (r / gridRows);
                        const wave2 = Math.sin(c * 0.3 + offset * 0.03) * 15 * ((r + 1) / gridRows);

                        const xScreen1 = width / 2 + xWorld1 * scale1;
                        const yScreen1 = y1 - wave1 * scale1;

                        const xScreen2 = width / 2 + xWorld2 * scale2;
                        const yScreen2 = y2 - wave2 * scale2;

                        ctx.beginPath();
                        ctx.moveTo(xScreen1, yScreen1);
                        ctx.lineTo(xScreen2, yScreen2);
                        ctx.stroke();
                    }
                }
            }

            // Horizon Glow Line
            const gradient = ctx.createLinearGradient(0, horizonY - 2, 0, horizonY + 20);
            gradient.addColorStop(0, `rgba(${gridColor}, 0.8)`);
            gradient.addColorStop(1, `rgba(${gridColor}, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, horizonY - 2, width, 22);

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
        <div className="relative w-full h-screen overflow-hidden select-none bg-black dark:bg-black light:bg-slate-50">
            <canvas ref={canvasRef} className="absolute inset-0 block cursor-default" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 pointer-events-none mix-blend-difference text-white">
                <span className="font-mono text-xs tracking-widest uppercase mb-3 opacity-80">
                </span>
                <h1 className="font-mono text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none uppercase">
                    Smooth
                </h1>
                <p className="mt-4 font-mono text-xs md:text-sm max-w-lg opacity-70">
                    3D perspective horizon terrain with tilt parallax and continuous sine-wave displacement.
                </p>
            </div>
        </div>
    );
}