"use client";

/**
 * Solenoid Memory Bank — an echo-memory machine built from four solenoid
 * pistons. The bank plays a growing stroke sequence with real depression
 * physics; you repeat it by striking pads (or keys 1–4). Faults shake the
 * rack and rewind the pattern to one.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Phase = "standby" | "playback" | "input" | "fault" | "cleared";

const PADS = [
  { name: "A", accent: "#f59e0b", dim: "#3d2c0f" },
  { name: "B", accent: "#a3e635", dim: "#2c3614" },
  { name: "C", accent: "#34d399", dim: "#11362a" },
  { name: "D", accent: "#ef4444", dim: "#3b1414" },
];

const PLUNGER: { type: "spring"; stiffness: number; damping: number } = {
  type: "spring",
  stiffness: 950,
  damping: 28,
};

export function SimonSolenoidMemory() {
  const [phase, setPhase] = useState<Phase>("standby");
  const [sequence, setSequence] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [best, setBest] = useState(0);
  const [pressed, setPressed] = useState<number | null>(null);
  const [litLamp, setLitLamp] = useState<number | null>(null);
  const [faultKey, setFaultKey] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const phaseRef = useRef<Phase>(phase);
  const seqRef = useRef<number[]>(sequence);
  const progRef = useRef(0);
  phaseRef.current = phase;
  seqRef.current = sequence;

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== id);
      fn();
    }, ms);
    timers.current.push(id);
  }, []);

  // Clear every pending machine event on teardown (StrictMode safe).
  useEffect(() => {
    const bag = timers.current;
    return () => bag.forEach(clearTimeout);
  }, []);

  const strike = useCallback(
    (pad: number, ms = 300) => {
      setPressed(pad);
      setLitLamp(pad);
      schedule(() => {
        setPressed((p) => (p === pad ? null : p));
        setLitLamp((l) => (l === pad ? null : l));
      }, ms);
    },
    [schedule]
  );

  const playSequence = useCallback(
    (seq: number[]) => {
      setPhase("playback");
      const step = Math.max(380, 620 - seq.length * 16);
      seq.forEach((pad, i) => {
        schedule(() => strike(pad, step * 0.55), i * step + 350);
      });
      schedule(() => {
        setPhase("input");
        setProgress(0);
        progRef.current = 0;
      }, seq.length * step + 500);
    },
    [schedule, strike]
  );

  const startRun = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const seedSeq = [Math.floor(Math.random() * 4)];
    setSequence(seedSeq);
    seqRef.current = seedSeq;
    playSequence(seedSeq);
  }, [playSequence]);

  const faultOut = useCallback(() => {
    setPhase("fault");
    setFaultKey((k) => k + 1);
    strike(0, 120);
    schedule(() => strike(3, 120), 140);
    schedule(() => {
      setBest((b) => Math.max(b, seqRef.current.length - 1));
      startRun();
    }, 1700);
  }, [schedule, startRun, strike]);

  const handlePadDown = useCallback(
    (pad: number) => {
      if (phaseRef.current === "standby") {
        startRun();
        return;
      }
      strike(pad, 220);
      if (phaseRef.current !== "input") return;

      const expected = seqRef.current[progRef.current];
      if (pad !== expected) {
        faultOut();
        return;
      }
      progRef.current += 1;
      setProgress(progRef.current);
      if (progRef.current >= seqRef.current.length) {
        setPhase("cleared");
        schedule(() => {
          const grown = [...seqRef.current, Math.floor(Math.random() * 4)];
          setSequence(grown);
          seqRef.current = grown;
          setBest((b) => Math.max(b, grown.length - 1));
          playSequence(grown);
        }, 650);
      }
    },
    [faultOut, playSequence, schedule, startRun, strike]
  );

  // Keys 1–4 drive the pistons too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0) handlePadDown(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePadDown]);

  const stateLabel =
    phase === "standby"
      ? "Standby"
      : phase === "playback"
        ? "Playback"
        : phase === "input"
          ? `Input ${progress}/${sequence.length}`
          : phase === "cleared"
            ? "Locked In"
            : "Fault";

  const stateTone =
    phase === "fault"
      ? "text-red-400"
      : phase === "input"
        ? "text-lime-400"
        : phase === "cleared"
          ? "text-emerald-300"
          : "text-neutral-400";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a0b] select-none flex flex-col items-center justify-center">
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-200 uppercase">
          Solenoid Memory Bank
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          SMB-4 · Echo Retention Unit
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Strike Pads or Keys 1–4
          <br />
          Standby Strike Boots Machine
        </p>
      </div>

      {/* Rack */}
      <motion.div
        key={faultKey}
        animate={phase === "fault" ? { x: [0, -12, 10, -7, 5, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex gap-8 p-8 rounded-2xl border border-neutral-800"
        style={{
          background: "#131315",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 70px rgba(0,0,0,0.8)",
        }}
      >
        {PADS.map((pad, i) => (
          <SolenoidPad
            key={pad.name}
            name={pad.name}
            accent={pad.accent}
            dim={pad.dim}
            pressed={pressed === i}
            lit={litLamp === i}
            onDown={() => handlePadDown(i)}
          />
        ))}

        {/* Rack screws */}
        {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map(
          (pos) => (
            <span
              key={pos}
              className={`absolute ${pos} w-2 h-2 rounded-full bg-neutral-700`}
              style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.9)" }}
            />
          )
        )}
      </motion.div>

      {/* Console */}
      <div className="mt-9 flex items-end gap-12">
        <Readout label="Round">{Math.max(sequence.length, 0)}</Readout>
        <Readout label="Best Streak">{best}</Readout>
        <Readout label="State">
          <span className={`font-mono text-xl tabular-nums ${stateTone}`}>
            {stateLabel.toUpperCase()}
          </span>
        </Readout>
        <button
          onClick={startRun}
          className="mb-1 px-5 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-700 transition-colors"
        >
          Restart
        </button>
      </div>

      {/* Power lamp */}
      <motion.span
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 right-10 w-2.5 h-2.5 rounded-full bg-lime-400"
        style={{ boxShadow: "0 0 12px rgba(163,230,53,0.8)" }}
      />
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1.5 pointer-events-none">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-xl text-neutral-100 tabular-nums">{children}</span>
    </div>
  );
}

