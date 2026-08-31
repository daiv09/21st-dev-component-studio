"use client";

/**
 * Sounder & Key — a working American Morse practice rig. Hold the key
 * (pointer or SPACE): short press = dot, long = dash. Pauses commit letters
 * and words through a real lookup decoder. The lever, sounder armature and
 * lamp are all driven by the same circuit state, and REPLAY re-keys your
 * last transmission through the mechanism automatically.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const DOT_MAX_MS = 180;
const LETTER_GAP_MS = 780;
const WORD_GAP_MS = 1600;

const CODES: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.",
  H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.",
  O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-",
  V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};
const REV: Record<string, string> = Object.fromEntries(
  Object.entries(CODES).map(([ch, code]) => [code, ch])
);

const LEVER: { type: "spring"; stiffness: number; damping: number } = {
  type: "spring",
  stiffness: 720,
  damping: 26,
};

export function MorseTelegraphKey() {
  const [keyed, setKeyed] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState("");
  const [lastUnitMs, setLastUnitMs] = useState(0);

  const downAt = useRef(0);
  const suppressCommit = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef("");
  const keyedRef = useRef(keyed);
  keyedRef.current = keyed;
  const msgTailRef = useRef("");
  const lastCommitAt = useRef(0);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id);
      fn();
    }, ms);
    timers.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    const bag = timers.current;
    return () => {
      bag.forEach(clearTimeout);
      if (gapTimer.current) clearTimeout(gapTimer.current);
    };
  }, []);

  const releaseCircuit = useCallback(() => {
    if (!keyedRef.current) return;
    setKeyed(false);
    const held = performance.now() - downAt.current;
    setLastUnitMs(Math.round(held));
    const symbol = held <= DOT_MAX_MS ? "." : "-";
    const next = pendingRef.current + symbol;
    pendingRef.current = next;
    setPending(next);

    gapTimer.current = setTimeout(() => {
      gapTimer.current = null;
      const buf = pendingRef.current;
      pendingRef.current = "";
      setPending("");
      if (suppressCommit.current) return;
      if (buf) {
        const ch = REV[buf] !== undefined ? REV[buf] : "¿";
        setMessage((m) => (m + ch).slice(-46));
        msgTailRef.current = ch;
        lastCommitAt.current = performance.now();
      } else if (
        msgTailRef.current !== " " &&
        performance.now() - lastCommitAt.current > WORD_GAP_MS
      ) {
        setMessage((m) => (m + " ").slice(-46));
        msgTailRef.current = " ";
      }
    }, LETTER_GAP_MS);
  }, []);

  const closeCircuit = useCallback(
    (ms?: number) => {
      if (gapTimer.current) {
        clearTimeout(gapTimer.current);
        gapTimer.current = null;
      }
      setKeyed(true);
      downAt.current = performance.now();
      // Auto-release for replayed symbols; manual keys stay held.
      if (ms !== undefined) schedule(() => releaseCircuit(), ms);
    },
    [schedule, releaseCircuit]
  );

  const beginKey = useCallback(() => {
    if (keyedRef.current) return;
    closeCircuit();
  }, [closeCircuit]);

  const endKey = useCallback(() => {
    releaseCircuit();
  }, [releaseCircuit]);

  // SPACE keys the line.
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        beginKey();
      }
    };
    const upK = (e: KeyboardEvent) => {
      if (e.code === "Space") endKey();
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", upK);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", upK);
    };
  }, [beginKey, endKey]);

  const replay = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (gapTimer.current) clearTimeout(gapTimer.current);
    suppressCommit.current = true;
    let t = 200;
    for (const ch of message) {
      if (ch === " ") {
        t += 620;
        continue;
      }
      const code = CODES[ch];
      if (!code) continue;
      for (const sym of code) {
        schedule(() => closeCircuit(sym === "." ? 130 : 380), t);
        t += sym === "." ? 300 : 550;
      }
      t += 480;
    }
    schedule(() => {
      suppressCommit.current = false;
    }, t + 400);
  }, [closeCircuit, message, schedule]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0c0a07] select-none">
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Sounder &amp; Key
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          MT-1844 · Practice Line · Straight Key
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Hold Key / Space — Dot or Dash
          <br />
          Pause — Commits Letter
        </p>
      </div>

      {/* Bench */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-800"
        style={{
          width: "min(920px, 92vw)",
          height: 340,
          background: "#14100b",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 90px rgba(0,0,0,0.75)",
        }}
      >
        {/* Circuit trace (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <polyline
            points="190,236 190,282 700,282 700,196"
            fill="none"
            strokeWidth="3"
            stroke={keyed ? "#f59e0b" : "#3f3a32"}
            strokeLinejoin="round"
            style={{ transition: "stroke 60ms linear" }}
          />
          <polyline
            points="700,120 700,58 596,58"
            fill="none"
            strokeWidth="3"
            stroke={keyed ? "#f59e0b" : "#3f3a32"}
            strokeLinejoin="round"
          />
        </svg>

        {/* THE KEY */}
        <div className="absolute" style={{ left: 110, top: 128 }}>
          <div
            className="relative w-44 h-24 rounded-lg border border-neutral-700"
            style={{
              background: "#1c1610",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Pivot */}
            <div className="absolute left-8 top-8 w-5 h-5 rounded-full bg-neutral-500 border-2 border-neutral-600" />
            {/* Lever */}
            <motion.div
              animate={{ rotate: keyed ? 6.5 : 0 }}
              transition={LEVER}
              style={{ transformOrigin: "44px 42px" }}
              className="absolute inset-0 pointer-events-none"
            >
              <div
                className="absolute left-10 top-[38px] h-[7px] w-28 rounded-full"
                style={{ background: "#d4a24e", boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.4)" }}
              />
              {/* Knob */}
              <div
                className="absolute right-[-14px] top-[22px] w-9 h-9 rounded-full border-2 border-neutral-800"
                style={{ background: "#0e0d0c", boxShadow: "0 6px 12px rgba(0,0,0,0.6)" }}
              />
              {/* Front contact */}
              <div className="absolute right-6 top-[52px] w-4 h-[6px] rounded-sm bg-neutral-400" />
            </motion.div>
            {/* Contact screw under front */}
            <div className="absolute right-7 bottom-3 w-2.5 h-4 rounded-sm bg-neutral-600" />
          </div>
          {/* Strike zone */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              beginKey();
            }}
            onPointerUp={endKey}
            onPointerLeave={endKey}
            aria-label="Telegraph key"
            className="mt-3 w-full py-2 font-mono text-[10px] tracking-[0.35em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-800 transition-colors cursor-pointer touch-none"
          >
            Hold To Key
          </button>
        </div>

        {/* SOUNDER */}
        <div className="absolute" style={{ left: 620, top: 168 }}>
          <div className="relative w-40 h-16">
            {/* Coils */}
            <div className="absolute left-3 bottom-0 w-12 h-14 rounded-t-md border border-neutral-700 bg-neutral-800/80" />
            <div className="absolute right-3 bottom-0 w-12 h-14 rounded-t-md border border-neutral-700 bg-neutral-800/80" />
            {/* Armature */}
            <motion.div
              animate={{ y: keyed ? 9 : 0 }}
              transition={LEVER}
              className="absolute left-0 right-0 top-0 h-3 rounded-full"
              style={{
                background: "#b8b4ae",
                boxShadow: "0 4px 10px rgba(0,0,0,0.55)",
              }}
            >
              <span className="absolute left-1/2 -top-3 -translate-x-1/2 w-1.5 h-3 bg-neutral-500" />
            </motion.div>
          </div>
          <span className="block mt-3 font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600">
            Sounder
          </span>
        </div>

        {/* LAMP */}
        <div className="absolute" style={{ left: 548, top: 18 }}>
          <motion.div
            animate={{
              backgroundColor: keyed ? "#fbbf24" : "#3a2f16",
              boxShadow: keyed
                ? "0 0 34px 10px rgba(251,191,36,0.55)"
                : "inset 0 -6px 10px rgba(0,0,0,0.6)",
            }}
            transition={{ duration: 0.06 }}
            className="w-12 h-12 rounded-full border-4 border-neutral-800"
          />
          <span className="block mt-1.5 font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600">
            Line
          </span>
        </div>

        {/* Tape readout */}
        <div className="absolute left-8 right-8 bottom-5 flex items-baseline gap-3 overflow-hidden">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600 shrink-0">
            Tape
          </span>
          <span className="font-mono text-lg text-amber-200 tracking-[0.2em] whitespace-nowrap">
            {message}
            <span className="text-amber-500">{pending}</span>
            <motion.span
              animate={{ opacity: [1, 0.15, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="inline-block w-2 h-4 ml-1 align-middle bg-amber-300"
            />
          </span>
        </div>
      </div>

      {/* Console */}
      <div className="absolute bottom-9 inset-x-0 flex items-end justify-center gap-12 pointer-events-none">
        <Readout label="Line">
          <span className={keyed ? "text-lime-400" : "text-neutral-500"}>
            {keyed ? "KEYED" : "OPEN"}
          </span>
        </Readout>
        <Readout label="Last Unit">{lastUnitMs} MS</Readout>
        <button
          onClick={replay}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-700 transition-colors pointer-events-auto"
        >
          Replay
        </button>
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
      <span className="font-mono text-lg text-neutral-200 tabular-nums">{children}</span>
    </div>
  );
}

export default MorseTelegraphKey;
