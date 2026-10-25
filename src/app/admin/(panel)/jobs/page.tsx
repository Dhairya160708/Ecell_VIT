import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { JobsEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  const [{ content, revisions }] = await Promise.all([readContentSnapshot(["listings"])]);
  return (
    <JobsEditor
      items={content.listings}
      revision={revisions.listings ?? 0}
      startups={content.startups.map((s) => ({ slug: s.slug, name: s.name }))}
    />
  );
}

export default function Page() {
  return (
    <>
      <PageTitle
        title="Jobs board"
        description="Roles that student startups need help with. They appear on the Jobs page, and applications land in your Inbox."
      />
      <Suspense fallback={<Loading />}>
        <Data />
      </Suspense>
    </>
  );
}
