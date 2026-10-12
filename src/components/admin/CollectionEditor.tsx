"use client";
import { useCallback, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { saveSection } from "@/app/actions/admin";
import { makeUid, type Content, type Section } from "@/lib/data";
import { Btn, Card, Drawer, Empty, FieldShell, inputCls, useConfirm, useToast } from "./ui";
import { ImageField } from "./ImageField";

type Item = { uid: string } & Record<string, unknown>;

export type Field = {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  max?: number;
  type?: "text" | "textarea" | "select" | "date" | "image" | "tags" | "email";
  options?: { value: string; label: string }[];
  rows?: number;
  shape?: "wide" | "portrait";
};

export type Summary = {
  title: string;
  subtitle?: string;
  image?: string;
  badge?: React.ReactNode;
  href?: string;
};

type Props<T extends Item> = {
  section: Section;
  items: T[];
  fields: Field[];
  noun: string; // "event"
  emptyIcon: React.ReactNode;
  emptyText: string;
  blank: () => Omit<T, "uid">;
  summary: (item: T) => Summary;
  heading?: React.ReactNode;
  tools?: (items: T[], save: (next: T[], msg: string) => void) => React.ReactNode;
  autoNew?: boolean;
};

/** A list of things (events, startups…) with add / edit / reorder / delete. Every change saves straight to the website. */
export function CollectionEditor<T extends Item>({
  section,
  items: initial,
  fields,
  noun,
  emptyIcon,
  emptyText,
  blank,
  summary,
  heading,
  tools,
  autoNew,
}: Props<T>) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<{ index: number | null; value: T } | null>(
    autoNew ? { index: null, value: { ...blank(), uid: makeUid() } as T } : null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const toast = useToast();
  const confirm = useConfirm();

  async function persist(next: T[], message: string, undo?: T[]): Promise<boolean> {
    const before = items;
    setItems(next);
    const r = await saveSection(section, next as unknown as Content[typeof section]);
    if (!r.ok) {
      setItems(before);
      toast({ tone: "error", text: r.error });
      return false;
    }
    toast({
      tone: "success",
      text: message,
      action: undo ? { label: "Undo", run: () => persist(undo, "Change undone.") } : undefined,
    });
    return true;
  }

  const openNew = () => {
    setUploading(0);
    setDraft({ index: null, value: { ...blank(), uid: makeUid() } as T });
    setErrors({});
    setDirty(false);
  };
  const openEdit = (i: number) => {
    setUploading(0);
    setDraft({ index: i, value: { ...items[i] } });
    setErrors({});
    setDirty(false);
  };
  const close = useCallback(async () => {
    if (
      dirty &&
      !(await confirm({
        title: "Close without saving?",
        body: "The changes you made in this form will be lost.",
        confirm: "Discard changes",
        danger: true,
      }))
    )
      return;
    setDraft(null);
  }, [dirty, confirm]);

  const set = (key: string, v: unknown) => {
    setDraft((d) => d && { ...d, value: { ...d.value, [key]: v } });
    setDirty(true);
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  async function submit() {
    if (!draft) return;
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = draft.value[f.key];
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === "string" && !v.trim()) ||
        (Array.isArray(v) && !v.length);
      if (f.required && empty) errs[f.key] = `Please fill in "${f.label}".`;
      else if (f.max && typeof v === "string" && v.length > f.max)
        errs[f.key] = `Please shorten this to ${f.max} characters or fewer.`;
      else if (f.type === "email" && typeof v === "string" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        errs[f.key] = "That email address doesn't look right.";
    }
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setBusy(true);
    const next =
      draft.index === null
        ? [...items, draft.value]
        : items.map((it, i) => (i === draft.index ? draft.value : it));
    const ok = await persist(
      next,
      draft.index === null ? `New ${noun} added to the website.` : "Saved. The website is updated.",
    );
    setBusy(false);
    if (ok) setDraft(null);
  }

  async function remove(i: number) {
    const name = summary(items[i]).title || `this ${noun}`;
    if (
      !(await confirm({
        title: `Delete “${name}”?`,
        body: `It will be removed from the website. You can press Undo straight after.`,
        confirm: "Delete",
        danger: true,
      }))
    )
      return;
    persist(
      items.filter((_, j) => j !== i),
      `${name} deleted.`,
      items,
    );
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next, "New order saved.");
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>{heading}</div>
        <div className="flex flex-wrap gap-2">
          {tools?.(items, (next, msg) => persist(next, msg, items))}
          <Btn variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openNew}>
            Add {noun}
          </Btn>
        </div>
      </div>

      {items.length === 0 ? (
        <Empty icon={emptyIcon} title={`No ${noun}s yet`}>
          {emptyText}
        </Empty>
      ) : (
        <ul className="space-y-3">
          {items.map((it, i) => {
            const s = summary(it);
            return (
              <li key={it.uid}>
                <Card className="!p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {s.image !== undefined &&
                        (s.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#f1efe9] font-grotesk text-lg font-bold text-black/30">
                            {s.title.slice(0, 1)}
                          </div>
                        ))}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-grotesk text-[17px] font-bold text-[#1d1d1b]">
                            {s.title || "Untitled"}
                          </p>
                          {s.badge}
                        </div>
                        {s.subtitle && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-black/55">{s.subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                      <Btn
                        variant="ghost"
                        className="!min-h-10 !px-2.5"
                        aria-label="Move up"
                        title="Move up"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Btn>
                      <Btn
                        variant="ghost"
                        className="!min-h-10 !px-2.5"
                        aria-label="Move down"
                        title="Move down"
                        disabled={i === items.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Btn>
                      {s.href && (
                        <a
                          href={s.href}
                          target="_blank"
                          rel="noreferrer"
                          title="See it on the website"
                          className="grid min-h-10 place-items-center rounded-xl px-2.5 text-black/60 hover:bg-black/5"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Btn icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(i)}>
                        Edit
                      </Btn>
                      <Btn
                        variant="danger"
                        className="!px-3"
                        aria-label={`Delete ${s.title}`}
                        title="Delete"
                        onClick={() => remove(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Btn>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Drawer
        open={!!draft}
        onClose={close}
        title={draft?.index === null ? `Add a new ${noun}` : `Edit ${noun}`}
        footer={
          <>
            <Btn onClick={close}>Cancel</Btn>
            <Btn variant="primary" busy={busy || uploading > 0} onClick={submit}>
              {uploading > 0 ? "Waiting for photo…" : draft?.index === null ? `Add ${noun}` : "Save changes"}
            </Btn>
          </>
        }
      >
        {draft && (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (!uploading) submit();
            }}
          >
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                f={f}
                value={draft.value[f.key]}
                error={errors[f.key]}
                onChange={(v) => set(f.key, v)}
                onBusy={(b) => setUploading((n) => Math.max(0, n + (b ? 1 : -1)))}
              />
            ))}
            <button type="submit" hidden />
          </form>
        )}
      </Drawer>
    </section>
  );
}

function FieldInput({
  f,
  value,
  error,
  onChange,
  onBusy,
}: {
  f: Field;
  value: unknown;
  error?: string;
  onChange: (v: unknown) => void;
  onBusy: (b: boolean) => void;
}) {
  const id = `f-${f.key}`;
  const str = typeof value === "string" ? value : "";
  const [tagText, setTagText] = useState(Array.isArray(value) ? value.join(", ") : "");
  let control: React.ReactNode;
  switch (f.type) {
    case "textarea":
      control = (
        <textarea
          id={id}
          rows={f.rows ?? 4}
          value={str}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} resize-y leading-relaxed`}
        />
      );
      break;
    case "select":
      control = (
        <select
          id={id}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} cursor-pointer`}
        >
          {!str && <option value="">Choose one…</option>}
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "image":
      control = (
        <ImageField id={id} value={str || undefined} shape={f.shape} onChange={onChange} onBusy={onBusy} />
      );
      break;
    case "tags":
      control = (
        <input
          id={id}
          value={tagText}
          placeholder={f.placeholder}
          onChange={(e) => {
            setTagText(e.target.value);
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            );
          }}
          className={inputCls}
        />
      );
      break;
    default:
      control = (
        <input
          id={id}
          type={f.type === "date" ? "date" : f.type === "email" ? "email" : "text"}
          value={str}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      );
  }
  return (
    <FieldShell
      id={id}
      label={f.label}
      hint={f.hint}
      required={f.required}
      error={error}
      max={f.max}
      count={str.length}
    >
      {control}
    </FieldShell>
  );
}
