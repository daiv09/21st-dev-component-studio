"use client"

import * as React from "react"

/**
 * AURORA CURTAIN
 *
 * An interactive, 3D animated electromagnetic curtain of thin vertical slabs.
 * Features 3 drifting atmospheric layers modulated by fractal Brownian noise
 * and harmonic wave oscillation. Supports drag-to-orbit 3D camera, hover inspection,
 * intensity level highlighting, full light/dark theme adaptation, and responsive canvas sizing.
 */

// #region Math, Noise & Geometry
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Cheap 2D value noise */
const vnoise = (x: number, y: number) => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  return lerp(lerp(hash2(xi, yi), hash2(xi + 1, yi), u), lerp(hash2(xi, yi + 1), hash2(xi + 1, yi + 1), u), v)
}

/** Fractal brownian motion (fbm) */
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

export interface BlockStageProps {
  title: React.ReactNode
  subtitle?: string
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
  subtitle,
  hint,
  spec,
  palette = "aurora",
  autoRotate = 0.16,
  orbit = true,
  height = 360,
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

    const computeColors = (instant = false) => {
      const cs = getComputedStyle(root)
      const isTailwindDark = root.classList.contains("dark") || !!root.closest(".dark")
      isDark = isTailwindDark || darkMq.matches
      fg = toRGB(cs.color, isDark ? [235, 235, 235] : FG_FALLBACK)
      bg = toRGB(cs.backgroundColor, isDark ? [10, 10, 10] : BG_FALLBACK)

      const hexes = resolvePalette(cfg.current.palette, isDark)
      const swatches = hexes.slice()
      const c0: RGB = mixRGB(bg, toRGB(hexes[0], [100, 100, 100]), isDark ? 0.45 : 0.28)
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
      H = r.height || cfg.current.spec.pad || 360
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
          cfg.current.setAnnounce(b.label ?? b.key ?? `Block ${next + 1}`)
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
      const cx = b.x + b.w / 2
      const cy = b.y + b.d / 2
      const z1 = (b.z0 ?? 0) + b.h + 0.45
      const p = projectPoint(view, cx, cy, z1)
      const half = tipW / 2
      const tx = clamp(p[0], half + 6, W - half - 6)
      tip.style.transform = `translate(${(tx - half).toFixed(1)}px, ${(p[1] - 10).toFixed(1)}px) translateY(-100%)`
      tip.style.setProperty("--arrow", `${(p[0] - tx + half).toFixed(1)}px`)
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
        } else {
          col[k] = colGoal[k]
        }
      }

      const kh = reduced ? 1 : 1 - Math.exp(-dt * 14)
      const kd = reduced ? 1 : 1 - Math.exp(-dt * 11)
      const leg = cfg.current.legendLevel
      for (let i = 0; i < n; i++) {
        const hg = i === activeIdx ? 1 : 0
        if (Math.abs(hg - hov[i]) > 0.005) {
          hov[i] += (hg - hov[i]) * kh
          moving = true
        } else {
          hov[i] = hg
        }

        const dg = leg >= 0 && bx[i].level !== leg ? 1 : 0
        if (Math.abs(dg - dim[i]) > 0.005) {
          dim[i] += (dg - dim[i]) * kd
          moving = true
        } else {
          dim[i] = dg
        }
      }

      if (cfg.current.spec.animate && !reduced) {
        cfg.current.spec.animate(bx, t, dt)
        moving = true
      }

      render()
      positionTip()

      if (moving && visible) kick()
    }

    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }

    const render = () => {
      ctx.save()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)

      const cs = Math.cos(DEFAULT_YAW + yaw)
      const sn = Math.sin(DEFAULT_YAW + yaw)
      const se = Math.sin(DEFAULT_ELEV + elev)
      const ce = Math.cos(DEFAULT_ELEV + elev)

      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity
      for (let i = 0; i < n; i++) {
        const b = bx[i]
        const z0 = b.z0 ?? 0
        const z1 = z0 + b.h
        const cxs = [b.x, b.x + b.w]
        const cys = [b.y, b.y + b.d]
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

      const pad = cfg.current.spec.pad ?? 28
      const avW = Math.max(1, W - pad * 2)
      const avH = Math.max(1, H - pad * 2)
      const spanX = Math.max(1e-4, maxX - minX)
      const spanY = Math.max(1e-4, maxY - minY)
      const s = Math.min(avW / spanX, avH / spanY) * (cfg.current.spec.zoom ?? 1)
      const ox = W / 2 - ((minX + maxX) / 2) * s
      const oy = H / 2 - ((minY + maxY) / 2) * s

      view = { cs, sn, se, ce, s, ox, oy }

      for (let i = 0; i < n; i++) {
        const b = bx[i]
        const cx = b.x + b.w / 2
        const cy = b.y + b.d / 2
        depth[i] = (cx * sn + cy * cs) * ce + (b.z0 ?? 0) * se
      }
      order.sort((ia, ib) => depth[ia] - depth[ib])

      const bgLum = lum(bg)
      const isCanvasDark = bgLum < 0.45

      const topLight = isCanvasDark ? 1.15 : 1.05
      const leftLight = isCanvasDark ? 0.85 : 0.92
      const rightLight = isCanvasDark ? 0.65 : 0.78

      for (let k = 0; k < n; k++) {
        const i = order[k]
        const b = bx[i]
        const z0 = b.z0 ?? 0
        const z1 = z0 + b.h
        const x0 = b.x, x1 = b.x + b.w
        const y0 = b.y, y1 = b.y + b.d

        const pTop0 = projectPoint(view, x0, y0, z1)
        const pTop1 = projectPoint(view, x1, y0, z1)
        const pTop2 = projectPoint(view, x1, y1, z1)
        const pTop3 = projectPoint(view, x0, y1, z1)

        const pBot1 = projectPoint(view, x1, y0, z0)
        const pBot2 = projectPoint(view, x1, y1, z0)
        const pBot3 = projectPoint(view, x0, y1, z0)

        const o = i * 24
        polys[o] = pTop0[0]; polys[o + 1] = pTop0[1]
        polys[o + 2] = pTop1[0]; polys[o + 3] = pTop1[1]
        polys[o + 4] = pTop2[0]; polys[o + 5] = pTop2[1]
        polys[o + 6] = pTop3[0]; polys[o + 7] = pTop3[1]

        polys[o + 8] = pTop3[0]; polys[o + 9] = pTop3[1]
        polys[o + 10] = pTop2[0]; polys[o + 11] = pTop2[1]
        polys[o + 12] = pBot2[0]; polys[o + 13] = pBot2[1]
        polys[o + 14] = pBot3[0]; polys[o + 15] = pBot3[1]

        polys[o + 16] = pTop1[0]; polys[o + 17] = pTop1[1]
        polys[o + 18] = pTop2[0]; polys[o + 19] = pTop2[1]
        polys[o + 20] = pBot2[0]; polys[o + 21] = pBot2[1]
        polys[o + 22] = pBot1[0]; polys[o + 23] = pBot1[1]

        const lvIdx = clamp(b.level | 0, 0, 4)
        const baseCol: RGB = [col[lvIdx * 3], col[lvIdx * 3 + 1], col[lvIdx * 3 + 2]]
        const hv = hov[i]
        const dm = dim[i]

        let topC = shade(baseCol, topLight)
        let leftC = shade(baseCol, leftLight)
        let rightC = shade(baseCol, rightLight)

        if (b.glow) {
          const glowCol: RGB = isCanvasDark ? [210, 255, 240] : [80, 240, 200]
          topC = mixRGB(topC, glowCol, clamp01(b.glow))
          leftC = mixRGB(leftC, glowCol, clamp01(b.glow * 0.8))
          rightC = mixRGB(rightC, glowCol, clamp01(b.glow * 0.6))
        }

        if (hv > 0.001) {
          const hCol: RGB = isCanvasDark ? [255, 255, 255] : [20, 20, 20]
          topC = mixRGB(topC, hCol, hv * 0.3)
          leftC = mixRGB(leftC, hCol, hv * 0.25)
          rightC = mixRGB(rightC, hCol, hv * 0.2)
        }

        if (dm > 0.001) {
          topC = mixRGB(topC, bg, dm * 0.75)
          leftC = mixRGB(leftC, bg, dm * 0.75)
          rightC = mixRGB(rightC, bg, dm * 0.75)
        }

        // Left face
        ctx.fillStyle = cssRgb(leftC)
        ctx.beginPath()
        quadPath(ctx, polys, o + 8)
        ctx.fill()

        // Right face
        ctx.fillStyle = cssRgb(rightC)
        ctx.beginPath()
        quadPath(ctx, polys, o + 16)
        ctx.fill()

        // Top face
        ctx.fillStyle = cssRgb(topC)
        ctx.beginPath()
        quadPath(ctx, polys, o)
        ctx.fill()

        // Subtle wireframe stroke
        ctx.strokeStyle = isCanvasDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
        ctx.lineWidth = 0.8
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
    let drag: { id: number; x: number; y: number; yaw: number; elev: number; moved: boolean } | null = null

    const onDown = (ev: PointerEvent) => {
      if (ev.button !== 0 || !cfg.current.orbit) return
      drag = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, yaw: yawGoal, elev: elevGoal, moved: false }
      dragging = true
      try {
        canvas.setPointerCapture(ev.pointerId)
      } catch {}
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
        canvas.style.cursor = i >= 0 ? "pointer" : "default"
        refreshActive()
        kick()
      }
    }

    const onUp = (ev: PointerEvent) => {
      if (!drag || ev.pointerId !== drag.id) return
      const moved = drag.moved
      dragging = false
      drag = null
      canvas.style.cursor = "default"
      try {
        canvas.releasePointerCapture(ev.pointerId)
      } catch {}
      if (!moved) {
        const [x, y] = local(ev)
        const i = hit(x, y)
        pinned = pinned === i ? -1 : i
        refreshActive()
        kick()
      }
    }

    const onLeave = () => {
      if (dragging) return
      if (hovered !== -1) {
        hovered = -1
        refreshActive()
        kick()
      }
    }

    const onKey = (ev: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(ev.key)) return
      ev.preventDefault()
      const cols = cfg.current.spec.navCols || 3
      let cur = activeIdx >= 0 ? activeIdx : 0
      if (ev.key === "ArrowRight") cur = Math.min(n - 1, cur + 1)
      else if (ev.key === "ArrowLeft") cur = Math.max(0, cur - 1)
      else if (ev.key === "ArrowDown") cur = Math.min(n - 1, cur + cols)
      else if (ev.key === "ArrowUp") cur = Math.max(0, cur - cols)
      else if (ev.key === "Home") cur = 0
      else if (ev.key === "End") cur = n - 1
      else if (ev.key === "Escape") {
        pinned = -1
        hovered = -1
        refreshActive()
        kick()
        return
      }
      pinned = cur
      refreshActive()
      kick()
    }

    const onBlur = () => {
      pinned = -1
      hovered = -1
      refreshActive()
      kick()
    }

    canvas.addEventListener("pointerdown", onDown)
    canvas.addEventListener("pointermove", onMove)
    canvas.addEventListener("pointerup", onUp)
    canvas.addEventListener("pointercancel", onLeave)
    canvas.addEventListener("pointerleave", onLeave)
    canvas.addEventListener("keydown", onKey)
    canvas.addEventListener("blur", onBlur)

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

    engineRef.current = { load, kick, retheme }
    load()
    resize()

    return () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      obs.disconnect()
      darkMq.removeEventListener("change", darkHandler)
      reduceMq.removeEventListener("change", reduceHandler)
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
            {subtitle ?? "Three layers of light drifting across the sky"}
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
              ? `${title}. Interactive 3D aurora curtain. Drag to orbit, hover for intensity details.`
              : "Interactive 3D aurora curtain."
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
          {hint ?? "Drag to orbit · hover a pillar · arrow keys to explore"}
        </span>
        {legend ? (
          <div className="flex items-center gap-1.5" onMouseLeave={() => setLegendLevel(-1)}>
            <span className="text-[11px] mr-0.5">Quiet</span>
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
            <span className="text-[11px] ml-0.5">Surge</span>
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

// #region Aurora Curtain Component
export interface AuroraCurtainProps {
  columns?: number
  layers?: number
  palette?: PaletteInput
  title?: React.ReactNode
  subtitle?: string
  hint?: string
  className?: string
  autoRotate?: number
  height?: number
}

/**
 * 25 · An aurora curtain of thin vertical slabs drifting across the sky.
 */
export function AuroraCurtain({
  columns = 64,
  layers = 3,
  palette = "aurora",
  title = "Aurora Curtain",
  subtitle = "Atmospheric electromagnetic ribbon · dynamic wave curtain",
  hint = "Three layers of light drifting across the sky · drag to rotate",
  className = "",
  autoRotate = 0.16,
  height = 360,
}: AuroraCurtainProps) {
  const boxes = React.useMemo(() => {
    const out: Box[] = []
    for (let i = 0; i < columns; i++) {
      for (let layer = 0; layer < layers; layer++) {
        const v = clamp01(fbm(i * 0.13, layer * 4.2, 3) + Math.sin(i * 0.12) * 0.2)
        out.push(
          box(i * 0.62, layer * 1.7, 0.42, 1.5, 0.4 + v * 9, lv(v, 0.85), {
            key: `${i}-${layer}`,
            label: `Emitter ${i + 1} · Layer ${layer + 1} — intensity ${(v * 100).toFixed(0)}%`,
          }),
        )
      }
    }
    return out
  }, [columns, layers])

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
      title={title}
      subtitle={subtitle}
      hint={hint}
      palette={palette}
      spec={{ boxes, animate, navCols: layers, zoom: 0.86, pad: 26, yaw: 0.32, elev: 0.5 }}
      legend
      height={height}
      autoRotate={autoRotate}
      className={className}
    />
  )
}

export default AuroraCurtain
