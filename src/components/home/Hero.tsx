"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Crest } from "../layout/Logo";
import { Button } from "../ui/Button";

const ease = [0.22, 1, 0.36, 1] as const;
const line = "block whitespace-nowrap font-display text-[clamp(4.5rem,15.5vw,16rem)]";

/** Rotating seal text around the crest. */
function Seal() {
  const text = "DEDICATE YOUR HEART ✦ E-CELL VIT ✦ BEYOND THE WALLS ✦ ";
  return (
    <svg viewBox="0 0 200 200" className="animate-spin-slow absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <path id="seal" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0" />
      </defs>
      <circle cx="100" cy="100" r="97" fill="none" stroke="rgba(199,165,79,.25)" strokeWidth=".4" />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="rgba(199,165,79,.18)"
        strokeWidth=".4"
        strokeDasharray="1 3"
      />
      <text fill="#c7a54f" fontSize="7.4" letterSpacing="3.1" fontFamily="var(--font-space)" fontWeight="700">
        <textPath href="#seal">{text}</textPath>
      </text>
    </svg>
  );
}

export function Hero({ kicker, tagline }: { kicker: string; tagline: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Phones: the headline fills the screen width, so keep the scroll-apart travel small enough that it never leaves the viewport.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const travel = narrow ? 7 : 38;
  const left = useTransform(p, [0, 1], ["0%", `-${travel}%`]);
  const right = useTransform(p, [0, 1], ["0%", `${travel}%`]);
  const crestScale = useTransform(p, [0, 0.7], [1, 1.9]);
  const crestY = useTransform(p, [0, 1], ["0%", "40%"]);
  const fade = useTransform(p, [0.35, 0.8], [1, 0]);
  const floor = useTransform(p, [0, 1], ["0px", "400px"]);

  // Crest tilts toward the cursor.
  const mx = useMotionValue(0),
    my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 120, damping: 16 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 16 });
  const onMove = (e: React.MouseEvent) => {
    mx.set(e.clientX / innerWidth - 0.5);
    my.set(e.clientY / innerHeight - 0.5);
  };

  return (
    <section ref={ref} className="relative h-[190vh]" onMouseMove={onMove}>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        {/* atmosphere: forest glow, perspective floor, vignette */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,rgba(47,107,77,.38),transparent_70%)]"
        />
        <div aria-hidden className="absolute inset-x-[-50%] bottom-0 h-[55%] [perspective:500px]">
          <motion.div
            style={{ backgroundPositionY: floor }}
            className="bg-grid absolute inset-0 origin-bottom [transform:rotateX(62deg)] [mask-image:linear-gradient(to_top,#000_10%,transparent_85%)]"
          />
        </div>
        <div
          aria-hidden
          className="absolute left-1/2 top-[42%] h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[100px]"
        />

        <motion.div style={{ opacity: fade }} className="relative z-10 flex flex-1 flex-col pt-28">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mx-auto flex items-center gap-3 px-5 text-center font-grotesk text-[11px] font-bold uppercase tracking-[0.3em] text-gold sm:text-xs"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
            {kicker}
          </motion.p>

          {/* headline sits behind the crest */}
          <h1 className="relative mt-6 flex flex-1 flex-col items-center justify-center text-center sm:mt-0">
            <span className="sr-only">Create. Entrepreneur. Innovate.</span>
            <motion.span
              aria-hidden
              style={{ x: left }}
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1.1, ease }}
              className={`${line} text-ivory`}
            >
              Create.
            </motion.span>
            <motion.span
              aria-hidden
              style={{ x: right }}
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 1.1, ease }}
              className={`${line} text-metal`}
            >
              Entrepreneur.
            </motion.span>
            <motion.span
              aria-hidden
              style={{ x: left }}
              initial={{ y: "60%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 1.1, ease }}
              className={`${line} text-outline`}
            >
              Innovate.
            </motion.span>

            <motion.div
              style={{ scale: crestScale, y: crestY }}
              className="pointer-events-none relative z-30 order-first -mb-1 [perspective:900px] sm:absolute sm:left-1/2 sm:top-1/2 sm:mb-0 sm:-translate-x-1/2 sm:-translate-y-1/2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 1.4, ease }}
                style={{ rotateX: rx, rotateY: ry }}
                className="relative grid h-[min(46vmin,440px)] w-[min(46vmin,440px)] sm:h-[min(52vmin,440px)] sm:w-[min(52vmin,440px)] place-items-center"
              >
                {/* dark halo so the crest reads cleanly over the headline */}
                <span
                  aria-hidden
                  className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(9,10,8,.92)_35%,rgba(9,10,8,.6)_55%,transparent_70%)]"
                />
                <Seal />
                <Crest
                  priority
                  className="animate-float relative h-[64%] w-auto drop-shadow-[0_20px_60px_rgba(0,0,0,.9)]"
                />
              </motion.div>
            </motion.div>
          </h1>

          <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-5 pb-10 sm:flex-row sm:items-end lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className="max-w-sm text-base leading-relaxed text-muted sm:text-lg"
            >
              {tagline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25, duration: 0.8 }}
              className="flex flex-wrap gap-3"
            >
              <Button href="/startups">Explore ventures</Button>
              <Button href="/submit" variant="ghost" arrow={false}>
                Pitch your idea
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: fade }}
          className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-grotesk text-[10px] uppercase tracking-[0.3em] text-subtle lg:flex"
        >
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-gold"
              animate={{ y: [-16, 40] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
            />
          </span>
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
