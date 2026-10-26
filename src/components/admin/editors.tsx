"use client";
import {
  ArrowDownUp,
  BriefcaseBusiness,
  CalendarDays,
  Images,
  Landmark,
  GraduationCap,
  Newspaper,
  Rocket,
  Shield,
  Users,
} from "lucide-react";
import { dayMonth } from "@/lib/utils";
import { startupCategories } from "@/lib/constants";
import {
  type BlogPost,
  type Division,
  type EventItem,
  type GalleryPhoto,
  type Grant,
  type Listing,
  type Person,
  type Startup,
} from "@/types/content";
import { eventStatus, sortEvents, todayIST } from "@/lib/events";
import { CollectionEditor, type Field } from "./CollectionEditor";
import { Badge, Btn } from "./ui";

const opts = (pairs: [string, string][]) => pairs.map(([value, label]) => ({ value, label }));

// ---------- events ----------
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
    key: "endDate",
    label: "Last day (multi-day events only)",
    type: "date",
    hint: "Leave empty for a one-day event. The website works out “coming up / happening now / over” from the dates by itself.",
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
  {
    key: "reportUrl",
    label: "Link to the full report (optional)",
    max: 300,
    placeholder: "https://…",
    hint: "A “Read report” link only appears on the card when this is filled in.",
  },
];
const statusTone = { Upcoming: "gold", Ongoing: "green", Past: "gray" } as const;
const statusLabel = { Upcoming: "Coming up", Ongoing: "Happening now", Past: "Already happened" };

