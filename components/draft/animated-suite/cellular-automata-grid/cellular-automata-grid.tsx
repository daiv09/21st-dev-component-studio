'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface CellularAutomataGridProps {
  className?: string;
  cellSize?: number;
}

export function CellularAutomataGrid({
  className,
  cellSize = 8,
}: CellularAutomataGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Game of Life grid state
  const gridRef = useRef<boolean[][]>([]);
  const nextGridRef = useRef<boolean[][]>([]);
  const mouseRef = useRef({ x: -2000, y: -2000, isDown: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let animationId = 0;
    let lastUpdate = 0;

    const initGrid = (w: number, h: number) => {
      cols = Math.ceil(w / cellSize);
      rows = Math.ceil(h / cellSize);
      
      gridRef.current = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => Math.random() > 0.85)
      );
      nextGridRef.current = Array.from({ length: rows }, () => Array(cols).fill(false));
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(dpr, dpr);
      initGrid(rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const updateGrid = () => {
      const grid = gridRef.current;
      const nextGrid = nextGridRef.current;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let neighbors = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) continue;
              const ny = y + i;
              const nx = x + j;
              if (ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
                if (grid[ny][nx]) neighbors++;
              }
            }
          }

          const state = grid[y][x];
          if (state && (neighbors < 2 || neighbors > 3)) {
            nextGrid[y][x] = false; // Dies
          } else if (!state && neighbors === 3) {
            nextGrid[y][x] = true; // Reproduction
          } else {
            nextGrid[y][x] = state; // Stays same
          }
        }
      }

      // Swap buffers
      const temp = gridRef.current;
      gridRef.current = nextGridRef.current;
      nextGridRef.current = temp;
    };

    const draw = (timestamp: number) => {
      // Add cells based on mouse
      if (mouseRef.current.isDown || mouseRef.current.x > -1000) {
        const cx = Math.floor(mouseRef.current.x / cellSize);
        const cy = Math.floor(mouseRef.current.y / cellSize);
        
        // Draw a small block around cursor
        for(let i = -1; i <= 1; i++) {
          for(let j = -1; j <= 1; j++) {
            if (cy+i >= 0 && cy+i < rows && cx+j >= 0 && cx+j < cols) {
              if (Math.random() > 0.5) gridRef.current[cy+i][cx+j] = true;
            }
          }
        }
      }

      if (timestamp - lastUpdate > 100) { // Update frequency
        updateGrid();
        lastUpdate = timestamp;
      }

      const isDark = document.documentElement.classList.contains('dark');
      
      // Clear with slight fade for trail effect
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isDark ? '#ffffff' : '#000000';

      const grid = gridRef.current;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[y][x]) {
            // Draw slightly smaller than cell for grid effect
            ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [cellSize]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-[500px] overflow-hidden bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm touch-none",
        className
      )}
      onPointerDown={() => mouseRef.current.isDown = true}
      onPointerUp={() => mouseRef.current.isDown = false}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        mouseRef.current.x = -2000;
        mouseRef.current.y = -2000;
        mouseRef.current.isDown = false;
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
      
      <div className="absolute top-0 left-0 p-6 pointer-events-none mix-blend-difference text-white dark:text-black">
        <h3 className="font-mono text-sm uppercase tracking-widest font-bold">Cellular Automata</h3>
        <p className="font-mono text-xs opacity-70 mt-1">Interact to seed life</p>
      </div>
    </div>
  );
}

export default CellularAutomataGrid;
