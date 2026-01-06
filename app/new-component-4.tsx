"use client";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from "framer-motion";
import { wrap } from "@motionone/utils"; // npm install @motionone/utils

interface ParallaxProps {
  children: string;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  // Map scroll speed to direction and acceleration
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  // Magic calculation to handle the infinite loop
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // If scrolling up, reverse direction
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap py-4 border-y-[3px] border-black bg-green-400">
      <motion.div className="flex whitespace-nowrap flex-nowrap" style={{ x }}>
        <span className="block text-6xl font-black uppercase mr-8 tracking-tighter">
          {children}
        </span>
        <span className="block text-6xl font-black uppercase mr-8 tracking-tighter">
          {children}
        </span>
        <span className="block text-6xl font-black uppercase mr-8 tracking-tighter">
          {children}
        </span>
        <span className="block text-6xl font-black uppercase mr-8 tracking-tighter">
          {children}
        </span>
      </motion.div>
    </div>
  );
}

// Usage Example
export const VelocityScrollSection = () => {
  return (
    <div className="py-12 bg-white">
      <ParallaxText baseVelocity={-2}>Full Stack Developer •</ParallaxText>
      <div className="h-4" />
      <ParallaxText baseVelocity={2}>React • Next.js • Node •</ParallaxText>
    </div>
  );
};
