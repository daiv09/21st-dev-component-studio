"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
    Command,
    Paperclip,
    ArrowUp,
    Code2,
    Cpu,
    Sparkles,
    Terminal,
    CornerDownLeft,
    Zap,
    ShieldCheck,
    Activity,
    Radar,
    Waves,
    ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const SYSTEM_PROMPTS = [
    "Execute root diagnostics across cluster...",
    "Compile neural weights for model v4...",
    "Query vector DB for semantic matches...",
    "Optimize latency budget for edge functions...",
];

const TABS = [
    { id: "terminal", label: "Terminal", icon: Terminal },
    { id: "neural", label: "Core", icon: Cpu },
    { id: "kernel", label: "Kernel Trace", icon: Code2 },
] as const;

const DIAGNOSTIC_CARDS = [
    {
        id: "latency",
        title: "Latency Monitor",
        icon: Zap,
        value: "42ms",
        status: "optimal",
        description: "Real-time edge function latency tracking across nodes.",
    },
    {
        id: "security",
        title: "Shield Integrity",
        icon: ShieldCheck,
        value: "99.8%",
        status: "secure",
        description: "Neural weight encryption and access audit trail.",
    },
    {
        id: "throughput",
        title: "Throughput Radar",
        icon: Radar,
        value: "3.2 TB/s",
        status: "peak",
        description: "Data ingestion rate across distributed clusters.",
    },
    {
        id: "vitality",
        title: "Vitality Wave",
        icon: Waves,
        value: "Active",
        status: "alive",
        description: "System heartbeat and cluster synchronization pulse.",
    },
] as const;

type TabType = (typeof TABS)[number]["id"];

