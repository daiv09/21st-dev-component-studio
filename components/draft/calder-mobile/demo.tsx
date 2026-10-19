"use client";

import React, { useState } from "react";
import { CalderMobile } from "./calder-mobile";

export default function CalderMobilePage() {
  const [wind, setWind] = useState(0.4);
  const [gravity, setGravity] = useState(0.15);

  return (
    <main className="relative min-h-screen w-full bg-[#D4D4D2] overflow-hidden flex items-center justify-center font-sans text-neutral-800">

      {/* Background ambient elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl p-6">

        <header className="text-center mb-8">
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-neutral-500 mb-2">
            Interactive Art · 06
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900">
            Kinetic Balance
          </h1>
          <p className="text-sm text-neutral-500 mt-2 font-mono">
            Drag the shapes to interact.
          </p>
        </header>

        {/* The Mobile Component */}
        <div className="relative w-full max-w-[600px] group">
          <CalderMobile
            wind={wind}
            gravity={gravity}
            size={600}
          />

          {/* Floating Controls HUD */}
          <aside className="absolute bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 md:left-auto md:right-6 md:translate-x-0 w-[240px] bg-white/70 backdrop-blur-xl border border-white/40 p-5 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-neutral-200/60 pb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                Environment HUD
              </div>
            </div>

            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <span className="flex justify-between items-center">
                <span>Wind Velocity</span>
                <span className="bg-neutral-100 px-2 py-1 rounded text-neutral-800 font-mono">
                  {wind.toFixed(2)}
                </span>
              </span>
              <input
                type="range"
                min={0} max={1.2} step={0.01}
                value={wind}
                onChange={(e) => setWind(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-800"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-600">
              <span className="flex justify-between items-center">
                <span>Gravity Pull</span>
                <span className="bg-neutral-100 px-2 py-1 rounded text-neutral-800 font-mono">
                  {gravity.toFixed(2)}
                </span>
              </span>
              <input
                type="range"
                min={0.02} max={0.4} step={0.01}
                value={gravity}
                onChange={(e) => setGravity(Number(e.target.value))}
                className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-800"
              />
            </label>
          </aside>
        </div>

      </div>
    </main>
  );
}