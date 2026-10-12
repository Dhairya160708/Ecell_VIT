"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, MapPin } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { sendMessage } from "@/server/actions/public";

const field =
  "mt-2 w-full border border-ink/15 bg-ivory/60 px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-ink/60 focus:border-gold focus:bg-white focus:shadow-[0_0_0_4px_rgba(199,165,79,.18)]";
const label = "block font-grotesk text-xs font-bold uppercase tracking-[0.14em] text-ink/60";

export function ContactView({ email, address }: { email: string; address: string }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    try {
      const r = await sendMessage(new FormData(form));
      if (r.ok) {
        form.reset();
        setSent(true);
      } else setError(r.error);
    } catch {
      setError("We couldn't send your message. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader eyebrow="Connect with E-Cell" title="Start a" accent="conversation.">
        Whether you have an early idea, want to mentor, represent an industry partner, or simply want to join
        the team, we&apos;d like to hear from you.
      </PageHeader>
      <section className="bg-ivory py-16 text-ink lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <h2 className="font-display text-6xl">Find your way in.</h2>
            <p className="mt-4 max-w-md leading-7 text-ink/60">
              Share a little about yourself and what you&apos;re looking to build. The right team member will
              get back to you.
            </p>
            <div className="mt-10">
              <a
                href={`mailto:${email}`}
                className="flex gap-4 border-t border-ink/15 py-5 transition hover:text-moss"
              >
                <Mail className="h-5 w-5 text-gold-deep" />
                <span>
                  <span className={label}>Email</span>
                  <span className="mt-1 block font-semibold">{email}</span>
                </span>
              </a>
              <div className="flex gap-4 border-y border-ink/15 py-5">
                <MapPin className="h-5 w-5 shrink-0 text-gold-deep" />
                <span>
                  <span className={label}>Campus</span>
                  <span className="mt-1 block max-w-xs font-semibold leading-6">{address}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 shadow-[0_30px_80px_-30px_rgba(11,14,17,.35)] md:p-10">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid min-h-[420px] place-items-center text-center"
                >
                  <div>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-ink">
                      <Check className="h-7 w-7" />
                    </div>
                    <h2 className="mt-6 font-display text-5xl">Message received.</h2>
                    <p className="mt-3 max-w-sm text-ink/60">
                      Thanks for reaching out. The E-Cell team will connect with you soon.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="mt-7 font-grotesk text-sm font-bold uppercase tracking-[0.1em] text-moss"
                    >
                      Send another message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} className="grid gap-6">
                  <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                  <div className="grid gap-6 md:grid-cols-2">
                    <label className={label}>
                      Your name
                      <input required name="name" className={field} placeholder="Full name" />
                    </label>
                    <label className={label}>
                      Email address
                      <input
                        required
                        name="email"
                        type="email"
                        className={field}
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>
                  <label className={label}>
                    I am a...
                    <select required name="role" defaultValue="" className={field}>
                      <option value="" disabled>
                        Select one
                      </option>
                      <option>Student founder</option>
                      <option>Mentor or investor</option>
                      <option>Industry partner</option>
                      <option>Prospective team member</option>
                    </select>
                  </label>
                  <label className={label}>
                    What would you like to discuss?
                    <textarea
                      required
                      name="body"
                      className={`${field} min-h-36 resize-y`}
                      placeholder="Tell us about your idea or interest..."
                    />
                  </label>
                  {error && (
                    <p className="text-sm font-semibold text-[#b3261e]" role="alert">
                      {error}
                    </p>
                  )}
                  <div>
                    <Button variant="ink" disabled={busy}>
                      {busy ? "Sending…" : "Send message"}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
