"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
} from "framer-motion";
import { Star, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

// --- Types ---
interface Item {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  link: string;
}

// --- Data ---
const ITEMS: Item[] = [
  {
    id: "01",
    title: "Apple MacOS Clone",
    subtitle: "Full-Stack Desktop Experience - React & Next.js",
    year: "2025",
    category: "PROJECT",
    color: "#3b82f6",
    link: "https://apple-os-sand.vercel.app",
  },
  {
    id: "02",
    title: "SOUND",
    subtitle: "Premium Headphone E-Commerce Platform",
    year: "2025",
    category: "PROJECT",
    color: "#06b6d4",
    link: "https://sound-headphone.vercel.app",
  },
  {
    id: "03",
    title: "Cripto",
    subtitle: "Real-Time Cryptocurrency Analytics Dashboard",
    year: "2025",
    category: "PROJECT",
    color: "#0ea5e9",
    link: "https://cripto-analytics.vercel.app",
  },
];

// --- Sub-Component: The Reel Card ---
const ReelCard = ({ item, x }: { item: Item; x: any }) => {
  // Parallax effect for the image inside the card
  // We map the container's X position to a smaller internal shift
  const imageX = useTransform(x, [0, -4000], [0, 200]);

  return (
    <div className="relative group min-w-75 md:min-w-125 h-[50vh] md:h-[60vh] flex flex-col justify-end p-2 md:p-4 border-r-2 border-black last:border-r-0">
      {/* Top Meta Info */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 mix-blend-difference text-white">
        <span className="font-mono text-xl font-bold">/{item.id}</span>
        <div className="flex flex-col items-end">
          <span className="font-bold text-xs uppercase tracking-widest border border-current px-2 py-0.5 rounded-full">
            {item.year}
          </span>
        </div>
      </div>

      {/* Main Image Area with Parallax */}
      <div className="absolute inset-0 overflow-hidden bg-gray-200">
        <motion.div
          style={{ x: imageX }}
          className="w-[120%] h-full relative -left-[10%]"
        >
          <div className="absolute inset-0 bg-white">
            {/* Simple polka dots */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle, black 2px, transparent 2px)`,
                backgroundSize: "32px 32px",
              }}
            />

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <motion.div className="text-center" whileHover={{ scale: 1.1 }}>
                {/* <div
                    className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-black flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <span className="text-4xl font-black">{item.id}</span>
                  </div> */}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Content */}
      <div className="relative z-20 bg-white border-2 border-black p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-2 transition-all duration-300">
        <h3 className="text-2xl md:text-4xl font-black uppercase leading-none mb-1">
          {item.title}
        </h3>
        <p className="font-mono text-xs md:text-sm font-bold text-gray-500 flex items-center gap-2">
          <Zap size={14} className="text-black fill-black" />
          {item.subtitle}
        </p>

        <div className="absolute -top-3.25 right-4 bg-black text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-y-2">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
};

export default function KineticReel() {
  const targetRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of the tall container
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  // Map vertical scroll (0 -> 1) to horizontal movement (0% -> -100%)
  // We subtract window width to stop exactly at the end
  const x = useTransform(smoothProgress, [0, 1], ["1%", "-95%"]);

  // --- Velocity Skew Logic ---
  const scrollVelocity = useVelocity(scrollYProgress);
  const skewVelocity = useSpring(scrollVelocity, {
    stiffness: 100,
    damping: 30,
  });

  // Map scroll speed to rotation angle (skew)
  // Max skew of 15 degrees
  const skewX = useTransform(skewVelocity, [-1, 1], [15, -15]);

  return (
    // Height 400vh gives us plenty of "track" to scroll through
    <div ref={targetRef} className="relative h-[400vh] bg-white">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden border-y-4 border-black bg-[#f0f0f0]">
        {/* Track Markers Top */}
        <div className="absolute top-0 w-full h-8 flex border-b-2 border-black bg-white z-20">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-black/20 h-full flex items-center justify-center text-[8px] font-mono opacity-40"
            >
              {i % 2 === 0 ? "•" : "|"}
            </div>
          ))}
        </div>

        {/* The Moving Reel */}
        <motion.div
          style={{ x }}
          className="flex items-center pl-[10vw] pr-[10vw]"
        >
          {/* The wrapper handles the Skew/Tilt physics */}
          <motion.div
            style={{ skewX }}
            className="flex gap-12 md:gap-24 origin-bottom"
          >
            {/* Intro Card */}
            <div className="min-w-75 flex flex-col justify-center">
              <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
                Featured
                <br />
                Works
              </h2>
              <p className="mt-4 font-bold border-l-4 border-black pl-4 max-w-50">
                A showcase of innovative web applications and interactive
                experiences.
              </p>
            </div>

            {/* Data Items */}
            {ITEMS.map((item) => (
              <Link href={item.link} target="_blank" key={item.id}>
                <ReelCard key={item.id} item={item} x={x} />
              </Link>
            ))}
                      
            {/* Outro Card */}
            <div className="min-w-75 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-4 border-black border-dashed flex items-center justify-center animate-spin-slow">
                <Star size={64} className="fill-black" />
              </div>
            </div>
            
          </motion.div>
        </motion.div>

        {/* Track Markers Bottom */}
        <div className="absolute bottom-0 w-full h-12 border-t-2 border-black bg-black text-white z-20 flex items-center justify-between px-8 font-mono text-sm">
          <span>REEL_ID: 2025_V1</span>

          {/* Dynamic Progress Bar */}
          <div className="w-1/3 h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              style={{ scaleX: smoothProgress }}
              className="h-full bg-white origin-left"
            />
          </div>

          <span>SCROLL_VELOCITY</span>
        </div>
      </div>
    </div>
  );
}
