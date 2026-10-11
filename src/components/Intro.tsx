"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "ecell-intro-seen"; // also read by the pre-paint script in app/layout.tsx
const ease = [0.76, 0, 0.24, 1] as const;

type P = { x: number; y: number; tx: number; ty: number; c: string; d: number; s: number };

/**
 * First-visit intro: gold dust assembles into the crest, the wordmark resolves,
 * then the two "gates" split open onto the site. Click or press any key to skip.
 */
export function Intro() {
  const [phase, setPhase] = useState<"dust" | "gates" | "done">("dust");
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Already seen / reduced motion: the pre-paint script flagged it and CSS keeps the overlay hidden.
    if (document.documentElement.dataset.intro === "seen") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    document.documentElement.style.overflow = "hidden";
    const toGates = setTimeout(() => setPhase("gates"), 2900);
    const skip = () => setPhase((p) => (p === "dust" ? "gates" : p));
    addEventListener("keydown", skip);
    addEventListener("pointerdown", skip);

    const cv = canvas.current!,
      ctx = cv.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = innerWidth,
      H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    let raf = 0;
    const parts: P[] = [];
    const t0 = performance.now();

    const img = new Image();
    img.src = "/brand/crest.webp";
    img.onload = () => {
      const h = Math.min(H * 0.42, 340),
        w = h * (img.width / img.height);
      const off = document.createElement("canvas");
      off.width = Math.round(w);
      off.height = Math.round(h);
      const o = off.getContext("2d")!;
      o.drawImage(img, 0, 0, off.width, off.height);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const step = W < 640 ? 3 : 2.5,
        ox = W / 2 - w / 2,
        oy = H / 2 - h / 2 - 50;
      for (let y = 0; y < off.height; y += step)
        for (let x = 0; x < off.width; x += step) {
          const i = (Math.floor(y) * off.width + Math.floor(x)) * 4;
          if (data[i + 3] < 140) continue;
          const a = Math.random() * Math.PI * 2,
            r = Math.max(W, H) * (0.4 + Math.random() * 0.6);
          parts.push({
            x: W / 2 + Math.cos(a) * r,
            y: H / 2 + Math.sin(a) * r,
            tx: ox + x,
            ty: oy + y,
            c: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`,
            d: Math.random() * 0.5,
            s: Math.random(),
          });
        }
      const tick = (now: number) => {
        const t = (now - t0) / 1000;
        ctx.clearRect(0, 0, W, H);
        for (const p of parts) {
          const k = Math.min(Math.max((t - p.d) / 1.5, 0), 1),
            e = 1 - Math.pow(1 - k, 4);
          const swirl = Math.sin(k * Math.PI) * 60 * (p.s - 0.5);
          const x = p.x + (p.tx - p.x) * e + swirl,
            y = p.y + (p.ty - p.y) * e - swirl * 0.4;
          ctx.globalAlpha = 0.25 + e * 0.75;
          ctx.fillStyle = k < 1 ? (p.s > 0.5 ? "#c7a54f" : "#ead9a6") : p.c;
          ctx.fillRect(x, y, 1.6, 1.6);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    return () => {
      clearTimeout(toGates);
      cancelAnimationFrame(raf);
      removeEventListener("keydown", skip);
      removeEventListener("pointerdown", skip);
    };
  }, []);

  useEffect(() => {
    if (phase !== "gates") return;
    const t = setTimeout(() => {
      setPhase("done");
      document.documentElement.style.overflow = "";
    }, 1300);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <>
      <AnimatePresence>
        {phase !== "done" && (
          <div
            className="intro-overlay fixed inset-0 z-[100] overflow-hidden"
            role="status"
            aria-label="Loading E-Cell VIT"
          >
            {/* the two gates */}
            {[-1, 1].map((dir) => (
              <motion.div
                key={dir}
                className={`absolute inset-y-0 w-1/2 bg-[#070806] ${dir < 0 ? "left-0 border-r" : "right-0 border-l"} border-gold/40`}
                animate={phase === "gates" ? { x: `${dir * 100}%` } : { x: 0 }}
                transition={{ duration: 1.1, ease, delay: 0.15 }}
              >
                <div className="bg-grid absolute inset-0 opacity-30" />
              </motion.div>
            ))}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: phase === "gates" ? 0 : 1, scale: phase === "gates" ? 1.08 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-x-0 bottom-[16%] text-center sm:bottom-[20%]">
                <motion.p
                  initial={{ opacity: 0, letterSpacing: "1.2em" }}
                  animate={{ opacity: 1, letterSpacing: "0.32em" }}
                  transition={{ delay: 1.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif text-4xl font-semibold text-ivory sm:text-6xl"
                >
                  E-CELL
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 0.6 }}
                  className="mt-4 flex items-center justify-center gap-4 font-grotesk text-[10px] font-bold tracking-[0.4em] text-gold sm:text-xs"
                >
                  <span className="h-px w-12 bg-gold" />
                  THE SCOUTS OF VIT
                  <span className="h-px w-12 bg-gold" />
                </motion.div>
              </div>
              <motion.div className="absolute bottom-8 left-1/2 h-px w-40 -translate-x-1/2 bg-line">
                <motion.div
                  className="h-full origin-left bg-gold"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 2.8, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
