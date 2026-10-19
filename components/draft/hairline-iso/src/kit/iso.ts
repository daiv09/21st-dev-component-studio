/** kit/iso.ts — isometric projection, colour helpers and the box primitive. */
export type V3 = [number, number, number];
export type View = { s: number; ox: number; oy: number };
const K = 0.8660254;

export const iso = (x: number, y: number, z: number, s = 1, ox = 0, oy = 0): [number, number] =>
  [ox + (x - y) * K * s, oy + (x + y) * 0.5 * s - z * s];
export const proj = (v: View, x: number, y: number, z = 0) => iso(x, y, z, v.s, v.ox, v.oy);
export const unIso = (px: number, py: number, z = 0, s = 1, ox = 0, oy = 0): [number, number] => {
  const a = (px - ox) / (K * s), b = (py - oy + z * s) / (0.5 * s);
  return [(a + b) / 2, (b - a) / 2];
};
/** Screen point → world (x,y) on the horizontal plane at height z. */
export const unproj = (v: View, px: number, py: number, z = 0) => unIso(px, py, z, v.s, v.ox, v.oy);
/** Painter's sort key: larger = closer to the viewer. */
export const depth = (x: number, y: number, z = 0) => x + y + z * 0.01;

// ---- colour ----
let probe: CanvasRenderingContext2D | null = null;
const cache = new Map<string, [number, number, number, number]>();
/** Resolve any CSS colour (hex, rgb, hsl, oklch, var-resolved) to [r,g,b,a]. */
export function rgba(color: string): [number, number, number, number] {
  const hit = cache.get(color); if (hit) return hit;
  if (!probe) {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    probe = cv.getContext("2d", { willReadFrequently: true })!;
  }
  probe.clearRect(0, 0, 1, 1); probe.fillStyle = "#000"; probe.fillStyle = color; probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  const out: [number, number, number, number] = [d[0], d[1], d[2], d[3] / 255];
  if (cache.size > 400) cache.clear();
  cache.set(color, out); return out;
}
const sh = new Map<string, string>();
/** k<1 darkens, k>1 lightens toward white. */
export function shade(color: string, k: number): string {
  const key = color + "|" + k; const hit = sh.get(key); if (hit) return hit;
  const [r, g, b] = rgba(color);
  const f = (c: number) => Math.round(k <= 1 ? c * k : c + (255 - c) * (k - 1));
  const out = `rgb(${f(r)},${f(g)},${f(b)})`;
  if (sh.size > 800) sh.clear();
  sh.set(key, out); return out;
}
export function mix(a: string, b: string, t: number): string {
  const A = rgba(a), B = rgba(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}
export function alpha(color: string, a: number): string {
  const [r, g, b] = rgba(color); return `rgba(${r},${g},${b},${a})`;
}

// ---- primitives ----
export function poly(g: CanvasRenderingContext2D, pts: [number, number][], fill?: string, stroke?: string, lw = 1) {
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
}
export function line(g: CanvasRenderingContext2D, a: [number, number], b: [number, number], stroke: string, lw = 1) {
  g.strokeStyle = stroke; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
}
export function dot(g: CanvasRenderingContext2D, p: [number, number], r: number, fill: string) {
  g.fillStyle = fill; g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fill();
}
export function text(g: CanvasRenderingContext2D, t: string, x: number, y: number, color: string, size = 11, align: CanvasTextAlign = "center", weight = "500") {
  g.font = `${weight} ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = color; g.fillText(t, x, y);
}
export type Faces = { t: number; l: number; r: number };
const FACES: Faces = { t: 1.15, l: 0.8, r: 0.6 };
/** Axis-aligned iso box (x→right-down, y→left-down, z up). Visible faces: top, +y ("left"), +x ("right"). */
export function box(g: CanvasRenderingContext2D, v: View, x: number, y: number, z: number,
  w: number, d: number, h: number, base: string, edge: string, k: Faces = FACES) {
  const P = (a: number, b: number, c: number) => proj(v, a, b, c);
  poly(g, [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], shade(base, k.t), edge);
  poly(g, [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], shade(base, k.l), edge);
  poly(g, [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], shade(base, k.r), edge);
}
export function wire(g: CanvasRenderingContext2D, v: View, x: number, y: number, z: number, w: number, d: number, h: number, stroke: string) {
  const P = (a: number, b: number, c: number) => proj(v, a, b, c);
  g.strokeStyle = stroke; g.lineWidth = 1;
  const c = [0, 1].flatMap((i) => [0, 1].flatMap((j) => [0, 1].map((k) => P(x + i * w, y + j * d, z + k * h))));
  g.beginPath();
  for (const [a, b] of [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]]) { g.moveTo(c[a][0], c[a][1]); g.lineTo(c[b][0], c[b][1]); }
  g.stroke();
}
/** Points of a circle in 3D. axis = the circle's normal. */
export function circle(v: View, cx: number, cy: number, cz: number, r: number, axis: "x" | "y" | "z", n = 40, rot = 0): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2, c = Math.cos(a) * r, s = Math.sin(a) * r;
    out.push(axis === "x" ? proj(v, cx, cy + c, cz + s) : axis === "y" ? proj(v, cx + c, cy, cz + s) : proj(v, cx + c, cy + s, cz));
  }
  return out;
}
/** Ground grid (flat) between [x0,x1]×[y0,y1] with the given step. */
export function grid(g: CanvasRenderingContext2D, v: View, x0: number, x1: number, y0: number, y1: number, step: number, stroke: string, z = 0) {
  g.strokeStyle = stroke; g.lineWidth = 1; g.beginPath();
  for (let x = x0; x <= x1 + 1e-6; x += step) { const a = proj(v, x, y0, z), b = proj(v, x, y1, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (let y = y0; y <= y1 + 1e-6; y += step) { const a = proj(v, x0, y, z), b = proj(v, x1, y, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  g.stroke();
}
