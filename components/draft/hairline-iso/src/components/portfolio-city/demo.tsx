"use client";

import PortfolioCity from "./portfolio-city";

export default function PortfolioCityDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <PortfolioCity className="w-full max-w-md" intensity={0.5} aria-label="Portfolio Allocation City" />
    </div>
  );
}
