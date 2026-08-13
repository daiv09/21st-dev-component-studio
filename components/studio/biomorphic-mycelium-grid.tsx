'use client';

import React, { useEffect, useRef } from 'react';

export interface BiomorphicMyceliumGridProps {
  nodeCount?: number;
  pulseSpeed?: number;
  bioColor?: string;
  stemColor?: string;
}

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  pulse: number;
  size: number;
  neighbors: number[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface SporePulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

export function BiomorphicMyceliumGrid({
  nodeCount = 55,
  pulseSpeed = 1.0,
  bioColor = '#10b981',
  stemColor = '#059669',
}: BiomorphicMyceliumGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let particles: Particle[] = [];
    let sporePulses: SporePulse[] = [];

    const initMycelium = (w: number, h: number) => {
      nodes = [];
      particles = [];
      sporePulses = [];

      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          pulse: Math.random() * Math.PI * 2,
          size: 2.5 + Math.random() * 2,
          neighbors: [],
        });
      }

      // Build organic mesh connections with neighbor distance limit
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 180) {
            nodes[i].neighbors.push(j);

            // Seed initial spore pulses along filaments
            if (Math.random() < 0.3) {
              sporePulses.push({
                fromNode: i,
                toNode: j,
                progress: Math.random(),
                speed: (0.003 + Math.random() * 0.005) * pulseSpeed,
              });
            }
          }
        }
      }
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initMycelium(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Spawn burst of bioluminescent spore particles on click
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2.5;
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: 60 + Math.random() * 40,
          size: 1.5 + Math.random() * 2,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    handleResize();

    let lastTime = performance.now();

    const draw = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // --- 1. Update and Render Spore Particles ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `${bioColor}${Math.floor(p.life * 255)
          .toString(16)
          .padStart(2, '0')}`;
        ctx.fill();
      }

      // --- 2. Update Nodes & Positions ---
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Smooth sinusoidal floating movement
        node.pulse += 1.2 * dt * pulseSpeed;
        node.x += Math.sin(node.pulse * 0.8) * 0.3 + node.vx;
        node.y += Math.cos(node.pulse * 0.7) * 0.3 + node.vy;

        // Keep inside bounds softly
        if (node.x < 10 || node.x > width - 10) node.vx *= -1;
        if (node.y < 10 || node.y > height - 10) node.vy *= -1;

        // Mouse attraction / deflection physics
        const mouseDist = Math.hypot(
          node.x - mouseRef.current.x,
          node.y - mouseRef.current.y
        );
        const isHovered = mouseDist < 180;

        if (isHovered && mouseRef.current.active) {
          const angle = Math.atan2(
            mouseRef.current.y - node.y,
            mouseRef.current.x - node.x
          );
          const force = (180 - mouseDist) / 180;
          node.x += Math.cos(angle) * force * 1.2;
          node.y += Math.sin(angle) * force * 1.2;
        }

        // --- 3. Draw Curved Hyphae Connections ---
        for (let k = 0; k < node.neighbors.length; k++) {
          const targetNode = nodes[node.neighbors[k]];
          const dist = Math.hypot(
            node.x - targetNode.x,
            node.y - targetNode.y
          );

          if (dist > 220) continue; // Skip stretched filaments

          const alpha =
            (1 - dist / 220) * (isHovered ? 0.85 : 0.3);

          // Quadratic curve midpoint sway
          const midX =
            (node.x + targetNode.x) / 2 +
            Math.sin(node.pulse + i) * 12;
          const midY =
            (node.y + targetNode.y) / 2 +
            Math.cos(node.pulse + k) * 12;

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.quadraticCurveTo(midX, midY, targetNode.x, targetNode.y);

          ctx.strokeStyle = isHovered
            ? bioColor
            : `${stemColor}${Math.floor(alpha * 255)
              .toString(16)
              .padStart(2, '0')}`;
          ctx.lineWidth = isHovered ? 1.6 : 0.75;
          ctx.stroke();
        }

        // --- 4. Draw Interactive Hyphae Tendril to Cursor ---
        if (isHovered && mouseRef.current.active) {
          const tenderAlpha = (1 - mouseDist / 180) * 0.6;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.quadraticCurveTo(
            (node.x + mouseRef.current.x) / 2 + Math.sin(node.pulse) * 15,
            (node.y + mouseRef.current.y) / 2 + Math.cos(node.pulse) * 15,
            mouseRef.current.x,
            mouseRef.current.y
          );
          ctx.strokeStyle = `${bioColor}${Math.floor(tenderAlpha * 255)
            .toString(16)
            .padStart(2, '0')}`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // --- 5. Draw Node Bulb Glow ---
        const glowVal = Math.sin(node.pulse) * 0.5 + 0.5;
        const currentRadius = isHovered
          ? node.size + glowVal * 3
          : node.size;

        // Outer Aura
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isHovered
          ? `${bioColor}44`
          : `${stemColor}18`;
        ctx.fill();

        // Inner Core Bulb
        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? bioColor : `${stemColor}dd`;
        ctx.fill();
      }

      // --- 6. Render Streaming Spore Pulses along Hyphae ---
      for (let i = 0; i < sporePulses.length; i++) {
        const pulse = sporePulses[i];
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) pulse.progress = 0;

        const n1 = nodes[pulse.fromNode];
        const n2 = nodes[pulse.toNode];

        if (!n1 || !n2) continue;

        const midX = (n1.x + n2.x) / 2 + Math.sin(n1.pulse) * 12;
        const midY = (n1.y + n2.y) / 2 + Math.cos(n1.pulse) * 12;

        // Calculate position on Quadratic Bezier Curve
        const t = pulse.progress;
        const px =
          (1 - t) * (1 - t) * n1.x + 2 * (1 - t) * t * midX + t * t * n2.x;
        const py =
          (1 - t) * (1 - t) * n1.y + 2 * (1 - t) * t * midY + t * t * n2.y;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = bioColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = bioColor;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset blur
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodeCount, pulseSpeed, bioColor, stemColor]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-crosshair"
      />
    </div>
  );
}

export default BiomorphicMyceliumGrid;