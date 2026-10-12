"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StartupCard } from "@/components/StartupCard";
import type { Startup } from "@/types/content";

const statuses = ["All", "Idea", "Building", "Launched"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-gold text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg"}`}
    >
      {active && (
        <motion.span
          layoutId={`chip-${children}`}
          className="absolute inset-0 -z-10 rounded-full bg-gold-soft"
        />
      )}
      {children}
    </button>
  );
}

export function StartupsView({ startups }: { startups: Startup[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(startups.map((s) => s.category).filter(Boolean)))],
    [startups],
  );
  const list = useMemo(
    () =>
      startups.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          (status === "All" || s.status === status) &&
          (s.name + s.pitch + s.founder).toLowerCase().includes(q.toLowerCase()),
      ),
    [startups, q, cat, status],
  );

  return (
    <>
      <PageHeader eyebrow="Startup directory" title="Student ideas," accent="out in the world.">
        A growing record of registered student ventures from Vidyalankar, built across technology, climate,
        finance, health, education, and beyond.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-28">
        <div className="mb-8 flex flex-col gap-4">
          <label className="relative block max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search startups…"
              aria-label="Search startups"
              className="w-full rounded-full border border-line bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_var(--gold-soft)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((s) => (
              <motion.div
                key={s.uid}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <StartupCard s={s} i={startups.indexOf(s)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && (
          <p className="py-20 text-center text-muted">No startups match those filters.</p>
        )}
      </section>
    </>
  );
}
