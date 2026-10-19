"use client"

import * as React from "react"

/**
 * ISO BLOCKS — one canvas engine, eighteen scenes.
 *
 * Every component below is a *Spec* (a list of boxes, each a quad footprint
 * with a base, a top, a colour level and a tooltip) handed to <IsoChart/>.
 * The engine owns everything hard, exactly like ContributionSkyline:
 *   - one camera that swings between a flat top-down heat map and an
 *     isometric view, while bars rise in a wave (flat → skyline, never swapped)
 *   - eased positions / heights / colours, so changing data or modes morphs
 *   - hover + tap tooltips, arrow-key navigation, sr-only live announcements
 *   - drag to orbit (double-click resets), legend isolation, DPR scaling
 *   - prefers-reduced-motion, theme sync via --color-* variables (blended)
 *   - pauses itself when off-screen
 *
 * Usage:  import { CircadianRing, MatrixRainMonolith } from "@/components/draft/iso-blocks/iso-blocks"
 *         <CircadianRing />   // every component works with zero props
 *
 * React is the only import. Tailwind classes + CSS variables for theming.
 */

// #region math
export type RGB = [number, number, number]

export const clamp01 = (v: number): number => (v > 0 ? (v < 1 ? v : 1) : 0)
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const easeInOutCubic = (x: number): number => {
  const t = clamp01(x)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - clamp01(x), 3)

/** mulberry32 — small, fast, deterministic. */
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

const hash2 = (x: number, y: number, s: number): number => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}
/** Smooth value noise, 0‥1. */
export const vnoise = (x: number, y: number, s = 1): number => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  return lerp(lerp(hash2(xi, yi, s), hash2(xi + 1, yi, s), u), lerp(hash2(xi, yi + 1, s), hash2(xi + 1, yi + 1, s), u), v)
}
/** Three octaves of value noise, 0‥1. */
export const fbm = (x: number, y: number, s = 1): number => vnoise(x, y, s) * 0.6 + vnoise(x * 2.1, y * 2.1, s + 1) * 0.3 + vnoise(x * 4.3, y * 4.3, s + 2) * 0.1

export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
export const luminance = (c: RGB): number => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255

/** Share of the morph each bar spends waiting — the wave sweeps order 0 → 1. */
export const WAVE = 0.42
export const riseAt = (t: number, order: number): number => easeOutCubic((t - order * 0.36) / (1 - WAVE))

export const YAW_3D = Math.PI / 4
export const ELEV_3D = (34 * Math.PI) / 180
export const YAW_RANGE: [number, number] = [(8 * Math.PI) / 180, (82 * Math.PI) / 180]
export const ELEV_RANGE: [number, number] = [(18 * Math.PI) / 180, (62 * Math.PI) / 180]

export type Cam = { cs: number; sn: number; se: number; ce: number }

/** e=0 looks straight down (a flat map); e=1 is the isometric corner. Orbit offsets scale with e. */
export const camera = (e: number, dYaw = 0, dElev = 0): Cam => {
  const yaw = Math.min(YAW_RANGE[1], Math.max(0, lerp(0, YAW_3D + dYaw, e)))
  const elev = lerp(Math.PI / 2, Math.min(ELEV_RANGE[1], Math.max(ELEV_RANGE[0], ELEV_3D + dElev)), e)
  return { cs: Math.cos(yaw), sn: Math.sin(yaw), se: Math.sin(elev), ce: Math.cos(elev) }
}
/** World (x, y, z-up) → screen, before scale/offset. */
export const project = (c: Cam, x: number, y: number, z: number): [number, number] => [x * c.cs - y * c.sn, (x * c.sn + y * c.cs) * c.se - z * c.ce]

export type PaletteName = "github" | "halloween" | "ocean" | "ember" | "grape" | "mono" | "matrix"
export type PaletteInput = PaletteName | string[] | { light: string[]; dark: string[] }
export const PALETTES: Record<PaletteName, { light: string[]; dark: string[] }> = {
  github: { light: ["#c6e48b", "#7bc96f", "#239a3b", "#196127"], dark: ["#0e4429", "#006d32", "#26a641", "#39d353"] },
  halloween: { light: ["#ffee4a", "#ffc501", "#fe9600", "#b33c00"], dark: ["#631c03", "#bd561d", "#fa7a18", "#fddf68"] },
  ocean: { light: ["#b8e3f5", "#6ec3eb", "#2a8fd1", "#0b4f8a"], dark: ["#0c2d4a", "#12508a", "#2a88d8", "#7cc7ff"] },
  ember: { light: ["#fde2c4", "#fbad6e", "#f06b3a", "#b3261e"], dark: ["#4a1a10", "#8f2f16", "#e0572a", "#ffa46b"] },
  grape: { light: ["#e4d4fb", "#b794f4", "#805ad5", "#44337a"], dark: ["#2d1f4f", "#553c9a", "#8b5cf6", "#c4b5fd"] },
  mono: { light: ["#d4d4d4", "#a3a3a3", "#525252", "#171717"], dark: ["#333333", "#5c5c5c", "#a3a3a3", "#fafafa"] },
  matrix: { light: ["#b7e4b7", "#4fbf5a", "#0f8a2a", "#03521a"], dark: ["#003b00", "#008f11", "#00ff41", "#c8ffd4"] },
}
export const resolvePalette = (p: PaletteInput | undefined, dark: boolean): string[] => {
  const base = PALETTES.github[dark ? "dark" : "light"]
  const pick = Array.isArray(p) ? p : p && typeof p === "object" ? (dark ? p.dark : p.light) : PALETTES[(p as PaletteName) ?? "github"]?.[dark ? "dark" : "light"] ?? base
  return [0, 1, 2, 3].map((i) => pick[i] ?? pick[pick.length - 1] ?? base[i])
}
// #endregion

// #region spec
/** One block. `pts` is a quad footprint in world units (any winding); heights are absolute elevations. */
export interface Box {
  pts: number[] // x0,y0, x1,y1, x2,y2, x3,y3
  h: number // top elevation
  z0?: number // base elevation (default 0). A box with h - z0 < 0.04 is hidden.
  lv: number // 0 = empty colour … 4 = heaviest; fractions blend
  order: number // 0‥1 — when it rises during the morph wave
  tip: string // "Title\nDetail" — first line is bold
  alert?: number // 0‥1 blend toward alert red
  glyph?: string // optional character painted on the top face
  ga?: number // glyph opacity 0‥1
}

export interface Spec {
  boxes: Box[]
  /** Accessible description of the whole chart. */
  label: string
  /** Boxes per row — Up/Down arrows step by this, Left/Right by 1. */
  cols?: number
  /** Tallest elevation the scene can reach (needed for live scenes, so the camera never re-fits). */
  zMax?: number
  /** Call `tick` every frame (time in seconds, dt, index of hovered/pinned box or -1). Mutate `boxes` in place. */
  live?: boolean
  tick?: (time: number, dt: number, hover: number) => void
  /** Ground-plane text in world coordinates. */
  labels?: { x: number; y: number; text: string; align?: "left" | "center" | "right" }[]
  /** Tap / click / Enter on a box. */
  onPick?: (index: number) => void
}

export type ViewMode = "2d" | "3d"

export interface IsoChartProps {
  spec: Spec
  title?: React.ReactNode
  palette?: PaletteInput
  view?: ViewMode
  defaultView?: ViewMode
  onViewChange?: (view: ViewMode) => void
  /** Drag to orbit in 3D. */
  orbit?: boolean
  showToggle?: boolean
  showLegend?: boolean
  legendLabels?: [string, string]
  /** Replaces the hint under the chart. `null` renders none. */
  hint?: React.ReactNode
  /** Extra header controls (segmented buttons etc). */
  controls?: React.ReactNode
  /** Morph length, ms. */
  duration?: number
  /** Multiplies the rounded-corner radius of tops. */
  radius?: number
  className?: string
}
// #endregion

// #region geometry helpers
export const rect = (x: number, y: number, w: number, d: number): number[] => [x, y, x + w, y, x + w, y + d, x, y + d]
/** A unit grid cell with a margin. */
export const cell = (gx: number, gy: number, s = 0.86): number[] => rect(gx + (1 - s) / 2, gy + (1 - s) / 2, s, s)
/** An annular sector around the origin. */
export const sector = (r0: number, r1: number, a0: number, a1: number, gap = 0.035): number[] => {
  const p = a0 + gap
  const q = a1 - gap
  return [Math.cos(p) * r0, Math.sin(p) * r0, Math.cos(p) * r1, Math.sin(p) * r1, Math.cos(q) * r1, Math.sin(q) * r1, Math.cos(q) * r0, Math.sin(q) * r0]
}
export const box = (pts: number[], h: number, lv: number, order: number, tip: string, z0 = 0): Box => ({ pts, h, z0, lv, order, tip })
export const setRect = (b: Box, x: number, y: number, w: number, d: number) => {
  const p = b.pts
  p[0] = x; p[1] = y; p[2] = x + w; p[3] = y; p[4] = x + w; p[5] = y + d; p[6] = x; p[7] = y + d
}
// #endregion

const FG_FALLBACK: RGB = [23, 23, 23]
const BG_FALLBACK: RGB = [255, 255, 255]
const ALERT: RGB = [229, 57, 53]
const MUTED = "var(--color-muted-foreground, #737373)"

// Any CSS colour → sRGB, by letting the browser paint it (handles oklch, color-mix, names…).
let probe: CanvasRenderingContext2D | null = null
const toRGB = (color: string, fallback: RGB | null): RGB | null => {
  if (!probe) {
    const c = document.createElement("canvas")
    c.width = c.height = 1
    probe = c.getContext("2d", { willReadFrequently: true })
  }
  if (!probe) return fallback
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "rgba(0,0,0,0)"
  probe.fillStyle = color
  probe.fillRect(0, 0, 1, 1)
  const d = probe.getImageData(0, 0, 1, 1).data
  if (d[3] < 8) return fallback
  return [d[0], d[1], d[2]]
}
const rgbString = (r: number, g: number, b: number) => "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")"

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

const quadPath = (ctx: CanvasRenderingContext2D, p: Float32Array, o: number, r: number) => {
  if (r < 0.3) {
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

const GridIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ maxWidth: "none" }}>
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="5.5" height="5.5" rx="1" fill="currentColor" />
  </svg>
)
const CubeIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={{ maxWidth: "none" }}>
    <path d="M8 1.2 14.2 4.6v6.8L8 14.8 1.8 11.4V4.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M1.8 4.6 8 8l6.2-3.4M8 8v6.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

