import { lerp } from "./motion";
/** Seeded 2D value noise (0..1) with smooth interpolation. */
export function noise2(seed: number) {
  const h = (x: number, y: number) => {
    let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed | 0, 1442695041);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), xf), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), xf), yf);
  };
}
/** Fractal Brownian motion over any noise2 function; result normalised to 0..1. */
export function fbm(n: (x: number, y: number) => number, x: number, y: number, oct = 4) {
  let a = 0.5, f = 1, s = 0, m = 0;
  for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f); m += a; a *= 0.5; f *= 2; }
  return s / m;
}
