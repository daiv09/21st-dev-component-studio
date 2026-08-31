"use client";

import React, { useEffect, useRef, useState } from "react";

// 3D isometric grid of cubes stacked like a tower; the tower undulates
// (each row's height modulated by sine) so it looks like a wavy city block.
export default function IsoCubeTower() {
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

        const project = (x: number, y: number, z: number) => {
            const ang = Math.PI / 6;
            const px = (x - y) * Math.cos(ang);
            const py = (x + y) * Math.sin(ang) - z;
            return { px, py };
        };

        const drawCube = (gx: number, gy: number, gz: number, size: number) => {
            const s = size / 2;
            const top = [
                project(gx - s, gy - s, gz + s),
                project(gx + s, gy - s, gz + s),
                project(gx + s, gy + s, gz + s),
                project(gx - s, gy + s, gz + s),
            ];
            const left = [
                project(gx - s, gy - s, gz + s),
                project(gx - s, gy + s, gz + s),
                project(gx - s, gy + s, gz - s),
                project(gx - s, gy - s, gz - s),
            ];
            const right = [
                project(gx + s, gy + s, gz + s),
                project(gx + s, gy - s, gz + s),
                project(gx + s, gy - s, gz - s),
                project(gx + s, gy + s, gz - s),
            ];
            const cx = width / 2;
            const cy = height * 0.75;
            const drawFace = (pts: { px: number; py: number }[], fill: string) => {
                ctx.beginPath();
                ctx.moveTo(cx + pts[0].px, cy + pts[0].py);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(cx + pts[i].px, cy + pts[i].py);
                ctx.closePath();
                ctx.fillStyle = fill;
                ctx.fill();
            };
            drawFace(top, isDark ? "#a78bfa" : "#c4b5fd");
            drawFace(left, isDark ? "#6d28d9" : "#8b5cf6");
            drawFace(right, isDark ? "#4c1d95" : "#7c3aed");
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.18)" : "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(0, 0, width, height);

            const size = 26;
            const cols = 7;
            const rows = 7;
            // pre-compute heights so we draw back-to-front
            const heights: number[][] = [];
            for (let r = 0; r < rows; r++) {
                heights.push([]);
                for (let c = 0; c < cols; c++) {
                    const wave =
                        Math.sin(c * 0.4 + t * 0.02) * 1.2 +
                        Math.cos(r * 0.3 + t * 0.025) * 1.2;
                    heights[r].push(Math.max(0, Math.round(wave + 2)));
                }
            }

            // back-to-front: increasing (r + c)
            const order: { r: number; c: number }[] = [];
            for (let s = 0; s < cols + rows - 1; s++) {
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (r + c === s) order.push({ r, c });
                    }
                }
            }

            for (const { r, c } of order) {
                const h = heights[r][c];
                for (let i = 0; i < h; i++) {
                    const gx = (c - cols / 2) * size;
                    const gy = (r - rows / 2) * size;
                    const gz = i * size;
                    drawCube(gx, gy, gz, size);
                }
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
