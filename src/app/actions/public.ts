"use server";
import { readContent, saveInboxItem } from "@/lib/content";
import { makeUid } from "@/lib/data";

export type FormResult = { ok: true } | { ok: false; error: string };

const f = (form: FormData, key: string, max = 2000) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max);
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
// Bots fill every field; humans never see the hidden "website" field.
const isBot = (form: FormData) => !!f(form, "website");
const now = () => new Date().toISOString();

export async function sendMessage(form: FormData): Promise<FormResult> {
  if (isBot(form)) return { ok: true };
  const name = f(form, "name", 100),
    email = f(form, "email", 120),
    role = f(form, "role", 60),
    body = f(form, "body", 3000);
  if (!name || !body) return { ok: false, error: "Please add your name and a message." };
  if (!emailOk(email)) return { ok: false, error: "That email address doesn't look right." };
  await saveInboxItem({
    kind: "messages",
    id: makeUid("m"),
    createdAt: now(),
    name,
    email,
    role,
    body,
    status: "New",
  });
  return { ok: true };
}

export async function submitIdea(form: FormData): Promise<FormResult> {
  if (isBot(form)) return { ok: true };
  const idea = {
    name: f(form, "name", 60),
    pitch: f(form, "pitch", 300),
    category: f(form, "category", 40),
    problem: f(form, "problem"),
    solution: f(form, "solution"),
    team: f(form, "team", 1000),
    email: f(form, "email", 120),
  };
  if (!idea.name || !idea.pitch || !idea.problem || !idea.solution)
    return { ok: false, error: "Please fill in every step before submitting." };
  if (!emailOk(idea.email)) return { ok: false, error: "That email address doesn't look right." };
  await saveInboxItem({ kind: "ideas", id: makeUid("i"), createdAt: now(), status: "New", ...idea });
  return { ok: true };
}

export async function applyToListing(form: FormData): Promise<FormResult> {
  if (isBot(form)) return { ok: true };
  const listingUid = f(form, "listingUid", 40),
    name = f(form, "name", 100),
    email = f(form, "email", 120),
    pitch = f(form, "pitch", 2000);
  if (!name || !pitch) return { ok: false, error: "Please add your name and a short pitch." };
  if (!emailOk(email)) return { ok: false, error: "That email address doesn't look right." };
  const content = await readContent();
  const listing = content.listings.find((l) => l.uid === listingUid);
  if (!listing) return { ok: false, error: "This role is no longer open." };
  const startup = content.startups.find((s) => s.slug === listing.startupSlug)?.name ?? listing.startupSlug;
  await saveInboxItem({
    kind: "applications",
    id: makeUid("a"),
    createdAt: now(),
    listingUid,
    role: listing.role,
    startup,
    name,
    email,
    pitch,
    status: "New",
  });
  return { ok: true };
}
