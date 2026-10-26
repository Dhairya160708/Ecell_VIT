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

const story = [
  {
    title: "Origins of E-Cell VIT",
    body: "E-Cell VIT is the student-led entrepreneurship cell of Vidyalankar Institute of Technology, Wadala. It connects campus ideas to real-world ventures, from first sketch to first customer.",
  },
  {
    title: "Our vision",
    body: "To enable student innovators to turn campus ideas into ventures through guidance, mentorship, and networking.",
  },
  {
    title: "About Vidyalankar Institute of Technology",
    body: "Founded in 1999, Vidyalankar Institute of Technology is an 'A' grade college approved by AICTE and DTE (Maharashtra) and affiliated to the University of Mumbai. It has been autonomous since A.Y. 2022-23, is NAAC 'A+' accredited, and all its B.Tech programs hold NBA accreditation.",
  },
];

const impact = [
  ["7+", "Active student startups incubated"],
  ["20+", "Alumni startup profiles"],
  ["6", "Startups registered as MSMEs (Udyam)"],
];

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About us" title="Where campus ideas" accent="become ventures." />
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-14">
        <div className="grid gap-5 md:grid-cols-3">
          {story.map(({ title, body }, i) => (
            <Reveal key={title} i={i}>
              <div className="h-full border border-line bg-surface p-6">
                <h2 className="font-display text-3xl">{title}</h2>
                <p className="mt-3 text-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-5">
          <div className="border border-line bg-surface">
            <div className="border-b border-line px-6 py-6 md:px-10">
              <p className="font-grotesk text-xs font-bold uppercase tracking-[0.24em] text-gold">
                Our reach &amp; impact
              </p>
              <p className="mt-2 max-w-2xl text-muted">
                Regular workshops, exhibitions, and mentorship sessions throughout the year.
              </p>
            </div>
            <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {impact.map(([n, label]) => (
                <div key={label} className="px-6 py-8 md:px-10 md:py-10">
                  <p className="font-display text-7xl leading-none text-gold">{n}</p>
                  <p className="mt-3 text-sm leading-6 text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
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
