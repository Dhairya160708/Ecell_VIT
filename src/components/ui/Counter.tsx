"use client";
import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

// Counts up from 0 once scrolled into view. `value` like "30+" or "06" keeps its suffix and zero padding.
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [, num, suffix] = value.match(/^(\d+)(.*)$/) ?? [, "0", value];
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const c = animate(0, Number(num), {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v)).padStart(num!.length, "0") + suffix;
      },
    });
    return () => c.stop();
  }, [inView, num, suffix]);
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
