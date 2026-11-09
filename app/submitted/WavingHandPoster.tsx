"use client";

import React, { useState } from "react";

interface WavingHandPosterProps {
    greetingText?: string;
    introPrefix?: string;
    nameText?: string;
    subtitleText?: string;
}

export default function WavingHandPoster({
    greetingText = "Hey!",
    introPrefix = "I'm",
    nameText = "Daiwiik",
    subtitleText = "",
}: WavingHandPosterProps) {
    const [animKey, setAnimKey] = useState(0);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });

    const replayAnimation = () => {
        setAnimKey((prev) => prev + 1);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setPointer({ x: normX, y: normY });
    };

    const handlePointerLeave = () => {
        setPointer({ x: 0, y: 0 });
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={replayAnimation}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    replayAnimation();
                }
            }}
            aria-label={`${greetingText} ${introPrefix} ${nameText}. Click to replay waving hand ribbon animation.`}
            className="relative w-full max-w-[92vw] sm:max-w-md md:max-w-lg aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl cursor-pointer select-none bg-[#F1F3F6] dark:bg-[#0B1120] border border-black/5 dark:border-white/10 transition-colors duration-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0051FF] group"
        >
            {/* Embedded Google Fonts & Snappy Keyframes */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

                @keyframes ribbonSweep {
                    0% {
                        stroke-dashoffset: 1000;
                    }
                    100% {
                        stroke-dashoffset: 0;
                    }
                }

                @keyframes handBloom {
                    0% {
                        opacity: 0;
                        transform: scale(0.25) rotate(-18deg);
                    }
                    35% {
                        opacity: 1;
                    }
                    72% {
                        opacity: 1;
                        transform: scale(1.06) rotate(9deg);
                    }
                    88% {
                        transform: scale(0.98) rotate(-4deg);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }

                @keyframes naturalWave {
                    0%, 100% {
                        transform: rotate(0deg);
                    }
                    22% {
                        transform: rotate(10deg);
                    }
                    48% {
                        transform: rotate(-7deg);
                    }
                    74% {
                        transform: rotate(8deg);
                    }
                    90% {
                        transform: rotate(-2deg);
                    }
                }

                @keyframes unifiedFloat {
                    0%, 100% {
                        transform: translate3d(0px, 0px, 0px);
                    }
                    50% {
                        transform: translate3d(-3px, 5px, 0px);
                    }
                }

                @keyframes letterSpring {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, 20px, 0) rotate(-8deg) scale(0.65);
                        filter: blur(3px);
                    }
                    68% {
                        opacity: 1;
                        transform: translate3d(0, -4px, 0) rotate(2.5deg) scale(1.04);
                        filter: blur(0px);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0px, 0) rotate(var(--rot, 0deg)) scale(1);
                        filter: blur(0px);
                    }
                }

                @keyframes floatIdle {
                    0%, 100% {
                        transform: translate3d(0, 0px, 0) rotate(var(--rot, 0deg));
                    }
                    50% {
                        transform: translate3d(0, -3.5px, 0) rotate(calc(var(--rot, 0deg) + 1.8deg));
                    }
                }

                .arm-assembly {
                    will-change: transform;
                    animation: unifiedFloat 5s ease-in-out 1s infinite;
                }

                .ribbon-stroke {
                    stroke-dasharray: 1000;
                    stroke-dashoffset: 1000;
                    will-change: stroke-dashoffset;
                    animation: ribbonSweep 0.82s cubic-bezier(0.22, 1, 0.36, 1) 0.04s forwards;
                }

                /* Pivots directly on the rounded end-cap of the ribbon (415, 225) for zero seam */
                .hand-pivot {
                    opacity: 0;
                    transform-origin: 415px 225px;
                    will-change: transform, opacity;
                    animation:
                        handBloom 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.6s forwards,
                        naturalWave 1.85s ease-in-out 1.12s infinite;
                }

                .group:hover .hand-pivot {
                    animation-duration: 0.52s, 0.95s;
                }

                .spring-char {
                    display: inline-block;
                    opacity: 0;
                    will-change: transform, opacity;
                    animation:
                        letterSpring 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                        floatIdle 3.2s ease-in-out infinite;
                }
            `}</style>

            {/* Continuous Looping Blue Ribbon & Seamless Sculpted Hand SVG */}
            <svg
                key={`svg-${animKey}`}
                viewBox="0 0 600 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out"
                style={{
                    transform: `translate3d(${pointer.x * 8}px, ${pointer.y * 8}px, 0)`,
                }}
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    {/* Crisp illustration edge with subtle organic warmth */}
                    <filter id="smoothPosterEdge" x="-5%" y="-5%" width="110%" height="110%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.03"
                            numOctaves="2"
                            seed="7"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="1.1"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>

                <g filter="url(#smoothPosterEdge)" className="arm-assembly">
                    {/*
                        Looping Cobalt Blue Ribbon Arm:
                        Enters from bottom-left, sweeps across, loops around the right border,
                        and rises vertically into the exact wrist joint at (415, 225).
                        strokeLinecap="round" forms a 44px-radius ball joint at (415, 225)
                        so the hand can rotate smoothly without ever exposing a corner or seam.
                    */}
                    <path
                        pathLength="1000"
                        d="M -70 468 L 430 318 C 530 288, 645 288, 655 395 C 665 510, 610 615, 515 572 C 435 536, 415 430, 415 315 L 415 225"
                        strokeWidth="88"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-stroke stroke-[#0051FF] dark:stroke-[#3B82F6]"
                    />

                    {/*
                        Unified Sculpted Waving Hand:
                        Width matches the 88px ribbon (x: 371 to 459) and wraps around the
                        ball-joint wrist at (415, 225) so the transition is 100% flush.
                    */}
                    <g className="hand-pivot">
                        <path
                            d="
                                M 371 225
                                L 371 96
                                A 8.5 8.5 0 0 1 388 96
                                L 388 136
                                A 3 3 0 0 0 394 136
                                L 394 74
                                A 9 9 0 0 1 412 74
                                L 412 134
                                A 3 3 0 0 0 418 134
                                L 418 62
                                A 9 9 0 0 1 436 62
                                L 436 136
                                A 3 3 0 0 0 442 136
                                L 442 76
                                A 8.5 8.5 0 0 1 459 76
                                L 459 148
                                C 459 152, 463 153, 466 149
                                C 473 139, 482 126, 490 120
                                C 499 113, 510 121, 504 134
                                C 495 156, 479 182, 466 205
                                C 461 213, 459 220, 459 228
                                A 44 44 0 0 1 371 225
                                Z
                            "
                            className="fill-[#0051FF] dark:fill-[#3B82F6]"
                        />

                        {/* Signature Curved Negative-Space Thumb Crease Cutout */}
                        <path
                            d="M 441 163 C 448 148, 458 143, 467 146"
                            strokeWidth="6"
                            strokeLinecap="round"
                            className="stroke-[#F1F3F6] dark:stroke-[#0B1120] transition-colors duration-500"
                        />
                    </g>
                </g>
            </svg>

            {/* Subtle Matte Poster Grain Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.09] dark:opacity-[0.06] mix-blend-overlay"
                style={{
                    backgroundImage: `radial-gradient(#0051FF 0.75px, transparent 0.75px), radial-gradient(#090D16 0.5px, #F1F3F6 0.5px)`,
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 12px 12px",
                }}
            />

            {/* Poster Typography Layer with Subtle Inverse Parallax */}
            <div
                key={`text-${animKey}`}
                className="relative z-10 w-full h-full flex flex-col justify-between p-7 sm:p-10 pointer-events-none transition-transform duration-300 ease-out"
                style={{
                    transform: `translate3d(${pointer.x * -4}px, ${pointer.y * -4}px, 0)`,
                }}
            >
                {/* Top-Left Greeting: "Hey!" */}
                <div
                    className="flex items-center text-[3.5rem] sm:text-[4.5rem] md:text-[5.25rem] font-extrabold tracking-[-0.03em] leading-none text-[#090D16] dark:text-[#F8FAFC] mt-4 sm:mt-6"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                    {greetingText.split("").map((char, idx) => {
                        const rotations = ["-2deg", "1.5deg", "-1deg", "3deg"];
                        return (
                            <span
                                key={idx}
                                className="spring-char"
                                style={
                                    {
                                        "--rot": rotations[idx % rotations.length],
                                        animationDelay: `${0.12 + idx * 0.05}s, ${0.7 + idx * 0.1}s`,
                                    } as React.CSSProperties
                                }
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        );
                    })}
                </div>

                {/* Bottom-Left Bio Block: "I'm Daiwiik" */}
                <div className="flex flex-col items-start mb-4 sm:mb-6">
                    {/* Line 1: Bold Sans Prefix ("I'm") */}
                    <div
                        className="flex items-center text-2xl sm:text-3xl md:text-[2.25rem] font-extrabold tracking-[-0.02em] text-[#090D16] dark:text-[#F8FAFC] leading-tight"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        {introPrefix.split("").map((char, idx) => (
                            <span
                                key={idx}
                                className="spring-char"
                                style={
                                    {
                                        "--rot": "0deg",
                                        animationDelay: `${0.35 + idx * 0.045}s, ${0.95 + idx * 0.09}s`,
                                    } as React.CSSProperties
                                }
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        ))}
                    </div>

                    {/* Line 2: Expressive Script Name ("Daiwiik") */}
                    <div className="flex items-baseline flex-wrap gap-x-2 -mt-2 sm:-mt-3">
                        <div
                            className="flex items-center text-[4rem] sm:text-[4.75rem] md:text-[5.5rem] font-bold text-[#0051FF] dark:text-[#60A5FA] leading-none py-1"
                            style={{ fontFamily: "'Caveat', cursive" }}
                        >
                            {nameText.split("").map((char, idx) => {
                                const rotations = [
                                    "-2deg",
                                    "1.5deg",
                                    "-1deg",
                                    "2deg",
                                    "-1.5deg",
                                    "1deg",
                                    "-2deg",
                                ];
                                return (
                                    <span
                                        key={idx}
                                        className="spring-char"
                                        style={
                                            {
                                                "--rot": rotations[idx % rotations.length],
                                                animationDelay: `${0.48 + idx * 0.045}s, ${1.1 + idx * 0.09}s`,
                                            } as React.CSSProperties
                                        }
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Line 3: Clean Subtitle ("nice to meet you") */}
                    {subtitleText && (
                        <div
                            className="flex items-center text-lg sm:text-xl md:text-2xl font-bold tracking-[-0.01em] text-[#090D16]/85 dark:text-[#F8FAFC]/85 mt-0.5"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            {subtitleText.split("").map((char, idx) => (
                                <span
                                    key={idx}
                                    className="spring-char"
                                    style={
                                        {
                                            "--rot": "0deg",
                                            animationDelay: `${0.75 + idx * 0.02}s, ${1.35 + idx * 0.04}s`,
                                        } as React.CSSProperties
                                    }
                                >
                                    {char === " " ? "\u00A0" : char}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle Replay Hint Badge */}
            <span className="absolute bottom-3 right-4 z-20 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-[#0051FF]/70 dark:text-[#93C5FD]/70 bg-[#F1F3F6]/80 dark:bg-[#0B1120]/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#0051FF]/10 group-hover:scale-105 transition-transform">
                Click to replay ↻
            </span>
        </div>
    );
}