// Usage: node --env-file=.env.local scripts/seed.mjs
// Seeds only what is safe and generic (site text, divisions). Real startups, events and people are added
// from the admin panel, never invented here.
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const site = {
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
const divisions = [
  ["Tech", "Builds the platforms, tools and prototypes the cell runs on."],
  ["Events", "Runs summits, sprints and pitch nights from first poster to final mic."],
  ["PR", "Carries the E-Cell story to press, partners and the wider ecosystem."],
  ["Creatives", "Owns the look: posters, reels, decks and everything in between."],
  ["Marketing", "Fills the rooms, grows the community, and measures what works."],
  ["Networking", "Opens doors to mentors, investors, alumni and industry partners."],
].map(([name, line], position) => ({ uid: `dv${position + 1}`, name, line, position }));

for (const [table, rows] of [
  ["site_settings", [{ id: 1, data: site }]],
  ["divisions", divisions],
]) {
  const { error } = await sb.from(table).upsert(rows);
  if (error) throw error;
  console.log("seeded", table);
}
