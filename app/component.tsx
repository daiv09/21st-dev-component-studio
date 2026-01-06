"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Copy,
  Check,
  Box,
  ChevronRight,
  Terminal,
  Command,
} from "lucide-react";

// --- Hooks ---
/**
 * Custom hook to handle responsive logic safely in Next.js/React
 * Prevents hydration mismatch by only running on client
 */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

// --- Configuration ---
const PACKAGE_NAME = "velocity-scroll";
const INSTALL_CMD = "npm i @velocity/scroll";

// --- Mock Syntax Highlighting Component ---
const CodeBlock = () => (
  // Responsive font size: text-[10px] on mobile, text-sm on desktop
  <div className="font-mono text-[10px] sm:text-xs md:text-sm leading-relaxed overflow-x-auto">
    <span className="text-purple-400">import</span>{" "}
    <span className="text-yellow-300">{`{ VelocityScroll }`}</span>{" "}
    <span className="text-purple-400">from</span>{" "}
    <span className="text-green-400">&apos;@velocity/scroll&apos;</span>;
    <br />
    <br />
    <span className="text-purple-400">export default function</span>{" "}
    <span className="text-blue-400">App</span>() {"{"}
    <br />
    &nbsp;&nbsp;<span className="text-purple-400">return</span> (
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&lt;
    <span className="text-yellow-300">VelocityScroll</span>
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="text-blue-300">mode</span>=
    <span className="text-green-400">&quot;sticky&quot;</span>
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <span className="text-blue-300">sensitivity</span>=
    <span className="text-blue-400">{`{0.5}`}</span>
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&gt;
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;
    <span className="text-red-400">h1</span>&gt;Hello World&lt;/
    <span className="text-red-400">h1</span>&gt;
    <br />
    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/
    <span className="text-yellow-300">VelocityScroll</span>&gt;
    <br />
    &nbsp;&nbsp;);
    <br />
    {"}"}
  </div>
);

