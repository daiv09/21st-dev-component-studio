"use client"

import * as React from "react"

/**
 * ISOMETRIC 3D HEXAGONAL CHART (HEXBIN)
 *
 * An interactive, fully responsive hexagonal grid chart.
 * Maps data onto an axial hexagonal grid, morphing from a flat 2D map
 * into an extruded 3D isometric landscape.
 *
 * Features:
 * - Standalone component with zero external UI library dependencies.
 * - Fluidly responsive with ResizeObserver and DPR auto-scaling.
 * - Custom 6-sided polygon projection and hit-testing math.
 * - Smooth 2D ↔ 3D morph transitions with radial sweeping wave.
 * - Interactive mouse/touch orbit with double-click to reset.
 */

// #region Math & Utilities
export type RGB = [number, number, number]

export const clamp01 = (v: number): number => (v > 0 ? (v < 1 ? v : 1) : 0)
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const easeInOutCubic = (x: number): number => {
    const t = clamp01(x)
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - clamp01(x), 3)

export const rng = (seed: number) => {
    let a = seed >>> 0
    return (): number => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
]
export const luminance = (c: RGB): number => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255
const rgbString = (r: number, g: number, b: number) =>
    `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`

export const WAVE = 0.45
export const RADIUS = 4 // Reference for internal sorting, safe to keep static for scaling
export const riseAt = (t: number, order: number): number => easeOutCubic((t - order * 0.4) / (1 - WAVE))

export const YAW_3D = Math.PI / 6
export const ELEV_3D = (38 * Math.PI) / 180
export const YAW_RANGE: [number, number] = [(-15 * Math.PI) / 180, (75 * Math.PI) / 180]
export const ELEV_RANGE: [number, number] = [(15 * Math.PI) / 180, (65 * Math.PI) / 180]

export type Cam = { cs: number; sn: number; se: number; ce: number }

export const camera = (e: number, dYaw = 0, dElev = 0): Cam => {
    const yaw = Math.min(YAW_RANGE[1], Math.max(YAW_RANGE[0], lerp(0, YAW_3D + dYaw, e)))
    const elev = lerp(Math.PI / 2, Math.min(ELEV_RANGE[1], Math.max(ELEV_RANGE[0], ELEV_3D + dElev)), e)
    return { cs: Math.cos(yaw), sn: Math.sin(yaw), se: Math.sin(elev), ce: Math.cos(elev) }
}

export const project = (c: Cam, x: number, y: number, z: number): [number, number] => [
    x * c.cs - y * c.sn,
    (x * c.sn + y * c.cs) * c.se - z * c.ce,
]

// Hexagonal logic (Pointy top)
export const hexCell = (cx: number, cy: number, radius: number, gap = 0.05): number[] => {
    const pts = []
    const r = radius - gap
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        pts.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
    }
    return pts
}

// Ray-casting algorithm for Point in Polygon (general, supports hex)
export const pointInPoly = (p: Float32Array, o: number, vCount: number, x: number, y: number): boolean => {
    let inside = false
    for (let i = 0, j = vCount - 1; i < vCount; j = i++) {
        const xi = p[o + i * 2], yi = p[o + i * 2 + 1]
        const xj = p[o + j * 2], yj = p[o + j * 2 + 1]
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }
    return inside
}

const polyPath = (ctx: CanvasRenderingContext2D, p: Float32Array, o: number, vCount: number, r: number) => {
    if (r < 0.3) {
        ctx.moveTo(p[o], p[o + 1])
        for (let k = 1; k < vCount; k++) ctx.lineTo(p[o + k * 2], p[o + k * 2 + 1])
        ctx.closePath()
        return
    }
    ctx.moveTo((p[o + (vCount - 1) * 2] + p[o]) / 2, (p[o + (vCount - 1) * 2 + 1] + p[o + 1]) / 2)
    for (let k = 0; k < vCount; k++) {
        const b = (k + 1) % vCount
        ctx.arcTo(p[o + k * 2], p[o + k * 2 + 1], p[o + b * 2], p[o + b * 2 + 1], r)
    }
    ctx.closePath()
}
// #endregion

// #region Palettes & Theme
export type PaletteName = "ocean" | "aurora" | "ember" | "grape" | "mono" | "cyber"
export type PaletteInput = PaletteName | string[] | { light: string[]; dark: string[] }

