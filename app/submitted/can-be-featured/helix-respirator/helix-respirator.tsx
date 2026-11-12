"use client";

import React, { useEffect, useRef, useState } from "react";

// 2 DNA-style helices rotating around a vertical axis; "rungs" connecting
// them travel up like a respiratory pulse.
export default function HelixRespirator() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);
        const h = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq.addEventListener("change", h);
        return () => mq.removeEventListener("change", h);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        let raf = 0;
        let width = 0;
        let height = 0;
        let t = 0;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const parent = canvas.parentElement;
            width = parent ? parent.clientWidth : window.innerWidth;
            height = parent ? parent.clientHeight : window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;
            const R = Math.min(width, height) * 0.18;
            const turns = 4;
            const points = 80;
            const H = height * 0.85;
            const yStart = cy - H / 2;

            // strand 1 + 2 (two helices)
            const drawStrand = (offset: number, color: string) => {
                ctx.beginPath();
                for (let i = 0; i <= points; i++) {
                    const y = yStart + (i / points) * H;
                    const a = offset + (i / points) * turns * Math.PI * 2 + t * 0.02;
                    const x = cx + Math.cos(a) * R;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.4;
                ctx.stroke();
            };
            drawStrand(0, isDark ? "#a78bfa" : "#7c3aed");
            drawStrand(Math.PI, isDark ? "#22d3ee" : "#0e7490");

            // rungs: connect matching points along the strands; travel up
            ctx.lineWidth = 1.2;
            for (let i = 0; i < points; i += 2) {
                const y = yStart + (i / points) * H;
                const a = (i / points) * turns * Math.PI * 2 + t * 0.02;
                const x1 = cx + Math.cos(a) * R;
                const x2 = cx + Math.cos(a + Math.PI) * R;
                const pulse = (Math.sin((i / points) * Math.PI * 4 - t * 0.04) + 1) * 0.5;
                ctx.strokeStyle = isDark
                    ? `rgba(255, 255, 255, ${0.15 + pulse * 0.35})`
                    : `rgba(20, 20, 30, ${0.2 + pulse * 0.4})`;
                ctx.beginPath();
                ctx.moveTo(x1, y);
                ctx.lineTo(x2, y);
                ctx.stroke();
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        draw();
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
