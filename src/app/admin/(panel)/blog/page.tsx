import { Suspense } from "react";
import { connection } from "next/server";
import { listBlogSubmissions, readContentSnapshot } from "@/server/content";
import { BlogEditor } from "@/components/admin/editors";
import { BlogModeration } from "@/components/admin/BlogModeration";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

type SP = Promise<{ new?: string }>;

async function Data({ searchParams }: { searchParams: SP }) {
  await connection();
  const [{ content, revisions }, sp, submissions] = await Promise.all([
    readContentSnapshot(["posts"]),
    searchParams,
    listBlogSubmissions(),
  ]);
  return (
    <>
      <BlogEditor items={content.posts} revision={revisions.posts ?? 0} autoNew={sp.new === "1"} />
      <BlogModeration submissions={submissions} />
    </>
  );
}

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle
        title="Blog"
        description="Write and publish posts, and review student submissions from the public blog. Only people who can log in to this panel can publish."
      />
      <Suspense fallback={<Loading />}>
        <Data searchParams={searchParams} />
      </Suspense>
    </>
  );
}
