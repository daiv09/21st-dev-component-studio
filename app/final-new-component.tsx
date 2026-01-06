"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  Server,
  Zap,
} from "lucide-react";

// ==========================================
// 0. DATA GENERATORS & CONFIG
// ==========================================

const COLORS = {
  red: "#f87171",
  green: "#4ade80",
  blue: "#60a5fa",
  yellow: "#fbbf24",
  purple: "#a78bfa",
};

// --- Generator: KPI Data (system-focused) ---
const generateKPIData = () => {
  return [
    {
      label: "Request Rate",
      value: Math.floor(Math.random() * 500 + 1200) + " req/s",
      trend: "+12%",
      color: COLORS.blue,
      icon: Activity,
    },
    {
      label: "CPU Utilization",
      value: Math.floor(Math.random() * 40 + 30) + "%",
      trend: "-5%",
      color: COLORS.red,
      icon: Server,
    },
    {
      label: "Error Rate",
      value: (Math.random() * 2).toFixed(2) + "%",
      trend: "+0.4%",
      color: COLORS.purple,
      icon: Zap,
    },
    {
      label: "Avg Latency",
      value: Math.floor(Math.random() * 80 + 20) + " ms",
      trend: "-2%",
      color: COLORS.green,
      icon: Activity,
    },
  ];
};

// --- Generator: Heatmap Data ---
const generateHeatmapData = () => {
  // 14x5 grid of activity levels (0-4)
  return Array.from({ length: 70 }, () => Math.floor(Math.random() * 5));
};

// --- Generator: Bar Data ---
const generateBarData = () => {
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  const colors = [
    COLORS.red,
    COLORS.blue,
    COLORS.green,
    COLORS.yellow,
    COLORS.purple,
  ];
  return days.map((day, i) => ({
    label: day,
    value: Math.floor(Math.random() * 70) + 30,
    color: `bg-[${colors[i]}]`,
    hex: colors[i],
  }));
};

// --- Generator: Radar Data ---
const generateRadarData = () => {
  const metrics = [
    { label: "SPEED", color: COLORS.red },
    { label: "UPTIME", color: COLORS.green },
    { label: "SECURE", color: COLORS.blue },
    { label: "UX", color: COLORS.yellow },
    { label: "SEO", color: COLORS.purple },
  ];
  return metrics.map((m) => ({
    label: m.label,
    value: Math.floor(Math.random() * 60) + 40,
    color: m.color,
  }));
};

// --- Generator: Pie Data ---
const generatePieData = () => {
  const items = [
    { label: "CPU", color: COLORS.red },
    { label: "RAM", color: COLORS.green },
    { label: "Disk", color: COLORS.blue },
    { label: "Net", color: COLORS.yellow },
  ];
  const weights = items.map(() => Math.random());
  const sum = weights.reduce((a, b) => a + b, 0);
  const values = weights.map((w) => Math.round((w / sum) * 100));
  const total = values.reduce((a, b) => a + b, 0);
  values[0] += 100 - total;
  return items.map((item, i) => ({
    ...item,
    value: values[i] > 0 ? values[i] : 5,
  }));
};

