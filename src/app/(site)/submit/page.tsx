"use client";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/Button";
import { submitIdea } from "@/app/actions/public";
import { startupCategories } from "@/lib/constants";

const field =
  "w-full border border-line bg-surface px-4 py-3 text-sm outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_var(--gold-soft)]";
const steps = ["Basics", "Problem & solution", "Team & contact"];

export default function Submit() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sets = useRef<(HTMLFieldSetElement | null)[]>([]);

  // All steps stay mounted (just hidden) so earlier answers are still in the form when it's sent.
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const current = sets.current[step];
    const invalid =
      current &&
      Array.from(current.querySelectorAll<HTMLInputElement>("input,textarea,select")).find(
        (el) => !el.checkValidity(),
      );
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await submitIdea(new FormData(e.currentTarget));
      if (r.ok) setDone(true);
      else setError(r.error);
    } catch {
      setError("We couldn't submit your idea. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Submit" title="Pitch your" accent="idea.">
        Three short steps. The E-Cell team and faculty will review it and get back to you.
      </PageHeader>
      <section className="mx-auto max-w-xl px-5 pt-14 pb-28">
        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-line bg-surface p-10 text-center"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold text-ink">
              <Check />
            </div>
            <h2 className="mt-5 font-display text-4xl">Idea submitted</h2>
            <p className="mt-2 text-muted">
              Thank you! We&apos;ll reach out on the email you shared once it has been reviewed.
            </p>
          </motion.div>
        ) : (
          <>
            <ol className="mb-8 flex gap-2">
              {steps.map((s, i) => (
                <li key={s} className="flex-1">
                  <div className="h-1 overflow-hidden rounded-full bg-line">
                    <motion.div
                      className="h-full bg-gold"
                      animate={{ width: i <= step ? "100%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className={`mt-2 text-xs ${i <= step ? "text-fg" : "text-subtle"}`}>{s}</p>
                </li>
              ))}
            </ol>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <fieldset
                ref={(el) => {
                  sets.current[0] = el;
                }}
                hidden={step !== 0}
                className="space-y-4"
              >
                <input required name="name" placeholder="Startup name" className={field} />
                <input required name="pitch" placeholder="One-line pitch" className={field} />
                <select required name="category" defaultValue="" className={field}>
                  <option value="" disabled>
                    Category
                  </option>
                  {startupCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </fieldset>
              <fieldset
                ref={(el) => {
                  sets.current[1] = el;
                }}
                hidden={step !== 1}
                className="space-y-4"
              >
                <textarea
                  required
                  name="problem"
                  rows={4}
                  placeholder="What problem are you solving?"
                  className={field}
                />
                <textarea
                  required
                  name="solution"
                  rows={4}
                  placeholder="How does your solution work?"
                  className={field}
                />
              </fieldset>
              <fieldset
                ref={(el) => {
                  sets.current[2] = el;
                }}
                hidden={step !== 2}
                className="space-y-4"
              >
                <textarea
                  required
                  name="team"
                  rows={3}
                  placeholder="Team members and roles (founder first)"
                  className={field}
                />
                <input required name="email" type="email" placeholder="Contact email" className={field} />
              </fieldset>
              {error && (
                <p className="text-sm text-[#f0a3a3]" role="alert">
                  {error}
                </p>
              )}
              <div className="flex justify-between pt-2">
                {step > 0 ? (
                  <Button variant="ghost" arrow={false} onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                <Button disabled={busy}>{busy ? "Sending…" : step < 2 ? "Continue" : "Submit idea"}</Button>
              </div>
            </form>
          </>
        )}
      </section>
    </>
  );
}
