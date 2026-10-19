import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, dot, line, poly, proj, text, type View } from "../../kit/iso";
import { clamp, damp, fixed } from "../../kit/motion";

/**
 * Escapement Gear Clock — fixed-step (1/240 s) pendulum ODE.
 *   θ'' = −ω0² sinθ − c θ'   plus an impulse from the escape wheel near bottom dead centre,
 * whose strength is the mainspring tension. Each zero-crossing = one tick = half a tooth.
 * Drag horizontally (or ←/→) to set the tension.
 */
export function mount(c: EngineCtx): EngineInstance {
  const W0 = 4.6, DAMP = 0.35, TEETH = 15, STEP = (Math.PI * 2) / TEETH;
  let th = 0.25, om = 0, wheel = 0, wheelT = 0, ticks = 0, manual: number | null = null, tens = 0.5;
  const acc = { v: 0 };
  const sim = (h: number) => {
    const prev = th;
    om += (-W0 * W0 * Math.sin(th) - DAMP * om) * h;
    if (Math.abs(th) < 0.1 && Math.abs(om) > 0.02) om += Math.sign(om) * (0.4 + 7 * tens) * h * 3.2;
    om = clamp(om, -4, 4);
    th += om * h;
    if ((prev < 0) !== (th < 0)) { ticks++; wheelT += STEP / 2; }
  };
  const gear = (v: View, cx: number, cz: number, r: number, rot: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let k = 0; k < TEETH; k++) {
      const a = rot + k * STEP;
      for (const [rad, da] of [[r * 0.78, 0], [r, STEP * 0.18], [r, STEP * 0.3], [r * 0.78, STEP * 0.86]] as const)
        pts.push(proj(v, cx + Math.cos(a + da) * rad, 0, cz + Math.sin(a + da) * rad));
    }
    return pts;
  };
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(), p = c.pointer;
    if (p.down) manual = clamp(p.x);
    tens = manual ?? c.opts().intensity ?? 0.5;
    fixed(acc, dt, 1 / 240, sim);
    wheel = damp(wheel, wheelT, 40, dt);

    const s = Math.min(w / 10, h / 13.2);
    const v: View = { s, ox: w / 2, oy: h * 0.5 + 4.7 * s };
    const ln = alpha(pal.fg, 0.4);
    const WZ = 4.4, PZ = 7.7;
    box(g, v, -3.2, -0.4, 0, 6.4, 0.3, 9.4, pal.border, ln, { t: 1, l: 0.95, r: 0.7 }); // plate
    poly(g, gear(v, 0, WZ, 2.0, -wheel), alpha(pal.fg, 0.08), pal.fg, 1.5);              // escape wheel
    for (let k = 0; k < 5; k++) { const a = -wheel + k * (Math.PI * 2 / 5); line(g, proj(v, 0, 0, WZ), proj(v, Math.cos(a) * 1.5, 0, WZ + Math.sin(a) * 1.5), alpha(pal.fg, 0.5), 1.5); }
    dot(g, proj(v, 0, 0, WZ), 4, pal.fg);
    // anchor rocks with the pendulum
    const ph = th * 0.7, A = 0.62, R = 2.05;
    const pivot = proj(v, 0, 0.35, PZ);
    const tip = (sgn: number) => proj(v, Math.sin(ph + sgn * A) * R, 0.35, PZ - Math.cos(ph + sgn * A) * R * 0.9);
    g.strokeStyle = pal.accent; g.lineWidth = Math.max(3, s * 0.25); g.lineCap = "round";
    const tl = tip(-1), tr = tip(1);
    g.beginPath(); g.moveTo(tl[0], tl[1]); g.lineTo(pivot[0], pivot[1]); g.lineTo(tr[0], tr[1]); g.stroke(); g.lineCap = "butt";
    dot(g, tl, 3, pal.fg); dot(g, tr, 3, pal.fg);
    // pendulum
    const bob = proj(v, Math.sin(th) * 6, 0.35, PZ - Math.cos(th) * 6);
    line(g, pivot, bob, pal.fg, 2);
    dot(g, bob, s * 0.55, pal.bg); dot(g, bob, s * 0.4, pal.accent);
    dot(g, pivot, 4, pal.fg);
    // mainspring gauge
    const gx = -2.6, gz = 0.5;
    line(g, proj(v, gx, 0.2, gz), proj(v, gx + 5.2, 0.2, gz), alpha(pal.fg, 0.25), 6);
    line(g, proj(v, gx, 0.2, gz), proj(v, gx + 5.2 * tens, 0.2, gz), pal.accent, 6);
    const lp = proj(v, 0, 0.2, gz - 0.7);
    text(g, "MAINSPRING", lp[0], lp[1], alpha(pal.fg, 0.6), 10);
    c.read(`Pendulum clock, ${ticks} ticks, mainspring ${Math.round(tens * 100)}%`);
  };
  return {
    frame,
    update() { manual = null; },
    key(e) {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") manual = clamp((manual ?? tens) + 0.1);
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") manual = clamp((manual ?? tens) - 0.1);
    },
  };
}
