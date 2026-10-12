"use client";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { EventItem } from "@/types/content";
import { sortEvents } from "@/lib/events";
import { useToday } from "@/hooks/use-today";
import { EventCard } from "../events/EventCard";
import { Eyebrow } from "../ui/Eyebrow";
import { Button } from "../ui/Button";

/** Vertical scroll drives a horizontal rail of event cards while the section stays pinned. */
export function EventsRail({ events }: { events: EventItem[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const today = useToday();
  const sorted = useMemo(() => sortEvents(events, today), [events, today]);

  useLayoutEffect(() => {
    const measure = () => track.current && setDistance(Math.max(track.current.scrollWidth - innerWidth, 0));
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, -distance]), { stiffness: 140, damping: 30 });
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={section} style={{ height: `calc(100svh + ${distance}px)` }} className="relative bg-bg">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div
          aria-hidden
          className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-moss/30 blur-[120px]"
        />
        <motion.div
          ref={track}
          style={{ x }}
          className="relative flex w-max items-stretch gap-6 px-5 lg:px-8"
        >
          <div className="flex w-[min(86vw,30rem)] shrink-0 flex-col justify-center pr-6">
            <Eyebrow>What&apos;s happening</Eyebrow>
            <h2 className="font-display text-[clamp(3.5rem,7vw,7rem)] text-ivory">
              Come curious.
              <br />
              <span className="text-metal">Leave building.</span>
            </h2>
            <p className="mt-6 max-w-sm text-muted">
              Workshops, competitions, honest founder conversations, and high-energy campus experiences
              designed to turn interest into action.
            </p>
            <div className="mt-8">
              <Button href="/events" variant="ghost">
                All events
              </Button>
            </div>
          </div>
          {sorted.map((e, i) => (
            <div key={e.uid} className="w-[min(82vw,24rem)] shrink-0">
              <EventCard e={e} i={i} />
            </div>
          ))}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
        <div className="absolute bottom-10 left-5 right-5 mx-auto h-px max-w-7xl bg-line lg:left-8 lg:right-8">
          <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-gold" />
        </div>
      </div>
    </section>
  );
}
