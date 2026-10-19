"use client";
import {
  forwardRef, useCallback, useEffect, useLayoutEffect, useRef,
  type ComponentPropsWithoutRef, type ForwardRefExoticComponent, type RefAttributes,
} from "react";
import { create, type Figure, type HairlineOptions, type Spec } from "./mount";

/** Figure options plus every `<div>` attribute except `children`. */
export type FigureProps = HairlineOptions & Omit<ComponentPropsWithoutRef<"div">, "children" | keyof HairlineOptions>;
export type FigureComponent = ForwardRefExoticComponent<FigureProps & RefAttributes<HTMLDivElement>>;
const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Turns a Spec into a React component: one empty <div>, mounted once, options pushed through update(). */
export function makeFigure(spec: Spec, aspectRatio = "5 / 4"): FigureComponent {
  const C = forwardRef<HTMLDivElement, FigureProps>(function Hairline(props, ref) {
    const { intensity, theme, label, onRead, style, ...attrs } = props;
    const named = label ?? props["aria-label"];
    const el = useRef<HTMLDivElement | null>(null);
    const fig = useRef<Figure | null>(null);
    const read = useRef(onRead);
    const set = useCallback((n: HTMLDivElement | null) => {
      el.current = n;
      if (typeof ref === "function") ref(n); else if (ref) ref.current = n;
    }, [ref]);
    useIso(() => { read.current = onRead; });
    useIso(() => {
      const f = create(spec, el.current!, { intensity, theme, label: named, onRead: (t) => read.current?.(t) });
      fig.current = f;
      return () => { f.destroy(); fig.current = null; };
      // mounts once; options reach the figure through the effect below
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useIso(() => { fig.current?.update({ intensity, theme, label: named, onRead: (t) => read.current?.(t) }); },
      [intensity, theme, named]);
    return <div {...attrs} ref={set} style={{ aspectRatio, ...style }} />;
  });
  C.displayName = spec.id;
  return C;
}
