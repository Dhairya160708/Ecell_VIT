"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { History, RotateCcw } from "lucide-react";
import { restoreVersion } from "@/app/actions/admin";
import { Btn, Card, Empty, timeAgo, useConfirm, useToast } from "./ui";

type Version = { pathname: string; savedAt: string; label: string };

export function HistoryList({ versions }: { versions: Version[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const confirm = useConfirm();
  const toast = useToast();
  const router = useRouter();

  async function restore(v: Version) {
    const when = new Date(v.savedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    if (
      !(await confirm({
        title: "Restore this version?",
        body: `The whole website will go back to how it was on ${when}. Nothing is lost: the current version stays in this list, so you can switch back.`,
        confirm: "Restore",
      }))
    )
      return;
    setBusy(v.pathname);
    const r = await restoreVersion(v.pathname);
    setBusy(null);
    if (!r.ok) {
      toast({ tone: "error", text: r.error });
      return;
    }
    toast({ tone: "success", text: "Done. The website now shows that version." });
    router.refresh();
  }

  if (!versions.length)
    return (
      <Empty icon={<History className="h-6 w-6" />} title="No saved changes yet">
        Every time someone saves a change, a copy appears here so it can be undone.
      </Empty>
    );

  return (
    <ul className="space-y-3">
      {versions.map((v, i) => (
        <li key={v.pathname}>
          <Card className="!p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-grotesk text-[17px] font-bold">
                  {v.label || "Saved change"}
                  {i === 0 && (
                    <span className="ml-2 rounded-full bg-[#2f6b4d]/15 px-2.5 py-0.5 text-xs font-semibold text-[#1c4a35]">
                      Live now
                    </span>
                  )}
                </p>
                <p className="text-sm text-black/55">
                  {timeAgo(v.savedAt)} ·{" "}
                  {new Date(v.savedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              {i > 0 && (
                <Btn
                  icon={<RotateCcw className="h-4 w-4" />}
                  busy={busy === v.pathname}
                  onClick={() => restore(v)}
                >
                  Restore this version
                </Btn>
              )}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
