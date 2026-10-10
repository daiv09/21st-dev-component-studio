'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

export default function ConstellationMapper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const nodes: Node[] = [];
    const colors = ['#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399'];
    const mouse = { x: 0, y: 0, down: false };

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
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', () => { mouse.down = true; });
    canvas.addEventListener('mouseup', () => { mouse.down = false; });
    handleResize();

    for (let i = 0; i < 20; i++) {
      nodes.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 4 + Math.random() * 6,
        color: colors[i % colors.length],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(5, 5, 12, 0.12)';
      ctx.fillRect(0, 0, width, height);

      let hovered: number | null = null;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += n.pulseSpeed;

        if (n.x < 20 || n.x > width - 20) n.vx *= -1;
        if (n.y < 20 || n.y > height - 20) n.vy *= -1;

        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && mouse.down) {
          n.vx += dx * 0.0003;
          n.vy += dy * 0.0003;
        }
        if (dist < 30) hovered = n.id;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = 1 - dist / 150;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(150, 180, 255, ${alpha * 0.25})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const size = n.radius * (1 + Math.sin(n.pulse) * 0.3);
        const isHovered = hovered === n.id;
        if (isHovered) {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 4);
          glow.addColorStop(0, n.color);
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      if (hovered !== null) setHoveredId(hovered);
      else if (!mouse.down) setHoveredId(null);

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
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {hoveredId !== null && (
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-white/10 backdrop-blur text-white text-xs font-mono">
          Node {hoveredId.toString().padStart(3, '0')} • Active
        </div>
      )}
    </div>
  );
}
