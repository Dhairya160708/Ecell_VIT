import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { VideoEmbed } from "@/components/startups/VideoEmbed";
import { FeedbackSection } from "@/components/startups/FeedbackSection";
import { getContent, listPublicFeedback } from "@/server/content";

type Params = Promise<{ slug: string }>;

// params are read inside <Suspense> so navigations stay instant under Cache Components.
export default function StartupPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-svh max-w-4xl px-5 pt-32">
          <div className="h-28 w-2/3 animate-pulse bg-surface" />
        </div>
      }
    >
      <StartupDetail params={params} />
    </Suspense>
  );
}

// Feedback is live data (new comments appear immediately), so it is read per request, outside the cached content.
async function Feedback({ slug }: { slug: string }) {
  await connection();
  const initial = await listPublicFeedback(slug).catch((e) => {
    console.error("could not load feedback", e);
    return [];
  });
  return <FeedbackSection slug={slug} initial={initial} />;
}

async function StartupDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const { startups, listings } = await getContent();
  const s = startups.find((x) => x.slug === slug);
  if (!s) notFound();
  const open = listings.filter((l) => l.startupSlug === s.slug);

  return (
    <article className="mx-auto max-w-4xl px-5 pb-28 pt-32">
      <Link
        href="/startups"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> All startups
      </Link>
      <Reveal>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full border border-line px-3 py-1 text-muted">{s.category}</span>
          <span className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {s.status}
          </span>
        </div>
        <h1 className="mt-5 font-display text-7xl sm:text-9xl">{s.name}</h1>
        <p className="mt-4 text-xl text-muted">{s.pitch}</p>
        <p className="mt-6 text-sm text-subtle">
          Founded by <span className="text-fg">{s.founder}</span>
        </p>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {[
          ["Problem", s.problem],
          ["Solution", s.solution],
        ].map(([t, body], i) => (
          <Reveal key={t} i={i}>
            <div className="h-full rounded-none border border-line bg-surface p-6">
              <h2 className="font-display text-3xl">{t}</h2>
              <p className="mt-3 leading-relaxed text-muted">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <VideoEmbed url={s.video} name={s.name} />
      <Reveal className="mt-14">
        <h2 className="font-display text-4xl">Help wanted</h2>
        {open.length === 0 ? (
          <p className="mt-3 text-muted">No open roles right now.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {open.map((l) => (
              <li
                key={l.uid}
                className="flex items-center justify-between rounded-none border border-line bg-surface p-4"
              >
                <div>
                  <p className="font-medium">{l.role}</p>
                  <p className="text-sm text-muted">
                    {l.commitment} · {l.compensation}
                  </p>
                </div>
                <Button
                  href={`/marketplace?apply=${l.uid}`}
                  label={`Apply for ${l.role}`}
                  variant="ghost"
                  className="!py-2"
                >
                  Apply
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
      <Suspense fallback={<div className="mt-14 h-64 animate-pulse bg-surface" />}>
        <Feedback slug={s.slug} />
      </Suspense>
    </article>
  );
}
