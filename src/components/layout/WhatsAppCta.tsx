import { ArrowUpRight } from "lucide-react";
import { whatsappCommunityUrl } from "@/lib/constants";

// lucide has no brand icons, so the WhatsApp glyph is inline (Simple Icons path).
export function WhatsAppIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/**
 * "Join our WhatsApp Community". The link comes from NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL only.
 * Until it is set: the footer shows a disabled "Coming soon" button, other spots render nothing,
 * so there is never a dead link.
 */
export function WhatsAppCta({ variant }: { variant: "footer" | "banner" }) {
  const url = whatsappCommunityUrl;
  if (!url) {
    if (variant === "banner") return null;
    return (
      <span
        aria-disabled="true"
        title="The WhatsApp community is launching soon"
        className="inline-flex cursor-not-allowed items-center gap-2.5 border border-line px-4 py-2.5 font-grotesk text-xs font-bold uppercase tracking-[0.14em] text-subtle"
      >
        <WhatsAppIcon />
        WhatsApp Community · Coming soon
      </span>
    );
  }
  const cls =
    variant === "footer"
      ? "group inline-flex items-center gap-2.5 border border-line-strong px-4 py-2.5 font-grotesk text-xs font-bold uppercase tracking-[0.14em] text-ivory transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-ink"
      : "group inline-flex items-center justify-center gap-2.5 bg-[#25D366] px-7 py-3.5 font-grotesk text-sm font-bold uppercase tracking-[0.12em] text-ink transition hover:bg-[#1ebe5b]";
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>
      <WhatsAppIcon className={variant === "footer" ? "h-[18px] w-[18px]" : "h-5 w-5"} />
      Join our WhatsApp Community
      <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" />
    </a>
  );
}
