"use client";

import React, { useEffect, useRef, useState } from "react";

// Iterative branching coral that grows from a base, then re-spawns.
export default function SeaCoralGrower() {
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

        interface Branch { x: number; y: number; angle: number; len: number; depth: number; growth: number; }
        let branches: Branch[] = [];
        let grown = 0;
        const maxBranches = 220;
        const start = () => {
            branches = [];
            const baseX = width / 2;
            const baseY = height - 20;
            branches.push({ x: baseX, y: baseY, angle: -Math.PI / 2, len: 4, depth: 0, growth: 0 });
            grown = 0;
        };

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
            start();
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(2, 6, 18, 0.1)" : "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(0, 0, width, height);

            // grow a few new branches per frame
            if (grown < maxBranches) {
                const n = Math.min(2, maxBranches - grown);
                for (let i = 0; i < n; i++) {
                    const candidates = branches.filter((b) => b.depth < 5 && b.growth >= 1);
                    if (candidates.length === 0) {
                        // take any branch and finish it
                        const b = branches[Math.floor(Math.random() * branches.length)];
                        b.growth = 1;
                    } else {
                        const b = candidates[Math.floor(Math.random() * candidates.length)];
                        const spread = 0.4 + Math.random() * 0.3;
                        const newLen = b.len * (0.7 + Math.random() * 0.2);
                        const a1 = b.angle - spread;
                        const a2 = b.angle + spread;
                        branches.push({
                            x: b.x + Math.cos(b.angle) * b.len,
                            y: b.y + Math.sin(b.angle) * b.len,
                            angle: a1,
                            len: newLen,
                            depth: b.depth + 1,
                            growth: 0,
                        });
                        branches.push({
                            x: b.x + Math.cos(b.angle) * b.len,
                            y: b.y + Math.sin(b.angle) * b.len,
                            angle: a2,
                            len: newLen,
                            depth: b.depth + 1,
                            growth: 0,
                        });
                        b.growth = 1;
                        grown += 2;
                    }
                }
                for (const b of branches) {
                    if (b.growth < 1) b.growth = Math.min(1, b.growth + 0.05);
                }
            } else {
                // respawn after a pause
                if (t % 600 === 0) start();
            }

            const stroke = isDark ? "rgba(244, 114, 182, 0.85)" : "rgba(190, 24, 93, 0.8)";
            ctx.lineCap = "round";
            for (const b of branches) {
                ctx.strokeStyle = stroke;
                ctx.lineWidth = Math.max(0.5, 4 - b.depth * 0.6);
                const x2 = b.x + Math.cos(b.angle) * b.len * b.growth;
                const y2 = b.y + Math.sin(b.angle) * b.len * b.growth;
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(x2, y2);
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
