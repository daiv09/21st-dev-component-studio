"use client";
/** Gallery of all 20 figures. Drop into any React 18 app (Tailwind optional — tokens fall back to sane defaults). */
import { useState, type ReactNode } from "react";
import PistonEngine from "../components/piston-engine/piston-engine";
import HydraulicArm from "../components/hydraulic-arm/hydraulic-arm";
import EscapementClock from "../components/escapement-clock/escapement-clock";
import SortingConveyor from "../components/sorting-conveyor/sorting-conveyor";
import MicroserviceMesh from "../components/microservice-mesh/microservice-mesh";
import TimeseriesAggregator from "../components/timeseries-aggregator/timeseries-aggregator";
import VectorSpace from "../components/vector-space/vector-space";
import K8sOrchestrator from "../components/k8s-orchestrator/k8s-orchestrator";
import KanbanLanes from "../components/kanban-lanes/kanban-lanes";
import PomodoroTower from "../components/pomodoro-tower/pomodoro-tower";
import HabitAmphitheater from "../components/habit-amphitheater/habit-amphitheater";
import GitBranchVisualizer from "../components/git-branch-visualizer/git-branch-visualizer";
import OrderBookWall from "../components/order-book-wall/order-book-wall";
import TransactionRoutingMesh from "../components/transaction-routing-mesh/transaction-routing-mesh";
import PortfolioCity from "../components/portfolio-city/portfolio-city";
import RevenueTerrain from "../components/revenue-terrain/revenue-terrain";
import EqualizerGrid from "../components/equalizer-grid/equalizer-grid";
import AttentionMatrix from "../components/attention-matrix/attention-matrix";
import TerrainGenerator from "../components/terrain-generator/terrain-generator";
import DigitalRain from "../components/digital-rain/digital-rain";

const CATS: Record<string, string> = {
  A: "Mechanical & architectural simulators", B: "Data infrastructure & systems",
  C: "Productivity & workflow engines", D: "Financial & real-time flow", E: "Experimental & interactive art",
};
const ITEMS: { title: string; cat: string; node: ReactNode }[] = [
  { title: "Piston Engine Assembly", cat: "A", node: <PistonEngine className="w-full" aria-label="Piston Engine Assembly" /> },
  { title: "Hydraulic Robotic Arm", cat: "A", node: <HydraulicArm className="w-full" aria-label="Hydraulic Robotic Arm" /> },
  { title: "Escapement Gear Clock", cat: "A", node: <EscapementClock className="w-full" aria-label="Escapement Gear Clock" /> },
  { title: "Multi-Floor Sorting Conveyor", cat: "A", node: <SortingConveyor className="w-full" aria-label="Multi-Floor Sorting Conveyor" /> },
  { title: "Microservice Cluster Mesh", cat: "B", node: <MicroserviceMesh className="w-full" aria-label="Microservice Cluster Mesh" /> },
  { title: "Timescale Database Aggregator", cat: "B", node: <TimeseriesAggregator className="w-full" aria-label="Timescale Database Aggregator" /> },
  { title: "Vector Embedding Space", cat: "B", node: <VectorSpace className="w-full" aria-label="Vector Embedding Space" /> },
  { title: "Kubernetes Pod Orchestrator", cat: "B", node: <K8sOrchestrator className="w-full" aria-label="Kubernetes Pod Orchestrator" /> },
  { title: "Kanban Isometric Lanes", cat: "C", node: <KanbanLanes className="w-full" aria-label="Kanban Isometric Lanes" /> },
  { title: "Pomodoro Time Tower", cat: "C", node: <PomodoroTower className="w-full" aria-label="Pomodoro Time Tower" /> },
  { title: "Habit Streak Amphitheater", cat: "C", node: <HabitAmphitheater className="w-full" aria-label="Habit Streak Amphitheater" /> },
  { title: "Git Branch Merge Visualizer", cat: "C", node: <GitBranchVisualizer className="w-full" aria-label="Git Branch Merge Visualizer" /> },
  { title: "Order Book Depth Wall", cat: "D", node: <OrderBookWall className="w-full" aria-label="Order Book Depth Wall" /> },
  { title: "Transaction Routing Mesh", cat: "D", node: <TransactionRoutingMesh className="w-full" aria-label="Transaction Routing Mesh" /> },
  { title: "Portfolio Allocation City", cat: "D", node: <PortfolioCity className="w-full" aria-label="Portfolio Allocation City" /> },
  { title: "Revenue Velocity Terrain", cat: "D", node: <RevenueTerrain className="w-full" aria-label="Revenue Velocity Terrain" /> },
  { title: "Sound Frequency Equalizer Grid", cat: "E", node: <EqualizerGrid className="w-full" aria-label="Sound Frequency Equalizer Grid" /> },
  { title: "Neural Network Activation Matrix", cat: "E", node: <AttentionMatrix className="w-full" aria-label="Neural Network Activation Matrix" /> },
  { title: "Procedural Terrain Generator", cat: "E", node: <TerrainGenerator className="w-full" aria-label="Procedural Terrain Generator" /> },
  { title: "Matrix Digital Rain Monolith", cat: "E", node: <DigitalRain className="w-full" aria-label="Matrix Digital Rain Monolith" /> },
];

export default function DemoAll() {
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hairline · 20 isometric figures</h1>
        <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)} className="rounded border border-border bg-background px-2 py-1 text-sm">
          <option value="auto">auto</option><option value="light">light</option><option value="dark">dark</option>
        </select>
      </div>
      {Object.entries(CATS).map(([k, name]) => (
        <section key={k} className="mb-12">
          <h2 className="mb-4 text-sm uppercase tracking-wider text-foreground/60">{k} · {name}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ITEMS.filter((i) => i.cat === k).map((i) => (
              <figure key={i.title} className="rounded-xl border border-border p-3" data-theme-wrap={theme}>
                <div key={theme}>{wrap(i.node, theme)}</div>
                <figcaption className="mt-2 text-center text-xs text-foreground/70">{i.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import { cloneElement, isValidElement } from "react";
/** Passes the chosen theme through to each figure without touching its own props otherwise. */
function wrap(node: ReactNode, theme: "auto" | "light" | "dark") {
  return isValidElement(node) ? cloneElement(node as React.ReactElement<{ theme?: string }>, { theme }) : node;
}
