"use client";
import {
  ArrowDownUp,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Rocket,
  Shield,
  Users,
} from "lucide-react";
import {
  dayMonth,
  startupCategories,
  type Division,
  type EventItem,
  type Listing,
  type Person,
  type Startup,
} from "@/lib/data";
import { CollectionEditor, type Field } from "./CollectionEditor";
import { Badge, Btn } from "./ui";

const opts = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

// ---------- events ----------
const eventStatus = opts([
  ["Upcoming", "Coming up"],
  ["Ongoing", "Happening now"],
  ["Past", "Already happened"],
]);
const eventFields: Field[] = [
  { key: "title", label: "Event name", required: true, max: 60, placeholder: "e.g. E-Summit 2026" },
  {
    key: "date",
    label: "Date",
    type: "date",
    required: true,
    hint: "The day it starts. The website shows it as “09 OCT”.",
  },
  {
    key: "status",
    label: "Is it coming up, happening now, or over?",
    type: "select",
    required: true,
    options: eventStatus,
    hint: "Remember to switch this to “Already happened” after the event.",
  },
  { key: "category", label: "Type of event", max: 40, placeholder: "e.g. Workshop, Talk, Competition" },
  {
    key: "summary",
    label: "Short description",
    type: "textarea",
    required: true,
    max: 300,
    placeholder: "One or two sentences about what happens at this event.",
  },
  {
    key: "report",
    label: "Highlights (for past events)",
    max: 120,
    placeholder: "e.g. 80 attendees · 12 demos · 6 collaborations",
    hint: "Shown at the bottom of the card. Leave empty for upcoming events.",
  },
];
const statusTone = { Upcoming: "gold", Ongoing: "green", Past: "gray" } as const;
const statusLabel = { Upcoming: "Coming up", Ongoing: "Happening now", Past: "Already happened" };

export function EventsEditor({ items, autoNew }: { items: EventItem[]; autoNew?: boolean }) {
  return (
    <CollectionEditor<EventItem>
      section="events"
      items={items}
      fields={eventFields}
      noun="event"
      autoNew={autoNew}
      emptyIcon={<CalendarDays className="h-6 w-6" />}
      emptyText="Add your first event and it will appear on the home page and the Events page."
      blank={() => ({
        title: "",
        date: new Date().toISOString().slice(0, 10),
        category: "",
        status: "Upcoming",
        summary: "",
      })}
      summary={(e) => {
        const { day, month } = dayMonth(e.date);
        return {
          title: e.title,
          subtitle: `${day} ${month} · ${e.category || "Event"}`,
          badge: <Badge tone={statusTone[e.status]}>{statusLabel[e.status]}</Badge>,
          href: "/events",
        };
      }}
      tools={(list, save) => (
        <Btn
          icon={<ArrowDownUp className="h-4 w-4" />}
          onClick={() =>
            save(
              [...list].sort((a, b) => a.date.localeCompare(b.date)),
              "Events sorted by date.",
            )
          }
        >
          Sort by date
        </Btn>
      )}
    />
  );
}

// ---------- startups ----------
const startupFields: Field[] = [
  { key: "name", label: "Startup name", required: true, max: 40 },
  { key: "founder", label: "Founder's name", required: true, max: 60 },
  {
    key: "photo",
    label: "Photo or logo",
    type: "image",
    hint: "Shown on the startup's card. A founder photo or product shot works well.",
  },
  {
    key: "pitch",
    label: "One-line pitch",
    type: "textarea",
    rows: 2,
    required: true,
    max: 200,
    hint: "What does it do, in one sentence?",
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    required: true,
    options: opts(startupCategories.map((c) => [c, c])),
  },
  {
    key: "status",
    label: "How far along is it?",
    type: "select",
    required: true,
    options: opts([
      ["Idea", "Just an idea"],
      ["Building", "Building it"],
      ["Launched", "Launched"],
    ]),
  },
  {
    key: "stage",
    label: "Current stage (in your words)",
    max: 30,
    placeholder: "e.g. Prototype, MVP, Beta, Early traction",
  },
  { key: "problem", label: "The problem it solves", type: "textarea", max: 600 },
  { key: "solution", label: "How it solves it", type: "textarea", max: 600 },
  { key: "regId", label: "E-Cell registration ID", max: 30, placeholder: "e.g. VIT-EC-2026-001" },
];

export function StartupsEditor({ items, autoNew }: { items: Startup[]; autoNew?: boolean }) {
  return (
    <CollectionEditor<Startup>
      section="startups"
      items={items}
      fields={startupFields}
      noun="startup"
      autoNew={autoNew}
      emptyIcon={<Rocket className="h-6 w-6" />}
      emptyText="Startups you add here show up in the startup directory. Approved ideas from the Inbox are added automatically."
      blank={() => ({
        slug: "",
        regId: "",
        name: "",
        pitch: "",
        category: "",
        status: "Idea",
        stage: "",
        founder: "",
        problem: "",
        solution: "",
      })}
      summary={(s) => ({
        title: s.name,
        subtitle: `${s.founder} · ${s.pitch}`,
        image: s.photo ?? "",
        badge: <Badge tone="gold">{s.category}</Badge>,
        href: s.slug ? `/startups/${s.slug}` : undefined,
      })}
    />
  );
}

