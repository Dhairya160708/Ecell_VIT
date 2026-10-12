"use client";
import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { applyToListing } from "@/app/actions/public";
import type { Listing } from "@/lib/data";
import { useFocusTrap } from "@/lib/useFocusTrap";

const field =
  "w-full border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_var(--gold-soft)]";

export function MarketplaceView({ listings, names }: { listings: Listing[]; names: Record<string, string> }) {
  const [active, setActive] = useState<Listing | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useCallback(() => {
    setActive(null);
    setSent(false);
    setError("");
  }, []);
  useFocusTrap(!!active, dialog, close, () =>
    active ? document.getElementById(`apply-${active.uid}`) : null,
  );

  // Deep link: /marketplace?apply=<listing id> opens that listing's Apply dialog straight away.
  const wanted = useSearchParams().get("apply");
  const [handled, setHandled] = useState<string | null>(null);
  if (wanted && wanted !== handled) {
    setHandled(wanted); // runs once per link, during render
    const hit = listings.find((l) => l.uid === wanted);
    if (hit) setActive(hit);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await applyToListing(new FormData(e.currentTarget));
      if (r.ok) setSent(true);
      else setError(r.error);
    } catch {
      setError("We couldn't send your application. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* inert while the dialog is open: the page behind it can't be tabbed to or read by a screen reader */}
      <div inert={active ? true : undefined}>
        <PageHeader eyebrow="Marketplace" title="Help" accent="wanted.">
          Showcased startups are looking for students with your skills.
        </PageHeader>
        <section className="mx-auto max-w-6xl px-5 pt-14 pb-28">
          {listings.length === 0 && (
            <p className="py-16 text-center text-muted">No open roles right now. Check back soon.</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((l, i) => (
              <Reveal key={l.uid} i={i}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="border border-line bg-surface p-6 transition-colors hover:border-line-strong"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-3xl">{l.role}</h3>
                      <Link
                        href={`/startups/${l.startupSlug}`}
                        className="text-sm text-muted hover:text-gold"
                      >
                        {names[l.startupSlug] ?? l.startupSlug}
                      </Link>
                    </div>
                    <span className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">
                      {l.compensation}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {l.skills.map((s) => (
                      <span key={s} className="bg-surface-hover px-2 py-1 text-xs text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-subtle">{l.commitment}</span>
                    <Button
                      id={`apply-${l.uid}`}
                      onClick={() => setActive(l)}
                      label={`Apply for ${l.role} at ${names[l.startupSlug] ?? l.startupSlug}`}
                      className="!py-2"
                    >
                      Apply
                    </Button>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              ref={dialog}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="apply-title"
              className="w-full max-w-md border border-line-strong bg-elev p-6"
            >
              <div className="flex items-center justify-between">
                <h2 id="apply-title" className="font-display text-3xl">
                  {sent ? "Application sent" : `Apply: ${active.role}`}
                </h2>
                <button onClick={close} aria-label="Close" className="text-muted hover:text-fg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sent ? (
                <p className="mt-4 text-muted">
                  Thanks! The E-Cell team will pass your pitch to{" "}
                  {names[active.startupSlug] ?? "the founders"}.
                </p>
              ) : (
                <form className="mt-5 space-y-3" onSubmit={submit}>
                  <input type="hidden" name="listingUid" value={active.uid} />
                  <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                  <input required name="name" placeholder="Your name" className={field} />
                  <input required name="email" type="email" placeholder="College email" className={field} />
                  <textarea
                    required
                    name="pitch"
                    rows={4}
                    placeholder="Short pitch: what can you bring?"
                    className={field}
                  />
                  {error && (
                    <p className="text-sm text-[#f0a3a3]" role="alert">
                      {error}
                    </p>
                  )}
                  <Button disabled={busy} className="w-full">
                    {busy ? "Sending…" : "Send application"}
                  </Button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
