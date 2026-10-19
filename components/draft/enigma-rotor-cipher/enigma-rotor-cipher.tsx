"use client";

/**
 * Rotor Cipher Machine — a historically-wired Enigma: three rotors with
 * their real substitution alphabets, notch stepping with the double-step
 * anomaly, and a reflecting loop that makes the machine self-reciprocal
 * (type ciphertext back in to recover the plain text). TYPE anywhere to
 * encrypt letter by letter — watch each rotor physically step and the
 * lamp flash. DRAG any rotor drum vertically to set its ground position;
 * different starting rings produce entirely different cryptograms.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

const AZ = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ROTORS = [
  { name: "I", wire: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: 16 }, // Q
  { name: "II", wire: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: 4 }, // E
  { name: "III", wire: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: 21 }, // V
];
const REFLECTOR = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

const mod26 = (n: number): number => ((n % 26) + 26) % 26;

interface CipherResult {
  out: number;
  positions: number[];
}

function encryptKey(plain: number, positions: number[]): CipherResult {
  const pos = [...positions];
  // historical stepping: mid-at-notch carries left, right-at-notch carries
  // middle, then right always advances (the double-step anomaly emerges)
  if (pos[1] === ROTORS[1].notch) pos[0] = mod26(pos[0] + 1);
  if (pos[2] === ROTORS[2].notch) pos[1] = mod26(pos[1] + 1);
  pos[2] = mod26(pos[2] + 1);

  let c = plain;
  // right → left forward
  for (let i = 2; i >= 0; i--) {
    const w = ROTORS[i].wire;
    c = mod26(AZ.indexOf(w[mod26(c + pos[i])]) - pos[i]);
  }
  // reflector
  c = AZ.indexOf(REFLECTOR[c]);
  // left → right return
  for (let i = 0; i < 3; i++) {
    const w = ROTORS[i].wire;
    const inv = AZ.split("").findIndex((ch) => AZ.indexOf(w[AZ.indexOf(ch)]) === mod26(c + pos[i]));
    c = mod26(inv - pos[i]);
  }
  return { out: c, positions: pos };
}

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export function EnigmaRotorCipher() {
  const posRef = useRef([4, 10, 2]);
  const [positions, setPositions] = useState(posRef.current);
  const [lamp, setLamp] = useState<string>("");
  const [tape, setTape] = useState<{ plain: string; cipher: string }[]>([]);
  const [dragIdx, setDragIdx] = useState(-1);
  const dragState = useRef({ startY: 0, startPos: 0 });

  const typeLetter = useCallback(
    (ch: string) => {
      const p = AZ.indexOf(ch.toUpperCase());
      if (p < 0 || dragIdx >= 0) return;
      const res = encryptKey(p, posRef.current);
      posRef.current = res.positions;
      setPositions(res.positions);
      setLamp(ch.toUpperCase());
      window.setTimeout(() => setLamp(""), 260);
      setTape((tp) => [...tp, { plain: ch.toUpperCase(), cipher: AZ[res.out] }].slice(-14));
    },
    [dragIdx],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const ch = e.key.toUpperCase();
      if (/^[A-Z]$/.test(ch)) typeLetter(ch);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [typeLetter]);

  const onRotorDown = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragIdx(i);
    dragState.current = { startY: e.clientY, startPos: positions[i] };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onRotorMove = (i: number) => (e: React.PointerEvent) => {
    if (dragIdx !== i) return;
    const delta = Math.round((dragState.current.startY - e.clientY) / 30);
    const next = [...posRef.current];
    next[i] = mod26(dragState.current.startPos + delta);
    posRef.current = next;
    setPositions(next);
  };

  const onRotorUp = () => setDragIdx(-1);

  const clearTape = () => setTape([]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#12100d] select-none">
      {/* Title */}
      <div className="absolute top-8 left-10 z-10 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Rotor Cipher Machine
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Three Rotors · Reflector B · Double-Stepping
        </p>
      </div>
      <div className="absolute top-8 right-10 z-10 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Type A–Z — Encrypt · Drag Rotors — Set Rings
          <br />
          Ground Position {ROTORS.map((_, i) => AZ[positions[i]]).join("·")}
        </p>
      </div>

      {/* Rotor drums */}
      <div className="absolute left-1/2 top-[24%] -translate-x-1/2 flex gap-8 z-10">
        {[2, 1, 0].map((i) => (
          <div
            key={i}
            onPointerDown={onRotorDown(i)}
            onPointerMove={onRotorMove(i)}
            onPointerUp={onRotorUp}
            onPointerCancel={onRotorUp}
            className={`w-24 cursor-grab active:cursor-grabbing rounded-lg border-2 px-3 py-3 text-center transition-colors ${
              dragIdx === i ? "border-amber-400 bg-[#2a2117]" : "border-neutral-700 bg-[#1c1917]"
            }`}
          >
            <div className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase mb-2">
              {ROTORS[i].name} · {AZ[ROTORS[i].notch]}
            </div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded border border-amber-800/70 bg-[#0f0d0a]">
              <span className="font-mono text-2xl font-bold text-amber-200">{AZ[positions[i]]}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded bg-neutral-800">
              <div className="h-full bg-amber-700" style={{ width: `${((positions[i] + 1) / 26) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Lampboard */}
      <div className="absolute left-1/2 bottom-[13%] -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        {KEY_ROWS.map((row) => (
          <div key={row} className="flex gap-2">
            {row.split("").map((ch) => (
              <div
                key={ch}
                className={`flex h-9 w-9 items-center justify-center rounded-full border font-mono text-sm ${
                  lamp === ch
                    ? "border-amber-300 bg-amber-400 text-neutral-900 shadow-[0_0_18px_rgba(251,191,36,0.55)]"
                    : "border-neutral-700 bg-[#171512] text-neutral-400"
                }`}
              >
                {ch}
              </div>
            ))}
          </div>
        ))}
        <button
          onClick={clearTape}
          className="mt-3 px-5 py-1.5 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-amber-800 text-amber-300 hover:bg-amber-900/30 transition-colors"
        >
          Tear Tape
        </button>
      </div>

      {/* Paper tape */}
      <div className="absolute left-10 top-[24%] bottom-[13%] w-64 z-10 flex flex-col rounded border border-neutral-800 bg-[#0e0c09]">
        <div className="border-b border-neutral-800 px-4 py-2 font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase">
          Transmission Tape
        </div>
        <div className="flex-1 overflow-hidden px-4 py-2 font-mono text-xs leading-relaxed">
          {tape.length === 0 ? (
            <span className="text-neutral-700">— idle line —</span>
          ) : (
            tape.map((t, i) => (
              <div key={i} className="flex justify-between py-0.5">
                <span className="text-neutral-600">{t.plain}</span>
                <span className="text-neutral-800">→</span>
                <span className="text-amber-300">{t.cipher}</span>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-neutral-800 px-4 py-2">
          <span className="font-mono text-[9px] tracking-[0.25em] text-neutral-600 uppercase">
            Cipher: {tape.map((t) => t.cipher).join("")}
          </span>
        </div>
      </div>

      {/* Reciprocity hint */}
      <div className="absolute right-10 top-[24%] w-60 z-10 pointer-events-none">
        <p className="font-mono text-[10px] leading-relaxed tracking-[0.15em] text-neutral-600 uppercase">
          The machine is self-reciprocal. Reset the drums to the same ground
          position, type the ciphertext back, and the plaintext falls out.
          <br />
          <br />
          Stepping: the right drum turns every key; notches on the middle and
          right drums carry the turn leftward — including the famous
          double-step.
        </p>
      </div>

      {/* Bottom plate */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none z-10">
        <Readout label="Keys Struck">{tape.length}</Readout>
        <Readout label="Ground">{ROTORS.map((_, i) => AZ[positions[i]]).join(" ")}</Readout>
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-lg text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

export default EnigmaRotorCipher;
