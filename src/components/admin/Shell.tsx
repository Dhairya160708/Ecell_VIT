"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  Home,
  Inbox,
  LogOut,
  Menu,
  Rocket,
  Shield,
  Type,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/app/actions/admin";
import { Crest } from "@/components/Logo";

const nav = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, badge: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/startups", label: "Startups", icon: Rocket },
  { href: "/admin/jobs", label: "Jobs board", icon: BriefcaseBusiness },
  { href: "/admin/people", label: "People", icon: Users },
  { href: "/admin/divisions", label: "Divisions", icon: Shield },
  { href: "/admin/site", label: "Website text", icon: Type },
];

export function Shell({ badge, children }: { badge: React.ReactNode; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Admin sections">
      {nav.map(({ href, label, icon: Icon, badge: hasBadge }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold transition ${active ? "bg-[#c7a54f] text-[#0b0e11]" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{label}</span>
            {hasBadge && badge}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold text-white/75 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-5 w-5" />
          View website
        </a>
        <form action={logout}>
          <button className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </form>
      </div>
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-black ring-1 ring-[#c7a54f]/50">
        <Crest className="h-8 w-auto" />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-base font-semibold tracking-[0.18em] text-white">E-CELL</span>
        <span className="block text-xs font-semibold text-[#c7a54f]">Admin panel</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-svh bg-[#f1efe9] font-sans text-[#1d1d1b] lg:flex">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-72 shrink-0 flex-col gap-8 bg-[#0b1711] p-5 lg:flex">
        {brand}
        {links}
      </aside>

      {/* mobile top bar + slide-out menu */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-[#0b1711] px-4 py-3 lg:hidden">
        {brand}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid h-11 w-11 place-items-center rounded-xl text-white ring-1 ring-white/20"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col gap-8 bg-[#0b1711] p-5">
            <div className="flex items-center justify-between">
              {brand}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-xl text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {links}
          </aside>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
