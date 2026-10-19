"use client";
import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  useMotionValue,
  useInView,
} from "framer-motion";
import Image from "next/image";

// --- Types ---

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
}

// --- Mock Data ---
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Product Designer",
    company: "Linear",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces",
    quote:
      "The attention to detail in the UI is unmatched. It's rare to find a tool that balances aesthetic perfection with raw performance this well.",
    rating: 5,
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Frontend Lead",
    company: "Vercel",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces",
    quote:
      "Implementation was a breeze. The API response times are incredible, and our team's velocity has doubled since we integrated this workflow.",
    rating: 5,
  },
  {
    id: 3,
    name: "Emma Watson",
    role: "CTO",
    company: "Raycast",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces",
    quote:
      "Finally, a platform that understands the needs of modern engineering teams. The dark mode is simply gorgeous.",
    rating: 5,
  },
  {
    id: 4,
    name: "David Kim",
    role: "Indie Hacker",
    company: "Solo",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces",
    quote:
      "I was able to ship my MVP in under a week. The pre-built components are robust and the documentation is crystal clear.",
    rating: 5,
  },
  {
    id: 5,
    name: "Jessica Stark",
    role: "VP of Engineering",
    company: "Stripe",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    quote:
      "Scalability was our biggest concern, but this architecture handled our Black Friday traffic without a single hiccup.",
    rating: 5,
  },
  {
    id: 6,
    name: "Alex Morgan",
    role: "Full Stack Dev",
    company: "Supabase",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces",
    quote:
      "The developer experience is top-notch. Hot reloading works perfectly, and the TypeScript support is comprehensive.",
    rating: 5,
  },
];

