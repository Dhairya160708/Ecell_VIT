import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { BlogEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ content, revisions }, sp] = await Promise.all([readContentSnapshot(["posts"]), searchParams]);
  return <BlogEditor items={content.posts} revision={revisions.posts ?? 0} autoNew={sp.new === "1"} />;
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
