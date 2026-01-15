"use client";

import * as React from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// --- Utility Helper ---
function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

// --- Types ---
export type ShelfItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc: string;
  href?: string;
  meta?: string;
};

interface ExpandableShelfProps {
  items: ShelfItem[];
  className?: string;
}

// --- Constants ---
const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 1,
};

// --- Main Component ---
export default function ExpandableShelf({ items, className }: ExpandableShelfProps) {
  const [hoveredId, setHoveredId] = React.useState<string | number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll logic: ensure expanded item is fully visible
  const scrollToItem = (itemId: string | number) => {
    if (!containerRef.current) return;
    const itemNode = document.getElementById(`shelf-item-${itemId}`);
    if (itemNode) {
      const container = containerRef.current;
      const itemRect = itemNode.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Check if item is cut off on left or right
      const isCutOffLeft = itemRect.left < containerRect.left;
      const isCutOffRight = itemRect.right > containerRect.right;

      if (isCutOffLeft || isCutOffRight) {
        itemNode.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col justify-center bg-neutral-950 text-white overflow-hidden",
        className
      )}
    >
      {/* Background Gradient Mesh (Optional Ambience) */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-900/20 blur-[100px]" />
      </div>

      {/* Scrollable Track */}
      {/* Note: We inject a style to hide scrollbars for a cleaner look */}
      <div
        ref={containerRef}
        className="relative z-10 flex h-full w-full items-center gap-2 overflow-x-auto px-8 py-12"
        style={{
          scrollBehavior: "smooth",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        <style jsx>{`
          /* Webkit (Chrome/Safari) scrollbar hide */
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {items.map((item) => (
          <ShelfCard
            key={item.id}
            item={item}
            isHovered={hoveredId === item.id}
            onHoverStart={() => {
              setHoveredId(item.id);
              // Small delay to prevent jitter if just passing through quickly
              setTimeout(() => scrollToItem(item.id), 100);
            }}
            onHoverEnd={() => setHoveredId(null)}
            anyHovered={hoveredId !== null}
          />
        ))}
      </div>

      {/* Decorative Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

// --- Sub-Component: Individual Card ---

function ShelfCard({
  item,
  isHovered,
  onHoverStart,
  onHoverEnd,
  anyHovered,
}: {
  item: ShelfItem;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  anyHovered: boolean;
}) {
  // Mouse position for local parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movement
  const mouseX = useSpring(x, SPRING_TRANSITION);
  const mouseY = useSpring(y, SPRING_TRANSITION);

  // Map mouse position to image offset (opposite direction for depth)
  const imageX = useTransform(mouseX, [-0.5, 0.5], ["-10%", "10%"]);
  const imageY = useTransform(mouseY, [-0.5, 0.5], ["-10%", "10%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized position (-0.5 to 0.5)
    const normalizedX = (e.clientX - rect.left) / width - 0.5;
    const normalizedY = (e.clientY - rect.top) / height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);
  };

  return (
    <motion.div
      id={`shelf-item-${item.id}`}
      layout
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative flex h-full shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/5 bg-neutral-900 shadow-xl transition-colors",
        // Dim items when something else is hovered
        anyHovered && !isHovered ? "opacity-50 grayscale-[50%]" : "opacity-100"
      )}
      initial={false}
      animate={{
        // Collapsed width vs Expanded width
        width: isHovered ? 440 : 100,
      }}
      transition={SPRING_TRANSITION}
    >
      {/* Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          src={item.imageSrc}
          alt={item.title}
          className="h-full w-full object-cover"
          style={{
            // Apply parallax only when hovered, otherwise center
            x: isHovered ? imageX : 0,
            y: isHovered ? imageY : 0,
            scale: isHovered ? 1.2 : 1.1, // Slight zoom always
            filter: anyHovered && !isHovered ? "blur(2px)" : "blur(0px)",
          }}
          transition={SPRING_TRANSITION}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        {/* Collapsed State: Vertical Text */}
        <AnimatePresence mode="popLayout">
          {!isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <h3
                className="whitespace-nowrap text-xl font-bold tracking-widest text-white/80"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                {item.title}
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded State: Full Details */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }} // Exit faster
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              <div>
                {item.meta && (
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    {item.meta}
                  </span>
                )}
                <h2 className="text-3xl font-bold leading-tight text-white">
                  {item.title}
                </h2>
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-300 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {item.href && (
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={item.href}
                    className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-neutral-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Project
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hover Highlight Border */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-white/0"
        animate={{
          borderColor: isHovered
            ? "rgba(255,255,255,0.2)"
            : "rgba(255,255,255,0)",
        }}
      />
    </motion.div>
  );
}