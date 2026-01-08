"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MapPin, Activity, Wifi, Server } from "lucide-react";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Data & Types ---

// Coordinates are roughly calibrated to the SVG map projection (Mercator-ish)
// x: 0-100 (left to right), y: 0-100 (top to bottom)
const LOCATIONS = [
  { id: "nyc", name: "New York", x: 29, y: 32, region: "NA" },
  { id: "lon", name: "London", x: 48, y: 24, region: "EU" },
  { id: "blr", name: "Bangalore", x: 68, y: 48, region: "AS" },
  { id: "tok", name: "Tokyo", x: 84, y: 35, region: "AS" },
  { id: "syd", name: "Sydney", x: 88, y: 75, region: "OC" },
  { id: "sap", name: "São Paulo", x: 34, y: 68, region: "SA" },
  { id: "cpt", name: "Cape Town", x: 53, y: 72, region: "AF" },
  { id: "sf", name: "San Francisco", x: 18, y: 35, region: "NA" },
];

const CONNECTIONS = [
  { from: "nyc", to: "lon" },
  { from: "lon", to: "blr" },
  { from: "blr", to: "tok" },
  { from: "tok", to: "sf" },
  { from: "sf", to: "nyc" },
  { from: "nyc", to: "sap" },
  { from: "lon", to: "cpt" },
  { from: "blr", to: "syd" },
];

// Simplified World Map SVG Path (Mercator)
const WORLD_PATH =
  "M26.5 24L28 22.5L32 24.5L34 22L38 23L42 18L44 19L46 16L51 16.5L53 20L56 19.5L58 22L56 25L59 27L62 25.5L64 28L68 27L72 29L75 27L78 28.5L82 27L86 28L90 26L92 28L90 32L87 34L86 38L83 40L84 44L82 48L78 49L76 54L72 56L68 54L66 58L64 54L62 56L60 54L58 56L56 52L54 54L52 50L50 52L48 50L46 52L44 48L42 49L40 46L38 48L36 44L34 46L32 42L30 44L28 40L26 42L24 38L22 40L20 36L18 38L16 34L14 36L12 30L14 26L18 24L20 28L24 26L26 24ZM34 68L36 66L40 68L42 66L44 68L42 72L40 76L36 78L32 74L30 70L34 68ZM52 70L54 68L58 70L60 68L62 72L60 76L56 78L52 74L50 72L52 70ZM84 72L86 70L90 72L92 70L94 72L92 76L88 78L84 74L82 72L84 72Z";

// =========================================
// COMPONENT: GLOBAL ANIMATED MAP
// =========================================
export default function GlobalMap() {
  const [activeLocation, setActiveLocation] = React.useState<string | null>(
    null
  );

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex items-center justify-center p-4 md:p-10 font-sans overflow-hidden selection:bg-cyan-500/30">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl aspect-[16/9] bg-zinc-900/40 border border-white/5 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Header HUD */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase">
                Live_Network
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Global Traffic Monitor
            </h1>
          </div>
          <div className="flex gap-4 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
              ACTIVE
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-700" />
              OFFLINE
            </div>
          </div>
        </div>

        {/* --- THE MAP --- */}
        <div className="absolute inset-0 flex items-center justify-center mt-12 md:mt-0">
          <div className="relative w-full h-full">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full absolute inset-0 pointer-events-none"
            >
              <defs>
                {/* Gradient for Lines */}
                <linearGradient
                  id="line-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="rgba(6,182,212,0)" />
                  <stop offset="50%" stopColor="rgba(6,182,212,0.6)" />
                  <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* World Map Silhouette (Abstract) */}
              <path
                d={WORLD_PATH}
                fill="#18181b"
                stroke="#27272a"
                strokeWidth="0.3"
                className="opacity-60"
              />

              {/* Connecting Lines */}
              {CONNECTIONS.map((conn, i) => {
                const start = LOCATIONS.find((l) => l.id === conn.from)!;
                const end = LOCATIONS.find((l) => l.id === conn.to)!;

                // Calculate curve control point for quadratic bezier
                // Creates a slight arc based on distance
                const midX = (start.x + end.x) / 2;
                const midY =
                  (start.y + end.y) / 2 - Math.abs(start.x - end.x) * 0.2; // Arch upwards

                const pathD = `M${start.x},${start.y} Q${midX},${midY} ${end.x},${end.y}`;

                return (
                  <g key={i}>
                    {/* Faint static line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#27272a"
                      strokeWidth="0.2"
                    />

                    {/* Moving Packet Animation */}
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="url(#line-gradient)"
                      strokeWidth="0.4"
                      initial={{ pathLength: 0, pathOffset: 0 }}
                      animate={{
                        pathLength: [0, 0.4, 0],
                        pathOffset: [0, 1, 1],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 2,
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Location Beacons (HTML overlay for easier interactions) */}
            {LOCATIONS.map((loc) => {
              const isActive = activeLocation === loc.id;

              return (
                <div
                  key={loc.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                  onMouseEnter={() => setActiveLocation(loc.id)}
                  onMouseLeave={() => setActiveLocation(null)}
                >
                  {/* Ping Animation */}
                  <div className="relative flex items-center justify-center w-8 h-8">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-20 duration-1000" />
                    <span
                      className={cn(
                        "relative inline-flex h-2 w-2 rounded-full transition-all duration-300",
                        isActive
                          ? "bg-white h-3 w-3 shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                          : "bg-cyan-500"
                      )}
                    />
                  </div>

                  {/* Tooltip Card */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black/90 border border-zinc-800 rounded-xl p-3 shadow-2xl backdrop-blur-md z-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {loc.name}
                            </h3>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              {loc.region}_SERVER_01
                            </p>
                          </div>
                          <MapPin className="w-3 h-3 text-cyan-500" />
                        </div>

                        {/* Fake Stats */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500 flex items-center gap-1">
                              <Wifi className="w-2.5 h-2.5" /> Latency
                            </span>
                            <span className="text-green-400 font-mono">
                              24ms
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500 flex items-center gap-1">
                              <Server className="w-2.5 h-2.5" /> Load
                            </span>
                            <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-cyan-500"
                                initial={{ width: 0 }}
                                animate={{ width: "65%" }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)",
            backgroundSize: "4% 8%",
          }}
        />
      </div>
    </div>
  );
}
