"use client";
import { useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, Lightbulb, Mail, MessageSquare, Rocket, Trash2 } from "lucide-react";
import { approveIdea, removeInbox, updateInbox } from "@/server/actions/admin";
import type { Application, Idea, InboxItem, InboxKind, Message } from "@/types/content";
import { Badge, Btn, Card, Empty, inputCls, timeAgo, useConfirm, useToast } from "./ui";

const tabs: { kind: InboxKind; label: string; icon: React.ReactNode; empty: string }[] = [
  {
    kind: "messages",
    label: "Messages",
    icon: <MessageSquare className="h-4 w-4" />,
    empty: "Messages sent from the Contact page will show up here.",
  },
  {
    kind: "ideas",
    label: "Startup ideas",
    icon: <Lightbulb className="h-4 w-4" />,
    empty: "Ideas submitted through “Pitch your idea” will show up here for review.",
  },
  {
    kind: "applications",
    label: "Job applications",
    icon: <BriefcaseBusiness className="h-4 w-4" />,
    empty: "Applications from the Jobs page will show up here.",
  },
];

const tone = (s: string) =>
  (s === "New"
    ? "red"
    : s === "Approved" || s === "Done" || s === "Contacted"
      ? "green"
      : s === "Rejected" || s === "Closed"
        ? "gray"
        : "gold") as "red" | "green" | "gray" | "gold";
const isOpen = (s: string) => !["Done", "Approved", "Rejected", "Closed"].includes(s);

