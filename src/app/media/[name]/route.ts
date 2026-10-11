import { readBinary } from "@/lib/store";

// Serves uploaded photos from the private store. Names are unique per upload, so cache forever.
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w-]+\.(jpg|png|webp)$/.test(name)) return new Response("Not found", { status: 404 });
  const file = await readBinary(`media/${name}`);
  if (!file) return new Response("Not found", { status: 404 });
  const body = file.body instanceof ReadableStream ? file.body : new Uint8Array(file.body);
  return new Response(body, {
    headers: { "Content-Type": file.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
