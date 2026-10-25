import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { WhatsAppCta } from "./WhatsAppCta";
import type { SiteText } from "@/types/content";

type FooterLink = { label: string; href?: string; external?: boolean };

const explore: FooterLink[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Startups", href: "/startups" },
  { label: "Jobs", href: "/jobs" },
  { label: "Gallery", href: "/#gallery" },
];
const community: FooterLink[] = [
  { label: "Our team", href: "/team" },
  { label: "Blog", href: "/blog" },
  { label: "Government grants", href: "/grants" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

// lucide no longer ships brand icons, so these two are inline.
function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.05c.53-.96 1.84-1.97 3.78-1.97 4.04 0 4.79 2.5 4.79 5.75V21h-4v-5.1c0-1.22-.02-2.78-1.8-2.78-1.8 0-2.07 1.3-2.07 2.69V21h-4V9.75Z" />
    </svg>
  );
}

/** Only complete http(s) links are rendered; everything else is shown as unavailable, never guessed. */
function webUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

const linkCls = "text-sm text-muted transition hover:text-gold";
const colHead = "font-grotesk text-xs font-bold uppercase tracking-[0.24em] text-gold";

function LinkItem({ link }: { link: FooterLink }) {
  if (!link.href) {
    return (
      <li>
        <span
          aria-disabled="true"
          title="This link has not been added yet"
          className="inline-flex items-center gap-2 text-sm text-subtle/70"
        >
          {link.label}
          <span className="font-grotesk text-[9px] font-bold uppercase tracking-[0.14em] text-gold/60">
            soon
          </span>
        </span>
      </li>
    );
  }
  return (
    <li>
      {link.external ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkCls} inline-flex items-center gap-1.5`}
        >
          {link.label}
          <ArrowUpRight className="h-3.5 w-3.5 text-gold/70" />
        </a>
      ) : (
        <Link href={link.href} className={linkCls}>
          {link.label}
        </Link>
      )}
    </li>
  );
}

function LinkList({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <p className={colHead}>{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <LinkItem key={link.label} link={link} />
        ))}
      </ul>
    </nav>
  );
}

export function Footer({ site }: { site: SiteText }) {
  const socials = [
    { label: "Instagram", url: webUrl(site.instagram), icon: <InstagramIcon /> },
    { label: "LinkedIn", url: webUrl(site.linkedin), icon: <LinkedInIcon /> },
  ];
  const resourceLinks: FooterLink[] = [
    { label: "Linktree", href: webUrl(site.linktree), external: true },
    { label: "Introduction reel", href: webUrl(site.introReel), external: true },
    site.posters
      ? { label: "Posters", href: webUrl(site.posters), external: true }
      : { label: "Photo gallery", href: "/#gallery" },
    { label: "Publicity team", href: webUrl(site.publicity), external: true },
    site.ideaForm
      ? { label: "Pitch an idea", href: webUrl(site.ideaForm), external: true }
      : { label: "Pitch an idea", href: "/submit" },
    { label: "Interview form", href: webUrl(site.interviewForm), external: true },
  ];
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg">
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-moss/20 blur-[120px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_0.65fr_0.8fr_1fr_1.05fr] lg:gap-8 lg:py-20">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-7 text-muted">
              Building a culture where every curious mind at Vidyalankar can learn, experiment, and create
              meaningful ventures.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {socials.map(({ label, url, icon }) =>
                url ? (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 border border-line-strong px-4 py-2.5 font-grotesk text-xs font-bold uppercase tracking-[0.14em] text-ivory transition hover:border-gold hover:bg-gold hover:text-ink"
                  >
                    {icon}
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition group-hover:opacity-100" />
                  </a>
                ) : (
                  <span
                    key={label}
                    title="Add this link in the admin panel under Website text"
                    className="inline-flex cursor-not-allowed items-center gap-2.5 border border-line px-4 py-2.5 font-grotesk text-xs font-bold uppercase tracking-[0.14em] text-subtle"
                  >
                    {icon}
                    {label}
                  </span>
                ),
              )}
              <WhatsAppCta variant="footer" />
            </div>
          </div>
          <LinkList title="Explore" links={explore} />
          <LinkList title="Community" links={community} />
          <LinkList title="Resources" links={resourceLinks} />
          <div>
            <p className={colHead}>Find us</p>
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
            <div className="mt-7 border-t border-line pt-5">
              <p className="text-xs leading-5 text-subtle">
                Have something to share?{" "}
                <Link href="/blog/submit" className="text-gold transition hover:text-gold-light">
                  Submit a blog
                </Link>{" "}
                or{" "}
                <Link href="/contact" className="text-gold transition hover:text-gold-light">
                  get in touch
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-2 border-t border-line py-6 text-xs text-subtle sm:flex-row">
          <p>© 2026 E-Cell VIT. Built by the students of Vidyalankar.</p>
          <p className="font-grotesk uppercase tracking-[0.24em] text-gold/70">The Scouts of VIT</p>
        </div>
      </div>
    </footer>
  );
}
