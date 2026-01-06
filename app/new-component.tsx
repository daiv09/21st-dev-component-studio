"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const COLUMN_HEIGHT = 48; // Height of one number in pixels

// Individual Rolling Column
const NumberColumn = ({ digit }: { digit: number }) => {
  const y = useSpring(0, { stiffness: 100, damping: 20 });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      // Calculate how far to scroll: (digit * height) + (10 * height * random_loops)
      const targetY = -(digit * COLUMN_HEIGHT) - (10 * COLUMN_HEIGHT * 2);
      y.set(targetY);
    }
  }, [isInView, digit, y]);

  return (
    <div ref={ref} className="h-12 overflow-hidden w-8 relative">
      <motion.div style={{ y }} className="absolute top-0 left-0 flex flex-col items-center">
        {/* Render 3 sets of numbers to create the "loop" illusion */}
        {[...NUMBERS, ...NUMBERS, ...NUMBERS].map((num, i) => (
          <div key={i} className="h-12 text-4xl font-black flex items-center justify-center">
            {num}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const OdometerCard = () => {
  return (
    <div className="w-64 border-[3px] border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="uppercase font-bold tracking-widest text-gray-500 mb-2">Projects Completed</h3>
      <div className="flex items-center gap-1 border-b-[3px] border-black pb-2 w-max">
        <NumberColumn digit={1} />
        <NumberColumn digit={4} />
        <NumberColumn digit={2} />
        <span className="text-4xl font-black text-blue-400 ml-1">+</span>
      </div>
    </div>
  );
};