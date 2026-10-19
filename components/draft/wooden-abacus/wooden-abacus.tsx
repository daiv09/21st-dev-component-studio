"use client";

/**
 * Merchant's Abacus — a 13-rod suan pan with spring-seated beads.
 * Drag a bead zone up/down (or tap either half of a rod) to count beads
 * against the beam; WHEEL over a rod zeroes that decade. The frame keeps
 * a running total in full precision.
 */

import React, { useMemo, useState } from "react";
import { motion, type Transition } from "framer-motion";

const RODS = 13;
const HEAVEN = 2; // beads above the beam, worth 5 each
const EARTH = 5; // beads below the beam, worth 1 each

const BEAD_W = 40;
const BEAD_H = 26;
const RAIL_PITCH = 54;
const BEAM_GAP = 30;
const ZONE_TOP = 64;
const FRAME_W = RODS * RAIL_PITCH + 48;
const BEAM_Y = ZONE_TOP + HEAVEN * (BEAD_H + 8) + BEAM_GAP;
const RAIL_BOTTOM = BEAM_Y + BEAM_GAP + EARTH * (BEAD_H + 6) + 26;

const SEAT: Transition = { type: "spring", stiffness: 560, damping: 32, mass: 0.7 };

interface RodState {
  heaven: number; // engaged count 0..2
  earth: number; // engaged count 0..5
}

function initialRods(): RodState[] {
  // Deterministic opening position: 1,729 seated on the four rightmost rods.
  const digits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 2, 7, 1];
  return digits.map((d) => ({
    heaven: d >= 5 ? 1 : 0,
    earth: d >= 5 ? d - 5 : d,
  }));
}

export function WoodenAbacus() {
  const [rods, setRods] = useState<RodState[]>(initialRods);

  const placeValues = useMemo(
    () => Array.from({ length: RODS }, (_, i) => Math.pow(10, RODS - 1 - i)),
    []
  );

  const total = useMemo(
    () =>
      rods.reduce(
        (sum, r, i) => sum + (r.heaven * 5 + r.earth) * placeValues[i],
        0
      ),
    [rods, placeValues]
  );

  const bump = (rod: number, deck: "heaven" | "earth", delta: number) => {
    setRods((prev) => {
      const next = prev.map((r) => ({ ...r }));
      const max = deck === "heaven" ? HEAVEN : EARTH;
      next[rod][deck] = Math.min(max, Math.max(0, next[rod][deck] + delta));
      return next;
    });
  };

  const zeroRod = (rod: number) => {
    setRods((prev) =>
      prev.map((r, i) => (i === rod ? { heaven: 0, earth: 0 } : r))
    );
  };

  const clearAll = () => setRods(initialRods().map(() => ({ heaven: 0, earth: 0 })));

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#100c07] select-none flex flex-col items-center justify-center">
      {/* Title / hints */}
      <div className="absolute top-8 left-10 pointer-events-none">
        <h1 className="font-mono text-sm tracking-[0.35em] text-amber-200 uppercase">
          Merchant&apos;s Abacus
        </h1>
        <p className="mt-1.5 font-mono text-[10px] tracking-[0.25em] text-neutral-600 uppercase">
          Suan Pan · 13 Rod · Base Ten
        </p>
      </div>
      <div className="absolute top-8 right-10 text-right pointer-events-none">
        <p className="font-mono text-[10px] tracking-[0.25em] text-neutral-500 uppercase leading-relaxed">
          Drag / Tap — Count Beads
          <br />
          Wheel on Rod — Zero Decade
        </p>
      </div>

      {/* Frame */}
      <div
        className="relative rounded-xl border-[10px]"
        style={{
          width: FRAME_W,
          borderColor: "#241a0e",
          background: "#171008",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.75), inset 0 2px 0 rgba(255,255,255,0.05), inset 0 -3px 0 rgba(0,0,0,0.55)",
        }}
      >
        {/* Brass corner plates */}
        {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
          (pos) => (
            <span
              key={pos}
              className={`absolute ${pos} w-4 h-4 bg-amber-700/50 m-0.5 rounded-sm`}
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)" }}
            />
          )
        )}

        <div className="relative" style={{ height: RAIL_BOTTOM + 20 }}>
          {/* Rods */}
          {Array.from({ length: RODS }, (_, rod) => (
            <span
              key={`rod-${rod}`}
              className="absolute top-3 bottom-3 w-[3px] rounded-full bg-neutral-700/70"
              style={{
                left: 24 + rod * RAIL_PITCH + RAIL_PITCH / 2 - 1.5,
                boxShadow: "inset 0 0 3px rgba(0,0,0,0.9)",
              }}
            />
          ))}

          {/* Beam */}
          <div
            className="absolute left-0 right-0 h-5 border-y border-black/70"
            style={{
              top: BEAM_Y,
              background: "#0d0a05",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          />

          {rods.map((state, rod) => (
            <RodColumn
              key={rod}
              rod={rod}
              state={state}
              onBump={bump}
              onZero={zeroRod}
            />
          ))}
        </div>
      </div>

      {/* Readouts */}
      <div className="mt-8 flex items-end gap-12 pointer-events-none">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-600 uppercase">
            Running Total
          </span>
          <span className="font-mono text-5xl text-amber-300 tabular-nums tracking-tight">
            {total.toLocaleString("en-US")}
          </span>
        </div>
        <button
          onClick={clearAll}
          className="mb-2 px-4 py-2 font-mono text-[10px] tracking-[0.3em] uppercase rounded border border-neutral-800 text-neutral-400 hover:text-amber-300 hover:border-amber-700 transition-colors"
        >
          Clear Frame
        </button>
      </div>
    </div>
  );
}

