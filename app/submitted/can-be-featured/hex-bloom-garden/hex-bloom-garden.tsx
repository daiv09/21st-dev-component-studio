"use client";

import React, { useEffect, useRef, useState } from "react";

// Hexagonal grid of hex cells that "bloom" in a snake-like order, then reset.
export default function HexBloomGarden() {
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
        const size = 18; // hex radius
        let hexes: { x: number; y: number; order: number }[] = [];

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

            hexes = [];
            const w = Math.sqrt(3) * size;
            const h = size * 1.5;
            const cols = Math.ceil(width / w) + 2;
            const rows = Math.ceil(height / h) + 2;
            let order = 0;
            for (let r = -1; r < rows; r++) {
                for (let c = -1; c < cols; c++) {
                    const x = c * w + (r % 2 === 0 ? 0 : w / 2);
                    const y = r * h;
                    hexes.push({ x, y, order: order++ });
                }
            }
        };

        const drawHex = (cx: number, cy: number, r: number) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
                const x = cx + Math.cos(a) * r;
                const y = cy + Math.sin(a) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(0, 0, width, height);

            const total = hexes.length;
            const speed = 0.18;
            const head = t * speed;
            const tail = head - total * 0.25;

            for (let i = 0; i < total; i++) {
                const h = hexes[i];
                let alpha = 0;
                if (head > h.order && tail < h.order) {
                    const a = (head - h.order) / (head - tail);
                    alpha = Math.sin(a * Math.PI);
                } else if (head <= h.order) {
                    alpha = 0;
                } else {
                    alpha = 0;
                }

                drawHex(h.x, h.y, size * 0.9);
                ctx.strokeStyle = isDark
                    ? `rgba(168, 85, 247, ${0.15 + alpha * 0.5})`
                    : `rgba(124, 58, 237, ${0.15 + alpha * 0.5})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                if (alpha > 0) {
                    drawHex(h.x, h.y, size * 0.55);
                    ctx.fillStyle = isDark
                        ? `rgba(34, 211, 238, ${alpha * 0.6})`
                        : `rgba(8, 145, 178, ${alpha * 0.5})`;
                    ctx.fill();
                }
            }

            // wrap head to allow continuous blooming
            if (head > total + 10) t = 0;

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
