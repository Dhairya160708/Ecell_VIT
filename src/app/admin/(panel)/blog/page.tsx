import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "@/server/content";
import { BlogEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ posts }, sp] = await Promise.all([readContent(), searchParams]);
  return <BlogEditor items={posts} autoNew={sp.new === "1"} />;
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle
        title="Blog"
        description="Posts written here are published on the Blog page. Only people who can log in to this panel can publish."
      />
      <Suspense fallback={<Loading />}>
        <Data searchParams={searchParams} />
      </Suspense>
    </>
  );
}
