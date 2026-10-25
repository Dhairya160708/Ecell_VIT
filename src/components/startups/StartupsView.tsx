"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StartupCard } from "@/components/startups/StartupCard";
import { Button } from "@/components/ui/Button";
import type { Startup } from "@/types/content";

const statuses = ["All", "Idea", "Building", "Launched"];
const PAGE_SIZE = 12;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-gold text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg"}`}
    >
      {active && (
        <motion.span
          layoutId={`startup-chip-${children}`}
          className="absolute inset-0 -z-10 rounded-full bg-gold-soft"
        />
      )}
      {children}
    </button>
  );
}

export function StartupsView({
  startups,
  initialCategory = "All",
  domain,
}: {
  startups: Startup[];
  initialCategory?: string;
  domain?: string;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(initialCategory);
  const [status, setStatus] = useState("All");
  const [limit, setLimit] = useState(PAGE_SIZE);
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
          (s.name + s.pitch + s.founder + s.category).toLowerCase().includes(q.toLowerCase()),
      ),
    [startups, q, cat, status],
  );
  const visible = list.slice(0, limit);

  const chooseCategory = (next: string) => {
    setCat(next);
    setLimit(PAGE_SIZE);
  };

  return (
    <>
      <PageHeader
        eyebrow={domain ? "Startup domain" : "Startup directory"}
        title={domain ? "Startups in" : "Student ideas,"}
        accent={domain ?? "out in the world."}
      >
        {domain
          ? `Student ventures at Vidyalankar working in ${domain}.`
          : "A growing record of registered student ventures from Vidyalankar, built across technology, climate, finance, health, education, and beyond."}
      </PageHeader>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-28 lg:px-8">
        {domain && (
          <Link
            href="/startups"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" /> All startups
          </Link>
        )}
        <div className="mb-8 flex flex-col gap-4">
          <label className="relative block max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="Search startups…"
              aria-label="Search startups"
              className="w-full rounded-full border border-line bg-surface py-3 pl-11 pr-4 text-sm outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_var(--gold-soft)]"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => chooseCategory(c)}>
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
          <p className="text-sm text-subtle" role="status" aria-live="polite">
            {list.length} startup{list.length === 1 ? "" : "s"}
            {cat !== "All" ? ` in ${cat}` : ""}
            {status !== "All" ? ` · ${status}` : ""}
          </p>
        </div>
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((s) => (
              <motion.div
                key={s.uid}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <StartupCard s={s} i={list.indexOf(s)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && (
          <p className="py-20 text-center text-muted">
            No startups match those filters.
            {domain && (
              <>
                {" "}
                <Link href="/startups" className="text-gold hover:text-gold-light">
                  Browse all startups
                </Link>
                .
              </>
            )}
          </p>
        )}
        {list.length > limit && (
          <div className="mt-12 flex justify-center">
            <Button onClick={() => setLimit((n) => n + PAGE_SIZE)} arrow={false}>
              Load more startups ({list.length - limit} remaining)
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
