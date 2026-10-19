"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";

interface BlobImageProps {
    src?: string;
    alt?: string;
}

export default function FluidMorphImage({
    src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
    alt = "Abstract Art",
}: BlobImageProps) {
    const [isHovered, setIsHovered] = useState(false);

    // SVG path morphing keyframes
    const blobPaths = [
        "M42.7,-73.4C55.9,-66.7,67.8,-56.3,76.5,-43.3C85.2,-30.3,90.7,-15.1,89.2,-0.9C87.7,13.4,79.2,26.8,70.1,38.8C61,50.8,51.3,61.4,39.3,68.9C27.3,76.4,13.6,80.8,-0.9,82.4C-15.5,83.9,-31,82.6,-44.6,75.9C-58.2,69.2,-69.9,57.1,-77.8,42.8C-85.7,28.5,-89.8,12,-88.1,-3.9C-86.4,-19.8,-78.9,-35.1,-68.8,-46.9C-58.7,-58.7,-46,-67,-32.8,-73.8C-19.6,-80.6,-5.9,-85.9,7.6,-97.6C21.1,-109.3,29.5,-80.1,42.7,-73.4Z",
        "M38.9,-66.2C50.1,-58.5,58.8,-47.4,66.3,-35.1C73.8,-22.8,80.1,-9.3,79.8,4.1C79.5,17.5,72.6,30.8,63.9,42.1C55.2,53.4,44.7,62.7,32.4,68.7C20.1,74.7,6,77.4,-8.1,78.8C-22.2,80.2,-36.3,80.3,-48.3,74.1C-60.3,67.9,-70.2,55.4,-76.3,41.2C-82.4,27,-84.7,11.1,-82.5,-3.8C-80.3,-18.7,-73.6,-32.6,-63.9,-43.6C-54.2,-54.6,-41.5,-62.7,-28.5,-69.2C-15.5,-75.7,-2.2,-80.6,10.2,-78.2C22.6,-75.8,27.7,-73.9,38.9,-66.2Z",
    ];

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-zinc-950 text-white p-6 overflow-hidden select-none">
            <div
                className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center cursor-pointer group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Glow backdrop reacting to hover */}
                <motion.div
                    animate={{
                        scale: isHovered ? 1.15 : 1,
                        opacity: isHovered ? 0.6 : 0.3,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 rounded-full blur-3xl pointer-events-none"
                />

                {/* SVG Mask Container */}
                <svg viewBox="-100 -100 200 200" className="w-full h-full relative z-10 drop-shadow-2xl">
                    <defs>
                        <clipPath id="blob-clip">
                            <motion.path
                                d={blobPaths[0]}
                                animate={{ d: blobPaths }}
                                transition={{
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    duration: 8,
                                    ease: "easeInOut",
                                }}
                            />
                        </clipPath>
                    </defs>

                    {/* Masked Image Element */}
                    <g clipPath="url(#blob-clip)">
                        <foreignObject x="-100" y="-100" width="200" height="200">
                            <motion.img
                                src={src}
                                alt={alt}
                                animate={{
                                    scale: isHovered ? 1.15 : 1.05,
                                    rotate: isHovered ? 3 : 0,
                                }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full h-full object-cover"
                            />
                        </foreignObject>
                    </g>
                </svg>

                {/* Floating badge */}
                <motion.div
                    animate={{ y: isHovered ? -8 : 0 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2 shadow-xl"
                >
                    <Sparkles className="w-4 h-4 text-violet-400" />
                </motion.div>
            </div>
        </div>
    );
}