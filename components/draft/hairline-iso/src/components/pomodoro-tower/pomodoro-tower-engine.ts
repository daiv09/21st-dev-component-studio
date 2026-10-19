import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, proj, text, type View } from "../../kit/iso";
import { clamp, damp, lerp, rng } from "../../kit/motion";

/**
 * Pomodoro Time Tower — an hourglass in blocks. The left tower dissolves from the bottom while sand
 * arcs across and builds the completion monolith on the right.
 * Cycle length = lerp(240 s, 20 s, intensity) so the demo is watchable; the label always shows 25:00 → 0:00.
 * Click / Space toggles run-pause, R resets.
 */
const N = 14, LH = 0.45;
type Sand = { u: number; sp: number; jx: number; jy: number };
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(13);
  let prog = 0, running = true, prevDown = false, hold = 0, rem = 1, done = 0; const sand: Sand[] = [];
  const toggle = () => { running = !running; };
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    if (p.down && !prevDown) toggle(); prevDown = p.down;
    const D = lerp(240, 20, c.opts().intensity ?? 0.5);
    if (running && hold <= 0) { prog += dt / D; if (prog >= 1) { prog = 1; hold = 2.2; } }
    if (hold > 0) { hold -= dt; if (hold <= 0) { prog = 0; } }
    rem = damp(rem, 1 - prog, hold > 0 ? 4 : 10, dt); done = damp(done, prog, hold > 0 ? 4 : 10, dt);
    if (running && hold <= 0) { let n = dt * 22; while (n > 0 && sand.length < 90) { if (rand() < n) sand.push({ u: 0, sp: 0.8 + rand() * 0.5, jx: (rand() - 0.5) * 2, jy: (rand() - 0.5) * 2 }); n--; } }
    for (let i = sand.length - 1; i >= 0; i--) { sand[i].u += dt * sand[i].sp; if (sand[i].u >= 1) sand.splice(i, 1); }

    const s = Math.min(w / 18, h / 14.5);
    const v: View = { s, ox: w / 2, oy: h * 0.7 };
    const ln = alpha(pal.fg, 0.3);
    box(g, v, -5.4, -2.2, -0.3, 10.8, 4.4, 0.3, mix(pal.bg, pal.border, 0.8), ln);
    // left: remaining time, dissolves from the bottom (stack slides down as it shrinks)
    const hr = rem * N * LH, full = Math.floor(rem * N);
    for (let i = 0; i < full; i++) box(g, v, -4.5, -1.5, i * LH, 3, 3, LH - 0.03, mix(pal.border, pal.accent, i / N * 0.6), ln);
    const frac = rem * N - full;
    if (frac > 0.02) box(g, v, -4.5 + (1 - frac) * 1.5, -1.5 + (1 - frac) * 1.5, full * LH, 3 * frac, 3 * frac, (LH - 0.03) * frac, pal.accent, ln);
    // right: completion monolith
    const fd = Math.floor(done * N);
    for (let i = 0; i < fd; i++) box(g, v, 1.5, -1.5, i * LH, 3, 3, LH - 0.03, mix(pal.accent, pal.fg, i / N * 0.5), ln);
    const fr = done * N - fd;
    if (fr > 0.02) box(g, v, 1.5, -1.5, fd * LH, 3, 3, (LH - 0.03) * fr, pal.fg, ln);
    // sand
    const topR = Math.max(0.2, done * N * LH);
    for (const q of sand) {
      const x = lerp(-3, 3, q.u) + q.jx * 0.3, y = q.jy * 0.4, z = lerp(0.2, topR + 0.2, q.u) + Math.sin(q.u * Math.PI) * 3.4;
      const [sx, sy] = proj(v, x, y, z); g.fillStyle = alpha(pal.accent, 0.9); g.fillRect(sx - 1.5, sy - 1.5, 3, 3);
    }
    const left = Math.round(rem * 25 * 60), mm = Math.floor(left / 60), ss = left % 60;
    const lab = `${mm}:${String(ss).padStart(2, "0")}`;
    text(g, hold > 0 ? "DONE" : lab, w / 2, h * 0.9, pal.fg, 16, "center", "700");
    text(g, running ? "click to pause" : "paused · click to resume", w / 2, h * 0.9 + 16, alpha(pal.fg, 0.5), 10);
    void clamp;
    c.read(`Pomodoro ${hold > 0 ? "complete" : lab + " remaining"}${running ? "" : ", paused"}`);
  };
  return { frame, key(e) { if (e.key === " " || e.key === "Enter") { toggle(); e.preventDefault(); } if (e.key === "r" || e.key === "R") prog = 0; } };
}
