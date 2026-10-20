import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContent } from "@/server/content";
import { longDate } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

// params are read inside <Suspense> so navigations stay instant under Cache Components.
export default function PostPage({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-svh max-w-3xl px-5 pt-32">
          <div className="h-28 w-2/3 animate-pulse bg-surface" />
        </div>
      }
    >
      <Post params={params} />
    </Suspense>
  );
}

async function Post({ params }: { params: Params }) {
  const { slug } = await params;
  const { posts } = await getContent();
  const p = posts.find((x) => x.slug === slug);
  if (!p) notFound();
  const paragraphs = p.body.split(/\n{2,}/).filter((t) => t.trim());

  return (
    <article className="mx-auto max-w-3xl px-5 pb-28 pt-32">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> All posts
      </Link>
      <p className="font-grotesk text-xs font-bold uppercase tracking-widest text-gold">
        {longDate(p.date)}
        {p.author && <span className="text-subtle"> · {p.author}</span>}
      </p>
      <h1 className="mt-4 font-display text-6xl leading-[0.95] sm:text-8xl">{p.title}</h1>
      <p className="mt-5 text-xl text-muted">{p.summary}</p>
      {p.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.cover} alt="" className="mt-10 aspect-[16/9] w-full border border-line object-cover" />
      )}
      <div className="mt-10 space-y-6 text-lg leading-8 text-fg/90">
        {paragraphs.map((t, i) => (
          <p key={i} className="whitespace-pre-line">
            {t.trim()}
          </p>
        ))}
      </div>
    </article>
  );
}
