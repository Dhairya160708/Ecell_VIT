"use client";
import { motion, useScroll, useSpring } from "framer-motion";

// Thin gold rail on the right edge that fills as the page scrolls.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <div aria-hidden className="fixed right-0 top-0 z-[60] hidden h-svh w-[3px] bg-line md:block">
      <motion.div
        style={{ scaleY }}
        className="h-full w-full origin-top bg-gradient-to-b from-gold-light via-gold to-moss"
      />
    </div>
  );
}
