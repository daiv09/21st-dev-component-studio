// safety-button.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SafetyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const toggleCover = () => setIsOpen(!isOpen);
  
  const handlePress = () => {
    if (!isOpen) return;
    setIsActive(!isActive);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px] bg-neutral-950 perspective-[800px]">
      
      {/* BASE PLATE */}
      <div className="relative w-40 h-52 bg-neutral-900 rounded-lg border border-neutral-800 shadow-2xl flex flex-col items-center justify-end pb-8">
        
        {/* Warning Stripes */}
        <div className="absolute top-0 w-full h-full opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)] pointer-events-none" />
        
        {/* THE BUTTON (Underneath) */}
        <motion.button
            onClick={handlePress}
            whileTap={{ scale: 0.95, y: 2 }}
            animate={{ 
                boxShadow: isActive 
                    ? "0 0 30px rgba(239,68,68,0.6), inset 0 2px 5px rgba(255,255,255,0.2)" 
                    : "0 0 0px rgba(0,0,0,0), inset 0 2px 5px rgba(255,255,255,0.1)",
                backgroundColor: isActive ? "#ef4444" : "#7f1d1d"
            }}
            className="w-24 h-24 rounded-full border-4 border-red-950 flex items-center justify-center relative z-10 transition-colors duration-200"
            disabled={!isOpen}
        >
             <span className="font-black text-red-950 uppercase tracking-wider text-xs">
                 {isActive ? "PURGE" : "FIRE"}
             </span>
        </motion.button>

        {/* STATUS LED */}
        <div className="absolute top-4 w-full flex justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-red-900"}`} />
            <div className={`w-2 h-2 rounded-full ${!isActive ? "bg-green-500 shadow-[0_0_10px_green]" : "bg-green-900"}`} />
        </div>

        {/* SAFETY COVER (3D Hinge) */}
        <motion.div
            className="absolute bottom-[20px] w-32 h-36 origin-top cursor-pointer z-20"
            initial={false}
            animate={{ rotateX: isOpen ? 160 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onClick={toggleCover}
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Front Face (Glass) */}
            <div className="absolute inset-0 bg-red-500/20 rounded-t-lg border-x-4 border-t-4 border-red-500/50 backdrop-blur-[2px] flex items-end justify-center pb-2 shadow-lg">
                <div className="w-full h-8 bg-stripes-pattern opacity-50" />
                <span className="absolute top-2 text-[10px] text-red-300 font-mono border border-red-500/50 px-1 rounded">
                    SAFETY LOCK
                </span>
                
                {/* Hinge Graphic */}
                <div className="absolute -top-3 left-0 right-0 h-4 bg-neutral-800 rounded-full flex items-center justify-between px-1">
                    <div className="w-1 h-3 bg-neutral-600 rounded-full" />
                    <div className="w-full h-[1px] bg-neutral-700" />
                    <div className="w-1 h-3 bg-neutral-600 rounded-full" />
                </div>
            </div>
        </motion.div>
      </div>

      <p className="mt-8 text-neutral-500 font-mono text-sm">
          {isOpen ? "ARMED: PRESS TO ENGAGE" : "LOCKED: LIFT COVER"}
      </p>

    </div>
  );
}