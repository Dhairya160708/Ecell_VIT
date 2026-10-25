import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { GrantsEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ content, revisions }, sp] = await Promise.all([readContentSnapshot(["grants"]), searchParams]);
  return <GrantsEditor items={content.grants} revision={revisions.grants ?? 0} autoNew={sp.new === "1"} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle
        title="Government grants"
        description="Schemes and grants listed on the Grants page, in this order."
      />
      <Suspense fallback={<Loading />}>
        <Data searchParams={searchParams} />
      </Suspense>
    </>
  );
}
