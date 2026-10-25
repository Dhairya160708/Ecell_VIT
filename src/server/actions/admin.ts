"use server";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireFaculty } from "@/server/auth";
import { db } from "@/server/supabase/admin";
import { sessionClient } from "@/server/supabase/server";
import {
  deleteInboxItem,
  getBlogSubmission,
  getInboxItem,
  rejectBlogSubmission as rejectSubmissionRow,
  saveInboxItem,
  writeSection,
} from "@/server/content";
import { makeUid, slugify, uniqueSlug } from "@/lib/utils";
import { parseVideo } from "@/lib/video";
import { type Content, type InboxKind, type Section } from "@/types/content";
import { isPreviewMode } from "@/server/preview";

export type Result = { ok: true; message?: string; revision?: number } | { ok: false; error: string };

// ---------- login ----------
export async function login(_: string | null, form: FormData): Promise<string | null> {
  if (isPreviewMode()) return "Admin access is disabled in local preview mode.";
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return "Please enter your email and password.";
  const supabase = await sessionClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return "That email or password isn't right. Check caps lock and try again.";
  }
  const { data: row } = await db()
    .from("faculty_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!row) {
    await supabase.auth.signOut();
    return "This account isn't set up as E-Cell faculty. Ask your coordinator to add you.";
  }
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await (await sessionClient()).auth.signOut();
  redirect("/admin/login");
}

// ---------- content ----------
const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const pick = <T extends string>(v: unknown, allowed: readonly T[]) =>
  allowed.includes(v as T) ? (v as T) : allowed[0];
const media = (v: unknown) => {
  const s = str(v, 300);
  return s.startsWith("/media/") ? s : undefined;
};
// External or on-site links only: https:// URLs or paths starting with "/".
const link = (v: unknown) => {
  const s = str(v, 300);
  return /^https?:\/\/\S+$/i.test(s) || /^\/[\w\-/]*$/.test(s) ? s : undefined;
};
const arr = (v: unknown) => (Array.isArray(v) ? v.slice(0, 200) : []) as Record<string, unknown>[];

