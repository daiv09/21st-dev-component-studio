"use client"

import React, { useEffect, useRef } from 'react';

export default function ChladniWaveField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetParams = useRef({ m: 4, n: 5 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let m = 4;
        let n = 5;
        let animationFrameId: number;

        const resolution = 2;
        const width = canvas.width;
        const height = canvas.height;

        const render = () => {
            // Damping towards target
            m += (targetParams.current.m - m) * 0.05;
            n += (targetParams.current.n - n) * 0.05;

            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;

            // Check if current theme is dark mode by inspecting html class
            const isDark = document.documentElement.classList.contains('dark') || !!canvas.closest('.dark');

            for (let x = 0; x < width; x += resolution) {
                for (let y = 0; y < height; y += resolution) {
                    const nx = (x / width) * Math.PI * 2 - Math.PI;
                    const ny = (y / height) * Math.PI * 2 - Math.PI;

                    const val = Math.sin(m * nx) * Math.sin(n * ny) - Math.sin(n * nx) * Math.sin(m * ny);
                    const intensity = Math.abs(val);
                    const threshold = 0.15;

                    let colorValue = 0;
                    if (intensity < threshold) {
                        colorValue = Math.floor((1 - intensity / threshold) * 255);
                    }

                    // In dark mode: nodal lines are bright white on black background
                    // In light mode: nodal lines are dark gray/black on white background
                    let r = isDark ? colorValue : 255 - colorValue;
                    let g = isDark ? colorValue : 255 - colorValue;
                    let b = isDark ? colorValue : 255 - colorValue;

                    for (let dx = 0; dx < resolution; dx++) {
                        for (let dy = 0; dy < resolution; dy++) {
                            const px = x + dx;
                            const py = y + dy;
                            const index = (py * width + px) * 4;
                            data[index] = r;
                            data[index + 1] = g;
                            data[index + 2] = b;
                            data[index + 3] = 255;
                        }
                    }
                }
            }

            ctx.putImageData(imgData, 0, 0);
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        targetParams.current = {
            m: 1 + Math.floor((x / rect.width) * 7),
            n: 1 + Math.floor((y / rect.height) * 7)
        };
    };

    return (
        <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white p-6 flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-900 shadow-xl transition-colors duration-300">
            <div className="mb-4 font-mono text-xs text-zinc-400 dark:text-zinc-500 tracking-wider">ATMOS // CHLADNI_GRID</div>
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                onMouseMove={handleMouseMove}
                className="rounded-lg border border-zinc-200 dark:border-zinc-900 cursor-crosshair bg-white dark:bg-black transition-colors duration-300"
            />
            <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-600 mt-3 text-center">Hover to modulate harmonic frequencies</span>
        </div>
    );
}
export { ChladniWaveField };
