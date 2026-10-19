"use client";

import React, { useMemo } from "react";

export interface CableStayedBridgeProps {
  /** Uniform load intensity */
  load?: number;
  /** Cable sag parameter (higher = more sag) */
  sag?: number;
  /** Number of stay cables per side */
  stays?: number;
  size?: number;
  className?: string;
}

/** Catenary y = a cosh(x/a) − a, fitted through endpoints with sag control */
function catenaryPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  sag: number,
  n = 24
) {
  const pts: { x: number; y: number }[] = [];
  const midY = (y0 + y1) / 2 + sag;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    // parabolic approx to catenary under uniform load
    const y = (1 - t) * y0 + t * y1 + 4 * sag * t * (1 - t);
    void midY;
    pts.push({ x, y });
  }
  return pts;
}

/**
 * Cable-stayed bridge: tower, deck, stays + main catenary cables under load sag.
 */
export function CableStayedBridge({
  load = 0.6,
  sag = 28,
  stays = 7,
  size = 520,
  className = "",
}: CableStayedBridgeProps) {
  const deckY = size * 0.62;
  const towerX = size * 0.5;
  const towerTop = size * 0.18;
  const towerH = deckY - towerTop;
  const left = size * 0.08;
  const right = size * 0.92;

  const mainCable = useMemo(() => {
    const s = sag * (0.5 + load);
    const leftArc = catenaryPoints(left, deckY - 10, towerX, towerTop + 10, s);
    const rightArc = catenaryPoints(towerX, towerTop + 10, right, deckY - 10, s);
    return [...leftArc, ...rightArc.slice(1)];
  }, [load, sag, left, right, towerX, towerTop, deckY]);

  const stayLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; tension: number }[] = [];
    for (let i = 1; i <= stays; i++) {
      const t = i / (stays + 1);
      const xL = towerX - (towerX - left) * t;
      const xR = towerX + (right - towerX) * t;
      const attachY = towerTop + towerH * 0.15 * (1 - t);
      // Deck deflects under load near midspan-ish
      const deckDeflect = load * 8 * Math.sin(t * Math.PI);
      lines.push({
        x1: towerX,
        y1: attachY,
        x2: xL,
        y2: deckY + deckDeflect,
        tension: 1 - t * 0.4 + load * 0.2,
      });
      lines.push({
        x1: towerX,
        y1: attachY,
        x2: xR,
        y2: deckY + deckDeflect,
        tension: 1 - t * 0.4 + load * 0.2,
      });
    }
    return lines;
  }, [stays, towerX, left, right, towerTop, towerH, deckY, load]);

  const deckSag = load * 10;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{
        background: "#0a0a0a",
        border: "1px solid #2a2a2a",
        boxShadow: "8px 8px 0 #000",
      }}
    >
      {/* Water / ground flat bands */}
      <rect x={0} y={deckY + 40} width={size} height={size - deckY - 40} fill="#0e1518" />
      <rect x={0} y={deckY + 40} width={size} height={8} fill="#1a3038" />

      {/* Piers */}
      <rect x={left - 8} y={deckY} width={16} height={50} fill="#444" />
      <rect x={right - 8} y={deckY} width={16} height={50} fill="#444" />
      <rect x={towerX - 14} y={deckY} width={28} height={70} fill="#555" />

      {/* Tower */}
      <rect x={towerX - 10} y={towerTop} width={20} height={towerH} fill="#8a8a8a" stroke="#111" />
      <rect x={towerX - 18} y={towerTop} width={36} height={14} fill="#aaa" stroke="#111" />

      {/* Main catenary */}
      <polyline
        points={mainCable.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#d4af37"
        strokeWidth="2.5"
      />

      {/* Stays */}
      {stayLines.map((s, i) => (
        <line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke="#c4b59a"
          strokeWidth={0.8 + s.tension * 0.8}
        />
      ))}

      {/* Deck */}
      <path
        d={`M ${left} ${deckY} Q ${towerX} ${deckY + deckSag} ${right} ${deckY}`}
        fill="none"
        stroke="#e8e4d9"
        strokeWidth="8"
        strokeLinecap="square"
      />
      <path
        d={`M ${left} ${deckY + 6} Q ${towerX} ${deckY + deckSag + 6} ${right} ${deckY + 6}`}
        fill="none"
        stroke="#333"
        strokeWidth="2"
      />

      {/* Load markers */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = (i + 1) / 6;
        const x = left + (right - left) * t;
        const y = deckY + deckSag * Math.sin(t * Math.PI) + 8;
        return (
          <g key={i}>
            <line x1={x} y1={y} x2={x} y2={y + 12 + load * 16} stroke="#666" strokeWidth="2" />
            <rect x={x - 6} y={y + 12 + load * 16} width={12} height={10} fill="#c45c26" />
          </g>
        );
      })}

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        LOAD {load.toFixed(2)} · CATENARY SAG · {stays} STAYS/SIDE
      </text>
    </svg>
  );
}

export default CableStayedBridge;
