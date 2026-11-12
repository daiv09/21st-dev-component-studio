"use client";
import { motion } from "framer-motion";

const angles = [-50, -25, 0, 25, 50];

export default function CylinderTextRoll() {
  return (
    <div className="flex items-center justify-center p-10 bg-black rounded-2xl overflow-hidden select-none">
      <div
        style={{ perspective: "500px" }}
        className="flex flex-col items-center -space-y-3"
      >
        {angles.map((angle, idx) => (
          <motion.span
            key={idx}
            animate={{
              rotateX: [angle, angle + 15, angle],
              opacity: [1 - Math.abs(angle) / 70, 1 - Math.abs(angle + 15) / 70, 1 - Math.abs(angle) / 70],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="block font-black text-4xl sm:text-5xl tracking-tight text-white uppercase"
          >
            MOMENTUM
          </motion.span>
        ))}
      </div>
    </div>
  );
}

