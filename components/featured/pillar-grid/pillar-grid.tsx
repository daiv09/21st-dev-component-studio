"use client";

import React, { useEffect, useRef, useState } from "react";

export interface PillarGridProps {
    title?: string;
    subtitle?: string;
    description?: string;
    className?: string;
}

export function PillarGrid({
    title = "COLUMNS",
    subtitle = "",
    description = "Isometric hexagonal pillars smoothly oscillating vertically with live cursor elevation tracking.",
    className = "",
}: PillarGridProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDarkMode(mediaQuery.matches);
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const mouse = { x: -1000, y: -1000 };

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
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        let time = 0;

        const render = () => {
            time += 0.02;

            const bgColor = isDarkMode ? "#020617" : "#f8fafc";
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);

            const radius = 22;
            const xSpacing = radius * Math.sqrt(3);
            const ySpacing = radius * 1.5;

            const cols = Math.ceil(width / xSpacing) + 2;
            const rows = Math.ceil(height / ySpacing) + 4;

            const drawHexPillar = (centerX: number, centerY: number, h: number) => {
                const topY = centerY - h;

                // Monochrome isometric 3D shading (No colored elevation highlights)
                const topFill = isDarkMode ? "#1e293b" : "#e2e8f0";
                const leftFill = isDarkMode ? "#0f172a" : "#cbd5e1";
                const rightFill = isDarkMode ? "#334155" : "#94a3b8";

                // Top Hex Face
                ctx.fillStyle = topFill;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 6;
                    const px = centerX + radius * Math.cos(angle);
                    const py = topY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();

                // Left Vertical Face
                ctx.fillStyle = leftFill;
                ctx.beginPath();
                ctx.moveTo(centerX - (radius * Math.sqrt(3)) / 2, topY + radius / 2);
                ctx.lineTo(centerX, topY + radius);
                ctx.lineTo(centerX, centerY + radius);
                ctx.lineTo(
                    centerX - (radius * Math.sqrt(3)) / 2,
                    centerY + radius / 2
                );
                ctx.closePath();
                ctx.fill();

                // Right Vertical Face
                ctx.fillStyle = rightFill;
                ctx.beginPath();
                ctx.moveTo(centerX, topY + radius);
                ctx.lineTo(centerX + (radius * Math.sqrt(3)) / 2, topY + radius / 2);
                ctx.lineTo(
                    centerX + (radius * Math.sqrt(3)) / 2,
                    centerY + radius / 2
                );
                ctx.lineTo(centerX, centerY + radius);
                ctx.closePath();
                ctx.fill();
            };

            for (let r = -2; r < rows; r++) {
                for (let c = -1; c < cols; c++) {
                    const x = c * xSpacing + (r % 2 === 0 ? 0 : xSpacing / 2);
                    const y = r * ySpacing;

                    // Continuous organic wave oscillation
                    const wave = Math.sin(c * 0.4 + r * 0.4 + time) * 12 + 10;

                    // Mouse proximity force field
                    const dx = mouse.x - x;
                    const dy = mouse.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    let mouseElevation = 0;
                    if (dist < 180) {
                        mouseElevation = (1 - dist / 180) * 32;
                    }

                    drawHexPillar(x, y, wave + mouseElevation);
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [isDarkMode]);

    return (
        <div
            className={`relative w-full h-screen overflow-hidden select-none bg-slate-950 ${className}`}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block cursor-default"
            />

            <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4 pointer-events-none mix-blend-difference text-white">
                {subtitle && (
                    <span className="font-mono text-xs tracking-widest uppercase mb-3 text-slate-400">
                        {subtitle}
                    </span>
                )}
                {title && (
                    <h1 className="font-mono text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none">
                        {title}
                    </h1>
                )}
                {description && (
                    <p className="mt-4 font-mono text-xs md:text-sm max-w-lg opacity-70">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default PillarGrid;