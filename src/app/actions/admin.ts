"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { adminPassword, requireAdmin } from "@/lib/auth";
import { COOKIE, MAX_AGE, createToken, timingSafeEqual } from "@/lib/session";
import {
  deleteInboxItem,
  getInboxItem,
  readContent,
  readVersion,
  saveInboxItem,
  writeContent,
} from "@/lib/content";
import { makeUid, slugify, type Content, type InboxKind, type Section } from "@/lib/data";

export type Result = { ok: true; message?: string } | { ok: false; error: string };

// ---------- login ----------
export async function login(_: string | null, form: FormData): Promise<string | null> {
  const expected = adminPassword();
  if (!expected)
    return "The admin password hasn't been set up yet. Ask your website person to set ADMIN_PASSWORD.";
  const given = String(form.get("password") ?? "");
  if (!timingSafeEqual(given, expected)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return "That password isn't right. Check caps lock and try again.";
  }
  (await cookies()).set(COOKIE, await createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
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
      instagram: str(o.instagram, 300),
      linkedin: str(o.linkedin, 300),
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
      status: pick(o.status, ["Upcoming", "Ongoing", "Past"] as const),
      summary: str(o.summary, 400),
      report: str(o.report, 160) || undefined,
    })),
  startups: (v) => {
    const seen = new Set<string>();
    return arr(v).map((o) => {
      let slug = slugify(str(o.slug) || str(o.name));
      while (seen.has(slug)) slug = `${slug}-2`;
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
      };
    });
  },
  listings: (v) =>
    arr(v).map((o) => ({
      uid: str(o.uid, 40) || makeUid("jb"),
      startupSlug: str(o.startupSlug, 80),
      role: str(o.role, 80),
      skills: (Array.isArray(o.skills) ? o.skills : [])
        .map((s) => str(s, 30))
        .filter(Boolean)
        .slice(0, 12),
      commitment: str(o.commitment, 40),
      compensation: pick(o.compensation, ["Paid", "Equity", "Unpaid"] as const),
    })),
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
  team: (v) =>
    arr(v).map((o) => ({
      uid: str(o.uid, 40) || makeUid("tm"),
      name: str(o.name, 80),
      role: str(o.role, 80),
      photo: media(o.photo),
    })),
};

const sectionNames: Record<Section, string> = {
  site: "Website text",
  stats: "Numbers",
  events: "Events",
  startups: "Startups",
  listings: "Jobs board",
  divisions: "Divisions",
  faculty: "Faculty",
  team: "Team",
};

export async function saveSection<K extends Section>(section: K, value: Content[K]): Promise<Result> {
  try {
    await requireAdmin();
    if (!(section in clean)) return { ok: false, error: "Unknown section." };
    const current = await readContent();
    const next = { ...current, [section]: clean[section](value) };
    await writeContent(next, `Edited ${sectionNames[section]}`);
    updateTag("content");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong while saving." };
  }
}

export async function restoreVersion(pathname: string): Promise<Result> {
  try {
    await requireAdmin();
    const version = await readVersion(pathname);
    if (!version) return { ok: false, error: "That saved version could not be found." };
    await writeContent(version, "Restored an earlier version");
    updateTag("content");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not restore that version." };
  }
}

// ---------- inbox ----------
export async function updateInbox(
  kind: InboxKind,
  id: string,
  patch: { status?: string; note?: string; score?: number; comments?: string },
): Promise<Result> {
  try {
    await requireAdmin();
    const item = await getInboxItem(kind, id);
    if (!item) return { ok: false, error: "That item no longer exists." };
    const next = { ...item } as Record<string, unknown>;
    if (patch.status) next.status = str(patch.status, 20);
    if (patch.note !== undefined) next.note = str(patch.note, 2000);
    if (patch.comments !== undefined) next.comments = str(patch.comments, 2000);
    if (patch.score !== undefined)
      next.score = Math.min(10, Math.max(0, Math.round(Number(patch.score) || 0)));
    await saveInboxItem(next as typeof item);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update that item." };
  }
}

export async function removeInbox(kind: InboxKind, id: string): Promise<Result> {
  try {
    await requireAdmin();
    await deleteInboxItem(kind, id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not delete that item." };
  }
}

/** Approve a submitted idea and publish it as a startup on the website in one click. */
export async function approveIdea(id: string): Promise<Result> {
  try {
    await requireAdmin();
    const idea = await getInboxItem("ideas", id);
    if (!idea) return { ok: false, error: "That idea no longer exists." };
    const content = await readContent();
    let slug = slugify(idea.name);
    while (content.startups.some((s) => s.slug === slug)) slug = `${slug}-2`;
    const startup = {
      uid: makeUid("sp"),
      slug,
      regId: "",
      name: idea.name,
      pitch: idea.pitch,
      category: idea.category,
      status: "Idea" as const,
      stage: "Approved idea",
      founder: idea.team.split(/[\n,]/)[0]?.trim() || "Student founder",
      problem: idea.problem,
      solution: idea.solution,
    };
    await writeContent(
      { ...content, startups: [...content.startups, startup] },
      `Approved idea: ${idea.name}`,
    );
    await saveInboxItem({ ...idea, status: "Approved", startupSlug: slug });
    updateTag("content");
    return { ok: true, message: slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not approve that idea." };
  }
}
