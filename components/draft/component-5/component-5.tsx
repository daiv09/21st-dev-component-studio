// Built using Hyperiux Vault (Vertical Cascade Edition)
"use client";

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

export default function VerticalCascade() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useTransform(useSpring(scrollYProgress, { stiffness: 80, damping: 25 }), [0.1, 0.85], [0, 1]);

  const positions = [
    { x: -35, y: -28 }, { x: -25, y: -10 }, { x: -15, y: 12 }, { x: -5, y: 30 },
    { x: 5, y: -22 }, { x: 15, y: -5 }, { x: 25, y: 15 }, { x: 35, y: 28 }
  ];

  return (
    <section ref={ref} className="relative w-full h-[300vh] bg-stone-100 dark:bg-black text-zinc-900 dark:text-zinc-100 select-none">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div className="absolute z-20 text-center" style={{ opacity: useTransform(progress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]) }}>
          <h2 className="text-4xl md:text-6xl font-light">Vertical <span className="opacity-40">Cascade</span></h2>
          <p className="text-xs tracking-[0.3em] uppercase opacity-50 mt-2">Sequential track flow</p>
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {positions.map((pos, i) => {
            const startY = -60 - i * 10;
            const x = useTransform(progress, [0, 1], [0, pos.x]);
            const y = useTransform(progress, [0, 1], [startY, pos.y]);
            const scale = useTransform(progress, [0, 1], [0.5, 0.85]);

            return (
              <motion.div
                key={i}
                className="absolute w-[16vw] h-[24vw] md:w-[13vw] md:h-[19vw] rounded-lg overflow-hidden shadow-xl"
                style={{ x, y, scale }}
              >
                <img src={`https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?q=80&w=800&auto=format&fit=crop`} alt="track" className="w-full h-full object-cover" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}