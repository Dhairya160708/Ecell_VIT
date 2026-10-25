// Content model for the whole site. It is stored in Supabase (see server/content.ts), edited by faculty
// from /admin and read by the public pages.

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
  /** Short pitch video: a YouTube, Vimeo or Google Drive link (anything else is shown as a plain link). */
  video?: string;
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
  /** How applicants should apply: through the on-site form, or an external URL supplied by the startup. */
  applicationMethod: "internal" | "external";
  /** Only used when applicationMethod is "external". Must be an http(s) URL. */
  applicationUrl?: string;
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
export type BlogPost = {
  uid: string;
  slug: string;
  title: string;
  summary: string;
  /** Plain text; blank lines separate paragraphs. */
  body: string;
  author: string;
  /** yyyy-mm-dd */
  date: string;
  cover?: string;
};

export type GalleryPhoto = {
  uid: string;
  /** Uploaded photo URL (served through /media). */
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type Grant = {
  uid: string;
  name: string;
  /** Ministry / agency running the scheme. */
  agency: string;
  amount: string;
  deadline: string;
  eligibility: string;
  summary: string;
  url?: string;
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
  /** Large group photo used at the top of the teams page. */
  teamPhoto: string;
  /** Footer resources. Empty strings are shown as unavailable, never as invented links. */
  linktree: string;
  introReel: string;
  posters: string;
  publicity: string;
  ideaForm: string;
  interviewForm: string;
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
  posts: BlogPost[];
  grants: Grant[];
  gallery: GalleryPhoto[];
};

export type Section = keyof Content;

/** Public comment on a startup. Shown straight away; faculty can hide or delete it from /admin/feedback. */
export type Feedback = {
  id: string;
  startupSlug: string;
  name: string;
  body: string;
  hidden: boolean;
  createdAt: string;
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

/** A student blog draft. It is private until faculty approve it; approval creates a published BlogPost. */
export type BlogSubmission = {
  id: string;
  createdAt: string;
  title: string;
  summary: string;
  body: string;
  author: string;
  authorEmail: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  postSlug?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};