export const PALETTES: Record<PaletteName, { light: string[]; dark: string[] }> = {
    ocean: {
        light: ["#e0f2fe", "#7dd3fc", "#0ea5e9", "#0369a1", "#082f49"],
        dark: ["#082f49", "#0369a1", "#0ea5e9", "#38bdf8", "#bae6fd"],
    },
    aurora: {
        light: ["#dcfce7", "#86efac", "#22c55e", "#15803d", "#052e16"],
        dark: ["#052e16", "#14532d", "#16a34a", "#4ade80", "#bbf7d0"],
    },
    ember: {
        light: ["#ffedd5", "#fdba74", "#f97316", "#c2410c", "#431407"],
        dark: ["#431407", "#9a3412", "#ea580c", "#fb923c", "#fed7aa"],
    },
    grape: {
        light: ["#f3e8ff", "#d8b4fe", "#a855f7", "#7e22ce", "#3b0764"],
        dark: ["#2e1065", "#581c87", "#9333ea", "#c084fc", "#e9d5ff"],
    },
    mono: {
        light: ["#f5f5f5", "#d4d4d4", "#737373", "#404040", "#171717"],
        dark: ["#171717", "#404040", "#737373", "#a3a3a3", "#e5e5e5"],
    },
    cyber: {
        light: ["#fdf4ff", "#f0abfc", "#d946ef", "#a21caf", "#4a044e"],
        dark: ["#170b21", "#36104f", "#7822a1", "#d946ef", "#fdf4ff"],
    },
}

let colorProbe: CanvasRenderingContext2D | null = null
const toRGB = (color: string, fallback: RGB | null): RGB | null => {
    if (typeof document === "undefined") return fallback
    if (!colorProbe) {
        const c = document.createElement("canvas")
        c.width = c.height = 1
        colorProbe = c.getContext("2d", { willReadFrequently: true })
    }
    if (!colorProbe) return fallback
    try {
        colorProbe.clearRect(0, 0, 1, 1)
        colorProbe.fillStyle = "rgba(0,0,0,0)"
        colorProbe.fillStyle = color
        colorProbe.fillRect(0, 0, 1, 1)
        const d = colorProbe.getImageData(0, 0, 1, 1).data
        if (d[3] < 8) return fallback
        return [d[0], d[1], d[2]]
    } catch {
        return fallback
    }
}

export const resolvePalette = (p: PaletteInput | undefined, dark: boolean): string[] => {
    const base = PALETTES.cyber[dark ? "dark" : "light"]
    const pick = Array.isArray(p)
        ? p
        : p && typeof p === "object"
            ? dark
                ? p.dark
                : p.light
            : PALETTES[(p as PaletteName) ?? "cyber"]?.[dark ? "dark" : "light"] ?? base
    return [0, 1, 2, 3].map((i) => pick[i] ?? pick[pick.length - 1] ?? base[i])
}
// #endregion

// #region Types & Interfaces
export interface HexBox {
    pts: number[] // 6 vertices (12 floats)
    h: number
    z0?: number
    lv: number
    order: number
    tip: string
    q: number
    r: number
    value: number
}

export type ViewMode = "2d" | "3d"

export interface HexChartProps {
    /** Array of {q, r, value} objects defining axial coordinates and value. Generates generic sample if omitted. */
    data?: { q: number; r: number; value: number; label?: string }[]
    seed?: number
    title?: React.ReactNode
    hint?: React.ReactNode
    palette?: PaletteInput
    view?: ViewMode
    defaultView?: ViewMode
    onViewChange?: (view: ViewMode) => void
    orbit?: boolean
    showToggle?: boolean
    showLegend?: boolean
    className?: string
}
// #endregion

// #region Icons
const GridIcon = () => (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="shrink-0">
        <path d="M4 3 L8 1 L12 3 L12 7 L8 9 L4 7 Z" fill="currentColor" />
        <path d="M4 9 L8 7 L12 9 L12 13 L8 15 L4 13 Z" fill="currentColor" />
    </svg>
)

const CubeIcon = () => (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" className="shrink-0">
        <path
            d="M8 1.2 14.2 4.6v6.8L8 14.8 1.8 11.4V4.6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <path
            d="M1.8 4.6 8 8l6.2-3.4M8 8v6.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    </svg>
)
// #endregion

