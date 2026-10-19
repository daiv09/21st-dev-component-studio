"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarUrl: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Jenkins",
    role: "Product Lead",
    company: "TechNova",
    content: "This tool has completely revolutionized how our design team collaborates with engineering. The handoff process is now seamless, and we're shipping features 30% faster.",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    id: "2",
    name: "Marcus Aurelius",
    role: "Engineering Manager",
    company: "Stoa Labs",
    content: "I was skeptical at first, but the integration was flawless. The performance gains we've seen on our core platform metrics have exceeded all expectations.",
    avatarUrl: "https://i.pravatar.cc/150?u=marcus",
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    role: "CEO",
    company: "Innovate AI",
    content: "Customer satisfaction scores have skyrocketed since we implemented this solution. It's rare to find software that actually delivers on its bold promises.",
    avatarUrl: "https://i.pravatar.cc/150?u=elena",
  },
];

export function estimonialCarouselCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + testimonials.length) % testimonials.length);
  }, []);

  // Auto-play interval effect
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      paginate(1);
    }, 2000);

    return () => clearInterval(timer);
  }, [isHovered, paginate]);

  const activeTestimonial = testimonials[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-2xl overflow-hidden rounded-3xl border bg-background/80 backdrop-blur-xl p-8 sm:p-12 shadow-2xl shadow-primary/5 select-none"
    >
      {/* Animated Ambient Background Glow */}
      <motion.div
        animate={{
          x: currentIndex === 0 ? "-20%" : currentIndex === 1 ? "0%" : "20%",
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
        className="absolute -top-24 -left-24 size-72 rounded-full bg-gradient-to-br from-primary/30 via-indigo-500/20 to-transparent blur-3xl pointer-events-none"
      />

      {/* Background Giant Quote Icon */}
      <motion.div
        key={`quote-${currentIndex}`}
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-8 right-8 text-primary/10 pointer-events-none"
      >
        <Quote className="size-24" />
      </motion.div>

      <div className="relative z-10 flex min-h-[220px] flex-col justify-between">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? 60 : -60,
                opacity: 0,
                filter: "blur(8px)",
              }),
              center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  x: { type: "spring", stiffness: 350, damping: 28 },
                  opacity: { duration: 0.3 },
                  filter: { duration: 0.3 },
                  staggerChildren: 0.1,
                  delayChildren: 0.05,
                },
              },
              exit: (dir: number) => ({
                zIndex: 0,
                x: dir < 0 ? 60 : -60,
                opacity: 0,
                filter: "blur(8px)",
                transition: {
                  x: { type: "spring", stiffness: 350, damping: 28 },
                  opacity: { duration: 0.2 },
                  filter: { duration: 0.2 },
                },
              }),
            }}
            className="flex flex-col gap-8"
          >
            {/* Content Text Stagger Item */}
            <motion.p
              variants={{
                enter: { opacity: 0, y: 15 },
                center: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
              }}
              className="text-xl sm:text-2xl leading-relaxed text-foreground font-medium tracking-tight"
            >
              "{activeTestimonial.content}"
            </motion.p>

            {/* Author Section Stagger Item */}
            <motion.div
              variants={{
                enter: { opacity: 0, y: 15 },
                center: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
              }}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <motion.img
                  whileHover={{ scale: 1.08 }}
                  src={activeTestimonial.avatarUrl}
                  alt={activeTestimonial.name}
                  className="size-14 rounded-full border-2 border-primary/20 bg-muted object-cover shadow-md"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
                >
                  <Sparkles className="size-3" />
                </motion.div>
              </div>

              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-lg">{activeTestimonial.name}</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <span className="text-foreground/80 font-medium">{activeTestimonial.role}</span>
                  <span>at</span>
                  <span className="text-primary font-medium">{activeTestimonial.company}</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
        {/* Interactive Indicator Pills */}
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "h-2.5 rounded-full transition-colors duration-300",
                idx === currentIndex ? "w-8 bg-primary shadow-sm shadow-primary/50" : "w-2.5 bg-primary/20 hover:bg-primary/40"
              )}
            />
          ))}
        </div>

        {/* Navigation Buttons with Micro-interactions */}
        <div className="flex gap-2.5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => paginate(-1)}
            className="flex size-11 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => paginate(1)}
            className="flex size-11 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-sm"
          >
            <ChevronRight className="size-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCarouselCard;