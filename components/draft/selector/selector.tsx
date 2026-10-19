'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface CardData {
    id: string
    title: string
    metric: string
    tag: string
    statusColor: string
}

const CARDS: CardData[] = [
    { id: 'c1', title: 'Core Node Alpha', metric: '99.98%', tag: 'ACTIVE', statusColor: 'bg-zinc-900 dark:bg-zinc-100' },
    { id: 'c2', title: 'Telemetry Router', metric: '1.24 GB/s', tag: 'SYNCED', statusColor: 'bg-zinc-700 dark:bg-zinc-300' },
    { id: 'c3', title: 'Memory Partition', metric: '64.2 MB', tag: 'OPTIMAL', statusColor: 'bg-zinc-500 dark:bg-zinc-400' },
    { id: 'c4', title: 'Vector Pipeline', metric: '0.18 ms', tag: 'READY', statusColor: 'bg-zinc-400 dark:bg-zinc-500' },
]

export default function KineticPrismStack() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div className="flex min-h-[460px] w-full flex-col items-center justify-center gap-6 rounded-2xl bg-white p-8 text-zinc-900 select-none dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
            <div className="flex w-full max-w-md items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400">
                <span>LAYERED SYSTEM METRICS</span>
                <span className="rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                    [PERSPECTIVE: 3D]
                </span>
            </div>

            {/* 3D Kinetic Deck */}
            <div className="relative flex h-72 w-full max-w-md flex-col justify-center [perspective:1000px]">
                {CARDS.map((card, index) => {
                    const isHovered = hoveredIndex === index
                    const isAnyHovered = hoveredIndex !== null

                    // Dynamic calculation of spring offsets based on which item is focused
                    let yOffset = index * 24
                    let zOffset = -index * 30
                    let scale = 1 - index * 0.03
                    let rotateX = 20

                    if (isAnyHovered) {
                        if (isHovered) {
                            yOffset = index * 20 - 18
                            zOffset = 40
                            scale = 1.03
                            rotateX = 0
                        } else if (index < (hoveredIndex ?? 0)) {
                            yOffset = index * 16 - 28
                            zOffset = -index * 20
                            rotateX = 25
                        } else {
                            yOffset = index * 28 + 28
                            zOffset = -index * 35
                            rotateX = 15
                        }
                    }

                    return (
                        <motion.div
                            key={card.id}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            animate={{
                                y: yOffset,
                                z: zOffset,
                                scale,
                                rotateX,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 320,
                                damping: 26,
                            }}
                            className="absolute inset-x-0 mx-auto h-24 w-full cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 p-5 shadow-xl transition-colors duration-150 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 [transform-style:preserve-3d]"
                        >
                            <div className="flex h-full items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Status Indicator */}
                                    <div className={`h-2.5 w-2.5 rounded-full ${card.statusColor}`} />
                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{card.title}</h4>
                                        <p className="font-mono text-xs text-zinc-500">ID: {card.id.toUpperCase()}_STAGE</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="font-mono text-base font-bold text-zinc-900 dark:text-zinc-100">{card.metric}</span>
                                        <span className="block font-mono text-[10px] text-zinc-500">{card.tag}</span>
                                    </div>
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 bg-white font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                                        →
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-600">
                Hover over stacked segments to inspect depth profiles
            </p>
        </div>
    )
}