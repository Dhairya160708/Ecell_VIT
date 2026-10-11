import { Crest } from "../Logo";
import { Reveal } from "../ui/Reveal";
import { Button } from "../ui/Button";

export function CallToAction({ heading }: { heading: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gold via-[#b8964a] to-moss">
      <Crest className="pointer-events-none absolute -right-16 top-1/2 h-[140%] w-auto -translate-y-1/2 opacity-[0.12] mix-blend-multiply" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-5 py-24 md:flex-row md:items-end lg:px-8 lg:py-32">
        <Reveal>
          <p className="font-grotesk text-xs font-bold uppercase tracking-[0.3em] text-ink/70">
            Dedicate your heart
          </p>
          <h2 className="mt-4 max-w-4xl font-display text-[clamp(3.5rem,9vw,9rem)] text-ink">{heading}</h2>
        </Reveal>
        <Reveal i={1} className="flex shrink-0 flex-wrap gap-3">
          <Button href="/submit" variant="ink">
            Pitch it to us
          </Button>
          <Button
            href="/contact"
            variant="ink"
            arrow={false}
            className="!bg-transparent !text-ink ring-1 ring-ink/40 hover:!bg-ink/10"
          >
            Let&apos;s talk
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
