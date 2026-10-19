import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, proj, unproj, type View } from "../../kit/iso";
import { clamp, damp, rng } from "../../kit/motion";

/**
 * Matrix Digital Rain Monolith — falling glyph columns drawn on the iso wall plane (affine-skewed text).
 * Within a radius of the pointer / touch, lit glyph cells resolve into solid blocks that grow out of the wall.
 * Idle: an invisible cursor wanders across the wall.
 */
const COLS = 13, ROWS = 14, GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789+=<>*";
type Col = { head: number; sp: number; len: number };
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(81);
  const cols: Col[] = Array.from({ length: COLS }, () => ({ head: rand() * ROWS * 2 - ROWS, sp: 5 + rand() * 7, len: 5 + rand() * 7 }));
  const chars = Array.from({ length: COLS * ROWS }, () => GLYPHS[Math.floor(rand() * GLYPHS.length)]);
  const pop = new Float32Array(COLS * ROWS);
  let tt = 0;
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer; tt += dt;
    const k = c.opts().intensity ?? 0.5;
    const s = Math.min(w / 12.5, h / 21.5);
    const v: View = { s, ox: w / 2 - COLS * 0.433 * s, oy: h * 0.5 + (ROWS * 0.5 - COLS * 0.25) * s };
    const GREEN = pal.dark ? "#22c55e" : "#15803d", ln = alpha(GREEN, 0.5);
    // pointer → wall cell (plane y = 0)
    let cx = -99, cy = -99, rad = 2.4;
    if (p.inside) {
      const [px, py] = [p.px, p.py]; const x = (px - v.ox) / (0.8660254 * s), z = (0.5 * x * s - (py - v.oy)) / s;
      cx = x; cy = ROWS - z; rad = p.down ? 3.4 : 2.4;
    } else { cx = COLS / 2 + Math.sin(tt * 0.6) * COLS * 0.38; cy = ROWS / 2 + Math.sin(tt * 0.9 + 1) * ROWS * 0.3; }
    void unproj;
    cols.forEach((col, i) => {
      col.head += col.sp * (0.4 + k * 1.2) * dt;
      if (col.head - col.len > ROWS) { col.head = -rand() * 6; col.sp = 5 + rand() * 7; col.len = 5 + rand() * 7; }
      for (let r = 0; r < ROWS; r++) if (rand() < dt * 1.2) chars[i * ROWS + r] = GLYPHS[Math.floor(rand() * GLYPHS.length)];
    });
    // slab
    box(g, v, -0.3, -0.7, -0.4, COLS + 0.6, 0.7, ROWS + 0.4, mix(pal.bg, GREEN, pal.dark ? 0.07 : 0.1), alpha(GREEN, 0.3), { t: 1.05, l: 1, r: 0.8 });
    const wall = (col: number, row: number, f: (z: number) => void) => f(ROWS - 1 - row);
    // glyphs (drawn on the wall with an affine transform: local x → iso x, local y(down) → screen down)
    g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = "bold 10px ui-monospace, monospace";
    for (let i = 0; i < COLS; i++) for (let r = 0; r < ROWS; r++) {
      const d = cols[i].head - r, lit = d >= 0 && d < cols[i].len ? 1 - d / cols[i].len : 0, idx = i * ROWS + r;
      const dist = Math.hypot(i + 0.5 - cx, r + 0.5 - cy);
      const target = lit > 0.08 && dist < rad ? lit : 0; pop[idx] = damp(pop[idx], target, target > pop[idx] ? 14 : 6, dt);
      if (pop[idx] > 0.05 || lit < 0.03) continue;
      wall(i, r, (z) => {
        const [ox, oy] = proj(v, i + 0.5, 0, z + 0.5);
        g.save(); g.transform(0.8660254 * s, 0.5 * s, 0, s, ox, oy); g.scale(0.1, 0.1);
        g.fillStyle = d < 1 ? (pal.dark ? "#d1fae5" : "#064e3b") : alpha(GREEN, 0.25 + lit * 0.75);
        g.fillText(chars[idx], 0, 0); g.restore();
      });
    }
    g.restore();
    // blocks (x ascending, higher rows first so lower boxes overlap correctly)
    for (let i = 0; i < COLS; i++) for (let r = 0; r < ROWS; r++) {
      const idx = i * ROWS + r, b = pop[idx]; if (b <= 0.05) continue;
      const d = cols[i].head - r, lit = clamp(d >= 0 && d < cols[i].len ? 1 - d / cols[i].len : 0.2);
      wall(i, r, (z) => box(g, v, i + 0.06, 0, z + 0.06, 0.88, 0.2 + b * 0.8, 0.88, mix(pal.bg, GREEN, 0.35 + lit * 0.65), ln, { t: 1.2, l: 0.95, r: 0.6 }));
    }
    c.read("Digital rain wall. Move the pointer to resolve glyphs into blocks.");
  };
  return { frame };
}