// Rebuild each section from known fields only, so nothing unexpected can be stored.
const clean: { [K in Section]: (v: unknown) => Content[K] } = {
  site: (v) => {
    const o = (v ?? {}) as Record<string, unknown>;
    return {
      heroKicker: str(o.heroKicker, 120),
      heroTagline: str(o.heroTagline, 200),
      manifesto: str(o.manifesto, 400),
      aboutLead: str(o.aboutLead, 400),
      aboutBody: str(o.aboutBody, 600),
      ctaHeading: str(o.ctaHeading, 80),
      email: str(o.email, 120),
      address: str(o.address, 300),
      instagram: link(o.instagram) ?? "",
      linkedin: link(o.linkedin) ?? "",
      teamPhoto: media(o.teamPhoto) ?? "",
      linktree: link(o.linktree) ?? "",
      introReel: link(o.introReel) ?? "",
      posters: link(o.posters) ?? "",
      publicity: link(o.publicity) ?? "",
      ideaForm: link(o.ideaForm) ?? "",
      interviewForm: link(o.interviewForm) ?? "",
    };
  },
  stats: (v) =>
    arr(v)
      .slice(0, 4)
      .map((o) => ({
        uid: str(o.uid, 40) || makeUid("st"),
        value: str(o.value, 8),
        label: str(o.label, 60),
      })),
  events: (v) =>
    arr(v).map((o) => ({
      uid: str(o.uid, 40) || makeUid("ev"),
      title: str(o.title, 80),
      date: /^\d{4}-\d{2}-\d{2}$/.test(str(o.date)) ? str(o.date) : new Date().toISOString().slice(0, 10),
      category: str(o.category, 60),
      endDate: /^\d{4}-\d{2}-\d{2}$/.test(str(o.endDate)) ? str(o.endDate) : undefined,
      summary: str(o.summary, 400),
      report: str(o.report, 160) || undefined,
      reportUrl: link(o.reportUrl),
    })),
  startups: (v) => {
    const seen = new Set<string>();
    return arr(v).map((o) => {
      const slug = uniqueSlug(str(o.slug) || str(o.name), seen);
      seen.add(slug);
      return {
        uid: str(o.uid, 40) || makeUid("sp"),
        slug,
        regId: str(o.regId, 40),
        name: str(o.name, 60),
        pitch: str(o.pitch, 300),
        category: str(o.category, 40),
        status: pick(o.status, ["Idea", "Building", "Launched"] as const),
        stage: str(o.stage, 40),
        founder: str(o.founder, 80),
        problem: str(o.problem, 800),
        solution: str(o.solution, 800),
        photo: media(o.photo),
        website: link(o.website),
        // parseVideo rejects unsafe protocols and unknown malformed links before they reach the site.
        video: (() => {
          const url = link(o.video);
          return url && parseVideo(url) ? url : undefined;
        })(),
      };
    });
  },
  listings: (v) =>
    arr(v).map((o) => {
      const rawUrl = str(o.applicationUrl, 300);
      const applicationUrl = /^https?:\/\/\S+$/i.test(rawUrl) ? rawUrl : undefined;
      if (o.applicationMethod === "external" && !applicationUrl)
        throw new Error("External roles need a full http(s) application URL.");
      const applicationMethod = o.applicationMethod === "external" ? "external" : "internal";
      return {
        uid: str(o.uid, 40) || makeUid("jb"),
        startupSlug: str(o.startupSlug, 80),
        role: str(o.role, 80),
        skills: (Array.isArray(o.skills) ? o.skills : [])
          .map((s) => str(s, 30))
          .filter(Boolean)
          .slice(0, 12),
        commitment: str(o.commitment, 40),
        compensation: pick(o.compensation, ["Paid", "Equity", "Unpaid"] as const),
        applicationMethod,
        applicationUrl: applicationMethod === "external" ? applicationUrl : undefined,
      } as Content["listings"][number];
    }),
  divisions: (v) =>
    arr(v).map((o) => ({
      uid: str(o.uid, 40) || makeUid("dv"),
      name: str(o.name, 30),
      line: str(o.line, 200),
    })),
  faculty: (v) =>
    arr(v).map((o) => ({
      uid: str(o.uid, 40) || makeUid("fc"),
      name: str(o.name, 80),
      role: str(o.role, 80),
      dept: str(o.dept, 80),
      photo: media(o.photo),
    })),
  posts: (v) => {
    const seen = new Set<string>();
    return arr(v).map((o) => {
      const slug = uniqueSlug(str(o.slug) || str(o.title), seen);
      seen.add(slug);
      return {
        uid: str(o.uid, 40) || makeUid("bp"),
        slug,
        title: str(o.title, 120),
        summary: str(o.summary, 300),
        body: str(o.body, 20000),
        author: str(o.author, 80),
        date: /^\d{4}-\d{2}-\d{2}$/.test(str(o.date)) ? str(o.date) : new Date().toISOString().slice(0, 10),
        cover: media(o.cover),
      };
    });
  },
  grants: (v) =>
    arr(v).map((o) => ({
      uid: str(o.uid, 40) || makeUid("gr"),
      name: str(o.name, 120),
      agency: str(o.agency, 120),
      amount: str(o.amount, 80),
      deadline: str(o.deadline, 80),
      eligibility: str(o.eligibility, 400),
      summary: str(o.summary, 600),
      url: link(o.url),
    })),
  gallery: (v) => {
    const photos: Content["gallery"] = [];
    for (const o of arr(v)) {
      const src = media(o.src);
      if (!src) continue;
      const width = Number(o.width);
      const height = Number(o.height);
      photos.push({
        uid: str(o.uid, 40) || makeUid("ph"),
        src,
        alt: str(o.alt, 180) || "E-Cell photo",
        caption: str(o.caption, 160) || undefined,
        width: Number.isFinite(width) && width > 0 ? Math.round(width) : undefined,
        height: Number.isFinite(height) && height > 0 ? Math.round(height) : undefined,
      });
    }
    return photos;
  },
  team: (v) =>
    arr(v).map((o) => ({
      uid: str(o.uid, 40) || makeUid("tm"),
      name: str(o.name, 80),
      role: str(o.role, 80),
      domain: str(o.domain, 40) || undefined,
      linkedin: link(o.linkedin),
      github: link(o.github),
      photo: media(o.photo),
    })),
};

export async function saveSection<K extends Section>(
  section: K,
  value: Content[K],
  expectedRevision: number,
): Promise<Result> {
  try {
    await requireFaculty();
    if (!(section in clean)) return { ok: false, error: "Unknown section." };
    if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
      return { ok: false, error: "This editor is out of date. Reload the page and try again." };
    const revision = await writeSection(section, clean[section](value), expectedRevision);
    updateTag("content");
    return { ok: true, revision };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong while saving." };
  }
}

