"use client";
import { useEffect, useState } from "react";
import { saveSection } from "@/server/actions/admin";
import type { SiteText, Stat } from "@/types/content";
import { Btn, Card, FieldShell, inputCls, useToast } from "./ui";
import { ImageField } from "./ImageField";

type Key = keyof SiteText;
const groups: {
  title: string;
  where: string;
  fields: {
    key: Key;
    label: string;
    hint?: string;
    max: number;
    rows?: number;
    type?: string;
    optional?: boolean;
  }[];
}[] = [
  {
    title: "Top of the home page",
    where: "The first thing visitors see.",
    fields: [
      { key: "heroKicker", label: "Small line above the big headline", max: 90 },
      { key: "heroTagline", label: "Tagline under the headline", max: 140, rows: 2 },
    ],
  },
  {
    title: "Our oath",
    where: "The large statement that lights up word by word as you scroll.",
    fields: [
      {
        key: "manifesto",
        label: "Oath text",
        max: 220,
        rows: 3,
        hint: "The words “scouts”, “walls”, “ventures” and “build” automatically appear in gold.",
      },
    ],
  },
  {
    title: "About section",
    where: "The light section with the framed poster.",
    fields: [
      { key: "aboutLead", label: "First paragraph", max: 260, rows: 3 },
      { key: "aboutBody", label: "Second paragraph", max: 300, rows: 3 },
    ],
  },
  {
    title: "Bottom banner",
    where: "The gold banner just above the footer.",
    fields: [{ key: "ctaHeading", label: "Banner headline", max: 50 }],
  },
  {
    title: "Contact details",
    where: "Shown in the footer and on the Contact page.",
    fields: [
      { key: "email", label: "Email address", max: 100, type: "email" },
      { key: "address", label: "Address", max: 200, rows: 2 },
      {
        key: "instagram",
        label: "Instagram link",
        max: 200,
        optional: true,
        hint: "Paste the full link, e.g. https://instagram.com/ecellvit. Leave empty to hide the icon.",
      },
      {
        key: "linkedin",
        label: "LinkedIn link",
        max: 200,
        optional: true,
        hint: "Paste the full link. Leave empty to hide the icon.",
      },
    ],
  },
  {
    title: "Teams page",
    where: "The large group photo used in the scroll transition on the Teams page.",
    fields: [
      {
        key: "teamPhoto",
        label: "Team group photo",
        type: "image",
        max: 300,
        optional: true,
        hint: "Use a real group photograph. Leave empty until one is available; the page then shows the member cards without the scroll effect.",
      },
    ],
  },
  {
    title: "Footer resources",
    where:
      "Links shown in the Resources and Participate groups. Empty fields are shown as unavailable, never invented.",
    fields: [
      {
        key: "linktree",
        label: "Linktree",
        max: 300,
        optional: true,
        hint: "Full https:// link. Leave empty to show “Coming soon”.",
      },
      {
        key: "introReel",
        label: "Introduction reel",
        max: 300,
        optional: true,
        hint: "Instagram/YouTube reel or video link. Leave empty to show “Coming soon”.",
      },
      {
        key: "posters",
        label: "Instagram posters / gallery link",
        max: 300,
        optional: true,
        hint: "Leave empty to link to the on-site photo gallery instead.",
      },
      {
        key: "publicity",
        label: "Publicity team link",
        max: 300,
        optional: true,
        hint: "A verified page or profile for the publicity team. Leave empty to hide it.",
      },
      {
        key: "ideaForm",
        label: "Startup idea form",
        max: 300,
        optional: true,
        hint: "A Google Form or similar. Leave empty to use the website's own Pitch an idea form.",
      },
      {
        key: "interviewForm",
        label: "Interview form",
        max: 300,
        optional: true,
        hint: "A Google Form or similar. Leave empty to show “Coming soon”.",
      },
    ],
  },
];

