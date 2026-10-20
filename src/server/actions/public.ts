"use server";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { saveInboxItem } from "@/server/content";
import { db } from "@/server/supabase/admin";
import { isPreviewMode } from "@/server/preview";
import { makeUid } from "@/lib/utils";
import { isValidEmail } from "@/lib/form-validation";
import type { Feedback } from "@/types/content";

export type FormResult = { ok: true } | { ok: false; error: string };

const f = (form: FormData, key: string, max = 2000) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max);
// Bots fill every field; humans never see the hidden "website" field.
const isBot = (form: FormData) => !!f(form, "website");
const now = () => new Date().toISOString();
const PREVIEW_ERROR = "Forms are disabled in local preview mode. Connect Supabase to enable submissions.";
const RATE_LIMIT_ERROR = "You've sent several submissions. Please wait a few minutes and try again.";

async function allowSubmission(kind: string) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  const ip = [requestHeaders.get("x-real-ip")?.trim(), forwarded].find(
    (candidate) => candidate && isIP(candidate),
  );
  const clientIp = ip ?? (process.env.NODE_ENV === "production" ? "" : "127.0.0.1");
  if (!clientIp) throw new Error("Could not determine the visitor IP for submission rate limiting.");

  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Supabase is not configured for public form submissions.");
  const key = createHmac("sha256", secret).update(`${kind}:${clientIp}`).digest("hex");
  const { data, error } = await db().rpc("consume_form_rate_limit", {
    p_key: key,
    p_window_seconds: 600,
    p_max_requests: 5,
  });
  if (error) throw new Error(`Could not check submission rate limit: ${error.message}`);
  if (data !== true) console.warn("public form rate limit exceeded", { kind });
  return data === true;
}

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
  if (isPreviewMode()) return { ok: false, error: PREVIEW_ERROR };
  if (isBot(form)) return { ok: true };
  const name = f(form, "name", 100),
    email = f(form, "email", 120),
    role = f(form, "role", 60),
    body = f(form, "body", 3000);
  if (!name || !body) return { ok: false, error: "Please add your name and a message." };
  if (!isValidEmail(email)) return { ok: false, error: "That email address doesn't look right." };
  if (!(await allowSubmission("message"))) return { ok: false, error: RATE_LIMIT_ERROR };
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
  if (isPreviewMode()) return { ok: false, error: PREVIEW_ERROR };
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
  if (!isValidEmail(idea.email)) return { ok: false, error: "That email address doesn't look right." };
  if (!(await allowSubmission("idea"))) return { ok: false, error: RATE_LIMIT_ERROR };
  await saveInboxItem({ kind: "ideas", id: makeUid("i"), createdAt: now(), status: "New", ...idea });
  return { ok: true };
}

async function applyToListingImpl(form: FormData): Promise<FormResult> {
  if (isPreviewMode()) return { ok: false, error: PREVIEW_ERROR };
  if (isBot(form)) return { ok: true };
  const listingUid = f(form, "listingUid", 40),
    name = f(form, "name", 100),
    email = f(form, "email", 120),
    pitch = f(form, "pitch", 2000);
  if (!name || !pitch) return { ok: false, error: "Please add your name and a short pitch." };
  if (!isValidEmail(email)) return { ok: false, error: "That email address doesn't look right." };
  if (!(await allowSubmission("application"))) return { ok: false, error: RATE_LIMIT_ERROR };
  const { data: listing, error } = await db()
    .from("listings")
    .select("role,startup_slug,startups(name)")
    .eq("uid", listingUid)
    .maybeSingle();
  if (error) throw new Error(`Could not look up the open role: ${error.message}`);
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

export type FeedbackResult = { ok: true; feedback: Feedback } | { ok: false; error: string };

// Control characters and runs of blank lines are stripped so a comment can't mangle the page layout.
const tidy = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

async function submitFeedbackImpl(form: FormData): Promise<FeedbackResult> {
  if (isPreviewMode()) return { ok: false, error: PREVIEW_ERROR };
  const slug = f(form, "slug", 80);
  const name = tidy(f(form, "name", 60)).replace(/\s+/g, " ");
  const body = tidy(f(form, "body", 500));
  // Bots get a convincing success without anything being stored.
  if (isBot(form))
    return { ok: true, feedback: { id: "", startupSlug: slug, name, body, hidden: false, createdAt: now() } };
  if (body.length < 3) return { ok: false, error: "Please write at least a few words." };
  if (/https?:\/\/|www\./i.test(body))
    return { ok: false, error: "Links aren't allowed in feedback. Please describe it in words." };
  if (!(await allowSubmission("feedback"))) return { ok: false, error: RATE_LIMIT_ERROR };

  const client = db();
  const { data: startup } = await client.from("startups").select("slug").eq("slug", slug).maybeSingle();
  if (!startup) return { ok: false, error: "That startup could not be found." };

  // Light abuse guard: a cap on how fast a startup can receive comments, and no repeat of the same text.
  const since = (ms: number) => new Date(Date.now() - ms).toISOString();
  const { count: recent } = await client
    .from("startup_feedback")
    .select("id", { count: "exact", head: true })
    .eq("startup_slug", slug)
    .gte("created_at", since(60_000));
  if ((recent ?? 0) >= 8)
    return { ok: false, error: "Lots of feedback is coming in. Please try again in a minute." };
  const { count: dupes } = await client
    .from("startup_feedback")
    .select("id", { count: "exact", head: true })
    .eq("startup_slug", slug)
    .eq("body", body)
    .gte("created_at", since(600_000));
  if ((dupes ?? 0) > 0) return { ok: false, error: "That comment has already been posted." };

  const feedback: Feedback = {
    id: makeUid("fb"),
    startupSlug: slug,
    name,
    body,
    hidden: false,
    createdAt: now(),
  };
  const { error } = await client.from("startup_feedback").insert({
    id: feedback.id,
    startup_slug: slug,
    name,
    body,
    created_at: feedback.createdAt,
  });
  if (error) throw new Error(error.message);
  return { ok: true, feedback };
}

export async function submitFeedback(form: FormData): Promise<FeedbackResult> {
  try {
    return await submitFeedbackImpl(form);
  } catch (e) {
    console.error("feedback submission failed", e);
    return { ok: false, error: "Something went wrong on our side. Please try again in a moment." };
  }
}
