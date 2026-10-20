"use client";
import { useState } from "react";
import { Eye, EyeOff, MessageCircle, Trash2 } from "lucide-react";
import { deleteFeedback, setFeedbackHidden } from "@/server/actions/admin";
import type { Feedback } from "@/types/content";
import { Badge, Btn, Card, Empty, timeAgo, useConfirm, useToast } from "./ui";

type Item = Feedback & { startupName: string };

export function FeedbackView({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const [showHidden, setShowHidden] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const list = items.filter((x) => showHidden || !x.hidden);

  async function toggle(item: Item) {
    setBusyId(item.id);
    const r = await setFeedbackHidden(item.id, !item.hidden);
    setBusyId(null);
    if (!r.ok) return toast({ tone: "error", text: r.error });
    setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, hidden: !x.hidden } : x)));
    toast({
      tone: "success",
      text: item.hidden ? "Comment is visible again." : "Comment hidden from the website.",
    });
  }

  async function del(item: Item) {
    if (
      !(await confirm({
        title: "Delete this comment permanently?",
        body: "This can't be undone. Use Hide instead if you might want it back.",
        confirm: "Delete",
        danger: true,
      }))
    )
      return;
    setBusyId(item.id);
    const r = await deleteFeedback(item.id);
    setBusyId(null);
    if (!r.ok) return toast({ tone: "error", text: r.error });
    setItems((xs) => xs.filter((x) => x.id !== item.id));
    toast({ tone: "success", text: "Deleted." });
  }

  return (
    <div>
      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[15px] text-black/70">
        <input
          type="checkbox"
          checked={showHidden}
          onChange={(e) => setShowHidden(e.target.checked)}
          className="h-5 w-5 accent-[#1c4a35]"
        />
        Show hidden comments
      </label>
      <div className="mt-6 space-y-3">
        {list.length === 0 && (
          <Empty icon={<MessageCircle className="h-6 w-6" />} title="No feedback yet">
            Comments left on startup pages will show up here.
          </Empty>
        )}
        {list.map((item) => (
          <Card key={item.id} className={item.hidden ? "opacity-70" : ""}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-grotesk text-[17px] font-bold">{item.name || "Anonymous"}</p>
              <span className="text-sm text-black/50">on</span>
              <Badge tone="gold">{item.startupName}</Badge>
              {item.hidden && <Badge tone="gray">Hidden</Badge>}
              <span className="ml-auto text-sm text-black/45">{timeAgo(item.createdAt)}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{item.body}</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Btn
                busy={busyId === item.id}
                icon={item.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                onClick={() => toggle(item)}
              >
                {item.hidden ? "Show again" : "Hide"}
              </Btn>
              <Btn
                variant="danger"
                disabled={busyId === item.id}
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => del(item)}
              >
                Delete
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
