import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Startup } from "@/types/content";
import { Eyebrow } from "../ui/Eyebrow";
import { Button } from "../ui/Button";

function Logo({ s }: { s: Startup }) {
  if (s.photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={s.photo} alt="" loading="lazy" className="h-14 w-14 rounded-xl object-cover" />;
  }
  return (
    <span
      aria-hidden
      className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold/10 font-display text-3xl text-gold"
    >
      {s.name.slice(0, 1)}
    </span>
  );
}

function Card({ s }: { s: Startup }) {
  return (
    <Link
      href={`/startups/${s.slug}`}
      className="group flex w-[19rem] shrink-0 items-center gap-4 border border-line bg-surface p-4 transition hover:border-gold/60 hover:bg-elev sm:w-[22rem]"
    >
      <Logo s={s} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-grotesk text-lg font-bold text-ivory">{s.name}</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gold opacity-0 transition group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted">
          {s.pitch || "A student venture from Vidyalankar."}
        </span>
        {s.category && (
          <span className="mt-2 block font-grotesk text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
            {s.category}
          </span>
        )}
      </span>
    </Link>
  );
}

/** Continuous, accessible startup showcase. The second copy is hidden from assistive technology. */
export function StartupMarquee({ startups }: { startups: Startup[] }) {
  if (!startups.length) return null;
  return (
    <section aria-labelledby="startup-marquee-heading" className="overflow-hidden py-24 lg:py-28">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 md:flex-row md:items-end lg:px-8">
        <div>
          <Eyebrow>Built at Vidyalankar</Eyebrow>
          <h2 id="startup-marquee-heading" className="font-display text-5xl text-ivory sm:text-6xl">
            Ventures in motion
          </h2>
        </div>
        <Button href="/startups" variant="ghost">
          All startups
        </Button>
      </div>
      <div className="marquee-shell relative mt-10 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
        <div className="marquee-track flex w-max gap-4 px-5 lg:px-8">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className={`flex shrink-0 gap-4 ${copy === 1 ? "marquee-dup" : ""}`}
              aria-hidden={copy === 1}
              inert={copy === 1 ? true : undefined}
            >
              {startups.map((s) => (
                <Card key={`${copy}-${s.uid}`} s={s} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
