'use client'

import React, { useState } from 'react'

export default function HyperdimensionalVoxelCube() {
    const [gridSize, setGridSize] = useState(4)
    const [speed, setSpeed] = useState(2.2)

    return (
        <div className="flex min-h-[480px] w-[350px] flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-6 shadow-2xl backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-950/80 transition-colors duration-500">
            <style>{`
                    @keyframes voxel-elevate {
                        0%, 100% {
                            transform: translateZ(-15px);
                            opacity: 0.4;
                        }
                        50% {
                            transform: translateZ(30px);
                            opacity: 1;
                        }
                    }
                `}</style>

            {/* Header / Title */}
            <div className="text-center">
                <h3 className="font-mono text-xs font-semibold tracking-wider text-neutral-800 dark:text-neutral-200 uppercase">
                    Hyperdimensional Voxel Cube
                </h3>
            </div>

            {/* Isometric Canvas */}
            <div className="relative flex h-40 w-40 items-center justify-center [perspective:1000px]">
                <div
                    key={`${gridSize}`}
                    className="grid h-full w-full gap-2.5 [transform-style:preserve-3d] transition-all duration-300 ease-out"
                    style={{
                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                        transform: 'rotateX(55deg) rotateZ(-45deg)',
                    }}
                >
                    {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                        const row = Math.floor(i / gridSize)
                        const col = i % gridSize
                        const center = (gridSize - 1) / 2
                        const distance = Math.sqrt(Math.pow(row - center, 2) + Math.pow(col - center, 2))
                        const delay = distance * (0.12 / (gridSize * 0.25))

                        return (
                            <div
                                key={i}
                                className="relative rounded-md border border-neutral-300/80 bg-neutral-200/50 [transform-style:preserve-3d] dark:border-neutral-700/60 dark:bg-slate-800/60"
                                style={{
                                    willChange: 'transform, opacity',
                                    backfaceVisibility: 'hidden',
                                    animation: `voxel-elevate ${speed}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                                    animationDelay: `${delay}s`,
                                }}
                            >
                                {/* Internal Voxel Core Pillar */}
                                <div className="absolute inset-0 rounded-[4px] border border-cyan-500/40 bg-cyan-400/20 backdrop-blur-[2px] transition-colors duration-300 dark:border-cyan-300/30 dark:bg-cyan-400/10" />
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Interactive Controls */}
            <div className="flex w-full flex-col gap-4 border-t border-neutral-200/60 pt-4 dark:border-neutral-800/60">
                {/* Size Slider */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-mono text-[10px] tracking-wide text-neutral-500 dark:text-neutral-400">
                        <span>GRID SIZE</span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">{gridSize}x{gridSize}</span>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="6"
                        step="1"
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-cyan-500 transition-all hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    />
                </div>

                {/* Speed Slider */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between font-mono text-[10px] tracking-wide text-neutral-500 dark:text-neutral-400">
                        <span>ANIMATION SPEED</span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">{speed}s</span>
                    </div>
                    <input
                        type="range"
                        min="0.4"
                        max="4.0"
                        step="0.1"
                        value={speed}
                        onChange={(e) => setSpeed(Number(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-cyan-500 transition-all hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    />
                </div>
            </div>

            {/* Bottom Interface HUD */}
            <div className="flex items-center gap-2">
                <div className="h-1.5 w-6 rounded-full bg-neutral-200 overflow-hidden dark:bg-neutral-800">
                    <div className="h-full w-full bg-cyan-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
                </div>
                <p className="font-mono text-[10px] tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                    Lattice Syncing Active
                </p>
            </div>
        </div>
    )
}