// ---------- jobs ----------
export function JobsEditor({
  items,
  startups,
}: {
  items: Listing[];
  startups: { slug: string; name: string }[];
}) {
  const fields: Field[] = [
    {
      key: "startupSlug",
      label: "Which startup is hiring?",
      type: "select",
      required: true,
      options: startups.map((s) => ({ value: s.slug, label: s.name })),
      hint: "Only startups from the Startups page appear here.",
    },
    {
      key: "role",
      label: "Role",
      required: true,
      max: 60,
      placeholder: "e.g. React developer, Graphic designer",
    },
    {
      key: "skills",
      label: "Skills needed",
      type: "tags",
      placeholder: "e.g. Figma, Branding, Canva",
      hint: "Separate each skill with a comma.",
    },
    { key: "commitment", label: "Time needed", max: 30, placeholder: "e.g. 5 hrs/week, One-off project" },
    {
      key: "compensation",
      label: "Is it paid?",
      type: "select",
      required: true,
      options: opts([
        ["Paid", "Paid"],
        ["Equity", "Equity (a share of the startup)"],
        ["Unpaid", "Unpaid / volunteer"],
      ]),
    },
  ];
  const names = Object.fromEntries(startups.map((s) => [s.slug, s.name]));
  return (
    <CollectionEditor<Listing>
      section="listings"
      items={items}
      fields={fields}
      noun="job"
      emptyIcon={<BriefcaseBusiness className="h-6 w-6" />}
      emptyText="Post roles that student startups need help with. Applications arrive in your Inbox."
      blank={() => ({
        startupSlug: startups[0]?.slug ?? "",
        role: "",
        skills: [],
        commitment: "",
        compensation: "Unpaid",
      })}
      summary={(l) => ({
        title: l.role,
        subtitle: `${names[l.startupSlug] ?? "Unknown startup"} · ${l.commitment || "Flexible"}`,
        badge: <Badge>{l.compensation}</Badge>,
        href: "/marketplace",
      })}
    />
  );
}

// ---------- people ----------
export function FacultyEditor({ items }: { items: Person[] }) {
  return (
    <CollectionEditor<Person>
      section="faculty"
      items={items}
      noun="faculty member"
      heading={<h2 className="font-grotesk text-2xl font-bold">Faculty advisors</h2>}
      fields={[
        { key: "name", label: "Full name", required: true, max: 60, placeholder: "e.g. Prof. A. Sharma" },
        {
          key: "photo",
          label: "Photo",
          type: "image",
          shape: "portrait",
          hint: "A clear head-and-shoulders photo works best.",
        },
        {
          key: "role",
          label: "Role in E-Cell",
          required: true,
          max: 50,
          placeholder: "e.g. Faculty Advisor",
        },
        { key: "dept", label: "Department", max: 60, placeholder: "e.g. Computer Engineering" },
      ]}
      emptyIcon={<GraduationCap className="h-6 w-6" />}
      emptyText="Add the faculty members who guide E-Cell."
      blank={() => ({ name: "", role: "", dept: "" })}
      summary={(p) => ({
        title: p.name,
        subtitle: [p.role, p.dept].filter(Boolean).join(" · "),
        image: p.photo ?? "",
        href: "/#people",
      })}
    />
  );
}

export function TeamEditor({ items }: { items: Person[] }) {
  return (
    <CollectionEditor<Person>
      section="team"
      items={items}
      noun="team member"
      heading={<h2 className="font-grotesk text-2xl font-bold">Student team</h2>}
      fields={[
        { key: "name", label: "Name", required: true, max: 60 },
        { key: "photo", label: "Photo", type: "image", shape: "portrait" },
        { key: "role", label: "Role", required: true, max: 50, placeholder: "e.g. Tech Team · Research" },
      ]}
      emptyIcon={<Users className="h-6 w-6" />}
      emptyText="Add the students who run E-Cell."
      blank={() => ({ name: "", role: "" })}
      summary={(p) => ({ title: p.name, subtitle: p.role, image: p.photo ?? "", href: "/#people" })}
    />
  );
}

// ---------- divisions ----------
export function DivisionsEditor({ items }: { items: Division[] }) {
  return (
    <CollectionEditor<Division>
      section="divisions"
      items={items}
      noun="division"
      fields={[
        {
          key: "name",
          label: "Division name",
          required: true,
          max: 16,
          placeholder: "e.g. Marketing",
          hint: "Keep it to one short word. It's shown very large on the home page.",
        },
        {
          key: "line",
          label: "What this division does",
          type: "textarea",
          rows: 2,
          required: true,
          max: 120,
        },
      ]}
      emptyIcon={<Shield className="h-6 w-6" />}
      emptyText="Divisions appear in the gold ribbons and the expanding panels on the home page."
      blank={() => ({ name: "", line: "" })}
      summary={(d) => ({ title: d.name, subtitle: d.line, href: "/" })}
    />
  );
}
