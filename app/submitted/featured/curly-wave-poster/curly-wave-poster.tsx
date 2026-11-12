"use client";

import React, { useState } from "react";

interface CurlyWavePosterProps {
    topText?: string;
    middleText?: string;
    bottomText?: string;
}

export default function CurlyWavePoster({
    topText = "DON'T",
    middleText = "overthink",
    bottomText = "IT",
}: CurlyWavePosterProps) {
    const [animKey, setAnimKey] = useState(0);

    const replayAnimation = () => {
        setAnimKey((prev) => prev + 1);
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={replayAnimation}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    replayAnimation();
                }
            }}
            aria-label={`${topText} ${middleText} ${bottomText}. Click to replay curly wave animation.`}
            className="relative w-full max-w-[92vw] sm:max-w-md md:max-w-lg aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl cursor-pointer select-none bg-[#F4EFE0] dark:bg-[#0B1120] border border-black/5 dark:border-white/10 transition-colors duration-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2E77C5]"
        >
            {/* Embedded Google Fonts & Realistic Brush Keyframes */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Fredoka:wght@600;700&display=swap');

        @keyframes brushDraw {
          0% {
            stroke-dashoffset: 1000;
            stroke-width: 14px;
            opacity: 0;
          }
          8% {
            opacity: 0.92;
          }
          65% {
            stroke-width: 47px;
          }
          100% {
            stroke-dashoffset: 0;
            stroke-width: 43px;
            opacity: 0.92;
          }
        }

        @keyframes organicFlowA {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translate3d(5px, -6px, 0px) rotate(0.7deg) scale(1.01);
          }
          66% {
            transform: translate3d(-4px, 4px, 0px) rotate(-0.5deg) scale(0.995);
          }
        }

        @keyframes organicFlowB {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) rotate(0deg) scale(1);
          }
          40% {
            transform: translate3d(-6px, -4px, 0px) rotate(-0.8deg) scale(1.012);
          }
          75% {
            transform: translate3d(4px, 6px, 0px) rotate(0.6deg) scale(0.99);
          }
        }

        @keyframes curlyLetterSpring {
          0% {
            opacity: 0;
            transform: translate3d(0, 26px, 0) rotate(-15deg) scale(0.55);
            filter: blur(4px);
          }
          60% {
            opacity: 1;
            transform: translate3d(0, -6px, 0) rotate(4deg) scale(1.06);
            filter: blur(0px);
          }
          82% {
            transform: translate3d(0, 2px, 0) rotate(-2deg) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0px, 0) rotate(var(--rot, 0deg)) scale(1);
            filter: blur(0px);
          }
        }

        @keyframes scriptWaveIdle {
          0%, 100% {
            transform: translate3d(0, 0px, 0) rotate(var(--rot, 0deg));
          }
          50% {
            transform: translate3d(0, -4px, 0) rotate(calc(var(--rot, 0deg) + 2.5deg));
          }
        }

        .ribbon-base {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          will-change: stroke-dashoffset, transform;
          transform-origin: center center;
        }

        .ribbon-1 {
          animation:
            brushDraw 2.1s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards,
            organicFlowA 7.5s ease-in-out 2.2s infinite;
        }
        .ribbon-2 {
          animation:
            brushDraw 2.3s cubic-bezier(0.16, 1, 0.3, 1) 0.16s forwards,
            organicFlowB 8.2s ease-in-out 2.4s infinite;
        }
        .ribbon-3 {
          animation:
            brushDraw 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.28s forwards,
            organicFlowA 9s ease-in-out 2.7s infinite reverse;
        }
        .ribbon-4 {
          animation:
            brushDraw 2.0s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards,
            organicFlowB 7.8s ease-in-out 2.4s infinite;
        }
        .ribbon-5 {
          animation:
            brushDraw 2.2s cubic-bezier(0.16, 1, 0.3, 1) 0.52s forwards,
            organicFlowA 8.5s ease-in-out 2.7s infinite;
        }
        .ribbon-6 {
          animation:
            brushDraw 1.9s cubic-bezier(0.16, 1, 0.3, 1) 0.64s forwards,
            organicFlowB 6.8s ease-in-out 2.5s infinite reverse;
        }
        .ribbon-7 {
          animation:
            brushDraw 2.1s cubic-bezier(0.16, 1, 0.3, 1) 0.75s forwards,
            organicFlowA 7.2s ease-in-out 2.8s infinite;
        }

        .curly-char {
          display: inline-block;
          opacity: 0;
          will-change: transform, opacity;
          animation:
            curlyLetterSpring 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            scriptWaveIdle 3.4s ease-in-out infinite;
        }
      `}</style>

            {/* Dense, Interwoven SVG Curly Ribbons */}
            <svg
                key={`svg-${animKey}`}
                viewBox="0 0 600 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    {/* Realistic gouache/marker edge roughness */}
                    <filter id="gouacheBrush" x="-8%" y="-8%" width="116%" height="116%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.045"
                            numOctaves="3"
                            seed="4"
                            result="roughNoise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="roughNoise"
                            scale="3.2"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>

                <g filter="url(#gouacheBrush)">
                    {/* Ribbon 1: Upper Left Loop & Sweeping S-Curve */}
                    <path
                        pathLength="1000"
                        d="M 175 -35 C 190 95, -25 135, 50 40 C 115 -40, 20 265, 135 265 C 245 265, 375 -35, 405 -30"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-base ribbon-1 stroke-[#4B92DB] dark:stroke-[#38BDF8] mix-blend-multiply dark:mix-blend-screen"
                    />

                    {/* Ribbon 2: Dense Multi-Crest Top Wave */}
                    <path
                        pathLength="1000"
                        d="M -45 110 C 85 110, 45 265, 150 265 C 250 265, 175 95, 260 95 C 345 95, 285 265, 380 265 C 475 265, 435 55, 645 65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-base ribbon-2 stroke-[#2A6FBE] dark:stroke-[#60A5FA] mix-blend-multiply dark:mix-blend-screen"
                    />

                    {/* Ribbon 3: Right Spine Cascade into Bottom Loop */}
                    <path
                        pathLength="1000"
                        d="M 410 -35 C 345 160, 420 250, 495 335 C 570 420, 585 495, 515 565 C 435 645, 150 560, 155 715 C 160 830, 305 795, 310 695"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-base ribbon-3 stroke-[#4B92DB] dark:stroke-[#38BDF8] mix-blend-multiply dark:mix-blend-screen"
                    />

                    {/* Ribbon 4: Signature Deep Navy Center-Bottom Pretzel / Figure-8 Loop */}
                    <path
                        pathLength="1000"
                        d="M 310 835 C 295 660, 520 675, 525 555 C 530 430, 375 430, 285 535 C 195 640, 105 645, 110 520 C 115 420, 215 435, 205 535 C 195 650, 415 685, 490 615"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-base ribbon-4 stroke-[#1B4982] dark:stroke-[#818CF8] mix-blend-multiply dark:mix-blend-screen"
                    />

                    {/* Ribbon 5: Left Mid-Edge Hairpin U-Turn */}
                    <path
                        pathLength="1000"
                        d="M -45 275 C 85 275, 85 415, -45 425"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-base ribbon-5 stroke-[#1B4982] dark:stroke-[#6366F1] mix-blend-multiply dark:mix-blend-screen"
                    />

                    {/* Ribbon 6: Bottom-Left S-Curve */}
                    <path
                        pathLength="1000"
                        d="M -45 550 C 90 580, 75 725, 30 835"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-base ribbon-6 stroke-[#4B92DB] dark:stroke-[#38BDF8] mix-blend-multiply dark:mix-blend-screen"
                    />

                    {/* Ribbon 7: Bottom-Right Corner Wave & Upper-Right Accent */}
                    <path
                        pathLength="1000"
                        d="M 305 695 C 350 785, 495 655, 645 670 M 495 -35 C 515 70, 585 110, 645 145"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ribbon-base ribbon-7 stroke-[#2A6FBE] dark:stroke-[#60A5FA] mix-blend-multiply dark:mix-blend-screen"
                    />
                </g>
            </svg>

            {/* Subtle Vintage Paper Grain Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.14] dark:opacity-[0.08] mix-blend-overlay"
                style={{
                    backgroundImage: `radial-gradient(#1B4982 0.75px, transparent 0.75px), radial-gradient(#141413 0.5px, #F4EFE0 0.5px)`,
                    backgroundSize: "24px 24px",
                    backgroundPosition: "0 0, 12px 12px",
                }}
            />

            {/* Center Handwritten Typography with Staggered Curly Entrance */}
            <div
                key={`text-${animKey}`}
                className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center pointer-events-none -translate-y-4 sm:-translate-y-5"
            >
                {/* Line 1: DON'T */}
                <div
                    className="flex items-center justify-center gap-1 sm:gap-1.5 text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-[0.14em] text-[#141413] dark:text-[#F8FAFC]"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    {topText.split("").map((char, idx) => {
                        const rotations = ["-4deg", "2deg", "-2deg", "5deg", "-3deg"];
                        return (
                            <span
                                key={idx}
                                className="curly-char"
                                style={
                                    {
                                        "--rot": rotations[idx % rotations.length],
                                        animationDelay: `${0.3 + idx * 0.07}s, ${1.1 + idx * 0.14}s`,
                                    } as React.CSSProperties
                                }
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        );
                    })}
                </div>

                {/* Line 2: overthink (Curly Script Wave) */}
                <div
                    className="flex items-center justify-center -my-2 sm:-my-3 text-6xl sm:text-7xl md:text-[5.5rem] font-bold text-[#141413] dark:text-[#F8FAFC]"
                    style={{ fontFamily: "'Caveat', cursive" }}
                >
                    {middleText.split("").map((char, idx) => {
                        const rotations = [
                            "-3deg",
                            "2deg",
                            "-2deg",
                            "3deg",
                            "-1deg",
                            "2deg",
                            "-3deg",
                            "1deg",
                            "-2deg",
                        ];
                        return (
                            <span
                                key={idx}
                                className="curly-char"
                                style={
                                    {
                                        "--rot": rotations[idx % rotations.length],
                                        animationDelay: `${0.65 + idx * 0.06}s, ${1.45 + idx * 0.11}s`,
                                    } as React.CSSProperties
                                }
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        );
                    })}
                </div>

                {/* Line 3: IT */}
                <div
                    className="flex items-center justify-center gap-1.5 text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-[0.16em] text-[#141413] dark:text-[#F8FAFC] mt-1"
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                    {bottomText.split("").map((char, idx) => {
                        const rotations = ["-3deg", "4deg"];
                        return (
                            <span
                                key={idx}
                                className="curly-char"
                                style={
                                    {
                                        "--rot": rotations[idx % rotations.length],
                                        animationDelay: `${1.2 + idx * 0.09}s, ${2.0 + idx * 0.14}s`,
                                    } as React.CSSProperties
                                }
                            >
                                {char === " " ? "\u00A0" : char}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Subtle Replay Hint Badge */}
            <span className="absolute bottom-3 right-4 z-20 text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-[#1B4982]/60 dark:text-[#93C5FD]/60 bg-[#F4EFE0]/75 dark:bg-[#0B1120]/75 backdrop-blur-sm px-2.5 py-1 rounded-full">
                Click to replay ↻
            </span>
        </div>
    );
}