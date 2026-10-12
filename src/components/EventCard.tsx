"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { dayMonth } from "@/lib/utils";
import { type EventItem } from "@/types/content";
import { eventHref, eventStatus } from "@/lib/events";
import { useToday } from "@/lib/useToday";

const badge = {
  Ongoing: "bg-moss/25 text-[#8fd1ac]",
  Upcoming: "bg-gold/15 text-gold",
  Past: "bg-white/10 text-muted",
};
const badgeLight = {
  Ongoing: "bg-moss/15 text-moss",
  Upcoming: "bg-gold/20 text-gold-deep",
  Past: "bg-ink/10 text-ink/70",
};

export function EventCard({ e, i, light = false }: { e: EventItem; i: number; light?: boolean }) {
  const { day, month } = dayMonth(e.date);
  const today = useToday();
  const status = today ? eventStatus(e, today) : null;
  const external = !!e.reportUrl && /^https?:/i.test(e.reportUrl);
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden border p-7 transition duration-500 hover:-translate-y-1.5 ${light ? "border-ink/10 bg-white hover:border-gold" : "border-line bg-elev hover:border-gold/60"}`}
    >
      {/* sweeping gold glint on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
      />
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex flex-col items-center border px-4 py-2 ${light ? "border-ink/15" : "border-line-strong"}`}
        >
          <span className={`font-display text-5xl ${light ? "text-ink" : "text-ivory"}`}>{day}</span>
          <span
            className={`font-grotesk text-[10px] font-bold tracking-[0.24em] ${light ? "text-gold-deep" : "text-gold"}`}
          >
            {month}
          </span>
        </div>
        {/* the status is worked out in the browser from the dates, so it can never go stale */}
        <span
          className={`px-3 py-1 font-grotesk text-[10px] font-bold uppercase tracking-widest ${status ? (light ? badgeLight : badge)[status] : "invisible"}`}
        >
          {status ?? "Upcoming"}
        </span>
      </div>
      <p
        className={`mt-10 font-grotesk text-xs font-semibold uppercase tracking-[0.16em] ${light ? "text-ink/65" : "text-subtle"}`}
      >
        0{i + 1} / {e.category}
      </p>
      <h3 className={`mt-3 font-display text-5xl ${light ? "text-ink" : "text-ivory"}`}>{e.title}</h3>
      <p className={`mt-4 flex-1 text-sm leading-7 ${light ? "text-ink/70" : "text-muted"}`}>{e.summary}</p>
      {e.report && (
        <p
          className={`mt-5 border-t pt-4 text-xs font-semibold ${light ? "border-ink/10 text-ink/70" : "border-line text-gold-light"}`}
        >
          {e.report}
        </p>
      )}
      {/* The whole card is one link (stretched). The report link, when there is one, sits above it. */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <Link
          href={eventHref(e)}
          className={`flex items-center gap-2 font-grotesk text-sm font-bold uppercase tracking-[0.1em] after:absolute after:inset-0 ${light ? "text-gold-deep" : "text-gold"}`}
        >
          Explore event
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          <span className="sr-only">: {e.title}</span>
        </Link>
        {e.reportUrl && (
          <a
            href={e.reportUrl}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`relative z-10 flex items-center gap-1.5 font-grotesk text-xs font-bold uppercase tracking-[0.1em] underline-offset-4 hover:underline ${light ? "text-ink" : "text-ivory"}`}
          >
            Read report
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}