export function EventsEditor({
  items,
  revision,
  autoNew,
}: {
  items: EventItem[];
  revision: number;
  autoNew?: boolean;
}) {
  return (
    <CollectionEditor<EventItem>
      section="events"
      items={items}
      revision={revision}
      fields={eventFields}
      noun="event"
      autoNew={autoNew}
      emptyIcon={<CalendarDays className="h-6 w-6" />}
      emptyText="Add your first event and it will appear on the home page and the Events page."
      blank={() => ({
        title: "",
        date: new Date().toISOString().slice(0, 10),
        category: "",
        summary: "",
      })}
      summary={(e) => {
        const { day, month } = dayMonth(e.date);
        return {
          title: e.title,
          subtitle: `${day} ${month} · ${e.category || "Event"}`,
          badge: <Badge tone={statusTone[eventStatus(e)]}>{statusLabel[eventStatus(e)]}</Badge>,
          href: "/events",
        };
      }}
      tools={(list, save) => (
        <Btn
          icon={<ArrowDownUp className="h-4 w-4" />}
          onClick={() =>
            save(sortEvents(list, todayIST()), "Events sorted: happening now, then coming up, then past.")
          }
        >
          Sort for the website
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
    key: "website",
    label: "Live website",
    max: 300,
    placeholder: "https://…",
    hint: "The startup's real site. When set, its card links out to it (opens in a new tab).",
  },
  {
    key: "video",
    label: "Founder introduction video",
    max: 300,
    placeholder: "https://youtu.be/…",
    hint: "A 1–2 minute founder introduction. YouTube, Vimeo or Google Drive links play on the startup's page. Other http(s) links are shown as a safe button. Leave blank to hide the section.",
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

export function StartupsEditor({
  items,
  revision,
  autoNew,
}: {
  items: Startup[];
  revision: number;
  autoNew?: boolean;
}) {
  return (
    <CollectionEditor<Startup>
      section="startups"
      items={items}
      revision={revision}
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
  revision,
  startups,
}: {
  items: Listing[];
  revision: number;
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
    {
      key: "applicationMethod",
      label: "How should students apply?",
      type: "select",
      required: true,
      options: opts([
        ["internal", "On this website (form on the Jobs page)"],
        ["external", "On the startup's own site (external link)"],
      ]),
      hint: "External listing applications are handled entirely by the destination you configure below.",
    },
    {
      key: "applicationUrl",
      label: "External application URL",
      max: 300,
      placeholder: "https://…",
      hint: "Required only for external applications. Must start with https:// (or http://). Leave empty for the on-site form.",
    },
  ];
  const names = Object.fromEntries(startups.map((s) => [s.slug, s.name]));
  return (
    <CollectionEditor<Listing>
      section="listings"
      items={items}
      revision={revision}
      fields={fields}
      noun="job"
      emptyIcon={<BriefcaseBusiness className="h-6 w-6" />}
      emptyText="Post roles that student startups need help with. Applications arrive in your Inbox."
      validate={(l): Record<string, string> =>
        l.applicationMethod === "external" && !l.applicationUrl?.trim()
          ? {
              applicationUrl:
                "Add the startup's full https:// application link, or switch to the on-site form.",
            }
          : {}
      }
      blank={() => ({
        startupSlug: startups[0]?.slug ?? "",
        role: "",
        skills: [],
        commitment: "",
        compensation: "Unpaid",
        applicationMethod: "internal",
        applicationUrl: "",
      })}
      summary={(l) => ({
        title: l.role,
        subtitle: `${names[l.startupSlug] ?? "Unknown startup"} · ${l.commitment || "Flexible"}`,
        badge: <Badge>{l.compensation}</Badge>,
        href: "/jobs",
      })}
    />
  );
}

// ---------- people ----------
export function FacultyEditor({ items, revision }: { items: Person[]; revision: number }) {
  return (
    <CollectionEditor<Person>
      section="faculty"
      items={items}
      revision={revision}
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

export function TeamEditor({ items, revision }: { items: Person[]; revision: number }) {
  return (
    <CollectionEditor<Person>
      section="team"
      items={items}
      revision={revision}
      noun="team member"
      heading={<h2 className="font-grotesk text-2xl font-bold">Student team</h2>}
      fields={[
        { key: "name", label: "Name", required: true, max: 60 },
        { key: "photo", label: "Photo", type: "image", shape: "portrait" },
        { key: "role", label: "Role", required: true, max: 50, placeholder: "e.g. Lead, Member" },
        { key: "domain", label: "Domain / team", max: 40, placeholder: "e.g. Tech, Events, PR" },
        { key: "linkedin", label: "LinkedIn", max: 300, placeholder: "https://www.linkedin.com/in/…" },
        { key: "github", label: "GitHub", max: 300, placeholder: "https://github.com/…" },
      ]}
      emptyIcon={<Users className="h-6 w-6" />}
      emptyText="Add the students who run E-Cell."
      blank={() => ({ name: "", role: "" })}
      summary={(p) => ({
        title: p.name,
        subtitle: [p.domain, p.role].filter(Boolean).join(" · "),
        image: p.photo ?? "",
        href: "/#people",
      })}
    />
  );
}

// ---------- divisions ----------
export function DivisionsEditor({ items, revision }: { items: Division[]; revision: number }) {
  return (
    <CollectionEditor<Division>
      section="divisions"
      items={items}
      revision={revision}
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
          key: "photo",
          label: "Photo",
          type: "image",
          hint: "Optional image for this division.",
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
      blank={() => ({ name: "", line: "", photo: "" })}
      summary={(d) => ({ title: d.name, subtitle: d.line, image: d.photo ?? "", href: "/" })}
    />
  );
}

// ---------- blog ----------
export function BlogEditor({
  items,
  revision,
  autoNew,
}: {
  items: BlogPost[];
  revision: number;
  autoNew?: boolean;
}) {
  return (
    <CollectionEditor<BlogPost>
      section="posts"
      items={items}
      revision={revision}
      noun="post"
      autoNew={autoNew}
      fields={[
        { key: "title", label: "Title", required: true, max: 120 },
        { key: "author", label: "Written by", max: 80, placeholder: "e.g. Prof. A. Sharma" },
        { key: "date", label: "Publish date", type: "date", required: true },
        {
          key: "cover",
          label: "Cover image",
          type: "image",
          hint: "Shown on the blog list and at the top of the post.",
        },
        {
          key: "summary",
          label: "Short summary",
          type: "textarea",
          rows: 2,
          required: true,
          max: 300,
          hint: "Shown on the blog list.",
        },
        {
          key: "body",
          label: "Post",
          type: "textarea",
          rows: 14,
          required: true,
          max: 20000,
          hint: "Leave a blank line between paragraphs. A post goes live on the website as soon as you save it.",
        },
      ]}
      emptyIcon={<Newspaper className="h-6 w-6" />}
      emptyText="Posts you write here appear on the Blog page. Only faculty logged in to this panel can publish."
      blank={() => ({
        slug: "",
        title: "",
        summary: "",
        body: "",
        author: "",
        date: new Date().toISOString().slice(0, 10),
      })}
      summary={(p) => {
        const { day, month } = dayMonth(p.date);
        return {
          title: p.title,
          subtitle: `${day} ${month} · ${p.author || "E-Cell"}`,
          image: p.cover ?? "",
          href: p.slug ? `/blog/${p.slug}` : "/blog",
        };
      }}
    />
  );
}

// ---------- gallery ----------
export function GalleryEditor({
  items,
  revision,
  autoNew,
}: {
  items: GalleryPhoto[];
  revision: number;
  autoNew?: boolean;
}) {
  return (
    <CollectionEditor<GalleryPhoto>
      section="gallery"
      items={items}
      revision={revision}
      noun="photo"
      autoNew={autoNew}
      fields={[
        {
          key: "src",
          label: "Photo",
          type: "image",
          required: true,
          dimensions: { widthKey: "width", heightKey: "height" },
          hint: "Wide and tall photos both work — the gallery keeps their natural shape.",
        },
        {
          key: "alt",
          label: "Description for screen readers",
          required: true,
          max: 180,
          placeholder: "e.g. Students pitching at E-Summit 2026",
          hint: "Describe what is happening in the photo. Do not start with “image of”.",
        },
        {
          key: "caption",
          label: "Visible caption (optional)",
          max: 160,
          placeholder: "e.g. Demo day, Mumbai",
        },
      ]}
      emptyIcon={<Images className="h-6 w-6" />}
      emptyText="Add photos from events, workshops and other approved E-Cell activities. They appear in the home page masonry gallery."
      blank={() => ({ src: "", alt: "", caption: "", width: undefined, height: undefined })}
      summary={(p) => ({
        title: p.caption || p.alt,
        subtitle: p.width && p.height ? `${p.width} × ${p.height}` : "Gallery photo",
        image: p.src,
      })}
    />
  );
}

// ---------- government grants ----------
export function GrantsEditor({
  items,
  revision,
  autoNew,
}: {
  items: Grant[];
  revision: number;
  autoNew?: boolean;
}) {
  return (
    <CollectionEditor<Grant>
      section="grants"
      items={items}
      revision={revision}
      noun="grant"
      autoNew={autoNew}
      fields={[
        {
          key: "name",
          label: "Scheme name",
          required: true,
          max: 120,
          placeholder: "e.g. Startup India Seed Fund",
        },
        { key: "agency", label: "Run by", max: 120, placeholder: "e.g. DPIIT, Ministry of Commerce" },
        { key: "amount", label: "Funding amount", max: 80, placeholder: "e.g. Up to ₹50 lakh" },
        { key: "deadline", label: "Deadline", max: 80, placeholder: "e.g. Rolling, or 31 Dec 2026" },
        {
          key: "eligibility",
          label: "Who can apply",
          type: "textarea",
          rows: 3,
          max: 400,
          placeholder: "e.g. DPIIT-recognised startups less than 2 years old",
        },
        { key: "summary", label: "What it is", type: "textarea", rows: 4, required: true, max: 600 },
        {
          key: "url",
          label: "Official link",
          max: 300,
          placeholder: "https://…",
          hint: "A “Learn more” button appears when this is filled in.",
        },
      ]}
      emptyIcon={<Landmark className="h-6 w-6" />}
      emptyText="List government schemes and grants that student founders can apply for."
      blank={() => ({ name: "", agency: "", amount: "", deadline: "", eligibility: "", summary: "" })}
      summary={(g) => ({
        title: g.name,
        subtitle: [g.agency, g.amount].filter(Boolean).join(" · "),
        href: "/grants",
      })}
    />
  );
}
