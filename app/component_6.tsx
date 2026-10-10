// Built using Hyperiux Vault (Helix Twist Edition)
"use client";

import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

export default function HelixTwist() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useTransform(useSpring(scrollYProgress, { stiffness: 95, damping: 28 }), [0.1, 0.88], [0, 1]);

  return (
    <section ref={ref} className="relative w-full h-[350vh] bg-zinc-950 text-white select-none">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden perspective-[1200px]">
        <motion.div className="absolute z-20 text-center" style={{ opacity: useTransform(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]) }}>
          <h2 className="text-4xl md:text-6xl font-extralight tracking-tight">Helix <span className="text-cyan-400">Twist</span></h2>
          <p className="text-xs uppercase tracking-[0.25em] opacity-50 mt-2">Spatial 3D rotation matrix</p>
        </motion.div>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {[...Array(8)].map((_, i) => {
            const destX = (i - 3.5) * 11;
            const destY = (i % 2 === 0 ? -1 : 1) * 18;
            const x = useTransform(progress, [0, 1], [0, destX]);
            const y = useTransform(progress, [0, 1], [0, destY]);
            const rotateZ = useTransform(progress, [0, 1], [(i - 4) * 25, (i % 2 === 0 ? -4 : 4)]);

            return (
              <motion.div
                key={i}
                className="absolute w-[15vw] h-[22vw] md:w-[12vw] md:h-[18vw] rounded-xl overflow-hidden shadow-2xl border border-white/10"
                style={{ x, y, rotateZ, scale: useTransform(progress, [0, 1], [0.6, 0.8]) }}
              >
                <img src={`https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?q=80&w=800&auto=format&fit=crop`} alt="track" className="w-full h-full object-cover" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}