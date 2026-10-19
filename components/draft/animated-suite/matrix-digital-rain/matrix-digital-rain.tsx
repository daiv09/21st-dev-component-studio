"use client";

import React, { useState, useEffect } from "react";

export function MatrixDigitalRain() {
  const [columns, setColumns] = useState<string[][]>([]);

  useEffect(() => {
    const CHARS = "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃ";
    const colCount = 8;
    const rowCount = 5;

    const interval = setInterval(() => {
      const newCols = Array.from({ length: colCount }).map(() =>
        Array.from({ length: rowCount }).map(() =>
          CHARS[Math.floor(Math.random() * CHARS.length)]
        )
      );
      setColumns(newCols);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-[240px] p-3 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between font-mono text-xs font-bold text-emerald-400 select-none shadow-lg">
      {columns.map((col, cIdx) => (
        <div key={cIdx} className="flex flex-col items-center gap-1">
          {col.map((char, rIdx) => (
            <span
              key={rIdx}
              className={
                rIdx === 0
                  ? "text-white font-black animate-pulse"
                  : rIdx === 1
                  ? "text-emerald-300"
                  : "text-emerald-600/70"
              }
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
