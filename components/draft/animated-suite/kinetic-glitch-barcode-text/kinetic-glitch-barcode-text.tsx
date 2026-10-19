"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ScanBarcode } from "lucide-react";

export function KineticGlitchBarcodeText() {
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3 select-none w-full max-w-[280px]">
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
        <ScanBarcode className="w-3.5 h-3.5 text-emerald-400" />
        <span>BARCODE LASER DECRYPT</span>
      </div>

      <div
        onClick={scan}
        className="relative w-full h-24 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden p-3"
      >
        {/* Top Barcode Strip */}
        <div className="flex items-center gap-1 h-6 w-full justify-center opacity-70">
          {[2, 4, 1, 3, 2, 5, 1, 4, 3, 2, 4, 1, 3].map((w, idx) => (
            <div
              key={idx}
              className="h-full bg-emerald-400"
              style={{ width: `${w * 2}px` }}
            />
          ))}
        </div>

        {/* Text */}
        <span className="font-mono text-sm font-black text-white tracking-widest mt-1">
          {scanning ? "DECRYPTING..." : "SERVO-99482"}
        </span>

        {/* Laser Sweep */}
        {scanning && (
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
            className="absolute inset-y-0 w-1 bg-rose-500 shadow-[0_0_10px_#f43f5e]"
          />
        )}
      </div>
      <span className="text-[10px] font-mono text-zinc-500">CLICK TO TRIGGER LASER SCAN</span>
    </div>
  );
}
