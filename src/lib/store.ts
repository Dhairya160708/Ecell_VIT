import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { del, get, list, put } from "@vercel/blob";

/**
 * Tiny storage adapter. In production everything lives in a *private* Vercel Blob store
 * (BLOB_READ_WRITE_TOKEN). Without a token (local dev) it falls back to files under .data/
 * so editing locally never touches the live site.
 */
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL = path.join(process.cwd(), ".data");

export async function readText(pathname: string): Promise<string | null> {
  if (useBlob) {
    let r = await get(pathname, { access: "private", useCache: false }).catch(() => null);
    // Older pathnames containing "%" get decoded by a pathname lookup; fetch those by their exact URL instead.
    if (!r && pathname.includes("%")) {
      const hit = (await list({ prefix: pathname, limit: 1 })).blobs[0];
      if (hit) r = await get(hit.url, { access: "private", useCache: false }).catch(() => null);
    }
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return new Response(r.stream).text();
  }
  return fs.readFile(path.join(LOCAL, pathname), "utf8").catch(() => null);
}

export async function writeText(pathname: string, body: string) {
  if (useBlob) {
    await put(pathname, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  const file = path.join(LOCAL, pathname);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, "utf8");
}

export async function remove(pathname: string) {
  if (useBlob) return del(pathname);
  await fs.rm(path.join(LOCAL, pathname), { force: true });
}

/** Pathnames under a prefix, newest first. */
export async function listPaths(prefix: string): Promise<{ pathname: string; uploadedAt: Date }[]> {
  if (useBlob) {
    const out: { pathname: string; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      out.push(...page.blobs.map((b) => ({ pathname: b.pathname, uploadedAt: b.uploadedAt })));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return out.sort((a, b) => +b.uploadedAt - +a.uploadedAt);
  }
  const dir = path.join(LOCAL, prefix);
  const names = await fs.readdir(dir).catch(() => [] as string[]);
  const rows = await Promise.all(
    names.map(async (n) => ({
      pathname: `${prefix}${n}`,
      uploadedAt: (await fs.stat(path.join(dir, n))).mtime,
    })),
  );
  return rows.sort((a, b) => +b.uploadedAt - +a.uploadedAt);
}

export async function writeBinary(pathname: string, data: ArrayBuffer, contentType: string) {
  if (useBlob) {
    await put(pathname, Buffer.from(data), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType,
    });
    return;
  }
  const file = path.join(LOCAL, pathname);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(data));
}

export async function readBinary(
  pathname: string,
): Promise<{ body: ReadableStream | Buffer; contentType: string } | null> {
  if (useBlob) {
    const r = await get(pathname, { access: "private" }).catch(() => null);
    if (!r || r.statusCode !== 200 || !r.stream) return null;
    return { body: r.stream, contentType: r.blob.contentType ?? "application/octet-stream" };
  }
  const buf = await fs.readFile(path.join(LOCAL, pathname)).catch(() => null);
  if (!buf) return null;
  const ext = path.extname(pathname).slice(1);
  return {
    body: buf,
    contentType: ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg",
  };
}
