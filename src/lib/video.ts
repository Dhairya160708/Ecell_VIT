export type Video =
  | { kind: "embed"; src: string; provider: "YouTube" | "Vimeo" | "Google Drive" }
  | { kind: "link"; href: string };

const YT_ID = /^[\w-]{11}$/;

/** Turns a pasted video link into an embeddable player URL, or a plain link when the provider isn't supported. */
export function parseVideo(raw: string | undefined): Video | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^(www|m)\./, "");
  const parts = u.pathname.split("/").filter(Boolean);

  let yt: string | undefined;
  if (host === "youtu.be") yt = parts[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parts[0] === "watch") yt = u.searchParams.get("v") ?? undefined;
    else if (["embed", "shorts", "live", "v"].includes(parts[0])) yt = parts[1];
  }
  if (yt && YT_ID.test(yt))
    return {
      kind: "embed",
      provider: "YouTube",
      src: `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`,
    };

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parts.find((p) => /^\d+$/.test(p));
    if (id) return { kind: "embed", provider: "Vimeo", src: `https://player.vimeo.com/video/${id}?dnt=1` };
  }

  if (
    host === "drive.google.com" &&
    parts[0] === "file" &&
    parts[1] === "d" &&
    /^[\w-]+$/.test(parts[2] ?? "")
  )
    return {
      kind: "embed",
      provider: "Google Drive",
      src: `https://drive.google.com/file/d/${parts[2]}/preview`,
    };

  return { kind: "link", href: u.toString() };
}
