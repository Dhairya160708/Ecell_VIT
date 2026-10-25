import Link from "next/link";
import type { Person } from "@/types/content";
import { Eyebrow } from "../ui/Eyebrow";
import { Button } from "../ui/Button";

function PersonCard({ m }: { m: Person }) {
  return (
    <Link
      href="/team"
      className="group flex w-[16rem] shrink-0 flex-col border border-line bg-surface p-5 transition hover:border-gold/60 hover:bg-elev"
    >
      <span className="relative block h-48 overflow-hidden bg-elev">
        {m.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.photo}
            alt={m.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-8xl text-ivory/15">
            {m.name.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="mt-4 font-grotesk text-lg font-bold text-ivory">{m.name}</span>
      <span className="mt-1 line-clamp-2 font-grotesk text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
        {[m.domain, m.role].filter(Boolean).join(" · ")}
      </span>
    </Link>
  );
}

/** The student team, scrolling continuously. Pauses on hover/focus and falls back to a wrapping row. */
export function TeamMarquee({ team }: { team: Person[] }) {
  if (!team.length) return null;
  return (
    <section aria-labelledby="team-marquee-heading" className="overflow-hidden border-y border-line py-24">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 md:flex-row md:items-end lg:px-8">
        <div>
          <Eyebrow>Behind the build</Eyebrow>
          <h2 id="team-marquee-heading" className="font-display text-5xl text-ivory sm:text-6xl">
            The people behind the cell
          </h2>
        </div>
        <Button href="/team" variant="ghost">
          Meet the team
        </Button>
      </div>
      <div className="marquee-shell relative mt-10 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
        <div className="marquee-track marquee-track-reverse flex w-max gap-4 px-5 lg:px-8">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className={`flex shrink-0 gap-4 ${copy === 1 ? "marquee-dup" : ""}`}
              aria-hidden={copy === 1}
              inert={copy === 1 ? true : undefined}
            >
              {team.map((m) => (
                <PersonCard key={`${copy}-${m.uid}`} m={m} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
