import type { SiteText } from "@/types/content";

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
