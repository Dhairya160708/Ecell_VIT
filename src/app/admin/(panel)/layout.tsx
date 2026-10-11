import { Suspense } from "react";
import { connection } from "next/server";
import { Shell } from "@/components/admin/Shell";
import { listInbox } from "@/lib/content";

async function InboxBadge() {
  await connection();
  const [m, i, a] = await Promise.all([listInbox("messages"), listInbox("ideas"), listInbox("applications")]);
  const n = [...m, ...i, ...a].filter((x) => x.status === "New").length;
  if (!n) return null;
  return (
    <span
      className="grid h-6 min-w-6 place-items-center rounded-full bg-[#b3261e] px-1.5 text-xs font-bold text-white"
      aria-label={`${n} new`}
    >
      {n}
    </span>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      badge={
        <Suspense fallback={null}>
          <InboxBadge />
        </Suspense>
      }
    >
      {children}
    </Shell>
  );
}