function SolenoidPad({
  name,
  accent,
  dim,
  pressed,
  lit,
  onDown,
}: {
  name: string;
  accent: string;
  dim: string;
  pressed: boolean;
  lit: boolean;
  onDown: () => void;
}) {
  return (
    <button
      onPointerDown={onDown}
      className="group relative w-40 cursor-pointer touch-none"
      aria-label={`Piston ${name}`}
    >
      {/* Lamp dome */}
      <div className="mx-auto w-14 h-14 rounded-full border-4 border-neutral-800 mb-4">
        <motion.div
          animate={{ backgroundColor: lit ? accent : dim }}
          transition={{ duration: 0.08 }}
          className="w-full h-full rounded-full"
          style={{
            boxShadow: lit
              ? `0 0 24px 6px ${accent}, inset 0 -4px 8px rgba(0,0,0,0.5)`
              : "inset 0 -4px 8px rgba(0,0,0,0.65)",
          }}
        />
      </div>

      {/* Housing */}
      <div
        className="relative h-32 rounded-lg border border-neutral-700 overflow-hidden"
        style={{
          background: "#191a1c",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,0.05), 0 10px 24px rgba(0,0,0,0.6)",
        }}
      >
        {/* Coil windings */}
        <div className="absolute inset-x-3 top-3 space-y-[3px] opacity-60">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-[3px] rounded-full bg-neutral-600/80" />
          ))}
        </div>
        {/* Plunger */}
        <motion.div
          animate={{ y: pressed ? 46 : 0 }}
          transition={PLUNGER}
          className="absolute left-1/2 -translate-x-1/2 top-2 w-10"
        >
          <div
            className="h-20 rounded-md border"
            style={{
              background: "#26272a",
              borderColor: accent,
              boxShadow: `inset 0 2px 0 rgba(255,255,255,0.12), 0 6px 14px rgba(0,0,0,0.55)`,
            }}
          >
            <div
              className="mx-auto mt-2 w-6 h-6 rounded-full border-2"
              style={{ borderColor: accent }}
            />
          </div>
        </motion.div>
      </div>

      {/* Base */}
      <div className="mt-2 h-3 rounded-sm bg-neutral-800 border border-neutral-700 flex items-center justify-around px-2">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
        <span className="font-mono text-[10px] text-neutral-500">{name}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
      </div>
    </button>
  );
}

export default SimonSolenoidMemory;
