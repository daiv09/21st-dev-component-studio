'use client';

import React, { useEffect, useRef } from 'react';

export interface HyperbolicGridMotionProps {
  density?: number;
  warpStrength?: number;
  speed?: number;
  gridColor?: string;
  glowColor?: string;
  interactive?: boolean;
}

export function HyperbolicGridMotion({
  density = 16,
  warpStrength = 1.8,
  speed = 0.8,
  gridColor = '#3b82f6',
  glowColor = '#8b5cf6',
  interactive = true,
}: HyperbolicGridMotionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
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

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    handleResize();

    const draw = () => {
      time += 0.01 * speed;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.hypot(width, height) / 2;

      ctx.save();

      // Background ambient glow
      const bgGlow = ctx.createRadialGradient(
        mouseRef.current.x > 0 ? mouseRef.current.x : centerX,
        mouseRef.current.y > 0 ? mouseRef.current.y : centerY,
        0,
        centerX,
        centerY,
        maxRadius
      );
      bgGlow.addColorStop(0, `${glowColor}15`);
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw concentric hyperbolic rings
      const ringCount = density * 2;
      for (let i = 1; i <= ringCount; i++) {
        const norm = i / ringCount;
        const rBase = Math.pow(norm, 1.8) * maxRadius;
        
        ctx.beginPath();
        const segments = 120;

        for (let s = 0; s <= segments; s++) {
          const angle = (s / segments) * Math.PI * 2 + time * 0.2;
          let px = centerX + Math.cos(angle) * rBase;
          let py = centerY + Math.sin(angle) * rBase;

          // Apply gravitational lens warping
          if (mouseRef.current.x > 0) {
            const dx = px - mouseRef.current.x;
            const dy = py - mouseRef.current.y;
            const dist = Math.hypot(dx, dy) + 1;
            const warpFactor = Math.max(0, 1 - dist / 350) * warpStrength * 120;
            const angleToMouse = Math.atan2(dy, dx);
            px += Math.cos(angleToMouse) * warpFactor;
            py += Math.sin(angleToMouse) * warpFactor;
          }

          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        const alpha = Math.sin(norm * Math.PI) * 0.6 + 0.15;
        ctx.strokeStyle = `${gridColor}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1 + (1 - norm) * 1.5;
        ctx.stroke();
      }

      // Draw hyperbolic radial spoke curves
      const spokeCount = density * 2.5;
      for (let i = 0; i < spokeCount; i++) {
        const baseAngle = (i / spokeCount) * Math.PI * 2 + time * 0.1;
        ctx.beginPath();
        
        const steps = 40;
        for (let step = 0; step <= steps; step++) {
          const norm = step / steps;
          const r = Math.pow(norm, 1.6) * maxRadius;
          const spiralAngle = baseAngle + norm * Math.sin(time + i * 0.2) * 0.4;
          
          let px = centerX + Math.cos(spiralAngle) * r;
          let py = centerY + Math.sin(spiralAngle) * r;

          // Mouse distortion
          if (mouseRef.current.x > 0) {
            const dx = px - mouseRef.current.x;
            const dy = py - mouseRef.current.y;
            const dist = Math.hypot(dx, dy) + 1;
            const warpFactor = Math.max(0, 1 - dist / 300) * warpStrength * 90;
            const angleToMouse = Math.atan2(dy, dx);
            px += Math.cos(angleToMouse) * warpFactor;
            py += Math.sin(angleToMouse) * warpFactor;
          }

          if (step === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        ctx.strokeStyle = `${glowColor}44`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density, warpStrength, speed, gridColor, glowColor, interactive]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}

export default HyperbolicGridMotion;
