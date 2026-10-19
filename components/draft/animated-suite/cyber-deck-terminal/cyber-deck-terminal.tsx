"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Activity, Wifi } from "lucide-react";

export function CyberDeckTerminal() {
  const [activeTab, setActiveTab] = useState("LOGS");

  return (
    <div className="w-full max-w-[280px] p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-xl flex flex-col gap-3 select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold text-zinc-200">CYBERDECK v4</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[9px] font-mono font-bold">ONLINE</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 font-mono text-[10px]">
        {["LOGS", "METRICS", "DIAG"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === tab
                ? "bg-emerald-500 text-zinc-950 font-bold"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="h-16 p-2 rounded-xl bg-zinc-900 border border-zinc-800/80 font-mono text-[10px] text-emerald-400 flex flex-col justify-center gap-1">
        {activeTab === "LOGS" && (
          <>
            <span>[10:42:01] Node ping: 12ms</span>
            <span>[10:42:02] Security mesh active</span>
          </>
        )}
        {activeTab === "METRICS" && (
          <div className="flex items-center justify-between text-zinc-300">
            <span>CPU: 18%</span>
            <span>RAM: 4.2GB</span>
            <span>FPS: 120</span>
          </div>
        )}
        {activeTab === "DIAG" && (
          <div className="flex items-center gap-2 text-amber-400">
            <Activity className="w-3.5 h-3.5 animate-bounce" />
            <span>0 Warning(s) detected</span>
          </div>
        )}
      </div>
    </div>
  );
}