/** Small segmented control for header `controls`. */
export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: readonly { id: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border p-0.5 text-[12px]" style={{ borderColor: "var(--color-border, #e5e5e5)" }}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className="cursor-pointer rounded border-0 px-2 py-1 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
          style={{
            background: value === o.id ? "var(--color-foreground, #171717)" : "transparent",
            color: value === o.id ? "var(--color-background, #ffffff)" : MUTED,
            outlineColor: "var(--color-foreground, #171717)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Small outlined action button for header `controls`. */
export function Pill({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="cursor-pointer rounded-md border px-2.5 py-1 text-[12px] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
      style={{
        borderColor: "var(--color-border, #e5e5e5)",
        background: active ? "var(--color-foreground, #171717)" : "transparent",
        color: active ? "var(--color-background, #ffffff)" : "inherit",
        outlineColor: "var(--color-foreground, #171717)",
      }}
    >
      {children}
    </button>
  )
}

// #region engine
export function IsoChart({
  spec,
  title,
  palette = "github",
  view: viewProp,
  defaultView = "3d",
  onViewChange,
  orbit = true,
  showToggle = true,
  showLegend = true,
  legendLabels = ["Less", "More"],
  hint,
  controls,
  duration = 1300,
  radius = 1,
  className = "",
}: IsoChartProps) {
  const [innerView, setInnerView] = React.useState<ViewMode>(defaultView)
  const view = viewProp ?? innerView
  const setView = (v: ViewMode) => {
    if (viewProp === undefined) setInnerView(v)
    onViewChange?.(v)
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
  const engine = React.useRef<{ kick: () => void; load: () => void; retheme: () => void } | null>(null)

  // Everything the render loop reads, refreshed every render so the loop never closes over stale props.
  const cfgValue = { spec, duration, orbit, palette, legendLevel, radius, setSwatches, setAnnounce, target: view === "3d" ? 1 : 0 }
  const cfg = React.useRef(cfgValue)
  cfg.current = cfgValue

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

    // morph: t is linear time 0 (flat) → 1 (3D); the camera eases it, the bars wave it
    let t = 0
    let target = 0
    let entered = false
    let inView = true
    let yaw = 0
    let elev = 0
    let yawGoal = 0
    let elevGoal = 0
    let W = 0
    let H2 = 0
    let H3 = 0
    let Hmax = 0
    let lastH = -1
    let dpr = 1
    let font = "10px sans-serif"
    const col = new Float32Array(15)
    const colGoal = new Float32Array(15)
    let colReady = false
    let fg: RGB = FG_FALLBACK
    let bg: RGB = BG_FALLBACK
    // boxes
    let boxes: Box[] = []
    let n = 0
    let cp = new Float32Array(0) // eased footprints
    let cz = new Float32Array(0) // eased tops
    let cb = new Float32Array(0) // eased bases
    let cl = new Float32Array(0) // eased colour level
    let ca = new Float32Array(0) // eased alert
    let cap = new Float32Array(0)
    let dep = new Float32Array(0)
    let hover = new Float32Array(0)
    let dim = new Float32Array(0)
    let polys = new Float32Array(0)
    let sides = new Uint8Array(0)
    let vis = new Uint8Array(0)
    let order: number[] = []
    // interaction
    let hovered = -1
    let pinned = -1
    let activeIdx = -1
    let tipW = 0
    let lastTip = ""
    let raf = 0
    let last = 0
    let clock = 0
    let lastLive = -1e9

    const load = () => {
      boxes = cfg.current.spec.boxes
      const m = boxes.length
      if (m !== n || cp.length !== m * 8) {
        n = m
        cp = new Float32Array(m * 8)
        cz = new Float32Array(m)
        cb = new Float32Array(m)
        cl = new Float32Array(m)
        ca = new Float32Array(m)
        cap = new Float32Array(m)
        dep = new Float32Array(m)
        hover = new Float32Array(m)
        dim = new Float32Array(m)
        polys = new Float32Array(m * 40)
        sides = new Uint8Array(m)
        vis = new Uint8Array(m)
        order = Array.from({ length: m }, (_, i) => i)
        for (let i = 0; i < m; i++) {
          const b = boxes[i]
          for (let j = 0; j < 8; j++) cp[i * 8 + j] = b.pts[j]
          cz[i] = b.h
          cb[i] = b.z0 ?? 0
          cl[i] = b.lv
          ca[i] = b.alert ?? 0
        }
      }
      const zMax = cfg.current.spec.zMax ?? 0
      for (let i = 0; i < n; i++) cap[i] = Math.max(boxes[i].h, zMax)
      if (hovered >= n) hovered = -1
      if (pinned >= n) pinned = -1
      if (activeIdx >= n) {
        activeIdx = -1
        tip.style.opacity = "0"
      }
    }

    const retheme = () => {
      const cs = getComputedStyle(root)
      fg = toRGB(cs.color, FG_FALLBACK) ?? FG_FALLBACK
      bg = toRGB(cs.backgroundColor, null) ?? (luminance(fg) > 0.5 ? [10, 10, 10] : BG_FALLBACK)
      const isDark = luminance(bg) < 0.45
      font = "400 10px " + (cs.fontFamily || "sans-serif")
      const pal = resolvePalette(cfg.current.palette, isDark)
      const empty = mixRGB(bg, fg, isDark ? 0.11 : 0.075)
      const all: RGB[] = [empty, ...pal.map((c) => toRGB(c, FG_FALLBACK) ?? FG_FALLBACK)]
      for (let k = 0; k < 5; k++) for (let ch = 0; ch < 3; ch++) colGoal[k * 3 + ch] = all[k][ch]
      if (!colReady || reduced) {
        col.set(colGoal)
        colReady = true
      }
      const sw = all.map((c) => rgbString(c[0], c[1], c[2]))
      cfg.current.setSwatches((prev) => (prev.join() === sw.join() ? prev : sw))
      kick()
    }

    // Projected extent of the whole scene for camera e. Uses target footprints and the tallest reachable top.
    const extent = (cam: Cam, e: number) => {
      let minx = Infinity
      let maxx = -Infinity
      let miny = Infinity
      let maxy = -Infinity
      const add = (x: number, y: number, z: number) => {
        const p = project(cam, x, y, z)
        if (p[0] < minx) minx = p[0]
        if (p[0] > maxx) maxx = p[0]
        if (p[1] < miny) miny = p[1]
        if (p[1] > maxy) maxy = p[1]
      }
      for (let i = 0; i < n; i++) {
        const p = boxes[i].pts
        for (let k = 0; k < 4; k++) {
          add(p[k * 2], p[k * 2 + 1], 0)
          add(p[k * 2], p[k * 2 + 1], cap[i] * e)
        }
      }
      for (const l of cfg.current.spec.labels ?? []) add(l.x, l.y, 0)
      if (!isFinite(minx)) return { minx: 0, maxx: 1, miny: 0, maxy: 1 }
      return { minx, maxx, miny, maxy }
    }

    const relayout = () => {
      const w = Math.round(stage.clientWidth)
      if (!w || !n) return
      W = w
      dpr = Math.min(2, window.devicePixelRatio || 1)
      const fit = (e: number, pad: number) => {
        const b = extent(camera(e), e)
        const natural = ((b.maxy - b.miny) / Math.max(1e-6, b.maxx - b.minx)) * (W - pad * 2) + pad * 2
        return Math.max(Math.min(natural, W * 0.8, 560), Math.min(natural, 220))
      }
      H2 = fit(0, 6)
      H3 = fit(1, 20)
      Hmax = Math.ceil(Math.max(H2, H3))
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(Hmax * dpr)
      canvas.style.width = W + "px"
      canvas.style.height = Hmax + "px"
      lastH = -1
      draw()
    }

    const draw = () => {
      if (!W || !n) return
      const e = easeInOutCubic(t)
      const cam = camera(e, yaw, elev)
      const Hc = lerp(H2, H3, e)
      if (Math.abs(Hc - lastH) > 0.2) {
        stage.style.height = Hc.toFixed(1) + "px"
        lastH = Hc
      }
      const bx = extent(cam, e)
      const pad = lerp(6, 20, e)
      const aw = W - pad * 2
      const ah = Hc - pad * 2
      const bw = Math.max(1e-6, bx.maxx - bx.minx)
      const bh = Math.max(1e-6, bx.maxy - bx.miny)
      const s = Math.min(aw / bw, ah / bh)
      const ox = pad + (aw - bw * s) / 2 - bx.minx * s
      const oy = pad + (ah - bh * s) / 2 - bx.miny * s
      const { cs, sn, se, ce } = cam
      const px = (x: number, y: number) => ox + (x * cs - y * sn) * s
      const py = (x: number, y: number, z: number) => oy + ((x * sn + y * cs) * se - z * ce) * s

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, Hmax)

      for (let i = 0; i < n; i++) {
        const o = i * 8
        dep[i] = ((cp[o] + cp[o + 2] + cp[o + 4] + cp[o + 6]) * sn + (cp[o + 1] + cp[o + 3] + cp[o + 5] + cp[o + 7]) * cs) / 4
      }
      order.sort((a, c) => {
        const d = dep[a] - dep[c]
        return Math.abs(d) > 1e-4 ? d : cb[a] - cb[c]
      })

      const rad = lerp(0.17, 0.03, e) * s * cfg.current.radius
      const outline = (1 - e) * 0.07
      const lift = 0.7 * e
      const ex = col[0]
      const ey = col[1]
      const ez = col[2]
      let glyphSize = -1

      for (let k = 0; k < n; k++) {
        const i = order[k]
        const b = boxes[i]
        if (cz[i] - cb[i] < 0.04) {
          vis[i] = 0
          sides[i] = 0
          continue
        }
        vis[i] = 1
        const o8 = i * 8
        const o = i * 40
        const rz = riseAt(t, b.order)
        const hv = hover[i]
        const zt = cz[i] * rz + hv * lift
        const zb = cb[i] * rz

        let a2 = 0
        for (let j = 0; j < 4; j++) {
          const jn = (j + 1) & 3
          const x = cp[o8 + j * 2]
          const y = cp[o8 + j * 2 + 1]
          polys[o + j * 2] = px(x, y)
          polys[o + j * 2 + 1] = py(x, y, zt)
          a2 += x * cp[o8 + jn * 2 + 1] - cp[o8 + jn * 2] * y
        }
        const sg = a2 >= 0 ? 1 : -1
        const tall = (zt - zb) * ce * s > 0.35

        // colour: eased level → palette blend, then alert, legend dimming, hover glow
        const lf = Math.max(0, Math.min(4, cl[i]))
        const k0 = Math.floor(lf)
        const k1 = Math.min(4, k0 + 1)
        const f = lf - k0
        let r = col[k0 * 3] * (1 - f) + col[k1 * 3] * f
        let g = col[k0 * 3 + 1] * (1 - f) + col[k1 * 3 + 1] * f
        let bl = col[k0 * 3 + 2] * (1 - f) + col[k1 * 3 + 2] * f
        const ar = ca[i]
        if (ar > 0.002) {
          r += (ALERT[0] - r) * 0.9 * ar
          g += (ALERT[1] - g) * 0.9 * ar
          bl += (ALERT[2] - bl) * 0.9 * ar
        }
        const d = dim[i]
        if (d > 0.002) {
          r += (ex - r) * 0.72 * d
          g += (ey - g) * 0.72 * d
          bl += (ez - bl) * 0.72 * d
        }
        if (hv > 0.002) {
          const m = 0.16 * hv
          r += (fg[0] - r) * m
          g += (fg[1] - g) * m
          bl += (fg[2] - bl) * m
        }

        let bits = 0
        for (let j = 0; j < 4; j++) {
          if (!tall) break
          const jn = (j + 1) & 3
          const xa = cp[o8 + j * 2]
          const ya = cp[o8 + j * 2 + 1]
          const xb = cp[o8 + jn * 2]
          const yb = cp[o8 + jn * 2 + 1]
          const dx = xb - xa
          const dy = yb - ya
          const len = Math.hypot(dx, dy) || 1
          const nx = (sg * dy) / len
          const ny = (-sg * dx) / len
          if (nx * sn + ny * cs <= 0.02) continue
          bits |= 1 << j
          const q = o + 8 + j * 8
          polys[q] = px(xa, ya)
          polys[q + 1] = py(xa, ya, zb)
          polys[q + 2] = px(xb, yb)
          polys[q + 3] = py(xb, yb, zb)
          polys[q + 4] = polys[o + jn * 2]
          polys[q + 5] = polys[o + jn * 2 + 1]
          polys[q + 6] = polys[o + j * 2]
          polys[q + 7] = polys[o + j * 2 + 1]
          const sh = Math.max(0.5, Math.min(0.95, 0.74 - 0.14 * (nx * cs - ny * sn)))
          ctx.beginPath()
          quadPath(ctx, polys, q, 0)
          ctx.fillStyle = rgbString(r * sh, g * sh, bl * sh)
          ctx.fill()
        }
        sides[i] = bits

        ctx.beginPath()
        quadPath(ctx, polys, o, rad)
        ctx.fillStyle = rgbString(r, g, bl)
        ctx.fill()
        if (outline > 0.004) {
          ctx.strokeStyle = "rgba(" + fg[0] + "," + fg[1] + "," + fg[2] + "," + outline.toFixed(3) + ")"
          ctx.lineWidth = 1
          ctx.stroke()
        }
        if (hv > 0.02) {
          ctx.strokeStyle = "rgba(" + fg[0] + "," + fg[1] + "," + fg[2] + "," + (0.85 * hv).toFixed(3) + ")"
          ctx.lineWidth = 1.5
          ctx.stroke()
        }
        if (b.glyph && (b.ga ?? 0) > 0.03) {
          const wpx = Math.hypot(polys[o + 2] - polys[o], polys[o + 3] - polys[o + 1])
          if (wpx > 6) {
            const fs = Math.round(wpx * 0.78)
            if (fs !== glyphSize) {
              glyphSize = fs
              ctx.font = "600 " + fs + "px ui-monospace, SFMono-Regular, Menlo, monospace"
              ctx.textAlign = "center"
              ctx.textBaseline = "middle"
            }
            ctx.fillStyle = "rgba(" + Math.round(col[12]) + "," + Math.round(col[13]) + "," + Math.round(col[14]) + "," + (b.ga ?? 0).toFixed(3) + ")"
            ctx.fillText(b.glyph, (polys[o] + polys[o + 2] + polys[o + 4] + polys[o + 6]) / 4, (polys[o + 1] + polys[o + 3] + polys[o + 5] + polys[o + 7]) / 4)
          }
        }
      }

      // ground labels
      const labels = cfg.current.spec.labels
      if (labels && labels.length) {
        const muted = mixRGB(bg, fg, 0.55)
        ctx.font = font
        ctx.fillStyle = rgbString(muted[0], muted[1], muted[2])
        ctx.textBaseline = "middle"
        for (const l of labels) {
          ctx.textAlign = l.align ?? "center"
          ctx.fillText(l.text, px(l.x, l.y), py(l.x, l.y, 0))
        }
      }

      // tooltip rides the active box through morphs and orbits
      if (activeIdx >= 0 && activeIdx < n && vis[activeIdx]) {
        const i = activeIdx
        const o = i * 40
        const text = boxes[i].tip
        if (text !== lastTip) {
          lastTip = text
          const parts = text.split("\n")
          tipB.textContent = parts[0]
          tipS.textContent = parts.slice(1).join(" · ")
          tipW = tip.offsetWidth
        }
        const tx = (polys[o] + polys[o + 2] + polys[o + 4] + polys[o + 6]) / 4
        const ty = Math.min(polys[o + 1], polys[o + 3], polys[o + 5], polys[o + 7])
        const half = tipW / 2
        const cx = Math.min(W - half - 2, Math.max(half + 2, tx))
        tip.style.transform = "translate(" + (cx - half).toFixed(1) + "px," + (ty - 8).toFixed(1) + "px) translateY(-100%)"
        tip.style.setProperty("--arrow", (tx - cx + half).toFixed(1) + "px")
      }
    }

    const tick = (now: number) => {
      raf = 0
      if (!inView) return
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
      last = now
      let moving = false

      if (t !== target) {
        const step = reduced ? 1 : (dt * 1000) / Math.max(1, cfg.current.duration)
        t = target > t ? Math.min(target, t + step) : Math.max(target, t - step)
        moving = true
      }

      const ko = reduced ? 1 : 1 - Math.exp(-dt * 12)
      yaw += (yawGoal - yaw) * ko
      elev += (elevGoal - elev) * ko
      if (Math.abs(yawGoal - yaw) > 1e-4 || Math.abs(elevGoal - elev) > 1e-4) moving = true
      else {
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

      // live scenes mutate their boxes; reduced motion samples them once a second
      const sp = cfg.current.spec
      if (sp.live && sp.tick) {
        if (!reduced || now - lastLive > 1000) {
          const step = reduced ? 1 : dt
          clock += step
          lastLive = now
          sp.tick(clock, step, activeIdx)
        }
        moving = true
      }

      // ease every box toward its target
      const kh = reduced ? 1 : 1 - Math.exp(-dt * 9)
      const kv = reduced ? 1 : 1 - Math.exp(-dt * 16)
      const kd = reduced ? 1 : 1 - Math.exp(-dt * 10)
      const leg = cfg.current.legendLevel
      for (let i = 0; i < n; i++) {
        const b = boxes[i]
        const o = i * 8
        for (let j = 0; j < 8; j++) {
          const dd = b.pts[j] - cp[o + j]
          if (Math.abs(dd) > 0.0005) {
            cp[o + j] += dd * kh
            moving = true
          } else cp[o + j] = b.pts[j]
        }
        const dz = b.h - cz[i]
        if (Math.abs(dz) > 0.002) {
          cz[i] += dz * kh
          moving = true
        } else cz[i] = b.h
        const z0 = b.z0 ?? 0
        const db = z0 - cb[i]
        if (Math.abs(db) > 0.002) {
          cb[i] += db * kh
          moving = true
        } else cb[i] = z0
        const dl = b.lv - cl[i]
        if (Math.abs(dl) > 0.004) {
          cl[i] += dl * kh
          moving = true
        } else cl[i] = b.lv
        const da = (b.alert ?? 0) - ca[i]
        if (Math.abs(da) > 0.004) {
          ca[i] += da * kh
          moving = true
        } else ca[i] = b.alert ?? 0
        const hg = i === activeIdx ? 1 : 0
        if (hover[i] !== hg) {
          hover[i] = Math.abs(hg - hover[i]) < 0.003 ? hg : hover[i] + (hg - hover[i]) * kv
          moving = true
        }
        const dg = leg >= 0 && Math.round(b.lv) !== leg ? 1 : 0
        if (dim[i] !== dg) {
          dim[i] = Math.abs(dg - dim[i]) < 0.003 ? dg : dim[i] + (dg - dim[i]) * kd
          moving = true
        }
      }

      draw()
      if (moving) raf = requestAnimationFrame(tick)
    }

    const kick = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const refreshActive = () => {
      const next = hovered >= 0 ? hovered : pinned
      if (next === activeIdx) return
      activeIdx = next
      lastTip = ""
      tip.style.opacity = next >= 0 ? "1" : "0"
      tip.setAttribute("aria-hidden", next >= 0 ? "false" : "true")
      kick()
    }

    const hit = (x: number, y: number): number => {
      for (let k = n - 1; k >= 0; k--) {
        const i = order[k]
        if (!vis[i]) continue
        const o = i * 40
        if (pointInQuad(polys, o, x, y)) return i
        for (let j = 0; j < 4; j++) if (sides[i] & (1 << j) && pointInQuad(polys, o + 8 + j * 8, x, y)) return i
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
      if (can) {
        try {
          canvas.setPointerCapture(ev.pointerId)
        } catch {
          /* capture is a nicety */
        }
      }
    }

    const onMove = (ev: PointerEvent) => {
      if (drag && drag.orbit && ev.pointerId === drag.id) {
        const dx = ev.clientX - drag.x
        const dyy = ev.clientY - drag.y
        if (drag.moved || Math.hypot(dx, dyy) > 4) {
          drag.moved = true
          yawGoal = Math.min(YAW_RANGE[1] - YAW_3D, Math.max(YAW_RANGE[0] - YAW_3D, drag.yaw + dx * 0.006))
          if (drag.mouse) elevGoal = Math.min(ELEV_RANGE[1] - ELEV_3D, Math.max(ELEV_RANGE[0] - ELEV_3D, drag.elev + dyy * 0.004))
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
      if (i >= 0) cfg.current.spec.onPick?.(i)
    }

    const onCancel = () => {
      drag = null
    }
    const onLeave = () => {
      if (drag) return
      hovered = -1
      refreshActive()
    }
    const onDbl = () => {
      yawGoal = 0
      elevGoal = 0
      kick()
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
      let i = pinned >= 0 ? pinned : activeIdx >= 0 ? activeIdx : n - 1
      if (ev.key === "Enter" || ev.key === " ") {
        cfg.current.spec.onPick?.(i)
        return
      }
      const stride = Math.max(1, cfg.current.spec.cols ?? 1)
      if (pinned >= 0 || activeIdx >= 0) {
        if (ev.key === "ArrowLeft") i -= 1
        if (ev.key === "ArrowRight") i += 1
        if (ev.key === "ArrowUp") i -= stride
        if (ev.key === "ArrowDown") i += stride
        if (ev.key === "Home") i = 0
        if (ev.key === "End") i = n - 1
      }
      i = Math.max(0, Math.min(n - 1, i))
      pinned = i
      hovered = -1
      refreshActive()
      cfg.current.setAnnounce(boxes[i].tip.replace(/\n/g, ", "))
    }
    const onBlur = () => {
      pinned = -1
      refreshActive()
    }

    const setTarget = () => {
      const goal = cfg.current.target
      if (!entered) return
      if (goal !== target) {
        target = goal
        if (goal === 0) {
          yawGoal = 0
          elevGoal = 0
        }
        canvas.style.cursor = cfg.current.orbit && target === 1 ? "grab" : "default"
        kick()
      }
    }

    load()
    retheme()
    relayout()

    // The 3D view rises out of the flat one the first time it is seen.
    const enter = () => {
      if (entered) return
      entered = true
      if (reduced) t = cfg.current.target
      setTarget()
    }
    let io: IntersectionObserver | null = null
    let io2: IntersectionObserver | null = null
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) {
            enter()
            io?.disconnect()
          }
        },
        { threshold: 0.35 },
      )
      io.observe(stage)
      // pause the loop while scrolled away
      io2 = new IntersectionObserver((entries) => {
        inView = entries.some((en) => en.isIntersecting)
        if (inView) kick()
      })
      io2.observe(stage)
    } else enter()

    const ro = new ResizeObserver(() => {
      if (Math.round(stage.clientWidth) !== W) relayout()
    })
    ro.observe(stage)

    const mo = new MutationObserver(retheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    const onReduce = () => {
      reduced = reduceMq.matches
      kick()
    }
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

    engine.current = {
      kick: () => {
        setTarget()
        kick()
      },
      load: () => {
        load()
        relayout()
        kick()
      },
      retheme,
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
      io?.disconnect()
      io2?.disconnect()
      ro.disconnect()
      mo.disconnect()
      reduceMq.removeEventListener("change", onReduce)
      darkMq.removeEventListener("change", retheme)
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onCancel)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("dblclick", onDbl)
      canvas.removeEventListener("keydown", onKey)
      canvas.removeEventListener("blur", onBlur)
      engine.current = null
    }
    // The loop reads everything else through cfg; it is built once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    engine.current?.kick()
  }, [view, legendLevel])
  React.useEffect(() => {
    engine.current?.load()
  }, [spec])
  React.useEffect(() => {
    engine.current?.retheme()
  }, [palette])

  const is3d = view === "3d"
  const ease = "cubic-bezier(0.65, 0, 0.35, 1)"
  const levelNames = ["Empty", "Light", "Moderate", "Heavy", "Heaviest"]
  const hints = ["Hover a block for details · arrow keys to explore", "Drag to orbit · double-click to reset"]
  const autoHint = hints[is3d && orbit ? 1 : 0]

  return (
    <section
      ref={rootRef}
      className={"relative w-full rounded-xl border p-4 font-sans sm:p-5 " + className}
      style={{ background: "var(--color-background, #ffffff)", color: "var(--color-foreground, #171717)", borderColor: "var(--color-border, #e5e5e5)" }}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="m-0 text-[15px] font-semibold leading-snug">{title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {controls}
          {showToggle && (
            <div role="group" aria-label="Chart view" className="relative inline-flex rounded-md border p-0.5" style={{ borderColor: "var(--color-border, #e5e5e5)" }}>
              <span
                aria-hidden="true"
                className="absolute top-0.5 bottom-0.5 left-0.5 w-8 rounded transition-transform duration-500 motion-reduce:transition-none"
                style={{ background: "var(--color-foreground, #171717)", transform: is3d ? "translateX(100%)" : "translateX(0)", transitionTimingFunction: ease }}
              />
              {(["2d", "3d"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={v === "2d" ? "Flat heat map" : "3D view"}
                  title={v === "2d" ? "Flat heat map" : "3D view"}
                  onClick={() => setView(v)}
                  className="relative z-10 grid h-7 w-8 cursor-pointer place-items-center rounded border-0 bg-transparent p-0 transition-colors duration-500 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                  style={{ color: view === v ? "var(--color-background, #ffffff)" : MUTED, outlineColor: "var(--color-foreground, #171717)" }}
                >
                  {v === "2d" ? <GridIcon /> : <CubeIcon />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="relative rounded-lg border" style={{ borderColor: "var(--color-border, #e5e5e5)" }}>
        <div className="relative px-3 pt-3 sm:px-4 sm:pt-4">
          <div ref={stageRef} className="relative w-full overflow-hidden rounded-md outline-offset-4 has-[:focus-visible]:outline-2" style={{ height: 240, outlineColor: "var(--color-foreground, #171717)" }}>
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="img"
              aria-label={spec.label + " Shown as a " + (is3d ? "3D scene" : "flat map") + ". Use the arrow keys to read individual blocks."}
              className="absolute top-0 left-0 block outline-none"
              style={{ maxWidth: "none", touchAction: is3d && orbit ? "pan-y" : "auto" }}
            />
          </div>
          <div
            ref={tipRef}
            role="tooltip"
            aria-hidden="true"
            className="pointer-events-none absolute top-3 left-3 z-20 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] leading-snug shadow-lg transition-opacity duration-150 sm:top-4 sm:left-4 motion-reduce:transition-none"
            style={{ opacity: 0, background: "var(--color-foreground, #171717)", color: "var(--color-background, #ffffff)" }}
          >
            <strong ref={tipBRef} className="block font-semibold" />
            <span ref={tipSRef} className="block opacity-75" />
            <span
              aria-hidden="true"
              className="absolute top-full h-0 w-0"
              style={{ left: "var(--arrow, 50%)", marginLeft: -5, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid var(--color-foreground, #171717)" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 pt-3 pb-3 text-[12px] sm:px-4" style={{ color: MUTED }}>
          {hint === null ? (
            <span className="flex-1" />
          ) : (
            <span className="relative grid flex-1">
              {hint !== undefined && <span className="[grid-area:1/1]">{hint}</span>}
              {hint === undefined &&
                hints.map((h) => (
                  <span key={h} aria-hidden={h !== autoHint} className="[grid-area:1/1] transition-opacity duration-500 motion-reduce:transition-none" style={{ opacity: h === autoHint ? 1 : 0 }}>
                    {h}
                  </span>
                ))}
            </span>
          )}
          {showLegend && (
            <div className="flex items-center gap-1.5" onMouseLeave={() => setLegendLevel(-1)}>
              <span className="mr-0.5">{legendLabels[0]}</span>
              {swatches.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={"Highlight " + levelNames[i].toLowerCase() + " blocks"}
                  aria-pressed={legendLevel === i}
                  title={levelNames[i]}
                  onMouseEnter={() => setLegendLevel(i)}
                  onFocus={() => setLegendLevel(i)}
                  onBlur={() => setLegendLevel(-1)}
                  onClick={() => setLegendLevel((l) => (l === i ? -1 : i))}
                  className="h-[11px] w-[11px] cursor-pointer rounded-[2px] border-0 p-0 transition-[background-color,transform] duration-500 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-1 motion-reduce:transition-none"
                  style={{ background: c, outlineColor: "var(--color-foreground, #171717)", boxShadow: "inset 0 0 0 1px rgba(127,127,127,0.12)" }}
                />
              ))}
              <span className="ml-0.5">{legendLabels[1]}</span>
            </div>
          )}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </section>
  )
}
// #endregion

// ───────────────────────────────────────────────────────────────────────────
// THE EIGHTEEN
// ───────────────────────────────────────────────────────────────────────────

type Shared = Pick<IsoChartProps, "title" | "palette" | "view" | "defaultView" | "onViewChange" | "orbit" | "duration" | "className" | "hint" | "showToggle" | "showLegend"> & {
  /** Seed for the generated sample data. */
  seed?: number
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const pad2 = (n: number) => String(n).padStart(2, "0")

// ── A · Temporal & activity ────────────────────────────────────────────────

import { CircadianRing, CirculariumRing, type CircadianRingProps, type CirculariumRingProps } from "../../submitted/circularium-ring/circularium-ring"
export { CircadianRing, CirculariumRing, type CircadianRingProps, type CirculariumRingProps }


export interface WorkLifeWaveProps extends Shared { }
type WLMode = "stacked" | "split" | "deep" | "meetings"
/** 2 · Deep-work hours against meeting load, per day over 14 weeks. Toggle how the two layers relate. */
export function WorkLifeWave({ seed = 5, ...chart }: WorkLifeWaveProps) {
  const [mode, setMode] = React.useState<WLMode>("stacked")
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const WK = 14
    const boxes: Box[] = []
    for (let d = 0; d < 7; d++)
      for (let w = 0; w < WK; w++) {
        const wk = d < 5
        const deep = Math.max(0, wk ? 3.2 + 1.6 * Math.sin(w * 0.55 + d) + r() * 1.8 : r() * 0.9)
        const meet = Math.max(0, wk ? 1.8 + 1.4 * Math.cos(w * 0.4) + r() * 1.6 : r() * 0.3)
        const dh = 0.2 + deep * 1.0
        const mh = meet * 0.9
        const full = cell(w, d)
        const tip = "Wk " + (w + 1) + " · " + DAYS[d] + "\nDeep work " + deep.toFixed(1) + " h · Meetings " + meet.toFixed(1) + " h"
        const lvD = 2.2 + (Math.min(deep, 6) / 6) * 1.8
        const lvM = 0.6 + (Math.min(meet, 4) / 4) * 1.2
        const o = w / (WK - 1)
        if (mode === "stacked") boxes.push(box(full, dh, lvD, o, tip), box(full, dh + mh, lvM, o, tip, dh))
        else if (mode === "split") boxes.push(box(rect(w + 0.07, d + 0.07, 0.41, 0.86), dh, lvD, o, tip), box(rect(w + 0.52, d + 0.07, 0.41, 0.86), 0.2 + mh, lvM, o, tip))
        else if (mode === "deep") boxes.push(box(full, dh, lvD, o, tip), box(full, 0, lvM, o, tip))
        else boxes.push(box(full, 0, lvD, o, tip), box(full, 0.2 + mh, lvM, o, tip))
      }
    const labels = [
      ...DAYS.map((t, d) => ({ x: -0.4, y: d + 0.5, text: t, align: "right" as const })),
      ...[0, 4, 8, 12].map((w) => ({ x: w + 0.5, y: 7.8, text: "Wk " + (w + 1) })),
    ]
    return { boxes, labels, cols: WK * 2, zMax: 9, label: "Work-life wave: deep work hours versus meeting hours, per day over fourteen weeks." }
  }, [seed, mode])
  return (
    <IsoChart
      spec={spec}
      title="Work-life balance wave"
      palette="grape"
      legendLabels={["Meetings", "Deep work"]}
      hint="Dark blocks are deep work, light blocks are meetings"
      controls={<Seg<WLMode> label="Layer mode" value={mode} onChange={setMode} options={[{ id: "stacked", label: "Stacked" }, { id: "split", label: "Split" }, { id: "deep", label: "Deep" }, { id: "meetings", label: "Meetings" }]} />}
      {...chart}
    />
  )
}

export interface Milestone {
  /** Row index, 0 = oldest year. */
  year: number
  /** Position within the year, 0–1. */
  at: number
  /** 0.3–1 — how monumental. */
  weight: number
  label: string
}
export interface MilestoneMountainsProps extends Shared {
  milestones?: Milestone[]
  startYear?: number
}
/** 3 · Ten years as ten stacked ridges. Ordinary weeks are foothills; milestones are peaks. */
export function MilestoneMountains({ milestones, startYear = 2016, seed = 11, ...chart }: MilestoneMountainsProps) {
  const spec = React.useMemo<Spec>(() => {
    const COLS = 40
    const YEARS = 10
    const ms: Milestone[] =
      milestones ??
      [
        { year: 1, at: 0.3, weight: 0.55, label: "First paying customer" },
        { year: 2, at: 0.72, weight: 0.7, label: "Seed round closed" },
        { year: 4, at: 0.2, weight: 0.6, label: "Team of ten" },
        { year: 5, at: 0.55, weight: 0.85, label: "v2 launch" },
        { year: 6, at: 0.85, weight: 0.65, label: "Second market opened" },
        { year: 7, at: 0.4, weight: 1, label: "Series B · 1M users" },
        { year: 9, at: 0.65, weight: 0.9, label: "IPO filing" },
      ]
    const h = (x: number, y: number) => {
      let v = 0.5 + fbm(x * 0.14, y * 0.7, seed) * 1.7
      for (const m of ms) {
        const dx = (x - m.at * (COLS - 1)) / 1.9
        v += m.weight * 7 * Math.exp(-dx * dx) * (m.year === y ? 1 : Math.abs(m.year - y) === 1 ? 0.38 : 0)
      }
      return v
    }
    const boxes: Box[] = []
    for (let y = 0; y < YEARS; y++)
      for (let x = 0; x < COLS; x++) {
        const v = h(x, y)
        const near = ms.find((m) => m.year === y && Math.abs(x - m.at * (COLS - 1)) < 1.3)
        const tip = near ? startYear + y + "\n" + near.label : startYear + y + " · week " + Math.round((x / (COLS - 1)) * 51 + 1) + "\nActivity " + Math.round(v * 12)
        boxes.push(box(rect(x + 0.04, y + 0.1, 0.92, 0.8), Math.min(9, v), Math.min(4, (v / 7.5) * 4), (y * COLS + x) / (YEARS * COLS), tip))
      }
    const labels = Array.from({ length: YEARS }, (_, y) => ({ x: -0.6, y: y + 0.5, text: String(startYear + y), align: "right" as const })).filter((_, i) => i % 2 === 0)
    return { boxes, labels, cols: COLS, zMax: 9, label: "Ten ridges, one per year, with peaks where career or project milestones landed." }
  }, [milestones, startYear, seed])
  return <IsoChart spec={spec} title="Decade milestone range" palette="mono" legendLabels={["Foothills", "Summit"]} hint="Hover a peak to read the milestone" {...chart} />
}

export interface SeasonalityTerrainProps extends Shared {
  /** Week of year the main season peaks (default 30 = high summer). */
  peakWeek?: number
}
/** 4 · Eight years × 52 weeks of seasonal activity as a gapless voxel landscape. */
export function SeasonalityTerrain({ peakWeek = 30, seed = 21, ...chart }: SeasonalityTerrainProps) {
  const spec = React.useMemo<Spec>(() => {
    const COLS = 52
    const ROWS = 8
    const boxes: Box[] = []
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const season = 0.5 + 0.5 * Math.cos(((x - peakWeek) / 52) * Math.PI * 2)
        const second = 0.35 * Math.exp(-(((x - 12) / 5) ** 2))
        const v = 0.5 + (season + second) * 3.4 * (0.8 + y * 0.04) + fbm(x * 0.16, y * 0.5, seed) * 2.6
        const q = Math.floor(((x + 5) % 52) / 13)
        boxes.push(box(cell(x, y, 1.0), v, Math.min(4, (v / 8) * 4), x / COLS, "Year " + (y + 1) + " · week " + (x + 1) + "\n" + ["Winter", "Spring", "Summer", "Autumn"][q] + " · activity " + Math.round(v * 14)))
      }
    const labels = [
      { x: 4, text: "Winter" },
      { x: 17, text: "Spring" },
      { x: 30, text: "Summer" },
      { x: 43, text: "Autumn" },
    ].map((l) => ({ ...l, y: ROWS + 0.9 }))
    return { boxes, labels, cols: COLS, zMax: 9, label: "Seasonality terrain: eight years of weekly activity across the four seasons." }
  }, [peakWeek, seed])
  return <IsoChart spec={spec} title="Seasonality heat terrain" palette="ember" radius={0} legendLabels={["Dormant", "Peak season"]} {...chart} />
}

// ── B · Developer & engineering ────────────────────────────────────────────

export interface RepoWeek {
  merges: number
  branches: number
  prs: number
}
export interface GitBranchMatrixProps extends Shared {
  repos?: { name: string; weeks: RepoWeek[] }[]
}
/** 5 · Repos along Y, weeks along X. Each cell stacks merges, open branches and PR velocity. */
export function GitBranchMatrix({ repos, seed = 8, ...chart }: GitBranchMatrixProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const WK = 20
    const data =
      repos ??
      ["api-gateway", "web-app", "design-system", "billing", "mobile", "infra"].map((name, k) => ({
        name,
        weeks: Array.from({ length: WK }, (_, w) => {
          const busy = 0.5 + 0.5 * Math.sin(w * 0.5 + k * 1.3)
          return { merges: Math.round(busy * 9 + r() * 3), branches: Math.round(busy * 5 + r() * 2), prs: Math.round(busy * 4 + r() * 2) }
        }),
      }))
    const boxes: Box[] = []
    data.forEach((repo, k) => {
      const gy = k * 1.5
      for (let w = 0; w < WK; w++) {
        const d = repo.weeks[w] ?? { merges: 0, branches: 0, prs: 0 }
        const pts = rect(w + 0.07, gy + 0.07, 0.86, 1.15)
        const tip = repo.name + " · wk " + (w + 1) + "\n" + d.merges + " merges · " + d.branches + " branches · " + d.prs + " PRs"
        const a = 0.2 + d.merges * 0.28
        const b = d.branches > 0 ? a + 0.1 + d.branches * 0.22 : a
        const c = d.prs > 0 ? b + 0.1 + d.prs * 0.3 : b
        const o = w / (WK - 1)
        boxes.push(box(pts, a, 1.2, o, tip), box(pts, b, 2.4, o, tip, a), box(pts, c, 3.6, o, tip, b))
      }
    })
    const labels = [
      ...data.map((repo, k) => ({ x: -0.4, y: k * 1.5 + 0.65, text: repo.name, align: "right" as const })),
      ...[0, 5, 10, 15].map((w) => ({ x: w + 0.5, y: data.length * 1.5 + 0.7, text: "Wk " + (w + 1) })),
    ]
    return { boxes, labels, cols: WK * 3, zMax: 10, label: "Git matrix: per repository and week, merges, branches and pull requests stacked." }
  }, [repos, seed])
  return <IsoChart spec={spec} title="Git branch commit matrix" palette="github" legendLabels={["Merges", "PR velocity"]} hint="Each stack: merges at the base, branches in the middle, PR velocity on top" {...chart} />
}

export interface CodeFile {
  path: string
  loc: number
  complexity: number
  /** 0–1 */
  coverage: number
}
export interface ComplexitySpireProps extends Shared {
  files?: CodeFile[]
}
/** 6 · A code city. Footprint = lines of code, height = cyclomatic complexity, colour = test coverage (red = untested). */
export function ComplexitySpire({ files, seed = 4, ...chart }: ComplexitySpireProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const dirs = ["core", "auth", "api", "ui", "db", "utils"]
    const names = ["index", "session", "router", "parser", "store", "client", "hooks", "schema", "worker", "cache", "format", "queue", "guard", "mailer", "layout", "tokens", "migrate", "events"]
    const list =
      files ??
      Array.from({ length: 108 }, (_, i) => {
        const dir = dirs[Math.floor(i / 18)]
        const loc = Math.round(40 + Math.pow(r(), 2.2) * 900)
        return { path: "src/" + dir + "/" + names[i % names.length] + (i >= 18 ? "-" + (i % 7) : "") + ".ts", loc, complexity: Math.round(2 + (loc / 940) * 28 * (0.4 + r())), coverage: Math.min(1, Math.max(0, 0.9 - r() * r() * 1.1 + (dir === "utils" ? 0.1 : 0))) }
      })
    const COLS = 12
    const maxLoc = Math.max(...list.map((f) => f.loc), 1)
    const maxC = Math.max(...list.map((f) => f.complexity), 1)
    const boxes = list.map((f, i) => {
      const gx = i % COLS
      const gy = Math.floor(i / COLS)
      const s = 0.42 + 0.5 * Math.sqrt(f.loc / maxLoc)
      const b = box(cell(gx, gy, s), 0.4 + (f.complexity / maxC) * 9, f.coverage * 4, (gx + gy) / (COLS + list.length / COLS), f.path + "\n" + f.loc + " LOC · complexity " + f.complexity + " · " + Math.round(f.coverage * 100) + "% covered")
      b.alert = f.coverage < 0.5 ? (0.5 - f.coverage) * 2 : 0
      return b
    })
    return { boxes, cols: COLS, zMax: 9.5, label: "Code complexity city: one tower per file. Footprint is size, height is complexity, red means poor test coverage." }
  }, [files, seed])
  return <IsoChart spec={spec} title="Code complexity spire" palette="ocean" legendLabels={["Untested", "Covered"]} hint="Tall and red is where bugs live" {...chart} />
}

export interface UptimeMonolithProps extends Shared {
  rows?: number
  cols?: number
}
/** 7 · A live fleet. Towers breathe with request throughput; latency spikes flare red then recover. */
export function UptimeMonolith({ rows = 6, cols = 8, seed = 2, ...chart }: UptimeMonolithProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const N = rows * cols
    const regions = ["us-east", "us-west", "eu-west", "ap-south"]
    const phase = Array.from({ length: N }, () => r() * 6.28)
    const lat = Array.from({ length: N }, () => 40)
    const spikeUntil = Array.from({ length: N }, () => -1)
    const nextSpike = Array.from({ length: N }, () => 4 + r() * 18)
    const boxes: Box[] = []
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) boxes.push(box(cell(x, y, 0.84), 2, 2, (x + y) / (rows + cols), "node"))
    const tick = (t: number, dt: number) => {
      for (let i = 0; i < N; i++) {
        const thr = Math.max(0.12, Math.min(1, 0.5 + 0.28 * Math.sin(t * 0.6 + phase[i]) + 0.16 * Math.sin(t * 1.7 + phase[i] * 3)))
        if (t > nextSpike[i]) {
          spikeUntil[i] = t + 1.8 + r() * 2.2
          nextSpike[i] = t + 9 + r() * 24
        }
        const goal = t < spikeUntil[i] ? 320 + r() * 90 : 42 + 14 * Math.sin(t + phase[i])
        lat[i] += (goal - lat[i]) * (1 - Math.exp(-dt * 4))
        const b = boxes[i]
        b.h = 0.3 + thr * 7
        b.lv = 1 + thr * 3
        b.alert = Math.max(0, Math.min(1, (lat[i] - 120) / 200))
        b.tip = "node-" + String.fromCharCode(65 + Math.floor(i / cols)) + ((i % cols) + 1) + " · " + regions[i % regions.length] + "\n" + Math.round(thr * 4200) + " req/s · p95 " + Math.round(lat[i]) + " ms" + (b.alert > 0.5 ? " · degraded" : "")
      }
    }
    tick(0, 0.016)
    return { boxes, live: true, tick, cols, zMax: 7.5, label: "Server fleet: tower height is request throughput, red towers have a latency spike." }
  }, [rows, cols, seed])
  return <IsoChart spec={spec} title="Server uptime & latency monolith" palette="github" legendLabels={["Idle", "Busy"]} hint="Red means p95 latency is spiking" {...chart} />
}

export interface PackagePyramidProps extends Shared { }
/** 8 · A stepped dependency pyramid. The foundation tier holds up the platform, libraries and utilities above it. */
export function PackagePyramid({ seed = 6, ...chart }: PackagePyramidProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const stems = ["core", "runtime", "schema", "router", "state", "http", "render", "cache", "logger", "crypto", "stream", "parser", "theme", "i18n", "queue", "utils"]
    const tiers = ["foundation", "platform", "library", "utility", "app"]
    const boxes: Box[] = []
    for (let k = 0; k < 5; k++) {
      const size = 9 - k * 2
      const z0 = k * 1.45
      for (let j = 0; j < size; j++)
        for (let i = 0; i < size; i++) {
          const deps = Math.round(Math.pow(r(), 1.6) * (900 - k * 170) + 12)
          const name = stems[(i * 5 + j * 3 + k) % stems.length] + "-" + ["kit", "js", "lite", "next", "core"][(i + j * 2 + k) % 5]
          boxes.push(box(cell(k + i, k + j, 0.92), z0 + 1.3, Math.min(4, 4 - k * 0.65 + r() * 0.5), k / 4 * 0.75 + r() * 0.2, name + " · " + tiers[k] + " tier\n" + deps + " dependents", z0))
        }
    }
    return { boxes, zMax: 7.5, label: "Dependency pyramid: five stepped tiers from foundation packages up to apps." }
  }, [seed])
  return <IsoChart spec={spec} title="Package dependency pyramid" palette="mono" legendLabels={["Leaf", "Foundation"]} hint="Lower tiers carry everything above them" {...chart} />
}

