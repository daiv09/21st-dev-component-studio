"use client"

/**
 * BLOCKVAULT — 26 minimal, buttery-smooth, interactive 3D block components.
 *
 * One shared engine (camera · projection · painter · pointer · a11y · theming)
 * and 26 tiny "spec" components that each describe a different metaphor.
 *
 * Drop this file in your project and import whatever you like:
 *
 *   import { BlockVaultGallery } from "@/components/block-vault"   // all 26
 *   import { CircadianRing, DigitalRain } from "@/components/block-vault"
 */

import * as React from "react"

/* ============================================================================
   1 · MATH
   ========================================================================== */

const TAU = Math.PI * 2

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3)
const easeInOutCubic = (x: number) => {
    const t = clamp01(x)
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
const smoothstep = (a: number, b: number, x: number) => {
    const t = clamp01((x - a) / (b - a))
    return t * t * (3 - 2 * t)
}

/** mulberry32 — tiny deterministic PRNG. */
const rng = (seed: number) => {
    let a = seed >>> 0
    return (): number => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const hash2 = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return s - Math.floor(s)
}

/** Cheap value noise. */
const vnoise = (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v)
}

/** Fractal brownian motion, 0…~1. */
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

/* ============================================================================
   2 · COLOUR
   ========================================================================== */

export type RGB = [number, number, number]

const FG_FALLBACK: RGB = [23, 23, 23]
const BG_FALLBACK: RGB = [255, 255, 255]

// Any CSS colour → sRGB by letting the browser paint it. Handles oklch, color-mix…
let probe: CanvasRenderingContext2D | null = null
const toRGB = (color: string, fb: RGB): RGB => {
    if (typeof document === "undefined") return fb
    if (!probe) {
        const c = document.createElement("canvas")
        c.width = c.height = 1
        probe = c.getContext("2d", { willReadFrequently: true })
    }
    if (!probe) return fb
    probe.clearRect(0, 0, 1, 1)
    probe.fillStyle = "rgba(0,0,0,0)"
    probe.fillStyle = color
    probe.fillRect(0, 0, 1, 1)
    const d = probe.getImageData(0, 0, 1, 1).data
    if (d[3] < 8) return fb
    return [d[0], d[1], d[2]]
}

const mixRGB = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
const lum = (c: RGB) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255
const shade = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k]
const css = (c: RGB, a = 1) =>
    a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

export type PaletteName = "github" | "ocean" | "ember" | "grape" | "halloween" | "mono" | "aurora" | "candy"

export const PALETTES: Record<PaletteName, { light: string[]; dark: string[] }> = {
    github: { light: ["#c6e48b", "#7bc96f", "#239a3b", "#196127"], dark: ["#0e4429", "#006d32", "#26a641", "#39d353"] },
    ocean: { light: ["#b8e3f5", "#6ec3eb", "#2a8fd1", "#0b4f8a"], dark: ["#0c2d4a", "#12508a", "#2a88d8", "#7cc7ff"] },
    ember: { light: ["#fde2c4", "#fbad6e", "#f06b3a", "#b3261e"], dark: ["#4a1a10", "#8f2f16", "#e0572a", "#ffa46b"] },
    grape: { light: ["#e4d4fb", "#b794f4", "#805ad5", "#44337a"], dark: ["#2d1f4f", "#553c9a", "#8b5cf6", "#c4b5fd"] },
    halloween: { light: ["#ffee4a", "#ffc501", "#fe9600", "#b33c00"], dark: ["#631c03", "#bd561d", "#fa7a18", "#fddf68"] },
    mono: { light: ["#d4d4d4", "#a3a3a3", "#525252", "#171717"], dark: ["#333333", "#5c5c5c", "#a3a3a3", "#fafafa"] },
    aurora: { light: ["#c8f7e4", "#6fe3c0", "#2bb3a3", "#0b5f66"], dark: ["#0b2f3a", "#0f6b6b", "#19c1a5", "#8affd8"] },
    candy: { light: ["#ffd9ec", "#ff9ec9", "#f2559c", "#a01060"], dark: ["#3d0e2a", "#8c1355", "#ef3d8f", "#ffb3d6"] },
}

export type PaletteInput = PaletteName | string[] | { light: string[]; dark: string[] }

const resolvePalette = (p: PaletteInput | undefined, dark: boolean): string[] => {
    const base = PALETTES.github[dark ? "dark" : "light"]
    const pick = Array.isArray(p)
        ? p
        : p && typeof p === "object"
            ? dark
                ? p.dark
                : p.light
            : (PALETTES[(p as PaletteName) ?? "github"] ?? PALETTES.github)[dark ? "dark" : "light"]
    return [0, 1, 2, 3].map((i) => pick[i] ?? pick[pick.length - 1] ?? base[i])
}

/* ============================================================================
   3 · BLOCKS & PROJECTION
   ========================================================================== */

export interface Box {
    /** Footprint min-corner in world space. */
    x: number
    y: number
    /** Footprint size. */
    w: number
    d: number
    /** Height (top of the block = z0 + h). */
    h: number
    /** Resting height, handy for animation. */
    h0?: number
    /** Base height — lets blocks stack into tiers. */
    z0?: number
    /** 0 = empty/base, 1–4 = palette index. */
    level: number
    /** Rotation of the footprint about its centre, radians. */
    rot?: number
    /** 0–1 additive highlight (used for "hot" blocks). */
    glow?: number
    key?: string
    label?: string
}

export const box = (
    x: number,
    y: number,
    w: number,
    d: number,
    h: number,
    level = 1,
    extra: Partial<Box> = {},
): Box => ({ x, y, w, d, h, h0: h, z0: 0, level, ...extra })

export interface View {
    cs: number
    sn: number
    se: number
    ce: number
    s: number
    ox: number
    oy: number
}

/** World (x → right, y → depth, z → up) → screen, before scale/offset. */
export const projectPoint = (v: View, x: number, y: number, z: number): [number, number] => [
    v.ox + (x * v.cs - y * v.sn) * v.s,
    v.oy + ((x * v.sn + y * v.cs) * v.se - z * v.ce) * v.s,
]

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

const quadPath = (ctx: CanvasRenderingContext2D, p: Float32Array, o: number, r = 0) => {
    if (r < 0.4) {
        ctx.moveTo(p[o], p[o + 1])
        ctx.lineTo(p[o + 2], p[o + 3])
        ctx.lineTo(p[o + 4], p[o + 5])
        ctx.lineTo(p[o + 6], p[o + 7])
        ctx.closePath()
        return
    }
    ctx.moveTo((p[o + 6] + p[o]) / 2, (p[o + 7] + p[o + 1]) / 2)
    for (let k = 0; k < 4; k++) {
        const b = (k + 1) % 4
        ctx.arcTo(p[o + k * 2], p[o + k * 2 + 1], p[o + b * 2], p[o + b * 2 + 1], r)
    }
    ctx.closePath()
}

/* ============================================================================
   4 · SCENE SPEC + ENGINE
   ========================================================================== */

export interface SceneSpec {
    boxes: Box[]
    /** Per-frame mutation hook. Keep t = 0 visually sane (reduced-motion friendly). */
    animate?: (boxes: Box[], t: number, dt: number) => void
    /** Extra painting after the blocks (grids, links, halos). */
    decor?: (ctx: CanvasRenderingContext2D, view: View, t: number) => void
    /** Columns used for keyboard up/down navigation. */
    navCols?: number
    pad?: number
    yaw?: number
    elev?: number
    zoom?: number
}

export interface BlockStageProps {
    title: React.ReactNode
    hint?: string
    spec: SceneSpec
    palette?: PaletteInput
    /** Radians per second of idle orbit. 0 disables. */
    autoRotate?: number
    orbit?: boolean
    height?: number
    legend?: boolean | string[]
    controls?: React.ReactNode
    onSelect?: (b: Box) => void
    format?: (b: Box) => string
    className?: string
}

const MUTED = "var(--color-muted-foreground, #8a8a8a)"

const DEFAULT_YAW = Math.PI / 4
const DEFAULT_ELEV = (35 * Math.PI) / 180

