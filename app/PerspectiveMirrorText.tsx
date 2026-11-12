"use client";
import { motion } from "framer-motion";

const layers = [0, 1, 2, 3];

export default function PerspectiveMirrorText() {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-black rounded-2xl overflow-hidden select-none">
      {/* Top Upright Stack */}
      <div className="flex flex-col items-center -space-y-4">
        {layers.map((i) => (
          <motion.span
            key={`top-${i}`}
            animate={{
              scaleY: [1 - i * 0.15, 1.05 - i * 0.15, 1 - i * 0.15],
              y: [0, -i * 2, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              transform: "perspective(300px) rotateX(28deg)",
              opacity: 1 - i * 0.18,
            }}
            className="block font-black text-4xl sm:text-5xl tracking-tighter bg-gradient-to-b from-white via-neutral-200 to-neutral-900 bg-clip-text text-transparent"
          >
            POSITIVE
          </motion.span>
        ))}
      </div>

      {/* Bottom Mirrored Stack */}
      <div className="flex flex-col items-center -space-y-4 mt-1">
        {[...layers].reverse().map((i) => (
          <motion.span
            key={`bot-${i}`}
            animate={{
              scaleY: [-(1 - i * 0.15), -(1.05 - i * 0.15), -(1 - i * 0.15)],
              y: [0, i * 2, 0],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              transform: "perspective(300px) rotateX(-28deg)",
              opacity: 0.85 - i * 0.18,
            }}
            className="block font-black text-4xl sm:text-5xl tracking-tighter bg-gradient-to-b from-white via-neutral-300 to-neutral-900 bg-clip-text text-transparent"
          >
            POSITIVE
          </motion.span>
        ))}
      </div>
    </div>
  );
}