// --- Floating Particles Component ---
const FloatingParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-blue-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// --- Star Rating Component ---
const StarRating = ({ rating, isOdd }: { rating: number; isOdd: boolean }) => (
  <div className="flex gap-0.5 mb-4">
    {[...Array(5)].map((_, i) => (
      <motion.svg
        key={i}
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          delay: i * 0.1,
          duration: 0.5,
          type: "spring",
          stiffness: 200,
        }}
        whileHover={{
          scale: 1.2,
          rotate: 360,
          transition: { duration: 0.3 },
        }}
        className={`w-5 h-5 cursor-pointer ${
          i < rating
            ? isOdd
              ? "text-yellow-300 fill-yellow-300"
              : "text-yellow-500 fill-yellow-500"
            : isOdd
            ? "text-blue-300/40"
            : "text-gray-300 dark:text-gray-700"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </motion.svg>
    ))}
  </div>
);

// --- Quote Icon Component ---
const QuoteIcon = ({ isOdd }: { isOdd: boolean }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0, rotate: -45 }}
    whileInView={{ opacity: 0.1, scale: 1, rotate: 0 }}
    transition={{ duration: 0.8, type: "spring" }}
    className={`absolute -top-4 -left-4 w-24 h-24 ${
      isOdd ? "text-white/10" : "text-blue-500/10"
    }`}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03s-.279.113-.66.299c-.394.187-.91.511-1.456.989-.545.477-1.116 1.169-1.515 1.931-.406.788-.677 1.708-.7 2.541C5.446 10.96 6 12 7.25 12S9 10.96 9 9.5 7.75 8 6.5 8c-.223 0-.437.034-.65.065C5.919 8.232 6 8.477 6 8.75s-.081.518-.15.685zM14.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197l-.485-2.033s-.279.113-.66.299c-.394.187-.91.511-1.456.989-.545.477-1.116 1.169-1.515 1.931-.406.788-.677 1.708-.7 2.541-.021 1.17.533 2.21 1.783 2.21S17 10.96 17 9.5 15.75 8 14.5 8c-.223 0-.437.034-.65.065.069-.232.15-.477.15-.75s-.081-.518-.15-.685z" />
  </motion.svg>
);

// --- Animated Border Component ---
const AnimatedBorder = ({ isOdd }: { isOdd: boolean }) => {
  return (
    <>
      <motion.div
        className={`absolute top-0 left-0 right-0 h-[2px] ${
          isOdd
            ? "bg-gradient-to-r from-transparent via-white to-transparent"
            : "bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        }`}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className={`absolute bottom-0 left-0 right-0 h-[2px] ${
          isOdd
            ? "bg-gradient-to-r from-transparent via-white to-transparent"
            : "bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        }`}
        animate={{
          x: ["100%", "-100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </>
  );
};

// --- The Spotlight Card Component ---

const SpotlightCard = ({
  children,
  id,
  index,
}: {
  children: React.ReactNode;
  index: number;
  id: number;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  const isOdd = id % 2 !== 0;

  // Scroll Animations
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Enhanced 3D Scroll Reveal Effect
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0.8]
  );
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.85, 1]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [25, 0]);
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.3],
    [index % 2 === 0 ? -15 : 15, 0]
  );
  const y = useTransform(scrollYProgress, [0, 0.3], [120, 0]);

  // Smooth springs
  const springConfig = { stiffness: 100, damping: 15, mass: 0.5 };
  const smoothScale = useSpring(scale, springConfig);
  const smoothY = useSpring(y, springConfig);
  const smoothRotateX = useSpring(rotateX, springConfig);
  const smoothRotateY = useSpring(rotateY, springConfig);

  // Mouse parallax effect
  const rotateXMouse = useTransform(mouseY, [0, 400], [5, -5]);
  const rotateYMouse = useTransform(mouseX, [0, 400], [-5, 5]);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      ref={cardRef}
      style={{
        opacity,
        scale: smoothScale,
        y: smoothY,
        rotateX: isHovered ? rotateXMouse : smoothRotateX,
        rotateY: isHovered ? rotateYMouse : smoothRotateY,
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className="group relative h-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ z: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Glow Ring */}
      <motion.div
        className="absolute -inset-1 rounded-[28px] opacity-0 group-hover:opacity-100 blur-xl"
        style={{
          background: isOdd
            ? "linear-gradient(45deg, rgba(255,255,255,0.3), rgba(147,197,253,0.5), rgba(255,255,255,0.3))"
            : "linear-gradient(45deg, rgba(59,130,246,0.4), rgba(96,165,250,0.4), rgba(59,130,246,0.4))",
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-4xl opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              700px circle at ${mouseX}px ${mouseY}px,
              ${
                isOdd ? "rgba(255, 255, 255, 0.15)" : "rgba(59, 130, 246, 0.12)"
              },
              transparent 70%
            )
          `,
        }}
      />

      {/* Shimmer Border Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-500 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              ${isOdd ? "rgba(255, 255, 255, 0.4)" : "rgba(59, 130, 246, 0.5)"},
              transparent 30%
            )
          `,
        }}
      />

      {/* Main Card Content */}
      <motion.div
        className={`relative h-full flex flex-col justify-between rounded-3xl border-2 p-8 shadow-xl transition-all duration-500 overflow-hidden backdrop-blur-sm ${
          isOdd
            ? "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 border-blue-400/30 shadow-blue-500/20"
            : "bg-white dark:bg-gray-950/90 border-gray-200 dark:border-gray-800 shadow-gray-900/10"
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: "translateZ(20px)",
        }}
        whileHover={{
          boxShadow: isOdd
            ? "0 25px 50px -12px rgba(59, 130, 246, 0.3)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Animated Gradient Overlay */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
            isOdd
              ? "bg-gradient-to-br from-blue-400/20 via-transparent to-cyan-600/20"
              : "bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/10"
          }`}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Grid Pattern */}
        <div
          className={`absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none ${
            isOdd ? "opacity-[0.06]" : ""
          }`}
          style={{
            backgroundImage: `linear-gradient(${
              isOdd ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
            } 1px, transparent 1px), linear-gradient(90deg, ${
              isOdd ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
            } 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Noise Texture */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            isOdd ? "opacity-[0.08]" : "opacity-[0.03]"
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Animated Border Lines */}
        <AnimatedBorder isOdd={isOdd} />

        {/* Corner Accents */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 0.6, scale: 1 } : {}}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 ${
            isOdd ? "border-white/40" : "border-blue-500/40"
          }`}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 0.6, scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
          className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 ${
            isOdd ? "border-white/40" : "border-blue-500/40"
          }`}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 0.6, scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
          className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 ${
            isOdd ? "border-white/40" : "border-blue-500/40"
          }`}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 0.6, scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
          className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 ${
            isOdd ? "border-white/40" : "border-blue-500/40"
          }`}
        />

        {children}
      </motion.div>
    </motion.div>
  );
};

// --- Stats Counter Component ---
const StatsCounter = () => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setCount((prev) => {
          if (prev >= 1000) {
            clearInterval(interval);
            return 1000;
          }
          return prev + 25;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isInView]);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center gap-12 mb-16 flex-wrap"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="text-center"
      >
        <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
          {count}+
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Happy Developers
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="text-5xl font-bold bg-clip-text text-transparent bg-blue-500">
          99.9%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Uptime
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="text-5xl font-bold bg-clip-text text-transparent bg-blue-600">
          4.9★
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Average Rating
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Section ---

export default function DynamicTestimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Background Logic
  const { scrollYProgress } = useScroll({ target: containerRef });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const yBg2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full bg-gradient-to-b from-gray-50 via-blue-50/30 to-blue-50/20 dark:from-[#0a0a0a] dark:via-blue-950/10 dark:to-blue-950/10 py-32 overflow-hidden selection:bg-blue-500/30"
    >
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Animated Ambient Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          style={{ y: yBg, rotate }}
          className="absolute top-[-30%] left-[-15%] w-175 h-175 rounded-full bg-blue-500/80  blur-[140px] mix-blend-screen"
        />
        <motion.div
          style={{ y: yBg2, rotate: useTransform(rotate, (r) => -r) }}
          className="absolute bottom-[-30%] right-[-15%] w-150 h-150 rounded-full bg-blue-500/80 to-blue-500/20 blur-[120px] mix-blend-screen"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]) }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full bg-blue-500/80 blur-[100px] mix-blend-screen"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm"
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-blue-500"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            Social Proof
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-black bg-clip-text text-transparent bg-linear-to-b from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-300 dark:to-gray-500 tracking-tighter mb-8 leading-tight whitespace-nowrap"
          >
            Trusted by the{" "}
            <span className="bg-clip-text text-transparent bg-blue-600">
              best.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
          >
            Thousands of developers and teams use our platform to build the
            future.{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              Here&apos;s what they have to say.
            </span>
          </motion.p>
        </div>

        {/* Stats Counter */}
        <StatsCounter />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((t, i) => {
            const isOdd = t.id % 2 !== 0;

            return (
              <SpotlightCard key={t.id} index={i} id={t.id}>
                <div className="relative z-10 h-full flex flex-col">
                  {/* Quote Icon Background */}
                  <QuoteIcon isOdd={isOdd} />

                  <div className="flex items-center justify-between mb-6">
                    <StarRating rating={t.rating} isOdd={isOdd} />
                  </div>

                  <blockquote className="flex-grow mb-8 relative">
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className={`text-lg md:text-xl leading-relaxed font-medium ${
                        isOdd
                          ? "text-white"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      &quot;{t.quote}&quot;
                    </motion.p>
                  </blockquote>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className={`flex items-center gap-4 pt-6 border-t-2 ${
                      isOdd
                        ? "border-white/20"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="relative"
                    >
                      <motion.div
                        className={`absolute inset-0 rounded-full blur-md ${
                          isOdd ? "bg-white/40" : "bg-blue-500/40"
                        }`}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        className={`relative w-14 h-14 rounded-full object-cover border-3 ring-2 ${
                          isOdd
                            ? "border-white/40 ring-white/20"
                            : "border-blue-500/30 ring-blue-500/10"
                        }`}
                        width={56}
                        height={56}
                      />
                    </motion.div>
                    <div className="flex-1">
                      <motion.h4
                        whileHover={{ x: 5 }}
                        className={`text-base md:text-lg font-bold transition-colors ${
                          isOdd
                            ? "text-white"
                            : "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }`}
                      >
                        {t.name}
                      </motion.h4>
                      <p
                        className={`text-sm md:text-base ${
                          isOdd
                            ? "text-blue-100"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {t.role}
                      </p>
                      <motion.p
                        className={`text-xs font-semibold mt-0.5 ${
                          isOdd ? "text-white/80" : "text-blue-600"
                        }`}
                      >
                        @ {t.company}
                      </motion.p>
                    </div>
                  </motion.div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
