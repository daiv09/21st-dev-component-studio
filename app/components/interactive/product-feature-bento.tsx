"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LineChart, Zap, Shield, Globe, Cpu, Cloud } from "lucide-react";

interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  className: string;
}

const bentoItems: BentoItem[] = [
  {
    id: "1",
    title: "Global Edge Network",
    description: "Deploy your applications closer to your users for ultra-low latency.",
    icon: Globe,
    className: "md:col-span-2 md:row-span-2 bg-blue-500/10 text-blue-500",
  },
  {
    id: "2",
    title: "Instant Analytics",
    description: "Real-time insights into your application's performance.",
    icon: LineChart,
    className: "md:col-span-1 md:row-span-1 bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "3",
    title: "Lightning Fast",
    description: "Built for speed from the ground up.",
    icon: Zap,
    className: "md:col-span-1 md:row-span-1 bg-amber-500/10 text-amber-500",
  },
  {
    id: "4",
    title: "Enterprise Security",
    description: "Bank-grade encryption by default.",
    icon: Shield,
    className: "md:col-span-1 md:row-span-1 bg-purple-500/10 text-purple-500",
  },
  {
    id: "5",
    title: "Cloud Native",
    description: "Seamlessly scales with your infrastructure needs.",
    icon: Cloud,
    className: "md:col-span-1 md:row-span-1 bg-cyan-500/10 text-cyan-500",
  },
];

export function ProductFeatureBento() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-3 p-4">
      {bentoItems.map((item) => {
        const Icon = item.icon;
        const isHovered = hoveredId === item.id;
        const isOtherHovered = hoveredId !== null && hoveredId !== item.id;

        return (
          <motion.div
            key={item.id}
            onHoverStart={() => setHoveredId(item.id)}
            onHoverEnd={() => setHoveredId(null)}
            animate={{
              opacity: isOtherHovered ? 0.4 : 1,
              scale: isHovered ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-background p-6 shadow-sm transition-all",
              item.className
            )}
          >
            <div className="mb-4">
              <div className="mb-4 inline-flex rounded-xl bg-background/50 p-3 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>

            <motion.div
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0,
                y: isHovered ? 0 : 10,
              }}
              className="absolute bottom-6 right-6 text-foreground"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-background shadow-md">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4">
                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function BentoDemo() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-muted/20 py-12">
      <ProductFeatureBento />
    </div>
  );
}
