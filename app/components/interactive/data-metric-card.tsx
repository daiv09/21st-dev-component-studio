"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "motion/react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataMetricCardProps {
  title: string;
  value: string;
  trend: string;
  className?: string;
}

export function DataMetricCard({ title, value, trend, className }: DataMetricCardProps) {
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      controls.start((i) => ({
        height: Math.max(20, Math.random() * 100) + "%",
        transition: {
          duration: 0.5,
          ease: "easeOut",
          delay: i * 0.05,
        },
      }));
    } else {
      controls.start((i) => ({
        height: [null, "10%"],
        transition: {
          duration: 0.5,
          ease: "easeOut",
          delay: i * 0.05,
        },
      }));
    }
  }, [isHovered, controls]);

  // Generate 20 bars for the sparkline
  const bars = Array.from({ length: 20 });

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative h-48 w-full overflow-hidden rounded-2xl border bg-background p-6 shadow-sm",
        className
      )}
    >
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
            <TrendingUp className="size-3" />
            <span>{trend}</span>
          </div>
        </div>
        <div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-semibold tracking-tight"
          >
            {value}
          </motion.div>
        </div>
      </div>

      {/* Sparkline Background */}
      <div className="absolute bottom-0 left-0 right-0 flex h-24 items-end justify-between gap-1 px-4 opacity-20 dark:opacity-30">
        {bars.map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            animate={controls}
            initial={{ height: "10%" }}
            className="w-full rounded-t-sm bg-primary"
          />
        ))}
      </div>
      
      {/* Gradient fade for the bars */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent z-0 pointer-events-none" />
    </motion.div>
  );
}

export default function DataMetricDemo() {
  return (
    <div className="flex w-full min-h-96 items-center justify-center p-4 sm:p-8 bg-muted/20">
      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        <DataMetricCard 
          title="Total Revenue" 
          value="$128,450" 
          trend="+12.5%" 
        />
        <DataMetricCard 
          title="Active Users" 
          value="45.2k" 
          trend="+5.2%" 
        />
      </div>
    </div>
  );
}
