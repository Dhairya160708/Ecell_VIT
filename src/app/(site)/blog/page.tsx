import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getContent } from "@/server/content";
import { longDate } from "@/lib/utils";

export const metadata = { title: "Blog · E-Cell VIT" };

export default async function Blog() {
  const { posts } = await getContent();
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader eyebrow="Stories & updates" title="The" accent="E-Cell blog.">
        Notes from our faculty and team on building, learning and launching at Vidyalankar.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-28">
        {sorted.length === 0 ? (
          <p className="border border-line bg-surface p-10 text-center text-muted">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p, i) => (
              <Reveal key={p.uid} i={i % 3} className="h-full">
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex h-full flex-col border border-line bg-surface transition duration-500 hover:border-gold/50"
                >
                  {p.cover && (
                    <div className="aspect-[16/9] overflow-hidden bg-elev">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.cover}
                        alt=""
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="font-grotesk text-[11px] font-bold uppercase tracking-widest text-gold">
                      {longDate(p.date)}
                      {p.author && <span className="text-subtle"> · {p.author}</span>}
                    </p>
                    <h2 className="mt-3 font-display text-4xl leading-[0.95] text-ivory">{p.title}</h2>
                    <p className="mt-3 flex-1 text-sm leading-6 text-muted">{p.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-1 font-grotesk text-xs font-bold uppercase tracking-widest text-gold">
                      Read post <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
