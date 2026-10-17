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

/**
 * WhatsApp community invite link. Set NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL (it is read at build time,
 * so redeploy after changing it). Anything that isn't an https WhatsApp link is ignored, which hides the button.
 */
export const whatsappCommunityUrl = (() => {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL?.trim();
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    const ok = u.protocol === "https:" && (u.hostname === "wa.me" || u.hostname.endsWith("whatsapp.com"));
    return ok ? u.toString() : undefined;
  } catch {
    return undefined;
  }
})();

export const startupCategories = [
  "AI / Productivity",
  "Climate Tech",
  "FinTech",
  "HealthTech",
  "EdTech",
  "Community",
  "SaaS",
  "Developer Tools",
  "FoodTech",
  "Hardware",
  "Other",
];
