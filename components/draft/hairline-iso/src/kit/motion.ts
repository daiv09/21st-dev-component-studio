export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Frame-rate independent exponential smoothing. k ≈ responsiveness (1/s). */
export const damp = (a: number, b: number, k: number, dt: number) => lerp(a, b, 1 - Math.exp(-k * dt));
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export type Spring = { x: number; v: number };
/** Semi-implicit spring toward `target`. k = stiffness, c = damping. Returns new x. */
export function spring(s: Spring, target: number, k: number, c: number, dt: number) {
  s.v += (k * (target - s.x) - c * s.v) * dt; s.x += s.v * dt; return s.x;
}
/** Explicit 1D wave step for ripples (stable if c*dt < dx). */
export function wave(u: Float32Array, v: Float32Array, c: number, d: number, dt: number) {
  for (let i = 1; i < u.length - 1; i++) v[i] += c * c * (u[i - 1] - 2 * u[i] + u[i + 1]) * dt - d * v[i] * dt;
  for (let i = 0; i < u.length; i++) u[i] += v[i] * dt;
}
/** Small seeded PRNG so every figure looks identical on server/client and between reloads. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** Fixed-step runner: calls `step(h)` as many times as fits in dt. */
export function fixed(acc: { v: number }, dt: number, h: number, step: (h: number) => void) {
  acc.v += dt; let n = 0;
  while (acc.v >= h && n++ < 12) { step(h); acc.v -= h; }
  if (acc.v > h * 12) acc.v = 0;
}