export const AIChatInput = () => {
    const [promptIndex, setPromptIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [value, setValue] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("terminal");
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [cardIndex, setCardIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isExpanded || value) return;
        const interval = setInterval(() => {
            setPromptIndex((prev) => (prev + 1) % SYSTEM_PROMPTS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isExpanded, value]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                if (!value) setIsExpanded(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isExpanded) {
                setIsExpanded(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [value, isExpanded]);

    useEffect(() => {
        if (!isExpanded) return;
        const interval = setInterval(() => {
            setCardIndex((prev) => (prev + 1) % DIAGNOSTIC_CARDS.length);
        }, 3200);
        return () => clearInterval(interval);
    }, [isExpanded]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!value.trim()) return;
        setValue("");
    };

    const activeCard = DIAGNOSTIC_CARDS[cardIndex];
    const ActiveIcon = activeCard.icon;

    return (
        <div className="w-full min-h-screen bg-black dark:bg-white flex justify-center items-center p-4 sm:p-6 selection:bg-white/20 selection:text-white dark:selection:bg-black/10 dark:selection:text-black font-mono transition-colors duration-500">
            <motion.div
                ref={containerRef}
                layout
                transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 32,
                    mass: 0.8,
                }}
                className={`relative w-full max-w-2xl bg-[#0a0a0a] dark:bg-[#fafafa] border rounded-3xl transition-shadow duration-300 overflow-hidden ${
                    isExpanded
                        ? "border-[#444] dark:border-[#d4d4d4] shadow-2xl shadow-white/5 dark:shadow-black/10 ring-1 ring-white/10 dark:ring-black/5"
                        : "border-[#333] dark:border-[#e5e5e5] shadow-xl shadow-white/5 dark:shadow-black/5 hover:border-[#555] dark:hover:border-[#ccc]"
                }`}
                onClick={() => {
                    setIsExpanded(true);
                    inputRef.current?.focus();
                }}
            >
                <div className="flex flex-col p-2 sm:p-3">
                    {/* Top Bar / Input Field */}
                    <div className="flex items-center gap-2 sm:gap-2.5 w-full">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-[#111] dark:bg-[#f0f0f0] text-[#888] dark:text-[#666] border border-[#333] dark:border-[#e5e5e5] shadow-sm select-none"
                        >
                            <Command size={15} />
                        </motion.div>

                        <form onSubmit={handleSubmit} className="relative flex-1 flex items-center min-w-0">
                            <input
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onFocus={() => setIsExpanded(true)}
                                className="w-full bg-transparent border-none outline-none text-white dark:text-black text-sm py-1.5 z-10 placeholder-transparent"
                            />

                            {!value && (
                                <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none overflow-hidden select-none pr-4 w-full">
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={promptIndex}
                                            initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                            className="text-[#666] dark:text-[#999] text-xs sm:text-sm truncate block w-full"
                                        >
                                            {SYSTEM_PROMPTS[promptIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </div>
                            )}
                        </form>

                        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-1.5">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-[#888] dark:text-[#666] hover:text-white dark:hover:text-black hover:bg-[#222] dark:hover:bg-[#e5e5e5] rounded-xl transition-colors hidden sm:flex"
                                title="Attach context file"
                            >
                                <Paperclip size={15} />
                            </motion.button>

                            <motion.button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubmit();
                                }}
                                disabled={!value.trim()}
                                whileHover={value.trim() ? { scale: 1.05 } : {}}
                                whileTap={value.trim() ? { scale: 0.95 } : {}}
                                className={`flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200 ${
                                    value.trim()
                                        ? "bg-white text-black dark:bg-black dark:text-white shadow-md shadow-white/10 dark:shadow-black/10 cursor-pointer"
                                        : "bg-[#111] dark:bg-[#f0f0f0] text-[#444] dark:text-[#aaa] border border-[#333] dark:border-[#e5e5e5] cursor-not-allowed"
                                }`}
                            >
                                {value.trim() ? <ArrowUp size={15} /> : <CornerDownLeft size={13} />}
                            </motion.button>
                        </div>
                    </div>

                    {/* Expanded Diagnostic Sub-Tray */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{
                                    opacity: { duration: 0.2 },
                                    height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                                }}
                                className="overflow-hidden w-full"
                            >
                                <div className="border-t border-[#333] dark:border-[#e5e5e5] pt-3 mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
                                    {/* Segmented Control */}
                                    <div className="flex flex-wrap items-center gap-1 bg-[#111] dark:bg-[#f0f0f0] p-1 rounded-xl border border-[#333] dark:border-[#e5e5e5] w-full sm:w-auto">
                                        {TABS.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveTab(tab.id);
                                                    }}
                                                    className={`relative flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-colors select-none ${
                                                        isActive
                                                            ? "text-white dark:text-black"
                                                            : "text-[#888] dark:text-[#777] hover:text-[#ccc] dark:hover:text-[#333]"
                                                    }`}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTabIndicator"
                                                            className="absolute inset-0 bg-[#222] dark:bg-white border border-[#444] dark:border-[#ddd] rounded-lg shadow-sm"
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 420,
                                                                damping: 32,
                                                            }}
                                                        />
                                                    )}
                                                    <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                                                        <Icon size={12} className={isActive ? "text-white dark:text-black" : ""} />
                                                        {tab.label}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Interactive Animated Diagnostic Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                                        {DIAGNOSTIC_CARDS.map((card, i) => {
                                            const CardIcon = card.icon;
                                            const isActive = card.id === activeCard.id;
                                            return (
                                                <motion.button
                                                    key={card.id}
                                                    type="button"
                                                    onClick={() => setCardIndex(i)}
                                                    onMouseEnter={() => setHoveredCard(card.id)}
                                                    onMouseLeave={() => setHoveredCard(null)}
                                                    initial={{ opacity: 0, y: 12, scale: 0.92 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                                    transition={{
                                                        duration: 0.35,
                                                        ease: [0.34, 1.56, 0.64, 1],
                                                        delay: i * 0.06,
                                                    }}
                                                    className={`group relative flex flex-col gap-1.5 p-2.5 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${
                                                        isActive
                                                            ? "bg-[#111] dark:bg-[#eee] border-[#444] dark:border-[#ccc] shadow-[0_0_24px_rgba(255,255,255,0.06)] dark:shadow-[0_0_24px_rgba(0,0,0,0.06)]"
                                                            : "bg-[#0a0a0a] dark:bg-[#f8f8f8] border-[#222] dark:border-[#ddd] hover:border-[#555] dark:hover:border-[#aaa] hover:shadow-[0_0_16px_rgba(255,255,255,0.03)]"
                                                    }`}
                                                >
                                                    {/* Status glow */}
                                                    <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-40 transition-opacity duration-700 ${
                                                        hoveredCard === card.id ? "opacity-60" : "opacity-30"
                                                    } ${
                                                        card.status === "optimal" ? "bg-emerald-400/20" :
                                                        card.status === "secure" ? "bg-sky-400/20" :
                                                        card.status === "peak" ? "bg-violet-400/20" :
                                                        card.status === "alive" ? "bg-amber-400/20" :
                                                        "bg-neutral-400/20"
                                                    }`} />

                                                    <div className="flex items-center justify-between relative z-10">
                                                        <span className="text-[10px] uppercase tracking-[0.08em] text-[#777] dark:text-[#999] font-medium">
                                                            {card.title}
                                                        </span>
                                                        <motion.span
                                                            animate={isActive ? { rotate: 360 } : { rotate: 0 }}
                                                            transition={{ duration: isActive ? 3 : 0, ease: "linear", repeat: isActive ? Infinity : 0 }}
                                                        >
                                                            <CardIcon size={14} className="text-[#555] dark:text-[#aaa]" />
                                                        </motion.span>
                                                    </div>

                                                    <div className="relative z-10 flex items-baseline gap-1.5">
                                                        <motion.span
                                                            key={isActive ? card.value : "idle"}
                                                            initial={{ y: 6, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                                                            className="text-xl sm:text-2xl font-bold text-white dark:text-black leading-none tracking-tight"
                                                        >
                                                            {card.value}
                                                        </motion.span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                                                            card.status === "optimal" ? "text-emerald-400 bg-emerald-400/10" :
                                                            card.status === "secure" ? "text-sky-400 bg-sky-400/10" :
                                                            card.status === "peak" ? "text-violet-400 bg-violet-400/10" :
                                                            card.status === "alive" ? "text-amber-400 bg-amber-400/10" :
                                                            "text-neutral-300 bg-neutral-300/10"
                                                        }`}>
                                                            {card.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-[10px] text-[#777] dark:text-[#777] leading-snug relative z-10">
                                                        {card.description}
                                                    </p>

                                                    {/* Animated bottom bar */}
                                                    <motion.div
                                                        initial={{ scaleX: 0, originX: 0 }}
                                                        animate={{ scaleX: isActive ? 1 : 0 }}
                                                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                                                        className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#555] via-[#888] to-[#333] dark:from-[#aaa] dark:via-[#ccc] dark:to-[#ddd]"
                                                    />
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Additional Mobile Tools & Model Badge */}
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-2 mt-1">
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="p-2 text-[#888] dark:text-[#666] hover:text-white dark:hover:text-black hover:bg-[#222] dark:hover:bg-[#e5e5e5] rounded-xl transition-colors sm:hidden"
                                            title="Attach context file"
                                        >
                                            <Paperclip size={15} />
                                        </motion.button>

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="flex items-center gap-1.5 text-xs text-[#aaa] dark:text-[#555] bg-[#111] dark:bg-[#f0f0f0] px-2.5 py-1.5 rounded-xl border border-[#333] dark:border-[#e5e5e5] select-none ml-auto sm:ml-0"
                                        >
                                            <Activity size={12} className="text-white dark:text-black" />
                                            <span className="font-semibold text-white dark:text-black">
                                                Animated Cards Active
                                            </span>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};