"use client";

/**
 * Typebar Studio — a mechanical typewriter driven entirely by your keyboard.
 * Every keystroke flings the matching typebar off its fan toward the platen,
 * advances the carriage along its rail, spins the ribbon spools, and prints
 * with slightly uneven ink. Approach the margin and the bell lamp flashes;
 * past the margin only BACKSPACE and the carriage-return lever respond
 * (click the lever or press ENTER for the springy slam-back).
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

const LINE_MAX = 46;
const CHAR_W = 13.4;
const PAPER_LEFT = 40;
const BAR_COUNT = 26;

const PRINTABLE = /^[A-Za-z0-9 .,;:'"!?()&\-]$/;

function restAngle(i: number) {
  // Fan the bars across an 150° arc.
  return -75 + (150 * i) / (BAR_COUNT - 1);
}

export function TypebarTypewriter() {
  const [lines, setLines] = useState<string[]>(["DEAR READER,"]);
  const [line, setLine] = useState("");
  const [bell, setBell] = useState(false);
  const [strokes, setStrokes] = useState(0);

  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const spoolRef = useRef<HTMLDivElement | null>(null);
  const spoolAngle = useRef(0);
  const paperRef = useRef<HTMLDivElement | null>(null);

  const carriageX = useSpring(0, { stiffness: 520, damping: 30 });

  useEffect(() => {
    carriageX.set(PAPER_LEFT + ("DEAR READER,".length) * CHAR_W);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const strikeBar = useCallback((ch: string) => {
    let h = 0;
    for (let k = 0; k < ch.length; k++) h = (h * 31 + ch.charCodeAt(k)) >>> 0;
    const idx = h % BAR_COUNT;
    const el = barRefs.current[idx];
    if (!el) return;
    const prev = barTimers.current.get(idx);
    if (prev) clearTimeout(prev);
    el.style.transition = "transform 60ms cubic-bezier(0.2,0.9,0.3,1)";
    el.style.transform = `translateX(-50%) rotate(${restAngle(idx) * 0.06}deg)`;
    const t = setTimeout(() => {
      el.style.transition =
        "transform 300ms cubic-bezier(0.34,1.56,0.64,1)";
      el.style.transform = `translateX(-50%) rotate(${restAngle(idx)}deg)`;
      barTimers.current.delete(idx);
    }, 78);
    barTimers.current.set(idx, t);

    // Ribbon spools creep with every strike.
    spoolAngle.current += 9;
    if (spoolRef.current) {
      spoolRef.current.style.transform = `rotate(${spoolAngle.current}deg)`;
    }
  }, []);

  const carriageReturn = useCallback(() => {
    setLines((ls) => [...ls.slice(-7), line]);
    setLine("");
    carriageX.jump?.(PAPER_LEFT);
    carriageX.set(PAPER_LEFT);
    setBell(false);
    // Platen line-feed nudge
    const p = paperRef.current;
    if (p) {
      p.animate(
        [
          { transform: "translateY(0px)" },
          { transform: "translateY(-16px)" },
          { transform: "translateY(0px)" },
        ],
        { duration: 200, easing: "ease-out" }
      );
    }
  }, [line, carriageX]);

  const typeChar = useCallback(
    (ch: string) => {
      if (line.length >= LINE_MAX) {
        setBell(true);
        return;
      }
      strikeBar(ch.toUpperCase());
      const next = line + ch;
      setLine(next);
      setStrokes((s) => s + 1);
      carriageX.set(PAPER_LEFT + next.length * CHAR_W);
      if (next.length === LINE_MAX - 6) setBell(true);
    },
    [line, strikeBar, carriageX]
  );

  const backspace = useCallback(() => {
    if (!line) return;
    const next = line.slice(0, -1);
    setLine(next);
    carriageX.set(PAPER_LEFT + next.length * CHAR_W);
  }, [line, carriageX]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        carriageReturn();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (e.key.length === 1 && PRINTABLE.test(e.key)) {
        e.preventDefault();
        typeChar(e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backspace, carriageReturn, typeChar]);

  // Cleanup any pending typebar returns
  useEffect(() => {
    const map = barTimers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const visible = [...lines.slice(-7), line];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0d0b09] select-none">
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none z-10">
        <h1 className="font-mono text-sm tracking-[0.35em] text-neutral-100 uppercase">
          Typebar Studio
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Underwood Class · 46-Column Carriage
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none z-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Just Type
          <br />
          Enter / Lever — Carriage Return
        </p>
      </div>

      {/* PAPER */}
      <div
        ref={paperRef}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "7vh",
          width: "min(620px, 86vw)",
          height: "42vh",
          background: "#efe7d3",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(0,0,0,0.08)",
        }}
      >
        {/* Faint rule column */}
        <div
          className="absolute top-0 bottom-0 w-px bg-red-800/20 pointer-events-none"
          style={{ left: PAPER_LEFT - 10 }}
        />
        <div className="p-8 font-mono text-[15px] leading-[1.9] tracking-[0.18em] text-neutral-800 uppercase overflow-hidden h-full">
          {visible.map((l, li) => (
            <div key={li} className="whitespace-pre relative">
              {l.split("").map((c, ci) => (
                <span key={ci} style={{ opacity: 0.78 + ((ci * 7 + li * 3) % 5) * 0.05 }}>
                  {c}
                </span>
              ))}
              {li === visible.length - 1 && (
                <motion.span
                  animate={{ opacity: [1, 0.1, 1] }}
                  transition={{ duration: 1.05, repeat: Infinity }}
                  className="inline-block w-[9px] h-[18px] ml-[1px] align-middle bg-neutral-800"
                />
              )}
            </div>
          ))}
        </div>
        {/* Margin bell flag */}
        <motion.div
          animate={{ opacity: bell ? 1 : 0.14, backgroundColor: bell ? "#f59e0b" : "#57534e" }}
          className="absolute top-3 right-3 px-2 py-1 font-mono text-[9px] tracking-[0.25em] text-neutral-900 rounded-sm"
        >
          {line.length >= LINE_MAX ? "MARGIN STOP" : "BELL"}
        </motion.div>
      </div>

      {/* MACHINE DECK */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center"
        style={{ height: "48vh" }}
      >
        {/* Platen */}
        <div
          className="relative rounded-full border border-neutral-700"
          style={{
            width: "min(720px, 88vw)",
            height: 44,
            background: "#191817",
            boxShadow: "inset 0 4px 0 rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.6)",
          }}
        >
          {/* Carriage rider */}
          <motion.div
            style={{ x: carriageX }}
            className="absolute -bottom-3 w-16 h-6 rounded-md border border-amber-700/70 bg-[#221a10]"
          >
            <span className="absolute inset-x-2 top-1 h-px bg-amber-500/70" />
          </motion.div>
          {/* Left spool */}
          <Spool innerRef={spoolRef} side="left" />
          <Spool side="right" static />
        </div>

        {/* Typebar basket */}
        <div className="relative mt-10" style={{ width: 480, height: 190 }}>
          {Array.from({ length: BAR_COUNT }, (_, i) => {
            const a = restAngle(i);
            return (
              <div
                key={i}
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                className="absolute bottom-0 left-1/2 origin-bottom"
                style={{
                  height: 128,
                  transform: `translateX(-50%) rotate(${a}deg)`,
                  willChange: "transform",
                }}
              >
                <div className="w-[3px] h-full mx-auto bg-neutral-400 rounded-full" />
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-neutral-600 bg-neutral-800"
                />
              </div>
            );
          })}
          {/* Basket hub */}
          <div className="absolute bottom-[-26px] left-1/2 -translate-x-1/2 w-24 h-10 rounded-lg border border-neutral-700 bg-[#17161a]" />
        </div>

        {/* Carriage return lever */}
        <button
          onClick={carriageReturn}
          aria-label="Carriage return"
          className="absolute right-[8%] bottom-16 group cursor-pointer"
        >
          <motion.div
            whileTap={{ rotate: -14, y: 6 }}
            style={{ transformOrigin: "bottom left" }}
            className="w-40 h-3 rounded-full border border-neutral-600"
            id="return-lever"
          >
            <span className="absolute right-0 -top-2 w-5 h-7 rounded-md bg-neutral-300 border border-neutral-500" />
          </motion.div>
          <span className="block mt-2 font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600 group-hover:text-amber-300 transition-colors">
            Return
          </span>
        </button>

        {/* Deck plate readouts */}
        <div className="absolute bottom-6 left-10 flex items-end gap-10 pointer-events-none">
          <Readout label="Strokes">{strokes}</Readout>
          <Readout label="Column">
            {String(line.length).padStart(2, "0")}/{LINE_MAX}
          </Readout>
          <Readout label="Lines">{lines.length + (line ? 1 : 0)}</Readout>
        </div>
      </div>
    </div>
  );
}

function Readout({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
        {label}
      </span>
      <span className="font-mono text-base text-neutral-200 tabular-nums">{children}</span>
    </div>
  );
}

function Spool({
  side,
  static: isStatic,
  innerRef,
}: {
  side: "left" | "right";
  static?: boolean;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "-left-9" : "-right-9"}`}
    >
      <div
        ref={innerRef ?? undefined}
        className="w-14 h-14 rounded-full border-4 border-neutral-600 bg-[#2a2118]"
        style={{
          boxShadow: "inset 0 0 0 4px #0f0d0a, inset 0 3px 0 rgba(255,255,255,0.08)",
          transform: isStatic ? undefined : "rotate(0deg)",
          willChange: isStatic ? undefined : "transform",
        }}
      >
        <span
          className={`absolute inset-3 rounded-full ${
            isStatic ? "bg-red-900/50" : "bg-neutral-900"
          }`}
        />
      </div>
    </div>
  );
}

export default TypebarTypewriter;
