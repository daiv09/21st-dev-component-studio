"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";

export function VectorFingerprintScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const startScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setIsVerified(false);

    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <Fingerprint className="w-3.5 h-3.5 text-sky-400" />
        <span>
          {isScanning
            ? "SCANNING BIOMETRICS..."
            : isVerified
            ? "IDENTITY VERIFIED"
            : "TOUCH TO SCAN"}
        </span>
      </div>

      <div
        onClick={startScan}
        className="relative w-28 h-28 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center cursor-pointer overflow-hidden shadow-xl"
      >
        <svg className="w-16 h-16" viewBox="0 0 100 100">
          {/* Concentric Fingerprint Arcs */}
          {[12, 22, 32, 42].map((r, i) => (
            <path
              key={i}
              d={`M ${50 - r},50 A ${r},${r} 0 0,1 ${50 + r},50`}
              stroke={isVerified ? "#10b981" : "#0284c7"}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Sweeping Laser Line */}
        {isScanning && (
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute inset-x-0 h-1 bg-sky-400 shadow-[0_0_10px_#38bdf8]"
          />
        )}
      </div>
    </div>
  );
}
