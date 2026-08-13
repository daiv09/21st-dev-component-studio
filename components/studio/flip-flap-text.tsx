"use client";

import React, { useEffect, useRef, useState } from "react";

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-:./";

export interface SplitFlapChronographProps {
    /** Target display string (padded/truncated to `digits`) */
    value?: string;
    /** Number of flap modules */
    digits?: number;
    /** Flap width */
    flapWidth?: number;
    /** Flap height */
    flapHeight?: number;
    /** Inertia: ms base per flap step */
    stepMs?: number;
    /** Extra ms variance for mechanical stagger */
    staggerMs?: number;
    className?: string;
    onSettle?: () => void;
}

function normalize(value: string, digits: number) {
    const up = value.toUpperCase().slice(0, digits);
    return up.padEnd(digits, " ");
}

function FlapModule({
    target,
    stepMs,
    delay,
    width,
    height,
}: {
    target: string;
    stepMs: number;
    delay: number;
    width: number;
    height: number;
}) {
    const [char, setChar] = useState(" ");
    const [flipping, setFlipping] = useState(false);
    const [nextChar, setNextChar] = useState(" ");
    const idxRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const goal = CHARSET.indexOf(target);
        const targetIdx = goal < 0 ? 0 : goal;

        const tick = () => {
            if (idxRef.current === targetIdx) {
                setFlipping(false);
                return;
            }
            const next = (idxRef.current + 1) % CHARSET.length;
            setNextChar(CHARSET[next]);
            setFlipping(true);

            const duration = stepMs * (0.6 + Math.random() * 0.2);
            timerRef.current = setTimeout(() => {
                idxRef.current = next;
                setChar(CHARSET[next]);
                setFlipping(false);
                const coast = stepMs * (0.3 + Math.random() * 0.3);
                timerRef.current = setTimeout(tick, coast);
            }, duration);
        };

        timerRef.current = setTimeout(tick, delay);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [target, stepMs, delay]);

    return (
        <div
            className="relative select-none shadow-lg rounded bg-neutral-900 border border-neutral-700 overflow-hidden flex items-center justify-center"
            style={{ width, height, perspective: 600 }}
            aria-label={char}
        >
            {/* Current Full Character (stays underneath) */}
            <div
                className="absolute inset-0 flex items-center justify-center text-neutral-100 font-bold"
                style={{
                    fontSize: height * 0.6,
                    fontFamily: "ui-monospace, monospace",
                    lineHeight: 1,
                }}
            >
                {char}
            </div>

            {/* Single Flipping Full Card */}
            {flipping && (
                <div
                    className="absolute inset-0 bg-neutral-800 border border-neutral-600 flex items-center justify-center text-neutral-100 font-bold rounded origin-top"
                    style={{
                        fontSize: height * 0.6,
                        fontFamily: "ui-monospace, monospace",
                        lineHeight: 1,
                        transform: "rotateX(0deg)",
                        animation: `single-flap-flip ${stepMs * 0.6}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                        backfaceVisibility: "hidden",
                        zIndex: 10,
                    }}
                >
                    {nextChar}
                </div>
            )}
        </div>
    );
}

export function SplitFlapChronograph({
    value = "HELLO",
    digits = 6,
    flapWidth = 44,
    flapHeight = 64,
    stepMs = 60,
    staggerMs = 50,
    className = "",
    onSettle,
}: SplitFlapChronographProps) {
    const text = normalize(value, digits);
    const settleRef = useRef(onSettle);
    settleRef.current = onSettle;

    useEffect(() => {
        const maxSteps = CHARSET.length;
        const t = setTimeout(
            () => settleRef.current?.(),
            digits * staggerMs + maxSteps * stepMs * 1.4
        );
        return () => clearTimeout(t);
    }, [text, digits, staggerMs, stepMs]);

    return (
        <div className={`inline-flex flex-col gap-3 ${className}`}>
            <style>{`
        @keyframes single-flap-flip {
          0% {
            transform: rotateX(-90deg);
            opacity: 0.5;
          }
          100% {
            transform: rotateX(0deg);
            opacity: 1;
          }
        }
      `}</style>
            <div className="inline-flex gap-2 p-4 bg-neutral-950 border border-neutral-700 rounded-xl shadow-2xl">
                {text.split("").map((ch, i) => (
                    <FlapModule
                        key={`${i}-${text}`}
                        target={ch}
                        stepMs={stepMs}
                        delay={i * staggerMs}
                        width={flapWidth}
                        height={flapHeight}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Interactive default export component containing both the SplitFlap display and an input box.
 */
export default function SplitFlapInput({
    digits = 8,
    flapWidth = 44,
    flapHeight = 64,
    stepMs = 60,
    staggerMs = 50,
    className = "",
}: {
    digits?: number;
    flapWidth?: number;
    flapHeight?: number;
    stepMs?: number;
    staggerMs?: number;
    className?: string;
}) {
    const [inputVal, setInputVal] = useState("FLIP ME");

    return (
        <div className={`flex flex-col items-center gap-6 p-6 ${className}`}>
            <SplitFlapChronograph
                value={inputVal}
                digits={digits}
                flapWidth={flapWidth}
                flapHeight={flapHeight}
                stepMs={stepMs}
                staggerMs={staggerMs}
            />
            <div className="w-full max-w-md flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-300">
                    Type to spin display:
                </label>
                <input
                    type="text"
                    maxLength={digits}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Type anything..."
                    className="px-4 py-2 bg-neutral-900 border border-neutral-700 text-neutral-100 rounded focus:outline-none focus:border-neutral-500 font-mono uppercase tracking-wider"
                />
                <span className="text-xs text-neutral-500">
                    Max {digits} characters. Supported: A-Z, 0-9, spaces, and punctuation (-:./).
                </span>
            </div>
        </div>
    );
}