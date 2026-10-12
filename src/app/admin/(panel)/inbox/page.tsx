import { Suspense } from "react";
import { connection } from "next/server";
import { listInbox } from "@/server/content";
import { InboxView } from "@/components/admin/InboxView";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";
import type { InboxKind } from "@/types/content";

type SP = Promise<{ tab?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [messages, ideas, applications, sp] = await Promise.all([
    listInbox("messages"),
    listInbox("ideas"),
    listInbox("applications"),
    searchParams,
  ]);
  const tab: InboxKind = sp.tab === "ideas" || sp.tab === "applications" ? sp.tab : "messages";
  return <InboxView initial={{ messages, ideas, applications }} tab={tab} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle
        title="Inbox"
        description="Everything visitors send through the website. Click any item to open it. New items have a gold border."
      />
      <Suspense fallback={<Loading />}>
        <Data searchParams={searchParams} />
      </Suspense>
    </>
  );
}
