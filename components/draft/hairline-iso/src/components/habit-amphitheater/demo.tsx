"use client";

import HabitAmphitheater from "./habit-amphitheater";

export default function HabitAmphitheaterDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <HabitAmphitheater className="w-full max-w-md" intensity={0.5} aria-label="Habit Streak Amphitheater" />
    </div>
  );
}
