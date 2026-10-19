import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, mix, text, proj, type View } from "../../kit/iso";
import { clamp, damp, rng } from "../../kit/motion";

/**
 * Sound Frequency Equalizer Grid — 16 bands × 10 time rows (newest at the front).
 * Synthetic spectrum by default (moving peaks + a beat); press M to feed it from your microphone
 * through an AnalyserNode. Colour switches at amplitude thresholds (<0.45 · <0.8 · peak).
 */
const BANDS = 16, ROWS = 10, SP = 0.78;
export function mount(c: EngineCtx): EngineInstance {
  const rand = rng(61);
  const hist = Array.from({ length: ROWS }, () => new Float32Array(BANDS));
  const disp = Array.from({ length: ROWS }, () => new Float32Array(BANDS));
  let acc = 0, tt = 0, mic: { ctx: AudioContext; an: AnalyserNode; buf: Uint8Array; stream: MediaStream } | null = null;
  const synth = (t: number, k: number) => {
    const out = new Float32Array(BANDS), beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * 1.9)), 6);
    const cs = [4 + 3 * Math.sin(t * 0.7), 9 + 4 * Math.sin(t * 0.43 + 1), 12.5 + 2.5 * Math.sin(t * 1.1 + 2)];
    for (let b = 0; b < BANDS; b++) {
      let a = 0; cs.forEach((cc, i) => { a += (0.5 - i * 0.1) * Math.exp(-((b - cc) ** 2) / (2 * (1.6 + i * 0.4) ** 2)); });
      a += beat * Math.exp(-b * 0.35) * 0.85 + rand() * 0.06;
      out[b] = clamp(a * (0.55 + k * 0.9));
    }
    return out;
  };
  const listen = async () => {
    if (mic) { mic.stream.getTracks().forEach((tr) => tr.stop()); mic.ctx.close(); mic = null; return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext(), an = ctx.createAnalyser(); an.fftSize = 64; an.smoothingTimeConstant = 0.6;
      ctx.createMediaStreamSource(stream).connect(an); mic = { ctx, an, buf: new Uint8Array(an.frequencyBinCount), stream };
    } catch { mic = null; }
  };
  const bands = (t: number, k: number) => {
    if (!mic) return synth(t, k);
    mic.an.getByteFrequencyData(mic.buf as Uint8Array<ArrayBuffer>);
    const out = new Float32Array(BANDS), per = Math.floor(mic.buf.length / BANDS) || 1;
    for (let b = 0; b < BANDS; b++) { let s = 0; for (let i = 0; i < per; i++) s += mic.buf[b * per + i] || 0; out[b] = clamp((s / per / 255) * (0.8 + k)); }
    return out;
  };
  for (let i = ROWS - 1; i >= 0; i--) hist[i] = synth(i * 0.2, 0.5);
  const colorFor = (a: number, pal: { border: string; accent: string }) => (a < 0.45 ? mix(pal.border, pal.accent, a / 0.45) : a < 0.8 ? pal.accent : mix(pal.accent, "#ef4444", (a - 0.8) / 0.2));
  const frame = (dt: number) => {
    const { g, w, h } = c, pal = c.pal(); tt += dt;
    const k = c.opts().intensity ?? 0.5;
    acc += dt; if (acc > 0.09) { acc = 0; hist.pop(); hist.unshift(bands(tt, k)); }
    if (!c.pointer.inside || !c.pointer.down) { /* nothing */ }
    const s = Math.min(w / 21, h / 13);
    const v: View = { s, ox: w / 2 + 3.6 * s, oy: h * 0.5 + 0.5 * s };
    const X0 = -BANDS * SP / 2, ln = alpha(pal.fg, 0.2);
    box(g, v, X0 - 0.5, -0.5, -0.2, BANDS * SP + 1, ROWS * SP + 1, 0.2, alpha(pal.border, 0.5), ln);
    let peak = 0;
    for (let r = ROWS - 1; r >= 0; r--) for (let b = 0; b < BANDS; b++) {
      const val = hist[r][b], cur = disp[r][b];
      disp[r][b] = damp(cur, val, val > cur ? 22 : 7, dt);
      const a = disp[r][b]; if (r === 0) peak = Math.max(peak, a);
      box(g, v, X0 + b * SP + 0.06, (ROWS - 1 - r) * SP + 0.06, 0, SP - 0.14, SP - 0.14, 0.08 + a * 5.2, colorFor(a, pal), ln);
    }
    const q = proj(v, 0, ROWS * SP + 0.9, 0);
    text(g, mic ? "MIC LIVE · press M to stop" : "synthetic · press M for mic", q[0], q[1] + 12, alpha(pal.fg, 0.55), 10);
    c.read(`Spectrum ${mic ? "from microphone" : "synthetic"}, peak level ${Math.round(peak * 100)}%`);
  };
  return { frame, key(e) { if (e.key === "m" || e.key === "M") void listen(); }, destroy() { if (mic) { mic.stream.getTracks().forEach((tr) => tr.stop()); void mic.ctx.close(); } } };
}