export function InboxView({
  initial,
  tab: startTab,
}: {
  initial: { messages: Message[]; ideas: Idea[]; applications: Application[] };
  tab: InboxKind;
}) {
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<InboxKind>(startTab);
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const list = (data[tab] as InboxItem[]).filter((x) => showAll || isOpen(x.status));
  const patchLocal = (kind: InboxKind, id: string, patch: Partial<InboxItem>) =>
    setData((d) => ({
      ...d,
      [kind]: (d[kind] as InboxItem[]).map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));

  async function update(
    item: InboxItem,
    patch: { status?: string; note?: string; score?: number; comments?: string },
    msg?: string,
  ) {
    const r = await updateInbox(item.kind, item.id, patch);
    if (!r.ok) {
      toast({ tone: "error", text: r.error });
      return;
    }
    patchLocal(item.kind, item.id, patch as Partial<InboxItem>);
    if (msg) toast({ tone: "success", text: msg });
  }

  async function toggle(item: InboxItem) {
    const opening = openId !== item.id;
    setOpenId(opening ? item.id : null);
    // Opening a new message marks it as read automatically.
    if (opening && item.kind === "messages" && item.status === "New") update(item, { status: "Read" });
  }

  async function del(item: InboxItem) {
    if (
      !(await confirm({
        title: "Delete this permanently?",
        body: "This can't be undone.",
        confirm: "Delete",
        danger: true,
      }))
    )
      return;
    const r = await removeInbox(item.kind, item.id);
    if (!r.ok) {
      toast({ tone: "error", text: r.error });
      return;
    }
    setData((d) => ({ ...d, [item.kind]: (d[item.kind] as InboxItem[]).filter((x) => x.id !== item.id) }));
    toast({ tone: "success", text: "Deleted." });
  }

  async function approve(idea: Idea) {
    if (
      !(await confirm({
        title: `Approve “${idea.name}”?`,
        body: "It will be added to the startup directory on the website straight away. You can edit or remove it later from the Startups page.",
        confirm: "Approve & publish",
      }))
    )
      return;
    const r = await approveIdea(idea.id);
    if (!r.ok) {
      toast({ tone: "error", text: r.error });
      return;
    }
    patchLocal("ideas", idea.id, { status: "Approved", startupSlug: r.message });
    toast({ tone: "success", text: `${idea.name} is now on the website.` });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((t) => {
          const n = (data[t.kind] as InboxItem[]).filter((x) => x.status === "New").length;
          return (
            <button
              key={t.kind}
              role="tab"
              aria-selected={tab === t.kind}
              onClick={() => {
                setTab(t.kind);
                setOpenId(null);
              }}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition ${tab === t.kind ? "bg-[#0b1711] text-white" : "bg-white text-black/70 ring-1 ring-black/10 hover:ring-black/25"}`}
            >
              {t.icon}
              {t.label}
              {n > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#b3261e] px-1.5 text-[11px] font-bold text-white">
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <label className="mt-5 flex w-fit cursor-pointer items-center gap-2.5 text-[15px] text-black/70">
        <input
          type="checkbox"
          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
          className="h-5 w-5 accent-[#1c4a35]"
        />
        Also show finished items
      </label>

      <div className="mt-6 space-y-3">
        {list.length === 0 && (
          <Empty
            icon={tabs.find((t) => t.kind === tab)!.icon}
            title={showAll ? "Nothing here yet" : "All caught up!"}
          >
            {showAll
              ? tabs.find((t) => t.kind === tab)!.empty
              : "There's nothing waiting for you here. Tick “Also show finished items” to see older ones."}
          </Empty>
        )}
        {list.map((item) => {
          const open = openId === item.id;
          const preview =
            item.kind === "messages"
              ? item.body
              : item.kind === "ideas"
                ? item.pitch
                : `${item.role} at ${item.startup}`;
          return (
            <Card key={item.id} className={`!p-0 ${item.status === "New" ? "ring-2 !ring-[#c7a54f]" : ""}`}>
              <button
                onClick={() => toggle(item)}
                aria-expanded={open}
                className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-grotesk text-[17px] font-bold">{item.name}</p>
                    <Badge tone={tone(item.status)}>{item.status}</Badge>
                    {item.kind === "ideas" && <Badge>{item.category}</Badge>}
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[15px] text-black/60">{preview}</p>
                </div>
                <span className="hidden shrink-0 text-sm text-black/45 sm:block">
                  {timeAgo(item.createdAt)}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-black/40 transition ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <div className="border-t border-black/10 p-4 sm:p-5">
                  <Details item={item} />
                  <Actions item={item} onUpdate={update} onApprove={approve} />
                  <div className="mt-5 flex justify-end border-t border-black/10 pt-4">
                    <Btn variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => del(item)}>
                      Delete
                    </Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[160px_1fr]">
      <dt className="text-sm font-semibold text-black/50">{label}</dt>
      <dd className="whitespace-pre-wrap text-[15px] leading-relaxed">{children}</dd>
    </div>
  );
}

function Details({ item }: { item: InboxItem }) {
  const sent = new Date(item.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const email = (
    <a href={`mailto:${item.email}`} className="font-semibold text-[#1c4a35] underline underline-offset-2">
      {item.email}
    </a>
  );
  return (
    <dl className="divide-y divide-black/5">
      {item.kind === "messages" && (
        <>
          <Row label="From">{item.name}</Row>
          <Row label="Email">{email}</Row>
          {item.role && <Row label="They are a">{item.role}</Row>}
          <Row label="Message">{item.body}</Row>
        </>
      )}
      {item.kind === "ideas" && (
        <>
          <Row label="Pitch">{item.pitch}</Row>
          <Row label="Problem">{item.problem}</Row>
          <Row label="Solution">{item.solution}</Row>
          <Row label="Team">{item.team}</Row>
          <Row label="Email">{email}</Row>
        </>
      )}
      {item.kind === "applications" && (
        <>
          <Row label="Applicant">{item.name}</Row>
          <Row label="Email">{email}</Row>
          <Row label="Applied for">
            {item.role} at {item.startup}
          </Row>
          <Row label="Their pitch">{item.pitch}</Row>
        </>
      )}
      <Row label="Received">{sent}</Row>
    </dl>
  );
}

type UpdateFn = (
  item: InboxItem,
  patch: { status?: string; note?: string; score?: number; comments?: string },
  msg?: string,
) => Promise<void>;

function Actions({
  item,
  onUpdate,
  onApprove,
}: {
  item: InboxItem;
  onUpdate: UpdateFn;
  onApprove: (i: Idea) => void;
}) {
  const [text, setText] = useState(
    item.kind === "ideas" ? (item.comments ?? "") : item.kind === "messages" ? (item.note ?? "") : "",
  );
  const [score, setScore] = useState(item.kind === "ideas" ? (item.score ?? 5) : 5);
  const mail = (subject: string) => `mailto:${item.email}?subject=${encodeURIComponent(subject)}`;
  const replyBtn = (subject: string, label: string) => (
    <a
      href={mail(subject)}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b1711] px-4 text-[15px] font-semibold text-white hover:bg-[#1c4a35]"
    >
      <Mail className="h-4 w-4" />
      {label}
    </a>
  );

  if (item.kind === "messages")
    return (
      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {replyBtn("Re: your message to E-Cell VIT", "Reply by email")}
          {item.status !== "Done" ? (
            <Btn onClick={() => onUpdate(item, { status: "Done" }, "Marked as done.")}>Mark as done</Btn>
          ) : (
            <Btn onClick={() => onUpdate(item, { status: "Read" }, "Moved back to open.")}>
              Mark as not done
            </Btn>
          )}
        </div>
        <NoteBox
          label="Private note (only admins see this)"
          value={text}
          onChange={setText}
          onSave={() => onUpdate(item, { note: text }, "Note saved.")}
        />
      </div>
    );

  if (item.kind === "applications")
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        {replyBtn(`Your application: ${item.role} at ${item.startup}`, "Email applicant")}
        {item.status === "New" && (
          <Btn onClick={() => onUpdate(item, { status: "Contacted" }, "Marked as contacted.")}>
            Mark as contacted
          </Btn>
        )}
        {item.status !== "Closed" ? (
          <Btn onClick={() => onUpdate(item, { status: "Closed" }, "Application closed.")}>Close</Btn>
        ) : (
          <Btn onClick={() => onUpdate(item, { status: "New" }, "Re-opened.")}>Re-open</Btn>
        )}
      </div>
    );

  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-xl bg-[#f7f5ef] p-4">
        <label
          htmlFor={`score-${item.id}`}
          className="flex items-center justify-between text-[15px] font-semibold"
        >
          Your score{" "}
          <span className="font-grotesk text-2xl font-bold tabular-nums">
            {score}
            <span className="text-base text-black/40">/10</span>
          </span>
        </label>
        <input
          id={`score-${item.id}`}
          type="range"
          min={0}
          max={10}
          value={score}
          onChange={(e) => setScore(+e.target.value)}
          className="mt-2 w-full accent-[#1c4a35]"
        />
        <div className="mt-4">
          <NoteBox
            label="Review comments (only admins see this)"
            value={text}
            onChange={setText}
            onSave={() =>
              onUpdate(
                item,
                { comments: text, score, ...(item.status === "New" ? { status: "Reviewing" } : {}) },
                "Review saved.",
              )
            }
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {item.status !== "Approved" ? (
          <Btn variant="primary" icon={<Rocket className="h-4 w-4" />} onClick={() => onApprove(item)}>
            Approve & add to website
          </Btn>
        ) : (
          item.startupSlug && (
            <Link
              href="/admin/startups"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2f6b4d]/15 px-4 text-[15px] font-semibold text-[#1c4a35]"
            >
              <Rocket className="h-4 w-4" />
              On the website. Edit in Startups
            </Link>
          )
        )}
        {replyBtn(`Your idea “${item.name}” · E-Cell VIT`, "Email founder")}
        {item.status !== "Rejected" && item.status !== "Approved" && (
          <Btn onClick={() => onUpdate(item, { status: "Rejected" }, "Marked as not selected.")}>
            Not selected
          </Btn>
        )}
      </div>
    </div>
  );
}

function NoteBox({
  label,
  value,
  onChange,
  onSave,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <div>
      <label className="text-[15px] font-semibold">
        {label}
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} mt-1.5 resize-y`}
        />
      </label>
      <Btn className="mt-2" onClick={onSave}>
        Save
      </Btn>
    </div>
  );
}
