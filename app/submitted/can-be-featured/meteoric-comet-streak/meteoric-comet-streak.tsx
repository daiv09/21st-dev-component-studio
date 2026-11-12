"use client";

import React, { useEffect, useRef, useState } from "react";

// Every ~600ms a comet streaks diagonally with a long glowing tail.
export default function MeteoricCometStreak() {
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
        let lastSpawn = 0;

        interface Comet {
            x: number;
            y: number;
            vx: number;
            vy: number;
            life: number;
            hue: number;
        }
        let comets: Comet[] = [];

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

        const spawn = () => {
            const angle = (Math.PI * 0.18) + (Math.random() - 0.5) * 0.1;
            const speed = 6 + Math.random() * 4;
            comets.push({
                x: -50,
                y: Math.random() * height * 0.6,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                hue: isDark ? 180 + Math.random() * 80 : 200 + Math.random() * 40,
            });
        };

        const draw = (now: number) => {
            ctx.fillStyle = isDark ? "rgba(2, 2, 10, 0.2)" : "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(0, 0, width, height);

            if (now - lastSpawn > 600) {
                spawn();
                lastSpawn = now;
            }

            ctx.globalCompositeOperation = "lighter";
            for (let i = comets.length - 1; i >= 0; i--) {
                const c = comets[i];
                c.x += c.vx;
                c.y += c.vy;
                c.life -= 0.008;

                const tailLen = 80;
                const tx = c.x - c.vx * 6;
                const ty = c.y - c.vy * 6;
                const g = ctx.createLinearGradient(c.x, c.y, tx, ty);
                g.addColorStop(0, `hsla(${c.hue}, 90%, 70%, 1)`);
                g.addColorStop(1, `hsla(${c.hue}, 90%, 50%, 0)`);
                ctx.strokeStyle = g;
                ctx.lineWidth = 2.4;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(tx, ty);
                ctx.stroke();
                // head
                ctx.fillStyle = `hsla(${c.hue}, 90%, 85%, ${c.life})`;
                ctx.beginPath();
                ctx.arc(c.x, c.y, 1.8, 0, Math.PI * 2);
                ctx.fill();

                if (c.life <= 0 || c.x > width + 100) comets.splice(i, 1);
            }
            ctx.globalCompositeOperation = "source-over";

            raf = requestAnimationFrame(draw);
        };

        resize();
        raf = requestAnimationFrame(draw);
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