// ── C · Productivity & growth ──────────────────────────────────────────────

export interface HabitAmphitheaterProps extends Shared {
  habits?: string[]
  /** [habit][day] */
  completed?: boolean[][]
}
/** 9 · A coliseum. Each tier is a habit, each sector a day; done days become seats, the inner ring is the daily goal. */
export function HabitAmphitheater({ habits = ["Meditate", "Read", "Run", "Write", "Practice", "Sleep by 11"], completed, seed = 9, ...chart }: HabitAmphitheaterProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const DAYSN = 30
    const done = completed ?? habits.map((_, t) => Array.from({ length: DAYSN }, () => r() < 0.9 - t * 0.09))
    const A = (Math.PI * 2) / DAYSN
    const boxes: Box[] = []
    habits.forEach((name, t) => {
      for (let d = 0; d < DAYSN; d++) {
        const ok = !!done[t]?.[d]
        const a0 = -Math.PI / 2 + d * A
        const r0 = 4.4 + t * 1.15
        boxes.push(box(sector(r0, r0 + 1.05, a0, a0 + A), ok ? 1.1 + t * 0.75 : 0.25, ok ? 1.6 + t * 0.45 : 0, d / DAYSN, name + " · day " + (d + 1) + "\n" + (ok ? "Done" : "Missed")))
      }
    })
    for (let d = 0; d < DAYSN; d++) {
      const frac = habits.length ? habits.filter((_, t) => done[t]?.[d]).length / habits.length : 0
      const a0 = -Math.PI / 2 + d * A
      boxes.push(box(sector(2.1, 3.6, a0, a0 + A, 0.02), 0.3 + frac * 3.6, frac * 4, d / DAYSN, "Goal ring · day " + (d + 1) + "\n" + Math.round(frac * 100) + "% of habits done"))
    }
    const labels = [0, 7, 14, 21].map((d) => {
      const a = -Math.PI / 2 + (d + 0.5) * A
      return { x: Math.cos(a) * (4.4 + habits.length * 1.15 + 0.9), y: Math.sin(a) * (4.4 + habits.length * 1.15 + 0.9), text: "Day " + (d + 1) }
    })
    return { boxes, labels, cols: DAYSN, zMax: 6.5, label: "Habit amphitheater: one tier per habit, one sector per day, with a goal ring in the centre." }
  }, [habits, completed, seed])
  return <IsoChart spec={spec} title="Habit streak amphitheater" palette="halloween" legendLabels={["Missed", "Done"]} hint="Outer tiers are your hardest habits" {...chart} />
}

