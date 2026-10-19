"use client";

import React, { useState, useRef } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { Layers, ArrowUpRight } from "lucide-react";

interface TiltCardProps {
    imageSrc?: string;
    category?: string;
    title?: string;
}

export default function TiltCard({
    imageSrc = "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80",
    category = "3D EXPERIMENTAL",
    title = "Dimensions Beyond",
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Mouse coordinate values
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth springs for rotation
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17deg", "-17deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17deg", "17deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-zinc-950 p-6 select-none">
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateY,
                    rotateX,
                    transformStyle: "preserve-3d",
                }}
                className="relative w-80 h-[28rem] rounded-3xl bg-zinc-900 border border-white/10 p-4 cursor-pointer group shadow-2xl"
            >
                {/* Deep Image Layer */}
                <div
                    style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
                    className="relative w-full h-64 rounded-2xl overflow-hidden"
                >
                    <img
                        src={imageSrc}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                </div>

                {/* Elevated Dynamic Text Content */}
                <div
                    style={{ transform: "translateZ(70px)" }}
                    className="mt-6 px-2 flex flex-col gap-1"
                >
                    <div className="flex items-center gap-2 text-rose-500 font-mono text-xs font-bold tracking-widest">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                        <div className="p-2 rounded-full bg-white/10 text-white group-hover:bg-rose-500 transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}