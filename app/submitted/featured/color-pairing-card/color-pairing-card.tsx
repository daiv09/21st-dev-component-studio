"use client";

import React, { useState } from "react";
import {
    Heart,
    Bookmark,
    ArrowUpRight,
    ArrowUpLeft,
    Check,
    Copy,
    Sun,
    Moon,
    RotateCcw,
} from "lucide-react";

export interface ColorPairingProps {
    author?: string;
    topColorName?: string;
    topHex?: string;
    bottomColorName?: string;
    bottomHex?: string;
    bottomDisplayHexLabel?: string;
    tags?: string[];
    bestFor?: string[];
}

export default function ColorPairingCard({
    topColorName = "LAVENDER HAZE",
    topHex = "#92A9E1",
    bottomColorName = "SOFT GRAPHITE",
    bottomHex = "#2B2D2F",
    bottomDisplayHexLabel = "#92A9E1"
}: ColorPairingProps) {
    const [localDark, setLocalDark] = useState<boolean | null>(null);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [copiedKey, setCopiedKey] = useState<"top" | "bottom" | null>(null);
    const [isSwapped, setIsSwapped] = useState(false);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [showTrueBottomHex, setShowTrueBottomHex] = useState(false);

    const primaryBg = isSwapped ? bottomHex : topHex;
    const primaryText = isSwapped ? topHex : bottomHex;
    const secondaryBg = isSwapped ? topHex : bottomHex;
    const secondaryText = isSwapped ? bottomHex : topHex;

    const handleCopy = (hex: string, key: "top" | "bottom") => {
        navigator.clipboard.writeText(hex);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    // Supports both external Tailwind `dark` class and manual local toggle
    const themeWrapperClass =
        localDark === true ? "dark" : localDark === false ? "" : "";

    return (
        <div
            className={`${themeWrapperClass} w-full max-w-[380px] sm:max-w-[400px] flex flex-col items-center justify-center select-none`}
            style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            {/* Compact Card Poster (Fits comfortably in 100vh with zero scroll) */}
            <div
                className={`relative w-full rounded-[26px] p-4 sm:p-5 transition-all duration-500 border ${localDark === true
                        ? "bg-[#1A1917] text-[#EDE3D2] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
                        : localDark === false
                            ? "bg-[#EFE4CE] text-[#2B2D2F] border-black/10 shadow-[0_20px_50px_rgba(43,45,47,0.12)]"
                            : "bg-[#EFE4CE] dark:bg-[#1A1917] text-[#2B2D2F] dark:text-[#EDE3D2] border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(43,45,47,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
                    }`}
            >
                {/* Header Row: Handle + Mini Utility Pills + Heart/Bookmark */}
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                    <div className="flex items-center gap-2">

                        {/* Subtle inline controls for Theme, Swap & True Hex */}
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
                            <button
                                onClick={() =>
                                    setLocalDark((prev) =>
                                        prev === null
                                            ? !document.documentElement.classList.contains("dark")
                                            : !prev
                                    )
                                }
                                title="Toggle Light/Dark Mode"
                                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-90"
                            >
                                {localDark ? (
                                    <Sun className="w-3 h-3 text-amber-400" />
                                ) : (
                                    <Moon className="w-3 h-3 opacity-75" />
                                )}
                            </button>
                            <button
                                onClick={() => setIsSwapped(!isSwapped)}
                                title="Invert Pairing"
                                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-90"
                            >
                                <RotateCcw
                                    className={`w-3 h-3 opacity-75 transition-transform duration-500 ${isSwapped ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <button
                                onClick={() => setShowTrueBottomHex(!showTrueBottomHex)}
                                title="Toggle Image Hex vs True Graphite Hex"
                                className="px-1.5 text-[10px] font-medium opacity-75 hover:opacity-100"
                            >
                                {showTrueBottomHex ? "#2B" : "#92"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* =========================================================
            CARD 1: LAVENDER HAZE (NOTCHED TOP-RIGHT & BOTTOM-LEFT)
           ========================================================= */}
                <div className="relative w-full aspect-[440/245] mb-2.5 group">
                    <svg
                        viewBox="0 0 440 285"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.006]"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="
                M 22 1
                H 348
                A 22 22 0 0 1 370 23
                V 47
                A 22 22 0 0 0 392 69
                H 417
                A 22 22 0 0 1 439 91
                V 262
                A 22 22 0 0 1 417 284
                H 157
                A 22 22 0 0 1 135 262
                V 229
                A 22 22 0 0 0 113 207
                H 23
                A 22 22 0 0 1 1 185
                V 23
                A 22 22 0 0 1 22 1
                Z
              "
                            fill={primaryBg}
                            stroke="#2B2D2F"
                            strokeWidth="1.25"
                            className="transition-colors duration-500 dark:stroke-white/25"
                        />
                    </svg>

                    {/* Center Title */}
                    <div className="absolute inset-0 flex items-center justify-center pb-4 pointer-events-none">
                        <h2
                            style={{
                                color: primaryText,
                                fontFamily:
                                    "'Oswald', 'Bebas Neue', 'Impact', 'Arial Narrow', sans-serif",
                            }}
                            className="text-[30px] sm:text-[36px] font-bold tracking-[0.02em] leading-none uppercase transition-all duration-300 group-hover:tracking-[0.04em]"
                        >
                            {isSwapped ? bottomColorName : topColorName}
                        </h2>
                    </div>

                    {/* Top-Right Detached Square Arrow Button */}
                    <button
                        onClick={() => setIsSwapped(!isSwapped)}
                        title="Swap color dominance"
                        style={{ backgroundColor: primaryBg, color: primaryText }}
                        className="absolute top-[0.4%] right-[0.2%] w-[13.2%] h-[19.8%] rounded-[11px] sm:rounded-[13px] border border-[#2B2D2F] dark:border-white/25 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <ArrowUpRight
                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            strokeWidth={1.8}
                        />
                    </button>

                    {/* Bottom-Left Detached Hex Pill Button */}
                    <button
                        onClick={() => handleCopy(isSwapped ? bottomHex : topHex, "top")}
                        title="Click to copy Hex code"
                        style={{ backgroundColor: primaryBg, color: primaryText }}
                        className="absolute bottom-[0.4%] left-[0.2%] w-[28.2%] h-[21.4%] rounded-[11px] sm:rounded-[13px] border border-[#2B2D2F] dark:border-white/25 flex items-center justify-center gap-1 px-1.5 transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    >
                        {copiedKey === "top" ? (
                            <span className="flex items-center gap-1 text-[11px] sm:text-xs font-medium">
                                <Check className="w-3 h-3" />
                                Copied
                            </span>
                        ) : (
                            <span className="text-[10.5px] sm:text-xs font-normal tracking-tight flex items-center gap-1">
                                <span>Hex {isSwapped ? bottomHex : topHex}</span>
                                <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity hidden sm:inline" />
                            </span>
                        )}
                    </button>
                </div>

                {/* =========================================================
            CARD 2: SOFT GRAPHITE (NOTCHED TOP-LEFT & BOTTOM-RIGHT)
           ========================================================= */}
                <div className="relative w-full aspect-[440/245] mb-3.5 group">
                    <svg
                        viewBox="0 0 440 285"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.006]"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="
                M 92 1
                H 417
                A 22 22 0 0 1 439 23
                V 185
                A 22 22 0 0 1 417 207
                H 327
                A 22 22 0 0 0 305 229
                V 262
                A 22 22 0 0 1 283 284
                H 23
                A 22 22 0 0 1 1 262
                V 91
                A 22 22 0 0 1 23 69
                H 48
                A 22 22 0 0 0 70 47
                V 23
                A 22 22 0 0 1 92 1
                Z
              "
                            fill={secondaryBg}
                            stroke="#2B2D2F"
                            strokeWidth="1.25"
                            className="transition-colors duration-500 dark:stroke-white/20"
                        />
                    </svg>

                    {/* Center Title */}
                    <div className="absolute inset-0 flex items-center justify-center pt-1.5 pointer-events-none">
                        <h2
                            style={{
                                color: secondaryText,
                                fontFamily:
                                    "'Oswald', 'Bebas Neue', 'Impact', 'Arial Narrow', sans-serif",
                            }}
                            className="text-[30px] sm:text-[36px] font-bold tracking-[0.02em] leading-none uppercase transition-all duration-300 group-hover:tracking-[0.04em]"
                        >
                            {isSwapped ? topColorName : bottomColorName}
                        </h2>
                    </div>

                    {/* Top-Left Detached Square Arrow Button */}
                    <button
                        onClick={() => setIsSwapped(!isSwapped)}
                        title="Swap color dominance"
                        style={{ backgroundColor: secondaryBg, color: secondaryText }}
                        className="absolute top-[0.4%] left-[0.2%] w-[13.2%] h-[19.8%] rounded-[11px] sm:rounded-[13px] border border-[#2B2D2F] dark:border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <ArrowUpLeft
                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                            strokeWidth={1.8}
                        />
                    </button>

                    {/* Bottom-Right Detached Hex Pill Button */}
                    <button
                        onClick={() =>
                            handleCopy(
                                isSwapped
                                    ? topHex
                                    : showTrueBottomHex
                                        ? bottomHex
                                        : bottomDisplayHexLabel,
                                "bottom"
                            )
                        }
                        title="Click to copy Hex code"
                        style={{ backgroundColor: secondaryBg, color: secondaryText }}
                        className="absolute bottom-[0.4%] right-[0.2%] w-[28.2%] h-[21.4%] rounded-[11px] sm:rounded-[13px] border border-[#2B2D2F] dark:border-white/20 flex items-center justify-center gap-1 px-1.5 transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    >
                        {copiedKey === "bottom" ? (
                            <span className="flex items-center gap-1 text-[11px] sm:text-xs font-medium">
                                <Check className="w-3 h-3" />
                                Copied
                            </span>
                        ) : (
                            <span className="text-[10.5px] sm:text-xs font-normal tracking-tight flex items-center gap-1">
                                <span>
                                    Hex{" "}
                                    {isSwapped
                                        ? topHex
                                        : showTrueBottomHex
                                            ? bottomHex
                                            : bottomDisplayHexLabel}
                                </span>
                                <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity hidden sm:inline" />
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}