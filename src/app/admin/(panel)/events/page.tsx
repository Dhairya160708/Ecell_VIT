import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { EventsEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ content, revisions }, sp] = await Promise.all([readContentSnapshot(["events"]), searchParams]);
  return <EventsEditor items={content.events} revision={revisions.events ?? 0} autoNew={sp.new === "1"} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle
        title="Events"
        description="Everything listed here appears on the home page and the Events page, in this order. Use the arrows to reorder."
      />
      <Suspense fallback={<Loading />}>
        <Data searchParams={searchParams} />
      </Suspense>
    </>
  );
}
