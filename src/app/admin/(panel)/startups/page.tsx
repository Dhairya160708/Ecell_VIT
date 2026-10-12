import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "@/server/content";
import { StartupsEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ startups }, sp] = await Promise.all([readContent(), searchParams]);
  return <StartupsEditor items={startups} autoNew={sp.new === "1"} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle
        title="Startups"
        description="The student ventures shown in the startup directory. The first three also appear on the home page."
      />
      <Suspense fallback={<Loading />}>
        <Data searchParams={searchParams} />
      </Suspense>
    </>
  );
}