export interface PomodoroSkylineProps extends Shared { }
/** 10 · Five workdays × hours. Every finished 25-minute session adds a block to that hour's stack. Replay the day. */
export function PomodoroSkyline({ seed = 12, ...chart }: PomodoroSkylineProps) {
  const [clock, setClock] = React.useState(19)
  const [playing, setPlaying] = React.useState(false)
  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setClock((c) => Math.min(19, c + 0.5)), 320)
    return () => window.clearInterval(id)
  }, [playing])
  React.useEffect(() => {
    if (playing && clock >= 19) setPlaying(false)
  }, [clock, playing])
  const sessions = React.useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: 5 }, () => Array.from({ length: 11 }, (_, h) => (h === 4 ? 0 : Math.min(3, Math.floor(r() * 2.6 + (h > 0 && h < 9 ? 0.5 : -0.2))))))
  }, [seed])
  const spec = React.useMemo<Spec>(() => {
    const boxes: Box[] = []
    for (let d = 0; d < 5; d++)
      for (let hh = 0; hh < 11; hh++) {
        const H = 8 + hh
        const n = sessions[d][hh]
        const base = "" + DAYS[d] + " " + pad2(H) + ":00\n" + n + " focus session" + (n === 1 ? "" : "s") + " · " + n * 25 + " min"
        const o = hh / 10
        boxes.push(box(cell(hh, d), 0.2, 0, o, base))
        for (let j = 1; j <= 3; j++) {
          const z0 = 0.2 + (j - 1) * 1.25
          const shown = j <= n && H + j * 0.25 <= clock
          boxes.push(box(cell(hh, d), shown ? z0 + 1.1 : z0, 2.2 + j * 0.6, o, base, z0))
        }
      }
    const labels = [
      ...DAYS.slice(0, 5).map((t, d) => ({ x: -0.4, y: d + 0.5, text: t, align: "right" as const })),
      ...[0, 2, 4, 6, 8, 10].map((h) => ({ x: h + 0.5, y: 5.8, text: pad2(8 + h) + ":00" })),
    ]
    return { boxes, labels, cols: 44, zMax: 4.2, label: "Pomodoro skyline: completed 25 minute focus sessions per hour across five workdays." }
  }, [sessions, clock])
  return (
    <IsoChart
      spec={spec}
      title="Pomodoro focus skyline"
      palette="ember"
      legendLabels={["Slot", "Session"]}
      hint={clock < 19 ? "It is " + pad2(Math.floor(clock)) + ":" + (clock % 1 ? "30" : "00") + " — sessions land as the day goes" : "One block is one completed 25-minute session"}
      controls={
        <Pill
          active={playing}
          onClick={() => {
            setClock(8)
            setPlaying(true)
          }}
        >
          Replay day
        </Pill>
      }
      {...chart}
    />
  )
}

