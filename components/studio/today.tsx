"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  User,
  Mail,
  Lock,
  Code,
  Palette,
  Terminal,
  Zap,
  Sparkles,
  Rocket,
  Eye,
  EyeOff,
  Cpu,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * =============================================================================
 * UTILS & HOOKS
 * =============================================================================
 */

// A simple hook to measure content height for smooth container resizing
function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [bounds, setBounds] = useState({ height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setBounds({ height: entry.contentRect.height });
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, bounds] as const;
}

// Background Grid Animation
const AnimatedGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.05]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000012_1px,transparent_1px),linear-gradient(to_bottom,#00000012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px] dark:bg-fuchsia-900"></div>
  </div>
);

// Confetti Component (Pure React/Canvas)
const ConfettiExplosion = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    // Vibrant colors that work on both light (white) and dark backgrounds
    const colors = ["#000000", "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        life: 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= 0.01;
        p.size *= 0.96;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size); // Square confetti for brutalism

        if (p.life <= 0) particles.splice(i, 1);
      });
      if (particles.length > 0) requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" />;
};

/**
 * =============================================================================
 * COMPONENT LIBRARY
 * =============================================================================
 */

// 1. Chunky Input
const BrutalInput = ({ icon, label, isPassword, className, ...props }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? "text" : "password") : props.type || "text";

  return (
    <div className="group relative mb-6">
      <label className="block text-xs font-black uppercase tracking-widest mb-2 text-neutral-500 dark:text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors pointer-events-none z-10">
          {icon}
        </div>
        <input
          {...props}
          type={inputType}
          className={cn(
            "w-full bg-neutral-100 dark:bg-neutral-900 border-[3px] border-neutral-200 dark:border-neutral-800 p-4 pl-12 font-bold text-lg outline-none transition-all duration-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded-xl",
            "focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black",
            "focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
            "focus:-translate-y-1",
            className
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

// 2. Selectable Role Card
const RoleCard = ({ title, icon, selected, onClick, color }: any) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.95, y: 0 }}
      animate={{
        borderColor: selected ? "currentColor" : "var(--neutral-200)",
        backgroundColor: selected ? "var(--bg-selected)" : "var(--bg-idle)",
      }}
      className={cn(
        "relative w-full p-5 text-left border-[3px] rounded-2xl transition-all duration-300 overflow-hidden group",
        selected
          ? "border-black dark:border-white shadow-[6px_6px_0px_0px_currentColor] dark:shadow-[6px_6px_0px_0px_currentColor]"
          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600"
      )}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center border-2 border-black/5 dark:border-white/5 transition-transform duration-500 group-hover:rotate-6",
            color
          )}
        >
          {icon}
        </div>
        <h3 className="font-black text-lg uppercase tracking-tight text-black dark:text-white">
          {title}
        </h3>
      </div>
      
      {/* Selection Indicator */}
      <div className={cn(
          "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          selected ? "bg-black dark:bg-white border-black dark:border-white" : "border-neutral-300 dark:border-neutral-700"
      )}>
        {selected && <Check size={14} className="text-white dark:text-black" strokeWidth={4} />}
      </div>
    </motion.button>
  );
};

// 3. Navigation Button
const NavButton = ({ children, onClick, disabled, primary, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "group relative px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 outline-none",
      // Primary Style
      primary && "bg-black dark:bg-white text-white dark:text-black border-[3px] border-black dark:border-white",
      primary && !disabled && "hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_currentColor] active:translate-y-0 active:shadow-none",
      // Secondary Style
      !primary && "text-neutral-500 hover:text-black dark:hover:text-white bg-transparent",
      // Disabled State
      disabled && "opacity-50 cursor-not-allowed grayscale",
      className
    )}
  >
    {children}
  </button>
);

/**
 * =============================================================================
 * MAIN COMPONENT
 * =============================================================================
 */

