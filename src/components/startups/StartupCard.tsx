"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Startup } from "@/types/content";

const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/.*$/, "");

/** Flips on hover (desktop) or tap (touch). Both faces link out to the startup's live site when it has one. */
export function StartupCard({ s, i }: { s: Startup; i: number }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const backToggle = useRef<HTMLButtonElement>(null);
  const frontToggle = useRef<HTMLButtonElement>(null);
  const showBack = flipped || hovered;
  const site = s.website && /^https?:\/\//i.test(s.website) ? s.website : undefined;
  return (
    <div
      className={`flip h-[24rem] w-full sm:h-[26rem] ${showBack ? "is-flipped" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flip-inner">
        <div
          aria-hidden={showBack}
          inert={showBack}
          className="flip-face relative flex flex-col border border-ink/10 bg-white p-5 text-left"
        >
          <button
            ref={frontToggle}
            type="button"
            onClick={() => {
              setHovered(false);
              setFlipped(true);
              requestAnimationFrame(() => backToggle.current?.focus());
            }}
            aria-label={`Show the idea behind ${s.name}`}
            className="flex min-h-0 flex-1 flex-col text-left"
          >
            <span className="relative block h-52 w-full shrink-0 overflow-hidden bg-ivory-deep">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(199,165,79,.35),transparent_60%)]" />
              {s.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center p-6 text-center">
                  <span>
                    <span className="block font-grotesk text-[11px] font-bold uppercase tracking-[0.2em] text-ink/65">
                      {s.status} · {s.stage}
                    </span>
                    {site && (
                      <span className="mt-2 block font-display text-3xl text-ink/80">{host(site)}</span>
                    )}
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
            <span className="mt-auto block pr-14">
              <span className="block font-grotesk text-[11px] font-bold uppercase tracking-[0.18em] text-moss">
                {s.regId}
              </span>
              <span className="mt-2 block font-display text-5xl text-ink">{s.name}</span>
              <span className="mt-1 block text-sm text-ink/65">Founded by {s.founder}</span>
            </span>
          </button>
          {site ? (
            <a
              href={site}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${s.name} (opens in a new tab)`}
              className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-gold text-ink transition hover:bg-gold-light"
            >
              <ArrowUpRight className="h-5 w-5" />
            </a>
          ) : (
            <Link
              href={`/startups/${s.slug}`}
              aria-label={`Read the story of ${s.name}`}
              className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-gold text-ink transition hover:bg-gold-light"
            >
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          )}
        </div>
        <div
          aria-hidden={!showBack}
          inert={!showBack}
          className="flip-back flip-face flex flex-col overflow-hidden border border-gold/40 bg-gradient-to-br from-forest to-elev p-7 text-ivory"
        >
          <button
            ref={backToggle}
            type="button"
            aria-label={`Show ${s.name} startup details`}
            onClick={() => {
              setFlipped(false);
              setHovered(false);
              requestAnimationFrame(() => frontToggle.current?.focus());
            }}
            className="absolute right-5 top-5 z-10 font-grotesk text-xs font-bold uppercase tracking-[0.12em] text-gold hover:text-gold-light"
          >
            Back
          </button>
          <span className="font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-gold">
            The idea / 0{i + 1}
          </span>
          <span className="mt-6 font-display text-6xl">{s.name}</span>
          <span className="mt-4 text-lg leading-8 text-ivory/80">{s.pitch}</span>
          <span className="mt-auto flex items-center justify-between gap-3 border-t border-ivory/15 pt-5">
            <span>
              <span className="block font-grotesk text-[10px] uppercase tracking-widest text-ivory/60">
                Current stage
              </span>
              <span className="mt-1 block text-sm font-semibold">{s.stage}</span>
            </span>
            <span className="flex flex-col items-end gap-2">
              {site && (
                <a
                  href={site}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-[0.12em] text-gold hover:text-gold-light"
                >
                  Visit site <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <Link
                href={`/startups/${s.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-[0.12em] text-ivory/80 hover:text-gold-light"
              >
                Full story <ArrowRight className="h-4 w-4" />
              </Link>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
