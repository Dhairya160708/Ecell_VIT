import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "@/server/content";
import { GrantsEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ grants }, sp] = await Promise.all([readContent(), searchParams]);
  return <GrantsEditor items={grants} autoNew={sp.new === "1"} />;
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