/** One vertical rail: heaven deck above the beam, earth deck below. */
function RodColumn({
  rod,
  state,
  onBump,
  onZero,
}: {
  rod: number;
  state: RodState;
  onBump: (rod: number, deck: "heaven" | "earth", delta: number) => void;
  onZero: (rod: number) => void;
}) {
  const x = 24 + rod * RAIL_PITCH + RAIL_PITCH / 2;

  // Wheel zeroes the decade (stage never scrolls; just contain the event).
  const onWheelCapture = (e: React.WheelEvent) => {
    e.stopPropagation();
    onZero(rod);
  };

  // Drag direction decides count-up vs count-down; tap falls back by deck state.
  const dragRef = React.useRef<{ y: number; active: boolean } | null>(null);
  const didDragRef = React.useRef(false);

  const beginDrag = (e: React.PointerEvent) => {
    dragRef.current = { y: e.clientY, active: true };
    didDragRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent, deck: "heaven" | "earth") => {
    if (!dragRef.current?.active) return;
    const dy = e.clientY - dragRef.current.y;
    if (dy > 16 || dy < -16) {
      onBump(rod, deck, dy < 0 ? 1 : -1);
      didDragRef.current = true;
      dragRef.current.active = false;
    }
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  const tapZone = (
    deck: "heaven" | "earth",
    top: number,
    height: number
  ) => (
    <div
      className="absolute cursor-pointer"
      style={{ left: x - RAIL_PITCH / 2, top, width: RAIL_PITCH, height }}
      onWheelCapture={onWheelCapture}
      onPointerDown={beginDrag}
      onPointerMove={(e) => moveDrag(e, deck)}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={() => {
        if (didDragRef.current) return; // the drag already counted this gesture
        const engagedCount = deck === "heaven" ? state.heaven : state.earth;
        const max = deck === "heaven" ? HEAVEN : EARTH;
        onBump(rod, deck, engagedCount >= max ? -1 : 1);
      }}
      role="presentation"
    />
  );

  return (
    <>
      {tapZone("heaven", ZONE_TOP - 18, HEAVEN * (BEAD_H + 8) + 36)}
      {tapZone(
        "earth",
        BEAM_Y + 20,
        EARTH * (BEAD_H + 6) + 22
      )}

      {/* Heaven beads — engaged seats nearest the beam */}
      {Array.from({ length: HEAVEN }, (_, i) => {
        const engaged = i < state.heaven;
        const y = engaged
          ? BEAM_Y - BEAM_GAP - (HEAVEN - i) * (BEAD_H + 8) + 14
          : ZONE_TOP + i * (BEAD_H + 8);
        return <Bead key={`h${i}`} x={x} y={y} tone="heaven" engaged={engaged} />;
      })}

      {/* Earth beads — engaged seats nearest the beam */}
      {Array.from({ length: EARTH }, (_, i) => {
        const engaged = i < state.earth;
        const y = engaged
          ? BEAM_Y + 20 + i * (BEAD_H + 6)
          : RAIL_BOTTOM - (EARTH - i) * (BEAD_H + 6) + 6;
        return <Bead key={`e${i}`} x={x} y={y} tone="earth" engaged={engaged} />;
      })}

      {/* Per-rod digit */}
      <span
        className="absolute font-mono text-[11px] tabular-nums pointer-events-none"
        style={{ left: x - 6, top: RAIL_BOTTOM + 24 }}
      >
        <span className="text-neutral-500">{state.heaven * 5 + state.earth}</span>
      </span>
    </>
  );
}

function Bead({
  x,
  y,
  tone,
  engaged,
}: {
  x: number;
  y: number;
  tone: "heaven" | "earth";
  engaged: boolean;
}) {
  return (
    <motion.div
      className="absolute rounded-[50%] pointer-events-none"
      animate={{ y }}
      transition={SEAT}
      style={{
        left: x - BEAD_W / 2,
        width: BEAD_W,
        height: BEAD_H,
        backgroundColor:
          tone === "heaven" ? (engaged ? "#e6b35c" : "#d4a24e") : "#8a5a33",
        boxShadow: engaged
          ? "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.45), 0 0 0 1px rgba(245,158,11,0.35)"
          : "inset 0 2px 0 rgba(255,255,255,0.22), inset 0 -3px 0 rgba(0,0,0,0.45)",
      }}
    />
  );
}

export default WoodenAbacus;
