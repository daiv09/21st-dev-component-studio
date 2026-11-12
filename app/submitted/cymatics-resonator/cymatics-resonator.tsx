"use client"

import * as React from "react"

// #region 1. Math, Noise & Color Primitives
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const damp = (curr: number, target: number, lambda: number, dt: number) =>
    lerp(curr, target, 1 - Math.exp(-lambda * dt))

const hash2 = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return s - Math.floor(s)
}

const vnoise = (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    return lerp(
        lerp(hash2(xi, yi), hash2(xi + 1, yi), u),
        lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u),
        v,
    )
}

const fbm = (x: number, y: number, octaves = 3) => {
    let s = 0
    let amp = 0.5
    let f = 1
    for (let i = 0; i < octaves; i++) {
        s += amp * vnoise(x * f, y * f)
        f *= 2
        amp *= 0.5
    }
    return s
}

export type RGB = [number, number, number]

const FG_FALLBACK: RGB = [23, 23, 23]
const BG_FALLBACK: RGB = [255, 255, 255]

let probeCanvas: CanvasRenderingContext2D | null = null
const toRGB = (color: string, fallback: RGB): RGB => {
    if (typeof document === "undefined") return fallback
    if (!probeCanvas) {
        const c = document.createElement("canvas")
        c.width = 1
        c.height = 1
        probeCanvas = c.getContext("2d", { willReadFrequently: true })
    }
    if (!probeCanvas) return fallback
    try {
        probeCanvas.clearRect(0, 0, 1, 1)
        probeCanvas.fillStyle = "rgba(0,0,0,0)"
        probeCanvas.fillStyle = color
        probeCanvas.fillRect(0, 0, 1, 1)
        const d = probeCanvas.getImageData(0, 0, 1, 1).data
        if (d[3] < 8) return fallback
        return [d[0], d[1], d[2]]
    } catch {
        return fallback
    }
}

const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t),
]
const lum = (c: RGB) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255
const shade = (c: RGB, k: number): RGB => [
    clamp(c[0] * k, 0, 255),
    clamp(c[1] * k, 0, 255),
    clamp(c[2] * k, 0, 255),
]
const cssRgb = (c: RGB, a = 1) =>
    a >= 0.999
        ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`
        : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`

export type PaletteName =
    | "aurora"
    | "ocean"
    | "cyber"
    | "ember"
    | "grape"
    | "quantum"
    | "emerald"
    | "crimson"
    | "mono"
    | "candy"

export const PALETTES: Record<PaletteName, { light: string[]; dark: string[] }> = {
    aurora: {
        light: ["#c8f7e4", "#6fe3c0", "#2bb3a3", "#0b5f66"],
        dark: ["#0b2f3a", "#0f6b6b", "#19c1a5", "#8affd8"],
    },
    ocean: {
        light: ["#b8e3f5", "#6ec3eb", "#2a8fd1", "#0b4f8a"],
        dark: ["#0c2d4a", "#12508a", "#2a88d8", "#7cc7ff"],
    },
    cyber: {
        light: ["#e0e7ff", "#818cf8", "#4f46e5", "#312e81"],
        dark: ["#1e1b4b", "#3730a3", "#6366f1", "#22d3ee"],
    },
    ember: {
        light: ["#fde2c4", "#fbad6e", "#f06b3a", "#b3261e"],
        dark: ["#4a1a10", "#8f2f16", "#e0572a", "#ffa46b"],
    },
    grape: {
        light: ["#e4d4fb", "#b794f4", "#805ad5", "#44337a"],
        dark: ["#2d1f4f", "#553c9a", "#8b5cf6", "#e879f9"],
    },
    quantum: {
        light: ["#fef3c7", "#fbbf24", "#d97706", "#78350f"],
        dark: ["#3b1704", "#92400e", "#f59e0b", "#fef08a"],
    },
    emerald: {
        light: ["#d1fae5", "#6ee7b7", "#10b981", "#065f46"],
        dark: ["#064e3b", "#047857", "#10b981", "#6ee7b7"],
    },
    crimson: {
        light: ["#ffe4e6", "#fda4af", "#f43f5e", "#9f1239"],
        dark: ["#4c0519", "#9f1239", "#e11d48", "#fda4af"],
    },
    mono: {
        light: ["#e5e5e5", "#a3a3a3", "#525252", "#171717"],
        dark: ["#262626", "#525252", "#a3a3a3", "#fafafa"],
    },
    candy: {
        light: ["#ffd9ec", "#ff9ec9", "#f2559c", "#a01060"],
        dark: ["#3d0e2a", "#8c1355", "#ef3d8f", "#ffb3d6"],
    },
}

export type PaletteInput = PaletteName | string[] | { light: string[]; dark: string[] }

const resolvePalette = (p: PaletteInput | undefined, dark: boolean): string[] => {
    const base = PALETTES.aurora[dark ? "dark" : "light"]
    const pick = Array.isArray(p)
        ? p
        : p && typeof p === "object"
            ? dark
                ? p.dark
                : p.light
            : (PALETTES[(p as PaletteName) ?? "aurora"] ?? PALETTES.aurora)[dark ? "dark" : "light"]
    return [0, 1, 2, 3].map((i) => pick[i] ?? pick[pick.length - 1] ?? base[i])
}

