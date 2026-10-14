import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { defaultSite } from "@/lib/constants";
import {
  type Application,
  type Content,
  type Idea,
  type InboxItem,
  type InboxKind,
  type Message,
  type Section,
} from "@/types/content";
import { db } from "./supabase/admin";

// ---------- row <-> Content mapping ----------
// Each list section is a table. `position` keeps the order the admin chose.
type Row = Record<string, unknown>;
const nul = <T>(v: T | null | undefined) => (v == null || v === "" ? undefined : v);

type ListDef = { table: string; from: (r: Row) => Row; to: (o: Row) => Row };
const lists: Record<
  "stats" | "divisions" | "events" | "startups" | "listings" | "faculty" | "team" | "posts" | "grants",
  ListDef
> = {
  stats: {
    table: "stats",
    from: (r: Row) => ({ uid: r.uid, value: r.value, label: r.label }),
    to: (o: Row) => ({ uid: o.uid, value: o.value, label: o.label }),
  },
  divisions: {
    table: "divisions",
    from: (r: Row) => ({ uid: r.uid, name: r.name, line: r.line }),
    to: (o: Row) => ({ uid: o.uid, name: o.name, line: o.line }),
  },
  events: {
    table: "events",
    from: (r: Row) => ({
      uid: r.uid,
      title: r.title,
      date: r.date,
      endDate: nul(r.end_date),
      category: r.category,
      summary: r.summary,
      report: nul(r.report),
      reportUrl: nul(r.report_url),
    }),
    to: (o: Row) => ({
      uid: o.uid,
      title: o.title,
      date: o.date,
      end_date: o.endDate ?? null,
      category: o.category,
      summary: o.summary,
      report: o.report ?? null,
      report_url: o.reportUrl ?? null,
    }),
  },
  startups: {
    table: "startups",
    from: (r: Row) => ({
      uid: r.uid,
      slug: r.slug,
      regId: r.reg_id,
      name: r.name,
      pitch: r.pitch,
      category: r.category,
      status: r.status,
      stage: r.stage,
      founder: r.founder,
      problem: r.problem,
      solution: r.solution,
      photo: nul(r.photo),
      website: nul(r.website),
    }),
    to: (o: Row) => ({
      uid: o.uid,
      slug: o.slug,
      reg_id: o.regId,
      name: o.name,
      pitch: o.pitch,
      category: o.category,
      status: o.status,
      stage: o.stage,
      founder: o.founder,
      problem: o.problem,
      solution: o.solution,
      photo: o.photo ?? null,
      website: o.website ?? null,
    }),
  },
  listings: {
    table: "listings",
    from: (r: Row) => ({
      uid: r.uid,
      startupSlug: r.startup_slug,
      role: r.role,
      skills: r.skills ?? [],
      commitment: r.commitment,
      compensation: r.compensation,
    }),
    to: (o: Row) => ({
      uid: o.uid,
      startup_slug: o.startupSlug,
      role: o.role,
      skills: o.skills,
      commitment: o.commitment,
      compensation: o.compensation,
    }),
  },
  faculty: {
    table: "faculty_members",
    from: (r: Row) => ({ uid: r.uid, name: r.name, role: r.role, dept: nul(r.dept), photo: nul(r.photo) }),
    to: (o: Row) => ({
      uid: o.uid,
      name: o.name,
      role: o.role,
      dept: o.dept ?? null,
      photo: o.photo ?? null,
    }),
  },
  team: {
    table: "team_members",
    from: (r: Row) => ({
      uid: r.uid,
      name: r.name,
      role: r.role,
      domain: nul(r.domain),
      linkedin: nul(r.linkedin),
      github: nul(r.github),
      photo: nul(r.photo),
    }),
    to: (o: Row) => ({
      uid: o.uid,
      name: o.name,
      role: o.role,
      domain: o.domain ?? null,
      linkedin: o.linkedin ?? null,
      github: o.github ?? null,
      photo: o.photo ?? null,
    }),
  },
  posts: {
    table: "blog_posts",
    from: (r: Row) => ({
      uid: r.uid,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      body: r.body,
      author: r.author,
      date: r.date,
      cover: nul(r.cover),
    }),
    to: (o: Row) => ({
      uid: o.uid,
      slug: o.slug,
      title: o.title,
      summary: o.summary,
      body: o.body,
      author: o.author,
      date: o.date,
      cover: o.cover ?? null,
    }),
  },
  grants: {
    table: "grants",
    from: (r: Row) => ({
      uid: r.uid,
      name: r.name,
      agency: r.agency,
      amount: r.amount,
      deadline: r.deadline,
      eligibility: r.eligibility,
      summary: r.summary,
      url: nul(r.url),
    }),
    to: (o: Row) => ({
      uid: o.uid,
      name: o.name,
      agency: o.agency,
      amount: o.amount,
      deadline: o.deadline,
      eligibility: o.eligibility,
      summary: o.summary,
      url: o.url ?? null,
    }),
  },
};

