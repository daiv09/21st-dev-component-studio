'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useSpring } from 'framer-motion'

const COLS = 8
const ROWS = 5
const TOTAL_NODES = COLS * ROWS

interface NodeState {
    angle: number
    distance: number
    active: boolean
}

export default function MagneticFieldMatrix() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
    const [shockwaveOrigin, setShockwaveOrigin] = useState<{ x: number; y: number; time: number } | null>(null)
    const [activeCell, setActiveCell] = useState<number | null>(null)

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }, [])

    const handleMouseLeave = () => {
        setMousePos(null)
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        setShockwaveOrigin({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            time: Date.now(),
        })
    }

    return (
        <div className="flex min-h-[440px] w-full flex-col items-center justify-center gap-6 rounded-2xl bg-neutral-950 p-8 select-none">
            {/* Interactive Matrix Container */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                className="relative grid cursor-crosshair grid-cols-8 gap-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-sm"
            >
                {Array.from({ length: TOTAL_NODES }).map((_, index) => {
                    const col = index % COLS
                    const row = Math.floor(index / COLS)

                    return (
                        <MatrixNode
                            key={index}
                            index={index}
                            col={col}
                            row={row}
                            mousePos={mousePos}
                            shockwaveOrigin={shockwaveOrigin}
                            onHover={() => setActiveCell(index)}
                        />
                    )
                })}
            </div>

            {/* Real-Time Telemetry HUD */}
            <div className="flex w-full max-w-md items-center justify-between border-t border-neutral-900 pt-3 text-xs font-mono text-neutral-500">
                <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${mousePos ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                    <span>{mousePos ? `TRACKING [${Math.round(mousePos.x)}, ${Math.round(mousePos.y)}]` : 'STANDBY'}</span>
                </div>
                <div>CELL: {activeCell !== null ? String(activeCell).padStart(2, '0') : '--'}</div>
                <div className="text-neutral-400">CLICK TO DISPERSE</div>
            </div>
        </div>
    )
}

function MatrixNode({
    index,
    col,
    row,
    mousePos,
    shockwaveOrigin,
    onHover,
}: {
    index: number
    col: number
    row: number
    mousePos: { x: number; y: number } | null
    shockwaveOrigin: { x: number; y: number; time: number } | null
    onHover: () => void
}) {
    const nodeRef = useRef<HTMLDivElement>(null)
    const [angle, setAngle] = useState(0)
    const [intensity, setIntensity] = useState(0)
    const [shockDist, setShockDist] = useState(0)

    // Spring physics for smooth orientation tracking
    const springAngle = useSpring(0, { stiffness: 220, damping: 20 })
    const springScale = useSpring(1, { stiffness: 300, damping: 25 })

    useEffect(() => {
        if (!nodeRef.current) return
        const rect = nodeRef.current.getBoundingClientRect()
        const parentRect = nodeRef.current.parentElement?.getBoundingClientRect()
        if (!parentRect) return

        const nodeX = rect.left - parentRect.left + rect.width / 2
        const nodeY = rect.top - parentRect.top + rect.height / 2

        if (mousePos) {
            const dx = mousePos.x - nodeX
            const dy = mousePos.y - nodeY
            const dist = Math.sqrt(dx * dx + dy * dy)
            const rad = Math.atan2(dy, dx)
            const deg = (rad * 180) / Math.PI

            setAngle(deg)
            springAngle.set(deg)

            // Proximal illumination weight
            const maxDist = 180
            const currentIntensity = Math.max(0, 1 - dist / maxDist)
            setIntensity(currentIntensity)
            springScale.set(1 + currentIntensity * 0.4)
        } else {
            springAngle.set(0)
            springScale.set(1)
            setIntensity(0)
        }
    }, [mousePos, springAngle, springScale])

    // Shockwave radial propagation
    useEffect(() => {
        if (!shockwaveOrigin || !nodeRef.current) return
        const parentRect = nodeRef.current.parentElement?.getBoundingClientRect()
        if (!parentRect) return

        const nodeX = (col + 0.5) * (parentRect.width / COLS)
        const nodeY = (row + 0.5) * (parentRect.height / ROWS)

        const dx = shockwaveOrigin.x - nodeX
        const dy = shockwaveOrigin.y - nodeY
        const dist = Math.sqrt(dx * dx + dy * dy)

        const delay = dist * 1.5
        const timer = setTimeout(() => {
            setShockDist(1)
            setTimeout(() => setShockDist(0), 400)
        }, delay)

        return () => clearTimeout(timer)
    }, [shockwaveOrigin, col, row])

    return (
        <div
            ref={nodeRef}
            onMouseEnter={onHover}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800/80 bg-neutral-950 transition-colors duration-200 hover:border-neutral-700"
        >
            <motion.div
                style={{
                    rotate: springAngle,
                    scale: springScale,
                }}
                className="relative flex h-full w-full items-center justify-center"
            >
                {/* Needle Axis Bar */}
                <div
                    className={`h-0.5 rounded-full transition-all duration-150 ${shockDist
                            ? 'w-7 bg-emerald-400 shadow-[0_0_8px_#34d399]'
                            : intensity > 0.4
                                ? 'w-6 bg-emerald-400'
                                : 'w-4 bg-neutral-700'
                        }`}
                />

                {/* Tip Indicator */}
                <div
                    className={`absolute right-1.5 h-1.5 w-1.5 rounded-full transition-colors duration-150 ${intensity > 0.4 || shockDist ? 'bg-emerald-300' : 'bg-neutral-600'
                        }`}
                />
            </motion.div>
        </div>
    )
}