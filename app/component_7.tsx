// Built using Hyperiux Vault (Dynamic Focus Edition)
"use client";

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

export default function DynamicFocus() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useTransform(useSpring(scrollYProgress, { stiffness: 90, damping: 30 }), [0.1, 0.85], [0, 1]);

  const targets = [
    { x: -32, y: -30, r: -6 }, { x: 30, y: -26, r: 8 },
    { x: -38, y: 4, r: -2 }, { x: 6, y: -32, r: 4 },
    { x: 36, y: 10, r: -4 }, { x: -24, y: 32, r: 6 },
    { x: 2, y: 34, r: -3 }, { x: 28, y: 32, r: 5 }
  ];

  return (
    <section ref={ref} className="relative w-full h-[320vh] bg-neutral-900 text-white select-none">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div className="absolute z-20 text-center" style={{ opacity: useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]) }}>
          <h2 className="text-4xl md:text-6xl font-light">Dynamic <span className="opacity-40">Focus</span></h2>
          <p className="text-xs uppercase tracking-[0.25em] opacity-50 mt-2">Unified core to asymmetric scatter</p>
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {targets.map((t, i) => {
            const x = useTransform(progress, [0, 1], [0, t.x]);
            const y = useTransform(progress, [0, 1], [0, t.y]);
            const rotate = useTransform(progress, [0, 1], [0, t.r]);

            return (
              <motion.div
                key={i}
                className="absolute w-[16vw] h-[23vw] md:w-[13vw] md:h-[19vw] rounded-xl overflow-hidden shadow-2xl"
                style={{ x, y, rotate, scale: useTransform(progress, [0, 1], [0.75, 0.85]) }}
              >
                <img src={`https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800&auto=format&fit=crop`} alt="track" className="w-full h-full object-cover" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}