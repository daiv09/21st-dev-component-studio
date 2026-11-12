"use client";

import React, { useEffect, useRef, useState } from "react";

// Single circular blob in the center that deforms its outline with summed
// sine waves and has a metallic highlight. Mouse drag attracts/repels.
export default function LiquidMercuryOrb() {
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
        let cx = 0;
        let cy = 0;
        let tx = 0;
        let ty = 0;
        const mouse = { x: 0, y: 0, active: false, px: 0, py: 0 };

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
            cx = width / 2;
            cy = height / 2;
            tx = cx;
            ty = cy;
        };

        const onMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.px = e.clientX - rect.left;
            mouse.py = e.clientY - rect.top;
            mouse.active = true;
        };
        const onLeave = () => {
            mouse.active = false;
        };

        const draw = () => {
            t += 1;
            ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(0, 0, width, height);

            // attract to mouse
            if (mouse.active) {
                tx += (mouse.px - tx) * 0.04;
                ty += (mouse.py - ty) * 0.04;
            } else {
                tx += (cx - tx) * 0.04;
                ty += (cy - ty) * 0.04;
            }
            // ambient float
            const floatX = Math.sin(t * 0.008) * 8;
            const floatY = Math.cos(t * 0.01) * 6;
            const x = tx + floatX;
            const y = ty + floatY;
            const baseR = Math.min(width, height) * 0.22;

            // body
            const grad = ctx.createRadialGradient(
                x - baseR * 0.4, y - baseR * 0.4, baseR * 0.1,
                x, y, baseR * 1.2
            );
            if (isDark) {
                grad.addColorStop(0, "#f8fafc");
                grad.addColorStop(0.4, "#94a3b8");
                grad.addColorStop(0.8, "#1e293b");
                grad.addColorStop(1, "#020617");
            } else {
                grad.addColorStop(0, "#ffffff");
                grad.addColorStop(0.5, "#cbd5e1");
                grad.addColorStop(1, "#64748b");
            }
            ctx.fillStyle = grad;
            ctx.beginPath();
            const points = 80;
            for (let i = 0; i <= points; i++) {
                const a = (i / points) * Math.PI * 2;
                const r =
                    baseR +
                    Math.sin(a * 3 + t * 0.04) * 8 +
                    Math.cos(a * 5 - t * 0.03) * 6 +
                    Math.sin(a * 2 + t * 0.05) * 4;
                const px = x + Math.cos(a) * r;
                const py = y + Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            // highlight
            ctx.fillStyle = isDark ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.9)";
            ctx.beginPath();
            ctx.ellipse(x - baseR * 0.35, y - baseR * 0.35, baseR * 0.25, baseR * 0.15, -0.5, 0, Math.PI * 2);
            ctx.fill();

            raf = requestAnimationFrame(draw);
        };

        resize();
        draw();
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", resize);

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("resize", resize);
        };
    }, [isDark]);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black overflow-hidden cursor-pointer">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
