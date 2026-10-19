"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Settings, Shield, Zap } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
}

export function FeatureRevealCard({ title, description, icon: Icon, className }: FeatureCardProps) {
  return (
    <motion.div
      whileHover="hover"
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-background p-8",
        className
      )}
    >
      <div className="relative z-10">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <h3 className="mb-2 text-xl font-medium tracking-tight text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <motion.div
        variants={{
          hover: { scale: 1, opacity: 1 },
          initial: { scale: 0.8, opacity: 0 }
        }}
        initial="initial"
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute -bottom-24 -right-24 z-0 size-64 rounded-full bg-primary/10 blur-3xl"
      />
      <motion.div
        variants={{
          hover: { scale: 1, opacity: 1 },
          initial: { scale: 0.5, opacity: 0 }
        }}
        initial="initial"
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="absolute -top-24 -left-24 z-0 size-48 rounded-full bg-primary/5 blur-3xl"
      />
    </motion.div>
  );
}

export default function FeatureRevealDemo() {
  return (
    <div className="flex w-full min-h-96 items-center justify-center p-4 sm:p-8 bg-muted/20">
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 max-w-5xl">
        <FeatureRevealCard 
          title="Lightning Fast" 
          description="Built on cutting-edge edge infrastructure to deliver your content blazingly fast." 
          icon={Zap} 
        />
        <FeatureRevealCard 
          title="Bank-grade Security" 
          description="Your data is encrypted at rest and in transit with enterprise-grade security." 
          icon={Shield} 
        />
        <FeatureRevealCard 
          title="Highly Customizable" 
          description="Tweak every aspect of the platform to match your specific workflow needs." 
          icon={Settings} 
        />
      </div>
    </div>
  );
}
