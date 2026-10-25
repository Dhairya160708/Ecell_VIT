import { Lightbulb, ClipboardCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

const pieces = [
  {
    icon: Lightbulb,
    title: "Showcase",
    body: "A public gallery of approved student startups. Anyone can browse, no login needed.",
  },
  {
    icon: ClipboardCheck,
    title: "Submit & evaluate",
    body: "Students submit ideas. Faculty review, score and comment, then approve the best for the showcase.",
  },
  {
    icon: Users,
    title: "Jobs board",
    body: "Founders post open roles. Other students apply with a short pitch of their skills.",
  },
];

export default function About() {
  return (
    <>
      <PageHeader eyebrow="How it works" title="Three pieces," accent="one launchpad." />
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-28">
        <div className="grid gap-5 md:grid-cols-3">
          {pieces.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} i={i}>
              <div className="h-full rounded-none border border-line bg-surface p-6">
                <div className="mb-8 grid h-10 w-10 place-items-center rounded-lg border border-gold/40 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xs text-subtle">0{i + 1}</p>
                <h2 className="font-display text-4xl">{title}</h2>
                <p className="mt-2 text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <Button href="/submit">Submit your idea</Button>
        </Reveal>
      </section>
    </>
  );
}
