"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Check, Loader2, X } from "lucide-react";

export function MorphingSubscribe() {
    const [state, setState] = useState<"idle" | "input" | "loading" | "success">("idle");
    const [email, setEmail] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus the input when it opens
    useEffect(() => {
        if (state === "input") {
            inputRef.current?.focus();
        }
    }, [state]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setState("loading");
        // Simulate API call
        setTimeout(() => {
            setState("success");
            // Reset back to idle after 3 seconds
            setTimeout(() => {
                setState("idle");
                setEmail("");
            }, 3000);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setState("idle");
            setEmail("");
        }
    };

    return (
        <motion.div
            layout
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className={`
        relative flex items-center p-1.5 overflow-hidden
        rounded-full border shadow-sm
        transition-colors duration-300
        ${state === "success"
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                    : "bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800"
                }
      `}
            style={{
                // 150px for the button, 340px for the expanded input
                width: state === "idle" || state === "loading" || state === "success" ? 150 : 340,
                height: 56,
            }}
        >
            <AnimatePresence mode="popLayout" initial={false}>

                {/* --- STATE 1: IDLE BUTTON --- */}
                {state === "idle" && (
                    <motion.button
                        key="btn-idle"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setState("input")}
                        className="w-full h-full flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-300 font-medium hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        <Mail size={18} />
                        <span>Subscribe</span>
                    </motion.button>
                )}

                {/* --- STATE 2: INPUT FIELD --- */}
                {state === "input" && (
                    <motion.form
                        key="form-input"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleSubmit}
                        className="flex items-center w-full h-full gap-2 pl-3 pr-1"
                    >
                        <Mail size={18} className="text-neutral-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="email"
                            placeholder="Enter your email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 w-full bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm"
                        />

                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={() => {
                                setState("idle");
                                setEmail("");
                            }}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors rounded-full"
                        >
                            <X size={16} />
                        </button>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={email ? { scale: 1.05 } : {}}
                            whileTap={email ? { scale: 0.95 } : {}}
                            type="submit"
                            disabled={!email}
                            className={`
                h-10 w-10 flex items-center justify-center rounded-full shrink-0 transition-colors
                ${email
                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black cursor-pointer"
                                    : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed"}
              `}
                        >
                            <ArrowRight size={18} />
                        </motion.button>
                    </motion.form>
                )}

                {/* --- STATE 3: LOADING --- */}
                {state === "loading" && (
                    <motion.div
                        key="btn-loading"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full flex items-center justify-center text-neutral-500"
                    >
                        <Loader2 size={20} className="animate-spin" />
                    </motion.div>
                )}

                {/* --- STATE 4: SUCCESS --- */}
                {state === "success" && (
                    <motion.div
                        key="btn-success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-full h-full flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium"
                    >
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 p-1 rounded-full">
                            <Check size={16} strokeWidth={3} />
                        </div>
                        <span>Subscribed!</span>
                    </motion.div>
                )}

            </AnimatePresence>
        </motion.div>
    );
}