"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Clock, Mail, X } from "lucide-react";
import { approveBlogSubmission, rejectBlogSubmission } from "@/server/actions/admin";
import type { BlogSubmission } from "@/types/content";
import { Badge, Btn, Card, Empty, inputCls, useConfirm, useToast } from "./ui";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function BlogModeration({ submissions }: { submissions: BlogSubmission[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const pending = submissions.filter((s) => s.status === "pending");
  const decided = submissions.filter((s) => s.status !== "pending");

  async function approve(s: BlogSubmission) {
    setBusy(`a-${s.id}`);
    const r = await approveBlogSubmission(s.id);
    setBusy(null);
    if (!r.ok) {
      toast({ tone: "error", text: r.error });
      return;
    }
    toast({ tone: "success", text: `Published “${s.title}”.` });
    setOpen(null);
    router.refresh();
  }

  async function reject(s: BlogSubmission) {
    if (
      !(await confirm({
        title: "Reject this submission?",
        body: `“${s.title}” will stay private and will not be published.`,
        confirm: "Reject submission",
        danger: true,
      }))
    )
      return;
    setBusy(`r-${s.id}`);
    const r = await rejectBlogSubmission(s.id, reason);
    setBusy(null);
    if (!r.ok) {
      toast({ tone: "error", text: r.error });
      return;
    }
    toast({ tone: "success", text: "Submission rejected. It stays private." });
    setOpen(null);
    setReason("");
    router.refresh();
  }

  return (
    <div className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-grotesk text-2xl font-bold text-[#1d1d1b]">Student submissions</h2>
          <p className="mt-1 max-w-2xl text-sm text-[#1d1d1b]/60">
            Submitted at <code>/blog/submit</code>. Nothing is public until you approve it. Approval publishes
            the post on the Blog page; rejection keeps it private.
          </p>
        </div>
        <Badge tone={pending.length ? "gold" : "gray"}>
          <Clock className="mr-1 h-3.5 w-3.5" />
          {pending.length} waiting
        </Badge>
      </div>

      {pending.length === 0 ? (
        <Empty icon={<Check className="h-5 w-5" />} title="No submissions waiting">
          New student blogs will appear here for review.
        </Empty>
      ) : (
        <div className="space-y-3">
          {pending.map((s) => {
            const expanded = open === s.id;
            return (
              <Card key={s.id} className="!p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(expanded ? null : s.id);
                    setReason("");
                  }}
                  aria-expanded={expanded}
                  className="flex w-full items-start gap-4 p-5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-grotesk text-lg font-bold text-[#1d1d1b]">{s.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[#1d1d1b]/60">
                      {s.summary || s.body.slice(0, 180)}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/45">
                      <span>{s.author}</span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {s.authorEmail}
                      </span>
                      <span>{when(s.createdAt)}</span>
                    </p>
                  </div>
                  {expanded ? (
                    <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-black/40" />
                  ) : (
                    <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-black/40" />
                  )}
                </button>
                {expanded && (
                  <div className="border-t border-black/10 bg-[#faf8f2] p-5">
                    <p className="mb-4 whitespace-pre-wrap text-[15px] leading-7 text-[#1d1d1b]/80">
                      {s.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 border-t border-black/10 pt-4">
                      <Btn
                        variant="primary"
                        icon={<Check className="h-4 w-4" />}
                        busy={busy === `a-${s.id}`}
                        onClick={() => approve(s)}
                      >
                        Approve and publish
                      </Btn>
                      <label className="flex min-w-[16rem] flex-1 items-center gap-2">
                        <span className="sr-only">Rejection reason (optional, private)</span>
                        <input
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          maxLength={500}
                          placeholder="Private note for the record (optional)"
                          className={inputCls}
                        />
                      </label>
                      <Btn
                        variant="danger"
                        icon={<X className="h-4 w-4" />}
                        busy={busy === `r-${s.id}`}
                        onClick={() => reject(s)}
                      >
                        Reject
                      </Btn>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {decided.length > 0 && (
        <details className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-black/[0.07]">
          <summary className="cursor-pointer font-grotesk text-lg font-bold text-[#1d1d1b]">
            Reviewed submissions ({decided.length})
          </summary>
          <ul className="mt-4 divide-y divide-black/10">
            {decided.map((s) => (
              <li key={s.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#1d1d1b]">{s.title}</p>
                  <p className="mt-0.5 text-sm text-black/50">
                    {s.author} · {when(s.createdAt)}
                    {s.rejectionReason ? ` · Note: ${s.rejectionReason}` : ""}
                  </p>
                </div>
                <Badge tone={s.status === "approved" ? "green" : "red"}>{s.status}</Badge>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
