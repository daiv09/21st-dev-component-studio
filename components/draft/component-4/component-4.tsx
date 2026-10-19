// Built using Hyperiux Vault (Orbital Revolution Edition)
"use client";

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

const IMGS = [
  "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop",
  // "https://images.unsplash.com/photo-1503376780353-8d664f9f77f9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop",
];

export interface RadialBurstProps {
  scrollLength?: number;
}

export default function RadialBurst({ scrollLength = 320 }: RadialBurstProps = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  
  // Smooth scroll progression pipeline
  const progress = useTransform(useSpring(scrollYProgress, { stiffness: 90, damping: 30 }), [0.1, 0.9], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative w-full select-none bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-500"
      style={{ height: `${scrollLength}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 dark:opacity-20 blur-[130px]">
          <div className="w-[50vw] h-[50vw] rounded-full bg-cyan-200 dark:bg-cyan-900 mix-blend-multiply dark:mix-blend-screen" />
        </div>

        {/* Main Center Text Layer */}
        <motion.div 
          className="absolute z-30 text-center px-8 py-6 rounded-3xl backdrop-blur-md bg-white/75 dark:bg-neutral-900/75 border border-black/5 dark:border-white/10 shadow-2xl shadow-black/10 pointer-events-none max-w-md mx-4" 
          style={{ opacity: useTransform(progress, [0, 0.8, 1], [1, 1, 0.4]) }}
        >
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-neutral-900 dark:text-white">
            Orbital <span className="text-cyan-600 dark:text-cyan-400 font-normal">Revolution</span>
          </h2>
          <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-600 dark:text-neutral-400 mt-2 font-medium">
            Cinematic frames revolving around the core
          </p>
        </motion.div>
        
        {/* Revolving Orbital Image Container */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          {IMGS.map((src, i) => {
            const baseAngle = (i / IMGS.length) * Math.PI * 2;
            
            // As progress goes 0 -> 1, images diverge outward and rotate an extra full circle (2 * Math.PI) around the center text
            const tx = useTransform(progress, (p) => {
              const currentAngle = baseAngle + p * Math.PI * 2;
              const radius = 24 + 11 * p; // Expands outward from 24vw to 35vw
              return Math.cos(currentAngle) * radius;
            });

            const ty = useTransform(progress, (p) => {
              const currentAngle = baseAngle + p * Math.PI * 2;
              const radius = 20 + 14 * p; // Expands outward from 20vh to 34vh
              return Math.sin(currentAngle) * radius;
            });

            const rot = useTransform(progress, (p) => {
              const currentAngle = baseAngle + p * Math.PI * 2;
              return currentAngle * (180 / Math.PI) + 90; // Tangent orientation facing rotation
            });

            const scale = useTransform(progress, [0, 1], [0.65, 0.85]);
            const opacity = useTransform(progress, [0, 0.1, 1], [0.95, 1, 1]);

            return (
              <motion.div
                key={i}
                className="absolute w-[25vw] h-[32vw] md:w-[21vw] md:h-[26vw] rounded-2xl overflow-hidden shadow-2xl shadow-black/20 dark:shadow-black/80 ring-1 ring-black/10 dark:ring-white/10 will-change-transform"
                style={{ x: tx, y: ty, rotate: rot, scale, opacity }}
              >
                <img src={src} alt="track angle" className="w-full h-full object-cover" />
              </motion.div>
            );
          })}
        </div>

        {/* Scroll Instruction Hint */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
          <span className="opacity-70">Scroll to Orbit</span>
          <div className="w-[1px] h-6 bg-current opacity-30 relative overflow-hidden">
            <motion.div 
              className="absolute inset-x-0 top-0 bg-cyan-500 h-full"
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}