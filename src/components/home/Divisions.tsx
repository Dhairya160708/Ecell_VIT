"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Division } from "@/types/content";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { Crest } from "../layout/Logo";

const numberWord = (n: number) =>
  ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"][n] ?? String(n);

/** The divisions as an expanding accordion: horizontal on desktop, stacked on mobile. */
export function Divisions({ divisions }: { divisions: Division[] }) {
  const [active, setActive] = useState(0);
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-28 lg:px-8 lg:py-36">
      <Reveal className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Eyebrow>The regiment</Eyebrow>
          <h2 className="font-display text-[clamp(3.2rem,7vw,6.5rem)] text-ivory">
            {numberWord(divisions.length)} divisions.
            <br />
            <span className="text-metal">One mission.</span>
          </h2>
        </div>
        <p className="max-w-sm text-muted">
          Every scout belongs to a division. Hover, tap, or tab through to see what each one owns.
        </p>
      </Reveal>

      <div className="flex h-auto flex-col gap-2 lg:h-[30rem] lg:flex-row">
        {divisions.map((d, i) => {
          const on = active === i;
          return (
            <motion.button
              key={d.uid}
              type="button"
              layout
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-expanded={on}
              transition={{ type: "spring", stiffness: 200, damping: 28 }}
              className={`group relative overflow-hidden border text-left transition-colors duration-500 ${on ? "border-gold/60 bg-gradient-to-br from-forest to-elev lg:flex-[5]" : "border-line bg-surface hover:border-line-strong lg:flex-1"}`}
            >
              {d.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.photo}
                  alt=""
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${on ? "opacity-25" : "opacity-10"}`}
                />
              )}
              {on && (
                <Crest className="pointer-events-none absolute -bottom-10 -right-8 h-72 w-auto opacity-[0.12]" />
              )}
              <div className="relative flex h-full flex-row items-center justify-between gap-6 p-6 lg:flex-col lg:items-start">
                <span
                  className={`font-grotesk text-xs font-bold tracking-[0.2em] ${on ? "text-gold" : "text-subtle"}`}
                >
                  0{i + 1}
                </span>
                <span
                  className={`font-display text-4xl transition-colors lg:text-6xl ${on ? "text-ivory" : "text-muted lg:[writing-mode:vertical-rl] lg:rotate-180"}`}
                >
                  {d.name}
                </span>
                <motion.span
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : 12 }}
                  transition={{ delay: on ? 0.2 : 0 }}
                  className="hidden max-w-xs text-sm leading-6 text-muted lg:block"
                >
                  {d.line}
                </motion.span>
              </div>
              {on && <p className="relative px-6 pb-6 text-sm leading-6 text-muted lg:hidden">{d.line}</p>}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
