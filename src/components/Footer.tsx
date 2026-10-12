import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import type { SiteText } from "@/types/content";

const go = [
  ["Events", "/events"],
  ["Startups", "/startups"],
  ["Marketplace", "/marketplace"],
  ["Submit an idea", "/submit"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

export function Footer({ site }: { site: SiteText }) {
  const socials = [
    ["Instagram", "IG", site.instagram],
    ["LinkedIn", "IN", site.linkedin],
  ].filter(([, , url]) => url);
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-20 md:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted">
            Building a culture where every curious mind at Vidyalankar can learn, experiment, and create
            meaningful ventures.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(([label, short, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center border border-line-strong font-grotesk text-xs font-bold text-muted transition hover:border-gold hover:text-gold"
              >
                {short}
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="font-grotesk text-xs font-bold uppercase tracking-[0.24em] text-gold">Go to</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-1">
            {go.map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-sm text-muted transition hover:text-gold">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-grotesk text-xs font-bold uppercase tracking-[0.24em] text-gold">Find us</p>
          <div className="mt-5 space-y-5 text-sm leading-6 text-muted">
            <p className="flex gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold" />
              {site.address}
            </p>
            <a href={`mailto:${site.email}`} className="flex items-center gap-3 transition hover:text-gold">
              <Mail className="h-4 w-4 shrink-0 text-gold" />
              {site.email}
            </a>
          </div>
        </div>
      </div>
      {/* giant wordmark: outlined, fills with metal on hover */}
      <div className="group mt-16 select-none px-2 text-center" aria-hidden>
        <span className="relative inline-block font-display text-[41vw] leading-[0.78]">
          <span className="text-outline opacity-40">E-CELL</span>
          <span className="text-metal absolute inset-0 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:[clip-path:inset(0_0_0_0)]">
            E-CELL
          </span>
        </span>
      </div>
      <div className="border-t border-line px-5 py-5 text-center text-xs text-subtle">
        © 2026 E-Cell VIT. Built by the students of Vidyalankar.
      </div>
    </footer>
  );
}
