"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/dist/SplitText";

export interface BlockText {
    children: React.ReactNode;
    delay?: number;
    color?: string;
    className?: string;
}

// 1. EVAPORATE (Slow, upward float)
export const AnimatedEvaporate: React.FC<BlockText> = ({ children, delay = 0, color = "currentColor", className = "" }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        if (!elementRef.current || !textRef.current) return;
        const ctx = gsap.context(() => {
            const split = new SplitText(textRef.current, { type: "words" });
            const colorBoxes = split.words.map((word) => {
                gsap.set(word, { display: "inline-block", position: "relative" });
                const box = document.createElement("div");
                Object.assign(box.style, {
                    position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
                    zIndex: "10", width: `${word.getBoundingClientRect().width * 1.1}px`,
                    height: `${word.getBoundingClientRect().height * 0.9}px`,
                    backgroundColor: color, borderRadius: "0.5vw", pointerEvents: "none",
                });
                word.appendChild(box);
                return box;
            });

            gsap.to(colorBoxes, {
                scrollTrigger: {
                    trigger: elementRef.current, start: "top 85%", end: "bottom 20%",
                    toggleActions: "restart reset restart reset",
                },
                delay: delay,
                y: () => gsap.utils.random(-300, -500), x: () => gsap.utils.random(-50, 50),
                autoAlpha: 0, scale: () => gsap.utils.random(1.2, 1.8), rotation: () => gsap.utils.random(-45, 45),
                duration: 3, ease: "power2.out", stagger: 0.1,
            });
        }, elementRef);
        return () => ctx.revert();
    }, [delay, color]);

    return (
        <div ref={elementRef} className={`relative overflow-hidden ${className}`}>
            <div ref={textRef} className="inline-block">{children}</div>
        </div>
    );
};

// 2. SWEEP (Blown right)
export const AnimatedSweep: React.FC<BlockText> = ({ children, delay = 0, color = "currentColor", className = "" }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        if (!elementRef.current || !textRef.current) return;
        const ctx = gsap.context(() => {
            const split = new SplitText(textRef.current, { type: "words" });
            const colorBoxes = split.words.map((word) => {
                gsap.set(word, { display: "inline-block", position: "relative" });
                const box = document.createElement("div");
                Object.assign(box.style, {
                    position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
                    zIndex: "10", width: `${word.getBoundingClientRect().width * 1.1}px`,
                    height: `${word.getBoundingClientRect().height * 0.9}px`,
                    backgroundColor: color, borderRadius: "0.5vw", pointerEvents: "none",
                });
                word.appendChild(box);
                return box;
            });

            gsap.to(colorBoxes, {
                scrollTrigger: { trigger: elementRef.current, start: "top 85%", end: "bottom 20%", toggleActions: "restart reset restart reset" },
                delay: delay,
                x: () => gsap.utils.random(1000, 1800), y: () => gsap.utils.random(-100, 100),
                rotation: () => gsap.utils.random(45, 90), autoAlpha: 0,
                duration: 1.5, ease: "power2.inOut", stagger: 0.05,
            });
        }, elementRef);
        return () => ctx.revert();
    }, [delay, color]);

    return <div ref={elementRef} className={`relative overflow-hidden ${className}`}><div ref={textRef} className="inline-block">{children}</div></div>;
};

// 3. IMPLODE (Shrink and spin in place)
export const AnimatedImplode: React.FC<BlockText> = ({ children, delay = 0, color = "currentColor", className = "" }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        if (!elementRef.current || !textRef.current) return;
        const ctx = gsap.context(() => {
            const split = new SplitText(textRef.current, { type: "words" });
            const colorBoxes = split.words.map((word) => {
                gsap.set(word, { display: "inline-block", position: "relative" });
                const box = document.createElement("div");
                Object.assign(box.style, {
                    position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
                    zIndex: "10", width: `${word.getBoundingClientRect().width * 1.1}px`,
                    height: `${word.getBoundingClientRect().height * 0.9}px`,
                    backgroundColor: color, borderRadius: "0.5vw", pointerEvents: "none",
                });
                word.appendChild(box);
                return box;
            });

            gsap.to(colorBoxes, {
                scrollTrigger: { trigger: elementRef.current, start: "top 85%", end: "bottom 20%", toggleActions: "restart reset restart reset" },
                delay: delay, scale: 0, rotation: () => gsap.utils.random(-180, 180), autoAlpha: 0,
                duration: 1.2, ease: "back.in(1.7)", stagger: 0.05,
            });
        }, elementRef);
        return () => ctx.revert();
    }, [delay, color]);

    return <div ref={elementRef} className={`relative overflow-hidden ${className}`}><div ref={textRef} className="inline-block">{children}</div></div>;
};