export interface EnergyTopographyProps extends Shared { }
/** 11 · Eight weeks × 48 half-hours. Height is cognitive bandwidth, colour is mood. */
export function EnergyTopography({ seed = 14, ...chart }: EnergyTopographyProps) {
  const spec = React.useMemo<Spec>(() => {
    const COLS = 48
    const ROWS = 8
    const boxes: Box[] = []
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        const hr = x / 2
        const curve = 0.55 * Math.exp(-((hr - 10.5) ** 2) / 9) + 0.38 * Math.exp(-((hr - 16.5) ** 2) / 10) + 0.08
        const energy = Math.max(0, Math.min(1, curve * (0.75 + fbm(x * 0.12, y * 0.8, seed) * 0.6)))
        const mood = fbm(x * 0.07 + 5, y * 0.55, seed + 9)
        boxes.push(box(cell(x, y, 1.0), 0.3 + energy * 7.5, mood * 4, (y * COLS + x) / (ROWS * COLS), "Week " + (y + 1) + " · " + pad2(Math.floor(hr)) + ":" + (x % 2 ? "30" : "00") + "\nEnergy " + (energy * 10).toFixed(1) + "/10 · mood " + (mood * 10).toFixed(1) + "/10"))
      }
    const labels = [
      ...[0, 6, 12, 18].map((h) => ({ x: h * 2 + 0.5, y: ROWS + 0.9, text: pad2(h) + ":00" })),
      ...[0, 2, 4, 6].map((w) => ({ x: -0.6, y: w + 0.5, text: "Wk " + (w + 1), align: "right" as const })),
    ]
    return { boxes, labels, cols: COLS, zMax: 8, label: "Energy topography: eight weeks of half-hourly cognitive energy, coloured by mood." }
  }, [seed])
  return <IsoChart spec={spec} title="Energy level topography" palette="grape" radius={0} legendLabels={["Low mood", "High mood"]} hint="Height is energy, colour is mood" {...chart} />
}

