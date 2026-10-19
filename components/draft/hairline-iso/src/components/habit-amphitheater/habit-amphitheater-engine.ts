import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, line, mix, poly, proj, shade, text, unproj, type View } from "../../kit/iso";
import { clamp, damp, rng } from "../../kit/motion";

/**
 * Habit Streak Amphitheater — 5 tiers (weeks, outer→inner) × 7 wedges (days).
 * Completed days rise; tiers ascend toward the centre where the crown grows with your current streak.
 * Click a wedge (or ←/→ to move, Space to toggle) to log or undo a day.
 */
const TIERS = 5, DAYS = 7, R_OUT = 5.2, TW = 0.85, GAP = 0.05;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(17);
  const done = Array.from({ length: TIERS * DAYS }, (_, i) => (i < 4 * DAYS ? rand() < 0.78 : false));
  for (let i = 14; i < 21; i++) done[i] = true;
  const hgt: number[] = done.map((d) => (d ? 1 : 0));
  let hover = -1, sel = 0, prevDown = false, spin = 0;
  const streak = () => { let last = done.lastIndexOf(true), n = 0; while (last - n >= 0 && done[last - n]) n++; return n; };
  const toggle = (i: number) => { if (i >= 0) done[i] = !done[i]; };
  const frame = (dt: number, t: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    const s = Math.min(w / 17, h / 11.5);
    const v: View = { s, ox: w / 2, oy: h * 0.58 };
    spin += dt * (0.4 + (c.opts().intensity ?? 0.5) * 1.6);
    hover = -1;
    if (p.inside) {
      const [x, y] = unproj(v, p.px, p.py, 0.8), r = Math.hypot(x, y);
      const tier = Math.floor((R_OUT - r) / TW);
      if (tier >= 0 && tier < TIERS) { const a = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2); hover = tier * DAYS + Math.floor(a / (Math.PI * 2 / DAYS)); }
      if (p.down && !prevDown && hover >= 0) { toggle(hover); sel = hover; }
    }
    prevDown = p.down;
    const base = (tier: number) => 0.3 + tier * 0.55;
    type Seg = { i: number; cx: number; cy: number };
    const segs: Seg[] = [];
    for (let i = 0; i < done.length; i++) {
      hgt[i] = damp(hgt[i], done[i] ? 1 : 0, 7, dt);
      const tier = Math.floor(i / DAYS), day = i % DAYS, am = ((day + 0.5) / DAYS) * Math.PI * 2, rm = R_OUT - (tier + 0.5) * TW;
      segs.push({ i, cx: Math.cos(am) * rm, cy: Math.sin(am) * rm });
    }
    segs.sort((a, b) => a.cx + a.cy - b.cx - b.cy);
    const col = pal.accent;
    for (const { i } of segs) {
      const tier = Math.floor(i / DAYS), day = i % DAYS;
      const a0 = (day / DAYS) * Math.PI * 2 + GAP, a1 = ((day + 1) / DAYS) * Math.PI * 2 - GAP;
      const r1 = R_OUT - tier * TW - 0.03, r0 = r1 - TW + 0.06;
      const z0 = 0, z1 = base(tier) + hgt[i] * 0.9;
      const fill = done[i] ? mix(col, pal.fg, tier / TIERS * 0.35) : mix(pal.bg, pal.border, 0.85);
      const hl = i === hover || i === sel;
      const arc = (r: number, z: number, ra: number, rb: number, n = 6) => Array.from({ length: n + 1 }, (_, k) => { const a = ra + (rb - ra) * (k / n); return proj(v, Math.cos(a) * r, Math.sin(a) * r, z); });
      const ln = hl ? pal.fg : alpha(pal.fg, 0.25);
      // outer wall (segments facing the viewer)
      for (let k = 0; k < 6; k++) {
        const aa = a0 + (a1 - a0) * (k / 6), ab = a0 + (a1 - a0) * ((k + 1) / 6), am = (aa + ab) / 2;
        if (Math.cos(am) + Math.sin(am) > 0) poly(g, [proj(v, Math.cos(aa) * r1, Math.sin(aa) * r1, z0), proj(v, Math.cos(ab) * r1, Math.sin(ab) * r1, z0), proj(v, Math.cos(ab) * r1, Math.sin(ab) * r1, z1), proj(v, Math.cos(aa) * r1, Math.sin(aa) * r1, z1)], shade(fill, 0.55 + 0.25 * (Math.cos(am) + Math.sin(am))), ln);
        else if (Math.cos(am) + Math.sin(am) < 0 && tier < TIERS - 1) { /* inner wall visible */
          poly(g, [proj(v, Math.cos(aa) * r0, Math.sin(aa) * r0, z0), proj(v, Math.cos(ab) * r0, Math.sin(ab) * r0, z0), proj(v, Math.cos(ab) * r0, Math.sin(ab) * r0, z1), proj(v, Math.cos(aa) * r0, Math.sin(aa) * r0, z1)], shade(fill, 0.5), ln);
        }
      }
      poly(g, [...arc(r1, z1, a0, a1), ...arc(r0, z1, a1, a0)], shade(fill, hl ? 1.3 : 1.12), ln);
    }
    // crown
    const st = streak(), ch = 0.4 + base(TIERS - 1) + st * 0.1;
    const cz = ch + 0.6 + Math.sin(t * 1.6) * 0.15;
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      poly(g, [proj(v, Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0), proj(v, Math.cos(a + 1.05) * 0.9, Math.sin(a + 1.05) * 0.9, 0), proj(v, Math.cos(a + 1.05) * 0.9, Math.sin(a + 1.05) * 0.9, ch), proj(v, Math.cos(a) * 0.9, Math.sin(a) * 0.9, ch)], shade(pal.border, Math.cos(a) + Math.sin(a) > 0 ? 0.9 : 0.6), alpha(pal.fg, 0.3));
    }
    const top = proj(v, 0, 0, cz + 1.1), bot = proj(v, 0, 0, cz - 0.5);
    const eq = [0, 1, 2, 3].map((k) => proj(v, Math.cos(spin + k * Math.PI / 2) * 0.7, Math.sin(spin + k * Math.PI / 2) * 0.7, cz + 0.3));
    for (let k = 0; k < 4; k++) { poly(g, [top, eq[k], eq[(k + 1) % 4]], alpha(pal.accent, 0.55 + 0.1 * k), pal.fg); poly(g, [bot, eq[k], eq[(k + 1) % 4]], alpha(pal.accent, 0.35 + 0.08 * k), pal.fg); }
    line(g, bot, top, alpha(pal.fg, 0.4));
    text(g, `${st}-day streak`, w / 2, h * 0.93, pal.fg, 13, "center", "700");
    c.read(`${done.filter(Boolean).length} of ${done.length} days logged, current streak ${st}`);
    void clamp;
  };
  return { frame, key(e) {
    if (e.key === "ArrowRight") sel = (sel + 1) % (TIERS * DAYS);
    if (e.key === "ArrowLeft") sel = (sel + TIERS * DAYS - 1) % (TIERS * DAYS);
    if (e.key === " " || e.key === "Enter") { toggle(sel); e.preventDefault(); }
  } };
}
