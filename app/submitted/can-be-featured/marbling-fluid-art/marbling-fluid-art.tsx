"use client";

import React, { useEffect, useRef, useState } from "react";

// Flow-field of ~150 particles advected by a layered-sine noise field.
// Each leaves a fading trail. Click adds a "drop" that perturbs the field.
export default function MarblingFluidArt() {
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

        interface Perturb { x: number; y: number; life: number; }
        let perturbs: Perturb[] = [];

        interface P { x: number; y: number; }
        let particles: P[] = [];
        const N = 220;

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

        const seed = () => {
            particles = [];
            for (let i = 0; i < N; i++) {
                particles.push({ x: Math.random() * width, y: Math.random() * height });
            }
        };

        const field = (x: number, y: number) => {
            // Layered sine "noise" (cheap stand-in for Perlin)
            const a = Math.sin(x * 0.005 + t * 0.005) * Math.cos(y * 0.005);
            const b = Math.sin((x + y) * 0.003 + t * 0.003) * 1.5;
            let vx = a + b * 0.5;
            let vy = Math.cos(x * 0.004 + t * 0.004) + Math.sin(y * 0.006);
            // perturbs act as attractors
            for (const p of perturbs) {
                const dx = x - p.x;
                const dy = y - p.y;
                const d2 = dx * dx + dy * dy + 200;
                const f = (p.life * 300) / d2;
                vx += (-dy / Math.sqrt(d2)) * f;
                vy += (dx / Math.sqrt(d2)) * f;
            }
            return { vx, vy };
        };

        const click = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            perturbs.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, life: 1 });
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)";
            ctx.fillRect(0, 0, width, height);

            const col = isDark ? "rgba(168, 85, 247, 0.5)" : "rgba(99, 102, 241, 0.4)";
            ctx.fillStyle = col;
            for (const p of particles) {
                const f = field(p.x, p.y);
                p.x += f.vx;
                p.y += f.vy;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                ctx.fillRect(p.x, p.y, 1.4, 1.4);
            }

            // decay perturbs
            for (let i = perturbs.length - 1; i >= 0; i--) {
                perturbs[i].life -= 0.005;
                if (perturbs[i].life <= 0) perturbs.splice(i, 1);
            }
            // pulse perturbs
            for (const p of perturbs) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, (1 - p.life) * 60, 0, Math.PI * 2);
                ctx.strokeStyle = isDark
                    ? `rgba(236, 72, 153, ${p.life * 0.4})`
                    : `rgba(236, 72, 153, ${p.life * 0.3})`;
                ctx.stroke();
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        seed();
        draw();
        canvas.addEventListener("click", click);
        window.addEventListener("resize", () => {
            resize();
            seed();
        });

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("click", click);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden cursor-crosshair">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
