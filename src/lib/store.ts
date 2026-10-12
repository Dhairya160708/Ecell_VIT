import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { get, put } from "@vercel/blob";

/**
 * Storage for uploaded photos only (all other data lives in Supabase). In production photos live in a
 * *private* Vercel Blob store (BLOB_READ_WRITE_TOKEN). Without a token (local dev) it falls back to files
 * under .data/ so uploading locally never touches the live site.
 */
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL = path.join(process.cwd(), ".data");

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
