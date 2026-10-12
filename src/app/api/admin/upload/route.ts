import { currentFaculty } from "@/lib/auth";
import { writeBinary } from "@/lib/store";
import { makeUid } from "@/lib/utils";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Photos are resized in the browser before upload, so 4 MB is plenty.
export async function POST(req: Request) {
  if (!(await currentFaculty())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No photo was received." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Please use a JPG, PNG or WebP photo." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024)
    return Response.json({ error: "That photo is too large (max 4 MB)." }, { status: 400 });
  const name = `${makeUid("img")}.${ext}`;
  await writeBinary(`media/${name}`, await file.arrayBuffer(), file.type);
  return Response.json({ url: `/media/${name}` });
}
