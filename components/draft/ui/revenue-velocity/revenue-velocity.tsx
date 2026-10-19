"use client"

import * as React from "react"

/**
 * REVENUE VELOCITY TERRAIN
 *
 * An interactive, 3D animated financial terrain visualizing 48 months of MRR growth
 * sweeping into a dramatic revenue cliff. Features a continuous live pulse wave,
 * hover tooltips with monthly revenue figures, drag-to-orbit 3D camera,
 * interactive legend highlighting, keyboard navigation, and full light/dark mode support.
 */

// #region Math & Geometry
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

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
const shade = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k]
const cssRgb = (c: RGB, a = 1) =>
  a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`

export type PaletteName = "aurora" | "ocean" | "github" | "ember" | "grape" | "halloween" | "mono" | "candy"

export const PALETTES: Record<PaletteName, { light: string[]; dark: string[] }> = {
  aurora: {
    light: ["#c8f7e4", "#6fe3c0", "#2bb3a3", "#0b5f66"],
    dark: ["#0b2f3a", "#0f6b6b", "#19c1a5", "#8affd8"],
  },
  ocean: {
    light: ["#b8e3f5", "#6ec3eb", "#2a8fd1", "#0b4f8a"],
    dark: ["#0c2d4a", "#12508a", "#2a88d8", "#7cc7ff"],
  },
  github: {
    light: ["#c6e48b", "#7bc96f", "#239a3b", "#196127"],
    dark: ["#0e4429", "#006d32", "#26a641", "#39d353"],
  },
  ember: {
    light: ["#fde2c4", "#fbad6e", "#f06b3a", "#b3261e"],
    dark: ["#4a1a10", "#8f2f16", "#e0572a", "#ffa46b"],
  },
  grape: {
    light: ["#e4d4fb", "#b794f4", "#805ad5", "#44337a"],
    dark: ["#2d1f4f", "#553c9a", "#8b5cf6", "#c4b5fd"],
  },
  halloween: {
    light: ["#ffee4a", "#ffc501", "#fe9600", "#b33c00"],
    dark: ["#631c03", "#bd561d", "#fa7a18", "#fddf68"],
  },
  mono: {
    light: ["#d4d4d4", "#a3a3a3", "#525252", "#171717"],
    dark: ["#333333", "#5c5c5c", "#a3a3a3", "#fafafa"],
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

export interface Box {
  x: number
  y: number
  w: number
  d: number
  h: number
  h0?: number
  z0?: number
  level: number
  rot?: number
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

const lv = (v: number, peak = 0.72) =>
  v <= 0.001 ? 0 : v >= peak ? 4 : v > peak * 0.66 ? 3 : v > peak * 0.33 ? 2 : 1

export interface View {
  cs: number
  sn: number
  se: number
  ce: number
  s: number
  ox: number
  oy: number
}

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
// #endregion

// #region Engine Stage
export interface SceneSpec {
  boxes: Box[]
  animate?: (boxes: Box[], t: number, dt: number) => void
  navCols?: number
  pad?: number
  yaw?: number
  elev?: number
  zoom?: number
}

const DEFAULT_YAW = Math.PI / 4
const DEFAULT_ELEV = (35 * Math.PI) / 180
const MUTED = "var(--color-muted-foreground, #8a8a8a)"

export interface BlockStageProps {
  title: React.ReactNode
  hint?: string
  spec: SceneSpec
  palette?: PaletteInput
  autoRotate?: number
  orbit?: boolean
  height?: number
  legend?: boolean
  className?: string
}

export function BlockStage({
  title,
  hint,
  spec,
  palette = "aurora",
  autoRotate = 0.14,
  orbit = true,
  height = 320,
  legend = true,
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
    const ctx = canvas.getContext("2d")
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

    const retheme = () => {
      const cs = getComputedStyle(root)
      const doc = document.documentElement
      const isDocDark =
        doc.classList.contains("dark") ||
        document.body?.classList.contains("dark") ||
        doc.getAttribute("data-theme") === "dark" ||
        darkMq.matches

      fg = toRGB(cs.color, isDocDark ? [240, 240, 240] : FG_FALLBACK)
      const b = toRGB(cs.backgroundColor, isDocDark ? [20, 20, 20] : BG_FALLBACK)
      bg = b && b[0] + b[1] + b[2] > 0 ? b : isDocDark ? [20, 20, 20] : BG_FALLBACK
      isDark = isDocDark || lum(bg) < 0.45

      const pal = resolvePalette(cfg.current.palette, isDark)
      const empty = mixRGB(bg, fg, isDark ? 0.12 : 0.08)
      const all: RGB[] = [empty, ...pal.map((c) => toRGB(c, FG_FALLBACK))]
      for (let k = 0; k < 5; k++) {
        for (let ch = 0; ch < 3; ch++) colGoal[k * 3 + ch] = all[k][ch]
      }
      if (!colReady || reduced) {
        col.set(colGoal)
        colReady = true
      }
      const sw = all.map((c) => cssRgb(c))
      cfg.current.setTheme((prev) =>
        prev.dark === isDark && prev.swatches.join() === sw.join()
          ? prev
          : { dark: isDark, swatches: sw, accent: sw[4] },
      )
      kick()
    }

    const relayout = () => {
      const w = Math.round(stage.clientWidth)
      const h = Math.round(stage.clientHeight)
      if (!w || !h) return
      W = w
      H = h
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      draw()
    }

    const draw = () => {
      if (!W || !H) return
      const sp = cfg.current.spec
      const yawA = clamp((sp.yaw ?? DEFAULT_YAW) + yaw, 0.06, Math.PI / 2 - 0.06)
      const elevA = clamp((sp.elev ?? DEFAULT_ELEV) + elev, 0.16, 1.24)
      const cs = Math.cos(yawA)
      const sn = Math.sin(yawA)
      const se = Math.sin(elevA)
      const ce = Math.cos(elevA)

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

      for (let i = 0; i < n; i++) {
        const b = bx[i]
        depth[i] = (b.x + b.w / 2) * sn + (b.y + b.d / 2) * cs
      }
      order.sort((a, c) => depth[a] - depth[c])

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
          ctx.fillStyle = cssRgb(shade(base, 0.84))
          ctx.fill()
        }
        if (tall > 0.3 && hw * sn * s > 0.2) {
          ctx.beginPath()
          quadPath(ctx, polys, o + 16)
          ctx.fillStyle = cssRgb(shade(base, 0.66))
          ctx.fill()
        }

        ctx.beginPath()
        quadPath(ctx, polys, o, Math.min(3, s * Math.min(b.w, b.d) * 0.22))
        ctx.fillStyle = cssRgb(base)
        ctx.fill()

        if (outline > 0.02) {
          ctx.strokeStyle = cssRgb(fg, 0.07)
          ctx.lineWidth = 1
          ctx.stroke()
        }
        if (hv > 0.02) {
          ctx.strokeStyle = cssRgb(fg, 0.85 * hv)
          ctx.lineWidth = 1.4
          ctx.stroke()
        }
      }

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

    const refreshActive = () => {
      const next = hovered >= 0 ? hovered : pinned
      if (next === activeIdx) return
      activeIdx = next
      cfg.current.setActive(next)
      if (next >= 0) {
        const b = bx[next]
        cfg.current.setAnnounce(b.label ?? b.key ?? "")
      }
      kick()
    }

    const hit = (x: number, y: number): number => {
      for (let k = n - 1; k >= 0; k--) {
        const i = order[k]
        const o = i * 24
        if (
          pointInQuad(polys, o, x, y) ||
          pointInQuad(polys, o + 8, x, y) ||
          pointInQuad(polys, o + 16, x, y)
        )
          return i
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
        // pointer capture
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
      cfg.current.setAnnounce(bx[i].label ?? bx[i].key ?? "")
      kick()
    }

    const onBlur = () => {
      pinned = -1
      refreshActive()
    }

    load()
    retheme()
    relayout()

    const ro = new ResizeObserver(() => relayout())
    ro.observe(stage)

    const mo = new MutationObserver(retheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    if (document.body) {
      mo.observe(document.body, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    }

    const onReduce = () => {
      reduced = reduceMq.matches
      kick()
    }
    reduceMq.addEventListener("change", onReduce)
    darkMq.addEventListener("change", retheme)

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
      darkMq.removeEventListener("change", retheme)
      canvas.removeEventListener("pointerdown", onDown)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerup", onUp)
      canvas.removeEventListener("pointercancel", onLeave)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("keydown", onKey)
      canvas.removeEventListener("blur", onBlur)
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

  React.useLayoutEffect(() => {
    const tip = tipRef.current
    if (tip && active >= 0) {
      engineRef.current?.kick()
    }
  }, [active])

  const activeBox = active >= 0 ? spec.boxes[active] : null
  const tipText = activeBox ? (activeBox.label ?? activeBox.key ?? "") : ""
  const levelNames = ["Base", "Light", "Medium", "Heavy", "Peak"]

  return (
    <section
      ref={rootRef}
      className={
        "relative w-full overflow-hidden rounded-2xl border font-sans shadow-sm transition-colors duration-200 " +
        "border-neutral-200 bg-white text-neutral-900 " +
        "dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 " +
        className
      }
      style={{
        background: "var(--color-card, var(--color-background, inherit))",
        color: "var(--color-card-foreground, var(--color-foreground, inherit))",
        borderColor: "var(--color-border, inherit)",
      }}
    >
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-5 pt-4 pb-2">
        <div>
          <h3 className="m-0 text-sm font-semibold tracking-tight sm:text-base">{title}</h3>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Monthly recurring revenue trajectory · 4-year financial cliff
          </p>
        </div>
      </header>

      <div ref={stageRef} className="relative w-full" style={{ height }}>
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label={
            typeof title === "string"
              ? `${title}. Interactive 3D revenue terrain. Drag to orbit, hover for figures.`
              : "Interactive 3D revenue terrain."
          }
          className="absolute inset-0 block outline-none"
          style={{ maxWidth: "none", touchAction: orbit ? "none" : "auto" }}
        />

        <div
          ref={tipRef}
          role="tooltip"
          aria-hidden={active < 0}
          className="pointer-events-none absolute top-0 left-0 z-30 whitespace-nowrap rounded-lg border border-neutral-700/30 bg-neutral-900/95 px-3 py-1.5 text-xs text-white shadow-xl backdrop-blur-md transition-opacity duration-150 dark:border-neutral-600/40 dark:bg-neutral-100/95 dark:text-neutral-900 motion-reduce:transition-none"
          style={{
            opacity: active >= 0 ? 1 : 0,
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
              borderTop: "5px solid currentColor",
            }}
          />
        </div>
      </div>

      <footer
        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 pt-2 pb-4 text-xs text-neutral-500 dark:text-neutral-400"
      >
        <span className="min-w-0 flex-1 truncate">
          {hint ?? "Drag to orbit · hover a month · arrow keys to explore"}
        </span>
        {legend ? (
          <div className="flex items-center gap-1.5" onMouseLeave={() => setLegendLevel(-1)}>
            <span className="text-[11px] mr-0.5">Early</span>
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
                onClick={() => setLegendLevel((curr) => (curr === i ? -1 : i))}
                className="h-3 w-3 cursor-pointer rounded-xs border-0 p-0 transition-transform duration-200 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)" }}
              />
            ))}
            <span className="text-[11px] ml-0.5">Scale</span>
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

// #region Revenue Velocity Component
export interface RevenueVelocityProps {
  months?: number
  peakArr?: number
  palette?: PaletteInput
  title?: React.ReactNode
  hint?: string
  className?: string
}

/**
 * 14 · MRR growth as a wave that sweeps into a financial cliff.
 */
export function RevenueVelocity({
  months = 48,
  peakArr = 240,
  palette = "aurora",
  title = "Revenue velocity terrain",
  hint = "Flat 2D growth sweeping into a 3D revenue cliff",
  className = "",
}: RevenueVelocityProps) {
  const boxes = React.useMemo(() => {
    const out: Box[] = []
    for (let m = 0; m < months; m++) {
      const growth = Math.pow(m / (months - 1), 2.4)
      const wave = Math.sin(m * 0.55) * 0.14
      const v = clamp01(growth + wave * growth)
      out.push(
        box(m * 1.02, 0, 0.94, 3, 0.25 + v * 9, lv(v, 0.9), {
          key: `m${m}`,
          label: `Month ${m + 1} — $${(v * peakArr).toFixed(1)}k MRR`,
        }),
      )
    }
    return out
  }, [months, peakArr])

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
      title={title}
      hint={hint}
      palette={palette}
      spec={{ boxes, animate, navCols: 1, zoom: 0.92, yaw: 0.55, elev: 0.42 }}
      legend
      className={className}
    />
  )
}

export default RevenueVelocity
