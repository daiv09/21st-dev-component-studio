"use client";

import React, { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

const LINES = [
  "$ agy init --cluster=alpha",
  "> Connecting to remote node...",
  "> Handshake verified [200 OK]",
  "> Deploying micro-components...",
  "✔ ALL SYSTEMS OPERATIONAL",
];

export function TypewriterTerminalBox() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (currentLineIndex >= LINES.length) return;

    const fullLine = LINES[currentLineIndex];
    let charIndex = 0;

    const interval = setInterval(() => {
      setCurrentText(fullLine.slice(0, charIndex + 1));
      charIndex++;

      if (charIndex >= fullLine.length) {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentLineIndex((prev) => (prev + 1) % LINES.length);
          setCurrentText("");
        }, 1200);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [currentLineIndex]);

  return (
    <div className="w-full max-w-[280px] rounded-2xl bg-zinc-950 border border-zinc-800 p-3 shadow-lg select-none">
      <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
        <span>bash - 80x24</span>
      </div>

      <div className="pt-2 h-16 flex items-center font-mono text-xs text-emerald-400">
        <span>{currentText}</span>
        <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
      </div>
    </div>
  );
}
