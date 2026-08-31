"use client";

import React, { useEffect, useRef, useState } from "react";

// Mousemove spawns a ripple at the cursor position that expands and fades.
// Capped at 12.
interface Ripple { id: number; x: number; y: number; life: number; }

export default function RippleCursorPortal() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDark, setIsDark] = useState(true);
    const ripples = useRef<Ripple[]>([]);
    const idRef = useRef(0);

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

        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            idRef.current += 1;
            ripples.current.push({
                id: idRef.current,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                life: 0,
            });
            if (ripples.current.length > 12) ripples.current.shift();
        };

        const draw = () => {
            ctx.fillStyle = isDark
                ? "rgba(0, 0, 0, 0.25)"
                : "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(0, 0, width, height);

            for (let i = ripples.current.length - 1; i >= 0; i--) {
                const r = ripples.current[i];
                r.life += 0.012;
                if (r.life > 1) {
                    ripples.current.splice(i, 1);
                    continue;
                }
                const radius = r.life * 80;
                const alpha = 1 - r.life;
                ctx.beginPath();
                ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = isDark
                    ? `rgba(99, 102, 241, ${alpha})`
                    : `rgba(79, 70, 229, ${alpha * 0.7})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            raf = requestAnimationFrame(draw);
        };

        resize();
        draw();
        canvas.addEventListener("mousemove", onMove);
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("mousemove", onMove);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden cursor-crosshair">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
