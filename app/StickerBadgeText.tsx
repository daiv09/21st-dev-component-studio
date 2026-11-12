"use client";
import { motion } from "framer-motion";

const stickers = [
  { text: "2 Cor 12:9", bg: "bg-[#f26430]", pos: "top-2 left-2 -rotate-6", rounded: "rounded-full" },
  { text: "🙏", bg: "bg-[#00d67f]", pos: "-top-3 right-6 rotate-12", rounded: "rounded-full" },
  { text: "Isaiah 40:29", bg: "bg-[#f7d002]", pos: "top-20 left-12 rotate-3", rounded: "rounded-2xl" },
  { text: "Matt 19:26", bg: "bg-[#f7a8b8]", pos: "top-24 right-4 -rotate-6", rounded: "rounded-full" },
  { text: "Phil 4:13", bg: "bg-[#4dd6c9]", pos: "bottom-4 left-4 rotate-6", rounded: "rounded-lg" },
  { text: "Exod 14:14", bg: "bg-[#c5a3ff]", pos: "bottom-1 right-8 -rotate-3", rounded: "rounded-b-full" },
];

export default function StickerBadgeText() {
  return (
    <div className="relative flex items-center justify-center p-12 bg-[#ebe9e4] rounded-2xl overflow-hidden select-none">
      <div className="relative flex flex-col items-center font-black text-5xl sm:text-6xl text-neutral-900 tracking-tight leading-[0.9] text-center">
        <span>Lord,</span>
        <span>I can&apos;t</span>
        <span>but you</span>
        <span>can</span>

        {/* Popping Stickers */}
        {stickers.map((s, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.15, 1], opacity: 1 }}
            transition={{
              delay: i * 0.25,
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3.5,
            }}
            whileHover={{ scale: 1.2, zIndex: 30 }}
            className={`absolute ${s.pos} ${s.bg} ${s.rounded} px-3 py-1.5 text-[11px] font-extrabold text-neutral-950 shadow-md cursor-pointer`}
          >
            {s.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

