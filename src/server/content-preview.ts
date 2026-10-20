import type { Content } from "@/types/content";
import { defaultSite } from "@/lib/constants";

const demoContent: Content = {
  site: {
    ...defaultSite,
    heroTagline: "A local preview of the E-Cell VIT website.",
    manifesto:
      "This is sample content for a local preview. Connect Supabase to edit and publish real E-Cell content.",
    aboutLead: "Explore a preview of the E-Cell VIT website without connecting a database.",
    aboutBody:
      "The sample cards and events below are illustrative only. Public forms and the admin panel are disabled in preview mode.",
  },
  stats: [
    { uid: "preview-stat-1", value: "30+", label: "Student ideas supported" },
    { uid: "preview-stat-2", value: "12", label: "Campus events" },
    { uid: "preview-stat-3", value: "6", label: "Student divisions" },
    { uid: "preview-stat-4", value: "1", label: "Community of builders" },
  ],
  events: [
    {
      uid: "preview-event",
      title: "Demo Founder Workshop",
      date: "2026-11-15",
      category: "Workshop",
      summary: "A sample event card shown only in local preview mode.",
    },
  ],
  startups: [
    {
      uid: "preview-startup",
      slug: "demo-venture",
      regId: "PREVIEW ONLY",
      name: "Demo Venture",
      pitch: "Sample startup content for previewing the public site.",
      category: "Other",
      status: "Building",
      stage: "Preview",
      founder: "Demo founder",
      problem: "This is illustrative content, not a real startup.",
      solution: "Connect Supabase to load the real startup directory.",
    },
  ],
  listings: [],
  divisions: [
    { uid: "preview-division", name: "Builders", line: "A sample E-Cell division for preview mode." },
  ],
  faculty: [],
  team: [],
  posts: [],
  grants: [],
};

export function getPreviewContent(): Content {
  return demoContent;
}