const lv = (v: number, peak = 0.76) =>
    v <= 0.02 ? 0 : v >= peak ? 4 : v > peak * 0.66 ? 3 : v > peak * 0.33 ? 2 : 1
// #endregion

// #region 2. Sleek Inertial 3D Engine (KineticStage)
export interface Box {
    x: number
    y: number
    w: number
    d: number
    h: number
    z0?: number
    level: number
    rot?: number
    glow?: number
    key?: string
    label?: string
    meta?: Record<string, number>
    // Internal smooth-damping state
    _x?: number
    _y?: number
    _z0?: number
    _h?: number
    _rot?: number
    _glow?: number
}

export const box = (
    x: number,
    y: number,
    w: number,
    d: number,
    h: number,
    level = 1,
    extra: Partial<Box> = {},
): Box => ({ x, y, w, d, h, z0: 0, level, ...extra })

export interface View {
    cs: number
    sn: number
    se: number
    ce: number
    s: number
    ox: number
    oy: number
}

export interface InteractionState {
    pointerWorld: [number, number] | null
    activeIdx: number
    pulses: Array<{ x: number; y: number; t0: number }>
}

export interface SceneSpec {
    boxes: Box[]
    animate?: (boxes: Box[], t: number, dt: number, state: InteractionState) => void
    worldBounds?: [number, number, number, number, number, number]
    smoothing?: number
    navCols?: number
    pad?: number
    yaw?: number
    elev?: number
    zoom?: number
}

export const projectPoint = (v: View, x: number, y: number, z: number): [number, number] => [
    v.ox + (x * v.cs - y * v.sn) * v.s,
    v.oy + ((x * v.sn + y * v.cs) * v.se - z * v.ce) * v.s,
]

export const unprojectToGround = (
    v: View,
    px: number,
    py: number,
    zPlane = 0,
): [number, number] => {
    const rx = (px - v.ox) / v.s
    const ry = ((py - v.oy) / v.s + zPlane * v.ce) / Math.max(0.15, v.se)
    const wx = rx * v.cs + ry * v.sn
    const wy = -rx * v.sn + ry * v.cs
    return [wx, wy]
}

const pointInQuad = (p: Float32Array, o: number, x: number, y: number): boolean => {
    let sign = 0
    for (let k = 0; k < 4; k++) {
        const ax = p[o + k * 2]
        const ay = p[o + k * 2 + 1]
        const bx = p[o + ((k + 1) % 4) * 2]
        const by = p[o + ((k + 1) % 4) * 2 + 1]
        const cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
        if (Math.abs(cross) < 1e-9) continue
        const s = cross > 0 ? 1 : -1
        if (sign === 0) sign = s
        else if (s !== sign) return false
    }
    return sign !== 0
}

const quadPath = (ctx: CanvasRenderingContext2D, p: Float32Array, o: number) => {
    ctx.moveTo(p[o], p[o + 1])
    ctx.lineTo(p[o + 2], p[o + 3])
    ctx.lineTo(p[o + 4], p[o + 5])
    ctx.lineTo(p[o + 6], p[o + 7])
    ctx.closePath()
}

export interface KineticStageProps {
    title: React.ReactNode
    subtitle?: string
    hint?: string
    spec: SceneSpec
    palette?: PaletteInput
    autoRotate?: number
    orbit?: boolean
    height?: number
    legend?: boolean
    headerControls?: React.ReactNode
    className?: string
}

