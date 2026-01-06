"use client";
import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionValue,
  useSpring,
} from "framer-motion";
import { Github, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

// --- Updated Type Definition ---
interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  tags: string[];
  links: {
    repo?: string;
    demo?: string;
  };
  color: string;
  imageUrl?: string;
}

// --- Updated Projects Data ---
const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Cripto Analytics",
    category: "Real-Time Dashboard",
    description:
      "Cryptocurrency real-time data analytics dashboard with live price tracking, charts, and market insights.",
    tags: ["Next.js", "Vercel", "Charts", "Real-time", "CoinGecko API"],
    links: { demo: "https://cripto-analytics.vercel.app/" },
    color: "#000000",
    imageUrl: "https://api.pikwy.com/web/69526024b8971f514c776d4a.jpg",
  },
  {
    id: 2,
    title: "Portfolio",
    category: "Personal Showcase",
    description:
      "Interactive 3D resume portfolio and professional showcase highlighting technical skills and projects.",
    tags: ["Next.js", "TypeScript", "Framer Motion", "Vercel"],
    links: { demo: "https://daiwiik-harihar.vercel.app" },
    color: "#000000",
    imageUrl: "https://api.pikwy.com/web/6952647f4a9fed59c772a056.jpg",
  },
  {
    id: 3,
    title: "Paiwand Studio",
    category: "Professional Work",
    description:
      "Production e-commerce site for repurposed textiles. Optimized checkout flows and SEO strategies drove measurable sales growth.",
    tags: ["Shopify", "Sales", "SEO", "Analytics", "UI/UX"],
    links: { demo: "https://paiwandstudio.com" },
    color: "#000000",
  },
  {
    id: 4,
    title: "Sound Headphones",
    category: "Portfolio Showcase",
    description:
      "Modern headphones portfolio showcase site with smooth animations and product presentations.",
    tags: ["Next.js", "Vercel", "Animations", "Framer Motion"],
    links: { demo: "https://sound-headphone.vercel.app/" },
    color: "#000000",
  },
];

// --- Animation Variants ---
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for "sleek" feel
      staggerChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const buttonHover = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

// --- Sub-Component: Individual Card ---
const Card = ({
  i,
  project,
  progress,
  range,
  targetScale,
}: {
  i: number;
  project: Project;
  progress: MotionValue<number>;
  range: number[];
  targetScale: number;
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start end", "start start"],
  });

  // UseSpring creates a smoother, less linear parallax effect
  const smoothScrollY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
  });

  const imageScale = useTransform(smoothScrollY, [0, 1], [1.2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0 perspective-1000"
    >
      <motion.div
        style={{
          scale,
          backgroundColor: project.color,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className="flex flex-col relative w-[90vw] md:w-250 h-[70vh] md:h-150 rounded-none border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] origin-top overflow-hidden"
      >
        {/* Card Header (Browser Style) */}
        <div className="h-12 border-b-4 border-black bg-white flex items-center px-4 justify-between select-none">
          <div className="flex gap-2">
            {["bg-red-400", "bg-yellow-400", "bg-green-400"].map(
              (color, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  className={`w-3 h-3 rounded-full border-2 border-black ${color}`}
                />
              )
            )}
          </div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest opacity-50">
            PROJECT_0{project.id}.EXE
          </span>
        </div>

        {/* Card Body */}
        <div className="flex flex-col md:flex-row h-full bg-white">
          {/* Left: Content */}
          <motion.div
            className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between relative z-10"
            variants={contentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <div>
              <motion.span
                variants={childVariants}
                className="inline-block px-3 py-1 mb-4 text-xs font-black uppercase border-2 border-black bg-black text-white"
              >
                {project.category}
              </motion.span>

              <motion.h2
                variants={childVariants}
                className="text-4xl md:text-5xl font-black uppercase leading-[0.9] mb-6 tracking-tighter"
              >
                {project.title}
              </motion.h2>

              <motion.p
                variants={childVariants}
                className="text-base md:text-lg font-medium leading-relaxed opacity-90 border-l-[3px] border-black pl-4 mb-8"
              >
                {project.description}
              </motion.p>

              <motion.div
                variants={childVariants}
                className="flex flex-wrap gap-2 mb-8"
              >
                {project.tags.map((tag, idx) => (
                  <motion.span
                    key={idx}
                    whileHover={{ y: -3, scale: 1.05 }}
                    className="px-2 py-1 text-xs font-bold border-2 border-black bg-black text-white uppercase cursor-default"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <motion.div variants={childVariants} className="flex gap-4">
              {project.links.repo && (
                <motion.a
                  href={project.links.repo}
                  target="_blank"
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black border-2 border-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:bg-black hover:text-white transition-colors"
                >
                  <Github size={18} /> Code
                </motion.a>
              )}
              {project.links.demo && (
                <motion.a
                  href={project.links.demo}
                  target="_blank"
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white border-2 border-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:bg-white hover:text-black transition-colors"
                >
                  Live Demo <ExternalLink size={18} />
                </motion.a>
              )}
            </motion.div>
          </motion.div>

          {/* Right: Visual/Image Area - Updated Logic */}

          <div className="w-full md:w-1/2 border-t-4 md:border-t-0 md:border-l-4 border-black relative overflow-hidden group">
            <motion.div
              style={{ scale: imageScale }}
              className="w-full h-full bg-gray-200 relative"
            >
              {/* Project Image ONLY - if imageUrl exists (NO pattern overlay) */}

              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt={`${project.title} preview`}
                  className="

          absolute inset-0

          w-full h-full

          object-cover

          rounded-none

          border-0

          shadow-none

          transition-transform duration-500

        "
                />
              )}

              {/* Pattern Overlay ONLY - if NO imageUrl */}

              {!project.imageUrl && (
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(#000 2px, transparent 2px)",

                    backgroundSize: "20px 20px",
                  }}
                />
              )}
            </motion.div>

            {/* View Project Overlay Button */}

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px] cursor-pointer">
              <Link href={`${project.links.demo}`} className="text-center">
                <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-bold uppercase transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300 hover:scale-105">
                  View Case Study <ArrowRight size={18} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Scroll Container ---
export default function StackedProjectGallery() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={container} className="relative bg-[#f0f0f0]">
      {/* Intro Section */}
      <div className="h-[30vh] flex items-center justify-center sticky top-0 z-0">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-center opacity-10"
        >
          Selected Works
        </motion.h2>
      </div>

      {/* Projects Stack */}
      <div className="relative z-10 pb-[20vh]">
        {PROJECTS.map((project, i) => {
          const targetScale = 1 - (PROJECTS.length - i) * 0.05;
          return (
            <Card
              key={project.id}
              i={i}
              project={project}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>

      {/* Outro */}
      <div className="h-[20vh] bg-black text-white flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="font-mono text-sm"
        >
          END_OF_STREAM
        </motion.p>
      </div>
    </div>
  );
}
