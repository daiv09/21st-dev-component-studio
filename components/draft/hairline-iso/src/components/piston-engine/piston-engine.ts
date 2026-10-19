import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, circle, dot, line, poly, proj, wire, type View } from "../../kit/iso";
import { clamp, damp } from "../../kit/motion";

/**
 * Piston Engine Assembly — four cylinders on a flat-plane crank.
 * Piston height follows the real slider-crank equation:
 *   z = zc + R·cosθ + √(L² − (R·sinθ)²)
 * Pointer height = throttle (top = full revs), pressing adds boost, ↑/↓ trims.
 */
export function mount(c: EngineCtx): EngineInstance {
  let omega = 0, ang = 0, heat = 0, trim = 0;
  const R = 0.8, L = 2.6, ZC = 1.7, XS = [-3.3, -1.1, 1.1, 3.3];
  const phase = [0, Math.PI, Math.PI, 0];

  const frame = (dt: number, t: number) => {
    const { g, w, h } = c, pal = c.pal();
    const base = clamp((c.opts().intensity ?? 0.5) + trim);
    const throttle = c.pointer.inside ? 1 - c.pointer.y : base;
    const target = 2 + 26 * clamp(throttle * 0.6 + base * 0.4 + (c.pointer.down ? 0.25 : 0));
    omega = damp(omega, target, 2.5, dt);
    ang += omega * dt;
    heat = damp(heat, (omega - 2) / 26, 1.5, dt);

    const s = Math.min(w / 13, h / 14.2);
    const v: View = { s, ox: w * 0.5 - 0.9 * s, oy: h * 0.5 + 3.9 * s };
    const P = (x: number, y: number, z: number) => proj(v, x, y, z);
    const ln = alpha(pal.fg, 0.4);
    c.read(`Four-cylinder engine at ${Math.round(omega * 60 / (2 * Math.PI) * 10)} RPM`);

    box(g, v, -4.6, -1.3, 0, 9.2, 2.6, 0.9, pal.border, ln);               // crankcase
    // crankshaft + flywheel
    line(g, P(-4.4, 0, ZC), P(5, 0, ZC), pal.fg, 3);
    const fx = 5.1;
    poly(g, circle(v, fx, 0, ZC, 1.5, "x"), alpha(pal.border, 0.9), ln);
    const sp = [P(fx, Math.cos(ang) * 1.5, ZC + Math.sin(ang) * 1.5), P(fx, -Math.cos(ang) * 1.5, ZC - Math.sin(ang) * 1.5)];
    line(g, sp[0], sp[1], pal.fg, 2);

    for (let i = 0; i < 4; i++) {
      const x = XS[i], th = ang + phase[i];
      const pz = ZC + R * Math.cos(th) + Math.sqrt(L * L - (R * Math.sin(th)) ** 2);
      const pin = P(x, R * Math.sin(th), ZC + R * Math.cos(th));
      const wrist = P(x, 0, pz - 0.3);
      line(g, P(x, -R * Math.sin(th), ZC - R * Math.cos(th)), pin, alpha(pal.fg, 0.6), 4); // crank web
      line(g, pin, wrist, pal.fg, 2.5);                                                   // conrod
      dot(g, pin, 3.5, pal.fg);
      box(g, v, x - 0.6, -0.6, pz - 0.6, 1.2, 1.2, 0.6, pal.accent, ln);                  // piston
      wire(g, v, x - 0.75, -0.75, ZC + L - R - 0.9, 1.5, 1.5, 2 * R + 1.9, alpha(pal.fg, 0.5)); // sleeve
      box(g, v, x - 0.85, -0.85, ZC + L + R + 1.0, 1.7, 1.7, 0.5, pal.border, ln);        // head
      // heat shimmer
      for (let k = 0; k < 3; k++) {
        const u = (t * 0.9 + k / 3 + i * 0.21) % 1;
        const [hx, hy] = P(x + Math.sin(t * 3 + k + i) * 0.2, 0, ZC + L + R + 1.7 + u * 2.2);
        g.globalAlpha = clamp(heat) * (1 - u) * 0.45; g.strokeStyle = pal.accent; g.lineWidth = 1.2;
        g.beginPath(); g.arc(hx, hy, 4 + u * 7, 0, Math.PI * 2); g.stroke();
      }
      g.globalAlpha = 1;
    }
  };
  return {
    frame,
    update() { trim = 0; },
    key(e) {
      if (e.key === "ArrowUp") trim = clamp(trim + 0.1, -1, 1);
      if (e.key === "ArrowDown") trim = clamp(trim - 0.1, -1, 1);
    },
  };
}
