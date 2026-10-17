"use client";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { submitFeedback } from "@/server/actions/public";
import { timeAgo } from "@/lib/time";
import type { Feedback } from "@/types/content";

const MAX = 500;
const input =
  "w-full border border-line-strong bg-surface px-4 py-3 text-sm text-ivory outline-none transition placeholder:text-subtle focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,165,79,.14)]";

export function FeedbackSection({ slug, initial }: { slug: string; initial: Feedback[] }) {
  const [items, setItems] = useState(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setThanks(false);
    try {
      const r = await submitFeedback(new FormData(form));
      if (r.ok) {
        if (r.feedback.id) setItems((x) => [r.feedback, ...x]);
        form.reset();
        setText("");
        setThanks(true);
      } else setError(r.error);
    } catch {
      setError("We couldn't post your feedback. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="feedback" className="mt-14">
      <h2 id="feedback" className="font-display text-4xl">
        What people think
      </h2>
      <p className="mt-2 text-sm text-muted">Open to everyone at VIT. No sign-up needed.</p>

      <form onSubmit={submit} className="mt-5 grid gap-3 border border-line bg-surface p-5">
        <input type="hidden" name="slug" value={slug} />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <label className="sr-only" htmlFor="fb-body">
          Your feedback
        </label>
        <textarea
          id="fb-body"
          name="body"
          required
          minLength={3}
          maxLength={MAX}
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your opinion or a suggestion…"
          className={`${input} resize-y`}
        />
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="fb-name">
            Your name (optional)
          </label>
          <input
            id="fb-name"
            name="name"
            maxLength={60}
            placeholder="Your name (optional)"
            className={`${input} sm:max-w-xs`}
          />
          <span className="ml-auto text-xs text-subtle">
            {text.length}/{MAX}
          </span>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center bg-gold px-6 py-3 font-grotesk text-sm font-bold uppercase tracking-[0.12em] text-ink transition hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Posting…" : "Post feedback"}
          </button>
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-[#ff8a80]">
            {error}
          </p>
        )}
        {thanks && (
          <p role="status" className="text-sm text-gold">
            Thanks! Your feedback is up.
          </p>
        )}
      </form>

      {items.length === 0 ? (
        <p className="mt-6 flex items-center gap-2 text-muted">
          <MessageCircle className="h-4 w-4 text-gold" /> No feedback yet. Be the first.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((f) => (
            <li key={f.id} className="border border-line bg-surface p-4">
              <p className="whitespace-pre-wrap break-words leading-relaxed text-ivory/90">{f.body}</p>
              <p className="mt-2 text-xs text-subtle">
                <span className="text-muted">{f.name || "Anonymous"}</span> · {timeAgo(f.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
