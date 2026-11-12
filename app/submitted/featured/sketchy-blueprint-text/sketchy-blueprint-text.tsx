// components/SketchyBlueprintText.tsx
"use client";
import { motion } from "framer-motion";

const words = [
    { text: "Be", size: "text-5xl sm:text-6xl", rotate: -2 },
    { text: "ENOUGH", size: "text-6xl sm:text-7xl", rotate: 1 },
    { text: "FOR", size: "text-5xl sm:text-6xl", rotate: -1 },
    { text: "YOURSELF", size: "text-5xl sm:text-6xl", rotate: 1.5 },
    { text: "First", size: "text-5xl sm:text-6xl", rotate: -2 },
];

export default function SketchyBlueprintText() {
    return (
        <div className="relative flex flex-col items-center justify-center p-8 sm:p-16 bg-slate-50 dark:bg-[#070c1b] border border-slate-200 dark:border-blue-950/60 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(14,165,233,0.06)] overflow-hidden transition-colors duration-500 w-full max-w-2xl mx-auto">
            {/* Background Architectural Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* SVG Filter for Hand-Drawn Pencil Boil Effect */}
            <svg className="hidden">
                <defs>
                    <filter id="pencil-sketch">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.04"
                            numOctaves="3"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale="3.5"
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            <div
                style={{ filter: "url(#pencil-sketch)" }}
                className="relative z-10 flex flex-col items-center space-y-3 sm:space-y-4 select-none w-full"
            >
                {words.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20, scale: 0.9, rotate: item.rotate + 3 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: item.rotate }}
                        whileHover={{
                            scale: 1.06,
                            rotate: 0,
                            transition: { type: "spring", stiffness: 400, damping: 12 }
                        }}
                        whileTap={{ scale: 0.96 }}
                        transition={{
                            delay: idx * 0.15,
                            type: "spring",
                            stiffness: 220,
                            damping: 14,
                        }}
                        className="relative px-6 py-1 cursor-pointer group text-center"
                    >
                        {/* Architectural Drafting Construction Lines */}
                        <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: idx * 0.15 + 0.2, duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-x-0 top-0 h-[2px] bg-blue-600/30 dark:bg-cyan-400/40 origin-left group-hover:bg-blue-600 dark:group-hover:bg-cyan-400 transition-colors duration-300"
                        />
                        <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: idx * 0.15 + 0.25, duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-600/30 dark:bg-cyan-400/40 origin-right group-hover:bg-blue-600 dark:group-hover:bg-cyan-400 transition-colors duration-300"
                        />
                        <span className="absolute inset-y-0 left-2 w-[1.5px] bg-blue-600/20 dark:bg-cyan-400/20" />
                        <span className="absolute inset-y-0 right-2 w-[1.5px] bg-blue-600/20 dark:bg-cyan-400/20" />

                        {/* Sketchy Blue/Cyan Typography */}
                        <span
                            className={`block font-black tracking-tight text-blue-700 dark:text-cyan-400 ${item.size} drop-shadow-[2px_3px_0px_rgba(37,99,235,0.15)] dark:drop-shadow-[2px_3px_0px_rgba(6,182,212,0.25)] transition-colors duration-300`}
                        >
                            {item.text}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}