export default function NeoBrutalistCreate() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure<HTMLDivElement>();
  
  // Form State - DEFAULTS TO LIGHT MODE
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    theme: "light", // CHANGED: Default is now Light
  });

  // Apply Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (formData.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [formData.theme]);

  // Optional: Auto-detect system preference on mount (uncomment if desired)
  /*
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       setFormData(prev => ({ ...prev, theme: 'dark' }));
    }
  }, []);
  */

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  // Animation Variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.95,
      rotate: dir > 0 ? 2 : -2,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      rotate: 0,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 40 : -40,
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.95,
      rotate: dir < 0 ? 2 : -2,
    }),
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f4f5] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-50 font-sans flex items-center justify-center p-4 transition-colors duration-700 selection:bg-purple-500 selection:text-white">
      <AnimatedGrid />
      
      {/* Confetti on Success */}
      {step === 4 && <ConfettiExplosion />}

      <div className="w-full max-w-lg z-10 relative">
        
        {/* --- Dynamic Header --- */}
        <div className="mb-8 flex items-end justify-between px-2">
          <div>
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic text-black dark:text-white leading-none"
            >
              Create<span className="text-purple-600 dark:text-purple-400">.acc</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mt-2 ml-1"
            >
              System Initialization // v2.0
            </motion.p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-4xl font-black text-neutral-300 dark:text-neutral-800 font-mono">
              0{step}
            </span>
            {/* Animated Progress Dots */}
            <div className="flex gap-1 mt-2">
              {[...Array(totalSteps)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: i + 1 === step ? 12 : 6,
                    width: i + 1 === step ? 12 : 6,
                    // Smart color adaptation for Light/Dark modes
                    backgroundColor: i + 1 <= step 
                      ? (formData.theme === 'dark' ? '#fff' : '#000') 
                      : (formData.theme === 'dark' ? '#333' : '#d4d4d8')
                  }}
                  className="rounded-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- Main Card Container (Auto-Resizing) --- */}
        <motion.div
          animate={{ height: bounds.height > 0 ? bounds.height : 'auto' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative w-full"
        >
          <div className="overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111] border-[4px] border-black dark:border-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] transition-colors duration-500">
            <div ref={ref} className="p-8 md:p-10">
              
              <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                
                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-black uppercase mb-2 text-black dark:text-white">
                        Who are you?
                      </h2>
                      <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                        Enter your credentials to access the mainframe.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <BrutalInput
                        label="Username"
                        placeholder="e.g. Neo Anderson"
                        icon={<User size={20} />}
                        value={formData.name}
                        onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                      />
                      <BrutalInput
                        label="Email"
                        placeholder="user@matrix.com"
                        icon={<Mail size={20} />}
                        value={formData.email}
                        onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                      />
                      <BrutalInput
                        label="Password"
                        placeholder="••••••••"
                        icon={<Lock size={20} />}
                        isPassword
                        value={formData.password}
                        onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>

                    <div className="mt-8 flex justify-end">
                      <NavButton primary onClick={nextStep}>
                        Next Step <ArrowRight size={18} />
                      </NavButton>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: ROLE SELECTION */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-black uppercase mb-2 text-black dark:text-white">
                        Select Class
                      </h2>
                      <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                        Choose your specialization path.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RoleCard
                        title="Engineer"
                        icon={<Terminal size={24} />}
                        color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300"
                        selected={formData.role === "eng"}
                        onClick={() => setFormData({ ...formData, role: "eng" })}
                      />
                      <RoleCard
                        title="Creative"
                        icon={<Palette size={24} />}
                        color="bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300"
                        selected={formData.role === "des"}
                        onClick={() => setFormData({ ...formData, role: "des" })}
                      />
                      <RoleCard
                        title="Founder"
                        icon={<Rocket size={24} />}
                        color="bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300"
                        selected={formData.role === "fnd"}
                        onClick={() => setFormData({ ...formData, role: "fnd" })}
                      />
                      <RoleCard
                        title="Hacker"
                        icon={<Code size={24} />}
                        color="bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300"
                        selected={formData.role === "hck"}
                        onClick={() => setFormData({ ...formData, role: "hck" })}
                      />
                    </div>

                    <div className="mt-10 flex justify-between items-center">
                      <NavButton onClick={prevStep}>
                        <ChevronLeft size={18} /> Back
                      </NavButton>
                      <NavButton 
                        primary 
                        onClick={nextStep} 
                        disabled={!formData.role}
                      >
                        Continue <ArrowRight size={18} />
                      </NavButton>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: ENVIRONMENT */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl font-black uppercase mb-2 text-black dark:text-white">
                        Environment
                      </h2>
                      <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                        Configure your interface preference.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {["light", "dark"].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setFormData({ ...formData, theme })}
                          className={cn(
                            "w-full p-6 border-[3px] rounded-2xl font-black uppercase text-left flex items-center justify-between transition-all duration-300 group",
                            formData.theme === theme
                              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-[6px_6px_0px_0px_currentColor] scale-[1.02]"
                              : "bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            {theme === "light" ? <Monitor size={24} /> : <Cpu size={24} />}
                            <span className="tracking-widest">{theme} Mode</span>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            formData.theme === theme ? "bg-white dark:bg-black border-transparent" : "border-neutral-300"
                          )}>
                             {formData.theme === theme && <Check size={14} className="text-black dark:text-white" strokeWidth={4} />}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-10 flex justify-between items-center">
                      <NavButton onClick={prevStep}>
                        <ChevronLeft size={18} /> Back
                      </NavButton>
                      <NavButton primary onClick={nextStep}>
                        Create <Zap size={18} className="fill-current" />
                      </NavButton>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: SUCCESS */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex flex-col items-center justify-center text-center py-8"
                  >
                     <motion.div
                       initial={{ scale: 0, rotate: -180 }}
                       animate={{ scale: 1, rotate: 0 }}
                       transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                       className="w-32 h-32 bg-emerald-400 rounded-full flex items-center justify-center mb-6 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
                     >
                       <Sparkles size={48} className="text-black" strokeWidth={2.5} />
                     </motion.div>

                     <h2 className="text-4xl font-black uppercase mb-4 text-black dark:text-white">
                        Access Granted
                     </h2>
                     <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xs mx-auto mb-10 leading-relaxed">
                        Welcome to the system, <span className="text-black dark:text-white font-bold underline decoration-wavy decoration-emerald-500">{formData.name || 'User'}</span>. Your profile has been initialized.
                     </p>

                     <NavButton 
                        primary 
                        onClick={() => window.location.reload()} 
                        className="w-full justify-center bg-emerald-400 border-black text-black hover:bg-emerald-300 dark:bg-emerald-500 dark:text-black dark:border-white"
                     >
                        Enter Dashboard
                     </NavButton>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        
        {/* Decorative Elements around the card */}
        <div className="absolute -top-12 -left-12 opacity-20 pointer-events-none hidden md:block">
           <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="text-black dark:text-white animate-spin-slow">
              <path d="M50 0V100M0 50H100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
           </svg>
        </div>

      </div>
    </div>
  );
}