import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getContent } from "@/server/content";
import type { Person } from "@/types/content";

export const metadata = { title: "Our team · E-Cell VIT" };

function Avatar({ p, className }: { p: Person; className: string }) {
  return p.photo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.photo} alt={p.name} className={`${className} object-cover`} />
  ) : (
    <span className={`${className} grid place-items-center bg-elev font-display text-ivory/30`}>
      {p.name.slice(0, 1)}
    </span>
  );
}

const profileCls =
  "inline-flex items-center gap-1 font-grotesk text-[11px] font-bold uppercase tracking-widest text-muted transition hover:text-gold";

export default async function Team() {
  const { faculty, team } = await getContent();
  const domains = [...new Set(team.map((m) => m.domain || "Core team"))];
  return (
    <>
      <PageHeader eyebrow="The people" title="Our" accent="team.">
        The faculty who guide E-Cell and the students who run it.
      </PageHeader>
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-28 lg:px-8">
        {faculty.length > 0 && (
          <div>
            <Eyebrow>Guided by experience</Eyebrow>
            <h2 className="font-display text-5xl text-ivory">Faculty advisors</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {faculty.map((f, i) => (
                <Reveal key={f.uid} i={i % 4}>
                  <article className="group border border-line bg-surface p-4 transition duration-500 hover:border-gold/50">
                    <div className="aspect-[4/5] overflow-hidden">
                      <Avatar
                        p={f}
                        className="h-full w-full text-8xl transition duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mt-5 font-grotesk text-lg font-bold text-ivory">{f.name}</h3>
                    <p className="mt-1 font-grotesk text-[11px] font-bold uppercase tracking-widest text-gold">
                      {f.role}
                    </p>
                    {f.dept && <p className="mt-2 text-sm text-muted">{f.dept}</p>}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {domains.map((domain, d) => (
          <div
            key={domain}
            className={d === 0 && faculty.length === 0 ? "" : "mt-24 border-t border-line pt-14"}
          >
            <Eyebrow>Student team</Eyebrow>
            <h2 className="font-display text-5xl text-ivory">{domain}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {team
                .filter((m) => (m.domain || "Core team") === domain)
                .map((m, i) => (
                  <Reveal key={m.uid} i={i % 4}>
                    <article className="group relative h-full border border-line bg-surface p-6 transition duration-500 hover:border-gold/50">
                      <Avatar p={m} className="h-20 w-20 rounded-full text-4xl ring-1 ring-gold/40" />
                      <h3 className="mt-6 font-grotesk text-lg font-bold text-ivory">{m.name}</h3>
                      <p className="mt-1 font-grotesk text-[11px] font-bold uppercase tracking-widest text-gold">
                        {m.role}
                      </p>
                      {(m.linkedin || m.github) && (
                        <p className="mt-4 flex gap-4">
                          {m.linkedin && (
                            <a
                              href={m.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${m.name} on LinkedIn`}
                              className={profileCls}
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
                              className={profileCls}
                            >
                              GitHub <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </p>
                      )}
                    </article>
                  </Reveal>
                ))}
            </div>
          </div>
        ))}

        {faculty.length === 0 && team.length === 0 && (
          <p className="border border-line bg-surface p-10 text-center text-muted">
            Team profiles are coming soon.
          </p>
        )}
      </section>
    </>
  );
}
