"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function BrutalistRotaryDial() {
    const [rotation, setRotation] = useState(45);
    const [powerState, setPowerState] = useState(false);

    const frequency = Math.round((rotation / 270) * 100);

    const handleRotate = (direction: "up" | "down") => {
        setRotation((prev) => {
            const next = direction === "up" ? prev + 30 : prev - 30;
            return Math.max(0, Math.min(270, next));
        });
    };

    return (
        <div className="w-full h-full bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 flex flex-col justify-between transition-colors duration-200">
            <div className="flex justify-between items-center mb-6 border-b-[3px] border-black dark:border-white pb-2">
                <h3 className="font-black uppercase text-xl text-black dark:text-white">
                    Frequency Modulator
                </h3>
                <button
                    onClick={() => setPowerState(!powerState)}
                    className={`px-3 py-1 text-xs font-black border-2 border-black dark:border-white ${powerState ? "bg-green-400 text-black" : "bg-red-400 text-black"
                        }`}
                >
                    {powerState ? "ENGAGED" : "OFFLINE"}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 flex-1">
                {/* Rotary Dial Component */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Tick Marks Around Dial */}
                    {[0, 45, 90, 135, 180, 225, 270].map((deg) => (
                        <div
                            key={deg}
                            className="absolute w-full h-full flex justify-center pointer-events-none"
                            style={{ transform: `rotate(${deg}deg)` }}
                        >
                            <div className="w-1 h-3 bg-black dark:bg-white mt-1" />
                        </div>
                    ))}

                    {/* Heavy Rotating Knob */}
                    <motion.div
                        animate={{ rotate: rotation }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="w-32 h-32 rounded-full border-[4px] border-black dark:border-white bg-yellow-300 dark:bg-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center justify-center relative cursor-pointer"
                        onClick={() => handleRotate("up")}
                    >
                        {/* Notch indicator */}
                        <div className="absolute top-2 w-2 h-6 bg-black dark:bg-white" />
                        <div className="w-16 h-16 rounded-full border-[3px] border-black dark:border-white bg-white dark:bg-zinc-900 flex items-center justify-center">
                            <span className="font-mono font-black text-xs">
                                {frequency}Hz
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Controls & Metrics */}
                <div className="flex flex-col gap-3 w-full sm:w-48">
                    <div className="border-2 border-black dark:border-white p-3 bg-zinc-50 dark:bg-zinc-800">
                        <span className="font-mono text-[10px] text-zinc-400 block">
                            OUTPUT GAIN
                        </span>
                        <span className="font-mono font-black text-2xl text-black dark:text-white">
                            {powerState ? `${frequency * 2.4} V` : "0.0 V"}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleRotate("down")}
                            className="border-2 border-black dark:border-white p-2 font-black bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:translate-y-1 transition-all"
                        >
                            - STEP
                        </button>
                        <button
                            onClick={() => handleRotate("up")}
                            className="border-2 border-black dark:border-white p-2 font-black bg-white dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:translate-y-1 transition-all"
                        >
                            + STEP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}