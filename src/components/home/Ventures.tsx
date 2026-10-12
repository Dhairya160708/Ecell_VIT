import type { Startup } from "@/lib/data";
import { StartupCard } from "../StartupCard";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";

export function Ventures({ startups }: { startups: Startup[] }) {
  return (
    <section className="relative bg-ivory py-24 text-ink lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow className="!text-moss [&>span]:!bg-moss">Built at Vidyalankar</Eyebrow>
            <h2 className="max-w-3xl font-display text-[clamp(3.2rem,7vw,6.5rem)]">
              Meet the ventures <span className="text-outline-ink">taking shape.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-ink/65">
            Hover or tap a card to discover the idea behind it.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {startups.slice(0, 3).map((s, i) => (
            <Reveal key={s.slug} i={i}>
              <StartupCard s={s} i={i} />
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12 text-center">
          <Button href="/startups" variant="ink">
            Explore the startup directory
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
