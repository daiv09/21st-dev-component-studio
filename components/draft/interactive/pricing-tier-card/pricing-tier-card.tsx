"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/draft/ui/button/button";

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTierProps {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isYearly: boolean;
  features: PricingFeature[];
  popular?: boolean;
}

export function PricingTierCard({
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  isYearly,
  features,
  popular,
}: PricingTierProps) {
  const price = isYearly ? yearlyPrice : monthlyPrice;

  return (
    <motion.div
      layout
      className={cn(
        "relative flex w-full max-w-sm flex-col overflow-hidden rounded-3xl border bg-background p-8",
        popular ? "border-primary shadow-lg" : "border-border shadow-sm"
      )}
    >
      {popular && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Most Popular
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6 flex items-baseline gap-1 text-foreground">
        <span className="text-4xl font-bold tracking-tight">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={price}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="inline-block"
            >
              ${price}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-sm font-medium text-muted-foreground">/mo</span>
      </div>

      <ul className="mb-8 flex flex-1 flex-col gap-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full",
                feature.included
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Check className="size-3" />
            </div>
            <span
              className={cn(
                "text-sm",
                feature.included ? "text-foreground" : "text-muted-foreground line-through"
              )}
            >
              {feature.name}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={popular ? "default" : "outline"}
        className="w-full rounded-full"
      >
        Get Started
      </Button>
    </motion.div>
  );
}

export default function PricingDemo() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="flex w-full flex-col items-center justify-center p-4 py-12 sm:p-8 bg-muted/20 min-h-[600px]">
      <div className="mb-12 flex items-center justify-center gap-3">
        <span className={cn("text-sm font-medium", !isYearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative flex h-8 w-16 cursor-pointer items-center rounded-full bg-primary/20 p-1 transition-colors"
        >
          <motion.div
            layout
            className="size-6 rounded-full bg-primary shadow-sm"
            style={{
              marginLeft: isYearly ? "auto" : "0",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={cn("text-sm font-medium flex items-center gap-1.5", isYearly ? "text-foreground" : "text-muted-foreground")}>
          Yearly <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Save 20%</span>
        </span>
      </div>

      <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <PricingTierCard
          name="Starter"
          description="Perfect for small projects and hobbyists."
          monthlyPrice={15}
          yearlyPrice={12}
          isYearly={isYearly}
          features={[
            { name: "Up to 3 projects", included: true },
            { name: "Basic analytics", included: true },
            { name: "24-hour support SLA", included: true },
            { name: "Custom domains", included: false },
            { name: "Advanced integrations", included: false },
          ]}
        />
        <PricingTierCard
          name="Pro"
          description="For professional teams and growing businesses."
          monthlyPrice={49}
          yearlyPrice={39}
          isYearly={isYearly}
          popular={true}
          features={[
            { name: "Unlimited projects", included: true },
            { name: "Advanced analytics", included: true },
            { name: "1-hour support SLA", included: true },
            { name: "Custom domains", included: true },
            { name: "Advanced integrations", included: false },
          ]}
        />
        <PricingTierCard
          name="Enterprise"
          description="Advanced security and custom configurations."
          monthlyPrice={199}
          yearlyPrice={159}
          isYearly={isYearly}
          features={[
            { name: "Unlimited everything", included: true },
            { name: "Custom reporting", included: true },
            { name: "24/7 phone support", included: true },
            { name: "Custom domains", included: true },
            { name: "Advanced integrations", included: true },
          ]}
        />
      </div>
    </div>
  );
}
