"use client";

import React, { useEffect, useRef, useState } from "react";

export interface RetractableTapeProps {
  /** Extended length in cm (0–300) */
  lengthCm?: number;
  /** Spring constant feel */
  springK?: number;
  /** Lock pawl engaged */
  locked?: boolean;
  size?: number;
  className?: string;
  onLengthChange?: (cm: number) => void;
}

/**
 * Spring-return measuring tape with lock pawl — blade extends against torsion spring.
 */
export function RetractableTape({
  lengthCm: lengthProp = 80,
  springK = 0.35,
  locked = false,
  size = 520,
  className = "",
  onLengthChange,
}: RetractableTapeProps) {
  const [length, setLength] = useState(lengthProp);
  const vel = useRef(0);
  const dragging = useRef(false);
  const params = useRef({ springK, locked, lengthProp });
  params.current = { springK, locked, lengthProp };

  useEffect(() => {
    if (!dragging.current) setLength(lengthProp);
  }, [lengthProp]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const { springK: k, locked: lock } = params.current;
      if (!dragging.current && !lock) {
        // Spring retracts toward 0
        vel.current += -length * k * 8 * dt;
        vel.current *= 0.92;
        const next = Math.max(0, length + vel.current * dt * 60);
        if (Math.abs(next - length) > 0.05) {
          setLength(next);
          onLengthChange?.(next);
        } else if (length > 0.5) {
          setLength(0);
          vel.current = 0;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [length, onLengthChange]);

  const caseX = 80;
  const caseY = size / 2;
  const bladeLen = (length / 300) * (size * 0.7);
  const tipX = caseX + 50 + bladeLen;

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
        touchAction: "none",
      }}
      onPointerMove={(e) => {
        if (!dragging.current || locked) return;
        const rect = (e.target as SVGElement).ownerSVGElement!.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * size;
        const cm = Math.max(0, Math.min(300, ((x - caseX - 50) / (size * 0.7)) * 300));
        vel.current = 0;
        setLength(cm);
        onLengthChange?.(cm);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
    >
      {/* Blade */}
      <rect
        x={caseX + 48}
        y={caseY - 10}
        width={Math.max(0, bladeLen)}
        height={20}
        fill="#d4af37"
        stroke="#8b7355"
      />
      {/* Tick marks */}
      {Array.from({ length: Math.floor(length / 10) }, (_, i) => {
        const cm = (i + 1) * 10;
        const x = caseX + 50 + (cm / 300) * (size * 0.7);
        const major = cm % 50 === 0;
        return (
          <g key={cm}>
            <line
              x1={x}
              y1={caseY - 10}
              x2={x}
              y2={caseY - 10 + (major ? 14 : 8)}
              stroke="#1a1a1a"
              strokeWidth="1"
            />
            {major && (
              <text x={x + 2} y={caseY + 6} fill="#1a1a1a" fontSize="7" fontFamily="monospace">
                {cm}
              </text>
            )}
          </g>
        );
      })}

      {/* Hook tip — drag handle */}
      <rect
        x={tipX - 4}
        y={caseY - 14}
        width={10}
        height={28}
        fill="#c45c26"
        stroke="#111"
        strokeWidth="2"
        style={{ cursor: locked ? "not-allowed" : "grab" }}
        onPointerDown={(e) => {
          if (locked) return;
          dragging.current = true;
          (e.target as Element).setPointerCapture?.(e.pointerId);
        }}
      />

      {/* Case */}
      <rect x={caseX - 30} y={caseY - 55} width={90} height={110} rx={8} fill="#2a2a2a" stroke="#888" strokeWidth="3" />
      <circle cx={caseX + 15} cy={caseY} r={32} fill="#1a1a1a" stroke="#555" strokeWidth="2" />
      {/* Spring coil (flat spiral approx) */}
      {Array.from({ length: 5 }, (_, i) => (
        <circle
          key={i}
          cx={caseX + 15}
          cy={caseY}
          r={8 + i * 4}
          fill="none"
          stroke="#666"
          strokeWidth="1.5"
        />
      ))}

      {/* Lock pawl */}
      <rect
        x={caseX + 40}
        y={caseY + 30}
        width={24}
        height={16}
        fill={locked ? "#c45c26" : "#444"}
        stroke="#111"
        strokeWidth="2"
      />
      <text x={caseX + 52} y={caseY + 42} textAnchor="middle" fill="#eee" fontSize="7" fontFamily="monospace">
        {locked ? "LOCK" : "FREE"}
      </text>

      <text x={12} y={28} fill="#888" fontSize="11" fontFamily="monospace">
        {length.toFixed(1)} cm
      </text>
      <text x={12} y={size - 14} fill="#555" fontSize="9" fontFamily="monospace">
        TORSION SPRING · DRAG HOOK{locked ? " · PAWL SET" : ""}
      </text>
    </svg>
  );
}

export default RetractableTape;
