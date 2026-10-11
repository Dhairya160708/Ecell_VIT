"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Startup } from "@/lib/data";

/** Flips on hover (desktop) or tap (touch). The back face links to the full startup page. */
export function StartupCard({ s, i }: { s: Startup; i: number }) {
  const [flipped, setFlipped] = useState(false);
  const initials = s.founder
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <div className={`flip h-[24rem] w-full sm:h-[26rem] ${flipped ? "is-flipped" : ""}`}>
      <div className="flip-inner">
        <button
          type="button"
          onClick={() => setFlipped(true)}
          aria-label={`Show the idea behind ${s.name}`}
          className="flip-face flex flex-col border border-ink/10 bg-white p-5 text-left"
        >
          <span className="relative block h-52 overflow-hidden bg-ivory-deep">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(199,165,79,.35),transparent_60%)]" />
            {s.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-24 w-24 place-items-center rounded-full border border-ink/15 bg-ivory font-display text-4xl text-ink/40">
                  {initials}
                </span>
              </span>
            )}
            <span className="absolute left-4 top-4 bg-ink px-2.5 py-1 font-grotesk text-[10px] font-bold uppercase tracking-widest text-ivory">
              {s.category}
            </span>
            <span className="absolute bottom-3 right-4 font-display text-6xl leading-none text-ink/10">
              0{i + 1}
            </span>
          </span>
          <span className="mt-auto flex items-end justify-between gap-4">
            <span>
              <span className="block font-grotesk text-[11px] font-bold uppercase tracking-[0.18em] text-moss">
                {s.regId}
              </span>
              <span className="mt-2 block font-display text-5xl text-ink">{s.name}</span>
              <span className="mt-1 block text-sm text-ink/55">Founded by {s.founder}</span>
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-ink">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </span>
        </button>
        <div
          className="flip-face flip-back flex flex-col overflow-hidden border border-gold/40 bg-gradient-to-br from-forest to-elev p-7 text-ivory"
          onClick={() => setFlipped(false)}
        >
          <span className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-gold">
            The idea / 0{i + 1}
          </span>
          <span className="mt-6 font-display text-6xl">{s.name}</span>
          <span className="mt-4 text-lg leading-8 text-ivory/80">{s.pitch}</span>
          <span className="mt-auto flex items-center justify-between border-t border-ivory/15 pt-5">
            <span>
              <span className="block font-grotesk text-[10px] uppercase tracking-widest text-ivory/50">
                Current stage
              </span>
              <span className="mt-1 block text-sm font-semibold">{s.stage}</span>
            </span>
            <Link
              href={`/startups/${s.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-[0.12em] text-gold hover:text-gold-light"
            >
              Full story <ArrowRight className="h-4 w-4" />
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
