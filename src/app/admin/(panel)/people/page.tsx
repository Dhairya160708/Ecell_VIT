import { Suspense } from "react";
import { connection } from "next/server";
import { readContentSnapshot } from "@/server/content";
import { FacultyEditor, TeamEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  const { content, revisions } = await readContentSnapshot(["faculty", "team"]);
  return (
    <div className="space-y-14">
      <FacultyEditor items={content.faculty} revision={revisions.faculty ?? 0} />
      <TeamEditor items={content.team} revision={revisions.team ?? 0} />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <PageTitle
        title="People"
        description="Faculty advisors and the student team, shown near the bottom of the home page."
      />
      <Suspense fallback={<Loading />}>
        <Data />
      </Suspense>
    </>
  );
}
