import { ArrowUpRight, CalendarClock, Landmark, Users, Wallet, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getContent } from "@/server/content";

export const metadata = { title: "Government grants · E-Cell VIT" };

export default async function Grants() {
  const { grants } = await getContent();
  return (
    <>
      <PageHeader eyebrow="Funding" title="Government" accent="grants.">
        Schemes and grants that can fund your venture, collected by the E-Cell team. Always confirm details on
        the official site before applying.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-28">
        {grants.length === 0 ? (
          <p className="border border-line bg-surface p-10 text-center text-muted">
            We&rsquo;re compiling the list. Check back soon.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {grants.map((g, i) => {
              const facts: [LucideIcon, string, string][] = [
                [Wallet, "Funding", g.amount],
                [CalendarClock, "Deadline", g.deadline],
                [Users, "Who can apply", g.eligibility],
              ];
              return (
                <Reveal key={g.uid} i={i % 2} className="h-full">
                  <article className="flex h-full flex-col border border-line bg-surface p-7">
                    <div className="flex items-start gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gold/40 text-gold">
                        <Landmark className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="font-display text-4xl leading-[0.95] text-ivory">{g.name}</h2>
                        {g.agency && (
                          <p className="mt-2 font-grotesk text-[11px] font-bold uppercase tracking-widest text-gold">
                            {g.agency}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-muted">{g.summary}</p>
                    <dl className="mt-5 flex-1 space-y-2.5 border-t border-line pt-5 text-sm">
                      {facts.map(
                        ([Icon, label, value]) =>
                          value && (
                            <div key={label} className="flex gap-3">
                              <dt className="flex w-36 shrink-0 items-start gap-2 text-subtle">
                                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                                {label}
                              </dt>
                              <dd className="text-fg/90">{value}</dd>
                            </div>
                          ),
                      )}
                    </dl>
                    {g.url && (
                      <a
                        href={g.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex items-center gap-1.5 self-start font-grotesk text-xs font-bold uppercase tracking-widest text-gold transition hover:text-gold-light"
                      >
                        Learn more <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
