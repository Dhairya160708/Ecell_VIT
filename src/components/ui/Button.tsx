"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Props = {
  href?: string;
  variant?: "primary" | "ghost" | "ink";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  arrow?: boolean;
};

const styles = {
  primary: "bg-gold text-ink hover:bg-gold-light",
  ghost: "border border-line-strong text-ivory hover:border-gold hover:text-gold",
  ink: "bg-ink text-ivory hover:bg-black",
};

// Magnetic: the button leans toward the cursor while hovered.
export function Button({
  href,
  variant = "primary",
  children,
  onClick,
  className = "",
  arrow = true,
}: Props) {
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const move = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.25);
    y.set((e.clientY - r.top - r.height / 2) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  const cls = `group relative inline-flex items-center justify-center gap-2.5 overflow-hidden px-7 py-3.5 font-grotesk text-sm font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${styles[variant]} ${className}`;
  const inner = (
    <>
      <span className="relative">{children}</span>
      {arrow && (
        <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );
  return (
    <motion.span
      style={{ x, y }}
      onMouseMove={move}
      onMouseLeave={reset}
      whileTap={{ scale: 0.96 }}
      className="inline-block"
    >
      {href ? (
        <Link href={href} className={cls}>
          {inner}
        </Link>
      ) : (
        <button type={onClick ? "button" : "submit"} onClick={onClick} className={cls}>
          {inner}
        </button>
      )}
    </motion.span>
  );
}