// 4. CURTAIN (Slices upward)
export const AnimatedCurtain: React.FC<BlockText> = ({ children, delay = 0, color = "currentColor", className = "" }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        if (!elementRef.current || !textRef.current) return;
        const ctx = gsap.context(() => {
            const split = new SplitText(textRef.current, { type: "words" });
            const colorBoxes = split.words.map((word) => {
                gsap.set(word, { display: "inline-block", position: "relative" });
                const box = document.createElement("div");
                Object.assign(box.style, {
                    position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
                    zIndex: "10", width: `${word.getBoundingClientRect().width * 1.1}px`,
                    height: `${word.getBoundingClientRect().height * 0.9}px`,
                    backgroundColor: color, borderRadius: "0.2vw", pointerEvents: "none", transformOrigin: "top center"
                });
                word.appendChild(box);
                return box;
            });

            gsap.to(colorBoxes, {
                scrollTrigger: { trigger: elementRef.current, start: "top 85%", end: "bottom 20%", toggleActions: "restart reset restart reset" },
                delay: delay, scaleY: 0, autoAlpha: 0, duration: 1, ease: "power3.inOut", stagger: 0.05,
            });
        }, elementRef);
        return () => ctx.revert();
    }, [delay, color]);

    return <div ref={elementRef} className={`relative overflow-hidden ${className}`}><div ref={textRef} className="inline-block">{children}</div></div>;
};

// 5. SHATTER (Explosive random scatter)
export const AnimatedShatter: React.FC<BlockText> = ({ children, delay = 0, color = "currentColor", className = "" }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        if (!elementRef.current || !textRef.current) return;
        const ctx = gsap.context(() => {
            const split = new SplitText(textRef.current, { type: "words" });
            const colorBoxes = split.words.map((word) => {
                gsap.set(word, { display: "inline-block", position: "relative" });
                const box = document.createElement("div");
                Object.assign(box.style, {
                    position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
                    zIndex: "10", width: `${word.getBoundingClientRect().width * 1.1}px`,
                    height: `${word.getBoundingClientRect().height * 0.9}px`,
                    backgroundColor: color, borderRadius: "0.5vw", pointerEvents: "none",
                });
                word.appendChild(box);
                return box;
            });

            gsap.to(colorBoxes, {
                scrollTrigger: { trigger: elementRef.current, start: "top 85%", end: "bottom 20%", toggleActions: "restart reset restart reset" },
                delay: delay,
                x: () => gsap.utils.random(-1000, 1000), y: () => gsap.utils.random(-1000, 1000),
                rotation: () => gsap.utils.random(-720, 720), scale: () => gsap.utils.random(0, 1.5), autoAlpha: 0,
                duration: 1.5, ease: "expo.out", stagger: 0.02,
            });
        }, elementRef);
        return () => ctx.revert();
    }, [delay, color]);

    return <div ref={elementRef} className={`relative overflow-hidden ${className}`}><div ref={textRef} className="inline-block">{children}</div></div>;
};

// 6. MATRIX DROP (Uniform gravity drop)
export const AnimatedMatrixDrop: React.FC<BlockText> = ({ children, delay = 0, color = "currentColor", className = "" }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        if (!elementRef.current || !textRef.current) return;
        const ctx = gsap.context(() => {
            const split = new SplitText(textRef.current, { type: "words" });
            const colorBoxes = split.words.map((word) => {
                gsap.set(word, { display: "inline-block", position: "relative" });
                const box = document.createElement("div");
                Object.assign(box.style, {
                    position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
                    zIndex: "10", width: `${word.getBoundingClientRect().width * 1.1}px`,
                    height: `${word.getBoundingClientRect().height * 0.9}px`,
                    backgroundColor: color, borderRadius: "0.2vw", pointerEvents: "none",
                });
                word.appendChild(box);
                return box;
            });

            gsap.to(colorBoxes, {
                scrollTrigger: { trigger: elementRef.current, start: "top 85%", end: "bottom 20%", toggleActions: "restart reset restart reset" },
                delay: delay, y: 800, x: "-50%", rotation: 0, autoAlpha: 0,
                duration: 2, ease: "bounce.out", stagger: 0.1,
            });
        }, elementRef);
        return () => ctx.revert();
    }, [delay, color]);

    return <div ref={elementRef} className={`relative overflow-hidden ${className}`}><div ref={textRef} className="inline-block">{children}</div></div>;
};