// ---------- inbox ----------
const fail = (e: unknown, fallback: string): Result => ({
  ok: false,
  error: e instanceof Error ? e.message : fallback,
});

export async function updateInbox(
  kind: InboxKind,
  id: string,
  patch: { status?: string; note?: string; score?: number; comments?: string },
): Promise<Result> {
  try {
    const who = await requireFaculty();
    const item = await getInboxItem(kind, id);
    if (!item) return { ok: false, error: "That item no longer exists." };
    const next = { ...item } as Record<string, unknown>;
    if (patch.status) next.status = str(patch.status, 20);
    if (patch.note !== undefined) next.note = str(patch.note, 2000);
    if (patch.comments !== undefined) next.comments = str(patch.comments, 2000);
    if (patch.score !== undefined)
      next.score = Math.min(10, Math.max(0, Math.round(Number(patch.score) || 0)));
    if (kind === "ideas") {
      // An idea becomes a public startup only through approveIdea, never by flipping the status here.
      if (patch.status === "Approved" && !(item as { startupSlug?: string }).startupSlug)
        return { ok: false, error: "Use the Approve button, which also publishes the startup." };
      next.reviewedBy = who.name || who.email;
      next.reviewedAt = new Date().toISOString();
    }
    await saveInboxItem(next as typeof item);
    return { ok: true };
  } catch (e) {
    return fail(e, "Could not update that item.");
  }
}

export async function removeInbox(kind: InboxKind, id: string): Promise<Result> {
  try {
    await requireFaculty();
    await deleteInboxItem(kind, id);
    return { ok: true };
  } catch (e) {
    return fail(e, "Could not delete that item.");
  }
}

/** Approve a submitted idea and publish it as a startup on the website in one step. */
export async function approveIdea(id: string): Promise<Result> {
  try {
    const who = await requireFaculty();
    const idea = await getInboxItem("ideas", id);
    if (!idea) return { ok: false, error: "That idea no longer exists." };
    if (idea.status === "Approved" && idea.startupSlug) return { ok: true, message: idea.startupSlug };
    const { data: slug, error } = await db().rpc("approve_idea", {
      p_id: id,
      p_reviewer: who.name || who.email,
      p_uid: makeUid("sp"),
      p_base_slug: slugify(idea.name),
    });
    if (error) throw new Error(error.message);
    updateTag("content");
    return { ok: true, message: String(slug) };
  } catch (e) {
    return fail(e, "Could not approve that idea.");
  }
}

// ---------- startup feedback moderation ----------
export async function setFeedbackHidden(id: string, hidden: boolean): Promise<Result> {
  try {
    await requireFaculty();
    const { error } = await db().from("startup_feedback").update({ hidden }).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e, "Could not update that comment.");
  }
}

export async function deleteFeedback(id: string): Promise<Result> {
  try {
    await requireFaculty();
    const { error } = await db().from("startup_feedback").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e, "Could not delete that comment.");
  }
}

// ---------- student blog moderation ----------
export async function approveBlogSubmission(id: string): Promise<Result> {
  try {
    const who = await requireFaculty();
    const submission = await getBlogSubmission(id);
    if (!submission) return { ok: false, error: "That blog submission no longer exists." };
    if (submission.status === "approved" && submission.postSlug)
      return { ok: true, message: submission.postSlug };
    const { data: slug, error } = await db().rpc("approve_blog_submission", {
      p_id: id,
      p_uid: makeUid("bp"),
      p_base_slug: slugify(submission.title) || "student-blog",
      p_publish_date: new Date().toISOString().slice(0, 10),
      p_reviewer: who.name || who.email,
    });
    if (error) throw new Error(error.message);
    updateTag("content");
    return { ok: true, message: String(slug) };
  } catch (e) {
    return fail(e, "Could not approve that blog submission.");
  }
}

export async function rejectBlogSubmission(id: string, reason: string): Promise<Result> {
  try {
    const who = await requireFaculty();
    await rejectSubmissionRow(id, str(reason, 500), who.name || who.email);
    return { ok: true };
  } catch (e) {
    return fail(e, "Could not reject that blog submission.");
  }
}
