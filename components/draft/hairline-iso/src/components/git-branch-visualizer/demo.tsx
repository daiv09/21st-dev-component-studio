"use client";

import GitBranchVisualizer from "./git-branch-visualizer";

export default function GitBranchVisualizerDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <GitBranchVisualizer className="w-full max-w-md" intensity={0.5} aria-label="Git Branch Merge Visualizer" />
    </div>
  );
}
