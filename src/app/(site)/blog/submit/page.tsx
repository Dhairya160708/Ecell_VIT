import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubmitBlogForm } from "@/components/blog/SubmitBlogForm";

export const metadata = {
  title: "Submit a blog · E-Cell VIT",
  description: "Share a story, lesson or idea with the E-Cell VIT community.",
};

export default function SubmitBlog() {
  return (
    <>
      <PageHeader eyebrow="Write for E-Cell" title="Put your" accent="ideas in print.">
        Share a story, a lesson from building, or a perspective the Vidyalankar community should read.
      </PageHeader>
      <section className="mx-auto max-w-3xl px-5 pb-28 pt-14">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the blog
        </Link>
        <div className="mb-8 grid gap-3 border border-line bg-elev p-5 text-sm text-muted sm:grid-cols-3">
          <p>
            <span className="block font-grotesk text-xs font-bold uppercase tracking-widest text-gold">
              Original work
            </span>
            Write in your own words.
          </p>
          <p>
            <span className="block font-grotesk text-xs font-bold uppercase tracking-widest text-gold">
              Reviewed
            </span>
            A human on the team reads every post.
          </p>
          <p>
            <span className="block font-grotesk text-xs font-bold uppercase tracking-widest text-gold">
              Your name
            </span>
            Approved posts are credited to you.
          </p>
        </div>
        <SubmitBlogForm />
      </section>
    </>
  );
}