export function KineticStage({
    title,
    subtitle,
    hint,
    spec,
    palette = "aurora",
    autoRotate = 0.12,
    orbit = true,
    height = 360,
    legend = true,
    headerControls,
    className = "",
}: KineticStageProps) {
    const rootRef = React.useRef<HTMLElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const tipRef = React.useRef<HTMLDivElement>(null)
    const engineRef = React.useRef<{
        load: () => void
        kick: () => void
        retheme: () => void
        triggerPulse: (x: number, y: number) => void
    } | null>(null)

    const [theme, setTheme] = React.useState<{ dark: boolean; swatches: string[]; accent: string }>({
        dark: false,
        swatches: [],
        accent: "#888",
    })
    const [active, setActive] = React.useState(-1)
    const [announce, setAnnounce] = React.useState("")
    const [legendLevel, setLegendLevel] = React.useState(-1)

    const cfg = React.useRef({
        spec,
        palette,
        autoRotate,
        orbit,
        legendLevel,
        setActive,
        setTheme,
        setAnnounce,
    })
    cfg.current = { spec, palette, autoRotate, orbit, legendLevel, setActive, setTheme, setAnnounce }

    React.useEffect(() => {
        const root = rootRef.current
        const stage = stageRef.current
        const canvas = canvasRef.current
        const tip = tipRef.current
        if (!root || !stage || !canvas || !tip) return
        const ctx = canvas.getContext("2d", { alpha: true })
        if (!ctx) return

        const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const darkMq = window.matchMedia("(prefers-color-scheme: dark)")
        let reduced = reduceMq.matches

        let W = 0
        let H = 0
        let dpr = 1
        let yaw = 0
        let elev = 0
        let yawGoal = 0
        let elevGoal = 0
        let vYaw = 0
        let vElev = 0
        let t = 0
        let last = performance.now()
        let raf = 0
        let visible = true

        let n = 0
        let bx: Box[] = []
        let order: number[] = []
        let polys = new Float32Array(0)
        let depth = new Float32Array(0)
        let hov = new Float32Array(0)
        let dim = new Float32Array(0)

        const col = new Float32Array(15)
        const colGoal = new Float32Array(15)
        let colReady = false
        let bg: RGB = BG_FALLBACK
        let isDark = false

        let hovered = -1
        let pinned = -1
        let activeIdx = -1
        let tipW = 0
        let pointerScreen: [number, number] | null = null
        let smoothPointerWorld: [number, number] | null = null
        const pulses: Array<{ x: number; y: number; t0: number }> = []
        let view: View = { cs: 1, sn: 0, se: 1, ce: 0, s: 1, ox: 0, oy: 0 }

        const triggerPulse = (wx: number, wy: number) => {
            pulses.push({ x: wx, y: wy, t0: t })
            if (pulses.length > 6) pulses.shift()
            kick()
        }

        const load = () => {
            bx = cfg.current.spec.boxes
            n = bx.length
            if (order.length !== n) order = Array.from({ length: n }, (_, i) => i)
            if (polys.length !== n * 24) {
                polys = new Float32Array(n * 24)
                depth = new Float32Array(n)
                hov = new Float32Array(n)
                dim = new Float32Array(n)
            }
            for (let i = 0; i < n; i++) {
                const b = bx[i]
                b._x = b.x
                b._y = b.y
                b._z0 = b.z0 ?? 0
                b._h = b.h
                b._rot = b.rot ?? 0
                b._glow = b.glow ?? 0
            }
            if (hovered >= n) hovered = -1
            if (pinned >= n) pinned = -1
            kick()
        }

        const computeColors = (instant = false) => {
            const cs = getComputedStyle(root)
            const isTailwindDark = root.classList.contains("dark") || !!root.closest(".dark")
            isDark = isTailwindDark || darkMq.matches
            bg = toRGB(cs.backgroundColor, isDark ? [10, 10, 12] : BG_FALLBACK)

            const hexes = resolvePalette(cfg.current.palette, isDark)
            const swatches = hexes.slice()
            const c0: RGB = mixRGB(bg, toRGB(hexes[0], [100, 100, 100]), isDark ? 0.38 : 0.24)
            const c1: RGB = toRGB(hexes[0], [100, 100, 100])
            const c2: RGB = toRGB(hexes[1], [150, 150, 150])
            const c3: RGB = toRGB(hexes[2], [200, 200, 200])
            const c4: RGB = toRGB(hexes[3], [255, 255, 255])
            const levels: RGB[] = [c0, c1, c2, c3, c4]

            for (let i = 0; i < 5; i++) {
                colGoal[i * 3] = levels[i][0]
                colGoal[i * 3 + 1] = levels[i][1]
                colGoal[i * 3 + 2] = levels[i][2]
            }

            if (instant || !colReady) {
                col.set(colGoal)
                colReady = true
            }

            cfg.current.setTheme({ dark: isDark, swatches, accent: hexes[2] })
        }

        const retheme = () => {
            computeColors(false)
            kick()
        }

        const resize = () => {
            const r = stage.getBoundingClientRect()
            if (r.width <= 0) return
            dpr = Math.min(window.devicePixelRatio || 1, 2.5)
            W = r.width
            H = r.height || 360
            canvas.width = Math.round(W * dpr)
            canvas.height = Math.round(H * dpr)
            canvas.style.width = `${W}px`
            canvas.style.height = `${H}px`
            computeColors(true)
            kick()
        }

        const refreshActive = () => {
            const next = pinned >= 0 ? pinned : hovered
            if (next !== activeIdx) {
                activeIdx = next
                cfg.current.setActive(next)
                if (next >= 0 && bx[next]) {
                    const b = bx[next]
                    cfg.current.setAnnounce(b.label ?? b.key ?? `Node ${next + 1}`)
                }
            }
            if (tip) {
                tip.style.opacity = activeIdx >= 0 ? "1" : "0"
                tipW = tip.offsetWidth
            }
        }

        const positionTip = () => {
            if (activeIdx < 0 || !tip || activeIdx >= bx.length) return
            const b = bx[activeIdx]
            const cx = (b._x ?? b.x) + b.w / 2
            const cy = (b._y ?? b.y) + b.d / 2
            const z1 = (b._z0 ?? b.z0 ?? 0) + (b._h ?? b.h) + 0.48
            const p = projectPoint(view, cx, cy, z1)
            const half = tipW / 2
            const tx = clamp(p[0], half + 8, W - half - 8)
            tip.style.transform = `translate3d(${(tx - half).toFixed(1)}px, ${(p[1] - 10).toFixed(1)}px, 0) translateY(-100%)`
            tip.style.setProperty("--arrow", `${(p[0] - tx + half).toFixed(1)}px`)
        }

        const tick = (now: number) => {
            raf = 0
            const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
            last = now
            let moving = false

            if (!reduced) {
                t += dt
                if (!dragging) {
                    // Inertial momentum decay + autoRotate
                    yawGoal += (vYaw + (cfg.current.autoRotate ?? 0)) * dt
                    elevGoal = clamp(elevGoal + vElev * dt, -0.45, 0.65)
                    vYaw *= Math.exp(-5.5 * dt)
                    vElev *= Math.exp(-5.5 * dt)
                    if (Math.abs(vYaw) < 1e-4) vYaw = 0
                    if (Math.abs(vElev) < 1e-4) vElev = 0
                }
            }

            for (let i = pulses.length - 1; i >= 0; i--) {
                if (t - pulses[i].t0 > 4.2) pulses.splice(i, 1)
            }

            if (Math.abs(yawGoal - yaw) > 1e-4 || Math.abs(elevGoal - elev) > 1e-4) {
                yaw = damp(yaw, yawGoal, 14, dt)
                elev = damp(elev, elevGoal, 14, dt)
                moving = true
            } else {
                yaw = yawGoal
                elev = elevGoal
            }

            for (let k = 0; k < 15; k++) {
                if (Math.abs(colGoal[k] - col[k]) > 0.3) {
                    col[k] = damp(col[k], colGoal[k], 9, dt)
                    moving = true
                } else {
                    col[k] = colGoal[k]
                }
            }

            const leg = cfg.current.legendLevel
            for (let i = 0; i < n; i++) {
                const hg = i === activeIdx ? 1 : 0
                if (Math.abs(hg - hov[i]) > 0.004) {
                    hov[i] = damp(hov[i], hg, 16, dt)
                    moving = true
                } else {
                    hov[i] = hg
                }

                const dg = leg >= 0 && bx[i].level !== leg ? 1 : 0
                if (Math.abs(dg - dim[i]) > 0.004) {
                    dim[i] = damp(dim[i], dg, 12, dt)
                    moving = true
                } else {
                    dim[i] = dg
                }
            }

            if (pointerScreen) {
                const rawWorld = unprojectToGround(view, pointerScreen[0], pointerScreen[1], 1.2)
                if (!smoothPointerWorld) {
                    smoothPointerWorld = [rawWorld[0], rawWorld[1]]
                } else {
                    smoothPointerWorld[0] = damp(smoothPointerWorld[0], rawWorld[0], 18, dt)
                    smoothPointerWorld[1] = damp(smoothPointerWorld[1], rawWorld[1], 18, dt)
                }
            } else {
                smoothPointerWorld = null
            }

            if (cfg.current.spec.animate && !reduced) {
                cfg.current.spec.animate(bx, t, dt, {
                    pointerWorld: smoothPointerWorld,
                    activeIdx,
                    pulses,
                })
                moving = true
            }

            // Smooth temporal interpolation of geometry
            const sLambda = cfg.current.spec.smoothing ?? 16
            for (let i = 0; i < n; i++) {
                const b = bx[i]
                b._x = damp(b._x ?? b.x, b.x, sLambda, dt)
                b._y = damp(b._y ?? b.y, b.y, sLambda, dt)
                b._z0 = damp(b._z0 ?? b.z0 ?? 0, b.z0 ?? 0, sLambda, dt)
                b._h = damp(b._h ?? b.h, Math.max(0.08, b.h), sLambda, dt)
                b._rot = damp(b._rot ?? b.rot ?? 0, b.rot ?? 0, sLambda, dt)
                b._glow = damp(b._glow ?? b.glow ?? 0, b.glow ?? 0, sLambda, dt)
            }

            render()
            positionTip()

            if (moving && visible) kick()
        }

        const kick = () => {
            if (!raf && visible) {
                last = performance.now()
                raf = requestAnimationFrame(tick)
            }
        }

        const render = () => {
            ctx.save()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.scale(dpr, dpr)

            const baseYaw = cfg.current.spec.yaw ?? Math.PI / 4
            const baseElev = cfg.current.spec.elev ?? (33 * Math.PI) / 180
            const cs = Math.cos(baseYaw + yaw)
            const sn = Math.sin(baseYaw + yaw)
            const se = Math.sin(baseElev + elev)
            const ce = Math.cos(baseElev + elev)

            let minX = Infinity,
                maxX = -Infinity
            let minY = Infinity,
                maxY = -Infinity

            const wb = cfg.current.spec.worldBounds
            if (wb) {
                const cxs = [wb[0], wb[1]]
                const cys = [wb[2], wb[3]]
                const czs = [wb[4], wb[5]]
                for (let ix = 0; ix < 2; ix++) {
                    for (let iy = 0; iy < 2; iy++) {
                        const rx = cxs[ix] * cs - cys[iy] * sn
                        const ry = (cxs[ix] * sn + cys[iy] * cs) * se
                        for (let iz = 0; iz < 2; iz++) {
                            const py = ry - czs[iz] * ce
                            if (rx < minX) minX = rx
                            if (rx > maxX) maxX = rx
                            if (py < minY) minY = py
                            if (py > maxY) maxY = py
                        }
                    }
                }
            } else {
                for (let i = 0; i < n; i++) {
                    const b = bx[i]
                    const z0 = b._z0 ?? 0
                    const z1 = z0 + (b._h ?? b.h)
                    const bx0 = b._x ?? b.x
                    const by0 = b._y ?? b.y
                    const cxs = [bx0, bx0 + b.w]
                    const cys = [by0, by0 + b.d]
                    const czs = [z0, z1]
                    for (let ix = 0; ix < 2; ix++) {
                        for (let iy = 0; iy < 2; iy++) {
                            const rx = cxs[ix] * cs - cys[iy] * sn
                            const ry = (cxs[ix] * sn + cys[iy] * cs) * se
                            for (let iz = 0; iz < 2; iz++) {
                                const py = ry - czs[iz] * ce
                                if (rx < minX) minX = rx
                                if (rx > maxX) maxX = rx
                                if (py < minY) minY = py
                                if (py > maxY) maxY = py
                            }
                        }
                    }
                }
            }

            const pad = cfg.current.spec.pad ?? 26
            const avW = Math.max(1, W - pad * 2)
            const avH = Math.max(1, H - pad * 2)
            const spanX = Math.max(1e-4, maxX - minX)
            const spanY = Math.max(1e-4, maxY - minY)
            const s = Math.min(avW / spanX, avH / spanY) * (cfg.current.spec.zoom ?? 1)
            const ox = W / 2 - ((minX + maxX) / 2) * s
            const oy = H / 2 - ((minY + maxY) / 2) * s

            view = { cs, sn, se, ce, s, ox, oy }

            let minDepth = Infinity
            let maxDepth = -Infinity
            for (let i = 0; i < n; i++) {
                const b = bx[i]
                const cx = (b._x ?? b.x) + b.w / 2
                const cy = (b._y ?? b.y) + b.d / 2
                const cz = (b._z0 ?? 0) + (b._h ?? b.h) / 2
                const dVal = (cx * sn + cy * cs) * ce + cz * se
                depth[i] = dVal
                if (dVal < minDepth) minDepth = dVal
                if (dVal > maxDepth) maxDepth = dVal
            }
            order.sort((ia, ib) => depth[ia] - depth[ib])
            const depthSpan = Math.max(1e-3, maxDepth - minDepth)

            const bgLum = lum(bg)
            const isCanvasDark = bgLum < 0.45

            // Ambient radial glow under stage
            const grad = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.48)
            const glowRGB: RGB = [col[9], col[10], col[11]]
            grad.addColorStop(0, cssRgb(glowRGB, isCanvasDark ? 0.12 : 0.08))
            grad.addColorStop(1, cssRgb(glowRGB, 0))
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, W, H)

            const topLight = isCanvasDark ? 1.18 : 1.06
            const sideALight = isCanvasDark ? 0.86 : 0.91
            const sideBLight = isCanvasDark ? 0.62 : 0.76

            for (let k = 0; k < n; k++) {
                const i = order[k]
                const b = bx[i]
                const bx0 = b._x ?? b.x
                const by0 = b._y ?? b.y
                const z0 = b._z0 ?? 0
                const z1 = z0 + (b._h ?? b.h)
                const cx = bx0 + b.w / 2
                const cy = by0 + b.d / 2
                const hw = b.w / 2
                const hd = b.d / 2
                const rot = b._rot ?? 0
                const cr = Math.cos(rot)
                const sr = Math.sin(rot)

                const lx = [-hw, hw, hw, -hw]
                const ly = [-hd, -hd, hd, hd]
                const wx = [0, 0, 0, 0]
                const wy = [0, 0, 0, 0]
                for (let c = 0; c < 4; c++) {
                    wx[c] = cx + lx[c] * cr - ly[c] * sr
                    wy[c] = cy + lx[c] * sr + ly[c] * cr
                }

                const pTop0 = projectPoint(view, wx[0], wy[0], z1)
                const pTop1 = projectPoint(view, wx[1], wy[1], z1)
                const pTop2 = projectPoint(view, wx[2], wy[2], z1)
                const pTop3 = projectPoint(view, wx[3], wy[3], z1)

                const pBot0 = projectPoint(view, wx[0], wy[0], z0)
                const pBot1 = projectPoint(view, wx[1], wy[1], z0)
                const pBot2 = projectPoint(view, wx[2], wy[2], z0)
                const pBot3 = projectPoint(view, wx[3], wy[3], z0)

                const pTop = [pTop0, pTop1, pTop2, pTop3]
                const pBot = [pBot0, pBot1, pBot2, pBot3]

                const o = i * 24
                polys[o] = pTop0[0]
                polys[o + 1] = pTop0[1]
                polys[o + 2] = pTop1[0]
                polys[o + 3] = pTop1[1]
                polys[o + 4] = pTop2[0]
                polys[o + 5] = pTop2[1]
                polys[o + 6] = pTop3[0]
                polys[o + 7] = pTop3[1]

                let sideSlot = 1
                for (let edge = 0; edge < 4; edge++) {
                    const nextEdge = (edge + 1) % 4
                    const enx = wy[nextEdge] - wy[edge]
                    const eny = -(wx[nextEdge] - wx[edge])
                    const dot = enx * sn + eny * cs
                    if (dot > -1e-5 && sideSlot <= 2) {
                        const baseO = o + sideSlot * 8
                        polys[baseO] = pTop[edge][0]
                        polys[baseO + 1] = pTop[edge][1]
                        polys[baseO + 2] = pTop[nextEdge][0]
                        polys[baseO + 3] = pTop[nextEdge][1]
                        polys[baseO + 4] = pBot[nextEdge][0]
                        polys[baseO + 5] = pBot[nextEdge][1]
                        polys[baseO + 6] = pBot[edge][0]
                        polys[baseO + 7] = pBot[edge][1]
                        sideSlot++
                    }
                }

                const lvIdx = clamp(b.level | 0, 0, 4)
                const baseCol: RGB = [col[lvIdx * 3], col[lvIdx * 3 + 1], col[lvIdx * 3 + 2]]
                const hv = hov[i]
                const dm = dim[i]
                const gl = clamp01(b._glow ?? 0)

                // Subtle atmospheric depth perspective
                const normDepth = clamp01((depth[i] - minDepth) / depthSpan)
                const fogMix = (1 - normDepth) * (isCanvasDark ? 0.22 : 0.16)

                let topC = shade(baseCol, topLight)
                let leftC = shade(baseCol, sideALight)
                let rightC = shade(baseCol, sideBLight)

                if (gl > 0.01) {
                    const glowCol: RGB = isCanvasDark ? [238, 255, 252] : [255, 255, 255]
                    topC = mixRGB(topC, glowCol, gl * 0.78)
                    leftC = mixRGB(leftC, glowCol, gl * 0.54)
                    rightC = mixRGB(rightC, glowCol, gl * 0.38)
                }

                if (fogMix > 0.01) {
                    topC = mixRGB(topC, bg, fogMix)
                    leftC = mixRGB(leftC, bg, fogMix)
                    rightC = mixRGB(rightC, bg, fogMix)
                }

                if (hv > 0.001) {
                    const hCol: RGB = isCanvasDark ? [255, 255, 255] : [15, 15, 15]
                    topC = mixRGB(topC, hCol, hv * 0.38)
                    leftC = mixRGB(leftC, hCol, hv * 0.28)
                    rightC = mixRGB(rightC, hCol, hv * 0.2)
                }

                if (dm > 0.001) {
                    topC = mixRGB(topC, bg, dm * 0.8)
                    leftC = mixRGB(leftC, bg, dm * 0.8)
                    rightC = mixRGB(rightC, bg, dm * 0.8)
                }

                ctx.fillStyle = cssRgb(leftC)
                ctx.beginPath()
                quadPath(ctx, polys, o + 8)
                ctx.fill()

                ctx.fillStyle = cssRgb(rightC)
                ctx.beginPath()
                quadPath(ctx, polys, o + 16)
                ctx.fill()

                ctx.fillStyle = cssRgb(topC)
                ctx.beginPath()
                quadPath(ctx, polys, o)
                ctx.fill()

                // Specular bevel rim on top face
                ctx.strokeStyle = isCanvasDark
                    ? `rgba(255,255,255,${(0.06 + gl * 0.18 + hv * 0.25).toFixed(3)})`
                    : `rgba(0,0,0,${(0.055 + hv * 0.18).toFixed(3)})`
                ctx.lineWidth = hv > 0.1 ? 1.15 : 0.7
                ctx.stroke()
            }

            ctx.restore()
        }

        const hit = (x: number, y: number): number => {
            for (let k = n - 1; k >= 0; k--) {
                const i = order[k]
                const o = i * 24
                if (
                    pointInQuad(polys, o, x, y) ||
                    pointInQuad(polys, o + 8, x, y) ||
                    pointInQuad(polys, o + 16, x, y)
                ) {
                    return i
                }
            }
            return -1
        }

        const local = (ev: PointerEvent) => {
            const r = canvas.getBoundingClientRect()
            return [ev.clientX - r.left, ev.clientY - r.top] as const
        }

        let dragging = false
        let drag: {
            id: number
            x: number
            y: number
            lastX: number
            lastY: number
            lastT: number
            yaw: number
            elev: number
            moved: boolean
        } | null = null

        const onDown = (ev: PointerEvent) => {
            if (ev.button !== 0 || !cfg.current.orbit) return
            vYaw = 0
            vElev = 0
            drag = {
                id: ev.pointerId,
                x: ev.clientX,
                y: ev.clientY,
                lastX: ev.clientX,
                lastY: ev.clientY,
                lastT: performance.now(),
                yaw: yawGoal,
                elev: elevGoal,
                moved: false,
            }
            dragging = true
            try {
                canvas.setPointerCapture(ev.pointerId)
            } catch { }
        }

        const onMove = (ev: PointerEvent) => {
            const [lx, ly] = local(ev)
            pointerScreen = [lx, ly]

            if (drag && ev.pointerId === drag.id) {
                const now = performance.now()
                const dtMove = Math.max(1, now - drag.lastT) / 1000
                const dx = ev.clientX - drag.x
                const dy = ev.clientY - drag.y
                const stepX = ev.clientX - drag.lastX
                const stepY = ev.clientY - drag.lastY
                drag.lastX = ev.clientX
                drag.lastY = ev.clientY
                drag.lastT = now

                if (drag.moved || Math.hypot(dx, dy) > 4) {
                    drag.moved = true
                    yawGoal = drag.yaw + dx * 0.0065
                    elevGoal = clamp(drag.elev + dy * 0.0045, -0.45, 0.65)
                    vYaw = clamp((stepX * 0.0065) / dtMove, -3.5, 3.5)
                    vElev = clamp((stepY * 0.0045) / dtMove, -2.5, 2.5)
                    canvas.style.cursor = "grabbing"
                    hovered = -1
                    refreshActive()
                    kick()
                    return
                }
            }
            if (ev.pointerType !== "mouse") return
            const i = hit(lx, ly)
            if (i !== hovered) {
                hovered = i
                canvas.style.cursor = i >= 0 ? "pointer" : "grab"
                refreshActive()
            }
            kick()
        }

        const onUp = (ev: PointerEvent) => {
            if (!drag || ev.pointerId !== drag.id) return
            const moved = drag.moved
            dragging = false
            drag = null
            canvas.style.cursor = "grab"
            try {
                canvas.releasePointerCapture(ev.pointerId)
            } catch { }
            if (!moved) {
                const [x, y] = local(ev)
                const i = hit(x, y)
                if (i >= 0 && bx[i]) {
                    triggerPulse((bx[i]._x ?? bx[i].x) + bx[i].w / 2, (bx[i]._y ?? bx[i].y) + bx[i].d / 2)
                } else {
                    const [wx, wy] = unprojectToGround(view, x, y, 0)
                    triggerPulse(wx, wy)
                }
                pinned = pinned === i ? -1 : i
                refreshActive()
            }
            kick()
        }

        const onDblClick = () => {
            yawGoal = 0
            elevGoal = 0
            vYaw = 0
            vElev = 0
            kick()
        }

        const onLeave = () => {
            pointerScreen = null
            if (dragging) return
            if (hovered !== -1) {
                hovered = -1
                refreshActive()
                kick()
            }
        }

        const io = new IntersectionObserver(
            (entries) => {
                visible = entries[0]?.isIntersecting ?? true
                if (visible) kick()
            },
            { threshold: 0.05 },
        )
        io.observe(root)

        canvas.addEventListener("pointerdown", onDown)
        canvas.addEventListener("pointermove", onMove)
        canvas.addEventListener("pointerup", onUp)
        canvas.addEventListener("pointercancel", onLeave)
        canvas.addEventListener("pointerleave", onLeave)
        canvas.addEventListener("dblclick", onDblClick)

        const ro = new ResizeObserver(() => resize())
        ro.observe(stage)

        const obs = new MutationObserver(() => retheme())
        obs.observe(root, { attributes: true, attributeFilter: ["class", "style"] })

        const darkHandler = () => retheme()
        darkMq.addEventListener("change", darkHandler)

        const reduceHandler = (e: MediaQueryListEvent) => {
            reduced = e.matches
            kick()
        }
        reduceMq.addEventListener("change", reduceHandler)

        engineRef.current = { load, kick, retheme, triggerPulse }
        load()
        resize()

        return () => {
            if (raf) cancelAnimationFrame(raf)
            io.disconnect()
            ro.disconnect()
            obs.disconnect()
            darkMq.removeEventListener("change", darkHandler)
            reduceMq.removeEventListener("change", reduceHandler)
            canvas.removeEventListener("pointerdown", onDown)
            canvas.removeEventListener("pointermove", onMove)
            canvas.removeEventListener("pointerup", onUp)
            canvas.removeEventListener("pointercancel", onLeave)
            canvas.removeEventListener("pointerleave", onLeave)
            canvas.removeEventListener("dblclick", onDblClick)
            engineRef.current = null
        }
    }, [])

    React.useEffect(() => {
        engineRef.current?.load()
    }, [spec.boxes])

    React.useEffect(() => {
        engineRef.current?.retheme()
    }, [palette])

    React.useEffect(() => {
        engineRef.current?.kick()
    }, [legendLevel])

    const activeBox = active >= 0 ? spec.boxes[active] : null
    const tipText = activeBox ? (activeBox.label ?? activeBox.key ?? "") : ""
    const levelNames = ["Idle", "Low", "Medium", "High", "Peak"]

    return (
        <section
            ref={rootRef}
            className={
                "group relative flex w-full flex-col overflow-hidden rounded-2xl border font-sans shadow-xs transition-all duration-300 " +
                "border-neutral-200/80 bg-white/95 text-neutral-900 hover:border-neutral-300 hover:shadow-md " +
                "dark:border-neutral-800/80 dark:bg-neutral-950/95 dark:text-neutral-100 dark:hover:border-neutral-700 " +
                className
            }
        >
            <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-neutral-100 px-5 py-3.5 dark:border-neutral-900">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="m-0 truncate text-sm font-semibold tracking-tight sm:text-base">
                            {title}
                        </h3>
                    </div>
                    {subtitle && (
                        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                            {subtitle}
                        </p>
                    )}
                </div>
                {headerControls && <div className="flex items-center gap-1.5">{headerControls}</div>}
            </header>

            <div ref={stageRef} className="relative w-full select-none" style={{ height }}>
                <canvas
                    ref={canvasRef}
                    tabIndex={0}
                    role="img"
                    aria-label={typeof title === "string" ? `${title} 3D stage` : "Interactive 3D stage"}
                    className="absolute inset-0 block cursor-grab outline-none"
                    style={{ maxWidth: "none", touchAction: orbit ? "none" : "auto" }}
                />

                <div
                    ref={tipRef}
                    role="tooltip"
                    aria-hidden={active < 0}
                    className="pointer-events-none absolute top-0 left-0 z-30 whitespace-nowrap rounded-lg border border-neutral-700/30 bg-neutral-900/95 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl backdrop-blur-md transition-opacity duration-150 dark:border-neutral-600/40 dark:bg-neutral-100/95 dark:text-neutral-900"
                    style={{ opacity: active >= 0 ? 1 : 0 }}
                >
                    {tipText}
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

            <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-neutral-100 px-5 py-2.5 text-[11px] text-neutral-500 dark:border-neutral-900 dark:text-neutral-400">
                <span className="min-w-0 flex-1 truncate">
                    {hint ?? "Drag to orbit · hover to interact · click for shockwave · double-click reset"}
                </span>
                {legend ? (
                    <div className="flex items-center gap-1.5" onMouseLeave={() => setLegendLevel(-1)}>
                        <span className="mr-0.5 text-[10px] uppercase tracking-wider opacity-75">Low</span>
                        {theme.swatches.map((c, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Filter ${levelNames[i + 1]} intensity`}
                                onMouseEnter={() => setLegendLevel(i + 1)}
                                onClick={() => setLegendLevel((curr) => (curr === i + 1 ? -1 : i + 1))}
                                className="h-2.5 w-2.5 cursor-pointer rounded-xs border-0 p-0 transition-transform duration-150 hover:scale-125"
                                style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)" }}
                            />
                        ))}
                        <span className="ml-0.5 text-[10px] uppercase tracking-wider opacity-75">Peak</span>
                    </div>
                ) : null}
            </footer>

            <p aria-live="polite" className="sr-only">
                {announce}
            </p>
        </section>
    )
}
// #endregion

// #region 3. Shared UI Pill Button Helper
function ModeButton({
    active,
    onClick,
    children,
}: {
    active?: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                "cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all duration-150 active:scale-95 " +
                (active
                    ? "bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800")
            }
        >
            {children}
        </button>
    )
}
// #endregion

// ============================================================================
// 01 · CYMATICS CHLADNI RESONATOR
// Acoustic standing-wave plate with eigenmode harmonic presets & shockwaves
// ============================================================================
export function CymaticsResonator({ palette = "cyber" as PaletteInput, height = 360 }) {
    const [modeIdx, setModeIdx] = React.useState(1)
    const modes = [
        { m: 2, n: 1, label: "432 Hz" },
        { m: 3, n: 2, label: "528 Hz" },
        { m: 4, n: 3, label: "639 Hz" },
        { m: 5, n: 2, label: "741 Hz" },
    ]
    const { m, n } = modes[modeIdx]

    const boxes = React.useMemo(() => {
        const out: Box[] = []
        const size = 19
        const half = (size - 1) / 2
        for (let gx = 0; gx < size; gx++) {
            for (let gy = 0; gy < size; gy++) {
                const nx = (gx - half) / half
                const ny = (gy - half) / half
                if (nx * nx + ny * ny > 1.05) continue
                const wx = (gx - half) * 0.72
                const wy = (gy - half) * 0.72
                out.push(
                    box(wx - 0.27, wy - 0.27, 0.54, 0.54, 1, 2, {
                        key: `cym-${gx}-${gy}`,
                        meta: { nx, ny, wx, wy },
                    }),
                )
            }
        }
        return out
    }, [])

    const animate = React.useCallback(
        (bs: Box[], t: number, _dt: number, state: InteractionState) => {
            const carrier = Math.cos(t * 2.5)
            for (let i = 0; i < bs.length; i++) {
                const b = bs[i]
                const { nx, ny, wx, wy } = b.meta!
                const chladni =
                    Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny) -
                    Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny)
                let v = Math.abs(chladni * carrier) * 0.58 + (1 - Math.abs(chladni)) * 0.32

                if (state.pointerWorld) {
                    const d2 = (wx - state.pointerWorld[0]) ** 2 + (wy - state.pointerWorld[1]) ** 2
                    v += Math.exp(-d2 * 0.35) * 0.65
                }
                for (const p of state.pulses) {
                    const age = t - p.t0
                    const dist = Math.hypot(wx - p.x, wy - p.y)
                    v += Math.exp(-((dist - age * 6.5) ** 2) * 1.4) * Math.exp(-age * 0.9) * 0.9
                }
                v = clamp01(v)
                b.h = 0.25 + v * 4.0
                b.z0 = (1 - v) * 0.25
                b.glow = v > 0.75 ? (v - 0.75) * 3.2 : 0
                b.level = lv(v, 0.78)
                b.label = `Harmonic (${nx.toFixed(1)}, ${ny.toFixed(1)}) · Amplitude ${(v * 100).toFixed(0)}%`
            }
        },
        [m, n],
    )

    return (
        <KineticStage
            title="Cymatics Chladni Resonator"
            subtitle="Eigenmode standing wave nodal geometry"
            palette={palette}
            height={height}
            headerControls={modes.map((item, idx) => (
                <ModeButton key={item.label} active={modeIdx === idx} onClick={() => setModeIdx(idx)}>
                    {item.label}
                </ModeButton>
            ))}
            spec={{ boxes, animate, worldBounds: [-7, 7, -7, 7, 0, 4.8], zoom: 0.92 }}
        />
    )
}

// ============================================================================
// 21st.dev Direct Component Export (<Component />)
// ============================================================================
export default function Component(
    props: React.ComponentProps<typeof CymaticsResonator>
) {
    return <CymaticsResonator {...props} />
}

export { Component }