export function SiteEditor({
  site: initialSite,
  stats: initialStats,
  siteRevision: initialSiteRevision,
  statsRevision: initialStatsRevision,
}: {
  site: SiteText;
  stats: Stat[];
  siteRevision: number;
  statsRevision: number;
}) {
  const [site, setSite] = useState(initialSite);
  const [stats, setStats] = useState(initialStats);
  const [siteRevision, setSiteRevision] = useState(initialSiteRevision);
  const [statsRevision, setStatsRevision] = useState(initialStatsRevision);
  const [saved, setSaved] = useState({ site: initialSite, stats: initialStats });
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const dirtySite = JSON.stringify(site) !== JSON.stringify(saved.site);
  const dirtyStats = JSON.stringify(stats) !== JSON.stringify(saved.stats);
  const dirty = dirtySite || dirtyStats;

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    const tooLong = groups.flatMap((g) => g.fields).find((f) => site[f.key].length > f.max);
    if (tooLong) {
      toast({ tone: "error", text: `“${tooLong.label}” is too long. Please shorten it.` });
      return;
    }
    setBusy(true);
    const results = await Promise.all([
      dirtySite ? saveSection("site", site, siteRevision) : { ok: true as const },
      dirtyStats ? saveSection("stats", stats, statsRevision) : { ok: true as const },
    ]);
    setBusy(false);
    if (results[0].ok && "revision" in results[0] && results[0].revision !== undefined)
      setSiteRevision(results[0].revision);
    if (results[1].ok && "revision" in results[1] && results[1].revision !== undefined)
      setStatsRevision(results[1].revision);
    const failed = results.find((r) => !r.ok);
    if (failed && !failed.ok) {
      toast({ tone: "error", text: failed.error });
      return;
    }
    setSaved({ site, stats });
    toast({ tone: "success", text: "Saved. The website is updated." });
  }

  return (
    <div className="space-y-6 pb-28">
      {groups.map((g) => (
        <Card key={g.title}>
          <h2 className="font-grotesk text-xl font-bold">{g.title}</h2>
          <p className="mt-1 text-sm text-black/55">{g.where}</p>
          <div className="mt-5 space-y-5">
            {g.fields.map((f) => (
              <FieldShell
                key={f.key}
                id={f.key}
                label={f.label}
                hint={f.hint}
                required={!f.optional}
                max={f.max}
                count={site[f.key].length}
              >
                {f.type === "image" ? (
                  <ImageField
                    id={f.key}
                    value={site[f.key] || undefined}
                    onChange={(url) => setSite({ ...site, [f.key]: url ?? "" })}
                  />
                ) : f.rows ? (
                  <textarea
                    id={f.key}
                    rows={f.rows}
                    value={site[f.key]}
                    onChange={(e) => setSite({ ...site, [f.key]: e.target.value })}
                    className={`${inputCls} resize-y leading-relaxed`}
                  />
                ) : (
                  <input
                    id={f.key}
                    type={f.type ?? "text"}
                    value={site[f.key]}
                    onChange={(e) => setSite({ ...site, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                )}
              </FieldShell>
            ))}
          </div>
          {g.title === "About section" && (
            <div className="mt-8 border-t border-black/10 pt-6">
              <h3 className="font-grotesk text-lg font-bold">The four big numbers</h3>
              <p className="mt-1 text-sm text-black/55">
                Shown under the About section. They count up when visitors scroll to them.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {stats.map((s, i) => (
                  <div key={s.uid} className="flex gap-3 rounded-xl bg-[#f7f5ef] p-3">
                    <label className="w-24 shrink-0 text-sm font-semibold">
                      Number
                      <input
                        value={s.value}
                        maxLength={6}
                        onChange={(e) =>
                          setStats(stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                        }
                        className={`${inputCls} mt-1 text-center font-bold`}
                        placeholder="30+"
                      />
                    </label>
                    <label className="flex-1 text-sm font-semibold">
                      Label
                      <input
                        value={s.label}
                        maxLength={40}
                        onChange={(e) =>
                          setStats(stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                        }
                        className={`${inputCls} mt-1`}
                        placeholder="Student ideas supported"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* sticky save bar only when there are changes */}
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/95 backdrop-blur transition-transform duration-300 lg:left-72 ${dirty ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <p className="text-[15px] font-semibold">You have unsaved changes</p>
          <div className="flex gap-2">
            <Btn
              onClick={() => {
                setSite(saved.site);
                setStats(saved.stats);
              }}
            >
              Undo changes
            </Btn>
            <Btn variant="primary" busy={busy} onClick={save}>
              Save changes
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
