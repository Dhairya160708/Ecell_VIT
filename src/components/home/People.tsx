import type { Person } from "@/types/content";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";

export function People({ faculty }: { faculty: Person[]; team?: Person[] }) {
  if (!faculty.length) return null;
  return (
    <section id="people" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal>
            <Eyebrow>Guided by experience</Eyebrow>
            <h2 className="font-display text-[clamp(3.2rem,6vw,6rem)] text-ivory">
              Faculty <span className="text-metal">advisors</span>
            </h2>
            <p className="mt-6 max-w-md leading-7 text-muted">
              Supporting student ambition with institutional experience, thoughtful guidance, and access to a
              wider network.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {faculty.map((f, i) => (
              <Reveal key={f.uid} i={i}>
                <article className="group border border-line bg-surface p-4 transition duration-500 hover:border-gold/50">
                  {/* portrait placeholder until faculty photos are provided */}
                  <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-elev">
                    {f.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.photo}
                        alt={f.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="font-display text-8xl text-ivory/10 transition duration-700 group-hover:scale-110 group-hover:text-gold/30">
                        0{i + 1}
                      </span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-forest/60 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                  </div>
                  <h3 className="mt-5 font-grotesk text-lg font-bold text-ivory">{f.name}</h3>
                  <p className="mt-1 font-grotesk text-[11px] font-bold uppercase tracking-widest text-gold">
                    {f.role}
                  </p>
                  <p className="mt-2 text-sm text-muted">{f.dept}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
