'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useSpring, 
  useTransform,
  MotionValue 
} from 'framer-motion';
import { ArrowRight, Globe, Hexagon } from 'lucide-react';
import Image from 'next/image';

/* ---------- Types ---------- */

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  image: string;
  color: string;
}

/* ---------- Data ---------- */

const FEATURES: Feature[] = [
  {
    id: '01',
    title: 'Quantum Core',
    subtitle: 'Processing Unit',
    description: 'Next-generation processing architecture designed to handle probabilistic computing states with zero latency.',
    tags: ['Hardware', 'R&D'],
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop',
    color: '#3b82f6', // blue
  },
  {
    id: '02',
    title: 'Neural Mesh',
    subtitle: 'Network Layer',
    description: 'A self-healing decentralized network that mimics biological synaptic plasticity for unbreakable connectivity.',
    tags: ['Network', 'AI'],
    image: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=1000&auto=format&fit=crop',
    color: '#ec4899', // pink
  },
  {
    id: '03',
    title: 'Obsidian Vault',
    subtitle: 'Security Protocol',
    description: 'Military-grade encryption utilizing distinct light-refraction keys stored in synthetic crystal structures.',
    tags: ['Security', 'Crypto'],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop',
    color: '#10b981', // green
  },
  {
    id: '04',
    title: 'Aero Dynamics',
    subtitle: 'Propulsion System',
    description: 'Silent propulsion systems derived from ionic wind technology, allowing for frictionless atmospheric travel.',
    tags: ['Aero', 'Physics'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    color: '#f59e0b', // amber
  },
];

/* ---------- Main Component ---------- */

export default function ShuffleStack() {
  const [activeId, setActiveId] = useState<string>(FEATURES[0].id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-neutral-200 overflow-hidden flex flex-col justify-center py-20 px-6 md:px-12">
      
      {/* Background Atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />

      <div className="mx-auto w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        
        {/* LEFT COLUMN: Text Content */}
        <div className="relative z-10 flex flex-col gap-2 order-2 lg:order-1">
          <div className="mb-8 md:mb-12">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4"
             >
               <Hexagon size={14} className="text-white" />
               <span>System Architecture</span>
             </motion.div>
             <h1 className="text-4xl md:text-5xl font-medium text-white tracking-tight">
               Core <span className="text-neutral-600">Modules</span>
             </h1>
          </div>

          <div className="flex flex-col gap-6">
            {FEATURES.map((feature) => (
              <ListItem
                key={feature.id}
                feature={feature}
                isActive={activeId === feature.id}
                onClick={() => setActiveId(feature.id)}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: The Shuffle Stack (Desktop) / Inline Image (Mobile handled in ListItem) */}
        {!isMobile && (
          <div className="relative h-[600px] w-full flex items-center justify-center order-1 lg:order-2 perspective-1000">
             <CardStack activeId={activeId} features={FEATURES} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Sub-Components ---------- */

function ListItem({
  feature,
  isActive,
  onClick,
  isMobile,
}: {
  feature: Feature;
  isActive: boolean;
  onClick: () => void;
  isMobile: boolean;
}) {
  return (
    <div 
      className={`group relative flex flex-col gap-4 border-l-2 transition-all duration-500 ${
        isActive ? 'border-white pl-8' : 'border-neutral-800 pl-6 hover:pl-8 hover:border-neutral-700'
      } cursor-pointer`}
      onClick={onClick}
    >
      {/* Active Indicator Glow (Left Border) */}
      {isActive && (
        <motion.div 
          layoutId="activeGlow"
          className="absolute left-[-2px] top-0 bottom-0 w-[2px] shadow-[0_0_20px_2px_rgba(255,255,255,0.5)] bg-white"
        />
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-2xl font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
            {feature.title}
          </h3>
          <p className="text-xs font-mono uppercase tracking-wider text-neutral-600 mt-1">
            {feature.subtitle}
          </p>
        </div>
        
        {/* Arrow Icon */}
        <motion.div
           animate={{ 
             x: isActive ? 0 : -10, 
             opacity: isActive ? 1 : 0 
           }}
        >
          <ArrowRight className="text-white" size={20} />
        </motion.div>
      </div>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{ 
          height: isActive ? 'auto' : 0,
          opacity: isActive ? 1 : 0
        }}
        className="overflow-hidden"
      >
        <p className="text-neutral-400 leading-relaxed max-w-md pb-4">
          {feature.description}
        </p>
        
        <div className="flex gap-2 pb-2">
          {feature.tags.map(tag => (
            <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-400">
              {tag}
            </span>
          ))}
        </div>

        {/* Mobile Only: Show Image inline when expanded */}
        {isMobile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-48 w-full mt-4 rounded-lg overflow-hidden"
          >
             <Image src={feature.image} alt={feature.title} fill className="object-cover" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function CardStack({ activeId, features }: { activeId: string; features: Feature[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Motion Values for the 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement so the card doesn't jitter
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const width = rect.width;
      const height = rect.height;
      const mouseXFromCenter = event.clientX - rect.left - width / 2;
      const mouseYFromCenter = event.clientY - rect.top - height / 2;
      
      x.set(mouseXFromCenter);
      y.set(mouseYFromCenter);
    }
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Calculate rotation based on mouse position (only applied to active card)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]); // Look up/down
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]); // Look left/right

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full flex items-center justify-center perspective-[1200px]" // Perspective is key for 3D
    >
      <AnimatePresence mode="popLayout">
        {features.map((feature, index) => {
           const isActive = feature.id === activeId;
           
           // Calculate stacking order: Active is always top (50).
           // Others stack based on their index to preserve visual hierarchy.
           const zIndex = isActive ? 50 : features.length - index;

           return (
             <Card 
               key={feature.id}
               feature={feature}
               isActive={isActive}
               index={index}
               zIndex={zIndex}
               rotateX={rotateX}
               rotateY={rotateY}
             />
           );
        })}
      </AnimatePresence>
      
      {/* Ambient Glow behind the active stack */}
      <motion.div 
        animate={{ 
           background: features.find(f => f.id === activeId)?.color || '#ffffff'
        }}
        className="absolute -z-10 w-[300px] h-[450px] rounded-full blur-[120px] opacity-20 transition-colors duration-700" 
      />
    </div>
  );
}

function Card({ 
  feature, 
  isActive, 
  index, 
  zIndex, 
  rotateX, 
  rotateY 
}: { 
  feature: Feature; 
  isActive: boolean; 
  index: number; 
  zIndex: number; 
  rotateX: MotionValue<number>; 
  rotateY: MotionValue<number>; 
}) {
  
  // Random slight rotation for the "messy stack" feel on inactive cards
  // We use a deterministic random based on ID so it doesn't jitter on re-render
  const randomRotate = (Number(feature.id) * 7) % 10 - 5; 
  
  return (
    <motion.div
      layout
      style={{
        zIndex,
        // Only apply the 3D mouse tilt to the ACTIVE card
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        transformStyle: "preserve-3d", // Essential for 3D depth
      }}
      initial={false}
      animate={{
        // Active: Center, scale up, full opacity, move towards camera (z: 100)
        // Inactive: Move down, scale down, fade out, move away (z: -index*50)
        y: isActive ? 0 : (index * 40) - 40, // Cascade effect
        x: isActive ? 0 : (index % 2 === 0 ? 15 : -15), // Slight alternating offset
        scale: isActive ? 1 : 0.9 - (index * 0.05),
        opacity: isActive ? 1 : 0.6 - (index * 0.1),
        rotateZ: isActive ? 0 : randomRotate,
        z: isActive ? 0 : -50 * (index + 1), // Push inactive cards deeper into 3D space
        filter: isActive ? 'blur(0px) brightness(1)' : 'blur(4px) brightness(0.7)' 
      }}
      transition={{
        type: "spring",
        stiffness: isActive ? 200 : 300, // Active card moves slower/smoother
        damping: 25,
        mass: 1
      }}
      className="absolute w-[340px] h-[480px] md:w-[380px] md:h-[540px] rounded-[24px] border border-white/10 bg-neutral-900 shadow-2xl cursor-grab active:cursor-grabbing"
    >
      {/* --- Image Layer --- */}
      <div className="relative w-full h-full rounded-[24px] overflow-hidden transform-gpu">
        <Image 
          src={feature.image} 
          alt={feature.title} 
          fill 
          className="object-cover pointer-events-none" 
          priority={isActive}
        />
        
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
        
        {/* Dynamic Sheen/Reflection (Only visible when active) */}
        {isActive && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 skew-x-12"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* --- Content Overlay --- */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end z-20"
        // Parallax the text slightly off the card surface
        style={{ transform: "translateZ(30px)" }} 
      >
        <div className="flex flex-col gap-2">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
             transition={{ delay: 0.1 }}
             className="flex items-center gap-2"
           >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: feature.color }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: feature.color }}></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/90 drop-shadow-md">
                Active Feed
              </span>
           </motion.div>
           
           <motion.h4 
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
             className="text-white font-bold text-xl drop-shadow-lg"
           >
             {feature.title}
           </motion.h4>
        </div>

        <motion.div
           animate={{ scale: isActive ? 1 : 0.8, opacity: isActive ? 1 : 0 }}
           className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center"
        >
           <Globe className="text-white" size={18} />
        </motion.div>
      </motion.div>
      
      {/* --- Border Highlight --- */}
      {/* This creates a glowing border that matches the theme color */}
      <motion.div 
        animate={{ opacity: isActive ? 1 : 0 }}
        className="absolute inset-0 rounded-[24px] border-2 border-white/20 pointer-events-none"
        style={{ borderColor: isActive ? `${feature.color}40` : 'transparent' }}
      />
      
    </motion.div>
  );
}