export interface StepPyramidProps extends Shared {
  /** Initially completed task indices. */
  initialDone?: number[]
}
/** 12 · Four tiers of sub-tasks. Click a block to complete it — it lifts, lights, and the pyramid fills in. */
export function StepPyramid({ initialDone = [0, 1, 2, 7, 8, 30, 31, 60], ...chart }: StepPyramidProps) {
  const [done, setDone] = React.useState<Set<number>>(() => new Set(initialDone))
  const TOTAL = 84
  const spec = React.useMemo<Spec>(() => {
    const boxes: Box[] = []
    let idx = 0
      ;[7, 5, 3, 1].forEach((size, k) => {
        for (let j = 0; j < size; j++)
          for (let i = 0; i < size; i++) {
            const ok = done.has(idx)
            const z0 = k * 1.3
            boxes.push(box(cell(k + i + 0, k + j, 0.92), z0 + (ok ? 1.8 : 1.1), ok ? 3.7 : 0.6, k / 3 * 0.7, "Milestone " + (k + 1) + " · task " + (idx + 1) + "\n" + (ok ? "Done — click to undo" : "To do — click to complete"), z0))
            idx++
          }
      })
    return {
      boxes,
      zMax: 6.2,
      label: "Step pyramid: " + done.size + " of " + TOTAL + " sub-tasks complete. Press Enter on a block to toggle it.",
      onPick: (i: number) =>
        setDone((prev) => {
          const next = new Set(prev)
          if (next.has(i)) next.delete(i)
          else next.add(i)
          return next
        }),
    }
  }, [done])
  return (
    <IsoChart
      spec={spec}
      title={done.size + " / " + TOTAL + " sub-tasks"}
      palette="github"
      legendLabels={["To do", "Done"]}
      hint="Click a block to complete it"
      controls={
        <>
          <Pill onClick={() => setDone((p) => { const n = new Set(p); for (let i = 0; i < TOTAL; i++) if (!n.has(i)) { n.add(i); break } return n })}>Complete next</Pill>
          <Pill onClick={() => setDone(new Set())}>Reset</Pill>
        </>
      }
      {...chart}
    />
  )
}

