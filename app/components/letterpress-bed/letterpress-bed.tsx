"use client";

import React, { useState } from "react";

export interface LetterpressBedProps {
  text?: string;
  /** Impression pressure 0–1 */
  pressure?: number;
  /** Brayer ink load 0–1 */
  ink?: number;
  /** Whether type is locked in chase */
  locked?: boolean;
  size?: number;
  className?: string;
}

const TYPE_W = 28;
const TYPE_H = 36;

/**
 * Movable type letterpress bed: sorts in a chase, brayer inking, impression offset print.
 */
export function LetterpressBed({
  text = "PRESS",
  pressure = 0.7,
  ink = 0.85,
  locked = true,
  size = 520,
  className = "",
}: LetterpressBedProps) {
  const chars = text.toUpperCase().slice(0, 8).split("");
  const bedY = size * 0.42;
  const startX = size / 2 - (chars.length * (TYPE_W + 4)) / 2;

  // Impression: offset print below bed, opacity/offset from pressure
  const impressOffset = 4 + pressure * 10;
  const impressAlpha = Math.min(1, ink * pressure * 1.1);

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
      {/* Chase / bed */}
      <rect x={40} y={bedY - 50} width={size - 80} height={120} fill="#2a2420" stroke="#6b5b4a" strokeWidth="3" />
      <rect x={52} y={bedY - 38} width={size - 104} height={96} fill="#1a1612" stroke="#3a3028" strokeWidth="1" />

      {/* Furniture / quoins */}
      <rect x={56} y={bedY - 30} width={18} height={80} fill="#5a4a3a" stroke="#333" />
      <rect x={size - 74} y={bedY - 30} width={18} height={80} fill="#5a4a3a" stroke="#333" />
      {locked && (
        <text x={60} y={bedY + 60} fill="#8a7a6a" fontSize="8" fontFamily="monospace">
          LOCKED
        </text>
      )}

      {/* Type sorts */}
      {chars.map((ch, i) => {
        const x = startX + i * (TYPE_W + 4);
        const y = bedY - 20;
        const inkFill = `rgb(${Math.round(20 + (1 - ink) * 40)},${Math.round(18 + (1 - ink) * 30)},${Math.round(16 + (1 - ink) * 20)})`;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={TYPE_W}
              height={TYPE_H}
              fill={inkFill}
              stroke="#888"
              strokeWidth="1"
              transform={locked ? undefined : `rotate(${(i % 3) - 1} ${x + TYPE_W / 2} ${y + TYPE_H / 2})`}
            />
            {/* Mirror/relief letter on face */}
            <text
              x={x + TYPE_W / 2}
              y={y + TYPE_H / 2 + 6}
              textAnchor="middle"
              fill="#e8e4d9"
              fontSize="18"
              fontFamily="Georgia, serif"
              fontWeight="bold"
              opacity={0.35}
              transform={`scale(-1,1) translate(${-(x + TYPE_W / 2) * 2}, 0)`}
            >
              {ch}
            </text>
            <text
              x={x + TYPE_W / 2}
              y={y + TYPE_H / 2 + 6}
              textAnchor="middle"
              fill="#c4b59a"
              fontSize="16"
              fontFamily="Georgia, serif"
              fontWeight="bold"
            >
              {ch}
            </text>
          </g>
        );
      })}

      {/* Brayer */}
      <g transform={`translate(${size * 0.15}, ${bedY - 90})`}>
        <rect x={0} y={10} width={120} height={14} rx={2} fill="#333" stroke="#666" />
        <rect x={10} y={0} width={100} height={18} fill={`rgb(${30},${25},${20})`} stroke="#555" />
        <line x1={50} y1={-8} x2={50} y2={0} stroke="#888" strokeWidth="3" />
        <line x1={70} y1={-8} x2={70} y2={0} stroke="#888" strokeWidth="3" />
        <text x={0} y={40} fill="#666" fontSize="8" fontFamily="monospace">
          BRAYER ink={(ink * 100) | 0}%
        </text>
      </g>

      {/* Paper + impression */}
      <rect
        x={size * 0.2}
        y={bedY + 90}
        width={size * 0.6}
        height={100}
        fill="#e8e4d9"
        stroke="#aaa"
        strokeWidth="1"
      />
      {chars.map((ch, i) => {
        const x = size * 0.2 + 24 + i * (TYPE_W + 2);
        const y = bedY + 90 + 55 + (1 - pressure) * 4;
        return (
          <text
            key={`imp-${i}`}
            x={x}
            y={y}
            fill={`rgba(20,16,12,${impressAlpha})`}
            fontSize="22"
            fontFamily="Georgia, serif"
            fontWeight="bold"
            style={{ letterSpacing: 2 }}
            transform={`translate(0, ${impressOffset * 0.1})`}
          >
            {ch}
          </text>
        );
      })}
      {/* Hard impression bite marks */}
      {pressure > 0.5 &&
        chars.map((_, i) => (
          <rect
            key={`bite-${i}`}
            x={size * 0.2 + 20 + i * (TYPE_W + 2)}
            y={bedY + 90 + 30}
            width={TYPE_W - 4}
            height={2}
            fill={`rgba(0,0,0,${pressure * 0.25})`}
          />
        ))}

      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        PRESSURE {(pressure * 100) | 0}% · MOVABLE TYPE
      </text>
    </svg>
  );
}

export default LetterpressBed;
