'use client'

export default function QuantumCloudLoader() {
  return (
    <div className='flex items-center justify-center min-h-[200px] bg-slate-950/0 overflow-hidden'>
      
      {/* Container: Reduced width (w-40 instead of w-80) to tighten the animation 
      */}
      <div className='relative w-40 h-20 flex items-center justify-center isolate'>
        
        {/* DOT 1: RED (The Speedster) */}
        <div className='absolute w-4 h-4 animate-flux-1 z-20 mix-blend-screen'>
          <div className='w-full h-full bg-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]' />
        </div>

        {/* DOT 2: BLUE (The Heavyweight) */}
        <div className='absolute w-6 h-6 animate-flux-2 z-10 mix-blend-screen'>
          <div className='w-full h-full bg-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]' />
        </div>

        {/* DOT 3: YELLOW (The Pacer) */}
        <div className='absolute w-5 h-5 animate-flux-3 z-30 mix-blend-screen'>
          <div className='w-full h-full bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)]' />
        </div>

        {/* DOT 4: GREEN (The Satellite) */}
        <div className='absolute w-3.5 h-3.5 animate-flux-4 z-0 mix-blend-screen'>
          <div className='w-full h-full bg-green-400 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)]' />
        </div>

      </div>

      <style jsx>{`
        /* UPDATED LOGIC:
          - Reduced translateX values (e.g., 60px instead of 100px).
          - Smoother 'cubic-bezier(0.4, 0, 0.2, 1)' (Sine-like ease).
          - Enhanced Scale/Z-index contrast for better 3D depth.
        */

        @keyframes pulse-slow {
           0%, 100% { transform: scale(1); opacity: 0.3; }
           50% { transform: scale(1.5); opacity: 0.6; }
        }
        .animate-pulse-slow {
            animation: pulse-slow 3s ease-in-out infinite;
        }

        /* DOT 1: Red - Fast, tight sweep */
        @keyframes flux-1 {
          0% { transform: translateX(-50px) scale(0.7); opacity: 0.5; z-index: 0; }
          50% { transform: translateX(50px) scale(1.4); opacity: 1; z-index: 50; }
          100% { transform: translateX(-50px) scale(0.7); opacity: 0.5; z-index: 0; }
        }
        .animate-flux-1 {
          animation: flux-1 2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
        }

        /* DOT 2: Blue - Slow background anchor */
        @keyframes flux-2 {
          0% { transform: translateX(40px) scale(1); opacity: 1; z-index: 40; }
          50% { transform: translateX(-40px) scale(0.6); opacity: 0.4; z-index: 0; }
          100% { transform: translateX(40px) scale(1); opacity: 1; z-index: 40; }
        }
        .animate-flux-2 {
          animation: flux-2 3.2s ease-in-out infinite;
        }

        /* DOT 3: Yellow - Jittery Pacer */
        @keyframes flux-3 {
          0% { transform: translateX(-25px) scale(0.9); z-index: 20; }
          100% { transform: translateX(25px) scale(0.9); z-index: 20; }
        }
        .animate-flux-3 {
          animation: flux-3 1.2s ease-in-out infinite alternate;
        }

        /* DOT 4: Green - Wide orbit but tighter than before */
        @keyframes flux-4 {
          0% { transform: translateX(65px) scale(0.5); opacity: 0.3; }
          50% { transform: translateX(0px) scale(1.2); opacity: 1; }
          100% { transform: translateX(-65px) scale(0.5); opacity: 0.3; }
        }
        .animate-flux-4 {
          animation: flux-4 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
        }
      `}</style>
    </div>
  )
}