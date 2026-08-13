"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
  accent?: "red" | "blue" | "green";
}

const ITEMS: AccordionItem[] = [
  {
    id: "overview",
    title: "Project Overview",
    content:
      "This project is a collection of brutalist-inspired UI components built with Next.js, Framer Motion, and Tailwind CSS, focusing on motion and personality.",
    accent: "red",
  },
  {
    id: "tech",
    title: "Tech Stack",
    content:
      "Powered by Next.js, React, Framer Motion, Tailwind CSS, and Lucide icons. Designed for modern front-end portfolios and landing pages.",
    accent: "blue",
  },
  {
    id: "performance",
    title: "Performance & DX",
    content:
      "Optimized with server-side rendering, code-splitting, and motion primitives for smooth, interruptible animations and a great developer experience.",
    accent: "green",
  },
];

const accentClasses: Record<
  NonNullable<AccordionItem["accent"]>,
  { hover: string; bar: string }
> = {
  red: {
    hover: "hover:bg-red-200",
    bar: "bg-red-300",
  },
  blue: {
    hover: "hover:bg-blue-200",
    bar: "bg-blue-300",
  },
  green: {
    hover: "hover:bg-green-200",
    bar: "bg-green-300",
  },
};

interface ItemProps {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const BrutalistAccordionItem: React.FC<ItemProps> = ({
  item,
  isOpen,
  onToggle,
  isFirst,
  isLast,
}) => {
  const accent = item.accent ?? "red";
  const colors = accentClasses[accent];

  return (
    <div
      className={["border-b-[3px] border-black", isFirst && "border-t-[3px]"]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        onClick={onToggle}
        className={[
          "w-full flex items-center justify-between px-4 py-4 bg-zinc-50",
          colors.hover,
          "transition-colors duration-200",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2 h-8 ${colors.bar} border-[3px] border-black`} />
          <span className="font-black uppercase text-base md:text-lg tracking-tight text-black">
            {item.title}
          </span>
        </div>

        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex items-center justify-center w-8 h-8 border-[2px] border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus size={20} strokeWidth={3} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="overflow-hidden bg-white"
          >
            <div className="px-4 md:px-6 py-4 md:py-5">
              <p className="font-medium text-sm md:text-base leading-relaxed text-zinc-800">
                {item.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar on last item for extra brutalist touch */}
      {isLast && (
        <div className="h-3 bg-black flex items-center gap-1 px-3">
          <span className="w-2 h-2 bg-red-300" />
          <span className="w-2 h-2 bg-blue-300" />
          <span className="w-2 h-2 bg-green-300" />
        </div>
      )}
    </div>
  );
};

export const BrutalistAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(ITEMS[0].id);

  return (
    <div className="w-full flex justify-center py-10">
      <div className="w-full max-w-xl bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header strip */}
        <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black bg-zinc-900 text-white">
          <span className="font-mono text-xs uppercase tracking-[0.2em]">
            Project Panel
          </span>
          <span className="text-[10px] font-mono bg-white text-black px-2 py-0.5 border-[2px] border-black">
            v1.0.0
          </span>
        </div>

        {ITEMS.map((item, index) => (
          <BrutalistAccordionItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() =>
              setOpenId((prev) => (prev === item.id ? null : item.id))
            }
            isFirst={index === 0}
            isLast={index === ITEMS.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
