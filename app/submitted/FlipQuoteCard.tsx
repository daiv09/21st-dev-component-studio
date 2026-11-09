"use client";

import React, { useState } from "react";

interface FlipQuoteCardProps {
    frontLine1?: string;
    frontLine2?: string;
    backLine1?: string;
    backLine2?: string;
    variant?: "card-flip" | "page-fold";
}

export default function FlipQuoteCard({
    frontLine1 = "progress,",
    frontLine2 = "not perfection.",
    backLine1 = "keep moving,",
    backLine2 = "every single day.",
    variant = "card-flip",
}: FlipQuoteCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    // Supports hover on desktop + tap/click on mobile + keyboard Enter/Space
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsFlipped((prev) => !prev);
        }
    };

    if (variant === "page-fold") {
        return (
            <div
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={`${frontLine1} ${frontLine2}. Activate to reveal ${backLine1} ${backLine2}`}
                className="relative w-full max-w-[92vw] sm:max-w-lg md:max-w-xl h-56 sm:h-64 md:h-80 cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2E47A6]/40 dark:focus-visible:ring-[#7B96FF]/40 rounded-2xl"
                style={{ perspective: "1400px" }}
                onMouseEnter={() => setIsFlipped(true)}
                onMouseLeave={() => setIsFlipped(false)}
                onClick={() => setIsFlipped((prev) => !prev)}
                onKeyDown={handleKeyDown}
            >
                {/* Base Card (Revealed Back State) */}
                <div className="absolute inset-0 rounded-2xl bg-[#2E47A6] dark:bg-[#1E2F6F] text-[#FDFDF5] dark:text-[#F4F3E6] flex flex-col justify-center px-6 sm:px-10 md:px-16 shadow-xl border border-[#2E47A6]/10 dark:border-white/10 transition-colors duration-300">
                    <p className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight break-words">
                        {backLine1}
                        <br />
                        {backLine2}
                    </p>
                    <span className="absolute bottom-3 right-4 sm:bottom-5 sm:right-6 text-[10px] sm:text-xs uppercase tracking-widest opacity-60 font-medium">
                        Page 02
                    </span>
                </div>

                {/* Flipping Top Page */}
                <div
                    className="absolute inset-0 rounded-2xl bg-[#FDFDF5] dark:bg-[#121629] text-[#2E47A6] dark:text-[#8CA4FF] flex flex-col justify-center px-6 sm:px-10 md:px-16 shadow-lg dark:shadow-2xl border border-[#2E47A6]/15 dark:border-[#8CA4FF]/20 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                        transform: isFlipped
                            ? "rotateY(-150deg) translateZ(2px)"
                            : "rotateY(0deg)",
                    }}
                >
                    {/* Front of the Turning Page */}
                    <div
                        className="w-full"
                        style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                        }}
                    >
                        <p className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight break-words">
                            {frontLine1}
                            <br />
                            {frontLine2}
                        </p>
                        <span className="absolute bottom-3 right-4 sm:bottom-5 sm:right-6 text-[10px] sm:text-xs uppercase tracking-widest opacity-50 font-medium">
                            <span className="hidden sm:inline">Hover</span>
                            <span className="sm:hidden">Tap</span> to turn page →
                        </span>
                    </div>

                    {/* Backside of the Turning Page */}
                    <div
                        className="absolute inset-0 rounded-2xl bg-[#F4F3E6] dark:bg-[#19203B] flex items-center justify-center p-6 sm:p-10 md:p-12 transition-colors duration-300"
                        style={{
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <div className="w-full h-full border-l-2 border-[#2E47A6]/15 dark:border-[#8CA4FF]/20 pl-4 sm:pl-6 flex items-end">
                            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#2E47A6]/40 dark:text-[#8CA4FF]/50 font-semibold">
                                Page 01
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default: 3D Vertical Card Flip
    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={isFlipped}
            aria-label={`${frontLine1} ${frontLine2}. Activate to flip card to ${backLine1} ${backLine2}`}
            className="group relative w-full max-w-[92vw] sm:max-w-lg md:max-w-xl h-56 sm:h-64 md:h-80 cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2E47A6]/40 dark:focus-visible:ring-[#7B96FF]/40 rounded-2xl"
            style={{ perspective: "1200px" }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={() => setIsFlipped((prev) => !prev)}
            onKeyDown={handleKeyDown}
        >
            <div
                className="relative w-full h-full rounded-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-xl dark:shadow-2xl"
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)",
                }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl bg-[#FDFDF5] dark:bg-[#121629] text-[#2E47A6] dark:text-[#8CA4FF] flex flex-col justify-center px-6 sm:px-10 md:px-16 border border-[#2E47A6]/10 dark:border-[#8CA4FF]/20 transition-colors duration-300"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                    }}
                >
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] break-words">
                        {frontLine1}
                        <br />
                        {frontLine2}
                    </h2>
                    <span className="absolute bottom-3 right-4 sm:bottom-5 sm:right-6 text-[10px] sm:text-xs uppercase tracking-widest opacity-40 dark:opacity-60 font-medium">
                        <span className="hidden sm:inline">Hover</span>
                        <span className="sm:hidden">Tap</span> to flip ↻
                    </span>
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 w-full h-full rounded-2xl bg-[#2E47A6] dark:bg-[#253B8E] text-[#FDFDF5] dark:text-[#F4F3E6] flex flex-col justify-center px-6 sm:px-10 md:px-16 border border-transparent dark:border-white/10 shadow-2xl transition-colors duration-300"
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateX(180deg)",
                    }}
                >
                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] break-words">
                        {backLine1}
                        <br />
                        {backLine2}
                    </h2>   
                    <span className="absolute bottom-3 right-4 sm:bottom-5 sm:right-6 text-[10px] sm:text-xs uppercase tracking-widest opacity-50 dark:opacity-70 font-medium">
                        Keep going
                    </span>
                </div>
            </div>
        </div>
    );
}