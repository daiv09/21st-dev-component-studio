'use client'

import React from 'react'

export default function MovingBlocksLoader() {
  // A 4x4 grid = 16 blocks
  const gridSize = 4;
  const totalBlocks = gridSize * gridSize;

  // Helper to calculate delay based on grid position (diagonal wave)
  const getDelay = (index: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    // The sum of row + col creates diagonal bands
    // Multiply by a small factor (e.g., 0.1s) for the actual delay time
    return (row + col) * 0.1;
  };

  return (
    <div className='flex flex-col items-center justify-center gap-10 p-12 min-h-[350px] bg-slate-950/0 perspective-container'>
      
      {/* Main 3D Grid Container tilted slightly backward */}
      <div className='relative transform-style-3d tilt-grid'>
        
        {/* Background Glow for the grid area */}
        <div className='absolute inset-0 bg-indigo-500/20 blur-[60px] -z-10 rounded-full' />

        {/* The Grid of Blocks */}
        <div className='grid grid-cols-4 gap-3 p-4'>
          {[...Array(totalBlocks)].map((_, index) => {
             const delay = getDelay(index);
             return (
              <div
                key={index}
                className='block-item relative w-10 h-10 rounded-lg'
                style={{
                  // Negative delay makes it start already in motion
                  animationDelay: `-${delay}s` 
                }}
              >
                {/* Block Body with Gradient and Shadow */}
                <div className='w-full h-full rounded-lg bg-gradient-to-r from-blue-800 to-indigo-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_0_4px_10px_rgba(59,130,246,0.5)] block-glow' />
                
                {/* Optional: Subtle highlight on top edge */}
                <div className='absolute top-0 inset-x-1 h-[2px] bg-cyan-200/50 rounded-full blur-[1px]' />
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Text */}
      <div className='flex flex-col items-center gap-2 z-10'>
        <h3 className='text-sm font-bold tracking-[0.25em] uppercase text-transparent bg-clip-text bg-black animate-pulse'>
          Processing Data Blocks
        </h3>
        <div className='flex gap-1'>
             <span className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-0'></span>
             <span className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100'></span>
             <span className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200'></span>
        </div>
      </div>

      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
        }

        .transform-style-3d {
          transform-style: preserve-3d;
        }

        /* Tiles the whole grid backward for depth */
        .tilt-grid {
            transform: rotateX(30deg) rotateY(0deg);
        }

        /* The wave animation for individual blocks */
        @keyframes blockWave {
          0%, 100% {
            transform: translateZ(0px) translateY(0px);
            filter: brightness(1);
          }
          50% {
            /* Moves up (Y) and "closer" to camera (Z) */
            transform: translateZ(30px) translateY(-15px);
            filter: brightness(1.3) contrast(1.1);
            box-shadow: 0 15px 25px rgba(34, 211, 238, 0.6);
          }
        }

        .block-item {
          /* cubic-bezier creates a snappy, bouncy movement */
          animation: blockWave 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
          will-change: transform, box-shadow, filter;
        }

        /* Ensure the glow transition is smooth */
        .block-glow {
            transition: box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  )
}