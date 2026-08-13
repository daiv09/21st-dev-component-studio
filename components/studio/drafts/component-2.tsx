"use client";
import React, { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Github, Layers, Lock } from "lucide-react";

const HolographicCard = () => {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse Position State
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth physics for the mouse movement
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Rotate based on mouse position relative to center
  const rotateX = useMotionTemplate`${mouseYSpring}deg`;
  const rotateY = useMotionTemplate`${mouseXSpring}deg`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate rotation (max 15 degrees)
    const rX = (mouseY / height - 0.5) * 20 * -1;
    const rY = (mouseX / width - 0.5) * 20;

    x.set(rY);
    y.set(rX);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className="group relative h-96 w-80 rounded-xl bg-gray-900 border border-white/10 cursor-pointer"
    >
      {/* --- Image / Content Layer --- */}
      <div
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
        className="absolute inset-4 grid place-content-center rounded-lg bg-black shadow-lg overflow-hidden"
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Floating Icon */}
        <motion.div
          style={{ transform: "translateZ(80px)" }}
          className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-300"
        >
          <Layers size={48} className="text-white" />
        </motion.div>

        {/* Text Reveal */}
        <div className="absolute bottom-6 left-6 right-6 translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xl font-bold text-white mb-1">
            Neural Interface
          </h3>
          <p className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
            Next-gen AI interacting with complex data structures.
          </p>
        </div>
      </div>

      {/* --- Floating Action Button (Top Right) --- */}
      <motion.div
        style={{ transform: "translateZ(75px)" }}
        className="absolute top-0 right-0 m-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div className="bg-white text-black p-2 rounded-full shadow-xl hover:bg-gray-200 transition-colors">
          <ArrowUpRight size={20} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function DemoSection() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-10 perspective-1000">
      <HolographicCard />
    </div>
  );
}
