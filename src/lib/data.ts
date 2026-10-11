// Content model for the whole site. Admins edit all of this from /admin; the values below are only
// the starting content used until the first save (SAMPLE data carried over from the Figma prototype).

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
};

export type EventItem = {
  uid: string;
  title: string;
  date: string;
  /* yyyy-mm-dd */ category: string;
  status: "Ongoing" | "Upcoming" | "Past";
  summary: string;
  report?: string;
};

export type Listing = {
  uid: string;
  startupSlug: string;
  role: string;
  skills: string[];
  commitment: string;
  compensation: "Paid" | "Equity" | "Unpaid";
};

export type Person = { uid: string; name: string; role: string; dept?: string; photo?: string };
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

export const defaultContent: Content = {
  site: {
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
  },
  stats: [
    { uid: "st1", value: "30+", label: "Student ideas supported" },
    { uid: "st2", value: "12", label: "Founder-led sessions" },
    { uid: "st3", value: "06", label: "Campus ventures" },
    { uid: "st4", value: "06", label: "Divisions, one regiment" },
  ],
  startups: [
    {
      uid: "sp1",
      slug: "nexora-labs",
      regId: "VIT-EC-2025-014",
      name: "Nexora Labs",
      founder: "Aarav Mehta",
      category: "AI / Productivity",
      status: "Building",
      stage: "Prototype",
      pitch:
        "An AI-assisted workspace that helps student teams turn scattered research into clear action plans.",
      problem:
        "Student teams lose hours stitching notes, links and findings from a dozen tools before they can decide anything.",
      solution:
        "One workspace that ingests research, clusters it into themes, and drafts a next-step plan the team can edit.",
    },
    {
      uid: "sp2",
      slug: "reloop",
      regId: "VIT-EC-2025-021",
      name: "ReLoop",
      founder: "Ananya Iyer",
      category: "Climate Tech",
      status: "Launched",
      stage: "Early traction",
      pitch:
        "A campus-first circular economy platform that makes reusing electronics simple, verified, and rewarding.",
      problem:
        "Working electronics end up in drawers or landfill because resale between students is awkward and untrusted.",
      solution:
        "Verified campus listings, condition checks by student volunteers, and reward points for every device kept in use.",
    },
    {
      uid: "sp3",
      slug: "khatago",
      regId: "VIT-EC-2024-009",
      name: "KhataGo",
      founder: "Rohan Shah",
      category: "FinTech",
      status: "Building",
      stage: "MVP",
      pitch:
        "Simple cash-flow and credit tools built for neighborhood businesses that still manage accounts manually.",
      problem:
        "Neighbourhood shops track credit in paper ledgers, so cash-flow gaps surprise them every month.",
      solution:
        "A vernacular, voice-first ledger that sends payment nudges and shows a weekly cash-flow picture.",
    },
    {
      uid: "sp4",
      slug: "mediroute",
      regId: "VIT-EC-2025-028",
      name: "MediRoute",
      founder: "Sana Khan",
      category: "HealthTech",
      status: "Idea",
      stage: "Research",
      pitch: "A smart navigation layer designed to reduce delays in time-sensitive medical supply movement.",
      problem: "Blood, organs and critical medicines get stuck in city traffic with no priority routing.",
      solution:
        "Live routing that combines traffic data with hospital handoff windows to pick the fastest reliable path.",
    },
    {
      uid: "sp5",
      slug: "skillspring",
      regId: "VIT-EC-2024-017",
      name: "SkillSpring",
      founder: "Dev Nair",
      category: "EdTech",
      status: "Launched",
      stage: "Beta",
      pitch:
        "Short, peer-led learning cohorts that help students gain applied skills by shipping real outcomes.",
      problem: "Courses teach theory, but students graduate without anything shipped to show for it.",
      solution:
        "Four-week cohorts led by seniors where every participant ships a real project with a public demo.",
    },
    {
      uid: "sp6",
      slug: "locallens",
      regId: "VIT-EC-2025-032",
      name: "LocalLens",
      founder: "Ishita Rao",
      category: "Community",
      status: "Idea",
      stage: "Concept",
      pitch:
        "A discovery platform bringing independent neighborhood businesses closer to the communities around them.",
      problem: "Great independent shops are invisible next to chains with marketing budgets.",
      solution:
        "A hyperlocal map with stories, offers and student-made spotlights for every independent business.",
    },
  ],
  events: [
    {
      uid: "ev1",
      title: "Startup Launchpad",
      date: "2026-09-18",
      category: "Founder workshop",
      status: "Ongoing",
      summary:
        "A hands-on sprint that takes student ideas from raw problem statements to confident, investor-ready pitches.",
    },
    {
      uid: "ev2",
      title: "E-Summit 2026",
      date: "2026-10-09",
      category: "Flagship summit",
      status: "Upcoming",
      summary:
        "A day of founder stories, live pitching, networking, and practical conversations with the Mumbai startup ecosystem.",
    },
    {
      uid: "ev3",
      title: "Founder's Fireside",
      date: "2026-11-15",
      category: "Speaker session",
      status: "Upcoming",
      summary:
        "An honest, no-slides conversation on finding product-market fit and building through uncertainty.",
    },
    {
      uid: "ev4",
      title: "Prototype Weekend",
      date: "2027-01-12",
      category: "Build sprint",
      status: "Upcoming",
      summary:
        "A focused 48-hour build weekend pairing technical makers with business-minded student collaborators.",
    },
    {
      uid: "ev5",
      title: "Pitch Hunt",
      date: "2026-07-24",
      category: "Pitch competition",
      status: "Past",
      summary:
        "Student teams pitched solutions to real-world problems before a panel of mentors and industry professionals.",
      report: "14 teams · 5 mentors · 3 winning ideas",
    },
    {
      uid: "ev6",
      title: "Campus Founder Meetup",
      date: "2026-03-06",
      category: "Community",
      status: "Past",
      summary:
        "A peer-led evening for student founders to exchange lessons, roadblocks, and useful connections.",
      report: "80 attendees · 12 demos · 6 collaborations",
    },
  ],
  divisions: [
    { uid: "dv1", name: "Tech", line: "Builds the platforms, tools and prototypes the cell runs on." },
    {
      uid: "dv2",
      name: "Events",
      line: "Runs summits, sprints and pitch nights from first poster to final mic.",
    },
    { uid: "dv3", name: "PR", line: "Carries the E-Cell story to press, partners and the wider ecosystem." },
    {
      uid: "dv4",
      name: "Creatives",
      line: "Owns the look: posters, reels, decks and everything in between.",
    },
    { uid: "dv5", name: "Marketing", line: "Fills the rooms, grows the community, and measures what works." },
    {
      uid: "dv6",
      name: "Networking",
      line: "Opens doors to mentors, investors, alumni and industry partners.",
    },
  ],
  faculty: [
    { uid: "fc1", name: "Prof. Shushupti", role: "Faculty Advisor", dept: "Advisory Board" },
    { uid: "fc2", name: "Faculty Representative", role: "Department Coordinator", dept: "Technology" },
    { uid: "fc3", name: "Faculty Representative", role: "Department Coordinator", dept: "Management" },
  ],
  team: [
    { uid: "tm1", name: "Neeharika", role: "Tech Team · Research" },
    { uid: "tm2", name: "Aditi", role: "Tech Team · Research" },
    { uid: "tm3", name: "Student Lead", role: "Web & Product" },
    { uid: "tm4", name: "Student Lead", role: "Design & Media" },
  ],
  listings: [
    {
      uid: "jb1",
      startupSlug: "nexora-labs",
      role: "React developer",
      skills: ["React", "TypeScript"],
      commitment: "8 hrs/week",
      compensation: "Equity",
    },
    {
      uid: "jb2",
      startupSlug: "reloop",
      role: "Logo & brand designer",
      skills: ["Figma", "Branding"],
      commitment: "One-off",
      compensation: "Paid",
    },
    {
      uid: "jb3",
      startupSlug: "mediroute",
      role: "Marketing lead",
      skills: ["Social media", "Content"],
      commitment: "5 hrs/week",
      compensation: "Unpaid",
    },
    {
      uid: "jb4",
      startupSlug: "skillspring",
      role: "Backend engineer",
      skills: ["Node.js", "Postgres"],
      commitment: "10 hrs/week",
      compensation: "Paid",
    },
  ],
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
