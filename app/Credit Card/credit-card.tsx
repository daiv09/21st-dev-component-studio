// neural-card-section.tsx
"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

// --- MAIN SECTION ---
export default function CreditCardSection() {
  return (
    <section className="relative w-full min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden py-20 px-6 font-sans antialiased selection:bg-white/20">
      
      {/* BACKGROUND: Ambient Void */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Grid */}
        <div 
            className="absolute inset-0 opacity-[0.05]"
            style={{ 
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", 
                backgroundSize: "32px 32px" 
            }}
        />
        
        {/* Ambient Glows (The "Atmosphere") */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* CONTENT LAYOUT */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* LEFT: Typography (Minimalist) */}
        <div className="flex flex-col gap-8 order-2 lg:order-1">
          <div className="space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)] animate-pulse" />
                <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">System V.2.0</span>
             </div>

            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 tracking-tighter leading-[1] -ml-1">
              Limitless <br />
              <span className="">Access.</span>
            </h1>
            
            <p className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed max-w-md">
              The first physics-based neural interface. Crafted from obsidian glass and secured by quantum encryption.
            </p>
          </div>

          <div className="flex gap-8 border-t border-white/10 pt-8">
             <Stat label="BANDWIDTH" value="100 TB/s" />
             <Stat label="MATERIAL" value="MATTE GLASS" />
             <Stat label="SECURE" value="TRUE" />
          </div>
        </div>

        {/* RIGHT: The Masterpiece Card */}
        <div className="order-1 lg:order-2 flex items-center justify-center perspective-[1500px]">
           <PremiumHoloCard />
        </div>

      </div>
    </section>
  );
}

const Stat = ({ label, value }: { label: string, value: string }) => (
    <div>
        <div className="text-[10px] font-mono tracking-widest text-neutral-500 mb-1">{label}</div>
        <div className="text-sm font-medium text-white/90">{value}</div>
    </div>
);


// --- THE PREMIUM CARD COMPONENT ---
function PremiumHoloCard() {
  const ref = useRef<HTMLDivElement>(null);

  // Physics Config
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smoother spring for that heavy, premium feel
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);
  
  // Dynamic Glare & Sheen
  const glareX = useTransform(mouseX, [-300, 300], [0, 100]);
  const glareY = useTransform(mouseY, [-300, 300], [0, 100]);
  const sheenOpacity = useTransform(mouseY, [-300, 300], [0, 0.4]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const offsetX = e.clientX - rect.left - width / 2;
    const offsetY = e.clientY - rect.top - height / 2;
    x.set(offsetX);
    y.set(offsetY);
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
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-[480px] h-[300px] rounded-[24px] cursor-default"
    >
      {/* 1. CARD BODY (The Physical Object) */}
      <div 
        className="absolute inset-0 rounded-[24px] bg-[#0a0a0a] overflow-hidden"
        style={{ transform: "translateZ(0px)" }}
      >
        {/* Texture: Noise for matte finish */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Texture: Subtle Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#111] to-black" />
        
        {/* Texture: Frosted Blur */}
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      {/* 2. LIGHTING & REFLECTIONS */}
      {/* Top Edge Highlight */}
      <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10 pointer-events-none" />
      
      {/* Dynamic Glare Spot */}
      <motion.div
        className="absolute inset-0 rounded-[24px] pointer-events-none opacity-60 mix-blend-overlay"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) =>
              `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.3) 0%, transparent 60%)`
          ),
        }}
      />
      
      {/* Iridescent Foil Sheen (Subtle Color Shift) */}
      <motion.div 
        className="absolute inset-0 rounded-[24px] bg-gradient-to-tr from-indigo-500/20 via-transparent to-blue-500/20 mix-blend-color-dodge pointer-events-none"
        style={{ opacity: sheenOpacity }}
      />

      {/* 3. CARD CONTENT (Floating Elements) */}
      <div className="relative z-10 h-full p-8 flex flex-col justify-between select-none">
        
        {/* HEADER */}
        <div className="flex justify-between items-start">
           {/* Metal Chip */}
           <motion.div style={{ translateZ: 40 }} className="relative w-14 h-10 rounded overflow-hidden shadow-lg border border-yellow-600/30">
             <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-yellow-600 to-yellow-800" />
             {/* Chip Detail Lines */}
             <div className="absolute inset-0 border-[2px] border-yellow-900/20 rounded opacity-50" />
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-900/40" />
             <div className="absolute left-1/3 top-0 h-full w-[1px] bg-yellow-900/40" />
             <div className="absolute right-1/3 top-0 h-full w-[1px] bg-yellow-900/40" />
           </motion.div>
           
           {/* Contactless Icon */}
           <motion.div style={{ translateZ: 30 }} className="opacity-50 rotate-90 origin-center">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                <line x1="12" y1="20" x2="12.01" y2="20" />
             </svg>
           </motion.div>
        </div>

        {/* CENTER: Embossed Number */}
        <motion.div style={{ translateZ: 50 }} className="mt-4">
             <div className="flex gap-4 text-2xl font-mono text-white/90 tracking-[0.15em] drop-shadow-xl" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                <span>4290</span>
                <span>9901</span>
                <span>8021</span>
                <span>3099</span>
             </div>
        </motion.div>

        {/* FOOTER */}
        <div className="flex justify-between items-end">
            <motion.div style={{ translateZ: 35 }}>
                <div className="text-[9px] text-neutral-400 font-bold tracking-[0.1em] mb-1">CARDHOLDER</div>
                <div className="text-sm font-medium text-white tracking-widest uppercase">Daiwiik Harihar</div>
            </motion.div>
            
            <motion.div style={{ translateZ: 35 }} className="flex flex-col items-end">
                <div className="text-[9px] text-neutral-400 font-bold tracking-[0.1em] mb-1">VALID THRU</div>
                <div className="text-sm font-mono text-white">12/29</div>
            </motion.div>
        </div>
      </div>
      
      {/* 4. LOGO (Mastercard Style but Minimal) */}
      <motion.div 
        style={{ translateZ: 25 }}
        className="absolute bottom-8 right-8 mix-blend-overlay opacity-50 pointer-events-none"
      >
         <div className="flex -space-x-3">
             <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm" />
             <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md" />
         </div>
      </motion.div>
      
    </motion.div>
  );
}