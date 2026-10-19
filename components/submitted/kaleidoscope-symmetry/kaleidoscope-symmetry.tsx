'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function KaleidoscopeSymmetry() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Detect dark/light mode from the document
  useEffect(() => {
    const checkTheme = () => {
      const isDark =
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = () => {
      time += 0.008; // Smooth, hypnotic self-driven animation speed

      // Motion blur trail background clearing
      ctx.fillStyle = isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, 0, width, height);

      // Perfectly centered origin point
      const cx = width / 2;
      const cy = height / 2;
      const segments = 8;

      for (let seg = 0; seg < segments; seg++) {
        const segAngle = (seg / segments) * Math.PI * 2 + time * 0.08;
        const isMirrored = seg % 2 === 1;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(segAngle);
        if (isMirrored) ctx.scale(-1, 1);

        for (let layer = 0; layer < 4; layer++) {
          const layerT = time + layer * 0.4;
          const baseR = 70 + layer * 55;
          const particleCount = 24;

          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 0.9 - Math.PI * 0.45;
            const r = baseR + Math.sin(layerT + i * 0.25) * 35;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r * 0.75;

            const hue = (i * 14 + layer * 50 + time * 25) % 360;
            const size = Math.abs(1.8 + Math.sin(layerT * 1.8 + i) * 1.4);

            const lightness = isDarkMode ? '60%' : '48%';
            const alphaMain = isDarkMode ? '0.75' : '0.85';
            const alphaTrail = isDarkMode ? '0.25' : '0.35';

            // Primary particle
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 85%, ${lightness}, ${alphaMain})`;
            ctx.fill();

            // Smooth trailing particle
            ctx.beginPath();
            ctx.arc(
              x - Math.cos(angle) * 12,
              y - Math.sin(angle) * 8,
              size * 0.55,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = `hsla(${hue}, 85%, ${lightness}, ${alphaTrail})`;
            ctx.fill();
          }
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDarkMode]);

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />
    </div>
  );
}