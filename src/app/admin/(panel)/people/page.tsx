import { Suspense } from "react";
import { connection } from "next/server";
import { readContent } from "@/server/content";
import { FacultyEditor, TeamEditor } from "@/components/admin/editors";
import { PageTitle } from "@/components/admin/ui";
import { Loading } from "@/components/admin/Loading";

async function Data() {
  await connection();
  const { faculty, team } = await readContent();
  return (
    <div className="space-y-14">
      <FacultyEditor items={faculty} />
      <TeamEditor items={team} />
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
