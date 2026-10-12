import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { currentFaculty } from "@/server/auth";
import { Shell } from "@/components/admin/Shell";
import { listInbox } from "@/server/content";

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

// Being signed in is not enough: only accounts listed in faculty_users get past this point.
async function FacultyGate({ children }: { children: React.ReactNode }) {
  await connection();
  if (!(await currentFaculty())) redirect("/admin/login?denied=1");
  return children;
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
      <Suspense fallback={null}>
        <FacultyGate>{children}</FacultyGate>
      </Suspense>
    </Shell>
  );
}