type ListSection = keyof typeof lists;

async function readList(section: ListSection) {
  const l = lists[section];
  const { data, error } = await db().from(l.table).select("*").order("position").order("uid");
  if (error) throw new Error(`Could not read ${section}: ${error.message}`);
  return (data as Row[]).map(l.from);
}

/** Always-fresh read, for the admin panel and for saving. */
export async function readContent(): Promise<Content> {
  const [settings, stats, events, startups, listings, divisions, faculty, team, posts, grants] =
    await Promise.all([
      db().from("site_settings").select("data").eq("id", 1).maybeSingle(),
      readList("stats"),
      readList("events"),
      readList("startups"),
      readList("listings"),
      readList("divisions"),
      readList("faculty"),
      readList("team"),
      readList("posts"),
      readList("grants"),
    ]);
  return {
    site: { ...defaultSite, ...((settings.data?.data as object) ?? {}) },
    stats,
    events,
    startups,
    listings,
    divisions,
    faculty,
    team,
    posts,
    grants,
  } as unknown as Content;
}

/** Cached read for the public website. Admin saves call updateTag("content") to refresh it. */
export async function getContent(): Promise<Content> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  return readContent();
}

/** Replace one whole section: upsert what is given (in order) and delete what was removed. */
export async function writeSection<K extends Section>(section: K, value: Content[K]) {
  const client = db();
  if (section === "site") {
    const { error } = await client.from("site_settings").upsert({ id: 1, data: value });
    if (error) throw new Error(error.message);
    return;
  }
  const l = lists[section as ListSection];
  const items = value as unknown as Row[];
  if (items.length) {
    const { error } = await client
      .from(l.table)
      .upsert(items.map((o, position) => ({ ...l.to(o), position })));
    if (error) throw new Error(error.message);
  }
  const keep = items.map((o) => o.uid as string);
  const del = client.from(l.table).delete();
  const { error } = keep.length
    ? await del.not("uid", "in", `(${keep.map((k) => `"${k}"`).join(",")})`)
    : await del.neq("uid", "");
  if (error) throw new Error(error.message);
}

// ---------- inbox ----------
const inbox = {
  messages: { table: "messages" },
  ideas: { table: "ideas" },
  applications: { table: "applications" },
} as const;

type ItemOf = { messages: Message; ideas: Idea; applications: Application };

const fromRow = (kind: InboxKind, r: Row) => {
  const base = { kind, id: r.id as string, createdAt: new Date(r.created_at as string).toISOString() };
  if (kind === "messages")
    return {
      ...base,
      name: r.name,
      email: r.email,
      role: r.role,
      body: r.body,
      status: r.status,
      note: nul(r.note),
    };
  if (kind === "ideas")
    return {
      ...base,
      name: r.name,
      pitch: r.pitch,
      category: r.category,
      problem: r.problem,
      solution: r.solution,
      team: r.team,
      email: r.email,
      status: r.status,
      score: nul(r.score),
      comments: nul(r.comments),
      startupSlug: nul(r.startup_slug),
      reviewedBy: nul(r.reviewed_by),
      reviewedAt: nul(r.reviewed_at),
    };
  return {
    ...base,
    listingUid: r.listing_uid ?? "",
    role: r.role,
    startup: r.startup,
    name: r.name,
    email: r.email,
    pitch: r.pitch,
    status: r.status,
  };
};

const toRow = (item: InboxItem): Row => {
  const { kind, id, createdAt, ...rest } = item as InboxItem & Record<string, unknown>;
  void kind;
  const row: Row = { id, created_at: createdAt };
  for (const [k, v] of Object.entries(rest)) {
    if (k === "listingUid") row.listing_uid = v || null;
    else if (k === "startupSlug") row.startup_slug = v ?? null;
    else if (k === "reviewedBy") row.reviewed_by = v ?? null;
    else if (k === "reviewedAt") row.reviewed_at = v ?? null;
    else row[k] = v ?? null;
  }
  return row;
};

export async function saveInboxItem(item: InboxItem) {
  const { error } = await db().from(inbox[item.kind].table).upsert(toRow(item));
  if (error) throw new Error(error.message);
}

export async function getInboxItem<K extends InboxKind>(kind: K, id: string): Promise<ItemOf[K] | null> {
  const { data, error } = await db().from(inbox[kind].table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? (fromRow(kind, data) as unknown as ItemOf[K]) : null;
}

export async function deleteInboxItem(kind: InboxKind, id: string) {
  const { error } = await db().from(inbox[kind].table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listInbox<K extends InboxKind>(kind: K): Promise<ItemOf[K][]> {
  const { data, error } = await db()
    .from(inbox[kind].table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data as Row[]).map((r) => fromRow(kind, r)) as unknown as ItemOf[K][];
}
