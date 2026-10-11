"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { EventCard } from "@/components/EventCard";
import type { EventItem } from "@/lib/data";

const filters = ["All", "Ongoing", "Upcoming", "Past"] as const;

export function EventsView({ events }: { events: EventItem[] }) {
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const list = f === "All" ? events : events.filter((e: EventItem) => e.status === f);
  return (
    <>
      <PageHeader eyebrow="Events & experiences" title="Come curious." accent="Leave building.">
        Workshops, competitions, honest founder conversations, and high-energy campus experiences designed to
        turn interest into action.
      </PageHeader>
      <section className="bg-ivory py-16 text-ink lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap gap-2 border-b border-ink/15 pb-6">
            {filters.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setF(n)}
                className={`relative px-5 py-2.5 font-grotesk text-sm font-bold uppercase tracking-[0.1em] transition ${f === n ? "text-ivory" : "border border-ink/20 text-ink/60 hover:border-ink"}`}
              >
                {f === n && <motion.span layoutId="event-filter" className="absolute inset-0 -z-0 bg-ink" />}
                <span className="relative">{n}</span>
              </button>
            ))}
          </div>
          <motion.div layout className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {list.map((e, i) => (
                <motion.div
                  key={e.uid}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                >
                  <EventCard e={e} i={i} light />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </>
  );
}