export function IsometricHexChart({
    data,
    seed = 18,
    title = "Geospatial Hexbin",
    hint = "Data aggregation grouped by axial coordinate hex sectors.",
    palette = "cyber",
    view: controlledView,
    defaultView = "3d",
    onViewChange,
    orbit = true,
    showToggle = true,
    showLegend = true,
    className = "",
}: HexChartProps) {
    const [internalView, setInternalView] = React.useState<ViewMode>(defaultView)
    const view = controlledView ?? internalView
    const setView = (next: ViewMode) => {
        if (controlledView === undefined) setInternalView(next)
        onViewChange?.(next)
    }

    const [swatches, setSwatches] = React.useState<string[]>(() => ["#ebedf0", ...resolvePalette(palette, false)])
    const [legendLevel, setLegendLevel] = React.useState(-1)
    const [announce, setAnnounce] = React.useState("")

    const rootRef = React.useRef<HTMLElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const tipRef = React.useRef<HTMLDivElement>(null)
    const tipBRef = React.useRef<HTMLElement>(null)
    const tipSRef = React.useRef<HTMLSpanElement>(null)

    const computedData = React.useMemo(() => {
        if (data) return data
        const r = rng(seed)
        const generated: { q: number; r: number; value: number }[] = []
        for (let q = -RADIUS; q <= RADIUS; q++) {
            let r1 = Math.max(-RADIUS, -q - RADIUS)
            let r2 = Math.min(RADIUS, -q + RADIUS)
            for (let ro = r1; ro <= r2; ro++) {
                // Create an organic terrain cluster
                const distToCenter = Math.sqrt(q * q + ro * ro + (q + ro) * (q + ro)) / Math.sqrt(2)
                const base = Math.max(0, 1 - distToCenter / RADIUS)
                const val = Math.max(0, Math.min(100, base * 80 + r() * 40 - 10))
                generated.push({ q, r: ro, value: val })
            }
        }
        return generated
    }, [data, seed])

    const spec = React.useMemo(() => {
        const boxes: HexBox[] = []
        const hexSize = 1.0
        const w = Math.sqrt(3) * hexSize
        const h = 2 * hexSize

        for (let i = 0; i < computedData.length; i++) {
            const d = computedData[i]

            // Axial to Cartesian
            const cx = w * (d.q + d.r / 2)
            const cy = (3 / 2) * hexSize * d.r

            const val = d.value
            const elevation = 0.1 + (val / 100) * 8
            const level = (val / 100) * 4

            // Calculate radial distance for a sweeping out-from-center animation wave
            const dist = Math.sqrt(cx * cx + cy * cy)
            const order = dist / (RADIUS * w) // Normalized to roughly 0..1

            boxes.push({
                pts: hexCell(cx, cy, hexSize, 0.08),
                h: elevation,
                z0: 0,
                lv: level,
                order: Math.max(0, Math.min(1, order)),
                tip: d.label ? d.label : `Sector Q:${d.q} R:${d.r}\n${Math.round(val)} density`,
                q: d.q,
                r: d.r,
                value: val,
            })
        }

        return { boxes, label: "Hexagonal Aggregation" }
    }, [computedData])

    const cfg = React.useRef({
        spec,
        orbit,
        palette,
        legendLevel,
        target: view === "3d" ? 1 : 0,
        setSwatches,
        setAnnounce,
    })
    cfg.current = { spec, orbit, palette, legendLevel, target: view === "3d" ? 1 : 0, setSwatches, setAnnounce }
    const engineRef = React.useRef<{ kick: () => void; load: () => void; retheme: () => void } | null>(null)

    React.useEffect(() => {
        const root = rootRef.current
        const stage = stageRef.current
        const canvas = canvasRef.current
        const tip = tipRef.current
        const tipB = tipBRef.current
        const tipS = tipSRef.current
        if (!root || !stage || !canvas || !tip || !tipB || !tipS) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const darkMq = window.matchMedia("(prefers-color-scheme: dark)")
        let reduced = reduceMq.matches

        let t = 0
        let target = cfg.current.target
        let entered = false
        let inView = true
        let yaw = 0
        let elev = 0
        let yawGoal = 0
        let elevGoal = 0
        let W = 0
        let Hmax = 0
        let dpr = 1
        let font = "10px sans-serif"

        const col = new Float32Array(15)
        const colGoal = new Float32Array(15)
        let colReady = false
        let fg: RGB = [23, 23, 23]
        let bg: RGB = [255, 255, 255]

        let boxes: HexBox[] = []
        let n = 0
        // Vertices per hex: 6
        // Coordinates per hex: 12
        let cp = new Float32Array(0), cz = new Float32Array(0), cb = new Float32Array(0), cl = new Float32Array(0)
        let dep = new Float32Array(0), hover = new Float32Array(0), dim = new Float32Array(0)

        // Polys array: 12 floats for top + 6 sides * 8 floats = 60 floats per hex
        let polys = new Float32Array(0), sides = new Uint8Array(0), vis = new Uint8Array(0)
        let order: number[] = []

        let hovered = -1, pinned = -1, activeIdx = -1, tipW = 0, lastTip = "", raf = 0, last = 0

        const load = () => {
            boxes = cfg.current.spec.boxes
            const m = boxes.length
            if (m !== n || cp.length !== m * 12) {
                n = m
                cp = new Float32Array(m * 12); cz = new Float32Array(m); cb = new Float32Array(m); cl = new Float32Array(m)
                dep = new Float32Array(m); hover = new Float32Array(m); dim = new Float32Array(m)
                polys = new Float32Array(m * 60); sides = new Uint8Array(m); vis = new Uint8Array(m)
                order = Array.from({ length: m }, (_, i) => i)
                for (let i = 0; i < m; i++) {
                    const b = boxes[i]
                    for (let j = 0; j < 12; j++) cp[i * 12 + j] = b.pts[j]
                    cz[i] = b.h; cb[i] = b.z0 ?? 0; cl[i] = b.lv
                }
            }
            if (hovered >= n) hovered = -1
            if (pinned >= n) pinned = -1
            if (activeIdx >= n) { activeIdx = -1; tip.style.opacity = "0" }
        }

        const retheme = () => {
            const cs = getComputedStyle(root)
            const isDocDark = document.documentElement.classList.contains("dark") || darkMq.matches
            fg = toRGB(cs.color, isDocDark ? [240, 240, 240] : [23, 23, 23]) ?? (isDocDark ? [240, 240, 240] : [23, 23, 23])
            bg = toRGB(cs.backgroundColor, isDocDark ? [20, 20, 20] : [255, 255, 255]) ?? (isDocDark ? [20, 20, 20] : [255, 255, 255])

            const isDark = isDocDark || luminance(bg) < 0.45
            font = "500 10px " + (cs.fontFamily || "sans-serif")
            const pal = resolvePalette(cfg.current.palette, isDark)
            const empty = mixRGB(bg, fg, isDark ? 0.08 : 0.06)
            const fallbackColor: RGB = isDark ? [200, 120, 255] : [140, 40, 220]
            const all: RGB[] = [empty, ...pal.map((c) => toRGB(c, fallbackColor) ?? fallbackColor)]

            for (let k = 0; k < 5; k++) {
                for (let ch = 0; ch < 3; ch++) colGoal[k * 3 + ch] = all[k][ch]
            }
            if (!colReady || reduced) { col.set(colGoal); colReady = true }
            const sw = all.map((c) => rgbString(c[0], c[1], c[2]))
            cfg.current.setSwatches((prev) => (prev.join() === sw.join() ? prev : sw))
            kick()
        }

        const extent = (cam: Cam, e: number) => {
            let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity
            const add = (x: number, y: number, z: number) => {
                const p = project(cam, x, y, z)
                if (p[0] < minx) minx = p[0]
                if (p[0] > maxx) maxx = p[0]
                if (p[1] < miny) miny = p[1]
                if (p[1] > maxy) maxy = p[1]
            }
            for (let i = 0; i < n; i++) {
                const p = boxes[i].pts
                for (let k = 0; k < 6; k++) {
                    add(p[k * 2], p[k * 2 + 1], 0)
                    add(p[k * 2], p[k * 2 + 1], boxes[i].h * e)
                }
            }
            if (!isFinite(minx)) return { minx: 0, maxx: 1, miny: 0, maxy: 1 }
            return { minx, maxx, miny, maxy }
        }

        const relayout = () => {
            const w = Math.round(stage.clientWidth)
            if (!w || !n) return
            W = w
            dpr = Math.min(2, window.devicePixelRatio || 1)
            const vh = typeof window !== "undefined" ? window.innerHeight : 800
            const targetH = Math.max(260, Math.min(Math.round(W * 0.55), 450))
            Hmax = targetH
            stage.style.height = `${targetH}px`
            canvas.width = Math.round(W * dpr)
            canvas.height = Math.round(Hmax * dpr)
            canvas.style.width = `${W}px`
            canvas.style.height = `${Hmax}px`
            draw()
        }

        const draw = () => {
            if (!W || !n) return
            const e = easeInOutCubic(t)
            const cam = camera(e, yaw, elev)
            const bx = extent(cam, e)
            const pad = lerp(12, 24, e)
            const aw = W - pad * 2, ah = Hmax - pad * 2
            const bw = Math.max(1e-6, bx.maxx - bx.minx), bh = Math.max(1e-6, bx.maxy - bx.miny)
            const s = Math.min(aw / bw, ah / bh)
            const ox = pad + (aw - bw * s) / 2 - bx.minx * s
            const oy = pad + (ah - bh * s) / 2 - bx.miny * s
            const { cs, sn, se, ce } = cam
            const px = (x: number, y: number) => ox + (x * cs - y * sn) * s
            const py = (x: number, y: number, z: number) => oy + ((x * sn + y * cs) * se - z * ce) * s

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, W, Hmax)

            for (let i = 0; i < n; i++) {
                const o = i * 12
                // Average depth across 6 vertices
                dep[i] = ((cp[o] + cp[o + 2] + cp[o + 4] + cp[o + 6] + cp[o + 8] + cp[o + 10]) * sn +
                    (cp[o + 1] + cp[o + 3] + cp[o + 5] + cp[o + 7] + cp[o + 9] + cp[o + 11]) * cs) / 6
            }
            order.sort((a, c) => (Math.abs(dep[a] - dep[c]) > 1e-4 ? dep[a] - dep[c] : cb[a] - cb[c]))

            const rad = lerp(0.08, 0.02, e) * s
            const outline = (1 - e) * 0.15
            const lift = 0.8 * e
            const ex = col[0], ey = col[1], ez = col[2]

            for (let k = 0; k < n; k++) {
                const i = order[k]
                const b = boxes[i]
                vis[i] = 1
                const o12 = i * 12, o = i * 60 // 60 floats mapped per hex
                const rz = riseAt(t, b.order), hv = hover[i]
                const zt = cz[i] * rz + hv * lift, zb = cb[i] * rz

                let a2 = 0
                for (let j = 0; j < 6; j++) {
                    const jn = (j + 1) % 6
                    const x = cp[o12 + j * 2], y = cp[o12 + j * 2 + 1]
                    polys[o + j * 2] = px(x, y)
                    polys[o + j * 2 + 1] = py(x, y, zt)
                    a2 += x * cp[o12 + jn * 2 + 1] - cp[o12 + jn * 2] * y
                }
                const sg = a2 >= 0 ? 1 : -1
                const tall = (zt - zb) * ce * s > 0.35

                const lf = Math.max(0, Math.min(4, cl[i]))
                const k0 = Math.floor(lf), k1 = Math.min(4, k0 + 1), f = lf - k0
                let r = col[k0 * 3] * (1 - f) + col[k1 * 3] * f
                let g = col[k0 * 3 + 1] * (1 - f) + col[k1 * 3 + 1] * f
                let bl = col[k0 * 3 + 2] * (1 - f) + col[k1 * 3 + 2] * f

                const d = dim[i]
                if (d > 0.002) {
                    r += (ex - r) * 0.72 * d; g += (ey - g) * 0.72 * d; bl += (ez - bl) * 0.72 * d
                }
                if (hv > 0.002) {
                    const m = 0.22 * hv
                    r += (fg[0] - r) * m; g += (fg[1] - g) * m; bl += (fg[2] - bl) * m
                }

                let bits = 0
                for (let j = 0; j < 6; j++) {
                    if (!tall) break
                    const jn = (j + 1) % 6
                    const xa = cp[o12 + j * 2], ya = cp[o12 + j * 2 + 1]
                    const xb = cp[o12 + jn * 2], yb = cp[o12 + jn * 2 + 1]
                    const dx = xb - xa, dy = yb - ya
                    const len = Math.hypot(dx, dy) || 1
                    const nx = (sg * dy) / len, ny = (-sg * dx) / len
                    if (nx * sn + ny * cs <= 0.02) continue
                    bits |= 1 << j
                    const q = o + 12 + j * 8 // Offset past the 12 floats of the top face
                    polys[q] = px(xa, ya); polys[q + 1] = py(xa, ya, zb)
                    polys[q + 2] = px(xb, yb); polys[q + 3] = py(xb, yb, zb)
                    polys[q + 4] = polys[o + jn * 2]; polys[q + 5] = polys[o + jn * 2 + 1]
                    polys[q + 6] = polys[o + j * 2]; polys[q + 7] = polys[o + j * 2 + 1]

                    const sh = Math.max(0.40, Math.min(0.96, 0.70 - 0.22 * (nx * cs - ny * sn)))
                    ctx.beginPath()

                    // Draw quad side face
                    ctx.moveTo(polys[q], polys[q + 1])
                    ctx.lineTo(polys[q + 2], polys[q + 3])
                    ctx.lineTo(polys[q + 4], polys[q + 5])
                    ctx.lineTo(polys[q + 6], polys[q + 7])
                    ctx.closePath()

                    ctx.fillStyle = rgbString(r * sh, g * sh, bl * sh)
                    ctx.fill()
                }
                sides[i] = bits

                ctx.beginPath()
                polyPath(ctx, polys, o, 6, rad)
                ctx.fillStyle = rgbString(r, g, bl)
                ctx.fill()

                if (outline > 0.004) {
                    ctx.strokeStyle = `rgba(${fg[0]},${fg[1]},${fg[2]},${outline.toFixed(3)})`
                    ctx.lineWidth = 1; ctx.stroke()
                }
                if (hv > 0.02) {
                    ctx.strokeStyle = `rgba(${fg[0]},${fg[1]},${fg[2]},${(0.88 * hv).toFixed(3)})`
                    ctx.lineWidth = 1.6; ctx.stroke()
                }
            }

            if (activeIdx >= 0 && activeIdx < n && vis[activeIdx]) {
                const i = activeIdx, o = i * 60, text = boxes[i].tip
                if (text !== lastTip) {
                    lastTip = text
                    const parts = text.split("\n")
                    tipB.textContent = parts[0]
                    tipS.textContent = parts.slice(1).join(" · ")
                    tipW = tip.offsetWidth
                }

                let cx = 0, cy = Infinity
                for (let v = 0; v < 6; v++) {
                    cx += polys[o + v * 2]
                    if (polys[o + v * 2 + 1] < cy) cy = polys[o + v * 2 + 1]
                }
                cx /= 6

                const half = tipW / 2
                const clampX = Math.min(W - half - 4, Math.max(half + 4, cx))
                tip.style.transform = `translate(${(clampX - half).toFixed(1)}px,${(cy - 8).toFixed(1)}px) translateY(-100%)`
                tip.style.setProperty("--arrow", `${(cx - clampX + half).toFixed(1)}px`)
            }
        }

        const tick = (now: number) => {
            raf = 0
            if (!inView) return
            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
            last = now
            let moving = false

            if (t !== target) {
                const step = reduced ? 1 : (dt * 1000) / 1300
                t = target > t ? Math.min(target, t + step) : Math.max(target, t - step)
                moving = true
            }

            const ko = reduced ? 1 : 1 - Math.exp(-dt * 12)
            yaw += (yawGoal - yaw) * ko; elev += (elevGoal - elev) * ko
            if (Math.abs(yawGoal - yaw) > 1e-4 || Math.abs(elevGoal - elev) > 1e-4) moving = true
            else { yaw = yawGoal; elev = elevGoal }

            const kc = reduced ? 1 : 1 - Math.exp(-dt * 7)
            for (let k = 0; k < 15; k++) {
                const d = colGoal[k] - col[k]
                if (Math.abs(d) > 0.4) { col[k] += d * kc; moving = true } else col[k] = colGoal[k]
            }

            const kh = reduced ? 1 : 1 - Math.exp(-dt * 9), kv = reduced ? 1 : 1 - Math.exp(-dt * 16), kd = reduced ? 1 : 1 - Math.exp(-dt * 10)
            const leg = cfg.current.legendLevel

            for (let i = 0; i < n; i++) {
                const b = boxes[i], o = i * 12
                for (let j = 0; j < 12; j++) {
                    const dd = b.pts[j] - cp[o + j]
                    if (Math.abs(dd) > 0.0005) { cp[o + j] += dd * kh; moving = true } else cp[o + j] = b.pts[j]
                }
                const dz = b.h - cz[i]
                if (Math.abs(dz) > 0.002) { cz[i] += dz * kh; moving = true } else cz[i] = b.h
                const dl = b.lv - cl[i]
                if (Math.abs(dl) > 0.004) { cl[i] += dl * kh; moving = true } else cl[i] = b.lv

                const hg = i === activeIdx ? 1 : 0
                if (hover[i] !== hg) { hover[i] = Math.abs(hg - hover[i]) < 0.003 ? hg : hover[i] + (hg - hover[i]) * kv; moving = true }
                const dg = leg >= 0 && Math.round(b.lv) !== leg ? 1 : 0
                if (dim[i] !== dg) { dim[i] = Math.abs(dg - dim[i]) < 0.003 ? dg : dim[i] + (dg - dim[i]) * kd; moving = true }
            }

            draw()
            if (moving) raf = requestAnimationFrame(tick)
        }

        const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick) } }
        const refreshActive = () => {
            const next = hovered >= 0 ? hovered : pinned
            if (next === activeIdx) return
            activeIdx = next; lastTip = ""
            tip.style.opacity = next >= 0 ? "1" : "0"
            tip.setAttribute("aria-hidden", next >= 0 ? "false" : "true")
            kick()
        }

        const hit = (x: number, y: number): number => {
            for (let k = n - 1; k >= 0; k--) {
                const i = order[k]; if (!vis[i]) continue
                const o = i * 60
                if (pointInPoly(polys, o, 6, x, y)) return i
                for (let j = 0; j < 6; j++) {
                    if (sides[i] & (1 << j) && pointInPoly(polys, o + 12 + j * 8, 4, x, y)) return i
                }
            }
            return -1
        }

        const local = (ev: PointerEvent | MouseEvent) => {
            const r = canvas.getBoundingClientRect()
            return [ev.clientX - r.left, ev.clientY - r.top] as const
        }

        let drag: { id: number; x: number; y: number; yaw: number; elev: number; moved: boolean; orbit: boolean; mouse: boolean } | null = null

        const onDown = (ev: PointerEvent) => {
            if (ev.button !== 0) return
            const can = cfg.current.orbit && target === 1
            drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, yaw: yawGoal, elev: elevGoal, moved: false, orbit: can, mouse: ev.pointerType === "mouse" }
            if (can) try { canvas.setPointerCapture(ev.pointerId) } catch { }
        }

        const onMove = (ev: PointerEvent) => {
            if (drag && drag.orbit && ev.pointerId === drag.id) {
                const dx = ev.clientX - drag.x, dyy = ev.clientY - drag.y
                if (drag.moved || Math.hypot(dx, dyy) > 4) {
                    drag.moved = true
                    yawGoal = Math.min(YAW_RANGE[1], Math.max(YAW_RANGE[0], drag.yaw + dx * 0.006))
                    if (drag.mouse) elevGoal = Math.min(ELEV_RANGE[1], Math.max(ELEV_RANGE[0], drag.elev + dyy * 0.004))
                    canvas.style.cursor = "grabbing"
                    hovered = -1; refreshActive(); kick()
                    return
                }
            }
            if (ev.pointerType !== "mouse") return
            const [x, y] = local(ev)
            const i = hit(x, y)
            if (i !== hovered) { hovered = i; refreshActive() }
            canvas.style.cursor = cfg.current.orbit && target === 1 ? "grab" : i >= 0 ? "pointer" : "default"
        }

        const onUp = (ev: PointerEvent) => {
            if (!drag || ev.pointerId !== drag.id) return
            const wasMoved = drag.moved
            drag = null
            if (canvas.hasPointerCapture(ev.pointerId)) canvas.releasePointerCapture(ev.pointerId)
            canvas.style.cursor = cfg.current.orbit && target === 1 ? "grab" : "default"
            if (wasMoved) return
            const [x, y] = local(ev)
            const i = hit(x, y)
            pinned = i === pinned ? -1 : i
            if (ev.pointerType !== "mouse") hovered = -1
            refreshActive()
        }

        const onCancel = () => { drag = null }
        const onLeave = () => { if (!drag) { hovered = -1; refreshActive() } }
        const onDbl = () => { yawGoal = 0; elevGoal = 0; kick() }
        const onBlur = () => { pinned = -1; refreshActive() }

        const onKey = (ev: KeyboardEvent) => {
            const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape"]
            if (!keys.includes(ev.key) || !n) return
            ev.preventDefault()
            if (ev.key === "Escape") { pinned = -1; hovered = -1; refreshActive(); return }
            let i = pinned >= 0 ? pinned : activeIdx >= 0 ? activeIdx : n - 1
            if (pinned >= 0 || activeIdx >= 0) {
                if (ev.key === "ArrowLeft") i -= 1
                if (ev.key === "ArrowRight") i += 1
                if (ev.key === "ArrowUp") i -= 5
                if (ev.key === "ArrowDown") i += 5
                if (ev.key === "Home") i = 0
                if (ev.key === "End") i = n - 1
            }
            i = Math.max(0, Math.min(n - 1, i))
            pinned = i; hovered = -1; refreshActive()
            cfg.current.setAnnounce(boxes[i].tip.replace(/\n/g, ", "))
        }

        const setTarget = () => {
            const goal = cfg.current.target
            if (!entered) return
            if (goal !== target) {
                target = goal
                if (goal === 0) { yawGoal = 0; elevGoal = 0 }
                canvas.style.cursor = cfg.current.orbit && target === 1 ? "grab" : "default"
                kick()
            }
        }

        load(); retheme(); relayout()

        const enter = () => { if (!entered) { entered = true; if (reduced) t = cfg.current.target; setTarget() } }
        let io: IntersectionObserver | null = null, io2: IntersectionObserver | null = null
        if ("IntersectionObserver" in window) {
            io = new IntersectionObserver((entries) => { if (entries.some((en) => en.isIntersecting)) { enter(); io?.disconnect() } }, { threshold: 0.3 })
            io.observe(stage)
            io2 = new IntersectionObserver((entries) => { inView = entries.some((en) => en.isIntersecting); if (inView) kick() })
            io2.observe(stage)
        } else enter()

        const ro = new ResizeObserver(() => { if (Math.round(stage.clientWidth) !== W) relayout() })
        ro.observe(stage)

        const mo = new MutationObserver(retheme)
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
        if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })

        const onReduce = () => { reduced = reduceMq.matches; kick() }
        reduceMq.addEventListener("change", onReduce)
        darkMq.addEventListener("change", retheme)

        canvas.addEventListener("pointerdown", onDown)
        canvas.addEventListener("pointermove", onMove)
        canvas.addEventListener("pointerup", onUp)
        canvas.addEventListener("pointercancel", onCancel)
        canvas.addEventListener("pointerleave", onLeave)
        canvas.addEventListener("dblclick", onDbl)
        canvas.addEventListener("keydown", onKey)
        canvas.addEventListener("blur", onBlur)

        engineRef.current = { kick: () => { setTarget(); kick() }, load: () => { load(); relayout(); kick() }, retheme }

        return () => {
            if (raf) cancelAnimationFrame(raf)
            io?.disconnect(); io2?.disconnect(); ro.disconnect(); mo.disconnect()
            reduceMq.removeEventListener("change", onReduce); darkMq.removeEventListener("change", retheme)
            canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove)
            canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointercancel", onCancel)
            canvas.removeEventListener("pointerleave", onLeave); canvas.removeEventListener("dblclick", onDbl)
            canvas.removeEventListener("keydown", onKey); canvas.removeEventListener("blur", onBlur)
            engineRef.current = null
        }
    }, [])

    React.useEffect(() => { engineRef.current?.kick() }, [view, legendLevel])
    React.useEffect(() => { engineRef.current?.load() }, [spec])
    React.useEffect(() => { engineRef.current?.retheme() }, [palette])

    const is3d = view === "3d"
    const ease = "cubic-bezier(0.65, 0, 0.35, 1)"
    const levelNames = ["None", "Low", "Medium", "High", "Peak"]

    return (
        <section
            ref={rootRef}
            className={
                "group relative flex w-full flex-col rounded-2xl border p-4 font-sans shadow-sm transition-colors duration-200 sm:p-6 " +
                "border-neutral-200 bg-white text-neutral-900 " +
                "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 " +
                className
            }
        >
            <header className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="m-0 text-base font-semibold tracking-tight sm:text-lg">{title}</h3>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {hint}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {showToggle && (
                        <div
                            role="group"
                            className="relative inline-flex rounded-lg border border-neutral-200 bg-neutral-100/60 p-0.5 dark:border-neutral-800 dark:bg-neutral-900/60"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute top-0.5 bottom-0.5 left-0.5 w-8 rounded-md bg-white shadow-xs transition-transform duration-300 dark:bg-neutral-800"
                                style={{
                                    transform: is3d ? "translateX(100%)" : "translateX(0)",
                                    transitionTimingFunction: ease,
                                }}
                            />
                            {(["2d", "3d"] as const).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    aria-pressed={view === v}
                                    onClick={() => setView(v)}
                                    className={`relative z-10 grid h-7 w-8 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 transition-colors duration-200 ${view === v
                                        ? "text-neutral-950 dark:text-neutral-100"
                                        : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                                        }`}
                                >
                                    {v === "2d" ? <GridIcon /> : <CubeIcon />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <div className="relative overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/40 dark:border-neutral-800/90 dark:bg-neutral-900/20">
                <div className="relative px-2 pt-2 sm:px-4 sm:pt-4">
                    <div
                        ref={stageRef}
                        className="relative w-full overflow-hidden rounded-lg outline-offset-4 has-[:focus-visible]:outline-2"
                        style={{ height: 320 }}
                    >
                        <canvas
                            ref={canvasRef}
                            tabIndex={0}
                            className="absolute top-0 left-0 block outline-none"
                            style={{ touchAction: is3d && orbit ? "pan-y" : "auto" }}
                        />
                    </div>

                    <div
                        ref={tipRef}
                        role="tooltip"
                        aria-hidden="true"
                        className="pointer-events-none absolute top-3 left-3 z-30 whitespace-nowrap rounded-lg border border-neutral-700/30 bg-neutral-900/95 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md transition-opacity duration-150 dark:border-neutral-600/40 dark:bg-neutral-100/95 dark:text-neutral-900 sm:top-4 sm:left-4 motion-reduce:transition-none"
                        style={{ opacity: 0 }}
                    >
                        <strong ref={tipBRef} className="block font-semibold" />
                        <span ref={tipSRef} className="block text-[11px] opacity-80" />
                        <span
                            aria-hidden="true"
                            className="absolute top-full h-0 w-0"
                            style={{
                                left: "var(--arrow, 50%)",
                                marginLeft: -5,
                                borderLeft: "5px solid transparent",
                                borderRight: "5px solid transparent",
                                borderTop: "5px solid currentColor",
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-3 py-3 text-xs text-neutral-500 sm:px-4 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate">Use mouse/touch to orbit, double-click to reset</span>
                    </div>

                    {showLegend && (
                        <div className="flex items-center gap-1.5" onMouseLeave={() => setLegendLevel(-1)}>
                            <span className="text-[11px]">Lower</span>
                            {swatches.map((c, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-pressed={legendLevel === i}
                                    title={levelNames[i]}
                                    onMouseEnter={() => setLegendLevel(i)}
                                    onFocus={() => setLegendLevel(i)}
                                    onBlur={() => setLegendLevel(-1)}
                                    onClick={() => setLegendLevel((curr) => (curr === i ? -1 : i))}
                                    className="h-3 w-3 cursor-pointer rounded-xs border-0 p-0 transition-transform duration-200 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-1"
                                    style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)" }}
                                />
                            ))}
                            <span className="text-[11px]">Higher</span>
                        </div>
                    )}
                </div>
            </div>

            <p aria-live="polite" className="sr-only">{announce}</p>
        </section>
    )
}

export default IsometricHexChart