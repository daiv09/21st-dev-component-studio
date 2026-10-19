"use client";

import React from "react";

interface BookCategoryCardProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
}

const BookCategoryCard: React.FC<BookCategoryCardProps> = ({
  title,
  subtitle,
  imageSrc,
}) => {
  return (
    <div className="group relative h-96 w-124 cursor-pointer perspective-[1200px]">
      
      {/* -------------------------------------------
        Background Card (Lifts on  ) 
      ------------------------------------------- */}
      <div className="absolute inset-0 flex flex-col items-center justify-end rounded-3xl border border-orange-100/60 bg-gradient-to-b from-white to-orange-50/30 shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group- :-translate-y-2 group- :shadow-[0_25px_60px_rgba(15,23,42,0.18)]">
        <div className="mb-8 z-10 text-center">
          <h3 className="text-lg font-medium text-slate-800">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-sm font-medium text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* -------------------------------------------
        Book Container 
        - Resting: tilted -8deg
        -  : straight 0deg
      ------------------------------------------- */}
      <div className="absolute left-1/2 top-10 h-48 w-36 -translate-x-1/2 rotate-[-8deg] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group- :rotate-0 group- :-translate-y-3">
        
        {/* 3D Context Wrapper */}
        <div className="relative h-full w-full [transform-style:preserve-3d]">
          
          {/* 1. Back Cover (Static Base) */}
          <div className="absolute inset-0 rounded-r-md rounded-l-sm bg-orange-600 shadow-lg" />

          {/* 2. The Page Block (The "Inside") */}
          <div className="absolute inset-0 left-1 right-1 top-1 bottom-1 origin-left rounded-r-sm bg-amber-50 shadow-inner transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group- :shadow-md [transform:translateZ(1px)] group- :[transform:rotateY(-10deg)]">
            
            {/* Spine Shadow on Page */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent opacity-50" />

            {/* Inner Image 
               - opacity-0 by default (Hidden when closed)
               - delay-200 on OPEN (Waits for book to open fully before appearing)
               - duration-0 on CLOSE (Disappears INSTANTLY so it doesn't clip)
            */}
            <div className="absolute inset-2 flex items-center justify-center overflow-hidden rounded bg-white opacity-0 transition-opacity duration-75 group- :opacity-100 group- :duration-500 group- :delay-200">
              <div className="relative h-full w-full overflow-hidden rounded-sm border border-slate-100 shadow-sm">
                <img
                  src={imageSrc}
                  alt="Category preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* 3. The Front Cover (The "Lid")
             - This is a 3D container that rotates.
             - It contains TWO faces: Front (Orange) and Back (White).
          */}
          <div className="absolute inset-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-style:preserve-3d] [transform:translateZ(2px)] group- :[transform:rotateY(-150deg)]">
            
            {/* FACE A: Front Cover (Orange Gradient)
               - Visible when book is closed (0deg)
               - Hidden when book is open (because it faces away)
            */}
            <div className="absolute inset-0 rounded-r-md rounded-l-sm bg-gradient-to-br from-orange-400 to-orange-500 shadow-xl [backface-visibility:hidden]">
               {/* Decorations */}
               <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-white/40 to-transparent" />
               <div className="absolute right-4 top-4 bottom-4 w-px bg-white/20" />
               <div className="absolute left-6 top-8 h-2 w-12 rounded-full bg-white/20" />
               <div className="absolute left-6 top-12 h-2 w-8 rounded-full bg-white/20" />
               <div className="pointer-events-none absolute inset-0 rounded-r-md bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
            </div>

            {/* FACE B: Inside Cover (White Paper)
               - Rotated 180deg so it sits on the "back" of the front cover.
               - Visible when the book is OPEN or CLOSING.
               - This ensures you see "White" while the book swings shut.
            */}
            <div className="absolute inset-0 rounded-r-md rounded-l-sm bg-orange-600 [transform:rotateY(180deg)] [backface-visibility:hidden]">
               {/* Inner paper texture/shadow */}
               <div className="absolute inset-0 bg-gradient-to-l from-black/5 to-transparent" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Example Usage: Centered Layout
// You can remove this section if importing into another page
// ----------------------------------------------------------------------

export default function CenteredLayoutPreview() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50">
      <BookCategoryCard 
        title="Branding" 
        subtitle="12 Projects" 
        imageSrc="https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
      />
    </div>
  );
}