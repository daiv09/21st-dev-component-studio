import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, text, type View } from "../../kit/iso";
import { clamp, damp } from "../../kit/motion";
import { fbm, noise2 } from "../../kit/noise";

/**
 * Procedural Terrain Generator — fBm value-noise voxel columns.
 * Three canvas-drawn sliders (drag, or ↑/↓ choose + ←/→ adjust): ELEVATION · WATER · SUN.
 * The sun slider rotates the light, which re-shades each column's two visible walls.
 */
const N = 18, UNIT = 0.45, NAMES = ["ELEVATION", "WATER", "SUN"];
export function mount(c: EngineCtx): EngineInstance {
  const noise = noise2(77);
  const base = Array.from({ length: N }, (_, j) => Array.from({ length: N }, (_, i) => fbm(noise, i * 0.16 + 4, j * 0.16 + 4, 4)));
  const val = [0.65, 0.35, 0.3], disp = [0.65, 0.35, 0.3]; let drag = -1, sel = 0, tt = 0;
  const slider = (k: number, w: number, h: number) => ({ x0: w * 0.3, x1: w * 0.92, y: h - 44 + k * 16 });
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer; tt += dt;
    if (p.down) {
      if (drag < 0) for (let k = 0; k < 3; k++) { const sl = slider(k, w, h); if (Math.abs(p.py - sl.y) < 9 && p.px > sl.x0 - 14 && p.px < sl.x1 + 14) { drag = k; sel = k; } }
      if (drag >= 0) { const sl = slider(drag, w, h); val[drag] = clamp((p.px - sl.x0) / (sl.x1 - sl.x0)); }
    } else drag = -1;
    for (let k = 0; k < 3; k++) disp[k] = damp(disp[k], val[k], 12, dt);
    const [elev, water, sun] = disp, azim = sun * Math.PI * 2 + Math.PI / 4;
    const lx = Math.cos(azim), ly = Math.sin(azim);
    const faces = { t: 1.08, l: 0.5 + 0.5 * Math.max(0, ly) + 0.12, r: 0.5 + 0.5 * Math.max(0, lx) + 0.12 };
    const area = h - 60, s = Math.min(w / 36, area / 24);
    const v: View = { s, ox: w / 2, oy: area * 0.62 };
    const maxH = 1 + elev * 10, wl = 1 + water * 6;
    const line = alpha(pal.fg, 0.12);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const n = base[j][i], hz = Math.max(1, Math.floor(1 + n * maxH)), under = hz <= wl, top = under ? wl : hz;
      const rel = (hz - 1) / Math.max(1, maxH);
      const col = under ? mix("#1e40af", "#38bdf8", clamp(1 - (wl - hz) / 4)) : rel < 0.18 ? "#e7d29b" : rel < 0.55 ? mix("#4ade80", "#15803d", rel) : rel < 0.8 ? "#a8a29e" : "#f5f5f4";
      box(g, v, (i - N / 2), (j - N / 2), 0, 1, 1, top * UNIT, col, line, faces);
    }
    for (let k = 0; k < 3; k++) {
      const sl = slider(k, w, h), on = k === sel;
      text(g, NAMES[k], w * 0.06, sl.y, on ? pal.fg : alpha(pal.fg, 0.55), 10, "left", on ? "700" : "500");
      g.strokeStyle = alpha(pal.fg, 0.25); g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(sl.x0, sl.y); g.lineTo(sl.x1, sl.y); g.stroke();
      g.strokeStyle = pal.accent; g.beginPath(); g.moveTo(sl.x0, sl.y); g.lineTo(sl.x0 + (sl.x1 - sl.x0) * disp[k], sl.y); g.stroke(); g.lineCap = "butt";
      g.fillStyle = pal.fg; g.beginPath(); g.arc(sl.x0 + (sl.x1 - sl.x0) * disp[k], sl.y, on ? 6 : 5, 0, 7); g.fill();
    }
    c.read(`Terrain: elevation ${Math.round(val[0] * 100)}%, water ${Math.round(val[1] * 100)}%, sun angle ${Math.round(val[2] * 360)} degrees`);
    void tt;
  };
  return { frame, key(e) {
    if (e.key === "ArrowUp") sel = (sel + 2) % 3; if (e.key === "ArrowDown") sel = (sel + 1) % 3;
    if (e.key === "ArrowRight") val[sel] = clamp(val[sel] + 0.05); if (e.key === "ArrowLeft") val[sel] = clamp(val[sel] - 0.05);
  } };
}
