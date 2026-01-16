'use client'

export default function QuantumHelixLoader() {
  const barCount = 12 // Increased density for a smoother wave

  return (
    <div className='flex flex-col items-center justify-center gap-10 p-12 min-h-75 bg-slate-950/0 overflow-hidden'>
      
      {/* Main 3D Scene Container */}
      <div className='relative w-20 h-32 perspective-container group'>
        
        {/* Ambient Bloom (Backlight) */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px] animate-pulse-slow' />

        {/* The Helix Wrapper (Floats up and down slightly) */}
        <div className='relative w-full h-full transform-style-3d animate-float'>
          
          {/* 1. THE MAIN HELIX */}
          <div className='flex flex-col justify-between h-full transform-style-3d'>
            {[...Array(barCount)].map((_, i) => (
              <HelixBar key={`top-${i}`} index={i} total={barCount} />
            ))}
          </div>

          {/* 2. THE REFLECTION (Inverted & Masked) */}
          <div 
            className='absolute top-full left-0 w-full h-full flex flex-col justify-between transform-style-3d mt-4 opacity-40 pointer-events-none'
            style={{ 
              transform: 'scaleY(-1)',
              maskImage: 'linear-gradient(to top, transparent, black 80%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent, black 80%)' 
            }}
          >
            {[...Array(barCount)].map((_, i) => (
              <HelixBar key={`bottom-${i}`} index={i} total={barCount} isReflection />
            ))}
          </div>
          
        </div>
      </div>

      {/* Loading Text & Status */}
      <div className='flex flex-col items-center gap-3 z-10'>
        <h3 className='text-sm font-bold tracking-[0.3em] uppercase text-transparent bg-clip-text bg-linear-to-r from-blue-800 to-indigo-900 animate-shimmer bg-size-[200%_auto]'>
          Initializing
        </h3>
        
        {/* Cyberpunk Progress Indicator */}
        <div className='flex gap-1.5'>
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className='w-8 h-1 rounded-full bg-slate-800 overflow-hidden relative'
            >
              <div 
                className='absolute inset-0 bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                style={{
                  animation: 'loading-scan 1.5s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                  transformOrigin: 'left'
                }} 
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
        }

        .transform-style-3d {
          transform-style: preserve-3d;
        }

        /* * Smooth Sine Wave Rotation 
         * We use specific translation Z to create the depth field
         */
        @keyframes helixMotion {
          0% {
            transform: rotateY(0deg) translateZ(0px) scale(1);
            filter: brightness(1) blur(0px);
            z-index: 10;
          }
          25% {
            transform: rotateY(90deg) translateZ(40px) scale(1.1); /* Coming closer */
            filter: brightness(1.3) blur(0px);
            z-index: 20;
          }
          50% {
            transform: rotateY(180deg) translateZ(0px) scale(1);
            filter: brightness(1) blur(0px);
            z-index: 10;
          }
          75% {
            transform: rotateY(270deg) translateZ(-40px) scale(0.7); /* Going back */
            filter: brightness(0.4) blur(1px); /* Depth of field blur */
            z-index: 0;
          }
          100% {
            transform: rotateY(360deg) translateZ(0px) scale(1);
            filter: brightness(1) blur(0px);
            z-index: 10;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        @keyframes loading-scan {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }

        /* Dynamic Hue Rotation for the whole component */
        .bar-gradient {
           animation: hue-shift 8s linear infinite;
        }
        
        @keyframes hue-shift {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Sub-component for individual bars to keep JSX clean
function HelixBar({ index, isReflection = false }: { index: number; total: number; isReflection?: boolean }) {
  // Calculate delay based on index for the wave effect
  const delay = index * 0.15;
  
  return (
    <div
      className='relative h-2 w-full flex items-center justify-center transform-style-3d'
      style={{
        animation: 'helixMotion 3s linear infinite',
        animationDelay: `-${delay}s`, // Negative delay makes it start immediately in position
      }}
    >
      {/* The Neon Bar */}
      <div className={`
        relative w-full h-full rounded-full bar-gradient
        bg-linear-to-r from-blue-800 to-indigo-900
        ${isReflection ? '' : 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'}
      `}>

              
        {/* Glow Core (White center for "hot" neon look) */}
        <div className='absolute inset-x-2 inset-y-0.5 bg-white/40 rounded-full blur-[1px]' />
      </div>

      {/* Orbiting Particles (Only on main helix) */}
      {!isReflection && (
        <>
          <div className='absolute -left-1 w-1.5 h-1.5 bg-blue-200 rounded-full shadow-[0_0_8px_#22d3ee] blur-[0.5px]' />
          <div className='absolute -right-1 w-1.5 h-1.5 bg-cyan-200 rounded-full shadow-[0_0_8px_#c084fc] blur-[0.5px]' />
        </>
      )}
    </div>
  )
}