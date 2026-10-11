import Image from "next/image";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { Counter } from "../ui/Counter";
import type { Stat } from "@/lib/data";

export function AboutCell({ lead, body, stats }: { lead: string; body: string; stats: Stat[] }) {
  return (
    <section className="relative bg-ivory py-24 text-ink lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <Reveal>
          <Eyebrow className="!text-moss [&>span]:!bg-moss">About the cell</Eyebrow>
          <h2 className="font-display text-[clamp(3.5rem,8vw,7.5rem)] text-ink">
            Where builders find their <span className="text-outline-ink">beginning.</span>
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <p className="text-lg leading-8 text-ink/80">{lead}</p>
            <p className="leading-7 text-ink/60">{body}</p>
          </div>
        </Reveal>
        <Reveal i={1} className="relative mx-auto w-full max-w-sm">
          {/* the official poster, presented like a framed banner */}
          <div className="relative rotate-[2deg] border border-ink/15 bg-ink p-3 shadow-[0_40px_80px_-20px_rgba(11,14,17,.55)] transition-transform duration-700 hover:rotate-0">
            <Image
              src="/brand/poster.jpg"
              alt="E-Cell, the Scouts of VIT poster"
              width={512}
              height={768}
              className="h-auto w-full"
            />
            <span className="absolute -left-3 -top-3 bg-gold px-3 py-1 font-grotesk text-[10px] font-bold uppercase tracking-[0.2em] text-ink">
              Est. Wadala
            </span>
          </div>
        </Reveal>
      </div>
      <div className="mx-auto mt-20 grid max-w-7xl grid-cols-2 border-y border-ink/15 px-5 lg:grid-cols-4 lg:px-8">
        {stats.map(({ value: n, label, uid }, i) => (
          <div
            key={uid}
            className={`py-8 ${i % 2 ? "pl-6" : ""} ${i > 0 ? "lg:border-l lg:border-ink/15 lg:pl-8" : ""} ${i % 2 ? "border-l border-ink/15" : ""}`}
          >
            <Counter value={n} className="block font-display text-7xl text-ink lg:text-8xl" />
            <p className="mt-2 font-grotesk text-xs font-bold uppercase tracking-[0.16em] text-moss">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
