'use client'

export default function ElasticDotsLoader() {
  const dots = 3;

  return (
    <div className='flex items-center justify-center min-h-50 p-8 bg-slate-950/0'>
      <div className='flex gap-3'>
        {[...Array(dots)].map((_, i) => (
          <div
            key={i}
            className='relative w-4 h-4'
            style={{
              animation: 'jump 1.2s cubic-bezier(0.28, 0.84, 0.42, 1) infinite',
              animationDelay: `${i * 0.1}s`, // Staggered delay for wave effect
            }}
          >
            {/* The Dot */}
            <div 
              className='w-full h-full rounded-full bg-linear-to-r from-slate-900 to-slate-700 shadow-[0_0_10px_rgba(34,211,238,0.6)]' 
              style={{
                 // This animation handles the squash & stretch shape change
                 animation: 'squash-stretch 1.2s cubic-bezier(0.28, 0.84, 0.42, 1) infinite',
                 animationDelay: `${i * 0.1}s`
              }}
            />
            
            {/* Reflection/Shadow on the floor */}
            <div 
              className='absolute top-[120%] left-0 w-full h-full rounded-full bg-black/40 blur-[2px]'
              style={{
                animation: 'shadow-scale 1.2s cubic-bezier(0.28, 0.84, 0.42, 1) infinite',
                animationDelay: `${i * 0.1}s`
              }}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        /* * 1. The Jump (Y-Axis Movement) 
         * Moves the entire container up and down
         */
        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* * 2. Squash & Stretch (Shape Deformation)
         * - Squashes wide when hitting the ground (0%, 100%)
         * - Stretches tall when moving fast (25%, 75%)
         * - Returns to circle at peak (50%)
         */
        @keyframes squash-stretch {
          0%, 100% { 
            transform: scale(1.3, 0.7); /* Squashed flat on impact */
          }
          25%, 75% { 
            transform: scale(0.8, 1.2); /* Stretched thin moving up/down */
          }
          50% { 
            transform: scale(1, 1); /* Round at the very top (weightless moment) */
          }
        }

        /* * 3. Shadow Logic
         * Shrinks and fades as the dot goes up
         */
        @keyframes shadow-scale {
          0%, 100% { 
            transform: scale(1.2); 
            opacity: 0.6;
          }
          50% { 
            transform: scale(0.5); 
            opacity: 0.1; 
          }
        }
      `}</style>
    </div>
  )
}