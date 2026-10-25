import { currentFaculty } from "@/server/auth";
import { photoStorageConfigurationError, writeBinary } from "@/server/media-store";
import { makeUid } from "@/lib/utils";
import { isPreviewMode } from "@/server/preview";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Photos are resized in the browser before upload, so 4 MB is plenty.
export async function POST(req: Request) {
  if (isPreviewMode())
    return Response.json({ error: "Photo uploads are disabled in local preview mode." }, { status: 503 });
  if (!(await currentFaculty())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const storageError = photoStorageConfigurationError();
  if (storageError) return Response.json({ error: storageError }, { status: 503 });
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "No photo was received." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Please use a JPG, PNG or WebP photo." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024)
    return Response.json({ error: "That photo is too large (max 4 MB)." }, { status: 400 });
  const name = `${makeUid("img")}.${ext}`;
  try {
    await writeBinary(`media/${name}`, await file.arrayBuffer(), file.type);
  } catch (e) {
    console.error("photo upload failed", e);
    return Response.json({ error: "The photo could not be saved. Please try again." }, { status: 500 });
  }
  return Response.json({ url: `/media/${name}` });
}
