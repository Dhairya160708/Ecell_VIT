// Content model for the whole site. Admins edit all of this from /admin; it is stored in Supabase
// (see lib/content.ts). The only values defined here are the fallback site text.

export type Startup = {
  uid: string;
  slug: string;
  regId: string;
  name: string;
  pitch: string;
  category: string;
  status: "Idea" | "Building" | "Launched";
  stage: string;
  founder: string;
  problem: string;
  solution: string;
  photo?: string;
  /** The startup's live site. When set, the startup card links out to it. */
  website?: string;
};

export type EventItem = {
  uid: string;
  title: string;
  /** yyyy-mm-dd. Status (Upcoming/Ongoing/Past) is derived from the dates, see lib/events.ts. */
  date: string;
  /** Last day of a multi-day event (yyyy-mm-dd). Defaults to `date`. */
  endDate?: string;
  category: string;
  summary: string;
  /** Short highlights line shown on past events. */
  report?: string;
  /** Link to the full report. "Read report" only appears when this is set. */
  reportUrl?: string;
};

export type Listing = {
  uid: string;
  startupSlug: string;
  role: string;
  skills: string[];
  commitment: string;
  compensation: "Paid" | "Equity" | "Unpaid";
};

export type Person = {
  uid: string;
  name: string;
  role: string;
  dept?: string;
  /** Team members: the team/domain they belong to, and their profiles. */
  domain?: string;
  linkedin?: string;
  github?: string;
  photo?: string;
};
export type Division = { uid: string; name: string; line: string };
export type Stat = { uid: string; value: string; label: string };

export type SiteText = {
  heroKicker: string;
  heroTagline: string;
  manifesto: string;
  aboutLead: string;
  aboutBody: string;
  ctaHeading: string;
  email: string;
  address: string;
  instagram: string;
  linkedin: string;
};

export type Content = {
  site: SiteText;
  stats: Stat[];
  events: EventItem[];
  startups: Startup[];
  listings: Listing[];
  divisions: Division[];
  faculty: Person[];
  team: Person[];
};

export type Section = keyof Content;

/** Fallback site text, used for any field not yet saved in the site_settings table. */
export const defaultSite: SiteText = {
  heroKicker: "Entrepreneurship Cell · Vidyalankar Institute of Technology",
  heroTagline: "Turning campus curiosity into ventures that move the world forward.",
  manifesto:
    "We are the scouts of VIT. We go beyond the walls of the classroom to find problems worth solving — and we come back with ventures.",
  aboutLead:
    "E-Cell VIT is a student-led community that brings ambitious ideas, practical guidance, and real opportunities under one roof.",
  aboutBody:
    "From first sketch to first customer, we create space for students to test ideas, meet mentors, find teammates, and build with confidence.",
  ctaHeading: "Have an idea worth building?",
  email: "ecell@vit.edu.in",
  address: "Vidyalankar Institute of Technology, Vidyalankar College Marg, Wadala (E), Mumbai 400037",
  instagram: "",
  linkedin: "",
};

// ---------- Inbox: things visitors send through the website's forms ----------
export type Message = {
  kind: "messages";
  id: string;
  createdAt: string;
  name: string;
  email: string;
  role: string;
  body: string;
  status: "New" | "Read" | "Done";
  note?: string;
};
export type Idea = {
  kind: "ideas";
  id: string;
  createdAt: string;
  name: string;
  pitch: string;
  category: string;
  problem: string;
  solution: string;
  team: string;
  email: string;
  status: "New" | "Reviewing" | "Approved" | "Rejected";
  score?: number;
  comments?: string;
  startupSlug?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};
export type Application = {
  kind: "applications";
  id: string;
  createdAt: string;
  listingUid: string;
  role: string;
  startup: string;
  name: string;
  email: string;
  pitch: string;
  status: "New" | "Contacted" | "Closed";
};
export type InboxItem = Message | Idea | Application;
export type InboxKind = InboxItem["kind"];

// ---------- helpers shared by site + admin ----------
export const startupCategories = [
  "AI / Productivity",
  "Climate Tech",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Community",
  "SaaS",
  "Hardware",
  "Other",
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export function dayMonth(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return { day: String(d || 1).padStart(2, "0"), month: MONTHS[(m || 1) - 1] ?? "" };
}

export function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "startup"
  );
}

export function makeUid(prefix = "x") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
