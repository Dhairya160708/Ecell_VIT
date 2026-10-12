import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarPlus,
  Lightbulb,
  MessageSquare,
  PenLine,
  Rocket,
  Sparkles,
} from "lucide-react";
import { listInbox, readContent } from "@/server/content";
import { Card, PageTitle } from "@/components/admin/ui";
import { eventStatus } from "@/lib/events";
import { Loading } from "@/components/admin/Loading";

function Tile({
  href,
  icon,
  n,
  label,
  urgent,
}: {
  href: string;
  icon: React.ReactNode;
  n: number;
  label: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl p-5 ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${urgent && n ? "bg-[#0b1711] text-white ring-[#0b1711]" : "bg-white ring-black/[0.07]"}`}
    >
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${urgent && n ? "bg-[#c7a54f] text-[#0b0e11]" : "bg-[#f1efe9] text-[#1c4a35]"}`}
      >
        {icon}
      </span>
      <span className="flex-1">
        <span className="block font-grotesk text-3xl font-bold leading-none">{n}</span>
        <span className={`mt-1 block text-[15px] ${urgent && n ? "text-white/80" : "text-black/60"}`}>
          {label}
        </span>
      </span>
      <ArrowRight className="h-5 w-5 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
    </Link>
  );
}

async function Dashboard() {
  await connection();
  const [c, messages, ideas, apps] = await Promise.all([
    readContent(),
    listInbox("messages"),
    listInbox("ideas"),
    listInbox("applications"),
  ]);
  const fresh = (xs: { status: string }[]) => xs.filter((x) => x.status === "New").length;
  const upcoming = c.events.filter((e) => eventStatus(e) !== "Past").length;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-grotesk text-lg font-bold">Waiting for you</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Tile
            href="/admin/inbox?tab=messages"
            icon={<MessageSquare className="h-6 w-6" />}
            n={fresh(messages)}
            label="new messages"
            urgent
          />
          <Tile
            href="/admin/inbox?tab=ideas"
            icon={<Lightbulb className="h-6 w-6" />}
            n={fresh(ideas)}
            label="ideas to review"
            urgent
          />
          <Tile
            href="/admin/inbox?tab=applications"
            icon={<BriefcaseBusiness className="h-6 w-6" />}
            n={fresh(apps)}
            label="new job applications"
            urgent
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-grotesk text-lg font-bold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["/admin/events?new=1", <CalendarPlus key="i" className="h-5 w-5" />, "Add an event"],
            ["/admin/startups?new=1", <Rocket key="i" className="h-5 w-5" />, "Add a startup"],
            ["/admin/site", <PenLine key="i" className="h-5 w-5" />, "Edit home page text"],
          ].map(([href, icon, label]) => (
            <Link
              key={href as string}
              href={href as string}
              className="flex min-h-14 items-center gap-3 rounded-2xl bg-white px-5 text-[15px] font-semibold ring-1 ring-black/[0.07] transition hover:ring-[#c7a54f]"
            >
              <span className="text-[#1c4a35]">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-grotesk text-lg font-bold">Your website right now</h2>
          <ul className="mt-4 divide-y divide-black/5 text-[15px]">
            {[
              ["Events", `${c.events.length} total · ${upcoming} upcoming or ongoing`, "/admin/events"],
              ["Startups", `${c.startups.length} in the directory`, "/admin/startups"],
              ["Jobs board", `${c.listings.length} open roles`, "/admin/jobs"],
              ["People", `${c.faculty.length} faculty · ${c.team.length} team members`, "/admin/people"],
            ].map(([k, v, href]) => (
              <li key={k}>
                <Link href={href} className="flex justify-between gap-4 py-3 hover:text-[#1c4a35]">
                  <span className="font-semibold">{k}</span>
                  <span className="text-black/60">{v}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="!bg-[#fbf7ea]">
          <h2 className="flex items-center gap-2 font-grotesk text-lg font-bold">
            <Sparkles className="h-5 w-5 text-[#7a5f1c]" />
            How this works
          </h2>
          <ol className="mt-4 space-y-3 text-[15px] leading-relaxed text-black/75">
            <li>
              <b>1. Pick a section</b> from the menu on the left (Events, Startups…).
            </li>
            <li>
              <b>2. Press “Edit”</b> on anything, or <b>“Add”</b> to create something new.
            </li>
            <li>
              <b>3. Press “Save”.</b> The website updates by itself within a few seconds.
            </li>
            <li>
              <b>Made a mistake?</b> Press <b>Undo</b> on the pop-up straight after saving.
            </li>
          </ol>
        </Card>
      </section>
    </div>
  );
}

function greeting() {
  const h = Number(
    new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }),
  );
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

async function Greeting() {
  await connection();
  return <PageTitle title={`${greeting()}!`} description="Here's what's happening on the E-Cell website." />;
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<PageTitle title="Welcome!" />}>
        <Greeting />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