// ==========================================
// 1. COMPONENT: KPI CARDS
// ==========================================
const KPICard = ({ item, index }: { item: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, boxShadow: "8px 8px 0px 0px rgba(0,0,0,1)" }}
      className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col justify-between h-32 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
        <item.icon size={64} color={item.color} />
      </div>

      <div className="flex justify-between items-start z-10">
        <span className="font-bold text-zinc-500 uppercase tracking-wider text-xs">
          {item.label}
        </span>
        <div
          className={`flex items-center gap-1 text-xs font-black px-2 py-1 border-2 border-black ${
            item.trend.includes("+") ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {item.trend.includes("+") ? (
            <ArrowUpRight size={12} />
          ) : (
            <ArrowDownRight size={12} />
          )}
          {item.trend}
        </div>
      </div>

      <div className="z-10">
        <h2 className="text-4xl font-black tracking-tighter">{item.value}</h2>
      </div>

      <div className="h-2 w-full bg-zinc-100 mt-2 border-2 border-black">
        <motion.div
          className="h-full"
          style={{ backgroundColor: item.color }}
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

// ==========================================
// 2. COMPONENT: HEATMAP
// ==========================================
const BrutalistHeatmap = ({ data }: { data: number[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-zinc-100";
      case 1:
        return "bg-green-200";
      case 2:
        return "bg-green-300";
      case 3:
        return "bg-green-400";
      case 4:
        return "bg-green-500";
      default:
        return "bg-zinc-100";
    }
  };

  return (
    <div className="w-full bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
      <h3 className="font-black uppercase text-xl mb-4 border-b-[3px] border-black pb-2 flex justify-between items-center">
        <span>System Activity Log</span>
        <span className="text-xs text-zinc-400 font-mono">LAST 70 DAYS</span>
      </h3>

      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
        {data.map((level, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.005 }}
            className={`w-6 h-6 sm:w-8 sm:h-8 border-2 border-black ${getIntensityColor(
              level
            )} relative cursor-crosshair`}
            whileHover={{ scale: 1.3, zIndex: 10 }}
          >
            {hoveredIndex === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[10px] font-bold px-1 py-0.5 whitespace-nowrap pointer-events-none z-20">
                Lvl {level}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. COMPONENT: BAR CHART
// ==========================================
const BrutalistBarChart = ({ data }: { data: any[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full h-full bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col p-6">
      <h3 className="font-black uppercase text-xl mb-6 border-b-[3px] border-black pb-2">
        Weekly Traffic
      </h3>
      <div className="flex justify-between items-end flex-1 gap-2 sm:gap-4 min-h-[150px]">
        {data.map((item, i) => (
          <div key={i} className="relative flex-1 h-full flex items-end group">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${item.value}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              style={{ backgroundColor: item.hex }}
              className="w-full border-[3px] border-black relative z-10 cursor-pointer origin-bottom flex items-center justify-center overflow-hidden"
              whileHover={{ scaleY: 1.1, scaleX: 1.05 }}
              whileTap={{ scaleY: 0.95 }}
            >
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                  backgroundSize: "4px 4px",
                }}
              />
              <span className="relative z-20 font-bold text-xs font-mono text-black/80 group-hover:text-black transition-colors">
                {item.label}
              </span>
            </motion.div>
            <AnimatePresence>
              {hovered === i && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-full -mb-2 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 text-sm font-black whitespace-nowrap border-[3px] border-black z-30 pointer-events-none"
                >
                  {item.value}%
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. COMPONENT: RADAR CHART
// ==========================================
const RADAR_SIZE = 200;
const CENTER = RADAR_SIZE / 2;
const RADIUS = 80;
const angleToRad = (angle: number) => (Math.PI / 180) * angle;
const getCoords = (value: number, index: number, total: number) => {
  const angle = angleToRad((360 / total) * index - 90);
  const r = (value / 100) * RADIUS;
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
};

const BrutalistRadarChart = ({ data }: { data: any[] }) => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const pathData =
    data
      .map((d, i) => {
        const coords = getCoords(d.value, i, data.length);
        return `${i === 0 ? "M" : "L"} ${coords.x} ${coords.y}`;
      })
      .join(" ") + " Z";
  const gridLevels = [100, 75, 50, 25];

  return (
    <div className="w-full h-full bg-zinc-50 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <span className="text-8xl font-black uppercase">STATS</span>
        </div>
        <svg
          viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
          className="w-full h-full max-w-75 overflow-visible"
        >
          {gridLevels.map((level, lvlIdx) => (
            <path
              key={lvlIdx}
              d={
                data
                  .map((_, i) => {
                    const c = getCoords(level, i, data.length);
                    return `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
                  })
                  .join(" ") + " Z"
              }
              fill="none"
              stroke="rgba(0,0,0,0.1)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ))}
          {data.map((_, i) => {
            const outer = getCoords(100, i, data.length);
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="2"
              />
            );
          })}
          <motion.path
            animate={{ d: pathData }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            fill="rgba(167, 139, 250, 0.5)"
            stroke="black"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {data.map((d, i) => {
            const coords = getCoords(d.value, i, data.length);
            const isHovered = hoveredMetric === d.label;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredMetric(d.label)}
                onMouseLeave={() => setHoveredMetric(null)}
                className="cursor-pointer"
              >
                <circle cx={coords.x} cy={coords.y} r="20" fill="transparent" />
                <motion.circle
                  animate={{
                    cx: coords.x,
                    cy: coords.y,
                    scale: isHovered ? 2 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  r="6"
                  fill={isHovered ? d.color : "white"}
                  stroke="black"
                  strokeWidth={isHovered ? 4 : 3}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="w-full sm:w-32 flex flex-col justify-center gap-2 z-10">
        <h3 className="font-black uppercase text-xl mb-2 border-b-[3px] border-black pb-2">
          Health
        </h3>
        {data.map((item, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => setHoveredMetric(item.label)}
            onMouseLeave={() => setHoveredMetric(null)}
            className="flex items-center justify-between p-1.5 border-2 border-transparent hover:border-black hover:bg-white cursor-pointer transition-colors"
            animate={{
              x: hoveredMetric === item.label ? 5 : 0,
              backgroundColor:
                hoveredMetric === item.label ? "#ffffff" : "transparent",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 border-2 border-black"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] font-bold font-mono">
                {item.label}
              </span>
            </div>
            <span className="font-black text-xs">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 5. COMPONENT: DONUT CHART
// ==========================================
const springConfig = { type: "spring", stiffness: 300, damping: 20 };
const getPieCoords = (percent: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

const BrutalistDonut = ({ data }: { data: any[] }) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  let cumulativePercent = 0;

  return (
    <div className="w-full h-full bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col items-center justify-between overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#000 1.5px, transparent 1.5px)",
          backgroundSize: "12px 12px",
        }}
      />
      <h3 className="font-black uppercase tracking-tighter text-2xl border-b-[3px] border-black pb-2 mb-8 w-full text-center z-10">
        Resource Usage
      </h3>
      <div className="z-10 flex flex-col items-center w-full h-full justify-center">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
          <motion.svg
            viewBox="-1.2 -1.2 2.4 2.4"
            className="rotate-[-90deg] overflow-visible"
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: -90, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.2,
            }}
          >
            {data.map((slice) => {
              const startPercent = cumulativePercent;
              const endPercent = cumulativePercent + slice.value / 100;
              cumulativePercent = endPercent;
              const [startX, startY] = getPieCoords(startPercent);
              const [endX, endY] = getPieCoords(endPercent);
              const largeArcFlag = slice.value / 100 > 0.5 ? 1 : 0;
              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                `L 0 0`,
              ].join(" ");
              const isHovered = hoveredSlice === slice.label;
              const isDimmed = hoveredSlice !== null && !isHovered;
              return (
                <motion.path
                  key={slice.label}
                  animate={{
                    d: pathData,
                    translateX: isHovered ? (startX + endX) * 0.1 : 0,
                    translateY: isHovered ? (startY + endY) * 0.1 : 0,
                    scale: isHovered ? 1.05 : 1,
                    opacity: isDimmed ? 0.3 : 1,
                    filter: isDimmed ? "grayscale(80%)" : "grayscale(0%)",
                  }}
                  fill={slice.color}
                  stroke="black"
                  strokeWidth="0.04"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transition={springConfig}
                  onMouseEnter={() => setHoveredSlice(slice.label)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className="cursor-pointer hover:z-10 relative"
                />
              );
            })}
            <motion.circle
              cx="0"
              cy="0"
              r="0.55"
              fill="white"
              stroke="black"
              strokeWidth="0.04"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, ...springConfig }}
            />
          </motion.svg>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <AnimatePresence mode="popLayout">
              {hoveredSlice ? (
                <motion.div
                  key="hover-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl font-black leading-none">
                    {data.find((d) => d.label === hoveredSlice)?.value}%
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-1 mt-1">
                    {hoveredSlice}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="default-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-3xl font-black leading-none">100%</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    TOTAL
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. MAIN BENTO LAYOUT
// ==========================================
export default function BentoDashboard() {
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const refreshData = () => {
    setLoading(true);
    setKpiData(generateKPIData());
    setHeatmapData(generateHeatmapData());
    setBarData(generateBarData());
    setRadarData(generateRadarData());
    setPieData(generatePieData());
    setLastUpdated(new Date().toLocaleTimeString());
    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-100 p-4 md:p-12 font-sans selection:bg-black selection:text-white flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col flex-1 gap-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
              Analytics
            </h1>
            <p className="font-bold text-zinc-500 uppercase tracking-widest text-xs md:text-sm">
              System Overview Dashboard
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 border-[2px] border-black bg-white">
                ENV: PROD
              </span>
              <span className="px-2 py-0.5 border-[2px] border-black bg-white">
                REGION: us-east-1
              </span>
              <span className="px-2 py-0.5 border-[2px] border-black bg-white">
                BUILD: v1.4.2
              </span>
              {lastUpdated && (
                <span className="px-2 py-0.5 border-[2px] border-black bg-white">
                  UPDATED: {lastUpdated}
                </span>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="flex items-center gap-2 bg-black text-white px-4 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:bg-white hover:text-black transition-all font-bold uppercase tracking-wide"
          >
            <motion.div
              animate={{ rotate: loading ? 180 : 0 }}
              transition={{ repeat: loading ? Infinity : 0, duration: 0.5 }}
            >
              <RefreshCw size={20} strokeWidth={3} />
            </motion.div>
            <span className="hidden sm:inline">Refresh Data</span>
          </motion.button>
        </header>

        {barData.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* ROW 1: KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData.map((item, i) => (
                <KPICard key={i} item={item} index={i} />
              ))}
            </div>

            {/* ROW 2: MAIN CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="w-full min-h-[350px] md:min-h-[400px]">
                <BrutalistBarChart data={barData} />
              </div>
              <div className="w-full min-h-[350px] md:min-h-[400px]">
                <BrutalistRadarChart data={radarData} />
              </div>
              <div className="w-full min-h-[350px] md:min-h-[400px]">
                <BrutalistDonut data={pieData} />
              </div>
            </div>

            {/* ROW 3: HEATMAP */}
            <div className="w-full">
              <BrutalistHeatmap data={heatmapData} />
            </div>

            {/* ROW 4: GOLDEN SIGNALS SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Latency (p95)",
                  value: `${Math.floor(Math.random() * 200 + 150)} ms`,
                },
                {
                  label: "Traffic",
                  value: `${Math.floor(Math.random() * 8000 + 12000)} req/min`,
                },
                {
                  label: "Error Rate",
                  value: `${(Math.random() * 3).toFixed(2)} %`,
                },
                {
                  label: "Saturation",
                  value: `${Math.floor(Math.random() * 30 + 60)} % CPU`,
                },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-3 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-xl font-black tracking-tight">
                    {item.value}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* ROW 5: ALERTS + TOP ENDPOINTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alerts */}
              <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
                <h3 className="font-black uppercase text-xl border-b-[3px] border-black pb-2 flex items-center justify-between">
                  <span>Incidents & Alerts</span>
                  <span className="text-[10px] font-mono font-bold bg-red-500 text-white px-2 py-0.5 border-2 border-black">
                    LIVE
                  </span>
                </h3>
                <div className="flex flex-col gap-2 text-xs font-mono">
                  {[
                    "High latency detected on /checkout (p95 > 450ms)",
                    "Error spike on /api/payments (5xx > 2%)",
                    "CPU saturation on node-3 (82%)",
                    "Increased queue length on orders-worker",
                  ].map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="flex items-start gap-2 border-2 border-black bg-zinc-50 px-2 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <span className="mt-[2px] h-2 w-2 rounded-full bg-red-500 border border-black" />
                      <span>{msg}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top Endpoints */}
              <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <h3 className="font-black uppercase text-xl border-b-[3px] border-black pb-2 mb-3">
                  Top Endpoints
                </h3>
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border-[2px] border-black px-2 py-1 text-left">
                          Endpoint
                        </th>
                        <th className="border-[2px] border-black px-2 py-1 text-right">
                          Req/s
                        </th>
                        <th className="border-[2px] border-black px-2 py-1 text-right">
                          p95 (ms)
                        </th>
                        <th className="border-[2px] border-black px-2 py-1 text-right">
                          Error %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { path: "/api/checkout", rps: 320, p95: 420, err: 1.3 },
                        { path: "/api/products", rps: 540, p95: 210, err: 0.4 },
                        { path: "/api/auth", rps: 180, p95: 310, err: 2.1 },
                        { path: "/api/search", rps: 260, p95: 260, err: 0.7 },
                      ].map((row, i) => (
                        <tr
                          key={row.path}
                          className={i % 2 ? "bg-zinc-50" : ""}
                        >
                          <td className="border-[2px] border-black px-2 py-1">
                            {row.path}
                          </td>
                          <td className="border-[2px] border-black px-2 py-1 text-right">
                            {row.rps}
                          </td>
                          <td className="border-[2px] border-black px-2 py-1 text-right">
                            {row.p95}
                          </td>
                          <td className="border-[2px] border-black px-2 py-1 text-right">
                            {row.err.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
