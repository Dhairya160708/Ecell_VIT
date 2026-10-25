"use client";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Full-bleed team photo with a subtle scroll transition. Renders only when a real group photo exists. */
export function TeamScrollPhoto({ src }: { src: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);

  return (
    <section
      ref={ref}
      aria-label="E-Cell team group photo"
      className="relative h-[62svh] overflow-hidden sm:h-[72svh]"
    >
      <motion.img
        src={src}
        alt="The E-Cell VIT team together"
        style={reduced ? undefined : { y, scale }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/10" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 lg:px-8">
        <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.24em] text-gold">
          One cell, many builders
        </p>
        <p className="mt-2 max-w-xl font-display text-4xl leading-none text-ivory sm:text-5xl">
          The people behind the work.
        </p>
      </div>
    </section>
  );
}
