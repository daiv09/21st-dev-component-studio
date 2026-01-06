"use client";
import HyperTextParagraph from "./hypertext-with-decryption";
import { motion } from "framer-motion";

export default function ParaPage() {
  const bio =
    "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Beatae, rerum.";

  // Key words to trigger the effect
  const triggers = ["ipsum", "amet", "adipisicing", "rerum"];

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[120px]" />
        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full relative z-10"
      >
        {/* Header Pill */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-gray-200 shadow-sm px-4 py-1.5 rounded-full flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Interactive Bio
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-8 md:p-16">
          <HyperTextParagraph
            text={bio}
            highlightWords={triggers}
            className="text-2xl md:text-4xl text-gray-800 font-normal leading-[1.6]"
          />
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-gray-400 text-sm font-mono">
          Hover highlighted keywords to decrypt
        </p>
      </motion.div>
    </div>
  );
}
