"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, X, XCircle } from "lucide-react";

// ---------- buttons ----------
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  busy?: boolean;
  icon?: React.ReactNode;
};
const btnStyles = {
  primary: "bg-[#0b1711] text-white hover:bg-[#1c4a35] shadow-sm",
  secondary: "bg-white text-[#1d1d1b] ring-1 ring-black/15 hover:ring-black/30 hover:bg-[#faf8f2]",
  danger: "bg-white text-[#b3261e] ring-1 ring-[#b3261e]/30 hover:bg-[#fdf0ef]",
  ghost: "text-[#1d1d1b]/70 hover:bg-black/5 hover:text-[#1d1d1b]",
};
export function Btn({
  variant = "secondary",
  busy,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled || busy}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${btnStyles[variant]} ${className}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

// ---------- layout bits ----------
export function PageTitle({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-grotesk text-3xl font-bold tracking-tight text-[#1d1d1b] sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#1d1d1b]/65">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,.06)] ring-1 ring-black/[0.07] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "gray",
}: {
  children: React.ReactNode;
  tone?: "gray" | "gold" | "green" | "red" | "blue";
}) {
  const tones = {
    gray: "bg-black/[0.06] text-black/70",
    gold: "bg-[#c7a54f]/20 text-[#7a5f1c]",
    green: "bg-[#2f6b4d]/15 text-[#1c4a35]",
    red: "bg-[#b3261e]/10 text-[#b3261e]",
    blue: "bg-[#2b5cab]/10 text-[#2b5cab]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Empty({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-black/10 bg-white/50 px-6 py-14 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#c7a54f]/15 text-[#7a5f1c]">
        {icon}
      </div>
      <p className="mt-4 font-grotesk text-lg font-bold text-[#1d1d1b]">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-sm text-[15px] text-[#1d1d1b]/60">{children}</div>}
    </div>
  );
}

// ---------- form fields ----------
export const inputCls =
  "w-full rounded-xl bg-white px-4 py-3 text-[15px] text-[#1d1d1b] ring-1 ring-black/15 outline-none transition placeholder:text-black/35 focus:ring-2 focus:ring-[#c7a54f]";

export function FieldShell({
  id,
  label,
  hint,
  required,
  error,
  count,
  max,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  count?: number;
  max?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[15px] font-semibold text-[#1d1d1b]">
          {label}
          {required ? (
            <span className="text-[#b3261e]"> *</span>
          ) : (
            <span className="ml-1.5 text-sm font-normal text-black/45">(optional)</span>
          )}
        </label>
        {max !== undefined && (
          <span className={`text-xs tabular-nums ${count! > max ? "text-[#b3261e]" : "text-black/40"}`}>
            {count}/{max}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[#b3261e]">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-black/50">{hint}</p>
      )}
    </div>
  );
}

// ---------- drawer ----------
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-[#f7f5ef] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
              <h2 className="font-grotesk text-xl font-bold text-[#1d1d1b]">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-10 w-10 place-items-center rounded-full text-black/60 hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            <div className="flex items-center justify-end gap-3 border-t border-black/10 bg-white px-6 py-4">
              {footer}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

// ---------- toasts ----------
type Toast = {
  id: number;
  tone: "success" | "error";
  text: string;
  action?: { label: string; run: () => void };
};
const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

// ---------- confirm ----------
type ConfirmOpts = { title: string; body?: string; confirm: string; danger?: boolean };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function AdminProviders({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ask, setAsk] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const nextId = useRef(0);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++nextId.current;
    setToasts((all) => [...all, { ...t, id }]);
    setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), t.action ? 8000 : 4000);
  }, []);
  const confirm = useCallback(
    (o: ConfirmOpts) => new Promise<boolean>((resolve) => setAsk({ ...o, resolve })),
    [],
  );
  const answer = (v: boolean) => {
    ask?.resolve(v);
    setAsk(null);
  };

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4"
        >
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-white shadow-xl ${t.tone === "success" ? "bg-[#0b1711]" : "bg-[#b3261e]"}`}
              >
                {t.tone === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#c7a54f]" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0" />
                )}
                <span className="flex-1">{t.text}</span>
                {t.action && (
                  <button
                    onClick={() => {
                      t.action!.run();
                      setToasts((all) => all.filter((x) => x.id !== t.id));
                    }}
                    className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-bold hover:bg-white/25"
                  >
                    {t.action.label}
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {ask && (
            <motion.div
              className="fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-label={ask.title}
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              >
                <div className="flex gap-4">
                  {ask.danger && (
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#b3261e]/10 text-[#b3261e]">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-grotesk text-lg font-bold text-[#1d1d1b]">{ask.title}</h2>
                    {ask.body && (
                      <p className="mt-1.5 text-[15px] leading-relaxed text-black/60">{ask.body}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Btn onClick={() => answer(false)} autoFocus>
                    Cancel
                  </Btn>
                  <Btn
                    variant={ask.danger ? "danger" : "primary"}
                    onClick={() => answer(true)}
                    className={ask.danger ? "!bg-[#b3261e] !text-white" : ""}
                  >
                    {ask.confirm}
                  </Btn>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

export { timeAgo } from "@/lib/time";