export function BlockStage({
    title,
    hint,
    spec,
    palette = "github",
    autoRotate = 0.16,
    orbit = true,
    height = 320,
    legend,
    controls,
    onSelect,
    format,
    className = "",
}: BlockStageProps) {
    const rootRef = React.useRef<HTMLElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const tipRef = React.useRef<HTMLDivElement>(null)
    const engineRef = React.useRef<{ load: () => void; kick: () => void; retheme: () => void } | null>(null)

    const [theme, setTheme] = React.useState<{ dark: boolean; swatches: string[]; accent: string }>({
        dark: false,
        swatches: [],
        accent: "#888",
    })
    const [active, setActive] = React.useState(-1)
    const [announce, setAnnounce] = React.useState("")
    const [legendLevel, setLegendLevel] = React.useState(-1)

    // Everything the render loop reads — refreshed every render so it never goes stale.
    const cfg = React.useRef({
        spec,
        palette,
        autoRotate,
        orbit,
        onSelect,
        legendLevel,
        format,
        setActive,
        setTheme,
        setAnnounce,
    })
    cfg.current = { spec, palette, autoRotate, orbit, onSelect, legendLevel, format, setActive, setTheme, setAnnounce }

    React.useEffect(() => {
        const root = rootRef.current
        const stage = stageRef.current
        const canvas = canvasRef.current
        const tip = tipRef.current
        if (!root || !stage || !canvas || !tip) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)")
        let reduced = reduceMq.matches

        /* ---- state ---- */
        let W = 0
        let H = 0
        let dpr = 1
        let yaw = 0
        let elev = 0
        let yawGoal = 0
        let elevGoal = 0
        let t = 0
        let last = 0
        let raf = 0
        let visible = true

        let n = 0
        let bx: Box[] = []
        let order: number[] = []
        let polys = new Float32Array(0)
        let depth = new Float32Array(0)
        let hov = new Float32Array(0)
        let dim = new Float32Array(0)

        // colours: [empty, l1, l2, l3, l4] × rgb, eased toward the goal
        const col = new Float32Array(15)
        const colGoal = new Float32Array(15)
        let colReady = false
        let fg: RGB = FG_FALLBACK
        let bg: RGB = BG_FALLBACK
        let isDark = false

        let hovered = -1
        let pinned = -1
        let activeIdx = -1
        let tipW = 0
        let view: View = { cs: 1, sn: 0, se: 1, ce: 0, s: 1, ox: 0, oy: 0 }

        /* ---- data ---- */
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
            if (hovered >= n) hovered = -1
            if (pinned >= n) pinned = -1
            t = 0
            kick()
        }

        /* ---- theming ---- */
        const retheme = () => {
            const cs = getComputedStyle(root)
            fg = toRGB(cs.color, FG_FALLBACK)
            const b = toRGB(cs.backgroundColor, [0, 0, 0])
            bg = b && b[0] + b[1] + b[2] > 0 ? b : BG_FALLBACK
            isDark = lum(bg) < 0.45
            const pal = resolvePalette(cfg.current.palette, isDark)
            const empty = mixRGB(bg, fg, isDark ? 0.12 : 0.08)
            const all: RGB[] = [empty, ...pal.map((c) => toRGB(c, FG_FALLBACK))]
            for (let k = 0; k < 5; k++) for (let ch = 0; ch < 3; ch++) colGoal[k * 3 + ch] = all[k][ch]
            if (!colReady || reduced) {
                col.set(colGoal)
                colReady = true
            }
            const sw = all.map((c) => css(c))
            cfg.current.setTheme((prev) => (prev.dark === isDark && prev.swatches.join() === sw.join() ? prev : { dark: isDark, swatches: sw, accent: sw[4] }))
            kick()
        }

        /* ---- layout ---- */
        const relayout = () => {
            const w = Math.round(stage.clientWidth)
            const h = Math.round(stage.clientHeight)
            if (!w || !h) return
            W = w
            H = h
            dpr = Math.min(2, window.devicePixelRatio || 1)
            canvas.width = Math.round(W * dpr)
            canvas.height = Math.round(H * dpr)
            canvas.style.width = W + "px"
            canvas.style.height = H + "px"
            draw()
        }

        /* ---- draw ---- */
        const draw = () => {
            if (!W || !H) return
            const sp = cfg.current.spec
            const yawA = clamp((sp.yaw ?? DEFAULT_YAW) + yaw, 0.06, Math.PI / 2 - 0.06)
            const elevA = clamp((sp.elev ?? DEFAULT_ELEV) + elev, 0.16, 1.24)
            const cs = Math.cos(yawA)
            const sn = Math.sin(yawA)
            const se = Math.sin(elevA)
            const ce = Math.cos(elevA)

            // ---- fit the scene -------------------------------------------------
            let minX = Infinity
            let maxX = -Infinity
            let minY = Infinity
            let maxY = -Infinity
            let maxZ = 0.001
            for (let i = 0; i < n; i++) {
                const b = bx[i]
                const cx = b.x + b.w / 2
                const cy = b.y + b.d / 2
                const rr = Math.hypot(b.w, b.d) / 2
                if (cx - rr < minX) minX = cx - rr
                if (cx + rr > maxX) maxX = cx + rr
                if (cy - rr < minY) minY = cy - rr
                if (cy + rr > maxY) maxY = cy + rr
                const top = (b.z0 ?? 0) + b.h
                if (top > maxZ) maxZ = top
            }
            if (!Number.isFinite(minX)) {
                minX = 0
                maxX = 1
                minY = 0
                maxY = 1
            }
            let sxMin = Infinity
            let sxMax = -Infinity
            let syMin = Infinity
            let syMax = -Infinity
            for (let k = 0; k < 8; k++) {
                const x = k & 1 ? maxX : minX
                const y = k & 2 ? maxY : minY
                const z = k & 4 ? maxZ : 0
                const px = x * cs - y * sn
                const py = (x * sn + y * cs) * se - z * ce
                if (px < sxMin) sxMin = px
                if (px > sxMax) sxMax = px
                if (py < syMin) syMin = py
                if (py > syMax) syMax = py
            }
            const pad = sp.pad ?? 24
            const bw = Math.max(1e-3, sxMax - sxMin)
            const bh = Math.max(1e-3, syMax - syMin)
            const s = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh) * (sp.zoom ?? 1)
            view = { cs, sn, se, ce, s, ox: (W - bw * s) / 2 - sxMin * s, oy: (H - bh * s) / 2 - syMin * s }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, W, H)

            // ---- depth sort ----------------------------------------------------
            for (let i = 0; i < n; i++) {
                const b = bx[i]
                depth[i] = (b.x + b.w / 2) * sn + (b.y + b.d / 2) * cs
            }
            order.sort((a, c) => depth[a] - depth[c])

            // ---- paint blocks --------------------------------------------------
            const px = (x: number, y: number) => view.ox + (x * cs - y * sn) * s
            const py = (x: number, y: number, z: number) => view.oy + ((x * sn + y * cs) * se - z * ce) * s
            const outline = Math.min(1, s * 0.02)

            for (let k = 0; k < n; k++) {
                const i = order[k]
                const b = bx[i]
                const z0 = b.z0 ?? 0
                const lift = 0.45 * hov[i]
                const z1 = z0 + b.h + lift
                if (b.h <= 0.002 && !b.glow) continue

                const cx = b.x + b.w / 2
                const cy = b.y + b.d / 2
                const rot = b.rot ?? 0
                const cr = Math.cos(rot)
                const sr = Math.sin(rot)
                const hw = b.w / 2
                const hd = b.d / 2
                const a0x = cx - hw * cr + hd * sr
                const a0y = cy - hw * sr - hd * cr
                const a1x = cx + hw * cr + hd * sr
                const a1y = cy + hw * sr - hd * cr
                const a2x = cx + hw * cr - hd * sr
                const a2y = cy + hw * sr + hd * cr
                const a3x = cx - hw * cr - hd * sr
                const a3y = cy - hw * sr + hd * cr

                const o = i * 24
                // top face
                polys[o] = px(a0x, a0y)
                polys[o + 1] = py(a0x, a0y, z1)
                polys[o + 2] = px(a1x, a1y)
                polys[o + 3] = py(a1x, a1y, z1)
                polys[o + 4] = px(a2x, a2y)
                polys[o + 5] = py(a2x, a2y, z1)
                polys[o + 6] = px(a3x, a3y)
                polys[o + 7] = py(a3x, a3y, z1)
                // +y face
                polys[o + 8] = px(a3x, a3y)
                polys[o + 9] = py(a3x, a3y, z0)
                polys[o + 10] = px(a2x, a2y)
                polys[o + 11] = py(a2x, a2y, z0)
                polys[o + 12] = polys[o + 4]
                polys[o + 13] = polys[o + 5]
                polys[o + 14] = polys[o + 6]
                polys[o + 15] = polys[o + 7]
                // +x face
                polys[o + 16] = px(a1x, a1y)
                polys[o + 17] = py(a1x, a1y, z0)
                polys[o + 18] = polys[o + 10]
                polys[o + 19] = polys[o + 11]
                polys[o + 20] = polys[o + 4]
                polys[o + 21] = polys[o + 5]
                polys[o + 22] = polys[o + 2]
                polys[o + 23] = polys[o + 3]

                // colour
                const L = clamp(Math.round(b.level), 0, 4) * 3
                let r = col[L]
                let g = col[L + 1]
                let bl = col[L + 2]
                const d = dim[i]
                if (d > 0.002) {
                    r += (col[0] - r) * 0.78 * d
                    g += (col[1] - g) * 0.78 * d
                    bl += (col[2] - bl) * 0.78 * d
                }
                const hv = hov[i]
                if (hv > 0.002) {
                    r += (fg[0] - r) * 0.18 * hv
                    g += (fg[1] - g) * 0.18 * hv
                    bl += (fg[2] - bl) * 0.18 * hv
                }
                if (b.glow) {
                    r += (255 - r) * b.glow * 0.65
                    g += (255 - g) * b.glow * 0.65
                    bl += (255 - bl) * b.glow * 0.65
                }
                const base: RGB = [r, g, bl]

                const tall = (z1 - z0) * ce * s
                if (tall > 0.3 && hw * cr * s > 0.2) {
                    ctx.beginPath()
                    quadPath(ctx, polys, o + 8)
                    ctx.fillStyle = css(shade(base, 0.84))
                    ctx.fill()
                }
                if (tall > 0.3 && hw * sn * s > 0.2) {
                    ctx.beginPath()
                    quadPath(ctx, polys, o + 16)
                    ctx.fillStyle = css(shade(base, 0.66))
                    ctx.fill()
                }

                ctx.beginPath()
                quadPath(ctx, polys, o, Math.min(3, s * Math.min(b.w, b.d) * 0.22))
                ctx.fillStyle = css(base)
                ctx.fill()

                if (outline > 0.02) {
                    ctx.strokeStyle = css(fg, 0.07)
                    ctx.lineWidth = 1
                    ctx.stroke()
                }
                if (hv > 0.02) {
                    ctx.strokeStyle = css(fg, 0.85 * hv)
                    ctx.lineWidth = 1.4
                    ctx.stroke()
                }
            }

            // ---- decoration ----------------------------------------------------
            cfg.current.spec.decor?.(ctx, view, t)

            // ---- tooltip -------------------------------------------------------
            if (activeIdx >= 0 && activeIdx < n) {
                const b = bx[activeIdx]
                const cx = b.x + b.w / 2
                const cy = b.y + b.d / 2
                const z1 = (b.z0 ?? 0) + b.h + 0.45
                const p = projectPoint(view, cx, cy, z1)
                const half = tipW / 2
                const tx = clamp(p[0], half + 4, W - half - 4)
                tip.style.transform = `translate(${(tx - half).toFixed(1)}px, ${(p[1] - 8).toFixed(1)}px) translateY(-100%)`
                tip.style.setProperty("--arrow", `${(p[0] - tx + half).toFixed(1)}px`)
            }
        }

        /* ---- loop ---------------------------------------------------------- */
        const tick = (now: number) => {
            raf = 0
            const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
            last = now
            let moving = false

            if (!reduced) {
                t += dt
                if (cfg.current.autoRotate && !dragging) {
                    yawGoal += cfg.current.autoRotate * dt
                    yawGoal = clamp(yawGoal, -0.6, 0.6)
                }
            }

            const ko = reduced ? 1 : 1 - Math.exp(-dt * 9)
            if (Math.abs(yawGoal - yaw) > 1e-4 || Math.abs(elevGoal - elev) > 1e-4) {
                yaw += (yawGoal - yaw) * ko
                elev += (elevGoal - elev) * ko
                moving = true
            } else {
                yaw = yawGoal
                elev = elevGoal
            }

            const kc = reduced ? 1 : 1 - Math.exp(-dt * 7)
            for (let k = 0; k < 15; k++) {
                const d = colGoal[k] - col[k]
                if (Math.abs(d) > 0.4) {
                    col[k] += d * kc
                    moving = true
                } else col[k] = colGoal[k]
            }

            const kh = reduced ? 1 : 1 - Math.exp(-dt * 14)
            const kd = reduced ? 1 : 1 - Math.exp(-dt * 11)
            const leg = cfg.current.legendLevel
            for (let i = 0; i < n; i++) {
                const hg = i === activeIdx ? 1 : 0
                const dg = leg >= 0 && bx[i].level !== leg ? 1 : 0
                const h = hov[i]
                const d = dim[i]
                if (h !== hg) {
                    hov[i] = Math.abs(hg - h) < 0.003 ? hg : h + (hg - h) * kh
                    moving = true
                }
                if (d !== dg) {
                    dim[i] = Math.abs(dg - d) < 0.003 ? dg : d + (dg - d) * kd
                    moving = true
                }
            }

            if (!reduced && cfg.current.spec.animate) {
                cfg.current.spec.animate(bx, t, dt)
                moving = true
            }

            draw()
            if (moving && visible) raf = requestAnimationFrame(tick)
        }

        const kick = () => {
            if (raf || !visible) return
            last = performance.now()
            raf = requestAnimationFrame(tick)
        }

        /* ---- interaction --------------------------------------------------- */
        const refreshActive = () => {
            const next = hovered >= 0 ? hovered : pinned
            if (next === activeIdx) return
            activeIdx = next
            cfg.current.setActive(next)
            if (next >= 0) {
                const b = bx[next]
                const txt = cfg.current.format?.(b) ?? b.label ?? b.key ?? ""
                cfg.current.setAnnounce(txt)
            }
            kick()
        }

        const hit = (x: number, y: number): number => {
            for (let k = n - 1; k >= 0; k--) {
                const i = order[k]
                const o = i * 24
                if (pointInQuad(polys, o, x, y) || pointInQuad(polys, o + 8, x, y) || pointInQuad(polys, o + 16, x, y)) return i
            }
            return -1
        }

        const local = (ev: PointerEvent) => {
            const r = canvas.getBoundingClientRect()
            return [ev.clientX - r.left, ev.clientY - r.top] as const
        }

        let dragging = false
        let drag: { id: number; x: number; y: number; yaw: number; elev: number; moved: boolean } | null = null

        const onDown = (ev: PointerEvent) => {
            if (ev.button !== 0 || !cfg.current.orbit) return
            drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, yaw: yawGoal, elev: elevGoal, moved: false }
            dragging = true
            try {
                canvas.setPointerCapture(ev.pointerId)
            } catch {
                /* capture is a nicety */
            }
        }

        const onMove = (ev: PointerEvent) => {
            if (drag && ev.pointerId === drag.id) {
                const dx = ev.clientX - drag.x
                const dy = ev.clientY - drag.y
                if (drag.moved || Math.hypot(dx, dy) > 4) {
                    drag.moved = true
                    yawGoal = clamp(drag.yaw + dx * 0.005, -0.6, 0.6)
                    elevGoal = clamp(drag.elev + dy * 0.004, -0.35, 0.6)
                    canvas.style.cursor = "grabbing"
                    hovered = -1
                    refreshActive()
                    kick()
                    return
                }
            }
            if (ev.pointerType !== "mouse") return
            const [x, y] = local(ev)
            const i = hit(x, y)
            if (i !== hovered) {
                hovered = i
                refreshActive()
            }
            canvas.style.cursor = cfg.current.orbit ? "grab" : i >= 0 ? "pointer" : "default"
        }

        const onUp = (ev: PointerEvent) => {
            if (!drag || ev.pointerId !== drag.id) {
                dragging = false
                return
            }
            const moved = drag.moved
            drag = null
            dragging = false
            if (canvas.hasPointerCapture(ev.pointerId)) canvas.releasePointerCapture(ev.pointerId)
            canvas.style.cursor = cfg.current.orbit ? "grab" : "default"
            if (moved) return
            const [x, y] = local(ev)
            const i = hit(x, y)
            pinned = i === pinned ? -1 : i
            if (ev.pointerType !== "mouse") hovered = -1
            refreshActive()
            if (i >= 0) cfg.current.onSelect?.(bx[i])
        }

        const onLeave = () => {
            if (drag) return
            hovered = -1
            refreshActive()
        }

        const onKey = (ev: KeyboardEvent) => {
            const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape", "Enter", " "]
            if (!keys.includes(ev.key) || !n) return
            ev.preventDefault()
            if (ev.key === "Escape") {
                pinned = -1
                hovered = -1
                refreshActive()
                return
            }
            const cols = Math.max(1, cfg.current.spec.navCols ?? 1)
            let i = pinned >= 0 ? pinned : activeIdx >= 0 ? activeIdx : n - 1
            if (ev.key === "Enter" || ev.key === " ") {
                cfg.current.onSelect?.(bx[i])
                return
            }
            if (pinned >= 0 || activeIdx >= 0) {
                if (ev.key === "ArrowLeft") i -= 1
                if (ev.key === "ArrowRight") i += 1
                if (ev.key === "ArrowUp") i -= cols
                if (ev.key === "ArrowDown") i += cols
                if (ev.key === "Home") i = 0
                if (ev.key === "End") i = n - 1
            }
            i = clamp(i, 0, n - 1)
            pinned = i
            hovered = -1
            refreshActive()
            cfg.current.setAnnounce(cfg.current.format?.(bx[i]) ?? bx[i].label ?? bx[i].key ?? "")
            kick()
        }

        const onBlur = () => {
            pinned = -1
            refreshActive()
        }

        /* ---- wiring -------------------------------------------------------- */
        load()
        retheme()
        relayout()

        const ro = new ResizeObserver(() => relayout())
        ro.observe(stage)

        const mo = new MutationObserver(retheme)
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })

        const onReduce = () => {
            reduced = reduceMq.matches
            kick()
        }
        reduceMq.addEventListener("change", onReduce)

        let io: IntersectionObserver | null = null
        if ("IntersectionObserver" in window) {
            io = new IntersectionObserver(
                (entries) => {
                    const wasVisible = visible
                    visible = entries.some((e) => e.isIntersecting)
                    if (visible && !wasVisible) kick()
                },
                { threshold: 0.05 },
            )
            io.observe(stage)
        }

        canvas.addEventListener("pointerdown", onDown)
        canvas.addEventListener("pointermove", onMove)
        canvas.addEventListener("pointerup", onUp)
        canvas.addEventListener("pointercancel", onLeave)
        canvas.addEventListener("pointerleave", onLeave)
        canvas.addEventListener("keydown", onKey)
        canvas.addEventListener("blur", onBlur)

        engineRef.current = {
            load: () => {
                load()
                retheme()
                relayout()
            },
            kick,
            retheme,
        }

        return () => {
            if (raf) cancelAnimationFrame(raf)
            ro.disconnect()
            mo.disconnect()
            io?.disconnect()
            reduceMq.removeEventListener("change", onReduce)
            canvas.removeEventListener("pointerdown", onDown)
            canvas.removeEventListener("pointermove", onMove)
            canvas.removeEventListener("pointerup", onUp)
            canvas.removeEventListener("pointercancel", onLeave)
            canvas.removeEventListener("pointerleave", onLeave)
            canvas.removeEventListener("keydown", onKey)
            canvas.removeEventListener("blur", onBlur)
            engineRef.current = null
        }
        // Engine is built once per mount; everything else flows through cfg.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    React.useLayoutEffect(() => {
        const tip = tipRef.current
        if (tip && active >= 0) {
            // nudge the engine so it re-anchors the tooltip with the new width
            engineRef.current?.kick()
        }
    }, [active])

    const activeBox = active >= 0 ? spec.boxes[active] : null
    const tipText = activeBox ? (format?.(activeBox) ?? activeBox.label ?? activeBox.key ?? "") : ""
    const levelNames = ["Base", "Light", "Medium", "Heavy", "Peak"]

    return (
        <section
            ref={rootRef}
            className={"relative w-full overflow-hidden rounded-xl border font-sans " + className}
            style={{
                background: "var(--color-background, #ffffff)",
                color: "var(--color-foreground, #171717)",
                borderColor: "var(--color-border, #e5e5e5)",
            }}
        >
            <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pt-3 pb-1">
                <h3 className="m-0 text-[13px] leading-snug font-medium tracking-tight">{title}</h3>
                {controls ? <div className="flex items-center gap-1.5">{controls}</div> : null}
            </header>

            <div ref={stageRef} className="relative w-full" style={{ height }}>
                <canvas
                    ref={canvasRef}
                    tabIndex={0}
                    role="img"
                    aria-label={typeof title === "string" ? `${title}. Interactive 3D block chart. Use arrow keys to explore.` : "Interactive 3D block chart."}
                    className="absolute inset-0 block outline-none"
                    style={{ maxWidth: "none", touchAction: orbit ? "none" : "auto" }}
                />

                <div
                    ref={tipRef}
                    role="tooltip"
                    aria-hidden={active < 0}
                    className="pointer-events-none absolute top-0 left-0 z-20 rounded-md px-2.5 py-1.5 text-[11.5px] leading-none whitespace-nowrap shadow-lg transition-opacity duration-150 motion-reduce:transition-none"
                    style={{
                        opacity: active >= 0 ? 1 : 0,
                        background: "var(--color-foreground, #171717)",
                        color: "var(--color-background, #ffffff)",
                    }}
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
                            borderTop: "5px solid var(--color-foreground, #171717)",
                        }}
                    />
                </div>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pt-1 pb-3 text-[11px]" style={{ color: MUTED }}>
                <span className="min-w-0 flex-1 truncate">{hint ?? "Drag to orbit · hover a block · arrow keys to explore"}</span>
                {legend ? (
                    <div className="flex items-center gap-1.5" onMouseLeave={() => setLegendLevel(-1)}>
                        <span className="mr-0.5">Less</span>
                        {theme.swatches.map((c, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Highlight ${levelNames[i].toLowerCase()} blocks`}
                                aria-pressed={legendLevel === i}
                                title={levelNames[i]}
                                onMouseEnter={() => setLegendLevel(i)}
                                onFocus={() => setLegendLevel(i)}
                                onBlur={() => setLegendLevel(-1)}
                                onClick={() => setLegendLevel((l) => (l === i ? -1 : i))}
                                className="h-[11px] w-[11px] cursor-pointer rounded-[2px] border-0 p-0 transition-transform duration-300 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-1 motion-reduce:transition-none"
                                style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.14)" }}
                            />
                        ))}
                        <span className="ml-0.5">More</span>
                    </div>
                ) : null}
            </footer>

            <p aria-live="polite" className="sr-only">
                {announce}
            </p>
        </section>
    )
}

/* ============================================================================
   5 · SHARED BUILD HELPERS
   ========================================================================== */

/** Quantise a 0–1 value into palette levels 1–4. */
const lv = (v: number, peak = 0.72) => (v <= 0.001 ? 0 : v >= peak ? 4 : v > peak * 0.66 ? 3 : v > peak * 0.33 ? 2 : 1)

/** Small ghost button used by components that need a mode switch. */
function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={!!active}
            className="cursor-pointer rounded-md border px-2 py-[3px] text-[11px] leading-none transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
                borderColor: "var(--color-border, #e5e5e5)",
                background: active ? "var(--color-foreground, #171717)" : "transparent",
                color: active ? "var(--color-background, #ffffff)" : MUTED,
            }}
        >
            {children}
        </button>
    )
}

/* ============================================================================
   6 · CATEGORY A — TEMPORAL & ACTIVITY
   ========================================================================== */

/** 1 · A day of focus extruded around a 24-hour ring. */
export function CircadianRing() {
    const boxes = React.useMemo(() => {
        const r = rng(11)
        const out: Box[] = []
        for (let hr = 0; hr < 24; hr++) {
            const a = (hr / 24) * TAU - Math.PI / 2
            const base = hr >= 9 && hr <= 12 ? 0.92 : hr >= 14 && hr <= 18 ? 0.78 : hr >= 20 || hr <= 5 ? 0.08 : 0.4
            for (let k = 0; k < 3; k++) {
                const rad = 5.4 + k * 1.55
                const v = clamp01(base * (0.6 + r() * 0.5) - k * 0.11)
                out.push(
                    box(Math.cos(a) * rad - 0.5, Math.sin(a) * rad - 0.5, 1, 1, 0.22 + v * 5.4, lv(v), {
                        rot: a,
                        key: `${hr}:00`,
                        label: `${String(hr).padStart(2, "0")}:00 — ${Math.round(v * 100)}% focus`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="24-hour circadian ring"
            hint="Hover an hour · the ring is a day, extruded"
            palette="aurora"
            spec={{ boxes, navCols: 3, pad: 30 }}
            legend
        />
    )
}

/** 2 · Deep work vs. meeting overhead, two layered rows. */
export function WorkLifeWave() {
    const [mode, setMode] = React.useState<"focus" | "overhead">("focus")
    const boxes = React.useMemo(() => {
        const r = rng(23)
        const out: Box[] = []
        for (let d = 0; d < 14; d++) {
            const focus = 0.3 + r() * 0.7
            const meet = 0.2 + r() * 0.65
            const front = mode === "focus" ? focus : meet
            const back = mode === "focus" ? meet : focus
            out.push(
                box(d * 1.32, 0, 1, 1, 0.3 + front * 6.6, lv(front), {
                    key: `d${d}-a`,
                    label: `Day ${d + 1} — ${mode === "focus" ? "deep work" : "overhead"} ${(front * 8).toFixed(1)}h`,
                }),
            )
            out.push(
                box(d * 1.32, 1.75, 1, 1, 0.25 + back * 3.4, lv(back, 0.6), {
                    key: `d${d}-b`,
                    label: `Day ${d + 1} — ${mode === "focus" ? "meetings" : "deep work"} ${(back * 8).toFixed(1)}h`,
                }),
            )
        }
        return out
    }, [mode])
    return (
        <BlockStage
            title="Work / life balance wave"
            hint="Toggle the layer that leads"
            palette="ocean"
            spec={{ boxes, navCols: 2, zoom: 0.95 }}
            legend
            controls={
                <>
                    <Chip active={mode === "focus"} onClick={() => setMode("focus")}>
                        Focus
                    </Chip>
                    <Chip active={mode === "overhead"} onClick={() => setMode("overhead")}>
                        Overhead
                    </Chip>
                </>
            }
        />
    )
}

/** 3 · Years folded into stacked mountain ridges. */
export function MilestoneRange() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let yr = 0; yr < 5; yr++) {
            for (let i = 0; i < 26; i++) {
                const peak = Math.exp(-Math.pow(i - (4 + yr * 4.4), 2) / (2 * 3.1 * 3.1))
                const h = 0.3 + peak * (5.5 + yr * 0.55) + fbm(i * 0.22, yr * 3.1, 2) * 1.7
                out.push(
                    box(i * 1.02, yr * 2.3, 0.94, 0.94, h, lv(h / 8), {
                        key: `${2021 + yr}-${i}`,
                        label: `${2021 + yr} · week ${i + 1} — peak ${(h * 1.4).toFixed(1)}`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Decade milestone range"
            hint="Each ridge is a year · taller peaks are bigger milestones"
            palette="ember"
            spec={{ boxes, navCols: 26, zoom: 0.92, elev: 0.62 }}
            legend
        />
    )
}

/** 4 · Four seasons as an undulating topological terrain. */
export function SeasonTerrain() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        const N = 22
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const n = fbm(i * 0.16, j * 0.16, 3)
                const season = Math.sin((i / N) * TAU) * 0.5 + 0.5
                const h = 0.2 + (n * 0.75 + season * 0.35) * 5.2
                const level = lv(clamp01(season * 0.7 + n * 0.4), 0.85)
                out.push(
                    box(i * 1.02, j * 1.02, 0.95, 0.95, h, level, {
                        key: `${i},${j}`,
                        label: `${["Winter", "Spring", "Summer", "Autumn"][Math.min(3, Math.floor((i / N) * 4))]} · elevation ${h.toFixed(1)}`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Seasonality heat terrain"
            hint="Left → right runs winter to autumn"
            palette="github"
            spec={{ boxes, navCols: 22, pad: 18, zoom: 0.96, elev: 0.7 }}
            legend
        />
    )
}

/* ============================================================================
   7 · CATEGORY B — DEVELOPER & ENGINEERING
   ========================================================================== */

/** 5 · Repos stacked along depth, commits across, merges as height. */
export function CommitMatrix() {
    const boxes = React.useMemo(() => {
        const r = rng(41)
        const out: Box[] = []
        for (let repo = 0; repo < 7; repo++) {
            for (let w = 0; w < 22; w++) {
                const v = clamp01(fbm(w * 0.24, repo * 5.5, 2) * 1.5 - 0.15 + r() * 0.18)
                out.push(
                    box(w * 1.04, repo * 1.6, 0.92, 0.92, 0.22 + v * 5.6, lv(v), {
                        key: `r${repo}w${w}`,
                        label: `repo-${repo + 1} · wk ${w + 1} — ${Math.round(v * 42)} commits`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Git branch commit matrix"
            hint="Depth = repository · height = merge velocity"
            palette="grape"
            spec={{ boxes, navCols: 22, zoom: 0.94 }}
            legend
        />
    )
}

/** 6 · A file tree where size, complexity and coverage all show. */
export function ComplexitySpire() {
    const boxes = React.useMemo(() => {
        const r = rng(67)
        const out: Box[] = []
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const size = fbm(i * 0.3, j * 0.3, 2)
                const complexity = r()
                const coverage = clamp01(1 - complexity * 0.85 + r() * 0.2)
                const h = 0.25 + size * complexity * 8.5
                out.push(
                    box(i * 1.1, j * 1.1, 0.7 + complexity * 0.5, 0.7 + complexity * 0.5, h, lv(coverage, 0.9), {
                        key: `${i}-${j}`,
                        label: `module-${i}.${j} — ${Math.round(h * 120)} LOC · ${Math.round(coverage * 100)}% covered`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Code complexity spire"
            hint="Height = size · footprint = cyclomatic load · colour = test coverage"
            palette="ocean"
            spec={{ boxes, navCols: 9, zoom: 0.94, pad: 26 }}
            legend
        />
    )
}

/** 7 · Server fleet, breathing with throughput, flashing on latency. */
export function UptimeMonolith() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 10; j++) {
                const base = 1.5 + fbm(i * 0.4, j * 0.4, 2) * 5
                out.push(box(i * 1.05, j * 1.05, 0.9, 0.9, base, lv(base / 7), { key: `${i}-${j}`, label: `node-${i}-${j}` }))
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const i = Math.round(b.x)
            const j = Math.round(b.y)
            const beat = 0.72 + 0.28 * Math.sin(t * 1.9 + i * 0.8 + j * 0.5)
            const spike = Math.max(0, Math.sin(t * 0.7 + i * 2.3 + j * 1.7) - 0.93) * 14
            b.h = (b.h0 ?? b.h) * beat + spike
            b.glow = spike > 0.2 ? Math.min(1, spike * 0.5) : 0
            b.level = spike > 0.2 ? 4 : beat > 0.9 ? 3 : beat > 0.82 ? 2 : 1
        }
    }, [])
    return (
        <BlockStage
            title="Server uptime & latency monolith"
            hint="Blocks breathe with throughput · bright spikes are latency alerts"
            palette="ember"
            spec={{ boxes, animate, navCols: 16, zoom: 0.92 }}
            legend
        />
    )
}

/** 8 · A stepped dependency pyramid, core packages at the base. */
export function DependencyPyramid() {
    const boxes = React.useMemo(() => {
        const r = rng(83)
        const out: Box[] = []
        for (let tier = 0; tier < 9; tier++) {
            const size = 9 - tier
            const off = tier * 0.55
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const edge = i === 0 || j === 0 || i === size - 1 || j === size - 1
                    if (!edge) continue
                    const v = 0.4 + r() * 0.6
                    out.push(
                        box(i + off, j + off, 0.92, 0.92, 0.35 + v * 1.4, lv(v, 0.8), {
                            z0: tier * 0.62,
                            key: `${tier}-${i}-${j}`,
                            label: `Tier ${tier} — ${Math.max(1, 9 - tier)} dependents`,
                        }),
                    )
                }
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Package dependency pyramid"
            hint="Base = core packages · each tier up is a layer of transitive deps"
            palette="mono"
            spec={{ boxes, navCols: 5, pad: 28, zoom: 0.92, elev: 0.5 }}
            legend
        />
    )
}

/* ============================================================================
   8 · CATEGORY C — PRODUCTIVITY & GROWTH
   ========================================================================== */

/** 9 · Habits as tiered rings inside a coliseum. */
export function HabitAmphitheater() {
    const boxes = React.useMemo(() => {
        const r = rng(97)
        const out: Box[] = []
        for (let tier = 0; tier < 8; tier++) {
            const rad = 2.4 + tier * 1.45
            const count = 10 + tier * 2
            for (let i = 0; i < count; i++) {
                const a = (i / count) * TAU
                const v = clamp01(fbm(i * 0.5, tier * 2.2, 2) + r() * 0.25)
                out.push(
                    box(Math.cos(a) * rad - 0.45, Math.sin(a) * rad - 0.45, 0.9, 0.9, 0.3 + v * 3.2, lv(v), {
                        rot: a,
                        z0: tier * 0.52,
                        key: `${tier}-${i}`,
                        label: `Tier ${tier + 1} · habit ${i + 1} — ${Math.round(v * 100)}% complete`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Habit streak amphitheater"
            hint="Tiers rise toward the goal ring at the centre"
            palette="candy"
            spec={{ boxes, navCols: 12, pad: 30, elev: 0.52 }}
            legend
        />
    )
}

/** 10 · Focus sessions filling a workday, hour by hour. */
export function PomodoroSkyline() {
    const boxes = React.useMemo(() => {
        const r = rng(113)
        const out: Box[] = []
        for (let hr = 0; hr < 12; hr++) {
            for (let q = 0; q < 4; q++) {
                const v = clamp01(0.25 + r() * 0.75)
                out.push(
                    box(hr * 1.05, q * 1.05, 0.9, 0.9, 0.2 + v * 4.6, lv(v), {
                        key: `${hr}-${q}`,
                        label: `${9 + hr}:${String(q * 15).padStart(2, "0")} — session ${q + 1}`,
                    }),
                )
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        const cycle = 11
        const p = ((t * 0.55) % cycle) / cycle
        for (let i = 0; i < bs.length; i++) {
            const b = bs[i]
            const local = clamp01((p * bs.length - i) / 4)
            b.h = (b.h0 ?? b.h) * (0.15 + 0.85 * local)
            b.level = lv(local, 0.85)
        }
    }, [])
    return (
        <BlockStage
            title="Pomodoro focus skyline"
            hint="Sessions fill left to right through the workday"
            palette="ember"
            spec={{ boxes, animate, navCols: 4, zoom: 0.95 }}
            legend
        />
    )
}

/** 11 · Personal energy as a smooth topographic wave. */
export function EnergyTopography() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        const N = 24
        const M = 15
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < M; j++) {
                const wave = Math.sin(i * 0.45) * 0.5 + Math.cos(j * 0.4) * 0.3
                const n = fbm(i * 0.2, j * 0.2, 3)
                const v = clamp01(0.5 + wave * 0.35 + n * 0.4 - 0.2)
                out.push(
                    box(i * 1.03, j * 1.03, 0.95, 0.95, 0.15 + v * 5.2, lv(v, 0.85), {
                        key: `${i}-${j}`,
                        label: `Day ${i + 1} · slot ${j + 1} — energy ${Math.round(v * 100)}`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Energy level topography"
            hint="Weeks across · days of the week into depth"
            palette="aurora"
            spec={{ boxes, navCols: 15, pad: 18, elev: 0.68 }}
            legend
        />
    )
}

/** 12 · Thirty days as an ascending staircase of micro-goals. */
export function StreakLadder() {
    const boxes = React.useMemo(() => {
        const r = rng(131)
        const out: Box[] = []
        for (let i = 0; i < 30; i++) {
            const v = clamp01(0.35 + r() * 0.65)
            out.push(
                box(i * 1.18, 0, 1, 1, 0.4 + v * 1.2, lv(v, 0.85), {
                    z0: i * 0.42,
                    key: `s${i}`,
                    label: `Day ${i + 1} — streak step ${i + 1}`,
                }),
            )
            out.push(
                box(i * 1.18, 1.6, 1, 1, 0.3 + v * 0.8, lv(v * 0.7, 0.85), {
                    z0: i * 0.42,
                    key: `b${i}`,
                    label: `Day ${i + 1} — supporting task`,
                }),
            )
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Micro-goal step pyramid"
            hint="Every completed day lifts the next tier"
            palette="grape"
            spec={{ boxes, navCols: 2, zoom: 0.9, elev: 0.46, pad: 26 }}
            legend
        />
    )
}

/* ============================================================================
   9 · CATEGORY D — FINANCIAL & GROWTH
   ========================================================================== */

/** 13 · Assets as towers, footprint by risk, height by valuation. */
export function PortfolioCity() {
    const boxes = React.useMemo(() => {
        const r = rng(149)
        const out: Box[] = []
        for (let i = 0; i < 12; i++) {
            const risk = r()
            const value = clamp01(0.2 + r() * 0.8)
            const w = 1.5 - risk * 0.8
            out.push(
                box(i * 1.65, risk * 1.6, w, w, 0.4 + value * 8.5, lv(risk, 0.95), {
                    key: `asset-${i}`,
                    label: `Asset ${i + 1} — ${(value * 100).toFixed(0)}% allocation · risk ${(risk * 10).toFixed(1)}`,
                }),
            )
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Portfolio allocation city"
            hint="Tall = valuable · wide = defensive · colour = risk"
            palette="ocean"
            spec={{ boxes, navCols: 4, zoom: 0.9, pad: 26 }}
            legend
        />
    )
}

/** 14 · MRR growth as a wave that sweeps into a financial cliff. */
export function RevenueVelocity() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let m = 0; m < 48; m++) {
            const growth = Math.pow(m / 47, 2.4)
            const wave = Math.sin(m * 0.55) * 0.14
            const v = clamp01(growth + wave * growth)
            out.push(
                box(m * 1.02, 0, 0.94, 3, 0.25 + v * 9, lv(v, 0.9), {
                    key: `m${m}`,
                    label: `Month ${m + 1} — $${(v * 240).toFixed(1)}k MRR`,
                }),
            )
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let i = 0; i < bs.length; i++) {
            const b = bs[i]
            const wave = Math.exp(-Math.pow((i - ((t * 9) % (bs.length + 16)) + 8) / 4.2, 2))
            b.glow = wave * 0.55
            b.h = (b.h0 ?? b.h) * (1 + wave * 0.06)
        }
    }, [])
    return (
        <BlockStage
            title="Revenue velocity terrain"
            hint="Flat 2D growth sweeping into a 3D revenue cliff"
            palette="aurora"
            spec={{ boxes, animate, navCols: 1, zoom: 0.9, yaw: 0.55, elev: 0.42 }}
            legend
        />
    )
}

/** 15 · Payments landing as liquidity ripples. Tap to drop a new one. */
export function TransactionFlow() {
    const ripples = React.useRef<{ x: number; y: number; t: number }[]>([])
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 15; j++) out.push(box(i * 1.03, j * 1.03, 0.94, 0.94, 0.3, 1, { key: `${i}-${j}` }))
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number, dt: number) => {
        const rs = ripples.current
        for (let i = rs.length - 1; i >= 0; i--) {
            rs[i].t += dt
            if (rs[i].t > 2.8) rs.splice(i, 1)
        }
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const i = Math.round(b.x)
            const j = Math.round(b.y)
            let v = 0.18 + 0.16 * Math.sin(t * 1.4 + i * 0.4 + j * 0.3)
            for (const rp of rs) {
                const d = Math.hypot(i - rp.x, j - rp.y)
                const ring = Math.exp(-Math.pow((d - rp.t * 7) / 1.7, 2)) * Math.max(0, 1 - rp.t / 2.8)
                v += ring * 1.7
            }
            const c = clamp01(v)
            b.h = 0.25 + c * 5.6
            b.glow = c > 0.8 ? (c - 0.8) * 2 : 0
            b.level = lv(c, 0.85)
        }
    }, [])
    return (
        <BlockStage
            title="Transaction flow matrix"
            hint="Click any block to drop a liquidity ripple"
            palette="github"
            spec={{ boxes, animate, navCols: 24, pad: 18, elev: 0.62 }}
            legend
            onSelect={(b) => ripples.current.push({ x: Math.round(b.x), y: Math.round(b.y), t: 0 })}
        />
    )
}

/* ============================================================================
   10 · CATEGORY E — EXPERIMENTAL & ARTISTIC
   ========================================================================== */

/** 16 · A spectrum analyser you can wire to a real microphone. */
export function FrequencyGrid() {
    const [mic, setMic] = React.useState(false)
    const levels = React.useRef(new Float32Array(32))

    React.useEffect(() => {
        if (!mic) return
        let audio: AudioContext | null = null
        let stream: MediaStream | null = null
        let raf = 0
        let cancelled = false
            ; (async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                    if (cancelled) {
                        stream.getTracks().forEach((tr) => tr.stop())
                        return
                    }
                    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
                    audio = new AC()
                    const src = audio.createMediaStreamSource(stream)
                    const an = audio.createAnalyser()
                    an.fftSize = 256
                    an.smoothingTimeConstant = 0.78
                    src.connect(an)
                    const buf = new Uint8Array(an.frequencyBinCount)
                    const loop = () => {
                        if (cancelled) return
                        an.getByteFrequencyData(buf)
                        const L = levels.current
                        for (let i = 0; i < L.length; i++) {
                            const v = (buf[Math.floor((i / L.length) * buf.length)] ?? 0) / 255
                            L[i] = L[i] * 0.55 + v * 0.45
                        }
                        raf = requestAnimationFrame(loop)
                    }
                    loop()
                } catch {
                    setMic(false)
                }
            })()
        return () => {
            cancelled = true
            cancelAnimationFrame(raf)
            stream?.getTracks().forEach((tr) => tr.stop())
            audio?.close()
        }
    }, [mic])

    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let band = 0; band < 32; band++) {
            for (let row = 0; row < 3; row++) {
                out.push(box(band * 0.78, row * 0.92, 0.66, 0.78, 0.3, 2, { key: `${band}-${row}` }))
            }
        }
        return out
    }, [])

    const animate = React.useCallback((bs: Box[], t: number) => {
        const L = levels.current
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const band = Math.round(b.x / 0.78)
            const row = Math.round(b.y / 0.92)
            const fallback = Math.pow(Math.sin(t * 2.2 + band * 0.28) * 0.5 + 0.5, 2.2) * Math.exp(-band * 0.05)
            const v = clamp01(mic ? L[band] * (1 - row * 0.22) : fallback * (1 - row * 0.2))
            b.h = 0.25 + v * 8.5
            b.glow = v > 0.72 ? (v - 0.72) * 1.6 : 0
            b.level = lv(v, 0.8)
        }
    }, [mic])

    return (
        <BlockStage
            title="Sound frequency equalizer grid"
            hint={mic ? "Live microphone input" : "Simulated spectrum — switch to live mic"}
            palette="candy"
            spec={{ boxes, animate, navCols: 3, zoom: 0.92, pad: 24, elev: 0.4 }}
            legend
            controls={
                <Chip active={mic} onClick={() => setMic((m) => !m)}>
                    {mic ? "Mic on" : "Use mic"}
                </Chip>
            }
        />
    )
}

/** 17 · Neuron activations as glowing voxel clusters. */
export function NeuralMatrix() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                for (let z = 0; z < 3; z++) {
                    if (fbm(x * 0.4, y * 0.4 + z * 9, 2) < 0.42) continue
                    out.push(box(x * 1.05, y * 1.05, 0.9, 0.9, 0.9, 1, { z0: z * 1.0, key: `${x}-${y}-${z}` }))
                }
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const x = Math.round(b.x / 1.05)
            const y = Math.round(b.y / 1.05)
            const z = Math.round((b.z0 ?? 0) / 1.0)
            const wave = Math.sin(t * 1.3 - (x + y) * 0.42 + z * 0.8) * 0.5 + 0.5
            const a = clamp01(Math.pow(wave, 3.2))
            b.h = 0.25 + a * 3.4
            b.glow = a * 0.75
            b.level = a > 0.72 ? 4 : a > 0.45 ? 3 : a > 0.2 ? 2 : 1
        }
    }, [])
    return (
        <BlockStage
            title="Neural network activation matrix"
            hint="Activation waves ripple through the embedding space"
            palette="grape"
            spec={{ boxes, animate, navCols: 10, pad: 26, elev: 0.58 }}
            legend
        />
    )
}

/** 18 · Falling data columns that solidify under the cursor. */
export function DigitalRain() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let col = 0; col < 22; col++) {
            for (let depth = 0; depth < 6; depth++) {
                for (let seg = 0; seg < 5; seg++) {
                    out.push(box(col * 1.05, depth * 1.05, 0.92, 0.92, 1.1, 1, { z0: seg * 1.15, key: `${col}-${depth}-${seg}` }))
                }
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const col = Math.round(b.x / 1.05)
            const seg = Math.round((b.z0 ?? 0) / 1.15)
            const speed = 1.4 + (col % 5) * 0.32
            const head = ((t * speed + col * 0.9) % 9)
            const d = Math.abs(seg - head)
            const v = clamp01(1 - d / 2.6)
            b.h = 0.3 + v * 2.2
            b.glow = v * 0.6
            b.level = v > 0.75 ? 4 : v > 0.5 ? 3 : v > 0.25 ? 2 : 1
        }
    }, [])
    return (
        <BlockStage
            title="Matrix digital rain monolith"
            hint="Data streams descend · hover a column to hold it"
            palette="aurora"
            spec={{ boxes, animate, navCols: 5, zoom: 0.88, pad: 26, elev: 0.5 }}
            legend
        />
    )
}

/** 19 · A lattice of nodes and links, pulsing like a constellation. */
export function ConstellationLattice() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        const N = 7
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                for (let z = 0; z < N; z++) {
                    if ((x + y + z) % 2 !== 0) continue
                    out.push(box(x * 1.5, y * 1.5, 0.44, 0.44, 0.44, 2, { z0: z * 1.5 + 0.2, key: `${x}-${y}-${z}` }))
                }
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const x = Math.round(b.x / 1.5)
            const y = Math.round(b.y / 1.5)
            const z = Math.round(((b.z0 ?? 0) - 0.2) / 1.5)
            const p = clamp01(Math.sin(t * 1.1 - (x + y + z) * 0.5) * 0.5 + 0.5)
            b.h = 0.35 + p * 1.9
            b.glow = p * 0.5
            b.level = p > 0.7 ? 4 : p > 0.42 ? 3 : 2
        }
    }, [])
    const decor = React.useCallback((ctx: CanvasRenderingContext2D, view: View) => {
        ctx.save()
        ctx.strokeStyle = "rgba(127,127,127,0.16)"
        ctx.lineWidth = 1
        ctx.beginPath()
        const N = 7
        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                for (let z = 0; z < N; z++) {
                    if ((x + y + z) % 2 !== 0) continue
                    const p = projectPoint(view, x * 1.5 + 0.22, y * 1.5 + 0.22, z * 1.5 + 0.7)
                    for (const [dx, dy, dz] of [
                        [1, 1, 0],
                        [0, 1, 1],
                        [1, 0, 1],
                    ]) {
                        const nx = x + dx
                        const ny = y + dy
                        const nz = z + dz
                        if (nx >= N || ny >= N || nz >= N) continue
                        if ((nx + ny + nz) % 2 !== 0) continue
                        const q = projectPoint(view, nx * 1.5 + 0.22, ny * 1.5 + 0.22, nz * 1.5 + 0.7)
                        ctx.moveTo(p[0], p[1])
                        ctx.lineTo(q[0], q[1])
                    }
                }
            }
        }
        ctx.stroke()
        ctx.restore()
    }, [])
    return (
        <BlockStage
            title="Constellation lattice"
            hint="Nodes pulse in a diagonal wave through the lattice"
            palette="ocean"
            spec={{ boxes, animate, decor, navCols: 4, pad: 30, elev: 0.6 }}
            legend
        />
    )
}

/** 20 · A city grid where hot spots glow like a thermal scan. */
export function HeatIslandCity() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        const hot = [
            [4, 9],
            [14, 5],
            [10, 13],
        ]
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 17; j++) {
                const street = i % 4 === 0 || j % 4 === 0 ? 0 : 1
                const n = fbm(i * 0.22, j * 0.22, 2)
                const heat = hot.reduce((acc, [hx, hy]) => acc + Math.exp(-((i - hx) ** 2 + (j - hy) ** 2) / 22), 0)
                const v = clamp01(n * 0.55 + heat * 0.7)
                out.push(
                    box(i * 1.05, j * 1.05, 0.5 + street * 0.42, 0.5 + street * 0.42, 0.3 + (street ? v * 5.4 : 0.25), lv(v, 0.7), {
                        glow: heat > 0.55 ? Math.min(0.9, (heat - 0.55) * 1.4) : 0,
                        key: `${i}-${j}`,
                        label: `Block ${i}-${j} — heat index ${(v * 100).toFixed(0)}`,
                    }),
                )
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            if (!b.glow) continue
            b.glow = clamp01(b.glow + Math.sin(t * 2 + k) * 0.12)
        }
    }, [])
    return (
        <BlockStage
            title="Heat island city"
            hint="Hotspots glow and breathe with the thermal load"
            palette="ember"
            spec={{ boxes, animate, navCols: 20, pad: 20, elev: 0.66 }}
            legend
        />
    )
}

/** 21 · A year unspooled into a spiralling calendar. */
export function CalendarSpiral() {
    const boxes = React.useMemo(() => {
        const r = rng(211)
        const out: Box[] = []
        const DAYS = 365
        for (let d = 0; d < DAYS; d++) {
            const p = d / DAYS
            const a = p * TAU * 5.5
            const rad = 2 + p * 12
            const v = clamp01(0.15 + Math.abs(Math.sin(p * 22)) * 0.4 + r() * 0.5)
            out.push(
                box(Math.cos(a) * rad - 0.35, Math.sin(a) * rad - 0.35, 0.7, 0.7, 0.2 + v * 4.6, lv(v, 0.82), {
                    rot: a,
                    key: `d${d}`,
                    label: `Day ${d + 1} — ${Math.round(v * 30)} contributions`,
                }),
            )
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Calendar spiral"
            hint="365 days wound outward from January to December"
            palette="github"
            spec={{ boxes, navCols: 1, pad: 30, elev: 0.6 }}
            legend
        />
    )
}

/** 22 · Growth rings — each square ring is a year, each block a month. */
export function GrowthRings() {
    const boxes = React.useMemo(() => {
        const r = rng(233)
        const out: Box[] = []
        for (let ring = 0; ring < 9; ring++) {
            const size = 4 + ring * 2
            const base = ring * 0.5
            for (let i = 0; i < size * 4; i++) {
                const side = Math.floor(i / size)
                const idx = i % size
                let x = 0
                let y = 0
                if (side === 0) {
                    x = idx
                    y = 0
                } else if (side === 1) {
                    x = size - 1
                    y = idx
                } else if (side === 2) {
                    x = size - 1 - idx
                    y = size - 1
                } else {
                    x = 0
                    y = size - 1 - idx
                }
                const v = clamp01(0.3 + r() * 0.7)
                out.push(
                    box(x * 1.02 - 8 + ring * 0.0, y * 1.02 - 8, 0.94, 0.94, 0.3 + v * 1.6 + ring * 0.25, lv(v, 0.85), {
                        z0: base,
                        key: `${ring}-${i}`,
                        label: `Year ${ring + 1} · month ${(idx % 12) + 1} — growth ${(v * 100).toFixed(0)}%`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Growth rings"
            hint="Each ring is a year · each block a month of expansion"
            palette="github"
            spec={{ boxes, navCols: 12, pad: 26, elev: 0.62, zoom: 0.95 }}
            legend
        />
    )
}

/** 23 · A core monolith with satellites in orbit. */
export function OrbitCore() {
    const boxes = React.useMemo(() => {
        const out: Box[] = [box(-1.4, -1.4, 2.8, 2.8, 11, 4, { key: "core", label: "Core service — 11 units of load" })]
        for (let ring = 1; ring <= 4; ring++) {
            const count = 4 + ring * 3
            for (let i = 0; i < count; i++) {
                out.push(
                    box(0, 0, 0.7, 0.7, 0.7 + (4 - ring) * 0.5, lv(1 - ring / 5, 0.85), {
                        key: `s${ring}-${i}`,
                        label: `Orbit ${ring} · satellite ${i + 1}`,
                    }),
                )
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        let idx = 1
        for (let ring = 1; ring <= 4; ring++) {
            const count = 4 + ring * 3
            const speed = 0.55 - ring * 0.07
            const rad = 4 + ring * 2.5
            for (let i = 0; i < count; i++) {
                const b = bs[idx++]
                if (!b) return
                const a = (i / count) * TAU + t * speed
                b.x = Math.cos(a) * rad - 0.35
                b.y = Math.sin(a) * rad - 0.35
                b.rot = a
                b.h = 0.7 + Math.abs(Math.sin(t * 1.4 + i)) * 1.6
                b.level = lv(Math.abs(Math.sin(t * 0.9 + ring + i * 0.3)), 0.8)
            }
        }
    }, [])
    return (
        <BlockStage
            title="Orbit core"
            hint="Satellites circle the monolith at different radii"
            palette="grape"
            spec={{ boxes, animate, navCols: 7, pad: 32, elev: 0.44 }}
            legend
        />
    )
}

/** 24 · A heartbeat rendered as stacked pulse columns. */
export function PulseStacks() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let i = 0; i < 56; i++) {
            for (let seg = 0; seg < 4; seg++) {
                out.push(box(i * 0.72, seg * 0.8, 0.62, 0.7, 0.4, 1, { z0: seg * 1.1, key: `${i}-${seg}` }))
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const i = Math.round(b.x / 0.72)
            const seg = Math.round((b.z0 ?? 0) / 1.1)
            const beat = Math.pow(Math.max(0, Math.sin(t * 2.4 + i * 0.22)), 6) * 6
            const envelope = 0.4 + 0.6 * Math.sin(i * 0.11 + t * 0.6) ** 2
            const v = clamp01((0.25 + beat) * envelope - seg * 0.16)
            b.h = 0.3 + v * 4
            b.glow = v > 0.7 ? (v - 0.7) * 1.8 : 0
            b.level = lv(v, 0.82)
        }
    }, [])
    return (
        <BlockStage
            title="Pulse stacks"
            hint="A heartbeat traced as stacked columns"
            palette="ember"
            spec={{ boxes, animate, navCols: 4, zoom: 0.9, pad: 22, elev: 0.36 }}
            legend
        />
    )
}

/** 25 · An aurora curtain of thin vertical slabs. */
export function AuroraCurtain() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        for (let i = 0; i < 64; i++) {
            for (let layer = 0; layer < 3; layer++) {
                const v = clamp01(fbm(i * 0.13, layer * 4.2, 3) + Math.sin(i * 0.12) * 0.2)
                out.push(
                    box(i * 0.62, layer * 1.7, 0.42, 1.5, 0.4 + v * 9, lv(v, 0.85), {
                        key: `${i}-${layer}`,
                        label: `Column ${i + 1} · layer ${layer + 1} — intensity ${(v * 100).toFixed(0)}%`,
                    }),
                )
            }
        }
        return out
    }, [])
    const animate = React.useCallback((bs: Box[], t: number) => {
        for (let k = 0; k < bs.length; k++) {
            const b = bs[k]
            const i = Math.round(b.x / 0.62)
            const layer = Math.round(b.y / 1.7)
            const wave = Math.sin(i * 0.14 + t * 1.1 - layer * 0.6) * 0.5 + 0.5
            const v = clamp01(Math.pow(wave, 1.8) * (1 - layer * 0.14))
            b.h = 0.4 + v * 9
            b.glow = v * 0.45
            b.level = lv(v, 0.8)
        }
    }, [])
    return (
        <BlockStage
            title="Aurora curtain"
            hint="Three layers of light drifting across the sky"
            palette="aurora"
            spec={{ boxes, animate, navCols: 3, zoom: 0.86, pad: 26, yaw: 0.32, elev: 0.5 }}
            legend
        />
    )
}

/** 26 · Stepped voxel terrain — quantised heights, chunky silhouettes. */
export function VoxelTerrain() {
    const boxes = React.useMemo(() => {
        const out: Box[] = []
        const N = 19
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const n = fbm(i * 0.19, j * 0.19, 4)
                const steps = Math.max(1, Math.round(n * 7))
                const height = steps * 0.72
                const level = steps > 5 ? 4 : steps > 3 ? 3 : steps > 2 ? 2 : 1
                out.push(
                    box(i * 1.0, j * 1.0, 0.96, 0.96, height, level, {
                        key: `${i}-${j}`,
                        label: `Voxel ${i},${j} — ${steps} layers`,
                    }),
                )
            }
        }
        return out
    }, [])
    return (
        <BlockStage
            title="Voxel terrain"
            hint="Quantised heightfield — chunky, stepped, readable"
            palette="github"
            spec={{ boxes, navCols: 19, pad: 18, elev: 0.72, zoom: 0.98 }}
            legend
        />
    )
}

/* ============================================================================
   11 · REGISTRY + GALLERY
   ========================================================================== */

export interface BlockEntry {
    id: string
    name: string
    category: "Temporal" | "Engineering" | "Productivity" | "Financial" | "Experimental"
    Component: React.ComponentType
}

export const BLOCK_COMPONENTS: BlockEntry[] = [
    { id: "circadian-ring", name: "24-Hour Circadian Ring", category: "Temporal", Component: CircadianRing },
    { id: "work-life-wave", name: "Weekly Work-Life Wave", category: "Temporal", Component: WorkLifeWave },
    { id: "milestone-range", name: "Decade Milestone Range", category: "Temporal", Component: MilestoneRange },
    { id: "season-terrain", name: "Seasonality Heat Terrain", category: "Temporal", Component: SeasonTerrain },
    { id: "commit-matrix", name: "Git Branch Commit Matrix", category: "Engineering", Component: CommitMatrix },
    { id: "complexity-spire", name: "Code Complexity Spire", category: "Engineering", Component: ComplexitySpire },
    { id: "uptime-monolith", name: "Server Uptime Monolith", category: "Engineering", Component: UptimeMonolith },
    { id: "dependency-pyramid", name: "Package Dependency Pyramid", category: "Engineering", Component: DependencyPyramid },
    { id: "habit-amphitheater", name: "Habit Streak Amphitheater", category: "Productivity", Component: HabitAmphitheater },
    { id: "pomodoro-skyline", name: "Pomodoro Focus Skyline", category: "Productivity", Component: PomodoroSkyline },
    { id: "energy-topography", name: "Energy Level Topography", category: "Productivity", Component: EnergyTopography },
    { id: "streak-ladder", name: "Micro-Goal Step Pyramid", category: "Productivity", Component: StreakLadder },
    { id: "portfolio-city", name: "Portfolio Allocation City", category: "Financial", Component: PortfolioCity },
    { id: "revenue-velocity", name: "Revenue Velocity Terrain", category: "Financial", Component: RevenueVelocity },
    { id: "transaction-flow", name: "Transaction Flow Matrix", category: "Financial", Component: TransactionFlow },
    { id: "frequency-grid", name: "Sound Frequency Equalizer", category: "Experimental", Component: FrequencyGrid },
    { id: "neural-matrix", name: "Neural Activation Matrix", category: "Experimental", Component: NeuralMatrix },
    { id: "digital-rain", name: "Matrix Digital Rain Monolith", category: "Experimental", Component: DigitalRain },
    { id: "constellation-lattice", name: "Constellation Lattice", category: "Experimental", Component: ConstellationLattice },
    { id: "heat-island", name: "Heat Island City", category: "Experimental", Component: HeatIslandCity },
    { id: "calendar-spiral", name: "Calendar Spiral", category: "Experimental", Component: CalendarSpiral },
    { id: "growth-rings", name: "Growth Rings", category: "Financial", Component: GrowthRings },
    { id: "orbit-core", name: "Orbit Core", category: "Engineering", Component: OrbitCore },
    { id: "pulse-stacks", name: "Pulse Stacks", category: "Productivity", Component: PulseStacks },
    { id: "aurora-curtain", name: "Aurora Curtain", category: "Experimental", Component: AuroraCurtain },
    { id: "voxel-terrain", name: "Voxel Terrain", category: "Experimental", Component: VoxelTerrain },
]

const CATEGORY_ORDER: BlockEntry["category"][] = ["Temporal", "Engineering", "Productivity", "Financial", "Experimental"]

/** Everything, laid out on one responsive page. */
export function BlockVaultGallery({ className = "" }: { className?: string }) {
    return (
        <div className={"mx-auto w-full max-w-6xl px-4 py-10 font-sans " + className}>
            <header className="mb-8">
                <h1 className="m-0 text-2xl font-semibold tracking-tight">Block Vault</h1>
                <p className="mt-1 text-sm" style={{ color: MUTED }}>
                    26 minimal, interactive 3D block scenes — one canvas engine, zero 3D libraries.
                </p>
            </header>

            {CATEGORY_ORDER.map((cat) => {
                const items = BLOCK_COMPONENTS.filter((c) => c.category === cat)
                if (!items.length) return null
                return (
                    <section key={cat} className="mb-10">
                        <h2 className="mb-3 text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: MUTED }}>
                            {cat}
                        </h2>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {items.map(({ id, Component, name }) => (
                                <Component key={id} aria-label={name} />
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}

export default AuroraCurtain;