export default function NpmHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Detect mobile screen (< 768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Scroll Progress
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 25,
    mass: 0.8,
  });

  // --- Animations ---

  // 1. Branding
  const titleOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const titleScale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);
  const titleBlur = useTransform(smoothProgress, [0, 0.2], ["0px", "10px"]);

  // 2. The Box Dimensions (Responsive Logic)
  // We switch the "output range" array based on the isMobile boolean

  // Width: On mobile, go from 280px to 95% of screen width. On Desktop, 350px to 800px.
  const boxWidth = useTransform(
    smoothProgress,
    [0.1, 0.5],
    isMobile ? ["280px", "95vw"] : ["350px", "800px"]
  );

  // Height: On mobile, keep it slightly shorter to fit keyboard/UI bars
  const boxHeight = useTransform(
    smoothProgress,
    [0.1, 0.5],
    isMobile ? ["50px", "45vh"] : ["56px", "450px"]
  );

  const boxRadius = useTransform(smoothProgress, [0.1, 0.5], ["50px", "12px"]);

  // Colors & Shadow
  const boxBg = useTransform(
    smoothProgress,
    [0.1, 0.35],
    ["#ffffff", "#09090b"]
  );
  const boxBorder = useTransform(
    smoothProgress,
    [0.1, 0.35],
    ["#000000", "#333333"]
  );
  const boxShadow = useTransform(
    smoothProgress,
    [0.1, 0.5],
    ["6px 6px 0px 0px rgba(0,0,0,1)", "20px 20px 0px 0px rgba(0,0,0,0.5)"]
  );

  // 3. Inner Content
  const installOpacity = useTransform(smoothProgress, [0.1, 0.25], [1, 0]);
  const installY = useTransform(smoothProgress, [0.1, 0.25], [0, -30]);
  const installDisplay = useTransform(smoothProgress, (latest) =>
    latest > 0.25 ? "none" : "flex"
  );

  const terminalOpacity = useTransform(smoothProgress, [0.3, 0.5], [0, 1]);
  const terminalY = useTransform(smoothProgress, [0.3, 0.5], [20, 0]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className="h-[250vh] bg-[#ebebeb] relative font-sans selection:bg-purple-500 selection:text-white"
    >
      {/* Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background Grid */}
        <div
          className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* --- Layer 1: Branding --- */}
        <motion.div
          style={{
            opacity: titleOpacity,
            scale: titleScale,
            filter: `blur(${titleBlur})`,
          }}
          // Responsive positioning: top-1/4 on mobile to avoid keyboard overlap, top-1/3 on desktop
          className="text-center z-10 absolute top-[20%] md:top-1/3 px-4 w-full"
        >
          <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
            <span className="bg-black text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Box size={10} className="md:w-3 md:h-3" /> Package
            </span>
            <span className="bg-white border border-black px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
              v2.0.4
            </span>
          </div>

          {/* Responsive Typography */}
          <h1 className="text-5xl sm:text-6xl md:text-9xl font-black tracking-tighter uppercase mb-2 md:mb-4 text-black drop-shadow-sm">
            {PACKAGE_NAME}
          </h1>
          <p className="text-sm sm:text-base md:text-xl font-semibold text-gray-700 max-w-[80%] md:max-w-lg mx-auto leading-relaxed">
            The buttery smooth scroll library you&apos;ve been waiting for.
          </p>
        </motion.div>

        {/* --- Layer 2: The Morphing Container --- */}
        <motion.div
          style={{
            width: boxWidth,
            height: boxHeight,
            backgroundColor: boxBg,
            borderRadius: boxRadius,
            borderColor: boxBorder,
            boxShadow: boxShadow,
          }}
          className="relative z-20 border-2 flex flex-col overflow-hidden will-change-transform max-w-full"
        >
          {/* --- State A: Install Button --- */}
          <motion.div
            style={{
              opacity: installOpacity,
              y: installY,
              display: installDisplay,
            }}
            onClick={handleCopy}
            className="absolute inset-0 items-center justify-between px-4 md:px-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-2 md:gap-4 font-mono font-medium text-sm md:text-base text-gray-500 truncate mr-2">
              <ChevronRight
                size={18}
                className="animate-pulse text-gray-300 shrink-0"
              />
              <span className="truncate">{INSTALL_CMD}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400 shrink-0">
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-green-600 flex gap-1"
                >
                  <Check size={14} />{" "}
                  <span className="hidden sm:inline">Copied</span>
                </motion.div>
              ) : (
                <div className="flex gap-1 items-center">
                  <Command size={12} />{" "}
                  <span className="hidden sm:inline">C</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* --- State B: Terminal Window --- */}
          <motion.div
            style={{ opacity: terminalOpacity, y: terminalY }}
            className="flex flex-col w-full h-full text-white pointer-events-none"
          >
            {/* Terminal Header */}
            <div className="h-10 md:h-12 border-b border-white/10 bg-white/5 flex items-center justify-between px-3 md:px-4 shrink-0 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 group">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-2 md:ml-4 flex items-center gap-2 text-[10px] md:text-xs font-mono text-gray-400 bg-black/20 px-2 py-1 rounded">
                  <Terminal size={10} /> demo.tsx
                </div>
              </div>

              <button
                onClick={(e) => {
                  const pointerEvent =
                    e as unknown as React.PointerEvent<HTMLButtonElement>;
                  handleCopy(pointerEvent);
                }}
                className="pointer-events-auto opacity-50 hover:opacity-100 transition-opacity"
              >
                {copied ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 w-full flex items-center justify-center p-4 md:p-8 bg-black/40 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-500/10 blur-[40px] md:blur-[60px] rounded-full pointer-events-none" />
              <div className="relative z-10 w-full">
                <CodeBlock />
              </div>
            </div>

            {/* Terminal Footer */}
            <div className="h-6 md:h-8 border-t border-white/10 bg-black text-[9px] md:text-[10px] text-gray-600 font-mono flex items-center px-4 justify-between shrink-0">
              <span>TypeScript React</span>
              <span>UTF-8</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Hint */}
        <motion.div
          style={{ opacity: installOpacity }}
          className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 text-gray-400 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-8 md:h-12 bg-gradient-to-b from-transparent to-black/30" />
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">
            Scroll
          </span>
        </motion.div>
      </div>
    </div>
  );
}
