"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Eyebrow } from "../ui/Eyebrow";

// Words that get the gold treatment wherever they appear in the oath.
const gold = new Set(["scouts", "walls", "ventures", "build", "builders", "founders"]);

function Word({ w, i, n, p }: { w: string; i: number; n: number; p: MotionValue<number> }) {
  const start = i / n,
    end = start + 1 / n;
  const opacity = useTransform(p, [start, end], [0.12, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={`mr-[0.22em] inline-block ${gold.has(w.toLowerCase().replace(/[^a-z]/g, "")) ? "text-metal" : ""}`}
    >
      {w}
    </motion.span>
  );
}

/** Each word lights up as the section scrolls through the viewport. */
export function Manifesto({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8 lg:py-40">
      <Eyebrow>Our oath</Eyebrow>
      <div ref={ref} className="font-display text-[clamp(2.8rem,7.4vw,7.5rem)] leading-[0.95] text-ivory">
        {words.map((w, i) => (
          <Word key={i} w={w} i={i} n={words.length} p={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
