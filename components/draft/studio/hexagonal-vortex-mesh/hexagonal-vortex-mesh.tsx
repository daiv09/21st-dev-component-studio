'use client';

import React, { useEffect, useRef } from 'react';

export interface HexagonalVortexMeshProps {
  hexRadius?: number;
  gap?: number;
  neonColor?: string;
  secondaryColor?: string;
  springFactor?: number;
}

interface HexNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  z: number;
  vz: number;
  hue: number;
}

export function HexagonalVortexMesh({
  hexRadius = 24,
  gap = 4,
  neonColor = '#10b981',
  secondaryColor = '#06b6d4',
  springFactor = 0.08,
}: HexagonalVortexMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isDown: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;
    let nodes: HexNode[] = [];

    const initGrid = (w: number, h: number) => {
      nodes = [];
      const r = hexRadius + gap;
      const xSpacing = r * 1.732;
      const ySpacing = r * 1.5;

      const cols = Math.ceil(w / xSpacing) + 2;
      const rows = Math.ceil(h / ySpacing) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const xOffset = (row % 2) * (xSpacing / 2);
          const x = col * xSpacing + xOffset;
          const y = row * ySpacing;

          nodes.push({
            x,
            y,
            baseX: x,
            baseY: y,
            z: 0,
            vz: 0,
            hue: (col * 15 + row * 10) % 360,
          });
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
      initGrid(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseDown = () => {
      mouseRef.current.isDown = true;
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    handleResize();

    const drawHexagon = (x: number, y: number, r: number, z: number, alpha: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + Math.cos(angle) * (r + z * 0.15);
        const py = y + Math.sin(angle) * (r + z * 0.15);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const draw = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dist = Math.hypot(node.baseX - mouseRef.current.x, node.baseY - mouseRef.current.y);

        let targetZ = Math.sin(time + dist * 0.02) * 4;

        if (dist < 200) {
          const push = (1 - dist / 200) * (mouseRef.current.isDown ? 45 : 25);
          targetZ += push;
        }

        // Spring physics
        const force = (targetZ - node.z) * springFactor;
        node.vz = (node.vz + force) * 0.85;
        node.z += node.vz;

        const alpha = Math.min(1, 0.15 + (node.z / 35) * 0.85);

        ctx.save();
        drawHexagon(node.baseX, node.baseY - node.z * 0.4, hexRadius, node.z, alpha);

        if (node.z > 8) {
          ctx.fillStyle = `${neonColor}${Math.floor(alpha * 70).toString(16).padStart(2, '0')}`;
          ctx.fill();
        }

        ctx.strokeStyle = node.z > 12 ? neonColor : `${secondaryColor}${Math.floor(alpha * 160).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = node.z > 15 ? 2.2 : 1;
        ctx.stroke();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hexRadius, gap, neonColor, secondaryColor, springFactor]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-slate-950 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}

export default HexagonalVortexMesh;
