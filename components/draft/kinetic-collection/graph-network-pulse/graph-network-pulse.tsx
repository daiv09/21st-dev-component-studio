'use client';

import React, { useEffect, useRef } from 'react';

export default function GraphNetworkPulse() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;
    const mouse = { x: 0.5, y: 0.5 };
    const nodes: { x: number; y: number; vx: number; vy: number; energy: number }[] = [];

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
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / width;
      mouse.y = (e.clientY - rect.top) / height;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    handleResize();

    // Create graph network
    const gridSize = 100;
    for (let x = 0; x <= width + gridSize; x += gridSize) {
      for (let y = 0; y <= height + gridSize; y += gridSize) {
        if (Math.random() > 0.7) {
          nodes.push({
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            energy: 0,
          });
        }
      }
    }

    const render = () => {
      time += 0.008;
      ctx.fillStyle = 'rgba(8, 5, 16, 0.06)';
      ctx.fillRect(0, 0, width, height);

      // Update nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const dx = mouse.x * width - n.x;
        const dy = mouse.y * height - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        n.energy = Math.max(0, 1 - dist / 200);
      }

      // Draw connections
      ctx.strokeStyle = 'rgba(150, 180, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.3;
            const energy = (nodes[i].energy + nodes[j].energy) / 2;
            ctx.strokeStyle = `rgba(${150 + energy * 100}, ${180 + energy * 75}, 255, ${alpha + energy * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const size = 1 + n.energy * 4;
        const hue = 200 + n.energy * 40;
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${0.5 + n.energy * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fill();

        if (n.energy > 0.3) {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 6);
          glow.addColorStop(0, `hsla(${hue}, 80%, 70%, ${n.energy * 0.5})`);
          glow.addColorStop(1, `hsla(${hue}, 80%, 70%, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, size * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#080510]">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