// ── D · Financial & growth ─────────────────────────────────────────────────

export interface Asset {
  ticker: string
  /** Market value in dollars. */
  value: number
  /** 0–1 volatility. */
  risk: number
  /** Year-to-date return, e.g. 0.12 = +12%. */
  ytd: number
}
export interface PortfolioCityProps extends Shared {
  assets?: Asset[]
}
/** 13 · Assets as towers: height is value, footprint is risk, colour is YTD return (red = losing). */
export function PortfolioCity({ assets, seed = 17, ...chart }: PortfolioCityProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const tickers = ["NVDA", "MSFT", "AAPL", "BND", "VTI", "GLD", "TSLA", "AMZN", "VXUS", "BTC", "ETH", "TLT", "XOM", "JPM", "LLY", "COST", "SHOP", "O", "VNQ", "CASH"]
    const list = assets ?? tickers.map((ticker, i) => ({ ticker, value: Math.round(8000 + Math.pow(r(), 1.8) * 140000), risk: ["BND", "TLT", "CASH", "GLD", "O"].includes(ticker) ? 0.1 + r() * 0.2 : 0.35 + r() * 0.6, ytd: (r() - 0.32) * 0.7 + (i % 3) * 0.02 }))
    const maxV = Math.max(...list.map((a) => a.value), 1)
    const COLS = 5
    const CELL = 2.6
    const boxes = list.map((a, i) => {
      const s = 0.9 + a.risk * 1.5
      const gx = (i % COLS) * CELL + (CELL - s) / 2
      const gy = Math.floor(i / COLS) * CELL + (CELL - s) / 2
      const b = box(rect(gx, gy, s, s), 0.6 + Math.sqrt(a.value / maxV) * 8.5, Math.max(0.4, Math.min(4, ((a.ytd + 0.15) / 0.55) * 4)), (i % COLS + Math.floor(i / COLS)) / 8, a.ticker + " · $" + Math.round(a.value / 1000) + "k\nVolatility " + Math.round(a.risk * 100) + "% · YTD " + (a.ytd >= 0 ? "+" : "") + (a.ytd * 100).toFixed(1) + "%")
      b.alert = a.ytd < 0 ? Math.min(1, -a.ytd / 0.2) : 0
      return b
    })
    return { boxes, cols: COLS, zMax: 9.2, label: "Portfolio city: a tower per asset. Height is value, footprint is volatility, red is a loss." }
  }, [assets, seed])
  return <IsoChart spec={spec} title="Portfolio allocation city" palette="ocean" legendLabels={["Lagging", "Leading"]} hint="Wide towers are volatile · tall towers are large positions" {...chart} />
}

export interface RevenueTerrainProps extends Shared {
  segments?: string[]
  months?: number
  /** First month shown (UTC). */
  start?: string
}
/** 14 · MRR by plan over three years. Flat colour strips in 2D; growth stands up into cliffs in 3D. */
export function RevenueTerrain({ segments = ["Starter", "Pro", "Team", "Business", "Enterprise", "Services"], months = 36, start = "2023-01-01", seed = 19, ...chart }: RevenueTerrainProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const t0 = Date.parse(start)
    const mf = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" })
    const mlabel = (m: number) => mf.format(new Date(Date.UTC(new Date(t0).getUTCFullYear(), new Date(t0).getUTCMonth() + m, 1)))
    const series = segments.map((_, s) => {
      const g = 0.05 + s * 0.012 + r() * 0.01
      const base = 4 + s * 3 + r() * 3
      return Array.from({ length: months }, (_, m) => base * Math.exp(g * m) * (1 + 0.07 * Math.sin(m * 0.9 + s) + (r() - 0.5) * 0.06))
    })
    const maxV = Math.max(...series.flat(), 1)
    const boxes: Box[] = []
    segments.forEach((name, s) => {
      for (let m = 0; m < months; m++) {
        const v = series[s][m]
        boxes.push(box(rect(m + 0.04, s * 1.2 + 0.08, 0.92, 1.04), 0.25 + Math.pow(v / maxV, 0.8) * 9, Math.min(4, (v / maxV) * 4.6), m / (months - 1), name + " · " + mlabel(m) + "\n$" + v.toFixed(1) + "k MRR"))
      }
    })
    const labels = [
      ...segments.map((n, s) => ({ x: -0.4, y: s * 1.2 + 0.6, text: n, align: "right" as const })),
      ...[0, 12, 24, 35].map((m) => ({ x: m + 0.5, y: segments.length * 1.2 + 0.7, text: mlabel(m) })),
    ]
    return { boxes, labels, cols: months, zMax: 9.3, label: "Revenue terrain: monthly recurring revenue by plan over " + months + " months." }
  }, [segments, months, start, seed])
  return <IsoChart spec={spec} title="Revenue velocity terrain" palette="github" legendLabels={["Early", "Today"]} hint="Flip to 3D to watch the growth stand up" {...chart} />
}

export interface TransactionRippleProps extends Shared {
  size?: number
}
/** 15 · Live payment flow. Each transaction drops a ripple of liquidity across the grid — click to drop your own. */
export function TransactionRipple({ size = 26, seed = 23, ...chart }: TransactionRippleProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const N = size
    const ripples: { x: number; y: number; t0: number; amp: number }[] = []
    let now = 0
    let nextAt = 0
    const boxes: Box[] = []
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) boxes.push(box(cell(x, y, 0.94), 0.3, 0, Math.hypot(x - N / 2, y - N / 2) / (N * 0.75), "cell"))
    const spawn = (x: number, y: number, amp: number) => {
      ripples.push({ x, y, t0: now, amp })
      if (ripples.length > 14) ripples.shift()
    }
    const tick = (t: number) => {
      now = t
      if (t > nextAt) {
        spawn(2 + r() * (N - 4), 2 + r() * (N - 4), 1.8 + r() * 2)
        nextAt = t + 0.35 + r() * 0.6
      }
      for (let i = ripples.length - 1; i >= 0; i--) if (t - ripples[i].t0 > 5) ripples.splice(i, 1)
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          let sum = 0
          for (const rp of ripples) {
            const age = t - rp.t0
            const d = Math.hypot(x - rp.x, y - rp.y)
            const k = d - age * 6
            sum += rp.amp * Math.exp(-age * 0.6) * (Math.exp(-(k * k) / 3.2) * (0.55 + 0.45 * Math.cos(k * 1.9)) + 0.6 * Math.exp(-age * 1.2) * Math.exp(-(d * d) / 6))
          }
          const h = Math.min(7.5, 0.25 + Math.max(0, sum))
          const b = boxes[y * N + x]
          b.h = h
          b.lv = Math.min(4, (h / 6) * 4)
          b.tip = "Cell " + x + "," + y + "\n" + Math.round(h * 140) + " tx/s"
        }
    }
    tick(0)
    return { boxes, live: true, tick, cols: N, zMax: 7.6, onPick: (i: number) => spawn(i % N, Math.floor(i / N), 4.2), label: "Transaction ripples: payment events spread liquidity waves across a grid." }
  }, [size, seed])
  return <IsoChart spec={spec} title="Transaction flow matrix" palette="ocean" radius={0.4} legendLabels={["Quiet", "Surge"]} hint="Click any cell to send a payment" {...chart} />
}

