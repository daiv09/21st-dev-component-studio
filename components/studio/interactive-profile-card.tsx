"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// --- Minimalist SVG Icons ---
function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
        </svg>
    );
}

function ArrowUpRightIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
    );
}

function GridPattern() {
    return (
        <svg className="absolute inset-0 h-full w-full stroke-neutral-300 dark:stroke-neutral-800 opacity-40 dark:opacity-30" width="100%" height="100%">
            <defs>
                <pattern id="grid-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M.5 16V.5H16" fill="none" strokeDasharray="0" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
    );
}

interface SpecialCardProps {
    imageSrc: string;
    name: string;
    role: string;
    socials?: {
        github?: string;
        portfolio?: string;
    };
    className?: string;
}

export default function InteractiveProfileCard({
    imageSrc,
    name,
    role,
    socials,
    className = "",
}: SpecialCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
            {/* 3D Wrapper */}
            <div className={`perspective-1000 relative transition-all duration-300 w-80 ${isFlipped ? "h-52" : "h-36"} flex items-center justify-center`}>
                <motion.div
                    className="relative h-full w-full cursor-pointer origin-center [transform-style:preserve-3d]"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                    onClick={() => setIsFlipped((prev) => !prev)}
                >
                    {/* ================= FRONT SIDE (Collapsed Badge) ================= */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-between overflow-hidden border border-neutral-300 dark:border-neutral-800 bg-black dark:bg-neutral-950 p-3.5 shadow-xl dark:shadow-2xl [backface-visibility:hidden]">
                        <GridPattern />

                        {/* Top Technical Header */}
                        <div className="relative z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800/80 pb-2">
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                                </span>
                                <span className="font-mono text-[9px] tracking-widest text-neutral-400 dark:text-neutral-600 uppercase">
                                    VERIFIED
                                </span>
                            </div>
                            <span className="font-mono text-[9px] tracking-wider text-neutral-500 dark:text-neutral-500 uppercase">
                                [ TAP TO FLIP ]
                            </span>
                        </div>

                        {/* Main Profile Core */}
                        <div className="relative z-10 my-auto flex items-center gap-3.5">
                            {/* Avatar Box with Crosshair Accents */}
                            <div className="relative h-11 w-11 shrink-0 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 p-0.5">
                                <img
                                    src={imageSrc}
                                    alt={name}
                                    className="h-full w-full object-cover grayscale contrast-125 transition-all group-hover:grayscale-0"
                                />
                                <span className="absolute -bottom-1 -right-1 h-2 w-2 border border-white dark:border-black bg-black dark:bg-white" />
                                <span className="absolute -top-1 -left-1 text-[8px] font-mono text-neutral-400 dark:text-neutral-600 leading-none">+</span>
                            </div>

                            {/* Identity Details */}
                            <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold tracking-wider text-white dark:text-black uppercase truncate">
                                        {name}
                                    </h3>
                                </div>
                                <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-600 tracking-wide mt-0.5 truncate">
                                    {role}
                                </p>
                            </div>
                        </div>

                        {/* Bottom Telemetry Footer */}
                        <div className="relative z-10 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800/80 pt-1.5 font-mono text-[8px] text-neutral-500">
                            <div className="flex items-center gap-2">
                            </div>

                            {/* Mini Waveform Visualizer */}
                            <div className="flex items-end gap-0.5 h-2.5">
                                <span className="w-0.5 h-1 bg-neutral-400 dark:bg-neutral-600 animate-pulse" />
                                <span className="w-0.5 h-2 bg-neutral-600 dark:bg-neutral-400" />
                                <span className="w-0.5 h-1.5 bg-neutral-500 dark:bg-neutral-500" />
                                <span className="w-0.5 h-2.5 bg-black dark:bg-white" />
                            </div>
                        </div>
                    </div>

                    {/* ================= BACK SIDE (Expanded Dossier) ================= */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-between overflow-hidden border border-neutral-900 dark:border-white bg-white dark:bg-neutral-950 p-6 shadow-xl dark:shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <GridPattern />

                        {/* Header Bar */}
                        <div className="relative z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                            <span className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                                STATUS: ACTIVE
                            </span>
                            <span className="text-[10px] font-mono tracking-widest text-neutral-900 dark:text-white uppercase">
                                [ DOSSIER ]
                            </span>
                        </div>

                        {/* Main Dossier Content */}
                        <div className="relative z-10 my-auto flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 border border-neutral-900 dark:border-white bg-neutral-100 dark:bg-black p-0.5">
                                <img
                                    src={imageSrc}
                                    alt={name}
                                    className="h-full w-full object-cover grayscale contrast-150"
                                />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-base font-black tracking-wider text-neutral-900 dark:text-white uppercase">{name}</h3>
                                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 tracking-wide mt-0.5">
                                    {role}
                                </p>
                            </div>
                        </div>

                        {/* Action Links */}
                        <div
                            className="relative z-10 flex items-center gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {socials?.github && (
                                <a
                                    href={socials.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-1 items-center justify-between border border-neutral-300 dark:border-neutral-800 bg-black dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono text-white dark:text-white transition-colors hover:border-black dark:hover:border-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white"
                                >
                                    <span>GITHUB</span>
                                    <GithubIcon className="h-3.5 w-3.5" />
                                </a>
                            )}
                            {socials?.portfolio && (
                                <a
                                    href={socials.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-1 items-center justify-between border border-neutral-300 dark:border-neutral-800 bg-black dark:bg-neutral-900 px-3 py-1.5 text-xs font-mono text-white dark:text-white transition-colors hover:border-black dark:hover:border-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white"
                                >
                                    <span>LINK</span>
                                    <ArrowUpRightIcon className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- Click Instruction Text Below --- */}
            <motion.p
                className="mt-4 text-[11px] font-mono tracking-widest text-neutral-500 dark:text-neutral-500 uppercase select-none flex items-center gap-1.5"
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <span>[ CLICK CARD TO {isFlipped ? "COLLAPSE" : "EXPAND"} ]</span>
            </motion.p>
        </div>
    );  
}