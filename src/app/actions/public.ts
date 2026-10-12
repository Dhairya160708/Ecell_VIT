"use server";
import { saveInboxItem } from "@/lib/content";
import { db } from "@/lib/supabase/admin";
import { makeUid } from "@/lib/utils";

export type FormResult = { ok: true } | { ok: false; error: string };

const f = (form: FormData, key: string, max = 2000) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max);
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
// Bots fill every field; humans never see the hidden "website" field.
const isBot = (form: FormData) => !!f(form, "website");
const now = () => new Date().toISOString();

// Database trouble must never leave the visitor hanging: log it and return a readable error.
async function safe(fn: () => Promise<FormResult>): Promise<FormResult> {
  try {
    return await fn();
  } catch (e) {
    console.error("form submission failed", e);
    return { ok: false, error: "Something went wrong on our side. Please try again in a moment." };
  }
}

async function sendMessageImpl(form: FormData): Promise<FormResult> {
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

async function submitIdeaImpl(form: FormData): Promise<FormResult> {
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

async function applyToListingImpl(form: FormData): Promise<FormResult> {
  if (isBot(form)) return { ok: true };
  const listingUid = f(form, "listingUid", 40),
    name = f(form, "name", 100),
    email = f(form, "email", 120),
    pitch = f(form, "pitch", 2000);
  if (!name || !pitch) return { ok: false, error: "Please add your name and a short pitch." };
  if (!emailOk(email)) return { ok: false, error: "That email address doesn't look right." };
  const { data: listing } = await db()
    .from("listings")
    .select("role,startup_slug,startups(name)")
    .eq("uid", listingUid)
    .maybeSingle();
  if (!listing) return { ok: false, error: "This role is no longer open." };
  const startups = listing.startups as unknown as { name: string } | null;
  const startup = startups?.name ?? listing.startup_slug;
  await saveInboxItem({
    kind: "applications",
    id: makeUid("a"),
    createdAt: now(),
    listingUid,
    role: listing.role as string,
    startup,
    name,
    email,
    pitch,
    status: "New",
  });
  return { ok: true };
}

export async function sendMessage(form: FormData) {
  return safe(() => sendMessageImpl(form));
}
export async function submitIdea(form: FormData) {
  return safe(() => submitIdeaImpl(form));
}
export async function applyToListing(form: FormData) {
  return safe(() => applyToListingImpl(form));
}
