import { Suspense } from "react";
import { connection } from "next/server";
import { listVersions } from "@/lib/content";
import { HistoryList } from "@/components/admin/HistoryList";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  return <HistoryList versions={await listVersions()} />;
}

export default function Page() {
  return (
    <>
      <PageTitle
        title="History & undo"
        description="Made a mistake? Every save is kept here (the latest 40). Restore any earlier version of the website with one click."
      />
      <Suspense fallback={<Loading />}>
        <Data />
      </Suspense>
    </>
  );
}
