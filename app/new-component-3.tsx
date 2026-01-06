"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const CARDS = [
  { title: "Design", color: "bg-red-400", desc: "User Interface & Experience" },
  { title: "Develop", color: "bg-green-400", desc: "React, Next.js, Node" },
  { title: "Deploy", color: "bg-blue-400", desc: "AWS, Vercel, Docker" },
  { title: "Scale", color: "bg-yellow-400", desc: "Optimization & Growth" },
];

const Card = ({
  i,
  title,
  desc,
  color,
  progress,
  range,
  targetScale,
}: {
  i: number;
  title: string;
  desc: string;
  color: string;
  progress: MotionValue<number>;
  range: number[];
  targetScale: number;
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 25}px)`, // Stacking offset
        }}
        className={`flex flex-col relative w-[500px] h-[500px] rounded-none origin-top border-[4px] border-black ${color} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10`}
      >
        <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 text-center">
          {title}
        </h2>
        <div className="flex-1 bg-white border-[3px] border-black relative overflow-hidden flex items-center justify-center">
          <motion.div
            style={{ scale: imageScale }}
            className="w-full h-full bg-zinc-100 flex items-center justify-center"
          >
            {/* Pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(#000 2px, transparent 2px)",
                backgroundSize: "20px 20px",
              }}
            />
            <span className="text-2xl font-bold uppercase">{desc}</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export const StickyScrollStack = () => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={container} className="relative mt-[20vh] mb-[20vh]">
      {CARDS.map((card, i) => {
        const targetScale = 1 - (CARDS.length - i) * 0.05;
        return (
          <Card
            key={i}
            i={i}
            {...card}
            progress={scrollYProgress}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </div>
  );
};

