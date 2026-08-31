"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Terminal-style card: characters of a fake "log" line scroll up, each
// leaves a brief green afterglow (CSS text-shadow) then fades.
const LOG = "$ npm run ship-it";
const N = LOG.length;

export default function PhosphorAfterglow() {
    const [shown, setShown] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setShown((v) => (v >= N ? 0 : v + 1));
        }, 220);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[280px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-black overflow-hidden font-mono p-6 text-emerald-400 text-lg">
            <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2">~/studio</span>
            </div>
            <div className="leading-relaxed">
                {LOG.split("").map((ch, i) => {
                    const isShown = i < shown;
                    const isLatest = i === shown - 1;
                    return (
                        <motion.span
                            key={i}
                            animate={
                                isLatest
                                    ? {
                                          textShadow: [
                                              "0 0 0px #34d399",
                                              "0 0 14px #34d399",
                                              "0 0 0px #34d399",
                                          ],
                                          opacity: 1,
                                      }
                                    : { opacity: isShown ? 0.9 : 0.15 }
                            }
                            transition={{ duration: 0.4 }}
                        >
                            {ch}
                        </motion.span>
                    );
                })}
                <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="inline-block w-2 h-5 align-middle bg-emerald-400 ml-1"
                />
            </div>
        </div>
    );
}
