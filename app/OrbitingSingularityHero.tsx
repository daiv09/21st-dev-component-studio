'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface AuroraRibbonWaveHeroProps {
    title?: string;
    subtitle?: string;
    badge?: string;
}

export default function AuroraRibbonWaveHero({
    title = 'SPECTRA',
    subtitle = 'Volumetric multi-harmonic silk filaments with spectral phase shifting and 3D rotational parallax.',
    badge = 'SYS.05 // HARMONIC VEIL',
}: AuroraRibbonWaveHeroProps) {
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
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.targetX = (e.clientX / width - 0.5) * 2;
            mouse.targetY = (e.clientY / height - 0.5) * 2;
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        let time = 0;

        const render = () => {
            time += 0.022;

            mouse.x += (mouse.targetX - mouse.x) * 0.05;
            mouse.y += (mouse.targetY - mouse.y) * 0.05;

            ctx.fillStyle = isDarkMode ? '#030208' : '#f8fafc';
            ctx.fillRect(0, 0, width, height);

            const ribbons = 42;
            const pointsPerRibbon = 64;
            const fov = 560;
            const spreadWidth = Math.max(width * 1.25, 1100);

            for (let r = 0; r < ribbons; r++) {
                const rRatio = r / ribbons;
                const zBase = 160 + r * 26;
                const hue = (200 + rRatio * 130 + time * 12) % 360;
                const alpha = (1 - rRatio * 0.72) * (isDarkMode ? 0.55 : 0.4);

                ctx.strokeStyle = `hsla(${hue}, 88%, ${isDarkMode ? '64%' : '46%'}, ${alpha})`;
                ctx.lineWidth = r % 6 === 0 ? 1.8 : 1;

                ctx.beginPath();

                for (let p = 0; p <= pointsPerRibbon; p++) {
                    const pRatio = p / pointsPerRibbon - 0.5;
                    const xWorld = pRatio * spreadWidth + mouse.x * 140 * (1 - rRatio);

                    // Compound 3-wave interference
                    const waveY =
                        Math.sin(pRatio * 7 + time + r * 0.16) * 85 +
                        Math.cos(pRatio * 3.5 - time * 0.8 + r * 0.24) * 55;

                    const zWave = zBase + Math.sin(pRatio * 5 + time * 0.7) * 45;
                    const scale = fov / zWave;

                    const xScreen = width / 2 + xWorld * scale;
                    const yScreen =
                        height / 2 + (waveY + (rRatio - 0.5) * 220 + mouse.y * 120) * scale;

                    if (p === 0) ctx.moveTo(xScreen, yScreen);
                    else ctx.lineTo(xScreen, yScreen);

                    // Glowing nodal beads on primary harmonic strands
                    if (r % 7 === 0 && p % 8 === 0) {
                        ctx.fillStyle = `hsla(${hue}, 95%, 75%, ${alpha * 1.4})`;
                        ctx.fillRect(xScreen - 1.5, yScreen - 1.5, 3, 3);
                    }
                }

                ctx.stroke();
            }

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
            <canvas ref={canvasRef} className="absolute inset-0 block" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 pointer-events-none mix-blend-difference text-white">
                <span className="font-mono text-xs tracking-[0.3em] uppercase mb-3 opacity-80">
                    {badge}
                </span>
                <h1 className="font-mono text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none">
                    {title}
                </h1>
                <p className="mt-4 font-mono text-xs md:text-sm max-w-lg opacity-75">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}