import { ArrowUpRight, Play } from "lucide-react";
import { parseVideo } from "@/lib/video";

const corners = [
  "left-0 top-0 border-l-2 border-t-2",
  "right-0 top-0 border-r-2 border-t-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "bottom-0 right-0 border-b-2 border-r-2",
];

/** The founder's introduction video. Renders nothing when there is no usable link. */
export function VideoEmbed({ url, name }: { url?: string; name: string }) {
  const v = parseVideo(url);
  if (!v) return null;
  return (
    <section aria-labelledby="founder-video" className="mt-14">
      <h2 id="founder-video" className="font-display text-4xl">
        Meet the founder
      </h2>
      {v.kind === "embed" ? (
        <div className="relative mt-5 border border-line-strong bg-black p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9),0_0_40px_-10px_rgba(199,165,79,.25)] sm:p-2.5">
          {corners.map((c) => (
            <span key={c} aria-hidden className={`pointer-events-none absolute h-4 w-4 border-gold ${c}`} />
          ))}
          <div className="aspect-video w-full bg-elev">
            <iframe
              src={v.src}
              title={`${name} founder introduction video (${v.provider})`}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="h-full w-full border-0"
            />
          </div>
        </div>
      ) : (
        <a
          href={v.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 flex items-center gap-4 border border-line-strong bg-surface p-5 transition hover:border-gold"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-ink">
            <Play className="h-5 w-5 fill-current" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-grotesk text-sm font-bold uppercase tracking-[0.14em] text-ivory">
              Watch the founder introduction
            </span>
            <span className="block truncate text-sm text-muted">{v.href}</span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      )}
    </section>
  );
}
