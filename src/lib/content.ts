import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  defaultContent,
  type Application,
  type Content,
  type Idea,
  type InboxItem,
  type InboxKind,
  type Message,
} from "./data";
import { listPaths, readText, remove, writeText } from "./store";

const CURRENT = "content/current.json";
const HISTORY = "content/history/";
const KEEP_VERSIONS = 40;

/** Fill in anything missing (e.g. a section added after the content was first saved). */
function normalize(raw: Partial<Content> | null): Content {
  const c = { ...defaultContent, ...(raw ?? {}) } as Content;
  c.site = { ...defaultContent.site, ...(raw?.site ?? {}) };
  return c;
}

/** Always-fresh read, for the admin panel and for saving. */
export async function readContent(): Promise<Content> {
  const txt = await readText(CURRENT);
  try {
    return normalize(txt ? JSON.parse(txt) : null);
  } catch {
    return normalize(null);
  }
}

/** Cached read for the public website. Admin saves call updateTag("content") to refresh it. */
export async function getContent(): Promise<Content> {
  "use cache";
  cacheTag("content");
  cacheLife("max");
  return readContent();
}

/** Save a whole new content object and keep a copy in the version history. */
// Labels are base64url-encoded so pathnames only contain characters that survive storage round-trips.
const encodeLabel = (label: string) => Buffer.from(label.slice(0, 60)).toString("base64url");
const decodeLabel = (raw: string) => {
  if (raw.startsWith("b64-")) return Buffer.from(raw.slice(4), "base64url").toString("utf8");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};
const historyPath = (at: Date, label: string) =>
  `${HISTORY}${at.toISOString().replace(/[:.]/g, "-")}__b64-${encodeLabel(label)}.json`;

export async function writeContent(next: Content, label: string) {
  // First save ever: keep the original website too, so even the very first change can be undone.
  if (!(await listPaths(HISTORY)).length) {
    await writeText(
      historyPath(new Date(Date.now() - 1000), "Starting version"),
      JSON.stringify(await readContent()),
    );
  }
  const body = JSON.stringify(next);
  await writeText(CURRENT, body);
  await writeText(historyPath(new Date(), label), body);
  const versions = await listPaths(HISTORY);
  await Promise.all(versions.slice(KEEP_VERSIONS).map((v) => remove(v.pathname)));
}

export async function listVersions() {
  const versions = await listPaths(HISTORY);
  return versions.map((v) => {
    const file = v.pathname.slice(HISTORY.length).replace(/\.json$/, "");
    const [, label = ""] = file.split("__");
    return { pathname: v.pathname, savedAt: v.uploadedAt.toISOString(), label: decodeLabel(label) };
  });
}

export async function readVersion(pathname: string): Promise<Content | null> {
  if (!pathname.startsWith(HISTORY)) return null;
  const txt = await readText(pathname);
  try {
    return txt ? normalize(JSON.parse(txt)) : null;
  } catch {
    return null;
  }
}

// ---------- inbox ----------
const inboxPath = (kind: InboxKind, id: string) => `inbox/${kind}/${id}.json`;

export async function saveInboxItem(item: InboxItem) {
  await writeText(inboxPath(item.kind, item.id), JSON.stringify(item));
}

type ItemOf = { messages: Message; ideas: Idea; applications: Application };

export async function getInboxItem<K extends InboxKind>(kind: K, id: string): Promise<ItemOf[K] | null> {
  const txt = await readText(inboxPath(kind, id));
  return txt ? (JSON.parse(txt) as ItemOf[K]) : null;
}

export async function deleteInboxItem(kind: InboxKind, id: string) {
  await remove(inboxPath(kind, id));
}

export async function listInbox<K extends InboxKind>(kind: K): Promise<ItemOf[K][]> {
  const paths = await listPaths(`inbox/${kind}/`);
  const items: ItemOf[K][] = [];
  await Promise.all(
    paths.map(async (p) => {
      const txt = await readText(p.pathname);
      try {
        if (txt) items.push(JSON.parse(txt) as ItemOf[K]);
      } catch {
        /* skip unreadable item */
      }
    }),
  );
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
