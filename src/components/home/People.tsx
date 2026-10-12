import { ArrowUpRight } from "lucide-react";
import type { Person } from "@/types/content";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";

export function People({ faculty, team }: { faculty: Person[]; team: Person[] }) {
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

        <div className="mt-28 border-t border-line pt-16">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Behind the build</Eyebrow>
              <h2 className="font-display text-[clamp(3rem,5.5vw,5.5rem)] text-ivory">E-Cell tech team</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted">
              Students designing the systems, stories, and digital experiences that keep the community
              connected.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.uid} i={i} className="h-full">
                <article className="group relative h-full bg-bg p-7 transition-colors duration-500 hover:bg-elev">
                  <div className="flex items-start justify-between">
                    <span className="font-grotesk text-xs font-bold tracking-[0.2em] text-gold">
                      0{i + 1}
                    </span>
                    {m.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.photo}
                        alt={m.name}
                        className="h-16 w-16 rounded-full object-cover ring-1 ring-gold/40"
                      />
                    )}
                  </div>
                  <h3 className="mt-10 font-display text-4xl text-ivory">{m.name}</h3>
                  <p className="mt-2 text-sm text-muted">{[m.domain, m.role].filter(Boolean).join(" · ")}</p>
                  {(m.linkedin || m.github) && (
                    <p className="mt-5 flex gap-3">
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${m.name} on LinkedIn`}
                          className="flex items-center gap-1 font-grotesk text-[11px] font-bold uppercase tracking-widest text-muted transition hover:text-gold"
                        >
                          LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {m.github && (
                        <a
                          href={m.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${m.name} on GitHub`}
                          className="flex items-center gap-1 font-grotesk text-[11px] font-bold uppercase tracking-widest text-muted transition hover:text-gold"
                        >
                          GitHub <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </p>
                  )}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-full" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
