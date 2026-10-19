'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Terminal, Cpu, ArrowUpRight, Send, Globe, Zap, Disc } from 'lucide-react';

export default function AntiGravityNeuralTerminal() {
    const [promptText, setPromptText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'neural' | 'quantum' | 'vector'>('neural');
    const [sliderVal, setSliderVal] = useState(74);
    const [dialAngle, setDialAngle] = useState(45);
    const [isLocked, setIsLocked] = useState(true);

    // Mouse tilt tracking for card 3D effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const tiltX = useTransform(y, [-300, 300], [10, -10]);
    const tiltY = useTransform(x, [-300, 300], [-10, 10]);

    const handleRunPrompt = () => {
        if (!promptText.trim()) return;
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setPromptText('');
        }, 1500);
    };

    return (
        <div className="w-full min-h-screen bg-[#08080A] text-white font-sans p-6 md:p-12 flex flex-col items-center justify-center select-none overflow-hidden relative">

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BEF202]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* --- MAIN FEATURED CONTAINER: ANTI-GRAVITY NEURAL WORKSPACE --- */}
            <motion.div
                style={{
                    x,
                    y,
                    rotateX: tiltX,
                    rotateY: tiltY,
                    perspective: 1000,
                }}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    x.set(e.clientX - rect.left - rect.width / 2);
                    y.set(e.clientY - rect.top - rect.height / 2);
                }}
                onMouseLeave={() => {
                    x.set(0);
                    y.set(0);
                }}
                className="w-full max-w-5xl bg-[#121216]/90 backdrop-blur-xl border-[3px] border-white/20 p-8 md:p-12 shadow-[0_40px_120px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)] rounded-3xl flex flex-col gap-8 relative z-10"
            >
                {/* --- HEADER BAR --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-white/10 pb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#BEF202] text-black font-black flex items-center justify-center text-sm shadow-[0_0_15px_#BEF202]">
                            ⚡
                        </div>
                        <div>
                            <h1 className="font-extrabold text-xl uppercase tracking-tighter text-white">
                                Anti-Gravity // Neural Workspace
                            </h1>
                            <p className="font-mono text-xs text-zinc-400">
                                COMPONENT_SUITE: HYBRID_AI_ORCHESTRATOR // V5.0
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#1A1A20] border-2 border-white/10 p-1 rounded-xl">
                        {(['neural', 'quantum', 'vector'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-all ${activeTab === tab
                                        ? 'bg-[#BEF202] text-black shadow-[0_0_15px_rgba(190,242,2,0.4)]'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- CORE COMBINED GRID COMPONENT --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* SUB-COMPONENT 1: AI Prompt Input & Streaming Feed */}
                    <div className="lg:col-span-2 bg-[#18181D] border-2 border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#BEF202]/5 rounded-full blur-2xl pointer-events-none" />

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-mono text-[10px] uppercase font-bold text-[#BEF202] flex items-center gap-1.5">
                                    <Sparkles size={12} /> AI Inference Stream
                                </span>
                                <span className="font-mono text-[10px] text-zinc-500">LATENCY: 12ms</span>
                            </div>

                            <div className="bg-[#0E0E12] border border-white/10 rounded-xl p-4 min-h-[140px] flex flex-col justify-between mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                                        <Terminal size={14} className="text-[#BEF202]" />
                                        <span>SYSTEM_PROMPT: Ready for multi-agent synthesis</span>
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {isGenerating ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                className="font-mono text-sm text-[#BEF202] flex items-center gap-2"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-[#BEF202] animate-ping" />
                                                Synthesizing component tree and spatial constraints...
                                            </motion.div>
                                        ) : (
                                            <p className="font-mono text-xs text-zinc-300">
                                                {promptText ? `Query: "${promptText}"` : "Enter parameter command or query neural memory bank below."}
                                            </p>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="flex gap-2 pt-4 border-t border-white/5">
                                    <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-400">#nextjs</span>
                                    <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-400">#framer</span>
                                    <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-400">#glitch</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Input Bar */}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Type parameter or prompt query..."
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRunPrompt()}
                                className="flex-1 bg-[#0E0E12] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#BEF202] transition-colors"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRunPrompt}
                                disabled={isGenerating}
                                className="px-5 py-3 bg-[#BEF202] text-black font-black uppercase text-xs rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(190,242,2,0.3)] hover:bg-white transition-all cursor-pointer"
                            >
                                <Send size={14} />
                                Execute
                            </motion.button>
                        </div>
                    </div>

                    {/* SUB-COMPONENT 2: Kinetic Harmonic Modulator (Rotary & Slider) */}
                    <div className="bg-[#18181D] border-2 border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-mono text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                                    <Cpu size={12} /> Harmonic Modulator
                                </span>
                                <Globe size={14} className="text-zinc-500" />
                            </div>

                            {/* Rotary Dial Widget */}
                            <div className="flex justify-center my-4">
                                <motion.div
                                    drag={"angle" as any}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    onDrag={(e, info) => setDialAngle((prev) => (prev + info.delta.x * 2) % 360)}
                                    animate={{ rotate: dialAngle }}
                                    className="w-24 h-24 rounded-full bg-gradient-to-b from-[#282830] to-[#141418] border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-grab active:cursor-grabbing relative"
                                >
                                    <div className="absolute top-2 w-1 h-5 bg-[#BEF202] rounded-full shadow-[0_0_10px_#BEF202]" />
                                    <div className="w-10 h-10 rounded-full bg-[#0E0E12] border border-white/10" />
                                </motion.div>
                            </div>

                            {/* Micro Slider */}
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between font-mono text-[11px]">
                                    <span className="text-zinc-400">Flux Density</span>
                                    <span className="text-[#BEF202] font-bold">{sliderVal}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderVal}
                                    onChange={(e) => setSliderVal(Number(e.target.value))}
                                    className="w-full h-2 bg-[#0E0E12] border border-white/10 rounded-lg accent-[#BEF202] cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Security Lock Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setIsLocked(!isLocked)}
                            className={`w-full mt-6 py-2.5 font-mono text-xs font-bold uppercase rounded-xl border transition-all flex items-center justify-center gap-2 ${isLocked
                                    ? 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                                    : 'bg-[#BEF202] border-[#BEF202] text-black shadow-[0_0_15px_rgba(190,242,2,0.3)]'
                                }`}
                        >
                            <Zap size={14} />
                            {isLocked ? 'State: Secure Locked' : 'State: Override Active'}
                        </motion.button>
                    </div>

                </div>

                {/* --- FOOTER STATUS STRIP --- */}
                <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t-2 border-white/10 font-mono text-xs text-zinc-500 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span>All subsystems nominal // Connected to 21st.dev kinetic registry</span>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                        <a href="#" className="hover:text-[#BEF202] transition-colors flex items-center gap-1">
                            Documentation <ArrowUpRight size={14} />
                        </a>
                        <a href="#" className="hover:text-[#BEF202] transition-colors flex items-center gap-1">
                            GitHub Repository <ArrowUpRight size={14} />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}