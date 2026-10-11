"use client";
import { motion } from "framer-motion";

// Scroll-triggered fade/slide; `i` staggers siblings. Reduced motion is flattened by the global CSS rule.
export function Reveal({
  children,
  i = 0,
  className,
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