// ── E · Experimental & artistic ────────────────────────────────────────────

export interface FrequencyEqualizerProps extends Shared {
  bands?: number
  depth?: number
}
/** 16 · A scrolling spectrum grid: 16 bands wide, 14 frames deep. Simulated music, or your microphone. */
export function FrequencyEqualizer({ bands = 16, depth = 14, seed = 31, ...chart }: FrequencyEqualizerProps) {
  const [mic, setMic] = React.useState(false)
  const makeBuf = (n: number) => new Uint8Array(n)
  const micRef = React.useRef<{ an: AnalyserNode; buf: ReturnType<typeof makeBuf> } | null>(null)
  React.useEffect(() => {
    if (!mic) return
    let stream: MediaStream | undefined
    let actx: AudioContext | undefined
    let cancelled = false
      ; (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop())
            return
          }
          actx = new AudioContext()
          const an = actx.createAnalyser()
          an.fftSize = 128
          an.smoothingTimeConstant = 0.7
          actx.createMediaStreamSource(stream).connect(an)
          micRef.current = { an, buf: makeBuf(an.frequencyBinCount) }
        } catch {
          setMic(false)
        }
      })()
    return () => {
      cancelled = true
      micRef.current = null
      stream?.getTracks().forEach((t) => t.stop())
      void actx?.close()
    }
  }, [mic])
  const spec = React.useMemo<Spec>(() => {
    const hist: number[][] = Array.from({ length: depth }, () => Array(bands).fill(0))
    let acc = 0
    const boxes: Box[] = []
    for (let y = 0; y < depth; y++) for (let x = 0; x < bands; x++) boxes.push(box(cell(x, y, 0.82), 0.2, 0, y / depth, "band"))
    const freq = (b: number) => Math.round(40 * Math.pow(2, b / 2))
    const sample = (t: number): number[] => {
      const m = micRef.current
      if (m) {
        m.an.getByteFrequencyData(m.buf)
        const N = m.buf.length
        return Array.from({ length: bands }, (_, b) => {
          const lo = Math.floor(Math.pow(N, b / bands))
          const hi = Math.max(lo + 1, Math.floor(Math.pow(N, (b + 1) / bands)))
          let s = 0
          for (let k = lo; k < hi; k++) s += m.buf[k]
          return Math.min(1, (s / (hi - lo) / 255) * 1.25)
        })
      }
      const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 4)), 6)
      return Array.from({ length: bands }, (_, b) => Math.max(0, Math.min(1, 0.12 + 0.72 * Math.exp(-b / 5) * (0.3 + 0.7 * beat) + 0.3 * vnoise(b * 0.6, t * 3, seed) * (0.35 + b / bands))))
    }
    const tick = (t: number, dt: number) => {
      acc += dt
      if (acc > 0.075) {
        acc = 0
        hist.shift()
        hist.push(sample(t))
      }
      for (let y = 0; y < depth; y++)
        for (let x = 0; x < bands; x++) {
          const a = hist[y][x]
          const b = boxes[y * bands + x]
          b.h = 0.2 + a * 8
          b.lv = a * 4
          b.tip = freq(x) + " Hz\n" + (a > 0.001 ? Math.round(20 * Math.log10(a)) : -60) + " dB"
        }
    }
    tick(0, 0.1)
    return { boxes, live: true, tick, cols: bands, zMax: 8.3, label: "Frequency equalizer: " + bands + " frequency bands scrolling back through time." }
  }, [bands, depth, seed])
  return (
    <IsoChart
      spec={spec}
      title="Sound frequency equalizer"
      palette="halloween"
      legendLabels={["Quiet", "Loud"]}
      hint={mic ? "Listening to your microphone" : "Simulated music — turn on the mic to react to real sound"}
      controls={<Pill active={mic} onClick={() => setMic((v) => !v)}>{mic ? "Mic on" : "Use mic"}</Pill>}
      {...chart}
    />
  )
}

export interface NeuralActivationProps extends Shared {
  /** Lattice edge length (default 8 → 8×8×7). */
  size?: number
}
/** 17 · A latent space of voxels. Concept clusters drift and pulse; hover a neuron to fire its neighbours. */
export function NeuralActivation({ size = 8, seed = 41, ...chart }: NeuralActivationProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const NX = size
    const NZ = size - 1
    const centers = Array.from({ length: 4 }, () => ({ x: 1.5 + r() * (NX - 3), y: 1.5 + r() * (NX - 3), z: 1 + r() * (NZ - 2), ph: r() * 6.28, g: 0.8 + r() * 0.6, s: 1.1 + r() * 0.6 }))
    const boxes: Box[] = []
    for (let z = 0; z < NZ; z++) for (let y = 0; y < NX; y++) for (let x = 0; x < NX; x++) boxes.push(box(cell(x, y, 0.8), z, 0, z / NZ, "neuron", z))
    const tick = (t: number, _dt: number, hover: number) => {
      const hz = hover >= 0 ? Math.floor(hover / (NX * NX)) : -1
      const hy = hover >= 0 ? Math.floor((hover % (NX * NX)) / NX) : -1
      const hx = hover >= 0 ? hover % NX : -1
      const cs = centers.map((c) => ({ x: c.x + 1.5 * Math.sin(t * 0.3 + c.ph), y: c.y + 1.5 * Math.cos(t * 0.25 + c.ph * 2), z: c.z + 0.8 * Math.sin(t * 0.2 + c.ph * 3), k: c.g * (0.65 + 0.35 * Math.sin(t * 1.3 + c.ph)), s: c.s }))
      for (let z = 0; z < NZ; z++)
        for (let y = 0; y < NX; y++)
          for (let x = 0; x < NX; x++) {
            let a = 0
            for (const c of cs) a += c.k * Math.exp(-((x - c.x) ** 2 + (y - c.y) ** 2 + (z - c.z) ** 2) / (2 * c.s * c.s))
            if (hover >= 0) a += 0.9 * Math.exp(-((x - hx) ** 2 + (y - hy) ** 2 + (z - hz) ** 2) / 3)
            const i = (z * NX + y) * NX + x
            const b = boxes[i]
            if (a < 0.3) {
              b.z0 = z + 0.5
              b.h = z + 0.5
              b.lv = 0
              continue
            }
            const s = 0.35 + 0.6 * Math.min(1, a)
            setRect(b, x + (1 - s) / 2, y + (1 - s) / 2, s, s)
            b.z0 = z + (1 - s) / 2
            b.h = b.z0 + s
            b.lv = Math.min(4, a * 3.2)
            b.tip = "Neuron " + x + "·" + y + "·" + z + "\nActivation " + a.toFixed(2)
          }
    }
    tick(0, 0.016, -1)
    return { boxes, live: true, tick, cols: NX, zMax: NZ + 0.5, label: "Neural activation matrix: glowing voxel clusters in a latent space." }
  }, [size, seed])
  return <IsoChart spec={spec} title="Neural network activation matrix" palette="grape" radius={0.4} legendLabels={["Weak", "Firing"]} hint="Hover a neuron to excite its neighbours · drag to orbit" {...chart} />
}

export interface MatrixRainProps extends Shared {
  cols?: number
  rows?: number
}
/** 18 · Falling character streams. Hover and the glyphs under your pointer resolve into solid blocks, then slowly dissolve. */
export function MatrixRainMonolith({ cols = 30, rows = 20, seed = 66, ...chart }: MatrixRainProps) {
  const spec = React.useMemo<Spec>(() => {
    const r = rng(seed)
    const chars = Array.from("ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾅ0123456789ABCDEF<>+=*")
    const speed = Array.from({ length: cols }, () => 5 + r() * 9)
    const off = Array.from({ length: cols }, () => r() * 60)
    const trail = Array.from({ length: cols }, () => 6 + Math.floor(r() * 9))
    const solid = new Float32Array(cols * rows)
    const boxes: Box[] = []
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) boxes.push(box(cell(x, y, 0.92), 0.2, 0, y / rows, "Stream " + x + " · row " + y))
    const tick = (t: number, dt: number, hover: number) => {
      const hx = hover >= 0 ? hover % cols : -99
      const hy = hover >= 0 ? Math.floor(hover / cols) : -99
      for (let x = 0; x < cols; x++) {
        const head = (t * speed[x] * 0.5 + off[x]) % (rows + trail[x])
        for (let y = 0; y < rows; y++) {
          const i = y * cols + x
          const dist = head - y
          const inten = dist >= 0 && dist < trail[x] ? 1 - dist / trail[x] : 0
          const near = Math.hypot(x - hx, (y - hy) * 1.0) < 3.4 ? 1 : 0
          solid[i] += (near - solid[i]) * (1 - Math.exp(-dt * (near ? 9 : 1.4)))
          const sv = solid[i]
          const b = boxes[i]
          const ci = (i * 31 + Math.floor(t * (5 + (x % 5)))) % chars.length
          b.glyph = chars[ci]
          b.ga = (1 - sv) * inten * 0.95
          b.h = 0.2 + sv * (1.2 + inten * 3.4)
          b.lv = sv * (0.9 + inten * 3.1)
          if (i === hover) b.tip = "Stream " + x + " · row " + y + "\n" + b.glyph + " · " + (sv > 0.5 ? "resolved" : "decoding…")
        }
      }
    }
    tick(0, 0.016, -1)
    return { boxes, live: true, tick, cols, zMax: 5, label: "Matrix digital rain: falling characters that become solid blocks when hovered." }
  }, [cols, rows, seed])
  return <IsoChart spec={spec} title="Matrix digital rain monolith" palette="matrix" radius={0.5} legendLabels={["Stream", "Resolved"]} hint="Hover to resolve the stream into blocks" {...chart} />
}

/** Everything, for galleries. */
export const ISO_BLOCKS = {
  WorkLifeWave,
  MilestoneMountains,
  SeasonalityTerrain,
  GitBranchMatrix,
  ComplexitySpire,
  UptimeMonolith,
  PackagePyramid,
  HabitAmphitheater,
  PomodoroSkyline,
  EnergyTopography,
  StepPyramid,
  PortfolioCity,
  RevenueTerrain,
  TransactionRipple,
  FrequencyEqualizer,
  NeuralActivation,
  MatrixRainMonolith,
}
