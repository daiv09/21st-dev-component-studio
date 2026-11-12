"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const words = [
  { main: "MAKE", tape: "SOLVE PROBLEMS", tapePos: "-top-1 -left-6 rotate-[10deg]" },
  { main: "THINGS", tape: "INSPIRE PEOPLE", tapePos: "top-3 -right-8 -rotate-[18deg]" },
  { main: "THAT", tape: "THINK DEEPLY", tapePos: "top-1 -left-10 rotate-[24deg]" },
  { main: "MATTERS", tape: "CREATE BOLDLY", tapePos: "top-2 right-0 -rotate-[20deg]" },
];

export default function CautionTapeText() {
  const [animationKey, setAnimationKey] = useState(0);

  const handleReplay = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      key={animationKey}
      onClick={handleReplay}
      className="flex flex-col items-center justify-center p-12 bg-neutral-950 rounded-2xl overflow-hidden select-none cursor-pointer group relative shadow-2xl border border-neutral-800"
      title="Click anywhere to replay animation"
    >
      <div className="flex flex-col items-center space-y-1">
        {words.map((item, idx) => (
          <div key={idx} className="relative inline-block">
            <span className="block font-black text-5xl sm:text-6xl tracking-tighter text-white leading-[0.88]">
              {item.main}
            </span>
            <motion.span
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: idx * 0.25 + 0.2,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ originX: 0 }}
              className={`absolute ${item.tapePos} bg-[#f5d90a] text-neutral-950 font-extrabold text-[10px] sm:text-xs tracking-wider px-2.5 py-0.5 shadow-lg uppercase whitespace-nowrap z-10`}
            >
              {item.tape}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Subtle Replay Hint */}
      <span className="absolute bottom-3 text-[10px] font-medium tracking-widest uppercase text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to replay ⟳
      </span>
    </div>
  );
}